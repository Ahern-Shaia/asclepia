#!/usr/bin/env bash
# Usage: run-all.sh [root]   (default root: src). Exit 1 if any rule matches or a probe errors.
set -uo pipefail
set -f  # globs in rules.sh are grep --include patterns, never shell globs
ROOT="${1:-src}"
HERE="$(cd "$(dirname "$0")" && pwd)"
source "$HERE/rules.sh"
SEP=' ⟂ '

fail=0
for rule in "${RULES[@]}"; do
  name="${rule%%"$SEP"*}"; rest="${rule#*"$SEP"}"
  desc="${rest%%"$SEP"*}"; rest="${rest#*"$SEP"}"
  pattern="${rest%%"$SEP"*}"; globs="${rest#*"$SEP"}"

  if [[ "$pattern" == __PATH__* ]]; then
    # match on the path relative to ROOT, so the location of ROOT itself can't trigger it
    hits=$(cd "$ROOT" && find . -type f -not -path '*/generated/*' | grep -iE "${pattern#__PATH__}")
    rc=$?
  elif [[ "$pattern" == __SERVER__* ]]; then
    # only files that are Server Components (no "use client" directive) and import antd
    hits=""; rc=1
    while IFS= read -r f; do
      head -3 "$f" | grep -qE "^[\"']use client[\"']" && continue
      grep -qE "from [\"']antd[\"']" "$f" || continue
      m=$(grep -nE -- "${pattern#__SERVER__}" "$f") && { hits+="$f:$m"$'\n'; rc=0; }
    done < <(find "$ROOT" -type f -name '*.tsx' -not -path '*/generated/*')
    hits="${hits%$'\n'}"
  else
    includes=()
    for g in $globs; do includes+=(--include="$g"); done
    excludes=(--exclude-dir=generated)
    if [[ "$name" == no-hardcoded-hex ]]; then excludes+=(--exclude-dir=theme); fi
    hits=$(grep -rnE "${includes[@]}" "${excludes[@]}" -- "$pattern" "$ROOT")
    rc=$?
    if [[ $rc -le 1 && "$name" == no-public-secret && "$ROOT" == src && -f .env.example ]]; then
      extra=$(grep -nE -- "$pattern" .env.example) && { hits+=$'\n'".env.example:$extra"; rc=0; }
    fi
  fi
  # grep: 0 = match, 1 = no match, 2 = error. An erroring probe must never read as "clean".
  if [[ $rc -gt 1 ]]; then echo "✗ $name — probe error (exit $rc), fix the pattern"; fail=1; continue; fi
  if [[ -n "$hits" ]]; then
    echo "✗ $name — $desc"
    echo "$hits" | sed 's/^/    /'
    fail=1
  fi
done
if [[ $fail -eq 0 ]]; then echo "guards: ${#RULES[@]} rules, 0 violations ($ROOT)"; fi
exit $fail
