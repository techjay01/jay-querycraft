// components/results/ResultsPanel.tsx
'use client'

import { memo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, ChevronUp, ChevronDown,
  ChevronsLeft, ChevronsRight,
  ChevronLeft, ChevronRight,
  Clock, Database, Inbox, Search,
} from 'lucide-react'
import { useQueryStore } from '@/store/queryStore'
import { useHistoryStore } from '@/store/historyStore'
import ResultRow from './ResultRow'

const SortButton = memo(({
  field, currentSort, direction, onSort,
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
      className="flex items-center transition-colors flex-shrink-0"
      style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
    >
      {isActive
        ? direction === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />
        : <ChevronUp size={11} style={{ opacity: 0.3 }} />
      }
    </button>
  )
})

SortButton.displayName = 'SortButton'

const ResultsPanel = memo(() => {
  const {
    executionResult, isExecuting, selectedSchema,
    executeQueryTree, validationErrors, rootGroup,
  } = useQueryStore()

  const { addToHistory } = useHistoryStore()

  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [sortField, setSortField] = useState<string | undefined>()
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  const hasErrors = validationErrors.some(e => e.severity === 'error')
  const fields = selectedSchema?.fields ?? []

  // Shared grid template — MUST match between header and rows
  const gridCols = `40px repeat(${fields.length}, minmax(130px, 1fr))`

  const handleSort = useCallback((field: string) => {
    const newDir = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc'
    setSortField(field)
    setSortDirection(newDir)
    executeQueryTree({ page, pageSize, sortField: field, sortDirection: newDir })
  }, [sortField, sortDirection, page, pageSize, executeQueryTree])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
    executeQueryTree({ page: newPage, pageSize, sortField, sortDirection })
  }, [pageSize, sortField, sortDirection, executeQueryTree])

  const handleExecute = useCallback(() => {
    setPage(1)
    executeQueryTree({ page: 1, pageSize, sortField, sortDirection })
    setTimeout(() => {
      const result = useQueryStore.getState().executionResult
      if (result && selectedSchema) {
        addToHistory(rootGroup, selectedSchema, result.totalCount, useQueryStore.getState().outputFormat)
      }
    }, 700)
  }, [pageSize, sortField, sortDirection, executeQueryTree, selectedSchema, rootGroup, addToHistory])

  const toggleRow = useCallback((id: string) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const allRecords = executionResult?.records ?? []
  const records = searchQuery.trim()
    ? allRecords.filter(record =>
        Object.values(record).some(val =>
          String(val ?? '').toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    : allRecords

  const totalCount = executionResult?.totalCount ?? 0
  const totalPages = executionResult?.totalPages ?? 0
  const executionTime = executionResult?.executionTime ?? 0

  return (
    <div
      className="flex flex-col rounded-lg border overflow-hidden w-full"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-3 border-b flex-wrap"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <Database size={13} style={{ color: 'var(--accent)' }} />
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text)' }}>
            Query Inspection
          </span>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--success)' }} />
            <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--success)', fontSize: '9px' }}>
              Connected to Simulator
            </span>
          </div>
        </div>

        {executionResult && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-2 py-0.5 rounded text-xs font-mono font-bold uppercase tracking-wider"
            style={{
              background: totalCount > 0 ? 'var(--accent-subtle)' : 'var(--bg-input)',
              color: totalCount > 0 ? 'var(--accent)' : 'var(--text-muted)',
              border: `1px solid ${totalCount > 0 ? 'var(--accent-border)' : 'var(--border)'}`,
            }}
          >
            {totalCount} {totalCount === 1 ? 'Match' : 'Matches'}
          </motion.span>
        )}

        {executionResult && (
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
            <Clock size={10} />
            {executionTime}ms
          </span>
        )}

        <div className="flex-1" />

        {executionResult && totalCount > 0 && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', minWidth: '180px' }}
          >
            <Search size={11} style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search results..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="text-xs outline-none bg-transparent flex-1"
              style={{ color: 'var(--text)', fontFamily: 'var(--font-mono)' }}
            />
          </div>
        )}

        <button
          onClick={handleExecute}
          disabled={isExecuting || hasErrors}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold
            uppercase tracking-wider transition-all duration-150
            disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: hasErrors ? 'var(--danger-subtle)' : 'var(--accent)',
            color: hasErrors ? 'var(--danger)' : 'var(--accent-fg)',
            border: hasErrors ? '1px solid var(--danger-border)' : 'none',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {isExecuting ? (
            <>
              <div className="w-3 h-3 rounded-full border-2 animate-spin"
                style={{ borderColor: 'var(--accent-fg)', borderTopColor: 'transparent' }} />
              Running...
            </>
          ) : (
            <><Play size={11} /> Run</>
          )}
        </button>
      </div>

      {/* Loading */}
      {isExecuting && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
          <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Executing query...
          </p>
        </div>
      )}

      {/* No results yet */}
      {!isExecuting && !executionResult && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Play size={20} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
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
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Inbox size={20} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              No records match your query
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              Try adjusting your conditions
            </p>
          </div>
        </div>
      )}

      {/* Table */}
      {!isExecuting && executionResult && totalCount > 0 && (
        <div className="overflow-x-auto w-full">
          {/* Header row */}
          <div
            className="grid border-b w-full sticky top-0"
            style={{
              gridTemplateColumns: gridCols,
              background: 'var(--bg-surface)',
              borderColor: 'var(--border)',
              minWidth: '100%',
            }}
          >
            <div className="py-3 px-3" />
            {fields.map(field => (
              <div
                key={field.name}
                className="flex items-center gap-1 px-3 py-3 text-xs font-bold uppercase tracking-wider"
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

          {/* Data rows */}
          <AnimatePresence>
            {records.map((record, index) => (
              <ResultRow
                key={String(record.id ?? index)}
                record={record}
                fields={fields}
                index={index}
                isExpanded={expandedRows.has(String(record.id ?? index))}
                onToggleExpand={() => toggleRow(String(record.id ?? index))}
                gridCols={gridCols}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {!isExecuting && executionResult && totalPages > 1 && (
        <div
          className="flex items-center justify-between px-5 py-3 border-t text-xs"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
        >
          <span style={{ color: 'var(--text-muted)' }}>
            Page {page} of {totalPages} · {totalCount} total
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => handlePageChange(1)} disabled={page === 1}
              className="p-1 rounded disabled:opacity-30" style={{ color: 'var(--text-muted)' }}>
              <ChevronsLeft size={13} />
            </button>
            <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}
              className="p-1 rounded disabled:opacity-30" style={{ color: 'var(--text-muted)' }}>
              <ChevronLeft size={13} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className="w-7 h-7 rounded text-xs transition-all duration-150"
                  style={{
                    background: page === pageNum ? 'var(--accent)' : 'transparent',
                    color: page === pageNum ? 'var(--accent-fg)' : 'var(--text-muted)',
                    border: page === pageNum ? 'none' : '1px solid transparent',
                  }}
                >
                  {pageNum}
                </button>
              )
            })}
            <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}
              className="p-1 rounded disabled:opacity-30" style={{ color: 'var(--text-muted)' }}>
              <ChevronRight size={13} />
            </button>
            <button onClick={() => handlePageChange(totalPages)} disabled={page === totalPages}
              className="p-1 rounded disabled:opacity-30" style={{ color: 'var(--text-muted)' }}>
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