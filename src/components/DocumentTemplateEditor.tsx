import React, { useState, useEffect } from 'react';
import {
  FileText,
  Save,
  RotateCcw,
  Eye,
  CheckCircle2,
  AlertTriangle,
  History,
  Sparkles,
  ShieldCheck,
  QrCode,
  Building,
  Info,
  ChevronRight,
  ArrowRight,
  Layers,
} from 'lucide-react';
import {
  DocumentTemplateRecord,
  DocumentTemplateType,
  DocumentTemplateVersionRecord,
  UserRole,
} from '../types/schema';
import {
  getActiveDocumentTemplate,
  saveDocumentTemplate,
  getTemplateVersions,
  restoreDocumentTemplateVersion,
  TEMPLATE_VARIABLES,
} from '../utils/templateManager';
import { previewDocumentTemplatePDF } from '../utils/pdfGenerator';
import { db } from '../db/database';

interface DocumentTemplateEditorProps {
  currentUser: {
    id: string;
    role: UserRole;
    name: string;
    email: string;
  };
  onClose?: () => void;
}

const DOCUMENT_TYPES: { type: DocumentTemplateType; labelAr: string; labelEn: string; icon: string }[] = [
  { type: 'TRANSACTION_RECEIPT', labelAr: 'إيصال المعاملة الضريبي', labelEn: 'Tax Transaction Receipt', icon: '🧾' },
  { type: 'INVOICE', labelAr: 'الفاتورة الضريبية', labelEn: 'Tax Invoice', icon: '📋' },
  { type: 'QUOTATION', labelAr: 'عرض الأسعار', labelEn: 'Price Quotation', icon: '💼' },
  { type: 'BOOKING_CONFIRMATION', labelAr: 'تأكيد حجز الموعد', labelEn: 'Booking Confirmation Pass', icon: '🎟️' },
  { type: 'PAYMENT_RECEIPT', labelAr: 'سند القبض والتحصيل', labelEn: 'Official Payment Receipt', icon: '💰' },
  { type: 'CUSTOMER_STATEMENT', labelAr: 'كشف حساب العميل', labelEn: 'Customer Dossier & Statement', icon: '📊' },
];

export const DocumentTemplateEditor: React.FC<DocumentTemplateEditorProps> = ({ currentUser, onClose }) => {
  const isAuthorized = currentUser.role === UserRole.SYSTEM_ADMIN || currentUser.role === UserRole.MANAGER;

  const [selectedType, setSelectedType] = useState<DocumentTemplateType>('TRANSACTION_RECEIPT');
  const [activeTab, setActiveTab] = useState<'titles' | 'terms' | 'company' | 'qr' | 'history'>('titles');
  const [template, setTemplate] = useState<DocumentTemplateRecord | null>(null);
  const [versions, setVersions] = useState<DocumentTemplateVersionRecord[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeInputFocus, setActiveInputFocus] = useState<string | null>(null);

  // Load template whenever selected document type changes
  useEffect(() => {
    loadTemplate(selectedType);
  }, [selectedType]);

  const loadTemplate = (docType: DocumentTemplateType) => {
    const tpl = getActiveDocumentTemplate(docType);
    setTemplate(tpl);
    if (tpl.id) {
      const vList = getTemplateVersions(tpl.id);
      setVersions(vList);
    }
  };

  const handleFieldChange = (field: keyof DocumentTemplateRecord, value: any) => {
    if (!template) return;
    setTemplate({
      ...template,
      [field]: value,
    });
  };

  const insertVariable = (varKey: string) => {
    if (!template) return;

    // If focused on a specific text area, append or insert into active tab's primary field
    if (activeTab === 'terms') {
      const current = template.terms_conditions_ar || '';
      handleFieldChange('terms_conditions_ar', `${current} ${varKey}`);
    } else if (activeTab === 'titles') {
      const current = template.title_ar || '';
      handleFieldChange('title_ar', `${current} ${varKey}`);
    } else if (activeTab === 'qr') {
      const current = template.footer_text_ar || '';
      handleFieldChange('footer_text_ar', `${current} ${varKey}`);
    }

    setFeedback({
      type: 'success',
      message: `تم إدراج المتغير ${varKey} بنجاح`,
    });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSave = () => {
    if (!template) return;
    setIsSaving(true);
    setFeedback(null);

    try {
      const result = saveDocumentTemplate(template, currentUser);
      if (result.success && result.template) {
        setTemplate(result.template);
        const vList = getTemplateVersions(result.template.id);
        setVersions(vList);
        setFeedback({ type: 'success', message: result.message });
      } else {
        setFeedback({ type: 'error', message: result.message });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'حدث خطأ أثناء حفظ القالب' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleRestoreVersion = (versionId: string) => {
    if (!template) return;
    if (!window.confirm('هل أنت متأكد من استرجاع هذا الإصدار السابق؟ سيتم تعيينه كإصدار نشط فوري.')) return;

    const result = restoreDocumentTemplateVersion(versionId, currentUser);
    if (result.success && result.template) {
      setTemplate(result.template);
      const vList = getTemplateVersions(result.template.id);
      setVersions(vList);
      setFeedback({ type: 'success', message: result.message });
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  const handlePreviewPDF = async () => {
    if (!template) return;
    try {
      await previewDocumentTemplatePDF(template);
      setFeedback({ type: 'success', message: 'تم إنشاء وتنزيل ملف المعاينة التجريبي PDF بنجاح' });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', message: 'فشل إنشاء ملف معاينة الـ PDF' });
    }
  };

  if (!isAuthorized) {
    return (
      <div className="p-8 max-w-4xl mx-auto" dir="rtl">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center shadow-sm">
          <AlertTriangle className="w-12 h-12 text-amber-600 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">صلاحية محصورة بالمديرين</h2>
          <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto">
            عذراً، إدارة قوالب المستندات ونصوص الطباعة الرسمية مخصصة حصراً لمدير النظام والمدير التنفيذي لضمان دقة
            البيانات الرسمية والامتثال القانوني.
          </p>
        </div>
      </div>
    );
  }

  if (!template) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" dir="rtl">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 shadow-inner">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-slate-900">إدارة قوالب المستندات الرسمية</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                إصدار v{template.version || 1}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> القالب النشط المعتمد
              </span>
            </div>
            <p className="text-slate-500 text-sm mt-1">
              تحكم كامل في النصوص والترجمات والشروط والأحكام ورمز التحقق (QR) لكافة المستندات المصدرة بصيغة PDF.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            id="btn-preview-template-pdf"
            onClick={handlePreviewPDF}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition-all shadow-sm"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>معاينة PDF</span>
          </button>
          <button
            id="btn-save-template"
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'جارٍ الحفظ...' : 'حفظ وترقية الإصدار'}</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 border text-sm font-medium transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Document Types Selector Bar */}
      <div className="bg-slate-100/80 p-1.5 rounded-2xl flex flex-wrap gap-1 border border-slate-200/80">
        {DOCUMENT_TYPES.map((dt) => {
          const isSelected = selectedType === dt.type;
          return (
            <button
              key={dt.type}
              id={`tab-doc-type-${dt.type}`}
              onClick={() => setSelectedType(dt.type)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                isSelected
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>{dt.icon}</span>
              <span>{dt.labelAr}</span>
            </button>
          );
        })}
      </div>

      {/* Variable Insertion Toolbar */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-4 text-white shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold tracking-wide text-amber-300">شريط المتغيرات الديناميكية (Smart Variables)</span>
          </div>
          <span className="text-[11px] text-slate-300">اضغط على أي متغير لإدراجه تلقائياً داخل النص</span>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {TEMPLATE_VARIABLES.map((v) => (
            <button
              key={v.key}
              type="button"
              id={`btn-var-${v.key.replace(/[{}]/g, '')}`}
              onClick={() => insertVariable(v.key)}
              title={`${v.nameAr} - مثال: ${v.example}`}
              className="px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-indigo-600/90 border border-slate-700 text-slate-200 hover:text-white text-xs font-mono transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <span className="text-amber-400 font-bold">+</span>
              <span>{v.key}</span>
              <span className="text-[10px] text-slate-400 font-sans">({v.nameAr})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Editor Main Content */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 overflow-x-auto">
          <button
            id="tab-edit-titles"
            onClick={() => setActiveTab('titles')}
            className={`px-5 py-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'titles'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>العناوين والترويسة (Titles & Header)</span>
          </button>
          <button
            id="tab-edit-terms"
            onClick={() => setActiveTab('terms')}
            className={`px-5 py-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'terms'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>الشروط والإخلاء (Terms & Disclaimer)</span>
          </button>
          <button
            id="tab-edit-company"
            onClick={() => setActiveTab('company')}
            className={`px-5 py-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'company'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>بيانات المركز والاتصال (Center Info)</span>
          </button>
          <button
            id="tab-edit-qr"
            onClick={() => setActiveTab('qr')}
            className={`px-5 py-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'qr'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>رمز التحقق والتذييل (QR & Footer)</span>
          </button>
          <button
            id="tab-edit-history"
            onClick={() => setActiveTab('history')}
            className={`px-5 py-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === 'history'
                ? 'border-indigo-600 text-indigo-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>أرشيف الإصدارات ({versions.length})</span>
          </button>
        </div>

        {/* Tab 1: Titles & Header */}
        {activeTab === 'titles' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">اسم القالب الإداري (بالعربية)</label>
                <input
                  type="text"
                  value={template.name_ar || ''}
                  onChange={(e) => handleFieldChange('name_ar', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="مثال: قالب الإيصال الضريبي المعتمد"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Template Name (English)</label>
                <input
                  type="text"
                  value={template.name_en || ''}
                  onChange={(e) => handleFieldChange('name_en', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-left"
                  dir="ltr"
                  placeholder="e.g. Official Tax Receipt Template"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">عنوان المستند الرئيسي (بالعربية)</label>
                <input
                  type="text"
                  value={template.title_ar || ''}
                  onChange={(e) => handleFieldChange('title_ar', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="مثال: إيصال استلام واستحقاق ضريبي"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Document Title (English)</label>
                <input
                  type="text"
                  value={template.title_en || ''}
                  onChange={(e) => handleFieldChange('title_en', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-left"
                  dir="ltr"
                  placeholder="e.g. TAX RECEIPT VOUCHER"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">نص الترويسة الرئيسية (بالعربية)</label>
                <input
                  type="text"
                  value={template.header_text_ar || ''}
                  onChange={(e) => handleFieldChange('header_text_ar', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="مثال: خدمات جلف ساند للطباعة والترجمة القانونية"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Header Main Text (English)</label>
                <input
                  type="text"
                  value={template.header_text_en || ''}
                  onChange={(e) => handleFieldChange('header_text_en', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-left"
                  dir="ltr"
                  placeholder="e.g. GULFSAND TYPING & TRANSLATION SERVICES"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">الترويسة الفرعية وسجل الترخيص (بالعربية)</label>
                <textarea
                  rows={3}
                  value={template.subheader_text_ar || ''}
                  onChange={(e) => handleFieldChange('subheader_text_ar', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="رخصة تجارية: CN-1294821 | الرقم الضريبي (TRN): 100482910400003"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Subheader & License (English)</label>
                <textarea
                  rows={3}
                  value={template.subheader_text_en || ''}
                  onChange={(e) => handleFieldChange('subheader_text_en', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-left"
                  dir="ltr"
                  placeholder="Trade License: CN-1294821 | TRN: 100482910400003 | Al Ain, UAE"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Terms & Disclaimer */}
        {activeTab === 'terms' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">الشروط والأحكام الرسمية (بالعربية)</label>
                <textarea
                  rows={5}
                  value={template.terms_conditions_ar || ''}
                  onChange={(e) => handleFieldChange('terms_conditions_ar', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
                  placeholder="1. يرجى التأكد التام من مطابقة الأسماء وأرقام الجوازات..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Terms & Conditions (English)</label>
                <textarea
                  rows={5}
                  value={template.terms_conditions_en || ''}
                  onChange={(e) => handleFieldChange('terms_conditions_en', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed text-left"
                  dir="ltr"
                  placeholder="1. Please review typed names, passport numbers and Emirates IDs..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">إخلاء المسؤولية القانوني (بالعربية)</label>
                <textarea
                  rows={3}
                  value={template.disclaimer_ar || ''}
                  onChange={(e) => handleFieldChange('disclaimer_ar', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
                  placeholder="الرسوم الحكومية غير قابلة للاسترداد نهائياً بعد تقديمها..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Legal Disclaimer (English)</label>
                <textarea
                  rows={3}
                  value={template.disclaimer_en || ''}
                  onChange={(e) => handleFieldChange('disclaimer_en', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed text-left"
                  dir="ltr"
                  placeholder="Government fees are strictly non-refundable once processed..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">تعليمات وإرشادات العميل (بالعربية)</label>
                <textarea
                  rows={3}
                  value={template.customer_instructions_ar || ''}
                  onChange={(e) => handleFieldChange('customer_instructions_ar', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
                  placeholder="امسح رمز الاستجابة السريعة (QR) للتحقق المباشر من صحة الإيصال..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Customer Instructions (English)</label>
                <textarea
                  rows={3}
                  value={template.customer_instructions_en || ''}
                  onChange={(e) => handleFieldChange('customer_instructions_en', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed text-left"
                  dir="ltr"
                  placeholder="Scan the QR code with your phone camera to verify authenticity..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Center & Contact Info */}
        {activeTab === 'company' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">اسم المركز الرسمي (بالعربية)</label>
                <input
                  type="text"
                  value={template.company_name_ar || ''}
                  onChange={(e) => handleFieldChange('company_name_ar', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Company Name (English)</label>
                <input
                  type="text"
                  value={template.company_name_en || ''}
                  onChange={(e) => handleFieldChange('company_name_en', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-left"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">العنوان والموقع (بالعربية)</label>
                <input
                  type="text"
                  value={template.company_address_ar || ''}
                  onChange={(e) => handleFieldChange('company_address_ar', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Address & Location (English)</label>
                <input
                  type="text"
                  value={template.company_address_en || ''}
                  onChange={(e) => handleFieldChange('company_address_en', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-left"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">الهاتف الرئيسي</label>
                <input
                  type="text"
                  value={template.phone_primary || ''}
                  onChange={(e) => handleFieldChange('phone_primary', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-left"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">هاتف الواتساب / المتابعة</label>
                <input
                  type="text"
                  value={template.phone_secondary || ''}
                  onChange={(e) => handleFieldChange('phone_secondary', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-left"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">البريد الإلكتروني المعتمد</label>
                <input
                  type="email"
                  value={template.email_official || ''}
                  onChange={(e) => handleFieldChange('email_official', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-left"
                  dir="ltr"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: QR & Footer */}
        {activeTab === 'qr' && (
          <div className="p-6 space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">إظهار رمز الاستجابة السريعة (QR Code) على المستند</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  يربط المستند تلقائياً بصفحة التحقق الإلكترونية المشفرة لضمان صحة الإيصال ومنع التزوير.
                </p>
              </div>
              <input
                type="checkbox"
                checked={template.show_qr !== false}
                onChange={(e) => handleFieldChange('show_qr', e.target.checked)}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">تسمية رمز التحقق (بالعربية)</label>
                <input
                  type="text"
                  value={template.qr_label_ar || ''}
                  onChange={(e) => handleFieldChange('qr_label_ar', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="امسح الرمز للتحقق من صحة الإيصال"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">QR Verification Label (English)</label>
                <input
                  type="text"
                  value={template.qr_label_en || ''}
                  onChange={(e) => handleFieldChange('qr_label_en', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-left"
                  dir="ltr"
                  placeholder="Scan to verify receipt authenticity"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">تذييل الصفحة (Footer Text AR)</label>
                <textarea
                  rows={3}
                  value={template.footer_text_ar || ''}
                  onChange={(e) => handleFieldChange('footer_text_ar', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="تم إصدار هذا المستند إلكترونياً عبر منظومة جلف ساند السحابية..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Footer Text (English)</label>
                <textarea
                  rows={3}
                  value={template.footer_text_en || ''}
                  onChange={(e) => handleFieldChange('footer_text_en', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none text-left"
                  dir="ltr"
                  placeholder="Electronically generated via Gulfsand ERP Cloud..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Version History & Recovery */}
        {activeTab === 'history' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">أرشيف الإصدارات السابقة لهذا القالب</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  يحتفظ النظام بنسخة تلقائية كاملة عند كل تعديل مع إمكانية الاسترجاع الفوري بضغطة زر واحدة.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500">إجمالي الإصدارات المحفوظة: {versions.length}</span>
            </div>

            {versions.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500 text-sm">
                لا توجد إصدارات سابقة مؤرشفة حتى الآن. عند حفظ أي تعديل جديد، سيتم أرشفة الإصدار الحالي تلقائياً هنا.
              </div>
            ) : (
              <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
                {versions.map((ver) => (
                  <div key={ver.id} className="p-4 bg-white hover:bg-slate-50/80 flex items-center justify-between gap-4 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                        v{ver.version_number}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{ver.change_summary_ar}</div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          تاريخ الأرشفة: {ver.created_at ? ver.created_at.slice(0, 19).replace('T', ' ') : 'N/A'} | بواسطة: {ver.created_by_name || 'المدير'}
                        </div>
                      </div>
                    </div>

                    <button
                      id={`btn-restore-ver-${ver.version_number}`}
                      onClick={() => handleRestoreVersion(ver.id)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>استرجاع هذا الإصدار</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
