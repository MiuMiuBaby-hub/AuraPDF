// PDF Printing permission type
export type PrintingPermission = 'highResolution' | 'lowResolution' | false;

// PDF Permissions settings
export interface PdfPermissions {
    printing: PrintingPermission;   // 列印權限
    copying: boolean;               // 複製權限
    modifying: boolean;             // 修改權限
    annotating: boolean;            // 註解權限
}

// PDF Security settings
export interface SecuritySettings {
    enabled: boolean;               // 啟用加密
    userPassword: string;           // 開啟密碼
    ownerPassword: string;          // 權限密碼
    permissions: PdfPermissions;    // 權限設定
}

// PDF Page information
export interface PageInfo {
    pageNumber: number;
    width: number;
    height: number;
    canvas?: HTMLCanvasElement;
}

// Logo position on a page
export interface LogoPosition {
    x: number;
    y: number;
    width: number;
    height: number;
}

// Detection result for a page
export interface DetectionResult {
    pageNumber: number;
    position: LogoPosition;
    status: 'blank' | 'light' | 'occupied';
    positionName: PositionName;
}

// Position names
export type PositionName =
    | 'right-bottom'
    | 'right-top'
    | 'left-bottom'
    | 'left-top'
    | 'center'
    | 'top-center'
    | 'bottom-center'
    | 'left-center'
    | 'right-center';

// Page with detection result
export interface ProcessedPage {
    pageNumber: number;
    pageInfo: PageInfo;
    detection: DetectionResult;
    canvas: HTMLCanvasElement;
    manualPosition?: LogoPosition;
    skipLogo?: boolean;
    logoSize?: number;      // 每頁獨立大小 (undefined = 使用全局)
    logoOpacity?: number;   // 每頁獨立透明度 (undefined = 使用全局)
}

// App state steps
export type AppStep = 'upload' | 'preview' | 'download';

// Upload state
export interface UploadState {
    pdfFile: File | null;
    pdfBytes: ArrayBuffer | null;
    logoFile: File | null;
    logoBytes: ArrayBuffer | null;
    logoPreviewUrl: string | null;
}

// Settings state  
export interface SettingsState {
    logoSize: number; // in pixels (40-150)
    preferredPosition: PositionName;
}

// Position priority config
export interface PositionConfig {
    name: PositionName;
    xRatio: number;
    yRatio: number;
}

// File validation result
export interface ValidationResult {
    valid: boolean;
    error?: string;
}

// Pricing configuration
export interface PricingConfig {
    perPage: number;        // Cost per page in USD
    perFile: number;        // Base cost per file in USD
    currency: 'USD' | 'TWD';
}

// Single session cost estimate
export interface CostEstimate {
    pageCount: number;
    pageCost: number;
    fileCost: number;
    totalCost: number;
}

// Cumulative usage statistics
export interface UsageStats {
    totalPagesProcessed: number;
    totalFilesProcessed: number;
    totalCostAccumulated: number;
    firstUsedAt: string;
    lastUsedAt: string;
    sessionCount: number;
}

// Stored Logo for the Logo Panel
export interface StoredLogo {
    id: string;                    // crypto.randomUUID()
    name: string;                  // 原始檔名
    mimeType: string;              // image/png | image/jpeg | image/svg+xml
    size: number;                  // 檔案大小 (bytes)
    bytes: ArrayBuffer;            // 檔案原始資料（僅記憶體中）
    previewUrl: string;            // URL.createObjectURL (runtime)
    dimensions: { width: number; height: number };
    addedAt: string;               // ISO timestamp
}

// Logo Panel 最大插槽數
export const MAX_LOGO_SLOTS = 4;

// Batch processing types
export type BatchFileStatus =
    | 'pending'      // 等待處理
    | 'validating'   // 驗證中
    | 'analyzing'    // 分析頁面中
    | 'ready'        // 分析完成，等待下載
    | 'processing'   // 嵌入 Logo 中
    | 'completed'    // 處理完成
    | 'error';       // 處理失敗

// 批量處理中的單一檔案
export interface BatchFile {
    id: string;                      // crypto.randomUUID()
    file: File;
    status: BatchFileStatus;
    error?: string;                  // 錯誤訊息
    pageCount?: number;              // 驗證後取得的頁數
    processedPages?: ProcessedPage[]; // 分析結果
    resultBytes?: Uint8Array;        // 處理後的 PDF bytes
}

// 批量處理進度
export interface BatchProgress {
    currentFileIndex: number;        // 0-based index
    currentFileName: string;
    phase: 'validating' | 'analyzing' | 'processing' | 'zipping';
    overallProgress: number;         // 0-100
}

// ============================================
// 浮水印功能類型
// ============================================

// 支援的字型（pdf-lib 內建字型 + CJK 外部字型）
export type WatermarkFontFamily = 'Helvetica' | 'Times-Roman' | 'Courier' | 'Noto Sans TC';

// 浮水印位置模式
export type WatermarkPosition =
    | 'center'        // 頁面中央
    | 'top-left'      // 左上
    | 'top-right'     // 右上
    | 'bottom-left'   // 左下
    | 'bottom-right'  // 右下
    | 'tile';         // 平鋪模式

// 平鋪模式設定
export interface TileSettings {
    horizontalSpacing: number;       // 水平間距 (pt)
    verticalSpacing: number;         // 垂直間距 (pt)
    offsetAlternateRows: boolean;    // 是否錯位排列（棋盤式）
}

// 浮水印設定
export interface WatermarkSettings {
    enabled: boolean;                // 是否啟用浮水印
    text: string;                    // 浮水印文字
    fontFamily: WatermarkFontFamily; // 字型
    fontSize: number;                // 字體大小 (12-72 pt)
    color: string;                   // 顏色 (hex 格式如 #888888)
    opacity: number;                 // 透明度 (10-100)
    rotation: number;                // 旋轉角度 (-90 ~ 90 度)
    position: WatermarkPosition;     // 位置模式
    tileSettings: TileSettings;      // 平鋪模式設定
}

// ============================================
// 頁首/頁尾功能類型
// ============================================

// 頁首/頁尾單一區塊
export interface HeaderFooterTextBlock {
    text: string;      // 支援變數: {page}, {total}, {date}, {title}
    enabled: boolean;
}

// 頁首或頁尾的設定
export interface HeaderFooterRow {
    enabled: boolean;                // 是否啟用此列
    left: HeaderFooterTextBlock;     // 左對齊區塊
    center: HeaderFooterTextBlock;   // 置中區塊
    right: HeaderFooterTextBlock;    // 右對齊區塊
    fontFamily: WatermarkFontFamily; // 字型 (複用現有類型)
    fontSize: number;                // 字體大小 (8-24 pt)
    color: string;                   // 顏色 (hex 格式)
    margin: number;                  // 與頁面邊緣的距離 (20-80 pt)
}

// 完整的頁首/頁尾設定
export interface HeaderFooterSettings {
    header: HeaderFooterRow;         // 頁首設定
    footer: HeaderFooterRow;         // 頁尾設定
}
