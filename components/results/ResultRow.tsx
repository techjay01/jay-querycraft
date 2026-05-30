// components/results/ResultRow.tsx
'use client'

import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { SchemaField } from '@/types/query'
import { clsx } from 'clsx'

// ============================================
// PROPS
// ============================================

interface ResultRowProps {
  record: Record<string, unknown>
  fields: SchemaField[]
  index: number
  isExpanded: boolean
  onToggleExpand: () => void
}

// ============================================
// CELL VALUE RENDERER
// ============================================

const CellValue = memo(({
  value,
  fieldType,
}: {
  value: unknown
  fieldType: string
}) => {
  if (value === null || value === undefined) {
    return (
      <span
        className="text-xs italic"
        style={{ color: 'var(--text-muted)' }}
      >
        null
      </span>
    )
  }

  if (fieldType === 'boolean') {
    return (
      <span
        className="text-xs px-1.5 py-0.5 rounded font-mono"
        style={{
          background: value
            ? 'rgba(16, 185, 129, 0.1)'
            : 'rgba(239, 68, 68, 0.1)',
          color: value
            ? 'var(--accent-success)'
            : 'var(--accent-error)',
          border: `1px solid ${value
            ? 'rgba(16, 185, 129, 0.25)'
            : 'rgba(239, 68, 68, 0.25)'}`,
        }}
      >
        {String(value)}
      </span>
    )
  }

  if (fieldType === 'enum') {
    return (
      <span
        className="text-xs px-1.5 py-0.5 rounded"
        style={{
          background: 'rgba(124, 58, 237, 0.1)',
          color: 'var(--accent-secondary)',
          border: '1px solid rgba(124, 58, 237, 0.25)',
        }}
      >
        {String(value)}
      </span>
    )
  }

  if (fieldType === 'number') {
    return (
      <span
        className="text-xs font-mono"
        style={{ color: 'var(--accent-warning)' }}
      >
        {String(value)}
      </span>
    )
  }

  if (fieldType === 'date') {
    return (
      <span
        className="text-xs font-mono"
        style={{ color: 'var(--accent-primary)' }}
      >
        {String(value)}
      </span>
    )
  }

  if (fieldType === 'array' && Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {(value as string[]).slice(0, 3).map((item, i) => (
          <span
            key={i}
            className="text-xs px-1 py-0.5 rounded"
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-primary)',
              fontSize: '10px',
            }}
          >
            {String(item)}
          </span>
        ))}
        {(value as string[]).length > 3 && (
          <span
            className="text-xs px-1 py-0.5 rounded"
            style={{
              color: 'var(--text-muted)',
              fontSize: '10px',
            }}
          >
            +{(value as string[]).length - 3}
          </span>
        )}
      </div>
    )
  }

  return (
    <span
      className="text-xs truncate max-w-37.5 block"
      style={{ color: 'var(--text-primary)' }}
      title={String(value)}
    >
      {String(value)}
    </span>
  )
})

CellValue.displayName = 'CellValue'

// ============================================
// RESULT ROW
// ============================================

const ResultRow = memo(({
  record,
  fields,
  index,
  isExpanded,
  onToggleExpand,
}: ResultRowProps) => {
  return (
    <>
      {/* Main row */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.15, delay: index * 0.03 }}
        className={clsx(
          'flex items-center border-b cursor-pointer',
          'transition-colors duration-150',
        )}
        style={{
          borderColor: 'var(--border-primary)',
          background: isExpanded
            ? 'var(--bg-hover)'
            : index % 2 === 0
              ? 'var(--bg-card)'
              : 'var(--bg-secondary)',
          minWidth: 'max-content',
          width: '100%',
        }}
        onClick={onToggleExpand}
        role="row"
        aria-expanded={isExpanded}
      >
        {/* Expand toggle */}
        <div className="w-8 shrink-0 flex items-center justify-center py-2">
          <span style={{ color: 'var(--text-muted)' }}>
            {isExpanded
              ? <ChevronDown size={11} />
              : <ChevronRight size={11} />
            }
          </span>
        </div>

        {/* Cells */}
        {fields.map(field => (
          <div
            key={field.name}
            className="px-3 py-2 min-w-30 shrink-0"
          >
            <CellValue
              value={record[field.name]}
              fieldType={field.type}
            />
          </div>
        ))}
      </motion.div>

      {/* Expanded detail panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden border-b"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <div
              className="px-4 py-3 grid grid-cols-2 gap-2"
              style={{ background: 'var(--bg-tertiary)' }}
            >
              {fields.map(field => (
                <div
                  key={field.name}
                  className="flex flex-col gap-0.5"
                >
                  <span
                    className="text-xs font-mono"
                    style={{
                      color: 'var(--text-muted)',
                      fontSize: '10px',
                    }}
                  >
                    {field.name}
                  </span>
                  <CellValue
                    value={record[field.name]}
                    fieldType={field.type}
                  />
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