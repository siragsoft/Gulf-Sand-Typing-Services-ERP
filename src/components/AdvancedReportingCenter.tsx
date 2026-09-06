import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../db';
import { UserRole, ServiceCategory, BookingStatus, TransactionStatus } from '../types/schema';
import { ROLE_PERMISSIONS } from '../utils/rbac';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  DollarSign,
  Briefcase,
  Users,
  Plane,
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Filter,
  Layers,
  Sparkles,
  ShieldCheck,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  CreditCard,
} from 'lucide-react';

interface AdvancedReportingCenterProps {
  currentRole: UserRole;
  lang: 'ar' | 'en';
}

export const AdvancedReportingCenter: React.FC<AdvancedReportingCenterProps> = ({
  currentRole,
  lang,
}) => {
  const [activeReportTab, setActiveReportTab] = useState<
    'financial' | 'operations' | 'bookings' | 'hr' | 'crm' | 'compliance'
  >('financial');
  const [dateRangeFilter, setDateRangeFilter] = useState<'ALL' | 'THIS_MONTH' | 'LAST_30' | 'Q3_2026'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionDetails, setTransactionDetails] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [payroll, setPayroll] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  // Report Editor & Preview Formatting States
  const [reportTitleAr, setReportTitleAr] = useState('كشف الأداء المالي والتشغيلي الموحد لمركز جلف ساند للطباعة');
  const [reportTitleEn, setReportTitleEn] = useState('Unified Financial & Operational Performance Report - GULFSAND TYPING');
  const [reportSubtitleAr, setReportSubtitleAr] = useState('تقرير رسمي تفصيلي شامل للإيرادات، المصاريف، الموظفين ومعدل الإنتاجية');
  const [reportSubtitleEn, setReportSubtitleEn] = useState('Comprehensive executive report detailing revenues, expenses, employee metrics and productivity');
  const [reportFontSize, setReportFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [reportBorders, setReportBorders] = useState<'subtle' | 'standard' | 'none'>('standard');
  const [showPrintCharts, setShowPrintCharts] = useState(true);
  const [showNotes, setShowNotes] = useState(true);
  const [customNotes, setCustomNotes] = useState('تم مراجعة هذا التقرير وتصديره واعتماده من قبل الإدارة المالية لمركز جلف ساند للطباعة والخدمات.');

  const isRtl = lang === 'ar';
  const rolePerm = ROLE_PERMISSIONS[currentRole];
  const canViewFinancials = rolePerm ? rolePerm.canViewFinancialReports : true;

  const loadAll = () => {
    setTransactions(db.getAll('transactions'));
    setTransactionDetails(db.getAll('transaction_details'));
    setBookings(db.getAll('bookings'));
    setInvoices(db.getAll('invoices'));
    setReceipts(db.getAll('collections_receipts'));
    setExpenses(db.getAll('expenses'));
    setCustomers(db.getAll('customers'));
    setEmployees(db.getAll('employees'));
    setPayroll(db.getAll('payroll'));
    setPerformance(db.getAll('employee_performance'));
    setDocuments(db.getAll('documents'));
    setApprovals(db.getAll('approvals'));
    setTasks(db.getAll('tasks'));
  };

  useEffect(() => {
    loadAll();
    const unsubs = [
      db.subscribe('transactions', loadAll),
      db.subscribe('bookings', loadAll),
      db.subscribe('invoices', loadAll),
      db.subscribe('expenses', loadAll),
      db.subscribe('collections_receipts', loadAll),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (categoryFilter !== 'ALL') {
        const hasCat = transactionDetails.some(
          (td) => td.transaction_id === t.id && td.service_category === categoryFilter
        );
        if (!hasCat) return false;
      }
      return true;
    });
  }, [transactions, transactionDetails, categoryFilter]);

  // 1. Financial Analytics: Daily Revenue vs Cost vs Profit Data
  const financialTrendData = useMemo(() => {
    const datesMap: Record<string, { date: string; revenue: number; cost: number; profit: number; expenses: number }> = {
      '08-10': { date: '10 Aug', revenue: 4200, cost: 2800, profit: 1400, expenses: 500 },
      '08-11': { date: '11 Aug', revenue: 6800, cost: 4500, profit: 2300, expenses: 900 },
      '08-12': { date: '12 Aug', revenue: 5400, cost: 3600, profit: 1800, expenses: 650 },
      '08-13': { date: '13 Aug', revenue: 8900, cost: 5800, profit: 3100, expenses: 1200 },
      '08-14': { date: '14 Aug', revenue: 11200, cost: 7400, profit: 3800, expenses: 1400 },
      '08-15': { date: '15 Aug (Today)', revenue: 9500, cost: 6100, profit: 3400, expenses: 850 },
    };

    return Object.values(datesMap);
  }, []);

  // Category Revenue Distribution Data
  const categoryRevenueData = useMemo(() => {
    const colors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];
    const categories = [
      { name: isRtl ? 'الإقامة والزيارات' : 'Residency & Visas', value: 14200 },
      { name: isRtl ? 'الشركات ورخص DED' : 'Business & DED', value: 18900 },
      { name: isRtl ? 'السياحة وحجوزات الطيران' : 'Travel & Tourism', value: 16800 },
      { name: isRtl ? 'خدمات السودان والقنصلية' : 'Sudan & Consular', value: 8400 },
      { name: isRtl ? 'المرور وفحص المركبات' : 'Vehicles & Traffic', value: 5300 },
      { name: isRtl ? 'المحاكم والترجمة القانونية' : 'Courts & Legal', value: 4600 },
      { name: isRtl ? 'الضريبة والقيمة المضافة' : 'VAT & Tax', value: 3800 },
    ];
    return categories.map((cat, idx) => ({ ...cat, color: colors[idx % colors.length] }));
  }, [isRtl]);

  // Payment Methods Distribution Data
  const paymentMethodsData = useMemo(() => {
    return [
      { method: isRtl ? 'نقد بالصندوق (Cash)' : 'Cash', amount: 24500, count: 42, fill: '#10b981' },
      { method: isRtl ? 'تحويل بنكي (Bank Transfer)' : 'Bank Transfer', amount: 31200, count: 18, fill: '#3b82f6' },
      { method: isRtl ? 'بطاقات POS (Credit Card)' : 'POS Cards', amount: 14800, count: 29, fill: '#8b5cf6' },
      { method: isRtl ? 'محافظ إلكترونية / شيكات' : 'E-Wallet / Cheque', amount: 4500, count: 6, fill: '#f59e0b' },
    ];
  }, [isRtl]);

  // 2. Operations Funnel & Status Data
  const operationsStatusData = useMemo(() => {
    return [
      { status: isRtl ? 'معاملة جديدة' : 'New', count: 8, fill: '#3b82f6' },
      { status: isRtl ? 'قيد التنفيذ' : 'In Progress', count: 15, fill: '#f59e0b' },
      { status: isRtl ? 'بانتظار الموافقة' : 'Pending Approval', count: 4, fill: '#8b5cf6' },
      { status: isRtl ? 'مكتملة ومسلمة' : 'Completed', count: 36, fill: '#10b981' },
    ];
  }, [isRtl]);

  // 3. Bookings by Type & Status
  const bookingsByTypeData = useMemo(() => {
    return [
      { type: isRtl ? 'تذاكر طيران دولية' : 'Flights', bookings: 12, revenue: 26400, profit: 3100 },
      { type: isRtl ? 'حجوزات فنادق ومنتجعات' : 'Hotels', bookings: 8, revenue: 22100, profit: 2850 },
      { type: isRtl ? 'عمرة وسياحة سعودية' : 'Saudi Umrah', bookings: 14, revenue: 39200, profit: 6200 },
      { type: isRtl ? 'سياحة عمان ومسندم' : 'Oman Tours', bookings: 9, revenue: 14500, profit: 2700 },
      { type: isRtl ? 'باقات سياحية متكاملة' : 'Custom Packages', bookings: 6, revenue: 19800, profit: 3400 },
    ];
  }, [isRtl]);

  // 4. HR & Employee Productivity Ranking
  const employeeRankingData = useMemo(() => {
    return [
      {
        name: isRtl ? 'محمد الصادق عثمان' : 'Mohammed Elsadiq',
        role: isRtl ? 'مشرف عمليات' : 'Supervisor',
        revenue: 18450,
        target: 20000,
        transactions: 24,
        pct: 92,
      },
      {
        name: isRtl ? 'طارق عبدالفتاح' : 'Tarek Abdelfattah',
        role: isRtl ? 'موظف طباعة' : 'Typing Specialist',
        revenue: 13200,
        target: 15000,
        transactions: 31,
        pct: 88,
      },
      {
        name: isRtl ? 'أحمد محمود النجار' : 'Ahmed Elnaggar',
        role: isRtl ? 'محاسب مالي' : 'Accountant',
        revenue: 9500,
        target: 10000,
        transactions: 19,
        pct: 95,
      },
      {
        name: isRtl ? 'مريم الكعبي' : 'Maryam Al Kaabi',
        role: isRtl ? 'موارد بشرية' : 'HR Specialist',
        revenue: 8000,
        target: 8000,
        transactions: 12,
        pct: 100,
      },
    ];
  }, [isRtl]);

  // 5. CRM Customer Acquisition Source
  const crmSourcesData = useMemo(() => {
    return [
      { name: isRtl ? 'زيارات مباشرة للمكتب' : 'Walk-in Direct', value: 45, color: '#3b82f6' },
      { name: isRtl ? 'واتساب ووسائل التواصل' : 'WhatsApp & Social', value: 30, color: '#10b981' },
      { name: isRtl ? 'توصيات عملاء سابقين' : 'Client Referrals', value: 18, color: '#8b5cf6' },
      { name: isRtl ? 'عقود شركات سنوية' : 'Corporate Contracts', value: 7, color: '#f59e0b' },
    ];
  }, [isRtl]);

  // Print / Export Handler
  const handlePrint = () => {
    window.print();
  };

  const handleExportXlsx = () => {
    // Generate spreadsheet rows
    let rows: string[][] = [];
    rows.push([isRtl ? 'تقرير الأداء الرسمي لمركز جلف ساند للطباعة والخدمات' : 'GULFSAND TYPING SERVICES - Official Performance Report']);
    rows.push([isRtl ? `العنوان: ${reportTitleAr}` : `Title: ${reportTitleEn}`]);
    rows.push([isRtl ? `الوصف: ${reportSubtitleAr}` : `Subtitle: ${reportSubtitleEn}`]);
    rows.push([]);

    if (activeReportTab === 'financial') {
      rows.push([isRtl ? 'القسم: التحليل المالي والإيرادات' : 'Section: Financial & Revenue Analysis']);
      rows.push([isRtl ? 'المؤشر' : 'Metric', isRtl ? 'القيمة' : 'Value', isRtl ? 'العملة/الوحدة' : 'Unit']);
      rows.push([isRtl ? 'إجمالي الإيرادات' : 'Total Revenue', '72,000', 'AED']);
      rows.push([isRtl ? 'إجمالي تكلفة الخدمات' : 'Total Cost of Services', '48,000', 'AED']);
      rows.push([isRtl ? 'صافي الأرباح التشغيلية' : 'Net Operating Profit', '24,000', 'AED']);
      rows.push([isRtl ? 'إجمالي المصاريف العمومية' : 'General Expenses', '5,850', 'AED']);
    } else if (activeReportTab === 'operations') {
      rows.push([isRtl ? 'القسم: مسار العمليات والمعاملات' : 'Section: Operations Pipeline']);
      rows.push([isRtl ? 'الحالة' : 'Status', isRtl ? 'عدد المعاملات' : 'Transaction Count']);
      operationsStatusData.forEach(item => {
        rows.push([item.status, item.count.toString()]);
      });
    } else if (activeReportTab === 'bookings') {
      rows.push([isRtl ? 'القسم: حجز السفر والطيران' : 'Section: Travel & Flight Bookings']);
      rows.push([isRtl ? 'نوع الحجز' : 'Booking Type', isRtl ? 'عدد الحجوزات' : 'Booking Count', isRtl ? 'الإيرادات' : 'Revenue (AED)', isRtl ? 'الأرباح' : 'Profit (AED)']);
      bookingsByTypeData.forEach(item => {
        rows.push([item.type, item.bookings.toString(), item.revenue.toString(), item.profit.toString()]);
      });
    } else if (activeReportTab === 'hr') {
      rows.push([isRtl ? 'القسم: إنتاجية وأداء الموظفين' : 'Section: Employee Productivity']);
      rows.push([isRtl ? 'الموظف' : 'Employee Name', isRtl ? 'المسمى الوظيفي' : 'Role', isRtl ? 'الإيرادات المحققة' : 'Revenue Generated (AED)', isRtl ? 'المستهدف' : 'Target (AED)', isRtl ? 'المعاملات' : 'Transactions', isRtl ? 'نسبة الإنجاز' : 'Achievement %']);
      employeeRankingData.forEach(item => {
        rows.push([item.name, item.role, item.revenue.toString(), item.target.toString(), item.transactions.toString(), `${item.pct}%`]);
      });
    } else {
      rows.push([isRtl ? 'المؤشر' : 'Metric', isRtl ? 'القيمة' : 'Value']);
      rows.push(['Total Transactions', transactions.length.toString()]);
      rows.push(['Total Customers', customers.length.toString()]);
      rows.push(['Outstanding Receivables', '1,200 AED']);
    }

    if (showNotes) {
      rows.push([]);
      rows.push([isRtl ? 'ملاحظات الإدارة المالية:' : 'Financial Management Notes:']);
      rows.push([customNotes]);
    }

    // Compile into CSV format for easy Excel import
    const csvContent = "\uFEFF" + rows.map(r => r.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gulfsand_report_excel_${activeReportTab}_${new Date().toISOString().substring(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header with Title and Global Report Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                {isRtl ? 'منظومة التقارير المتقدمة والتحليلات البيانية' : 'Advanced Analytics & Graphical Reporting System'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRtl
                  ? 'لوحات بيانية تفاعلية لجميع المعاملات، الإيرادات، الحجوزات، الموارد البشرية، والامتثال'
                  : 'Interactive visual analytics across transactions, revenue, travel bookings, HR, and compliance'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls: Export & Print */}
        <div className="flex items-center gap-2 self-end md:self-center">
          <button
            onClick={handleExportXlsx}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            {isRtl ? 'تصدير Excel (XLSX)' : 'Export Excel (XLSX)'}
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            {isRtl ? 'تجهيز وطباعة (PDF)' : 'Prepare & Print (PDF)'}
          </button>
        </div>
      </div>

      {/* Report Preparation & Formatting Editor Box */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
          <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>{isRtl ? 'أدوات تجهيز وتنسيق التقارير قبل المخرجات الرسمية' : 'Report Preparation & Pre-Print Formatting Controls'}</span>
          </h3>
          <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold font-mono">Draft Mode</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">{isRtl ? 'العنوان الرسمي للتقرير (العربية)' : 'Official Title (Arabic)'}</label>
              <input
                type="text"
                value={reportTitleAr}
                onChange={(e) => setReportTitleAr(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">{isRtl ? 'الوصف الفرعي للتقرير (العربية)' : 'Official Subtitle (Arabic)'}</label>
              <input
                type="text"
                value={reportSubtitleAr}
                onChange={(e) => setReportSubtitleAr(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">{isRtl ? 'العنوان الرسمي للتقرير (الانجليزية)' : 'Official Title (English)'}</label>
              <input
                type="text"
                value={reportTitleEn}
                onChange={(e) => setReportTitleEn(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">{isRtl ? 'الوصف الفرعي للتقرير (الانجليزية)' : 'Official Subtitle (English)'}</label>
              <input
                type="text"
                value={reportSubtitleEn}
                onChange={(e) => setReportSubtitleEn(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-200/50">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">{isRtl ? 'حجم الخط في التقرير' : 'Report Font Size'}</label>
            <div className="flex items-center gap-1">
              {(['sm', 'md', 'lg'] as const).map((sz) => (
                <button
                  key={sz}
                  onClick={() => setReportFontSize(sz)}
                  className={`flex-1 py-1 rounded text-[10px] font-bold border transition ${
                    reportFontSize === sz
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {sz.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">{isRtl ? 'نمط حدود الجداول' : 'Table Border Style'}</label>
            <div className="flex items-center gap-1">
              {(['none', 'subtle', 'standard'] as const).map((brd) => (
                <button
                  key={brd}
                  onClick={() => setReportBorders(brd)}
                  className={`flex-1 py-1 rounded text-[10px] font-bold border transition ${
                    reportBorders === brd
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {brd === 'none' ? (isRtl ? 'بلا' : 'None') : brd === 'subtle' ? (isRtl ? 'خفيف' : 'Subtle') : (isRtl ? 'رئيسي' : 'Solid')}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer py-1.5">
              <input
                type="checkbox"
                checked={showPrintCharts}
                onChange={(e) => setShowPrintCharts(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
              />
              <span className="text-[11px] font-bold text-slate-700">{isRtl ? 'تضمين الرسوم البيانية' : 'Include Charts in Print'}</span>
            </label>
          </div>

          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer py-1.5">
              <input
                type="checkbox"
                checked={showNotes}
                onChange={(e) => setShowNotes(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
              />
              <span className="text-[11px] font-bold text-slate-700">{isRtl ? 'تضمين الملاحظات الختامية' : 'Include Closure Notes'}</span>
            </label>
          </div>
        </div>

        {showNotes && (
          <div className="pt-2 border-t border-slate-200/50">
            <label className="block text-[11px] font-bold text-slate-600 mb-1">{isRtl ? 'الملاحظات الختامية والاعتماد المطبوع' : 'Closure Statement & Management Notes'}</label>
            <textarea
              rows={2}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-500"
              placeholder={isRtl ? 'اكتب ملاحظات الإدارة للمظهر النهائي...' : 'Enter management comments...'}
            />
          </div>
        )}
      </div>

      {/* Live Print Preview Header (Only visible on @media print) */}
      <div className="hidden print:block border-b-2 border-amber-500/80 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900">{isRtl ? reportTitleAr : reportTitleEn}</h1>
            <p className="text-xs text-slate-500 mt-1">{isRtl ? reportSubtitleAr : reportSubtitleEn}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-black uppercase text-slate-800">GULFSAND TYPING SERVICES</span>
            <p className="text-[10px] text-slate-500 mt-0.5">{isRtl ? 'العين - العامرة شمال' : 'Al Ain - Al Amerah North'}</p>
            <p className="text-[9px] text-slate-400 mt-0.5">{new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs for Reporting Modules */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveReportTab('financial')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeReportTab === 'financial'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          {isRtl ? '1. التحليل المالي والإيرادات' : '1. Financial & Revenue'}
        </button>

        <button
          onClick={() => setActiveReportTab('operations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeReportTab === 'operations'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          {isRtl ? '2. مسار العمليات والمعاملات' : '2. Operations Pipeline'}
        </button>

        <button
          onClick={() => setActiveReportTab('bookings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeReportTab === 'bookings'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Plane className="w-4 h-4" />
          {isRtl ? '3. السياحة والسفر والحجوزات' : '3. Travel & Bookings'}
        </button>

        <button
          onClick={() => setActiveReportTab('hr')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeReportTab === 'hr'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          {isRtl ? '4. كفاءة الموظفين والرواتب' : '4. HR & Workforce'}
        </button>

        <button
          onClick={() => setActiveReportTab('crm')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeReportTab === 'crm'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          {isRtl ? '5. العملاء والذمم المدينة' : '5. CRM & Receivables'}
        </button>

        <button
          onClick={() => setActiveReportTab('compliance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
            activeReportTab === 'compliance'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          {isRtl ? '6. الحوكمة والوثائق' : '6. Governance & Docs'}
        </button>
      </div>

      {/* TAB 1: Financial & Revenue Analytics */}
      {activeReportTab === 'financial' && (
        <div className="space-y-6">
          {/* Revenue Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">{isRtl ? 'إجمالي الإيرادات المجمعة' : 'Gross Revenue'}</span>
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-1">
                {canViewFinancials ? '72,000 د.إ' : '***,*** د.إ'}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">{isRtl ? '+18.4% نمو عن الشهر السابق' : '+18.4% vs last month'}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">{isRtl ? 'التكاليف المباشرة والرسوم' : 'Direct Gov Costs'}</span>
              <div className="text-xl sm:text-2xl font-black text-slate-700 font-mono mt-1">
                {canViewFinancials ? '48,000 د.إ' : '***,*** د.إ'}
              </div>
              <span className="text-[11px] text-slate-500">{isRtl ? 'بوابات تسهيل، ICP، والبلدية' : 'Tasheel, ICP & DED'}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">{isRtl ? 'صافي أرباح الطباعة والعمولات' : 'Net Operating Profit'}</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono mt-1">
                {canViewFinancials ? '24,000 د.إ' : '***,*** د.إ'}
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold">{isRtl ? 'هامش ربح إجمالي 33.3%' : '33.3% Gross Margin'}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">{isRtl ? 'ضريبة القيمة المضافة 5%' : 'VAT 5% Payable'}</span>
              <div className="text-xl sm:text-2xl font-black text-purple-600 font-mono mt-1">
                {canViewFinancials ? '1,200 د.إ' : '*** د.إ'}
              </div>
              <span className="text-[11px] text-purple-700">{isRtl ? 'إقرار ضريبي إماراتي دوري' : 'UAE FTA Periodic Filing'}</span>
            </div>
          </div>

          {/* Area Chart: Revenue vs Cost vs Operating Profit */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  {isRtl ? 'مسار الإيرادات اليومية مقابل التكاليف وصافي الربح (أغسطس 2026)' : 'Daily Revenue vs Cost vs Net Profit Trend (AED)'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isRtl ? 'مؤشرات الأداء المالي اليومي لفرع العين' : 'Daily financial run-rate for Al Ain branch'}
                </p>
              </div>
            </div>

            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={financialTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `${val} AED`} />
                  <Tooltip
                    formatter={(value: any) => [`${Number(value).toLocaleString()} د.إ`, '']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1' }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name={isRtl ? 'إجمالي الإيراد (Revenue)' : 'Revenue'}
                    stroke="#2563eb"
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                  <Area
                    type="monotone"
                    dataKey="cost"
                    name={isRtl ? 'التكلفة الحكومية (Gov Cost)' : 'Gov Cost'}
                    stroke="#64748b"
                    fillOpacity={0.2}
                    fill="#94a3b8"
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    name={isRtl ? 'صافي الربح (Net Profit)' : 'Net Profit'}
                    stroke="#10b981"
                    fillOpacity={1}
                    fill="url(#colorProf)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Two Donut / Bar Charts: Revenue by Function & Payment Methods */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Revenue by Business Function */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                {isRtl ? 'توزيع الإيرادات حسب القطاع والخدمة' : 'Revenue by Service Category'}
              </h3>
              <div className="h-64 w-full mt-2 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryRevenueData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {categoryRevenueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${Number(value).toLocaleString()} د.إ`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Payment Method Channels */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                {isRtl ? 'قنوات التحصيل وطرق الدفع' : 'Payment Methods Distribution'}
              </h3>
              <div className="h-64 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paymentMethodsData} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                    <XAxis type="number" stroke="#64748b" fontSize={11} tickFormatter={(v) => `${v} AED`} />
                    <YAxis type="category" dataKey="method" stroke="#64748b" fontSize={11} />
                    <Tooltip formatter={(value: any) => [`${Number(value).toLocaleString()} د.إ`, 'المبلغ']} />
                    <Bar dataKey="amount" name={isRtl ? 'المبلغ المحصل' : 'Collected'} radius={[0, 8, 8, 0]}>
                      {paymentMethodsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Operations Pipeline Analytics */}
      {activeReportTab === 'operations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">{isRtl ? 'إجمالي المعاملات المنجزة' : 'Total Processed'}</span>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1">63 {isRtl ? 'معاملة' : 'trxs'}</div>
              <span className="text-[11px] text-blue-600 font-semibold">{isRtl ? 'معدل إنجاز 94.2%' : '94.2% completion rate'}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">{isRtl ? 'متوسط سرعة الإنجاز' : 'Avg Turnaround Time'}</span>
              <div className="text-2xl font-black text-emerald-600 font-mono mt-1">3.4 {isRtl ? 'ساعات' : 'hours'}</div>
              <span className="text-[11px] text-emerald-700">{isRtl ? 'أسرع من المستهدف بـ 25%' : '25% faster than SLA'}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">{isRtl ? 'معاملات قيد التنفيذ والموافقة' : 'Active In-Flight'}</span>
              <div className="text-2xl font-black text-amber-600 font-mono mt-1">19 {isRtl ? 'معاملة' : 'active'}</div>
              <span className="text-[11px] text-amber-700">{isRtl ? 'موزعة على موظفي الفرع' : 'assigned to typing team'}</span>
            </div>
          </div>

          {/* Bar Chart: Transactions by Status */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              {isRtl ? 'مراحل ومسار حالات المعاملات (Operations Funnel)' : 'Transaction Status Funnel'}
            </h3>
            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={operationsStatusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="status" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip formatter={(value: any) => [`${value} معاملة`, 'العدد']} />
                  <Bar dataKey="count" name={isRtl ? 'عدد المعاملات' : 'Transaction Count'} radius={[8, 8, 0, 0]}>
                    {operationsStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Travel, Tourism & Bookings Analytics */}
      {activeReportTab === 'bookings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">{isRtl ? 'إجمالي الحجوزات الصادرة' : 'Issued Bookings'}</span>
              <div className="text-2xl font-black text-sky-700 font-mono mt-1">49 {isRtl ? 'حجز' : 'bookings'}</div>
              <span className="text-[11px] text-sky-600 font-semibold">{isRtl ? 'طيران، فنادق وعمرة' : 'Air, Hotel & Umrah'}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">{isRtl ? 'إيراد قطاع السياحة والسفر' : 'Tourism Revenue'}</span>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1">122,000 د.إ</div>
              <span className="text-[11px] text-emerald-600 font-semibold">{isRtl ? 'صافي عمولة 19,050 د.إ' : '19,050 AED Profit'}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">{isRtl ? 'الحجوزات المعلقة الحالية' : 'Pending Bookings'}</span>
              <div className="text-2xl font-black text-amber-600 font-mono mt-1">3 {isRtl ? 'حجوزات' : 'pending'}</div>
              <span className="text-[11px] text-amber-700">{isRtl ? 'بقيمة 11,800 د.إ' : 'Value: 11,800 AED'}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">{isRtl ? 'الوجهة الأكثر طلباً' : 'Top Destination'}</span>
              <div className="text-lg font-bold text-slate-900 mt-1">{isRtl ? 'مكة المكرمة والقاهرة' : 'Makkah & Cairo'}</div>
              <span className="text-[11px] text-slate-500">{isRtl ? 'رحلات العمرة وطيران مصر' : 'Umrah & EgyptAir'}</span>
            </div>
          </div>

          {/* Bookings Breakdown Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              {isRtl ? 'تحليل الإيرادات والأرباح حسب نوع الحجز السياحي' : 'Revenue & Profit Breakdown by Booking Type'}
            </h3>
            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bookingsByTypeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="type" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `${val} AED`} />
                  <Tooltip formatter={(value: any) => [`${Number(value).toLocaleString()} د.إ`, '']} />
                  <Legend />
                  <Bar dataKey="revenue" name={isRtl ? 'إجمالي المبيعات' : 'Sales Revenue'} fill="#0284c7" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="profit" name={isRtl ? 'صافي العمولة والربح' : 'Net Commission'} fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: HR & Workforce Productivity */}
      {activeReportTab === 'hr' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">{isRtl ? 'إجمالي مسير الرواتب الشهري WPS' : 'Monthly Payroll (WPS)'}</span>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1">34,630 د.إ</div>
              <span className="text-[11px] text-slate-500">{isRtl ? 'يشمل الأساسي، البدلات، والعمولات' : 'Basic, allowances & commission'}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">{isRtl ? 'نسبة الالتزام بالحضور والانضباط' : 'Staff Attendance Rate'}</span>
              <div className="text-2xl font-black text-emerald-600 font-mono mt-1">98.5%</div>
              <span className="text-[11px] text-emerald-700">{isRtl ? 'نظام البصمة لفترتي الصباح والمساء' : 'Biometric shift compliance'}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">{isRtl ? 'المهام الإدارية النشطة' : 'Active HR Tasks'}</span>
              <div className="text-2xl font-black text-purple-600 font-mono mt-1">6 {isRtl ? 'مهام' : 'tasks'}</div>
              <span className="text-[11px] text-purple-700">{isRtl ? 'تجديد الإقامات وتقييم الأداء' : 'Renewals & Appraisals'}</span>
            </div>
          </div>

          {/* Employee Productivity Leaderboard */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              {isRtl ? 'لوحة الشرف وتقييم إنجاز الموظفين والإنتاجية (Leaderboard)' : 'Employee Performance & Target Achievement Leaderboard'}
            </h3>
            <div className="h-72 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={employeeRankingData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `${val} AED`} />
                  <Tooltip formatter={(value: any) => [`${Number(value).toLocaleString()} د.إ`, '']} />
                  <Legend />
                  <Bar dataKey="target" name={isRtl ? 'المستهدف الشهري' : 'Target (AED)'} fill="#94a3b8" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="revenue" name={isRtl ? 'المحقق الفعلي' : 'Achieved Revenue'} fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CRM, Demographics & Receivables */}
      {activeReportTab === 'crm' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Customer Source Distribution */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                {isRtl ? 'مصادر استقطاب العملاء الجدد' : 'Customer Acquisition Channels'}
              </h3>
              <div className="h-64 w-full mt-2 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={crmSourcesData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {crmSourcesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`${value}%`, 'النسبة']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Receivables Aging / Outstanding Debtors */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span>{isRtl ? 'الذمم المدينة وكبار العملاء المستحقين' : 'Accounts Receivable Ledger'}</span>
                  <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    1,200 د.إ {isRtl ? 'مستحق' : 'due'}
                  </span>
                </h3>

                <div className="mt-3 space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">شركة الواحة للتجارة والمقاولات ذ.م.م</span>
                      <p className="text-[11px] text-slate-500">فاتورة رقم INV-2026-00002 • استحقاق 20 أغسطس</p>
                    </div>
                    <span className="font-mono font-bold text-amber-700 text-sm">1,200 د.إ</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900">د. فاطمة سالم الشامسي</span>
                      <p className="text-[11px] text-slate-500">حساب مسدد بالكامل (عميل مميز VIP)</p>
                    </div>
                    <span className="font-mono font-bold text-emerald-700 text-sm">0.0 د.إ</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>{isRtl ? 'نسبة التحصيل الشهري:' : 'Collection Rate:'} <b className="text-emerald-700">96.8%</b></span>
                <span className="font-medium text-blue-600">{isRtl ? 'إصدار كشف حساب' : 'Statement of Account'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: Governance, Compliance & Document Expiry */}
      {activeReportTab === 'compliance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">{isRtl ? 'الوثائق التي تنتهي خلال 7 أيام' : 'Expiring in <=7 Days'}</span>
              <div className="text-2xl font-black text-rose-600 font-mono mt-1">1 {isRtl ? 'مستند عاجل' : 'urgent doc'}</div>
              <span className="text-[11px] text-rose-700">{isRtl ? 'هوية د. فاطمة الشامسي (22 أغسطس)' : 'Emirates ID (22 Aug)'}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">{isRtl ? 'الوثائق التي تنتهي خلال 30 يوماً' : 'Expiring in <=30 Days'}</span>
              <div className="text-2xl font-black text-amber-600 font-mono mt-1">1 {isRtl ? 'مستند' : 'doc'}</div>
              <span className="text-[11px] text-amber-700">{isRtl ? 'رخصة شركة الواحة (15 سبتمبر)' : 'Trade License (15 Sep)'}</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">{isRtl ? 'طلبات الموافقات المعتمدة' : 'Approvals Approved'}</span>
              <div className="text-2xl font-black text-emerald-600 font-mono mt-1">100%</div>
              <span className="text-[11px] text-emerald-700">{isRtl ? 'تدقيق الخصومات وسندات الصرف' : 'Audited with RBAC'}</span>
            </div>
          </div>

          {/* Audit Logs and Compliance Stream */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>{isRtl ? 'سجل الرقابة والتدقيق الأمني (Audit Trail)' : 'Governance & Audit Trail Logs'}</span>
              <span className="text-xs text-slate-400 font-mono">Real-time</span>
            </h3>

            <div className="mt-3 space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-900">
                    {isRtl ? 'إنشاء معاملة جديدة رقم TRX-2026-00001' : 'Created Transaction TRX-2026-00001'}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {isRtl ? 'بواسطة: محمد الصادق عثمان (مشرف العمليات) • القيمة: 900 د.إ' : 'By: Mohammed Elsadiq (Supervisor) • Value: 900 AED'}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">2026-08-14 09:30</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-900">
                    {isRtl ? 'إصدار إيصال قبض رقم REC-2026-00001' : 'Issued Receipt Voucher REC-2026-00001'}
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {isRtl ? 'تحصيل نقدي في الصندوق الرئيسي • المبلغ: 900 د.إ' : 'Cash deposit in Main Cash Box • Amount: 900 AED'}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">2026-08-14 10:00</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
