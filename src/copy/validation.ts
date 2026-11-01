// Field-level validation messages for back-office forms (CLAUDE.md R12). Shared by client and server.
export const validationCopy = {
  required: (label: string) => `請填寫「${label}」`,
  tooLong: (label: string, max: number) => `「${label}」最多 ${max} 個字`,
  tooMany: (label: string, max: number) => `「${label}」最多 ${max} 項`,
  notNumber: (label: string) => `「${label}」要填數字`,
  notYear: (label: string, max: number) => `「${label}」要填 1950 到 ${max} 之間的西元年`,
  notOption: (label: string) => `「${label}」請從選項裡挑一個`,
  negative: (label: string) => `「${label}」不能是負數`,
  unknownField: (key: string) => `這個分類沒有「${key}」欄位，請重新整理頁面後再存`,
} as const;
