# Technology Stack

## Approved Versions

| Technology | Version | Lock Level | Notes |
|------------|---------|------------|-------|
| Node.js | 20.x LTS | Major | Do not use 21+ |
| Next.js | 15.x | Major | App Router only |
| React | 19.x | Major | With Server Components |
| TypeScript | 5.x | Major | Strict mode enabled |
| Tailwind CSS | 3.4.x | Minor | With Prettier plugin |
| Supabase JS | 2.x | Major | SSR package required |
| Anthropic SDK | 0.30.x | Minor | Claude Sonnet 4 |

## Package Lock

### Core Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@supabase/supabase-js": "^2.45.0",
    "@supabase/ssr": "^0.5.0",
    "@anthropic-ai/sdk": "^0.30.0"
  }
}
```

### UI Dependencies

```json
{
  "dependencies": {
    "tailwindcss": "^3.4.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0",
    "lucide-react": "^0.400.0"
  }
}
```

### Dev Dependencies

```json
{
  "devDependencies": {
    "typescript": "^5.6.0",
    "@types/react": "^18.3.0",
    "@types/node": "^20.0.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^15.0.0",
    "prettier": "^3.3.0",
    "prettier-plugin-tailwindcss": "^0.6.0"
  }
}
```

## Adding New Dependencies

Before adding ANY new package:
1. Check if functionality exists in current stack
2. Verify package is actively maintained (last update < 6 months)
3. Check bundle size impact
4. Document in this file under "Additional Dependencies"

### Approved Additional Dependencies

| Package | Purpose | Added Date |
|---------|---------|------------|
| `zod` | Schema validation | 2024-12-13 |
| `date-fns` | Date formatting | - |

### Explicitly Forbidden

| Package | Reason | Alternative |
|---------|--------|-------------|
| `moment` | Bundle size | `date-fns` |
| `lodash` | Tree-shaking issues | Native JS / ES6 |
| `axios` | Unnecessary | Native `fetch` |
| `styled-components` | Conflicts with Tailwind | Tailwind CSS |
| `redux` | Over-engineering | React state / Context |

## Environment Variables

### Required (Production)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Development Only

```bash
# Local Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...local
SUPABASE_SERVICE_ROLE_KEY=eyJ...local
```

## Database

| Aspect | Choice |
|--------|--------|
| Database | PostgreSQL 15 (via Supabase) |
| ORM | None (Supabase client direct) |
| Migrations | Supabase CLI |
| Types | Generated via `supabase gen types` |

## Infrastructure

| Service | Purpose | Tier |
|---------|---------|------|
| Supabase | Auth, DB, Storage | Pro |
| Railway | Hosting | Starter |
| Anthropic | LLM API | Standard |

## Build Configuration

### TypeScript (tsconfig.json)

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### ESLint

```json
{
  "extends": ["next/core-web-vitals", "next/typescript"]
}
```

## Performance Budgets

| Metric | Target |
|--------|--------|
| LCP | < 2.0s |
| FID | < 100ms |
| CLS | < 0.1 |
| Bundle Size (JS) | < 200KB gzipped |
| API Response | < 200ms (non-LLM) |
| Test Execution | < 60s |
