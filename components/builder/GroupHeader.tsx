// components/builder/GroupHeader.tsx
'use client'

import { memo } from 'react'
import { ChevronDown, ChevronRight, Plus, PlusSquare, Trash2 } from 'lucide-react'
import { LogicalOperator } from '@/types/query'
import { clsx } from 'clsx'

// ============================================
// PROPS
// ============================================

interface GroupHeaderProps {
  groupId?: string
  logicalOperator: LogicalOperator
  collapsed: boolean
  depth: number
  isRoot: boolean
  childCount: number
  onToggleOperator: () => void
  onToggleCollapsed: () => void
  onAddRule: () => void
  onAddGroup: () => void
  onRemoveGroup: () => void
}

// ============================================
// DEPTH LABEL COLORS
// ============================================

const DEPTH_ACCENT_COLORS = [
  'var(--connector-color-0)',
  'var(--connector-color-1)',
  'var(--connector-color-2)',
  'var(--connector-color-3)',
]

const DEPTH_LABELS = ['Root', 'Group', 'Nested', 'Deep']

// ============================================
// GROUP HEADER COMPONENT
// ============================================

const GroupHeader = memo(({
  logicalOperator,
  collapsed,
  depth,
  isRoot,
  childCount,
  onToggleOperator,
  onToggleCollapsed,
  onAddRule,
  onAddGroup,
  onRemoveGroup,
}: GroupHeaderProps) => {
  const accentColor = DEPTH_ACCENT_COLORS[depth % DEPTH_ACCENT_COLORS.length]
  const depthLabel = DEPTH_LABELS[Math.min(depth, DEPTH_LABELS.length - 1)]

  return (
    <div
      className="flex items-center gap-2 py-1.5"
      aria-label={`${depthLabel} group header`}
    >
      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapsed}
        className="p-1 rounded transition-all duration-200 hover:scale-110 shrink-0"
        style={{ color: accentColor }}
        aria-label={collapsed ? 'Expand group' : 'Collapse group'}
        aria-expanded={!collapsed}
      >
        {collapsed
          ? <ChevronRight size={14} />
          : <ChevronDown size={14} />
        }
      </button>

      {/* Depth indicator */}
      {!isRoot && (
        <span
          className="text-xs px-1.5 py-0.5 rounded font-mono shrink-0"
          style={{
            background: 'var(--bg-tertiary)',
            color: accentColor,
            border: `1px solid ${accentColor}`,
            fontSize: '10px',
          }}
        >
          {depthLabel}
        </span>
      )}

      {/* AND / OR toggle */}
      <button
        onClick={onToggleOperator}
        className={clsx(
          'px-3 py-1 rounded font-mono font-bold text-xs tracking-widest',
          'transition-all duration-200 hover:scale-105 shrink-0',
        )}
        style={{
          background: logicalOperator === 'AND'
            ? 'rgba(0, 212, 255, 0.12)'
            : 'rgba(124, 58, 237, 0.12)',
          color: logicalOperator === 'AND'
            ? 'var(--accent-primary)'
            : 'var(--accent-secondary)',
          border: `1px solid ${logicalOperator === 'AND'
            ? 'rgba(0, 212, 255, 0.3)'
            : 'rgba(124, 58, 237, 0.3)'}`,
          boxShadow: logicalOperator === 'AND'
            ? '0 0 8px rgba(0, 212, 255, 0.1)'
            : '0 0 8px rgba(124, 58, 237, 0.1)',
        }}
        aria-label={`Toggle logical operator, currently ${logicalOperator}`}
        title="Click to toggle AND / OR"
      >
        {logicalOperator}
      </button>

      {/* Child count badge */}
      <span
        className="text-xs shrink-0"
        style={{ color: 'var(--text-muted)' }}
      >
        {childCount} {childCount === 1 ? 'condition' : 'conditions'}
      </span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Action buttons */}
      <div className="flex items-center gap-1">
        {/* Add rule */}
        <button
          onClick={onAddRule}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs
            transition-all duration-200 hover:scale-105"
          style={{
            background: 'rgba(16, 185, 129, 0.08)',
            color: 'var(--accent-success)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
          }}
          aria-label="Add rule to this group"
          title="Add rule (Ctrl+Enter)"
        >
          <Plus size={12} />
          Rule
        </button>

        {/* Add nested group */}
        <button
          onClick={onAddGroup}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs
            transition-all duration-200 hover:scale-105"
          style={{
            background: 'rgba(124, 58, 237, 0.08)',
            color: 'var(--accent-secondary)',
            border: '1px solid rgba(124, 58, 237, 0.2)',
          }}
          aria-label="Add nested group"
          title="Add nested group"
        >
          <PlusSquare size={12} />
          Group
        </button>

        {/* Remove group — hidden for root */}
        {!isRoot && (
          <button
            onClick={onRemoveGroup}
            className="p-1.5 rounded transition-all duration-200 hover:scale-110"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent-error)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            aria-label="Remove this group"
            title="Remove group"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

        {/* Accessible label */}
        <span className="sr-only">
        {depthLabel} logical group using {logicalOperator}
        </span>
    </div>
  )
})

GroupHeader.displayName = 'GroupHeader'

export default GroupHeader