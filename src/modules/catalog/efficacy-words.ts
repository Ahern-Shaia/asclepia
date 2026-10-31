// Words that make a listing claim medical efficacy — the test 醫材法 §3 uses to define a medical
// device, and what §6 calls a medical-device advertisement.
// The admin form warns and records the hit in audit; it does not hard-block (catalog.md §4.3),
// because a keyword list will have false positives.
const WORDS = [
  "治療",
  "療效",
  "治癒",
  "根治",
  "改善",
  "預防",
  "消除",
  "緩解",
  "保證有效",
  "減輕疼痛",
];

export function findEfficacyWords(text: string): string[] {
  return WORDS.filter((w) => text.includes(w));
}
