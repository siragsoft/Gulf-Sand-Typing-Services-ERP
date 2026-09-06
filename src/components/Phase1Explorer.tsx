import React, { useState, useEffect } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  Play,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Table as TableIcon,
  Layers,
  ShieldCheck,
  Building2,
  Coins,
  Users,
  FileText,
  Search,
  Eye,
  Sliders,
  Sparkles,
  Info,
  Globe,
  Menu,
  X,
  Plus,
  Edit,
  Receipt,
  CreditCard,
  BookOpen,
  FileSpreadsheet,
  Lock,
  UserPlus,
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  Home,
  Crown,
  LogIn,
  LogOut,
  LayoutDashboard,
  BarChart3,
} from 'lucide-react';
import { db } from '../db/database';
import { TABLE_SCHEMAS, TableName, TableCategory } from '../db/schemaDefinition';
import { runFullSystemValidation, TestResult } from '../tests/schemaValidation';
import { UserRole } from '../types/schema';
import { Language, translations } from '../i18n/translations';
import {
  canCreateInTable,
  canEditInTable,
  canDeleteInTable,
  canViewTable,
  getRoleBadgeInfo,
  ROLE_PERMISSIONS,
} from '../utils/rbac';
import { useAuth } from '../context/AuthContext';
import { RecordModal } from './RecordModal';
import { QuickNewTransactionModal } from './QuickNewTransactionModal';
import { QuickNewCustomerModal } from './QuickNewCustomerModal';
import { QuickNewInvoiceModal } from './QuickNewInvoiceModal';
import { QuickNewExpenseModal } from './QuickNewExpenseModal';
import { QuickNewJournalEntryModal } from './QuickNewJournalEntryModal';
import { ApprovalsCenter } from './ApprovalsCenter';
import { OperationsHub } from './OperationsHub';
import { ExecutiveDashboard } from './ExecutiveDashboard';
import { AdvancedReportingCenter } from './AdvancedReportingCenter';
import { CustomerManagement } from './CustomerManagement';
import { AccountingDashboard } from './AccountingDashboard';
import { HRManagement } from './HRManagement';
import { ServiceBooking } from './ServiceBooking';
import { ActivityAuditLog } from './ActivityAuditLog';
import { DocumentTemplateEditor } from './DocumentTemplateEditor';
import { ReceiptVerificationModal } from './ReceiptVerificationModal';
import { UserManagementHub } from './UserManagementHub';
import { ChangePasswordModal } from './ChangePasswordModal';
import { DatabaseManagementModal } from './DatabaseManagementModal';
import { AiUsageDashboard } from './AiUsageDashboard';
import { GulfSandLogo } from './GulfSandLogo';
import { useBranding } from '../context/BrandingContext';
import { AdminDashboard } from './AdminDashboard';
import { browserNotificationService } from '../utils/browserNotifications';
import { motion, AnimatePresence } from 'motion/react';
import { Scale, UserCheck, Calendar as CalendarIcon, BellRing, QrCode, KeyRound, UserCog, BrainCircuit } from 'lucide-react';
import { TaskDashboard } from './TaskDashboard';
import { AiInsightsDrawer } from './AiInsightsDrawer';
import { ConnectionStatus } from './ConnectionStatus';
import { SystemBackupModal } from './SystemBackupModal';
import { ToastNotification } from './ToastNotification';

interface Phase1ExplorerProps {
  onNavigateToLanding?: () => void;
  onOpenAuthModal?: () => void;
}

export const Phase1Explorer: React.FC<Phase1ExplorerProps> = ({
  onNavigateToLanding,
  onOpenAuthModal,
}) => {
  const { currentUser, logout, isSuperAdmin } = useAuth();
  const [lang, setLang] = useState<Language>('ar');
  const [selectedTable, setSelectedTable] = useState<TableName>('services_pricing');
  const [tableFilterCategory, setTableFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [dataSearchQuery, setDataSearchQuery] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [stats, setStats] = useState(db.getStats());
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'TASKS' | 'BOOKINGS' | 'ACCOUNTING' | 'HR' | 'CUSTOMERS' | 'TEMPLATES' | 'AUDIT' | 'REPORTS' | 'OPERATIONS' | 'APPROVALS' | 'USERS' | 'AI_GOVERNANCE' | 'DATA' | 'SCHEMA' | 'TESTS' | 'ADMIN_DASHBOARD'>('DASHBOARD');
  const [selectedCategory, setSelectedCategory] = useState<'operations' | 'finance' | 'admin' | 'system'>('operations');
  const [tableData, setTableData] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [currentRole, setCurrentRole] = useState<UserRole>(currentUser?.role || UserRole.SYSTEM_ADMIN);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isAiInsightsOpen, setIsAiInsightsOpen] = useState(false);
  const [isSystemBackupOpen, setIsSystemBackupOpen] = useState(false);

  useEffect(() => {
    if (['DASHBOARD', 'BOOKINGS', 'OPERATIONS', 'CUSTOMERS'].includes(activeTab)) {
      setSelectedCategory('operations');
    } else if (['ACCOUNTING', 'HR'].includes(activeTab)) {
      setSelectedCategory('finance');
    } else if (['APPROVALS', 'TEMPLATES', 'REPORTS', 'AUDIT'].includes(activeTab)) {
      setSelectedCategory('admin');
    } else if (['USERS', 'AI_GOVERNANCE', 'DATA', 'SCHEMA', 'TESTS', 'ADMIN_DASHBOARD'].includes(activeTab)) {
      setSelectedCategory('system');
    }
  }, [activeTab]);

  // Modal States
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isQuickTrxOpen, setIsQuickTrxOpen] = useState(false);
  const [isQuickCustOpen, setIsQuickCustOpen] = useState(false);
  const [isQuickInvOpen, setIsQuickInvOpen] = useState(false);
  const [isQuickExpOpen, setIsQuickExpOpen] = useState(false);
  const [isQuickJrnOpen, setIsQuickJrnOpen] = useState(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [verifyToken, setVerifyToken] = useState<string>('');
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);

  const t = translations[lang];
  const isRtl = lang === 'ar';

  const isAnyCanvasModalOpen =
    isQuickTrxOpen ||
    isQuickCustOpen ||
    isQuickInvOpen ||
    isQuickExpOpen ||
    isQuickJrnOpen ||
    isRecordModalOpen ||
    isVerifyModalOpen ||
    isChangePasswordOpen ||
    isDatabaseModalOpen ||
    isSystemBackupOpen ||
    isAiInsightsOpen;

  const closeAllCanvasModals = () => {
    setIsQuickTrxOpen(false);
    setIsQuickCustOpen(false);
    setIsQuickInvOpen(false);
    setIsQuickExpOpen(false);
    setIsQuickJrnOpen(false);
    setIsRecordModalOpen(false);
    setEditingRecord(null);
    setIsVerifyModalOpen(false);
    setIsChangePasswordOpen(false);
    setIsDatabaseModalOpen(false);
    setIsSystemBackupOpen(false);
    setIsAiInsightsOpen(false);
  };

  const getActiveCanvasModalTitle = () => {
    if (isQuickTrxOpen) return isRtl ? 'معاملة جديدة سريعة' : 'Quick New Transaction';
    if (isQuickCustOpen) return isRtl ? 'تسجيل عميل جديد' : 'New Customer Registration';
    if (isQuickInvOpen) return isRtl ? 'إصدار فاتورة جديدة' : 'New Invoice Issuance';
    if (isQuickExpOpen) return isRtl ? 'سند صرف مصروفات جديد' : 'New Expense Voucher';
    if (isQuickJrnOpen) return isRtl ? 'قيد يومية محاسبي جديد' : 'New Journal Entry';
    if (isRecordModalOpen) return editingRecord ? (isRtl ? 'تعديل السجل' : 'Edit Record') : (isRtl ? 'إضافة سجل جديد' : 'New Record');
    if (isVerifyModalOpen) return isRtl ? 'فحص وتدقيق إيصال الدفع عبر رمز الاستجابة السريعة (QR)' : 'QR Receipt Verification';
    if (isChangePasswordOpen) return isRtl ? 'تغيير وتحديث كلمة المرور' : 'Change Password';
    if (isDatabaseModalOpen) return isRtl ? 'إدارة وتصفير قاعدة البيانات' : 'Database Management & Reset Hub';
    if (isSystemBackupOpen) return isRtl ? 'النسخ الاحتياطي للنظام واسترجاع البيانات' : 'System Backup & Restore';
    if (isAiInsightsOpen) return isRtl ? 'مساعد الذكاء الاصطناعي الفوري (Gemini)' : 'AI Insights Assistant';
    return '';
  };

  // Role-Based Allowed Tabs Mapping
  const ROLE_ALLOWED_TABS: Record<UserRole, string[]> = {
    [UserRole.SYSTEM_ADMIN]: ['DASHBOARD', 'TASKS', 'BOOKINGS', 'ACCOUNTING', 'HR', 'CUSTOMERS', 'TEMPLATES', 'AUDIT', 'REPORTS', 'OPERATIONS', 'APPROVALS', 'USERS', 'AI_GOVERNANCE', 'DATA', 'SCHEMA', 'TESTS', 'ADMIN_DASHBOARD'],
    [UserRole.MANAGER]: ['DASHBOARD', 'TASKS', 'BOOKINGS', 'ACCOUNTING', 'HR', 'CUSTOMERS', 'TEMPLATES', 'AUDIT', 'REPORTS', 'OPERATIONS', 'APPROVALS', 'AI_GOVERNANCE', 'ADMIN_DASHBOARD'],
    [UserRole.SUPERVISOR]: ['DASHBOARD', 'TASKS', 'BOOKINGS', 'CUSTOMERS', 'OPERATIONS', 'APPROVALS', 'TEMPLATES', 'REPORTS'],
    [UserRole.ACCOUNTS]: ['DASHBOARD', 'TASKS', 'ACCOUNTING', 'CUSTOMERS', 'REPORTS', 'APPROVALS'],
    [UserRole.HR]: ['DASHBOARD', 'TASKS', 'HR', 'REPORTS'],
    [UserRole.OPERATIONS]: ['DASHBOARD', 'TASKS', 'BOOKINGS', 'CUSTOMERS', 'OPERATIONS', 'APPROVALS', 'TEMPLATES'],
    [UserRole.CUSTOMER_SERVICE]: ['DASHBOARD', 'TASKS', 'BOOKINGS', 'CUSTOMERS', 'OPERATIONS'],
    [UserRole.VIEWER]: ['DASHBOARD', 'TASKS', 'CUSTOMERS', 'REPORTS'],
  };

  const isTabAllowed = (tab: string) => {
    const allowed = ROLE_ALLOWED_TABS[currentRole] || ['DASHBOARD'];
    return allowed.includes(tab);
  };

  // Ensure activeTab is allowed for current role
  useEffect(() => {
    const allowed = ROLE_ALLOWED_TABS[currentRole] || ['DASHBOARD'];
    if (!allowed.includes(activeTab)) {
      setActiveTab(allowed[0] as any);
    }
  }, [currentRole]);

  // Synchronize document dir and lang
  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang, isRtl]);

  // Sync role to db audit logger
  useEffect(() => {
    const roleUserNames: Record<UserRole, string> = {
      [UserRole.SYSTEM_ADMIN]: 'بشار الحاج (Admin)',
      [UserRole.MANAGER]: 'المدير التنفيذي',
      [UserRole.SUPERVISOR]: 'مشرف العمليات',
      [UserRole.ACCOUNTS]: 'المحاسب المالي',
      [UserRole.OPERATIONS]: 'موظف العمليات',
      [UserRole.CUSTOMER_SERVICE]: 'خدمة العملاء والاستقبال',
      [UserRole.HR]: 'أخصائي الموارد البشرية',
      [UserRole.VIEWER]: 'مستعرض البيانات',
    };
    db.setCurrentUser({
      id: `USR-${currentRole.slice(0, 3)}`,
      email: `${currentRole.toLowerCase()}@gulfsand.ae`,
      name: roleUserNames[currentRole] || currentRole,
    });
  }, [currentRole]);

  // Subscribe to DB changes
  useEffect(() => {
    const updateData = () => {
      setTableData(db.getAllIncludingArchived(selectedTable));
      setStats(db.getStats());
    };

    updateData();
    const unsubscribe = db.subscribe('ALL', () => {
      updateData();
    });

    return () => unsubscribe();
  }, [selectedTable]);

  // Initial test run & HR alerts check
  useEffect(() => {
    handleRunTests();
    // Proactively scan for HR documents expiring soon and trigger notifications
    const timer = setTimeout(() => {
      const employees = db.getAll('employees');
      browserNotificationService.checkEmployeesDocumentRenewals(employees);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleRunTests = () => {
    setIsRunningTests(true);
    setTimeout(() => {
      const results = runFullSystemValidation();
      setTestResults(results);
      setIsRunningTests(false);
    }, 150);
  };

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleExportJson = () => {
    const json = db.exportDatabaseJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gulfsand_erp_database_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast(t.notifications.exportSuccess);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = db.importDatabaseJson(content);
      if (success) {
        setTableData(db.getAllIncludingArchived(selectedTable));
        setStats(db.getStats());
        handleRunTests();
        showToast(t.notifications.importSuccess);
      } else {
        showToast(t.notifications.importError, 'error');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    if (window.confirm(t.notifications.demoResetConfirm)) {
      db.resetToDemoData();
      setTableData(db.getAllIncludingArchived(selectedTable));
      setStats(db.getStats());
      handleRunTests();
      showToast(t.notifications.demoResetSuccess);
    }
  };

  const handleResetEmpty = () => {
    if (window.confirm(t.notifications.emptyResetConfirm)) {
      db.resetToEmptyData();
      setTableData(db.getAllIncludingArchived(selectedTable));
      setStats(db.getStats());
      handleRunTests();
      showToast(t.notifications.emptyResetSuccess);
    }
  };

  const handleDeleteRecord = (recordId: string) => {
    if (!canDeleteInTable(currentRole, selectedTable)) {
      showToast(t.notifications.unauthorizedAction, 'error');
      return;
    }

    if (window.confirm(t.notifications.deleteConfirm)) {
      const isPermanent = currentRole === UserRole.SYSTEM_ADMIN;
      db.delete(selectedTable, recordId, isPermanent);
      showToast(t.notifications.deleteSuccess, 'success');
      if (selectedRecord?.id === recordId) setSelectedRecord(null);
    }
  };

  const tableKeys = Object.keys(TABLE_SCHEMAS) as TableName[];
  const filteredTables = tableKeys.filter((tKey) => {
    const meta = TABLE_SCHEMAS[tKey];
    const matchesCat = tableFilterCategory === 'ALL' || meta.category === tableFilterCategory;
    const matchesSearch =
      meta.nameAr.includes(searchQuery) ||
      meta.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tKey.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const selectedMeta = TABLE_SCHEMAS[selectedTable];

  // RBAC permissions on currently selected table
  const userCanCreateInTable = canCreateInTable(currentRole, selectedTable);
  const userCanEditInTable = canEditInTable(currentRole, selectedTable);
  const userCanDeleteInTable = canDeleteInTable(currentRole, selectedTable);
  const userCanViewTable = canViewTable(currentRole, selectedTable);
  const canViewCostProfit = currentRole !== UserRole.OPERATIONS && currentRole !== UserRole.VIEWER;

  const filteredData = tableData.filter((row) => {
    if (!dataSearchQuery) return true;
    const str = JSON.stringify(row).toLowerCase();
    return str.includes(dataSearchQuery.toLowerCase());
  });

  const passedTestsCount = testResults.filter((tItem) => tItem.passed).length;
  const roleBadge = getRoleBadgeInfo(currentRole, lang);

  const categoryOptions = [
    { id: 'ALL', label: t.actions.allCategories },
    { id: TableCategory.CORE_SETUP, label: t.categories.core },
    { id: TableCategory.CRM_CUSTOMERS, label: t.categories.crm },
    { id: TableCategory.SERVICES_PRICING, label: t.categories.services },
    { id: TableCategory.OPERATIONS, label: t.categories.operations },
    { id: TableCategory.INVOICING_COLLECTIONS, label: t.categories.invoicing },
    { id: TableCategory.FINANCE_ACCOUNTING, label: t.categories.accounting },
    { id: TableCategory.HR_PAYROLL, label: t.categories.hr },
    { id: TableCategory.GOVERNANCE_SYSTEM, label: t.categories.system },
  ];

  return (
    <div className={`min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-row font-sans h-screen overflow-hidden ${isRtl ? 'dir-rtl' : 'dir-ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Toast Notification */}
      {feedbackMessage && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 sm:px-5 py-3 rounded-2xl shadow-lg flex items-center gap-3 border transition-all max-w-[90vw] ${
            feedbackMessage.type === 'error'
              ? 'bg-white border-rose-200 text-rose-700 shadow-rose-100'
              : feedbackMessage.type === 'info'
              ? 'bg-white border-sky-200 text-sky-700 shadow-sky-100'
              : 'bg-white border-emerald-200 text-emerald-700 shadow-emerald-100'
          }`}
        >
          {feedbackMessage.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <span className="text-xs sm:text-sm font-semibold">{feedbackMessage.text}</span>
        </div>
      )}

      {/* MOBILE SIDEBAR BACKDROP */}
      {isMobileDrawerOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileDrawerOpen(false)}
        />
      )}

      {/* COMPREHENSIVE ERP SIDEBAR: ALL MENUS & FUNCTIONS IN SIDE */}
      <aside
        className={`fixed lg:static top-0 bottom-0 z-50 flex flex-col bg-[#0A192F] text-slate-200 border-r border-slate-800 transition-all duration-300 shadow-xl ${
          isRtl ? 'right-0 lg:border-l lg:border-r-0' : 'left-0'
        } ${
          isMobileDrawerOpen
            ? 'translate-x-0 w-80 max-w-[85vw]'
            : isRtl
            ? 'translate-x-full lg:translate-x-0 lg:w-72 xl:w-80'
            : '-translate-x-full lg:translate-x-0 lg:w-72 xl:w-80'
        } h-screen overflow-hidden`}
      >
        {/* 1. SIDEBAR BRAND & HEADER */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <GulfSandLogo size="sm" variant="horizontal" />
          </div>

          <div className="flex items-center gap-1">
            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition text-[11px] font-bold border border-slate-700/60 flex items-center gap-1"
              title={lang === 'ar' ? 'Switch to English' : 'التحويل للعربية'}
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileDrawerOpen(false)}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white lg:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. SIDEBAR USER PROFILE & ROLE SIMULATOR */}
        <div className="p-3.5 border-b border-slate-800 bg-slate-900/60 shrink-0 space-y-2.5">
          {currentUser && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    currentUser.isSuperAdmin ? 'bg-amber-400 text-slate-950' : 'bg-blue-600 text-white'
                  }`}
                >
                  {currentUser.isSuperAdmin ? <Crown className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {currentUser.fullNameAr || currentUser.email}
                  </div>
                  <div className="text-[10px] text-amber-300/90 font-mono">
                    {roleBadge.label}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setIsChangePasswordOpen(true)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition"
                  title={lang === 'ar' ? 'تعديل كلمة المرور' : 'Change Password'}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => logout()}
                  className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/80 text-rose-300 hover:text-rose-100 transition"
                  title={lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Role Simulator Dropdown */}
          <div className="bg-slate-950/60 rounded-xl p-1.5 border border-slate-800/80">
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 px-1 mb-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-indigo-400" />
                {t.roleSimLabel}
              </span>
            </div>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as UserRole)}
              className="w-full bg-slate-900 text-amber-300 font-semibold rounded-lg px-2 py-1 border border-slate-700/80 focus:outline-none focus:ring-1 focus:ring-amber-400 text-xs cursor-pointer"
            >
              <option value={UserRole.SYSTEM_ADMIN}>{t.roles.system_admin}</option>
              <option value={UserRole.MANAGER}>{t.roles.manager}</option>
              <option value={UserRole.SUPERVISOR}>{t.roles.supervisor}</option>
              <option value={UserRole.ACCOUNTS}>{t.roles.accounts}</option>
              <option value={UserRole.OPERATIONS}>{t.roles.operations}</option>
              <option value={UserRole.CUSTOMER_SERVICE}>{lang === 'ar' ? 'خدمة العملاء والاستقبال' : 'Customer Service'}</option>
              <option value={UserRole.HR}>{t.roles.hr}</option>
              <option value={UserRole.VIEWER}>{t.roles.viewer}</option>
            </select>
          </div>
        </div>

        {/* 3. SIDEBAR SCROLLABLE BODY: FUNCTIONS & ALL MENUS */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 text-xs select-none">
          
          {/* A. QUICK ACTION FUNCTIONS IN SIDE */}
          <div>
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400 px-1 mb-2">
              <span className="flex items-center gap-1 text-amber-300">
                <Sparkles className="w-3 h-3" />
                {isRtl ? 'وظائف وعمليات فورية' : 'Quick Actions & Functions'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {/* + New Transaction */}
              <button
                id="side-fn-trx"
                onClick={() => {
                  setIsQuickTrxOpen(true);
                  setIsMobileDrawerOpen(false);
                }}
                disabled={!canCreateInTable(currentRole, 'transactions')}
                className={`p-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all text-left ${
                  isRtl ? 'text-right' : 'text-left'
                } ${
                  canCreateInTable(currentRole, 'transactions')
                    ? 'bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30'
                    : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                <span className="truncate">{t.quickActions.newTransaction}</span>
              </button>

              {/* + New Customer */}
              <button
                id="side-fn-cust"
                onClick={() => {
                  setIsQuickCustOpen(true);
                  setIsMobileDrawerOpen(false);
                }}
                disabled={!canCreateInTable(currentRole, 'customers')}
                className={`p-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                  isRtl ? 'text-right' : 'text-left'
                } ${
                  canCreateInTable(currentRole, 'customers')
                    ? 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30'
                    : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                <span className="truncate">{t.quickActions.newCustomer}</span>
              </button>

              {/* + New Invoice */}
              <button
                id="side-fn-inv"
                onClick={() => {
                  setIsQuickInvOpen(true);
                  setIsMobileDrawerOpen(false);
                }}
                disabled={!canCreateInTable(currentRole, 'invoices')}
                className={`p-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                  isRtl ? 'text-right' : 'text-left'
                } ${
                  canCreateInTable(currentRole, 'invoices')
                    ? 'bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/30'
                    : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50'
                }`}
              >
                <Receipt className="w-3.5 h-3.5 shrink-0 text-cyan-400" />
                <span className="truncate">{t.quickActions.newInvoice}</span>
              </button>

              {/* + New Expense */}
              <button
                id="side-fn-exp"
                onClick={() => {
                  setIsQuickExpOpen(true);
                  setIsMobileDrawerOpen(false);
                }}
                disabled={!canCreateInTable(currentRole, 'expenses')}
                className={`p-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                  isRtl ? 'text-right' : 'text-left'
                } ${
                  canCreateInTable(currentRole, 'expenses')
                    ? 'bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30'
                    : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                <span className="truncate">{t.quickActions.newExpense}</span>
              </button>

              {/* + New Journal Entry */}
              <button
                id="side-fn-jrn"
                onClick={() => {
                  setIsQuickJrnOpen(true);
                  setIsMobileDrawerOpen(false);
                }}
                disabled={!canCreateInTable(currentRole, 'journal_entries')}
                className={`p-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                  isRtl ? 'text-right' : 'text-left'
                } ${
                  canCreateInTable(currentRole, 'journal_entries')
                    ? 'bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30'
                    : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0 text-purple-400" />
                <span className="truncate">{t.quickActions.newJournalEntry}</span>
              </button>

              {/* QR Verification */}
              <button
                id="side-fn-qr"
                onClick={() => {
                  setVerifyToken('');
                  setIsVerifyModalOpen(true);
                  setIsMobileDrawerOpen(false);
                }}
                className={`p-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all bg-teal-600/20 hover:bg-teal-600 text-teal-300 hover:text-white border border-teal-500/30 ${
                  isRtl ? 'text-right' : 'text-left'
                }`}
              >
                <QrCode className="w-3.5 h-3.5 shrink-0 text-teal-400" />
                <span className="truncate">{isRtl ? 'فحص إيصال QR' : 'Verify QR'}</span>
              </button>
            </div>

            {/* Database Hub Quick Trigger */}
            <button
              onClick={() => {
                setIsDatabaseModalOpen(true);
                setIsMobileDrawerOpen(false);
              }}
              className={`w-full mt-1.5 p-2 rounded-xl text-[11px] font-bold flex items-center justify-between transition-all bg-amber-500/15 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 ${
                isRtl ? 'text-right' : 'text-left'
              }`}
            >
              <div className="flex items-center gap-2">
                <Database className="w-3.5 h-3.5 shrink-0" />
                <span>{isRtl ? 'إدارة وتصفير قاعدة البيانات' : 'Database & Reset Hub'}</span>
              </div>
              <ChevronRight className={`w-3 h-3 ${isRtl ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* B. CATEGORY 1: OPERATIONS & CORE (العمليات والتشغيل) */}
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1 pt-1 flex items-center justify-between">
              <span>{isRtl ? 'العمليات والتشغيل' : 'Operations & Core'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            </div>

            {isTabAllowed('DASHBOARD') && (
              <button
                onClick={() => {
                  setActiveTab('DASHBOARD');
                  setIsMobileDrawerOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === 'DASHBOARD'
                    ? 'bg-blue-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard className="w-4 h-4 shrink-0 text-blue-400" />
                  <span>{t.tabs.dashboard}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            )}

            {isTabAllowed('OPERATIONS') && (
              <button
                onClick={() => {
                  setActiveTab('OPERATIONS');
                  setIsMobileDrawerOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === 'OPERATIONS'
                    ? 'bg-blue-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-4 h-4 shrink-0 text-blue-400" />
                  <span>{t.tabs.operationsHub}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            )}

            {isTabAllowed('CUSTOMERS') && (
              <button
                onClick={() => {
                  setActiveTab('CUSTOMERS');
                  setIsMobileDrawerOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === 'CUSTOMERS'
                    ? 'bg-blue-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 shrink-0 text-sky-400" />
                  <span>{t.tabs.customers}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 font-mono text-slate-400 font-semibold">
                  {stats.customersCount}
                </span>
              </button>
            )}

            {isTabAllowed('BOOKINGS') && (
              <button
                onClick={() => {
                  setActiveTab('BOOKINGS');
                  setIsMobileDrawerOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === 'BOOKINGS'
                    ? 'bg-blue-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CalendarIcon className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{isRtl ? 'حجز المواعيد والخدمات' : 'Service Bookings'}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            )}

            {isTabAllowed('TASKS') && (
              <button
                onClick={() => {
                  setActiveTab('TASKS');
                  setIsMobileDrawerOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === 'TASKS'
                    ? 'bg-blue-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>{isRtl ? 'لوحة المهام والحجوزات' : 'Task Dashboard'}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>

          {/* C. CATEGORY 2: FINANCE & HR (المالية والموارد البشرية) */}
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1 pt-2 flex items-center justify-between">
              <span>{isRtl ? 'المالية والموارد البشرية' : 'Finance & HR'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>

            {isTabAllowed('ACCOUNTING') && (
              <button
                onClick={() => {
                  setActiveTab('ACCOUNTING');
                  setIsMobileDrawerOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === 'ACCOUNTING'
                    ? 'bg-emerald-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Scale className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{t.tabs.accounting}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            )}

            {isTabAllowed('HR') && (
              <button
                onClick={() => {
                  setActiveTab('HR');
                  setIsMobileDrawerOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === 'HR'
                    ? 'bg-emerald-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 shrink-0 text-teal-400" />
                  <span>{t.tabs.hr}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>

          {/* D. CATEGORY 3: ADMIN & GOVERNANCE (الإدارة والرقابة والوثائق) */}
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1 pt-2 flex items-center justify-between">
              <span>{isRtl ? 'الإدارة والرقابة والوثائق' : 'Admin & Governance'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            </div>

            {isTabAllowed('APPROVALS') && (
              <button
                onClick={() => {
                  setActiveTab('APPROVALS');
                  setIsMobileDrawerOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === 'APPROVALS'
                    ? 'bg-indigo-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-400" />
                  <span>{t.tabs.approvals}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            )}

            {isTabAllowed('TEMPLATES') && (
              <button
                onClick={() => {
                  setActiveTab('TEMPLATES');
                  setIsMobileDrawerOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === 'TEMPLATES'
                    ? 'bg-indigo-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>{t.tabs.templates}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            )}

            {isTabAllowed('REPORTS') && (
              <button
                onClick={() => {
                  setActiveTab('REPORTS');
                  setIsMobileDrawerOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === 'REPORTS'
                    ? 'bg-indigo-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4 shrink-0 text-sky-400" />
                  <span>{t.tabs.reports}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            )}

            {isTabAllowed('AUDIT') && (
              <button
                onClick={() => {
                  setActiveTab('AUDIT');
                  setIsMobileDrawerOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === 'AUDIT'
                    ? 'bg-indigo-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{isRtl ? 'سجل التدقيق الأمني' : 'Activity Audit'}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>

          {/* E. CATEGORY 4: SYSTEM & TECH (إعدادات النظام والأمان وقواعد البيانات) */}
          <div className="space-y-1">
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-1 pt-2 flex items-center justify-between">
              <span>{isRtl ? 'النظام والتقنية والأمان' : 'System Tech & Security'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            </div>

            {isTabAllowed('ADMIN_DASHBOARD') && (
              <button
                onClick={() => {
                  setActiveTab('ADMIN_DASHBOARD');
                  setIsMobileDrawerOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === 'ADMIN_DASHBOARD'
                    ? 'bg-amber-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>{isRtl ? 'لوحة تحكم مدير النظام' : 'Admin Console'}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            )}

            {isTabAllowed('USERS') && (
              <button
                onClick={() => {
                  setActiveTab('USERS');
                  setIsMobileDrawerOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === 'USERS'
                    ? 'bg-amber-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UserCog className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>{isRtl ? 'إدارة المستخدمين والصلاحيات' : 'User Security & RBAC'}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            )}

            {isTabAllowed('AI_GOVERNANCE') && (
              <button
                onClick={() => {
                  setActiveTab('AI_GOVERNANCE');
                  setIsMobileDrawerOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === 'AI_GOVERNANCE'
                    ? 'bg-amber-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BrainCircuit className="w-4 h-4 shrink-0 text-purple-400" />
                  <span>{isRtl ? 'حوكمة الذكاء الاصطناعي' : 'AI Governance'}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            )}

            {isTabAllowed('DATA') && (
              <button
                onClick={() => {
                  setActiveTab('DATA');
                  setIsMobileDrawerOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === 'DATA'
                    ? 'bg-amber-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Database className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>{isRtl ? 'تصفح الـ 36 جدول وقاعدة البيانات' : 'Master Data Tables (36)'}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 font-mono text-slate-400 font-semibold">
                  {stats.tablesCount}
                </span>
              </button>
            )}

            {isTabAllowed('SCHEMA') && (
              <button
                onClick={() => {
                  setActiveTab('SCHEMA');
                  setIsMobileDrawerOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === 'SCHEMA'
                    ? 'bg-amber-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 shrink-0 text-cyan-400" />
                  <span>{t.tabs.schema}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${isRtl ? 'rotate-180' : ''}`} />
              </button>
            )}

            {isTabAllowed('TESTS') && (
              <button
                onClick={() => {
                  setActiveTab('TESTS');
                  setIsMobileDrawerOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                  activeTab === 'TESTS'
                    ? 'bg-amber-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{t.tabs.tests}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 font-mono font-bold">
                  {passedTestsCount}/{testResults.length}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* 4. SIDEBAR FOOTER: SYSTEM CONTROLS & UTILITIES */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/70 shrink-0 space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-1.5">
            {/* System Health / Tests */}
            <button
              onClick={handleRunTests}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 flex items-center gap-1.5 font-semibold text-[11px] transition"
              title={isRtl ? 'إعادة فحص واختبار تماسك الجداول' : 'Run system tests'}
            >
              <Play className="w-3.5 h-3.5 text-indigo-400" />
              <span className="truncate">{t.actions.runTests}</span>
            </button>

            {/* Backup Modal */}
            <button
              onClick={() => setIsSystemBackupOpen(true)}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 flex items-center gap-1.5 font-semibold text-[11px] transition"
              title={isRtl ? 'النسخ الاحتياطي التلقائي واليدوي' : 'System Backup Hub'}
            >
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span className="truncate">{isRtl ? 'النسخ الاحتياطي' : 'Backup'}</span>
            </button>

            {/* Export JSON */}
            <button
              onClick={handleExportJson}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 flex items-center gap-1.5 font-semibold text-[11px] transition"
              title={t.actions.exportJson}
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{t.actions.exportJson}</span>
            </button>

            {/* Import JSON */}
            <label className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 flex items-center gap-1.5 font-semibold text-[11px] transition cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate">{t.actions.importJson}</span>
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>
          </div>

          {/* Landing Page Navigation Button */}
          {onNavigateToLanding && (
            <button
              onClick={onNavigateToLanding}
              className="w-full p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 flex items-center justify-center gap-2 font-bold text-[11px] transition"
            >
              <Home className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'ar' ? 'الموقع التعريفي العام لجلف ساند' : 'Gulf Sand Public Landing'}</span>
            </button>
          )}
        </div>
      </aside>

      {/* MAIN WORKSPACE VIEWPORT (EXPANSIVE & UNCLUTTERED) */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC] h-screen overflow-y-auto">
        {/* TOP WORKSPACE BAR */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 py-2.5 shadow-2xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Sidebar Toggle for Mobile */}
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 lg:hidden min-h-[38px] min-w-[38px] flex items-center justify-center"
              aria-label="Toggle Sidebar Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Active View Title & Breadcrumbs */}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black text-slate-900 truncate">
                  {activeTab === 'DASHBOARD' && t.tabs.dashboard}
                  {activeTab === 'OPERATIONS' && t.tabs.operationsHub}
                  {activeTab === 'CUSTOMERS' && t.tabs.customers}
                  {activeTab === 'BOOKINGS' && (isRtl ? 'حجز المواعيد والخدمات' : 'Service Bookings')}
                  {activeTab === 'TASKS' && (isRtl ? 'لوحة المهام والحجوزات' : 'Task Dashboard')}
                  {activeTab === 'ACCOUNTING' && t.tabs.accounting}
                  {activeTab === 'HR' && t.tabs.hr}
                  {activeTab === 'APPROVALS' && t.tabs.approvals}
                  {activeTab === 'TEMPLATES' && t.tabs.templates}
                  {activeTab === 'REPORTS' && t.tabs.reports}
                  {activeTab === 'AUDIT' && (isRtl ? 'سجل التدقيق الأمني والنشاط' : 'Activity Audit Log')}
                  {activeTab === 'ADMIN_DASHBOARD' && (isRtl ? 'لوحة تحكم مدير النظام' : 'Admin Console')}
                  {activeTab === 'USERS' && (isRtl ? 'إدارة المستخدمين والصلاحيات' : 'User Security & RBAC')}
                  {activeTab === 'AI_GOVERNANCE' && (isRtl ? 'حوكمة الذكاء الاصطناعي' : 'AI Governance')}
                  {activeTab === 'DATA' && (isRtl ? 'متصفح الـ 36 جدول وقاعدة البيانات' : 'Master Data Tables (36)')}
                  {activeTab === 'SCHEMA' && t.tabs.schema}
                  {activeTab === 'TESTS' && t.tabs.tests}
                </h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleBadge.bg} ${roleBadge.color}`}>
                  {roleBadge.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {isRtl ? 'نظام جلف ساند السحابي لإدارة وتوثيق المعاملات والمالية' : 'Gulf Sand Integrated Enterprise Management Platform'}
              </p>
            </div>
          </div>

          {/* Top Bar Quick Action Triggers */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Connection Status Indicator */}
            <ConnectionStatus lang={lang} />

            {/* AI Insights Assistant Launch Button */}
            <button
              onClick={() => setIsAiInsightsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-xs transition cursor-pointer min-h-[36px]"
              title={isRtl ? 'رؤى الذكاء الاصطناعي الفورية (Gemini)' : 'Open AI Insights Assistant'}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{isRtl ? 'رؤى الذكاء الاصطناعي' : 'AI Insights'}</span>
            </button>

            {/* Browser Notifications Permission Trigger */}
            <button
              onClick={async () => {
                const granted = await browserNotificationService.requestPermission();
                if (granted) {
                  showToast(isRtl ? 'تم تفعيل إشعارات النظام بنجاح' : 'Browser notifications enabled');
                  browserNotificationService.checkEmployeesDocumentRenewals(db.getAll('employees'));
                } else {
                  showToast(isRtl ? 'إشعارات المتصفح غير مفعلة' : 'Notifications permission denied', 'info');
                }
              }}
              className="p-2 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
              title={isRtl ? 'تفعيل إشعارات المتصفح' : 'Enable browser notifications'}
            >
              <BellRing className="w-4 h-4 text-amber-500" />
            </button>
          </div>
        </header>

        {/* WORKSPACE CONTENT BODY */}
        <div className="p-4 sm:p-6 space-y-5 flex-1 flex flex-col">
          
          {/* EMBEDDED CANVAS FUNCTION VIEW (Opens directly in main canvas, no floating overlay) */}
          {isAnyCanvasModalOpen ? (
            <motion.div
              key="embedded-canvas-view"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full flex-1 flex flex-col space-y-4"
            >
              {/* Navigation Bar back to workspace */}
              <div className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-2xl shadow-2xs">
                <div className="flex items-center gap-3">
                  <button
                    onClick={closeAllCanvasModals}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                  >
                    <ChevronLeft className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                    <span>{isRtl ? 'رجوع إلى الشاشة الرئيسية' : 'Back to Workspace'}</span>
                  </button>
                  <div className="h-5 w-px bg-slate-200 hidden sm:block" />
                  <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    {getActiveCanvasModalTitle()}
                  </span>
                </div>
                
                <button
                  onClick={closeAllCanvasModals}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold cursor-pointer"
                >
                  ✕ {isRtl ? 'إغلاق' : 'Close'}
                </button>
              </div>

              {/* Embedded Views */}
              <div className="w-full flex-1">
                {isQuickTrxOpen && (
                  <QuickNewTransactionModal
                    isOpen={true}
                    embedded={true}
                    onClose={() => setIsQuickTrxOpen(false)}
                    currentRole={currentRole}
                    lang={lang}
                    onCreated={(trx) => {
                      setStats(db.getStats());
                      setSelectedTable('transactions');
                      setIsQuickTrxOpen(false);
                      showToast(lang === 'ar' ? `تم فتح المعاملة رقم ${trx.transaction_number} بنجاح!` : `Transaction created!`);
                    }}
                  />
                )}

                {isQuickCustOpen && (
                  <QuickNewCustomerModal
                    isOpen={true}
                    embedded={true}
                    onClose={() => setIsQuickCustOpen(false)}
                    currentRole={currentRole}
                    lang={lang}
                    onCreated={(cust) => {
                      setStats(db.getStats());
                      setSelectedTable('customers');
                      setIsQuickCustOpen(false);
                      showToast(lang === 'ar' ? `تم تسجيل العميل (${cust.name_ar}) بنجاح!` : `Customer registered!`);
                    }}
                  />
                )}

                {isQuickInvOpen && (
                  <QuickNewInvoiceModal
                    isOpen={true}
                    embedded={true}
                    onClose={() => setIsQuickInvOpen(false)}
                    currentRole={currentRole}
                    lang={lang}
                    onCreated={(inv) => {
                      setStats(db.getStats());
                      setSelectedTable('invoices');
                      setIsQuickInvOpen(false);
                      showToast(lang === 'ar' ? `تم إصدار الفاتورة رقم ${inv.invoice_number} بنجاح!` : `Invoice issued!`);
                    }}
                  />
                )}

                {isQuickExpOpen && (
                  <QuickNewExpenseModal
                    isOpen={true}
                    embedded={true}
                    onClose={() => setIsQuickExpOpen(false)}
                    currentRole={currentRole}
                    lang={lang}
                    onCreated={(exp) => {
                      setStats(db.getStats());
                      setSelectedTable('expenses');
                      setIsQuickExpOpen(false);
                      showToast(lang === 'ar' ? `تم حفظ سند الصرف رقم ${exp.expense_number} بنجاح!` : `Expense voucher recorded!`);
                    }}
                  />
                )}

                {isQuickJrnOpen && (
                  <QuickNewJournalEntryModal
                    isOpen={true}
                    embedded={true}
                    onClose={() => setIsQuickJrnOpen(false)}
                    currentRole={currentRole}
                    lang={lang}
                    onCreated={(jrn) => {
                      setStats(db.getStats());
                      setSelectedTable('journal_entries');
                      setIsQuickJrnOpen(false);
                      showToast(lang === 'ar' ? `تم ترحيل القيد المحاسبي ${jrn.entry_number} بنجاح!` : `Journal entry posted!`);
                    }}
                  />
                )}

                {isRecordModalOpen && (
                  <RecordModal
                    isOpen={true}
                    embedded={true}
                    onClose={() => {
                      setIsRecordModalOpen(false);
                      setEditingRecord(null);
                    }}
                    tableName={selectedTable}
                    initialRecord={editingRecord}
                    currentRole={currentRole}
                    lang={lang}
                    onSaved={(saved) => {
                      setTableData(db.getAllIncludingArchived(selectedTable));
                      setStats(db.getStats());
                      setIsRecordModalOpen(false);
                      setEditingRecord(null);
                      showToast(
                        editingRecord
                          ? lang === 'ar'
                            ? 'تم تحديث السجل بنجاح!'
                            : 'Record updated successfully!'
                          : lang === 'ar'
                          ? 'تم إنشاء السجل بنجاح!'
                          : 'Record created successfully!'
                      );
                    }}
                  />
                )}

                {isVerifyModalOpen && (
                  <ReceiptVerificationModal
                    token={verifyToken}
                    isOpen={true}
                    embedded={true}
                    onClose={() => setIsVerifyModalOpen(false)}
                    currentUser={{
                      id: currentUser?.id || 'USR-001',
                      role: currentRole,
                      name: currentUser?.fullNameAr || (isRtl ? 'بشار الحاج (المدير العام)' : 'Bashar Al Haj (Director)'),
                    }}
                    onTokenRevoked={() => {
                      setStats(db.getStats());
                      showToast(isRtl ? 'تم تحديث حالة رمز الإيصال وإلغاؤه رسمياً' : 'Receipt token revoked successfully');
                    }}
                  />
                )}

                {isChangePasswordOpen && (
                  <ChangePasswordModal
                    isOpen={true}
                    embedded={true}
                    onClose={() => setIsChangePasswordOpen(false)}
                    isMandatoryFirstLogin={false}
                    lang={lang}
                  />
                )}

                {isDatabaseModalOpen && (
                  <DatabaseManagementModal
                    isOpen={true}
                    embedded={true}
                    onClose={() => setIsDatabaseModalOpen(false)}
                    currentRole={currentRole}
                    lang={lang}
                    onDatabaseChanged={() => {
                      setStats(db.getStats());
                      setTableData(db.getAll(selectedTable));
                      showToast(
                        lang === 'ar'
                          ? 'تم تحديث حالة قاعدة البيانات بالكامل بنجاح!'
                          : 'Database state updated successfully!',
                        'success'
                      );
                    }}
                    onOpenNewCustomer={() => {
                      setIsDatabaseModalOpen(false);
                      setIsQuickCustOpen(true);
                    }}
                    onOpenNewTransaction={() => {
                      setIsDatabaseModalOpen(false);
                      setIsQuickTrxOpen(true);
                    }}
                    onOpenImportHub={() => {
                      setIsDatabaseModalOpen(false);
                      setActiveTab('DATA');
                    }}
                  />
                )}

                {isSystemBackupOpen && (
                  <SystemBackupModal
                    isOpen={true}
                    embedded={true}
                    onClose={() => setIsSystemBackupOpen(false)}
                    lang={lang}
                    showToast={showToast}
                  />
                )}

                {isAiInsightsOpen && (
                  <AiInsightsDrawer
                    isOpen={true}
                    embedded={true}
                    onClose={() => setIsAiInsightsOpen(false)}
                    lang={lang}
                    currentRole={currentRole}
                    showToast={showToast}
                  />
                )}
              </div>
            </motion.div>
          ) : (
            <>
              {/* Clean Database Notification Banner (when DB is empty) */}
              {stats.customersCount === 0 && stats.transactionsCount === 0 && (
                <div className="bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 border-2 border-emerald-500/40 text-white p-4 sm:p-5 rounded-2xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in duration-300">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 text-emerald-400">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm sm:text-base text-white">
                          {isRtl ? 'قاعدة بيانات نظيفة وجاهزة لإدخال البيانات الفعلية' : 'Clean Database Ready for Live Production Entry'}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300">
                          {isRtl ? 'وضع البدء من الصفر' : 'Fresh Start'}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-100/80 mt-0.5 max-w-2xl">
                        {isRtl
                          ? 'تم تصفير السجلات التجريبية بالكامل وتجهيز الكتالوج وقائمة الحسابات الرسمية. يمكنك استخدام القائمة الجانبية لتسجيل العملاء وإصدار المعاملات.'
                          : 'All demo records purged. Use sidebar quick functions to start recording clients and transactions.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center flex-wrap gap-2 w-full md:w-auto shrink-0">
                    <button
                      onClick={() => setIsQuickCustOpen(true)}
                      className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{isRtl ? '+ إضافة عميل' : '+ Add Customer'}</span>
                    </button>
                    <button
                      onClick={() => setIsQuickTrxOpen(true)}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>{isRtl ? '+ فتح معاملة' : '+ New Transaction'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Dynamic Tab Body Rendered with Motion Transitions */}
              <AnimatePresence mode="wait">
          {/* EXECUTIVE DASHBOARD TAB */}
          {activeTab === 'DASHBOARD' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <ExecutiveDashboard
                currentRole={currentRole}
                lang={lang}
                onNavigateTab={(tab) => {
                  if (tab === 'accounting') setActiveTab('ACCOUNTING');
                  else if (tab === 'hr') setActiveTab('HR');
                  else if (tab === 'customers') setActiveTab('CUSTOMERS');
                  else if (tab === 'reports') setActiveTab('REPORTS');
                  else if (tab === 'data') setActiveTab('DATA');
                  else if (tab === 'operationsHub') setActiveTab('OPERATIONS');
                  else if (tab === 'approvals') setActiveTab('APPROVALS');
                }}
                onOpenNewTransaction={() => setIsQuickTrxOpen(true)}
                onOpenNewCustomer={() => setIsQuickCustOpen(true)}
                onOpenNewInvoice={() => setIsQuickInvOpen(true)}
                onOpenNewExpense={() => setIsQuickExpOpen(true)}
                onViewRecord={(row) => setSelectedRecord(row)}
              />
            </motion.div>
          )}

          {/* SERVICE BOOKING SCHEDULER TAB */}
          {activeTab === 'BOOKINGS' && (
            <motion.div
              key="bookings"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <ServiceBooking
                currentRole={currentRole}
                lang={lang}
                onNavigateToCustomer={(custId) => {
                  setActiveTab('CUSTOMERS');
                }}
                onOpenNewTransactionForCustomer={(custId, custName) => {
                  setIsQuickTrxOpen(true);
                }}
              />
            </motion.div>
          )}

          {/* ACCOUNTING & FINANCIAL DASHBOARD TAB */}
          {activeTab === 'ACCOUNTING' && (
            <motion.div
              key="accounting"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <AccountingDashboard
                currentRole={currentRole}
                lang={lang}
                onOpenNewInvoice={() => setIsQuickInvOpen(true)}
                onOpenNewExpense={() => setIsQuickExpOpen(true)}
                onOpenNewJournalEntry={() => setIsQuickJrnOpen(true)}
              />
            </motion.div>
          )}

          {/* HR & PAYROLL MANAGEMENT TAB */}
          {activeTab === 'HR' && (
            <motion.div
              key="hr"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <HRManagement
                currentRole={currentRole}
                lang={lang}
                onNavigateTab={(tab) => {
                  if (tab === 'accounting') setActiveTab('ACCOUNTING');
                  else if (tab === 'customers') setActiveTab('CUSTOMERS');
                  else if (tab === 'reports') setActiveTab('REPORTS');
                  else if (tab === 'data') setActiveTab('DATA');
                }}
              />
            </motion.div>
          )}

          {/* CUSTOMER MANAGEMENT & PROFILES TAB */}
          {activeTab === 'CUSTOMERS' && (
            <motion.div
              key="customers"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <CustomerManagement
                currentRole={currentRole}
                lang={lang}
                onOpenNewTransactionForCustomer={(customerId, customerName) => {
                  setIsQuickTrxOpen(true);
                }}
                onOpenNewInvoiceForCustomer={(customerId, customerName) => {
                  setIsQuickInvOpen(true);
                }}
                onViewRecord={(row) => setSelectedRecord(row)}
              />
            </motion.div>
          )}

          {/* TASK DASHBOARD TAB */}
          {activeTab === 'TASKS' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <TaskDashboard
                lang={lang}
                onNavigateTab={(tab) => setActiveTab(tab)}
                showToast={(text, type) => showToast(text, type || 'success')}
              />
            </motion.div>
          )}
          {activeTab === 'TEMPLATES' && (
            <motion.div
              key="templates"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <DocumentTemplateEditor
                currentUser={{
                  id: currentUser?.id || 'USR-001',
                  role: currentRole,
                  name: currentUser?.fullNameAr || (isRtl ? 'بشار الحاج (المدير العام)' : 'Bashar Al Haj (Director)'),
                  email: currentUser?.email || 'bashar.elhaj.ai@gmail.com',
                }}
              />
            </motion.div>
          )}

          {/* ACTIVITY AUDIT LOG TAB */}
          {activeTab === 'AUDIT' && (
            <motion.div
              key="audit"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <ActivityAuditLog
                currentRole={currentRole}
                lang={lang}
                defaultModule="ALL"
              />
            </motion.div>
          )}

          {/* ADVANCED GRAPHICAL REPORTING CENTER TAB */}
          {activeTab === 'REPORTS' && (
            <motion.div
              key="reports"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <AdvancedReportingCenter
                currentRole={currentRole}
                lang={lang}
              />
            </motion.div>
          )}

          {/* OPERATIONS PIPELINE HUB TAB */}
          {activeTab === 'OPERATIONS' && (
            <motion.div
              key="operations"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <OperationsHub
                currentRole={currentRole}
                lang={lang}
                onOpenNewTransaction={() => setIsQuickTrxOpen(true)}
                onViewRecord={(row) => setSelectedRecord(row)}
                onEditRecord={(row) => {
                  setSelectedTable('transactions');
                  setEditingRecord(row);
                  setIsRecordModalOpen(true);
                }}
              />
            </motion.div>
          )}

          {/* APPROVALS CENTER TAB */}
          {activeTab === 'APPROVALS' && (
            <motion.div
              key="approvals"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <ApprovalsCenter
                currentRole={currentRole}
                lang={lang}
                onUpdated={() => {
                  setStats(db.getStats());
                  setTableData(db.getAllIncludingArchived(selectedTable));
                }}
              />
            </motion.div>
          )}

          {/* USER MANAGEMENT & SECURITY RBAC HUB */}
          {activeTab === 'USERS' && (
            <motion.div
              key="users_management"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <UserManagementHub
                lang={lang}
                onOpenActivationUrl={(token) => {
                  window.location.hash = `#token=${token}`;
                }}
              />
            </motion.div>
          )}

          {/* AI GOVERNANCE & BUDGETING HUB */}
          {activeTab === 'AI_GOVERNANCE' && (
            <motion.div
              key="ai_governance"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <AiUsageDashboard lang={lang} />
            </motion.div>
          )}

          {/* ADMINISTRATIVE GOVERNANCE CENTRAL CONSOLE */}
          {activeTab === 'ADMIN_DASHBOARD' && (
            <motion.div
              key="admin_dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              <AdminDashboard lang={lang} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* MASTER DATA / SCHEMA / TESTS VIEWS */}
        {(activeTab === 'DATA' || activeTab === 'SCHEMA' || activeTab === 'TESTS') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start flex-1">
            {/* Desktop Left Sidebar: 36 Tables Navigator */}
            <div className="hidden lg:flex lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex-col h-[calc(100vh-320px)] sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <TableIcon className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-sm font-bold text-slate-900">{t.actions.toggleTables}</h2>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                  {filteredTables.length} / {tableKeys.length}
                </span>
              </div>

              {/* Search Box */}
              <div className="relative mb-3">
                <Search className={`w-4 h-4 text-slate-400 absolute top-2.5 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                <input
                  type="text"
                  placeholder={t.actions.searchTables}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition ${
                    isRtl ? 'pr-9.5 pl-3.5' : 'pl-9.5 pr-3.5'
                  }`}
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1 mb-3 pb-3 border-b border-slate-100 text-[11px]">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setTableFilterCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      tableFilterCategory === cat.id
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Tables Scrollable List */}
              <div className="flex-1 overflow-y-auto space-y-1.5 pl-1 -ml-1 pr-1">
                {filteredTables.map((tName) => {
                  const meta = TABLE_SCHEMAS[tName];
                  const isSelected = selectedTable === tName;
                  const recordsCount = ((db.getDatabaseState() as any)[tName] || []).length;
                  const tableNameDisplay = lang === 'ar' ? meta.nameAr : meta.nameEn;
                  const isAllowed = canViewTable(currentRole, tName);

                  return (
                    <button
                      key={tName}
                      onClick={() => {
                        setSelectedTable(tName);
                        setSelectedRecord(null);
                      }}
                      className={`w-full ${isRtl ? 'text-right' : 'text-left'} p-3 rounded-xl border text-xs transition flex items-center justify-between group cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950 font-semibold shadow-2xs'
                          : 'bg-white border-transparent hover:bg-slate-50 text-slate-700 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
                            isSelected ? 'bg-indigo-600' : 'bg-slate-300 group-hover:bg-slate-400'
                          }`}
                        />
                        <div className="truncate">
                          <div className={`truncate ${isSelected ? 'text-indigo-950 font-bold' : 'text-slate-800 font-medium'}`}>
                            {tableNameDisplay}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">{tName}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {!isAllowed && (
                          <span title="Restricted">
                            <Lock className="w-3 h-3 text-amber-500" />
                          </span>
                        )}
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                            recordsCount > 0
                              ? isSelected
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'bg-slate-100 text-slate-600'
                              : 'text-slate-400'
                          }`}
                        >
                          {recordsCount}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Drawer for Tables List */}
            {isMobileDrawerOpen && (
              <div className="fixed inset-0 z-50 lg:hidden flex">
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setIsMobileDrawerOpen(false)} />
                <div className={`relative z-10 w-[85vw] max-w-sm bg-white h-full flex flex-col p-5 shadow-2xl ${isRtl ? 'mr-auto' : 'ml-auto'}`}>
                  <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <TableIcon className="w-4 h-4" />
                      </div>
                      <h2 className="text-sm font-bold text-slate-900">{t.actions.toggleTables}</h2>
                    </div>
                    <button
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 bg-slate-50 min-h-[36px] min-w-[36px] flex items-center justify-center"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="relative mb-3">
                    <Search className={`w-4 h-4 text-slate-400 absolute top-2.5 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                    <input
                      type="text"
                      placeholder={t.actions.searchTables}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition ${
                        isRtl ? 'pr-9.5 pl-3.5' : 'pl-9.5 pr-3.5'
                      }`}
                    />
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3 pb-3 border-b border-slate-100 text-[11px] max-h-24 overflow-y-auto">
                    {categoryOptions.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setTableFilterCategory(cat.id)}
                        className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                          tableFilterCategory === cat.id
                            ? 'bg-indigo-600 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                    {filteredTables.map((tName) => {
                      const meta = TABLE_SCHEMAS[tName];
                      const isSelected = selectedTable === tName;
                      const recordsCount = ((db.getDatabaseState() as any)[tName] || []).length;
                      const tableNameDisplay = lang === 'ar' ? meta.nameAr : meta.nameEn;

                      return (
                        <button
                          key={tName}
                          onClick={() => {
                            setSelectedTable(tName);
                            setSelectedRecord(null);
                            setIsMobileDrawerOpen(false);
                          }}
                          className={`w-full ${isRtl ? 'text-right' : 'text-left'} p-3 rounded-xl border text-xs transition flex items-center justify-between min-h-[44px] ${
                            isSelected
                              ? 'bg-indigo-50/80 border-indigo-200 text-indigo-950 font-semibold shadow-2xs'
                              : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="truncate">
                            <div className="font-semibold text-slate-900">{tableNameDisplay}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{tName}</div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-100 text-slate-600 font-semibold">
                            {recordsCount}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Right Side: Main Table Content & View Tabs */}
            <div className="col-span-1 lg:col-span-8 space-y-6">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                        {lang === 'ar' ? selectedMeta.nameAr : selectedMeta.nameEn}
                      </h2>
                      <span className="text-xs px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono font-medium border border-slate-200">
                        {selectedTable}
                      </span>
                      <span className="text-xs text-slate-500">
                        {t.schemaMeta.idPrefixFormat}{' '}
                        <code className="text-indigo-600 font-semibold font-mono bg-indigo-50 px-1.5 py-0.5 rounded">
                          {selectedMeta.idPrefix}
                        </code>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{selectedMeta.description}</p>
                  </div>

                  {/* Add New Record Button for this table */}
                  {activeTab === 'DATA' && (
                    <button
                      id="btn-add-record-table"
                      onClick={() => {
                        setEditingRecord(null);
                        setIsRecordModalOpen(true);
                      }}
                      disabled={!userCanCreateInTable}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all ${
                        userCanCreateInTable
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-95 cursor-pointer'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      <span>{lang === 'ar' ? 'إضافة سجل جديد' : 'Add New Record'}</span>
                    </button>
                  )}
                </div>

                {/* TAB 1: DATA BROWSER */}
                {activeTab === 'DATA' && (
                  <div className="pt-5 space-y-4">
                    {/* Search Bar & Role Info */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="relative flex-1 max-w-sm w-full">
                        <Search className={`w-4 h-4 text-slate-400 absolute top-2.5 ${isRtl ? 'right-3.5' : 'left-3.5'}`} />
                        <input
                          type="text"
                          placeholder={t.actions.searchData}
                          value={dataSearchQuery}
                          onChange={(e) => setDataSearchQuery(e.target.value)}
                          className={`w-full bg-slate-50 border border-slate-200 rounded-xl py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition ${
                            isRtl ? 'pr-9.5 pl-3.5' : 'pl-9.5 pr-3.5'
                          }`}
                        />
                      </div>

                      {!canViewCostProfit && (
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
                          <Info className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>
                            {t.notifications.costProfitHidden} {roleBadge.label}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Data Table */}
                    {filteredData.length === 0 ? (
                      <div className="text-center py-12 sm:py-14 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 p-4">
                        <Database className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-600">{t.notifications.emptyRecordsTitle}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {t.notifications.emptyRecordsDesc}
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-200 -mx-4 sm:mx-0">
                        <table className={`w-full ${isRtl ? 'text-right' : 'text-left'} text-xs`}>
                          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase">
                            <tr>
                              <th className="p-3.5">{t.tableHeaders.id}</th>
                              {selectedMeta.fields
                                .filter((f) => {
                                  if (!canViewCostProfit && (f.name.includes('cost') || f.name.includes('profit'))) {
                                    return false;
                                  }
                                  return f.name !== 'id' && f.name !== 'created_at' && f.name !== 'updated_at';
                                })
                                .slice(0, 5)
                                .map((f) => (
                                  <th key={f.name} className="p-3.5">
                                    {lang === 'ar' ? f.labelAr : f.labelEn || f.name}
                                  </th>
                                ))}
                              <th className="p-3.5 text-center">{t.tableHeaders.actions}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredData.map((row) => (
                              <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="p-3.5 font-mono font-bold text-indigo-600">
                                  <span className="bg-indigo-50/80 px-2 py-0.5 rounded-md border border-indigo-100">
                                    {row.id}
                                  </span>
                                </td>
                                {selectedMeta.fields
                                  .filter((f) => {
                                    if (!canViewCostProfit && (f.name.includes('cost') || f.name.includes('profit'))) {
                                      return false;
                                    }
                                    return f.name !== 'id' && f.name !== 'created_at' && f.name !== 'updated_at';
                                  })
                                  .slice(0, 5)
                                  .map((f) => {
                                    const val = row[f.name];
                                    let renderedVal = String(val ?? '—');
                                    if (typeof val === 'boolean') {
                                      renderedVal = val ? (lang === 'ar' ? 'نعم' : 'Yes') : (lang === 'ar' ? 'لا' : 'No');
                                    } else if (typeof val === 'object' && val !== null) {
                                      renderedVal = JSON.stringify(val);
                                    }
                                    return (
                                      <td key={f.name} className="p-3.5 text-slate-700 max-w-[200px] truncate font-medium">
                                        {renderedVal}
                                      </td>
                                    );
                                  })}
                                <td className="p-3.5 text-center">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => setSelectedRecord(row)}
                                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-semibold transition-colors min-h-[30px] cursor-pointer"
                                      title={t.actions.viewDetails}
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>

                                    {userCanEditInTable && (
                                      <button
                                        onClick={() => {
                                          setEditingRecord(row);
                                          setIsRecordModalOpen(true);
                                        }}
                                        className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors min-h-[30px] cursor-pointer"
                                        title={t.actions.editRecord}
                                      >
                                        <Edit className="w-3.5 h-3.5" />
                                      </button>
                                    )}

                                    {userCanDeleteInTable && (
                                      <button
                                        onClick={() => handleDeleteRecord(row.id)}
                                        className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors min-h-[30px] cursor-pointer"
                                        title={t.actions.deleteRecord}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: SCHEMA INSPECTOR */}
                {activeTab === 'SCHEMA' && (
                  <div className="pt-5 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <h3 className="text-xs font-bold text-slate-900 mb-2.5 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                          {t.schemaMeta.governanceTitle}
                        </h3>
                        <ul className="text-xs space-y-2 text-slate-700">
                          <li className="flex items-center justify-between">
                            <span className="text-slate-500">{t.schemaMeta.codeTableName}</span>
                            <code className="text-indigo-700 font-mono bg-white px-2 py-0.5 rounded border border-slate-200 font-semibold">
                              {selectedTable}
                            </code>
                          </li>
                          <li className="flex items-center justify-between">
                            <span className="text-slate-500">{t.schemaMeta.category}</span>
                            <span className="font-semibold text-slate-800">{selectedMeta.category}</span>
                          </li>
                          <li className="flex items-center justify-between">
                            <span className="text-slate-500">{t.schemaMeta.idPrefixFormat}</span>
                            <code className="text-indigo-600 font-mono bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-semibold">
                              {selectedMeta.idPrefix}-XXXXX
                            </code>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <h3 className="text-xs font-bold text-slate-900 mb-2.5 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                          {t.schemaMeta.foreignKeysTitle}
                        </h3>
                        {selectedMeta.relations.length === 0 ? (
                          <p className="text-xs text-slate-400 py-2">{t.schemaMeta.noForeignKeys}</p>
                        ) : (
                          <div className="space-y-2">
                            {selectedMeta.relations.map((rel, idx) => (
                              <div
                                key={idx}
                                className="text-xs flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-200"
                              >
                                <span className="font-mono text-slate-700 font-semibold">{rel.fromField}</span>
                                <span className="text-slate-400">➜</span>
                                <span className="font-mono text-indigo-600 font-semibold">
                                  {rel.toTable}.{rel.toField} ({rel.type})
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Fields List */}
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 mb-3">{t.schemaMeta.columnsTitle}</h3>
                      <div className="overflow-x-auto rounded-xl border border-slate-200 -mx-4 sm:mx-0">
                        <table className={`w-full ${isRtl ? 'text-right' : 'text-left'} text-xs`}>
                          <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold">
                            <tr>
                              <th className="p-3.5">{t.tableHeaders.fieldName}</th>
                              <th className="p-3.5">{t.tableHeaders.label}</th>
                              <th className="p-3.5">{t.tableHeaders.type}</th>
                              <th className="p-3.5">{t.tableHeaders.required}</th>
                              <th className="p-3.5">{t.tableHeaders.descriptionRules}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white">
                            {selectedMeta.fields.map((f) => (
                              <tr key={f.name} className="hover:bg-slate-50/80">
                                <td className="p-3.5 font-mono text-indigo-700 font-semibold">{f.name}</td>
                                <td className="p-3.5 text-slate-800 font-semibold">
                                  {lang === 'ar' ? f.labelAr : f.labelEn || f.labelAr}
                                </td>
                                <td className="p-3.5 font-mono text-slate-600">{f.type}</td>
                                <td className="p-3.5">
                                  {f.required ? (
                                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                                      {t.schemaMeta.requiredBadge}
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 text-[10px] font-medium">
                                      {t.schemaMeta.optionalBadge}
                                    </span>
                                  )}
                                </td>
                                <td className="p-3.5 text-slate-500">{f.description || '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: INTEGRITY TESTS RUNNER */}
                {activeTab === 'TESTS' && (
                  <div className="pt-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-200 gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                          {t.testsMeta.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">{t.testsMeta.subtitle}</p>
                      </div>
                      <button
                        onClick={handleRunTests}
                        disabled={isRunningTests}
                        className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 text-xs flex items-center justify-center gap-2 transition shadow-sm shadow-indigo-200 disabled:opacity-50 min-h-[40px] cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        {isRunningTests ? t.actions.runningTests : t.actions.rerunTests}
                      </button>
                    </div>

                    <div className="space-y-3">
                      {testResults.map((test) => (
                        <div
                          key={test.id}
                          className={`p-4 rounded-xl border transition-all ${
                            test.passed
                              ? 'bg-emerald-50/50 border-emerald-200 text-slate-800'
                              : 'bg-rose-50/50 border-rose-200 text-slate-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              {test.passed ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                              ) : (
                                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                              )}
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-xs text-slate-900">{test.name}</span>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200 font-medium">
                                    {test.category}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 mt-1">{test.message}</p>
                                {test.details && (
                                  <p className="text-[11px] font-mono text-slate-600 mt-2 bg-white p-2.5 rounded-lg border border-slate-200">
                                    {test.details}
                                  </p>
                                )}
                              </div>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 shrink-0 font-medium">
                              {test.durationMs} ms
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Record Detail Modal / Drawer */}
              {selectedRecord && (
                <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{t.schemaMeta.recordDetails}</span>
                      <code className="text-xs px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-mono font-bold border border-indigo-100">
                        {selectedRecord.id}
                      </code>
                    </div>
                    <div className="flex items-center gap-2">
                      {userCanEditInTable && (
                        <button
                          onClick={() => {
                            setEditingRecord(selectedRecord);
                            setIsRecordModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 text-xs px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 font-semibold transition"
                        >
                          {t.actions.editRecord}
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedRecord(null)}
                        className="text-slate-500 hover:text-slate-800 text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-semibold transition min-h-[36px] cursor-pointer"
                      >
                        {t.actions.close} ✕
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                    {Object.entries(selectedRecord).map(([k, v]) => {
                      if (!canViewCostProfit && (k.includes('cost') || k.includes('profit'))) {
                        return (
                          <div key={k} className="p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                            <div className="text-[10px] text-amber-800 font-mono uppercase font-semibold">{k}</div>
                            <div className="text-xs text-amber-700 font-bold mt-1">
                              {t.schemaMeta.hiddenRoleBadge} {roleBadge.label} ***
                            </div>
                          </div>
                        );
                      }
                      return (
                        <div key={k} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-[10px] text-slate-400 font-mono uppercase font-semibold">{k}</div>
                          <div className="text-xs text-slate-800 font-medium mt-0.5 break-words">
                            {typeof v === 'object' && v !== null ? JSON.stringify(v, null, 2) : String(v ?? '—')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
            </>
          )}
        </div>
      </main>

      {/* Toast Notification System */}
      <ToastNotification
        message={feedbackMessage}
        onClose={() => setFeedbackMessage(null)}
        lang={lang}
      />
    </div>
  );
};
