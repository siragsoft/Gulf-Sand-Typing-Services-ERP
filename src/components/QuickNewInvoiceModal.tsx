import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { UserRole } from '../types/schema';
import { canCreateInTable } from '../utils/rbac';
import { X, Receipt, PlusCircle, AlertCircle, CheckCircle2, DollarSign } from 'lucide-react';

interface QuickNewInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  lang: 'ar' | 'en';
  onCreated: (invoice: any) => void;
  embedded?: boolean;
}

export const QuickNewInvoiceModal: React.FC<QuickNewInvoiceModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  lang,
  onCreated,
  embedded = false,
}) => {
  const isAllowed = canCreateInTable(currentRole, 'invoices');

  const [customers, setCustomers] = useState<any[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [invoiceType, setInvoiceType] = useState<'فاتورة ضريبية' | 'فاتورة مبسطة'>('فاتورة ضريبية');
  const [subtotal, setSubtotal] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<'غير مدفوع' | 'مدفوع كلياً' | 'مدفوع جزئياً'>('غير مدفوع');
  const [notes, setNotes] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const custs = db.getAll('customers');
    setCustomers(custs);
    if (custs.length > 0 && !customerId) setCustomerId(custs[0].id);
    setErrorMessage(null);
  }, [isOpen]);

  const taxableAmount = Math.max(0, subtotal - discount);
  const vatAmount = taxableAmount * 0.05; // 5% UAE VAT
  const totalAmount = taxableAmount + vatAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isAllowed) {
      setErrorMessage(lang === 'ar' ? 'ليس لديك صلاحية لإنشاء فواتير جديدة.' : 'Unauthorized to create invoices.');
      return;
    }

    if (!customerId) {
      setErrorMessage(lang === 'ar' ? 'يرجى اختيار العميل.' : 'Please select customer.');
      return;
    }

    if (subtotal <= 0) {
      setErrorMessage(lang === 'ar' ? 'يجب أن يكون المبلغ الخاضع للضريبة أكبر من صفر.' : 'Subtotal must be greater than 0.');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedCustomer = customers.find((c) => c.id === customerId);
      const invoiceNumber = db.generateId('invoices');
      const issueDate = new Date().toISOString().split('T')[0];

      const inv = db.insert('invoices', {
        invoice_number: invoiceNumber,
        customer_id: customerId,
        customer_name_ar: selectedCustomer?.name_ar || '',
        customer_trn: selectedCustomer?.trn_tax_number || '',
        issue_date: issueDate,
        due_date: issueDate,
        subtotal_aed: subtotal,
        discount_aed: discount,
        vat_rate_percent: 5,
        vat_amount_aed: vatAmount,
        total_amount_aed: totalAmount,
        payment_status: paymentStatus,
        paid_amount_aed: paymentStatus === 'مدفوع كلياً' ? totalAmount : 0,
        balance_due_aed: paymentStatus === 'مدفوع كلياً' ? 0 : totalAmount,
        status: 'نشط',
        branch_id: 'BR-001',
        notes: notes.trim(),
      });

      // If marked as paid, also auto-generate a receipt voucher
      if (paymentStatus === 'مدفوع كلياً') {
        const receiptNumber = db.generateId('collections_receipts');
        db.insert('collections_receipts', {
          receipt_number: receiptNumber,
          customer_id: customerId,
          customer_name_ar: selectedCustomer?.name_ar || '',
          receipt_date: issueDate,
          amount_received_aed: totalAmount,
          payment_method: 'تحويل بنكي / كاش',
          status: 'معتمد',
          branch_id: 'BR-001',
          notes: `تحصيل مباشر للفاتورة رقم ${invoiceNumber}`,
        });
      }

      onCreated(inv);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء إصدار الفاتورة.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const modalBody = (
    <div
      className={`relative w-full ${
        embedded ? 'max-w-3xl mx-auto shadow-sm my-2' : 'max-w-xl my-8 shadow-2xl'
      } bg-white rounded-2xl border border-slate-200 overflow-hidden`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-800 to-cyan-900 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold">
            <Receipt className="w-5 h-5 text-cyan-200" />
          </div>
          <div>
            <h3 className="text-lg font-bold">
              {lang === 'ar' ? 'إصدار فاتورة ضريبية إلكترونية' : 'Generate Tax Invoice'}
            </h3>
            <p className="text-xs text-cyan-200">
              {lang === 'ar' ? 'حساب تلقائي لضريبة القيمة المضافة 5% والسندات' : 'Auto 5% UAE VAT calculations'}
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
          {/* Customer */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'ar' ? 'العميل المفوتر' : 'Billed Customer'} <span className="text-rose-500">*</span>
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.customer_code} - {c.name_ar} {c.trn_tax_number ? `(TRN: ${c.trn_tax_number})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Subtotal & Discount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ar' ? 'المبلغ الأساسي (قبل الضريبة) د.إ' : 'Subtotal (Excl. VAT) AED'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={subtotal || ''}
                onChange={(e) => setSubtotal(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ar' ? 'الخصم الممنوح (د.إ)' : 'Discount (AED)'}
              </label>
              <input
                type="number"
                step="any"
                min="0"
                value={discount || ''}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Calculated Totals Preview */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>{lang === 'ar' ? 'المبلغ الخاضع للضريبة:' : 'Taxable Subtotal:'}</span>
              <span className="font-mono font-semibold">{taxableAmount.toFixed(2)} د.إ</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>{lang === 'ar' ? 'ضريبة القيمة المضافة (5% VAT):' : '5% UAE VAT:'}</span>
              <span className="font-mono font-semibold text-blue-700">+{vatAmount.toFixed(2)} د.إ</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-slate-900">
              <span>{lang === 'ar' ? 'إجمالي الفاتورة النهائي:' : 'Grand Total:'}</span>
              <span className="font-mono text-emerald-700 text-base">{totalAmount.toFixed(2)} د.إ</span>
            </div>
          </div>

          {/* Payment Status & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ar' ? 'حالة السداد الفوري' : 'Payment Status'}
              </label>
              <select
                value={paymentStatus}
                onChange={(e: any) => setPaymentStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="غير مدفوع">{lang === 'ar' ? 'آجل (غير مدفوع)' : 'Unpaid'}</option>
                <option value="مدفوع كلياً">{lang === 'ar' ? 'مدفوع نقداً/بنكياً (توليد سند قبض تلقائي)' : 'Paid (Auto-Receipt)'}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ar' ? 'ملاحظات الفاتورة' : 'Invoice Notes'}
              </label>
              <input
                type="text"
                placeholder={lang === 'ar' ? 'شروط السداد أو تفاصيل...' : 'Payment terms...'}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
              className="px-6 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 active:scale-95 text-white text-sm font-bold flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              {lang === 'ar' ? 'إصدار الفاتورة وتثبيتها' : 'Issue Tax Invoice'}
            </button>
          </div>
        </form>
      </div>
    );

  if (embedded) {
    return (
      <div id="quick-invoice-canvas-view" className="w-full pb-8">
        {modalBody}
      </div>
    );
  }

  return (
    <div
      id="quick-invoice-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {modalBody}
    </div>
  );
};
