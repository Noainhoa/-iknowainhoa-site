#!/usr/bin/env bash
# Repeatable Tech Made Easy verification routine (local only).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== 1. Lint =="
npx eslint components/tech app/tech-made-easy lib/tech app/api/tech --max-warnings 0
# Service-role must never be exposed as NEXT_PUBLIC_ (ignore *.test.ts guard strings)
if rg -n "NEXT_PUBLIC_[A-Z0-9_]*SERVICE_ROLE|NEXT_PUBLIC_TECH_SUPABASE_SERVICE" lib/tech components/tech app/api/tech app/tech-made-easy .env.example -g '!**/*.test.ts'; then
  echo "ERROR: service-role key must not be NEXT_PUBLIC_" >&2
  exit 1
fi
# Tech server client must not fall back to parking service role
if rg -n "process\.env\.SUPABASE_SERVICE_ROLE_KEY" lib/tech app/api/tech; then
  echo "ERROR: Tech must use TECH_SUPABASE_SERVICE_ROLE_KEY only" >&2
  exit 1
fi

echo "== 2. TypeScript =="
npx tsc --noEmit

echo "== 3. Automated tests =="
npm run test:tech

echo "== 4. Production build =="
npm run build

echo "== 5. Manual follow-up =="
echo "Start: npm run dev -- --port 3000"
echo "Open: /tech-made-easy , /tech-made-easy?lang=en , /tech-made-easy/reserva/<token>"
echo "Screenshot at 375, 430, 768, 1280 into tmp/tech-verify-screenshots/"
echo "Inspect Call/Book/WhatsApp: normal, hover, focus, disabled, error."
echo "Check horizontal overflow, sticky bar vs #reservar, console errors, ES+EN."
echo "Preserve booking UI behaviour (no API/contract changes in this pass)."
echo "Done: lint + tsc + tests + build passed."
