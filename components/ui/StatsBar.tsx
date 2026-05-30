// components/ui/StatsBar.tsx
'use client'

import { memo } from 'react'
import { useQueryStore } from '@/store/queryStore'
import { countRules, countGroups } from '@/lib/queryEngine'
import { Activity, Layers, GitBranch, CheckCircle2, XCircle } from 'lucide-react'

const StatsBar = memo(() => {
  const {
    rootGroup,
    selectedSchema,
    validationErrors,
    executionResult,
    isDirty,
  } = useQueryStore()

  const ruleCount = countRules(rootGroup)
  const groupCount = countGroups(rootGroup)
  const errorCount = validationErrors.filter(e => e.severity === 'error').length
  const isValid = isDirty && errorCount === 0

  return (
    <div className="flex items-center gap-4 flex-wrap">
      {/* Schema */}
      {selectedSchema && (
        <div className="flex items-center gap-1.5">
          <Layers size={11} style={{ color: 'var(--text-muted)' }} />
          <span
            className="text-xs"
            style={{ color: 'var(--text-muted)', fontSize: '11px' }}
          >
            {selectedSchema.name}
          </span>
        </div>
      )}

      {/* Divider */}
      <div
        className="w-px h-3"
        style={{ background: 'var(--border-primary)' }}
      />

      {/* Rules count */}
      <div className="flex items-center gap-1.5">
        <Activity size={11} style={{ color: 'var(--text-muted)' }} />
        <span
          className="text-xs"
          style={{ color: 'var(--text-muted)', fontSize: '11px' }}
        >
          {ruleCount} {ruleCount === 1 ? 'rule' : 'rules'}
        </span>
      </div>

      {/* Groups count */}
      {groupCount > 0 && (
        <div className="flex items-center gap-1.5">
          <GitBranch size={11} style={{ color: 'var(--text-muted)' }} />
          <span
            className="text-xs"
            style={{ color: 'var(--text-muted)', fontSize: '11px' }}
          >
            {groupCount} {groupCount === 1 ? 'group' : 'groups'}
          </span>
        </div>
      )}

      {/* Divider */}
      <div
        className="w-px h-3"
        style={{ background: 'var(--border-primary)' }}
      />

      {/* Validation status */}
      {isDirty && (
        <div className="flex items-center gap-1.5">
          {isValid ? (
            <>
              <CheckCircle2
                size={11}
                style={{ color: 'var(--accent-success)' }}
              />
              <span
                className="text-xs"
                style={{
                  color: 'var(--accent-success)',
                  fontSize: '11px',
                }}
              >
                Valid
              </span>
            </>
          ) : errorCount > 0 ? (
            <>
              <XCircle
                size={11}
                style={{ color: 'var(--accent-error)' }}
              />
              <span
                className="text-xs"
                style={{
                  color: 'var(--accent-error)',
                  fontSize: '11px',
                }}
              >
                {errorCount} {errorCount === 1 ? 'error' : 'errors'}
              </span>
            </>
          ) : null}
        </div>
      )}

      {/* Results count */}
      {executionResult && (
        <>
          <div
            className="w-px h-3"
            style={{ background: 'var(--border-primary)' }}
          />
          <div className="flex items-center gap-1.5">
            <span
              className="text-xs font-mono"
              style={{
                color: executionResult.totalCount > 0
                  ? 'var(--accent-success)'
                  : 'var(--text-muted)',
                fontSize: '11px',
              }}
            >
              {executionResult.totalCount} results
            </span>
            <span
              className="text-xs"
              style={{ color: 'var(--text-muted)', fontSize: '10px' }}
            >
              in {executionResult.executionTime}ms
            </span>
          </div>
        </>
      )}
    </div>
  )
})

StatsBar.displayName = 'StatsBar'

export default StatsBar