# Phase 3: Test Execution & Results

**Estimated Duration:** 2 weeks
**Dependencies:** Phase 2 complete
**Status:** ⏳ Pending

## Phase Objectives

1. Build test creation wizard
2. Implement LLM-powered test execution
3. Create results aggregation and analysis
4. Build results display UI

## Prerequisites Checklist

- [ ] Phase 2 signed off
- [ ] Persona engine working
- [ ] Memory retrieval tested
- [ ] Context builder validated

---

## Tasks

### 3.1 Claude API Client

**Status:** ⏳ Pending
**Estimate:** 2 hours

#### Requirements
- [ ] Create Anthropic client wrapper
- [ ] Add retry logic with exponential backoff
- [ ] Create completeJSON helper (parse + validate)
- [ ] Handle rate limits gracefully
- [ ] Log token usage

#### Files to Create
- `lib/anthropic/client.ts`

#### Verification
- [ ] Can make API calls
- [ ] Retry logic works
- [ ] JSON parsing handles edge cases

---

### 3.2 Prompt Templates

**Status:** ⏳ Pending
**Estimate:** 4 hours

#### Requirements
Create three prompt templates:

**Persona Response Prompt:**
- [ ] Identity section (name, archetype, demographics)
- [ ] Accumulated experiences (memory narrative)
- [ ] Skepticism level with instructions
- [ ] Stimulus presentation
- [ ] Dual-track response request
- [ ] JSON schema enforcement

**Group Dynamics Prompt:**
- [ ] Participant summaries
- [ ] Discussion flow simulation
- [ ] Opinion shift tracking
- [ ] Consensus/contention points
- [ ] Minority report

**Aggregated Analysis Prompt:**
- [ ] Pressure score calculation
- [ ] Gut attraction index
- [ ] Credibility score
- [ ] Key weaknesses with evidence
- [ ] Recommended refinements

#### Files to Create
- `lib/prompts/persona-response.ts`
- `lib/prompts/group-dynamics.ts`
- `lib/prompts/aggregated-analysis.ts`

#### Verification
- [ ] Prompts generate valid responses
- [ ] JSON output parses correctly
- [ ] Temperature settings appropriate

---

### 3.3 Test Creation UI

**Status:** ⏳ Pending
**Estimate:** 4 hours

#### Requirements
Build test creation wizard:
- [ ] Step 1: Test name and description
- [ ] Step 2: Stimulus input (concept/claim to test)
- [ ] Step 3: Panel selection (which archetypes)
- [ ] Step 4: Skepticism calibration
- [ ] Step 5: Review and launch

#### Files to Create
- `app/(dashboard)/projects/[id]/tests/new/page.tsx`
- `components/forms/test-wizard.tsx`
- `components/forms/panel-selector.tsx`
- `components/forms/skepticism-slider.tsx`

#### Verification
- [ ] Wizard flow works
- [ ] Can select archetypes
- [ ] Can adjust skepticism
- [ ] Creates test in draft status

---

### 3.4 Test Execution Engine

**Status:** ⏳ Pending
**Estimate:** 6 hours

#### Requirements
Build execution pipeline:
1. [ ] Validate test exists and user has access
2. [ ] Update status to 'running'
3. [ ] Build persona contexts for panel
4. [ ] Generate responses in parallel (Promise.all)
5. [ ] Run group dynamics simulation (optional)
6. [ ] Generate aggregated analysis
7. [ ] Store all results
8. [ ] Update status to 'completed'

Error handling:
- [ ] Retry failed persona generations
- [ ] Partial success handling
- [ ] Status update on failure

#### Files to Create
- `lib/test-execution/runner.ts`
- `lib/test-execution/response-generator.ts`
- `lib/test-execution/group-simulator.ts`
- `lib/test-execution/result-aggregator.ts`

#### Verification
- [ ] Full test executes successfully
- [ ] All persona responses generated
- [ ] Aggregated analysis produced
- [ ] Results stored correctly
- [ ] Execution < 60 seconds

---

### 3.5 Test Execution API

**Status:** ⏳ Pending
**Estimate:** 3 hours

#### Requirements
- [ ] POST /api/tests/[testId]/run - trigger execution
- [ ] Verify auth and ownership
- [ ] Return immediately with job ID
- [ ] Polling endpoint for status

#### Files to Create
- `app/api/tests/[testId]/run/route.ts`
- `app/api/tests/[testId]/status/route.ts`

#### Verification
- [ ] Can trigger test run
- [ ] Status updates correctly
- [ ] Handles concurrent requests

---

### 3.6 Results Storage

**Status:** ⏳ Pending
**Estimate:** 2 hours

#### Requirements
- [ ] Store test_results (aggregated scores)
- [ ] Store persona_responses (individual)
- [ ] Link triggered memories
- [ ] Store raw LLM outputs for debugging

#### Verification
- [ ] All data persisted
- [ ] Can retrieve results
- [ ] Relationships intact

---

### 3.7 Results Display UI

**Status:** ⏳ Pending
**Estimate:** 6 hours

#### Requirements
Build results dashboard:
- [ ] Summary scorecard (pressure score, gut attraction, credibility)
- [ ] Persona response cards (expandable)
- [ ] Weaknesses list with evidence
- [ ] Credibility gaps visualization
- [ ] Friction points ranked
- [ ] Recommendations section
- [ ] Export to PDF (future)

#### Files to Create
- `app/(dashboard)/projects/[id]/tests/[testId]/page.tsx`
- `components/results/score-card.tsx`
- `components/results/persona-response-card.tsx`
- `components/results/weaknesses-list.tsx`
- `components/results/recommendations.tsx`

#### Verification
- [ ] All scores display correctly
- [ ] Persona cards expand/collapse
- [ ] Weaknesses show evidence
- [ ] Mobile responsive

---

### 3.8 Test List & History

**Status:** ⏳ Pending
**Estimate:** 2 hours

#### Requirements
- [ ] List tests for project
- [ ] Show status badges
- [ ] Show scores summary
- [ ] Filter/sort options

#### Files to Create
- `components/features/test-list.tsx`
- `components/features/test-card.tsx`

#### Verification
- [ ] Lists all tests
- [ ] Status accurate
- [ ] Can navigate to results

---

## Phase Completion Criteria

- [ ] All tasks marked complete
- [ ] Full test execution working end-to-end
- [ ] Results display comprehensive
- [ ] Performance < 60s execution
- [ ] Error handling robust
- [ ] STATUS.md updated

## Phase Sign-off

**Completed:** [Date]
**Signed off by:** [Name]
**Notes:** [Carry-forward items]
