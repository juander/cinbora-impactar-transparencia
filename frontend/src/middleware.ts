import { NextRequest, NextResponse } from 'next/server';

// Add this constant to ensure consistency
const BASE_PATH = '/cinboratransparecer';

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  const { pathname } = req.nextUrl;

  if (!token && pathname.startsWith('/dashboard/ongs')) {
    return NextResponse.redirect(new URL(`${BASE_PATH}/login`, req.url));
  }
  if (!token && pathname.startsWith('/dashboard/history')) {
    return NextResponse.redirect(new URL(`${BASE_PATH}/login`, req.url));
  }

  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL(`${BASE_PATH}/dashboard/ongs`, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/ongs', '/dashboard/history', '/login'], 
};