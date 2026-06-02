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

interface ConditionGroupProps {
  group: QueryGroup
  depth: number
  fields: SchemaField[]
  validationErrors: ValidationError[]
  parentId?: string
}

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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

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

  const depthBorders = [
    'var(--group-0-border)',
    'var(--group-1-border)',
    'var(--group-2-border)',
    'var(--group-3-border)',
  ]
  const depthBgs = [
    'var(--group-0-bg)',
    'var(--group-1-bg)',
    'var(--group-2-bg)',
    'var(--group-3-bg)',
  ]

  const borderColor = depthBorders[depth % 4]
  const bgColor = depthBgs[depth % 4]

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
      className="rounded-lg border"
      style={{
        background: 'var(--bg-surface)',
        borderColor: 'var(--border)',
        padding: isRoot ? '16px' : '14px',
      }}
      role="group"
      aria-label={`Condition group with ${group.logicalOperator} logic`}
    >
      {/* Header */}
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

      {/* Children */}
      <AnimatePresence initial={false}>
        {!group.collapsed && (
          <motion.div
            key="children"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <DndContext
              id={`dnd-context-${depth}`}
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              accessibility={{
                announcements: {
                  onDragStart: ({ active }) => `Picked up ${active.id}`,
                  onDragOver: ({ over }) => over ? `Over ${over.id}` : '',
                  onDragEnd: ({ active, over }) => over
                    ? `Dropped ${active.id} over ${over.id}`
                    : `Dropped ${active.id}`,
                  onDragCancel: ({ active }) => `Cancelled ${active.id}`,
                },
              }}
            >
              <SortableContext
                items={group.children.map(c => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <div
                  className="flex flex-col gap-3 mt-4"
                  style={{
                    paddingLeft: isRoot ? 0 : '12px',
                    borderLeft: !isRoot
                      ? `1px dashed ${borderColor}`
                      : 'none',
                    marginLeft: !isRoot ? '6px' : 0,
                  }}
                >
                  <AnimatePresence mode="popLayout">
                    {group.children.map((child: QueryNode) => {
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

                  {/* Empty state */}
                  {group.children.length === 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="py-6 text-center rounded border border-dashed
                        text-xs uppercase tracking-widest"
                      style={{
                        borderColor: 'var(--border)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      Empty Logical Group
                    </motion.div>
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed indicator */}
      {group.collapsed && group.children.length > 0 && (
        <div
          className="mt-2 px-3 py-1.5 rounded text-xs uppercase tracking-widest text-center"
          style={{
            background: 'var(--bg-input)',
            color: 'var(--text-muted)',
            border: '1px solid var(--border)',
          }}
        >
          {group.children.length} condition{group.children.length !== 1 ? 's' : ''} hidden
        </div>
      )}
    </motion.div>
  )
})

ConditionGroup.displayName = 'ConditionGroup'

export default ConditionGroup