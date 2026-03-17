'use client';

import { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

interface CodeExampleProps {
  title: string;
  language: string;
  code: string;
}

export default function CodeExample({ title, language, code }: CodeExampleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border">
        <div className="flex items-center space-x-3">
          <Icon name="CodeBracketIcon" size={20} className="text-brand-primary" />
          <span className="text-sm font-semibold text-foreground">{title}</span>
          <span className="text-xs text-muted-foreground">({language})</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium text-brand-primary hover:bg-brand-primary/10 rounded-md transition-colors"
        >
          <Icon name={copied ? "CheckIcon" : "ClipboardDocumentIcon"} size={16} />
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-sm font-accent text-foreground">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}