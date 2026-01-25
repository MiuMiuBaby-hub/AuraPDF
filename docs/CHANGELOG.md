# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased]

### Added
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
