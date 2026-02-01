import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://missing.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'missing-key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set({
              name,
              value,
              ...options,
            })
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
      cookieOptions: {
        maxAge: undefined,
      },
    }
  );

  const url = request.nextUrl.clone();
  
  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser().
  // EXCEPT: If we are on the recovery page with a code, skip getUser to avoid consuming the code 
  // before the client-side logic can handle it for the special recovery flow.
  const isRecoveryWithCode = url.pathname === '/update-password' && url.searchParams.has('code');
  
  let user = null;
  if (!isRecoveryWithCode) {
    const { data: { user: foundUser } } = await supabase.auth.getUser();
    user = foundUser;
  }

  // Protected Routes
  const protectedRoutes = ['/dashboard', '/scan', '/riwayat', '/settings', '/onboarding', '/premium'];
  const isProtectedRoute = protectedRoutes.some(route => url.pathname.startsWith(route));
  
  // Auth Routes (Login)
  const isAuthRoute = url.pathname.startsWith('/login') || url.pathname.startsWith('/register');
  
  // 1. If user is NOT logged in and tries to access protected route -> Redirect to Login
  if (!user && isProtectedRoute) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 2. If user IS logged in and tries to access Login -> Redirect to Dashboard
  if (user && isAuthRoute) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
