# QueryCraft : Visual Query Builder

A highly interactive visual query builder that allows users to construct complex database queries through a graphical interface. Built for the HNG Internship Stage 8 Frontend Challenge.

**Live Demo:** [(https://jay-querycraft.vercel.app/)]

---

## Screenshots

![Screenshot of Live App](/querycraft/public/queryy.png)

---

## Features

- **Visual Query Builder** — construct complex queries without writing raw syntax
- **Recursive Condition Groups** — unlimited nesting depth with AND/OR logic
- **Schema-Driven Rendering** — field types drive operators and input controls
- **Multi-Format Output** — live SQL, MongoDB and GraphQL query generation
- **Query Execution** — filter mock datasets and inspect results in real time
- **Drag and Drop** — reorder conditions via drag and drop
- **Query History** — persisted query history and named presets
- **Import/Export** — save and load queries as JSON
- **Keyboard Shortcuts** — power user controls
- **Dark/Light Mode** — clean monochromatic themes
- **122 Tests Passing** — comprehensive unit and integration test coverage

---

## Tech Stack

- **Framework** — Next.js 15 (App Router)
- **Language** — TypeScript
- **Styling** — Tailwind CSS + CSS custom properties
- **State Management** — Zustand with Immer middleware
- **Drag and Drop** — @dnd-kit
- **Animations** — Framer Motion
- **Testing** — Vitest + React Testing Library
- **Package Manager** — pnpm
- **Deployment** — Vercel

---

## Architecture

### Folder Structure

```
querycraft/
├── app/                            # Next.js App Router
│   ├── layout.tsx                  # Root layout with metadata
│   ├── page.tsx                    # Main page — EDITOR/PREVIEW/INSPECTION
│   └── globals.css                 # Design tokens and base styles
├── components/
│   ├── builder/                    # Core query builder components
│   │   ├── QueryBuilder.tsx        # Root builder component
│   │   ├── ConditionGroup.tsx      # RECURSIVE group component
│   │   ├── ConditionRule.tsx       # Single rule row
│   │   ├── GroupHeader.tsx         # AND/OR toggle + group actions
│   │   └── AddRuleBar.tsx          # Action toolbar
│   ├── preview/                    # Query output preview
│   │   └── QueryPreview.tsx        # Live SQL/MongoDB/GraphQL preview
│   ├── results/                    # Query execution results
│   │   ├── ResultsPanel.tsx        # Results table with pagination
│   │   └── ResultRow.tsx           # Expandable result row
│   ├── history/                    # Query history and presets
│   │   └── QueryHistory.tsx        # History and presets panel
│   ├── schema/                     # Schema selector
│   │   └── SchemaSelector.tsx      # Data source selector
│   └── ui/                         # Shared UI primitives
│       ├── StatsBar.tsx            # Live query stats
│       ├── ShortcutsPanel.tsx      # Keyboard shortcuts modal
│       ├── ThemeToggle.tsx         # Dark/light toggle
│       ├── ClientOnly.tsx          # SSR hydration fix
│       ├── Badge.tsx               # Typed badge component
│       ├── Skeleton.tsx            # Loading skeleton
│       ├── Tooltip.tsx             # Hover tooltip
│       └── EmptyState.tsx          # Empty state component
├── store/
│   ├── queryStore.ts               # Zustand query tree store
│   └── historyStore.ts             # Zustand history/presets store
├── lib/
│   ├── queryEngine.ts              # SQL/MongoDB/GraphQL generators
│   ├── queryExecutor.ts            # Mock dataset filter engine
│   ├── validators.ts               # Query validation engine
│   └── schemas.ts                  # Mock schemas and datasets
├── types/
│   └── query.ts                    # All TypeScript types
├── hooks/
│   ├── useQueryBuilder.ts          # Query builder hook
│   └── useKeyboardShortcuts.ts     # Keyboard shortcuts hook
└── tests/
├── queryEngine.test.ts             # 45 engine tests
├── validators.test.ts              # 24 validator tests
├── queryStore.test.ts              # 36 store tests
└── ConditionGroup.test.tsx         # 17 UI tests
```

### Recursive Rendering Strategy

The core of QueryCraft is the `ConditionGroup` component which renders itself recursively:

```typescript
// ConditionGroup renders ConditionGroup for nested groups
{child.type === 'group' && (
  <ConditionGroup
    group={child}
    depth={depth + 1}  // depth increments for visual differentiation
    fields={fields}
    validationErrors={validationErrors}
  />
)}
```

Each group owns its own `DndContext` for isolated drag-and-drop zones. Depth is passed as a prop to drive visual differentiation (border colors, indentation). There is no maximum nesting limit.

### State Management

Zustand with Immer middleware handles all query tree state. The tree is a recursive data structure:

```typescript
type QueryNode = QueryRule | QueryGroup

interface QueryGroup {
  id: string
  type: 'group'
  logicalOperator: 'AND' | 'OR'
  children: QueryNode[]  // can contain both rules and groups
  collapsed?: boolean
}
```

All tree operations (add, remove, update, reorder) use recursive traversal functions that walk the tree until they find the target node by ID.

### Query Engine Design

The query engine (`lib/queryEngine.ts`) generates three output formats from the same query tree:

- **SQL** — `SELECT * FROM table WHERE field > value AND ...`
- **MongoDB** — `{ $and: [{ field: { $gt: value } }] }`
- **GraphQL** — `query { list(filter: { and: [{ field: { gt: value } }] }) }`

Each format has its own recursive generator function that traverses the tree and builds the output string/object.

### Validation Engine

The validator (`lib/validators.ts`) recursively traverses the tree and collects errors:

- Empty fields or values
- Operators incompatible with field types (e.g. `contains` on a number)
- Empty groups
- Invalid regex patterns
- Invalid between ranges

### Performance Optimization

- All components wrapped in `React.memo`
- Callbacks wrapped in `useCallback` to prevent unnecessary re-renders
- Each `DndContext` is isolated per group to prevent cascade updates
- Zustand with Immer for efficient immutable state updates
- CSS variables for theming — zero JS overhead on theme switch

---

## Query Engine Design

### Supported Operators

| Operator | String | Number | Boolean | Date | Enum | Array |
|----------|--------|--------|---------|------|------|-------|
| Equals | ✅ | ✅ | ✅ | ✅ | ✅ | |
| Not Equals | ✅ | ✅ | ✅ | ✅ | ✅ | |
| Contains | ✅ | | | | | |
| Starts With | ✅ | | | | | |
| Ends With | ✅ | | | | | |
| Greater Than | | ✅ | | | | |
| Less Than | | ✅ | | | | |
| Between | | ✅ | | ✅ | | |
| In Array | ✅ | ✅ | | | ✅ | ✅ |
| Is Null | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Regex | ✅ | | | | | |
| Date Before | | | | ✅ | | |
| Date After | | | | ✅ | | |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Enter` | Execute query |
| `Ctrl + Shift + R` | Reset query |
| `Ctrl + Shift + P` | Toggle preview |
| `Ctrl + Shift + H` | Toggle history |
| `Ctrl + Shift + M` | Toggle theme |

---

## Running Locally

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/jay-querycraft.git
cd jay-querycraft/querycraft

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test:run

# Build for production
pnpm build
```

---

## Testing

```bash
# Run all tests
pnpm test:run

# Run with coverage
pnpm test:coverage

# Run in watch mode
pnpm test
```

**Test Coverage:**
- `queryEngine.test.ts` — 45 tests covering all operators across SQL, MongoDB and GraphQL
- `validators.test.ts` — 24 tests covering all validation edge cases
- `queryStore.test.ts` — 36 tests covering all Zustand store actions
- `ConditionGroup.test.tsx` — 17 tests covering recursive rendering and interactions

---

## State Management Decisions

**Why Zustand over Redux or Jotai?**

Zustand was chosen because the query tree is deeply nested and requires frequent recursive updates. Redux would add unnecessary boilerplate for this use case. Jotai's atomic model gets messy with deeply nested interdependent state.

Zustand with Immer middleware gives clean immutable updates on nested trees:

```typescript
set(state => {
  findAndUpdateRule(state.rootGroup, ruleId, rule => {
    rule.value = newValue  // Immer handles immutability
  })
})
```

Two stores are used deliberately:
- `queryStore` — active query state, not persisted (resets on schema change)
- `historyStore` — history and presets, persisted to localStorage

This separation prevents history from bloating the active query store and keeps concerns separated.

---

## Recursive Rendering in Detail

The recursive rendering works through three key mechanisms:

**1. Recursive Component**
`ConditionGroup` renders itself for nested groups, incrementing depth each time:
```typescript
<ConditionGroup
  group={child}
  depth={depth + 1}
  fields={fields}
  validationErrors={validationErrors}
/>
```

**2. Recursive State Operations**
All tree operations use recursive traversal:
```typescript
const findAndUpdateRule = (
  group: QueryGroup,
  targetId: string,
  updater: (rule: QueryRule) => void
): boolean => {
  for (const child of group.children) {
    if (child.type === 'rule' && child.id === targetId) {
      updater(child)
      return true
    }
    if (child.type === 'group') {
      if (findAndUpdateRule(child, targetId, updater)) return true
    }
  }
  return false
}
```

**3. Recursive Query Generation**
The query engine traverses the same tree recursively to generate output:
```typescript
const groupToSQL = (group: QueryGroup, depth: number = 0): string => {
  const parts = group.children.map((child: QueryNode) => {
    if (child.type === 'rule') return ruleToSQL(child)
    return `(\n${groupToSQL(child, depth + 1)}\n)` // recursive
  })
  return parts.join(` ${group.logicalOperator} `)
}
```

**4. Recursive Validation**
The validator mirrors the same recursive pattern:
```typescript
const validateGroup = (group, schema, errors) => {
  group.children.forEach(child => {
    if (child.type === 'rule') validateRule(child, schema, errors)
    else validateGroup(child, schema, errors) // recursive
  })
}
```

This consistency between rendering, state, generation and validation is intentional — the recursive structure runs through the entire codebase.

---

## Trade-offs

**DnD scoped per group** : Each `ConditionGroup` has its own `DndContext`. This means you can only drag within a group, not across groups. The trade-off was simplicity and reliability over cross-group drag which would require a global DnD context and complex tree manipulation.

**Mock data only** : The query executor filters mock datasets. A real implementation would generate the query and send it to an actual database. The architecture is designed so `queryExecutor.ts` can be swapped for a real API call with minimal changes.

**No pagination on nested groups** : Very deeply nested trees (10+ levels) could cause performance issues. In practice query builders rarely exceed 3-4 levels of nesting.

**localStorage for history** : Query history persists via Zustand persist middleware to localStorage. This means history is browser-specific and not synced across devices.

---

## Git Workflow

This project enforces proper engineering workflow:

- All features developed on feature branches
- Minimum 9 pull requests opened and merged
- Descriptive PR titles and descriptions
- Clean commit history with meaningful messages
- No direct pushes to main

---

*Built by Jay Tech*