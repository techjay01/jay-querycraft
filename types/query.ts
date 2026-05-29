// types/query.ts

// ============================================
// CORE ENUMS
// ============================================

export type LogicalOperator = 'AND' | 'OR'

export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'enum' | 'array'

export type OperatorType =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'between'
  | 'in_array'
  | 'not_in_array'
  | 'is_null'
  | 'is_not_null'
  | 'regex'
  | 'date_before'
  | 'date_after'
  | 'date_between'

export type QueryOutputFormat = 'sql' | 'mongodb' | 'graphql'

export type ThemeMode = 'dark' | 'blueprint' | 'light'

// ============================================
// SCHEMA TYPES
// ============================================

export interface EnumOption {
  label: string
  value: string
}

export interface SchemaField {
  name: string
  label: string
  type: FieldType
  enumOptions?: EnumOption[]
  allowedOperators?: OperatorType[]
}

export interface DataSchema {
  id: string
  name: string
  description: string
  fields: SchemaField[]
}

// ============================================
// QUERY TREE TYPES
// ============================================

export type NodeType = 'rule' | 'group'

export interface QueryRule {
  id: string
  type: 'rule'
  field: string
  operator: OperatorType
  value: string | number | boolean | string[] | [number, number] | [string, string] | null
}

export interface QueryGroup {
  id: string
  type: 'group'
  logicalOperator: LogicalOperator
  children: QueryNode[]
  collapsed?: boolean
}

export type QueryNode = QueryRule | QueryGroup

// ============================================
// QUERY STATE TYPES
// ============================================

export interface QueryState {
  rootGroup: QueryGroup
  selectedSchema: DataSchema | null
  outputFormat: QueryOutputFormat
  isExecuting: boolean
  results: Record<string, unknown>[]
  totalResults: number
  validationErrors: ValidationError[]
}

// ============================================
// VALIDATION TYPES
// ============================================

export interface ValidationError {
  nodeId: string
  message: string
  severity: 'error' | 'warning'
}

// ============================================
// QUERY OUTPUT TYPES
// ============================================

export interface GeneratedQuery {
  sql: string
  mongodb: object
  graphql: string
  raw: QueryGroup
}

// ============================================
// HISTORY & PRESETS
// ============================================

export interface QueryHistoryEntry {
  id: string
  name: string
  timestamp: number
  query: QueryGroup
  schema: string
  resultCount: number
  format: QueryOutputFormat
}

export interface QueryPreset {
  id: string
  name: string
  description: string
  query: QueryGroup
  schemaId: string
  createdAt: number
}

// ============================================
// OPERATOR METADATA
// ============================================

export interface OperatorMeta {
  value: OperatorType
  label: string
  requiresValue: boolean
  requiresSecondValue: boolean // for 'between'
  inputType: 'text' | 'number' | 'date' | 'array' | 'none'
}

// ============================================
// DRAG AND DROP
// ============================================

export interface DragItem {
  id: string
  type: NodeType
  parentId: string
  index: number
}