'use client';

import { useState, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import Icon from '@/components/ui/AppIcon';

interface QRScannerProps {
  onScan: (data: string) => void;
  isScanning: boolean;
  disabled?: boolean;
}

export default function QRScanner({ onScan, isScanning, disabled = false }: QRScannerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [decoded, setDecoded] = useState<string | null>(null);
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const decodeQRFromImageSrc = (src: string): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('No canvas context'));
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) resolve(code.data);
        else reject(new Error('No QR code found in image'));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
    });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setDecodeError(null);
    setDecoded(null);
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (event) => {
      const src = event.target?.result as string;
      setSelectedImage(src);
      try {
        const result = await decodeQRFromImageSrc(src);
        setDecoded(result);
      } catch {
        setDecodeError('Could not detect a QR code in this image. Try a clearer image.');
      }
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    setDecodeError(null);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        scanFrames();
      }
    } catch {
      setDecodeError('Camera access denied or not available.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  const scanFrames = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(scanFrames);
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (code) {
      stopCamera();
      setDecoded(code.data);
    } else {
      requestAnimationFrame(scanFrames);
    }
  }, []);

  const handleScan = () => {
    if (decoded) onScan(decoded);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-foreground">QR Code Scanner</label>

      {!cameraActive && !selectedImage && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={startCamera}
            disabled={isScanning || disabled}
            className="p-8 border-2 border-dashed border-border rounded-lg hover:border-brand-primary hover:bg-surface transition-all duration-300 disabled:opacity-50"
          >
            <div className="flex flex-col items-center space-y-3">
              <div className="p-4 bg-brand-primary/10 rounded-full">
                <Icon name="CameraIcon" size={32} className="text-brand-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Use Camera</p>
                <p className="text-sm text-muted-foreground mt-1">Scan QR code with device camera</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning || disabled}
            className="p-8 border-2 border-dashed border-border rounded-lg hover:border-brand-primary hover:bg-surface transition-all duration-300 disabled:opacity-50"
          >
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            <div className="flex flex-col items-center space-y-3">
              <div className="p-4 bg-brand-primary/10 rounded-full">
                <Icon name="PhotoIcon" size={32} className="text-brand-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Upload Image</p>
                <p className="text-sm text-muted-foreground mt-1">Select QR code image from device</p>
              </div>
            </div>
          </button>
        </div>
      )}

      {cameraActive && (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden bg-black">
            <video ref={videoRef} className="w-full max-h-64 object-cover" muted playsInline />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-4 border-brand-primary rounded-lg opacity-70" />
            </div>
          </div>
          <p className="text-sm text-center text-muted-foreground animate-pulse">
            Scanning for QR code…
          </p>
          <div className="flex justify-center">
            <button onClick={stopCamera} className="px-4 py-2 text-sm text-error font-medium">
              Cancel
            </button>
          </div>
        </div>
      )}

      {selectedImage && !cameraActive && (
        <div className="space-y-4">
          <div className="relative w-full max-w-sm mx-auto">
            <img src={selectedImage} alt="Uploaded QR code" className="w-full h-auto rounded-lg border-2 border-border" />
          </div>
          <div className="flex justify-center space-x-3">
            <button
              onClick={() => { setSelectedImage(null); setDecoded(null); setDecodeError(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
              className="px-4 py-2 text-sm text-error hover:text-error/80 font-medium"
            >
              Remove Image
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 text-sm text-brand-primary hover:text-brand-primary/80 font-medium"
            >
              Upload Different
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </div>
        </div>
      )}

      {decodeError && (
        <div className="flex items-start space-x-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <Icon name="ExclamationCircleIcon" size={18} className="text-red-500 mt-0.5" />
          <p className="text-sm text-red-500">{decodeError}</p>
        </div>
      )}

      {decoded && (
        <div className="p-4 bg-surface border border-border rounded-lg space-y-3">
          <p className="text-sm font-medium text-foreground">Decoded QR Content:</p>
          <p className="text-sm text-muted-foreground break-all font-mono">{decoded}</p>
          <button
            onClick={handleScan}
            disabled={isScanning || disabled}
            className="w-full px-6 py-3 bg-brand-accent text-white font-semibold rounded-lg hover:bg-brand-accent/90 disabled:opacity-50 transition-all flex items-center justify-center space-x-2"
          >
            {isScanning ? (
              <><Icon name="ArrowPathIcon" size={20} className="animate-spin" /><span>Analyzing...</span></>
            ) : (
              <><Icon name="QrCodeIcon" size={20} /><span>Analyze QR Code</span></>
            )}
          </button>
        </div>
      )}

      <div className="bg-surface rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="ExclamationTriangleIcon" size={20} className="text-warning mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1">QR Code Safety Tips</h4>
            <p className="text-sm text-muted-foreground">
              Never scan QR codes from unknown sources. Malicious QR codes can redirect to phishing sites or download malware.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
