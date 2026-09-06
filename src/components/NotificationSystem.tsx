import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../db/database';
import {
  Bell,
  AlertTriangle,
  Calendar,
  Clock,
  CheckCircle2,
  DollarSign,
  FileText,
  MessageCircle,
  ExternalLink,
  X,
  ChevronRight,
  Filter,
  Sparkles,
  ShieldAlert,
  User,
  RefreshCw,
} from 'lucide-react';
import { UserRole } from '../types/schema';

export interface NotificationItem {
  id: string;
  type: 'EXPIRY' | 'PAYMENT_DUE' | 'APPROVAL' | 'BOOKING';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  date: string;
  daysRemaining?: number;
  amountDue?: number;
  customerId?: string;
  customerNameAr?: string;
  customerPhone?: string;
  referenceCode?: string;
  targetTab?: 'CUSTOMERS' | 'ACCOUNTING' | 'APPROVALS' | 'WORKFLOW' | 'DATA';
}

interface NotificationSystemProps {
  currentRole: UserRole;
  lang: 'ar' | 'en';
  onNavigateTab: (tab: any) => void;
  onViewCustomer?: (customerId: string) => void;
}

export const NotificationSystem: React.FC<NotificationSystemProps> = ({
  currentRole,
  lang,
  onNavigateTab,
  onViewCustomer,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'EXPIRY' | 'PAYMENT' | 'APPROVAL'>('ALL');
  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('gulfsand_dismissed_notifs') || '[]');
    } catch {
      return [];
    }
  });

  const [rawDocs, setRawDocs] = useState<any[]>([]);
  const [rawCustomers, setRawCustomers] = useState<any[]>([]);
  const [rawInvoices, setRawInvoices] = useState<any[]>([]);
  const [rawApprovals, setRawApprovals] = useState<any[]>([]);

  const loadAll = () => {
    setRawDocs(db.getAll('documents'));
    setRawCustomers(db.getAll('customers'));
    setRawInvoices(db.getAll('invoices'));
    setRawApprovals(db.getAll('approvals'));
  };

  useEffect(() => {
    loadAll();
    const unsub1 = db.subscribe('documents', loadAll);
    const unsub2 = db.subscribe('customers', loadAll);
    const unsub3 = db.subscribe('invoices', loadAll);
    const unsub4 = db.subscribe('approvals', loadAll);
    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
    };
  }, []);

  const isAr = lang === 'ar';

  // Compute Active Smart Notifications
  const notifications: NotificationItem[] = useMemo(() => {
    const list: NotificationItem[] = [];
    const today = new Date();

    // 1. Document Expiry Alerts (Passports, Visas, Trade Licenses, Emirates IDs)
    rawDocs.forEach((doc) => {
      let days = Number(doc.days_until_expiry);
      if (isNaN(days) && doc.expiry_date) {
        const exp = new Date(doc.expiry_date);
        days = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      }

      if (days !== undefined && days <= 45) {
        const isCritical = days <= 7;
        const isExpired = days <= 0;
        const cust = rawCustomers.find((c) => c.id === doc.customer_id);

        list.push({
          id: `doc-${doc.id}`,
          type: 'EXPIRY',
          severity: isExpired ? 'CRITICAL' : isCritical ? 'CRITICAL' : 'WARNING',
          titleAr: isExpired
            ? `انتهت صلاحية: ${doc.title_ar || doc.document_type}`
            : `قرب انتهاء: ${doc.title_ar || doc.document_type}`,
          titleEn: isExpired
            ? `Expired: ${doc.document_type || doc.title_en || 'Document'}`
            : `Expiring Soon: ${doc.document_type || doc.title_en || 'Document'}`,
          descriptionAr: isExpired
            ? `انتهت الوثيقة منذ ${Math.abs(days)} يوم للعميل (${doc.customer_name_ar || cust?.name_ar || 'عميل'}). يُرجى تجديد المعاملة فوراً.`
            : `متبقي ${days} يوم على انتهاء صلاحية المستند للعميل (${doc.customer_name_ar || cust?.name_ar || 'عميل'}).`,
          descriptionEn: isExpired
            ? `Document expired ${Math.abs(days)} days ago for client (${cust?.name_en || doc.customer_name_ar || 'Client'}). Urgent renewal required.`
            : `${days} days remaining until expiry for client (${cust?.name_en || doc.customer_name_ar || 'Client'}).`,
          date: doc.expiry_date || 'N/A',
          daysRemaining: days,
          customerId: doc.customer_id,
          customerNameAr: doc.customer_name_ar || cust?.name_ar,
          customerPhone: cust?.phone,
          referenceCode: doc.document_number || doc.id,
          targetTab: 'CUSTOMERS',
        });
      }
    });

    // 2. Customer Overdue Invoices & Payment Due
    rawInvoices.forEach((inv) => {
      const balanceDue = Number(inv.balance_due_aed) || (Number(inv.total_amount_aed) - Number(inv.paid_amount_aed || 0));
      const isUnpaid = inv.payment_status === 'غير مدفوع' || inv.payment_status === 'مدفوع جزئياً' || inv.status === 'متأخرة';

      if (balanceDue > 0 && isUnpaid) {
        const cust = rawCustomers.find((c) => c.id === inv.customer_id);
        list.push({
          id: `inv-${inv.id}`,
          type: 'PAYMENT_DUE',
          severity: balanceDue > 3000 ? 'CRITICAL' : 'WARNING',
          titleAr: `مستحقات دفع معلقة: فاتورة ${inv.invoice_number || inv.id}`,
          titleEn: `Outstanding Payment: Invoice ${inv.invoice_number || inv.id}`,
          descriptionAr: `مبلغ متبقي ${balanceDue.toLocaleString()} د.إ بذمة العميل (${cust?.name_ar || inv.customer_name_ar || 'عميل'}).`,
          descriptionEn: `Outstanding balance of ${balanceDue.toLocaleString()} AED due from (${cust?.name_en || cust?.name_ar || 'Client'}).`,
          date: inv.due_date || inv.issue_date || 'N/A',
          amountDue: balanceDue,
          customerId: inv.customer_id,
          customerNameAr: cust?.name_ar || inv.customer_name_ar,
          customerPhone: cust?.phone,
          referenceCode: inv.invoice_number || inv.id,
          targetTab: 'ACCOUNTING',
        });
      }
    });

    // 3. Pending Governance Approvals
    rawApprovals.forEach((app) => {
      if (app.status === 'بانتظار الموافقة' || app.status === 'معلق') {
        list.push({
          id: `app-${app.id}`,
          type: 'APPROVAL',
          severity: 'INFO',
          titleAr: `طلب اعتماد معلق: ${app.approval_type_ar || app.approval_type || 'طلب مالي'}`,
          titleEn: `Pending Approval: ${app.approval_type || 'Request'}`,
          descriptionAr: `طلب بقيمة ${Number(app.amount_aed || 0).toLocaleString()} د.إ مقدم من (${app.requested_by_name || 'موظف'}) يتطلب مراجعة الإدارة.`,
          descriptionEn: `Request of ${Number(app.amount_aed || 0).toLocaleString()} AED by (${app.requested_by_name || 'Staff'}) requires management sign-off.`,
          date: app.created_at?.slice(0, 10) || 'Today',
          amountDue: Number(app.amount_aed || 0),
          referenceCode: app.approval_code || app.id,
          targetTab: 'APPROVALS',
        });
      }
    });

    // Sort by Severity (CRITICAL first, then WARNING, then INFO)
    const severityOrder = { CRITICAL: 0, WARNING: 1, INFO: 2 };
    return list.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  }, [rawDocs, rawCustomers, rawInvoices, rawApprovals]);

  // Active (non-dismissed) list
  const activeNotifications = useMemo(() => {
    return notifications.filter((n) => !dismissedIds.includes(n.id));
  }, [notifications, dismissedIds]);

  // Filtered List
  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'ALL') return activeNotifications;
    if (activeFilter === 'EXPIRY') return activeNotifications.filter((n) => n.type === 'EXPIRY');
    if (activeFilter === 'PAYMENT') return activeNotifications.filter((n) => n.type === 'PAYMENT_DUE');
    if (activeFilter === 'APPROVAL') return activeNotifications.filter((n) => n.type === 'APPROVAL');
    return activeNotifications;
  }, [activeNotifications, activeFilter]);

  const criticalCount = activeNotifications.filter((n) => n.severity === 'CRITICAL').length;
  const expiryCount = activeNotifications.filter((n) => n.type === 'EXPIRY').length;
  const paymentCount = activeNotifications.filter((n) => n.type === 'PAYMENT_DUE').length;

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    try {
      localStorage.setItem('gulfsand_dismissed_notifs', JSON.stringify(updated));
    } catch {}
  };

  const handleClearAllDismissed = () => {
    setDismissedIds([]);
    try {
      localStorage.removeItem('gulfsand_dismissed_notifs');
    } catch {}
  };

  const handleSendWhatsAppReminder = (item: NotificationItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.customerPhone) {
      alert(isAr ? 'لا يوجد رقم هاتف مسجل لهذا العميل.' : 'No phone number available for this customer.');
      return;
    }

    const cleanPhone = item.customerPhone.replace(/[^0-9]/g, '');
    let msg = '';
    if (item.type === 'EXPIRY') {
      msg = isAr
        ? `عزيزنا العميل المحترم (${item.customerNameAr || ''})، نود تذكيركم بقرب انتهاء صلاحية مستندكم (${item.titleAr}) المسجل لدينا في مركز جلف ساند للطباعة والخدمات. يرجى التواصل معنا للبدء في إجراءات التجديد فوراً. شكراً لكم.`
        : `Dear Valued Client (${item.customerNameAr || ''}), this is a courtesy reminder from Gulf Sand Typing Services that your document (${item.titleEn}) is expiring soon. Please contact us to proceed with renewals. Thank you.`;
    } else {
      msg = isAr
        ? `عزيزنا العميل المحترم (${item.customerNameAr || ''})، تحية طيبة من مركز جلف ساند للطباعة. نود إحاطتكم بوجود رصيد مستحق بقيمة (${item.amountDue?.toLocaleString()} درهم) بخصوص (${item.referenceCode}). يرجى التكرم بالسداد في أقرب وقت. شاكرين حسن تعاونكم.`
        : `Dear Client (${item.customerNameAr || ''}), greetings from Gulf Sand Services. Kindly be informed of an outstanding balance of (${item.amountDue?.toLocaleString()} AED) for (${item.referenceCode}). Thank you.`;
    }

    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="relative" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header Notification Bell Trigger */}
      <button
        id="btn-erp-notifications-bell"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition active:scale-95 flex items-center justify-center cursor-pointer"
        title={isAr ? 'مركز التنبيهات الذكية وانتهاء الصلاحيات' : 'Smart Alerts & Expiration Center'}
      >
        <Bell className="w-5 h-5 text-slate-700" />
        {activeNotifications.length > 0 && (
          <span
            className={`absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full text-[10px] font-black text-white flex items-center justify-center shadow-xs animate-pulse ${
              criticalCount > 0 ? 'bg-rose-600' : 'bg-amber-500'
            }`}
          >
            {activeNotifications.length}
          </span>
        )}
      </button>

      {/* Floating Notification Popover Drawer */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute top-12 left-0 sm:right-auto sm:left-0 w-[92vw] sm:w-[420px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Popover Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black flex items-center gap-2">
                    <span>{isAr ? 'مركز التنبيهات ومواعيد الاستحقاق' : 'Smart Alerts & Expirations'}</span>
                    {activeNotifications.length > 0 && (
                      <span className="text-[10px] bg-rose-500 text-white px-2 py-0.5 rounded-full font-mono font-bold">
                        {activeNotifications.length}
                      </span>
                    )}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    {isAr
                      ? `${expiryCount} انتهاء صلاحية • ${paymentCount} مستحقات دفع`
                      : `${expiryCount} document expirations • ${paymentCount} payments due`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={loadAll}
                  title={isAr ? 'تحديث' : 'Refresh'}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs">
              <button
                onClick={() => setActiveFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 ${
                  activeFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {isAr ? 'الكل' : 'All'} ({activeNotifications.length})
              </button>

              <button
                onClick={() => setActiveFilter('EXPIRY')}
                className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 flex items-center gap-1 ${
                  activeFilter === 'EXPIRY'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Calendar className="w-3 h-3" />
                <span>{isAr ? 'صلاحيات الوثائق' : 'Expirations'}</span>
                <span className="text-[10px] opacity-80 font-mono">({expiryCount})</span>
              </button>

              <button
                onClick={() => setActiveFilter('PAYMENT')}
                className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 flex items-center gap-1 ${
                  activeFilter === 'PAYMENT'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <DollarSign className="w-3 h-3" />
                <span>{isAr ? 'مستحقات دفع' : 'Due Payments'}</span>
                <span className="text-[10px] opacity-80 font-mono">({paymentCount})</span>
              </button>

              <button
                onClick={() => setActiveFilter('APPROVAL')}
                className={`px-2.5 py-1 rounded-lg font-bold transition shrink-0 flex items-center gap-1 ${
                  activeFilter === 'APPROVAL'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                <ShieldAlert className="w-3 h-3" />
                <span>{isAr ? 'الاعتمادات' : 'Approvals'}</span>
              </button>
            </div>

            {/* Notifications Scrollable List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[55vh]">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">
                    {isAr ? 'لا توجد تنبيهات معلقة حالياً' : 'No pending alerts!'}
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    {isAr
                      ? 'جميع المستندات سارية والمستحقات والاعتمادات في وضع ممتاز.'
                      : 'All documents are valid, payments are up to date, and approvals resolved.'}
                  </p>
                  {dismissedIds.length > 0 && (
                    <button
                      onClick={handleClearAllDismissed}
                      className="text-[11px] text-blue-600 font-bold hover:underline pt-2 block mx-auto"
                    >
                      {isAr ? `إعادة إظهار (${dismissedIds.length}) تنبيهات تم إخفاؤها` : `Restore ${dismissedIds.length} dismissed alerts`}
                    </button>
                  )}
                </div>
              ) : (
                filteredNotifications.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (item.targetTab) onNavigateTab(item.targetTab.toLowerCase());
                      if (item.customerId && onViewCustomer) onViewCustomer(item.customerId);
                      setIsOpen(false);
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer relative group ${
                      item.severity === 'CRITICAL'
                        ? 'bg-rose-50/70 border-rose-200 hover:border-rose-300 hover:bg-rose-50'
                        : item.severity === 'WARNING'
                        ? 'bg-amber-50/70 border-amber-200 hover:border-amber-300 hover:bg-amber-50'
                        : 'bg-blue-50/70 border-blue-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            item.severity === 'CRITICAL'
                              ? 'bg-rose-200 text-rose-800'
                              : item.severity === 'WARNING'
                              ? 'bg-amber-200 text-amber-800'
                              : 'bg-blue-200 text-blue-800'
                          }`}
                        >
                          {item.type === 'EXPIRY' ? (
                            <Calendar className="w-3.5 h-3.5" />
                          ) : item.type === 'PAYMENT_DUE' ? (
                            <DollarSign className="w-3.5 h-3.5" />
                          ) : (
                            <ShieldAlert className="w-3.5 h-3.5" />
                          )}
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-slate-900">
                              {isAr ? item.titleAr : item.titleEn}
                            </span>
                            {item.severity === 'CRITICAL' && (
                              <span className="text-[9px] font-black bg-rose-600 text-white px-1.5 py-0.2 rounded-md">
                                {isAr ? 'عاجل' : 'URGENT'}
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-slate-600 leading-snug">
                            {isAr ? item.descriptionAr : item.descriptionEn}
                          </p>

                          <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-500">
                            <span>{isAr ? 'التاريخ:' : 'Date:'} <b className="font-mono text-slate-700">{item.date}</b></span>
                            {item.referenceCode && (
                              <span>{isAr ? 'المرجع:' : 'Ref:'} <b className="font-mono text-slate-700">{item.referenceCode}</b></span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Dismiss Action */}
                      <button
                        onClick={(e) => handleDismiss(item.id, e)}
                        title={isAr ? 'إخفاء التنبيه' : 'Dismiss'}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition shrink-0"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Action Toolbar */}
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {item.customerPhone && (
                          <button
                            onClick={(e) => handleSendWhatsAppReminder(item, e)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-xs transition"
                            title={isAr ? 'إرسال تذكير عبر واتساب' : 'Send WhatsApp Reminder'}
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>{isAr ? 'تذكير واتساب' : 'WhatsApp'}</span>
                          </button>
                        )}

                        {item.customerId && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onViewCustomer) onViewCustomer(item.customerId!);
                              setIsOpen(false);
                            }}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200 shadow-2xs transition"
                          >
                            <User className="w-3 h-3 text-slate-500" />
                            <span>{isAr ? 'ملف العميل' : 'Customer'}</span>
                          </button>
                        )}
                      </div>

                      <span className="text-[10px] text-blue-600 font-bold flex items-center gap-0.5 group-hover:underline">
                        <span>{isAr ? 'فتح' : 'View'}</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Popover Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">
                {isAr ? 'مركز العمليات الذكي - العين' : 'Al Ain Smart Alerts'}
              </span>
              <button
                onClick={() => {
                  onNavigateTab('data');
                  setIsOpen(false);
                }}
                className="text-blue-600 hover:text-blue-800 font-bold text-xs flex items-center gap-1"
              >
                <span>{isAr ? 'سجل المستندات الكامل' : 'All Documents'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
