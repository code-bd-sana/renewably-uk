import { NextResponse } from 'next/server';
import { authenticate, requireAdmin } from './auth';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    console.log('Checking admin access for:', pathname);
    
    const authResult = await authenticate(request);
    
    if (!authResult.success) {
      console.log('Auth failed:', authResult.error);
      // Redirect to login
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // Check if user is admin
    if (!requireAdmin(authResult.userRole)) {
      console.log('Not admin:', authResult.userRole);
      // Not admin, redirect to home
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }
    
    console.log('✅ Admin access granted for:', authResult.userEmail);
    // User is admin, allow access
    return NextResponse.next();
  }
  
  // Allow all other routes
  return NextResponse.next();
}

// Match admin routes only
export const config = {
  matcher: ['/admin/:path*']
};