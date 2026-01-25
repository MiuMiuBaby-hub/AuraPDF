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
    | 'left-top';

// Page with detection result
export interface ProcessedPage {
    pageNumber: number;
    pageInfo: PageInfo;
    detection: DetectionResult;
    canvas: HTMLCanvasElement;
    manualPosition?: LogoPosition;
    skipLogo?: boolean;
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
