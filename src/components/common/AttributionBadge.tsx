import React from 'react';
import { Tag, Quote, Sparkles, BookOpen, AlertCircle } from 'lucide-react';

export type AttributionType = 'direct' | 'inferred' | 'default' | 'user_override';

interface AttributionBadgeProps {
  type: AttributionType;
  citation?: string;
  confidencePct?: number;
  showTooltip?: boolean;
  className?: string;
  compact?: boolean;
}

export const AttributionBadge: React.FC<AttributionBadgeProps> = ({
  type,
  citation,
  confidencePct,
  className = '',
  compact = false
}) => {
  let badgeStyle = 'bg-blue-50 text-blue-800 border-blue-300';
  let dotColor = 'bg-blue-500';
  let label = 'Industry Baseline';
  let icon = <BookOpen size={10} className="shrink-0" />;

  if (type === 'direct') {
    badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    dotColor = 'bg-emerald-600';
    label = 'Direct Extracted';
    icon = <Quote size={10} className="shrink-0" />;
  } else if (type === 'inferred') {
    badgeStyle = 'bg-amber-50 text-amber-800 border-amber-300';
    dotColor = 'bg-amber-500';
    label = 'Inferred Context';
    icon = <Sparkles size={10} className="shrink-0" />;
  } else if (type === 'user_override') {
    badgeStyle = 'bg-purple-50 text-purple-800 border-purple-300';
    dotColor = 'bg-purple-600';
    label = 'Human Verified';
    icon = <Tag size={10} className="shrink-0" />;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono text-[10px] font-bold px-1.5 py-0.5 border select-none transition ${badgeStyle} ${className}`}
      title={citation ? `Source Citation: "${citation}"` : `Attribution: ${label}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} inline-block shrink-0`} />
      {icon}
      <span>{compact ? (type === 'direct' ? 'Direct' : type === 'inferred' ? 'Inferred' : 'Baseline') : label}</span>
      {confidencePct !== undefined && (
        <span className="opacity-80 font-normal">({confidencePct}%)</span>
      )}
    </span>
  );
};
