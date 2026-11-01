// What a person reads when an action fails (stack-rules S6-1). Codes are for programs; these are
// for people: what happened and what to do next. Unmapped errors get `UNKNOWN`, never raw text.
export const errorCopy = {
  UNAUTHORIZED: "登入已過期或沒有權限，請重新登入後再試一次。",
  INVALID: "有欄位需要修正，請看標紅的地方。",
  NOT_FOUND: "找不到這筆資料，可能已經被刪除。請重新整理頁面。",
  CONFLICT: "這筆資料剛被別人改過。請重新整理，確認最新內容後再存一次。",
  DUPLICATE: "已經有同名的資料，請換一個名稱。",
  IN_USE: "還有資料在使用它，所以不能刪除或變更。",
  PUBLISH_INCOMPLETE: "還有項目沒完成，暫時無法上架。",
  BAD_TRANSITION: "目前的狀態不能直接改成這個狀態。",
  UNKNOWN: "系統暫時無法完成，請稍後再試一次。一直失敗請聯絡管理員。",
} as const;

export type ErrorCode = keyof typeof errorCopy;
