# 視覺分析與整合風格：「實機型錄」（提案，待用戶確認）

> 查證日：2026-10-31｜身分：**提案**。用戶確認後才寫進 `frontend-design-principles.md` §B0（取代目前的 `spec-catalog`），並更新 `tokens.ts` 與守衛。
> 用戶：「分析後，整理一套設計風格，然後先做一個 mockup，我先確認你整合後分析的設計風格」。
> Mockup：`/mockup/site-v3`（截圖 `docs/mockups/2026-10-31/home-v3-{desk,mobile}.png`）。
> 網站清單與功能見 `2026-10-31-equipment-marketplaces.md`。

## 1. 量了什麼

用 Playwright（Chromium，1440×900，一般 Chrome UA）實際打開 16 個參考站首頁，**每站都回 200**，截圖並讀 computed style。原始數據：`2026-10-31-visual/metrics.json`；首頁總覽 `sheet-home.jpg`；商品頁／列表頁 4 站 `sheet-detail.jpg`（5871、Intex、Machineseeker、Mascus）。

站點：攸仕得 used-equip、5871 中租、品約、銘宇、Keysight Used、Block Imaging、Soma、Hilditch、Machineseeker、Exapro、Surplex、Intex、Mascus、American Laboratory Trading、IronPlanet、Valuetronics。

⚠️ 量測限制：按鈕色是用選擇器（`button`、`[class*=btn]`）抓的近似值；cookie 同意框擋住了 Exapro、Surplex、Hilditch 的首屏；銘宇首屏是空白載入。

## 2. 量到的共同形態（只列 ≥ 一半參考站有的）

| 面向 | 量到的 | 站數 |
|---|---|---|
| **搜尋優先** | 首屏就有大搜尋框（頁首或 hero 正中）；Machineseeker、ALT、Mascus 帶分類下拉 | 10／16（5871、Keysight、Machineseeker、Exapro、Surplex、Mascus、ALT、IronPlanet、Valuetronics、Soma） |
| **分類附件數** | 分類列直接寫件數（「工具機 (761)」「Agriculture 85,217」） | 5871、Keysight、Mascus、Machineseeker 篩選欄 |
| **藍色主色＋橘色重點** | 主色藍：Block `#006EB2`、IronPlanet `#006EA6`、Machineseeker `#337AB7`、Exapro `#218CD9`、Soma 深藍 `#243066`；重點色橘：Block `#FD5000`、Mascus `#EF7300`、IronPlanet `#DA461F`、Machineseeker `#BC4B08`、5871 價格橘 | 藍 9／16、橘 5／16 |
| **小圓角** | 按鈕圓角眾數 3–6px（Keysight 6、Block 5、Soma 5、Machineseeker 6、Surplex 4、IronPlanet 3） | 9／16（另有 pill／大圓角 6 站：5871、品約、銘宇、Hilditch、Mascus、Valuetronics） |
| **系統無襯線、內文 14–16px** | 內文 14px（5871、Exapro、Intex、Keysight）或 16px（多數）；沒有一站用襯線體 | 16／16 |
| **卡片＝照片在上、固定欄位在下** | 照片 4:3 左右（比例眾數 1.33–1.47）、品名、型號、年份、價格；Intex 卡片內直接是小規格表（メーカー／型式／年式／価格） | 5871、Intex、Machineseeker、Mascus、ALT |
| **價格醒目** | 價格是卡片上最大或最顯色的字（5871 橘、Intex 黑粗、Machineseeker 粗） | 有標價的站全部 |
| **商品頁：關鍵事實列＋右側行動欄** | Machineseeker 圖上方一列「起價／年份／狀況／地點」，右欄固定「出價／聯絡（業務照片）／檢視可否（Arrange inspection）」 | Machineseeker、Intex（圖左規格右＋大詢價鈕） |
| **看機／檢視是行動** | 「Arrange inspection」「Inspection possible」、試運轉可 | Machineseeker、Intex |
| **多台合併詢價** | 詢價清單（Soma「Quote Cart」、Intex「お問い合わせ中リスト」、SemiMarket「Inquiry List」） | 3 站 |

**反面教材（量到的，要避開）**：
- 首屏大輪播或滿版人物照、看不到設備：used-equip、Block Imaging、Hilditch。
- 促銷方塊堆疊：ALT。
- 首屏被 cookie 牆蓋住：Exapro、Surplex、Hilditch。
- 一頁一千多個 10.5px 小字：Exapro 有 446 個 10.5px 文字節點。

## 3. 整合後的風格：「實機型錄」

**一句話**：像 Machineseeker／5871 一樣**搜尋優先、照片帶頭、欄位固定**，用業界通用的**藍＋橘**，把「**看實機**」放在跟「詢價」同一層的位置。

| # | 規則 | 依據（§2） | mockup 對應 |
|---|---|---|---|
| 1 | **首屏是找設備，不是形象**：頁首常駐「分類下拉＋搜尋」；hero 左邊一句話＋三個承諾，右邊「快速找設備」卡（分類／品牌／年份 → 查看 N 件） | 搜尋優先 10／16；反面：輪播 | 頁首搜尋、hero 找設備卡 |
| 2 | **分類一律附件數**；頁首第二列就是分類導覽 | 5871、Mascus、Keysight | 分類導覽列、分類卡 |
| 3 | **色彩**：主色海軍藍 `#1D4E89`（沿用）＋深底 `#14365F`；**重點色橘 `#C2410C`** 只用在三處：價格、主要行動（預約看機／詢價清單／查看）、「新到」標籤 | 藍＋橘是業界組合；`#C2410C` 白字對比 5.2:1（`tokens.test.ts`） | — |
| 4 | **形狀**：圓角 6px、1px 細框；hover 才浮起（陰影＋上移 2px） | 圓角 3–6px 為最多數（9／16） | 全站 |
| 5 | **字**：系統無襯線（PingFang／Noto Sans TC），內文 16px、卡片次要 14px，標題粗 800 但不超過 40px | 16／16 無襯線；不放大到 50px+ | — |
| 6 | **商品卡固定欄位順序**：照片（4:3）→ 分類 → 品牌 型號（粗）→ 中文品名 → 年份・狀況・保固 → 價格（最大、橘）→「加入詢價清單」 | 5871、Intex、Mascus | 最新上架 |
| 7 | **狀態標籤**：新到（衍生：最近更新的兩件，不是資料欄位）、已售出（深色＋價格刪除線） | Intex 狀態標籤、5871 NEW | 卡片左上 |
| 8 | **多台合併詢價**：卡片上「加入詢價清單」，頁首與手機底部列顯示件數 | Soma、Intex、SemiMarket | 可實際點（計數會變） |
| 9 | **看機是一級行動**：頁首橘色「預約看機」、首頁「看機地點」卡（地址、營業時間、來電預約） | Machineseeker Arrange inspection、Intex 試運轉 | 頁首、怎麼買旁 |
| 10 | **手機**：頁首下方就是搜尋框；底部固定「來電／詢價清單」 | 台灣站普遍浮動 LINE／電話鈕（5871） | 手機版 |

**與目前 `spec-catalog`（§B0）的差異**：

| 項目 | spec-catalog | 實機型錄 |
|---|---|---|
| 重點色 | 無（只有海軍藍） | 加橘 `#C2410C` |
| 圓角 | 4px | 6px |
| 首頁 hero | 標題＋搜尋 | 標題＋找設備卡（分類／品牌／年份） |
| 詢價 | 單件 | 多台合併詢價清單 |
| 看機 | 文字說明 | 一級按鈕＋看機地點卡 |
| 保留 | 系統字、不用漸層、規格表、設備銘牌（商品頁） | 同左 |

## 4. 需要你決定的（會動到資料模型或文案，mockup 先做成畫面）

1. **多台合併詢價**：要做的話，詢價資料要從「一筆詢價＝一件商品」改成「一筆詢價＝多件商品」（資料模型變更，R6）。
2. **「商談中」狀態**：Intex 有，目前資料模型只有草稿／上架／下架／已售出；要加就是新狀態。mockup 沒放。
3. **我自己寫的句子**：「看機請先來電預約」「可預約到倉庫看實機」「一次詢問多台」。請確認符合實際作業。
4. **照片**：參考站全部是實拍照，mockup 用的是線稿佔位圖；換成實拍後卡片觀感差很多，正式版建議照片直接填滿 4:3。

## 5. v4：加上美工層（2026-10-31，用戶：「能有美工設計嗎？」）

結構與 §3 的 10 條規則不變，加一層插畫：`/mockup/site-v4`（截圖 `docs/mockups/2026-10-31/home-v4-{desk,mobile}.png`）。

- **一套設備插畫**（`src/components/home-v4/equip-illus.tsx`）：超音波、病人監視器、檢驗分析儀、離心機、顯微鏡、牙科治療台 6 張，扁平雙色（海軍藍描邊＋淺藍面＋橘色指示燈），同一套畫用在首屏、分類卡、商品卡佔位圖、頁尾剪影。
- **首屏場景**：淺色聚光圓盤上站三台設備，浮著「NT$ 380,000」價格牌（取自第一件範例商品）與「可預約看機」標籤；下方橫向「找設備」列（分類／品牌／年份／查看 N 件）。
- **其他**：分類卡圓形插畫、怎麼買三張小插圖、看機地點小地圖、頁尾設備剪影。
- **動效**：首屏設備依序升起、標籤輕微浮動；分類與商品卡 hover 時插畫上浮；系統「減少動態效果」時全部關閉。
- **限制**：插畫是佔位，用來定調；正式上線商品卡用實拍照片，插畫只留在首屏、分類、空狀態與頁尾。
