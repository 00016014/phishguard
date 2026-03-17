'use client';

import { useState, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';

interface FileScannerProps {
  onScan: (content: string) => void;
  isScanning: boolean;
  disabled?: boolean;
}

export default function FileScanner({ onScan, isScanning, disabled = false }: FileScannerProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) setSelectedFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
  };

  const extractFileContent = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || '');
      reader.onerror = () => reject(new Error('Failed to read file'));
      // Read as text for text-based files; otherwise read as data URL and send metadata
      const textTypes = ['text/', 'application/json', 'application/xml', 'application/javascript'];
      if (textTypes.some((t) => file.type.startsWith(t)) || file.name.match(/\.(txt|csv|xml|json|js|html|htm|md|log)$/i)) {
        reader.readAsText(file);
      } else {
        // For binary files (PDF, DOC, ZIP, etc.) send filename + type as the content
        // so the backend can flag extension-based risks
        resolve(`File: ${file.name}\nType: ${file.type || 'unknown'}\nSize: ${file.size} bytes`);
      }
    });

  const handleScan = async () => {
    if (!selectedFile) return;
    setExtracting(true);
    try {
      const content = await extractFileContent(selectedFile);
      onScan(content);
    } catch {
      onScan(`File: ${selectedFile.name}\nType: ${selectedFile.type}\nSize: ${selectedFile.size} bytes`);
    } finally {
      setExtracting(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-foreground">File Attachment</label>

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 ${
          dragActive
            ? 'border-brand-primary bg-brand-primary/5'
            : 'border-border hover:border-brand-primary/50 hover:bg-surface'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          disabled={isScanning || extracting || disabled}
          accept=".txt,.csv,.xml,.json,.js,.html,.htm,.md,.log,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
        />

        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="p-3 bg-brand-primary/10 rounded-lg">
                <Icon name="DocumentIcon" size={32} className="text-brand-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <button
              onClick={() => { setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
              className="text-sm text-error hover:text-error/80 font-medium"
            >
              Remove File
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-surface rounded-full">
                <Icon name="CloudArrowUpIcon" size={48} className="text-brand-primary" />
              </div>
            </div>
            <div>
              <p className="text-foreground font-medium mb-1">Drag and drop your file here</p>
              <p className="text-sm text-muted-foreground mb-4">or</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2 bg-surface text-foreground font-medium rounded-lg hover:bg-border transition-colors"
              >
                Browse Files
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Supported formats: TXT, PDF, DOC, DOCX, XLS, XLSX, ZIP (Max 10MB)
            </p>
          </div>
        )}
      </div>

      {selectedFile && (
        <div className="flex justify-end">
          <button
            onClick={handleScan}
            disabled={isScanning || extracting || disabled}
            className="px-6 py-3 bg-brand-accent text-white font-cta font-semibold rounded-lg hover:bg-brand-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2"
          >
            {isScanning || extracting ? (
              <>
                <Icon name="ArrowPathIcon" size={20} className="animate-spin" />
                <span>{extracting ? 'Reading file...' : 'Scanning...'}</span>
              </>
            ) : (
              <>
                <Icon name="ShieldCheckIcon" size={20} />
                <span>Scan File</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

