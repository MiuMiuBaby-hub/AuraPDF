import { useState, useCallback, useEffect } from 'react';
import { Loader2, ArrowRight, ArrowLeft, Download, CheckCircle, AlertTriangle, XCircle, Files, FileText } from 'lucide-react';

// Types
import type { AppStep, ProcessedPage, LogoPosition, PositionName, CostEstimate, UsageStats, BatchFile, BatchProgress, SecuritySettings as SecuritySettingsType } from './types';

// Components
import { Header } from './components/Layout/Header';
import { Stepper } from './components/Layout/Stepper';
import { DisclaimerModal } from './components/Disclaimer/DisclaimerModal';
import { PdfUploader } from './components/FileUpload/PdfUploader';
import { LogoUploader } from './components/FileUpload/LogoUploader';
import { LogoSettings } from './components/Settings/LogoSettings';
import { SecuritySettings } from './components/Settings/SecuritySettings';
import { PageGrid } from './components/Preview/PageGrid';
import { PageEditor } from './components/Preview/PageEditor';
import { CostEstimateDisplay } from './components/Usage/CostEstimate';
import { UsageStatsDisplay } from './components/Usage/UsageStats';
import { BatchFileList, BatchProgressDisplay } from './components/Batch';

// Utils
import { validatePdfFile, loadPdfDocument, renderPageToCanvas, getRenderScale } from './utils/pdfUtils';
import { validateLogoFile, createImagePreviewUrl, revokeImagePreviewUrl, getImageMimeType } from './utils/imageUtils';
import { detectLogoPosition, calculateLogoDimensions, getImageDimensions } from './utils/blankDetection';
import { processPdfWithLogos, downloadPdf } from './utils/pdfProcessor';
import { loadSettings, saveSettings, DEFAULT_SECURITY_SETTINGS } from './utils/settingsStorage';
import { loadUsageStats, recordUsage } from './utils/usageStorage';
import { calculateCostEstimate } from './config/pricing';
import { downloadAsZip } from './utils/zipUtils';

function App() {
  // Disclaimer state - must agree each time
  const [hasAgreedToDisclaimer, setHasAgreedToDisclaimer] = useState(false);

  const handleDisclaimerAgree = useCallback(() => {
    setHasAgreedToDisclaimer(true);
  }, []);

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

  // Settings - load from localStorage
  const [logoSize, setLogoSize] = useState(() => loadSettings().logoSize);
  const [logoOpacity, setLogoOpacity] = useState(() => loadSettings().logoOpacity);
  const [preferredPosition, setPreferredPosition] = useState<PositionName>(() => loadSettings().preferredPosition);
  const [autoSize, setAutoSize] = useState(() => loadSettings().autoSize);
  const [autoSizePercent, setAutoSizePercent] = useState(() => loadSettings().autoSizePercent);

  // Security settings - NOT persisted to localStorage for security reasons
  const [securitySettings, setSecuritySettings] = useState<SecuritySettingsType>(() => ({ ...DEFAULT_SECURITY_SETTINGS }));

  // Save settings to localStorage when they change
  useEffect(() => {
    saveSettings({ logoSize, logoOpacity, preferredPosition, autoSize, autoSizePercent });
  }, [logoSize, logoOpacity, preferredPosition, autoSize, autoSizePercent]);

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processedPages, setProcessedPages] = useState<ProcessedPage[]>([]);

  // Editor state
  const [selectedPage, setSelectedPage] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Cost and usage state
  const [currentEstimate, setCurrentEstimate] = useState<CostEstimate | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats>(() => loadUsageStats());

  // Batch mode state
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [batchFiles, setBatchFiles] = useState<BatchFile[]>([]);
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(null);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);

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

      const pages: ProcessedPage[] = [];

      for (let i = 1; i <= numPages; i++) {
        // Render page to canvas
        const canvas = await renderPageToCanvas(pdfDoc, i);

        // Calculate logo size - auto or fixed
        let effectiveLogoSize: number;
        if (autoSize) {
          // Auto size: use percentage of the smaller page dimension
          const minDimension = Math.min(canvas.width, canvas.height) / renderScale;
          effectiveLogoSize = Math.round(minDimension * (autoSizePercent / 100));
          // Clamp to reasonable bounds
          effectiveLogoSize = Math.max(40, Math.min(effectiveLogoSize, 200));
        } else {
          effectiveLogoSize = logoSize;
        }

        // Calculate logo dimensions in render coordinates
        const logoDims = calculateLogoDimensions(
          logoDimensions.width,
          logoDimensions.height,
          effectiveLogoSize * renderScale
        );

        // Detect best position
        const detection = detectLogoPosition(
          canvas,
          logoDims.width,
          logoDims.height,
          preferredPosition
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
          // Store per-page logoSize when autoSize is enabled
          logoSize: autoSize ? effectiveLogoSize : undefined,
        });

        setProcessingProgress(Math.round((i / numPages) * 100));
      }

      setProcessedPages(pages);

      // Calculate cost estimate
      const estimate = calculateCostEstimate(pages.length);
      setCurrentEstimate(estimate);

      setCurrentStep('preview');
    } catch (error) {
      console.error('Processing error:', error);
      setPdfError('處理 PDF 時發生錯誤');
    } finally {
      setIsProcessing(false);
    }
  }, [pdfBytes, logoBytes, logoDimensions, logoSize, preferredPosition, autoSize, autoSizePercent]);

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
        processedPages,
        logoOpacity,
        logoDimensions ?? undefined,
        securitySettings
      );

      downloadPdf(resultBytes, pdfFile.name);

      // Record usage for cumulative stats
      if (currentEstimate) {
        const pagesWithLogo = processedPages.filter(p => !p.skipLogo).length;
        const updatedStats = recordUsage(pagesWithLogo, currentEstimate.totalCost);
        setUsageStats(updatedStats);
      }

      setCurrentStep('download');
    } catch (error) {
      console.error('Download error:', error);
      const errorMessage = error instanceof Error ? error.message : '未知錯誤';
      alert(`生成 PDF 時發生錯誤：${errorMessage}`);
    } finally {
      setIsDownloading(false);
    }
  }, [logoFile, pdfFile, processedPages, logoOpacity, logoSize, logoDimensions, securitySettings]);

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
    setBatchFiles([]);
    setIsBatchMode(false);
  }, [handlePdfClear, handleLogoClear]);

  // Handle batch files select
  const handleBatchFilesSelect = useCallback(async (files: File[]) => {
    const pdfFiles = files.filter(f => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
    if (pdfFiles.length === 0) return;

    const newBatchFiles: BatchFile[] = pdfFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      status: 'pending' as const,
    }));

    setBatchFiles(prev => [...prev, ...newBatchFiles]);
    setIsBatchMode(true);
  }, []);

  // Handle remove batch file
  const handleRemoveBatchFile = useCallback((id: string) => {
    setBatchFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  // Handle batch analyze
  const handleBatchAnalyze = useCallback(async () => {
    if (!logoBytes || !logoDimensions || batchFiles.length === 0) return;

    setIsBatchProcessing(true);
    const renderScale = getRenderScale();

    // Validate and analyze all files
    for (let i = 0; i < batchFiles.length; i++) {
      const bf = batchFiles[i];

      setBatchProgress({
        currentFileIndex: i,
        currentFileName: bf.file.name,
        phase: 'validating',
        overallProgress: Math.round((i / batchFiles.length) * 50),
      });

      // Update status to validating
      setBatchFiles(prev => prev.map(f =>
        f.id === bf.id ? { ...f, status: 'validating' } : f
      ));

      try {
        // Validate PDF
        const result = await validatePdfFile(bf.file);
        if (!result.valid) {
          setBatchFiles(prev => prev.map(f =>
            f.id === bf.id ? { ...f, status: 'error', error: result.error } : f
          ));
          continue;
        }

        // Update status to analyzing
        setBatchFiles(prev => prev.map(f =>
          f.id === bf.id ? { ...f, status: 'analyzing', pageCount: result.pageCount } : f
        ));

        setBatchProgress({
          currentFileIndex: i,
          currentFileName: bf.file.name,
          phase: 'analyzing',
          overallProgress: Math.round(((i + 0.5) / batchFiles.length) * 50),
        });

        // Analyze pages
        const pdfBytes = await bf.file.arrayBuffer();
        const pdfDoc = await loadPdfDocument(pdfBytes);
        const numPages = pdfDoc.numPages;
        const pages: ProcessedPage[] = [];

        for (let p = 1; p <= numPages; p++) {
          const canvas = await renderPageToCanvas(pdfDoc, p);

          let effectiveLogoSize: number;
          if (autoSize) {
            const minDimension = Math.min(canvas.width, canvas.height) / renderScale;
            effectiveLogoSize = Math.round(minDimension * (autoSizePercent / 100));
            effectiveLogoSize = Math.max(40, Math.min(effectiveLogoSize, 200));
          } else {
            effectiveLogoSize = logoSize;
          }

          const logoDims = calculateLogoDimensions(
            logoDimensions.width,
            logoDimensions.height,
            effectiveLogoSize * renderScale
          );

          const detection = detectLogoPosition(
            canvas,
            logoDims.width,
            logoDims.height,
            preferredPosition
          );
          detection.pageNumber = p;

          pages.push({
            pageNumber: p,
            pageInfo: { pageNumber: p, width: canvas.width, height: canvas.height },
            detection,
            canvas,
            logoSize: autoSize ? effectiveLogoSize : undefined,
          });
        }

        // Mark as ready
        setBatchFiles(prev => prev.map(f =>
          f.id === bf.id ? { ...f, status: 'ready', processedPages: pages } : f
        ));
      } catch (error) {
        setBatchFiles(prev => prev.map(f =>
          f.id === bf.id ? { ...f, status: 'error', error: error instanceof Error ? error.message : '分析失敗' } : f
        ));
      }
    }

    setIsBatchProcessing(false);
    setBatchProgress(null);
    setCurrentStep('preview');
  }, [logoBytes, logoDimensions, batchFiles, logoSize, preferredPosition, autoSize, autoSizePercent]);

  // Handle batch download
  const handleBatchDownload = useCallback(async () => {
    if (!logoFile || batchFiles.length === 0) return;

    setIsBatchProcessing(true);
    const readyFiles = batchFiles.filter(f => f.status === 'ready' && f.processedPages);
    const results: Array<{ originalName: string; data: Uint8Array }> = [];

    for (let i = 0; i < readyFiles.length; i++) {
      const bf = readyFiles[i];

      setBatchProgress({
        currentFileIndex: i,
        currentFileName: bf.file.name,
        phase: 'processing',
        overallProgress: Math.round((i / readyFiles.length) * 90),
      });

      setBatchFiles(prev => prev.map(f =>
        f.id === bf.id ? { ...f, status: 'processing' } : f
      ));

      try {
        const freshPdfBytes = await bf.file.arrayBuffer();
        const freshLogoBytes = await logoFile.arrayBuffer();

        const resultBytes = await processPdfWithLogos(
          freshPdfBytes,
          freshLogoBytes,
          getImageMimeType(logoFile),
          bf.processedPages!,
          logoOpacity,
          logoDimensions ?? undefined,
          securitySettings
        );

        results.push({ originalName: bf.file.name, data: resultBytes });

        setBatchFiles(prev => prev.map(f =>
          f.id === bf.id ? { ...f, status: 'completed', resultBytes } : f
        ));
      } catch (error) {
        setBatchFiles(prev => prev.map(f =>
          f.id === bf.id ? { ...f, status: 'error', error: error instanceof Error ? error.message : '處理失敗' } : f
        ));
      }
    }

    // Download as ZIP
    if (results.length > 0) {
      setBatchProgress({
        currentFileIndex: readyFiles.length,
        currentFileName: 'ZIP',
        phase: 'zipping',
        overallProgress: 95,
      });

      await downloadAsZip(results, 'processed_pdfs.zip');

      // Record usage
      const totalPages = readyFiles.reduce((sum, f) =>
        sum + (f.processedPages?.filter(p => !p.skipLogo).length || 0), 0
      );
      const estimate = calculateCostEstimate(totalPages);
      const updatedStats = recordUsage(totalPages, estimate.totalCost);
      setUsageStats(updatedStats);
    }

    setIsBatchProcessing(false);
    setBatchProgress(null);
    setCurrentStep('download');
  }, [logoFile, batchFiles, logoOpacity, logoDimensions, securitySettings]);

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
      {/* Disclaimer Modal */}
      {!hasAgreedToDisclaimer && (
        <DisclaimerModal onAgree={handleDisclaimerAgree} />
      )}

      {/* Main content - only show after agreement */}
      {hasAgreedToDisclaimer && (
        <>
          <Header />
          <Stepper currentStep={currentStep} />

          <main className="max-w-6xl mx-auto px-4 pb-12">
        {/* Step 1: Upload */}
        {currentStep === 'upload' && (
          <div className="space-y-6">
            {/* Mode toggle */}
            <div className="flex justify-center">
              <div className="inline-flex rounded-lg bg-gray-800 p-1">
                <button
                  onClick={() => { setIsBatchMode(false); setBatchFiles([]); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors ${
                    !isBatchMode ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  單檔處理
                </button>
                <button
                  onClick={() => { setIsBatchMode(true); handlePdfClear(); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors ${
                    isBatchMode ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Files className="w-4 h-4" />
                  批量處理
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {!isBatchMode ? (
                <PdfUploader
                  file={pdfFile}
                  pageCount={pdfPageCount}
                  isValidating={isPdfValidating}
                  error={pdfError}
                  onFileSelect={handlePdfSelect}
                  onClear={handlePdfClear}
                />
              ) : (
                <PdfUploader
                  file={null}
                  pageCount={null}
                  isValidating={false}
                  error={null}
                  onFileSelect={() => {}}
                  onClear={() => {}}
                  multiple
                  onFilesSelect={handleBatchFilesSelect}
                />
              )}

              <LogoUploader
                file={logoFile}
                previewUrl={logoPreviewUrl}
                error={logoError}
                onFileSelect={handleLogoSelect}
                onClear={handleLogoClear}
              />
            </div>

            {/* Batch file list */}
            {isBatchMode && batchFiles.length > 0 && (
              <BatchFileList
                files={batchFiles}
                onRemoveFile={handleRemoveBatchFile}
                disabled={isBatchProcessing}
              />
            )}

            {/* Batch progress */}
            {isBatchProcessing && batchProgress && (
              <BatchProgressDisplay
                progress={batchProgress}
                totalFiles={batchFiles.length}
              />
            )}

            {logoFile && logoPreviewUrl && (
              <>
                <LogoSettings
                  logoSize={logoSize}
                  logoOpacity={logoOpacity}
                  preferredPosition={preferredPosition}
                  autoSize={autoSize}
                  autoSizePercent={autoSizePercent}
                  onSizeChange={setLogoSize}
                  onOpacityChange={setLogoOpacity}
                  onPositionChange={setPreferredPosition}
                  onAutoSizeChange={setAutoSize}
                  onAutoSizePercentChange={setAutoSizePercent}
                  logoPreviewUrl={logoPreviewUrl}
                />
                <SecuritySettings
                  security={securitySettings}
                  onSecurityChange={setSecuritySettings}
                />
              </>
            )}

            <div className="flex justify-center pt-4">
              {!isBatchMode ? (
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
              ) : (
                <button
                  onClick={handleBatchAnalyze}
                  disabled={!logoFile || batchFiles.length === 0 || isBatchProcessing}
                  className="btn-primary flex items-center gap-2 px-8 py-3 text-lg"
                >
                  {isBatchProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      處理中...
                    </>
                  ) : (
                    <>
                      開始批量分析 ({batchFiles.length} 個檔案)
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Preview */}
        {currentStep === 'preview' && logoPreviewUrl && (
          <div className="space-y-6">
            {/* Batch mode preview */}
            {isBatchMode ? (
              <>
                <div className="glass-card p-4 text-center">
                  <h3 className="text-lg font-medium text-white mb-2">
                    批量處理預覽
                  </h3>
                  <p className="text-gray-400">
                    已分析 {batchFiles.filter(f => f.status === 'ready').length} / {batchFiles.length} 個檔案
                  </p>
                </div>

                <BatchFileList
                  files={batchFiles}
                  onRemoveFile={handleRemoveBatchFile}
                  disabled={isBatchProcessing}
                />

                {isBatchProcessing && batchProgress && (
                  <BatchProgressDisplay
                    progress={batchProgress}
                    totalFiles={batchFiles.length}
                  />
                )}
              </>
            ) : (
              <>
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

                {/* Cost estimate */}
                {currentEstimate && (
                  <CostEstimateDisplay estimate={currentEstimate} />
                )}

                <p className="text-center text-gray-400">
                  點擊任一頁面可進入編輯模式，手動調整 Logo 位置
                </p>

                <PageGrid
                  pages={processedPages}
                  logoPreviewUrl={logoPreviewUrl}
                  logoOpacity={logoOpacity}
                  logoSize={logoSize}
                  selectedPage={selectedPage}
                  onPageSelect={setSelectedPage}
                />
              </>
            )}

            {/* Actions */}
            <div className="flex justify-between pt-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                返回
              </button>

              {isBatchMode ? (
                <button
                  onClick={handleBatchDownload}
                  disabled={isBatchProcessing || batchFiles.filter(f => f.status === 'ready').length === 0}
                  className="btn-primary flex items-center gap-2 px-8 py-3 text-lg"
                >
                  {isBatchProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      處理中...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      下載 ZIP ({batchFiles.filter(f => f.status === 'ready').length} 個檔案)
                    </>
                  )}
                </button>
              ) : (
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
              )}
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
              {isBatchMode ? '批量處理完成！' : 'PDF 處理完成！'}
            </h2>
            <p className="text-gray-400 mb-4">
              {isBatchMode
                ? `已成功處理 ${batchFiles.filter(f => f.status === 'completed').length} 個檔案並打包下載`
                : '您的 PDF 已成功添加 Logo 並開始下載'
              }
            </p>

            {/* Usage stats */}
            <UsageStatsDisplay stats={usageStats} />

            <div className="flex justify-center gap-4 mt-8">
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
                {isBatchMode ? '處理更多檔案' : '處理另一個檔案'}
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
              logoOpacity={logoOpacity}
              logoSize={logoSize}
              onPositionChange={(pos) => handlePositionChange(selectedPageData.pageNumber, pos)}
              onPageSettingsChange={(settings) => {
                setProcessedPages(prev => prev.map(p =>
                  p.pageNumber === selectedPageData.pageNumber
                    ? { ...p, logoSize: settings.logoSize, logoOpacity: settings.logoOpacity }
                    : p
                ));
              }}
              onSkipPage={() => handleSkipPage(selectedPageData.pageNumber)}
              onResetPosition={() => handleResetPosition(selectedPageData.pageNumber)}
              onApplyToAll={() => handleApplyToAll(selectedPageData.pageNumber)}
              onClose={() => setSelectedPage(null)}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
