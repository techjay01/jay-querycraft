// components/ui/StatsBar.tsx
'use client'

import { memo } from 'react'
import { useQueryStore } from '@/store/queryStore'
import { countRules, countGroups } from '@/lib/queryEngine'

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

  const dot = (color: string) => (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full"
      style={{ background: color }}
    />
  )

  const item = (children: React.ReactNode) => (
    <div className="flex items-center gap-1.5">
      {children}
    </div>
  )

  const divider = (
    <div className="w-px h-3" style={{ background: 'var(--border)' }} />
  )

  return (
    <div
      className="flex items-center gap-3 flex-wrap text-xs uppercase tracking-wider"
      style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '10px' }}
    >
      {/* Schema */}
      {selectedSchema && item(
        <>
          {dot('var(--accent)')}
          <span style={{ color: 'var(--text-secondary)' }}>
            {selectedSchema.name}
          </span>
        </>
      )}

      {divider}

      {/* Rules */}
      {item(
        <span>{ruleCount} {ruleCount === 1 ? 'rule' : 'rules'}</span>
      )}

      {/* Groups */}
      {groupCount > 0 && (
        <>
          {divider}
          {item(<span>{groupCount} {groupCount === 1 ? 'group' : 'groups'}</span>)}
        </>
      )}

      {divider}

      {/* Validation */}
      {isDirty && (
        isValid
          ? item(<>
              {dot('var(--success)')}
              <span style={{ color: 'var(--success)' }}>Valid</span>
            </>)
          : errorCount > 0
            ? item(<>
                {dot('var(--danger)')}
                <span style={{ color: 'var(--danger)' }}>
                  {errorCount} {errorCount === 1 ? 'error' : 'errors'}
                </span>
              </>)
            : null
      )}

      {/* Results */}
      {executionResult && (
        <>
          {divider}
          {item(
            <>
              {dot('var(--success)')}
              <span style={{ color: 'var(--success)' }}>
                {executionResult.totalCount} results
              </span>
              <span>in {executionResult.executionTime}ms</span>
            </>
          )}
        </>
      )}
    </div>
  )
})

StatsBar.displayName = 'StatsBar'

export default StatsBar