// components/builder/ConditionRule.tsx
'use client'

import { memo, useCallback } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, AlertCircle } from 'lucide-react'
import { QueryRule, SchemaField, OperatorType } from '@/types/query'
import { FIELD_TYPE_OPERATORS, OPERATOR_META } from '@/lib/schemas'
import { useQueryStore } from '@/store/queryStore'
import { getNodeErrors } from '@/lib/validators'
import Select from '@/components/ui/Select'

// ============================================
// PROPS
// ============================================

interface ConditionRuleProps {
  rule: QueryRule
  depth: number
  parentId: string
  fields: SchemaField[]
  validationErrors: import('@/types/query').ValidationError[]
}

// ============================================
// VALUE INPUT
// ============================================

const ValueInput = memo(({
  rule,
  field,
  onValueChange,
}: {
  rule: QueryRule
  field: SchemaField | undefined
  onValueChange: (value: QueryRule['value']) => void
}) => {
  const operator = OPERATOR_META[rule.operator]

  const cls = 'w-full py-2 text-xs outline-none bg-transparent'
  const style = { color: 'var(--text)', fontFamily: 'var(--font-mono)' }

  if (!operator || !operator.requiresValue) {
    return (
      <span className="text-xs italic" style={{ color: 'var(--text-muted)' }}>
        no value needed
      </span>
    )
  }

  if (field?.type === 'enum' && field.enumOptions) {
    return (
        <Select
        value={String(rule.value ?? '')}
        onChange={onValueChange}
        placeholder="Select value..."
        options={field.enumOptions.map(opt => ({
            value: opt.value,
            label: opt.label,
        }))}
        />
    )
    }

  if (field?.type === 'boolean') {
    return (
        <Select
        value={String(rule.value ?? '')}
        onChange={val => onValueChange(val === 'true')}
        placeholder="Select..."
        options={[
            { value: 'true', label: 'True' },
            { value: 'false', label: 'False' },
        ]}
        />
    )
    }

  if (rule.operator === 'between' || rule.operator === 'date_between') {
    const vals = Array.isArray(rule.value) ? rule.value as [string, string] : ['', '']
    const t = rule.operator === 'date_between' ? 'date' : 'number'
    return (
      <div className="flex items-center gap-2 w-full">
        <input type={t} value={vals[0] ?? ''} placeholder="From"
          onChange={e => onValueChange([e.target.value, vals[1] ?? ''])}
          className={cls} style={style}
        />
        <span style={{ color: 'var(--text-muted)' }}>—</span>
        <input type={t} value={vals[1] ?? ''} placeholder="To"
          onChange={e => onValueChange([vals[0] ?? '', e.target.value])}
          className={cls} style={style}
        />
      </div>
    )
  }

  if (rule.operator === 'in_array' || rule.operator === 'not_in_array') {
    return (
      <input type="text"
        value={Array.isArray(rule.value) ? (rule.value as string[]).join(', ') : String(rule.value ?? '')}
        onChange={e => onValueChange(e.target.value.split(',').map(v => v.trim()))}
        placeholder="val1, val2, val3"
        className={cls} style={style}
      />
    )
  }

  if (field?.type === 'date' || operator.inputType === 'date') {
    return (
      <input type="date" value={String(rule.value ?? '')}
        onChange={e => onValueChange(e.target.value)}
        className={cls} style={style}
      />
    )
  }

  if (field?.type === 'number' || operator.inputType === 'number') {
    return (
      <input type="number" value={String(rule.value ?? '')}
        onChange={e => onValueChange(Number(e.target.value))}
        placeholder="Enter number..."
        className={cls} style={style}
      />
    )
  }

  return (
    <input type="text" value={String(rule.value ?? '')}
      onChange={e => onValueChange(e.target.value)}
      placeholder="Enter value..."
      className={cls} style={style}
    />
  )
})

ValueInput.displayName = 'ValueInput'

// ============================================
// CONDITION RULE
// ============================================

const ConditionRule = memo(({
  rule,
  depth,
  fields,
  validationErrors,
}: ConditionRuleProps) => {
  const { updateRuleField, updateRuleOperator, updateRuleValue, removeRule } = useQueryStore()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: rule.id })

  const dndStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const nodeErrors = getNodeErrors(validationErrors, rule.id)
  const hasError = nodeErrors.length > 0
  const currentField = fields.find(f => f.name === rule.field)
  const allowedOperators = currentField
    ? FIELD_TYPE_OPERATORS[currentField.type] ?? []
    : Object.keys(OPERATOR_META) as OperatorType[]

  const handleFieldChange = useCallback((f: string) => {
    updateRuleField(rule.id, f)
  }, [rule.id, updateRuleField])

  const handleOperatorChange = useCallback((op: OperatorType) => {
    updateRuleOperator(rule.id, op)
  }, [rule.id, updateRuleOperator])

  const handleValueChange = useCallback((value: QueryRule['value']) => {
    updateRuleValue(rule.id, value)
  }, [rule.id, updateRuleValue])

  const depthConnectors = [
    'var(--connector-0)',
    'var(--connector-1)',
    'var(--connector-2)',
    'var(--connector-3)',
  ]
  const connectorColor = depthConnectors[depth % depthConnectors.length]

  return (
    <div
      ref={setNodeRef}
      style={dndStyle}
      className="animate-fade-in relative flex flex-col gap-1"
    >
      {/* Connector */}
      <div
        className="absolute left-0 top-1/2 w-3 h-px -translate-x-3"
        style={{ background: connectorColor }}
      />

      {/* Card */}
      <div
        className="rounded-lg border"
        style={{
          background: 'var(--bg-card)',
          borderColor: hasError ? 'var(--danger-border)' : 'var(--border)',
        }}
      >
        {/* Column labels */}
        <div
            className="grid px-4 pt-3 pb-1.5"
            style={{
                gridTemplateColumns: '32px 1fr 1fr 1fr 32px',
                gap: '12px',
                borderBottom: '1px solid var(--border)',
            }}
        >
          <div />
          <span
            className="text-xs uppercase tracking-widest"
            style={{ color: 'var(--text-muted)', fontSize: '9px' }}
          >
            Field
          </span>
          <span
            className="text-xs uppercase tracking-widest"
            style={{ color: 'var(--text-muted)', fontSize: '9px' }}
          >
            Operator
          </span>
          <span
            className="text-xs uppercase tracking-widest"
            style={{ color: 'var(--text-muted)', fontSize: '9px' }}
          >
            Value
          </span>
          <div />
        </div>

        {/* Inputs row */}
        <div
            className="grid items-center px-4 py-2"
            style={{
                gridTemplateColumns: '32px 1fr 1fr 1fr 32px',
                gap: '12px',
            }}
        >
          {/* Drag handle */}
          <button
            {...attributes}
            {...listeners}
            className="flex items-center justify-center cursor-grab
              active:cursor-grabbing rounded p-1 transition-colors"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Drag to reorder"
          >
            <GripVertical size={13} />
          </button>

          {/* Field */}
        <Select
            value={rule.field}
            onChange={handleFieldChange}
            placeholder="Select field..."
            accentSelected={true}
            options={fields.map(f => ({ value: f.name, label: f.label }))}
        />

          {/* Operator */}
        <Select
            value={rule.operator}
            onChange={val => handleOperatorChange(val as OperatorType)}
            options={allowedOperators.map(op => ({
                value: op,
                label: OPERATOR_META[op]?.label ?? op,
            }))}
        />

          {/* Value */}
          <div
            className="rounded px-3 py-1"
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
            }}
          >
            <ValueInput
              rule={rule}
              field={currentField}
              onValueChange={handleValueChange}
            />
          </div>

          {/* Delete */}
          <button
            onClick={() => removeRule(rule.id)}
            className="flex items-center justify-center rounded p-1
              transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--danger)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            aria-label="Remove rule"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Error */}
      {hasError && (
        <div className="flex items-center gap-1.5 px-3 animate-fade-in">
          <AlertCircle size={11} style={{ color: 'var(--danger)' }} />
          <span className="text-xs" style={{ color: 'var(--danger)' }}>
            {nodeErrors[0].message}
          </span>
        </div>
      )}
    </div>
  )
})

ConditionRule.displayName = 'ConditionRule'

export default ConditionRule