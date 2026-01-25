import JSZip from 'jszip';

/**
 * Create a ZIP file containing multiple PDFs
 * @param files Array of { name, data } objects
 * @returns Promise<Blob> ZIP file as Blob
 */
export async function createZipFromFiles(
    files: Array<{ name: string; data: Uint8Array }>
): Promise<Blob> {
    const zip = new JSZip();

    for (const file of files) {
        // Add each PDF to the ZIP with its name
        zip.file(file.name, file.data, { binary: true });
    }

    // Generate ZIP with compression
    return zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
    });
}

/**
 * Generate output filename for a processed PDF
 * @param originalName Original file name
 * @param suffix Suffix to add (default: '_with_logo')
 * @returns New filename
 */
export function generateOutputFilename(
    originalName: string,
    suffix: string = '_with_logo'
): string {
    const lastDot = originalName.lastIndexOf('.');
    if (lastDot === -1) {
        return originalName + suffix + '.pdf';
    }
    const baseName = originalName.substring(0, lastDot);
    const extension = originalName.substring(lastDot);
    return baseName + suffix + extension;
}

/**
 * Download a Blob as a file
 * @param blob The Blob to download
 * @param filename The filename for the download
 */
export function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Download multiple processed PDFs as a ZIP file
 * @param processedFiles Array of { originalName, data } objects
 * @param zipFilename Name for the ZIP file
 */
export async function downloadAsZip(
    processedFiles: Array<{ originalName: string; data: Uint8Array }>,
    zipFilename: string = 'processed_pdfs.zip'
): Promise<void> {
    const filesWithNames = processedFiles.map(f => ({
        name: generateOutputFilename(f.originalName),
        data: f.data,
    }));

    const zipBlob = await createZipFromFiles(filesWithNames);
    downloadBlob(zipBlob, zipFilename);
}

/**
 * Format file size to human readable string
 * @param bytes File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
