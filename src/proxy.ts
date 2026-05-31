import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from '@/lib/upstash';

// Initialize rate limiter only if Upstash is configured
const ratelimit = process.env.UPSTASH_REDIS_REST_URL 
  ? new Ratelimit({
      redis: redis,
      limiter: Ratelimit.slidingWindow(10, '10 s'),
      analytics: true,
    })
  : null;

export async function proxy(request: NextRequest) {
  // 1. Rate Limiting for API routes in production
  if (process.env.NODE_ENV !== 'development' && request.nextUrl.pathname.startsWith('/api') && ratelimit) {
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
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
      console.error('Rate limit error:', error);
    }
  }

  // 2. Supabase Auth Session Update
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
