# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added
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
