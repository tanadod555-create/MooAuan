import React from 'react';

export const BentoGrid: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
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
      className={`group relative overflow-hidden rounded-3xl border border-pink-200/90 bg-white/95 text-pink-950 p-5 shadow-sm shadow-pink-100/50 transition-all duration-300 hover:border-pink-300 hover:shadow-md ${colSpanClass} ${className}`}
    >
      {/* Background ambient gradient */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-pink-400/5 blur-2xl group-hover:bg-pink-400/10 transition-all duration-500" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className="w-8 h-8 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform">
              {icon}
            </div>
          )}
          <div>
            <h4 className="text-sm font-bold text-pink-950 tracking-tight">{title}</h4>
            {subtitle && <p className="text-[11px] text-pink-700/70">{subtitle}</p>}
          </div>
        </div>
        {badge && (
          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
