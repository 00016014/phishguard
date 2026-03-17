'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface URLScannerProps {
  onScan: (url: string) => void;
  isScanning: boolean;
  disabled?: boolean;
}

export default function URLScanner({ onScan, isScanning, disabled = false }: URLScannerProps) {
  const [url, setUrl] = useState('');

  const handleScan = () => {
    if (url.trim()) {
      onScan(url);
    }
  };

  const handlePasteExample = () => {
    setUrl('http://amaz0n-security-verify.tk/login?redirect=account');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-foreground">
          URL or Link
        </label>
        <button
          onClick={handlePasteExample}
          className="text-sm text-brand-primary hover:text-brand-primary/80 font-medium"
        >
          Paste Example
        </button>
      </div>
      
      <div className="flex space-x-3">
        <div className="flex-1 relative">
          <Icon 
            name="LinkIcon" 
            size={20} 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/suspicious-link"
            className="w-full pl-12 pr-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent"
            disabled={isScanning || disabled}
          />
        </div>
        <button
          onClick={handleScan}
          disabled={!url.trim() || isScanning || disabled}
          className="px-6 py-3 bg-brand-accent text-white font-cta font-semibold rounded-lg hover:bg-brand-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2"
        >
          {isScanning ? (
            <>
              <Icon name="ArrowPathIcon" size={20} className="animate-spin" />
              <span>Scanning...</span>
            </>
          ) : (
            <>
              <Icon name="ShieldCheckIcon" size={20} />
              <span>Scan URL</span>
            </>
          )}
        </button>
      </div>

      <div className="bg-surface rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="InformationCircleIcon" size={20} className="text-brand-primary mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-foreground mb-1">
              What We Check
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Domain reputation and age</li>
              <li>• SSL certificate validity</li>
              <li>• Known phishing patterns</li>
              <li>• Suspicious redirects</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}