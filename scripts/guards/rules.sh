# Grep guards: one rule per line as  name ⟂ description ⟂ grep -E pattern ⟂ file globs
# (⟂ is the field separator because patterns use | for alternation)
# Each rule names the CLAUDE.md / design-doc rule it enforces. Exclusions are per-rule in run-all.sh.
RULES=(
  'no-checkout-path ⟂ R11①: storefront has no checkout/cart/payment route ⟂ __PATH__(checkout|cart|payment) ⟂ *'
  'no-inline-margin ⟂ R13: spacing via antd Flex gap / Space, not inline margin ⟂ (style=[{][{][^}]*margin|^[[:space:]]*margin[A-Za-z]*:) ⟂ *.tsx'
  'no-gradient ⟂ profile B0: solid fills only ⟂ (linear|radial|conic)-gradient[(] ⟂ *.ts *.tsx *.css'
  'no-google-font ⟂ profile B0: system fonts, no build-time font fetch ⟂ next/font/google ⟂ *.ts *.tsx'
  'no-hardcoded-hex ⟂ profile B0: colours come from src/theme/tokens.ts ⟂ #[0-9a-fA-F]{6}([^0-9a-zA-Z_]|$) ⟂ *.ts *.tsx *.css'
  'no-dangerous-html ⟂ catalog.md §1.2: no raw HTML rendering ⟂ dangerouslySetInnerHTML ⟂ *.tsx'
  'no-raw-unsafe-sql ⟂ R4: parameterised SQL only ⟂ [$](query|execute)RawUnsafe ⟂ *.ts'
  'no-antd-compound-in-server ⟂ RSC: antd X.Y components are undefined in Server Components (React #130); use src/components/ui ⟂ __SERVER__<[A-Z][A-Za-z]*[.][A-Z] ⟂ *.tsx'
  'server-only-import ⟂ S5-4: server code starts with import "server-only" (client import = build error) ⟂ __MISSING__^import ["'"'"']server-only["'"'"'] ⟂ ^(server|modules/[^/]+/server)/[^/]+[.]ts$'
  'db-transaction-timeout ⟂ P3-2: interactive transactions need explicit maxWait/timeout ⟂ __MISSING__transactionOptions ⟂ ^server/db[.]ts$'
  'no-public-secret ⟂ R3: NEXT_PUBLIC_ vars ship to the browser ⟂ NEXT_PUBLIC_[A-Z0-9_]*(SECRET|TOKEN|PASSWORD|PRIVATE|KEY) ⟂ *.ts *.tsx .env.example'
)
