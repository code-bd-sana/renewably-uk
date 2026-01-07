// import { NextResponse } from 'next/server';
// import { authenticate, requireAdmin } from './auth';

// export async function middleware(request) {
//   const { pathname } = request.nextUrl;
//   const PUBLIC_PATHS = ["/", "/login", "/signup", "/forgot-password"];

//   // Protect admin routes
//   if (pathname.startsWith('/admin')) {
//     console.log('Checking admin access for:', pathname);
    
//     const authResult = await authenticate(request);
    
//     if (!authResult.success) {
//       console.log('Auth failed:', authResult.error);
//       // Redirect to login
//       const loginUrl = new URL('/login', request.url);
//       return NextResponse.redirect(loginUrl);
//     }
    
//     // Check if user is admin
//     if (!requireAdmin(authResult.userRole)) {
//       console.log('Not admin:', authResult.userRole);
//       // Not admin, redirect to home
//       const homeUrl = new URL('/', request.url);
//       return NextResponse.redirect(homeUrl);
//     }
    
//     console.log('Admin access granted for:', authResult.userEmail);
//     // User is admin, allow access
//     return NextResponse.next();
//   }
  
//   // Allow all other routes
//   return NextResponse.next();
// }

// // Match admin routes only
// export const config = {
//   matcher: ['/admin/:path*']
// };


import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { authenticate, requireAdmin } from "./auth";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/forgot-password"];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(path)
  );

  /* ===============================
     ADMIN ROUTES
  ================================ */
  if (pathname.startsWith("/admin")) {
    const authResult = await authenticate(request);

    // Not logged in
    if (!authResult.success) {
      return NextResponse.redirect(
        new URL("/login", request.url)
      );
    }

    // Logged in but not admin
    if (!requireAdmin(authResult.userRole)) {
      return NextResponse.redirect(
        new URL("/", request.url)
      );
    }

    // Admin allowed
    return NextResponse.next();
  }

  /* ===============================
     OTHER PRIVATE ROUTES
  ================================ */
  if (!isPublic) {
    const authResult = await authenticate(request);

    if (!authResult.success) {
      return NextResponse.redirect(
        new URL("/login", request.url)
      );
    }
  }

  /* ===============================
     PUBLIC ROUTES
  ================================ */
  return NextResponse.next();
}

/* ===============================
   MATCHER
================================ */
export const config = {
  matcher: ["/((?!_next|api|favicon.ico).*)"],
};
