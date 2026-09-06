import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { UserRole } from '../types/schema';
import { canCreateInTable } from '../utils/rbac';
import { QuickNewCustomerModal } from './QuickNewCustomerModal';
import {
  X,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Building2,
  User,
  UserPlus,
  Sparkles,
  DollarSign,
  ShieldCheck,
  Clock,
} from 'lucide-react';

interface QuickNewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  lang: 'ar' | 'en';
  onCreated: (transaction: any) => void;
  embedded?: boolean;
}

export const QuickNewTransactionModal: React.FC<QuickNewTransactionModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  lang,
  onCreated,
  embedded = false,
}) => {
  const isAllowed = canCreateInTable(currentRole, 'transactions');

  const [customers, setCustomers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isNewCustModalOpen, setIsNewCustModalOpen] = useState(false);

  // Form State
  const [customerId, setCustomerId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [assignedEmployeeId, setAssignedEmployeeId] = useState('');
  const [govRefNumber, setGovRefNumber] = useState('');
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [govFee, setGovFee] = useState<number>(0);
  const [typingFee, setTypingFee] = useState<number>(0);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(0);
  const [priority, setPriority] = useState<'عادي' | 'عاجل' | 'VIP'>('عادي');
  const [notes, setNotes] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setErrorMessage(null);
      return;
    }
    const custs = db.getAll('customers');
    const srvs = db.getAll('services_pricing');
    const emps = db.getAll('employees');

    setCustomers(custs);
    setServices(srvs);
    setEmployees(emps);

    if (custs.length > 0 && !customerId) setCustomerId(custs[0].id);
    if (srvs.length > 0 && !serviceId) {
      handleServiceSelect(srvs[0].id, srvs);
    }
    if (emps.length > 0 && !assignedEmployeeId) {
      setAssignedEmployeeId(emps[0].id);
    } else if (emps.length === 0) {
      setAssignedEmployeeId('EMP-ADMIN');
    }
  }, [isOpen]);

  const handleCustomerCreated = (newCust: any) => {
    const updatedCusts = db.getAll('customers');
    setCustomers(updatedCusts);
    if (newCust?.id) {
      setCustomerId(newCust.id);
    }
    setIsNewCustModalOpen(false);
  };

  const handleServiceSelect = (id: string, srvList = services) => {
    setServiceId(id);
    const srv = srvList.find((s) => s.id === id);
    if (srv) {
      setGovFee(srv.gov_fee_aed || 0);
      setTypingFee(srv.typing_fee_aed || 0);
      setSellingPrice(srv.default_selling_price_aed || 0);
      setMinPrice(srv.min_price_aed || 0);
      setMaxPrice(srv.max_price_aed || 0);
    }
  };

  const isBelowMin = minPrice > 0 && sellingPrice < minPrice;
  const isAboveMax = maxPrice > 0 && sellingPrice > maxPrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isAllowed) {
      setErrorMessage(lang === 'ar' ? 'ليس لديك صلاحية لإنشاء معاملات جديدة.' : 'Unauthorized to create transactions.');
      return;
    }

    if (!customerId) {
      setErrorMessage(lang === 'ar' ? 'يرجى تحديد العميل.' : 'Please select a customer.');
      return;
    }

    if (!serviceId) {
      setErrorMessage(lang === 'ar' ? 'يرجى تحديد الخدمة.' : 'Please select a service.');
      return;
    }

    if (isAboveMax) {
      setErrorMessage(
        lang === 'ar'
          ? `سعر البيع (${sellingPrice} د.إ) يتجاوز الحد الأقصى المسموح (${maxPrice} د.إ).`
          : `Selling price exceeds maximum allowed limit (${maxPrice} AED).`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedCustomer = customers.find((c) => c.id === customerId);
      const selectedService = services.find((s) => s.id === serviceId);
      const selectedEmployee = employees.find((e) => e.id === assignedEmployeeId);

      const trxNumber = db.generateId('transactions');

      // Check if needs supervisor approval for price discount
      const requiresApproval = isBelowMin;
      const initialStatus = requiresApproval ? 'بانتظار الموافقة' : 'جديدة';

      // 1. Create Transaction header
      const trx: any = db.insert('transactions', {
        transaction_number: trxNumber,
        customer_id: customerId,
        customer_name_ar: selectedCustomer?.name_ar || '',
        customer_phone: selectedCustomer?.phone || '',
        branch_id: 'BR-001',
        status: initialStatus,
        total_selling_price_aed: sellingPrice,
        total_gov_fee_aed: govFee,
        total_typing_fee_aed: typingFee,
        total_cost_aed: govFee + (selectedService?.standard_cost_aed || 0),
        net_profit_aed: Math.max(0, sellingPrice - govFee - (selectedService?.standard_cost_aed || 0)),
        payment_status: 'غير مدفوع',
        paid_amount_aed: 0,
        remaining_amount_aed: sellingPrice,
        assigned_to_user_id: assignedEmployeeId,
        assigned_employee_name: selectedEmployee?.name_ar || '',
        notes: notes ? `${notes} (أولوية: ${priority})` : `أولوية: ${priority}`,
      });

      // 2. Create Transaction Detail line
      db.insert('transaction_details', {
        transaction_id: trx.id,
        service_id: serviceId,
        service_name_ar: selectedService?.name_ar || '',
        service_name_en: selectedService?.name_en || '',
        category: selectedService?.category || 'أخرى',
        gov_fee_aed: govFee,
        typing_fee_aed: typingFee,
        selling_price_aed: sellingPrice,
        min_price_aed: minPrice,
        max_price_aed: maxPrice,
        standard_cost_aed: selectedService?.standard_cost_aed || 0,
        application_id_ref: govRefNumber || '',
        status: initialStatus,
        assigned_employee_id: assignedEmployeeId,
        completion_notes: requiresApproval ? 'تخفيض تحت السعر الأدنى - بانتظار موافقة المشرف' : 'معاملة جديدة',
      });

      // 3. If price is below min, also generate an Approval request
      if (requiresApproval) {
        db.insert('approvals', {
          module_name: 'معاملات وعمليات',
          approval_type: 'تخفيض_سعر',
          record_id: trx.id,
          requested_by: selectedEmployee?.name_ar || 'موظف العمليات',
          requested_amount_aed: sellingPrice,
          min_required_amount_aed: minPrice,
          reason: `طلب استثناء سعر للخدمة (${selectedService?.name_ar}) بسعر ${sellingPrice} د.إ بدلاً من الأدنى ${minPrice} د.إ للعميل ${selectedCustomer?.name_ar}`,
          status: 'معلق',
          urgency: priority,
        });
      }

      onCreated(trx);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'فشل إنشاء المعاملة.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const modalBody = (
    <div
      className={`relative w-full ${
        embedded ? 'max-w-4xl mx-auto shadow-sm my-2' : 'max-w-2xl my-8 shadow-2xl'
      } bg-white rounded-2xl border border-slate-200 overflow-hidden`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-bold">
            <FileSpreadsheet className="w-5 h-5 text-blue-200" />
          </div>
          <div>
            <h3 className="text-lg font-bold">
              {lang === 'ar' ? 'فتح معاملة جديدة (Smart Transaction)' : 'Create New Transaction'}
            </h3>
            <p className="text-xs text-blue-200">
              {lang === 'ar'
                ? 'ربط العميل والخدمة والتحقق التلقائي من حدود الأسعار والرسوم الحكومية'
                : 'Automated Pricing & Gov Fee verification'}
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
          {/* Customer Selection */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                {lang === 'ar' ? 'العميل المستفيد' : 'Customer'} <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsNewCustModalOpen(true)}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 hover:underline"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? '+ إضافة عميل جديد' : '+ New Customer'}</span>
              </button>
            </div>

            {customers.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                <span>
                  {lang === 'ar'
                    ? 'لا يوجد عملاء مسجلون حالياً (قاعدة بيانات نظيفة). يرجى إضافة عميل أولاً.'
                    : 'No registered customers found. Please add a customer first.'}
                </span>
                <button
                  type="button"
                  onClick={() => setIsNewCustModalOpen(true)}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shadow-2xs"
                >
                  {lang === 'ar' ? 'إضافة عميل الآن' : 'Add Customer Now'}
                </button>
              </div>
            ) : (
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.customer_code} - {c.name_ar} {c.phone ? `(${c.phone})` : ''} - {c.customer_type}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Service Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'ar' ? 'الخدمة المطلوبة من الكتالوج' : 'Service from Catalog'} <span className="text-rose-500">*</span>
            </label>
            <select
              value={serviceId}
              onChange={(e) => handleServiceSelect(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  [{s.category}] {s.service_code} - {s.name_ar} (السعر المعتمد: {s.default_selling_price_aed} د.إ)
                </option>
              ))}
            </select>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                {lang === 'ar' ? 'الرسوم الحكومية (د.إ)' : 'Gov Fee (AED)'}
              </label>
              <input
                type="number"
                disabled
                value={govFee}
                className="w-full px-3 py-2 rounded-lg bg-slate-200/70 border border-slate-300 text-slate-700 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                {lang === 'ar' ? 'رسوم الطباعة (د.إ)' : 'Typing Fee (AED)'}
              </label>
              <input
                type="number"
                disabled
                value={typingFee}
                className="w-full px-3 py-2 rounded-lg bg-slate-200/70 border border-slate-300 text-slate-700 font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-blue-900 mb-1">
                {lang === 'ar' ? 'سعر البيع النهائي (د.إ)' : 'Selling Price (AED)'} *
              </label>
              <input
                type="number"
                step="any"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                className={`w-full px-3 py-2 rounded-lg border font-mono text-sm font-bold focus:outline-none focus:ring-2 ${
                  isBelowMin
                    ? 'border-amber-400 bg-amber-50 text-amber-900 focus:ring-amber-500'
                    : isAboveMax
                    ? 'border-rose-400 bg-rose-50 text-rose-900 focus:ring-rose-500'
                    : 'border-blue-400 bg-white text-blue-900 focus:ring-blue-500'
                }`}
              />
            </div>
          </div>

          {/* Pricing Notice */}
          {minPrice > 0 && (
            <div className="flex items-center justify-between text-xs px-2 text-slate-500">
              <span>
                {lang === 'ar' ? 'الحد الأدنى للسعر:' : 'Min Price:'}{' '}
                <strong className="text-slate-700 font-mono">{minPrice} د.إ</strong>
              </span>
              <span>
                {lang === 'ar' ? 'الحد الأقصى للسعر:' : 'Max Price:'}{' '}
                <strong className="text-slate-700 font-mono">{maxPrice} د.إ</strong>
              </span>
            </div>
          )}

          {isBelowMin && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2 text-xs text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>{lang === 'ar' ? 'تنبيه طلب استثناء وموافقة:' : 'Approval Required:'}</strong>{' '}
                {lang === 'ar'
                  ? `السعر المحدد أقل من الحد الأدنى (${minPrice} د.إ). سيتم إرسال المعاملة تلقائياً لقسم الموافقات للمشرف/المدير.`
                  : `Selling price is below min limit (${minPrice} AED). Will be submitted for supervisor approval.`}
              </div>
            </div>
          )}

          {/* Assigned Staff & Gov Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ar' ? 'الموظف المسؤول' : 'Assigned Employee'}
              </label>
              <select
                value={assignedEmployeeId}
                onChange={(e) => setAssignedEmployeeId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {employees.length === 0 ? (
                  <option value="EMP-ADMIN">
                    {lang === 'ar' ? 'بشار الحاج (المدير / المشرف العام)' : 'Bashar Elhaj (Admin)'}
                  </option>
                ) : (
                  employees.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name_ar} ({e.job_title_ar || 'موظف'})
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ar' ? 'رقم الطلب الحكومي (اختياري)' : 'Gov Application Ref #'}
              </label>
              <input
                type="text"
                placeholder="مثال: ICP-2026-991"
                value={govRefNumber}
                onChange={(e) => setGovRefNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ar' ? 'درجة الأولوية' : 'Priority'}
              </label>
              <select
                value={priority}
                onChange={(e: any) => setPriority(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="عادي">{lang === 'ar' ? 'عادي (Normal)' : 'Normal'}</option>
                <option value="عاجل">{lang === 'ar' ? 'عاجل (Urgent)' : 'Urgent'}</option>
                <option value="VIP">{lang === 'ar' ? 'VIP (فوري)' : 'VIP / Immediate'}</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {lang === 'ar' ? 'ملاحظات المعاملة' : 'Notes'}
            </label>
            <input
              type="text"
              placeholder={lang === 'ar' ? 'أي تعليمات أو تفاصيل خاصة...' : 'Special instructions...'}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              disabled={isSubmitting || !isAllowed || (!customerId && customers.length === 0)}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 active:scale-95 text-white text-sm font-bold flex items-center gap-2 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              {lang === 'ar' ? 'إنشاء وتثبيت المعاملة' : 'Create Transaction'}
            </button>
          </div>
        </form>
      </div>
    );

  if (embedded) {
    return (
      <div id="quick-transaction-canvas-view" className="w-full pb-8">
        {modalBody}
        {isNewCustModalOpen && (
          <QuickNewCustomerModal
            isOpen={isNewCustModalOpen}
            embedded={true}
            onClose={() => setIsNewCustModalOpen(false)}
            currentRole={currentRole}
            lang={lang}
            onCreated={handleCustomerCreated}
          />
        )}
      </div>
    );
  }

  return (
    <div
      id="quick-transaction-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {modalBody}
      {isNewCustModalOpen && (
        <QuickNewCustomerModal
          isOpen={isNewCustModalOpen}
          onClose={() => setIsNewCustModalOpen(false)}
          currentRole={currentRole}
          lang={lang}
          onCreated={handleCustomerCreated}
        />
      )}
    </div>
  );
};
