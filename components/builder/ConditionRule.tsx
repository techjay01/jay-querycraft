// components/builder/ConditionRule.tsx
'use client'

import { memo, useCallback } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X, AlertCircle } from 'lucide-react'
import { QueryRule, SchemaField, OperatorType } from '@/types/query'
import { FIELD_TYPE_OPERATORS, OPERATOR_META } from '@/lib/schemas'
import { useQueryStore } from '@/store/queryStore'
import { getNodeErrors } from '@/lib/validators'
import { clsx } from 'clsx'

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
// SHARED INPUT STYLES
// ============================================

const inputStyle = {
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border-primary)',
  color: 'var(--text-primary)',
  borderRadius: '8px',
  fontSize: '12px',
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
}

const inputCls = 'flex-1 px-3 py-2 rounded-lg text-xs outline-none transition-all duration-150'
const selectCls = 'px-2.5 py-2 rounded-lg text-xs outline-none cursor-pointer transition-all duration-150'

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

  if (!operator || !operator.requiresValue) return (
    <div
      className="flex-1 px-3 py-2 rounded-lg text-xs italic"
      style={{
        color: 'var(--text-muted)',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-primary)',
      }}
    >
      no value needed
    </div>
  )

  // Enum field
  if (field?.type === 'enum' && field.enumOptions) {
    return (
      <select
        value={String(rule.value ?? '')}
        onChange={e => onValueChange(e.target.value)}
        className={`flex-1 ${selectCls}`}
        style={inputStyle}
      >
        <option value="">Select value...</option>
        {field.enumOptions.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    )
  }

  // Boolean field
  if (field?.type === 'boolean') {
    return (
      <select
        value={String(rule.value ?? '')}
        onChange={e => onValueChange(e.target.value === 'true')}
        className={`flex-1 ${selectCls}`}
        style={inputStyle}
      >
        <option value="">Select...</option>
        <option value="true">True</option>
        <option value="false">False</option>
      </select>
    )
  }

  // Between operator
  if (rule.operator === 'between' || rule.operator === 'date_between') {
    const vals = Array.isArray(rule.value)
      ? rule.value as [string, string]
      : ['', '']
    const inputType = rule.operator === 'date_between' ? 'date' : 'number'
    return (
      <div className="flex-1 flex gap-2 items-center">
        <input
          type={inputType}
          value={vals[0] ?? ''}
          onChange={e => onValueChange([e.target.value, vals[1] ?? ''])}
          placeholder="From"
          className={inputCls}
          style={inputStyle}
        />
        <span
          className="text-xs shrink-0"
          style={{ color: 'var(--text-muted)' }}
        >
          to
        </span>
        <input
          type={inputType}
          value={vals[1] ?? ''}
          onChange={e => onValueChange([vals[0] ?? '', e.target.value])}
          placeholder="To"
          className={inputCls}
          style={inputStyle}
        />
      </div>
    )
  }

  // Array operator
  if (rule.operator === 'in_array' || rule.operator === 'not_in_array') {
    return (
      <input
        type="text"
        value={
          Array.isArray(rule.value)
            ? (rule.value as string[]).join(', ')
            : String(rule.value ?? '')
        }
        onChange={e =>
          onValueChange(e.target.value.split(',').map(v => v.trim()))
        }
        placeholder="val1, val2, val3"
        className={inputCls}
        style={inputStyle}
      />
    )
  }

  // Date field
  if (field?.type === 'date' || operator.inputType === 'date') {
    return (
      <input
        type="date"
        value={String(rule.value ?? '')}
        onChange={e => onValueChange(e.target.value)}
        className={inputCls}
        style={inputStyle}
      />
    )
  }

  // Number field
  if (field?.type === 'number' || operator.inputType === 'number') {
    return (
      <input
        type="number"
        value={String(rule.value ?? '')}
        onChange={e => onValueChange(Number(e.target.value))}
        placeholder="Enter number..."
        className={inputCls}
        style={inputStyle}
      />
    )
  }

  // Default text
  return (
    <input
      type="text"
      value={String(rule.value ?? '')}
      onChange={e => onValueChange(e.target.value)}
      placeholder="Enter value..."
      className={inputCls}
      style={inputStyle}
    />
  )
})

ValueInput.displayName = 'ValueInput'

// ============================================
// CONDITION RULE COMPONENT
// ============================================

const ConditionRule = memo(({
  rule,
  depth,
  fields,
  validationErrors,
}: ConditionRuleProps) => {
  const {
    updateRuleField,
    updateRuleOperator,
    updateRuleValue,
    removeRule,
  } = useQueryStore()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rule.id })

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

  const handleFieldChange = useCallback((field: string) => {
    updateRuleField(rule.id, field)
  }, [rule.id, updateRuleField])

  const handleOperatorChange = useCallback((operator: OperatorType) => {
    updateRuleOperator(rule.id, operator)
  }, [rule.id, updateRuleOperator])

  const handleValueChange = useCallback((value: QueryRule['value']) => {
    updateRuleValue(rule.id, value)
  }, [rule.id, updateRuleValue])

  const depthColors = [
    'var(--connector-color-0)',
    'var(--connector-color-1)',
    'var(--connector-color-2)',
    'var(--connector-color-3)',
  ]
  const connectorColor = depthColors[depth % depthColors.length]

  return (
    <div
      ref={setNodeRef}
      style={dndStyle}
      className="animate-fade-in relative flex flex-col gap-1.5"
    >
      {/* Connector line */}
      <div
        className="absolute left-0 top-1/2 w-4 h-px -translate-x-4"
        style={{ background: connectorColor }}
      />

      {/* Rule row */}
      <div
        className={clsx(
          'flex items-center gap-2 px-3 py-2.5 rounded-xl border',
          'transition-all duration-200',
        )}
        style={{
          background: hasError
            ? 'rgba(239,68,68,0.04)'
            : 'var(--bg-card)',
          borderColor: hasError
            ? 'rgba(239,68,68,0.4)'
            : 'var(--border-primary)',
          boxShadow: hasError
            ? '0 0 12px rgba(239,68,68,0.08)'
            : '0 1px 3px rgba(0,0,0,0.12)',
        }}
      >
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 rounded-lg
            transition-all duration-150 shrink-0 hover:bg-white/5"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Drag to reorder"
        >
          <GripVertical size={13} />
        </button>

        {/* Field selector */}
        <select
          value={rule.field}
          onChange={e => handleFieldChange(e.target.value)}
          className={selectCls}
          style={{
            ...inputStyle,
            minWidth: '120px',
            fontWeight: rule.field ? '500' : '400',
            color: rule.field
              ? 'var(--accent-primary)'
              : 'var(--text-muted)',
          }}
        >
          <option value="">Field...</option>
          {fields.map(f => (
            <option
              key={f.name}
              value={f.name}
              style={{ color: 'var(--text-primary)' }}
            >
              {f.label}
            </option>
          ))}
        </select>

        {/* Operator selector */}
        <select
          value={rule.operator}
          onChange={e => handleOperatorChange(e.target.value as OperatorType)}
          className={selectCls}
          style={{
            ...inputStyle,
            minWidth: '130px',
            color: 'var(--text-secondary)',
          }}
        >
          {allowedOperators.map(op => (
            <option key={op} value={op}>
              {OPERATOR_META[op]?.label ?? op}
            </option>
          ))}
        </select>

        {/* Value input */}
        <ValueInput
          rule={rule}
          field={currentField}
          onValueChange={handleValueChange}
        />

        {/* Remove button */}
        <button
          onClick={() => removeRule(rule.id)}
          className="p-1.5 rounded-lg transition-all duration-200
            hover:scale-110 shrink-0 hover:bg-red-500/10"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e =>
            (e.currentTarget.style.color = 'var(--accent-error)')
          }
          onMouseLeave={e =>
            (e.currentTarget.style.color = 'var(--text-muted)')
          }
          aria-label="Remove rule"
        >
          <X size={13} />
        </button>
      </div>

      {/* Validation error */}
      {hasError && (
        <div className="flex items-center gap-1.5 px-3 animate-fade-in">
          <AlertCircle size={11} style={{ color: 'var(--accent-error)' }} />
          <span
            className="text-xs"
            style={{ color: 'var(--accent-error)' }}
          >
            {nodeErrors[0].message}
          </span>
        </div>
      )}
    </div>
  )
})

ConditionRule.displayName = 'ConditionRule'

export default ConditionRule