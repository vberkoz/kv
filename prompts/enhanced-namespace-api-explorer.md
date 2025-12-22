# Q Dev Prompt: Enhanced Namespace Details with Integrated API Explorer

## Objective
Replace the standalone API Explorer with an integrated testing interface within namespace details. Transform the current NamespacesPage into a comprehensive namespace management and API testing hub.

## Requirements

### 1. Enhanced Namespace Management
- **List View**: Show all namespaces with click-to-expand details
- **Detail View**: Expandable sections showing namespace contents and API testing
- **Stored Items**: Display existing keys/values in each namespace
- **Real-time Updates**: Refresh data after API operations

### 2. Integrated API Explorer
- **Pre-filled Context**: Namespace and API key automatically populated
- **All CRUD Operations**: GET, PUT, DELETE, LIST with dedicated interfaces
- **Operation Tabs**: Tabbed interface for different request types
- **Live Testing**: Execute requests and display responses
- **Code Examples**: Dynamic code generation for all operations

### 3. User Experience Flow
1. User sees list of namespaces
2. Clicks namespace to expand details
3. Views stored items in that namespace
4. Tests API operations with pre-filled context
5. Copies generated code examples

## Implementation Tasks

### Task 1: Remove Standalone API Explorer
- Delete `packages/dashboard/src/pages/ApiExplorerPage.tsx`
- Remove `/explorer` route from `App.tsx`
- Remove "API Explorer" link from `DashboardLayout.tsx` sidebar

### Task 2: Create Enhanced Namespace Components
Create new components:
- `NamespaceDetails.tsx` - Expandable namespace detail view
- `ApiTester.tsx` - Integrated API testing interface
- `StoredItems.tsx` - Display existing keys/values
- `CodeExamples.tsx` - Multi-language code generation

### Task 3: Enhance API Hooks
Extend `useApi.ts` with:
- `useNamespaceKeys(namespace)` - Fetch keys for a namespace
- `useGetValue(namespace, key)` - Get specific value
- `usePutValue()` - Store value
- `useDeleteValue()` - Delete value

### Task 4: Update NamespacesPage
Transform into comprehensive namespace management:
- Collapsible namespace cards
- Integrated API testing per namespace
- Real-time data updates
- Responsive design

## Technical Specifications

### API Operations Interface
```typescript
interface ApiOperation {
  type: 'GET' | 'PUT' | 'DELETE' | 'LIST';
  namespace: string;
  key?: string;
  value?: any;
}
```

### Code Example Languages
- cURL commands
- JavaScript/TypeScript (fetch API)
- Python (requests library)

### UI Components Structure
```
NamespacesPage
├── NamespaceCard (for each namespace)
│   ├── NamespaceHeader (name, created date, expand button)
│   └── NamespaceDetails (when expanded)
│       ├── StoredItems (list of keys/values)
│       ├── ApiTester (tabbed interface)
│       │   ├── GetTab (key selector, test button)
│       │   ├── PutTab (key input, value editor)
│       │   ├── DeleteTab (key selector)
│       │   └── ListTab (list all keys)
│       └── CodeExamples (language tabs, generated code)
```

### State Management
- Use React Query for API state
- Local state for UI interactions (expanded namespaces, active tabs)
- Optimistic updates for better UX

## Success Criteria
- [ ] Standalone API Explorer completely removed
- [ ] Namespace details show stored items
- [ ] All CRUD operations work within namespace context
- [ ] Code examples generate for all operation types
- [ ] Responsive design works on mobile/desktop
- [ ] Real-time updates after API operations
- [ ] Error handling for all operations
- [ ] Loading states for async operations

## Files to Modify/Create
- **Delete**: `src/pages/ApiExplorerPage.tsx`
- **Modify**: `src/App.tsx`, `src/components/layout/DashboardLayout.tsx`, `src/pages/NamespacesPage.tsx`, `src/hooks/useApi.ts`
- **Create**: `src/components/NamespaceDetails.tsx`, `src/components/ApiTester.tsx`, `src/components/StoredItems.tsx`, `src/components/CodeExamples.tsx`

This enhancement will provide a more intuitive, context-aware API testing experience directly within the namespace management interface.