// components/results/ResultsPanel.tsx
'use client'

import { memo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play,
  ChevronUp,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Database,
  Inbox,
} from 'lucide-react'
import { useQueryStore } from '@/store/queryStore'
import { useHistoryStore } from '@/store/historyStore'
import ResultRow from './ResultRow'
import { clsx } from 'clsx'

// ============================================
// SORT BUTTON
// ============================================

const SortButton = memo(({
  field,
  currentSort,
  direction,
  onSort,
}: {
  field: string
  currentSort: string | undefined
  direction: 'asc' | 'desc'
  onSort: (field: string) => void
}) => {
  const isActive = currentSort === field

  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 transition-colors"
      style={{
        color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
      }}
    >
      {isActive && direction === 'asc' && <ChevronUp size={11} />}
      {isActive && direction === 'desc' && <ChevronDown size={11} />}
      {!isActive && <ChevronUp size={11} style={{ opacity: 0.3 }} />}
    </button>
  )
})

SortButton.displayName = 'SortButton'

// ============================================
// RESULTS PANEL
// ============================================

const ResultsPanel = memo(() => {
  const {
    executionResult,
    isExecuting,
    selectedSchema,
    executeQueryTree,
    validationErrors,
    rootGroup,
  } = useQueryStore()

  const { addToHistory } = useHistoryStore()

  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [sortField, setSortField] = useState<string | undefined>()
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const hasErrors = validationErrors.some(e => e.severity === 'error')

  // Handle sort
  const handleSort = useCallback((field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }

    executeQueryTree({
      page,
      pageSize,
      sortField: field,
      sortDirection: sortField === field && sortDirection === 'asc' ? 'desc' : 'asc',
    })
  }, [sortField, sortDirection, page, pageSize, executeQueryTree])

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
    executeQueryTree({
      page: newPage,
      pageSize,
      sortField,
      sortDirection,
    })
  }, [pageSize, sortField, sortDirection, executeQueryTree])

  // Handle execute
  const handleExecute = useCallback(() => {
    setPage(1)
    executeQueryTree({
      page: 1,
      pageSize,
      sortField,
      sortDirection,
    })

    // Save to history
    setTimeout(() => {
      const result = useQueryStore.getState().executionResult
      if (result && selectedSchema) {
        addToHistory(
          rootGroup,
          selectedSchema,
          result.totalCount,
          useQueryStore.getState().outputFormat
        )
      }
    }, 700)
  }, [
    pageSize,
    sortField,
    sortDirection,
    executeQueryTree,
    selectedSchema,
    rootGroup,
    addToHistory,
  ])

  // Toggle row expansion
  const toggleRow = useCallback((id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const fields = selectedSchema?.fields ?? []
  const records = executionResult?.records ?? []
  const totalCount = executionResult?.totalCount ?? 0
  const totalPages = executionResult?.totalPages ?? 0
  const executionTime = executionResult?.executionTime ?? 0

  return (
    <div
      className="flex flex-col rounded-lg border overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-primary)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-5 py-3 border-b"
        style={{ borderColor: 'var(--border-primary)' }}
      >
        <Database size={13} style={{ color: 'var(--accent-primary)' }} />
        <span
          className="text-xs font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Results
        </span>

        {/* Result count badge */}
        {executionResult && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-2 py-0.5 rounded-full text-xs font-mono"
            style={{
              background: totalCount > 0
                ? 'rgba(16, 185, 129, 0.1)'
                : 'var(--bg-tertiary)',
              color: totalCount > 0
                ? 'var(--accent-success)'
                : 'var(--text-muted)',
              border: `1px solid ${totalCount > 0
                ? 'rgba(16, 185, 129, 0.25)'
                : 'var(--border-primary)'}`,
            }}
          >
            {totalCount} {totalCount === 1 ? 'record' : 'records'}
          </motion.span>
        )}

        {/* Execution time */}
        {executionResult && (
          <span
            className="flex items-center gap-1 text-xs"
            style={{ color: 'var(--text-muted)', fontSize: '10px' }}
          >
            <Clock size={10} />
            {executionTime}ms
          </span>
        )}

        <div className="flex-1" />

        {/* Run button */}
        <button
          onClick={handleExecute}
          disabled={isExecuting || hasErrors}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold',
            'transition-all duration-200',
            !isExecuting && !hasErrors && 'hover:scale-105',
            (isExecuting || hasErrors) && 'opacity-50 cursor-not-allowed'
          )}
          style={{
            background: hasErrors
              ? 'rgba(239,68,68,0.1)'
              : 'rgba(0, 212, 255, 0.12)',
            color: hasErrors
              ? 'var(--accent-error)'
              : 'var(--accent-primary)',
            border: `1px solid ${hasErrors
              ? 'rgba(239,68,68,0.3)'
              : 'rgba(0, 212, 255, 0.3)'}`,
          }}
          title="Run Query (Ctrl+Enter)"
        >
          {isExecuting ? (
            <>
              <div
                className="w-3 h-3 rounded-full border-2 animate-spin"
                style={{
                  borderColor: 'var(--accent-primary)',
                  borderTopColor: 'transparent',
                }}
              />
              Running...
            </>
          ) : (
            <>
              <Play size={11} />
              Run
            </>
          )}
        </button>
      </div>

      {/* Loading state */}
      {isExecuting && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{
              borderColor: 'var(--border-primary)',
              borderTopColor: 'var(--accent-primary)',
            }}
          />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Executing query...
          </p>
        </div>
      )}

      {/* No results yet */}
      {!isExecuting && !executionResult && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)',
            }}
          >
            <Play size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div className="text-center">
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              Run your query to see results
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Click Run or press Ctrl+Enter
            </p>
          </div>
        </div>
      )}

      {/* Empty results */}
      {!isExecuting && executionResult && totalCount === 0 && (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Inbox size={24} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
          <div className="text-center">
            <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              No records match your query
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Try adjusting your conditions
            </p>
          </div>
        </div>
      )}

      {/* Results table */}
      {!isExecuting && executionResult && totalCount > 0 && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="overflow-auto"
          >
            {/* Table header */}
            <div
              className="sticky top-0 flex items-center gap-0 border-b"
              style={{
                background: 'var(--bg-secondary)',
                borderColor: 'var(--border-primary)',
                minWidth: 'max-content',
                width: '100%',
              }}
            >
              {/* Expand column */}
              <div className="w-8 shrink-0 px-2 py-2" />

              {fields.map(field => (
                <div
                  key={field.name}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-semibold
                    min-w-30 shrink-0"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <span className="truncate">{field.label}</span>
                  <SortButton
                    field={field.name}
                    currentSort={sortField}
                    direction={sortDirection}
                    onSort={handleSort}
                  />
                </div>
              ))}
            </div>

            {/* Table rows */}
            <div className="flex flex-col">
              <AnimatePresence>
                {records.map((record, index) => (
                  <ResultRow
                    key={String(record.id ?? index)}
                    record={record}
                    fields={fields}
                    index={index}
                    isExpanded={expandedRows.has(String(record.id ?? index))}
                    onToggleExpand={() =>
                      toggleRow(String(record.id ?? index))
                    }
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {!isExecuting && executionResult && totalPages > 1 && (
        <div
          className="flex items-center justify-between px-3 py-2 border-t text-xs"
          style={{
            borderColor: 'var(--border-primary)',
            background: 'var(--bg-secondary)',
          }}
        >
          {/* Page info */}
          <span style={{ color: 'var(--text-muted)' }}>
            Page {page} of {totalPages} · {totalCount} total
          </span>

          {/* Page controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(1)}
              disabled={page === 1}
              className="p-1 rounded transition-colors disabled:opacity-30"
              style={{ color: 'var(--text-muted)' }}
              aria-label="First page"
            >
              <ChevronsLeft size={13} />
            </button>
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="p-1 rounded transition-colors disabled:opacity-30"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Previous page"
            >
              <ChevronLeft size={13} />
            </button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(
                totalPages - 4,
                page - 2
              )) + i
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className="w-6 h-6 rounded text-xs transition-all duration-200"
                  style={{
                    background: page === pageNum
                      ? 'rgba(0, 212, 255, 0.12)'
                      : 'transparent',
                    color: page === pageNum
                      ? 'var(--accent-primary)'
                      : 'var(--text-muted)',
                    border: page === pageNum
                      ? '1px solid rgba(0, 212, 255, 0.3)'
                      : '1px solid transparent',
                  }}
                >
                  {pageNum}
                </button>
              )
            })}

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="p-1 rounded transition-colors disabled:opacity-30"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Next page"
            >
              <ChevronRight size={13} />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={page === totalPages}
              className="p-1 rounded transition-colors disabled:opacity-30"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Last page"
            >
              <ChevronsRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
})

ResultsPanel.displayName = 'ResultsPanel'

export default ResultsPanel