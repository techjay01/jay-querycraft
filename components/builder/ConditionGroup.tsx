// components/builder/ConditionGroup.tsx
'use client'

import { memo, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { AnimatePresence, motion } from 'framer-motion'
import { QueryGroup, QueryNode, SchemaField, ValidationError } from '@/types/query'
import { useQueryStore } from '@/store/queryStore'
import ConditionRule from './ConditionRule'
import GroupHeader from './GroupHeader'
import { clsx } from 'clsx'

// ============================================
// PROPS
// ============================================

interface ConditionGroupProps {
  group: QueryGroup
  depth: number
  fields: SchemaField[]
  validationErrors: ValidationError[]
  parentId?: string
}

// ============================================
// CONDITION GROUP — RECURSIVE COMPONENT
// ============================================

const ConditionGroup = memo(({
  group,
  depth,
  fields,
  validationErrors,
}: ConditionGroupProps) => {
  const {
    addRule,
    addGroup,
    removeGroup,
    toggleGroupOperator,
    toggleGroupCollapsed,
    reorderNodes,
  } = useQueryStore()

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Handle drag end — reorder nodes inside this group
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = group.children.findIndex(c => c.id === active.id)
    const newIndex = group.children.findIndex(c => c.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      reorderNodes(group.id, oldIndex, newIndex)
    }
  }, [group.children, group.id, reorderNodes])

  const handleAddRule = useCallback(() => addRule(group.id), [group.id, addRule])
  const handleAddGroup = useCallback(() => addGroup(group.id), [group.id, addGroup])
  const handleRemoveGroup = useCallback(() => removeGroup(group.id), [group.id, removeGroup])
  const handleToggleOperator = useCallback(() => toggleGroupOperator(group.id), [group.id, toggleGroupOperator])
  const handleToggleCollapsed = useCallback(() => toggleGroupCollapsed(group.id), [group.id, toggleGroupCollapsed])

  const isRoot = depth === 0
  const depthIndex = depth % 4

  // Depth-based left border color
  const borderColors = [
    'var(--group-border-0)',
    'var(--group-border-1)',
    'var(--group-border-2)',
    'var(--group-border-3)',
  ]
  const borderColor = borderColors[depthIndex]

  const sortableIds = group.children.map(c => c.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={clsx(
        'relative rounded-lg border',
        `group-depth-${depthIndex}`,
        isRoot ? 'p-4' : 'p-3',
      )}
      style={{
        borderColor,
        borderLeft: `3px solid ${borderColor}`,
        marginLeft: isRoot ? 0 : 0,
      }}
      role="group"
      aria-label={`Condition group with ${group.logicalOperator} logic`}
    >
      {/* Vertical connector line for non-root groups */}
      {!isRoot && (
        <div
          className="absolute left-0 top-8 bottom-4 w-px -translate-x-4"
          style={{ background: borderColor, opacity: 0.4 }}
        />
      )}

      {/* Group header */}
      <GroupHeader
        groupId={group.id}
        logicalOperator={group.logicalOperator}
        collapsed={group.collapsed ?? false}
        depth={depth}
        isRoot={isRoot}
        childCount={group.children.length}
        onToggleOperator={handleToggleOperator}
        onToggleCollapsed={handleToggleCollapsed}
        onAddRule={handleAddRule}
        onAddGroup={handleAddGroup}
        onRemoveGroup={handleRemoveGroup}
      />

      {/* Children — collapsible */}
      <AnimatePresence initial={false}>
        {!group.collapsed && (
          <motion.div
            key="children"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortableIds}
                strategy={verticalListSortingStrategy}
              >
                <div
                  className="mt-3 flex flex-col gap-2"
                  style={{
                    paddingLeft: isRoot ? 0 : 8,
                    borderLeft: !isRoot
                      ? `1px dashed ${borderColor}`
                      : 'none',
                    marginLeft: !isRoot ? 8 : 0,
                  }}
                >
                  <AnimatePresence mode="popLayout">
                    {group.children.map((child: QueryNode) => {
                      // ── RECURSIVE RENDERING ──
                      if (child.type === 'group') {
                        return (
                          <ConditionGroup
                            key={child.id}
                            group={child}
                            depth={depth + 1}
                            fields={fields}
                            validationErrors={validationErrors}
                            parentId={group.id}
                          />
                        )
                      }

                      // ── RULE RENDERING ──
                      return (
                        <ConditionRule
                          key={child.id}
                          rule={child}
                          depth={depth}
                          parentId={group.id}
                          fields={fields}
                          validationErrors={validationErrors}
                        />
                      )
                    })}
                  </AnimatePresence>

                  {/* Empty group state */}
                  {group.children.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-4 text-center rounded-lg border border-dashed"
                      style={{
                        borderColor: 'var(--border-primary)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <p className="text-xs">
                        No conditions yet.{' '}
                        <button
                          onClick={handleAddRule}
                          className="underline transition-colors"
                          style={{ color: 'var(--accent-primary)' }}
                        >
                          Add a rule
                        </button>
                        {' '}or{' '}
                        <button
                          onClick={handleAddGroup}
                          className="underline transition-colors"
                          style={{ color: 'var(--accent-secondary)' }}
                        >
                          add a group
                        </button>
                      </p>
                    </motion.div>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed state indicator */}
      {group.collapsed && group.children.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 px-3 py-1.5 rounded text-xs"
          style={{
            background: 'var(--bg-tertiary)',
            color: 'var(--text-muted)',
          }}
        >
          {group.children.length} condition{group.children.length !== 1 ? 's' : ''} hidden
        </motion.div>
      )}
    </motion.div>
  )
})

ConditionGroup.displayName = 'ConditionGroup'

export default ConditionGroup