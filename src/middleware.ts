import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/upstash';

// Initialize rate limiter: 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
});

export async function middleware(request: NextRequest) {
  // Only rate limit API routes and auth actions in production
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  // Define paths to protect (e.g., API routes)
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  
  if (isApiRoute) {
    const ip = request.ip ?? '127.0.0.1';
    
    try {
      const { success, limit, reset, remaining } = await ratelimit.limit(ip);
      
      if (!success) {
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        });
      }
    } catch (error) {
      // Fail open if Redis is down
      console.error('Rate limit error:', error);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
