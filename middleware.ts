import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname.toLowerCase();

  // Block spam/hacked URL patterns and return 404
  // These patterns are common attack vectors and should not be accessible
  const spamPatterns = [
    /\.php$/,           // PHP files (.php, .php5, etc.)
    /\.asp$/,           // ASP files
    /\.jsp$/,           // JSP files
    /\.cfm$/,           // ColdFusion files
    /\/saiga/,          // Known spam/hack pattern
    /\/admin[.-_]/,     // Suspicious admin paths
    /\/wp-/,            // WordPress paths (if not using WP)
    /\/xmlrpc\.php/,    // XML-RPC (common attack)
    /\/shell/,          // Shell upload attempts
    /\/upload/,         // Suspicious upload directories
    /\/(test|temp|tmp|backup|bak)/,  // Test/backup directories
  ];

  const isSpamPattern = spamPatterns.some((pattern) => pattern.test(pathname));
  if (isSpamPattern) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  // Only canonicalize the root path
  if (pathname === "/") {
    // Define allowed query parameters for the homepage (none in this case)
    const allowedParams = new Set<string>();

    // Check if there are any query parameters
    const hasQueryParams = url.search.length > 0;
    
    // Extract current query params
    const currentParams = Array.from(url.searchParams.keys());
    
    // Check if any current params are not in the allowed set
    const hasUnknownParams = currentParams.some(
      (param) => !allowedParams.has(param)
    );

    // If there are unknown params, redirect to clean root
    if (hasUnknownParams) {
      return NextResponse.redirect(new URL("/", request.url), {
        status: 301, // Permanent redirect for SEO
      });
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
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
