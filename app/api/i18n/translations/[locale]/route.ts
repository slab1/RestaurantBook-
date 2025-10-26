import { NextRequest, NextResponse } from 'next/server';
import { loadTranslations } from '@/lib/i18n/translations';
import { SUPPORTED_LOCALES } from '@/lib/i18n/config';

export const dynamic = 'force-dynamic';

/**
 * GET /api/i18n/translations/[locale]
 * Fetch translations for a specific locale and optional namespace
 * 
 * Query params:
 * - namespace: string (optional) - specific namespace to load (e.g., 'common', 'restaurants')
 * - namespaces: string[] (optional) - multiple namespaces to load
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { locale: string } }
) {
  try {
    const { locale } = params;
    const { searchParams } = new URL(request.url);
    const namespace = searchParams.get('namespace');
    const namespacesParam = searchParams.get('namespaces');

    // Validate locale
    const validLocale = SUPPORTED_LOCALES.find(l => l.code === locale);
    if (!validLocale) {
      return NextResponse.json(
        { 
          error: 'Invalid locale',
          message: `Locale '${locale}' is not supported. Supported locales: ${SUPPORTED_LOCALES.map(l => l.code).join(', ')}`
        },
        { status: 400 }
      );
    }

    // Determine which namespaces to load
    let namespacesToLoad: string[] = ['common']; // Default namespace
    
    if (namespacesParam) {
      try {
        namespacesToLoad = JSON.parse(namespacesParam);
      } catch {
        namespacesToLoad = namespacesParam.split(',');
      }
    } else if (namespace) {
      namespacesToLoad = [namespace];
    }

    // Load translations for all requested namespaces
    const translations: Record<string, any> = {};
    
    for (const ns of namespacesToLoad) {
      try {
        const nsTranslations = await loadTranslations(locale, ns);
        translations[ns] = nsTranslations;
      } catch (error) {
        console.warn(`Failed to load namespace '${ns}' for locale '${locale}':`, error);
        // Continue loading other namespaces
        translations[ns] = null;
      }
    }

    return NextResponse.json({
      locale,
      localeInfo: validLocale,
      namespaces: namespacesToLoad,
      translations,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error loading translations:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load translations',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/i18n/translations/[locale]
 * Update or add new translations (admin only)
 * 
 * Body:
 * {
 *   namespace: string,
 *   translations: Record<string, string>
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { locale: string } }
) {
  try {
    const { locale } = params;
    
    // Validate locale
    const validLocale = SUPPORTED_LOCALES.find(l => l.code === locale);
    if (!validLocale) {
      return NextResponse.json(
        { error: 'Invalid locale' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { namespace, translations } = body;

    if (!namespace || !translations) {
      return NextResponse.json(
        { error: 'Missing required fields: namespace and translations' },
        { status: 400 }
      );
    }

    // TODO: Add authentication check for admin users
    // const session = await getServerSession();
    // if (!session || session.user.role !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // TODO: Implement translation update logic
    // This would write to the file system or database
    // For now, return a placeholder response

    return NextResponse.json({
      success: true,
      message: 'Translation update feature coming soon',
      locale,
      namespace,
      translationCount: Object.keys(translations).length
    });

  } catch (error) {
    console.error('Error updating translations:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update translations',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
