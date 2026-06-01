// components/builder/GroupHeader.tsx
'use client'

import { memo } from 'react'
import { ChevronDown, ChevronRight, Plus, FolderPlus, Trash2 } from 'lucide-react'
import { LogicalOperator } from '@/types/query'

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

  return (
    <div className="flex items-center gap-2 flex-wrap">

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapsed}
        className="w-7 h-7 rounded flex items-center justify-center
          transition-colors shrink-0"
        style={{
          background: 'var(--bg-input)',
          border: '1px solid var(--border)',
          color: 'var(--text-muted)',
        }}
        aria-label={collapsed ? 'Expand group' : 'Collapse group'}
        aria-expanded={!collapsed}
      >
        {collapsed
          ? <ChevronRight size={12} />
          : <ChevronDown size={12} />
        }
      </button>

      {/* AND / OR toggle — solid accent pill */}
      <button
        onClick={onToggleOperator}
        className="flex items-center gap-1.5 px-3 py-1 rounded font-bold
          text-xs uppercase tracking-wider transition-all duration-150
          hover:opacity-90 shrink-0"
        style={{
          background: 'var(--accent)',
          color: 'var(--accent-fg)',
          border: 'none',
          minWidth: '70px',
          justifyContent: 'space-between',
        }}
        aria-label={`Toggle operator, currently ${logicalOperator}`}
        title="Click to toggle AND / OR"
      >
        {logicalOperator}
        <ChevronDown size={10} />
      </button>

      {/* Child count */}
      <span
        className="text-xs shrink-0"
        style={{ color: 'var(--text-muted)', fontSize: '11px' }}
      >
        {childCount} {childCount === 1 ? 'condition' : 'conditions'}
      </span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">

        {/* Add rule */}
        <button
          onClick={onAddRule}
          className="flex items-center gap-1 px-2.5 py-1 rounded text-xs
            uppercase tracking-wider font-medium transition-colors duration-150"
          style={{
            background: 'var(--bg-input)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
          }}
          aria-label="Add rule"
          title="Add rule"
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--accent-border)'
            e.currentTarget.style.color = 'var(--accent)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
        >
          <Plus size={11} />
          Rule
        </button>

        {/* Add group */}
        <button
          onClick={onAddGroup}
          className="flex items-center gap-1 px-2.5 py-1 rounded text-xs
            uppercase tracking-wider font-medium transition-colors duration-150"
          style={{
            background: 'var(--bg-input)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border)',
          }}
          aria-label="Add group"
          title="Add nested group"
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--accent-border)'
            e.currentTarget.style.color = 'var(--accent)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
        >
          <FolderPlus size={11} />
          Group
        </button>

        {/* Remove group */}
        {!isRoot && (
          <button
            onClick={onRemoveGroup}
            className="w-7 h-7 flex items-center justify-center rounded
              transition-colors duration-150"
            style={{
              background: 'var(--bg-input)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border)',
            }}
            aria-label="Remove this group"
            title="Remove group"
            onMouseEnter={e => {
              e.currentTarget.style.color = 'var(--danger)'
              e.currentTarget.style.borderColor = 'var(--danger-border)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = 'var(--text-muted)'
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      <span className="sr-only">
        {depth === 0 ? 'Root' : 'Nested'} group using {logicalOperator}
      </span>
    </div>
  )
})

GroupHeader.displayName = 'GroupHeader'

export default GroupHeader