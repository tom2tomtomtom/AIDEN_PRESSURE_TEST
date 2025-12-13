# Phase 1: Foundation

**Estimated Duration:** 1 week
**Dependencies:** None
**Status:** 🔄 In Progress

## Phase Objectives

1. Set up Supabase project and database schema
2. Implement authentication with magic links
3. Create base UI components and layouts
4. Build project CRUD operations

## Prerequisites Checklist

- [x] Next.js 15 scaffolded
- [x] TypeScript configured (strict)
- [x] Tailwind + shadcn/ui set up
- [x] Dev-architect docs structure
- [x] Supabase project created (using shared AIDEN database)
- [x] Environment variables configured

---

## Tasks

### 1.1 Supabase Setup

**Status:** ✅ Complete
**Estimate:** 2 hours

#### Requirements
- [x] Create Supabase project (using shared AIDEN database)
- [x] Copy credentials to .env.local
- [x] Install @supabase/ssr package
- [x] Create lib/supabase/server.ts
- [x] Create lib/supabase/client.ts
- [x] Create lib/supabase/admin.ts
- [x] Verify connection

#### Files to Create/Modify
- `.env.local` (from .env.example)
- `lib/supabase/server.ts`
- `lib/supabase/client.ts`
- `lib/supabase/admin.ts`

#### Verification
- [x] Can connect to Supabase from server component
- [x] Can connect to Supabase from client component
- [x] Build passes with no TypeScript errors

---

### 1.2 Database Schema

**Status:** ✅ Complete
**Estimate:** 3 hours

#### Requirements
- [x] Create enums (org_role, project_category, test_status, etc.)
- [x] Create organizations table
- [x] Create organization_members table
- [x] Create projects table
- [x] Create persona_archetypes table
- [x] Create phantom_memories table
- [x] Create pressure_tests table
- [x] Create test_results table
- [x] Create persona_responses table
- [x] Add all indexes

#### Files Created
- `supabase/migrations/001_initial_schema.sql`

#### Notes
- Using dedicated `ppt` PostgreSQL schema to isolate from other AIDEN projects
- Schema exposed via `ALTER ROLE authenticator SET pgrst.db_schemas`

#### Verification
- [x] All tables created
- [x] Foreign keys working
- [x] Indexes applied
- [x] API access verified via scripts/verify-schema.mjs

---

### 1.3 Row Level Security

**Status:** ✅ Complete
**Estimate:** 2 hours

#### Requirements
- [x] Create is_org_member() helper function
- [x] Create is_org_admin() helper function
- [x] Create user_org_ids() helper function
- [x] Enable RLS on all tables
- [x] Create policies for organizations
- [x] Create policies for projects
- [x] Create policies for tests
- [x] Create read-only policies for persona system

#### Files Created
- `supabase/migrations/002_rls_policies.sql`

#### Verification
- [ ] User can only see own org data
- [ ] Archetypes/memories readable by all auth users
- [ ] Test results writable via service role only

---

### 1.4 Authentication Flow

**Status:** ✅ Complete
**Estimate:** 4 hours

#### Requirements
- [x] Create auth layout (centered, minimal)
- [x] Create login page with magic link form
- [x] Create auth callback handler
- [x] Create auth error page
- [x] Create middleware for route protection
- [x] Auto-create org on first login
- [x] Create sign-out functionality

#### Files Created/Modified
- `app/(auth)/layout.tsx`
- `app/(auth)/login/page.tsx`
- `app/(auth)/callback/route.ts`
- `app/(auth)/error/page.tsx`
- `lib/supabase/middleware.ts`
- `components/auth/sign-out-button.tsx`
- `components/ui/button.tsx` (shadcn)
- `components/ui/input.tsx` (shadcn)
- `components/ui/card.tsx` (shadcn)
- `components/ui/label.tsx` (shadcn)

#### Verification
- [x] Magic link form implemented
- [x] Callback exchanges code for session
- [x] New users get org created automatically
- [x] Protected routes redirect to /login
- [x] Sign out button component ready
- [x] Build passes

---

### 1.5 Dashboard Layout

**Status:** ✅ Complete
**Estimate:** 3 hours

#### Requirements
- [x] Create dashboard layout with header
- [x] Create sidebar navigation
- [x] Create user menu with sign out
- [x] Make responsive for mobile
- [x] Create dashboard home page

#### Files Created
- `app/(dashboard)/layout.tsx`
- `app/(dashboard)/dashboard/page.tsx`
- `components/layout/header.tsx`
- `components/layout/sidebar.tsx`
- `components/layout/user-menu.tsx`
- `components/layout/mobile-sidebar.tsx`

#### Verification
- [x] Layout renders correctly
- [x] Navigation works
- [x] User info displays
- [x] Mobile responsive (sheet sidebar)

---

### 1.6 Project CRUD

**Status:** ✅ Complete
**Estimate:** 4 hours

#### Requirements
- [x] Create projects list page
- [x] Create project card component
- [x] Create new project page
- [x] Create project form component
- [x] Create project detail page
- [x] Add edit functionality
- [x] Add archive/delete functionality

#### Files Created
- `app/(dashboard)/projects/page.tsx`
- `app/(dashboard)/projects/new/page.tsx`
- `app/(dashboard)/projects/[id]/page.tsx`
- `app/(dashboard)/projects/[id]/edit/page.tsx`
- `components/features/project-card.tsx`
- `components/features/delete-project-button.tsx`
- `components/forms/project-form.tsx`

#### API Routes
- `app/api/projects/route.ts` (GET, POST)
- `app/api/projects/[id]/route.ts` (GET, PATCH, DELETE)

#### Verification
- [x] Can list all projects
- [x] Can create new project
- [x] Can view project detail
- [x] Can edit project
- [x] Can archive/delete project (soft delete)

---

## Phase Completion Criteria

- [x] All tasks marked complete
- [x] All verifications passing
- [x] No TypeScript errors
- [x] No console errors
- [ ] Manual QA completed
- [ ] STATUS.md updated

## Phase Sign-off

**Completed:** [Date]
**Signed off by:** [Name]
**Notes:** [Carry-forward items]
