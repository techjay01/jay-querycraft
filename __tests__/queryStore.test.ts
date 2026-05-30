// __tests__/queryStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useQueryStore } from '@/store/queryStore'

// ============================================
// RESET STORE BEFORE EACH TEST
// ============================================

beforeEach(() => {
  act(() => {
    useQueryStore.getState().resetQuery()
    useQueryStore.getState().setSchema('users')
  })
})

// ============================================
// INITIAL STATE TESTS
// ============================================

describe('useQueryStore — initial state', () => {
  it('has a root group', () => {
    const { rootGroup } = useQueryStore.getState()
    expect(rootGroup).toBeDefined()
    expect(rootGroup.type).toBe('group')
  })

  it('root group has AND operator by default', () => {
    const { rootGroup } = useQueryStore.getState()
    expect(rootGroup.logicalOperator).toBe('AND')
  })

  it('root group has one rule by default', () => {
    const { rootGroup } = useQueryStore.getState()
    expect(rootGroup.children).toHaveLength(1)
    expect(rootGroup.children[0].type).toBe('rule')
  })

  it('has users schema selected by default', () => {
    const { selectedSchema } = useQueryStore.getState()
    expect(selectedSchema?.id).toBe('users')
  })

  it('has sql as default output format', () => {
    const { outputFormat } = useQueryStore.getState()
    expect(outputFormat).toBe('sql')
  })

  it('has no validation errors initially', () => {
    const { validationErrors } = useQueryStore.getState()
    expect(validationErrors).toHaveLength(0)
  })

  it('is not executing initially', () => {
    const { isExecuting } = useQueryStore.getState()
    expect(isExecuting).toBe(false)
  })

  it('isDirty is false initially', () => {
    const { isDirty } = useQueryStore.getState()
    expect(isDirty).toBe(false)
  })
})

// ============================================
// SCHEMA TESTS
// ============================================

describe('useQueryStore — setSchema', () => {
  it('changes selected schema', () => {
    act(() => {
      useQueryStore.getState().setSchema('products')
    })
    const { selectedSchema } = useQueryStore.getState()
    expect(selectedSchema?.id).toBe('products')
  })

  it('resets query tree when schema changes', () => {
    act(() => {
      const { rootGroup } = useQueryStore.getState()
      useQueryStore.getState().addRule(rootGroup.id)
      useQueryStore.getState().addRule(rootGroup.id)
    })

    act(() => {
      useQueryStore.getState().setSchema('products')
    })

    const { rootGroup } = useQueryStore.getState()
    expect(rootGroup.children).toHaveLength(1)
  })

  it('clears validation errors when schema changes', () => {
    act(() => {
      useQueryStore.getState().validateQueryTree()
      useQueryStore.getState().setSchema('orders')
    })
    const { validationErrors } = useQueryStore.getState()
    expect(validationErrors).toHaveLength(0)
  })

  it('resets isDirty when schema changes', () => {
    act(() => {
      const { rootGroup } = useQueryStore.getState()
      useQueryStore.getState().addRule(rootGroup.id)
      useQueryStore.getState().setSchema('products')
    })
    const { isDirty } = useQueryStore.getState()
    expect(isDirty).toBe(false)
  })
})

// ============================================
// ADD RULE TESTS
// ============================================

describe('useQueryStore — addRule', () => {
  it('adds a rule to root group', () => {
    act(() => {
      const { rootGroup } = useQueryStore.getState()
      useQueryStore.getState().addRule(rootGroup.id)
    })
    const { rootGroup } = useQueryStore.getState()
    expect(rootGroup.children).toHaveLength(2)
  })

  it('added rule has type rule', () => {
    act(() => {
      const { rootGroup } = useQueryStore.getState()
      useQueryStore.getState().addRule(rootGroup.id)
    })
    const { rootGroup } = useQueryStore.getState()
    const newRule = rootGroup.children[1]
    expect(newRule.type).toBe('rule')
  })

  it('sets isDirty to true after adding rule', () => {
    act(() => {
      const { rootGroup } = useQueryStore.getState()
      useQueryStore.getState().addRule(rootGroup.id)
    })
    const { isDirty } = useQueryStore.getState()
    expect(isDirty).toBe(true)
  })

  it('adds rule to nested group', () => {
    let nestedGroupId: string

    act(() => {
      const { rootGroup } = useQueryStore.getState()
      useQueryStore.getState().addGroup(rootGroup.id)
    })

    act(() => {
      const { rootGroup } = useQueryStore.getState()
      const nestedGroup = rootGroup.children.find(c => c.type === 'group')
      nestedGroupId = nestedGroup!.id
      useQueryStore.getState().addRule(nestedGroupId)
    })

    const { rootGroup } = useQueryStore.getState()
    const nestedGroup = rootGroup.children.find(
      c => c.type === 'group' && c.id === nestedGroupId
    ) as import('@/types/query').QueryGroup

    expect(nestedGroup.children.length).toBeGreaterThan(1)
  })
})

// ============================================
// REMOVE RULE TESTS
// ============================================

describe('useQueryStore — removeRule', () => {
  it('removes a rule from root group', () => {
    let ruleId: string

    act(() => {
      const { rootGroup } = useQueryStore.getState()
      useQueryStore.getState().addRule(rootGroup.id)
    })

    act(() => {
      const { rootGroup } = useQueryStore.getState()
      ruleId = rootGroup.children[0].id
      useQueryStore.getState().removeRule(ruleId)
    })

    const { rootGroup } = useQueryStore.getState()
    expect(rootGroup.children.find(c => c.id === ruleId)).toBeUndefined()
  })

  it('sets isDirty to true after removing rule', () => {
    act(() => {
      const { rootGroup } = useQueryStore.getState()
      const ruleId = rootGroup.children[0].id
      useQueryStore.getState().removeRule(ruleId)
    })
    const { isDirty } = useQueryStore.getState()
    expect(isDirty).toBe(true)
  })
})

// ============================================
// UPDATE RULE TESTS
// ============================================

describe('useQueryStore — updateRule', () => {
  it('updates rule field', () => {
    act(() => {
      const { rootGroup } = useQueryStore.getState()
      const ruleId = rootGroup.children[0].id
      useQueryStore.getState().updateRuleField(ruleId, 'name')
    })

    const { rootGroup } = useQueryStore.getState()
    const rule = rootGroup.children[0] as import('@/types/query').QueryRule
    expect(rule.field).toBe('name')
  })

  it('resets operator and value when field changes', () => {
    act(() => {
      const { rootGroup } = useQueryStore.getState()
      const ruleId = rootGroup.children[0].id
      useQueryStore.getState().updateRuleOperator(ruleId, 'greater_than')
      useQueryStore.getState().updateRuleValue(ruleId, 25)
      useQueryStore.getState().updateRuleField(ruleId, 'name')
    })

    const { rootGroup } = useQueryStore.getState()
    const rule = rootGroup.children[0] as import('@/types/query').QueryRule
    expect(rule.operator).toBe('equals')
    expect(rule.value).toBe('')
  })

  it('updates rule operator', () => {
    act(() => {
      const { rootGroup } = useQueryStore.getState()
      const ruleId = rootGroup.children[0].id
      useQueryStore.getState().updateRuleOperator(ruleId, 'less_than')
    })

    const { rootGroup } = useQueryStore.getState()
    const rule = rootGroup.children[0] as import('@/types/query').QueryRule
    expect(rule.operator).toBe('less_than')
  })

  it('updates rule value', () => {
    act(() => {
      const { rootGroup } = useQueryStore.getState()
      const ruleId = rootGroup.children[0].id
      useQueryStore.getState().updateRuleValue(ruleId, 42)
    })

    const { rootGroup } = useQueryStore.getState()
    const rule = rootGroup.children[0] as import('@/types/query').QueryRule
    expect(rule.value).toBe(42)
  })

  it('sets isDirty when updating value', () => {
    act(() => {
      const { rootGroup } = useQueryStore.getState()
      const ruleId = rootGroup.children[0].id
      useQueryStore.getState().updateRuleValue(ruleId, 99)
    })
    expect(useQueryStore.getState().isDirty).toBe(true)
  })
})

// ============================================
// GROUP TESTS
// ============================================

describe('useQueryStore — groups', () => {
  it('adds a nested group', () => {
    act(() => {
      const { rootGroup } = useQueryStore.getState()
      useQueryStore.getState().addGroup(rootGroup.id)
    })

    const { rootGroup } = useQueryStore.getState()
    const nestedGroup = rootGroup.children.find(c => c.type === 'group')
    expect(nestedGroup).toBeDefined()
    expect(nestedGroup?.type).toBe('group')
  })

  it('nested group has AND operator by default', () => {
    act(() => {
      const { rootGroup } = useQueryStore.getState()
      useQueryStore.getState().addGroup(rootGroup.id)
    })

    const { rootGroup } = useQueryStore.getState()
    const nestedGroup = rootGroup.children.find(
      c => c.type === 'group'
    ) as import('@/types/query').QueryGroup
    expect(nestedGroup.logicalOperator).toBe('AND')
  })

  it('toggles group operator from AND to OR', () => {
    act(() => {
      const { rootGroup } = useQueryStore.getState()
      useQueryStore.getState().toggleGroupOperator(rootGroup.id)
    })

    const { rootGroup } = useQueryStore.getState()
    expect(rootGroup.logicalOperator).toBe('OR')
  })

  it('toggles group operator from OR back to AND', () => {
    act(() => {
      const { rootGroup } = useQueryStore.getState()
      useQueryStore.getState().toggleGroupOperator(rootGroup.id)
      useQueryStore.getState().toggleGroupOperator(rootGroup.id)
    })

    const { rootGroup } = useQueryStore.getState()
    expect(rootGroup.logicalOperator).toBe('AND')
  })

  it('toggles group collapsed state', () => {
    act(() => {
      const { rootGroup } = useQueryStore.getState()
      useQueryStore.getState().toggleGroupCollapsed(rootGroup.id)
    })

    const { rootGroup } = useQueryStore.getState()
    expect(rootGroup.collapsed).toBe(true)
  })

  it('removes a nested group', () => {
    let nestedGroupId: string

    act(() => {
      const { rootGroup } = useQueryStore.getState()
      useQueryStore.getState().addGroup(rootGroup.id)
    })

    act(() => {
      const { rootGroup } = useQueryStore.getState()
      const nested = rootGroup.children.find(c => c.type === 'group')!
      nestedGroupId = nested.id
      useQueryStore.getState().removeGroup(nestedGroupId)
    })

    const { rootGroup } = useQueryStore.getState()
    expect(
      rootGroup.children.find(c => c.id === nestedGroupId)
    ).toBeUndefined()
  })
})

// ============================================
// RESET TESTS
// ============================================

describe('useQueryStore — resetQuery', () => {
  it('resets to initial state', () => {
    act(() => {
      const { rootGroup } = useQueryStore.getState()
      useQueryStore.getState().addRule(rootGroup.id)
      useQueryStore.getState().addRule(rootGroup.id)
      useQueryStore.getState().addGroup(rootGroup.id)
      useQueryStore.getState().resetQuery()
    })

    const { rootGroup, isDirty, validationErrors } = useQueryStore.getState()
    expect(rootGroup.children).toHaveLength(1)
    expect(isDirty).toBe(false)
    expect(validationErrors).toHaveLength(0)
  })
})

// ============================================
// OUTPUT FORMAT TESTS
// ============================================

describe('useQueryStore — setOutputFormat', () => {
  it('changes output format to mongodb', () => {
    act(() => {
      useQueryStore.getState().setOutputFormat('mongodb')
    })
    expect(useQueryStore.getState().outputFormat).toBe('mongodb')
  })

  it('changes output format to graphql', () => {
    act(() => {
      useQueryStore.getState().setOutputFormat('graphql')
    })
    expect(useQueryStore.getState().outputFormat).toBe('graphql')
  })
})

// ============================================
// IMPORT / EXPORT TESTS
// ============================================

describe('useQueryStore — import/export', () => {
  it('exports the root group', () => {
    const exported = useQueryStore.getState().exportQuery()
    expect(exported).toBeDefined()
    expect(exported.type).toBe('group')
  })

  it('imports a query group', () => {
    const customGroup: import('@/types/query').QueryGroup = {
      id: 'imported-group',
      type: 'group',
      logicalOperator: 'OR',
      children: [],
      collapsed: false,
    }

    act(() => {
      useQueryStore.getState().importQuery(customGroup)
    })

    const { rootGroup } = useQueryStore.getState()
    expect(rootGroup.id).toBe('imported-group')
    expect(rootGroup.logicalOperator).toBe('OR')
  })

  it('sets isDirty after import', () => {
    const customGroup: import('@/types/query').QueryGroup = {
      id: 'imported-group',
      type: 'group',
      logicalOperator: 'OR',
      children: [],
      collapsed: false,
    }

    act(() => {
      useQueryStore.getState().importQuery(customGroup)
    })

    expect(useQueryStore.getState().isDirty).toBe(true)
  })
})

// ============================================
// REORDER TESTS
// ============================================

describe('useQueryStore — reorderNodes', () => {
  it('reorders nodes within a group', () => {
    act(() => {
      const { rootGroup } = useQueryStore.getState()
      useQueryStore.getState().addRule(rootGroup.id)
    })

    const firstId = useQueryStore.getState().rootGroup.children[0].id

    act(() => {
      const { rootGroup } = useQueryStore.getState()
      useQueryStore.getState().reorderNodes(rootGroup.id, 0, 1)
    })

    const { rootGroup } = useQueryStore.getState()
    expect(rootGroup.children[1].id).toBe(firstId)
  })
})