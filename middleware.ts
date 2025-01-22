// middleware.ts (in root directory)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Check if the path is payment-related
  if (path.startsWith('/payment')) {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('session_id')

    // If accessing success/cancel pages without session_id, redirect to home
    if ((path.includes('/success') || path.includes('/cancel')) && !sessionId) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // For the payment session page, check if sessionId exists in the path
    if (path.match(/^\/payment\/[^/]+$/)) {
      const pathSessionId = path.split('/').pop()
      
      if (!pathSessionId || pathSessionId === 'success' || pathSessionId === 'cancel') {
        return NextResponse.redirect(new URL('/', request.url))
      }

      // Optional: Verify session ID format (assuming Stripe session ID format)
      const isValidSessionId = /^(cs_|pi_)/.test(pathSessionId)
      if (!isValidSessionId) {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/payment/:path*',
  ],
}