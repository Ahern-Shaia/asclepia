// STYLE LAB only: loads Google Fonts at runtime in the browser (dev-only route, gated by
// src/proxy.ts). Never use this outside style-lab — the production profile bans font fetches.
// Example: <LabFonts families={["Noto+Serif+TC:wght@400;700", "Inter:wght@400;800"]} />
export function LabFonts({ families }: { families: string[] }) {
  const href = `https://fonts.googleapis.com/css2?${families.map((f) => `family=${f}`).join("&")}&display=swap`;
  return <link rel="stylesheet" href={href} precedence="default" />;
}
