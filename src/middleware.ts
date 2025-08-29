import { NextRequest, NextResponse } from 'next/server';

// All authentication logic is removed. Middleware now only passes requests through.
export async function middleware(_request: NextRequest) {
  return NextResponse.next();
}

// The matcher config is kept to ensure the middleware runs on the correct paths,
// even though it doesn't do anything anymore. This is standard Next.js practice.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|login|warning|api/login|api/register|api/logout|api/cron|api/server-config).*)',
  ],
};
