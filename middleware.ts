import { NextRequest, NextResponse } from "next/server";
import { isLocale } from "@/lib/i18n/shared";
import { shouldStripParkingLangParam } from "@/lib/parking/seo";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname.toLowerCase();

  // Persist language from ?lang= without stripping it, so URL and UI stay aligned.
  const langParam = url.searchParams.get("lang");
  const applyLocaleCookie = (response: NextResponse) => {
    if (langParam && isLocale(langParam)) {
      response.cookies.set("preferred_locale", langParam, {
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return response;
  };

  // Spanish parking URLs are bare (no ?lang=es). Invalid lang → bare Spanish.
  if (shouldStripParkingLangParam(pathname, langParam)) {
    const cleaned = request.nextUrl.clone();
    cleaned.searchParams.delete("lang");
    const redirect = NextResponse.redirect(cleaned, 302);
    redirect.cookies.set("preferred_locale", "es", {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
    return redirect;
  }

  // Block spam/hacked URL patterns and return 404
  const spamPatterns = [
    /\.php$/i,
    /\.asp$/i,
    /\.jsp$/i,
    /\.cfm$/i,
    /\/saiga/i,
    /\/admin[.\-_]/i,
    /\/wp-/i,
    /\/xmlrpc\.php/i,
    /\/shell/i,
    /\/upload/i,
    /^\/(test|temp|tmp|backup|bak)(\/|$)/i,
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

      return applyLocaleCookie(
        NextResponse.redirect(cleaned, {
          status: 301,
        })
      );
    }
  }

  // Keep Supabase auth sessions fresh (needed for /parking-guardamar-centro/admin).
  const hasSupabase =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (hasSupabase) {
    return applyLocaleCookie(await updateSession(request));
  }

  return applyLocaleCookie(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
