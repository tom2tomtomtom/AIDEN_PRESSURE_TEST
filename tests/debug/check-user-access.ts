/**
 * Debug script to check user access and RLS issues
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function debugAccess() {
  console.log('='.repeat(60))
  console.log('DEBUG: User Access & RLS Check')
  console.log('='.repeat(60))

  // Admin client (bypasses RLS)
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    db: { schema: 'ppt' }
  })

  // Anon client (subject to RLS) - simulates browser
  const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    db: { schema: 'ppt' }
  })

  console.log('\n1. Check Supabase connection...')
  console.log('   URL:', SUPABASE_URL)
  console.log('   Anon key (first 20):', SUPABASE_ANON_KEY?.slice(0, 20) + '...')
  console.log('   Service key (first 20):', SUPABASE_SERVICE_KEY?.slice(0, 20) + '...')

  // Check schema access
  console.log('\n2. Check PPT schema access (admin)...')
  const { data: orgsAdmin, error: orgsAdminErr } = await adminClient
    .from('organizations')
    .select('id, name')
    .limit(3)

  if (orgsAdminErr) {
    console.log('   ❌ Admin cannot access organizations:', orgsAdminErr.message)
  } else {
    console.log('   ✅ Admin can access organizations:', orgsAdmin?.length, 'found')
  }

  // Check archetypes (should be readable by authenticated users)
  console.log('\n3. Check archetypes (admin)...')
  const { data: archetypes, error: archErr } = await adminClient
    .from('persona_archetypes')
    .select('id, name')
    .limit(3)

  if (archErr) {
    console.log('   ❌ Cannot access archetypes:', archErr.message)
  } else {
    console.log('   ✅ Found', archetypes?.length, 'archetypes')
    archetypes?.forEach(a => console.log('      -', a.name))
  }

  // List all users
  console.log('\n4. List users in auth.users...')
  const { data: authData } = await adminClient.auth.admin.listUsers()
  const users = authData?.users || []
  console.log('   Found', users.length, 'users:')
  users.slice(0, 5).forEach(u => {
    console.log('   -', u.email, '| ID:', u.id.slice(0, 8) + '...')
  })

  // Check organization memberships
  console.log('\n5. Check organization memberships...')
  const { data: memberships, error: memErr } = await adminClient
    .from('organization_members')
    .select('user_id, organization_id, role, organizations(name)')
    .limit(10)

  if (memErr) {
    console.log('   ❌ Error:', memErr.message)
  } else if (!memberships?.length) {
    console.log('   ⚠️  NO MEMBERSHIPS FOUND - This is the problem!')
  } else {
    console.log('   ✅ Found', memberships.length, 'memberships:')
    memberships.forEach(m => {
      const orgName = (m.organizations as any)?.name || 'Unknown'
      console.log('      User:', m.user_id.slice(0, 8) + '...', '| Org:', orgName, '| Role:', m.role)
    })
  }

  // Check projects
  console.log('\n6. Check projects (admin)...')
  const { data: projects, error: projErr } = await adminClient
    .from('projects')
    .select('id, name, organization_id')
    .limit(5)

  if (projErr) {
    console.log('   ❌ Error:', projErr.message)
  } else {
    console.log('   Found', projects?.length || 0, 'projects')
    projects?.forEach(p => console.log('      -', p.name, '| Org:', p.organization_id?.slice(0, 8) + '...'))
  }

  // Test RLS with anon client (no user)
  console.log('\n7. Test RLS with anon client (no auth)...')
  const { data: anonProjects, error: anonErr } = await anonClient
    .from('projects')
    .select('id, name')
    .limit(1)

  if (anonErr) {
    console.log('   ✅ Correctly blocked:', anonErr.message, '(Code:', anonErr.code + ')')
  } else {
    console.log('   ⚠️  Anon can see projects (unexpected):', anonProjects?.length)
  }

  // Create test user and org if needed
  console.log('\n8. Ensure test user has org...')
  const testEmail = 'test-ui@phantomtest.local'

  // Find or create test user
  let testUser = users.find(u => u.email === testEmail)
  if (!testUser) {
    console.log('   Creating test user...')
    const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
      email: testEmail,
      email_confirm: true,
      password: 'testpassword123',
      user_metadata: { full_name: 'Test UI User' }
    })
    if (createErr) {
      console.log('   ❌ Failed to create user:', createErr.message)
    } else {
      testUser = newUser.user
      console.log('   ✅ Created user:', testUser?.id)
    }
  } else {
    console.log('   User exists:', testUser.id.slice(0, 8) + '...')
  }

  if (testUser) {
    // Check if user has org
    const { data: userMembership } = await adminClient
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', testUser.id)
      .single()

    if (!userMembership) {
      console.log('   Creating organization for user...')

      const { data: newOrg, error: orgErr } = await adminClient
        .from('organizations')
        .insert({ name: 'Test Organization', slug: `test-org-${Date.now()}` })
        .select('id')
        .single()

      if (orgErr) {
        console.log('   ❌ Failed to create org:', orgErr.message)
      } else {
        const { error: memInsertErr } = await adminClient
          .from('organization_members')
          .insert({ organization_id: newOrg.id, user_id: testUser.id, role: 'owner' })

        if (memInsertErr) {
          console.log('   ❌ Failed to add membership:', memInsertErr.message)
        } else {
          console.log('   ✅ Created org and membership')
        }
      }
    } else {
      console.log('   ✅ User already has org:', userMembership.organization_id.slice(0, 8) + '...')
    }

    // Now test authenticated access
    console.log('\n9. Test authenticated access...')

    // Sign in as test user
    const { data: session, error: signInErr } = await adminClient.auth.admin.generateLink({
      type: 'magiclink',
      email: testEmail,
    })

    if (signInErr) {
      console.log('   ❌ Cannot generate session:', signInErr.message)
    } else {
      console.log('   Generated magic link for testing')
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('DEBUG COMPLETE')
  console.log('='.repeat(60))
}

debugAccess().catch(console.error)
