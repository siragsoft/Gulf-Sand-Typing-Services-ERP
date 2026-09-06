import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { UserRole } from '../types/schema';
import { canCreateInTable } from '../utils/rbac';
import { X, Plus, Trash2, CheckCircle2, AlertCircle, BookOpen, ShieldAlert } from 'lucide-react';

interface JournalLine {
  id: string;
  account_code: string;
  account_name_ar: string;
  debit_aed: number;
  credit_aed: number;
  description: string;
}

interface QuickNewJournalEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  lang: 'ar' | 'en';
  onCreated: (entry: any) => void;
  embedded?: boolean;
}

export const QuickNewJournalEntryModal: React.FC<QuickNewJournalEntryModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  lang,
  onCreated,
  embedded = false,
}) => {
  const isAllowed = canCreateInTable(currentRole, 'journal_entries');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [entryDate, setEntryDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reference, setReference] = useState('');
  const [description, setDescription] = useState('');

  const [lines, setLines] = useState<JournalLine[]>([
    { id: '1', account_code: '1010', account_name_ar: 'الصندوق الرئيسي - كاش الفرع', debit_aed: 0, credit_aed: 0, description: '' },
    { id: '2', account_code: '4010', account_name_ar: 'إيرادات أتعاب الطباعة والخدمات', debit_aed: 0, credit_aed: 0, description: '' },
  ]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const accs = db.getAll('chart_of_accounts');
    setAccounts(accs);
    setReference(`REF-${Date.now().toString().slice(-6)}`);
    setErrorMessage(null);
  }, [isOpen]);

  const totalDebit = lines.reduce((acc, l) => acc + (Number(l.debit_aed) || 0), 0);
  const totalCredit = lines.reduce((acc, l) => acc + (Number(l.credit_aed) || 0), 0);
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = totalDebit > 0 && Math.abs(totalDebit - totalCredit) < 0.01;

  const handleAddLine = () => {
    const defaultAcc = accounts[0] || { account_code: '1010', name_ar: 'الصندوق' };
    setLines((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        account_code: defaultAcc.account_code,
        account_name_ar: defaultAcc.name_ar,
        debit_aed: 0,
        credit_aed: 0,
        description: '',
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 2) {
      setErrorMessage(lang === 'ar' ? 'يجب أن يحتوي القيد على سطرين على الأقل.' : 'Entry must have at least 2 lines.');
      return;
    }
    setLines((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleLineChange = (index: number, field: keyof JournalLine, value: any) => {
    setLines((prev) => {
      const updated = [...prev];
      if (field === 'account_code') {
        const acc = accounts.find((a) => a.account_code === value);
        updated[index] = {
          ...updated[index],
          account_code: value,
          account_name_ar: acc ? acc.name_ar : '',
        };
      } else {
        updated[index] = {
          ...updated[index],
          [field]: value,
        };
      }
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!isAllowed) {
      setErrorMessage(lang === 'ar' ? 'ليس لديك صلاحية لترحيل قيود اليومية.' : 'Unauthorized to post journal entries.');
      return;
    }

    if (!description.trim()) {
      setErrorMessage(lang === 'ar' ? 'يرجى إدخال بيان وشرح القيد.' : 'Please enter entry description.');
      return;
    }

    if (!isBalanced) {
      setErrorMessage(
        lang === 'ar'
          ? `القيد غير متوازن! إجمالي المدين (${totalDebit.toFixed(2)} د.إ) لا يتطابق مع الدائن (${totalCredit.toFixed(2)} د.إ). الفرق: ${difference.toFixed(2)} د.إ`
          : `Unbalanced journal entry! Total Debit (${totalDebit.toFixed(2)}) must equal Total Credit (${totalCredit.toFixed(2)}).`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const entryNumber = db.generateId('journal_entries');

      // 1. Insert header
      const jrn: any = db.insert('journal_entries', {
        entry_number: entryNumber,
        entry_date: entryDate,
        description_ar: description,
        description_en: description,
        total_debit_aed: totalDebit,
        total_credit_aed: totalCredit,
        status: 'مرحل',
        is_balanced: true,
        reference_number: reference,
        branch_id: 'BR-001',
      });

      // 2. Insert lines
      lines.forEach((l, idx) => {
        db.insert('journal_entry_lines', {
          journal_entry_id: jrn.id,
          line_number: idx + 1,
          account_code: l.account_code,
          account_name_ar: l.account_name_ar,
          debit_amount_aed: Number(l.debit_aed) || 0,
          credit_amount_aed: Number(l.credit_aed) || 0,
          description: l.description || description,
          branch_id: 'BR-001',
          status: 'نشط',
        });
      });

      onCreated(jrn);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء حفظ القيد المحاسبي.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const modalBody = (
    <div
      className={`relative w-full ${
        embedded ? 'max-w-5xl mx-auto shadow-sm my-2' : 'max-w-4xl my-8 shadow-2xl'
      } bg-white rounded-2xl border border-slate-200 overflow-hidden`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">
              {lang === 'ar' ? 'إنشاء قيد محاسبي مزدوج (Balanced Journal Entry)' : 'New Double-Entry Journal Entry'}
            </h3>
            <p className="text-xs text-indigo-200">
              {lang === 'ar' ? 'نظام القيود المحاسبية التلقائية مع التحقق الفوري من التوازن' : 'Double-entry balance validator'}
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
          {/* Header Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ar' ? 'تاريخ القيد' : 'Entry Date'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ar' ? 'رقم المرجع / المستند' : 'Reference Number'}
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {lang === 'ar' ? 'البيان العام للقيد' : 'General Description'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder={lang === 'ar' ? 'مثال: إثبات تحصيل إيرادات يومية' : 'e.g. Daily revenue posting'}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Journal Lines Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                {lang === 'ar' ? 'أسطر القيد المحاسبي (شجرة الحسابات)' : 'Journal Lines (Chart of Accounts)'}
              </span>
              <button
                type="button"
                onClick={handleAddLine}
                className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                {lang === 'ar' ? 'إضافة سطر جديد' : 'Add Line'}
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
              {lines.map((line, idx) => (
                <div key={line.id || idx} className="p-3 grid grid-cols-12 gap-2 items-center text-xs">
                  {/* Account */}
                  <div className="col-span-12 sm:col-span-5">
                    <label className="block sm:hidden text-[10px] text-slate-400 mb-0.5">الحساب</label>
                    <select
                      value={line.account_code}
                      onChange={(e) => handleLineChange(idx, 'account_code', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-800 text-xs focus:ring-1 focus:ring-indigo-500"
                    >
                      {accounts.map((acc) => (
                        <option key={acc.id || acc.account_code} value={acc.account_code}>
                          {acc.account_code} - {acc.name_ar}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Debit */}
                  <div className="col-span-6 sm:col-span-2">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      {lang === 'ar' ? 'مدين (AED)' : 'Debit'}
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={line.debit_aed || ''}
                      onChange={(e) => handleLineChange(idx, 'debit_aed', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-800 font-mono text-xs font-bold text-emerald-800 bg-emerald-50/30"
                    />
                  </div>

                  {/* Credit */}
                  <div className="col-span-6 sm:col-span-2">
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                      {lang === 'ar' ? 'دائن (AED)' : 'Credit'}
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={line.credit_aed || ''}
                      onChange={(e) => handleLineChange(idx, 'credit_aed', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-800 font-mono text-xs font-bold text-blue-800 bg-blue-50/30"
                    />
                  </div>

                  {/* Description / Memo */}
                  <div className="col-span-10 sm:col-span-2">
                    <label className="block sm:hidden text-[10px] text-slate-400 mb-0.5">البيان</label>
                    <input
                      type="text"
                      placeholder={lang === 'ar' ? 'بيان السطر...' : 'Line memo...'}
                      value={line.description}
                      onChange={(e) => handleLineChange(idx, 'description', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-slate-800 text-xs"
                    />
                  </div>

                  {/* Delete Line */}
                  <div className="col-span-2 sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title={lang === 'ar' ? 'حذف السطر' : 'Remove Line'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Balance Summary Row */}
            <div className="bg-slate-100/90 px-4 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 font-mono font-bold">
                <div>
                  <span className="text-slate-500 mr-1 ml-1">{lang === 'ar' ? 'إجمالي المدين:' : 'Total Debit:'}</span>
                  <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    {totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.إ
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 mr-1 ml-1">{lang === 'ar' ? 'إجمالي الدائن:' : 'Total Credit:'}</span>
                  <span className="text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    {totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.إ
                  </span>
                </div>
              </div>

              {/* Status Pill */}
              <div className="flex items-center gap-2">
                {isBalanced ? (
                  <span className="px-3 py-1 bg-emerald-600 text-white rounded-full font-bold flex items-center gap-1.5 shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {lang === 'ar' ? 'القيد متوازن وجاهز للترحيل' : 'Balanced & Ready'}
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-full font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    {lang === 'ar' ? `غير متوازن (الفرق: ${difference.toFixed(2)} د.إ)` : `Unbalanced (Diff: ${difference.toFixed(2)})`}
                  </span>
                )}
              </div>
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
              disabled={isSubmitting || !isAllowed || !isBalanced}
              className={`px-6 py-2.5 rounded-xl text-white text-sm font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                !isBalanced || !isAllowed || isSubmitting
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-700 hover:bg-indigo-800 active:scale-95'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {lang === 'ar' ? 'ترحيل وحفظ القيد المحاسبي' : 'Post Journal Entry'}
            </button>
          </div>
        </form>
      </div>
    );

  if (embedded) {
    return (
      <div id="quick-journal-canvas-view" className="w-full pb-8">
        {modalBody}
      </div>
    );
  }

  return (
    <div
      id="quick-journal-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {modalBody}
    </div>
  );
};
