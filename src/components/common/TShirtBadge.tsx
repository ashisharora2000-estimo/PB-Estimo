import React from 'react';
import { TShirtSize } from '../../types';

interface TShirtBadgeProps {
  size: TShirtSize;
  score?: number;
  showScore?: boolean;
  className?: string;
  variant?: 'solid' | 'subtle' | 'outline';
}

export const T_SHIRT_CONFIG: Record<TShirtSize, {
  label: string;
  fullName: string;
  colorClass: string;
  bgSubtle: string;
  borderClass: string;
  textClass: string;
  description: string;
  typicalHours: string;
}> = {
  XS: {
    label: 'XS',
    fullName: 'Extra Small',
    colorClass: 'bg-slate-600 text-white border-slate-700',
    bgSubtle: 'bg-slate-100 text-slate-700 border-slate-300',
    borderClass: 'border-slate-400 text-slate-700',
    textClass: 'text-slate-700',
    description: 'Vanilla MBP, minimal customizations, out-of-box workflows',
    typicalHours: '< 320 hrs'
  },
  S: {
    label: 'S',
    fullName: 'Small',
    colorClass: 'bg-blue-600 text-white border-blue-700',
    bgSubtle: 'bg-blue-50 text-blue-800 border-blue-200',
    borderClass: 'border-blue-400 text-blue-700',
    textClass: 'text-blue-700',
    description: 'Standard modern best practice with minor extensions',
    typicalHours: '320 - 580 hrs'
  },
  M: {
    label: 'M',
    fullName: 'Medium',
    colorClass: 'bg-emerald-600 text-white border-emerald-700',
    bgSubtle: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    borderClass: 'border-emerald-400 text-emerald-700',
    textClass: 'text-emerald-700',
    description: 'Enterprise standard with typical interfaces and approval matrices',
    typicalHours: '580 - 1,000 hrs'
  },
  L: {
    label: 'L',
    fullName: 'Large',
    colorClass: 'bg-amber-600 text-white border-amber-700',
    bgSubtle: 'bg-amber-50 text-amber-900 border-amber-300',
    borderClass: 'border-amber-400 text-amber-800',
    textClass: 'text-amber-800',
    description: 'High complexity, multi-entity, complex integrations & rules',
    typicalHours: '1,000 - 1,650 hrs'
  },
  XL: {
    label: 'XL',
    fullName: 'Extra Large',
    colorClass: 'bg-purple-600 text-white border-purple-700',
    bgSubtle: 'bg-purple-50 text-purple-900 border-purple-300',
    borderClass: 'border-purple-400 text-purple-800',
    textClass: 'text-purple-800',
    description: 'Global multi-country, high CEMLI, heavy conversion & statutory rules',
    typicalHours: '1,650 - 2,500 hrs'
  },
  XXL: {
    label: 'XXL',
    fullName: 'Enterprise Mega',
    colorClass: 'bg-rose-700 text-white border-rose-800',
    bgSubtle: 'bg-rose-50 text-rose-900 border-rose-300',
    borderClass: 'border-rose-400 text-rose-800',
    textClass: 'text-rose-800',
    description: 'Extreme complexity, localized engines, high automation & continuous close',
    typicalHours: '> 2,500 hrs'
  }
};

export const TShirtBadge: React.FC<TShirtBadgeProps> = ({
  size,
  score,
  showScore = false,
  className = '',
  variant = 'solid'
}) => {
  const cfg = T_SHIRT_CONFIG[size] || T_SHIRT_CONFIG.M;

  let styleClasses = cfg.colorClass;
  if (variant === 'subtle') styleClasses = cfg.bgSubtle;
  if (variant === 'outline') styleClasses = `bg-transparent border ${cfg.borderClass}`;

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-bold text-xs uppercase px-2 py-0.5 rounded-none border tracking-wider shadow-2xs ${styleClasses} ${className}`}
      title={`${cfg.fullName} (${cfg.typicalHours}): ${cfg.description}`}
    >
      <span>{cfg.label}</span>
      {showScore && score !== undefined && (
        <span className="opacity-80 text-[10px] font-normal">
          ({score.toFixed(1)})
        </span>
      )}
    </span>
  );
};

export interface TShirtSelectProps {
  value: TShirtSize;
  onChange: (newSize: TShirtSize) => void;
  disabled?: boolean;
  className?: string;
  showHours?: boolean;
}

export const TShirtSelect: React.FC<TShirtSelectProps> = ({
  value,
  onChange,
  disabled = false,
  className = '',
  showHours = true
}) => {
  const currentCfg = T_SHIRT_CONFIG[value] || T_SHIRT_CONFIG.M;
  const sizes: TShirtSize[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const sizeColorMap: Record<TShirtSize, { badge: string; border: string; bg: string }> = {
    XS: { badge: 'bg-slate-700 text-white', border: 'border-slate-300 hover:border-slate-400', bg: 'bg-slate-50' },
    S: { badge: 'bg-blue-600 text-white', border: 'border-blue-300 hover:border-blue-400', bg: 'bg-blue-50/60' },
    M: { badge: 'bg-emerald-600 text-white', border: 'border-emerald-300 hover:border-emerald-400', bg: 'bg-emerald-50/60' },
    L: { badge: 'bg-amber-600 text-white', border: 'border-amber-300 hover:border-amber-400', bg: 'bg-amber-50/60' },
    XL: { badge: 'bg-purple-600 text-white', border: 'border-purple-300 hover:border-purple-400', bg: 'bg-purple-50/60' },
    XXL: { badge: 'bg-rose-700 text-white', border: 'border-rose-300 hover:border-rose-400', bg: 'bg-rose-50/60' }
  };

  const theme = sizeColorMap[value] || sizeColorMap.M;

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      <div className="relative inline-flex items-center">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as TShirtSize)}
          disabled={disabled}
          className={`appearance-none font-mono text-[11px] font-bold pl-5.5 pr-4.5 py-0.5 h-6 rounded-none border transition cursor-pointer focus:outline-none focus:ring-1 focus:ring-slate-900 shadow-2xs ${theme.bg} ${theme.border} ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          title={`T-Shirt Size: ${currentCfg.label} - ${currentCfg.fullName} (${currentCfg.typicalHours})`}
        >
          {sizes.map((s) => {
            const cfg = T_SHIRT_CONFIG[s];
            return (
              <option key={s} value={s} className="font-sans text-slate-900 bg-white font-normal text-xs py-0.5">
                {s} &mdash; {cfg.fullName} ({cfg.typicalHours})
              </option>
            );
          })}
        </select>

        {/* Small color pill inside select on the left */}
        <div className="absolute left-1 pointer-events-none flex items-center justify-center">
          <span className={`w-3.5 h-3.5 flex items-center justify-center text-[8px] font-mono font-black leading-none ${theme.badge}`}>
            {value}
          </span>
        </div>

        {/* Down Arrow Chevron on the right */}
        <div className="absolute right-1 pointer-events-none text-slate-500 flex items-center">
          <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      {showHours && (
        <span className="text-[9px] font-mono text-slate-500 mt-0.5 leading-none">
          {currentCfg.typicalHours}
        </span>
      )}
    </div>
  );
};

