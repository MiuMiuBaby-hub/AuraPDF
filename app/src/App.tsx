import { useState, useCallback, useEffect } from 'react';
import { Loader2, ArrowRight, ArrowLeft, Download, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

// Types
import type { AppStep, ProcessedPage, LogoPosition, PositionName } from './types';

// Components
import { Header } from './components/Layout/Header';
import { Stepper } from './components/Layout/Stepper';
import { PdfUploader } from './components/FileUpload/PdfUploader';
import { LogoUploader } from './components/FileUpload/LogoUploader';
import { LogoSettings } from './components/Settings/LogoSettings';
import { PageGrid } from './components/Preview/PageGrid';
import { PageEditor } from './components/Preview/PageEditor';

// Utils
import { validatePdfFile, loadPdfDocument, renderPageToCanvas, getRenderScale } from './utils/pdfUtils';
import { validateLogoFile, createImagePreviewUrl, revokeImagePreviewUrl, getImageMimeType } from './utils/imageUtils';
import { detectLogoPosition, calculateLogoDimensions, getImageDimensions } from './utils/blankDetection';
import { processPdfWithLogos, downloadPdf } from './utils/pdfProcessor';

function App() {
  // Current step
  const [currentStep, setCurrentStep] = useState<AppStep>('upload');

  // PDF state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isPdfValidating, setIsPdfValidating] = useState(false);

  // Logo state
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoBytes, setLogoBytes] = useState<ArrayBuffer | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [logoDimensions, setLogoDimensions] = useState<{ width: number; height: number } | null>(null);

  // Settings
  const [logoSize, setLogoSize] = useState(80);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processedPages, setProcessedPages] = useState<ProcessedPage[]>([]);

  // Editor state
  const [selectedPage, setSelectedPage] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Cleanup logo preview URL on unmount
  useEffect(() => {
    return () => {
      if (logoPreviewUrl) {
        revokeImagePreviewUrl(logoPreviewUrl);
      }
    };
  }, [logoPreviewUrl]);

  // Handle PDF file selection
  const handlePdfSelect = useCallback(async (file: File) => {
    setPdfError(null);
    setIsPdfValidating(true);
    setPdfFile(file);

    const result = await validatePdfFile(file);

    if (!result.valid) {
      setPdfError(result.error || '驗證失敗');
      setPdfFile(null);
    } else {
      const bytes = await file.arrayBuffer();
      setPdfBytes(bytes);
      setPdfPageCount(result.pageCount || null);
    }

    setIsPdfValidating(false);
  }, []);

  // Handle PDF clear
  const handlePdfClear = useCallback(() => {
    setPdfFile(null);
    setPdfBytes(null);
    setPdfPageCount(null);
    setPdfError(null);
    setProcessedPages([]);
  }, []);

  // Handle Logo file selection
  const handleLogoSelect = useCallback(async (file: File) => {
    setLogoError(null);

    const result = await validateLogoFile(file);

    if (!result.valid) {
      setLogoError(result.error || '驗證失敗');
      return;
    }

    // Cleanup old preview
    if (logoPreviewUrl) {
      revokeImagePreviewUrl(logoPreviewUrl);
    }

    const bytes = await file.arrayBuffer();
    const previewUrl = createImagePreviewUrl(file);
    const dimensions = await getImageDimensions(bytes);

    setLogoFile(file);
    setLogoBytes(bytes);
    setLogoPreviewUrl(previewUrl);
    setLogoDimensions(dimensions);
  }, [logoPreviewUrl]);

  // Handle Logo clear
  const handleLogoClear = useCallback(() => {
    if (logoPreviewUrl) {
      revokeImagePreviewUrl(logoPreviewUrl);
    }
    setLogoFile(null);
    setLogoBytes(null);
    setLogoPreviewUrl(null);
    setLogoError(null);
    setLogoDimensions(null);
    setProcessedPages([]);
  }, [logoPreviewUrl]);

  // Can proceed to next step
  const canProceed = pdfFile && pdfBytes && logoFile && logoBytes && !pdfError && !logoError;

  // Process PDF and detect positions
  const handleAnalyze = useCallback(async () => {
    if (!pdfBytes || !logoBytes || !logoDimensions) return;

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      const pdfDoc = await loadPdfDocument(pdfBytes);
      const numPages = pdfDoc.numPages;
      const renderScale = getRenderScale();

      // Calculate logo size in render coordinates
      const logoDims = calculateLogoDimensions(
        logoDimensions.width,
        logoDimensions.height,
        logoSize * renderScale
      );

      const pages: ProcessedPage[] = [];

      for (let i = 1; i <= numPages; i++) {
        // Render page to canvas
        const canvas = await renderPageToCanvas(pdfDoc, i);

        // Detect best position
        const detection = detectLogoPosition(
          canvas,
          logoDims.width,
          logoDims.height,
          'right-bottom' as PositionName
        );
        detection.pageNumber = i;

        pages.push({
          pageNumber: i,
          pageInfo: {
            pageNumber: i,
            width: canvas.width,
            height: canvas.height,
          },
          detection,
          canvas,
        });

        setProcessingProgress(Math.round((i / numPages) * 100));
      }

      setProcessedPages(pages);
      setCurrentStep('preview');
    } catch (error) {
      console.error('Processing error:', error);
      setPdfError('處理 PDF 時發生錯誤');
    } finally {
      setIsProcessing(false);
    }
  }, [pdfBytes, logoBytes, logoDimensions, logoSize]);

  // Handle position change in editor
  const handlePositionChange = useCallback((pageNumber: number, position: LogoPosition) => {
    setProcessedPages(prev => prev.map(p =>
      p.pageNumber === pageNumber
        ? { ...p, manualPosition: position }
        : p
    ));
  }, []);

  // Handle skip page toggle
  const handleSkipPage = useCallback((pageNumber: number) => {
    setProcessedPages(prev => prev.map(p =>
      p.pageNumber === pageNumber
        ? { ...p, skipLogo: !p.skipLogo }
        : p
    ));
  }, []);

  // Handle reset position
  const handleResetPosition = useCallback((pageNumber: number) => {
    setProcessedPages(prev => prev.map(p =>
      p.pageNumber === pageNumber
        ? { ...p, manualPosition: undefined, skipLogo: false }
        : p
    ));
  }, []);

  // Handle apply to all
  const handleApplyToAll = useCallback((pageNumber: number) => {
    const sourcePage = processedPages.find(p => p.pageNumber === pageNumber);
    if (!sourcePage) return;

    const position = sourcePage.manualPosition || sourcePage.detection.position;

    setProcessedPages(prev => prev.map(p => ({
      ...p,
      manualPosition: { ...position },
      skipLogo: sourcePage.skipLogo,
    })));
  }, [processedPages]);

  // Handle download
  const handleDownload = useCallback(async () => {
    if (!logoFile || !pdfFile) return;

    setIsDownloading(true);

    try {
      // Re-read files to get fresh ArrayBuffers (avoid detached buffer issues)
      const freshPdfBytes = await pdfFile.arrayBuffer();
      const freshLogoBytes = await logoFile.arrayBuffer();

      const resultBytes = await processPdfWithLogos(
        freshPdfBytes,
        freshLogoBytes,
        getImageMimeType(logoFile),
        processedPages
      );

      downloadPdf(resultBytes, pdfFile.name);
      setCurrentStep('download');
    } catch (error) {
      console.error('Download error:', error);
      const errorMessage = error instanceof Error ? error.message : '未知錯誤';
      alert(`生成 PDF 時發生錯誤：${errorMessage}`);
    } finally {
      setIsDownloading(false);
    }
  }, [logoFile, pdfFile, processedPages]);

  // Handle back
  const handleBack = useCallback(() => {
    if (currentStep === 'preview') {
      setCurrentStep('upload');
    } else if (currentStep === 'download') {
      setCurrentStep('preview');
    }
  }, [currentStep]);

  // Handle start over
  const handleStartOver = useCallback(() => {
    handlePdfClear();
    handleLogoClear();
    setCurrentStep('upload');
    setProcessedPages([]);
  }, [handlePdfClear, handleLogoClear]);

  // Get status counts
  const statusCounts = {
    blank: processedPages.filter(p => p.detection.status === 'blank' && !p.skipLogo).length,
    light: processedPages.filter(p => p.detection.status === 'light' && !p.skipLogo).length,
    occupied: processedPages.filter(p => p.detection.status === 'occupied' && !p.skipLogo).length,
    skipped: processedPages.filter(p => p.skipLogo).length,
  };

  // Selected page for editor
  const selectedPageData = selectedPage !== null
    ? processedPages.find(p => p.pageNumber === selectedPage)
    : null;

  return (
    <div className="min-h-screen">
      <Header />
      <Stepper currentStep={currentStep} />

      <main className="max-w-6xl mx-auto px-4 pb-12">
        {/* Step 1: Upload */}
        {currentStep === 'upload' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <PdfUploader
                file={pdfFile}
                pageCount={pdfPageCount}
                isValidating={isPdfValidating}
                error={pdfError}
                onFileSelect={handlePdfSelect}
                onClear={handlePdfClear}
              />

              <LogoUploader
                file={logoFile}
                previewUrl={logoPreviewUrl}
                error={logoError}
                onFileSelect={handleLogoSelect}
                onClear={handleLogoClear}
              />
            </div>

            {logoFile && logoPreviewUrl && (
              <LogoSettings
                logoSize={logoSize}
                onSizeChange={setLogoSize}
                logoPreviewUrl={logoPreviewUrl}
              />
            )}

            <div className="flex justify-center pt-4">
              <button
                onClick={handleAnalyze}
                disabled={!canProceed || isProcessing}
                className="btn-primary flex items-center gap-2 px-8 py-3 text-lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    分析中... {processingProgress}%
                  </>
                ) : (
                  <>
                    開始分析
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Preview */}
        {currentStep === 'preview' && logoPreviewUrl && (
          <div className="space-y-6">
            {/* Status summary */}
            <div className="glass-card p-4 flex flex-wrap items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">完美位置: {statusCounts.blank}</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                <span className="text-gray-300">需確認: {statusCounts.light}</span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-gray-300">需調整: {statusCounts.occupied}</span>
              </div>
              {statusCounts.skipped > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">跳過: {statusCounts.skipped}</span>
                </div>
              )}
            </div>

            <p className="text-center text-gray-400">
              點擊任一頁面可進入編輯模式，手動調整 Logo 位置
            </p>

            <PageGrid
              pages={processedPages}
              logoPreviewUrl={logoPreviewUrl}
              selectedPage={selectedPage}
              onPageSelect={setSelectedPage}
            />

            {/* Actions */}
            <div className="flex justify-between pt-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                返回
              </button>

              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="btn-primary flex items-center gap-2 px-8 py-3 text-lg"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    處理中...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    下載 PDF
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Download complete */}
        {currentStep === 'download' && (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              PDF 處理完成！
            </h2>
            <p className="text-gray-400 mb-8">
              您的 PDF 已成功添加 Logo 並開始下載
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                返回預覽
              </button>

              <button
                onClick={handleStartOver}
                className="btn-primary flex items-center gap-2 px-6 py-3"
              >
                處理另一個檔案
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Page Editor Modal */}
      {selectedPageData && logoPreviewUrl && (
        <PageEditor
          page={selectedPageData}
          logoPreviewUrl={logoPreviewUrl}
          onPositionChange={(pos) => handlePositionChange(selectedPageData.pageNumber, pos)}
          onSkipPage={() => handleSkipPage(selectedPageData.pageNumber)}
          onResetPosition={() => handleResetPosition(selectedPageData.pageNumber)}
          onApplyToAll={() => handleApplyToAll(selectedPageData.pageNumber)}
          onClose={() => setSelectedPage(null)}
        />
      )}
    </div>
  );
}

export default App;
