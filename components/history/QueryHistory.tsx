// components/history/QueryHistory.tsx
'use client'

import { memo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  History,
  Trash2,
  RotateCcw,
  BookMarked,
  Clock,
  Database,
  ChevronDown,
  ChevronRight,
  X,
  Save,
} from 'lucide-react'
import { useHistoryStore } from '@/store/historyStore'
import { useQueryStore } from '@/store/queryStore'
import { QueryHistoryEntry, QueryPreset } from '@/types/query'
import { clsx } from 'clsx'

// ============================================
// HELPERS
// ============================================

const formatTime = (timestamp: number): string => {
  const diff = Date.now() - timestamp
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const FORMAT_COLORS: Record<string, string> = {
  sql: 'var(--accent-primary)',
  mongodb: 'var(--accent-success)',
  graphql: '#f472b6',
}

// ============================================
// HISTORY ENTRY ITEM
// ============================================

const HistoryItem = memo(({
  entry,
  onRestore,
  onDelete,
}: {
  entry: QueryHistoryEntry
  onRestore: () => void
  onDelete: () => void
}) => {
  const [expanded, setExpanded] = useState(false)
  const ruleCount = entry.query.children.length

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      className="rounded-lg border overflow-hidden"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-primary)',
      }}
    >
      {/* Main row */}
      <div className="flex items-center gap-2 px-3 py-2">
        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(p => !p)}
          className="p-0.5 rounded transition-colors shrink-0"
          style={{ color: 'var(--text-muted)' }}
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded
            ? <ChevronDown size={12} />
            : <ChevronRight size={12} />
          }
        </button>

        {/* Schema icon */}
        <div
          className="w-5 h-5 rounded flex items-center justify-center shrink-0"
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-primary)',
          }}
        >
          <Database size={10} style={{ color: 'var(--text-muted)' }} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p
            className="text-xs font-medium truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {entry.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span
              className="text-xs font-mono"
              style={{
                color: FORMAT_COLORS[entry.format] ?? 'var(--text-muted)',
                fontSize: '10px',
              }}
            >
              {entry.format.toUpperCase()}
            </span>
            <span
              className="text-xs"
              style={{ color: 'var(--text-muted)', fontSize: '10px' }}
            >
              {ruleCount} condition{ruleCount !== 1 ? 's' : ''}
            </span>
            <span
              className="text-xs"
              style={{ color: 'var(--accent-success)', fontSize: '10px' }}
            >
              {entry.resultCount} results
            </span>
          </div>
        </div>

        {/* Time */}
        <div className="flex items-center gap-1 shrink-0">
          <Clock size={10} style={{ color: 'var(--text-muted)' }} />
          <span
            className="text-xs"
            style={{ color: 'var(--text-muted)', fontSize: '10px' }}
          >
            {formatTime(entry.timestamp)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onRestore}
            className="p-1 rounded transition-all duration-200 hover:scale-110"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            aria-label="Restore this query"
            title="Restore query"
          >
            <RotateCcw size={12} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded transition-all duration-200 hover:scale-110"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-error)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            aria-label="Delete this history entry"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Expanded — show query tree summary */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <div
              className="px-3 py-2 border-t"
              style={{
                borderColor: 'var(--border-primary)',
                background: 'var(--bg-tertiary)',
              }}
            >
              <p
                className="text-xs font-mono"
                style={{ color: 'var(--text-muted)', fontSize: '10px' }}
              >
                {entry.query.logicalOperator} group ·{' '}
                {entry.query.children.length} top-level conditions
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: 'var(--text-muted)', fontSize: '10px' }}
              >
                Schema: {entry.schema} · {new Date(entry.timestamp).toLocaleString()}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

HistoryItem.displayName = 'HistoryItem'

// ============================================
// PRESET ITEM
// ============================================

const PresetItem = memo(({
  preset,
  onLoad,
  onDelete,
}: {
  preset: QueryPreset
  onLoad: () => void
  onDelete: () => void
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-primary)',
      }}
    >
      {/* Icon */}
      <div
        className="w-5 h-5 rounded flex items-center justify-center shrink-0"
        style={{
          background: 'rgba(124, 58, 237, 0.1)',
          border: '1px solid rgba(124, 58, 237, 0.25)',
        }}
      >
        <BookMarked size={10} style={{ color: 'var(--accent-secondary)' }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-medium truncate"
          style={{ color: 'var(--text-primary)' }}
        >
          {preset.name}
        </p>
        {preset.description && (
          <p
            className="text-xs truncate"
            style={{ color: 'var(--text-muted)', fontSize: '10px' }}
          >
            {preset.description}
          </p>
        )}
      </div>

      {/* Schema badge */}
      <span
        className="text-xs px-1.5 py-0.5 rounded shrink-0"
        style={{
          background: 'var(--bg-tertiary)',
          color: 'var(--text-muted)',
          fontSize: '10px',
        }}
      >
        {preset.schemaId}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onLoad}
          className="p-1 rounded transition-all duration-200 hover:scale-110"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-secondary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          aria-label="Load preset"
          title="Load preset"
        >
          <RotateCcw size={12} />
        </button>
        <button
          onClick={onDelete}
          className="p-1 rounded transition-all duration-200 hover:scale-110"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-error)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
          aria-label="Delete preset"
          title="Delete"
        >
          <X size={12} />
        </button>
      </div>
    </motion.div>
  )
})

PresetItem.displayName = 'PresetItem'

// ============================================
// QUERY HISTORY — MAIN COMPONENT
// ============================================

const QueryHistory = memo(() => {
  const {
    history,
    presets,
    removeFromHistory,
    clearHistory,
    deletePreset,
  } = useHistoryStore()

  const { importQuery, setSchema } = useQueryStore()
  const [activeTab, setActiveTab] = useState<'history' | 'presets'>('history')

  const handleRestoreHistory = useCallback((entry: QueryHistoryEntry) => {
    setSchema(entry.schema)
    setTimeout(() => {
      importQuery(entry.query)
    }, 100)
  }, [setSchema, importQuery])

  const handleLoadPreset = useCallback((preset: QueryPreset) => {
    setSchema(preset.schemaId)
    setTimeout(() => {
      importQuery(preset.query)
    }, 100)
  }, [setSchema, importQuery])

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className="w-1.5 h-5 rounded-full"
          style={{ background: 'var(--accent-secondary)' }}
        />
        <h2
          className="text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          History & Presets
        </h2>
        <div className="flex-1" />
        {history.length > 0 && activeTab === 'history' && (
          <button
            onClick={clearHistory}
            className="text-xs px-2 py-1 rounded border transition-all duration-200"
            style={{
              background: 'var(--bg-tertiary)',
              borderColor: 'var(--border-primary)',
              color: 'var(--text-muted)',
            }}
            title="Clear all history"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Tabs */}
      <div
        className="flex rounded-lg p-1 gap-1"
        style={{ background: 'var(--bg-secondary)' }}
      >
        {[
          { value: 'history', label: 'History', icon: <History size={11} />, count: history.length },
          { value: 'presets', label: 'Presets', icon: <Save size={11} />, count: presets.length },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value as 'history' | 'presets')}
            className={clsx(
              'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs',
              'font-medium transition-all duration-200'
            )}
            style={{
              background: activeTab === tab.value
                ? 'var(--bg-card)'
                : 'transparent',
              color: activeTab === tab.value
                ? 'var(--text-primary)'
                : 'var(--text-muted)',
              boxShadow: activeTab === tab.value
                ? '0 1px 3px rgba(0,0,0,0.2)'
                : 'none',
            }}
          >
            {tab.icon}
            {tab.label}
            {tab.count > 0 && (
              <span
                className="px-1.5 py-0.5 rounded-full text-xs"
                style={{
                  background: activeTab === tab.value
                    ? 'var(--bg-tertiary)'
                    : 'transparent',
                  color: 'var(--text-muted)',
                  fontSize: '10px',
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'history' ? (
          <motion.div
            key="history"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-2"
          >
            {history.length === 0 ? (
              <div
                className="py-8 text-center rounded-lg border border-dashed"
                style={{
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-muted)',
                }}
              >
                <History
                  size={20}
                  className="mx-auto mb-2 opacity-30"
                />
                <p className="text-xs">No query history yet</p>
                <p className="text-xs mt-1 opacity-60">
                  Run a query to see it here
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {history.map(entry => (
                  <HistoryItem
                    key={entry.id}
                    entry={entry}
                    onRestore={() => handleRestoreHistory(entry)}
                    onDelete={() => removeFromHistory(entry.id)}
                  />
                ))}
              </AnimatePresence>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="presets"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-2"
          >
            {presets.length === 0 ? (
              <div
                className="py-8 text-center rounded-lg border border-dashed"
                style={{
                  borderColor: 'var(--border-primary)',
                  color: 'var(--text-muted)',
                }}
              >
                <BookMarked
                  size={20}
                  className="mx-auto mb-2 opacity-30"
                />
                <p className="text-xs">No saved presets</p>
                <p className="text-xs mt-1 opacity-60">
                  Build a query and click &quot;Save as Preset&quot;
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {presets.map(preset => (
                  <PresetItem
                    key={preset.id}
                    preset={preset}
                    onLoad={() => handleLoadPreset(preset)}
                    onDelete={() => deletePreset(preset.id)}
                  />
                ))}
              </AnimatePresence>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

QueryHistory.displayName = 'QueryHistory'

export default QueryHistory