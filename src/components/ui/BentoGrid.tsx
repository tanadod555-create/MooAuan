import React from 'react';

export const BentoGrid: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-3.5 ${className}`}>
      {children}
    </div>
  );
};

interface BentoCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: string;
  children: React.ReactNode;
  className?: string;
  colSpan?: 1 | 2 | 3;
}

export const BentoCard: React.FC<BentoCardProps> = ({
  title,
  subtitle,
  icon,
  badge,
  children,
  className = '',
  colSpan = 1,
}) => {
  const colSpanClass = {
    1: 'md:col-span-1',
    2: 'md:col-span-2',
    3: 'md:col-span-3',
  }[colSpan];

  return (
    <div
      className={`group relative overflow-hidden rounded-[24px] border border-black/[0.06] bg-white/90 text-zinc-900 p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all duration-300 hover:border-black/[0.1] hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.06)] ${colSpanClass} ${className}`}
    >
      {/* Background subtle ambient bloom */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-zinc-400/[0.04] blur-2xl group-hover:bg-zinc-400/[0.08] transition-all duration-500" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3.5 relative z-10">
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className="w-8 h-8 rounded-xl bg-zinc-100/80 border border-black/[0.04] flex items-center justify-center text-zinc-700 group-hover:scale-105 transition-transform">
              {icon}
            </div>
          )}
          <div>
            <h4 className="text-sm font-bold text-zinc-900 tracking-tight">{title}</h4>
            {subtitle && <p className="text-[11px] text-zinc-500">{subtitle}</p>}
          </div>
        </div>
        {badge && (
          <span className="text-[10px] font-semibold text-zinc-700 bg-zinc-100/80 border border-black/[0.05] px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
