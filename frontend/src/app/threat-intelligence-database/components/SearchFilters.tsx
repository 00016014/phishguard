import Icon from '@/components/ui/AppIcon';

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
  selectedSeverity: string;
  onSeverityChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedOrigin: string;
  onOriginChange: (value: string) => void;
  onClearFilters: () => void;
}

const SearchFilters = ({
  searchQuery,
  onSearchChange,
  selectedType,
  onTypeChange,
  selectedSeverity,
  onSeverityChange,
  selectedStatus,
  onStatusChange,
  selectedOrigin,
  onOriginChange,
  onClearFilters,
}: SearchFiltersProps) => {
  const threatTypes = [
    'All Types',
    'Email Phishing',
    'SMS Phishing',
    'Voice Phishing',
    'Social Media',
    'Malware',
    'Ransomware',
  ];

  const severityLevels = ['All Severities', 'Critical', 'High', 'Medium', 'Low'];

  const statusOptions = ['All Status', 'Active', 'Mitigated', 'Archived'];

  const originOptions = [
    'All Origins',
    'United States',
    'Russia',
    'China',
    'Nigeria',
    'India',
    'Unknown',
  ];

  const hasActiveFilters =
    searchQuery ||
    selectedType !== 'All Types' ||
    selectedSeverity !== 'All Severities' ||
    selectedStatus !== 'All Status' ||
    selectedOrigin !== 'All Origins';

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-headline font-bold text-foreground flex items-center space-x-2">
          <Icon name="FunnelIcon" size={20} />
          <span>Search & Filter</span>
        </h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-brand-primary hover:text-brand-primary/80 font-medium flex items-center space-x-1"
          >
            <Icon name="XMarkIcon" size={16} />
            <span>Clear All</span>
          </button>
        )}
      </div>

      <div className="relative">
        <Icon
          name="MagnifyingGlassIcon"
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search threats by title, description, or ID..."
          className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Threat Type
          </label>
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            {threatTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Severity Level
          </label>
          <select
            value={selectedSeverity}
            onChange={(e) => onSeverityChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            {severityLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Origin
          </label>
          <select
            value={selectedOrigin}
            onChange={(e) => onOriginChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          >
            {originOptions.map((origin) => (
              <option key={origin} value={origin}>
                {origin}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;