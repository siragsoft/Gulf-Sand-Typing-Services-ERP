import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../db/database';
import {
  FileText,
  Printer,
  Download,
  Copy,
  Check,
  User,
  Building2,
  Calendar,
  Sparkles,
  Search,
  CheckCircle2,
  RefreshCw,
  Stamp,
  QrCode,
  ShieldCheck,
  ChevronRight,
  Save,
  Plus,
} from 'lucide-react';
import { UserRole } from '../types/schema';

export type DocTemplateId =
  | 'SALARY_CERTIFICATE'
  | 'NOC_CERTIFICATE'
  | 'TENANCY_UNDERTAKING'
  | 'MOHRE_LABOUR_OFFER'
  | 'PRO_AUTHORIZATION'
  | 'CONSULAR_TRANSLATION';

interface DocumentGeneratorProps {
  initialCustomer?: any;
  currentRole: UserRole;
  lang: 'ar' | 'en';
  onNavigateTab?: (tab: any) => void;
}

export const DocumentGenerator: React.FC<DocumentGeneratorProps> = ({
  initialCustomer,
  currentRole,
  lang,
  onNavigateTab,
}) => {
  const isAr = lang === 'ar';
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(initialCustomer?.id || '');
  const [selectedTemplate, setSelectedTemplate] = useState<DocTemplateId>('SALARY_CERTIFICATE');
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form Fields for the Template
  const [formData, setFormData] = useState({
    refNumber: `GS-DOC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    issueDate: new Date().toISOString().slice(0, 10),
    addressedTo: 'إلى من يهمه الأمر / To Whom It May Concern',
    customerNameAr: '',
    customerNameEn: '',
    nationality: 'سوداني / Sudanese',
    emiratesId: '784-1988-1234567-1',
    passportNumber: 'P01234567',
    companyNameAr: 'جلف ساند للطباعة والخدمات',
    companyNameEn: 'GULFSAND TYPING SERVICES',
    tradeLicenseNo: 'CN-2894510',
    jobTitleAr: 'موظف طباعة ومتابع إداري',
    jobTitleEn: 'Administrative Specialist',
    dateJoined: '2023-01-15',
    basicSalaryAED: 4000,
    housingAllowanceAED: 1500,
    transportAllowanceAED: 500,
    otherAllowanceAED: 500,
    nocPurpose: 'استخراج رخصة قيادة بدولة الإمارات العربية المتحدة (Driving License)',
    propertyPremiseNo: 'A1-402, Al Ain Business Center',
    tawtheeqNo: 'TWT-2026-9921',
    authorizedPersonName: 'بشار الحاج / Bashar Elhaj',
    authorizedPersonEID: '784-1985-7654321-9',
    authorizedAuthorities: 'الهيئة الاتحادية للهوية والجنسية (ICP)، وزارة الموارد البشرية والتوطين (تسهيل)، دائرة التنمية الاقتصادية (DED)، القنصلية العامة',
    sourceLanguage: 'العربية / Arabic',
    targetLanguage: 'الإنجليزية / English',
    documentTypeForTranslation: 'شهادة جامعية مصدقة / Degree Certificate',
    customNotes: 'صدرت هذه الشهادة بناءً على طلب المعني دون أدنى مسؤولية مالية أو قانونية تترتب على المركز.',
  });

  const loadCustomers = () => {
    setCustomers(db.getAll('customers'));
  };

  useEffect(() => {
    loadCustomers();
    const unsub = db.subscribe('customers', loadCustomers);
    return () => unsub();
  }, []);

  // Update Form Data when Customer is chosen
  useEffect(() => {
    if (initialCustomer) {
      setSelectedCustomerId(initialCustomer.id);
    }
  }, [initialCustomer]);

  useEffect(() => {
    if (selectedCustomerId) {
      const cust = customers.find((c) => c.id === selectedCustomerId);
      if (cust) {
        setFormData((prev) => ({
          ...prev,
          customerNameAr: cust.name_ar || prev.customerNameAr,
          customerNameEn: cust.name_en || prev.customerNameEn,
          emiratesId: cust.emirates_id || prev.emiratesId,
          passportNumber: cust.passport_number || prev.passportNumber,
          tradeLicenseNo: cust.trade_license_no || prev.tradeLicenseNo,
          jobTitleAr: cust.job_title_ar || prev.jobTitleAr,
          basicSalaryAED: Number(cust.basic_salary_aed) || prev.basicSalaryAED,
        }));
      }
    }
  }, [selectedCustomerId, customers]);

  const totalMonthlySalary =
    Number(formData.basicSalaryAED || 0) +
    Number(formData.housingAllowanceAED || 0) +
    Number(formData.transportAllowanceAED || 0) +
    Number(formData.otherAllowanceAED || 0);

  const templatesList = [
    {
      id: 'SALARY_CERTIFICATE',
      nameAr: 'شهادة راتب وإثبات عمل',
      nameEn: 'Salary Certificate & Employment Verification',
      badgeAr: 'الأكثر طلباً',
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'NOC_CERTIFICATE',
      nameAr: 'شهادة عدم ممانعة (NOC)',
      nameEn: 'No Objection Certificate (NOC)',
      badgeAr: 'رخصة / سفر',
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'TENANCY_UNDERTAKING',
      nameAr: 'إقرار وتعهد عقد إيجار وتوثيق',
      nameEn: 'Tenancy Contract Undertaking',
      badgeAr: 'بلدية وتوثيق',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'MOHRE_LABOUR_OFFER',
      nameAr: 'ملخص عرض عمل (تسهيل / وزارة العمل)',
      nameEn: 'MOHRE Labour Offer Contract Summary',
      badgeAr: 'تسهيل وإقامة',
      badgeColor: 'bg-purple-100 text-purple-800',
    },
    {
      id: 'PRO_AUTHORIZATION',
      nameAr: 'خطاب تفويض ومراجعة الدوائر الحكومية',
      nameEn: 'Government PRO Representation Letter',
      badgeAr: 'تفويض معقب',
      badgeColor: 'bg-indigo-100 text-indigo-800',
    },
    {
      id: 'CONSULAR_TRANSLATION',
      nameAr: 'طلب ترجمة قانونية وتصديق قنصلي',
      nameEn: 'Legal Translation & Consular Form',
      badgeAr: 'قنصلية وترجمة',
      badgeColor: 'bg-rose-100 text-rose-800',
    },
  ];

  // Print Document Trigger
  const handlePrint = () => {
    window.print();
  };

  // Copy Clean Text to Clipboard
  const handleCopyText = () => {
    const docElement = document.getElementById('printable-official-document');
    if (docElement) {
      navigator.clipboard.writeText(docElement.innerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Save to Customer Documents Database
  const handleSaveToCustomerDocs = () => {
    if (!selectedCustomerId) {
      alert(isAr ? 'يرجى اختيار العميل أولاً لربط المستند بملفه.' : 'Please select a customer first.');
      return;
    }

    try {
      const templateMeta = templatesList.find((t) => t.id === selectedTemplate);
      db.insert('documents', {
        customer_id: selectedCustomerId,
        customer_name_ar: formData.customerNameAr,
        title_ar: templateMeta?.nameAr || 'مستند صادر',
        title_en: templateMeta?.nameEn || 'Generated Document',
        document_type: templateMeta?.nameAr,
        document_number: formData.refNumber,
        issue_date: formData.issueDate,
        expiry_date: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10), // 3 months validity
        days_until_expiry: 90,
        status: 'ساري',
        notes: `تم إنشاء المستند تلقائياً عبر نظام قوالب جلف ساند - المرجع: ${formData.refNumber}`,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-xs shadow-indigo-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  {isAr ? 'منشئ النماذج والمستندات الذكية (Smart Document Generator)' : 'Smart Document Generator & CRM Templates'}
                </h2>
                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-full">
                  {isAr ? 'طباعة سريعة معتمدة' : 'Official UAE Ready'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {isAr
                  ? 'توليد خطابات عدم الممانعة، شهادات الراتب، عقود العمل، والإقرارات الرسمية ببيانات العميل من CRM بضغطة واحدة.'
                  : 'Auto-populate standard salary certs, NOCs, labour offers, and undertakings with CRM data.'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleCopyText}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ النص' : 'Copy Text')}</span>
          </button>

          <button
            onClick={handleSaveToCustomerDocs}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 border border-indigo-200 transition"
          >
            {savedSuccess ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Save className="w-3.5 h-3.5" />}
            <span>{savedSuccess ? (isAr ? 'تم الحفظ في المستندات!' : 'Saved to CRM!') : (isAr ? 'حفظ في ملف العميل' : 'Save to CRM')}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs shadow-indigo-200 transition active:scale-95 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{isAr ? 'طباعة رسمية / PDF' : 'Print / Export PDF'}</span>
          </button>
        </div>
      </div>

      {/* Two Column Layout: Editor Form (Left 5 cols) & Live Official Preview (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Editor Form & Template Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* 1. Template Selector Card */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <label className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>{isAr ? '1. اختر النموذج الحكومي / الإداري المطلوب:' : '1. Select Standard Document Template:'}</span>
            </label>

            <div className="space-y-1.5">
              {templatesList.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl.id as DocTemplateId)}
                  className={`w-full text-right p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                    selectedTemplate === tpl.id
                      ? 'bg-indigo-50/80 border-indigo-500 text-indigo-900 shadow-2xs'
                      : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="block">{isAr ? tpl.nameAr : tpl.nameEn}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{isAr ? tpl.nameEn : tpl.nameAr}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${tpl.badgeColor}`}>
                    {tpl.badgeAr}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Customer CRM Auto-Populator */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <label className="text-xs font-black text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600" />
                <span>{isAr ? '2. اختيار العميل للربط التلقائي من CRM:' : '2. Pull Customer Data from CRM:'}</span>
              </span>
              <span className="text-[10px] text-blue-600 font-bold">{customers.length} {isAr ? 'عميل مسجل' : 'clients'}</span>
            </label>

            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-xs text-slate-800 focus:bg-white focus:outline-none"
            >
              <option value="">{isAr ? '-- اختر عميلاً للتعبئة الفورية --' : '-- Select CRM Customer --'}</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_ar || c.name_en} ({c.emirates_id || c.passport_number || c.phone})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Editable Fields Accordion / Form */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
            <h3 className="font-black text-slate-800 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>{isAr ? '3. تخصيص وتعديل بيانات الوثيقة:' : '3. Customize Document Fields:'}</span>
              <span className="text-[10px] font-mono text-slate-400">REF: {formData.refNumber}</span>
            </h3>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">{isAr ? 'تاريخ الإصدار' : 'Issue Date'}</label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">{isAr ? 'رقم الإشارة / المرجع' : 'Ref #'}</label>
                  <input
                    type="text"
                    value={formData.refNumber}
                    onChange={(e) => setFormData({ ...formData, refNumber: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-600 block mb-1">{isAr ? 'الجهة الموجه إليها الخطاب' : 'Addressed To'}</label>
                <input
                  type="text"
                  value={formData.addressedTo}
                  onChange={(e) => setFormData({ ...formData, addressedTo: e.target.value })}
                  placeholder="إلى من يهمه الأمر / مصرف أبوظبي الإسلامي / إدارة المرور"
                  className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">{isAr ? 'اسم العميل (عربي)' : 'Name (Arabic)'}</label>
                  <input
                    type="text"
                    value={formData.customerNameAr}
                    onChange={(e) => setFormData({ ...formData, customerNameAr: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">{isAr ? 'الاسم بالإنجليزية' : 'Name (English)'}</label>
                  <input
                    type="text"
                    value={formData.customerNameEn}
                    onChange={(e) => setFormData({ ...formData, customerNameEn: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-600 block mb-1">{isAr ? 'الهوية الإماراتية' : 'Emirates ID'}</label>
                  <input
                    type="text"
                    value={formData.emiratesId}
                    onChange={(e) => setFormData({ ...formData, emiratesId: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-600 block mb-1">{isAr ? 'رقم جواز السفر' : 'Passport No'}</label>
                  <input
                    type="text"
                    value={formData.passportNumber}
                    onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50 font-mono"
                  />
                </div>
              </div>

              {/* Template Specific Inputs */}
              {selectedTemplate === 'SALARY_CERTIFICATE' && (
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 space-y-2">
                  <span className="font-bold text-blue-900 block pb-1 border-b border-blue-100">
                    {isAr ? 'تفاصيل الراتب والمهنة:' : 'Salary Breakdown:'}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-medium text-slate-600 block mb-1">{isAr ? 'المسمى الوظيفي' : 'Job Title'}</label>
                      <input
                        type="text"
                        value={formData.jobTitleAr}
                        onChange={(e) => setFormData({ ...formData, jobTitleAr: e.target.value })}
                        className="w-full p-1.5 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-medium text-slate-600 block mb-1">{isAr ? 'تاريخ التعيين' : 'Date Joined'}</label>
                      <input
                        type="date"
                        value={formData.dateJoined}
                        onChange={(e) => setFormData({ ...formData, dateJoined: e.target.value })}
                        className="w-full p-1.5 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div>
                      <label className="font-medium text-slate-600 block mb-1">{isAr ? 'الأساسي (د.إ)' : 'Basic'}</label>
                      <input
                        type="number"
                        value={formData.basicSalaryAED}
                        onChange={(e) => setFormData({ ...formData, basicSalaryAED: Number(e.target.value) })}
                        className="w-full p-1.5 rounded-lg border border-slate-200 bg-white font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-medium text-slate-600 block mb-1">{isAr ? 'السكن' : 'Housing'}</label>
                      <input
                        type="number"
                        value={formData.housingAllowanceAED}
                        onChange={(e) => setFormData({ ...formData, housingAllowanceAED: Number(e.target.value) })}
                        className="w-full p-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="font-medium text-slate-600 block mb-1">{isAr ? 'المواصلات' : 'Transport'}</label>
                      <input
                        type="number"
                        value={formData.transportAllowanceAED}
                        onChange={(e) => setFormData({ ...formData, transportAllowanceAED: Number(e.target.value) })}
                        className="w-full p-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedTemplate === 'NOC_CERTIFICATE' && (
                <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 space-y-2">
                  <label className="font-bold text-emerald-900 block">{isAr ? 'الغرض من شهادة عدم الممانعة:' : 'NOC Purpose:'}</label>
                  <input
                    type="text"
                    value={formData.nocPurpose}
                    onChange={(e) => setFormData({ ...formData, nocPurpose: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white font-medium"
                  />
                </div>
              )}

              {selectedTemplate === 'TENANCY_UNDERTAKING' && (
                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-medium text-slate-700 block mb-1">{isAr ? 'رقم العقار / الشقة' : 'Premise / Unit #'}</label>
                      <input
                        type="text"
                        value={formData.propertyPremiseNo}
                        onChange={(e) => setFormData({ ...formData, propertyPremiseNo: e.target.value })}
                        className="w-full p-1.5 rounded-lg border border-slate-200 bg-white"
                      />
                    </div>
                    <div>
                      <label className="font-medium text-slate-700 block mb-1">{isAr ? 'رقم توثيق' : 'Tawtheeq #'}</label>
                      <input
                        type="text"
                        value={formData.tawtheeqNo}
                        onChange={(e) => setFormData({ ...formData, tawtheeqNo: e.target.value })}
                        className="w-full p-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Official Printable Document Preview (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-slate-100/70 p-3 sm:p-5 rounded-2xl border border-slate-200 shadow-inner sticky top-4">
            <div className="text-center pb-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? 'معاينة المستند الرسمي للطباعة (Official Document Preview)' : 'Official Document Preview'}</span>
            </div>

            {/* THE ACTUAL PRINTABLE A4 CONTAINER */}
            <div
              id="printable-official-document"
              className="bg-white rounded-xl shadow-lg border border-slate-300 p-8 sm:p-10 space-y-6 text-slate-900 relative overflow-hidden"
              style={{ minHeight: '680px' }}
            >
              {/* Background Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
                <span className="text-7xl font-black rotate-[-35deg] text-slate-900 tracking-widest">
                  GULF SAND
                </span>
              </div>

              {/* Official Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex items-center justify-between gap-4">
                <div className="text-right space-y-0.5">
                  <h1 className="text-base sm:text-lg font-black text-slate-950">
                    جلف ساند للطباعة والخدمات
                  </h1>
                  <p className="text-[10px] text-slate-600 font-semibold">
                    خدمات رجال الأعمال • الهوية والجنسية • تسهيل • بلدية العين
                  </p>
                  <p className="text-[9px] text-slate-500 font-mono">
                    رخصة رقم: CN-2894510 • فرع العين، أبوظبي
                  </p>
                </div>

                {/* Central Emblem Simulation */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-2 border-slate-900 flex items-center justify-center p-1 font-black text-xs text-center leading-none">
                    GULF SAND
                  </div>
                </div>

                <div className="text-left space-y-0.5" dir="ltr">
                  <h2 className="text-xs sm:text-sm font-black text-slate-950">
                    Gulf Sand Typing & Services
                  </h2>
                  <p className="text-[10px] text-slate-600 font-semibold">
                    PRO & Corporate Typing Services
                  </p>
                  <p className="text-[9px] text-slate-500 font-mono">
                    Al Ain, Abu Dhabi, UAE
                  </p>
                </div>
              </div>

              {/* Reference & Date Bar */}
              <div className="flex items-center justify-between text-xs text-slate-600 font-medium pt-1">
                <div>
                  <span>الرقم المرجعي / Ref: </span>
                  <b className="font-mono text-slate-900">{formData.refNumber}</b>
                </div>
                <div>
                  <span>التاريخ / Date: </span>
                  <b className="font-mono text-slate-900">{formData.issueDate}</b>
                </div>
              </div>

              {/* Addressed To */}
              <div className="pt-2">
                <p className="text-xs font-bold text-slate-800">
                  السادة / <span className="underline decoration-slate-400 font-black">{formData.addressedTo}</span> المحترمين
                </p>
                <p className="text-xs text-slate-600 font-semibold pt-1">
                  تحية طيبة وبعد،،،
                </p>
              </div>

              {/* Document Title Header */}
              <div className="text-center py-2 bg-slate-50 rounded-lg border border-slate-200">
                <h3 className="text-sm sm:text-base font-black text-slate-950 uppercase tracking-wide">
                  {templatesList.find((t) => t.id === selectedTemplate)?.nameAr}
                </h3>
                <p className="text-[10px] text-slate-500 font-medium">
                  {templatesList.find((t) => t.id === selectedTemplate)?.nameEn}
                </p>
              </div>

              {/* DYNAMIC TEMPLATE CONTENT BODY */}
              <div className="text-xs sm:text-sm leading-relaxed text-slate-800 space-y-4 pt-1">
                {/* 1. SALARY CERTIFICATE BODY */}
                {selectedTemplate === 'SALARY_CERTIFICATE' && (
                  <>
                    <p className="text-justify leading-relaxed">
                      يفيد <b>جلف ساند للطباعة والخدمات</b> بأن السيد/السيدة:{' '}
                      <b className="text-slate-950 font-black text-sm">{formData.customerNameAr || '...................'}</b> (
                      <span className="font-sans font-semibold">{formData.customerNameEn}</span>)، يحمل جنسية (
                      <b>{formData.nationality}</b>) وبطاقة هوية إماراتية رقم (
                      <b className="font-mono">{formData.emiratesId}</b>) وجواز سفر رقم (
                      <b className="font-mono">{formData.passportNumber}</b>)، يعمل لدينا بمهنة (
                      <b>{formData.jobTitleAr}</b>) منذ تاريخ <b>{formData.dateJoined}</b> وما زال على رأس عمله حتى تاريخه.
                    </p>

                    {/* Salary Breakdown Table */}
                    <div className="border border-slate-300 rounded-lg overflow-hidden my-3">
                      <table className="w-full text-center text-xs">
                        <thead className="bg-slate-100 font-bold border-b border-slate-300">
                          <tr>
                            <th className="p-2 border-l border-slate-300">الراتب الأساسي</th>
                            <th className="p-2 border-l border-slate-300">بدل السكن</th>
                            <th className="p-2 border-l border-slate-300">بدل الانتقال</th>
                            <th className="p-2 bg-slate-200">إجمالي الراتب الشهري</th>
                          </tr>
                        </thead>
                        <tbody className="font-mono font-bold">
                          <tr>
                            <td className="p-2.5 border-l border-slate-200">{Number(formData.basicSalaryAED).toLocaleString()} د.إ</td>
                            <td className="p-2.5 border-l border-slate-200">{Number(formData.housingAllowanceAED).toLocaleString()} د.إ</td>
                            <td className="p-2.5 border-l border-slate-200">{Number(formData.transportAllowanceAED).toLocaleString()} د.إ</td>
                            <td className="p-2.5 bg-slate-50 text-slate-950 text-sm font-black">{totalMonthlySalary.toLocaleString()} درهم إماراتي</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <p className="text-justify text-xs text-slate-600 leading-normal">
                      وقد أُعطيت له هذه الشهادة بناءً على طلبه لتقديمها إلى الجهات المعنية دون أدنى مسؤولية مالية أو التزام على المركز تجاه الغير.
                    </p>
                  </>
                )}

                {/* 2. NOC CERTIFICATE BODY */}
                {selectedTemplate === 'NOC_CERTIFICATE' && (
                  <>
                    <p className="text-justify leading-relaxed">
                      نفيدكم نحن <b>{formData.companyNameAr}</b>، بأنه لا مانع لدينا من قيام مكفولنا السيد/السيدة:{' '}
                      <b className="text-slate-950 font-black text-sm">{formData.customerNameAr || '...................'}</b>،
                      الحامل للهوية الإماراتية رقم (<b className="font-mono">{formData.emiratesId}</b>) وجواز سفر رقم (
                      <b className="font-mono">{formData.passportNumber}</b>)، بالقيام بالإجراء التالي:
                    </p>

                    <div className="p-3 bg-emerald-50/60 rounded-lg border border-emerald-200 text-center font-black text-emerald-950 text-sm">
                      {formData.nocPurpose}
                    </div>

                    <p className="text-justify text-xs text-slate-600">
                      وليس لدينا أي اعتراض أو ممانعة قانونية أو إدارية على السير في المعاملة لدى دائرتكم الموقرة.
                    </p>
                  </>
                )}

                {/* 3. TENANCY UNDERTAKING BODY */}
                {selectedTemplate === 'TENANCY_UNDERTAKING' && (
                  <>
                    <p className="text-justify leading-relaxed">
                      أقر أنا الموقع أدناه / <b>{formData.customerNameAr}</b>، الحامل للهوية رقم (
                      <b className="font-mono">{formData.emiratesId}</b>)، بصفتي المستأجر للعين المؤجرة رقم (
                      <b>{formData.propertyPremiseNo}</b>) بموجب عقد الإيجار الموثق رقم (
                      <b className="font-mono">{formData.tawtheeqNo}</b>)، بالتزامي بكافة شروط السكن واستخدام العقار للأغراض المحددة قانوناً في إمارة أبوظبي (العين).
                    </p>
                  </>
                )}

                {/* 4. MOHRE LABOUR OFFER BODY */}
                {selectedTemplate === 'MOHRE_LABOUR_OFFER' && (
                  <>
                    <p className="text-justify leading-relaxed">
                      يسر <b>{formData.companyNameAr}</b> أن تقدم عرض العمل الرسمي للسيد/{' '}
                      <b>{formData.customerNameAr}</b> لوظيفة <b>{formData.jobTitleAr}</b> بإجمالي راتب شهري قدره (
                      <b>{totalMonthlySalary.toLocaleString()} درهم</b>)، شاملاً التأمين الصحي والتذاكر السنوية وفقاً لقانون العمل الاتحادي لدولة الإمارات العربية المتحدة.
                    </p>
                  </>
                )}

                {/* 5. PRO AUTHORIZATION BODY */}
                {selectedTemplate === 'PRO_AUTHORIZATION' && (
                  <>
                    <p className="text-justify leading-relaxed">
                      نفوض بموجب هذا الخطاب السيد / <b>{formData.authorizedPersonName}</b>، حامل الهوية الإماراتية رقم (
                      <b className="font-mono">{formData.authorizedPersonEID}</b>)، في تمثيل الشركة ومراجعة الدوائر الحكومية:{' '}
                      <b>{formData.authorizedAuthorities}</b>، واستلام وتسليم المعاملات والتوقيع نيابة عنا.
                    </p>
                  </>
                )}

                {/* 6. CONSULAR TRANSLATION REQUEST */}
                {selectedTemplate === 'CONSULAR_TRANSLATION' && (
                  <>
                    <p className="text-justify leading-relaxed">
                      طلب ترجمة قانونية وتصديق قنصلي معتمد لمستند: <b>{formData.documentTypeForTranslation}</b> من اللغة (
                      <b>{formData.sourceLanguage}</b>) إلى اللغة (<b>{formData.targetLanguage}</b>) لصالح العميل/ <b>{formData.customerNameAr}</b>.
                    </p>
                  </>
                )}
              </div>

              {/* Official Signature, QR Seal, and Stamp Area */}
              <div className="pt-8 mt-6 border-t border-slate-200 flex items-end justify-between text-xs">
                {/* QR Code Verification Simulation */}
                <div className="space-y-1 text-center">
                  <div className="w-16 h-16 border border-slate-300 rounded p-1 bg-slate-50 mx-auto flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-slate-800" />
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 block">
                    VERIFIED E-SEAL
                  </span>
                </div>

                {/* Official Stamp Watermark */}
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-indigo-700/60 flex flex-col items-center justify-center text-center p-1 text-indigo-900/80 rotate-[-12deg]">
                  <Stamp className="w-5 h-5 mb-0.5 text-indigo-700" />
                  <span className="text-[8px] font-black uppercase leading-tight">جلف ساند للطباعة والخدمات</span>
                  <span className="text-[7px] font-mono">AL AIN BRANCH</span>
                </div>

                {/* Signature Box */}
                <div className="text-center space-y-1 min-w-[130px]">
                  <span className="text-[11px] font-bold text-slate-700 block">الإدارة العامة والاعتماد</span>
                  <div className="h-10 border-b border-slate-400 border-dashed flex items-end justify-center pb-1">
                    <span className="font-serif italic text-sm text-slate-800">Bashar Elhaj</span>
                  </div>
                  <span className="text-[10px] text-slate-500 block">الختم والتوقيع الرسمي</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
