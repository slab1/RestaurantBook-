import { NextRequest, NextResponse } from 'next/server';

/**
 * i18n Middleware for Automatic Language Detection
 * 
 * This middleware detects the user's preferred language and sets it as a cookie.
 * Detection priority:
 * 1. URL parameter (?locale=ha)
 * 2. Cookie (previously set)
 * 3. Accept-Language header (browser preference)
 * 4. Default locale (en)
 */

const SUPPORTED_LOCALES = [
  'en', 'es', 'fr', 'de', 'zh', 'ja', 'ar',  // International
  'ha', 'yo', 'ig', 'ee', 'ff', 'kr', 'ti', 'ib'  // Nigerian
];

const DEFAULT_LOCALE = 'en';
const LOCALE_COOKIE = 'preferred_locale';

function detectLocaleFromHeader(request: NextRequest): string | null {
  const acceptLanguage = request.headers.get('accept-language');
  if (!acceptLanguage) return null;

  // Parse Accept-Language header
  // Example: "en-US,en;q=0.9,ha;q=0.8"
  const languages = acceptLanguage
    .split(',')
    .map(lang => {
      const [locale, qValue] = lang.trim().split(';');
      const quality = qValue ? parseFloat(qValue.split('=')[1]) : 1.0;
      // Extract just the language code (e.g., "en" from "en-US")
      const languageCode = locale.split('-')[0].toLowerCase();
      return { locale: languageCode, quality };
    })
    .sort((a, b) => b.quality - a.quality);

  // Find the first supported locale
  for (const { locale } of languages) {
    if (SUPPORTED_LOCALES.includes(locale)) {
      return locale;
    }
  }

  return null;
}

function detectLocaleFromUrl(request: NextRequest): string | null {
  const { searchParams } = new URL(request.url);
  const urlLocale = searchParams.get('locale');
  
  if (urlLocale && SUPPORTED_LOCALES.includes(urlLocale)) {
    return urlLocale;
  }
  
  return null;
}

function detectLocaleFromCookie(request: NextRequest): string | null {
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) {
    return cookieLocale;
  }
  
  return null;
}

export function middleware(request: NextRequest) {
  // Skip middleware for API routes, static files, and internal Next.js routes
  const pathname = request.nextUrl.pathname;
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') // Files with extensions
  ) {
    return NextResponse.next();
  }

  // Detect locale with priority order
  const detectedLocale =
    detectLocaleFromUrl(request) ||
    detectLocaleFromCookie(request) ||
    detectLocaleFromHeader(request) ||
    DEFAULT_LOCALE;

  const response = NextResponse.next();

  // Set locale cookie if not already set or if it changed
  const currentCookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (currentCookie !== detectedLocale) {
    response.cookies.set(LOCALE_COOKIE, detectedLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
      httpOnly: false, // Allow client-side access
    });

    // Also set a response header for client-side detection
    response.headers.set('X-Detected-Locale', detectedLocale);
  }

  return response;
}

// Configure which paths should run this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|.*\\.).*)',
  ],
};
