import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const isLoginPage = req.nextUrl.pathname === '/';
  const isStatsPage = req.nextUrl.pathname.startsWith('/stats');

  console.log('Middleware Session:', session);

  // Allow a grace period for session propagation
  if (isStatsPage) {
    const allowAccess = req.cookies.get('x-allow-login'); // Custom cookie to bypass session check
    if (allowAccess) {
      console.log('Allowing temporary access to /stats.');
      return res;
    }
  }

  if (!session && isStatsPage) {
    console.log('No session found. Redirecting to login.');
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/';
    return NextResponse.redirect(redirectUrl);
  }

  if (session && isLoginPage) {
    console.log('Session found. Redirecting to stats.');
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/stats';
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ['/', '/stats'],
};

