// components/schema/SchemaSelector.tsx
'use client'

import { memo, useState } from 'react'
import { motion } from 'framer-motion'
import { Database, Table, Hash, Type, Calendar, ToggleLeft, List } from 'lucide-react'
import { DataSchema, FieldType } from '@/types/query'
import { MOCK_SCHEMAS } from '@/lib/schemas'
import { useQueryStore } from '@/store/queryStore'
import { clsx } from 'clsx'

// ============================================
// FIELD TYPE ICONS
// ============================================

const FIELD_TYPE_ICONS: Record<FieldType, React.ReactNode> = {
  string: <Type size={11} />,
  number: <Hash size={11} />,
  boolean: <ToggleLeft size={11} />,
  date: <Calendar size={11} />,
  enum: <List size={11} />,
  array: <List size={11} />,
}

const FIELD_TYPE_COLORS: Record<FieldType, string> = {
  string: 'var(--accent-primary)',
  number: 'var(--accent-secondary)',
  boolean: 'var(--accent-success)',
  date: 'var(--accent-warning)',
  enum: '#f472b6',
  array: '#f472b6',
}

// ============================================
// SCHEMA CARD
// ============================================

const SchemaCard = memo(({
  schema,
  isSelected,
  onSelect,
}: {
  schema: DataSchema
  isSelected: boolean
  onSelect: () => void
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onSelect}
      className={clsx(
        'w-full text-left p-3 rounded-lg border transition-all duration-200',
      )}
      style={{
        background: isSelected
          ? 'rgba(0, 212, 255, 0.06)'
          : 'var(--bg-card)',
        borderColor: isSelected
          ? 'rgba(0, 212, 255, 0.35)'
          : 'var(--border-primary)',
        boxShadow: isSelected
          ? '0 0 12px rgba(0, 212, 255, 0.08)'
          : 'none',
      }}
      aria-pressed={isSelected}
      aria-label={`Select ${schema.name} schema`}
    >
      {/* Schema header */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-6 h-6 rounded flex items-center justify-center shrink-0"
          style={{
            background: isSelected
              ? 'rgba(0, 212, 255, 0.12)'
              : 'var(--bg-tertiary)',
            border: `1px solid ${isSelected
              ? 'rgba(0, 212, 255, 0.3)'
              : 'var(--border-primary)'}`,
          }}
        >
          <Database
            size={12}
            style={{
              color: isSelected
                ? 'var(--accent-primary)'
                : 'var(--text-muted)',
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-xs font-semibold truncate"
            style={{
              color: isSelected
                ? 'var(--accent-primary)'
                : 'var(--text-primary)',
            }}
          >
            {schema.name}
          </p>
          <p
            className="text-xs truncate"
            style={{ color: 'var(--text-muted)', fontSize: '10px' }}
          >
            {schema.fields.length} fields
          </p>
        </div>

        {isSelected && (
          <div
            className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse-glow"
            style={{ background: 'var(--accent-primary)' }}
          />
        )}
      </div>

      {/* Field list */}
      <div className="flex flex-wrap gap-1">
        {schema.fields.slice(0, 6).map(field => (
          <span
            key={field.name}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs"
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-secondary)',
              color: FIELD_TYPE_COLORS[field.type],
              fontSize: '10px',
            }}
          >
            {FIELD_TYPE_ICONS[field.type]}
            {field.label}
          </span>
        ))}
        {schema.fields.length > 6 && (
          <span
            className="px-1.5 py-0.5 rounded text-xs"
            style={{
              background: 'var(--bg-tertiary)',
              color: 'var(--text-muted)',
              fontSize: '10px',
            }}
          >
            +{schema.fields.length - 6} more
          </span>
        )}
      </div>
    </motion.button>
  )
})

SchemaCard.displayName = 'SchemaCard'

// ============================================
// SCHEMA DETAIL PANEL
// ============================================

const SchemaDetail = memo(({ schema }: { schema: DataSchema }) => {
  return (
    <div
      className="rounded-lg border p-3"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-primary)',
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Table size={13} style={{ color: 'var(--accent-primary)' }} />
        <span
          className="text-xs font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {schema.name} Schema
        </span>
        <span
          className="text-xs px-1.5 py-0.5 rounded ml-auto"
          style={{
            background: 'var(--bg-tertiary)',
            color: 'var(--text-muted)',
            fontSize: '10px',
          }}
        >
          {schema.fields.length} fields
        </span>
      </div>

      {/* Field table */}
      <div className="flex flex-col gap-1">
        {schema.fields.map(field => (
          <div
            key={field.name}
            className="flex items-center gap-2 px-2 py-1.5 rounded"
            style={{ background: 'var(--bg-tertiary)' }}
          >
            {/* Type icon */}
            <span style={{ color: FIELD_TYPE_COLORS[field.type] }}>
              {FIELD_TYPE_ICONS[field.type]}
            </span>

            {/* Field name */}
            <span
              className="text-xs font-mono flex-1"
              style={{ color: 'var(--text-primary)', fontSize: '11px' }}
            >
              {field.name}
            </span>

            {/* Field label */}
            <span
              className="text-xs"
              style={{ color: 'var(--text-muted)', fontSize: '10px' }}
            >
              {field.label}
            </span>

            {/* Type badge */}
            <span
              className="text-xs px-1.5 py-0.5 rounded font-mono"
              style={{
                background: 'var(--bg-secondary)',
                color: FIELD_TYPE_COLORS[field.type],
                border: `1px solid ${FIELD_TYPE_COLORS[field.type]}30`,
                fontSize: '10px',
              }}
            >
              {field.type}
            </span>

            {/* Enum options count */}
            {field.enumOptions && (
              <span
                className="text-xs"
                style={{ color: 'var(--text-muted)', fontSize: '10px' }}
              >
                {field.enumOptions.length} opts
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
})

SchemaDetail.displayName = 'SchemaDetail'

// ============================================
// SCHEMA SELECTOR — MAIN COMPONENT
// ============================================

const SchemaSelector = memo(() => {
  const { selectedSchema, setSchema } = useQueryStore()
  const [showDetail, setShowDetail] = useState(false)

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className="w-1.5 h-5 rounded-full"
          style={{ background: 'var(--accent-primary)' }}
        />
        <h2
          className="text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          Data Source
        </h2>
        <div className="flex-1" />
        {selectedSchema && (
          <button
            onClick={() => setShowDetail(p => !p)}
            className="text-xs px-2 py-1 rounded border transition-all duration-200"
            style={{
              background: showDetail
                ? 'rgba(0, 212, 255, 0.08)'
                : 'var(--bg-tertiary)',
              borderColor: showDetail
                ? 'rgba(0, 212, 255, 0.25)'
                : 'var(--border-primary)',
              color: showDetail
                ? 'var(--accent-primary)'
                : 'var(--text-muted)',
            }}
          >
            {showDetail ? 'Hide' : 'Show'} fields
          </button>
        )}
      </div>

      {/* Schema cards */}
      <div className="flex flex-col gap-3">
        {MOCK_SCHEMAS.map(schema => (
          <SchemaCard
            key={schema.id}
            schema={schema}
            isSelected={selectedSchema?.id === schema.id}
            onSelect={() => setSchema(schema.id)}
          />
        ))}
      </div>

      {/* Schema detail */}
      {showDetail && selectedSchema && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <SchemaDetail schema={selectedSchema} />
        </motion.div>
      )}
    </div>
  )
})

SchemaSelector.displayName = 'SchemaSelector'

export default SchemaSelector