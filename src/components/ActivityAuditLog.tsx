import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  User,
  Clock,
  FileText,
  DollarSign,
  Users,
  Building,
  CheckCircle2,
  AlertTriangle,
  Download,
  Calendar,
  Layers,
  ArrowUpDown,
  Eye,
  RefreshCw,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { db } from '../db';
import { UserRole } from '../types/schema';
import { downloadCSV } from '../utils/csvExporter';

interface ActivityAuditLogProps {
  currentRole: UserRole;
  lang?: 'ar' | 'en';
  defaultModule?: 'ALL' | 'CRM' | 'ACCOUNTING' | 'OPERATIONS' | 'HR';
}

export const ActivityAuditLog: React.FC<ActivityAuditLogProps> = ({
  currentRole,
  lang = 'ar',
  defaultModule = 'ALL',
}) => {
  const isAr = lang === 'ar';

  const [auditLogs, setAuditLogs] = useState<any[]>(() => db.getAll('audit_logs'));
  const [moduleFilter, setModuleFilter] = useState<string>(defaultModule);
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [userFilter, setUserFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuditRecord, setSelectedAuditRecord] = useState<any | null>(null);

  // Subscribe to live audit logs
  useEffect(() => {
    const unsub = db.subscribe('audit_logs', () => {
      setAuditLogs(db.getAll('audit_logs'));
    });
    return () => unsub();
  }, []);

  // Distinct users in logs
  const distinctUsers = useMemo(() => {
    const usersMap = new Map<string, { email: string; name: string }>();
    auditLogs.forEach((l) => {
      const email = l.user_email || l.created_by || 'system';
      const name = l.user_name_ar || l.user_email || 'مستخدم النظام';
      if (!usersMap.has(email)) {
        usersMap.set(email, { email, name });
      }
    });
    return Array.from(usersMap.values());
  }, [auditLogs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      // Module filter
      if (moduleFilter !== 'ALL') {
        const mod = (log.module_name || log.table_name || '').toLowerCase();
        if (moduleFilter === 'CRM') {
          if (!mod.includes('عملاء') && !mod.includes('customer') && !mod.includes('crm') && !mod.includes('متابعات')) {
            return false;
          }
        } else if (moduleFilter === 'ACCOUNTING') {
          if (
            !mod.includes('فاتورة') &&
            !mod.includes('فواتير') &&
            !mod.includes('مصروف') &&
            !mod.includes('قيد') &&
            !mod.includes('حساب') &&
            !mod.includes('قبض') &&
            !mod.includes('invoice') &&
            !mod.includes('expense') &&
            !mod.includes('journal')
          ) {
            return false;
          }
        } else if (moduleFilter === 'OPERATIONS') {
          if (!mod.includes('معامل') && !mod.includes('transaction') && !mod.includes('خدم') && !mod.includes('حجز')) {
            return false;
          }
        } else if (moduleFilter === 'HR') {
          if (!mod.includes('موظف') && !mod.includes('راتب') && !mod.includes('إجاز') && !mod.includes('employee') && !mod.includes('payroll')) {
            return false;
          }
        }
      }

      // Action Filter
      if (actionFilter !== 'ALL') {
        const act = (log.action_type || '').toLowerCase();
        if (!act.includes(actionFilter.toLowerCase())) return false;
      }

      // User Filter
      if (userFilter !== 'ALL') {
        const uEmail = (log.user_email || log.created_by || '').toLowerCase();
        if (uEmail !== userFilter.toLowerCase()) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const text = `${log.id} ${log.record_id} ${log.change_summary_ar} ${log.user_email} ${log.user_name_ar} ${log.module_name} ${log.action_type}`.toLowerCase();
        return text.includes(q);
      }

      return true;
    });
  }, [auditLogs, moduleFilter, actionFilter, userFilter, searchQuery]);

  // Export CSV
  const handleExportCsv = () => {
    const headers = [
      'ID',
      'Timestamp',
      'User Name',
      'User Email',
      'Role',
      'Module',
      'Action',
      'Target ID',
      'Summary (AR)',
      'IP Address',
    ];
    const rows = filteredLogs.map((log) => [
      log.id,
      log.created_at,
      log.user_name_ar || log.user_name || '',
      log.user_email || log.created_by || '',
      log.user_role || '',
      log.module_name || '',
      log.action_type || '',
      log.record_id || '',
      log.change_summary_ar || '',
      log.ip_address || '192.168.1.1',
    ]);
    downloadCSV('Gulfsand_Activity_Audit_Logs', headers, rows);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300" dir={isAr ? 'rtl' : 'ltr'}>
      {/* ----------------- Header & Stats ----------------- */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {isAr ? 'سجل التدقيق والرقابة الأمنية (Activity Audit Log)' : 'Activity Audit & Security Log'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                {isAr ? 'غير قابل للتعديل' : 'Immutable Ledger'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isAr
                ? 'تتبع وتوثيق كافة العمليات، تعديلات ملفات العملاء، القيود المالية، وفواتير جلف ساند مع اسم المستخدم والتوقيت الدقيق'
                : 'Complete audit trail of user modifications across CRM customer files, accounting entries, and operational transactions'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition"
            >
              <Download className="w-4 h-4" />
              <span>{isAr ? 'تصدير التقرير (CSV)' : 'Export CSV'}</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Module Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs w-full md:w-auto">
            <span className="text-slate-400 font-bold text-[11px] shrink-0">{isAr ? 'النطاق:' : 'Scope:'}</span>
            {[
              { id: 'ALL', labelAr: 'كافة الأنشطة', labelEn: 'All Activities' },
              { id: 'CRM', labelAr: 'ملفات العملاء (CRM)', labelEn: 'CRM / Customers' },
              { id: 'ACCOUNTING', labelAr: 'المحاسبة والمالية', labelEn: 'Accounting & Finance' },
              { id: 'OPERATIONS', labelAr: 'المعاملات والطباعة', labelEn: 'Operations' },
              { id: 'HR', labelAr: 'الموارد البشرية والرواتب', labelEn: 'HR & Payroll' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setModuleFilter(m.id)}
                className={`px-3 py-1 rounded-lg font-bold text-xs shrink-0 transition ${
                  moduleFilter === m.id
                    ? 'bg-rose-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {isAr ? m.labelAr : m.labelEn}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute top-2.5 right-3 rtl:right-3 ltr:right-auto ltr:left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'بحث في سجل التعديلات...' : 'Search audit log...'}
              className="w-full py-1.5 px-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Action Type & User Selectors */}
        <div className="mt-3 flex items-center gap-3 text-xs flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">{isAr ? 'نوع الإجراء:' : 'Action Type:'}</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
            >
              <option value="ALL">{isAr ? 'كافة العمليات' : 'All Actions'}</option>
              <option value="إنشاء">{isAr ? 'إنشاء سجل (CREATE)' : 'Create'}</option>
              <option value="تعديل">{isAr ? 'تعديل بيانات (UPDATE)' : 'Update'}</option>
              <option value="حذف">{isAr ? 'حذف نهائي (DELETE)' : 'Delete'}</option>
              <option value="أرشفة">{isAr ? 'أرشفة (ARCHIVE)' : 'Archive'}</option>
              <option value="إقفال">{isAr ? 'إقفال مالي (CLOSE)' : 'Close'}</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-500">{isAr ? 'المستخدم المنفذ:' : 'Executed By:'}</span>
            <select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              className="py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
            >
              <option value="ALL">{isAr ? 'كافة الموظفين والمستخدمين' : 'All Users'}</option>
              {distinctUsers.map((u) => (
                <option key={u.email} value={u.email}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <span className="ms-auto text-slate-400 font-bold text-[11px]">
            {filteredLogs.length} {isAr ? 'سجل مطابق' : 'matching records'}
          </span>
        </div>
      </div>

      {/* ----------------- Table View ----------------- */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <div className="overflow-x-auto border border-slate-100 dark:border-slate-800 rounded-xl">
          <table className="w-full text-xs text-right rtl:text-right ltr:text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold">
              <tr>
                <th className="p-3"># {isAr ? 'كود التدقيق' : 'Audit ID'}</th>
                <th className="p-3">{isAr ? 'التاريخ والوقت' : 'Timestamp'}</th>
                <th className="p-3">{isAr ? 'المستخدم' : 'User'}</th>
                <th className="p-3">{isAr ? 'الوحدة / الشاشة' : 'Module'}</th>
                <th className="p-3">{isAr ? 'نوع العملية' : 'Action'}</th>
                <th className="p-3">{isAr ? 'رقم السجل' : 'Record ID'}</th>
                <th className="p-3">{isAr ? 'بيان التعديل' : 'Change Summary'}</th>
                <th className="p-3 text-center">{isAr ? 'تفاصيل' : 'Details'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => {
                  const isCreate = log.action_type?.includes('إنشاء');
                  const isDelete = log.action_type?.includes('حذف');
                  const isUpdate = log.action_type?.includes('تعديل');

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="p-3 font-mono font-bold text-slate-500 dark:text-slate-400">
                        {log.id}
                      </td>
                      <td className="p-3 font-mono text-slate-600 dark:text-slate-300 text-[11px]">
                        {log.created_at ? log.created_at.slice(0, 19).replace('T', ' ') : '-'}
                      </td>
                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">
                        <div>{log.user_name_ar || log.user_email || 'مستخدم النظام'}</div>
                        <span className="text-[10px] text-slate-400 font-normal">{log.user_email}</span>
                      </td>
                      <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                          {log.module_name || log.table_name}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isCreate
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : isDelete
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : isUpdate
                              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {log.action_type}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {log.record_id || '-'}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {log.change_summary_ar || '-'}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => setSelectedAuditRecord(log)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg transition"
                          title={isAr ? 'عرض التفاصيل' : 'View Details'}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 dark:text-slate-500">
                    {isAr ? 'لا توجد سجلات تدقيق مطابقة للشروط' : 'No audit records found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ----------------- Modal: Audit Details View ----------------- */}
      {selectedAuditRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-xl">
                  <ShieldAlert className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {isAr ? 'تفاصيل سجل التدقيق الأمني' : 'Audit Entry Details'}
                  </h3>
                  <span className="font-mono text-xs text-rose-600 dark:text-rose-400 font-bold">
                    {selectedAuditRecord.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAuditRecord(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">{isAr ? 'نوع الإجراء:' : 'Action Type:'}</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedAuditRecord.action_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isAr ? 'الوحدة / الجدول:' : 'Module / Table:'}</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedAuditRecord.module_name} ({selectedAuditRecord.table_name})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isAr ? 'معرف السجل المعني:' : 'Target Record ID:'}</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{selectedAuditRecord.record_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isAr ? 'المستخدم المنفذ:' : 'Executed By:'}</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedAuditRecord.user_name_ar} ({selectedAuditRecord.user_email})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{isAr ? 'التوقيت الدقيق:' : 'Exact Timestamp:'}</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{selectedAuditRecord.created_at}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 block mb-1">{isAr ? 'نص بيان التغيير المسجل:' : 'Recorded Change Summary:'}</span>
                <p className="text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 font-medium">
                  {selectedAuditRecord.change_summary_ar}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedAuditRecord(null)}
                className="px-4 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl font-bold text-xs transition"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
