import { NextRequest, NextResponse } from "next/server";
import { isLocale } from "@/lib/i18n/shared";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
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
  const spamPatterns = [
    /\.php$/,
    /\.asp$/,
    /\.jsp$/,
    /\.cfm$/,
    /\/saiga/,
    /\/admin[.-_]/,
    /\/wp-/,
    /\/xmlrpc\.php/,
    /\/shell/,
    /\/upload/,
    /^\/(test|temp|tmp|backup|bak)(\/|$)/,
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
    const hasUnknownParams = currentParams.some(
      (param) => !allowedParams.has(param)
    );

    if (hasUnknownParams) {
      const cleaned = new URL("/", request.url);
      for (const [key, value] of url.searchParams.entries()) {
        if (allowedParams.has(key)) cleaned.searchParams.set(key, value);
      }

      return NextResponse.redirect(cleaned, {
        status: 301,
      });
    }
  }

  // Keep Supabase auth sessions fresh (needed for /parking-guardamar-centro/admin).
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return updateSession(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
