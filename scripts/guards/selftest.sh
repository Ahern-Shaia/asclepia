#!/usr/bin/env bash
# Positive + negative control for every guard: a guard that never fires looks identical to a clean tree.
# Portable to macOS bash 3.2 (no associative arrays).
set -uo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
source "$HERE/rules.sh"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT

fixture() { # name -> "relative/path<TAB>violating line"
  case "$1" in
    no-checkout-path)  printf '%s\t%s' "app/checkout/page.tsx" 'export default function P() { return null; }' ;;
    no-inline-margin)  printf '%s\t%s' "components/a.tsx" 'const a = <div style={{\n  padding: 4,\n  marginTop: 8,\n}} />;' ;;
    no-gradient)       printf '%s\t%s' "components/a.module.css" '.a { background: linear-gradient(red, blue); }' ;;
    no-google-font)    printf '%s\t%s' "app/layout.tsx" 'import { Inter } from "next/font/google";' ;;
    no-hardcoded-hex)  printf '%s\t%s' "components/b.tsx" 'const c = "#1D4E89";' ;;
    no-dangerous-html) printf '%s\t%s' "components/c.tsx" 'const d = <div dangerouslySetInnerHTML={{ __html: x }} />;' ;;
    no-raw-unsafe-sql) printf '%s\t%s' "modules/x/repo.ts" 'await db.$queryRawUnsafe(sql);' ;;
    no-antd-compound-in-server) printf '%s\t%s' "app/page.tsx" 'import { Typography } from "antd"; export default function P() { return <Typography.Title>x</Typography.Title>; }' ;;
    server-only-import) printf '%s\t%s' "server/secrets.ts" 'export const k = 1;' ;;
    db-transaction-timeout) printf '%s\t%s' "server/db.ts" 'import "server-only";\nexport const db = 1;' ;;
    admin-authz) printf '%s\t%s' "app/admin/inquiries/page.tsx" 'export default function P() { return null; }' ;;
    server-actions-wrapped) printf '%s\t%s' "modules/x/actions.ts" '"use server";\nexport const ok = adminAction("a", s, f);\nexport async function leak() {}' ;;
    no-public-secret)  printf '%s\t%s' "lib/env.ts" 'process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET;' ;;
    *) return 1 ;;
  esac
}

checked=0; bad=0
for rule in "${RULES[@]}"; do
  name="${rule%% ⟂ *}"
  fx=$(fixture "$name") || { echo "✗ selftest: no fixture for rule $name"; bad=1; continue; }
  rel="${fx%%	*}"; line="${fx#*	}"
  mkdir -p "$TMP/$name/clean"; echo "export const ok = 1;" > "$TMP/$name/clean/ok.ts"
  # negative control: a clean tree must pass
  if ! bash "$HERE/run-all.sh" "$TMP/$name/clean" >/dev/null; then echo "✗ $name: fires on a clean tree (or errors)"; bad=1; fi
  # positive control: one violating line must make exactly this rule fire
  target="$TMP/$name/dirty/$rel"; mkdir -p "$(dirname "$target")"; printf '%b\n' "$line" > "$target"
  [[ -s "$target" ]] || { echo "✗ $name: fixture not written"; bad=1; continue; }
  out=$(bash "$HERE/run-all.sh" "$TMP/$name/dirty"); rc=$?
  if [[ $rc -eq 0 ]] || ! grep -q "✗ $name " <<<"$out" || grep -q "probe error" <<<"$out"; then
    echo "✗ $name: did not fire cleanly on its fixture"; echo "$out" | sed 's/^/    /'; bad=1
  fi
  checked=$((checked + 1))
done
# style-lab exemption: profile rules skip it, but the same lines elsewhere must still fire,
# and a safety rule must still fire inside it.
L="$TMP/lab"; mkdir -p "$L/app/mockup/style-lab/x" "$L/components"
echo '.a { background: linear-gradient(red, blue); color: #1D4E89; }' > "$L/app/mockup/style-lab/x/a.module.css"
if ! bash "$HERE/run-all.sh" "$L" >/dev/null; then echo "✗ style-lab exemption: profile rules fire inside style-lab"; bad=1; fi
echo 'const d = <div dangerouslySetInnerHTML={{ __html: x }} />;' > "$L/app/mockup/style-lab/x/b.tsx"
if bash "$HERE/run-all.sh" "$L" >/dev/null; then echo "✗ style-lab exemption: safety rule silenced inside style-lab"; bad=1; fi
rm "$L/app/mockup/style-lab/x/b.tsx"; cp "$L/app/mockup/style-lab/x/a.module.css" "$L/components/a.module.css"
if bash "$HERE/run-all.sh" "$L" >/dev/null; then echo "✗ style-lab exemption leaks outside style-lab"; bad=1; fi
echo "guards selftest: $checked/${#RULES[@]} rules checked, $([[ $bad -eq 0 ]] && echo 'all fire on fixture and stay quiet on clean' || echo FAILED)"
exit $bad
