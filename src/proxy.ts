import { NextRequest, NextResponse } from 'next/server';

/**
 * Security configuration for Content Security Policy
 */
interface SecurityConfig {
  contentSecurityPolicy: string;
  strictTransportSecurity: string;
  permissionsPolicy: string;
}

/**
 * Get Content Security Policy directives based on environment
 */
function getCSPDirectives(): string {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Allow configurable CSP directives via environment variables
  const scriptSrc =
    process.env.CSP_SCRIPT_SRC ||
    (isDevelopment ? "'self' 'unsafe-eval' 'unsafe-inline'" : "'self'");
  const styleSrc = process.env.CSP_STYLE_SRC || "'self' 'unsafe-inline'";
  const imgSrc = process.env.CSP_IMG_SRC || "'self' data: blob:";
  const connectSrc = process.env.CSP_CONNECT_SRC || "'self'";
  const fontSrc = process.env.CSP_FONT_SRC || "'self'";
  const objectSrc = process.env.CSP_OBJECT_SRC || "'none'";
  const mediaSrc = process.env.CSP_MEDIA_SRC || "'self'";
  const frameSrc = process.env.CSP_FRAME_SRC || "'none'";

  const directives = [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src ${styleSrc}`,
    `img-src ${imgSrc}`,
    `connect-src ${connectSrc}`,
    `font-src ${fontSrc}`,
    `object-src ${objectSrc}`,
    `media-src ${mediaSrc}`,
    `frame-src ${frameSrc}`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ];

  // Remove upgrade-insecure-requests in development
  if (isDevelopment) {
    return directives.filter((d) => !d.includes('upgrade-insecure-requests')).join('; ');
  }

  return directives.join('; ');
}

/**
 * Get security configuration based on environment
 */
function getSecurityConfig(): SecurityConfig {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const hstsMaxAge = process.env.HSTS_MAX_AGE || '31536000'; // 1 year default

  return {
    contentSecurityPolicy: getCSPDirectives(),
    strictTransportSecurity: isDevelopment
      ? '' // Don't set HSTS in development
      : `max-age=${hstsMaxAge}; includeSubDomains`,
    permissionsPolicy: ['camera=()', 'microphone=()', 'geolocation=()', 'interest-cohort=()'].join(
      ', '
    ),
  };
}

/**
 * Next.js proxy function that adds security headers to all responses
 *
 * @param request - The incoming HTTP request
 * @returns Response with security headers added
 */
export default function proxy(_request: NextRequest): NextResponse {
  const response = NextResponse.next();
  const config = getSecurityConfig();

  // Add Content-Security-Policy header
  response.headers.set('Content-Security-Policy', config.contentSecurityPolicy);

  // Add X-Frame-Options header
  response.headers.set('X-Frame-Options', 'DENY');

  // Add X-Content-Type-Options header
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Add Strict-Transport-Security header (only in production)
  if (config.strictTransportSecurity) {
    response.headers.set('Strict-Transport-Security', config.strictTransportSecurity);
  }

  // Add Permissions-Policy header
  response.headers.set('Permissions-Policy', config.permissionsPolicy);

  // Add X-XSS-Protection header (legacy but still useful)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Add Referrer-Policy header
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

/**
 * Configure which routes the proxy should run on
 * Run on all routes except static files and Next.js internals
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
