import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes - redirect to login if not authenticated
  const protectedRoutes = [
    '/',
    '/analytics',
    '/calendar',
    '/tasks',
    '/inbox',
    '/proposals',
    '/gamification',
    '/performance',
    '/library',
    '/settings',
    '/social-listening'
  ]

  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname === route ||
    request.nextUrl.pathname.startsWith(route + '/')
  )

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is logged in and trying to access login page, redirect to dashboard
  if (request.nextUrl.pathname === '/login' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Check team access for marketing-only routes
  if (user && isProtectedRoute) {
    const { data: userData } = await supabase
      .from('users')
      .select('team, role')
      .eq('auth_id', user.id)
      .single()

    // Allow admin team access to everything
    if (userData && userData.team !== 'admin' && userData.team !== 'marketing') {
      // Check if user has marketing team access
      const { data: teamAccess } = await supabase
        .from('user_team_access')
        .select('team')
        .eq('user_id', user.id)
        .eq('team', 'marketing')
        .single()

      if (!teamAccess) {
        // User doesn't have access to marketing app
        const url = request.nextUrl.clone()
        url.pathname = '/unauthorized'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}
