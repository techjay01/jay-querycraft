// __tests__/queryEngine.test.ts
import { describe, it, expect } from 'vitest'
import {
  generateSQL,
  generateMongoDB,
  generateGraphQL,
  generateAllFormats,
  generateByFormat,
  countRules,
  countGroups,
  flattenRules,
} from '@/lib/queryEngine'
import { QueryGroup, QueryRule } from '@/types/query'

// ============================================
// HELPERS
// ============================================

const makeRule = (
  field: string,
  operator: QueryRule['operator'],
  value: QueryRule['value']
): QueryRule => ({
  id: `rule-${field}`,
  type: 'rule',
  field,
  operator,
  value,
})

const makeGroup = (
  logicalOperator: 'AND' | 'OR',
  children: QueryGroup['children']
): QueryGroup => ({
  id: 'group-1',
  type: 'group',
  logicalOperator,
  children,
  collapsed: false,
})

// ============================================
// SQL GENERATOR TESTS
// ============================================

describe('generateSQL', () => {
  it('generates basic SELECT when no conditions', () => {
    const group = makeGroup('AND', [])
    const sql = generateSQL(group, 'users')
    expect(sql).toBe('SELECT * FROM users')
  })

  it('generates equals condition', () => {
    const group = makeGroup('AND', [
      makeRule('status', 'equals', 'active'),
    ])
    const sql = generateSQL(group, 'users')
    expect(sql).toContain('`status` = \'active\'')
  })

  it('generates greater than condition', () => {
    const group = makeGroup('AND', [
      makeRule('age', 'greater_than', 25),
    ])
    const sql = generateSQL(group, 'users')
    expect(sql).toContain('`age` > 25')
  })

  it('generates less than condition', () => {
    const group = makeGroup('AND', [
      makeRule('age', 'less_than', 30),
    ])
    const sql = generateSQL(group, 'users')
    expect(sql).toContain('`age` < 30')
  })

  it('generates LIKE for contains', () => {
    const group = makeGroup('AND', [
      makeRule('name', 'contains', 'John'),
    ])
    const sql = generateSQL(group, 'users')
    expect(sql).toContain("LIKE '%John%'")
  })

  it('generates LIKE for starts_with', () => {
    const group = makeGroup('AND', [
      makeRule('name', 'starts_with', 'Jo'),
    ])
    const sql = generateSQL(group, 'users')
    expect(sql).toContain("LIKE 'Jo%'")
  })

  it('generates LIKE for ends_with', () => {
    const group = makeGroup('AND', [
      makeRule('name', 'ends_with', 'hn'),
    ])
    const sql = generateSQL(group, 'users')
    expect(sql).toContain("LIKE '%hn'")
  })

  it('generates BETWEEN condition', () => {
    const group = makeGroup('AND', [
      makeRule('age', 'between', [18, 30]),
    ])
    const sql = generateSQL(group, 'users')
    expect(sql).toContain('BETWEEN 18 AND 30')
  })

  it('generates IN array condition', () => {
    const group = makeGroup('AND', [
      makeRule('status', 'in_array', ['active', 'pending']),
    ])
    const sql = generateSQL(group, 'users')
    expect(sql).toContain("IN ('active', 'pending')")
  })

  it('generates IS NULL condition', () => {
    const group = makeGroup('AND', [
      makeRule('deletedAt', 'is_null', null),
    ])
    const sql = generateSQL(group, 'users')
    expect(sql).toContain('IS NULL')
  })

  it('generates IS NOT NULL condition', () => {
    const group = makeGroup('AND', [
      makeRule('deletedAt', 'is_not_null', null),
    ])
    const sql = generateSQL(group, 'users')
    expect(sql).toContain('IS NOT NULL')
  })

  it('generates AND between multiple conditions', () => {
    const group = makeGroup('AND', [
      makeRule('age', 'greater_than', 18),
      makeRule('status', 'equals', 'active'),
    ])
    const sql = generateSQL(group, 'users')
    expect(sql).toContain('AND')
    expect(sql).toContain('`age` > 18')
    expect(sql).toContain("`status` = 'active'")
  })

  it('generates OR between conditions', () => {
    const group = makeGroup('OR', [
      makeRule('status', 'equals', 'active'),
      makeRule('status', 'equals', 'pending'),
    ])
    const sql = generateSQL(group, 'users')
    expect(sql).toContain('OR')
  })

  it('generates nested group SQL', () => {
    const nested = {
      ...makeGroup('OR', [
        makeRule('country', 'equals', 'NG'),
        makeRule('country', 'equals', 'GH'),
      ]),
      id: 'group-nested',
    }
    const group = makeGroup('AND', [
      makeRule('age', 'greater_than', 18),
      nested,
    ])
    const sql = generateSQL(group, 'users')
    expect(sql).toContain('`age` > 18')
    expect(sql).toContain("'NG'")
    expect(sql).toContain("'GH'")
  })

  it('escapes single quotes in string values', () => {
    const group = makeGroup('AND', [
      makeRule('name', 'equals', "O'Brien"),
    ])
    const sql = generateSQL(group, 'users')
    expect(sql).toContain("O''Brien")
  })

  it('generates REGEXP condition', () => {
    const group = makeGroup('AND', [
      makeRule('email', 'regex', '^[a-z]+@'),
    ])
    const sql = generateSQL(group, 'users')
    expect(sql).toContain('REGEXP')
  })
})

// ============================================
// MONGODB GENERATOR TESTS
// ============================================

describe('generateMongoDB', () => {
  it('returns empty object when no conditions', () => {
    const group = makeGroup('AND', [])
    const result = generateMongoDB(group)
    expect(result).toEqual({})
  })

  it('generates $eq for equals', () => {
    const group = makeGroup('AND', [
      makeRule('status', 'equals', 'active'),
    ])
    const result = generateMongoDB(group)
    expect(result).toEqual({ status: { $eq: 'active' } })
  })

  it('generates $gt for greater_than', () => {
    const group = makeGroup('AND', [
      makeRule('age', 'greater_than', 25),
    ])
    const result = generateMongoDB(group)
    expect(result).toEqual({ age: { $gt: 25 } })
  })

  it('generates $lt for less_than', () => {
    const group = makeGroup('AND', [
      makeRule('age', 'less_than', 30),
    ])
    const result = generateMongoDB(group)
    expect(result).toEqual({ age: { $lt: 30 } })
  })

  it('generates $regex for contains', () => {
    const group = makeGroup('AND', [
      makeRule('name', 'contains', 'John'),
    ])
    const result = generateMongoDB(group) as Record<string, unknown>
    expect(result.name).toMatchObject({ $regex: 'John' })
  })

  it('generates $and for AND group', () => {
    const group = makeGroup('AND', [
      makeRule('age', 'greater_than', 18),
      makeRule('status', 'equals', 'active'),
    ])
    const result = generateMongoDB(group) as Record<string, unknown>
    expect(result).toHaveProperty('$and')
    expect(Array.isArray(result.$and)).toBe(true)
  })

  it('generates $or for OR group', () => {
    const group = makeGroup('OR', [
      makeRule('status', 'equals', 'active'),
      makeRule('status', 'equals', 'pending'),
    ])
    const result = generateMongoDB(group) as Record<string, unknown>
    expect(result).toHaveProperty('$or')
  })

  it('generates $in for in_array', () => {
    const group = makeGroup('AND', [
      makeRule('status', 'in_array', ['active', 'pending']),
    ])
    const result = generateMongoDB(group) as Record<string, unknown>
    expect(result).toEqual({ status: { $in: ['active', 'pending'] } })
  })

  it('generates $gte and $lte for between', () => {
    const group = makeGroup('AND', [
      makeRule('age', 'between', [18, 30]),
    ])
    const result = generateMongoDB(group) as Record<string, unknown>
    expect(result).toEqual({ age: { $gte: 18, $lte: 30 } })
  })

  it('handles nested groups', () => {
    const nested = {
      ...makeGroup('OR', [
        makeRule('country', 'equals', 'NG'),
        makeRule('country', 'equals', 'GH'),
      ]),
      id: 'nested',
    }
    const group = makeGroup('AND', [
      makeRule('age', 'greater_than', 18),
      nested,
    ])
    const result = generateMongoDB(group) as Record<string, unknown>
    expect(result).toHaveProperty('$and')
  })
})

// ============================================
// GRAPHQL GENERATOR TESTS
// ============================================

describe('generateGraphQL', () => {
  it('generates basic query when no conditions', () => {
    const group = makeGroup('AND', [])
    const result = generateGraphQL(group, 'users')
    expect(result).toContain('query')
    expect(result).toContain('usersList')
  })

  it('generates eq filter', () => {
    const group = makeGroup('AND', [
      makeRule('status', 'equals', 'active'),
    ])
    const result = generateGraphQL(group, 'users')
    expect(result).toContain('status')
    expect(result).toContain('"active"')
  })

  it('generates gt filter', () => {
    const group = makeGroup('AND', [
      makeRule('age', 'greater_than', 25),
    ])
    const result = generateGraphQL(group, 'users')
    expect(result).toContain('gt')
    expect(result).toContain('25')
  })

  it('contains and/or logic', () => {
    const group = makeGroup('AND', [
      makeRule('age', 'greater_than', 18),
      makeRule('status', 'equals', 'active'),
    ])
    const result = generateGraphQL(group, 'users')
    expect(result).toContain('and')
  })
})

// ============================================
// GENERATE ALL FORMATS TESTS
// ============================================

describe('generateAllFormats', () => {
  it('returns all three formats', () => {
    const group = makeGroup('AND', [
      makeRule('age', 'greater_than', 18),
    ])
    const result = generateAllFormats(group, 'users')
    expect(result).toHaveProperty('sql')
    expect(result).toHaveProperty('mongodb')
    expect(result).toHaveProperty('graphql')
    expect(result).toHaveProperty('raw')
  })

  it('sql is a string', () => {
    const group = makeGroup('AND', [makeRule('age', 'greater_than', 18)])
    const result = generateAllFormats(group, 'users')
    expect(typeof result.sql).toBe('string')
  })

  it('mongodb is an object', () => {
    const group = makeGroup('AND', [makeRule('age', 'greater_than', 18)])
    const result = generateAllFormats(group, 'users')
    expect(typeof result.mongodb).toBe('object')
  })

  it('graphql is a string', () => {
    const group = makeGroup('AND', [makeRule('age', 'greater_than', 18)])
    const result = generateAllFormats(group, 'users')
    expect(typeof result.graphql).toBe('string')
  })
})

// ============================================
// FORMAT SWITCHER TESTS
// ============================================

describe('generateByFormat', () => {
  const group = makeGroup('AND', [makeRule('age', 'greater_than', 18)])

  it('returns string for sql', () => {
    const result = generateByFormat(group, 'sql', 'users')
    expect(typeof result).toBe('string')
  })

  it('returns object for mongodb', () => {
    const result = generateByFormat(group, 'mongodb', 'users')
    expect(typeof result).toBe('object')
  })

  it('returns string for graphql', () => {
    const result = generateByFormat(group, 'graphql', 'users')
    expect(typeof result).toBe('string')
  })
})

// ============================================
// TREE UTILITY TESTS
// ============================================

describe('countRules', () => {
  it('counts zero rules in empty group', () => {
    const group = makeGroup('AND', [])
    expect(countRules(group)).toBe(0)
  })

  it('counts rules at root level', () => {
    const group = makeGroup('AND', [
      makeRule('age', 'greater_than', 18),
      makeRule('status', 'equals', 'active'),
    ])
    expect(countRules(group)).toBe(2)
  })

  it('counts rules recursively in nested groups', () => {
    const nested = {
      ...makeGroup('OR', [
        makeRule('country', 'equals', 'NG'),
        makeRule('country', 'equals', 'GH'),
      ]),
      id: 'nested',
    }
    const group = makeGroup('AND', [
      makeRule('age', 'greater_than', 18),
      nested,
    ])
    expect(countRules(group)).toBe(3)
  })
})

describe('countGroups', () => {
  it('counts zero nested groups in flat group', () => {
    const group = makeGroup('AND', [
      makeRule('age', 'greater_than', 18),
    ])
    expect(countGroups(group)).toBe(0)
  })

  it('counts one nested group', () => {
    const nested = {
      ...makeGroup('OR', [makeRule('status', 'equals', 'active')]),
      id: 'nested',
    }
    const group = makeGroup('AND', [
      makeRule('age', 'greater_than', 18),
      nested,
    ])
    expect(countGroups(group)).toBe(1)
  })
})

describe('flattenRules', () => {
  it('returns empty array for empty group', () => {
    const group = makeGroup('AND', [])
    expect(flattenRules(group)).toEqual([])
  })

  it('flattens rules from root level', () => {
    const group = makeGroup('AND', [
      makeRule('age', 'greater_than', 18),
      makeRule('status', 'equals', 'active'),
    ])
    expect(flattenRules(group)).toHaveLength(2)
  })

  it('flattens rules from nested groups', () => {
    const nested = {
      ...makeGroup('OR', [
        makeRule('country', 'equals', 'NG'),
        makeRule('country', 'equals', 'GH'),
      ]),
      id: 'nested',
    }
    const group = makeGroup('AND', [
      makeRule('age', 'greater_than', 18),
      nested,
    ])
    const rules = flattenRules(group)
    expect(rules).toHaveLength(3)
    expect(rules.every(r => r.type === 'rule')).toBe(true)
  })
})