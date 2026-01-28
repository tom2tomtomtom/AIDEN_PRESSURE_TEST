/**
 * UI Demo Walkthrough
 * Captures screenshots of the complete user journey
 */

import { chromium } from 'playwright'
import { createClient } from '@supabase/supabase-js'
import path from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const DEMO_DIR = path.join(process.cwd(), 'tests/demo/screenshots')

async function runDemo() {
  console.log('🎬 Starting UI Demo Walkthrough\n')

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  })
  const page = await context.newPage()

  // Ensure screenshots directory exists
  const fs = await import('fs')
  if (!fs.existsSync(DEMO_DIR)) {
    fs.mkdirSync(DEMO_DIR, { recursive: true })
  }

  try {
    // ============================================
    // STEP 1: Landing Page
    // ============================================
    console.log('📸 Step 1: Landing Page')
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `${DEMO_DIR}/01-landing-page.png`, fullPage: true })
    console.log('   ✅ Screenshot: 01-landing-page.png\n')

    // ============================================
    // STEP 2: Login Page
    // ============================================
    console.log('📸 Step 2: Login Page')
    await page.goto('http://localhost:3000/login')
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `${DEMO_DIR}/02-login-page.png`, fullPage: true })
    console.log('   ✅ Screenshot: 02-login-page.png\n')

    // ============================================
    // STEP 3: Authenticate via Supabase (bypass UI)
    // ============================================
    console.log('🔐 Step 3: Setting up authenticated session...')

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Get test user
    const testEmail = 'demo@phantomtest.local'
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    let testUser = existingUsers?.users?.find(u => u.email === testEmail)

    if (!testUser) {
      const { data: newUser } = await supabase.auth.admin.createUser({
        email: testEmail,
        email_confirm: true,
        user_metadata: { full_name: 'Demo User' }
      })
      testUser = newUser?.user
    }

    // Get/create org
    const { data: membership } = await supabase
      .schema('ppt')
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', testUser!.id)
      .single()

    let orgId = membership?.organization_id
    if (!orgId) {
      const { data: newOrg } = await supabase
        .schema('ppt')
        .from('organizations')
        .insert({ name: 'Demo Organization', slug: `demo-org-${Date.now()}` })
        .select('id')
        .single()
      orgId = newOrg!.id

      await supabase
        .schema('ppt')
        .from('organization_members')
        .insert({ organization_id: orgId, user_id: testUser!.id, role: 'owner' })
    }

    // Create a demo project
    const projectName = `Demo Project - ${new Date().toLocaleTimeString()}`
    const { data: project } = await supabase
      .schema('ppt')
      .from('projects')
      .insert({
        organization_id: orgId,
        name: projectName,
        description: 'Demo project for UI walkthrough',
        category: 'fmcg'
      })
      .select()
      .single()

    console.log(`   ✅ Created project: ${project!.name}\n`)

    // Get archetypes for panel selection
    const { data: archetypes } = await supabase
      .schema('ppt')
      .from('persona_archetypes')
      .select('id, name, slug')
      .limit(4)

    // Create a pressure test
    const stimulus = `
Introducing "Pure Balance" - A revolutionary probiotic yogurt made with organic grass-fed milk and 12 active cultures.

Key Features:
• 15g of protein per serving
• Only 5g of natural sugars
• "Clinically proven to support digestive health"
• Made with milk from farms within 50 miles
• "No artificial anything - ever"

Price: $6.99 for a 4-pack (vs $4.99 for leading competitor)
    `.trim()

    const { data: pressureTest } = await supabase
      .schema('ppt')
      .from('pressure_tests')
      .insert({
        project_id: project!.id,
        name: 'Premium Yogurt Concept Test',
        stimulus_type: 'concept',
        stimulus_content: stimulus,
        panel_config: {
          archetypes: archetypes!.map(a => a.id),
          skepticism_override: 'medium',
          panel_size: archetypes!.length
        },
        status: 'draft'
      })
      .select()
      .single()

    console.log(`   ✅ Created pressure test: ${pressureTest!.name}\n`)

    // ============================================
    // STEP 4: Show Projects List (simulated)
    // ============================================
    console.log('📸 Step 4: Projects Dashboard')

    // Create HTML mock of authenticated dashboard
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Projects - Phantom Pressure Test</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: system-ui, -apple-system, sans-serif; background: #0a0a0a; color: white; }
          .header { padding: 16px 24px; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; }
          .logo { font-size: 20px; font-weight: bold; }
          .nav { display: flex; gap: 24px; }
          .nav a { color: #888; text-decoration: none; }
          .nav a.active { color: white; }
          .container { max-width: 1200px; margin: 0 auto; padding: 32px 24px; }
          h1 { font-size: 28px; margin-bottom: 24px; }
          .projects { display: grid; gap: 16px; }
          .project-card { background: #151515; border: 1px solid #333; border-radius: 12px; padding: 24px; }
          .project-card h3 { font-size: 18px; margin-bottom: 8px; }
          .project-card p { color: #888; font-size: 14px; margin-bottom: 16px; }
          .project-card .meta { display: flex; gap: 16px; font-size: 12px; color: #666; }
          .badge { background: #1a1a2e; color: #6366f1; padding: 4px 12px; border-radius: 16px; font-size: 12px; }
          .btn { background: #6366f1; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; }
          .user { display: flex; align-items: center; gap: 8px; }
          .avatar { width: 32px; height: 32px; background: #6366f1; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">👻 Phantom Pressure Test</div>
          <div class="nav">
            <a href="#" class="active">Projects</a>
            <a href="#">Archetypes</a>
            <a href="#">Settings</a>
          </div>
          <div class="user">
            <div class="avatar">D</div>
            <span>Demo User</span>
          </div>
        </div>
        <div class="container">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
            <h1>Your Projects</h1>
            <button class="btn">+ New Project</button>
          </div>
          <div class="projects">
            <div class="project-card">
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                  <h3>${projectName}</h3>
                  <p>Demo project for UI walkthrough</p>
                </div>
                <span class="badge">FMCG</span>
              </div>
              <div class="meta">
                <span>1 test</span>
                <span>•</span>
                <span>Created just now</span>
              </div>
            </div>
            <div class="project-card" style="opacity: 0.6;">
              <div style="display: flex; justify-content: space-between; align-items: start;">
                <div>
                  <h3>Q1 Campaign Tests</h3>
                  <p>Testing new campaign messaging for Q1 launch</p>
                </div>
                <span class="badge">CPG</span>
              </div>
              <div class="meta">
                <span>5 tests</span>
                <span>•</span>
                <span>2 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `)
    await page.screenshot({ path: `${DEMO_DIR}/03-projects-dashboard.png`, fullPage: true })
    console.log('   ✅ Screenshot: 03-projects-dashboard.png\n')

    // ============================================
    // STEP 5: Create Test Wizard
    // ============================================
    console.log('📸 Step 5: Test Creation Wizard')

    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Create Test - Phantom Pressure Test</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: system-ui, -apple-system, sans-serif; background: #0a0a0a; color: white; }
          .header { padding: 16px 24px; border-bottom: 1px solid #333; }
          .logo { font-size: 20px; font-weight: bold; }
          .container { max-width: 800px; margin: 0 auto; padding: 32px 24px; }
          .breadcrumb { color: #666; font-size: 14px; margin-bottom: 24px; }
          .breadcrumb a { color: #6366f1; text-decoration: none; }
          h1 { font-size: 28px; margin-bottom: 8px; }
          .subtitle { color: #888; margin-bottom: 32px; }
          .form-group { margin-bottom: 24px; }
          label { display: block; font-size: 14px; font-weight: 500; margin-bottom: 8px; }
          input, textarea, select { width: 100%; background: #151515; border: 1px solid #333; border-radius: 8px; padding: 12px 16px; color: white; font-size: 14px; }
          textarea { min-height: 200px; font-family: inherit; }
          .type-selector { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
          .type-option { background: #151515; border: 2px solid #333; border-radius: 8px; padding: 16px; text-align: center; cursor: pointer; }
          .type-option.selected { border-color: #6366f1; background: #1a1a2e; }
          .type-option .icon { font-size: 24px; margin-bottom: 8px; }
          .btn { background: #6366f1; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; }
          .btn-secondary { background: transparent; border: 1px solid #333; }
          .actions { display: flex; justify-content: space-between; margin-top: 32px; padding-top: 24px; border-top: 1px solid #333; }
          .steps { display: flex; gap: 8px; margin-bottom: 32px; }
          .step { padding: 8px 16px; border-radius: 20px; font-size: 12px; background: #151515; }
          .step.active { background: #6366f1; }
          .step.done { background: #22c55e; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">👻 Phantom Pressure Test</div>
        </div>
        <div class="container">
          <div class="breadcrumb">
            <a href="#">Projects</a> / <a href="#">${projectName}</a> / New Test
          </div>

          <div class="steps">
            <span class="step active">1. Stimulus</span>
            <span class="step">2. Panel</span>
            <span class="step">3. Settings</span>
            <span class="step">4. Review</span>
          </div>

          <h1>What are you testing?</h1>
          <p class="subtitle">Enter the marketing concept, ad copy, or claim you want to pressure test</p>

          <div class="form-group">
            <label>Test Name</label>
            <input type="text" value="Premium Yogurt Concept Test" />
          </div>

          <div class="form-group">
            <label>Stimulus Type</label>
            <div class="type-selector">
              <div class="type-option selected">
                <div class="icon">💡</div>
                <div>Concept</div>
              </div>
              <div class="type-option">
                <div class="icon">📝</div>
                <div>Ad Copy</div>
              </div>
              <div class="type-option">
                <div class="icon">✓</div>
                <div>Claim</div>
              </div>
              <div class="type-option">
                <div class="icon">📢</div>
                <div>Campaign</div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Your Stimulus</label>
            <textarea>${stimulus}</textarea>
          </div>

          <div class="actions">
            <button class="btn btn-secondary">Cancel</button>
            <button class="btn">Next: Select Panel →</button>
          </div>
        </div>
      </body>
      </html>
    `)
    await page.screenshot({ path: `${DEMO_DIR}/04-create-test-stimulus.png`, fullPage: true })
    console.log('   ✅ Screenshot: 04-create-test-stimulus.png\n')

    // ============================================
    // STEP 6: Panel Selection
    // ============================================
    console.log('📸 Step 6: Panel Selection')

    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Select Panel - Phantom Pressure Test</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: system-ui, -apple-system, sans-serif; background: #0a0a0a; color: white; }
          .header { padding: 16px 24px; border-bottom: 1px solid #333; }
          .logo { font-size: 20px; font-weight: bold; }
          .container { max-width: 1000px; margin: 0 auto; padding: 32px 24px; }
          h1 { font-size: 28px; margin-bottom: 8px; }
          .subtitle { color: #888; margin-bottom: 32px; }
          .archetypes { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .archetype { background: #151515; border: 2px solid #333; border-radius: 12px; padding: 20px; cursor: pointer; }
          .archetype.selected { border-color: #6366f1; background: #1a1a2e; }
          .archetype-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px; }
          .archetype h3 { font-size: 16px; }
          .skepticism { font-size: 11px; padding: 4px 8px; border-radius: 12px; }
          .skepticism.high { background: #dc2626; }
          .skepticism.medium { background: #f59e0b; }
          .skepticism.low { background: #22c55e; }
          .archetype p { color: #888; font-size: 13px; line-height: 1.5; }
          .archetype .traits { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
          .trait { background: #252525; padding: 4px 10px; border-radius: 12px; font-size: 11px; color: #aaa; }
          .checkbox { width: 20px; height: 20px; border: 2px solid #333; border-radius: 4px; display: flex; align-items: center; justify-content: center; }
          .archetype.selected .checkbox { background: #6366f1; border-color: #6366f1; }
          .btn { background: #6366f1; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; }
          .btn-secondary { background: transparent; border: 1px solid #333; }
          .actions { display: flex; justify-content: space-between; margin-top: 32px; padding-top: 24px; border-top: 1px solid #333; }
          .steps { display: flex; gap: 8px; margin-bottom: 32px; }
          .step { padding: 8px 16px; border-radius: 20px; font-size: 12px; background: #151515; }
          .step.active { background: #6366f1; }
          .step.done { background: #22c55e; }
          .panel-summary { background: #151515; border-radius: 8px; padding: 16px; margin-top: 24px; }
          .panel-summary h4 { font-size: 14px; margin-bottom: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">👻 Phantom Pressure Test</div>
        </div>
        <div class="container">
          <div class="steps">
            <span class="step done">1. Stimulus ✓</span>
            <span class="step active">2. Panel</span>
            <span class="step">3. Settings</span>
            <span class="step">4. Review</span>
          </div>

          <h1>Select Your Panel</h1>
          <p class="subtitle">Choose consumer archetypes to evaluate your concept</p>

          <div class="archetypes">
            <div class="archetype selected">
              <div class="archetype-header">
                <div>
                  <h3>🔍 Skeptical Switcher</h3>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <span class="skepticism high">High Skepticism</span>
                  <div class="checkbox">✓</div>
                </div>
              </div>
              <p>Brand-agnostic consumer who questions marketing claims and switches easily based on value perception.</p>
              <div class="traits">
                <span class="trait">Price-conscious</span>
                <span class="trait">Research-driven</span>
                <span class="trait">Skeptical of claims</span>
              </div>
            </div>

            <div class="archetype selected">
              <div class="archetype-header">
                <div>
                  <h3>💚 Loyal Defender</h3>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <span class="skepticism low">Low Skepticism</span>
                  <div class="checkbox">✓</div>
                </div>
              </div>
              <p>Brand-loyal consumer who trusts established brands and is resistant to switching without strong reasons.</p>
              <div class="traits">
                <span class="trait">Brand loyal</span>
                <span class="trait">Quality-focused</span>
                <span class="trait">Trusting</span>
              </div>
            </div>

            <div class="archetype selected">
              <div class="archetype-header">
                <div>
                  <h3>📱 Trend Follower</h3>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <span class="skepticism medium">Medium Skepticism</span>
                  <div class="checkbox">✓</div>
                </div>
              </div>
              <p>Socially-influenced consumer who follows trends and values peer recommendations and social proof.</p>
              <div class="traits">
                <span class="trait">Social media active</span>
                <span class="trait">Trend-aware</span>
                <span class="trait">Influencer-driven</span>
              </div>
            </div>

            <div class="archetype selected">
              <div class="archetype-header">
                <div>
                  <h3>💰 Budget Optimizer</h3>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                  <span class="skepticism high">High Skepticism</span>
                  <div class="checkbox">✓</div>
                </div>
              </div>
              <p>Value-maximizing consumer who carefully weighs cost vs. benefit and needs clear ROI justification.</p>
              <div class="traits">
                <span class="trait">Deal-seeker</span>
                <span class="trait">Comparison shopper</span>
                <span class="trait">ROI-focused</span>
              </div>
            </div>
          </div>

          <div class="panel-summary">
            <h4>Panel Summary</h4>
            <p style="color: #888; font-size: 14px;">4 archetypes selected • Estimated run time: ~45 seconds</p>
          </div>

          <div class="actions">
            <button class="btn btn-secondary">← Back</button>
            <button class="btn">Next: Settings →</button>
          </div>
        </div>
      </body>
      </html>
    `)
    await page.screenshot({ path: `${DEMO_DIR}/05-panel-selection.png`, fullPage: true })
    console.log('   ✅ Screenshot: 05-panel-selection.png\n')

    // ============================================
    // STEP 7: Run the actual test
    // ============================================
    console.log('🚀 Step 7: Running actual pressure test...')
    console.log('   (This calls Claude API and takes ~45 seconds)\n')

    const { executeTest, loadTestConfig } = await import('../../lib/test-execution/runner')
    const config = await loadTestConfig(pressureTest!.id)

    if (!config) {
      throw new Error('Failed to load test config')
    }

    const result = await executeTest(config)
    console.log(`   ✅ Test completed in ${(result.totalDurationMs / 1000).toFixed(1)}s\n`)

    // ============================================
    // STEP 8: Results Dashboard
    // ============================================
    console.log('📸 Step 8: Results Dashboard')

    const pressureScore = result.aggregation?.analysis?.pressure_score || 0
    const gutIndex = result.aggregation?.analysis?.gut_attraction_index || 0
    const credScore = result.aggregation?.analysis?.credibility_score || 0
    const verdict = result.aggregation?.analysis?.one_line_verdict || 'Analysis complete'
    const wouldProceed = result.aggregation?.analysis?.would_proceed ? 'Yes' : 'No'

    const strengths = result.aggregation?.analysis?.key_strengths || []
    const weaknesses = result.aggregation?.analysis?.key_weaknesses || []
    const recommendations = result.aggregation?.analysis?.recommendations || []

    const responses = result.responses || []

    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Test Results - Phantom Pressure Test</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: system-ui, -apple-system, sans-serif; background: #0a0a0a; color: white; }
          .header { padding: 16px 24px; border-bottom: 1px solid #333; }
          .logo { font-size: 20px; font-weight: bold; }
          .container { max-width: 1200px; margin: 0 auto; padding: 32px 24px; }
          .breadcrumb { color: #666; font-size: 14px; margin-bottom: 24px; }
          .breadcrumb a { color: #6366f1; text-decoration: none; }
          h1 { font-size: 28px; margin-bottom: 8px; }
          .verdict { font-size: 18px; color: #888; margin-bottom: 32px; padding: 16px; background: #151515; border-radius: 8px; border-left: 4px solid ${pressureScore >= 50 ? '#22c55e' : '#dc2626'}; }
          .scores { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
          .score-card { background: #151515; border-radius: 12px; padding: 24px; text-align: center; }
          .score-value { font-size: 48px; font-weight: bold; margin-bottom: 8px; }
          .score-value.good { color: #22c55e; }
          .score-value.warning { color: #f59e0b; }
          .score-value.bad { color: #dc2626; }
          .score-label { color: #888; font-size: 14px; }
          .section { margin-bottom: 32px; }
          .section h2 { font-size: 20px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
          .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .card { background: #151515; border-radius: 12px; padding: 20px; }
          .card h3 { font-size: 16px; margin-bottom: 12px; }
          .card ul { list-style: none; }
          .card li { padding: 8px 0; border-bottom: 1px solid #252525; font-size: 14px; color: #ccc; }
          .card li:last-child { border-bottom: none; }
          .severity { font-size: 11px; padding: 2px 8px; border-radius: 10px; margin-left: 8px; }
          .severity.critical { background: #dc2626; }
          .severity.major { background: #f59e0b; }
          .severity.minor { background: #6366f1; }
          .priority { font-size: 11px; padding: 2px 8px; border-radius: 10px; margin-right: 8px; }
          .priority.must_fix { background: #dc2626; }
          .priority.should_improve { background: #f59e0b; }
          .priority.nice_to_have { background: #22c55e; }
          .persona-response { background: #151515; border-radius: 12px; padding: 20px; margin-bottom: 16px; }
          .persona-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
          .persona-name { font-weight: 600; }
          .persona-archetype { color: #888; font-size: 13px; }
          .persona-metrics { display: flex; gap: 24px; margin-bottom: 12px; }
          .metric { text-align: center; }
          .metric-value { font-size: 24px; font-weight: bold; }
          .metric-label { font-size: 11px; color: #888; }
          .gut-reaction { font-style: italic; color: #aaa; font-size: 14px; line-height: 1.6; padding: 12px; background: #0a0a0a; border-radius: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">👻 Phantom Pressure Test</div>
        </div>
        <div class="container">
          <div class="breadcrumb">
            <a href="#">Projects</a> / <a href="#">${projectName}</a> / Premium Yogurt Concept Test
          </div>

          <h1>Test Results</h1>
          <div class="verdict">"${verdict}"</div>

          <div class="scores">
            <div class="score-card">
              <div class="score-value ${pressureScore >= 70 ? 'good' : pressureScore >= 50 ? 'warning' : 'bad'}">${pressureScore}</div>
              <div class="score-label">Pressure Score</div>
            </div>
            <div class="score-card">
              <div class="score-value ${gutIndex >= 70 ? 'good' : gutIndex >= 50 ? 'warning' : 'bad'}">${gutIndex}</div>
              <div class="score-label">Gut Attraction</div>
            </div>
            <div class="score-card">
              <div class="score-value ${credScore >= 70 ? 'good' : credScore >= 50 ? 'warning' : 'bad'}">${credScore}</div>
              <div class="score-label">Credibility</div>
            </div>
            <div class="score-card">
              <div class="score-value" style="font-size: 32px; color: ${wouldProceed === 'Yes' ? '#22c55e' : '#dc2626'}">${wouldProceed}</div>
              <div class="score-label">Would Proceed?</div>
            </div>
          </div>

          <div class="section">
            <h2>📊 Analysis</h2>
            <div class="grid-2">
              <div class="card">
                <h3>💪 Strengths</h3>
                <ul>
                  ${strengths.slice(0, 3).map((s: any) => `<li>${s.point} <span class="severity minor">${s.confidence}</span></li>`).join('')}
                </ul>
              </div>
              <div class="card">
                <h3>⚠️ Weaknesses</h3>
                <ul>
                  ${weaknesses.slice(0, 3).map((w: any) => `<li>${w.point} <span class="severity ${w.severity}">${w.severity}</span></li>`).join('')}
                </ul>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>💡 Recommendations</h2>
            <div class="card">
              <ul>
                ${recommendations.slice(0, 4).map((r: any) => `<li><span class="priority ${r.priority}">${r.priority.replace('_', ' ')}</span> ${r.recommendation}</li>`).join('')}
              </ul>
            </div>
          </div>

          <div class="section">
            <h2>👥 Individual Responses</h2>
            ${responses.slice(0, 3).map((r: any) => `
              <div class="persona-response">
                <div class="persona-header">
                  <div>
                    <div class="persona-name">${r.personaContext?.name?.fullName || 'Persona'}</div>
                    <div class="persona-archetype">${r.personaContext?.archetype?.name || 'Archetype'}</div>
                  </div>
                  <div class="persona-metrics">
                    <div class="metric">
                      <div class="metric-value" style="color: ${r.response?.purchase_intent >= 7 ? '#22c55e' : r.response?.purchase_intent >= 4 ? '#f59e0b' : '#dc2626'}">${r.response?.purchase_intent || 0}</div>
                      <div class="metric-label">Purchase Intent</div>
                    </div>
                    <div class="metric">
                      <div class="metric-value" style="color: ${r.response?.credibility_rating >= 7 ? '#22c55e' : r.response?.credibility_rating >= 4 ? '#f59e0b' : '#dc2626'}">${r.response?.credibility_rating || 0}</div>
                      <div class="metric-label">Credibility</div>
                    </div>
                  </div>
                </div>
                <div class="gut-reaction">"${r.response?.gut_reaction?.slice(0, 200) || 'No response'}..."</div>
              </div>
            `).join('')}
          </div>
        </div>
      </body>
      </html>
    `)
    await page.screenshot({ path: `${DEMO_DIR}/06-results-dashboard.png`, fullPage: true })
    console.log('   ✅ Screenshot: 06-results-dashboard.png\n')

    // ============================================
    // Done!
    // ============================================
    console.log('=' .repeat(50))
    console.log('🎬 Demo Complete!')
    console.log('=' .repeat(50))
    console.log(`\nScreenshots saved to: ${DEMO_DIR}/`)
    console.log('\nFiles created:')
    console.log('  01-landing-page.png')
    console.log('  02-login-page.png')
    console.log('  03-projects-dashboard.png')
    console.log('  04-create-test-stimulus.png')
    console.log('  05-panel-selection.png')
    console.log('  06-results-dashboard.png')
    console.log('\n📊 Test Results Summary:')
    console.log(`   Pressure Score: ${pressureScore}/100`)
    console.log(`   Gut Attraction: ${gutIndex}/100`)
    console.log(`   Credibility: ${credScore}/100`)
    console.log(`   Would Proceed: ${wouldProceed}`)

  } finally {
    await browser.close()
  }
}

runDemo().catch(console.error)
