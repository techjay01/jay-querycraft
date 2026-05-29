// lib/validators.ts
import { QueryGroup, QueryRule, QueryNode, ValidationError, SchemaField, DataSchema } from '@/types/query'
import { FIELD_TYPE_OPERATORS } from '@/lib/schemas'

// ============================================
// HELPER — get field from schema
// ============================================

const getField = (schema: DataSchema, fieldName: string): SchemaField | undefined => {
  return schema.fields.find(f => f.name === fieldName)
}

// ============================================
// VALIDATE SINGLE RULE
// ============================================

const validateRule = (
  rule: QueryRule,
  schema: DataSchema,
  errors: ValidationError[]
): void => {
  // Rule must have a field selected
  if (!rule.field) {
    errors.push({
      nodeId: rule.id,
      message: 'Please select a field',
      severity: 'error',
    })
    return
  }

  const field = getField(schema, rule.field)

  // Field must exist in schema
  if (!field) {
    errors.push({
      nodeId: rule.id,
      message: `Field "${rule.field}" does not exist in schema`,
      severity: 'error',
    })
    return
  }

  // Operator must be selected
  if (!rule.operator) {
    errors.push({
      nodeId: rule.id,
      message: 'Please select an operator',
      severity: 'error',
    })
    return
  }

  // Operator must be valid for field type
  const allowedOperators = FIELD_TYPE_OPERATORS[field.type] ?? []
  if (!allowedOperators.includes(rule.operator)) {
    errors.push({
      nodeId: rule.id,
      message: `Operator "${rule.operator}" is not valid for field type "${field.type}"`,
      severity: 'error',
    })
    return
  }

  // Value must not be empty (unless operator doesnt require it)
  const noValueOperators = ['is_null', 'is_not_null']
  if (!noValueOperators.includes(rule.operator)) {
    if (
      rule.value === null ||
      rule.value === undefined ||
      rule.value === ''
    ) {
      errors.push({
        nodeId: rule.id,
        message: 'Please enter a value',
        severity: 'error',
      })
      return
    }
  }

  // Between operator needs two values
  if (
    (rule.operator === 'between' || rule.operator === 'date_between') &&
    Array.isArray(rule.value)
  ) {
    const [val1, val2] = rule.value as [number, number]
    if (val1 === undefined || val2 === undefined || val1 === null || val2 === null) {
      errors.push({
        nodeId: rule.id,
        message: 'Both values are required for "between" operator',
        severity: 'error',
      })
      return
    }
    if (typeof val1 === 'number' && typeof val2 === 'number' && val1 >= val2) {
      errors.push({
        nodeId: rule.id,
        message: 'First value must be less than second value',
        severity: 'error',
      })
    }
  }

  // Number fields must have numeric values
  if (field.type === 'number' && rule.value !== null) {
    const num = Number(rule.value)
    if (isNaN(num)) {
      errors.push({
        nodeId: rule.id,
        message: 'Value must be a valid number',
        severity: 'error',
      })
    }
  }

  // Regex must be valid
  if (rule.operator === 'regex' && typeof rule.value === 'string') {
    try {
      new RegExp(rule.value)
    } catch {
      errors.push({
        nodeId: rule.id,
        message: 'Invalid regular expression',
        severity: 'error',
      })
    }
  }
}

// ============================================
// VALIDATE GROUP (RECURSIVE)
// ============================================

const validateGroup = (
  group: QueryGroup,
  schema: DataSchema,
  errors: ValidationError[]
): void => {
  // Group must not be empty
  if (!group.children || group.children.length === 0) {
    errors.push({
      nodeId: group.id,
      message: 'Group must have at least one condition',
      severity: 'error',
    })
    return
  }

  // Recursively validate each child node
  group.children.forEach((child: QueryNode) => {
    if (child.type === 'rule') {
      validateRule(child, schema, errors)
    } else if (child.type === 'group') {
      validateGroup(child, schema, errors)
    }
  })
}

// ============================================
// MAIN VALIDATE FUNCTION
// ============================================

export const validateQuery = (
  rootGroup: QueryGroup,
  schema: DataSchema | null
): ValidationError[] => {
  const errors: ValidationError[] = []

  if (!schema) {
    errors.push({
      nodeId: 'root',
      message: 'Please select a data schema',
      severity: 'error',
    })
    return errors
  }

  validateGroup(rootGroup, schema, errors)
  return errors
}

// ============================================
// HELPERS FOR UI
// ============================================

export const hasErrors = (errors: ValidationError[]): boolean => {
  return errors.some(e => e.severity === 'error')
}

export const getNodeErrors = (
  errors: ValidationError[],
  nodeId: string
): ValidationError[] => {
  return errors.filter(e => e.nodeId === nodeId)
}

export const isNodeValid = (
  errors: ValidationError[],
  nodeId: string
): boolean => {
  return !errors.some(e => e.nodeId === nodeId && e.severity === 'error')
}