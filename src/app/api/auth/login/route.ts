import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  // Collect cookies to set on response
  const cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Use service role for admin operations
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Create SSR client that will collect cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(newCookies) {
            newCookies.forEach((cookie) => {
              cookiesToSet.push(cookie)
            })
          },
        },
      }
    )

    // Sign in with the SSR client (this will collect proper cookies)
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
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

    if (!signInData.user) {
      return NextResponse.json(
        { error: 'Login failed' },
        { status: 401 }
      )
    }

    // Get user profile from database
    // Table is "User" (Prisma model name) and column is "authId" (Prisma field name)
    const { data: userData, error: userError } = await adminClient
      .from('User')
      .select('id, team, role, name')
      .eq('authId', signInData.user.id)
      .single()

    if (userError || !userData) {
      // Sign out if profile not found
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'User profile not found. Please contact administrator.' },
        { status: 403 }
      )
    }

    // Check team access for non-admin/non-marketing users
    if (userData.team !== 'admin' && userData.team !== 'marketing') {
      const { data: teamAccess } = await adminClient
        .from('user_team_access')
        .select('team')
        .eq('user_id', userData.id)
        .eq('team', 'marketing')
        .single()

      if (!teamAccess) {
        await supabase.auth.signOut()
        return NextResponse.json(
          { error: "You don't have access to the Marketing Command Center." },
          { status: 403 }
        )
      }
    }

    // Create final response with collected cookies
    const response = NextResponse.json({
      success: true,
      user: {
        id: signInData.user.id,
        email: signInData.user.email,
        name: userData.name,
        team: userData.team,
        role: userData.role,
      },
    })

    // Apply all collected cookies to the response
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options as any)
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
