// components/results/ResultRow.tsx
'use client'

import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { SchemaField } from '@/types/query'

interface ResultRowProps {
  record: Record<string, unknown>
  fields: SchemaField[]
  index: number
  isExpanded: boolean
  onToggleExpand: () => void
  gridCols: string
}

const CellValue = memo(({ value, fieldType }: { value: unknown; fieldType: string }) => {
  if (value === null || value === undefined) {
    return <span className="text-xs italic" style={{ color: 'var(--text-muted)' }}>null</span>
  }

  if (fieldType === 'boolean') {
    return (
      <span
        className="text-xs px-2 py-0.5 rounded font-mono uppercase tracking-wider"
        style={{
          background: value ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          color: value ? '#10b981' : '#ef4444',
          border: `1px solid ${value ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
          fontSize: '10px',
        }}
      >
        {String(value)}
      </span>
    )
  }

  if (fieldType === 'enum') {
    const enumColors: Record<string, { bg: string; color: string; border: string }> = {
      active:       { bg: 'rgba(16,185,129,0.1)',  color: '#10b981', border: 'rgba(16,185,129,0.25)' },
      inactive:     { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444', border: 'rgba(239,68,68,0.25)' },
      banned:       { bg: 'rgba(239,68,68,0.15)',  color: '#dc2626', border: 'rgba(239,68,68,0.3)' },
      pending:      { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
      in_stock:     { bg: 'rgba(16,185,129,0.1)',  color: '#10b981', border: 'rgba(16,185,129,0.25)' },
      out_of_stock: { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444', border: 'rgba(239,68,68,0.25)' },
      discontinued: { bg: 'rgba(107,114,128,0.1)', color: '#6b7280', border: 'rgba(107,114,128,0.25)' },
      delivered:    { bg: 'rgba(16,185,129,0.1)',  color: '#10b981', border: 'rgba(16,185,129,0.25)' },
      shipped:      { bg: 'rgba(59,130,246,0.1)',  color: '#3b82f6', border: 'rgba(59,130,246,0.25)' },
      processing:   { bg: 'rgba(245,158,11,0.1)',  color: '#f59e0b', border: 'rgba(245,158,11,0.25)' },
      cancelled:    { bg: 'rgba(239,68,68,0.1)',   color: '#ef4444', border: 'rgba(239,68,68,0.25)' },
      refunded:     { bg: 'rgba(107,114,128,0.1)', color: '#6b7280', border: 'rgba(107,114,128,0.25)' },
    }
    const colors = enumColors[String(value).toLowerCase()] ?? {
      bg: 'rgba(107,114,128,0.1)', color: '#6b7280', border: 'rgba(107,114,128,0.25)',
    }
    return (
      <span
        className="text-xs px-2 py-0.5 rounded font-mono uppercase tracking-wider"
        style={{ background: colors.bg, color: colors.color, border: `1px solid ${colors.border}`, fontSize: '10px' }}
      >
        {String(value)}
      </span>
    )
  }

  if (fieldType === 'number') {
    return (
      <span className="text-xs font-mono" style={{ color: 'var(--accent)' }}>
        {String(value)}
      </span>
    )
  }

  if (fieldType === 'date') {
    return (
      <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
        {String(value)}
      </span>
    )
  }

  if (fieldType === 'array' && Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {(value as string[]).slice(0, 2).map((item, i) => (
          <span
            key={i}
            className="text-xs px-1.5 py-0.5 rounded"
            style={{
              background: 'var(--bg-input)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border)',
              fontSize: '10px',
            }}
          >
            {String(item)}
          </span>
        ))}
        {(value as string[]).length > 2 && (
          <span className="text-xs" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
            +{(value as string[]).length - 2}
          </span>
        )}
      </div>
    )
  }

  return (
    <span
      className="text-xs block truncate"
      style={{ color: 'var(--text)', maxWidth: '150px' }}
      title={String(value)}
    >
      {String(value)}
    </span>
  )
})

CellValue.displayName = 'CellValue'

const ResultRow = memo(({
  record,
  fields,
  index,
  isExpanded,
  onToggleExpand,
  gridCols,
}: ResultRowProps) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.15, delay: index * 0.02 }}
        className="grid border-b cursor-pointer transition-colors duration-150 w-full"
        style={{
          gridTemplateColumns: gridCols,
          borderColor: 'var(--border)',
          background: isExpanded
            ? 'var(--bg-hover)'
            : index % 2 === 0
              ? 'var(--bg-card)'
              : 'var(--bg-surface)',
        }}
        onClick={onToggleExpand}
        role="row"
        aria-expanded={isExpanded}
      >
        {/* Expand toggle */}
        <div className="flex items-center justify-center py-3">
          <span style={{ color: 'var(--text-muted)' }}>
            {isExpanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          </span>
        </div>

        {/* Cells */}
        {fields.map(field => (
          <div key={field.name} className="px-3 py-3 flex items-center min-w-0">
            <CellValue value={record[field.name]} fieldType={field.type} />
          </div>
        ))}
      </motion.div>

      {/* Expanded detail */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden border-b w-full"
            style={{ borderColor: 'var(--border)' }}
          >
            <div
              className="px-6 py-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
              style={{ background: 'var(--bg-input)' }}
            >
              {fields.map(field => (
                <div key={field.name} className="flex flex-col gap-1">
                  <span
                    className="text-xs uppercase tracking-widest"
                    style={{ color: 'var(--text-muted)', fontSize: '9px' }}
                  >
                    {field.name}
                  </span>
                  <CellValue value={record[field.name]} fieldType={field.type} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
})

ResultRow.displayName = 'ResultRow'

export default ResultRow