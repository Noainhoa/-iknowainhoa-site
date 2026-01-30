#!/usr/bin/env bash
set -euo pipefail
# Fail if example.com appears in tracked non-doc files.
ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT"

PATTERN='example\.com'

files=$(git ls-files | grep -Ev '(^docs/|README.md$|\.md$|\.MD$|\.png$|\.jpe?g$|\.gif$|\.webp$|\.lock$)')

if grep -En "$PATTERN" $files; then
  echo "\nError: placeholder domain example.com found. Replace with real URLs before commit." >&2
  exit 1
fi

echo "No example.com placeholders found."
