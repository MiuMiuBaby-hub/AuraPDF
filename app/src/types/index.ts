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
