// @/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Get theme from URL if present
  const themeParam = request.nextUrl.searchParams.get('theme');
  
  if (themeParam) {
    // Set the theme cookie
    response.cookies.set('theme', themeParam, {
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
  }
  
  return response;
}

export const config = {
  matcher: ['/', '/payment/success', '/payment/cancel'],
};