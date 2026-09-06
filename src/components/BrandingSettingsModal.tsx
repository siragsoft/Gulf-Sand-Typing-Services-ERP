import React, { useState, useRef } from 'react';
import { useBranding, DEFAULT_BRANDING, BrandingConfig } from '../context/BrandingContext';
import { GulfSandLogo, GulfSandEmblem } from './GulfSandLogo';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/schema';
import {
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Check,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileCheck2,
  X,
  Printer,
  Sparkles,
  ShieldCheck,
  FileText,
  Calendar,
  Trash2
} from 'lucide-react';

interface BrandingSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'ar' | 'en';
}

export const BrandingSettingsModal: React.FC<BrandingSettingsModalProps> = ({
  isOpen,
  onClose,
  lang = 'ar',
}) => {
  const { branding, updateBranding, resetBranding } = useBranding();
  const { currentUser } = useAuth();
  const isRtl = lang === 'ar';
  const isSystemAdmin = currentUser?.role === UserRole.SYSTEM_ADMIN || currentUser?.isSuperAdmin;

  const [formData, setFormData] = useState<BrandingConfig>(branding);
  const [previewTab, setPreviewTab] = useState<'header' | 'print' | 'login'>('header');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSystemAdmin) {
      alert(isRtl ? 'عذراً، تعديل الشعار مخصص لمدير النظام فقط.' : 'Unauthorized: Logo configuration is restricted to System Admin only.');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(isRtl ? 'يرجى اختيار ملف صورة صالح (PNG, SVG, JPG, WebP)' : 'Please select a valid image file (PNG, SVG, JPG, WebP)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert(isRtl ? 'حجم الصورة كبير جداً، يرجى اختيار ملف أقل من 2 ميغابايت' : 'Image size too large, please select a file under 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormData((prev) => ({ ...prev, logoUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    if (!isSystemAdmin) return;
    setFormData((prev) => ({ ...prev, logoUrl: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = () => {
    if (!isSystemAdmin) {
      alert(isRtl ? 'عذراً، حفظ التعديلات مخصص لمدير النظام فقط.' : 'Unauthorized: Saving branding changes is restricted to System Admin only.');
      return;
    }
    updateBranding(formData);
    setSuccessMsg(isRtl ? 'تم حفظ وتحديث الهوية المؤسسية لجلف ساند بنجاح في كامل المنظومة!' : 'Gulf Sand corporate branding updated successfully across the entire ERP!');
    setTimeout(() => {
      setSuccessMsg(null);
      onClose();
    }, 1200);
  };

  const handleResetAll = () => {
    if (!isSystemAdmin) {
      alert(isRtl ? 'عذراً، إعادة تهيئة الهوية مخصصة لمدير النظام فقط.' : 'Unauthorized: Resetting branding is restricted to System Admin only.');
      return;
    }
    if (window.confirm(isRtl ? 'هل أنت متأكد من استعادة شعار وهوية جلف ساند الافتراضية؟' : 'Are you sure you want to reset to default Gulf Sand branding?')) {
      resetBranding();
      setFormData(DEFAULT_BRANDING);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl border border-amber-200/80 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900"
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        {/* Modal Header */}
        <div className="bg-[#0A192F] px-6 py-4 flex items-center justify-between border-b border-amber-500/30 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {isRtl ? 'إدارة الهوية المؤسسية والشعار المركزي' : 'Corporate Identity & Central Branding Manager'}
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                  Super Admin
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {isRtl
                  ? 'تخصيص شعار وبيانات مركز جلف ساند للطباعة لتظهر تلقائياً في كامل شاشات ومطبوعات النظام'
                  : 'Customize Gulf Sand logo and office details to appear globally across all screens and prints'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl flex items-center gap-2 text-sm font-bold animate-in fade-in">
              <Check className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {!isSystemAdmin && (
            <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl flex items-start gap-3 text-xs animate-in fade-in">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">{isRtl ? 'وضع العرض فقط (غير مصرح بالرفع أو التعديل)' : 'Read-only Mode (Unauthorized to Modify)'}</p>
                <p className="mt-1 opacity-90">
                  {isRtl
                    ? 'فقط مدير النظام (System Admin) يمتلك الصلاحية لتعديل بيانات وشعار الهوية المؤسسية للمركز.'
                    : 'Only System Admin possesses the necessary privileges to manage corporate identity and logo.'}
                </p>
              </div>
            </div>
          )}

          {/* Section 1: Logo Management */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  {isRtl ? 'شعار المكتب الرسمي (المركزي)' : 'Official Central Office Logo'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isRtl
                    ? 'شعار جلف ساند الافتراضي معتمد بخمسة أشرطة رأسية. يمكنك رفع صورة مخصصة أو استخدام الشعار الأصلي.'
                    : 'Default Gulf Sand logo is styled with 5 vertical bars. You can upload a custom logo or keep default.'}
                </p>
              </div>

              {formData.logoUrl && (
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{isRtl ? 'استعادة الشعار الافتراضي' : 'Use Default Logo'}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              {/* Logo Preview Box */}
              <div className="bg-white border-2 border-dashed border-amber-300/80 rounded-xl p-4 flex flex-col items-center justify-center min-h-[140px] text-center shadow-xs">
                {formData.logoUrl ? (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src={formData.logoUrl}
                      alt="Uploaded Logo Preview"
                      className="max-h-24 max-w-full object-contain rounded-lg shadow-2xs border border-slate-200 p-1 bg-white"
                    />
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {isRtl ? 'شعار مخصص نشط' : 'Custom Logo Active'}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <GulfSandEmblem size="lg" />
                    <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {isRtl ? 'شعار جلف ساند المعتمد (الأشرطة الرأسية الخمسة)' : 'Standard Gulf Sand 5-Bar Emblem'}
                    </span>
                  </div>
                )}
              </div>

              {/* Upload Action */}
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                  id="logo-file-input"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 bg-[#0A192F] hover:bg-[#132847] text-white font-bold rounded-xl flex items-center justify-center gap-2 border border-amber-500/40 shadow-xs transition-all cursor-pointer text-xs"
                >
                  <Upload className="w-4 h-4 text-amber-300" />
                  <span>{isRtl ? 'رفع ملف شعار جديد (PNG, SVG, JPG)' : 'Upload New Logo Image (PNG, SVG, JPG)'}</span>
                </button>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {isRtl
                    ? 'يُفضل استخدام صورة شفافة عالية الدقة بنسبة عرض إلى ارتفاع متوازنة (حد أقصى 2MB). سيتم تطبيق الشعار فوراً في الفواتير وسندات القبض وكشوفات الحساب.'
                    : 'Recommended: High resolution transparent PNG/SVG. Will be applied immediately to Invoices, Receipts, and Reports.'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Live System Previews */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                {isRtl ? 'معاينة حية لتطبيق الشعار في المنظومة' : 'Live System Branding Previews'}
              </h3>
              <div className="flex gap-1.5 bg-slate-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setPreviewTab('header')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                    previewTab === 'header' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {isRtl ? 'شريط النظام العلوي' : 'ERP Top Header'}
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('print')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                    previewTab === 'print' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Printer className="w-3 h-3 text-amber-600" />
                    {isRtl ? 'ترويسة الطباعة الرسمية' : 'Official Print Header'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('login')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                    previewTab === 'login' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {isRtl ? 'شاشة تسجيل الدخول' : 'Login Screen'}
                </button>
              </div>
            </div>

            {/* Preview Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              {previewTab === 'header' && (
                <div className="bg-[#0A192F] p-3 rounded-xl flex items-center justify-between border border-amber-500/30 text-white shadow-xs">
                  <div className="flex items-center gap-3">
                    {formData.logoUrl ? (
                      <img
                        src={formData.logoUrl}
                        alt="Logo"
                        className="h-10 w-auto max-w-[100px] object-contain rounded bg-white p-0.5"
                      />
                    ) : (
                      <GulfSandEmblem size="md" />
                    )}
                    <div>
                      <div className="text-sm font-black text-white">{formData.companyNameAr}</div>
                      <div className="text-[10px] text-amber-300 font-bold tracking-wider uppercase">
                        {formData.companyNameEn}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-400/30">
                      {isRtl ? 'متصل - العين' : 'Online - Al Ain'}
                    </span>
                  </div>
                </div>
              )}

              {previewTab === 'print' && (
                <div className="bg-white p-4 rounded-xl border-2 border-slate-800 shadow-xs">
                  <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
                    <div className="text-right">
                      <h4 className="text-base font-black text-slate-950 font-serif leading-tight">
                        {formData.companyNameAr}
                      </h4>
                      <p className="text-[10px] text-amber-800 font-bold mt-0.5">{formData.taglineAr}</p>
                      <div className="text-[9px] text-slate-600 mt-1">
                        <span>رقم الرخصة: <b>{formData.licenseNumber}</b></span> | <span>TRN: <b>{formData.taxNumber}</b></span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center px-4">
                      {formData.logoUrl ? (
                        <img
                          src={formData.logoUrl}
                          alt="Logo"
                          className="h-12 w-auto max-w-[90px] object-contain"
                        />
                      ) : (
                        <GulfSandEmblem size="md" />
                      )}
                      <span className="text-[8px] font-black tracking-widest text-amber-700 uppercase mt-0.5">
                        AL AIN • العين
                      </span>
                    </div>

                    <div className="text-left">
                      <h5 className="text-sm font-black text-slate-950 uppercase leading-tight font-sans">
                        {formData.companyNameEn}
                      </h5>
                      <p className="text-[10px] text-slate-600 font-semibold mt-0.5">
                        Government Transactions & Business Services
                      </p>
                      <div className="text-[9px] text-slate-600 mt-1">
                        <span>Tel: <b>{formData.phone}</b></span> | <span>Mob: <b>{formData.mobileWhatsApp}</b></span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center py-2 text-xs font-bold text-slate-400 italic">
                    [ نموذج ترويسة الفواتير وسندات القبض وكشوفات الحساب الرسمية ]
                  </div>
                </div>
              )}

              {previewTab === 'login' && (
                <div className="bg-[#0A192F] p-6 rounded-xl flex flex-col items-center justify-center text-center max-w-sm mx-auto shadow-md border border-amber-500/30">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt="Logo"
                      className="h-14 w-auto max-w-[130px] object-contain rounded-lg bg-white p-1 mb-2"
                    />
                  ) : (
                    <GulfSandEmblem size="lg" className="mb-2" />
                  )}
                  <h4 className="text-base font-black text-white">{formData.companyNameAr}</h4>
                  <p className="text-xs text-amber-300 font-bold uppercase tracking-wider">{formData.companyNameEn}</p>
                  <p className="text-[10px] text-slate-400 mt-1">العين - العامرة شمال • Al Ain, UAE</p>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Office Information & Official Document Data */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              {isRtl ? 'بيانات المركز الرسمية والمطبوعات الحكومية' : 'Official Office & Government Print Data'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRtl ? 'اسم المنشأة الرسمي بالعربية' : 'Company Name (Arabic)'}
                </label>
                <input
                  type="text"
                  value={formData.companyNameAr}
                  onChange={(e) => setFormData({ ...formData, companyNameAr: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRtl ? 'اسم المنشأة الرسمي بالإنجليزية' : 'Company Name (English)'}
                </label>
                <input
                  type="text"
                  value={formData.companyNameEn}
                  onChange={(e) => setFormData({ ...formData, companyNameEn: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-bold font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRtl ? 'رقم الرخصة التجارية (العين)' : 'Trade License Number'}
                </label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRtl ? 'الرقم الضريبي TRN (الهيئة الاتحادية للضرائب)' : 'Tax Registration Number (TRN)'}
                </label>
                <input
                  type="text"
                  value={formData.taxNumber}
                  onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRtl ? 'الهاتف الثابت الرئيسي' : 'Primary Telephone'}
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRtl ? 'الهاتف الثابت الثانوي' : 'Secondary Telephone'}
                </label>
                <input
                  type="text"
                  value={formData.phoneSecondary || ''}
                  onChange={(e) => setFormData({ ...formData, phoneSecondary: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRtl ? 'رقم الواتساب الرئيسي' : 'Primary WhatsApp'}
                </label>
                <input
                  type="text"
                  value={formData.mobileWhatsApp}
                  onChange={(e) => setFormData({ ...formData, mobileWhatsApp: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRtl ? 'رقم الواتساب الثانوي' : 'Secondary WhatsApp'}
                </label>
                <input
                  type="text"
                  value={formData.whatsappSecondary || ''}
                  onChange={(e) => setFormData({ ...formData, whatsappSecondary: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRtl ? 'العنوان والموقع الجغرافي (العربية)' : 'Location & Address (Arabic)'}
                </label>
                <input
                  type="text"
                  value={formData.locationAr}
                  onChange={(e) => setFormData({ ...formData, locationAr: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Working Schedule, Weekly Holidays & Closures Exception Settings */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#D97706]" />
              {isRtl ? 'إعدادات أوقات الدوام الرسمي والعطلات الاستثنائية' : 'Official Working Hours & Holiday Settings'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRtl ? 'أوقات العمل الاعتيادية (بالعربية)' : 'Standard Operating Hours (Arabic)'}
                </label>
                <input
                  type="text"
                  value={formData.operatingHoursAr || ''}
                  onChange={(e) => setFormData({ ...formData, operatingHoursAr: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D97706]"
                  placeholder="مثال: السبت إلى الخميس: 8:00 صباحاً - 8:00 مساءً"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRtl ? 'أوقات العمل الاعتيادية (بالإنجليزية)' : 'Standard Operating Hours (English)'}
                </label>
                <input
                  type="text"
                  value={formData.operatingHoursEn || ''}
                  onChange={(e) => setFormData({ ...formData, operatingHoursEn: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D97706] font-sans"
                  placeholder="e.g. Saturday to Thursday: 8:00 AM - 8:00 PM"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRtl ? 'العطلة الأسبوعية الافتراضية' : 'Default Weekly Holiday'}
                </label>
                <select
                  value={formData.weeklyHolidayAr === 'الأحد' ? 'Sunday' : 'Saturday'}
                  onChange={(e) => {
                    const isSat = e.target.value === 'Saturday';
                    setFormData({
                      ...formData,
                      weeklyHolidayAr: isSat ? 'السبت' : 'الأحد',
                      weeklyHolidayEn: isSat ? 'Saturday' : 'Sunday',
                    });
                  }}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D97706]"
                >
                  <option value="Saturday">{isRtl ? 'السبت (الافتراضي للمركز)' : 'Saturday (Center Default)'}</option>
                  <option value="Sunday">{isRtl ? 'الأحد' : 'Sunday'}</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">
                  {isRtl
                    ? 'يوم السبت يعتبر يوم عطلة رسمية بالمركز وفق التعديلات الجديدة بشكل افتراضي.'
                    : 'Saturday is configured as the primary weekly holiday for Gulf Sand by default.'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isRtl ? 'تواريخ الإجازات السنوية والمغلفات' : 'Annual Closures & Leaves'}
                </label>
                <input
                  type="text"
                  value={formData.leaveDates || ''}
                  onChange={(e) => setFormData({ ...formData, leaveDates: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#D97706]"
                  placeholder="مثال: العيد الوطني الإماراتي، رأس السنة الميلادية"
                />
              </div>
            </div>

            {/* Dynamic Holiday Exceptions Section */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 mt-2 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900">
                  {isRtl ? 'قائمة الاستثناءات، الإجازات الطارئة والأيام البديلة' : 'Special Holidays, Closures & Working Day Exceptions'}
                </h4>
                {isSystemAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      const newExc = {
                        id: String(Date.now()),
                        date: new Date().toISOString().slice(0, 10),
                        labelAr: 'إجازة طارئة مخصصة',
                        labelEn: 'Special Holiday Exception',
                        type: 'holiday' as const
                      };
                      setFormData({
                        ...formData,
                        specialHolidaysExceptions: [...(formData.specialHolidaysExceptions || []), newExc]
                      });
                    }}
                    className="text-[10px] bg-amber-500 hover:bg-amber-600 text-white font-bold px-2 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    + {isRtl ? 'إضافة استثناء جديد' : 'Add New Exception'}
                  </button>
                )}
              </div>

              {(!formData.specialHolidaysExceptions || formData.specialHolidaysExceptions.length === 0) ? (
                <p className="text-xs text-slate-400 italic text-center py-2">
                  {isRtl ? 'لا توجد استثناءات مخصصة مضافة حالياً.' : 'No custom exceptions configured yet.'}
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {formData.specialHolidaysExceptions.map((exc, index) => (
                    <div key={exc.id || index} className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                      <input
                        type="date"
                        value={exc.date}
                        onChange={(e) => {
                          const updated = [...(formData.specialHolidaysExceptions || [])];
                          updated[index].date = e.target.value;
                          setFormData({ ...formData, specialHolidaysExceptions: updated });
                        }}
                        className="px-2 py-1 border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-mono text-[11px]"
                      />
                      <input
                        type="text"
                        value={exc.labelAr}
                        onChange={(e) => {
                          const updated = [...(formData.specialHolidaysExceptions || [])];
                          updated[index].labelAr = e.target.value;
                          setFormData({ ...formData, specialHolidaysExceptions: updated });
                        }}
                        placeholder="البيان بالعربية"
                        className="flex-1 min-w-[100px] px-2 py-1 border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                      />
                      <input
                        type="text"
                        value={exc.labelEn}
                        onChange={(e) => {
                          const updated = [...(formData.specialHolidaysExceptions || [])];
                          updated[index].labelEn = e.target.value;
                          setFormData({ ...formData, specialHolidaysExceptions: updated });
                        }}
                        placeholder="Description (En)"
                        className="flex-1 min-w-[100px] px-2 py-1 border border-slate-300 rounded-md focus:outline-hidden focus:ring-1 focus:ring-amber-500 font-sans text-[11px]"
                      />
                      <select
                        value={exc.type}
                        onChange={(e) => {
                          const updated = [...(formData.specialHolidaysExceptions || [])];
                          updated[index].type = e.target.value as 'holiday' | 'workday';
                          setFormData({ ...formData, specialHolidaysExceptions: updated });
                        }}
                        className="px-2 py-1 border border-slate-300 rounded-md bg-white text-[11px]"
                      >
                        <option value="holiday">{isRtl ? 'عطلة مغلقة' : 'Closed Holiday'}</option>
                        <option value="workday">{isRtl ? 'يوم عمل بديل' : 'Substitute Workday'}</option>
                      </select>

                      {isSystemAdmin && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = (formData.specialHolidaysExceptions || []).filter(item => item.id !== exc.id);
                            setFormData({ ...formData, specialHolidaysExceptions: updated });
                          }}
                          className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-all"
                          title={isRtl ? 'حذف هذا الاستثناء' : 'Remove Exception'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetAll}
            disabled={!isSystemAdmin}
            className={`px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl flex items-center gap-1.5 transition-colors ${!isSystemAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isRtl ? 'استعادة إعدادات جلف ساند الأصلية' : 'Reset All to Gulf Sand Defaults'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 bg-transparent rounded-xl transition-colors"
            >
              {isRtl ? 'إغلاق' : 'Close'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isSystemAdmin}
              className={`px-6 py-2.5 text-xs font-bold text-white bg-[#0A192F] hover:bg-[#132847] border border-amber-400/50 rounded-xl shadow-md flex items-center gap-2 transition-all ${!isSystemAdmin ? 'opacity-50 cursor-not-allowed animate-none' : ''}`}
            >
              <Check className="w-4 h-4 text-amber-300" />
              <span>{isRtl ? 'حفظ وتطبيق الشعار في النظام' : 'Save & Apply Globally'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
