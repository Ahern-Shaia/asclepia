# 研究紀錄：機械／設備買賣網站盤點（台灣＋國際）

> 查證日：2026-10-31｜身分：研究證據，非裁定。
> 用戶要求：「請尋找所有機械設備買賣平台的網站……參照以下網站找完整理成列表」，參照 ① https://www.solomon-3d.com/ ② https://www.used-equip.com.tw/index
> 方法：兩個研究 agent 分台灣／國際平行搜尋（台灣 30 組、國際 30 組查詢字串，列在 §6），**每一站都實際開過**（WebFetch，或以瀏覽器 UA curl 抽文字）。打不開的只列名與原因，不憑記憶描述。主 session 另外抽查參考站經營者名稱（§0）。

## 0. 差距表（「所有」做到幾成）

| 用戶的詞 | 做到 | 沒做到 |
|---|---|---|
| 「所有」機械設備買賣網站 | 已驗證 **86 站**（台灣 55、國際 31），另列 28 站打不開或未開 | 「所有」做不到：長尾的小型自營商成千上百家，搜尋引擎只露出一部分。缺口見 §5 |
| 「參照」solomon-3d.com | 已讀 4 頁 | **它不是設備買賣網站**：所羅門股份有限公司（1973 年成立）的官網，賣工業 AI 視覺檢測、3D 取料的軟硬體，沒有刊登、沒有中古品、沒有標價。若是當視覺參考，請說明 |
| 「參照」used-equip.com.tw | 已讀 3 頁 | 經營者是**攸仕得儀器股份有限公司**（/about、/index 內文逐字），台灣研究 agent 寫成「宏晟儀器」是錯的，本檔已更正 |

## 1. 結論先講

1. **台灣幾乎全是單一自營商**：自己的庫存、不標價、電話／LINE／詢價表單，幾乎沒有規格表、狀況分級或書面保固。這跟參考站 used-equip 同型。
2. **台灣的多賣家平台只有四個**：5871 中租設備網、Yahoo 拍賣、露天、台灣黃頁（web66/tw66）目錄。
3. **Yahoo 拍賣禁止所有醫療器材**，連有執照的醫材商也不行（政策頁逐字：「縱使您是有執照的醫療器材販賣業者也不可以販售醫療器材」，引衛福部 110/10/14 函 1101203021）。
4. **國外醫療影像商普遍不標價、只收詢價**（Block Imaging、Soma、CAE Online），靠設備編號、軟硬體版本、翻新流程、ISO 證書建立信任，跟本站「詢價＋看機＋線下成交」同路。
5. **值得抄的 UX**（各附來源）：多台合併詢價（Soma「Add to quote」、Intex 詢問清單）；狀態標籤（Intex「商談中／値下げ／動画」、Keysight Premium Used／Used 兩級）；列表卡固定欄位（Mascus：類別•年份•使用時數•地點）；工程師狀況報告（Hilditch）；篩選（5871：型號／廠牌／地區／年份／價格；Machineseeker：狀態四分法、只看有影片）。

## 2. 參考站

| 名稱 | URL | 是什麼 | 驗證 |
|---|---|---|---|
| 攸仕得儀器（used-equip） | https://www.used-equip.com.tw/ | 二手電子測試儀器自營商；銷售／收購／維修／租賃；不標價；電話、email、詢價表單；© 2021，最新消息 2024-03 | 是 |
| 所羅門 SOLOMON | https://www.solomon-3d.com/ | 工業 AI／3D 視覺軟硬體原廠官網（13 種語言、案例、型錄、免費試用）。**非設備買賣** | 是 |

## 3. 台灣（55 站，皆 2026-10-31 驗證）

「(curl)」＝只以 curl 讀到首頁文字。標「無」的功能可能存在於未開的內頁。

### 3.1 多賣家平台／拍賣／目錄

| 名稱 | URL | 類型 | 品類 | 標價 | 怎麼買 | 值得注意 |
|---|---|---|---|---|---|---|
| 5871 中租設備網 | https://www.5871.com.tw/ | 多賣家刊登（中租，金融導向） | 工具機 761、營建 303、電子 155、半導體 23、測量、卡車 | 多為面議，部分標價 | LINE、融資表單、電話；無購物車 | 型號／廠牌／地區／年份／價格篩選；各分類件數；已售出標記；收藏；聲明不擔保品質 |
| Yahoo 拍賣（中古機械） | https://tw.bid.yahoo.com/search/auction/product?p=中古機械 | 多賣家拍賣 | CNC、車床、沖床（雜） | 有（部分 $999,999 佔位） | 競標、直購、購物車 | 新舊程度篩選（近全新／八成新）；**禁售醫療器材** |
| 露天市集（中古機械） | https://www.ruten.com.tw/find/?q=中古機械 | 多賣家 | 伺服、ABB 手臂、鑽床（雜） | 有 | 未驗證 | 價格／銷量排序 |
| 台灣黃頁詢價平台 web66／tw66 | https://www.web66.com.tw/ | 多賣家目錄 | 大量小型商家頁（機械、醫療、實驗室、射出） | 否 | 制式詢價表單（需求、統編、LINE ID、驗證碼） | 「相關供應商」「相關詢價」 |
| 亞洲機械網 | https://tw.asiamachinery.net/ | B2B 供應商目錄 | 例頁為二手射出機商 | 否 | 線上詢價、電話 | 中古專區未確認（部分驗證） |
| 台灣金服 TFASC | https://www.tfasc.com.tw/ | 拍賣（法院、債權） | 有「機器設備」類 | 底價 | 註冊、投標 | 篩選只對不動產 |
| 法務部行政執行署 | https://www.tpk.moj.gov.tw/ | 政府拍賣 | 每月 123 聯合拍賣，曾含鍋爐、堆高機 | 底價 | 現場或通訊投標 | 只有公告，無品項搜尋 |

### 3.2 工具機／射出機／一般工業（單一自營商）

| 名稱 | URL | 品類 | 怎麼買 | 值得注意 |
|---|---|---|---|---|
| 精銳中古機械 | http://sharkcnc.com/ | CNC 銑床 25、CNC 車床 23、走心機、臥式、磨床、射出、堆高機 | 電話、到廠 | 分類件數；HTTPS 憑證過期 (curl) |
| 立隆機械 | https://www.longest-cnc.com/ | 立式、車床、龍門、五軸 | 表單、電話、FB | 已售出／現貨標籤；中英 |
| 鴻昕機械 | https://www.acutek-tw.com/products | CNC 銑床車床、傳統機、二手配件 | 電話、LINE、email | 搜尋；免費估價 |
| 力大中古機械 | https://www.zdmachine.com.tw/ | CNC、放電／線割、磨床、沖床、Fanuc 手臂 | 電話、到廠、LINE | 搜尋；中英泰 |
| 三億中古機械 | https://www.machinehou.idv.tw/ | 25 個子類 | 電話、到廠 | 刊登日期與瀏覽數；規格只在標題 |
| 大業機械 | https://www.taya88.com/ | 沖床、銑床、車床、CNC、外銷 | 電話、LINE、email | 選購指南；內容停在 2017 |
| 天泰機械 | https://www.tientay.com.tw/ | 立臥式、車床、磨床、鋸床 | email、電話、LINE | 已售出頁；YouTube 試機影片 |
| 峻翔機電 | http://www.cnctrade.com.tw/ | 二手 CNC、CNC 出租、代理 | 詢價車、電話 | 搜尋、會員 (curl) |
| 世合實業 | https://www.web66.com.tw/CW527/-S527604.html | 車銑沖、放電、射出、量測 | 詢價表單 | 只有目錄頁 |
| 昇巧企業 | https://www.shgchu.com/ | 射出機與周邊、整廠外銷 | 電話、LINE、FB | 搜尋；中英 |
| 金江機械 | https://kinkon0001.blogspot.com/ | 射出機（日精、震雄…） | 電話、email | Blogger；貼文列年份與使用時數 |
| 雍大企業 | https://www.yungda-machine.com/ | 射出機（依柱距分）、周邊、伺服改裝 | 電話、LINE | 依柱距瀏覽 (curl) |
| 憶鎧企業 | https://chenyufong.web66.com.tw/ | 射出、吹瓶、沖床、CNC | 詢價表單、電話 | 目錄頁 (curl) |

### 3.3 電子測試量測儀器

| 名稱 | URL | 類型 | 標價 | 怎麼買 | 值得注意 |
|---|---|---|---|---|---|
| 攸仕得儀器（參考站） | https://www.used-equip.com.tw/ | 自營 | 否 | 電話、email | 標題含型號與頻率 |
| 弘燁科技 SMART | http://www.smart-inc.com.tw/ | 自營＋代理 | 否（特價在 Yahoo） | 詢價表單、電話 | 450+ 品項資料庫；品牌 × 分類瀏覽 |
| 阡鋒科技 Chiantech | https://www.chiantech.com.tw/ | 自營（台、深圳、蘇州） | 否 | 聯絡頁、電話 | 品牌子篩選附件數；三語 |
| 瀚誼科技 | https://www.hanyitek.com/ | 自營＋代理 | 否 | 詢價頁、電話 | 「部分機型附第三方或原廠校正證書」 |
| 全測儀器 Alltest | https://www.alltestek.com/ | 自營＋RF 代理 | 否 | 聯絡頁 | TAF 校正 |
| 良泰科技 Testidea | https://testidea.com.tw/ | 自營（維修起家） | 否 | 電話、聯絡頁 | 銷售、收購、租賃 |
| 鑫研通 Simtek | https://www.simtek.com.tw/instrument-acquisition.html | 自營（此頁為收購） | 否 | 電話、email、傳照片估價 | 自有車到府取件 |
| 宥億企業 YOIE | https://www.yoie.com.tw/ | 自營＋代理 | 否 | 報價鈕、詢價車、LINE | 會員區、每月特價 |
| Keysight Used（台灣站） | https://www.keysight.com/used/tw/zh | 原廠二手 | **有（USD 起價）** | 表單、帳號 | KeysightCare 最長 5 年；庫存數（內容為簡中） |
| Electro Rent 台灣 | https://www.electrorent.com/tw/promotions | 租賃＋二手 | 否 | 購物車送報價、電話 | 認證二手 23 步測試 |

### 3.4 實驗室分析儀器

| 名稱 | URL | 標價 | 怎麼買 | 值得注意 |
|---|---|---|---|---|
| 銘宇科技 | https://hplcgc.com.tw/ | 否 | 電話、LINE | HPLC/GC/GPC 10 品牌 71 件；搜尋、排序、品牌篩選附件數 |
| 鉅特科技 | http://www.great-tech.com.tw/ | **部分有**（例：AKTA FPLC NT$750,000） | 電話、email | 依技術與品牌的分類樹 (curl) |
| 利友科技 | https://hplc.web66.com.tw/ | 否 | 詢價表單 | 自述「3–12 個月保固」(curl) |
| 晨析科技 | https://0423931047.tw66.com.tw/ | 否 | 詢價表單、電話 | 目錄頁 (curl) |
| 優仕特 | https://0222573072.web66.com.tw/ | 否 | 詢價表單 | 自有網站 404 (curl) |

### 3.5 醫療設備（與本站最相關）

| 名稱 | URL | 標價 | 怎麼買 | 值得注意 |
|---|---|---|---|---|
| 品約醫療儀器 | https://www.pinyork.com.tw/secondmedicalequipment.html | 否 | 電話、email | **二手保固六個月，可契約延長**；頁面未見許可證字號 |
| 立捷醫療儀器 | https://hocom.tw/h/Product?key=887117186352&cateId=34623 | 否 | 電話、email | 內視鏡、超音波、麻醉機、去顫器；未見字號 |
| 波音醫學科技 | https://073928881.web66.com.tw/ | 否 | 詢價表單 | **保固一年**；二手超音波；未見字號 |
| 總騰儀器 | https://0286486194.tw66.com.tw/ | 否 | 詢價表單、電話 | X 光、CR/DR、超音波、心電圖、內視鏡、獸醫；未見字號 |
| 武田國際 | http://www.luluspa.com.tw/SB-TWO.htm | 否 | 電話、LINE | 簡單清單頁 (curl) |
| 健安科技 | https://jenan.tw66.com.tw/ | 否 | 詢價表單、電話 | 檢驗分析儀、診所設備 (curl) |

### 3.6 半導體／SMT

| 名稱 | URL | 類型 | 值得注意 |
|---|---|---|---|
| 旭泰半導體 | http://www.e-satisfy.com.tw/ | 仲介（封測） | Flash、© 2011，可能停更 (curl) |
| 創世應用科技 MostXP | https://www.mostxp.com/ | 自營 | 半導體與面板設備、濕製程 |
| 超常科技 EOM | https://eom.com.tw/ | 自營 | 二手 Disco 切割研磨 |
| 百尼爾機械 PSMC | https://www.psmc-semi.com/second_hand_equipment.php | 原廠附二手區 | 僅 2 件 |
| 威致科技 WAYES | https://wayes.com.tw/ | 自營 | 探針台、分類機、ATE；設備清單頁 |
| SemiMarket（SurplusGLOBAL） | https://www.semimarket.com/ | 多賣家（韓，新竹據點） | 繁中介面、購物車、詢價清單 (curl) |
| 楊展 | https://www.yang-chan.com.tw/ | 原廠附中古類別 | 錫爐、SMD (curl) |

### 3.7 食品／製藥機械

| 名稱 | URL | 值得注意 |
|---|---|---|
| 承益食品機械 | https://www.cy-foodmachinery.com.tw/ | 內頁有規格清單；詢價車、LINE |
| 豐益食品機械 | https://www.feng-yih.com/ | 烘焙設備；攪拌機規格表；中古庫存清單 |
| 沃德企業 | https://www.tw-wode.com/ | 製藥、食品化工、餐飲；寄賣專區 |

### 3.8 營建／重機械

| 名稱 | URL | 值得注意 |
|---|---|---|
| 台明重工 | https://backhoe.com.tw/ | 依噸級分類；新到／已售出標籤；「電洽」 |
| 台灣建機 | https://www.twkenki.com.tw/ | 進口二手挖土機、鏟裝機 |
| 弘泰重機械 | https://www.hongtai-mc.com.tw/ | **卡片列引擎時數**；中英 (curl) |
| 互益機械 | https://www.huyih.com/ | 庫存放 FB/IG，不在網站 (curl) |

### 3.9 外國平台的台灣頁

| 名稱 | URL | 說明 |
|---|---|---|
| Exapro | https://www.exapro.com/ | 法國，見 §4 |
| Machineseeker（台灣製） | https://www.machineseeker.nz/mss/taiwan | 德國；133 台台灣製機器（多在歐洲）；無中文 |

## 4. 國際（31 站，皆 2026-10-31 驗證；研究出口 IP 在台灣，部分站回台灣版或擋 IP）

### 4.1 綜合工業平台／拍賣

| 名稱 | URL | 國家 | 類型 | 標價 | 怎麼買 | 值得抄 |
|---|---|---|---|---|---|---|
| Exapro | https://www.exapro.com/ | 法國 | 平台＋專人仲介 | 部分有 | 登入後 Request price；平台先過濾；收佣 | 卡片國旗＋年份；公制英制、幣別切換；專屬經紀人 |
| Machineseeker | https://www.machineseeker.com/ | 德國 | 分類廣告＋拍賣 | 有或「Call」 | 詢價、電話、要更多照片、出價 | **篩選最完整**：狀態四分（New/Ex-display/Used/Defective）、CE、只看有影片、只看認證商家；距離；交貨條件；合約範本；儲存搜尋 |
| used-machines.com | https://www.used-machines.com/ | 德國 | 平台 | 有 | 詢價、電話 | Trust Seal；標題含廠牌型號 |
| Surplex | https://www.surplex.com/ | 德國 | 拍賣＋直購 | 顯示成交價 | 限時出價、線上付款 | 倒數、No reserve、儲存搜尋 |
| Troostwijk | https://www.troostwijkauctions.com/ | 荷蘭 | 拍賣＋直購 | 顯示成交價 | 出價 | 拍品編號、追蹤人數、客戶經理照片 |
| NetBid | https://www.netbid.com/ | 德國 | 破產清算拍賣 | — | 出價、電話 | 整廠打包 (curl) |
| Bid on Equipment | https://www.bid-on-equipment.com/ | 美國 | 平台 | 有（最低出價） | 低於標價出價、購物車、電話 | 「Can't find it? Call us. We have real people」(curl) |
| Proxibid | https://www.proxibid.com/ | 美國 | 拍賣平台 | — | 同步／限時拍賣 | 附近拍賣 (curl) |
| Heritage Global Partners | https://www.hgpauction.com/ | 美國 | 拍賣 | — | 掛 HiBid／BidSpotter | 精選翻新設備分類 (curl) |
| Liquidity Services | https://www.liquidityservices.com/ | 美國 | 拍賣集團 | — | 導向 AllSurplus、GovDeals | 證實 Machinio 為旗下 (curl) |

### 4.2 營建／重機

| 名稱 | URL | 國家 | 類型 | 值得抄 |
|---|---|---|---|---|
| IronPlanet | https://www.ironplanet.com/ | 美國（RB 集團） | 拍賣＋Buy Now＋議價＋融資 | **詳細檢測報告＋IronClad Assurance** |
| Mascus | https://www.mascus.com/ | 歐洲 | 分類廣告聚合 | **列表固定欄位：類別•年份•使用時數•地點•經銷商** (curl) |
| Machineryline | https://machineryline.com/ | 國際 | 分類廣告 | 40 萬則廣告；出租區 (curl) |
| Euro Auctions | https://www.euroauctions.com/ | 英國 | 拍賣 | 依序號搜尋（部分） |

### 4.3 醫療設備（與本站最相關）

| 名稱 | URL | 國家 | 類型 | 標價 | 值得抄 |
|---|---|---|---|---|---|
| DOTmed | https://www.dotmed.com/ | 美國 | 分類廣告＋拍賣＋服務目錄 | 部分有 | 標題含年份與探頭數；賣家評價；誠信論壇（子頁 403） |
| Block Imaging | https://www.blockimaging.com/ | 美國 | 自營 | **不標價** | **設備 EQ 編號**；軟體版本＋硬體明細；「Certified Refurbished」7 步；ISO 9001；庫存狀態 |
| Soma Technology | https://www.somatechnology.com/ | 美國 | 自營 | 不標價 | **詢價車「Add to quote」**；New／Demo／Refurbished 標示；附 ISO 13485 證書；PDF 型錄 |
| Hilditch Group | https://www.hilditchgroup.com/ | 英國 | 拍賣＋零售 | — | **工程師狀況報告**；ISO 9001/13485 |
| Siemens Healthineers ecoline | https://www.siemens-healthineers.com/ | 德國（原廠） | 原廠翻新 | 不標價 | 認證翻新流程（部分） |

### 4.4 實驗室

| 名稱 | URL | 國家 | 類型 | 值得抄 |
|---|---|---|---|---|
| LabX | https://www.labx.com/ | 加拿大 | 平台＋拍賣 | 依應用／廠牌／經銷商瀏覽；求購廣告 (curl) |
| BioSurplus | https://www.biosurplus.com/ | 美國 | 經銷＋拍賣 | 另有拍賣站 |
| American Laboratory Trading | https://www.americanlaboratorytrading.com/ | 美國 | 自營（購物車） | **超過 $25k 改報價**；最長 3 年保固；比價保證 (curl) |

### 4.5 測試量測

| 名稱 | URL | 國家 | 類型 | 值得抄 |
|---|---|---|---|---|
| Valuetronics | https://www.valuetronics.com/ | 美國 | 自營（Shopify） | 廠牌／價格篩選；關稅變價提示 |
| Keysight Used | https://www.keysight.com/used | 原廠 | 原廠二手 | **Premium Used／Used 兩級**；校正；最長 5 年保固；庫存數 |

### 4.6 半導體

| 名稱 | URL | 國家 | 類型 | 值得抄 |
|---|---|---|---|---|
| CAE Online | https://www.caeonline.com/ | 美國 | 交易商＋平台 | 不標價；7 種語言含繁中 (curl) |
| Moov | https://www.moov.co/ | 美國 | 平台 | 匿名向賣家提問；需求比對；公開交期紀錄 (curl) |
| SurplusGLOBAL | https://www.surplusglobal.com/ | 韓國 | 交易商 | 倉儲溫濕度數據 (curl) |
| SemiMarket | https://www.semimarket.com/ | 韓國 | 商城 | 詢價清單；找不到可下載清單 (curl) |

### 4.7 日本、韓國、中國

| 名稱 | URL | 國家 | 類型 | 值得抄 |
|---|---|---|---|---|
| Intex（インテックス） | https://www.intexkikai.com/ | 日本 | 工具機自營（4 倉） | **未稅含稅都標**；多台一次估價；「商談中／値下げ／動画」標籤；列存放地點；可試運轉 (curl) |
| 다아라 Daara | https://www.daara.co.kr/ | 韓國 | 工業機械平台 | 比較功能；3D 展示館；聲明平台非交易當事人 (curl) |
| 二舅 Erjiu | https://www.erjiu.cn/ | 中國 | 綜合平台 | **實名認證**後才看得到賣家聯絡方式；求購登記 (curl) |

## 5. 打不開／未驗證（只列名，不描述內容）

**國際，擋機器人或連不上**：Machinio（Akamai 403）、Kitmondo、EquipNet、Bimedis、MachineryTrader、machinetools.com、Surplus Solutions（Cloudflare）、rbauction.com（擋台灣 IP）、MedWOW（TLS 錯誤）、BidSpotter、AllSurplus、GovDeals（純 JS／403）、Ekuipp（日，純 JS）、GE GoldSeal（404）、used-line.de（連不上、搜尋也找不到）、Hilco 工業拍賣（網址開出已關閉的韓國站）、TestEquity 二手頁（404）。

**台灣，排除**：Machinio 台灣頁（403）、台灣E界（無限轉址）、新天地綠能（已改賣隔間牆）、應信科技（只有舊新聞）；只在搜尋摘要出現、未開站：銓球、佑豐、全成永（食品）、金富國、震穎、德毅、泳昇（重機／堆高機）、晶傑、默林、jc Precise（半導體）、優加力。

**缺口**：
- 中國大陸的中文平台只驗到一個（二舅）；处理网、中国二手设备交易网只找到 App。
- 日本、韓國的中古醫材網站一個都沒驗到；搜尋結果多是法規說明（日本需販賣業許可並事先通知製造販賣業者；韓國需販賣業申報）。日本醫材出口商似乎多透過 DOTmed 外銷（未驗證）。
- 台灣 SMT、食品包裝、工業資產拍賣覆蓋最薄；沒有找到專做工業資產的台灣拍賣公司。

## 6. 查詢字串

**台灣（30 組）**：二手機械 買賣 平台 台灣／中古工具機 買賣 台灣／二手儀器 買賣 量測儀器 中古／中古醫療設備 買賣 台灣 二手醫療器材／used machinery Taiwan dealer machine tools second hand／二手工具機 網站 CNC 中古 綜合加工機 出售／中古機械網 二手機械 刊登 買賣網／中古射出機 買賣 台灣／二手半導體設備 台灣 買賣 公司／二手量測儀器 示波器 頻譜分析儀 中古 租賃 台灣／二手實驗室設備 買賣 台灣 中古 實驗儀器／二手食品機械 包裝機 中古 買賣／工業設備 拍賣 台灣 機台 標售 動產拍賣／中古挖土機 怪手 堆高機 買賣 網站 台灣／二手SMT設備 中古 貼片機 回焊爐 買賣 台灣／台灣二手機械網 usedmachine 中古機台 刊登平台／中古沖床 中古車床 銑床 磨床 買賣 收購 公司／二手醫療設備 超音波 內視鏡 中古 出售 醫療器材商 台灣／台灣金服 動產 拍賣 機器設備／中古儀器 二手儀器 公司 官網 安捷倫 是德 Tektronix 二手 台灣 收購／應信科技 二手半導體設備 交易平台／楊展 SMT 中古設備買賣／中古食品機械 買賣 收購 台灣 公司 烘焙機 充填機／中古怪手 二手挖土機 出售 台灣 重機械 公司 官網／中古射出成型機 收購 買賣 二手射出機 公司／二手 HPLC 氣相層析 中古 分析儀器 買賣 台灣／行政執行署 聯合拍賣 動產 機器 網站 拍賣公告／亞洲機械網 中古機械 分類 asiamachinery used／machinio Taiwan used machines sellers／二手半導體設備 新竹 refurbish 公司 used semiconductor equipment Taiwan

**國際（30 組）**：used industrial machinery marketplace Machinio Exapro Surplex／used medical equipment marketplace DOTmed Bimedis MedWOW refurbished／used laboratory equipment marketplace LabX BioSurplus refurbished lab equipment／used test and measurement equipment refurbished Valuetronics TestEquity Electro Rent used-line／used semiconductor equipment marketplace CAE Online Moov SurplusGLOBAL／中古機械 売買 サイト 中古工作機械 検索／二手设备 交易平台 二手机床 网站／중고기계 매매 사이트 중고 장비 거래 플랫폼／refurbished medical imaging equipment dealer Block Imaging Soma Technology used CT MRI ultrasound／industrial auction used equipment BidSpotter Proxibid Troostwijk Hilco Heritage Global／used construction equipment marketplace Mascus MachineryTrader IronPlanet RB Global／中古医療機器 販売 サイト 中古 超音波診断装置 販売／中古工作機械 販売 在庫検索 価格 マシニングセンタ 中古機械 ネット／中古医療機器 販売 通販 在庫 保証 医療機器販売業許可／二手医疗设备 交易平台 二手B超 二手CT 出售／다아라 기계장터 중고기계 daara／used-line.de gebrauchte Messtechnik／Keysight Premium Used equipment certified pre-owned warranty／中古計測器 販売 校正 保証 オシロスコープ 中古 通販／gebrauchte Messgeräte Händler kalibriert Gewährleistung Oszilloskop gebraucht kaufen／中古医療機器 販売 専門店 オンライン 中古内視鏡 中古超音波 在庫一覧；補充 9 組（Surplus Solutions／ALT、韓國醫材、处理网、GE GoldSeal／Siemens ecoline、日本醫材通販、グリーンメディカル、アローズヘルスケア、日本醫材出口商）。
