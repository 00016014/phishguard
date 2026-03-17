import Icon from '@/components/ui/AppIcon';

interface VtStats {
  malicious: number;
  suspicious: number;
  harmless: number;
  undetected: number;
  total: number;
}

interface ThreatDetail {
  category: string;
  severity: 'safe' | 'warning' | 'danger';
  finding: string;
  explanation: string;
  // Optional VirusTotal extended data
  vt_stats?: VtStats;
  vt_vendors?: string[];
  vt_categories?: string[];
  vt_reputation?: number;
  vt_votes?: { harmless?: number; malicious?: number };
  vt_tags?: string[];
  vt_final_url?: string;
}

interface ThreatDetailsProps {
  details: ThreatDetail[];
}

function VtPanel({ detail }: { detail: ThreatDetail }) {
  const s = detail.vt_stats!;
  const total = s.total || 1;
  const malPct = Math.round((s.malicious / total) * 100);
  const susPct = Math.round((s.suspicious / total) * 100);
  const harmPct = Math.round((s.harmless / total) * 100);
  const undetPct = 100 - malPct - susPct - harmPct;

  const repColor =
    (detail.vt_reputation ?? 0) < -20
      ? 'text-red-500'
      : (detail.vt_reputation ?? 0) < 0
      ? 'text-orange-400'
      : 'text-green-500';

  const isSafe = detail.severity === 'safe';
  const borderCls = isSafe ? 'border-green-500/20' : 'border-red-500/20';
  const bgCls = isSafe ? 'bg-green-500/5' : 'bg-red-500/5';

  return (
    <div className={`p-5 rounded-lg border ${bgCls} ${borderCls} space-y-4`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon
            name={isSafe ? 'ShieldCheckIcon' : 'ShieldExclamationIcon'}
            size={22}
            className={isSafe ? 'text-green-500' : 'text-red-500'}
            variant="solid"
          />
          <span className="font-semibold text-foreground">VirusTotal Analysis</span>
        </div>
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border ${
            isSafe
              ? 'text-green-600 bg-green-500/10 border-green-500/20'
              : 'text-red-500 bg-red-500/10 border-red-500/20'
          }`}
        >
          {isSafe ? 'clean' : 'danger'}
        </span>
      </div>

      <p className="text-sm font-medium text-foreground">{detail.finding}</p>

      {/* Engine stats bar */}
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Engine Results</span>
          <span>{s.total} engines</span>
        </div>
        <div className="flex h-4 rounded-full overflow-hidden w-full bg-surface">
          {malPct > 0 && (
            <div title={`${s.malicious} malicious`} style={{ width: `${malPct}%` }} className="bg-red-500" />
          )}
          {susPct > 0 && (
            <div title={`${s.suspicious} suspicious`} style={{ width: `${susPct}%` }} className="bg-orange-400" />
          )}
          {harmPct > 0 && (
            <div title={`${s.harmless} harmless`} style={{ width: `${harmPct}%` }} className="bg-green-500" />
          )}
          {undetPct > 0 && (
            <div title={`${s.undetected} undetected`} style={{ width: `${Math.max(undetPct, 0)}%` }} className="bg-muted" />
          )}
        </div>
        <div className="flex flex-wrap gap-3 mt-2">
          {[
            { label: 'Malicious', count: s.malicious, color: 'text-red-500' },
            { label: 'Suspicious', count: s.suspicious, color: 'text-orange-400' },
            { label: 'Harmless', count: s.harmless, color: 'text-green-500' },
            { label: 'Undetected', count: s.undetected, color: 'text-muted-foreground' },
          ].map(({ label, count, color }) => (
            <div key={label} className="flex items-center space-x-1 text-xs">
              <span className={`font-bold ${color}`}>{count}</span>
              <span className="text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Flagging vendors */}
      {detail.vt_vendors && detail.vt_vendors.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
            Flagging Vendors
          </p>
          <div className="flex flex-wrap gap-1.5">
            {detail.vt_vendors.map((v) => (
              <span key={v} className="text-xs px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">
                {v}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bottom row: reputation, tags, votes, categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* Reputation */}
        {detail.vt_reputation !== undefined && (
          <div className="flex items-center space-x-2">
            <Icon name="StarIcon" size={15} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Reputation:</span>
            <span className={`text-xs font-bold ${repColor}`}>{detail.vt_reputation}</span>
          </div>
        )}

        {/* Community votes */}
        {detail.vt_votes && (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <Icon name="HandThumbUpIcon" size={14} className="text-green-500" />
              <span className="text-xs text-muted-foreground">{detail.vt_votes.harmless ?? 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="HandThumbDownIcon" size={14} className="text-red-500" />
              <span className="text-xs text-muted-foreground">{detail.vt_votes.malicious ?? 0}</span>
            </div>
            <span className="text-xs text-muted-foreground">community votes</span>
          </div>
        )}

        {/* Tags */}
        {detail.vt_tags && detail.vt_tags.length > 0 && (
          <div className="flex flex-wrap gap-1 md:col-span-2">
            {detail.vt_tags.map((t) => (
              <span key={t} className="text-xs px-2 py-0.5 bg-brand-primary/10 text-brand-primary border border-brand-primary/20 rounded-full">
                #{t}
              </span>
            ))}
          </div>
        )}

        {/* Categories */}
        {detail.vt_categories && detail.vt_categories.length > 0 && (
          <div className="md:col-span-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Vendor Categories
            </p>
            <div className="flex flex-wrap gap-1.5">
              {detail.vt_categories.map((c) => (
                <span key={c} className="text-xs px-2 py-0.5 bg-surface text-muted-foreground border border-border rounded-full capitalize">
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Final URL (if redirected) */}
        {detail.vt_final_url && detail.vt_final_url !== detail.explanation && (
          <div className="md:col-span-2 flex items-start space-x-2">
            <Icon name="LinkIcon" size={13} className="text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground break-all">
              Final URL: <span className="text-foreground">{detail.vt_final_url}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ThreatDetails({ details }: ThreatDetailsProps) {
  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'safe':
        return {
          icon: 'CheckCircleIcon',
          iconColor: 'text-success',
          bgColor: 'bg-success/10',
          borderColor: 'border-success/20'
        };
      case 'warning':
        return {
          icon: 'ExclamationTriangleIcon',
          iconColor: 'text-warning',
          bgColor: 'bg-warning/10',
          borderColor: 'border-warning/20'
        };
      case 'danger':
        return {
          icon: 'XCircleIcon',
          iconColor: 'text-error',
          bgColor: 'bg-error/10',
          borderColor: 'border-error/20'
        };
      default:
        return {
          icon: 'InformationCircleIcon',
          iconColor: 'text-brand-primary',
          bgColor: 'bg-brand-primary/10',
          borderColor: 'border-brand-primary/20'
        };
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-headline font-bold text-foreground">
        Detailed Analysis
      </h3>
      <div className="space-y-3">
        {details.map((detail, index) => {
          // Render rich VirusTotal panel when extended data is present
          if (detail.category === 'VirusTotal Analysis' && detail.vt_stats) {
            return <VtPanel key={index} detail={detail} />;
          }

          const config = getSeverityConfig(detail.severity);
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}
            >
              <div className="flex items-start space-x-3">
                <Icon
                  name={config.icon as any}
                  size={24}
                  className={`${config.iconColor} mt-0.5`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-foreground">
                      {detail.category}
                    </h4>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${config.iconColor} ${config.bgColor} border ${config.borderColor}`}>
                      {detail.severity}
                    </span>
                  </div>
                  <p className="text-sm text-foreground font-medium mb-1">
                    {detail.finding}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {detail.explanation}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}