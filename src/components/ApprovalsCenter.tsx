import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { UserRole } from '../types/schema';
import { ROLE_PERMISSIONS } from '../utils/rbac';
import { ShieldCheck, CheckCircle2, XCircle, Clock, AlertTriangle, UserCheck, Sparkles, Filter } from 'lucide-react';

interface ApprovalsCenterProps {
  currentRole: UserRole;
  lang: 'ar' | 'en';
  onUpdated?: () => void;
}

export const ApprovalsCenter: React.FC<ApprovalsCenterProps> = ({ currentRole, lang, onUpdated }) => {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'معلق' | 'معتمد' | 'مرفوض'>('معلق');
  const [feedback, setFeedback] = useState<{ id: string; msg: string; type: 'success' | 'error' } | null>(null);

  const permissions = ROLE_PERMISSIONS[currentRole];
  const canApproveAny =
    permissions.canApproveDiscounts || permissions.canApproveExpenses || permissions.canApproveLeaves;

  const loadApprovals = () => {
    const list = db.getAll('approvals');
    setApprovals(list);
  };

  useEffect(() => {
    loadApprovals();
    const unsub = db.subscribe('approvals', () => loadApprovals());
    return () => unsub();
  }, []);

  const handleAction = (approvalId: string, action: 'معتمد' | 'مرفوض') => {
    const appItem = db.getById('approvals', approvalId);
    if (!appItem) return;

    // Privilege check per approval type
    if (appItem.approval_type === 'تخفيض_سعر' && !permissions.canApproveDiscounts) {
      setFeedback({
        id: approvalId,
        msg: lang === 'ar' ? 'صلاحيتك الحالية لا تسمح باعتماد استثناءات الأسعار.' : 'Unauthorized for discount approvals.',
        type: 'error',
      });
      return;
    }

    if (appItem.approval_type === 'سند_صرف_كبير' && !permissions.canApproveExpenses) {
      setFeedback({
        id: approvalId,
        msg: lang === 'ar' ? 'صلاحيتك الحالية لا تسمح باعتماد سندات الصرف الكبيرة (مقتصر على المدير).' : 'Unauthorized for expense approvals.',
        type: 'error',
      });
      return;
    }

    try {
      db.update('approvals', approvalId, {
        status: action,
        approved_by_role: currentRole,
        approval_date: new Date().toISOString(),
      });

      // If it was a transaction approval, update transaction status as well
      if (appItem.module_name?.includes('معاملات') && appItem.record_id) {
        const trx = db.getById('transactions', appItem.record_id);
        if (trx) {
          db.update('transactions', appItem.record_id, {
            status: action === 'معتمد' ? 'قيد التنفيذ' : 'ملغاة',
          });
        }
      }

      setFeedback({
        id: approvalId,
        msg:
          action === 'معتمد'
            ? lang === 'ar'
              ? 'تم اعتماد الطلب بنجاح وتحديث النظام.'
              : 'Approved successfully.'
            : lang === 'ar'
            ? 'تم رفض الطلب وتحديث السجل.'
            : 'Rejected.',
        type: 'success',
      });

      loadApprovals();
      if (onUpdated) onUpdated();
    } catch (e: any) {
      setFeedback({ id: approvalId, msg: e.message || 'حدث خطأ.', type: 'error' });
    }
  };

  const filteredList = approvals.filter((a) => {
    if (filterStatus === 'all') return true;
    return a.status === filterStatus;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {lang === 'ar' ? 'مركز الموافقات والحوكمة التشغيلية' : 'Governance & Approvals Center'}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'ar'
                ? 'استثناءات الأسعار تحت الحد الأدنى، اعتمادات الصرف، والإجازات حسب الصلاحيات'
                : 'Role-based approval workflows for discounts, large expenses & leaves'}
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilterStatus('معلق')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === 'معلق' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'ar' ? 'بانتظار الاعتماد' : 'Pending'} (
            {approvals.filter((a) => a.status === 'معلق').length})
          </button>
          <button
            onClick={() => setFilterStatus('معتمد')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === 'معتمد' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'ar' ? 'المعتمدة' : 'Approved'}
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {lang === 'ar' ? 'الكل' : 'All'}
          </button>
        </div>
      </div>

      {/* Approvals List */}
      <div className="pt-4 space-y-3">
        {filteredList.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-medium">
              {lang === 'ar' ? 'لا توجد طلبات موافقة في هذا القسم حالياً' : 'No approval requests found.'}
            </p>
          </div>
        ) : (
          filteredList.map((app) => {
            const isPending = app.status === 'معلق';
            const isApproved = app.status === 'معتمد';

            return (
              <div
                key={app.id}
                className={`p-4 rounded-xl border transition-all ${
                  isPending
                    ? 'border-amber-200 bg-amber-50/40 hover:bg-amber-50/70'
                    : isApproved
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                        {app.id}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          app.approval_type === 'تخفيض_سعر'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {app.approval_type === 'تخفيض_سعر'
                          ? lang === 'ar'
                            ? 'طلب تخفيض سعر'
                            : 'Price Discount'
                          : lang === 'ar'
                          ? 'اعتماد سند صرف'
                          : 'Expense Approval'}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {app.created_at ? new Date(app.created_at).toLocaleDateString() : ''}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-800">{app.reason}</p>
                    <div className="text-xs text-slate-500 flex items-center gap-3">
                      <span>
                        {lang === 'ar' ? 'مقدم الطلب:' : 'Requested by:'} <strong>{app.requested_by || 'موظف العمليات'}</strong>
                      </span>
                      {app.requested_amount_aed && (
                        <span>
                          {lang === 'ar' ? 'المبلغ المطلوب:' : 'Amount:'}{' '}
                          <strong className="font-mono text-slate-800">{app.requested_amount_aed} د.إ</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions according to Role */}
                  <div className="flex items-center gap-2">
                    {isPending ? (
                      canApproveAny ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAction(app.id, 'معتمد')}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {lang === 'ar' ? 'اعتماد وموافقة' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleAction(app.id, 'مرفوض')}
                            className="px-3 py-2 bg-white hover:bg-rose-50 border border-rose-300 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            {lang === 'ar' ? 'رفض' : 'Reject'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs px-3 py-1.5 bg-slate-200 text-slate-600 rounded-lg font-medium">
                          {lang === 'ar' ? 'بانتظار المشرف/المدير' : 'Awaiting Supervisor'}
                        </span>
                      )
                    ) : (
                      <span
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl ${
                          isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isApproved ? (lang === 'ar' ? 'معتمد' : 'Approved') : lang === 'ar' ? 'مرفوض' : 'Rejected'}
                      </span>
                    )}
                  </div>
                </div>

                {feedback && feedback.id === app.id && (
                  <div
                    className={`mt-2 p-2 rounded-lg text-xs font-medium ${
                      feedback.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {feedback.msg}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
