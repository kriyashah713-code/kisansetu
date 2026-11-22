import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  CheckCircle2,
  FileImage,
  FileSearch,
  Flag,
  ImagePlus,
  Loader2,
  MessageSquare,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  TrendingUp,
  Upload,
  X,
} from 'lucide-react';
import { useKisanSetu } from '../context/KisanSetuContext';
import { translateCrop, translateGrowthStage, translateStatus } from '../i18n';
import { aiService, CropScanError } from '../services/aiService';
import { marketService } from '../services/marketService';
import { ASSETS } from '../services/mockData';
import { CropScan, VerifiedGuidanceDetail } from '../types/kisansetu';
import { ResilientImage } from '../components/ResilientImage';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

interface SelectedCropImage {
  dataUrl: string;
  thumbnailDataUrl: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  fileName: string;
  fileSizeBytes: number;
  width: number;
  height: number;
}

type ScanWorkflowStatus = 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error';

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function resolveAllowedMimeType(file: File): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  const rawType = file.type.toLowerCase().trim();
  if (rawType === 'image/jpg' || rawType === 'image/jpeg') return 'image/jpeg';
  if (rawType === 'image/png') return 'image/png';
  if (rawType === 'image/webp') return 'image/webp';
  if (!rawType) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
    if (ext === 'png') return 'image/png';
    if (ext === 'webp') return 'image/webp';
  }
  return null;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string' && reader.result.startsWith('data:')) {
        resolve(reader.result);
      } else {
        reject(new Error('READ_FAILED'));
      }
    };
    reader.onerror = () => reject(new Error('READ_FAILED'));
    reader.readAsDataURL(file);
  });
}

function decodeImageAndThumbnail(
  dataUrl: string
): Promise<{ width: number; height: number; thumbnailDataUrl: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      if (!width || !height) {
        reject(new Error('CORRUPTED_IMAGE'));
        return;
      }

      try {
        const maxSide = 480;
        const scale = Math.min(1, maxSide / Math.max(width, height));
        const targetW = Math.max(1, Math.round(width * scale));
        const targetH = Math.max(1, Math.round(height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, targetW, targetH);
          const thumb = canvas.toDataURL('image/jpeg', 0.82);
          resolve({ width, height, thumbnailDataUrl: thumb });
          return;
        }
      } catch {
        // Fallback to raw dataUrl if canvas fails
      }
      resolve({ width, height, thumbnailDataUrl: dataUrl });
    };
    img.onerror = () => reject(new Error('CORRUPTED_IMAGE'));
    img.src = dataUrl;
  });
}

async function fetchUrlAsImagePayload(url: string, label: string): Promise<SelectedCropImage> {
  const res = await fetch(url);
  if (!res.ok) throw new Error('SAMPLE_LOAD_FAILED');
  const blob = await res.blob();
  const mime =
    blob.type === 'image/png' || blob.type === 'image/webp' ? blob.type : 'image/jpeg';
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('READ_FAILED'));
    reader.readAsDataURL(blob);
  });
  const decoded = await decodeImageAndThumbnail(dataUrl);
  return {
    dataUrl,
    thumbnailDataUrl: decoded.thumbnailDataUrl,
    mimeType: mime,
    fileName: label,
    fileSizeBytes: blob.size,
    width: decoded.width,
    height: decoded.height,
  };
}

export const CropScannerPage: React.FC = () => {
  const { state, t, addCropScan, updateScanReviewStatus, pushToast } = useKisanSetu();
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [selectedImage, setSelectedImage] = useState<SelectedCropImage | null>(null);
  const [selectedSampleId, setSelectedSampleId] = useState<
    'tomato-blight' | 'tomato-healthy' | 'wheat-healthy' | undefined
  >(undefined);
  const [cropHint, setCropHint] = useState('');
  const [scanStatus, setScanStatus] = useState<ScanWorkflowStatus>('idle');
  const [scanStepIdx, setScanStepIdx] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [activeScan, setActiveScan] = useState<CropScan | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'quality' | 'disease' | 'market'>(
    'overview'
  );
  const [verifiedGuidance, setVerifiedGuidance] = useState<VerifiedGuidanceDetail | null>(null);
  const [loadingGuidance, setLoadingGuidance] = useState(false);
  const [marketMatch, setMarketMatch] = useState<Awaited<
    ReturnType<typeof marketService.getRecommendationForCrop>
  > | null>(null);

  const isBusy = scanStatus === 'uploading' || scanStatus === 'analyzing';

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const sampleSpecimens = [
    {
      id: 'tomato-blight' as const,
      label: t('cropScan.sampleTomatoBlight'),
      hint: 'Tomato leaf showing concentric brown spots',
      imageUrl: ASSETS.tomatoBlight,
    },
    {
      id: 'tomato-healthy' as const,
      label: t('cropScan.sampleTomatoHealthy'),
      hint: 'Healthy ripe red tomatoes on trellis',
      imageUrl: ASSETS.tomatoHealthy,
    },
    {
      id: 'wheat-healthy' as const,
      label: t('cropScan.sampleWheatHealthy'),
      hint: 'Healthy golden wheat field ears',
      imageUrl: ASSETS.wheatGolden,
    },
  ];

  const processSelectedFile = async (file: File) => {
    setUploadError(null);

    const allowedMime = resolveAllowedMimeType(file);
    if (!allowedMime || !ALLOWED_MIME_TYPES.has(allowedMime)) {
      const msg = t('cropScan.errInvalidFormat');
      setUploadError(msg);
      pushToast({ title: msg, variant: 'warning' });
      return;
    }

    if (file.size <= 0) {
      const msg = t('cropScan.errCorrupted');
      setUploadError(msg);
      pushToast({ title: msg, variant: 'error' });
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      const msg = t('cropScan.errFileTooLarge', { size: formatFileSize(file.size) });
      setUploadError(msg);
      pushToast({ title: msg, variant: 'warning' });
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      const decoded = await decodeImageAndThumbnail(dataUrl);

      setSelectedImage({
        dataUrl,
        thumbnailDataUrl: decoded.thumbnailDataUrl,
        mimeType: allowedMime,
        fileName: file.name || 'crop-photo.jpg',
        fileSizeBytes: file.size,
        width: decoded.width,
        height: decoded.height,
      });
      setSelectedSampleId(undefined);
      setVerifiedGuidance(null);
      setScanStatus('idle');
    } catch (err) {
      const msg =
        err instanceof Error && err.message === 'READ_FAILED'
          ? t('cropScan.errReadFailed')
          : t('cropScan.errCorrupted');
      setUploadError(msg);
      pushToast({ title: msg, variant: 'error' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset input value so re-selecting the same or replacement file always fires onChange
    e.target.value = '';
    if (!file || isBusy) return;
    void processSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isBusy) return;
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void processSelectedFile(file);
    }
  };

  const handleSelectDemoSample = async (sample: (typeof sampleSpecimens)[number]) => {
    if (isBusy) return;
    setUploadError(null);
    try {
      const payload = await fetchUrlAsImagePayload(sample.imageUrl, sample.label);
      setSelectedImage(payload);
      setSelectedSampleId(sample.id);
      setCropHint(sample.hint);
      setVerifiedGuidance(null);
      setScanStatus('idle');
    } catch {
      const msg = t('cropScan.errReadFailed');
      setUploadError(msg);
      pushToast({ title: msg, variant: 'error' });
    }
  };

  const handleRemoveImage = () => {
    if (isBusy) return;
    setSelectedImage(null);
    setSelectedSampleId(undefined);
    setUploadError(null);
    setScanStatus('idle');
  };

  const handleResetScanner = () => {
    abortControllerRef.current?.abort();
    setSelectedImage(null);
    setSelectedSampleId(undefined);
    setCropHint('');
    setActiveScan(null);
    setVerifiedGuidance(null);
    setMarketMatch(null);
    setUploadError(null);
    setScanStatus('idle');
    setScanStepIdx(0);
    setActiveTab('overview');
  };

  const mapScanErrorToMessage = (err: unknown): string => {
    if (err instanceof CropScanError) {
      switch (err.code) {
        case 'CANCELLED':
          return t('cropScan.errCancelled');
        case 'GEMINI_UNAVAILABLE':
          return t('cropScan.errGeminiUnavailable');
        case 'GEMINI_QUOTA_EXCEEDED':
          return t('cropScan.errQuotaExceeded');
        case 'GEMINI_HIGH_DEMAND':
          return t('cropScan.errHighDemand');
        case 'INVALID_IMAGE_FORMAT':
          return t('cropScan.errInvalidFormat');
        case 'PAYLOAD_TOO_LARGE':
          return t('cropScan.errFileTooLarge', {
            size: selectedImage ? formatFileSize(selectedImage.fileSizeBytes) : '> 10 MB',
          });
        case 'NETWORK_ERROR':
          return t('cropScan.errNetwork');
        case 'UNEXPECTED_RESPONSE':
          return t('cropScan.errUnexpectedAi');
        default:
          return t('cropScan.errApiFailed');
      }
    }
    return t('cropScan.errApiFailed');
  };

  const runAnalysis = async () => {
    if (isBusy) return;

    if (!selectedImage || !selectedImage.dataUrl) {
      const msg = t('cropScan.errNoImage');
      setUploadError(msg);
      pushToast({ title: msg, variant: 'warning' });
      return;
    }

    setUploadError(null);
    setVerifiedGuidance(null);
    setScanStatus('uploading');
    setScanStepIdx(0);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const uploadStageTimer = setTimeout(() => {
      setScanStatus((prev) => (prev === 'uploading' ? 'analyzing' : prev));
    }, 550);

    const stepTimer = setInterval(() => {
      setScanStepIdx((prev) => (prev < 3 ? prev + 1 : prev));
    }, 650);

    try {
      const result = await aiService.analyzeCropHealth(
        {
          imageDataUrl: selectedImage.dataUrl,
          thumbnailDataUrl: selectedImage.thumbnailDataUrl,
          mimeType: selectedImage.mimeType,
          cropHint: cropHint.trim() || undefined,
          language: state.language,
          sampleId: selectedSampleId,
          signal: controller.signal,
        },
        state.farm.id
      );

      setScanStepIdx(3);
      setScanStatus('complete');
      setActiveScan(result);
      addCropScan(result);

      const mRec = await aiService.explainMarketInsight(
        result.cropName,
        result.quality.suggestedGrade
      );
      setMarketMatch(mRec);
      setActiveTab('overview');

      pushToast({
        title: t('toasts.scanCompleted', {
          crop: translateCrop(state.language, result.cropName),
        }),
        description: `${t('cropScan.resultHealthScoreLabel')}: ${result.healthScore}/100 · ${t('common.gradeLabel', { grade: result.quality.suggestedGrade })}`,
        variant: result.disease.detected ? 'warning' : 'success',
      });
    } catch (err) {
      const isCancelled = err instanceof CropScanError && err.code === 'CANCELLED';
      const errMsg = mapScanErrorToMessage(err);
      setUploadError(errMsg);
      setScanStatus(isCancelled ? 'idle' : 'error');
      pushToast({
        title: errMsg,
        variant: isCancelled ? 'warning' : 'error',
      });
    } finally {
      clearTimeout(uploadStageTimer);
      clearInterval(stepTimer);
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  };

  const handleCancelScan = () => {
    abortControllerRef.current?.abort();
  };

  const handleFetchVerifiedGuidance = async () => {
    if (!activeScan) return;
    setLoadingGuidance(true);
    try {
      const detail = await aiService.findVerifiedTreatmentGuidance(
        activeScan.cropName,
        activeScan.disease.possibleDisease,
        activeScan.disease.severity,
        `${state.profile.district}, ${state.profile.state}`,
        state.language
      );
      setVerifiedGuidance(detail);
      pushToast({
        title: t('cropScan.treatmentTab'),
        variant: 'success',
      });
    } finally {
      setLoadingGuidance(false);
    }
  };

  const ensureMarketLoaded = async (scan: CropScan) => {
    if (!marketMatch || marketMatch.crop !== scan.cropName) {
      const mRec = await aiService.explainMarketInsight(scan.cropName, scan.quality.suggestedGrade);
      setMarketMatch(mRec);
    }
  };

  const statusText = (() => {
    if (scanStatus === 'uploading') return t('cropScan.stateUploading');
    if (scanStatus === 'analyzing') return t('cropScan.stateAnalyzing');
    if (scanStatus === 'complete' && activeScan) return t('cropScan.stateComplete');
    if (selectedImage) return t('cropScan.stateImageSelected');
    return t('cropScan.stateNoImage');
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#216B43]">{t('nav.cropScanner')}</p>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#17231B] mt-0.5">
            {t('cropScan.title')}
          </h1>
          <p className="text-sm text-[#546358] mt-1 max-w-2xl">{t('cropScan.subtitle')}</p>
        </div>

        {(selectedImage || activeScan) && (
          <button
            type="button"
            onClick={handleResetScanner}
            disabled={isBusy}
            className="min-h-[40px] inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[#D8D4CA] bg-white hover:bg-[#F3F1EC] disabled:opacity-60 text-xs font-semibold text-[#17231B] self-start md:self-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#216B43]" />
            <span>{t('cropScan.scanAnotherBtn')}</span>
          </button>
        )}
      </div>

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Upload, Preview & Scanner Column */}
        <section className="lg:col-span-5 bg-white border border-[#E5E2DA] rounded-2xl p-5 space-y-4">
          {/* Workflow Status Strip */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-[#ECEAE3]">
            <p className="text-xs font-semibold text-[#3D4E42]">{t('cropScan.inputPanelTitle')}</p>
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg ${
                isBusy
                  ? 'bg-[#FEF9EC] text-[#9A6B06]'
                  : scanStatus === 'complete' && activeScan
                  ? 'bg-[#E9F5EE] text-[#216B43]'
                  : selectedImage
                  ? 'bg-[#EEF5F0] text-[#143A28]'
                  : 'bg-[#F3F1EC] text-[#546358]'
              }`}
            >
              {isBusy && <Loader2 className="w-3 h-3 animate-spin" />}
              {!isBusy && scanStatus === 'complete' && activeScan && (
                <CheckCircle2 className="w-3 h-3" />
              )}
              <span>{statusText}</span>
            </span>
          </div>

          {/* Primary Upload & Camera Controls */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isBusy}
              className="min-h-[46px] inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#143A28] hover:bg-[#1C4D36] disabled:opacity-60 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 shrink-0" />
              <span className="truncate">{t('cropScan.uploadCropPhotoBtn')}</span>
            </button>

            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isBusy}
              className="min-h-[46px] inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-[#D8D4CA] hover:bg-[#F3F1EC] disabled:opacity-60 text-[#17231B] text-sm font-semibold transition-colors cursor-pointer"
            >
              <Camera className="w-4 h-4 shrink-0 text-[#216B43]" />
              <span className="truncate">{t('cropScan.takePhotoBtn')}</span>
            </button>

            {/* Real browser file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              aria-label={t('cropScan.uploadCropPhotoBtn')}
              className="sr-only"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              aria-label={t('cropScan.takePhotoBtn')}
              className="sr-only"
            />
          </div>

          {/* Inline Error Alert Banner */}
          {uploadError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B]"
            >
              <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0 space-y-2">
                <p className="font-medium leading-relaxed">{uploadError}</p>
                {selectedImage && !isBusy && (
                  <button
                    type="button"
                    onClick={runAnalysis}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-[11px] font-semibold cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{t('cropScan.tryAgainBtn')}</span>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setUploadError(null)}
                aria-label="Dismiss error"
                className="text-[#991B1B]/70 hover:text-[#991B1B] p-0.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Dropzone OR Selected Image Preview Stage (Preserving Natural Aspect Ratio) */}
          {!selectedImage ? (
            <div
              role="button"
              tabIndex={0}
              onClick={() => !isBusy && fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && !isBusy) {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (!isBusy) setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
                isDragging
                  ? 'border-[#216B43] bg-[#E9F5EE]/70'
                  : 'border-[#D8D4CA] bg-[#F8F7F4] hover:border-[#216B43]/60 hover:bg-[#F3F5F2]'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-[#E5E2DA] flex items-center justify-center mx-auto mb-3 shadow-2xs">
                <ImagePlus className="w-6 h-6 text-[#216B43]" />
              </div>
              <p className="text-sm font-semibold text-[#17231B]">{t('cropScan.dropzoneTitle')}</p>
              <p className="text-xs text-[#546358] mt-1.5">{t('cropScan.dropzoneFormats')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Aspect-ratio-preserving image preview container */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!isBusy) setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative min-h-[220px] max-h-[380px] rounded-xl overflow-hidden bg-[#101D15] border flex items-center justify-center p-2 ${
                  isDragging ? 'border-2 border-[#6EE7A8]' : 'border-[#D8D4CA]'
                }`}
              >
                <img
                  src={selectedImage.dataUrl}
                  alt={selectedImage.fileName}
                  className="max-h-[360px] w-auto max-w-full object-contain rounded-lg"
                />

                {/* Scanning frame markers */}
                <div className="absolute inset-3 pointer-events-none border border-white/20 rounded-lg">
                  <span className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#E6B85C]" />
                  <span className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#E6B85C]" />
                  <span className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#E6B85C]" />
                  <span className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#E6B85C]" />
                </div>

                {/* Live Analyzing Overlay */}
                {isBusy && (
                  <div className="absolute inset-0 bg-[#0E1E15]/65 backdrop-blur-[1px] flex flex-col justify-between p-4">
                    <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#6EE7A8] to-transparent shadow-[0_0_14px_#6EE7A8] animate-scan-beam" />
                    <div className="relative z-10 flex items-center justify-between text-xs text-[#E6B85C] font-mono">
                      <span>
                        {scanStatus === 'uploading'
                          ? t('cropScan.stateUploading')
                          : t('cropScan.stateAnalyzing')}
                      </span>
                      <span className="tabular-nums">
                        {Math.round(((scanStepIdx + 1) / 4) * 100)}%
                      </span>
                    </div>
                    <div className="relative z-10 bg-[#101D15]/90 border border-white/15 rounded-xl p-3 text-white space-y-2">
                      <div className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#6EE7A8] transition-all duration-300"
                          style={{ width: `${((scanStepIdx + 1) / 4) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Selected File Info & Replace / Remove Actions */}
              <div className="p-3 rounded-xl bg-[#F8F7F4] border border-[#E5E2DA] space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <FileImage className="w-4 h-4 text-[#216B43] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#17231B] truncate">
                        {selectedImage.fileName}
                      </p>
                      <p className="text-[11px] text-[#546358] font-mono tabular-nums mt-0.5">
                        {formatFileSize(selectedImage.fileSizeBytes)} · {selectedImage.width}×
                        {selectedImage.height} ·{' '}
                        {selectedImage.mimeType.replace('image/', '').toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isBusy}
                    className="flex-1 min-h-[36px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D8D4CA] bg-white hover:bg-[#F3F1EC] disabled:opacity-50 text-xs font-semibold text-[#17231B] cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#216B43]" />
                    <span>{t('cropScan.replaceImageBtn')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isBusy}
                    className="min-h-[36px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#FECACA] bg-white hover:bg-[#FEF2F2] disabled:opacity-50 text-xs font-semibold text-[#B91C1C] cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t('cropScan.removeBtn')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Optional Crop Context Input */}
          <div>
            <label
              htmlFor="crop-hint-input"
              className="block text-xs font-semibold text-[#3D4E42] mb-1.5"
            >
              {t('cropScan.selectCropLabel')}
            </label>
            <input
              id="crop-hint-input"
              type="text"
              value={cropHint}
              disabled={isBusy}
              onChange={(e) => setCropHint(e.target.value)}
              placeholder={t('cropScan.autoDetectOption')}
              className="w-full min-h-[42px] px-3.5 py-2 rounded-lg border border-[#D8D4CA] text-sm disabled:bg-[#F8F7F4]"
            />
          </div>

          {/* Primary Scan Action + Cancel */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={runAnalysis}
              disabled={isBusy}
              className="flex-1 min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#216B43] hover:bg-[#195434] disabled:opacity-70 text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              {isBusy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{statusText}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t('cropScan.scanCropBtn')}</span>
                </>
              )}
            </button>

            {isBusy && (
              <button
                type="button"
                onClick={handleCancelScan}
                className="min-h-[48px] px-4 py-3 rounded-xl border border-[#FECACA] bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#B91C1C] text-xs font-semibold cursor-pointer"
              >
                {t('cropScan.cancelScanBtn')}
              </button>
            )}
          </div>

          {/* Demo Sample Field Photos */}
          <div className="pt-3 border-t border-[#ECEAE3] space-y-2.5">
            <p className="text-xs font-semibold text-[#546358]">{t('cropScan.samplePresetsLabel')}</p>
            <div className="grid grid-cols-1 gap-2">
              {sampleSpecimens.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  disabled={isBusy}
                  onClick={() => void handleSelectDemoSample(sample)}
                  className={`flex items-center gap-3 p-2 rounded-xl border text-left transition-colors cursor-pointer disabled:opacity-50 ${
                    selectedSampleId === sample.id
                      ? 'border-[#216B43] bg-[#216B43]/6'
                      : 'border-[#E5E2DA] hover:bg-[#F8F7F4]'
                  }`}
                >
                  <ResilientImage
                    src={sample.imageUrl}
                    alt={sample.label}
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#17231B] truncate">{sample.label}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Right Result & Recent Scans Column */}
        <section className="lg:col-span-7 space-y-5">
          {!activeScan ? (
            <div className="bg-white border border-[#E5E2DA] rounded-2xl p-10 text-center space-y-3">
              <FileSearch className="w-10 h-10 text-[#6A786E] mx-auto" />
              <h2 className="font-display text-xl font-semibold text-[#17231B]">
                {t('cropScan.resultEmptyTitle')}
              </h2>
              <p className="text-sm text-[#546358] max-w-md mx-auto">
                {t('cropScan.resultEmptyDesc')}
              </p>
            </div>
          ) : (
            <motion.div
              key={activeScan.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-[#E5E2DA] rounded-2xl p-5 sm:p-6 space-y-5"
            >
              {/* Top Result Summary Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#ECEAE3]">
                <div className="flex items-start gap-3.5">
                  <ResilientImage
                    src={activeScan.imageUrl}
                    alt={activeScan.cropName}
                    className="w-14 h-14 rounded-xl object-cover border border-[#E5E2DA] shrink-0"
                  />
                  <div>
                    <p className="text-xs text-[#546358]">
                      {activeScan.isDemoAnalysis
                        ? t('cropScan.analysisSourceDemo')
                        : t('cropScan.analysisSourceAi')}{' '}
                      · {activeScan.scannedAt}
                    </p>
                    <h2 className="font-display text-2xl font-semibold text-[#17231B] mt-0.5">
                      {translateCrop(state.language, activeScan.cropName)} —{' '}
                      {translateGrowthStage(state.language, activeScan.growthStage)}
                    </h2>
                    <p className="text-xs text-[#546358] mt-1">{activeScan.varietyGuess}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 font-mono tabular-nums">
                  <div className="text-right">
                    <p className="text-[11px] text-[#5E6D63]">
                      {t('cropScan.resultHealthScoreLabel')}
                    </p>
                    <p className="text-xl font-bold text-[#143A28]">{activeScan.healthScore}/100</p>
                  </div>
                  <div className="h-8 w-px bg-[#E5E2DA]" />
                  <div className="text-right">
                    <p className="text-[11px] text-[#5E6D63]">
                      {t('cropScan.resultQualityGradeLabel')}
                    </p>
                    <p className="text-xl font-bold text-[#216B43]">
                      {activeScan.quality.suggestedGrade}
                    </p>
                  </div>
                </div>
              </div>

              {/* Structured Key-Value Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-3.5 rounded-xl bg-[#F8F7F4] border border-[#E5E2DA]">
                <div>
                  <p className="text-[11px] text-[#5E6D63]">{t('cropScan.resultCropLabel')}</p>
                  <p className="text-sm font-semibold text-[#17231B] mt-0.5">
                    {translateCrop(state.language, activeScan.cropName)}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#5E6D63]">
                    {t('cropScan.resultHealthScoreLabel')}
                  </p>
                  <p className="text-sm font-semibold font-mono text-[#143A28] mt-0.5">
                    {activeScan.healthScore}/100
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#5E6D63]">
                    {t('cropScan.resultQualityGradeLabel')}
                  </p>
                  <p className="text-sm font-semibold font-mono text-[#216B43] mt-0.5">
                    {activeScan.quality.suggestedGrade}
                  </p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-[11px] text-[#5E6D63]">
                    {t('cropScan.resultPossibleIssueLabel')}
                  </p>
                  <p className="text-xs font-semibold text-[#17231B] mt-0.5 leading-snug">
                    {activeScan.disease.possibleDisease}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-[#5E6D63]">
                    {t('cropScan.resultSeverityLabel')}
                  </p>
                  <p
                    className={`text-sm font-semibold mt-0.5 ${
                      activeScan.disease.severity === 'High'
                        ? 'text-[#B91C1C]'
                        : activeScan.disease.severity === 'Medium'
                        ? 'text-[#B8860B]'
                        : 'text-[#216B43]'
                    }`}
                  >
                    {translateStatus(state.language, activeScan.disease.severity)}
                  </p>
                </div>
              </div>

              {/* Mandatory Screening Disclaimer */}
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-[#FEF9EC] border border-[#E8D5A3] text-xs text-[#4A3728]">
                <ShieldAlert className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
                <p>{t('cropScan.safetyBanner')}</p>
              </div>

              {/* Result Section Tabs */}
              <div className="flex flex-wrap gap-1.5 p-1 bg-[#ECEAE3] rounded-xl">
                {(
                  [
                    { id: 'overview', label: t('cropScan.diseaseTab') },
                    { id: 'quality', label: t('cropScan.qualityTab') },
                    { id: 'disease', label: t('cropScan.treatmentTab') },
                    { id: 'market', label: t('cropScan.marketPositionTitle') },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id === 'market') void ensureMarketLoaded(activeScan);
                    }}
                    className={`flex-1 min-w-[115px] py-2 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer truncate ${
                      activeTab === tab.id
                        ? 'bg-white text-[#143A28] shadow-xs'
                        : 'text-[#546358] hover:text-[#17231B]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: Overview & Symptoms */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-[#F8F7F4] border border-[#ECEAE3]">
                      <p className="text-[11px] text-[#5E6D63]">
                        {t('cropScan.resultGrowthStageLabel')}
                      </p>
                      <p className="text-sm font-semibold text-[#17231B] mt-1">
                        {translateGrowthStage(state.language, activeScan.growthStage)}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#F8F7F4] border border-[#ECEAE3]">
                      <p className="text-[11px] text-[#5E6D63]">
                        {t('cropScan.resultConfidenceLabel')}
                      </p>
                      <p className="text-sm font-semibold font-mono tabular-nums text-[#17231B] mt-1">
                        {activeScan.disease.confidence}%
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#F8F7F4] border border-[#ECEAE3]">
                      <p className="text-[11px] text-[#5E6D63]">
                        {t('cropScan.resultVarietyLabel')}
                      </p>
                      <p className="text-sm font-semibold text-[#17231B] mt-1 truncate">
                        {activeScan.varietyGuess}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-[#E5E2DA] space-y-2">
                    <p className="text-xs font-semibold text-[#546358]">
                      {t('cropScan.symptomsTitle')}
                    </p>
                    <ul className="space-y-1.5 text-sm text-[#17231B]">
                      {activeScan.disease.symptomsObserved.map((sym, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#216B43] font-bold">•</span>
                          <span>{sym}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-[#143A28]/5 border border-[#216B43]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-[#143A28]">
                        {t('cropScan.marketPositionTitle')}
                      </p>
                      <p className="text-sm text-[#3D4E42] mt-0.5">
                        {activeScan.marketInsightNote}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('market');
                        void ensureMarketLoaded(activeScan);
                      }}
                      className="min-h-[40px] px-4 py-2 rounded-lg bg-[#143A28] text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {t('cropScan.ctaCheckMandi')}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: AI Visual Quality Assessment */}
              {activeTab === 'quality' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#F8F7F4] border border-[#E5E2DA]">
                    <div>
                      <p className="text-xs font-semibold text-[#216B43]">
                        {t('cropScan.qualityTab')}
                      </p>
                      <h3 className="font-display text-2xl font-semibold text-[#17231B] mt-0.5 tabular-nums">
                        {t('cropScan.qualityScoreLabel')}: {activeScan.quality.qualityScore}/100 ·{' '}
                        {t('common.gradeLabel', { grade: activeScan.quality.suggestedGrade })}
                      </h3>
                      <p className="text-xs text-[#546358] mt-1">
                        {activeScan.quality.visibleIssuesSummary}
                      </p>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {(
                      [
                        [t('cropScan.charColor'), activeScan.quality.characteristics.color],
                        [
                          t('cropScan.charMaturity'),
                          activeScan.quality.characteristics.apparentMaturity,
                        ],
                        [
                          t('cropScan.charDamage'),
                          activeScan.quality.characteristics.visibleDamage,
                        ],
                        [t('cropScan.charSpots'), activeScan.quality.characteristics.spots],
                        [
                          t('cropScan.charSize'),
                          activeScan.quality.characteristics.sizeAppearance,
                        ],
                        [
                          t('cropScan.charFreshness'),
                          activeScan.quality.characteristics.freshnessIndicator,
                        ],
                      ] as const
                    ).map(([label, val]) => (
                      <div key={label} className="p-3.5 rounded-xl border border-[#ECEAE3]">
                        <p className="text-xs font-semibold text-[#546358]">{label}</p>
                        <p className="text-sm text-[#17231B] mt-1 leading-relaxed">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: Disease Detection + Responsible Treatment Guidance */}
              {activeTab === 'disease' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-[#E5E2DA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-[#546358]">
                        {t('cropScan.resultPossibleIssueLabel')}
                      </p>
                      <h3 className="font-display text-xl font-semibold text-[#17231B] mt-0.5">
                        {activeScan.disease.possibleDisease}
                      </h3>
                      <p className="text-xs text-[#546358] mt-1 font-mono tabular-nums">
                        {t('cropScan.resultConfidenceLabel')}: {activeScan.disease.confidence}% ·{' '}
                        {t('cropScan.resultSeverityLabel')}:{' '}
                        {translateStatus(state.language, activeScan.disease.severity)}
                      </p>
                    </div>
                    {activeScan.disease.detected ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B8860B]">
                        <AlertTriangle className="w-4 h-4" />
                        {translateStatus(state.language, 'Watch')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#216B43]">
                        <CheckCircle2 className="w-4 h-4" />
                        {translateStatus(state.language, 'Healthy')}
                      </span>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#F8F7F4] border border-[#ECEAE3] space-y-2">
                      <p className="text-xs font-semibold text-[#143A28]">
                        {t('cropScan.immediateActionsTitle')}
                      </p>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-[#3D4E42]">
                        {activeScan.disease.immediateActions.map((act, i) => (
                          <li key={i}>• {act}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-[#F8F7F4] border border-[#ECEAE3] space-y-2">
                      <p className="text-xs font-semibold text-[#143A28]">
                        {t('cropScan.preventiveTitle')}
                      </p>
                      <ul className="space-y-1.5 text-xs sm:text-sm text-[#3D4E42]">
                        {activeScan.disease.preventiveMeasures.map((prev, i) => (
                          <li key={i}>• {prev}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Safe Treatment Guidance Block */}
                  <div className="p-4 rounded-xl border border-[#D8D4CA] space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[#17231B]">
                        {t('cropScan.treatmentTab')}
                      </p>
                      <span className="text-[11px] font-medium text-[#546358]">
                        {t('cropScan.treatmentExpert')}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs sm:text-sm text-[#3D4E42]">
                      <p>
                        <strong>{t('cropScan.treatmentApproach')}:</strong>{' '}
                        {activeScan.disease.treatmentGuidance.approachSummary}
                      </p>
                      <p>
                        <strong>{t('cropScan.treatmentCategory')}:</strong>{' '}
                        {activeScan.disease.treatmentGuidance.activeIngredientCategory}
                      </p>
                      <p>
                        <strong>{t('cropScan.treatmentSafety')}:</strong>{' '}
                        {activeScan.disease.treatmentGuidance.safetyPrecautions}
                      </p>
                      <p>
                        <strong>{t('cropScan.treatmentPhi')}:</strong>{' '}
                        {activeScan.disease.treatmentGuidance.preHarvestCaution}
                      </p>
                      <p className="text-xs text-[#5E6D63]">
                        {activeScan.disease.treatmentGuidance.expertConfirmationNote}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleFetchVerifiedGuidance}
                      disabled={loadingGuidance}
                      className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#143A28] hover:bg-[#1D4E37] text-white text-xs font-semibold cursor-pointer"
                    >
                      {loadingGuidance ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 text-[#E6B85C]" />
                      )}
                      <span>{t('cropScan.treatmentTab')}</span>
                    </button>

                    {verifiedGuidance && (
                      <div className="mt-3 p-4 rounded-xl bg-[#F8F7F4] border border-[#216B43]/30 space-y-2.5">
                        <p className="text-xs font-semibold text-[#216B43]">
                          {verifiedGuidance.recommendedLocalAuthority}
                        </p>
                        <p className="text-xs text-[#546358]">
                          {verifiedGuidance.verificationSourceNote}
                        </p>
                        <div className="text-xs text-[#17231B] space-y-1.5">
                          <ul className="space-y-1 pl-3">
                            {verifiedGuidance.culturalAndMechanicalSteps.map((s, idx) => (
                              <li key={idx}>• {s}</li>
                            ))}
                          </ul>
                          <ul className="space-y-1 pl-3 pt-1">
                            {verifiedGuidance.biologicalOptions.map((s, idx) => (
                              <li key={idx}>• {s}</li>
                            ))}
                          </ul>
                          <p className="pt-1">
                            <strong>{t('cropScan.treatmentCategory')}:</strong>{' '}
                            {verifiedGuidance.chemicalClassToDiscussWithExpert}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: Connected Crop Price Recommendation */}
              {activeTab === 'market' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-[#143A28] text-white space-y-2">
                    <p className="text-xs text-[#E6B85C] font-medium">
                      {t('cropScan.marketPositionTitle')}
                    </p>
                    <h3 className="font-display text-xl font-semibold">
                      {translateCrop(state.language, activeScan.cropName)} —{' '}
                      {t('common.gradeLabel', { grade: activeScan.quality.suggestedGrade })}
                    </h3>
                    <p className="text-sm text-[#D4E0D7]">{activeScan.marketInsightNote}</p>
                  </div>

                  {marketMatch && (
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div className="p-4 rounded-xl bg-[#F8F7F4] border border-[#ECEAE3]">
                        <p className="text-xs text-[#546358]">{t('market.tableMinMax')}</p>
                        <p className="font-display text-2xl font-semibold text-[#17231B] mt-1 tabular-nums">
                          {marketMatch.estimatedRange}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-[#F8F7F4] border border-[#ECEAE3]">
                        <p className="text-xs text-[#546358]">{t('market.tableDemand')}</p>
                        <p className="text-base font-semibold text-[#216B43] mt-1.5">
                          {translateStatus(state.language, marketMatch.demand)} ·{' '}
                          {translateStatus(state.language, marketMatch.trend)}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl bg-[#F8F7F4] border border-[#ECEAE3]">
                        <p className="text-xs text-[#546358]">{t('market.bestMarketCard')}</p>
                        <p className="text-sm font-semibold text-[#17231B] mt-1.5">
                          {marketMatch.topMarketName} ({marketMatch.topMarketPrice})
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => navigate('/marketplace')}
                      className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#216B43] hover:bg-[#195434] text-white text-sm font-semibold cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{t('cropScan.ctaListCrop')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/market')}
                      className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D8D4CA] hover:bg-[#F3F1EC] text-sm font-medium cursor-pointer"
                    >
                      <TrendingUp className="w-4 h-4 text-[#216B43]" />
                      <span>{t('cropScan.ctaCheckMandi')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Action Strip */}
              <div className="pt-3 border-t border-[#ECEAE3] flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() => navigate('/assistant')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#216B43] hover:underline cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{t('cropScan.ctaAskAi')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetScanner}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#143A28] hover:underline cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t('cropScan.scanAnotherBtn')}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => updateScanReviewStatus(activeScan.id, 'Flagged for Review')}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#546358] hover:text-[#B91C1C] cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>{t('cropScan.reportBadAiBtn')}</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Recent Crop Scans History Strip */}
          {state.scans.length > 0 && (
            <div className="bg-white border border-[#E5E2DA] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-[#17231B]">
                  {t('cropScan.recentScansTitle')}
                </h3>
                <span className="text-[11px] text-[#546358]">{t('cropScan.recentScansHint')}</span>
              </div>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {state.scans.slice(0, 4).map((scan) => (
                  <button
                    key={scan.id}
                    type="button"
                    disabled={isBusy}
                    onClick={() => {
                      setActiveScan(scan);
                      setVerifiedGuidance(null);
                      setActiveTab('overview');
                      void ensureMarketLoaded(scan);
                    }}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border text-left transition-colors cursor-pointer disabled:opacity-50 ${
                      activeScan?.id === scan.id
                        ? 'border-[#216B43] bg-[#E9F5EE]/50'
                        : 'border-[#E5E2DA] hover:bg-[#F8F7F4]'
                    }`}
                  >
                    <ResilientImage
                      src={scan.imageUrl}
                      alt={scan.cropName}
                      className="w-11 h-11 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#17231B] truncate">
                        {translateCrop(state.language, scan.cropName)} ·{' '}
                        {t('common.gradeLabel', { grade: scan.quality.suggestedGrade })}
                      </p>
                      <p className="text-[11px] text-[#546358] truncate mt-0.5">
                        {scan.healthScore}/100 · {scan.disease.possibleDisease}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
