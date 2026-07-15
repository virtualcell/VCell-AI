import { NextResponse, type NextRequest } from 'next/server';
import { auth0 } from './lib/auth0';

const publicRoutes = new Set(['/']);
const publicRoutePrefixes = ['/search', '/chat', '/analyze'];

const publicFilePattern = /\.(.*)$/;

function isPublicRoute(pathname: string): boolean {
  return (
    publicRoutes.has(pathname) ||
    publicRoutePrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  );
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const authResponse = await auth0.middleware(request);

  if (
    isPublicRoute(pathname) ||
    pathname.startsWith('/auth/') ||
    publicFilePattern.test(pathname)
  ) {
    return authResponse;
  }

  const session = await auth0.getSession(request);

  if (!session) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('returnTo', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  return authResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
