// store/queryStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { nanoid } from 'nanoid'
import {
  QueryGroup,
  QueryRule,
  QueryNode,
  LogicalOperator,
  OperatorType,
  DataSchema,
  QueryOutputFormat,
  ValidationError,
} from '@/types/query'
import { MOCK_SCHEMAS } from '@/lib/schemas'
import { validateQuery } from '@/lib/validators'
import { executeQuery, ExecutorResult } from '@/lib/queryExecutor'

// ============================================
// HELPERS — tree manipulation
// ============================================

const createRule = (field: string = ''): QueryRule => ({
  id: nanoid(),
  type: 'rule',
  field,
  operator: 'equals',
  value: '',
})

const createGroup = (
  logicalOperator: LogicalOperator = 'AND',
  children: QueryNode[] = []
): QueryGroup => ({
  id: nanoid(),
  type: 'group',
  logicalOperator,
  children,
  collapsed: false,
})

// Recursive — find and update a node inside the tree
const findAndUpdateGroup = (
  group: QueryGroup,
  targetId: string,
  updater: (group: QueryGroup) => void
): boolean => {
  if (group.id === targetId) {
    updater(group)
    return true
  }
  for (const child of group.children) {
    if (child.type === 'group') {
      if (findAndUpdateGroup(child, targetId, updater)) return true
    }
  }
  return false
}

// Recursive — find and update a rule inside the tree
const findAndUpdateRule = (
  group: QueryGroup,
  targetId: string,
  updater: (rule: QueryRule) => void
): boolean => {
  for (const child of group.children) {
    if (child.type === 'rule' && child.id === targetId) {
      updater(child)
      return true
    }
    if (child.type === 'group') {
      if (findAndUpdateRule(child, targetId, updater)) return true
    }
  }
  return false
}

// Recursive — remove a node from the tree
const removeNode = (group: QueryGroup, targetId: string): boolean => {
  const index = group.children.findIndex(c => c.id === targetId)
  if (index !== -1) {
    group.children.splice(index, 1)
    return true
  }
  for (const child of group.children) {
    if (child.type === 'group') {
      if (removeNode(child, targetId)) return true
    }
  }
  return false
}

// Recursive — add a node to a specific group
const addNodeToGroup = (
  group: QueryGroup,
  targetGroupId: string,
  node: QueryNode
): boolean => {
  if (group.id === targetGroupId) {
    group.children.push(node)
    return true
  }
  for (const child of group.children) {
    if (child.type === 'group') {
      if (addNodeToGroup(child, targetGroupId, node)) return true
    }
  }
  return false
}

// Recursive — reorder nodes inside a group
const reorderInGroup = (
  group: QueryGroup,
  targetGroupId: string,
  fromIndex: number,
  toIndex: number
): boolean => {
  if (group.id === targetGroupId) {
    const [moved] = group.children.splice(fromIndex, 1)
    group.children.splice(toIndex, 0, moved)
    return true
  }
  for (const child of group.children) {
    if (child.type === 'group') {
      if (reorderInGroup(child, targetGroupId, fromIndex, toIndex)) return true
    }
  }
  return false
}

// ============================================
// STORE STATE TYPE
// ============================================

export interface QueryStore {
  // Core query state
  rootGroup: QueryGroup
  selectedSchema: DataSchema | null
  outputFormat: QueryOutputFormat
  validationErrors: ValidationError[]

  // Execution state
  isExecuting: boolean
  executionResult: ExecutorResult | null

  // UI state
  isDirty: boolean

  // Actions — schema
  setSchema: (schemaId: string) => void

  // Actions — format
  setOutputFormat: (format: QueryOutputFormat) => void

  // Actions — rules
  addRule: (groupId: string) => void
  removeRule: (ruleId: string) => void
  updateRuleField: (ruleId: string, field: string) => void
  updateRuleOperator: (ruleId: string, operator: OperatorType) => void
  updateRuleValue: (ruleId: string, value: QueryRule['value']) => void

  // Actions — groups
  addGroup: (parentGroupId: string) => void
  removeGroup: (groupId: string) => void
  toggleGroupOperator: (groupId: string) => void
  toggleGroupCollapsed: (groupId: string) => void

  // Actions — reorder
  reorderNodes: (groupId: string, fromIndex: number, toIndex: number) => void

  // Actions — query
  validateQueryTree: () => ValidationError[]
  executeQueryTree: (options?: { page?: number; pageSize?: number; sortField?: string; sortDirection?: 'asc' | 'desc' }) => void
  resetQuery: () => void

  // Actions — import/export
  importQuery: (group: QueryGroup) => void
  exportQuery: () => QueryGroup
}

// ============================================
// INITIAL STATE
// ============================================

const createInitialRootGroup = (): QueryGroup =>
  createGroup('AND', [createRule()])

// ============================================
// STORE
// ============================================

export const useQueryStore = create<QueryStore>()(
  persist(
    immer((set, get) => ({
        rootGroup: createInitialRootGroup(),
        selectedSchema: MOCK_SCHEMAS[0],
        outputFormat: 'sql',
        validationErrors: [],
        isExecuting: false,
        executionResult: null,
        isDirty: false,

        // — Schema
        setSchema: (schemaId) => {
        set(state => {
            const schema = MOCK_SCHEMAS.find(s => s.id === schemaId) ?? null
            state.selectedSchema = schema
            state.rootGroup = createInitialRootGroup()
            state.validationErrors = []
            state.executionResult = null
            state.isDirty = false
        })
        },

        // — Format
        setOutputFormat: (format) => {
        set(state => {
            state.outputFormat = format
        })
        },

        // — Add rule to a group
        addRule: (groupId) => {
        set(state => {
            const field = state.selectedSchema?.fields[0]?.name ?? ''
            const rule = createRule(field)
            addNodeToGroup(state.rootGroup, groupId, rule)
            state.isDirty = true
        })
        },

        // — Remove rule
        removeRule: (ruleId) => {
        set(state => {
            removeNode(state.rootGroup, ruleId)
            state.isDirty = true
        })
        },

        // — Update rule field
        updateRuleField: (ruleId, field) => {
        set(state => {
            findAndUpdateRule(state.rootGroup, ruleId, rule => {
            rule.field = field
            // Reset operator and value when field changes
            const schemaField = state.selectedSchema?.fields.find(
                f => f.name === field
            )
            if (schemaField) {
                rule.operator = 'equals'
                rule.value = ''
            }
            })
            state.isDirty = true
        })
        },

        // — Update rule operator
        updateRuleOperator: (ruleId, operator) => {
        set(state => {
            findAndUpdateRule(state.rootGroup, ruleId, rule => {
            rule.operator = operator
            rule.value = ''
            })
            state.isDirty = true
        })
        },

        // — Update rule value
        updateRuleValue: (ruleId, value) => {
        set(state => {
            findAndUpdateRule(state.rootGroup, ruleId, rule => {
            rule.value = value
            })
            state.isDirty = true
        })
        },

        // — Add nested group
        addGroup: (parentGroupId) => {
        set(state => {
            const field = state.selectedSchema?.fields[0]?.name ?? ''
            const newGroup = createGroup('AND', [createRule(field)])
            addNodeToGroup(state.rootGroup, parentGroupId, newGroup)
            state.isDirty = true
        })
        },

        // — Remove group
        removeGroup: (groupId) => {
        set(state => {
            removeNode(state.rootGroup, groupId)
            state.isDirty = true
        })
        },

        // — Toggle AND/OR
        toggleGroupOperator: (groupId) => {
        set(state => {
            findAndUpdateGroup(state.rootGroup, groupId, group => {
            group.logicalOperator =
                group.logicalOperator === 'AND' ? 'OR' : 'AND'
            })
            state.isDirty = true
        })
        },

        // — Collapse/expand group
        toggleGroupCollapsed: (groupId) => {
        set(state => {
            findAndUpdateGroup(state.rootGroup, groupId, group => {
            group.collapsed = !group.collapsed
            })
        })
        },

        // — Reorder nodes via drag and drop
        reorderNodes: (groupId, fromIndex, toIndex) => {
        set(state => {
            reorderInGroup(state.rootGroup, groupId, fromIndex, toIndex)
            state.isDirty = true
        })
        },

        // — Validate
        validateQueryTree: () => {
        const { rootGroup, selectedSchema } = get()
        const errors = validateQuery(rootGroup, selectedSchema)
        set(state => {
            state.validationErrors = errors
        })
        return errors
        },

        // — Execute
        executeQueryTree: (options = {}) => {
        const { rootGroup, selectedSchema, validateQueryTree } = get()

        const errors = validateQueryTree()
        if (errors.some(e => e.severity === 'error')) return

        if (!selectedSchema) return

        set(state => {
            state.isExecuting = true
        })

        // Simulate async execution
        setTimeout(() => {
            const result = executeQuery(rootGroup, selectedSchema.id, {
            page: options.page ?? 1,
            pageSize: options.pageSize ?? 10,
            sortField: options.sortField,
            sortDirection: options.sortDirection ?? 'asc',
            })
            set(state => {
            state.executionResult = result
            state.isExecuting = false
            })
        }, 600)
        },

        // — Reset
        resetQuery: () => {
        set(state => {
            state.rootGroup = createInitialRootGroup()
            state.validationErrors = []
            state.executionResult = null
            state.isDirty = false
        })
        },

        // — Import
        importQuery: (group) => {
        set(state => {
            state.rootGroup = group
            state.validationErrors = []
            state.executionResult = null
            state.isDirty = true
        })
        },

        // — Export
        exportQuery: () => {
        return get().rootGroup
        },
    })),
    {
        name: 'query-store',

        partialize: (state) => ({
            rootGroup: state.rootGroup,
            selectedSchema: state.selectedSchema,
            outputFormat: state.outputFormat,
        }),
    }
  )
)