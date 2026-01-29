# AuraPDF Roadmap

> 功能規劃藍圖 — 記錄已完成、進行中與計畫中的功能擴展

---

## 狀態說明

| 標記 | 說明 |
|------|------|
| Done | 已完成並合併至 main |
| In Progress | 開發中 |
| Planned | 已規劃，尚未開始 |

---

## 一、實用功能擴展

### 1. 浮水印功能
**狀態：Done** *(v1.3)*

- 支援文字浮水印（如「機密」、「草稿」、公司名稱）
- 可調整字體（Helvetica、Times Roman、Courier）、顏色、透明度、旋轉角度
- 平鋪模式（整頁重複浮水印，支援棋盤式錯位排列）
- 單點定位（中央、四角）
- 設定自動儲存到 localStorage

### 2. 多 Logo 支援
**狀態：Done** *(v1.1 — Logo Panel)*

- ~~同時插入多個不同的 Logo~~
- ~~例如：右上角放公司 Logo、左下角放認證標章~~
- 已實作 Logo Panel（右側面板），支援最多 4 個 Logo 插槽
- 使用 IndexedDB 持久化儲存
- 目前限制：每次處理僅可選擇一個 Logo 加入 PDF
- **後續擴展**：支援同一頁面同時嵌入多個 Logo

### 3. 頁面範圍選擇
**狀態：Planned**

- 指定只在特定頁面插入 Logo（如：僅首頁、僅奇數頁、第 1-5 頁）
- 排除封面或目錄頁

### 4. 模板 / 預設管理
**狀態：Planned**

- 儲存常用設定為模板（位置、大小、透明度組合）
- 快速套用不同客戶或專案的品牌設定

### 5. PDF 合併與分割
**狀態：Planned**

- 合併多個 PDF 為單一檔案
- 分割大型 PDF 為多個小檔案

---

## 二、編輯功能增強

### 6. 頁首 / 頁尾編輯
**狀態：Done** *(v1.4)*

- 頁首/頁尾各支援左、中、右三個獨立區塊
- 變數支援：`{page}` 當前頁、`{total}` 總頁數、`{date}` 日期、`{title}` 文件標題
- 可自訂字型（Helvetica、Times Roman、Courier）、大小、顏色、邊距
- 快速範本插入（頁碼、日期等）
- 設定自動儲存到 localStorage

### 7. Logo 進階調整
**狀態：Planned**

- 旋轉角度控制
- 邊框 / 陰影效果
- 形狀裁切（圓形、圓角）

### 8. 批次重新命名
**狀態：Planned**

- 自訂輸出檔名格式
- 支援變數（日期、序號、原檔名）

---

## 三、技術與體驗優化

### 9. 雲端儲存整合
**狀態：Planned**

- 連接 Google Drive / Dropbox
- 直接從雲端讀取 / 存入 PDF

### 10. 處理歷史記錄
**狀態：Planned**

- 查看過去處理的檔案清單
- 一鍵重新下載或套用相同設定

### 11. 離線 PWA 支援
**狀態：Planned**

- 可安裝為桌面應用
- 離線也能使用

### 12. API 模式
**狀態：Planned**

- 提供 REST API 給開發者整合
- 適合需要自動化流程的企業用戶

---

## 已完成的重大功能

| 版本 | 功能 | 完成日期 |
|------|------|----------|
| v1.0 | 基礎 PDF Logo 嵌入、空白偵測、手動調整 | 2026-01-25 |
| v1.1 | 批量處理模式（ZIP 打包下載） | 2026-01-26 |
| v1.1 | 免責聲明頁面（中英雙語） | 2026-01-26 |
| v1.1 | PDF 安全性 / 密碼保護 | 2026-01-27 |
| v1.1 | Logo Panel（多 Logo 管理面板） | 2026-01-28 |
| v1.1 | 旋轉 PDF 頁面 Logo 嵌入修正 | 2026-01-28 |
| v1.2 | 自動遞補機制 + 兩階段偵測演算法 | 2026-01-28 |
| v1.3 | 浮水印功能（文字、平鋪、透明度） | 2026-01-29 |
| v1.4 | 頁首/頁尾編輯（頁碼、日期、標題變數） | 2026-01-29 |

---

## 開發紀錄

### v1.2 — 自動遞補與偵測優化 (2026-01-28)

**新增功能：**
- `autoFallback` 開關：當指定位置被佔用時自動嘗試其他位置
- `fallbackPriority` 可拖曳排序：9 宮格位置優先順序自訂
- Logo 設定面板改為三欄並排（大小｜透明度｜預設位置），高度縮減 1/3

**偵測演算法改進：**
- 兩階段搜尋策略：
  1. **第一輪**：只找完全空白位置（`blank`，95%+ 純白像素）
  2. **第二輪**：若無空白，才放寬接受淺色區域（`light`，85%+ 淺色像素）
- 解決工程圖類文件（含浮水印、標題欄）Logo 誤放問題

**修改檔案：**
- `settingsStorage.ts`：新增 `autoFallback`、`fallbackPriority` 欄位
- `blankDetection.ts`：實作兩階段偵測邏輯
- `PositionSelector.tsx`：HTML5 drag-and-drop 拖曳排序
- `LogoSettings.tsx`：三欄式 UI 配置
- `App.tsx`：Props 鏈整合

---

### v1.3 — 浮水印功能 (2026-01-29)

**新增功能：**
- 文字浮水印系統，獨立於 Logo 功能
- 可自訂文字內容（預設選項：機密、草稿、CONFIDENTIAL、DRAFT、僅供內部使用）
- 字體選擇（Helvetica、Times Roman、Courier）
- 顏色選擇器 + 快捷顏色按鈕
- 透明度控制（10-100%）
- 旋轉角度控制（-90° ~ 90°）
- 位置選擇（中央、四角、平鋪模式）
- 平鋪模式進階設定：
  - 水平/垂直間距調整
  - 棋盤式錯位排列選項
- 設定自動儲存到 localStorage
- 內聯即時預覽

**新增檔案：**
- `types/index.ts`：WatermarkSettings、TileSettings 等類型
- `components/Settings/WatermarkSettings.tsx`：浮水印設定面板 UI
- `utils/settingsStorage.ts`：擴展支援浮水印設定持久化
- `utils/pdfProcessor.ts`：浮水印繪製邏輯（使用 pdf-lib drawText）

**技術細節：**
- 浮水印在 Logo 之前繪製（作為背景層）
- 使用 pdf-lib 的 StandardFonts 內建字型
- 平鋪模式最多 200 個浮水印以確保效能
- 支援批量處理模式

---

### v1.4 — 頁首/頁尾編輯 (2026-01-29)

**新增功能：**
- 頁首/頁尾系統，獨立於浮水印和 Logo 功能
- 頁首和頁尾各支援左對齊、置中、右對齊三個獨立區塊
- 動態變數替換：
  - `{page}` - 當前頁碼
  - `{total}` - 總頁數
  - `{date}` - 處理日期（zh-TW 格式）
  - `{title}` - 文件標題（檔名去除 .pdf）
- 快速範本插入按鈕
- 可自訂字型、大小（8-24pt）、顏色、邊距（20-80pt）
- 設定自動儲存到 localStorage

**新增檔案：**
- `components/Settings/HeaderFooterSettings.tsx`：頁首/頁尾設定面板 UI

**修改檔案：**
- `types/index.ts`：新增 HeaderFooterSettings、HeaderFooterRow、HeaderFooterTextBlock 類型
- `utils/settingsStorage.ts`：新增預設值和驗證函數
- `utils/pdfProcessor.ts`：新增繪製邏輯和變數替換函數
- `App.tsx`：整合狀態管理和組件渲染

**技術細節：**
- 繪製順序：浮水印（背景層）→ 頁首/頁尾 → Logo（前景層）
- 使用 pdf-lib 的 StandardFonts 內建字型（與浮水印相同限制）
- 每頁最多 6 個 drawText 呼叫（頁首+頁尾各 3 區塊）
- 支援批量處理模式，每個檔案的 {title} 變數獨立替換

---

*最後更新：2026-01-29*
