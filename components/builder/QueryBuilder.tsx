// components/builder/QueryBuilder.tsx
'use client'

import { useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useQueryStore } from '@/store/queryStore'
import { useHistoryStore } from '@/store/historyStore'
import ConditionGroup from './ConditionGroup'
import AddRuleBar from './AddRuleBar'
import { QueryGroup } from '@/types/query'
import { clsx } from 'clsx'

// ============================================
// QUERY BUILDER — ROOT COMPONENT
// ============================================

export default function QueryBuilder() {
  const {
    rootGroup,
    selectedSchema,
    validationErrors,
    isDirty,
    importQuery,
    exportQuery,
    validateQueryTree,
  } = useQueryStore()

  const { savePreset } = useHistoryStore()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const hasErrors = validationErrors.some(e => e.severity === 'error')
  const hasWarnings = validationErrors.some(e => e.severity === 'warning')
  const isValid = validationErrors.length === 0

  // ── Export query as JSON file
  const handleExport = useCallback(() => {
    const query = exportQuery()
    const json = JSON.stringify(query, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `querycraft-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [exportQuery])

  // ── Import query from JSON file
  const handleImport = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)

        // Validate structure before importing
        if (!json.id || !json.type || json.type !== 'group' || !Array.isArray(json.children)) {
          alert('Invalid query file. Please import a valid QueryCraft JSON file.')
          return
        }

        importQuery(json as QueryGroup)
      } catch {
        alert('Failed to parse JSON file. Please check the file and try again.')
      }
    }
    reader.readAsText(file)

    // Reset input so same file can be re-imported
    e.target.value = ''
  }, [importQuery])

  // ── Save as preset
  const handleSavePreset = useCallback(() => {
    if (!selectedSchema) return
    const name = prompt('Enter preset name:')
    if (!name?.trim()) return
    const description = prompt('Enter preset description (optional):') ?? ''
    savePreset(name.trim(), description, rootGroup, selectedSchema.id)
  }, [rootGroup, selectedSchema, savePreset])

  // ── Validate on demand
  const handleValidate = useCallback(() => {
    validateQueryTree()
  }, [validateQueryTree])

  if (!selectedSchema) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 rounded-lg border border-dashed"
        style={{
          borderColor: 'var(--border-primary)',
          color: 'var(--text-muted)',
        }}
      >
        <p className="text-sm">Select a schema to start building your query</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Validation status bar */}
      {validationErrors.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className={clsx(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs',
          )}
          style={{
            background: hasErrors
              ? 'rgba(239,68,68,0.06)'
              : 'rgba(245,158,11,0.06)',
            borderColor: hasErrors
              ? 'rgba(239,68,68,0.25)'
              : 'rgba(245,158,11,0.25)',
            color: hasErrors
              ? 'var(--accent-error)'
              : 'var(--accent-warning)',
          }}
        >
          <AlertTriangle size={13} />
          <span>
            {hasErrors
              ? `${validationErrors.filter(e => e.severity === 'error').length} error${validationErrors.filter(e => e.severity === 'error').length !== 1 ? 's' : ''} found — fix before running`
              : `${validationErrors.filter(e => e.severity === 'warning').length} warning${hasWarnings ? 's' : ''}`
            }
          </span>
          <div className="flex-1" />
          <span style={{ color: 'var(--text-muted)' }}>
            {validationErrors.map(e => e.message).slice(0, 2).join(' · ')}
            {validationErrors.length > 2 && ` · +${validationErrors.length - 2} more`}
          </span>
        </motion.div>
      )}

      {/* Valid state */}
      {isValid && isDirty && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs"
          style={{
            background: 'rgba(16,185,129,0.06)',
            borderColor: 'rgba(16,185,129,0.25)',
            color: 'var(--accent-success)',
          }}
        >
          <CheckCircle2 size={13} />
          <span>Query looks valid — ready to run</span>
        </motion.div>
      )}

      {/* Action bar */}
      <AddRuleBar
        onExport={handleExport}
        onImport={handleImport}
      />

      {/* Hidden file input for import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Import query JSON file"
      />

      {/* Recursive condition group tree */}
      <div className="flex flex-col gap-2">
        <ConditionGroup
          group={rootGroup}
          depth={0}
          fields={selectedSchema.fields}
          validationErrors={validationErrors}
        />
      </div>

      {/* Bottom actions */}
      <div className="flex items-center gap-2 pt-1">
        {/* Validate button */}
        <button
          onClick={handleValidate}
          className="text-xs px-3 py-1.5 rounded border transition-all duration-200 hover:scale-105"
          style={{
            background: 'var(--bg-tertiary)',
            borderColor: 'var(--border-primary)',
            color: 'var(--text-secondary)',
          }}
        >
          Validate Query
        </button>

        {/* Save as preset */}
        {isDirty && (
          <motion.button
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleSavePreset}
            className="text-xs px-3 py-1.5 rounded border transition-all duration-200 hover:scale-105"
            style={{
              background: 'rgba(124, 58, 237, 0.08)',
              borderColor: 'rgba(124, 58, 237, 0.25)',
              color: 'var(--accent-secondary)',
            }}
          >
            Save as Preset
          </motion.button>
        )}

        <div className="flex-1" />

        {/* Keyboard shortcut hint */}
        <span
          className="text-xs hidden sm:block"
          style={{ color: 'var(--text-muted)' }}
        >
          <kbd
            className="px-1.5 py-0.5 rounded text-xs"
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-primary)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            Ctrl+Enter
          </kbd>
          {' '}to run
        </span>
      </div>
    </div>
  )
}