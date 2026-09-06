import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { UserRole } from '../types/schema';
import { canEditInTable, canCreateInTable } from '../utils/rbac';
import {
  FileSpreadsheet,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Search,
  Building2,
  User,
  ShieldAlert,
  ArrowRight,
  Eye,
  Edit,
  Tag,
} from 'lucide-react';

interface OperationsHubProps {
  currentRole: UserRole;
  lang: 'ar' | 'en';
  onOpenNewTransaction: () => void;
  onViewRecord: (record: any) => void;
  onEditRecord: (record: any) => void;
}

export const OperationsHub: React.FC<OperationsHubProps> = ({
  currentRole,
  lang,
  onOpenNewTransaction,
  onViewRecord,
  onEditRecord,
}) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const canEdit = canEditInTable(currentRole, 'transactions');
  const canCreate = canCreateInTable(currentRole, 'transactions');

  const loadData = () => {
    const list = db.getAll('transactions');
    setTransactions(list);
  };

  useEffect(() => {
    loadData();
    const unsub = db.subscribe('transactions', () => loadData());
    return () => unsub();
  }, []);

  const handleStatusChange = (trxId: string, newStatus: string) => {
    if (!canEdit) {
      alert(lang === 'ar' ? 'صلاحيتك الحالية لا تسمح بتعديل حالة المعاملة.' : 'Unauthorized to update status.');
      return;
    }
    try {
      db.update('transactions', trxId, { status: newStatus });
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filtered = transactions.filter((trx) => {
    const matchesStatus = statusFilter === 'ALL' || trx.status === statusFilter;
    const matchesSearch =
      (trx.transaction_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (trx.customer_name_ar || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (trx.customer_phone || '').includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const statuses = [
    { id: 'ALL', labelAr: 'جميع المعاملات', labelEn: 'All', color: 'bg-slate-100 text-slate-700' },
    { id: 'جديدة', labelAr: 'جديدة', labelEn: 'New', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { id: 'قيد التنفيذ', labelAr: 'قيد التنفيذ', labelEn: 'In Progress', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    { id: 'بانتظار الموافقة', labelAr: 'بانتظار الموافقة', labelEn: 'Pending Approval', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { id: 'مكتملة', labelAr: 'مكتملة', labelEn: 'Completed', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { id: 'ملغاة', labelAr: 'ملغاة', labelEn: 'Cancelled', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  ];

  return (
    <div className="space-y-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Top Header Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            {lang === 'ar' ? 'مركز متابعة العمليات والمعاملات' : 'Operations & Transactions Pipeline'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {lang === 'ar'
              ? 'متابعة مسار معاملات الإقامة، رخص الشركات، الفحص الطبي وتغيير الحالات لحظياً'
              : 'Real-time workflow tracker for visas, typing, and corporate transactions'}
          </p>
        </div>

        <button
          id="btn-new-trx-hub"
          onClick={onOpenNewTransaction}
          disabled={!canCreate}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all ${
            canCreate
              ? 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95 cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Plus className="w-4 h-4" />
          {lang === 'ar' ? 'فتح معاملة جديدة' : 'New Transaction'}
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className={`w-4 h-4 text-slate-400 absolute top-2.5 ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            placeholder={lang === 'ar' ? 'بحث برقم المعاملة، اسم العميل، أو الهاتف...' : 'Search by ID, customer name, phone...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition ${
              lang === 'ar' ? 'pr-9 pl-3' : 'pl-9 pr-3'
            }`}
          />
        </div>

        <div className="flex flex-wrap gap-1 text-xs">
          {statuses.map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                statusFilter === st.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lang === 'ar' ? st.labelAr : st.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center text-slate-400">
          <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">
            {lang === 'ar' ? 'لا توجد معاملات مطابقة لمعايير البحث' : 'No transactions found.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((trx) => {
            const isPendingApproval = trx.status === 'بانتظار الموافقة';
            const isCompleted = trx.status === 'مكتملة';
            const isPaid = trx.payment_status === 'مدفوع';

            return (
              <div
                key={trx.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                      {trx.transaction_number || trx.id}
                    </span>

                    {/* Status Dropdown */}
                    <select
                      value={trx.status || 'جديدة'}
                      disabled={!canEdit}
                      onChange={(e) => handleStatusChange(trx.id, e.target.value)}
                      className={`text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none ${
                        isPendingApproval
                          ? 'bg-purple-50 text-purple-800 border-purple-200'
                          : isCompleted
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : trx.status === 'قيد التنفيذ'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : trx.status === 'ملغاة'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-blue-50 text-blue-800 border-blue-200'
                      }`}
                    >
                      <option value="جديدة">{lang === 'ar' ? 'جديدة' : 'New'}</option>
                      <option value="قيد التنفيذ">{lang === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</option>
                      <option value="بانتظار الموافقة">{lang === 'ar' ? 'بانتظار الموافقة' : 'Pending Approval'}</option>
                      <option value="مكتملة">{lang === 'ar' ? 'مكتملة' : 'Completed'}</option>
                      <option value="ملغاة">{lang === 'ar' ? 'ملغاة' : 'Cancelled'}</option>
                    </select>
                  </div>

                  {/* Customer Info */}
                  <div className="pt-3 space-y-1.5">
                    <div className="text-sm font-bold text-slate-900 truncate">
                      {trx.customer_name_ar || 'عميل نقدي'}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center justify-between">
                      <span>{trx.customer_phone || '—'}</span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {trx.created_at ? new Date(trx.created_at).toLocaleDateString() : ''}
                      </span>
                    </div>
                  </div>

                  {/* Financials & Staff */}
                  <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">{lang === 'ar' ? 'المبلغ الإجمالي' : 'Total'}</span>
                      <span className="font-mono font-bold text-slate-900">{trx.total_selling_price_aed || 0} د.إ</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">{lang === 'ar' ? 'الموظف المسؤول' : 'Staff'}</span>
                      <span className="font-semibold text-slate-700">{trx.assigned_employee_name || 'عام'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">{lang === 'ar' ? 'حالة السداد' : 'Payment'}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {trx.payment_status || 'غير مدفوع'}
                      </span>
                    </div>
                  </div>

                  {trx.notes && (
                    <p className="mt-2 text-[11px] text-slate-500 italic truncate bg-slate-50/60 px-2 py-1 rounded">
                      {trx.notes}
                    </p>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => onViewRecord(trx)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {lang === 'ar' ? 'تفاصيل' : 'Details'}
                  </button>
                  {canEdit && (
                    <button
                      onClick={() => onEditRecord(trx)}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1 transition"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      {lang === 'ar' ? 'تعديل' : 'Edit'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
