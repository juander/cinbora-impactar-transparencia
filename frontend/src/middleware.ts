import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const { pathname } = req.nextUrl;

  if (!token && pathname.startsWith('/dashboard/ongs')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (!token && pathname.startsWith('/dashboard/history')) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard/ongs', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/ongs', '/dashboard/history', '/login'], 
};











