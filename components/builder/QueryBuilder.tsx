// components/builder/QueryBuilder.tsx
'use client'

import { useCallback, useRef, useState, useEffect } from 'react'
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
  const [showPresetModal, setShowPresetModal] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [presetDescription, setPresetDescription] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const hasErrors = validationErrors.some(e => e.severity === 'error')
  const hasWarnings = validationErrors.some(e => e.severity === 'warning')
  const isValid = validationErrors.length === 0

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
        setPresetName('')
        setPresetDescription('')
        setShowPresetModal(false)
        }
    }

    window.addEventListener('keydown', handleEsc)

    return () => {
        window.removeEventListener('keydown', handleEsc)
    }
  }, [])

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
//   const handleSavePreset = useCallback(() => {
//     if (!selectedSchema) return
//     const name = prompt('Enter preset name:')
//     if (!name?.trim()) return
//     const description = prompt('Enter preset description (optional):') ?? ''
//     savePreset(name.trim(), description, rootGroup, selectedSchema.id)
//   }, [rootGroup, selectedSchema, savePreset])

    const handleSavePreset = useCallback(() => {
    if (!selectedSchema) return

    if (!presetName.trim()) return

    savePreset(
        presetName.trim(),
        presetDescription.trim(),
        rootGroup,
        selectedSchema.id
    )

    setPresetName('')
    setPresetDescription('')
    setShowPresetModal(false)
    }, [
    presetName,
    presetDescription,
    rootGroup,
    selectedSchema,
    savePreset,
    ])

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
    <div
        className="flex flex-col gap-3 rounded-xl border p-5"
        style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border)',
        }}
    >

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
            background: 'var(--accent-subtle)',
            borderColor: 'var(--accent-border)',
            color: 'var(--accent)',
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
      <div className="flex flex-col gap-3">
        <ConditionGroup
          group={rootGroup}
          depth={0}
          fields={selectedSchema.fields}
          validationErrors={validationErrors}
        />
      </div>

      {/* Bottom actions */}
        <div
            className="
                flex flex-row
                items-start sm:items-center
                gap-3
                pt-4 mt-2
            "
            style={{
                borderTop: '1px solid var(--border)',
            }}
        >
            <button
                onClick={handleValidate}
                className="
text-xs px-3 py-1.5 rounded border
uppercase tracking-wider
transition-all duration-200
hover:bg-(--bg-hover)
hover:text-(--text)
hover:border-(--border-light)
hover:-translate-y-px
active:translate-y-0
active:scale-[0.98]
"
                style={{
                background: 'var(--bg-input)',
                borderColor: 'var(--border)',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                }}
            >
                Validate Query
            </button>

            <div className="flex flex-1" />

            {isDirty && (
                <button
                onClick={() => {
                setPresetName('')
                setPresetDescription('')
                setShowPresetModal(true)
                }}
                className="
text-xs px-3 py-1.5 rounded border
uppercase tracking-wider
transition-all duration-200
hover:bg-(--accent)
hover:text-(--accent-fg)
hover:border-(--accent)
hover:-translate-y-px
active:translate-y-0
active:scale-[0.98]
"
                style={{
                    background: 'var(--bg-input)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                }}
                >
                Save as Preset
                </button>
            )}

        </div>

        {showPresetModal && (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            }}
            onClick={() => {
                setPresetName('')
                setPresetDescription('')
                setShowPresetModal(false)
            }}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-xl border p-5"
            style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border)',
            }}
            >
                <h3
                    className="text-sm font-bold uppercase tracking-wider mb-4"
                    style={{ color: 'var(--text)' }}
                >
                    Save Preset
                </h3>

                <div className="flex flex-col gap-3">
                    <input
                    value={presetName}
                    onChange={e => setPresetName(e.target.value)}
                    placeholder="Preset name"
                    className="px-3 py-2 rounded border text-sm"
                    style={{
                        background: 'var(--bg-input)',
                        borderColor: 'var(--border)',
                        color: 'var(--text)',
                    }}
                    />

                    <textarea
                    value={presetDescription}
                    onChange={e => setPresetDescription(e.target.value)}
                    placeholder="Description (optional)"
                    rows={3}
                    className="px-3 py-2 rounded border text-sm resize-none"
                    style={{
                        background: 'var(--bg-input)',
                        borderColor: 'var(--border)',
                        color: 'var(--text)',
                    }}
                    />
                </div>

                <div className="flex justify-end gap-2 mt-5">
                    <button
                        onClick={() => setShowPresetModal(false)}
                        className="
                            px-3 py-2 rounded border text-xs uppercase tracking-wider
                            transition-all duration-200
                            hover:bg-(--bg-hover)
                            hover:text-(--text)
                            hover:border-(--border-light)
                            hover:-translate-y-px
                            active:translate-y-0
                            active:scale-[0.98]
                        "
                        style={{
                            borderColor: 'var(--border)',
                            color: 'var(--text-secondary)',
                            background: 'var(--bg-input)',
                        }}
                        >
                        Cancel
                    </button>

                    <button
                    onClick={handleSavePreset}
                    disabled={!presetName.trim()}
                    className="
                        px-3 py-2 rounded text-xs uppercase tracking-wider font-bold
                        transition-all duration-200
                        hover:-translate-y-px
                        hover:brightness-110
                        active:translate-y-0
                        active:scale-[0.98]
                        disabled:opacity-50
                        disabled:cursor-not-allowed
                        disabled:hover:translate-y-0
                    "
                    style={{
                        background: 'var(--accent)',
                        color: 'var(--accent-fg)',
                    }}
                    >
                    Save
                    </button>
                </div>
            </motion.div>
        </div>
        )}

    </div>
  )
}