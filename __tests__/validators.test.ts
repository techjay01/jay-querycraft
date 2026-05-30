// __tests__/validators.test.ts
import { describe, it, expect } from 'vitest'
import {
  validateQuery,
  hasErrors,
  getNodeErrors,
  isNodeValid,
} from '@/lib/validators'
import { QueryGroup, QueryRule, DataSchema } from '@/types/query'

// ============================================
// HELPERS
// ============================================

const makeRule = (
  overrides: Partial<QueryRule> = {}
): QueryRule => ({
  id: 'rule-1',
  type: 'rule',
  field: 'age',
  operator: 'greater_than',
  value: 25,
  ...overrides,
})

const makeGroup = (
  overrides: Partial<QueryGroup> = {}
): QueryGroup => ({
  id: 'group-1',
  type: 'group',
  logicalOperator: 'AND',
  children: [makeRule()],
  collapsed: false,
  ...overrides,
})

const mockSchema: DataSchema = {
  id: 'users',
  name: 'Users',
  description: 'Test schema',
  fields: [
    { name: 'age', label: 'Age', type: 'number' },
    { name: 'name', label: 'Name', type: 'string' },
    { name: 'status', label: 'Status', type: 'enum',
      enumOptions: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' },
      ]
    },
    { name: 'createdAt', label: 'Created At', type: 'date' },
    { name: 'isVerified', label: 'Is Verified', type: 'boolean' },
  ],
}

// ============================================
// VALIDATE QUERY TESTS
// ============================================

describe('validateQuery', () => {
  it('returns error when schema is null', () => {
    const group = makeGroup()
    const errors = validateQuery(group, null)
    expect(errors).toHaveLength(1)
    expect(errors[0].nodeId).toBe('root')
    expect(errors[0].severity).toBe('error')
  })

  it('returns no errors for valid rule', () => {
    const group = makeGroup({
      children: [makeRule({
        field: 'age',
        operator: 'greater_than',
        value: 25,
      })],
    })
    const errors = validateQuery(group, mockSchema)
    expect(errors).toHaveLength(0)
  })

  it('returns error when field is empty', () => {
    const group = makeGroup({
      children: [makeRule({ field: '' })],
    })
    const errors = validateQuery(group, mockSchema)
    expect(errors.some(e => e.message.includes('field'))).toBe(true)
  })

  it('returns error when field does not exist in schema', () => {
    const group = makeGroup({
      children: [makeRule({ field: 'nonexistent' })],
    })
    const errors = validateQuery(group, mockSchema)
    expect(errors.some(e => e.message.includes('nonexistent'))).toBe(true)
  })

  it('returns error when value is empty', () => {
    const group = makeGroup({
      children: [makeRule({
        field: 'age',
        operator: 'greater_than',
        value: '',
      })],
    })
    const errors = validateQuery(group, mockSchema)
    expect(errors.some(e => e.message.includes('value'))).toBe(true)
  })

  it('returns error for invalid operator on field type', () => {
    const group = makeGroup({
      children: [makeRule({
        field: 'age',
        operator: 'contains',
        value: '25',
      })],
    })
    const errors = validateQuery(group, mockSchema)
    expect(errors.length).toBeGreaterThan(0)
  })

  it('does not require value for is_null operator', () => {
    const group = makeGroup({
      children: [makeRule({
        field: 'age',
        operator: 'is_null',
        value: null,
      })],
    })
    const errors = validateQuery(group, mockSchema)
    expect(errors).toHaveLength(0)
  })

  it('does not require value for is_not_null operator', () => {
    const group = makeGroup({
      children: [makeRule({
        field: 'age',
        operator: 'is_not_null',
        value: null,
      })],
    })
    const errors = validateQuery(group, mockSchema)
    expect(errors).toHaveLength(0)
  })

  it('returns error for empty group', () => {
    const group = makeGroup({ children: [] })
    const errors = validateQuery(group, mockSchema)
    expect(errors.some(e => e.message.includes('at least one'))).toBe(true)
  })

  it('returns error for invalid regex', () => {
    const group = makeGroup({
      children: [makeRule({
        field: 'name',
        operator: 'regex',
        value: '[invalid regex(',
      })],
    })
    const errors = validateQuery(group, mockSchema)
    expect(errors.some(e => e.message.toLowerCase().includes('regular expression') || e.message.toLowerCase().includes('regex') || e.message.toLowerCase().includes('invalid'))).toBe(true)
  })

  it('validates valid regex without error', () => {
    const group = makeGroup({
      children: [makeRule({
        field: 'name',
        operator: 'regex',
        value: '^[a-z]+$',
      })],
    })
    const errors = validateQuery(group, mockSchema)
    expect(errors).toHaveLength(0)
  })

  it('returns error when between first value >= second value', () => {
    const group = makeGroup({
      children: [makeRule({
        field: 'age',
        operator: 'between',
        value: [30, 18],
      })],
    })
    const errors = validateQuery(group, mockSchema)
    expect(errors.some(e =>
      e.message.includes('less than')
    )).toBe(true)
  })

  it('validates nested groups recursively', () => {
    const nested: QueryGroup = {
      id: 'nested-group',
      type: 'group',
      logicalOperator: 'OR',
      children: [
        makeRule({ id: 'rule-2', field: '', operator: 'equals', value: '' }),
      ],
      collapsed: false,
    }
    const group = makeGroup({
      children: [
        makeRule(),
        nested,
      ],
    })
    const errors = validateQuery(group, mockSchema)
    expect(errors.some(e => e.nodeId === 'rule-2')).toBe(true)
  })

  it('validates string operators on string fields', () => {
    const group = makeGroup({
      children: [makeRule({
        field: 'name',
        operator: 'contains',
        value: 'John',
      })],
    })
    const errors = validateQuery(group, mockSchema)
    expect(errors).toHaveLength(0)
  })

  it('rejects number operators on string fields', () => {
    const group = makeGroup({
      children: [makeRule({
        field: 'name',
        operator: 'greater_than',
        value: 25,
      })],
    })
    const errors = validateQuery(group, mockSchema)
    expect(errors.length).toBeGreaterThan(0)
  })
})

// ============================================
// HAS ERRORS TESTS
// ============================================

describe('hasErrors', () => {
  it('returns false for empty errors array', () => {
    expect(hasErrors([])).toBe(false)
  })

  it('returns true when error severity exists', () => {
    expect(hasErrors([{
      nodeId: 'rule-1',
      message: 'Error',
      severity: 'error',
    }])).toBe(true)
  })

  it('returns false when only warnings exist', () => {
    expect(hasErrors([{
      nodeId: 'rule-1',
      message: 'Warning',
      severity: 'warning',
    }])).toBe(false)
  })
})

// ============================================
// GET NODE ERRORS TESTS
// ============================================

describe('getNodeErrors', () => {
  const errors = [
    { nodeId: 'rule-1', message: 'Error 1', severity: 'error' as const },
    { nodeId: 'rule-2', message: 'Error 2', severity: 'error' as const },
    { nodeId: 'rule-1', message: 'Warning 1', severity: 'warning' as const },
  ]

  it('returns errors for specific node', () => {
    const result = getNodeErrors(errors, 'rule-1')
    expect(result).toHaveLength(2)
  })

  it('returns empty array for node with no errors', () => {
    const result = getNodeErrors(errors, 'rule-99')
    expect(result).toHaveLength(0)
  })

  it('returns only errors for that node', () => {
    const result = getNodeErrors(errors, 'rule-2')
    expect(result).toHaveLength(1)
    expect(result[0].message).toBe('Error 2')
  })
})

// ============================================
// IS NODE VALID TESTS
// ============================================

describe('isNodeValid', () => {
  const errors = [
    { nodeId: 'rule-1', message: 'Error', severity: 'error' as const },
    { nodeId: 'rule-2', message: 'Warning', severity: 'warning' as const },
  ]

  it('returns false for node with errors', () => {
    expect(isNodeValid(errors, 'rule-1')).toBe(false)
  })

  it('returns true for node with only warnings', () => {
    expect(isNodeValid(errors, 'rule-2')).toBe(true)
  })

  it('returns true for node with no errors', () => {
    expect(isNodeValid(errors, 'rule-99')).toBe(true)
  })
})