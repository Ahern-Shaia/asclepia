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
  elif [[ "$pattern" == __MISSING__* ]]; then
    # files whose path (relative to ROOT) matches the globs field must contain the pattern
    # globs field: "<path regex>" or "<path regex> !<excluded path regex>"
    hits=""; rc=1; inc="${globs%% !*}"; exc=""
    [[ "$globs" == *" !"* ]] && exc="${globs#* !}"
    while IFS= read -r f; do
      rel="${f#"$ROOT"/}"
      [[ "$rel" =~ $inc ]] || continue
      [[ -n "$exc" && "$rel" =~ $exc ]] && continue
      [[ "$rel" == *.test.ts ]] && continue
      grep -qE -- "${pattern#__MISSING__}" "$f" || { hits+="$rel: missing ${pattern#__MISSING__}"$'\n'; rc=0; }
    done < <(find "$ROOT" -type f \( -name '*.ts' -o -name '*.tsx' \) -not -path '*/generated/*')
    hits="${hits%$'\n'}"
  elif [[ "$pattern" == __ACTIONS__* ]]; then
    # "use server" files: every export must be `export const x = adminAction(…)` / publicAction(…)
    hits=""; rc=1
    while IFS= read -r f; do
      head -3 "$f" | grep -qE "^[\"']use server[\"'];?[[:space:]]*$" || continue
      m=$(grep -nE '^export ' "$f" | grep -vE "^[0-9]+:export const [A-Za-z0-9_]+[[:space:]]*=[[:space:]]*(adminAction|publicAction)[(]") && { hits+="$f:$m"$'\n'; rc=0; }
    done < <(find "$ROOT" -type f \( -name '*.ts' -o -name '*.tsx' \) -not -path '*/generated/*')
    hits="${hits%$'\n'}"
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
    # style-lab explores *other* aesthetic profiles (dev-only, 404 in production via src/proxy.ts),
    # so the current profile's colour/gradient rules don't apply there. Safety rules still do.
    if [[ "$name" == no-hardcoded-hex || "$name" == no-gradient ]]; then excludes+=(--exclude-dir=style-lab); fi
    hits=$(grep -rnE "${includes[@]}" "${excludes[@]}" -- "$pattern" "$ROOT")
    rc=$?
    if [[ "$name" == use-cache-public-only && $rc -eq 0 ]]; then
      hits=$(grep -vE '/modules/(catalog|site-config)/server/public/' <<<"$hits"); [[ -n "$hits" ]] && rc=0 || rc=1
    fi
    if [[ "$name" == sharp-only-in-images && $rc -eq 0 ]]; then
      hits=$(grep -v '/modules/catalog/server/images/' <<<"$hits"); [[ -n "$hits" ]] && rc=0 || rc=1
    fi
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
