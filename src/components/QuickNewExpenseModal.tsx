import React, { useState } from 'react';
import { db } from '../db';
import { UserRole } from '../types/schema';
import { canCreateInTable } from '../utils/rbac';
import { X, CreditCard, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

interface QuickNewExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  lang: 'ar' | 'en';
  onCreated: (expense: any) => void;
  embedded?: boolean;
}

export const QuickNewExpenseModal: React.FC<QuickNewExpenseModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  lang,
  onCreated,
  embedded = false,
}) => {
  const isAllowed = canCreateInTable(currentRole, 'expenses');

  const [category, setCategory] = useState('إيجار الفرع والمكاتب');
  const [amount, setAmount] = useState<number>(0);
  const [vatAmount, setVatAmount] = useState<number>(0);
  const [vendorName, setVendorName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('حساب البنك الجاري');
  const [description, setDescription] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const totalAmount = amount + vatAmount;
  const requiresApproval = totalAmount > 5000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isAllowed) {
      setErrorMessage(lang === 'ar' ? 'ليس لديك صلاحية لإنشاء سندات صرف.' : 'Unauthorized to create expenses.');
      return;
    }

    if (amount <= 0) {
      setErrorMessage(lang === 'ar' ? 'يرجى إدخال مبلغ المصروف بشكل صحيح.' : 'Please enter valid expense amount.');
      return;
    }

    if (!description.trim()) {
      setErrorMessage(lang === 'ar' ? 'يرجى كتابة بيان الصرف.' : 'Please enter expense description.');
      return;
    }

    setIsSubmitting(true);

    try {
      const expNumber = db.generateId('expenses');
      const today = new Date().toISOString().split('T')[0];
      const initialStatus = requiresApproval ? 'بانتظار الموافقة' : 'معتمد';

      const exp: any = db.insert('expenses', {
        expense_number: expNumber,
        expense_date: today,
        category,
        amount_before_vat_aed: amount,
        vat_amount_aed: vatAmount,
        total_amount_aed: totalAmount,
        beneficiary_name: vendorName.trim() || 'عام',
        payment_method: paymentMethod,
        description: description.trim(),
        status: initialStatus,
        branch_id: 'BR-001',
      });

      // If high amount, create approval request
      if (requiresApproval) {
        db.insert('approvals', {
          module_name: 'المحاسبة والمالية',
          approval_type: 'سند_صرف_كبير',
          record_id: exp.id,
          requested_by: 'المحاسب المالي',
          requested_amount_aed: totalAmount,
          reason: `طلب اعتماد سند صرف بمبلغ ${totalAmount.toLocaleString()} د.إ لبند "${category}" لصالح ${vendorName || 'المستفيد'}.`,
          status: 'معلق',
          urgency: totalAmount > 20000 ? 'عاجل' : 'عادي',
        });
      }

      onCreated(exp);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء حفظ سند الصرف.');
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
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-rose-900 to-amber-950 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold">
            <CreditCard className="w-5 h-5 text-rose-200" />
          </div>
          <div>
            <h3 className="text-lg font-bold">
              {lang === 'ar' ? 'تسجيل سند صرف ومصروفات (Expense Voucher)' : 'Record Expense Voucher'}
            </h3>
            <p className="text-xs text-rose-200">
              {lang === 'ar' ? 'ترحيل مباشر لمصروفات التشغيل والاعتمادات المالية' : 'Direct operating expense logging'}
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
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>{errorMessage}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'ar' ? 'بند وتصنيف المصروف' : 'Expense Category'} <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="إيجار الفرع والمكاتب">{lang === 'ar' ? 'إيجار الفرع والمكاتب' : 'Office Rent'}</option>
              <option value="فواتير الكهرباء والماء">{lang === 'ar' ? 'فواتير الكهرباء والماء (DEWA/SEWA)' : 'Utilities'}</option>
              <option value="رسوم الاتصالات والإنترنت">{lang === 'ar' ? 'الاتصالات والإنترنت (Etisalat/Du)' : 'Telecom & Internet'}</option>
              <option value="اشتراكات البرامج والأنظمة">{lang === 'ar' ? 'اشتراكات البرامج والأنظمة الحكومية' : 'Software & Portals'}</option>
              <option value="مستلزمات مكتبية وطباعة">{lang === 'ar' ? 'أوراق وأحبار ومستلزمات طباعة' : 'Office Supplies'}</option>
              <option value="تسويق وإعلانات">{lang === 'ar' ? 'حملات التسويق والإعلانات' : 'Marketing & Ads'}</option>
              <option value="صيانة وضيافة">{lang === 'ar' ? 'صيانة ونظافة وضيافة' : 'Maintenance & Hospitality'}</option>
              <option value="مصروفات حكومية وتراخيص">{lang === 'ar' ? 'تجديد تراخيص ورسوم حكومية' : 'Licenses & Gov Fees'}</option>
            </select>
          </div>

          {/* Amounts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ar' ? 'المبلغ الصافي (د.إ)' : 'Amount (AED)'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ar' ? 'ضريبة القيمة المضافة المدفوعة (د.إ)' : 'VAT Amount (AED)'}
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={vatAmount || ''}
                onChange={(e) => setVatAmount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          {/* Total Preview */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-sm">
            <span className="text-slate-600 font-semibold">{lang === 'ar' ? 'إجمالي سند الصرف:' : 'Total Voucher Amount:'}</span>
            <span className="font-mono font-bold text-rose-700 text-base">{totalAmount.toFixed(2)} د.إ</span>
          </div>

          {requiresApproval && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2 text-xs text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>{lang === 'ar' ? 'يتطلب موافقة المدير المالي:' : 'Manager Approval Required:'}</strong>{' '}
                {lang === 'ar'
                  ? 'أي سند صرف يتجاوز 5,000 د.إ يتم تحويله لجدول الموافقات لاعتماده قبل إتمام الصرف الفعلي.'
                  : 'Expenses exceeding 5,000 AED require Manager approval.'}
              </div>
            </div>
          )}

          {/* Vendor & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ar' ? 'الجهة المستفيدة / المورد' : 'Beneficiary / Vendor'}
              </label>
              <input
                type="text"
                placeholder={lang === 'ar' ? 'اسم المورد أو الشركة' : 'Vendor name'}
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ar' ? 'طريقة وحساب الدفع' : 'Payment Method'}
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="حساب البنك الجاري">{lang === 'ar' ? 'حساب البنك الجاري (ENBD)' : 'Bank Current Account'}</option>
                <option value="الصندوق الرئيسي - كاش">{lang === 'ar' ? 'الصندوق الرئيسي - كاش' : 'Cash Main Drawer'}</option>
                <option value="بطاقة ائتمان الشركة">{lang === 'ar' ? 'بطاقة ائتمان الشركة' : 'Corporate Credit Card'}</option>
                <option value="شيك بنكي">{lang === 'ar' ? 'شيك بنكي مؤجل' : 'Bank Cheque'}</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'ar' ? 'بيان وتفاصيل المصروف' : 'Description'} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={lang === 'ar' ? 'مثال: سداد فاتورة كهرباء الفرع لشهر أغسطس' : 'e.g. Electricity bill payment'}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-100 cursor-pointer"
            >
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !isAllowed}
              className="px-6 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 active:scale-95 text-white text-sm font-bold flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              {lang === 'ar' ? 'حفظ سند الصرف' : 'Save Expense Voucher'}
            </button>
          </div>
        </form>
      </div>
    );

  if (embedded) {
    return (
      <div id="quick-expense-canvas-view" className="w-full pb-8">
        {modalBody}
      </div>
    );
  }

  return (
    <div
      id="quick-expense-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {modalBody}
    </div>
  );
};
