import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../db/database';
import { UserRole, TransactionStatus, Department } from '../types/schema';
import { canEditInTable, canCreateInTable } from '../utils/rbac';
import { downloadCSV } from '../utils/csvExporter';
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
  Kanban,
  List,
  Filter,
  Download,
  MessageCircle,
  Send,
  Sparkles,
  ChevronRight,
  Phone,
  CreditCard,
  FileText,
  Calendar,
  Layers,
  Check,
  RefreshCw,
  PackageCheck,
  Truck,
  ExternalLink,
} from 'lucide-react';

interface ServiceTaskWorkflowProps {
  currentRole: UserRole;
  lang: 'ar' | 'en';
  onOpenNewTransaction: () => void;
  onOpenNewCustomer?: () => void;
  onViewCustomer?: (customerId: string) => void;
  onOpenDocGenerator?: (customer: any) => void;
  onViewRecord: (record: any) => void;
  onEditRecord: (record: any) => void;
}

export const ServiceTaskWorkflow: React.FC<ServiceTaskWorkflowProps> = ({
  currentRole,
  lang,
  onOpenNewTransaction,
  onOpenNewCustomer,
  onViewCustomer,
  onOpenDocGenerator,
  onViewRecord,
  onEditRecord,
}) => {
  const isAr = lang === 'ar';
  const [transactions, setTransactions] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [servicesPricing, setServicesPricing] = useState<any[]>([]);

  const [viewMode, setViewMode] = useState<'KANBAN' | 'TABLE'>('KANBAN');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [selectedCustomerFilter, setSelectedCustomerFilter] = useState<string>('ALL');
  const [selectedCustomerDrawer, setSelectedCustomerDrawer] = useState<any | null>(null);

  // Delivery Modal State
  const [deliveringTask, setDeliveringTask] = useState<any | null>(null);
  const [deliveryMethod, setDeliveryMethod] = useState<'IN_PERSON' | 'WHATSAPP_EMAIL' | 'COURIER'>('IN_PERSON');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  const canEdit = canEditInTable(currentRole, 'transactions');
  const canCreate = canCreateInTable(currentRole, 'transactions');

  const loadData = () => {
    setTransactions(db.getAll('transactions'));
    setCustomers(db.getAll('customers'));
    setEmployees(db.getAll('employees'));
    setServicesPricing(db.getAll('services_pricing'));
  };

  useEffect(() => {
    loadData();
    const unsub1 = db.subscribe('transactions', loadData);
    const unsub2 = db.subscribe('customers', loadData);
    const unsub3 = db.subscribe('employees', loadData);
    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, []);

  // Helper to find linked customer
  const getCustomer = (customerId: string) => {
    return customers.find((c) => c.id === customerId);
  };

  // Helper to find linked employee / typist
  const getEmployee = (empId: string) => {
    return employees.find((e) => e.id === empId);
  };

  // Update Status
  const handleUpdateStatus = (trxId: string, newStatus: string, extraData?: any) => {
    if (!canEdit) {
      alert(isAr ? 'صلاحيتك الحالية لا تسمح بتعديل حالة المعاملة.' : 'Unauthorized to update status.');
      return;
    }
    try {
      const updatePayload: any = { status: newStatus, ...extraData };
      if (newStatus === 'مكتملة' && !extraData?.completion_date) {
        updatePayload.completion_date = new Date().toISOString().slice(0, 10);
      }
      if (newStatus === 'تم التسليم للعميل') {
        updatePayload.delivered_at = new Date().toISOString();
      }
      db.update('transactions', trxId, updatePayload);
      loadData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Handle Complete Delivery
  const handleConfirmDelivery = () => {
    if (!deliveringTask) return;
    handleUpdateStatus(deliveringTask.id, 'تم التسليم للعميل', {
      delivery_method: deliveryMethod,
      delivery_notes: deliveryNotes,
    });
    setDeliveringTask(null);
    setDeliveryNotes('');
  };

  // Filtered List
  const filtered = useMemo(() => {
    return transactions.filter((trx) => {
      const matchesStatus = statusFilter === 'ALL' || trx.status === statusFilter;
      const matchesDept = departmentFilter === 'ALL' || trx.department === departmentFilter;
      const matchesCust = selectedCustomerFilter === 'ALL' || trx.customer_id === selectedCustomerFilter;

      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        (trx.transaction_number || trx.transaction_code || trx.id || '').toLowerCase().includes(q) ||
        (trx.customer_name_ar || '').toLowerCase().includes(q) ||
        (trx.customer_phone || '').includes(q) ||
        (trx.service_name_ar || '').toLowerCase().includes(q);

      return matchesStatus && matchesDept && matchesCust && matchesSearch;
    });
  }, [transactions, statusFilter, departmentFilter, selectedCustomerFilter, searchQuery]);

  // Kanban Pipeline Stages
  const stages = [
    {
      id: 'معلقة',
      nameAr: 'معلقة / جديدة',
      nameEn: 'Pending / New',
      statuses: ['جديدة', 'طلب جديد', 'معلقة', 'بانتظار المستندات'],
      color: 'border-blue-500 bg-blue-50/40 text-blue-800',
      badgeBg: 'bg-blue-600 text-white',
    },
    {
      id: 'قيد التنفيذ',
      nameAr: 'قيد التنفيذ والطباعة',
      nameEn: 'In Progress / Typing',
      statuses: ['قيد التنفيذ', 'بانتظار الموافقة'],
      color: 'border-amber-500 bg-amber-50/40 text-amber-800',
      badgeBg: 'bg-amber-600 text-white',
    },
    {
      id: 'مكتملة',
      nameAr: 'مكتملة وجاهزة للتسليم',
      nameEn: 'Completed / Ready',
      statuses: ['مكتملة', 'تم الإصدار'],
      color: 'border-emerald-500 bg-emerald-50/40 text-emerald-800',
      badgeBg: 'bg-emerald-600 text-white',
    },
    {
      id: 'تم التسليم للعميل',
      nameAr: 'تم التسليم والأرشفة',
      nameEn: 'Delivered to Client',
      statuses: ['تم التسليم للعميل', 'مغلقة ومؤرشفة'],
      color: 'border-purple-500 bg-purple-50/40 text-purple-800',
      badgeBg: 'bg-purple-600 text-white',
    },
  ];

  // Quick WhatsApp Status Update
  const handleWhatsAppStatusUpdate = (trx: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = trx.customer_phone || getCustomer(trx.customer_id)?.phone;
    if (!phone) {
      alert(isAr ? 'لا يوجد رقم هاتف للعميل.' : 'No customer phone registered.');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const msg = isAr
      ? `مرحباً عزيزنا العميل (${trx.customer_name_ar || 'المحترم'})، نود إعلامكم بأن معاملتكم رقم (${trx.transaction_number || trx.id}) بخصوص (${trx.service_name_ar || 'الخدمة الحكومية'}) أصبحت بحالة: *${trx.status}*. مركز جلف ساند للطباعة - العين.`
      : `Hello (${trx.customer_name_ar || 'Valued Client'}), your transaction (${trx.transaction_number || trx.id}) is currently: *${trx.status}*. Gulf Sand Typing Services - Al Ain.`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Transaction Code',
      'Customer Name',
      'Customer Phone',
      'Department',
      'Typist / Assignee',
      'Status',
      'Total Amount AED',
      'Paid Amount AED',
      'Remaining Balance AED',
      'Created Date',
      'Due Date',
    ];

    const rows = filtered.map((t) => [
      t.transaction_number || t.id,
      t.customer_name_ar || getCustomer(t.customer_id)?.name_ar || 'N/A',
      t.customer_phone || getCustomer(t.customer_id)?.phone || 'N/A',
      t.department || 'الطباعة والمعاملات',
      t.responsible_employee_name || getEmployee(t.responsible_employee_id)?.full_name_ar || 'N/A',
      t.status || 'جديدة',
      Number(t.total_net_amount_aed || t.typing_fee_aed || 0),
      Number(t.collected_amount_aed || 0),
      Number(t.remaining_balance_aed || 0),
      t.created_at?.slice(0, 10) || t.start_date || 'N/A',
      t.due_date || 'N/A',
    ]);

    downloadCSV('Gulfsand_Service_Tasks_Workflow', headers, rows);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200" dir={isAr ? 'rtl' : 'ltr'}>
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER & WORKFLOW CONTROLS */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-xs shadow-blue-200">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  {isAr ? 'مسار مهام ومعاملات الطباعة (Service Task Workflow)' : 'Service Task Workflow & CRM Pipeline'}
                </h2>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full">
                  {filtered.length} {isAr ? 'معاملة نشطة' : 'active tasks'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {isAr
                  ? 'متابعة مراحل إنجاز المعاملات، ربطها بملفات العملاء في CRM، وتسليم الوثائق مع إشعارات واتساب لحظية.'
                  : 'Track typing transactions stage by stage, link to CRM profiles, and manage delivery with instant notifications.'}
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Toggle & Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Kanban / Table Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                viewMode === 'KANBAN'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>{isAr ? 'لوحة كانبان' : 'Kanban Board'}</span>
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                viewMode === 'TABLE'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>{isAr ? 'عرض الجدول' : 'Table View'}</span>
            </button>
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition"
            title={isAr ? 'تصدير كشف المهام CSV' : 'Export CSV'}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isAr ? 'تصدير CSV' : 'Export'}</span>
          </button>

          {/* New Transaction Button */}
          {canCreate && (
            <button
              onClick={onOpenNewTransaction}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs shadow-blue-200 transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'معاملة جديدة' : 'New Transaction Task'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. FILTER & SEARCH STRIP */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث برقم المعاملة، اسم العميل، الهاتف، أو نوع الخدمة...' : 'Search by task #, client name, phone, or service...'}
            className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition text-xs"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">{isAr ? 'جميع الحالات' : 'All Statuses'}</option>
            <option value="جديدة">{isAr ? 'جديدة' : 'New'}</option>
            <option value="قيد التنفيذ">{isAr ? 'قيد التنفيذ' : 'In Progress'}</option>
            <option value="بانتظار المستندات">{isAr ? 'بانتظار المستندات' : 'Waiting Docs'}</option>
            <option value="مكتملة">{isAr ? 'مكتملة' : 'Completed'}</option>
            <option value="تم التسليم للعميل">{isAr ? 'تم التسليم للعميل' : 'Delivered'}</option>
            <option value="ملغاة">{isAr ? 'ملغاة' : 'Cancelled'}</option>
          </select>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">{isAr ? 'جميع الأقسام' : 'All Departments'}</option>
            <option value={Department.TYPING_OPERATIONS}>{isAr ? 'الطباعة والعمليات' : 'Typing Ops'}</option>
            <option value={Department.TOURISM_TRAVEL}>{isAr ? 'السياحة وحجوزات الطيران' : 'Tourism'}</option>
            <option value={Department.ACCOUNTS_FINANCE}>{isAr ? 'المالية والحسابات' : 'Finance'}</option>
          </select>

          {/* Customer Specific Filter */}
          <select
            value={selectedCustomerFilter}
            onChange={(e) => setSelectedCustomerFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none max-w-[200px]"
          >
            <option value="ALL">{isAr ? 'جميع العملاء' : 'All CRM Clients'}</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_ar || c.name_en} ({c.customer_code || c.phone})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. MAIN WORKFLOW VIEWS (KANBAN OR TABLE) */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'KANBAN' ? (
        /* KANBAN BOARD VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {stages.map((stage) => {
            const stageTasks = filtered.filter((t) => stage.statuses.includes(t.status));

            return (
              <div
                key={stage.id}
                className="bg-slate-50/80 rounded-2xl border border-slate-200 p-3 flex flex-col min-h-[580px] shadow-2xs"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between p-2 pb-3 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <h3 className="text-xs font-black text-slate-800">
                      {isAr ? stage.nameAr : stage.nameEn}
                    </h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${stage.badgeBg}`}>
                    {stageTasks.length}
                  </span>
                </div>

                {/* Task Cards Column */}
                <div className="mt-3 space-y-3 flex-1 overflow-y-auto max-h-[650px] pr-0.5">
                  {stageTasks.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 text-xs border-2 border-dashed border-slate-200 rounded-xl">
                      {isAr ? 'لا توجد معاملات في هذه المرحلة' : 'No tasks in this stage'}
                    </div>
                  ) : (
                    stageTasks.map((task) => {
                      const cust = getCustomer(task.customer_id);
                      const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'مكتملة' && task.status !== 'تم التسليم للعميل';

                      return (
                        <div
                          key={task.id}
                          className="bg-white rounded-xl border border-slate-200 hover:border-blue-400 shadow-2xs hover:shadow-xs p-3.5 space-y-2.5 transition-all group"
                        >
                          {/* Task Card Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-xs text-blue-700">
                                  {task.transaction_number || task.transaction_code || task.id}
                                </span>
                                {isOverdue && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                                    {isAr ? 'متأخرة' : 'OVERDUE'}
                                  </span>
                                )}
                              </div>
                              <h4 className="text-xs font-bold text-slate-900 mt-0.5 line-clamp-1">
                                {task.service_name_ar || task.title_ar || 'معاملة طباعة وتصديق'}
                              </h4>
                            </div>

                            <span className="font-mono text-xs font-black text-slate-800">
                              {Number(task.total_net_amount_aed || task.typing_fee_aed || 0).toLocaleString()} د.إ
                            </span>
                          </div>

                          {/* Linked Customer Pill */}
                          <div
                            onClick={() => setSelectedCustomerDrawer(cust || { name_ar: task.customer_name_ar, phone: task.customer_phone })}
                            className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50/70 border border-slate-100 flex items-center justify-between cursor-pointer transition"
                            title={isAr ? 'عرض ملف العميل في CRM' : 'View CRM Profile'}
                          >
                            <div className="flex items-center gap-1.5 overflow-hidden">
                              <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                              <span className="text-[11px] font-semibold text-slate-800 truncate">
                                {task.customer_name_ar || cust?.name_ar || 'عميل نقدي'}
                              </span>
                            </div>
                            {cust?.is_vip && (
                              <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-1 py-0.2 rounded shrink-0">
                                VIP
                              </span>
                            )}
                          </div>

                          {/* Meta & Typist */}
                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{task.due_date || task.created_at?.slice(0, 10) || 'قريباً'}</span>
                            </span>
                            <span className="font-medium text-slate-600 truncate max-w-[110px]">
                              {task.responsible_employee_name || getEmployee(task.responsible_employee_id)?.full_name_ar || 'الطباع المعين'}
                            </span>
                          </div>

                          {/* Quick Stage Transition Actions */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1">
                              {/* WhatsApp Alert */}
                              <button
                                onClick={(e) => handleWhatsAppStatusUpdate(task, e)}
                                title={isAr ? 'إرسال تحديث للعميل عبر واتساب' : 'WhatsApp Status'}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-emerald-200 transition"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </button>

                              {/* Smart Doc Generator */}
                              {onOpenDocGenerator && cust && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenDocGenerator(cust);
                                  }}
                                  title={isAr ? 'إنشاء مستند ونموذج ذكي لهذا العميل' : 'Generate Document'}
                                  className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 border border-indigo-200 transition"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                </button>
                              )}

                              {/* View Details */}
                              <button
                                onClick={() => onViewRecord(task)}
                                title={isAr ? 'عرض التفاصيل' : 'View'}
                                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Progression Step Buttons */}
                            <div className="flex items-center gap-1">
                              {task.status !== 'قيد التنفيذ' && task.status !== 'مكتملة' && task.status !== 'تم التسليم للعميل' && (
                                <button
                                  onClick={() => handleUpdateStatus(task.id, 'قيد التنفيذ')}
                                  className="px-2 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold shadow-2xs transition"
                                >
                                  {isAr ? 'بدء التنفيذ' : 'Start'}
                                </button>
                              )}

                              {task.status === 'قيد التنفيذ' && (
                                <button
                                  onClick={() => handleUpdateStatus(task.id, 'مكتملة')}
                                  className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-2xs transition"
                                >
                                  {isAr ? 'اكتمال' : 'Complete'}
                                </button>
                              )}

                              {task.status === 'مكتملة' && (
                                <button
                                  onClick={() => setDeliveringTask(task)}
                                  className="px-2 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold shadow-2xs flex items-center gap-1 transition"
                                >
                                  <PackageCheck className="w-3 h-3" />
                                  <span>{isAr ? 'تسليم' : 'Deliver'}</span>
                                </button>
                              )}

                              {task.status === 'تم التسليم للعميل' && (
                                <span className="inline-flex items-center gap-1 text-[10px] text-purple-700 font-bold">
                                  <Check className="w-3 h-3" />
                                  <span>{isAr ? 'تم التسليم' : 'Delivered'}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3.5">{isAr ? 'رقم المعاملة' : 'Task #'}</th>
                  <th className="p-3.5">{isAr ? 'العميل (CRM)' : 'Client (CRM)'}</th>
                  <th className="p-3.5">{isAr ? 'الخدمة' : 'Service'}</th>
                  <th className="p-3.5">{isAr ? 'القسم' : 'Department'}</th>
                  <th className="p-3.5">{isAr ? 'المسؤول' : 'Assignee'}</th>
                  <th className="p-3.5">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="p-3.5">{isAr ? 'المبلغ الصافي' : 'Net AED'}</th>
                  <th className="p-3.5">{isAr ? 'الاستحقاق' : 'Due Date'}</th>
                  <th className="p-3.5 text-center">{isAr ? 'الإجراءات والتسليم' : 'Actions & Delivery'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-slate-400">
                      {isAr ? 'لا توجد معاملات مطابقة للبحث أو التصفية.' : 'No matching tasks found.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((task) => {
                    const cust = getCustomer(task.customer_id);
                    return (
                      <tr key={task.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 font-mono font-bold text-blue-700">
                          {task.transaction_number || task.transaction_code || task.id}
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => setSelectedCustomerDrawer(cust || { name_ar: task.customer_name_ar, phone: task.customer_phone })}
                            className="font-bold text-slate-900 hover:text-blue-600 text-right block hover:underline"
                          >
                            {task.customer_name_ar || cust?.name_ar || 'عميل'}
                          </button>
                          <span className="text-[10px] text-slate-400 font-mono">{task.customer_phone || cust?.phone || ''}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-slate-800">{task.service_name_ar || 'خدمة حكومية'}</span>
                        </td>
                        <td className="p-3.5 text-slate-600">
                          {task.department || 'الطباعة والعمليات'}
                        </td>
                        <td className="p-3.5 text-slate-700">
                          {task.responsible_employee_name || getEmployee(task.responsible_employee_id)?.full_name_ar || 'غير محدد'}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              task.status === 'مكتملة'
                                ? 'bg-emerald-100 text-emerald-800'
                                : task.status === 'تم التسليم للعميل'
                                ? 'bg-purple-100 text-purple-800'
                                : task.status === 'قيد التنفيذ'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {task.status}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-slate-900">
                          {Number(task.total_net_amount_aed || task.typing_fee_aed || 0).toLocaleString()} د.إ
                        </td>
                        <td className="p-3.5 font-mono text-[11px] text-slate-500">
                          {task.due_date || task.created_at?.slice(0, 10) || 'N/A'}
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={(e) => handleWhatsAppStatusUpdate(task, e)}
                              title={isAr ? 'واتساب' : 'WhatsApp'}
                              className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-emerald-200 transition"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </button>

                            {task.status === 'قيد التنفيذ' && (
                              <button
                                onClick={() => handleUpdateStatus(task.id, 'مكتملة')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition"
                              >
                                {isAr ? 'اكتمال' : 'Done'}
                              </button>
                            )}

                            {task.status === 'مكتملة' && (
                              <button
                                onClick={() => setDeliveringTask(task)}
                                className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold transition flex items-center gap-1"
                              >
                                <PackageCheck className="w-3 h-3" />
                                <span>{isAr ? 'تسليم' : 'Deliver'}</span>
                              </button>
                            )}

                            <button
                              onClick={() => onViewRecord(task)}
                              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
                              title={isAr ? 'عرض' : 'View'}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. CUSTOMER PROFILE QUICK DRAWER / POPUP */}
      {/* ------------------------------------------------------------- */}
      {selectedCustomerDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {selectedCustomerDrawer.name_ar || selectedCustomerDrawer.name_en || 'ملف العميل'}
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">{selectedCustomerDrawer.customer_code || selectedCustomerDrawer.phone}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomerDrawer(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block">{isAr ? 'رقم الهاتف' : 'Phone'}</span>
                <span className="font-bold text-slate-800 font-mono">{selectedCustomerDrawer.phone || 'N/A'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block">{isAr ? 'الهوية الإماراتية' : 'Emirates ID'}</span>
                <span className="font-bold text-slate-800 font-mono">{selectedCustomerDrawer.emirates_id || '784-****-*******-*'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block">{isAr ? 'جواز السفر' : 'Passport'}</span>
                <span className="font-bold text-slate-800 font-mono">{selectedCustomerDrawer.passport_number || 'N/A'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block">{isAr ? 'الرصيد المستحق (ذمم)' : 'Balance Due'}</span>
                <span className="font-bold text-rose-600 font-mono">{Number(selectedCustomerDrawer.current_balance_aed || 0).toLocaleString()} د.إ</span>
              </div>
            </div>

            {/* Actions for this customer */}
            <div className="pt-2 flex items-center justify-end gap-2">
              {onOpenDocGenerator && (
                <button
                  onClick={() => {
                    const c = selectedCustomerDrawer;
                    setSelectedCustomerDrawer(null);
                    onOpenDocGenerator(c);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>{isAr ? 'إنشاء مستند ذكي' : 'Generate Doc'}</span>
                </button>
              )}

              {onViewCustomer && selectedCustomerDrawer.id && (
                <button
                  onClick={() => {
                    const id = selectedCustomerDrawer.id;
                    setSelectedCustomerDrawer(null);
                    onViewCustomer(id);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{isAr ? 'فتح الملف الكامل في CRM' : 'Open CRM Profile'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. DELIVERY LOG MODAL */}
      {/* ------------------------------------------------------------- */}
      {deliveringTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <PackageCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {isAr ? 'توثيق تسليم المعاملة للعميل' : 'Confirm Delivery to Client'}
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  {deliveringTask.transaction_number || deliveringTask.id}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isAr ? 'طريقة التسليم' : 'Delivery Method'}
                </label>
                <select
                  value={deliveryMethod}
                  onChange={(e: any) => setDeliveryMethod(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium focus:bg-white focus:outline-none"
                >
                  <option value="IN_PERSON">{isAr ? 'تسليم باليد داخل الفرع (Al Ain Branch)' : 'In-Person at Branch'}</option>
                  <option value="WHATSAPP_EMAIL">{isAr ? 'إرسال إلكتروني عبر واتساب / الإيميل الرسمي' : 'Electronic (WhatsApp/Email)'}</option>
                  <option value="COURIER">{isAr ? 'مندوب توصيل / معقب شركات' : 'Courier / PRO Dispatch'}</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isAr ? 'ملاحظات التسليم ورقم بوليصة الشحن (إن وجد)' : 'Delivery Notes / Tracking'}
                </label>
                <textarea
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder={isAr ? 'تم استلام المستندات والتوقيع من العميل أو إرسال ملف PDF...' : 'Handed over documents, tracking #, etc.'}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 h-20 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeliveringTask(null)}
                className="px-3.5 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleConfirmDelivery}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs shadow-purple-200"
              >
                <Check className="w-4 h-4" />
                <span>{isAr ? 'تأكيد التسليم والأرشفة' : 'Confirm Delivery'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
