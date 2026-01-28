import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Helper to add timeout to promises
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))
  ])
}

export async function updateSession(request: NextRequest) {
  // Public routes that don't need any auth check
  const publicRoutes = ['/login', '/unauthorized']
  const isPublicRoute = publicRoutes.some(route =>
    request.nextUrl.pathname === route ||
    request.nextUrl.pathname.startsWith(route + '/')
  )

  // For public routes, just pass through without any Supabase calls
  if (isPublicRoute) {
    return NextResponse.next({ request })
  }

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

  // Check if user is authenticated (with 3s timeout)
  const { data: { user } } = await withTimeout(
    supabase.auth.getUser(),
    3000,
    { data: { user: null }, error: null }
  )

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

  // Check team access for marketing-only routes (with timeouts)
  if (user && isProtectedRoute) {
    const { data: userData } = await withTimeout(
      supabase
        .from('users')
        .select('id, team, role')
        .eq('auth_id', user.id)
        .single(),
      2000,
      { data: null, error: null }
    )

    // Allow admin team access to everything
    if (userData && userData.team !== 'admin' && userData.team !== 'marketing') {
      // Check if user has marketing team access using the database user ID
      const { data: teamAccess } = await withTimeout(
        supabase
          .from('user_team_access')
          .select('team')
          .eq('user_id', userData.id)
          .eq('team', 'marketing')
          .single(),
        2000,
        { data: null, error: null }
      )

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
