import React from 'react';
import { useBranding } from '../context/BrandingContext';

interface GulfSandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'horizontal' | 'stacked' | 'mark' | 'print';
  theme?: 'light' | 'dark' | 'navy' | 'auto';
  showSubtitle?: boolean;
  className?: string;
  forceDefaultLogo?: boolean;
}

export const GulfSandEmblem: React.FC<{ size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  // Height & Bar Width Scale
  const dimensions = {
    xs: { h: 'h-6', w: 'w-6', barW: 2.2, spacing: 1.8, radius: 1 },
    sm: { h: 'h-8', w: 'w-8', barW: 3, spacing: 2.2, radius: 1.5 },
    md: { h: 'h-10', w: 'w-10', barW: 3.8, spacing: 2.8, radius: 2 },
    lg: { h: 'h-14', w: 'w-14', barW: 5.2, spacing: 3.8, radius: 2.5 },
    xl: { h: 'h-20', w: 'w-20', barW: 7.5, spacing: 5.5, radius: 4 },
  }[size];

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 ${dimensions.h} ${dimensions.w} rounded-xl bg-white shadow-xs p-1 border border-amber-200/50 ${className}`}
      title="Gulf Sand Typing Services • خدمات جلف ساند للطباعة"
    >
      <svg
        viewBox="0 0 48 48"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Five Distinctive Vertical Bars */}
        {/* 1. Red Bar */}
        <rect x="4" y="8" width="6.5" height="32" rx="2.5" fill="#DC2626" />
        {/* 2. Green Bar */}
        <rect x="12.5" y="4" width="6.5" height="40" rx="2.5" fill="#16A34A" />
        {/* 3. Light Gray Bar */}
        <rect x="21" y="10" width="6.5" height="28" rx="2.5" fill="#CBD5E1" />
        {/* 4. Dark Gray Bar */}
        <rect x="29.5" y="6" width="6.5" height="36" rx="2.5" fill="#475569" />
        {/* 5. Black / Deep Navy Bar */}
        <rect x="38" y="10" width="6.5" height="28" rx="2.5" fill="#0A192F" />

        {/* Subtle Gold Foundation Accent */}
        <path
          d="M4 43.5C12 44.5 36 44.5 44 43.5"
          stroke="#D97706"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

export const GulfSandLogo: React.FC<GulfSandLogoProps> = ({
  size = 'md',
  variant = 'horizontal',
  theme = 'auto',
  showSubtitle = true,
  className = '',
  forceDefaultLogo = false,
}) => {
  const { branding } = useBranding();
  const hasCustomLogo = !forceDefaultLogo && !!branding.logoUrl;

  const isDark = theme === 'dark' || theme === 'navy';

  // Typography Size Mapping
  const textSizes = {
    xs: {
      ar: 'text-xs font-black tracking-tight',
      en: 'text-[9px] font-semibold tracking-wider',
      sub: 'text-[8px]',
    },
    sm: {
      ar: 'text-sm font-black tracking-tight',
      en: 'text-[10px] font-semibold tracking-wider',
      sub: 'text-[9px]',
    },
    md: {
      ar: 'text-base font-black tracking-tight',
      en: 'text-xs font-bold tracking-wider',
      sub: 'text-[10px]',
    },
    lg: {
      ar: 'text-xl font-black tracking-tight',
      en: 'text-sm font-bold tracking-wider',
      sub: 'text-xs',
    },
    xl: {
      ar: 'text-2xl font-black tracking-tight',
      en: 'text-base font-extrabold tracking-wider',
      sub: 'text-xs',
    },
  }[size];

  // Render Mark Only
  if (variant === 'mark') {
    if (hasCustomLogo) {
      const imgSize = {
        xs: 'h-6 w-6',
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-14 w-14',
        xl: 'h-20 w-20',
      }[size];
      return (
        <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
          <img
            src={branding.logoUrl!}
            alt={branding.companyNameEn}
            className={`${imgSize} object-contain rounded-lg border border-amber-200/50 bg-white p-0.5 shadow-xs`}
          />
        </div>
      );
    }
    return <GulfSandEmblem size={size} className={className} />;
  }

  // Render Print / Official Header Variant
  if (variant === 'print') {
    return (
      <div className={`w-full flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-4 ${className}`}>
        {/* Right side: Arabic Identity */}
        <div className="text-right flex-1">
          <h1 className="text-xl font-black text-slate-950 font-serif leading-tight">
            {branding.companyNameAr || 'خدمات جلف ساند للطباعة'}
          </h1>
          <p className="text-xs text-amber-900 font-bold mt-0.5">
            معاملات الهوية والجوازات والإقامة • تسهيل • الدائرة الاقتصادية
          </p>
          <div className="flex items-center gap-3 justify-end text-[10px] text-slate-600 font-medium mt-1">
            <span>رقم الرخصة: <b className="text-slate-900">{branding.licenseNumber}</b></span>
            <span>•</span>
            <span>الرقم الضريبي TRN: <b className="text-slate-900">{branding.taxNumber}</b></span>
          </div>
        </div>

        {/* Center: Emblem or Uploaded Logo */}
        <div className="px-6 flex flex-col items-center justify-center">
          {hasCustomLogo ? (
            <img
              src={branding.logoUrl!}
              alt={branding.companyNameEn}
              className="h-16 w-auto max-w-[140px] object-contain rounded-lg border border-slate-300 p-1 bg-white"
            />
          ) : (
            <GulfSandEmblem size="lg" />
          )}
          <span className="text-[9px] font-black tracking-widest text-amber-700 uppercase mt-1">
            AL AIN • العين
          </span>
        </div>

        {/* Left side: English Identity */}
        <div className="text-left flex-1">
          <h2 className="text-lg font-black text-slate-950 tracking-wide uppercase leading-tight font-sans">
            {branding.companyNameEn || 'Gulf Sand Typing Services'}
          </h2>
          <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
            Government Services • Tasheel • Corporate Setup • Legal Translation
          </p>
          <div className="flex items-center gap-3 justify-start text-[10px] text-slate-600 font-medium mt-1">
            <span>Tel: <b className="text-slate-900">{branding.phone}</b></span>
            <span>•</span>
            <span>Mob: <b className="text-slate-900">{branding.mobileWhatsApp}</b></span>
          </div>
        </div>
      </div>
    );
  }

  // Render Stacked Variant (Centered, for Login / Splash / Hero)
  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center gap-2.5 ${className}`}>
        {hasCustomLogo ? (
          <img
            src={branding.logoUrl!}
            alt={branding.companyNameEn}
            className="h-16 w-auto max-w-[180px] object-contain rounded-xl border border-amber-200/60 bg-white p-1.5 shadow-sm"
          />
        ) : (
          <GulfSandEmblem size={size === 'xs' ? 'sm' : size} />
        )}

        <div className="flex flex-col items-center">
          <span
            className={`${textSizes.ar} ${
              isDark ? 'text-white' : 'text-slate-950'
            } leading-tight`}
          >
            {branding.companyNameAr || 'خدمات جلف ساند للطباعة'}
          </span>
          <span
            className={`${textSizes.en} ${
              isDark ? 'text-amber-300' : 'text-amber-700'
            } uppercase font-bold tracking-widest mt-0.5`}
          >
            {branding.companyNameEn || 'Gulf Sand Typing Services'}
          </span>
          {showSubtitle && (
            <span
              className={`${textSizes.sub} ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              } font-medium mt-1`}
            >
              العين - العامرة شمال • Al Ain, UAE
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default: Horizontal Variant (Standard Navigation & Headers)
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {hasCustomLogo ? (
        <img
          src={branding.logoUrl!}
          alt={branding.companyNameEn}
          className="h-10 w-auto max-w-[110px] object-contain rounded-lg border border-amber-200/60 bg-white p-1 shadow-xs shrink-0"
        />
      ) : (
        <GulfSandEmblem size={size} />
      )}

      <div className="flex flex-col text-start justify-center">
        <div className="flex items-center gap-2">
          <span
            className={`${textSizes.ar} ${
              isDark ? 'text-white' : 'text-slate-950'
            } leading-tight drop-shadow-2xs`}
          >
            {branding.companyNameAr || 'خدمات جلف ساند للطباعة'}
          </span>
          <span className="hidden sm:inline-block text-[9px] bg-amber-500/15 text-amber-800 dark:text-amber-300 font-black px-1.5 py-0.5 rounded border border-amber-500/30">
            العين
          </span>
        </div>
        <span
          className={`${textSizes.en} ${
            isDark ? 'text-amber-300' : 'text-amber-700'
          } uppercase tracking-wider font-bold`}
        >
          {branding.companyNameEn || 'Gulf Sand Typing Services'}
        </span>
        {showSubtitle && (
          <span
            className={`${textSizes.sub} ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            } font-medium hidden md:block mt-0.5`}
          >
            منظومة إدارة المعاملات والخدمات الحكومية
          </span>
        )}
      </div>
    </div>
  );
};
