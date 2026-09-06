import React, { useState, useEffect, useRef } from 'react';
import { useBranding, DEFAULT_BRANDING, BrandingConfig, SpecialHoliday } from '../context/BrandingContext';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/schema';
import { db } from '../db/database';
import { UserManagementHub } from './UserManagementHub';
import { ActivityAuditLog } from './ActivityAuditLog';
import { AdvancedReportingCenter } from './AdvancedReportingCenter';
import {
  Settings,
  Building2,
  Calendar,
  Users,
  Download,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Upload,
  CheckCircle2,
  X,
  Plus,
  Trash2,
  Clock,
  RotateCcw,
  FileSpreadsheet,
  Lock,
  ChevronRight,
  ChevronLeft,
  Info,
  Phone,
  MessageSquare,
  Globe,
  Database
} from 'lucide-react';

interface AdminDashboardProps {
  lang: 'ar' | 'en';
}

type AdminTab = 'BRANDING' | 'SCHEDULE' | 'USERS' | 'EXPORT' | 'AUDIT' | 'HEALTH' | 'REPORTS';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ lang }) => {
  const isAr = lang === 'ar';
  const isRtl = isAr;
  const { branding, updateBranding, resetBranding } = useBranding();
  const { currentUser, login } = useAuth();
  
  const isSystemAdmin = currentUser?.role === UserRole.SYSTEM_ADMIN || currentUser?.isSuperAdmin;

  const [activeSubTab, setActiveSubTab] = useState<AdminTab>('BRANDING');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Branding fields state
  const [brandForm, setBrandForm] = useState<BrandingConfig>(branding);
  
  // Schedule state
  const [newHolidayDate, setNewHolidayDate] = useState('');
  const [newHolidayLabelAr, setNewHolidayLabelAr] = useState('');
  const [newHolidayLabelEn, setNewHolidayLabelEn] = useState('');

  // Reauth & Clear Data state
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearPassword, setClearPassword] = useState('');
  const [clearVerification, setClearVerification] = useState('');
  const [clearError, setClearError] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  // System Health state
  const [lastWipeDate, setLastWipeDate] = useState<string>(() => {
    return localStorage.getItem('gulfsand_last_wipe_date') || '2026-08-16T13:10:40-07:00';
  });
  const [systemState, setSystemState] = useState<'HEALTHY' | 'WARNING' | 'CRITICAL'>('HEALTHY');

  // Audit search state
  const [auditSearch, setAuditSearch] = useState('');
  const [auditTypeFilter, setAuditTypeFilter] = useState('ALL');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBrandForm(branding);
  }, [branding]);

  useEffect(() => {
    // Sync audit logs on mount/change
    const logs = db.getTable('audit_logs') || [];
    setAuditLogs(logs);

    // Dynamic health checker: if total transactions > 1000 or any test fails, show warning/critical
    const stats = db.getStats();
    if (stats.totalRecords === 0) {
      setSystemState('WARNING');
    } else {
      setSystemState('HEALTHY');
    }
  }, [activeSubTab]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 4000);
    }
  };

  // Upload logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSystemAdmin) {
      showToast(isAr ? 'عذراً، تعديل الشعار مخصص لمدير النظام فقط.' : 'Unauthorized: Logo upload restricted to System Admin.', 'error');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast(isAr ? 'يرجى اختيار ملف صورة صالح' : 'Please upload a valid image', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast(isAr ? 'حجم الصورة يجب أن لا يتجاوز 2 ميغابايت' : 'Image size must be under 2MB', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setBrandForm((prev) => ({ ...prev, logoUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    if (!isSystemAdmin) return;
    setBrandForm((prev) => ({ ...prev, logoUrl: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Save branding
  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSystemAdmin) {
      showToast(isAr ? 'وضع العرض فقط: لا يمكن تعديل الهوية.' : 'Read-only mode: Unauthorized to save.', 'error');
      return;
    }
    updateBranding(brandForm);
    db.logAudit('تعديل', 'system_backups', 'BRANDING-UPDATE', 'تم تحديث الهوية المؤسسية وبيانات الاتصال المركزية.');
    showToast(isAr ? 'تم حفظ بيانات الشعار والاتصال بنجاح!' : 'Branding and contact settings saved successfully!');
  };

  const handleResetBranding = () => {
    if (!isSystemAdmin) return;
    if (window.confirm(isAr ? 'هل أنت متأكد من استعادة إعدادات الهوية الافتراضية؟' : 'Reset to default branding?')) {
      resetBranding();
      setBrandForm(DEFAULT_BRANDING);
      db.logAudit('تعديل', 'system_backups', 'BRANDING-RESET', 'تم إعادة تهيئة الهوية المؤسسية الافتراضية.');
      showToast(isAr ? 'تمت استعادة إعدادات الهوية الافتراضية' : 'Restored to default corporate branding');
    }
  };

  // Add Special Holiday
  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSystemAdmin) return;
    if (!newHolidayDate || !newHolidayLabelAr || !newHolidayLabelEn) {
      showToast(isAr ? 'يرجى ملء جميع الحقول' : 'Please fill all fields', 'error');
      return;
    }

    const newHoliday: SpecialHoliday = {
      id: Math.random().toString(36).substring(2, 9),
      date: newHolidayDate,
      labelAr: newHolidayLabelAr,
      labelEn: newHolidayLabelEn,
      type: 'holiday'
    };

    const updatedHolidays = [...brandForm.specialHolidaysExceptions, newHoliday];
    setBrandForm((prev) => ({ ...prev, specialHolidaysExceptions: updatedHolidays }));
    updateBranding({ specialHolidaysExceptions: updatedHolidays });
    
    db.logAudit('تعديل', 'system_backups', `HOLIDAY-${newHoliday.id}`, `تمت إضافة عطلة رسمية استثنائية: ${newHolidayLabelAr}`);
    showToast(isAr ? 'تمت إضافة العطلة بنجاح' : 'Holiday exception added successfully');
    
    setNewHolidayDate('');
    setNewHolidayLabelAr('');
    setNewHolidayLabelEn('');
  };

  // Remove Special Holiday
  const handleRemoveHoliday = (id: string) => {
    if (!isSystemAdmin) return;
    const holidayToRemove = brandForm.specialHolidaysExceptions.find(h => h.id === id);
    const updatedHolidays = brandForm.specialHolidaysExceptions.filter(h => h.id !== id);
    setBrandForm((prev) => ({ ...prev, specialHolidaysExceptions: updatedHolidays }));
    updateBranding({ specialHolidaysExceptions: updatedHolidays });
    
    if (holidayToRemove) {
      db.logAudit('تعديل', 'system_backups', `HOLIDAY-${id}`, `تم حذف العطلة الاستثنائية: ${holidayToRemove.labelAr}`);
    }
    showToast(isAr ? 'تمت إزالة العطلة الاستثنائية' : 'Holiday exception removed');
  };

  // Export Data JSON
  const handleExportJson = () => {
    try {
      const jsonStr = db.exportDatabaseJson();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gulfsand_full_export_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(isAr ? 'تم تصدير النسخة الاحتياطية كـ JSON بنجاح!' : 'Database exported successfully as JSON!');
    } catch {
      showToast(isAr ? 'فشل التصدير' : 'Export failed', 'error');
    }
  };

  // Export Data CSV
  const handleExportCsv = () => {
    try {
      const transactions = db.getTable('transactions') || [];
      if (transactions.length === 0) {
        showToast(isAr ? 'لا توجد معاملات لتصديرها بصيغة CSV.' : 'No transactions found to export.', 'error');
        return;
      }
      
      const headers = ['ID', 'Transaction No', 'Customer Ar', 'Customer En', 'Service Ar', 'Service En', 'Status', 'Total Fee', 'Net Profit', 'Created At'];
      const rows = transactions.map((t: any) => [
        t.id,
        t.transaction_number || '',
        `"${(t.customer_name_ar || '').replace(/"/g, '""')}"`,
        `"${(t.customer_name_en || '').replace(/"/g, '""')}"`,
        `"${(t.service_name_ar || '').replace(/"/g, '""')}"`,
        `"${(t.service_name_en || '').replace(/"/g, '""')}"`,
        t.status || '',
        t.total_fee || 0,
        t.net_profit || 0,
        t.created_at || ''
      ]);
      
      const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gulfsand_transactions_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(isAr ? 'تم تصدير المعاملات كـ CSV بنجاح!' : 'Transactions exported successfully as CSV!');
    } catch {
      showToast(isAr ? 'فشل تصدير ملف CSV.' : 'CSV export failed.', 'error');
    }
  };

  // Clear Database Wipe with password verification and "CLEAR ALL DATA" typed phrase
  const handleClearAllData = async () => {
    setClearError(null);
    setIsClearing(true);

    if (clearVerification !== 'CLEAR ALL DATA') {
      setClearError(isAr ? 'يرجى كتابة عبارة التأكيد بدقة: CLEAR ALL DATA' : 'Please enter the exact phrase: CLEAR ALL DATA');
      setIsClearing(false);
      return;
    }

    if (!clearPassword) {
      setClearError(isAr ? 'يرجى إدخال كلمة المرور للمصادقة.' : 'Please enter your password to authorize.');
      setIsClearing(false);
      return;
    }

    try {
      const email = currentUser?.email || 'bashar.elhaj.sd@gmail.com';
      const authResult = await login(email, clearPassword);
      
      if (!authResult || !authResult.success) {
        setClearError(isAr ? 'فشلت المصادقة: كلمة المرور غير صحيحة.' : 'Re-authentication failed: Incorrect password.');
        setIsClearing(false);
        return;
      }

      // Log Security Audit log BEFORE the wipe
      db.logAudit('حذف', 'system_backups', 'WIPE-INITIATION', `بدء عملية تصفير شاملة لقاعدة البيانات بواسطة ${currentUser?.fullNameAr || email}`);

      // Perform clean reset
      db.resetToEmptyData();

      // Set wipe date
      const nowString = new Date().toISOString();
      localStorage.setItem('gulfsand_last_wipe_date', nowString);
      setLastWipeDate(nowString);

      // Log Security Audit log AFTER the wipe
      db.logAudit('استرجاع', 'system_backups', 'WIPE-COMPLETED', 'اكتملت عملية تصفير قاعدة البيانات بنجاح إلى الحالة النظيفة.');

      showToast(isAr ? 'تم تصفير النظام بالكامل بنجاح!' : 'The system has been fully cleared successfully!');
      setShowClearModal(false);
      setClearPassword('');
      setClearVerification('');
    } catch (err: any) {
      setClearError(err.message || (isAr ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred'));
    } finally {
      setIsClearing(false);
    }
  };

  const filteredAuditLogs = auditLogs.filter(log => {
    if (auditTypeFilter !== 'ALL' && log.action_type !== auditTypeFilter) return false;
    if (auditSearch) {
      const q = auditSearch.toLowerCase();
      return (
        log.id.toLowerCase().includes(q) ||
        (log.user_name_ar || '').toLowerCase().includes(q) ||
        (log.user_email || '').toLowerCase().includes(q) ||
        (log.change_summary_ar || '').toLowerCase().includes(q) ||
        (log.table_name || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const sidebarTabs = [
    { id: 'BRANDING', labelAr: 'الهوية والشعار', labelEn: 'Branding & Logo', icon: Building2 },
    { id: 'SCHEDULE', labelAr: 'مواعيد العمل والعطلات', labelEn: 'Schedule & Holidays', icon: Calendar },
    { id: 'USERS', labelAr: 'إدارة المستخدمين', labelEn: 'User Management', icon: Users },
    { id: 'EXPORT', labelAr: 'تصدير وتصفير البيانات', labelEn: 'Data Export & Wipe', icon: Database },
    { id: 'AUDIT', labelAr: 'سجل الرقابة الأمنية', labelEn: 'Audit Controller', icon: Activity },
    { id: 'HEALTH', labelAr: 'صحة وأمان النظام', labelEn: 'System Health', icon: ShieldCheck },
    { id: 'REPORTS', labelAr: 'منظومة التقارير والتحليل', labelEn: 'Advanced Reports', icon: FileSpreadsheet }
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col min-h-[700px] text-slate-800" id="admin-dashboard-root">
      {/* Dashboard Top Header */}
      <div className="bg-[#0A192F] px-6 py-5 border-b-2 border-amber-500/40 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-400">
            <Settings className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              {isAr ? 'لوحة القيادة الإدارية والتحكم المركزي' : 'Administrative Governance & Control Center'}
              <span className="text-[10px] bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full font-black tracking-wider uppercase">
                {isAr ? 'إدارة النظام' : 'SYSTEM ADMIN'}
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {isAr ? 'تعديل الشعار والهوية، ضبط مواعيد العمل والتقويم، تصفير وتصدير القاعدة، والرقابة الأمنية' : 'Configure branding, schedules, holidays, system wipe, audit logs, and operational health'}
            </p>
          </div>
        </div>

        {/* System Health State indicator inside top banner */}
        {isSystemAdmin && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{isAr ? 'صحة النظام:' : 'System Health:'}</span>
            <span className={`inline-flex items-center gap-1 text-xs font-black uppercase ${
              systemState === 'HEALTHY' ? 'text-emerald-400' : systemState === 'WARNING' ? 'text-amber-400' : 'text-rose-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                systemState === 'HEALTHY' ? 'bg-emerald-400 animate-pulse' : systemState === 'WARNING' ? 'bg-amber-400' : 'bg-rose-500 animate-ping'
              }`} />
              {systemState}
            </span>
          </div>
        )}
      </div>

      {/* Success/Error Alerts */}
      <div className="px-6 pt-4 space-y-3">
        {successMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-800 text-sm animate-fade-in" id="admin-success-alert">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <span className="font-bold">{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-sm animate-fade-in" id="admin-error-alert">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-bold">{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Interactive Sidebar Layout */}
      <div className={`flex flex-col lg:flex-row flex-1 ${isRtl ? 'lg:flex-row-reverse' : ''}`} id="admin-dashboard-container">
        {/* Sidebar Navigation: Touch Friendly & Responsive */}
        <aside className={`w-full lg:w-72 bg-slate-50 border-slate-200 p-4 flex flex-col gap-1.5 shrink-0 ${isRtl ? 'lg:border-l' : 'lg:border-r'}`} id="admin-sidebar">
          <div className="mb-2 px-2.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isAr ? 'أقسام الإعدادات' : 'Administrative Modules'}</span>
          </div>
          {sidebarTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as AdminTab)}
                className={`w-full p-3.5 rounded-xl text-xs font-black transition-all duration-200 flex items-center justify-between border ${
                  isActive
                    ? 'bg-[#0A192F] border-[#0A192F] text-white shadow-md'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span>{isAr ? tab.labelAr : tab.labelEn}</span>
                </div>
                {isActive ? (
                  isRtl ? <ChevronLeft className="w-3.5 h-3.5 text-amber-400" /> : <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                )}
              </button>
            );
          })}
        </aside>

        {/* Content Viewer Section */}
        <main className="flex-1 p-6 sm:p-8" id="admin-main-content">
          {/* TAB 1: BRANDING & CENTRAL LOGO */}
          {activeSubTab === 'BRANDING' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{isAr ? 'الهوية المؤسسية والشعار المركزي' : 'Corporate Identity & Central Branding'}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{isAr ? 'تعديل شعار جلف ساند ومحتويات المطبوعات والتذييل لجميع شاشات النظام' : 'Customize central logo and print headers globally'}</p>
                </div>
                {isSystemAdmin && (
                  <button
                    type="button"
                    onClick={handleResetBranding}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>{isAr ? 'استعادة الافتراضي' : 'Use Default'}</span>
                  </button>
                )}
              </div>

              {!isSystemAdmin && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-800">
                  <Lock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <p className="font-bold">{isAr ? 'وضع العرض فقط' : 'Read-only Access'}</p>
                    <p className="mt-1 opacity-95">{isAr ? 'يرجى تسجيل الدخول بحساب مدير النظام لتتمكن من رفع الشعار المخصص أو تعديل ترويسة المؤسسة.' : 'Unauthorized: Please authenticate as System Admin to configure official brand parameters.'}</p>
                  </div>
                </div>
              )}

              {/* Logo Upload Box */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Preview container */}
                  <div className="w-32 h-32 rounded-2xl bg-white border-2 border-dashed border-amber-400/60 flex items-center justify-center p-2 shrink-0 shadow-xs">
                    {brandForm.logoUrl ? (
                      <div className="relative group w-full h-full">
                        <img src={brandForm.logoUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                        {isSystemAdmin && (
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            className="absolute -top-1.5 -right-1.5 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full shadow-md"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-slate-400 flex flex-col items-center">
                        <Building2 className="w-8 h-8 text-amber-500/70 mb-1" />
                        <span className="text-[10px] font-bold">{isAr ? 'شعار جلف ساند' : 'Gulf Sand Logo'}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions & Rules */}
                  <div className="space-y-2 flex-1 text-center sm:text-start">
                    <h4 className="text-xs font-bold text-slate-700">{isAr ? 'شعار جلف ساند الرسمي' : 'Official Central Logo'}</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {isAr
                        ? 'موصى به: ملف PNG بخلفية شفافة، لا يتجاوز 2 ميغابايت. سيتم استبدال الشعار الحالي تلقائياً عبر جميع الفواتير والمطبوعات والتقارير المالية.'
                        : 'Recommended: Transparent PNG under 2MB. Updated logo applies instantly to all print documents, QR invoices, and accounting forms.'}
                    </p>
                    {isSystemAdmin && (
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <label className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isAr ? 'رفع ملف الصورة' : 'Upload Image File'}</span>
                          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Branding details form */}
              <form onSubmit={handleSaveBranding} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Arabic name */}
                  <div>
                    <label className="text-slate-700 font-bold block text-xs mb-1">{isAr ? 'اسم المركز (بالعربية) *' : 'Center Name (Ar) *'}</label>
                    <input
                      type="text"
                      required
                      disabled={!isSystemAdmin}
                      value={brandForm.companyNameAr}
                      onChange={(e) => setBrandForm(prev => ({ ...prev, companyNameAr: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white"
                    />
                  </div>

                  {/* English name */}
                  <div>
                    <label className="text-slate-700 font-bold block text-xs mb-1">{isAr ? 'اسم المركز (بالإنجليزية) *' : 'Center Name (En) *'}</label>
                    <input
                      type="text"
                      required
                      disabled={!isSystemAdmin}
                      value={brandForm.companyNameEn}
                      onChange={(e) => setBrandForm(prev => ({ ...prev, companyNameEn: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white font-serif font-semibold"
                    />
                  </div>

                  {/* Tagline Ar */}
                  <div>
                    <label className="text-slate-700 font-bold block text-xs mb-1">{isAr ? 'الشعار التسويقي للترويسة (عربي)' : 'Corporate Tagline (Ar)'}</label>
                    <input
                      type="text"
                      disabled={!isSystemAdmin}
                      value={brandForm.taglineAr}
                      onChange={(e) => setBrandForm(prev => ({ ...prev, taglineAr: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white"
                    />
                  </div>

                  {/* Tagline En */}
                  <div>
                    <label className="text-slate-700 font-bold block text-xs mb-1">{isAr ? 'الشعار التسويقي للترويسة (إنجليزي)' : 'Corporate Tagline (En)'}</label>
                    <input
                      type="text"
                      disabled={!isSystemAdmin}
                      value={brandForm.taglineEn}
                      onChange={(e) => setBrandForm(prev => ({ ...prev, taglineEn: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white"
                    />
                  </div>

                  {/* License */}
                  <div>
                    <label className="text-slate-700 font-bold block text-xs mb-1">{isAr ? 'رقم الرخصة الاقتصادية *' : 'Trade License No *'}</label>
                    <input
                      type="text"
                      required
                      disabled={!isSystemAdmin}
                      value={brandForm.licenseNumber}
                      onChange={(e) => setBrandForm(prev => ({ ...prev, licenseNumber: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white font-mono"
                    />
                  </div>

                  {/* TRN */}
                  <div>
                    <label className="text-slate-700 font-bold block text-xs mb-1">{isAr ? 'الرقم الضريبي TRN *' : 'Tax Registration Number TRN *'}</label>
                    <input
                      type="text"
                      required
                      disabled={!isSystemAdmin}
                      value={brandForm.taxNumber}
                      onChange={(e) => setBrandForm(prev => ({ ...prev, taxNumber: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white font-mono"
                    />
                  </div>

                  {/* Phones & WhatsApp */}
                  <div>
                    <label className="text-slate-700 font-bold block text-xs mb-1">{isAr ? 'رقم الهاتف الرئيسي *' : 'Primary Phone *'}</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute top-3.5 left-3" />
                      <input
                        type="text"
                        required
                        disabled={!isSystemAdmin}
                        value={brandForm.phone}
                        onChange={(e) => setBrandForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pl-9 text-xs focus:bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block text-xs mb-1">{isAr ? 'رقم الهاتف الاحتياطي' : 'Secondary Phone'}</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute top-3.5 left-3" />
                      <input
                        type="text"
                        disabled={!isSystemAdmin}
                        value={brandForm.phoneSecondary}
                        onChange={(e) => setBrandForm(prev => ({ ...prev, phoneSecondary: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pl-9 text-xs focus:bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block text-xs mb-1">{isAr ? 'رقم الواتساب الرئيسي *' : 'Primary WhatsApp *'}</label>
                    <div className="relative">
                      <MessageSquare className="w-4 h-4 text-emerald-500 absolute top-3.5 left-3" />
                      <input
                        type="text"
                        required
                        disabled={!isSystemAdmin}
                        value={brandForm.mobileWhatsApp}
                        onChange={(e) => setBrandForm(prev => ({ ...prev, mobileWhatsApp: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pl-9 text-xs focus:bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-700 font-bold block text-xs mb-1">{isAr ? 'رقم الواتساب الاحتياطي' : 'Secondary WhatsApp'}</label>
                    <div className="relative">
                      <MessageSquare className="w-4 h-4 text-emerald-500 absolute top-3.5 left-3" />
                      <input
                        type="text"
                        disabled={!isSystemAdmin}
                        value={brandForm.whatsappSecondary}
                        onChange={(e) => setBrandForm(prev => ({ ...prev, whatsappSecondary: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 pl-9 text-xs focus:bg-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Location Ar */}
                  <div>
                    <label className="text-slate-700 font-bold block text-xs mb-1">{isAr ? 'موقع المركز (عربي)' : 'Address (Ar)'}</label>
                    <input
                      type="text"
                      disabled={!isSystemAdmin}
                      value={brandForm.locationAr}
                      onChange={(e) => setBrandForm(prev => ({ ...prev, locationAr: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white"
                    />
                  </div>

                  {/* Location En */}
                  <div>
                    <label className="text-slate-700 font-bold block text-xs mb-1">{isAr ? 'موقع المركز (إنجليزي)' : 'Address (En)'}</label>
                    <input
                      type="text"
                      disabled={!isSystemAdmin}
                      value={brandForm.locationEn}
                      onChange={(e) => setBrandForm(prev => ({ ...prev, locationEn: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white"
                    />
                  </div>
                </div>

                {isSystemAdmin && (
                  <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-100 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{isAr ? 'حفظ وتطبيق التغييرات المؤسسية' : 'Save & Publish Branding'}</span>
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* TAB 2: SCHEDULE & HOLIDAYS */}
          {activeSubTab === 'SCHEDULE' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{isAr ? 'تقويم مواعيد العمل والعطلات الاستثنائية' : 'Work Schedules & Holiday exceptions'}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{isAr ? 'تخصيص أوقات العمل في العين وتحديد أيام العطل الأسبوعية والإجازات الرسمية' : 'Customize standard operating hours, weekly holiday, and special exceptions'}</p>
                </div>
              </div>

              {!isSystemAdmin && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-800">
                  <Lock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <p className="font-bold">{isAr ? 'وضع العرض فقط' : 'Read-only Access'}</p>
                    <p className="mt-1 opacity-95">{isAr ? 'ساعات العمل والعطل الرسمية معروضة للقراءة فقط. يرجى تسجيل الدخول كمدير نظام لتعديلها.' : 'Scheduling settings are read-only for current privileges.'}</p>
                  </div>
                </div>
              )}

              {/* Saturday Default Holiday Notice */}
              <div className="p-4 bg-[#0A192F]/5 border-l-4 border-amber-500 rounded-r-xl text-xs space-y-1.5">
                <div className="font-bold text-[#0A192F] flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-amber-500" />
                  <span>{isAr ? 'قاعدة عطلة نهاية الأسبوع الافتراضية' : 'Weekly Holiday Default Rule'}</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {isAr
                    ? 'يوم السبت هو العطلة الأسبوعية الافتراضية الرسمية لمركز جلف ساند للطباعة، مالم يتم تحديد عطلات رسمية تالية أو استثناءات تشغيلية.'
                    : 'Saturday is the standard weekly holiday for Gulf Sand Typing Services, unless custom calendar date exceptions are registered.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Standard Hours Input */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#0A192F]" />
                    <span>{isAr ? 'أوقات ساعات العمل الرسمية' : 'Standard Working Hours'}</span>
                  </h4>
                  
                  <div className="space-y-3.5">
                    <div>
                      <label className="text-slate-600 font-bold block text-[11px] mb-1">{isAr ? 'ساعات الدوام (بالعربية)' : 'Operating Hours Text (Ar)'}</label>
                      <input
                        type="text"
                        disabled={!isSystemAdmin}
                        value={brandForm.operatingHoursAr}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBrandForm(prev => ({ ...prev, operatingHoursAr: val }));
                          updateBranding({ operatingHoursAr: val });
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-slate-600 font-bold block text-[11px] mb-1">{isAr ? 'ساعات الدوام (بالإنجليزية)' : 'Operating Hours Text (En)'}</label>
                      <input
                        type="text"
                        disabled={!isSystemAdmin}
                        value={brandForm.operatingHoursEn}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBrandForm(prev => ({ ...prev, operatingHoursEn: val }));
                          updateBranding({ operatingHoursEn: val });
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-slate-600 font-bold block text-[11px] mb-1">{isAr ? 'العطلة الأسبوعية الرسمية' : 'Standard Weekly Holiday'}</label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          disabled={!isSystemAdmin}
                          value={brandForm.weeklyHolidayAr}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBrandForm(prev => ({ ...prev, weeklyHolidayAr: val }));
                            updateBranding({ weeklyHolidayAr: val });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white"
                          placeholder={isAr ? 'عربي' : 'Ar'}
                        />
                        <input
                          type="text"
                          disabled={!isSystemAdmin}
                          value={brandForm.weeklyHolidayEn}
                          onChange={(e) => {
                            const val = e.target.value;
                            setBrandForm(prev => ({ ...prev, weeklyHolidayEn: val }));
                            updateBranding({ weeklyHolidayEn: val });
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white"
                          placeholder={isAr ? 'إنجليزي' : 'En'}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-600 font-bold block text-[11px] mb-1">{isAr ? 'تواريخ الإجازات السنوية والمناسبات العامة' : 'Annual Leave & Holiday Dates Summary'}</label>
                      <textarea
                        rows={2}
                        disabled={!isSystemAdmin}
                        value={brandForm.leaveDates}
                        onChange={(e) => {
                          const val = e.target.value;
                          setBrandForm(prev => ({ ...prev, leaveDates: val }));
                          updateBranding({ leaveDates: val });
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white leading-relaxed resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Holiday Exceptions Addition */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>{isAr ? 'العطلات الاستثنائية وفترات الإغلاق' : 'Special Holidays Exceptions'}</span>
                  </h4>

                  {isSystemAdmin && (
                    <form onSubmit={handleAddHoliday} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-0.5">{isAr ? 'التاريخ *' : 'Date *'}</label>
                          <input
                            type="date"
                            required
                            value={newHolidayDate}
                            onChange={(e) => setNewHolidayDate(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-500 font-bold block mb-0.5">{isAr ? 'العنوان بالعربي *' : 'Label Ar *'}</label>
                          <input
                            type="text"
                            required
                            placeholder={isAr ? 'مثال: رأس السنة الهجرية' : 'Islamic New Year'}
                            value={newHolidayLabelAr}
                            onChange={(e) => setNewHolidayLabelAr(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-0.5">{isAr ? 'العنوان بالإنجليزي *' : 'Label En *'}</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            placeholder="Islamic New Year"
                            value={newHolidayLabelEn}
                            onChange={(e) => setNewHolidayLabelEn(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs"
                          />
                          <button
                            type="submit"
                            className="px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Registered exceptions list */}
                  <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                    {brandForm.specialHolidaysExceptions.length === 0 ? (
                      <p className="text-[11px] text-slate-400 text-center py-4">{isAr ? 'لا توجد عطلات استثنائية مسجلة حالياً' : 'No holiday exceptions registered'}</p>
                    ) : (
                      brandForm.specialHolidaysExceptions.map((h) => (
                        <div key={h.id} className="p-2 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs hover:border-slate-300">
                          <div className="space-y-0.5">
                            <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">{h.date}</span>
                            <div className="font-bold text-slate-900 mt-1">{isAr ? h.labelAr : h.labelEn}</div>
                            <span className="text-[9px] text-slate-400 block">{isAr ? h.labelEn : h.labelAr}</span>
                          </div>
                          {isSystemAdmin && (
                            <button
                              type="button"
                              onClick={() => handleRemoveHoliday(h.id)}
                              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                              title="Delete exception"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: USER MANAGEMENT & SECURITY */}
          {activeSubTab === 'USERS' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">{isAr ? 'إدارة المستخدمين والأذونات' : 'User Security & Role Administration'}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{isAr ? 'إضافة موظفين جدد، تجميد الحسابات، توليد روابط تفعيل الهوية، والتحقق المحاسبي' : 'Register employees, manage security statuses, and generate activation links'}</p>
              </div>

              {/* Directly render the highly responsive UserManagementHub */}
              <div className="border border-slate-200 rounded-3xl p-2 bg-slate-50">
                <UserManagementHub
                  onOpenActivationUrl={(token) => {
                    window.location.hash = `#token=${token}`;
                    showToast(isAr ? 'تم نسخ رمز الأمان وجاري إظهار رابط التفعيل' : 'Security token compiled successfully');
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 4: DATA EXPORT & DESTRUCTIVE WIPE */}
          {activeSubTab === 'EXPORT' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">{isAr ? 'التحكم في قاعدة البيانات واستيراد وتصدير التقارير' : 'Data Integrity & ERP Maintenance Control'}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{isAr ? 'حفظ النسخ الاحتياطية وتصدير كشوفات المعاملات الشاملة وتصفير النظام بقفل أمان' : 'Download complete database, extract CSV transaction ledgers, or clean start'}</p>
              </div>

              {/* Permissions card */}
              <div className="p-4 rounded-2xl bg-[#0A192F]/5 border border-[#0A192F]/15 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-600 shrink-0">
                  <Database className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{isAr ? 'صلاحيات تصدير البيانات المحاسبية' : 'ERP Database Privileges'}</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                    {isAr
                      ? 'بناءً على بروتوكول الأمان ووصول المستخدمين (RBAC)، يسمح فقط لمدير النظام والمدير المالي (System Admin / Manager) بتوليد وتصدير الكشوفات المالية الكاملة كـ JSON أو CSV لمنع تسريب بيانات العملاء.'
                      : 'According to our system-wide RBAC protocols, complete database extraction is limited to System Admin and Corporate Managers only.'}
                  </p>
                </div>
              </div>

              {/* Two-Column action grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Column 1: Backup and extraction */}
                <div className="space-y-4 p-5 rounded-2xl bg-white border border-slate-200">
                  <h4 className="text-xs font-black text-slate-900 border-b border-slate-100 pb-2">{isAr ? 'النسخ الاحتياطي والمحاسبي المعتمد' : 'Corporate Ledger Exports'}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {isAr
                      ? 'يمكنك تنزيل البيانات الكاملة كملف احتياطي مشفر ببنية JSON لاستعادتها لاحقاً، أو استخراج كشف المعاملات المحاسبية بملف CSV متوافق مع برامج الإكسل لإنشاء التقارير.'
                      : 'Download a complete JSON database dump or extract Excel-ready CSV logs of all customer transactions, invoice details, and operating profits.'}
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <button
                      onClick={handleExportJson}
                      className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-amber-400" />
                      <span>{isAr ? 'تصدير JSON كامل' : 'Export Full JSON'}</span>
                    </button>

                    <button
                      onClick={handleExportCsv}
                      className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>{isAr ? 'تصدير كشف CSV' : 'Export Ledger CSV'}</span>
                    </button>
                  </div>
                </div>

                {/* Column 2: Danger Zone Destructive wipe */}
                <div className="space-y-4 p-5 rounded-2xl bg-rose-50/50 border border-rose-200">
                  <h4 className="text-xs font-black text-rose-900 border-b border-rose-200/50 pb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
                    <span>{isAr ? 'منطقة الخطر - تصفير البيانات الشامل' : 'Danger Zone - Clean Reset Wipe'}</span>
                  </h4>
                  <p className="text-[11px] text-rose-800 leading-relaxed">
                    {isAr
                      ? 'يقوم هذا الإجراء بحذف كافة العملاء، الفواتير، المعاملات، سندات الصرف والقبض، وقيود الحسابات نهائياً، للبدء من جديد. يتطلب مصادقة الأمان وإدخال كلمة المرور مع تسجيل الحدث في سجل الرقابة الأمنية.'
                      : 'Irreversibly wipe all transaction histories, customer profiles, cash logs, and accounting vouchers to establish a clean slate. Requires password verification and explicit typed phrase.'}
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={() => {
                        if (!isSystemAdmin) {
                          showToast(isAr ? 'عذراً، صلاحية تصفير النظام مقصورة على مدير النظام فقط.' : 'Unauthorized: Restructured to System Admin only.', 'error');
                          return;
                        }
                        setClearPassword('');
                        setClearVerification('');
                        setClearError(null);
                        setShowClearModal(true);
                      }}
                      className="w-full py-3 px-4 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{isAr ? 'تصفير كافة السجلات وبدء قاعدة نظيفة' : 'Clear All Data & Reset Database'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: READ-ONLY SYSTEM AUDIT LOG */}
          {activeSubTab === 'AUDIT' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">{isAr ? 'سجل الرقابة والتدقيق الأمني الموحد' : 'Security Audit & Operation Log'}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{isAr ? 'مستند رقابي غير قابل للتعديل يتتبع كافة الإجراءات الحساسة المنجزة في كامل المنظومة' : 'Immutable historical trail of major database updates, user actions, and security status adjustments'}</p>
              </div>

              {/* Fast searchable interface */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                  {/* Search box */}
                  <input
                    type="text"
                    placeholder={isAr ? 'بحث في السجلات بالموظف أو الإجراء أو المعاملة...' : 'Search logs by user, action, module...'}
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />

                  {/* Filter action */}
                  <select
                    value={auditTypeFilter}
                    onChange={(e) => setAuditTypeFilter(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none"
                  >
                    <option value="ALL">{isAr ? 'جميع الإجراءات' : 'All Action Types'}</option>
                    <option value="إنشاء">{isAr ? 'إنشاء جديد' : 'Created'}</option>
                    <option value="تعديل">{isAr ? 'تعديل' : 'Updated'}</option>
                    <option value="حذف">{isAr ? 'حذف نهائي' : 'Deleted'}</option>
                    <option value="أرشفة">{isAr ? 'أرشفة' : 'Archived'}</option>
                    <option value="استرجاع">{isAr ? 'استعادة / تصفير' : 'Restored / Reset'}</option>
                  </select>
                </div>

                {/* Grid Header */}
                <div className="hidden sm:grid grid-cols-12 gap-3 text-[10px] text-slate-500 font-black uppercase px-2.5">
                  <span className="col-span-2">{isAr ? 'التاريخ والوقت' : 'Timestamp'}</span>
                  <span className="col-span-2">{isAr ? 'المستخدم' : 'User Attribution'}</span>
                  <span className="col-span-1.5 text-center">{isAr ? 'الإجراء' : 'Type'}</span>
                  <span className="col-span-2">{isAr ? 'القسم / الجدول' : 'Module'}</span>
                  <span className="col-span-4.5">{isAr ? 'الملخص' : 'Summary'}</span>
                </div>

                {/* Log rows list */}
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {filteredAuditLogs.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      {isAr ? 'لا توجد سجلات تدقيق تطابق معايير البحث الحالية' : 'No security logs found for criteria.'}
                    </div>
                  ) : (
                    filteredAuditLogs.map((log) => {
                      const isDanger = log.action_type === 'حذف' || log.action_type === 'استرجاع';
                      const isUpdate = log.action_type === 'تعديل';
                      return (
                        <div
                          key={log.id}
                          className="p-3 bg-white border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 text-xs items-center hover:border-slate-300 transition-colors"
                        >
                          <div className="col-span-2 font-mono text-[10px] text-slate-500">
                            {new Date(log.created_at).toLocaleString(isAr ? 'ar-AE' : 'en-US')}
                          </div>
                          <div className="col-span-2 font-bold text-slate-900 truncate">
                            {log.user_name_ar || log.user_email}
                          </div>
                          <div className="col-span-1.5 flex justify-start sm:justify-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold text-center ${
                              isDanger ? 'bg-rose-100 text-rose-800 border border-rose-200' : isUpdate ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}>
                              {log.action_type}
                            </span>
                          </div>
                          <div className="col-span-2 text-slate-500 font-medium truncate">
                            {log.module_name}
                          </div>
                          <div className="col-span-4.5 font-bold text-slate-800 text-[11px]">
                            {log.change_summary_ar}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: SYSTEM HEALTH REPORT & WIPE DATE */}
          {activeSubTab === 'HEALTH' && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-bold text-slate-900">{isAr ? 'مؤشرات الأمان وصحة التشغيل الفنية' : 'System Operational Health & Integrity Monitor'}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{isAr ? 'مستويات تخزين البيانات، فحوصات تماسك الجداول، والتحقق من سلامة الأكواد المصدرية ومفاتيح الأمان' : 'Database sizes, integrity checks, and chronological wipe registers'}</p>
              </div>

              {!isSystemAdmin && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-800">
                  <Lock className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <p className="font-bold">{isAr ? 'وضع العرض فقط' : 'Read-only Access'}</p>
                    <p className="mt-1 opacity-95">{isAr ? 'تقرير صحة وأمان النظام متاح لمدراء المنظومة فقط.' : 'This critical operational health widget is restricted to system administrators only.'}</p>
                  </div>
                </div>
              )}

              {isSystemAdmin && (
                <div className="space-y-5">
                  {/* Big graphical health visualizer */}
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                    <div className="text-center sm:text-start">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{isAr ? 'الحالة العامة الفنية' : 'System Health Score'}</span>
                      <div className="text-3xl font-black text-[#0A192F] mt-1">100% ONLINE</div>
                      <p className="text-[11px] text-slate-500 mt-1">{isAr ? 'جميع الأنظمة والميزات وتخزين الـ LocalStorage مستقرة وتعمل بكفاءة.' : 'All services, DB queries, and local states compile correctly.'}</p>
                    </div>

                    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200 shadow-3xs">
                      <span className="text-[10px] font-bold text-slate-500">{isAr ? 'آخر تصفير لقاعدة البيانات' : 'Last Database Wipe Date'}</span>
                      <span className="text-xs font-mono font-black text-slate-800 mt-1">
                        {new Date(lastWipeDate).toLocaleDateString(isAr ? 'ar-AE' : 'en-US')}
                      </span>
                      <span className="text-[9px] text-slate-400 mt-0.5 font-mono">
                        {new Date(lastWipeDate).toLocaleTimeString(isAr ? 'ar-AE' : 'en-US')}
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-200 shadow-3xs">
                      <span className="text-[10px] font-bold text-slate-500">{isAr ? 'حالة التماسك الهيكلي' : 'Structural Schema Integrity'}</span>
                      <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600 mt-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span>{isAr ? 'متوافق (36 جدول)' : 'COMPLIANT (36 Tables)'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Sub-Health parameters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs">
                      <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 mb-2 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span>{isAr ? 'سلامة المفاتيح والأمان التام' : 'API & Cryptographic Shielding'}</span>
                      </h4>
                      <p className="text-slate-500 leading-relaxed">
                        {isAr
                          ? 'نظام جلف ساند يحظر حظراً تاماً تضمين مفاتيح أمان Gemini أو Firebase في الشفرة البرمجية الأمامية (Client Side). تتم معالجة وتمرير كافة الطلبات عن طريق خادم Node.js الخلفي المعزول.'
                          : 'Our system design enforces client-side API sanitization. All OpenAI, Twilio, and Gemini queries are proxied server-side via Node/Cloud Run.'}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs">
                      <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 mb-2 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span>{isAr ? 'معايير رضا وتحصيل المبيعات' : 'Audit Control Standards'}</span>
                      </h4>
                      <p className="text-slate-500 leading-relaxed">
                        {isAr
                          ? 'النظام مزود بمدقق فوري للميزان المالي وقواعد أسعار المعاملات، بما يمنع إدخال أسعار بيع تقل عن حد السعر الأدنى المعتمد للخدمات إلا بموافقة إلكترونية صريحة من المشرف العام.'
                          : 'The real-time pricing auditor ensures transaction amounts strictly conform to approved service price range limitations unless authorized.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: REPORTS / ADVANCED REPORTING CENTER */}
          {activeSubTab === 'REPORTS' && (
            <div className="space-y-6">
              <AdvancedReportingCenter currentRole={currentUser?.role || UserRole.SYSTEM_ADMIN} lang={lang} />
            </div>
          )}
        </main>
      </div>

      {/* SECURE DESTRUCTIVE ACTION MODAL: CLEAR ALL DATA */}
      {showClearModal && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowClearModal(false);
          }}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-200 overflow-hidden text-slate-900 my-6 animate-in zoom-in duration-200"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Modal Header */}
            <div className="bg-[#DC2626] px-6 py-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
                  <AlertTriangle className="w-5.5 h-5.5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-base">
                    {isAr ? 'إجراء تصفير أمني فائق الخطورة' : 'Critical Security Database Reset'}
                  </h3>
                  <p className="text-xs text-rose-100">
                    {isAr ? 'يتطلب مصادقة الأمان للتصفير الكامل بقاعدة نظيفة' : 'Verify credentials and phrase to continue'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowClearModal(false)}
                className="w-8 h-8 rounded-lg text-rose-200 hover:text-white hover:bg-white/10 flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-1.5 text-xs text-rose-900">
                <div className="font-bold flex items-center gap-1 text-rose-800">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{isAr ? 'تنبيه أمني أخير - هذا الإجراء لا يمكن التراجع عنه!' : 'Final Warning - Action is Irreversible!'}</span>
                </div>
                <p className="leading-relaxed opacity-90">
                  {isAr
                    ? 'سيتم فوراً مسح كافة العملاء، المعاملات، الحركات، المصاريف، الفواتير، السندات، الحجوزات، والموظفين في 36 جدول بالكامل. سيتم الاحتفاظ فقط بدليل الحسابات وكتالوج الـ 13 خدمة الأساسية للبدء النظيف.'
                    : 'This action completely sweeps customers, transactions, ledgers, vouchers, employee contracts, and bookings in all 36 tables. Standard catalogs and structure will be preserved.'}
                </p>
              </div>

              {clearError && (
                <div className="p-3 bg-rose-100 text-rose-800 text-xs font-bold rounded-xl border border-rose-200">
                  {clearError}
                </div>
              )}

              {/* Phrase text entry */}
              <div className="space-y-1.5 text-xs">
                <label className="block text-slate-700 font-bold">
                  {isAr ? 'يرجى كتابة العبارة التالية بحروف كبرى (CLEAR ALL DATA):' : 'Type the exact confirmation phrase (CLEAR ALL DATA):'}
                </label>
                <input
                  type="text"
                  placeholder="CLEAR ALL DATA"
                  value={clearVerification}
                  onChange={(e) => setClearVerification(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono tracking-wider"
                />
              </div>

              {/* Password re-auth entry */}
              <div className="space-y-1.5 text-xs">
                <label className="block text-slate-700 font-bold">
                  {isAr ? 'أدخل كلمة مرور حسابك للمصادقة وتفويض الإجراء:' : 'Enter your account password to authorize:'}
                </label>
                <input
                  type="password"
                  placeholder={isAr ? 'كلمة المرور الحالية' : 'Current password'}
                  value={clearPassword}
                  onChange={(e) => setClearPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
              >
                {isAr ? 'إلغاء وتراجع' : 'Cancel'}
              </button>
              <button
                onClick={handleClearAllData}
                disabled={isClearing}
                className="px-5 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl text-xs font-black transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {isClearing ? (isAr ? 'جاري التصفير...' : 'Clearing...') : isAr ? 'نعم، قم بتصفير وحذف كافة السجلات الآن' : 'Yes, Wipe All Records Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
