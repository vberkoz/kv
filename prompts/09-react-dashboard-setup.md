# Agent Prompt 9: React Dashboard Setup

## Required Skills
- **React 18+**: Hooks, Context API, component patterns, state management
- **Vite**: Configuration, dev server, build optimization, environment variables
- **React Router v6**: Nested routing, protected routes, navigation patterns
- **TypeScript**: React types, component props, API interfaces
- **Tailwind CSS**: Utility classes, responsive design, component styling
- **HTTP clients**: Fetch API, error handling, request interceptors

## Context & Dependencies
- Builds on: Prompt 1 (monorepo), Prompt 8 (Astro landing)
- Integrates with: Lambda functions (Prompt 3), Auth system (Prompt 6)
- Uses shared types from: packages/shared/types.ts
- API endpoints from: API Gateway (Prompt 4)

## Exact File Structure
```
packages/dashboard/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Layout.tsx
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Card.tsx
│   │   └── ProtectedRoute.tsx
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── SettingsPage.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── dashboard.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── index.html
```

## Required Dependencies (package.json)
```json
{
  "name": "@kv/dashboard",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "@kv/shared": "workspace:*"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.3.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

## Environment Variables & Configuration
```bash
# .env.development
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=KV Storage

# .env.production
VITE_API_URL=https://api.kv.vberkoz.com
VITE_APP_NAME=KV Storage
```

## Required Interfaces (types/dashboard.ts)
```typescript
import { User, Namespace } from '@kv/shared';

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export interface DashboardStats {
  requestCount: number;
  storageBytes: number;
  namespaceCount: number;
  planLimits: {
    maxRequests: number;
    maxStorage: number;
  };
}

export interface APIClient {
  get: <T>(url: string) => Promise<T>;
  post: <T>(url: string, data?: any) => Promise<T>;
  put: <T>(url: string, data?: any) => Promise<T>;
  delete: <T>(url: string) => Promise<T>;
}
```

## Implementation Requirements

### 1. Vite Configuration (vite.config.ts)
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});
```

### 2. Authentication Context Pattern
```typescript
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // JWT token management, login/logout logic
}
```

### 3. Protected Route Component
```typescript
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" />;
  
  return <>{children}</>;
}
```

## Routing Structure
- `/` - Redirect to dashboard or login
- `/login` - Login form
- `/dashboard` - Main dashboard (protected)
- `/settings` - Account settings (protected)
- `/api-keys` - API key management (protected)
- `/namespaces` - Namespace management (protected)

## UI Component Patterns
- **Consistent styling**: Tailwind utility classes
- **Reusable components**: Button, Input, Card, Modal
- **Responsive design**: Mobile-first approach
- **Loading states**: Spinners, skeletons
- **Error boundaries**: Graceful error handling

## Performance Targets
- Initial load: <2 seconds
- Route transitions: <200ms
- Bundle size: <500KB gzipped
- Lighthouse score: >90

## Success Criteria (Testable)
- [ ] `npm run dev` starts development server
- [ ] `npm run build` creates production bundle
- [ ] All routes render without errors
- [ ] Authentication context works properly
- [ ] Protected routes redirect unauthenticated users
- [ ] API client can make requests to backend
- [ ] Responsive design works on mobile/desktop
- [ ] TypeScript compilation passes

## Integration Points for Next Prompts
- Auth context will integrate with JWT tokens (Prompt 11)
- API client will call Lambda functions (Prompt 3)
- Dashboard components will show usage stats (Prompt 12)
- Layout will include navigation to all features