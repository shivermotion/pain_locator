import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

// POC defaults to avoid env setup locally
if (!process.env.NEXTAUTH_SECRET) {
  process.env.NEXTAUTH_SECRET = 'dev-secret-do-not-use-in-prod';
}
if (!process.env.NEXTAUTH_URL) {
  process.env.NEXTAUTH_URL = 'http://localhost:3000';
}

export default withAuth(
  function middleware(req) {
    const token = (req as any).nextauth.token as any;
    const { pathname } = req.nextUrl;

    if (pathname.startsWith('/patient')) {
      if (!token || token.role !== 'patient') {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }
    }

    if (pathname.startsWith('/doctor')) {
      if (!token || token.role !== 'doctor') {
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => Boolean(token),
    },
  }
);

export const config = {
  matcher: ['/patient/:path*', '/doctor/:path*'],
};
