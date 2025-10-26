#!/bin/bash
# i18n Integration Validation Script

echo "================================================"
echo "  i18n System Integration Validation"
echo "================================================"
echo ""

# Colors
GREEN='\033[0.32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASS=0
FAIL=0

# Test function
test_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $2"
    ((PASS++))
    return 0
  else
    echo -e "${RED}✗${NC} $2"
    ((FAIL++))
    return 1
  fi
}

echo "1. Checking Translation Files..."
echo "================================"

# International Languages
test_file "/workspace/locales/en/common.json" "English translations"
test_file "/workspace/locales/es/common.json" "Spanish translations"
test_file "/workspace/locales/fr/common.json" "French translations"
test_file "/workspace/locales/de/common.json" "German translations"
test_file "/workspace/locales/zh/common.json" "Chinese translations"
test_file "/workspace/locales/ja/common.json" "Japanese translations"
test_file "/workspace/locales/ar/common.json" "Arabic translations"

# Nigerian Languages
test_file "/workspace/locales/ha/common.json" "Hausa translations"
test_file "/workspace/locales/yo/common.json" "Yoruba translations"
test_file "/workspace/locales/ig/common.json" "Igbo translations"
test_file "/workspace/locales/ee/common.json" "Edo translations"
test_file "/workspace/locales/ff/common.json" "Fulfulde translations"
test_file "/workspace/locales/kr/common.json" "Kanuri translations"
test_file "/workspace/locales/ti/common.json" "Tiv translations"
test_file "/workspace/locales/ib/common.json" "Ibibio translations"

echo ""
echo "2. Checking Core i18n Files..."
echo "================================"

test_file "/workspace/lib/i18n/config.ts" "i18n configuration"
test_file "/workspace/lib/i18n/language-detector.ts" "Language detector"
test_file "/workspace/lib/i18n/currency-service.ts" "Currency service"
test_file "/workspace/lib/i18n/cultural-adaptations.ts" "Cultural adaptations"
test_file "/workspace/lib/i18n/translations.ts" "Translation loader"
test_file "/workspace/lib/i18n/i18n-context.tsx" "i18n Context"

echo ""
echo "3. Checking UI Components..."
echo "================================"

test_file "/workspace/components/i18n/LanguageSelector.tsx" "Language Selector"
test_file "/workspace/components/i18n/CurrencySelector.tsx" "Currency Selector"
test_file "/workspace/components/layout/Navbar.tsx" "i18n-enabled Navbar"

echo ""
echo "4. Checking API Endpoints..."
echo "================================"

test_file "/workspace/app/api/i18n/translations/[locale]/route.ts" "Translations API"
test_file "/workspace/app/api/i18n/currency/route.ts" "Currency API"

echo ""
echo "5. Checking Integration Files..."
echo "================================"

test_file "/workspace/middleware.ts" "Language detection middleware"
test_file "/workspace/styles/rtl.css" "RTL CSS support"

# Check if RTL CSS is imported in globals.css
if grep -q "rtl.css" "/workspace/app/globals.css"; then
  echo -e "${GREEN}✓${NC} RTL CSS imported in globals.css"
  ((PASS++))
else
  echo -e "${RED}✗${NC} RTL CSS not imported in globals.css"
  ((FAIL++))
fi

# Check if I18nProvider is in layout.tsx
if grep -q "I18nProvider" "/workspace/app/layout.tsx"; then
  echo -e "${GREEN}✓${NC} I18nProvider integrated in layout.tsx"
  ((PASS++))
else
  echo -e "${RED}✗${NC} I18nProvider not found in layout.tsx"
  ((FAIL++))
fi

echo ""
echo "6. Checking Database Schema..."
echo "================================"

if grep -q "UserLanguagePreference" "/workspace/prisma/schema.prisma"; then
  echo -e "${GREEN}✓${NC} UserLanguagePreference model exists"
  ((PASS++))
else
  echo -e "${RED}✗${NC} UserLanguagePreference model missing"
  ((FAIL++))
fi

if grep -q "RestaurantLanguageSupport" "/workspace/prisma/schema.prisma"; then
  echo -e "${GREEN}✓${NC} RestaurantLanguageSupport model exists"
  ((PASS++))
else
  echo -e "${RED}✗${NC} RestaurantLanguageSupport model missing"
  ((FAIL++))
fi

if grep -q "LocalizedContent" "/workspace/prisma/schema.prisma"; then
  echo -e "${GREEN}✓${NC} LocalizedContent model exists"
  ((PASS++))
else
  echo -e "${RED}✗${NC} LocalizedContent model missing"
  ((FAIL++))
fi

if grep -q "LocationCurrencyMapping" "/workspace/prisma/schema.prisma"; then
  echo -e "${GREEN}✓${NC} LocationCurrencyMapping model exists"
  ((PASS++))
else
  echo -e "${RED}✗${NC} LocationCurrencyMapping model missing"
  ((FAIL++))
fi

echo ""
echo "7. Verifying Translation Quality..."
echo "================================"

# Check if Spanish has actual translations (not English)
if grep -q '"welcome": "Bienvenido"' "/workspace/locales/es/common.json"; then
  echo -e "${GREEN}✓${NC} Spanish translations are authentic"
  ((PASS++))
else
  echo -e "${RED}✗${NC} Spanish translations are placeholders"
  ((FAIL++))
fi

# Check if Arabic has actual translations
if grep -q '"welcome": "مرحبا"' "/workspace/locales/ar/common.json"; then
  echo -e "${GREEN}✓${NC} Arabic translations are authentic"
  ((PASS++))
else
  echo -e "${RED}✗${NC} Arabic translations are placeholders"
  ((FAIL++))
fi

# Check if Hausa has actual translations
if grep -q '"welcome": "Barka da zuwa"' "/workspace/locales/ha/common.json"; then
  echo -e "${GREEN}✓${NC} Hausa translations are authentic"
  ((PASS++))
else
  echo -e "${RED}✗${NC} Hausa translations are placeholders"
  ((FAIL++))
fi

echo ""
echo "8. Checking Documentation..."
echo "================================"

test_file "/workspace/docs/I18N_IMPLEMENTATION_COMPLETE.md" "Complete implementation guide"
test_file "/workspace/docs/I18N_IMPLEMENTATION_SUMMARY.md" "Implementation summary"

echo ""
echo "================================================"
echo "  Validation Results"
echo "================================================"
echo -e "${GREEN}Passed: $PASS${NC}"
echo -e "${RED}Failed: $FAIL${NC}"
echo ""

TOTAL=$((PASS + FAIL))
PERCENT=$((PASS * 100 / TOTAL))

echo "Success Rate: $PERCENT%"
echo ""

if [ $FAIL -eq 0 ]; then
  echo -e "${GREEN}✅ All checks passed! i18n system is fully integrated.${NC}"
  exit 0
else
  echo -e "${YELLOW}⚠️  Some checks failed. Please review the errors above.${NC}"
  exit 1
fi
