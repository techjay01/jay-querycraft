// components/builder/AddRuleBar.tsx
'use client'

import { memo } from 'react'
import { Plus, PlusSquare, RotateCcw, Play, Download, Upload } from 'lucide-react'
import { useQueryStore } from '@/store/queryStore'
import { clsx } from 'clsx'

// ============================================
// PROPS
// ============================================

interface AddRuleBarProps {
  onExport: () => void
  onImport: () => void
}

// ============================================
// ADD RULE BAR
// ============================================

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
  const totalConditions = rootGroup.children.length

  return (
    <div
      className="flex items-center gap-2 px-4 py-3 rounded-lg border flex-wrap"
      style={{
        background: 'var(--bg-secondary)',
        borderColor: 'var(--border-primary)',
      }}
    >
      {/* Left — add actions */}
      <div className="flex items-center gap-2">
        {/* Add rule to root */}
        <button
          onClick={() => addRule(rootGroup.id)}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium',
            'transition-all duration-200 hover:scale-105'
          )}
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--accent-success)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
          }}
          title="Add rule to root group"
        >
          <Plus size={13} />
          Add Rule
        </button>

        {/* Add group to root */}
        <button
          onClick={() => addGroup(rootGroup.id)}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium',
            'transition-all duration-200 hover:scale-105'
          )}
          style={{
            background: 'rgba(124, 58, 237, 0.1)',
            color: 'var(--accent-secondary)',
            border: '1px solid rgba(124, 58, 237, 0.25)',
          }}
          title="Add nested group to root"
        >
          <PlusSquare size={13} />
          Add Group
        </button>
      </div>

      {/* Divider */}
      <div
        className="w-px h-5 shrink-0"
        style={{ background: 'var(--border-primary)' }}
      />

      {/* Middle — import/export */}
      <div className="flex items-center gap-2">
        <button
          onClick={onExport}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium',
            'transition-all duration-200 hover:scale-105'
          )}
          style={{
            background: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-primary)',
          }}
          title="Export query as JSON"
        >
          <Download size={13} />
          Export
        </button>

        <button
          onClick={onImport}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium',
            'transition-all duration-200 hover:scale-105'
          )}
          style={{
            background: 'var(--bg-tertiary)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-primary)',
          }}
          title="Import query from JSON"
        >
          <Upload size={13} />
          Import
        </button>
      </div>

      {/* Divider */}
      <div
        className="w-px h-5 shrink-0"
        style={{ background: 'var(--border-primary)' }}
      />

      {/* Condition count */}
      <span
        className="text-xs shrink-0"
        style={{ color: 'var(--text-muted)' }}
      >
        {totalConditions} root {totalConditions === 1 ? 'condition' : 'conditions'}
      </span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right — reset + execute */}
      <div className="flex items-center gap-2">
        {/* Reset */}
        <button
          onClick={resetQuery}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium',
            'transition-all duration-200 hover:scale-105'
          )}
          style={{
            background: 'var(--bg-tertiary)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-primary)',
          }}
          title="Reset query (Ctrl+Shift+R)"
        >
          <RotateCcw size={13} />
          Reset
        </button>

        {/* Execute */}
        <button
          onClick={handleExecute}
          disabled={isExecuting || hasErrors}
          className={clsx(
            'flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-bold',
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
            border: hasErrors
              ? '1px solid rgba(239,68,68,0.3)'
              : '1px solid rgba(0, 212, 255, 0.3)',
            boxShadow: !hasErrors && !isExecuting
              ? '0 0 12px rgba(0, 212, 255, 0.15)'
              : 'none',
          }}
          title="Execute query (Ctrl+Enter)"
        >
          {isExecuting ? (
            <>
              <div
                className="w-3 h-3 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--accent-primary)', borderTopColor: 'transparent' }}
              />
              Running...
            </>
          ) : (
            <>
              <Play size={13} />
              Run Query
            </>
          )}
        </button>
      </div>
    </div>
  )
})

AddRuleBar.displayName = 'AddRuleBar'

export default AddRuleBar