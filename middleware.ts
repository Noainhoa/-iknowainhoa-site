import { NextRequest, NextResponse } from "next/server";
import { isLocale } from "@/lib/i18n/shared";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname.toLowerCase();

  // Persist language selection from query parameter.
  const langParam = url.searchParams.get("lang");
  if (langParam && isLocale(langParam)) {
    const cleaned = new URL(request.url);
    cleaned.searchParams.delete("lang");
    const response = NextResponse.redirect(cleaned, { status: 302 });
    response.cookies.set("preferred_locale", langParam, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  }

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
    /^\/(test|temp|tmp|backup|bak)(\/|$)/,  // Test/backup directories at root only
  ];

  const isSpamPattern = spamPatterns.some((pattern) => pattern.test(pathname));
  if (isSpamPattern) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  // Only canonicalize the root path
  if (pathname === "/") {
    const allowedParams = new Set([
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "gclid",
      "fbclid",
      "msclkid",
      "lang",
    ]);

    const currentParams = Array.from(url.searchParams.keys());
    const hasUnknownParams = currentParams.some((param) => !allowedParams.has(param));

    if (hasUnknownParams) {
      const cleaned = new URL("/", request.url);
      for (const [key, value] of url.searchParams.entries()) {
        if (allowedParams.has(key)) cleaned.searchParams.set(key, value);
      }

      return NextResponse.redirect(cleaned, {
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
