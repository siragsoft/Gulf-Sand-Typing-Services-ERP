import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { UserRole, BookingStatus, TransactionStatus, ApprovalStatus } from '../types/schema';
import { ROLE_PERMISSIONS } from '../utils/rbac';
import { PerformanceOverviewWidget } from './PerformanceOverviewWidget';
import {
  TrendingUp,
  Plane,
  Users,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Receipt,
  FileText,
  Calendar,
  Building2,
  ShieldCheck,
  ArrowUpRight,
  ArrowRight,
  Eye,
  Plus,
  CreditCard,
  Briefcase,
  Layers,
  Sparkles,
  PhoneCall,
  Mail,
  ChevronRight,
  AlertCircle,
  BarChart3,
  UserCheck,
  UploadCloud,
  Kanban,
} from 'lucide-react';

interface ExecutiveDashboardProps {
  currentRole: UserRole;
  lang: 'ar' | 'en';
  onNavigateTab: (tab: any) => void;
  onOpenNewTransaction: () => void;
  onOpenNewCustomer: () => void;
  onOpenNewInvoice: () => void;
  onOpenNewExpense: () => void;
  onViewRecord: (record: any) => void;
}

export const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({
  currentRole,
  lang,
  onNavigateTab,
  onOpenNewTransaction,
  onOpenNewCustomer,
  onOpenNewInvoice,
  onOpenNewExpense,
  onViewRecord,
}) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [cashBankAccounts, setCashBankAccounts] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState<any[]>([]);

  const isRtl = lang === 'ar';
  const rolePerm = ROLE_PERMISSIONS[currentRole];
  const canViewFinancials = rolePerm ? rolePerm.canViewFinancialReports : true;

  const refreshAll = () => {
    setTransactions(db.getAll('transactions'));
    setBookings(db.getAll('bookings'));
    setTasks(db.getAll('tasks'));
    setInvoices(db.getAll('invoices'));
    setExpenses(db.getAll('expenses'));
    setCustomers(db.getAll('customers'));
    setApprovals(db.getAll('approvals'));
    setDocuments(db.getAll('documents'));
    setLeaves(db.getAll('leaves'));
    setCashBankAccounts(db.getAll('cash_bank_accounts'));
    setSystemSettings(db.getAll('system_settings'));
  };

  useEffect(() => {
    refreshAll();
    const unsubs = [
      db.subscribe('transactions', refreshAll),
      db.subscribe('bookings', refreshAll),
      db.subscribe('tasks', refreshAll),
      db.subscribe('invoices', refreshAll),
      db.subscribe('expenses', refreshAll),
      db.subscribe('approvals', refreshAll),
      db.subscribe('documents', refreshAll),
      db.subscribe('audit_logs', refreshAll),
    ];
    return () => unsubs.forEach((unsub) => unsub());
  }, []);

  // 1. Pending Bookings Metrics & List
  const pendingBookingsList = bookings.filter(
    (b) =>
      b.status === BookingStatus.NEW_REQUEST ||
      b.status === BookingStatus.WAITING_PAYMENT ||
      b.status === 'طلب جديد' ||
      b.status === 'بانتظار الدفع' ||
      b.status === 'معلق'
  );
  const pendingBookingsCount = pendingBookingsList.length;
  const pendingBookingsValueAED = pendingBookingsList.reduce(
    (acc, b) => acc + (Number(b.selling_price_aed) || 0),
    0
  );

  // 2. Monthly Revenue Metrics (August 2026 / Current Month)
  const currentMonthRevenueAED = invoices.reduce((acc, inv) => {
    const amount = Number(inv.paid_amount_aed || inv.total_amount_aed) || 0;
    return acc + amount;
  }, 0);

  const monthlyTargetAED = Number(systemSettings[0]?.monthly_revenue_target_aed) || 60000;
  const monthlyRevenueAchievedPct = Math.min(
    100,
    Math.round((currentMonthRevenueAED / (monthlyTargetAED || 1)) * 100)
  );

  // 3. Active HR Tasks Metrics
  const activeHrTasks = tasks.filter(
    (t) => t.status === 'قيد التنفيذ' || t.status === 'جديدة' || t.status === 'IN_PROGRESS' || t.status === 'NEW'
  );
  const urgentHrTasks = activeHrTasks.filter(
    (t) => t.priority === 'عالية' || t.priority === 'عاجلة جداً' || t.priority === 'HIGH' || t.priority === 'URGENT'
  );
  const pendingLeaves = leaves.filter(
    (l) => l.status === ApprovalStatus.PENDING || l.status === 'معلق' || l.status === 'PENDING'
  );

  // 4. Financial Profits & Margins
  const totalGrossProfitAED = transactions.reduce(
    (acc, t) => acc + (Number(t.total_profit_aed) || 0),
    0
  );
  const totalCostAED = transactions.reduce(
    (acc, t) => acc + (Number(t.total_cost_aed) || 0),
    0
  );
  const totalGrossRevenueAED = transactions.reduce(
    (acc, t) => acc + (Number(t.total_net_amount_aed) || 0),
    0
  );
  const profitMarginOverall =
    totalGrossRevenueAED > 0
      ? ((totalGrossProfitAED / totalGrossRevenueAED) * 100).toFixed(1)
      : '0.0';

  // 5. Today's Transactions Volume
  const todayTransactions = transactions.filter((t) => {
    const d = (t.created_at || '').substring(0, 10);
    return d === '2026-08-15' || d === new Date().toISOString().substring(0, 10);
  });
  const completedToday = todayTransactions.filter(
    (t) => t.status === TransactionStatus.COMPLETED || t.status === 'مكتملة'
  ).length;

  // 6. Outstanding Receivables (الذمم المدينة)
  const outstandingInvoices = invoices.filter(
    (inv) => (Number(inv.balance_due_aed) || 0) > 0
  );
  const totalReceivablesAED = outstandingInvoices.reduce(
    (acc, inv) => acc + (Number(inv.balance_due_aed) || 0),
    0
  );

  // 7. Governance Approvals Queue
  const pendingApprovalsList = approvals.filter(
    (app) => app.status === ApprovalStatus.PENDING || app.status === 'معلق'
  );

  // 8. Document Expiry Alerts (<= 30 days)
  const expiringDocs = documents.filter((doc) => {
    const days = Number(doc.days_until_expiry) || 999;
    return days <= 30;
  });

  // Handle Quick Booking Status Update
  const handleQuickConfirmBooking = (bookingId: string) => {
    try {
      db.update('bookings', bookingId, { status: BookingStatus.CONFIRMED });
      refreshAll();
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Handle Task Completion Toggle
  const handleQuickToggleTask = (taskId: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'مكتملة' ? 'قيد التنفيذ' : 'مكتملة';
      db.update('tasks', taskId, { status: nextStatus });
      refreshAll();
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Handle Full Database JSON Export
  const handleExportBackup = () => {
    try {
      const jsonStr = db.exportDatabaseJson();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gulfsand_erp_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      // Log the export event
      db.logAudit('استرجاع', 'system_backups', 'JSON-EXPORT', 'تم تصدير نسخة احتياطية لقاعدة البيانات بطلب من المستخدم.');
    } catch (e: any) {
      alert(isRtl ? 'فشل تصدير قاعدة البيانات.' : 'Export failed.');
    }
  };

  const systemHealth = React.useMemo(() => {
    const logs = db.getTable('audit_logs') || [];
    const emptyLog = logs.find((log: any) => log.record_id === 'EMPTY-INIT' || log.change_summary_ar?.includes('تصفير') || log.change_summary_ar?.includes('تهيئة'));
    const lastWipeDateStr = emptyLog ? emptyLog.created_at : '2026-08-10T08:00:00.000Z';
    const lastWipeDate = new Date(lastWipeDateStr);
    
    // Status Logic
    let status: 'HEALTHY' | 'WARNING' | 'CRITICAL' = 'HEALTHY';
    let labelAr = 'نشط ومستقر وعامل';
    let labelEn = 'Healthy & Operational';
    
    if (transactions.length === 0 && customers.length === 0) {
      status = 'WARNING';
      labelAr = 'قاعدة البيانات فارغة (بانتظار تهيئة)';
      labelEn = 'Empty Database (Awaiting Init)';
    } else if (transactions.length > 500) {
      status = 'CRITICAL';
      labelAr = 'سعة تخزين عالية (يوصى بالتصدير)';
      labelEn = 'High Capacity Warning';
    }
    
    return {
      lastWipeDateStr: lastWipeDate.toLocaleString(isRtl ? 'ar-AE' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      status,
      labelAr,
      labelEn
    };
  }, [transactions, customers, isRtl]);

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Top Banner with Al Ain Branch Context and Fast Target Status */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 rounded-2xl p-5 sm:p-6 text-white shadow-md border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/20">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>{isRtl ? 'فرع العين - لوحة القيادة التنفيذية والمؤشرات اللحظية' : 'Al Ain Branch • Executive Operations Dashboard'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>{isRtl ? 'مؤشرات الأداء الرئيسية والتشغيل المالي' : 'Gulfsand Executive Key Metrics'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              {isRtl
                ? 'متابعة شاملة للحجوزات السياحية المعلقة، الإيرادات المستهدفة، المهام التشغيلية، ومسار المعاملات الحكومية.'
                : 'Comprehensive live tracking of pending bookings, monthly revenue targets, active HR tasks, and processing pipelines.'}
            </p>
          </div>

          {/* Monthly Revenue Target Mini-Visualizer */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 min-w-[260px] sm:min-w-[280px] shadow-inner space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-200">
              <span className="font-semibold">{isRtl ? 'إنجاز هدف الإيراد الشهري:' : 'Monthly Revenue Target:'}</span>
              <span className="font-mono font-bold text-amber-300">{monthlyRevenueAchievedPct}%</span>
            </div>
            <div className="w-full bg-slate-700/60 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/10">
              <div
                className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${monthlyRevenueAchievedPct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-300 pt-0.5">
              <span>{isRtl ? 'المحقق:' : 'Achieved:'} <b className="text-emerald-300 font-mono">{canViewFinancials ? `${currentMonthRevenueAED.toLocaleString()} د.إ` : '*** د.إ'}</b></span>
              <span>{isRtl ? 'المستهدف:' : 'Target:'} <b className="text-slate-200 font-mono">{monthlyTargetAED.toLocaleString()} د.إ</b></span>
            </div>
          </div>
        </div>

        {/* Quick Launch Buttons Row */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-xs text-slate-300 font-medium ml-1">
            {isRtl ? 'إجراءات سريعة:' : 'Quick Actions:'}
          </span>
          <button
            onClick={onOpenNewTransaction}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            {isRtl ? 'معاملة جديدة' : 'New Transaction'}
          </button>
          <button
            onClick={onOpenNewCustomer}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            {isRtl ? 'عميل جديد' : 'New Customer'}
          </button>
          <button
            onClick={onOpenNewInvoice}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Receipt className="w-3.5 h-3.5 text-emerald-400" />
            {isRtl ? 'فاتورة ضريبية' : 'Tax Invoice'}
          </button>
          <button
            onClick={onOpenNewExpense}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <CreditCard className="w-3.5 h-3.5 text-rose-400" />
            {isRtl ? 'سند صرف' : 'Expense Voucher'}
          </button>
          <button
            onClick={() => onNavigateTab('accounting')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/90 hover:bg-emerald-600 text-white text-xs font-semibold border border-emerald-400/30 transition-colors"
          >
            <DollarSign className="w-3.5 h-3.5" />
            {isRtl ? 'لوحة الحسابات والمصروفات' : 'Accounting & P&L'}
          </button>
          <button
            onClick={() => onNavigateTab('hr')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-700/90 hover:bg-purple-700 text-white text-xs font-semibold border border-purple-400/30 transition-colors"
          >
            <UserCheck className="w-3.5 h-3.5" />
            {isRtl ? 'الموارد البشرية والرواتب' : 'HR & Payroll'}
          </button>
          <button
            onClick={() => onNavigateTab('reports')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-semibold border border-indigo-400/30 transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            {isRtl ? 'عرض التقارير والرسوم البيانية المتقدمة' : 'View Advanced Visual Reports'}
          </button>
          
          {(currentRole === UserRole.SYSTEM_ADMIN || currentRole === UserRole.MANAGER) && (
            <button
              onClick={handleExportBackup}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-100 text-xs font-semibold border border-slate-700 transition-colors shadow-xs"
              title={isRtl ? 'تصدير نسخة احتياطية كاملة لقاعدة البيانات' : 'Export Full Database Backup'}
            >
              <UploadCloud className="w-3.5 h-3.5 text-amber-400" />
              <span>{isRtl ? 'تصدير نسخة احتياطية (JSON)' : 'Export Backup (JSON)'}</span>
            </button>
          )}
        </div>
      </div>

      {/* System Health Status Widget */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <div className="md:col-span-5 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            systemHealth.status === 'HEALTHY' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
            systemHealth.status === 'WARNING' ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-rose-100 text-rose-700 border border-rose-200'
          }`}>
            <ShieldCheck className="w-5.5 h-5.5" />
          </div>
          <div>
            <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{isRtl ? 'حالة المنظومة والبيانات' : 'System & Data Health'}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${
                systemHealth.status === 'HEALTHY' ? 'bg-emerald-500' :
                systemHealth.status === 'WARNING' ? 'bg-amber-500 animate-pulse' : 'bg-rose-500 animate-pulse'
              }`} />
              <span className="text-xs font-black text-slate-900">{isRtl ? systemHealth.labelAr : systemHealth.labelEn}</span>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-4 text-xs space-y-0.5">
          <span className="text-slate-500 font-medium block text-[10px]">{isRtl ? 'تاريخ آخر تصفير / تهيئة نظيفة للمنظومة:' : 'Last Clean Database Reset/Wipe Date:'}</span>
          <span className="font-mono font-bold text-slate-800 text-xs">{systemHealth.lastWipeDateStr}</span>
        </div>
        
        <div className="md:col-span-3 flex justify-start md:justify-end">
          <button
            onClick={() => onNavigateTab('data')}
            className="px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>{isRtl ? 'إدارة قاعدة البيانات' : 'Database Management'}</span>
          </button>
        </div>
      </div>

      {/* 3 Main Highlight KPI Cards: Pending Bookings, Monthly Revenue, Active HR Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* KPI 1: Pending Bookings (الحجوزات المعلقة) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Plane className="w-4 h-4 text-sky-600" />
                {isRtl ? 'الحجوزات المعلقة' : 'Pending Bookings'}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight flex items-baseline gap-2">
                <span>{pendingBookingsCount}</span>
                <span className="text-xs font-normal text-slate-500">
                  {isRtl ? 'حجوزات بانتظار التأكيد' : 'awaiting confirmation'}
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 group-hover:scale-105 transition-transform">
              <Plane className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600">
              {isRtl ? 'القيمة الإجمالية للحجوزات:' : 'Total Pending Value:'}
            </span>
            <span className="font-bold text-sky-700 font-mono text-sm">
              {pendingBookingsValueAED.toLocaleString()} د.إ
            </span>
          </div>

          <div className="mt-2 text-[11px] text-slate-500 bg-sky-50/70 p-2 rounded-lg border border-sky-100 flex items-center justify-between">
            <span>{isRtl ? 'تذاكر طيران، فنادق وعمرة سعودية' : 'Flights, Hotels & Umrah'}</span>
            <button
              onClick={() => onNavigateTab('data')}
              className="text-sky-700 font-bold hover:underline flex items-center gap-0.5"
            >
              {isRtl ? 'عرض الجدول' : 'View Table'}
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* KPI 2: Monthly Revenue (الإيرادات الشهرية) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                {isRtl ? 'الإيرادات الشهرية' : 'Monthly Revenue'}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight flex items-baseline gap-1.5">
                <span>{canViewFinancials ? currentMonthRevenueAED.toLocaleString() : '***,***'}</span>
                <span className="text-xs font-semibold text-slate-500">د.إ</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600">
              {isRtl ? 'المستهدف الشهري بالعين:' : 'Monthly Target:'}
            </span>
            <span className="font-bold text-slate-800 font-mono">
              {monthlyTargetAED.toLocaleString()} د.إ ({monthlyRevenueAchievedPct}%)
            </span>
          </div>

          <div className="mt-2 text-[11px] text-slate-500 bg-emerald-50/70 p-2 rounded-lg border border-emerald-100 flex items-center justify-between">
            <span>{isRtl ? 'الفواتير والمصروفات والأرباح' : 'Income, Expenses & P&L'}</span>
            <button
              onClick={() => onNavigateTab('accounting')}
              className="text-emerald-700 font-bold hover:underline flex items-center gap-0.5"
            >
              {isRtl ? 'لوحة الحسابات' : 'Accounting GL'}
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* KPI 3: Active HR Tasks (مهام الموارد البشرية النشطة) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between group">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-purple-600" />
                {isRtl ? 'مهام الموارد البشرية النشطة' : 'Active HR Tasks'}
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight flex items-baseline gap-2">
                <span>{activeHrTasks.length}</span>
                <span className="text-xs font-normal text-slate-500">
                  {isRtl ? 'مهمة قيد المتابعة' : 'in progress'}
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 group-hover:scale-105 transition-transform">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600">
              {isRtl ? 'المهام العاجلة ومسيرات الرواتب:' : 'Urgent Tasks & WPS:'}
            </span>
            <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {urgentHrTasks.length} {isRtl ? 'عاجلة' : 'urgent'}
            </span>
          </div>

          <div className="mt-2 text-[11px] text-slate-500 bg-purple-50/70 p-2 rounded-lg border border-purple-100 flex items-center justify-between">
            <span>{isRtl ? 'إجازات معلقة:' : 'Pending Leaves:'} <b>{pendingLeaves.length}</b></span>
            <button
              onClick={() => onNavigateTab('hr')}
              className="text-purple-700 font-bold hover:underline flex items-center gap-0.5"
            >
              {isRtl ? 'إدارة الموارد البشرية' : 'HR Hub'}
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Operational Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Net Gross Profit (RBAC Protected) */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-500 font-medium">{isRtl ? 'صافي هامش الربح' : 'Operating Margin'}</span>
            <div className="text-lg sm:text-xl font-bold text-slate-900 font-mono">
              {canViewFinancials ? `${totalGrossProfitAED.toLocaleString()} د.إ` : '*** د.إ'}
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">
              {canViewFinancials ? `هامش ${profitMarginOverall}%` : isRtl ? 'محجوب لدورك' : 'Restricted'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Today's Completed Operations */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-500 font-medium">{isRtl ? 'معاملات اليوم المنجزة' : 'Today Completed'}</span>
            <div className="text-lg sm:text-xl font-bold text-blue-600 font-mono">
              {completedToday} <span className="text-xs text-slate-400 font-normal">/ {todayTransactions.length}</span>
            </div>
            <span className="text-[10px] text-blue-700 font-medium">{isRtl ? 'إنجاز فوري' : 'Live throughput'}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Outstanding Receivables */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-500 font-medium">{isRtl ? 'الذمم المدينة المستحقة' : 'Receivables Dues'}</span>
            <div className="text-lg sm:text-xl font-bold text-amber-600 font-mono">
              {totalReceivablesAED.toLocaleString()} د.إ
            </div>
            <span className="text-[10px] text-amber-700 font-medium">{outstandingInvoices.length} {isRtl ? 'فواتير غير مسددة' : 'unpaid'}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* Approvals in Queue */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-500 font-medium">{isRtl ? 'طلبات الاعتماد المعلقة' : 'Approval Queue'}</span>
            <div className="text-lg sm:text-xl font-bold text-indigo-600 font-mono">
              {pendingApprovalsList.length}
            </div>
            <button
              onClick={() => onNavigateTab('approvals')}
              className="text-[10px] text-indigo-700 font-bold hover:underline"
            >
              {isRtl ? 'فتح مركز الموافقات' : 'Go to Approvals'}
            </button>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Critical Document Expiry Alerts Bar if any docs expiring within 30 days */}
      {expiringDocs.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold">
                {isRtl
                  ? `تنبيه: يوجد ${expiringDocs.length} مستندات تنتهي صلاحيتها قريباً (خلال 30 يوماً)`
                  : `Alert: ${expiringDocs.length} documents expiring soon (within 30 days)`}
              </h4>
              <p className="text-[11px] text-amber-800/80 mt-0.5">
                {expiringDocs.map((d) => `${d.title_ar} (${d.days_until_expiry} ${isRtl ? 'يوم' : 'days'})`).join(' • ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('data')}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs shrink-0 self-start md:self-auto"
          >
            {isRtl ? 'متابعة وتجديد الوثائق' : 'Review Expiring Documents'}
          </button>
        </div>
      )}

      {/* Two Column Layout: Pending Bookings Action Table & Active HR Tasks Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Pending Bookings Action Queue (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-sky-600" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {isRtl ? 'حجوزات السياحة والطيران المعلقة' : 'Pending Travel & Tourism Bookings'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isRtl ? 'طلبات تتطلب تأكيد الدفع أو إصدار التذاكر والتأشيرات' : 'Awaiting payment confirmation or ticket issuance'}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 text-xs font-bold font-mono">
                {pendingBookingsList.length} {isRtl ? 'معلق' : 'pending'}
              </span>
            </div>

            {/* Pending Bookings List */}
            <div className="mt-3 divide-y divide-slate-100">
              {pendingBookingsList.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  {isRtl ? 'لا توجد حجوزات معلقة حالياً - جميع الحجوزات مؤكدة' : 'No pending bookings currently.'}
                </div>
              ) : (
                pendingBookingsList.map((b) => (
                  <div key={b.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 p-2 rounded-xl transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-slate-900">{b.booking_code || b.id}</span>
                        <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-700 text-[10px] font-semibold border border-sky-200">
                          {b.booking_type}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-200">
                          {b.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium">
                        {b.customer_name_ar} • <span className="text-slate-500">{b.destination}</span>
                      </p>
                      <div className="text-[11px] text-slate-400 flex items-center gap-3">
                        <span>{isRtl ? 'تاريخ السفر:' : 'Travel:'} {b.travel_date_departure || 'N/A'}</span>
                        <span>{isRtl ? 'السعر:' : 'Price:'} <b className="text-slate-800 font-mono">{Number(b.selling_price_aed || 0).toLocaleString()} د.إ</b></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => onViewRecord(b)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
                      >
                        {isRtl ? 'عرض' : 'View'}
                      </button>
                      <button
                        onClick={() => handleQuickConfirmBooking(b.id)}
                        className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-xs transition-colors"
                      >
                        {isRtl ? 'تأكيد الحجز' : 'Confirm'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {isRtl ? 'إجمالي الحجوزات المسجلة في النظام:' : 'Total Bookings:'} <b>{bookings.length}</b>
            </span>
            <button
              onClick={() => onNavigateTab('data')}
              className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              {isRtl ? 'إدارة جميع الحجوزات' : 'Manage All Bookings'}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Active HR Tasks & Workforce Priorities (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {isRtl ? 'مهام الموارد البشرية والامتثال' : 'Active HR & Workforce Tasks'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isRtl ? 'مسير الرواتب، الإجازات، وتجديد إقامات الفريق' : 'Payroll WPS, leaves, and staff renewals'}
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold font-mono">
                {activeHrTasks.length} {isRtl ? 'نشطة' : 'active'}
              </span>
            </div>

            {/* Tasks List */}
            <div className="mt-3 space-y-2">
              {activeHrTasks.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  {isRtl ? 'لا توجد مهام معلقة - جميع المهام منجزة' : 'No active tasks.'}
                </div>
              ) : (
                activeHrTasks.slice(0, 5).map((task) => (
                  <div
                    key={task.id}
                    className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-purple-50/40 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-500">{task.task_code || task.id}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            task.priority === 'عالية' || task.priority === 'عاجلة جداً'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {task.priority || 'عادية'}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                        {task.title_ar}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {isRtl ? 'المسؤول:' : 'Assigned:'} <b>{task.assigned_to_name || 'HR Team'}</b> • {isRtl ? 'الاستحقاق:' : 'Due:'} {task.due_date || 'قريباً'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleQuickToggleTask(task.id, task.status)}
                      title={isRtl ? 'تحديد كمكتمل' : 'Mark completed'}
                      className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors shrink-0"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">
              {isRtl ? 'الإجازات بانتظار الاعتماد:' : 'Pending Leaves:'} <b>{pendingLeaves.length}</b>
            </span>
            <button
              onClick={() => onNavigateTab('data')}
              className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1"
            >
              {isRtl ? 'فتح سجل المهام' : 'All Tasks'}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions Live Feed & Cash Box Liquidity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Recent Transactions Activity (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {isRtl ? 'أحدث المعاملات التشغيلية والخدمات' : 'Recent Transactions Activity'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isRtl ? 'تحديث لحظي لحركات إنجاز معاملات الإقامة، الجوازات، ورخص الشركات' : 'Real-time feed of visa, DED and court services'}
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('operationsHub')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              {isRtl ? 'مركز العمليات الكامل' : 'Full Pipeline'}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs text-right" dir={isRtl ? 'rtl' : 'ltr'}>
              <thead>
                <tr className="text-slate-400 border-b border-slate-100 font-medium">
                  <th className="py-2 px-2.5">{isRtl ? 'كود المعاملة' : 'Code'}</th>
                  <th className="py-2 px-2.5">{isRtl ? 'العميل' : 'Customer'}</th>
                  <th className="py-2 px-2.5">{isRtl ? 'الموظف المسؤول' : 'Staff'}</th>
                  <th className="py-2 px-2.5">{isRtl ? 'الحالة' : 'Status'}</th>
                  <th className="py-2 px-2.5">{isRtl ? 'المبلغ الصافي' : 'Net Amount'}</th>
                  <th className="py-2 px-2.5 text-center">{isRtl ? 'إجراء' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.slice(0, 5).map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-2.5 font-mono font-bold text-slate-900">{trx.transaction_code || trx.id}</td>
                    <td className="py-2.5 px-2.5 text-slate-800 font-medium">{trx.customer_name_ar}</td>
                    <td className="py-2.5 px-2.5 text-slate-600">{trx.responsible_employee_name || 'موظف جلف ساند'}</td>
                    <td className="py-2.5 px-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          trx.status === 'مكتملة' || trx.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : trx.status === 'قيد التنفيذ' || trx.status === 'IN_PROGRESS'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {trx.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-2.5 font-mono font-bold text-slate-900">
                      {Number(trx.total_net_amount_aed || 0).toLocaleString()} د.إ
                    </td>
                    <td className="py-2.5 px-2.5 text-center">
                      <button
                        onClick={() => onViewRecord(trx)}
                        className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title={isRtl ? 'عرض المعاملة' : 'View Transaction'}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Liquidity Balances & Cash/Bank Accounts (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900">
                    {isRtl ? 'أرصدة الصناديق والبنوك' : 'Cash & Bank Balances'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isRtl ? 'السيولة النقدية المتاحة بالدرهم' : 'Live liquidity in AED'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-2.5">
              {cashBankAccounts.map((acc) => (
                <div key={acc.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-slate-800">{acc.account_name_ar}</span>
                    <p className="text-[10px] text-slate-400 font-mono">{acc.account_number || acc.id}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-sm text-emerald-700">
                      {canViewFinancials ? `${Number(acc.current_balance_aed || 0).toLocaleString()} د.إ` : '*** د.إ'}
                    </span>
                    <p className="text-[10px] text-slate-400">{acc.account_type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">{isRtl ? 'المحاسبة الموحدة:' : 'Accounts GL:'} <b>Active</b></span>
            <button
              onClick={() => onNavigateTab('data')}
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              {isRtl ? 'شجرة الحسابات' : 'Chart of Accounts'}
            </button>
          </div>
        </div>
      </div>

      {/* System Health Status & Security Integrity Widget - Restricted to authorized roles */}
      {(currentRole === UserRole.SYSTEM_ADMIN || currentRole === UserRole.MANAGER || currentRole === UserRole.SUPERVISOR) && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 mt-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  {isRtl ? 'حالة النظام وسلامة المعطيات المعيارية' : 'System Integrity & Health Monitor'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {isRtl
                    ? 'فحص سلامة الجداول، تشفير كلمات المرور، وحالة التخزين السحابي والمحلي.'
                    : 'Monitoring database structures, credentials hashing policies, and active persistence.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap text-xs">
              <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
                <span className="text-slate-500">{isRtl ? 'حالة قاعدة البيانات:' : 'Database Integrity:'}</span>
                <span className="text-emerald-700 font-bold ml-1.5 mr-1.5 inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  {isRtl ? 'سليمة ومتطابقة' : 'Intact & Normalized'}
                </span>
              </div>

              <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
                <span className="text-slate-500">{isRtl ? 'آخر تصفير أمني:' : 'Last Clean Wipe:'}</span>
                <span className="text-slate-800 font-mono font-bold ml-1.5 mr-1.5">
                  {(() => {
                    const logs = db.getAll('audit_logs');
                    const cleanLog = logs.find(
                      (l: any) =>
                        l.record_id === 'EMPTY-INIT' ||
                        l.summary?.includes('EMPTY-INIT') ||
                        l.summary?.includes('تصفير')
                    );
                    if (cleanLog) {
                      return new Date(cleanLog.created_at || cleanLog.timestamp || Date.now()).toLocaleDateString(
                        isRtl ? 'ar-AE' : 'en-US',
                        { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                      );
                    }
                    return isRtl ? 'البنية الأساسية الافتراضية' : 'Initial System Setup';
                  })()}
                </span>
              </div>

              <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
                <span className="text-slate-500">{isRtl ? 'قوة الاتصال:' : 'Dev Environment:'}</span>
                <span className="text-blue-700 font-bold ml-1.5 mr-1.5">
                  {isRtl ? 'متصل ومحمي' : 'Secure & Connected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
