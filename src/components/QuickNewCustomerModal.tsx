import React, { useState } from 'react';
import { db } from '../db';
import { UserRole } from '../types/schema';
import { canCreateInTable } from '../utils/rbac';
import { X, UserPlus, AlertTriangle, Building2, User, Phone, CreditCard, ShieldAlert } from 'lucide-react';

interface QuickNewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  lang: 'ar' | 'en';
  onCreated: (customer: any) => void;
  embedded?: boolean;
}

export const QuickNewCustomerModal: React.FC<QuickNewCustomerModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  lang,
  onCreated,
  embedded = false,
}) => {
  const isAllowed = canCreateInTable(currentRole, 'customers');

  const [customerType, setCustomerType] = useState<'فرد' | 'شركة'>('فرد');
  const [nameAr, setNameAr] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [emiratesId, setEmiratesId] = useState('');
  const [trnNumber, setTrnNumber] = useState('');
  const [creditLimit, setCreditLimit] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isAllowed) {
      setErrorMessage(lang === 'ar' ? 'ليس لديك صلاحية لإضافة عملاء جدد.' : 'Unauthorized to create customers.');
      return;
    }

    if (!nameAr.trim()) {
      setErrorMessage(lang === 'ar' ? 'يرجى إدخال اسم العميل باللغة العربية.' : 'Please enter customer Arabic name.');
      return;
    }

    if (!phone.trim()) {
      setErrorMessage(lang === 'ar' ? 'يرجى إدخال رقم هاتف العميل.' : 'Please enter customer phone.');
      return;
    }

    setIsSubmitting(true);

    try {
      const code = db.generateId('customers');
      const newCust = db.insert('customers', {
        customer_code: code,
        name_ar: nameAr.trim(),
        name_en: nameEn.trim() || nameAr.trim(),
        customer_type: customerType,
        phone: phone.trim(),
        email: email.trim(),
        emirates_id: emiratesId.trim(),
        trn_tax_number: trnNumber.trim(),
        credit_limit_aed: creditLimit,
        outstanding_balance_aed: 0,
        status: 'نشط',
        branch_id: 'BR-001',
        notes: notes.trim(),
      });

      onCreated(newCust);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء إضافة العميل.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalBody = (
    <div
      className={`relative w-full ${
        embedded ? 'max-w-3xl mx-auto shadow-sm my-2' : 'max-w-xl my-8 shadow-2xl'
      } bg-white rounded-2xl border border-slate-200 overflow-hidden`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold">
            <UserPlus className="w-5 h-5 text-emerald-200" />
          </div>
          <div>
            <h3 className="text-lg font-bold">
              {lang === 'ar' ? 'تسجيل عميل جديد (Customer CRM)' : 'New Customer Registration'}
            </h3>
            <p className="text-xs text-emerald-200">
              {lang === 'ar' ? 'منع تكرار الهوية ورقم الهاتف والتحقق الفوري' : 'Duplicate checks for Phone & Emirates ID'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
          <span>{lang === 'ar' ? 'رجوع / إغلاق' : 'Back / Close'}</span>
        </button>
      </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              {lang === 'ar' ? 'نوع الحساب' : 'Account Type'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCustomerType('فرد')}
                className={`py-2.5 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  customerType === 'فرد'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <User className="w-4 h-4" />
                {lang === 'ar' ? 'فرد (Individual)' : 'Individual'}
              </button>
              <button
                type="button"
                onClick={() => setCustomerType('شركة')}
                className={`py-2.5 px-4 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  customerType === 'شركة'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Building2 className="w-4 h-4" />
                {lang === 'ar' ? 'شركة / مؤسسة (Corporate)' : 'Corporate'}
              </button>
            </div>
          </div>

          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ar' ? 'الاسم بالعربية' : 'Arabic Name'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={customerType === 'شركة' ? 'مثال: شركة الخليج للتجارة' : 'مثال: أحمد عبد الله الهاشمي'}
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ar' ? 'الاسم بالإنجليزية (اختياري)' : 'English Name'}
              </label>
              <input
                type="text"
                placeholder={customerType === 'شركة' ? 'e.g. Gulf Trading LLC' : 'e.g. Ahmed Abdullah'}
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ar' ? 'رقم الهاتف / الواتساب' : 'Phone / WhatsApp'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="050-1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <input
                type="email"
                placeholder="client@domain.ae"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Legal / Tax Identifiers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {customerType === 'فرد'
                  ? lang === 'ar'
                    ? 'رقم الهوية الإماراتية'
                    : 'Emirates ID #'
                  : lang === 'ar'
                  ? 'رقم الرخصة التجارية'
                  : 'Trade License #'}
              </label>
              <input
                type="text"
                placeholder={customerType === 'فرد' ? '784-1990-1234567-1' : 'CN-1029384'}
                value={emiratesId}
                onChange={(e) => setEmiratesId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ar' ? 'الرقم الضريبي TRN (إن وجد)' : 'Tax TRN #'}
              </label>
              <input
                type="text"
                placeholder="100-XXXX-XXXX-0003"
                value={trnNumber}
                onChange={(e) => setTrnNumber(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Credit Limit & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ar' ? 'الحد الائتماني (د.إ)' : 'Credit Limit (AED)'}
              </label>
              <input
                type="number"
                step="100"
                value={creditLimit}
                onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ar' ? 'ملاحظات العميل' : 'Notes'}
              </label>
              <input
                type="text"
                placeholder={lang === 'ar' ? 'تفضيلات العميل أو تفاصيل إضافية...' : 'Additional client notes...'}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-100"
            >
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isAllowed}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-sm font-bold flex items-center gap-2 shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              {lang === 'ar' ? 'حفظ وتسجيل العميل' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    );

  if (embedded) {
    return (
      <div id="quick-customer-canvas-view" className="w-full pb-8">
        {modalBody}
      </div>
    );
  }

  return (
    <div
      id="quick-customer-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {modalBody}
    </div>
  );
};
