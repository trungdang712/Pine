import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Use service role key for server-side auth
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Verify credentials using admin API
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers()

    if (authError) {
      console.error('Auth list error:', authError)
      return NextResponse.json(
        { error: 'Authentication service error' },
        { status: 500 }
      )
    }

    // Find user by email
    const user = authData.users.find(u => u.email === email)

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Verify password by attempting sign in with anon client
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.error('Sign in error:', signInError.message)
      return NextResponse.json(
        { error: signInError.message === 'Invalid login credentials'
          ? 'Invalid email or password'
          : signInError.message },
        { status: 401 }
      )
    }

    // Get user profile from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, team, role, name')
      .eq('auth_id', user.id)
      .single()

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User profile not found. Please contact administrator.' },
        { status: 403 }
      )
    }

    // Check team access for non-admin/non-marketing users
    if (userData.team !== 'admin' && userData.team !== 'marketing') {
      const { data: teamAccess } = await supabase
        .from('user_team_access')
        .select('team')
        .eq('user_id', userData.id)
        .eq('team', 'marketing')
        .single()

      if (!teamAccess) {
        return NextResponse.json(
          { error: "You don't have access to the Marketing Command Center." },
          { status: 403 }
        )
      }
    }

    // Return session data
    return NextResponse.json({
      success: true,
      session: signInData.session,
      user: {
        id: user.id,
        email: user.email,
        name: userData.name,
        team: userData.team,
        role: userData.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
