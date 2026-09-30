import React from 'react';

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  shimmerColor?: string;
  className?: string;
}

export const ShimmerButton: React.FC<ShimmerButtonProps> = ({
  children,
  shimmerColor = '#34d399',
  className = '',
  ...props
}) => {
  return (
    <button
      {...props}
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-xl p-[1px] font-bold transition-all duration-300 active:scale-95 group shadow-lg shadow-emerald-500/15 ${className}`}
    >
      {/* Animated rotating border / shimmer reflection */}
      <span
        className="absolute inset-[-100%] animate-[spin_3s_linear_infinite]"
        style={{
          background: `conic-gradient(from 90deg at 50% 50%, #090d16 0%, ${shimmerColor} 50%, #090d16 100%)`,
        }}
      />
      {/* Button Body */}
      <span className="relative inline-flex h-full w-full items-center justify-center gap-2 rounded-[11px] bg-slate-950 px-5 py-2.5 text-xs sm:text-sm font-bold text-white transition-all duration-300 group-hover:bg-slate-900/90 backdrop-blur-xl">
        {children}
      </span>
    </button>
  );
};
