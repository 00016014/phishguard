'use client';


import Icon from '@/components/ui/AppIcon';

interface ScanType {
  id: string;
  name: string;
  icon: string;
  description: string;
  placeholder: string;
}

interface ScanTypeSelectorProps {
  onScanTypeChange: (type: string) => void;
  selectedType: string;
}

const scanTypes: ScanType[] = [
  {
    id: 'email',
    name: 'Email Content',
    icon: 'EnvelopeIcon',
    description: 'Paste email headers and body for comprehensive analysis',
    placeholder: 'Paste complete email content including headers...'
  },
  {
    id: 'url',
    name: 'URL/Link',
    icon: 'LinkIcon',
    description: 'Check suspicious links before clicking',
    placeholder: 'https://example.com/suspicious-link'
  },
  {
    id: 'file',
    name: 'File Attachment',
    icon: 'DocumentIcon',
    description: 'Upload files for malware and threat detection',
    placeholder: 'Drag & drop or click to upload'
  },
  {
    id: 'qr',
    name: 'QR Code',
    icon: 'QrCodeIcon',
    description: 'Scan QR codes using camera or upload image',
    placeholder: 'Use camera or upload QR code image'
  }
];

export default function ScanTypeSelector({ onScanTypeChange, selectedType }: ScanTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {scanTypes.map((type) => (
        <button
          key={type.id}
          onClick={() => onScanTypeChange(type.id)}
          className={`p-6 rounded-lg border-2 transition-all duration-300 text-left ${
            selectedType === type.id
              ? 'border-brand-primary bg-brand-primary/5 shadow-md'
              : 'border-border hover:border-brand-primary/50 hover:bg-surface'
          }`}
        >
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-lg ${
              selectedType === type.id ? 'bg-brand-primary text-white' : 'bg-surface text-brand-primary'
            }`}>
              <Icon name={type.icon as any} size={24} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-headline font-semibold text-foreground mb-1">
                {type.name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {type.description}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}