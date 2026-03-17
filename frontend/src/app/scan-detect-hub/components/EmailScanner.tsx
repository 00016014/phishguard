'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface EmailScannerProps {
  onScan: (content: string) => void;
  isScanning: boolean;
  disabled?: boolean;
}

export default function EmailScanner({ onScan, isScanning, disabled = false }: EmailScannerProps) {
  const [emailContent, setEmailContent] = useState('');

  const handleScan = () => {
    if (emailContent.trim()) {
      onScan(emailContent);
    }
  };

  const handlePasteExample = () => {
    const exampleEmail = `From: security@paypal-verify.com\nTo: user@example.com\nSubject: Urgent: Verify Your Account Now\n\nDear Valued Customer,\n\nWe have detected unusual activity on your PayPal account. To prevent suspension, please verify your information immediately by clicking the link below:\n\nhttp://paypal-secure-login.tk/verify?id=12345\n\nFailure to verify within 24 hours will result in permanent account closure.\n\nBest regards,\nPayPal Security Team`;
    setEmailContent(exampleEmail);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-foreground">
          Email Content
        </label>
        <button
          onClick={handlePasteExample}
          className="text-sm text-brand-primary hover:text-brand-primary/80 font-medium"
        >
          Paste Example
        </button>
      </div>
      
      <textarea
        value={emailContent}
        onChange={(e) => setEmailContent(e.target.value)}
        placeholder="Paste complete email content including headers, subject, and body..."
        className="w-full h-64 px-4 py-3 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent resize-none font-accent text-sm"
        disabled={isScanning || disabled}
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Include email headers for more accurate analysis
        </p>
        <button
          onClick={handleScan}
          disabled={!emailContent.trim() || isScanning || disabled}
          className="px-6 py-3 bg-brand-accent text-white font-cta font-semibold rounded-lg hover:bg-brand-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center space-x-2"
        >
          {isScanning ? (
            <>
              <Icon name="ArrowPathIcon" size={20} className="animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Icon name="MagnifyingGlassIcon" size={20} />
              <span>Scan Email</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}