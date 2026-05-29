// lib/queryExecutor.ts
import { QueryGroup, QueryRule, QueryNode } from '@/types/query'
import { MOCK_DATASETS } from '@/lib/schemas'

// ============================================
// HELPERS
// ============================================

const getNestedValue = (
  obj: Record<string, unknown>,
  field: string
): unknown => {
  return field.split('.').reduce((acc: unknown, key: string) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

const normalizeString = (val: unknown): string =>
  String(val ?? '').toLowerCase().trim()

// ============================================
// RULE EVALUATOR
// ============================================

const evaluateRule = (
  rule: QueryRule,
  record: Record<string, unknown>
): boolean => {
  const rawValue = getNestedValue(record, rule.field)
  const { operator, value } = rule

  switch (operator) {
    case 'equals':
      return String(rawValue) === String(value)

    case 'not_equals':
      return String(rawValue) !== String(value)

    case 'contains':
      return normalizeString(rawValue).includes(normalizeString(value))

    case 'not_contains':
      return !normalizeString(rawValue).includes(normalizeString(value))

    case 'starts_with':
      return normalizeString(rawValue).startsWith(normalizeString(value))

    case 'ends_with':
      return normalizeString(rawValue).endsWith(normalizeString(value))

    case 'greater_than':
      return Number(rawValue) > Number(value)

    case 'less_than':
      return Number(rawValue) < Number(value)

    case 'greater_than_or_equal':
      return Number(rawValue) >= Number(value)

    case 'less_than_or_equal':
      return Number(rawValue) <= Number(value)

    case 'between': {
      const [v1, v2] = value as [number, number]
      const num = Number(rawValue)
      return num >= Number(v1) && num <= Number(v2)
    }

    case 'in_array': {
      const arr = Array.isArray(value)
        ? value
        : String(value).split(',').map(v => v.trim())
      return arr.map(String).includes(String(rawValue))
    }

    case 'not_in_array': {
      const arr = Array.isArray(value)
        ? value
        : String(value).split(',').map(v => v.trim())
      return !arr.map(String).includes(String(rawValue))
    }

    case 'is_null':
      return rawValue === null || rawValue === undefined || rawValue === ''

    case 'is_not_null':
      return rawValue !== null && rawValue !== undefined && rawValue !== ''

    case 'regex': {
      try {
        const regex = new RegExp(String(value))
        return regex.test(String(rawValue))
      } catch {
        return false
      }
    }

    case 'date_before':
      return new Date(String(rawValue)) < new Date(String(value))

    case 'date_after':
      return new Date(String(rawValue)) > new Date(String(value))

    case 'date_between': {
      const [d1, d2] = value as [string, string]
      const date = new Date(String(rawValue))
      return date >= new Date(d1) && date <= new Date(d2)
    }

    default:
      return false
  }
}

// ============================================
// GROUP EVALUATOR (RECURSIVE)
// ============================================

const evaluateGroup = (
  group: QueryGroup,
  record: Record<string, unknown>
): boolean => {
  if (!group.children || group.children.length === 0) return true

  const results = group.children.map((child: QueryNode) => {
    if (child.type === 'rule') return evaluateRule(child, record)
    return evaluateGroup(child, record)
  })

  if (group.logicalOperator === 'AND') {
    return results.every(Boolean)
  } else {
    return results.some(Boolean)
  }
}

// ============================================
// PAGINATION & SORTING TYPES
// ============================================

export interface ExecutorOptions {
  page?: number
  pageSize?: number
  sortField?: string
  sortDirection?: 'asc' | 'desc'
}

export interface ExecutorResult {
  records: Record<string, unknown>[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  executionTime: number
}

// ============================================
// MAIN EXECUTOR
// ============================================

export const executeQuery = (
  rootGroup: QueryGroup,
  schemaId: string,
  options: ExecutorOptions = {}
): ExecutorResult => {
  const startTime = performance.now()

  const {
    page = 1,
    pageSize = 10,
    sortField,
    sortDirection = 'asc',
  } = options

  // Get mock dataset
  const dataset = MOCK_DATASETS[schemaId] ?? []

  // Filter records
  let filtered: Record<string, unknown>[]

  if (!rootGroup.children || rootGroup.children.length === 0) {
    filtered = [...dataset]
  } else {
    filtered = dataset.filter(record => evaluateGroup(rootGroup, record))
  }

  // Sort records
  if (sortField) {
    filtered.sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]

      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
      }

      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()

      if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1
      if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }

  // Paginate
  const totalCount = filtered.length
  const totalPages = Math.ceil(totalCount / pageSize)
  const start = (page - 1) * pageSize
  const paginated = filtered.slice(start, start + pageSize)

  const executionTime = performance.now() - startTime

  return {
    records: paginated,
    totalCount,
    page,
    pageSize,
    totalPages,
    executionTime: Math.round(executionTime * 100) / 100,
  }
}

// ============================================
// QUICK COUNT — for result badge
// ============================================

export const countMatches = (
  rootGroup: QueryGroup,
  schemaId: string
): number => {
  const dataset = MOCK_DATASETS[schemaId] ?? []
  if (!rootGroup.children || rootGroup.children.length === 0) {
    return dataset.length
  }
  return dataset.filter(record => evaluateGroup(rootGroup, record)).length
}