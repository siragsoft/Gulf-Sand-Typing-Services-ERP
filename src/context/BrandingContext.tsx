import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SpecialHoliday {
  id: string;
  date: string;
  labelAr: string;
  labelEn: string;
  type: 'holiday' | 'workday';
}

export interface BrandingConfig {
  logoUrl: string | null;
  companyNameAr: string;
  companyNameEn: string;
  shortNameAr: string;
  shortNameEn: string;
  licenseNumber: string;
  taxNumber: string;
  phone: string;
  phoneSecondary: string;
  mobileWhatsApp: string;
  whatsappSecondary: string;
  email: string;
  locationAr: string;
  locationEn: string;
  taglineAr: string;
  taglineEn: string;
  stampUrl: string | null;
  primaryColor: string; // deep navy
  accentColor: string;  // gold
  operatingHoursAr: string;
  operatingHoursEn: string;
  holidayScheduleAr: string;
  holidayScheduleEn: string;
  leaveDates: string;
  weeklyHolidayAr: string;
  weeklyHolidayEn: string;
  specialHolidaysExceptions: SpecialHoliday[];
}

export const DEFAULT_BRANDING: BrandingConfig = {
  logoUrl: null,
  companyNameAr: 'جلف ساند للطباعة والخدمات',
  companyNameEn: 'GULFSAND TYPING SERVICES',
  shortNameAr: 'جلف ساند',
  shortNameEn: 'GULFSAND',
  licenseNumber: 'CN-2849104',
  taxNumber: '100293847500003',
  phone: '+971 3 766 5400',
  phoneSecondary: '+971 3 766 5401',
  mobileWhatsApp: '+971 50 882 1940',
  whatsappSecondary: '+971 50 882 1941',
  email: 'info@gulfsandtyping.ae',
  locationAr: 'العين - العامرة شمال - مكتب رقم 2',
  locationEn: 'Al Ain - Al Amerah North - Office No. 2',
  taglineAr: 'معاملات الهوية والإقامة • تسهيل • تأسيس الشركات • الترجمة القانونية • السفر',
  taglineEn: 'Emirates ID & Residency • Tasheel • Business Setup • Legal Translation • Travel',
  stampUrl: null,
  primaryColor: '#0A192F',
  accentColor: '#D97706',
  operatingHoursAr: 'السبت إلى الخميس: 8:00 صباحاً - 8:00 مساءً | الجمعة: 4:00 عصراً - 8:00 مساءً',
  operatingHoursEn: 'Saturday to Thursday: 8:00 AM - 8:00 PM | Friday: 4:00 PM - 8:00 PM',
  holidayScheduleAr: 'السبت هو العطلة الأسبوعية الرسمية للمركز مالم تنشأ استثناءات مخصصة.',
  holidayScheduleEn: 'Saturday is the primary weekly holiday unless special exceptions are configured.',
  leaveDates: '2026-12-02 (اليوم الوطني الإماراتي), 2027-01-01 (رأس السنة الميلادية)',
  weeklyHolidayAr: 'السبت',
  weeklyHolidayEn: 'Saturday',
  specialHolidaysExceptions: [
    { id: '1', date: '2026-12-02', labelAr: 'العيد الوطني الإماراتي', labelEn: 'UAE National Day', type: 'holiday' },
    { id: '2', date: '2027-01-01', labelAr: 'رأس السنة الميلادية', labelEn: 'New Year\'s Day', type: 'holiday' }
  ],
};

interface BrandingContextType {
  branding: BrandingConfig;
  updateBranding: (newBranding: Partial<BrandingConfig>) => void;
  resetBranding: () => void;
  isCustomLogoActive: boolean;
}

const STORAGE_KEY = 'gulf_sand_branding_config_v2';

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const BrandingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [branding, setBranding] = useState<BrandingConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_BRANDING, ...JSON.parse(saved) };
      }
    } catch {
      // ignore JSON parse errors
    }
    return DEFAULT_BRANDING;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(branding));
    } catch {
      // local storage full or disabled
    }
  }, [branding]);

  const updateBranding = (newBranding: Partial<BrandingConfig>) => {
    setBranding((prev) => ({ ...prev, ...newBranding }));
  };

  const resetBranding = () => {
    setBranding(DEFAULT_BRANDING);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <BrandingContext.Provider
      value={{
        branding,
        updateBranding,
        resetBranding,
        isCustomLogoActive: !!branding.logoUrl,
      }}
    >
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = (): BrandingContextType => {
  const context = useContext(BrandingContext);
  if (!context) {
    return {
      branding: DEFAULT_BRANDING,
      updateBranding: () => {},
      resetBranding: () => {},
      isCustomLogoActive: false,
    };
  }
  return context;
};
