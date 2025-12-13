# PROGRESS.md - Sprint Tracking

> Phantom Pressure Test Development Progress
> Start Date: TBD
> Target Completion: 6 weeks from start

## Sprint Overview

| Sprint | Focus | Status | Completion |
|--------|-------|--------|------------|
| Week 1 | Foundation | ⬜ Not Started | 0% |
| Week 2 | Persona Engine | ⬜ Not Started | 0% |
| Week 3 | Test Execution | ⬜ Not Started | 0% |
| Week 4 | Group Dynamics & UI | ⬜ Not Started | 0% |
| Week 5 | Categories & Polish | ⬜ Not Started | 0% |
| Week 6 | Deployment & Launch | ⬜ Not Started | 0% |

---

## Week 1: Foundation

**Goal:** Database, auth, basic UI shell

### Day 1-2: Database Setup

- [ ] Create Supabase project
- [ ] Create `organizations` table
- [ ] Create `organization_members` table
- [ ] Create `projects` table
- [ ] Create `persona_archetypes` table
- [ ] Create `memory_banks` table
- [ ] Create `phantom_memories` table
- [ ] Create `pressure_tests` table
- [ ] Create `test_results` table
- [ ] Create `persona_responses` table
- [ ] Configure all indexes
- [ ] Enable RLS on all tables
- [ ] Create RLS policies for organizations
- [ ] Create RLS policies for projects
- [ ] Create RLS policies for tests
- [ ] Test RLS policies work correctly

**Blockers:** None

**Notes:**
```
[Add notes here during development]
```

### Day 3: Next.js Project Setup

- [ ] Initialize Next.js 15 with App Router
- [ ] Configure TypeScript strict mode
- [ ] Install and configure Tailwind CSS
- [ ] Install and configure shadcn/ui
- [ ] Set up Supabase client helpers
- [ ] Create environment variable schema
- [ ] Set up folder structure per CLAUDE.md
- [ ] Generate Supabase types
- [ ] Create basic layout component

**Blockers:** None

**Notes:**
```
[Add notes here during development]
```

### Day 4: Authentication

- [ ] Configure Supabase Auth (magic links)
- [ ] Create `/login` page
- [ ] Create `/register` page
- [ ] Implement auth callback handler
- [ ] Create middleware for protected routes
- [ ] Create auth context/hooks
- [ ] Test login flow
- [ ] Test logout flow
- [ ] Test session persistence

**Blockers:** None

**Notes:**
```
[Add notes here during development]
```

### Day 5: Dashboard & Projects CRUD

- [ ] Create dashboard layout
- [ ] Create sidebar navigation
- [ ] Create projects list page
- [ ] Create project detail page
- [ ] Implement create project form
- [ ] Implement edit project form
- [ ] Implement delete project
- [ ] Create organization selector (if multi-org)
- [ ] Test all CRUD operations

**Blockers:** None

**Notes:**
```
[Add notes here during development]
```

### Week 1 Deliverables Checklist

- [ ] ✅ Supabase database fully configured
- [ ] ✅ RLS policies working
- [ ] ✅ Auth flow complete
- [ ] ✅ Dashboard accessible
- [ ] ✅ Projects CRUD functional

---

## Week 2: Persona Engine

**Goal:** Complete phantom memory system with 8 archetypes

### Day 1: Seed Persona Archetypes

- [ ] Create `supabase/seed/persona-archetypes.sql`
- [ ] Seed "Skeptical Switcher" archetype
- [ ] Seed "Budget Conscious Pragmatist" archetype
- [ ] Seed "Premium Believer" archetype
- [ ] Seed "Social Proof Seeker" archetype
- [ ] Seed "Category Cynic" archetype
- [ ] Seed "Hopeful Newcomer" archetype
- [ ] Seed "Loyal Defender" archetype
- [ ] Seed "Deal Hunter" archetype
- [ ] Verify all archetypes have complete demographics
- [ ] Verify all archetypes have complete psychographics
- [ ] Run seed script successfully

**Blockers:** None

**Notes:**
```
[Add notes here during development]
```

### Day 2-3: FMCG Phantom Memories

- [ ] Create `supabase/seed/phantom-memories-fmcg.sql`
- [ ] Create FMCG memory bank
- [ ] Seed 25-30 memories for Skeptical Switcher
- [ ] Seed 25-30 memories for Budget Pragmatist
- [ ] Seed 25-30 memories for Premium Believer
- [ ] Seed 25-30 memories for Social Proof Seeker
- [ ] Seed 25-30 memories for Category Cynic
- [ ] Seed 25-30 memories for Hopeful Newcomer
- [ ] Seed 25-30 memories for Loyal Defender
- [ ] Seed 25-30 memories for Deal Hunter
- [ ] Verify trigger_keywords populated
- [ ] Verify emotional_residue values set
- [ ] Verify trust_modifier values set

**Blockers:** None

**Notes:**
```
Memory types to include for each archetype:
- Brand betrayal (reformulation, price increases, quality drops)
- Price shock (unexpected costs, shrinkflation)
- Trust erosion (false claims, greenwashing)
- Competitive experience (tried alternatives)
- Category fatigue (all brands seem the same)
- Positive surprises (rare delights to balance skepticism)
```

### Day 4: Memory Management UI

- [ ] Create persona archetypes list page
- [ ] Create archetype detail view
- [ ] Display phantom memories for archetype
- [ ] Create memory bank selector
- [ ] Implement memory search/filter
- [ ] Create read-only memory viewer
- [ ] (Optional) Create memory editor for admins

**Blockers:** None

**Notes:**
```
[Add notes here during development]
```

### Day 5: Memory Retrieval System

- [ ] Create `lib/persona/memory-retrieval.ts`
- [ ] Implement trigger keyword matching
- [ ] Implement memory relevance scoring
- [ ] Implement memory selection (top N relevant)
- [ ] Create memory context builder
- [ ] Write unit tests for retrieval
- [ ] Test with sample stimuli

**Blockers:** None

**Notes:**
```
[Add notes here during development]
```

### Week 2 Deliverables Checklist

- [ ] ✅ 8 archetypes seeded with full profiles
- [ ] ✅ 200+ phantom memories for FMCG category
- [ ] ✅ Memory retrieval system working
- [ ] ✅ Persona management UI functional

---

## Week 3: Test Execution Engine

**Goal:** Core LLM integration and test execution

### Day 1-2: Prompt Templates

- [ ] Create `lib/prompts/persona-response.ts`
- [ ] Implement persona context builder
- [ ] Implement memory narrative builder
- [ ] Implement skepticism calibration
- [ ] Create dual-track response schema
- [ ] Test prompt generates valid JSON
- [ ] Iterate on prompt for better responses

**Blockers:** None

**Notes:**
```
[Add notes here during development]
```

### Day 2-3: Test Execution API

- [ ] Create `app/api/tests/route.ts` (POST)
- [ ] Create `app/api/tests/[testId]/route.ts` (GET)
- [ ] Create `app/api/tests/[testId]/run/route.ts`
- [ ] Implement test creation logic
- [ ] Implement test status management
- [ ] Implement persona response generation
- [ ] Store responses in database
- [ ] Handle errors gracefully
- [ ] Implement retry logic for LLM calls

**Blockers:** Anthropic API key required

**Notes:**
```
[Add notes here during development]
```

### Day 4: Aggregated Analysis

- [ ] Create `lib/prompts/aggregated-analysis.ts`
- [ ] Define analysis output schema
- [ ] Implement pressure score calculation
- [ ] Implement credibility gap detection
- [ ] Implement friction point ranking
- [ ] Implement recommendation generation
- [ ] Test analysis with sample responses

**Blockers:** None

**Notes:**
```
[Add notes here during development]
```

### Day 5: End-to-End Testing

- [ ] Create test fixture with sample stimulus
- [ ] Execute full test flow manually
- [ ] Verify persona responses quality
- [ ] Verify analysis output quality
- [ ] Measure execution time
- [ ] Fix any issues found
- [ ] Document any edge cases

**Blockers:** None

**Notes:**
```
[Add notes here during development]
```

### Week 3 Deliverables Checklist

- [ ] ✅ Persona response prompt generating quality responses
- [ ] ✅ Test execution API working end-to-end
- [ ] ✅ Aggregated analysis producing actionable insights
- [ ] ✅ < 60 second execution time for 6 personas

---

## Week 4: Group Dynamics & UI

**Goal:** Group simulation and complete results display

### Day 1-2: Group Dynamics

- [ ] Create `lib/prompts/group-dynamics.ts`
- [ ] Define group dynamics output schema
- [ ] Implement influence pattern detection
- [ ] Implement opinion shift tracking
- [ ] Implement consensus formation analysis
- [ ] Implement minority report extraction
- [ ] Test with varied persona combinations
- [ ] Integrate into test execution flow

**Blockers:** None

**Notes:**
```
[Add notes here during development]
```

### Day 3: Test Creation Wizard

- [ ] Create `app/(dashboard)/projects/[projectId]/tests/new/page.tsx`
- [ ] Implement Step 1: Test name and type
- [ ] Implement Step 2: Stimulus input
- [ ] Implement Step 3: Panel configuration
- [ ] Create archetype selector component
- [ ] Create skepticism calibration slider
- [ ] Create group dynamics toggle
- [ ] Implement form validation
- [ ] Implement form submission

**Blockers:** None

**Notes:**
```
[Add notes here during development]
```

### Day 4-5: Results Dashboard

- [ ] Create `app/(dashboard)/projects/[projectId]/tests/[testId]/page.tsx`
- [ ] Create PressureScoreCard component
- [ ] Create ScoreCard component (gut, credibility)
- [ ] Create WeaknessesList component
- [ ] Create CredibilityGapChart component
- [ ] Create FrictionPointsList component
- [ ] Create PersonaResponseCard component
- [ ] Create MinorityReportSection component
- [ ] Create RecommendationsPanel component
- [ ] Create loading state (test running)
- [ ] Implement real-time status updates

**Blockers:** None

**Notes:**
```
[Add notes here during development]
```

### Week 4 Deliverables Checklist

- [ ] ✅ Group dynamics generating influence patterns
- [ ] ✅ Test creation wizard fully functional
- [ ] ✅ Results dashboard showing all metrics
- [ ] ✅ Real-time test status updates working

---

## Week 5: Categories & Polish

**Goal:** Additional categories and UI refinement

### Day 1-2: Services Category

- [ ] Create Services memory bank
- [ ] Seed 25-30 memories per archetype for Services
- [ ] Test retrieval for Services category
- [ ] Verify responses appropriate for Services

**Notes:**
```
Services memories should focus on:
- Customer service experiences
- Subscription fatigue
- Hidden fees
- Over-promising
- Contract frustrations
```

### Day 3: Premium Category

- [ ] Create Premium memory bank
- [ ] Seed 25-30 memories per archetype for Premium
- [ ] Test retrieval for Premium category
- [ ] Verify responses appropriate for Premium

**Notes:**
```
Premium memories should focus on:
- Luxury disappointments
- Status purchases
- Quality expectations
- Price justification needs
- Premium vs mainstream comparisons
```

### Day 4: Skepticism Calibration Tuning

- [ ] Test low skepticism responses
- [ ] Test medium skepticism responses
- [ ] Test high skepticism responses
- [ ] Test extreme skepticism responses
- [ ] Tune prompt instructions per level
- [ ] Verify differentiation between levels
- [ ] Document calibration guidelines

**Blockers:** None

**Notes:**
```
[Add notes here during development]
```

### Day 5: UI Polish & User Testing

- [ ] Review all pages for consistency
- [ ] Improve loading states
- [ ] Improve error states
- [ ] Add empty states
- [ ] Test responsive design
- [ ] Conduct internal user testing
- [ ] Document feedback
- [ ] Prioritize fixes for Week 6

**Blockers:** None

**Notes:**
```
[Add notes here during development]
```

### Week 5 Deliverables Checklist

- [ ] ✅ 3 categories fully supported (FMCG, Services, Premium)
- [ ] ✅ Skepticism calibration producing differentiated results
- [ ] ✅ UI polished and consistent
- [ ] ✅ User testing feedback documented

---

## Week 6: Deployment & Launch

**Goal:** Production deployment and pilot users

### Day 1: Railway Setup

- [ ] Create Railway project
- [ ] Connect GitHub repository
- [ ] Configure build settings
- [ ] Set environment variables
- [ ] Deploy initial version
- [ ] Verify health check working
- [ ] Test deployment successful

**Blockers:** Railway account required

**Notes:**
```
[Add notes here during development]
```

### Day 2: Production Configuration

- [ ] Configure custom domain
- [ ] Set up SSL certificate
- [ ] Configure production Supabase
- [ ] Migrate database schema
- [ ] Run seed data
- [ ] Verify production auth flow
- [ ] Test production LLM calls

**Blockers:** None

**Notes:**
```
[Add notes here during development]
```

### Day 3: Performance & Monitoring

- [ ] Run load test (10 concurrent tests)
- [ ] Optimize slow queries
- [ ] Add error tracking (Sentry optional)
- [ ] Set up uptime monitoring
- [ ] Review and optimize bundle size
- [ ] Test under various network conditions

**Blockers:** None

**Notes:**
```
[Add notes here during development]
```

### Day 4: Documentation & Handoff

- [ ] Complete API documentation
- [ ] Create user guide
- [ ] Document deployment process
- [ ] Create troubleshooting guide
- [ ] Review all code documentation
- [ ] Prepare demo script

**Blockers:** None

**Notes:**
```
[Add notes here during development]
```

### Day 5: Pilot Launch

- [ ] Invite 3-5 pilot users
- [ ] Onboard first pilot user
- [ ] Monitor first live tests
- [ ] Collect initial feedback
- [ ] Address critical issues
- [ ] Celebrate launch 🎉

**Blockers:** None

**Notes:**
```
[Add notes here during development]
```

### Week 6 Deliverables Checklist

- [ ] ✅ Production deployment live
- [ ] ✅ Custom domain configured
- [ ] ✅ Monitoring in place
- [ ] ✅ Documentation complete
- [ ] ✅ Pilot users onboarded and testing

---

## Retrospective Notes

### What Worked Well
```
[Add after each sprint]
```

### What Could Improve
```
[Add after each sprint]
```

### Technical Debt Incurred
```
[Track items to address post-MVP]
```

### Scope Changes
```
[Document any scope additions or removals]
```
