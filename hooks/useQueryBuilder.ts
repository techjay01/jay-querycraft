// hooks/useQueryBuilder.ts
import { useCallback } from 'react'
import { useQueryStore } from '@/store/queryStore'
import { useHistoryStore } from '@/store/historyStore'
import { generateAllFormats } from '@/lib/queryEngine'
import { QueryOutputFormat } from '@/types/query'

export const useQueryBuilder = () => {
  const store = useQueryStore()
  const historyStore = useHistoryStore()

  // Execute and save to history
  const executeAndSave = useCallback(
    (options?: {
      page?: number
      pageSize?: number
      sortField?: string
      sortDirection?: 'asc' | 'desc'
    }) => {
      const { rootGroup, selectedSchema, outputFormat } = useQueryStore.getState()

      if (!selectedSchema) return

      store.executeQueryTree(options)

      // Save to history after execution
      setTimeout(() => {
        const result = useQueryStore.getState().executionResult
        if (result) {
          historyStore.addToHistory(
            rootGroup,
            selectedSchema,
            result.totalCount,
            outputFormat
          )
        }
      }, 700)
    },
    [store, historyStore]
  )

  // Generate all query formats
  const generatedQuery = generateAllFormats(
    store.rootGroup,
    store.selectedSchema?.id ?? 'records'
  )

  // Get current format output
  const getCurrentOutput = useCallback(
    (format: QueryOutputFormat) => {
      switch (format) {
        case 'sql':
          return generatedQuery.sql
        case 'mongodb':
          return JSON.stringify(generatedQuery.mongodb, null, 2)
        case 'graphql':
          return generatedQuery.graphql
        default:
          return generatedQuery.sql
      }
    },
    [generatedQuery]
  )

  return {
    ...store,
    generatedQuery,
    getCurrentOutput,
    executeAndSave,
  }
}