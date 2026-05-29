// lib/queryEngine.ts
import { QueryGroup, QueryRule, QueryNode, QueryOutputFormat, GeneratedQuery } from '@/types/query'

// ============================================
// HELPERS
// ============================================

const escapeValue = (value: unknown): string => {
  if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`
  if (typeof value === 'number') return String(value)
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE'
  if (value === null) return 'NULL'
  return String(value)
}

const escapeField = (field: string): string => `\`${field}\``

// ============================================
// SQL GENERATOR
// ============================================

const ruleToSQL = (rule: QueryRule): string => {
  const field = escapeField(rule.field)
  const { operator, value } = rule

  switch (operator) {
    case 'equals':
      return `${field} = ${escapeValue(value)}`
    case 'not_equals':
      return `${field} != ${escapeValue(value)}`
    case 'contains':
      return `${field} LIKE ${escapeValue(`%${value}%`)}`
    case 'not_contains':
      return `${field} NOT LIKE ${escapeValue(`%${value}%`)}`
    case 'starts_with':
      return `${field} LIKE ${escapeValue(`${value}%`)}`
    case 'ends_with':
      return `${field} LIKE ${escapeValue(`%${value}`)}`
    case 'greater_than':
      return `${field} > ${escapeValue(value)}`
    case 'less_than':
      return `${field} < ${escapeValue(value)}`
    case 'greater_than_or_equal':
      return `${field} >= ${escapeValue(value)}`
    case 'less_than_or_equal':
      return `${field} <= ${escapeValue(value)}`
    case 'between': {
      const [v1, v2] = value as [number, number]
      return `${field} BETWEEN ${escapeValue(v1)} AND ${escapeValue(v2)}`
    }
    case 'in_array': {
      const arr = Array.isArray(value) ? value : String(value).split(',').map(v => v.trim())
      return `${field} IN (${arr.map(escapeValue).join(', ')})`
    }
    case 'not_in_array': {
      const arr = Array.isArray(value) ? value : String(value).split(',').map(v => v.trim())
      return `${field} NOT IN (${arr.map(escapeValue).join(', ')})`
    }
    case 'is_null':
      return `${field} IS NULL`
    case 'is_not_null':
      return `${field} IS NOT NULL`
    case 'regex':
      return `${field} REGEXP ${escapeValue(value)}`
    case 'date_before':
      return `${field} < ${escapeValue(value)}`
    case 'date_after':
      return `${field} > ${escapeValue(value)}`
    case 'date_between': {
      const [d1, d2] = value as [string, string]
      return `${field} BETWEEN ${escapeValue(d1)} AND ${escapeValue(d2)}`
    }
    default:
      return `${field} = ${escapeValue(value)}`
  }
}

const groupToSQL = (group: QueryGroup, depth: number = 0): string => {
  if (!group.children || group.children.length === 0) return ''

  const indent = '  '.repeat(depth)
  const childIndent = '  '.repeat(depth + 1)
  const operator = ` ${group.logicalOperator} `

  const parts = group.children
    .map((child: QueryNode) => {
      if (child.type === 'rule') {
        return `${childIndent}${ruleToSQL(child)}`
      } else {
        const nested = groupToSQL(child, depth + 1)
        return `${childIndent}(\n${nested}\n${childIndent})`
      }
    })
    .filter(Boolean)

  return parts.join(`\n${indent}${operator.trim()}\n`)
}

export const generateSQL = (rootGroup: QueryGroup, tableName: string = 'records'): string => {
  if (!rootGroup.children || rootGroup.children.length === 0) {
    return `SELECT * FROM ${tableName}`
  }
  const where = groupToSQL(rootGroup, 1)
  return `SELECT *\nFROM ${tableName}\nWHERE\n${where}`
}

// ============================================
// MONGODB GENERATOR
// ============================================

const ruleToMongo = (rule: QueryRule): Record<string, unknown> => {
  const { field, operator, value } = rule

  switch (operator) {
    case 'equals':
      return { [field]: { $eq: value } }
    case 'not_equals':
      return { [field]: { $ne: value } }
    case 'contains':
      return { [field]: { $regex: String(value), $options: 'i' } }
    case 'not_contains':
      return { [field]: { $not: { $regex: String(value), $options: 'i' } } }
    case 'starts_with':
      return { [field]: { $regex: `^${String(value)}`, $options: 'i' } }
    case 'ends_with':
      return { [field]: { $regex: `${String(value)}$`, $options: 'i' } }
    case 'greater_than':
      return { [field]: { $gt: value } }
    case 'less_than':
      return { [field]: { $lt: value } }
    case 'greater_than_or_equal':
      return { [field]: { $gte: value } }
    case 'less_than_or_equal':
      return { [field]: { $lte: value } }
    case 'between': {
      const [v1, v2] = value as [number, number]
      return { [field]: { $gte: v1, $lte: v2 } }
    }
    case 'in_array': {
      const arr = Array.isArray(value) ? value : String(value).split(',').map(v => v.trim())
      return { [field]: { $in: arr } }
    }
    case 'not_in_array': {
      const arr = Array.isArray(value) ? value : String(value).split(',').map(v => v.trim())
      return { [field]: { $nin: arr } }
    }
    case 'is_null':
      return { [field]: { $eq: null } }
    case 'is_not_null':
      return { [field]: { $ne: null } }
    case 'regex':
      return { [field]: { $regex: String(value) } }
    case 'date_before':
      return { [field]: { $lt: value } }
    case 'date_after':
      return { [field]: { $gt: value } }
    case 'date_between': {
      const [d1, d2] = value as [string, string]
      return { [field]: { $gte: d1, $lte: d2 } }
    }
    default:
      return { [field]: { $eq: value } }
  }
}

const groupToMongo = (group: QueryGroup): Record<string, unknown> => {
  if (!group.children || group.children.length === 0) return {}

  const parts = group.children
    .map((child: QueryNode) => {
      if (child.type === 'rule') return ruleToMongo(child)
      return groupToMongo(child)
    })
    .filter(p => Object.keys(p).length > 0)

  if (parts.length === 0) return {}
  if (parts.length === 1) return parts[0]

  const mongoOp = group.logicalOperator === 'AND' ? '$and' : '$or'
  return { [mongoOp]: parts }
}

export const generateMongoDB = (rootGroup: QueryGroup): Record<string, unknown> => {
  return groupToMongo(rootGroup)
}

// ============================================
// GRAPHQL GENERATOR
// ============================================

const ruleToGraphQL = (rule: QueryRule): string => {
  const { field, operator, value } = rule

  switch (operator) {
    case 'equals':
      return `${field}: { eq: ${JSON.stringify(value)} }`
    case 'not_equals':
      return `${field}: { neq: ${JSON.stringify(value)} }`
    case 'contains':
      return `${field}: { contains: ${JSON.stringify(value)} }`
    case 'not_contains':
      return `${field}: { notContains: ${JSON.stringify(value)} }`
    case 'starts_with':
      return `${field}: { startsWith: ${JSON.stringify(value)} }`
    case 'ends_with':
      return `${field}: { endsWith: ${JSON.stringify(value)} }`
    case 'greater_than':
      return `${field}: { gt: ${JSON.stringify(value)} }`
    case 'less_than':
      return `${field}: { lt: ${JSON.stringify(value)} }`
    case 'greater_than_or_equal':
      return `${field}: { gte: ${JSON.stringify(value)} }`
    case 'less_than_or_equal':
      return `${field}: { lte: ${JSON.stringify(value)} }`
    case 'between': {
      const [v1, v2] = value as [number, number]
      return `${field}: { between: { from: ${v1}, to: ${v2} } }`
    }
    case 'in_array': {
      const arr = Array.isArray(value) ? value : String(value).split(',').map(v => v.trim())
      return `${field}: { in: ${JSON.stringify(arr)} }`
    }
    case 'not_in_array': {
      const arr = Array.isArray(value) ? value : String(value).split(',').map(v => v.trim())
      return `${field}: { notIn: ${JSON.stringify(arr)} }`
    }
    case 'is_null':
      return `${field}: { isNull: true }`
    case 'is_not_null':
      return `${field}: { isNull: false }`
    case 'regex':
      return `${field}: { matchesRegex: ${JSON.stringify(value)} }`
    case 'date_before':
      return `${field}: { lt: ${JSON.stringify(value)} }`
    case 'date_after':
      return `${field}: { gt: ${JSON.stringify(value)} }`
    case 'date_between': {
      const [d1, d2] = value as [string, string]
      return `${field}: { between: { from: ${JSON.stringify(d1)}, to: ${JSON.stringify(d2)} } }`
    }
    default:
      return `${field}: { eq: ${JSON.stringify(value)} }`
  }
}

const groupToGraphQL = (group: QueryGroup, depth: number = 0): string => {
  if (!group.children || group.children.length === 0) return ''

  const indent = '  '.repeat(depth + 2)
  const op = group.logicalOperator.toLowerCase()

  const parts = group.children
    .map((child: QueryNode) => {
      if (child.type === 'rule') return `${indent}{ ${ruleToGraphQL(child)} }`
      const nested = groupToGraphQL(child, depth + 1)
      return `${indent}{\n${nested}\n${indent}}`
    })
    .filter(Boolean)

  return `${indent}${op}: [\n${parts.join(',\n')}\n${indent}]`
}

export const generateGraphQL = (
  rootGroup: QueryGroup,
  schemaName: string = 'records'
): string => {
  if (!rootGroup.children || rootGroup.children.length === 0) {
    return `query {\n  ${schemaName}List {\n    items { id }\n  }\n}`
  }

  const filter = groupToGraphQL(rootGroup, 0)
  return `query {\n  ${schemaName}List(\n    filter: {\n${filter}\n    }\n  ) {\n    items { id }\n    totalCount\n  }\n}`
}

// ============================================
// MASTER GENERATOR — all three formats
// ============================================

export const generateAllFormats = (
  rootGroup: QueryGroup,
  schemaName: string = 'records'
): GeneratedQuery => {
  return {
    sql: generateSQL(rootGroup, schemaName),
    mongodb: generateMongoDB(rootGroup),
    graphql: generateGraphQL(rootGroup, schemaName),
    raw: rootGroup,
  }
}

// ============================================
// QUERY TREE UTILITIES
// ============================================

export const countRules = (group: QueryGroup): number => {
  return group.children.reduce((count: number, child: QueryNode) => {
    if (child.type === 'rule') return count + 1
    return count + countRules(child)
  }, 0)
}

export const countGroups = (group: QueryGroup): number => {
  return group.children.reduce((count: number, child: QueryNode) => {
    if (child.type === 'group') return 1 + countGroups(child) + count
    return count
  }, 0)
}

export const flattenRules = (group: QueryGroup): QueryRule[] => {
  return group.children.reduce((rules: QueryRule[], child: QueryNode) => {
    if (child.type === 'rule') return [...rules, child]
    return [...rules, ...flattenRules(child)]
  }, [])
}

// ============================================
// FORMAT SWITCHER — used by preview panel
// ============================================

export const generateByFormat = (
  rootGroup: QueryGroup,
  format: QueryOutputFormat,
  schemaName: string = 'records'
): string | Record<string, unknown> => {
  switch (format) {
    case 'sql':
      return generateSQL(rootGroup, schemaName)
    case 'mongodb':
      return generateMongoDB(rootGroup)
    case 'graphql':
      return generateGraphQL(rootGroup, schemaName)
    default:
      return generateSQL(rootGroup, schemaName)
  }
}