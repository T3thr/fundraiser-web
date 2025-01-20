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

  // Check if the request is for the success or cancel page
  const isSuccessPage = request.nextUrl.pathname === '/payment/success';
  const isCancelPage = request.nextUrl.pathname === '/payment/cancel';

  if ((isSuccessPage || isCancelPage) && !request.nextUrl.searchParams.has('session_id')) {
    // If session_id is missing, return 404
    return NextResponse.rewrite(new URL('/404', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/', '/payment/success', '/payment/cancel'],
};
