// Import required Supabase authentication helper for Next.js middleware
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
// Import Next.js server response utility
import { NextResponse } from 'next/server';

// Middleware function to handle authentication and routing logic
export async function middleware(req) {
  // Create the default response
  const res = NextResponse.next();
  
  // Initialize Supabase client specifically for middleware usage
  const supabase = createMiddlewareClient({ req, res });

  // Destructure the session data from Supabase authentication
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Define page routes for conditional checks
  const isLoginPage = req.nextUrl.pathname === '/';  // Root path serves as login page
  const isStatsPage = req.nextUrl.pathname.startsWith('/stats');  // Stats page path

  // Log session information for debugging purposes
  console.log('Middleware Session:', session);

  // Special handling for stats page access
  if (isStatsPage) {
    // Check for temporary access cookie
    const allowAccess = req.cookies.get('x-allow-login'); // Custom cookie to bypass session check
    if (allowAccess) {
      // If temporary access cookie exists, allow access to stats page
      console.log('Allowing temporary access to /stats.');
      return res;
    }
  }

  // Redirect unauthenticated users trying to access stats page
  if (!session && isStatsPage) {
    console.log('No session found. Redirecting to login.');
    const redirectUrl = req.nextUrl.clone();  // Clone the current URL
    redirectUrl.pathname = '/';  // Set redirect to login page
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users away from login page
  if (session && isLoginPage) {
    console.log('Session found. Redirecting to stats.');
    const redirectUrl = req.nextUrl.clone();  // Clone the current URL
    redirectUrl.pathname = '/stats';  // Set redirect to stats page
    return NextResponse.redirect(redirectUrl);
  }

  // Return default response for all other cases
  return res;
}

// Configure which routes this middleware should run on
export const config = {
  matcher: ['/', '/stats'],  // Apply middleware only to root and stats routes
};