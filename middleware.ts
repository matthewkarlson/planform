import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { signToken, verifyToken } from '@/lib/auth/session';

const protectedRoutes = ['/dashboard', '/arena'];
const verificationRequiredRoutes = ['/arena'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const requiresVerification = verificationRequiredRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  let res = NextResponse.next();

  if (sessionCookie && request.method === "GET") {
    try {
      const parsed = await verifyToken(sessionCookie.value);
      
      // Check if the route requires email verification
      if (requiresVerification) {
        const userData = parsed.user;
        
        // Fetch current user data to check verification status
        const response = await fetch(new URL('/api/user-info', request.url), {
          headers: {
            Cookie: `session=${sessionCookie.value}`,
          },
        });
        
        if (response.ok) {
          const userData = await response.json();
          
          // If email is not verified, redirect to the verification needed page
          if (!userData.isVerified) {
            return NextResponse.redirect(new URL('/verification-needed', request.url));
          }
        }
      }
      
      const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

      res.cookies.set({
        name: 'session',
        value: await signToken({
          ...parsed,
          expires: expiresInOneDay.toISOString(),
        }),
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        expires: expiresInOneDay,
      });
    } catch (error) {
      console.error('Error updating session:', error);
      res.cookies.delete('session');
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
    }
  }

  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
