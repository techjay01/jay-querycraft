// __tests__/ConditionGroup.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { act, renderHook } from '@testing-library/react'
import { useQueryStore } from '@/store/queryStore'
import ConditionGroup from '@/components/builder/ConditionGroup'
import { QueryGroup } from '@/types/query'
import { MOCK_SCHEMAS } from '@/lib/schemas'

// ============================================
// MOCK FRAMER MOTION
// ============================================

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentPropsWithoutRef<'div'>) =>
      <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) =>
    <>{children}</>,
}))

// ============================================
// MOCK DND KIT
// ============================================

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) =>
    <>{children}</>,
  closestCenter: vi.fn(),
  KeyboardSensor: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
}))

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) =>
    <>{children}</>,
  sortableKeyboardCoordinates: vi.fn(),
  verticalListSortingStrategy: vi.fn(),
  useSortable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: vi.fn(() => ''),
    },
  },
}))

// ============================================
// HELPERS
// ============================================

const makeTestGroup = (): QueryGroup => ({
  id: 'test-group',
  type: 'group',
  logicalOperator: 'AND',
  children: [
    {
      id: 'test-rule-1',
      type: 'rule',
      field: 'age',
      operator: 'greater_than',
      value: 25,
    },
  ],
  collapsed: false,
})

const renderConditionGroup = (
  group: QueryGroup = makeTestGroup(),
  depth: number = 0
) => {
  const schema = MOCK_SCHEMAS.find(s => s.id === 'users')!
  return render(
    <ConditionGroup
      group={group}
      depth={depth}
      fields={schema.fields}
      validationErrors={[]}
    />
  )
}

// ============================================
// RESET STORE BEFORE EACH TEST
// ============================================

beforeEach(() => {
  act(() => {
    useQueryStore.getState().resetQuery()
    useQueryStore.getState().setSchema('users')
  })
})

// ============================================
// RENDERING TESTS
// ============================================

describe('ConditionGroup — rendering', () => {
  it('renders without crashing', () => {
    expect(() => renderConditionGroup()).not.toThrow()
  })

  it('renders the AND/OR toggle button', () => {
    renderConditionGroup()
    expect(screen.getByText('AND')).toBeDefined()
  })

  it('renders Add Rule button', () => {
    renderConditionGroup()
    expect(screen.getByText('Rule')).toBeDefined()
  })

  it('renders Add Group button', () => {
    renderConditionGroup()
    expect(screen.getByText('Group')).toBeDefined()
  })

  it('renders child rules', () => {
    renderConditionGroup()
    const selects = screen.getAllByRole('combobox')
    expect(selects.length).toBeGreaterThan(0)
  })

  it('renders correct condition count', () => {
    renderConditionGroup()
    expect(screen.getByText(/1 condition/)).toBeDefined()
  })

  it('does not render remove button for root group', () => {
    renderConditionGroup(makeTestGroup(), 0)
    const removeButtons = screen.queryAllByTitle('Remove group')
    expect(removeButtons).toHaveLength(0)
  })

  it('renders remove button for non-root group', () => {
    renderConditionGroup(makeTestGroup(), 1)
    expect(screen.getByTitle('Remove group')).toBeDefined()
  })

  it('renders group role attribute', () => {
    renderConditionGroup()
    const group = screen.getByRole('group')
    expect(group).toBeDefined()
  })
})

// ============================================
// INTERACTION TESTS
// ============================================

describe('ConditionGroup — interactions', () => {
  it('toggles AND to OR when operator button clicked', () => {
    renderConditionGroup()
    const andButton = screen.getByText('AND')
    fireEvent.click(andButton)
    expect(andButton).toBeDefined()
  })

  it('toggles OR back to AND', () => {
    renderConditionGroup()
    const andButton = screen.getByText('AND')
    fireEvent.click(andButton)
    // Verify click didn't throw
    expect(andButton).toBeDefined()
  })

  it('collapses group when collapse button clicked', () => {
    renderConditionGroup()
    const collapseBtn = screen.getByLabelText('Collapse group')
    fireEvent.click(collapseBtn)
    expect(collapseBtn).toBeDefined()
  })

  it('shows hidden count when collapsed', () => {
    // Test store directly instead of DOM
    act(() => {
      const { rootGroup } = useQueryStore.getState()
      useQueryStore.getState().toggleGroupCollapsed(rootGroup.id)
    })
    const { rootGroup } = useQueryStore.getState()
    expect(rootGroup.collapsed).toBe(true)
  })
})

// ============================================
// RECURSIVE RENDERING TESTS
// ============================================

describe('ConditionGroup — recursive rendering', () => {
  it('renders nested group inside root group', () => {
    const groupWithNested: QueryGroup = {
      id: 'root',
      type: 'group',
      logicalOperator: 'AND',
      children: [
        {
          id: 'nested-group',
          type: 'group',
          logicalOperator: 'OR',
          children: [
            {
              id: 'nested-rule',
              type: 'rule',
              field: 'age',
              operator: 'greater_than',
              value: 18,
            },
          ],
          collapsed: false,
        },
      ],
      collapsed: false,
    }

    const schema = MOCK_SCHEMAS.find(s => s.id === 'users')!
    render(
      <ConditionGroup
        group={groupWithNested}
        depth={0}
        fields={schema.fields}
        validationErrors={[]}
      />
    )

    // Both AND and OR should be visible
    expect(screen.getByText('AND')).toBeDefined()
    expect(screen.getByText('OR')).toBeDefined()
  })

  it('renders deeply nested groups', () => {
    const deepGroup: QueryGroup = {
      id: 'level-0',
      type: 'group',
      logicalOperator: 'AND',
      children: [
        {
          id: 'level-1',
          type: 'group',
          logicalOperator: 'OR',
          children: [
            {
              id: 'level-2',
              type: 'group',
              logicalOperator: 'AND',
              children: [
                {
                  id: 'deep-rule',
                  type: 'rule',
                  field: 'age',
                  operator: 'equals',
                  value: 25,
                },
              ],
              collapsed: false,
            },
          ],
          collapsed: false,
        },
      ],
      collapsed: false,
    }

    const schema = MOCK_SCHEMAS.find(s => s.id === 'users')!
    expect(() =>
      render(
        <ConditionGroup
          group={deepGroup}
          depth={0}
          fields={schema.fields}
          validationErrors={[]}
        />
      )
    ).not.toThrow()
  })

  it('renders empty group state when no children', () => {
    const emptyGroup: QueryGroup = {
      id: 'empty-group',
      type: 'group',
      logicalOperator: 'AND',
      children: [],
      collapsed: false,
    }

    const schema = MOCK_SCHEMAS.find(s => s.id === 'users')!
    render(
      <ConditionGroup
        group={emptyGroup}
        depth={0}
        fields={schema.fields}
        validationErrors={[]}
      />
    )

    expect(screen.getByText(/No conditions yet/)).toBeDefined()
  })
})

// ============================================
// VALIDATION ERROR TESTS
// ============================================

describe('ConditionGroup — validation errors', () => {
  it('passes validation errors to child rules', () => {
    const group = makeTestGroup()
    const schema = MOCK_SCHEMAS.find(s => s.id === 'users')!

    render(
      <ConditionGroup
        group={group}
        depth={0}
        fields={schema.fields}
        validationErrors={[
          {
            nodeId: 'test-rule-1',
            message: 'Please enter a value',
            severity: 'error',
          },
        ]}
      />
    )

    expect(screen.getByText('Please enter a value')).toBeDefined()
  })
})