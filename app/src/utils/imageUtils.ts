// Supported image formats
const SUPPORTED_FORMATS = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export interface ImageValidationResult {
    valid: boolean;
    error?: string;
    width?: number;
    height?: number;
}

// Validate logo image file
export async function validateLogoFile(
    file: File
): Promise<ImageValidationResult> {
    // Check file type
    if (!SUPPORTED_FORMATS.includes(file.type)) {
        return {
            valid: false,
            error: '請上傳 PNG、JPG 或 SVG 格式的圖片'
        };
    }

    // Check file size
    if (file.size > MAX_SIZE) {
        return { valid: false, error: '圖片大小不可超過 5MB' };
    }

    try {
        const dimensions = await getImageDimensionsFromFile(file);
        return {
            valid: true,
            width: dimensions.width,
            height: dimensions.height
        };
    } catch {
        return { valid: false, error: '無法讀取圖片，請確認檔案是否損壞' };
    }
}

// Get image dimensions from file
export function getImageDimensionsFromFile(
    file: File
): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({ width: img.width, height: img.height });
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };

        img.src = url;
    });
}

// Create preview URL for image
export function createImagePreviewUrl(file: File): string {
    return URL.createObjectURL(file);
}

// Revoke preview URL
export function revokeImagePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
}

// Convert image file to ArrayBuffer
export async function imageFileToArrayBuffer(file: File): Promise<ArrayBuffer> {
    return await file.arrayBuffer();
}

// Get MIME type from file
export function getImageMimeType(file: File): string {
    return file.type || 'image/png';
}
