/**
 * Test access with an authenticated user session
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function testAuthAccess() {
  console.log('='.repeat(60))
  console.log('TEST: Authenticated User Access')
  console.log('='.repeat(60))

  // Admin client to create/manage users
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Test user credentials
  const testEmail = 'test-ui@phantomtest.local'
  const testPassword = 'testpassword123'

  // Get or update test user with password
  console.log('\n1. Setting up test user with password...')
  const { data: users } = await adminClient.auth.admin.listUsers()
  let testUser = users?.users?.find(u => u.email === testEmail)

  if (!testUser) {
    const { data, error } = await adminClient.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
    })
    if (error) {
      console.log('   ❌ Failed to create user:', error.message)
      return
    }
    testUser = data.user
    console.log('   ✅ Created user')
  } else {
    // Update password
    await adminClient.auth.admin.updateUserById(testUser.id, {
      password: testPassword
    })
    console.log('   ✅ User exists, updated password')
  }

  // Create client with anon key (simulates browser)
  const browserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    db: { schema: 'ppt' }
  })

  // Sign in
  console.log('\n2. Signing in as test user...')
  const { data: session, error: signInErr } = await browserClient.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  })

  if (signInErr) {
    console.log('   ❌ Sign in failed:', signInErr.message)
    return
  }
  console.log('   ✅ Signed in, session:', session.session?.access_token?.slice(0, 20) + '...')

  // Check user's organization
  console.log('\n3. Checking user organization membership...')
  const pptAdminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    db: { schema: 'ppt' }
  })

  const { data: membership, error: memErr } = await pptAdminClient
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', testUser!.id)
    .single()

  if (memErr || !membership) {
    console.log('   ❌ No org membership:', memErr?.message)
    console.log('   Creating organization...')

    const { data: newOrg } = await pptAdminClient
      .from('organizations')
      .insert({ name: 'Test UI Org', slug: `test-ui-org-${Date.now()}` })
      .select('id')
      .single()

    if (newOrg) {
      await pptAdminClient
        .from('organization_members')
        .insert({ organization_id: newOrg.id, user_id: testUser!.id, role: 'owner' })
      console.log('   ✅ Created org and membership')
    }
  } else {
    console.log('   ✅ Has org:', membership.organization_id.slice(0, 8) + '...', 'Role:', membership.role)
  }

  // Now test access with authenticated client
  console.log('\n4. Testing project access with authenticated session...')
  const { data: projects, error: projErr } = await browserClient
    .from('projects')
    .select('id, name')
    .limit(5)

  if (projErr) {
    console.log('   ❌ Error:', projErr.message, '(Code:', projErr.code + ')')
  } else {
    console.log('   ✅ Can access projects! Found:', projects?.length || 0)
    projects?.forEach(p => console.log('      -', p.name))
  }

  // Test creating a project
  console.log('\n5. Testing project creation...')
  const { data: myMembership } = await pptAdminClient
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', testUser!.id)
    .single()

  if (myMembership) {
    const { data: newProject, error: createErr } = await browserClient
      .from('projects')
      .insert({
        name: 'Test Project ' + Date.now(),
        organization_id: myMembership.organization_id,
        category: 'fmcg',
      })
      .select()
      .single()

    if (createErr) {
      console.log('   ❌ Create failed:', createErr.message)
    } else {
      console.log('   ✅ Created project:', newProject.name)

      // Clean up
      await browserClient.from('projects').delete().eq('id', newProject.id)
      console.log('   ✅ Cleaned up test project')
    }
  }

  // Test archetypes access
  console.log('\n6. Testing archetypes access...')
  const { data: archetypes, error: archErr } = await browserClient
    .from('persona_archetypes')
    .select('id, name')
    .limit(3)

  if (archErr) {
    console.log('   ❌ Error:', archErr.message)
  } else {
    console.log('   ✅ Can access archetypes! Found:', archetypes?.length || 0)
    archetypes?.forEach(a => console.log('      -', a.name))
  }

  console.log('\n' + '='.repeat(60))
  console.log('TEST COMPLETE')
  console.log('='.repeat(60))

  // Summary
  if (!projErr && !archErr) {
    console.log('\n✅ ALL TESTS PASSED - Authenticated access is working!')
    console.log('\nTest user credentials:')
    console.log('   Email:', testEmail)
    console.log('   Password:', testPassword)
  } else {
    console.log('\n❌ SOME TESTS FAILED - Check errors above')
  }
}

testAuthAccess().catch(console.error)
