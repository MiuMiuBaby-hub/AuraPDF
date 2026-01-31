# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added
- **CJK 浮水印字型支援** - 中文浮水印文字正確渲染
  - 新增 `Noto Sans TC` 字型選項至 `WatermarkFontFamily` 類型
  - 新增 `fontLoader.ts` — CJK 字型載入器（三層備援：jsdelivr CDN → GitHub raw → Google Fonts API text subset）
  - 輸入中文時自動切換至 Noto Sans TC（可手動覆蓋）
  - Latin-only 字型搭配中文文字時顯示 amber 警告
  - CJK 字型使用 `subset: false` 嵌入（fontkit v1.x subsetting 會破壞 CJK 字形）
  - 新增 `pdf-lib-fontkit.d.ts` 類型宣告
  - 更新依賴：新增 `@pdf-lib/fontkit`

### Fixed
- **浮水印預覽與 PDF 輸出不一致** - 4 項 bug 修正
  - **SVG 文字錨點不一致**：預覽使用 `text-anchor="middle"` + `dominant-baseline="central"`，PDF 使用 baseline-start (左下角)。統一改為 `text-anchor="start"`
  - **預覽位置公式與 PDF 不同**：預覽直接在 SVG canvas 空間計算；修正為先在 PDF 點空間（Y 向上）計算再轉換到 SVG（Y 向下），與 `calculateWatermarkPositions` 同步
  - **旋轉頁面座標轉換錯誤**：`drawWatermarkOnPage` 的 case 90 和 270 的 Visual→MediaBox 座標轉換有誤，已修正為與 `drawHeaderFooterRowOnPage` 一致的公式
  - **旋轉頁面浮水印角度未補償**：`rotate: degrees(watermark.rotation)` 改為 `degrees(watermark.rotation + rotation)`，使浮水印在旋轉頁面上呈現正確的視覺角度

- **Logo Panel (右側面板)** - 多 Logo 管理功能
  - 畫面右側新增 Logo 面板，支援最多 4 個 Logo 插槽
  - 使用者可上傳、刪除、替換各個 Logo
  - 每次只能選擇其中一個 Logo（藍色高亮 + 勾號標示）加入 PDF
  - Logo 使用 IndexedDB 持久化儲存，重新整理頁面後仍保留
  - 處理完成後回到主畫面，Logo 不會被清除
  - 響應式設計：桌面版垂直排列於右側，手機版水平排列於上方
  - 新增元件：
    - `LogoPanel.tsx` - 右側面板容器
    - `LogoSlot.tsx` - 單一 Logo 插槽（空白/已填入兩種狀態）
  - 新增工具：
    - `logoStorage.ts` - IndexedDB CRUD 操作
  - 新增型別：
    - `StoredLogo` - Logo 資料結構
    - `MAX_LOGO_SLOTS` - 最大插槽數常數
  - 版面從單欄改為 Flex 雙欄佈局（主內容 + 右側面板）
  - 原有的 `LogoUploader` 元件不再於主畫面顯示（功能由 LogoPanel 取代）

- **PDF Security / Password Protection** - PDF 安全性設定
  - 支援設定開啟密碼 (User Password)
  - 支援設定權限密碼 (Owner Password)
  - 權限設定：
    - 允許/禁止列印（可選高解析度/低解析度）
    - 允許/禁止複製文字和圖片
    - 允許/禁止修改內容
    - 允許/禁止新增註解
  - 單檔和批量處理都支援加密
  - 新增元件：
    - `SecuritySettings.tsx` - PDF 安全性設定 UI 元件
  - 新增型別：
    - `SecuritySettings`, `PdfPermissions`, `PrintingPermission`
  - 更新依賴：
    - 將 `pdf-lib` 更換為 `pdf-lib-plus-encrypt` 以支援加密功能

- **Batch Processing Mode** - 批量處理功能
  - 支援同時上傳多個 PDF 檔案
  - 單檔/批量模式切換按鈕
  - 批量檔案列表顯示（含狀態、頁數、檔案大小）
  - 批量處理進度條（驗證 → 分析 → 處理 → 打包）
  - 處理完成後自動打包為 ZIP 下載
  - 新增元件：
    - `BatchFileList` - 批量檔案列表元件
    - `BatchProgress` - 批量處理進度元件
  - 新增工具：
    - `zipUtils.ts` - JSZip 打包工具函數
  - 更新元件：
    - `DropZone` - 支援多檔拖放上傳
    - `PdfUploader` - 支援 multiple 屬性

- **Disclaimer Modal** - 免責聲明頁面
  - 使用者必須滾動至底部並同意才能進入主程式
  - 支援中英雙語切換
  - 每次開啟應用程式都需要重新同意
  - 內容包含：
    - 測試用途聲明（不儲存資料）
    - 使用限制與付費說明（大量處理需付費帳戶）
    - 免責條款
    - 使用者責任

### Fixed
- **旋轉 PDF 頁面 Logo 嵌入修正** - 修復含有頁面旋轉屬性的 PDF 檔案 Logo 嵌入問題
  - **座標轉換修正** (`pdfProcessor.ts`)
    - 新增 `getPageRotation()` 函數讀取 PDF 頁面旋轉角度
    - 新增 `transformCanvasToPdf()` 函數處理 Canvas→PDF 座標轉換
    - 支援 0°、90°、180°、270° 四種旋轉角度的正確座標映射
    - 使用有效尺寸（effective dimensions）進行正規化，解決旋轉頁面寬高交換問題
  - **Logo 圖片旋轉修正** (`pdfProcessor.ts`)
    - 新增 `rotateImage()` 函數預旋轉 Logo 圖片以抵消頁面旋轉
    - Logo 嵌入時自動反向旋轉 `(360 - rotation)°`，確保 Logo 在顯示時方向正確
    - 90°/270° 旋轉頁面自動交換繪製尺寸（drawWidth/drawHeight）
    - 新增 `rotation:opacity` 複合快取鍵，避免重複處理相同旋轉+透明度組合
  - **偵測邏輯修正** (`blankDetection.ts`)
    - 修正使用者指定位置偏好時，自動偵測邏輯會覆蓋使用者選擇的問題
    - 當有指定偏好位置時，一律使用使用者指定位置，偵測狀態僅作為參考資訊

### Dependencies
- Added `jszip@^3.10.1` for ZIP file creation

---

## [1.0.0] - 2026-01-25

### Added
- Initial release of AuraPDF
- PDF file upload and validation
- Logo image upload (PNG, JPG, JPEG support)
- Automatic blank area detection for logo placement
- Manual logo position adjustment via drag-and-drop
- Page preview with status indicators (blank/light/occupied)
- Batch apply position to all pages
- Skip page option for logo insertion
- PDF generation with embedded logos
- Glassmorphism UI design with dark theme
- Responsive layout for various screen sizes
