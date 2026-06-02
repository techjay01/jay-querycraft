// components/builder/AddRuleBar.tsx
'use client'

import { memo } from 'react'
import { Plus, FolderPlus, RotateCcw, Play, Download, Upload } from 'lucide-react'
import { useQueryStore } from '@/store/queryStore'

interface AddRuleBarProps {
  onExport: () => void
  onImport: () => void
}

const AddRuleBar = memo(({ onExport, onImport }: AddRuleBarProps) => {
  const {
    rootGroup,
    addRule,
    addGroup,
    resetQuery,
    executeQueryTree,
    isExecuting,
    validateQueryTree,
    validationErrors,
  } = useQueryStore()

  const handleExecute = () => {
    validateQueryTree()
    executeQueryTree()
  }

  const hasErrors = validationErrors.some(e => e.severity === 'error')

  const btnBase: React.CSSProperties = {
    background: 'var(--bg-input)',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
    fontFamily: 'var(--font-mono)',
  }

  return (
    <div
      className="flex items-center gap-2 px-5 py-3.5 rounded-lg border flex-wrap"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Left — Add actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => addRule(rootGroup.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs
            uppercase tracking-wider font-medium transition-colors duration-150"
          style={btnBase}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--accent-border)'
            e.currentTarget.style.color = 'var(--accent)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
            title="Add Rule"
        >
          <Plus size={12} />
        </button>

        <button
          onClick={() => addGroup(rootGroup.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs
            uppercase tracking-wider font-medium transition-colors duration-150"
          style={btnBase}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--accent-border)'
            e.currentTarget.style.color = 'var(--accent)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
          title="Add Group"
        >
          <FolderPlus size={12} />
        </button>
      </div>

      {/* Import / Export */}
      <div className="flex items-center gap-2">
        <button
          onClick={onExport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs
            uppercase tracking-wider font-medium transition-colors duration-150"
          style={btnBase}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
            title="Export query to JSON file"
        >
          <Download size={12} />
        </button>

        <button
          onClick={onImport}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs
            uppercase tracking-wider font-medium transition-colors duration-150"
          style={btnBase}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
          title="Import query from JSON file"
        >
          <Upload size={12} />
        </button>
      </div>

      {/* Reset */}
      <button
        onClick={resetQuery}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs
          uppercase tracking-wider font-medium transition-colors duration-150"
        style={btnBase}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-secondary)')}
        title="Reset query (Ctrl+Shift+R)"
      >
        <RotateCcw size={12} />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Run Query — solid accent */}
      <button
        onClick={handleExecute}
        disabled={isExecuting || hasErrors}
        className="flex items-center gap-1.5 px-4 py-1.5 rounded text-xs
          uppercase tracking-wider font-bold transition-all duration-150
          disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: hasErrors ? 'var(--danger-subtle)' : 'var(--accent)',
          color: hasErrors ? 'var(--danger)' : 'var(--accent-fg)',
          border: hasErrors ? '1px solid var(--danger-border)' : 'none',
          fontFamily: 'var(--font-mono)',
        }}
        title="Run Query (Ctrl+Enter)"
      >
        {isExecuting ? (
          <>
            <div
              className="w-3 h-3 rounded-full border-2 animate-spin"
              style={{
                borderColor: 'var(--accent-fg)',
                borderTopColor: 'transparent',
              }}
            />
            Running...
          </>
        ) : (
          <>
            <Play size={12} />
            Run Query
          </>
        )}
      </button>
    </div>
  )
})

AddRuleBar.displayName = 'AddRuleBar'

export default AddRuleBar