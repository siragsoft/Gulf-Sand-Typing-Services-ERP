import React, { useState, useEffect } from 'react';
import { db } from '../db';
import { UserRole } from '../types/schema';
import { useAuth } from '../context/AuthContext';
import {
  Database,
  Trash2,
  RefreshCw,
  Download,
  Upload,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  FileSpreadsheet,
  Users,
  Layers,
  Receipt,
  Coins,
  Building2,
  UserPlus,
  PlusCircle,
  HelpCircle,
  HardDriveDownload,
  HardDriveUpload,
  ArrowLeft,
  Info
} from 'lucide-react';

interface DatabaseManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  lang: 'ar' | 'en';
  onDatabaseChanged?: () => void;
  onOpenNewCustomer?: () => void;
  onOpenNewTransaction?: () => void;
  onOpenImportHub?: () => void;
  embedded?: boolean;
}

export const DatabaseManagementModal: React.FC<DatabaseManagementModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  lang,
  onDatabaseChanged,
  onOpenNewCustomer,
  onOpenNewTransaction,
  onOpenImportHub,
  embedded = false,
}) => {
  const isAr = lang === 'ar';
  const { currentUser, login } = useAuth();
  const [stats, setStats] = useState(db.getStats());
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmCleanOpen, setConfirmCleanOpen] = useState(false);
  const [confirmDemoOpen, setConfirmDemoOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [reauthPassword, setReauthPassword] = useState('');
  const [typedVerification, setTypedVerification] = useState('');
  const [reauthError, setReauthError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStats(db.getStats());
      setActionSuccess(null);
      setActionError(null);
      setConfirmCleanOpen(false);
      setConfirmDemoOpen(false);
      setReauthPassword('');
      setTypedVerification('');
      setReauthError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isCleanDatabase = stats.customersCount === 0 && stats.transactionsCount === 0;

  const handleResetToClean = async () => {
    setIsProcessing(true);
    setActionError(null);
    setReauthError(null);

    // 1. Verify typed confirmation phrase
    if (typedVerification !== 'CLEAR ALL DATA') {
      setReauthError(
        isAr
          ? 'يرجى كتابة عبارة التأكيد بدقة: CLEAR ALL DATA'
          : 'Please enter the exact confirmation phrase: CLEAR ALL DATA'
      );
      setIsProcessing(false);
      return;
    }

    // 2. Verify admin password re-authentication
    if (!reauthPassword) {
      setReauthError(
        isAr ? 'يرجى إدخال كلمة مرور الحساب للمصادقة.' : 'Please enter your account password to authenticate.'
      );
      setIsProcessing(false);
      return;
    }

    try {
      const email = currentUser?.email || 'bashar.elhaj.ai@gmail.com';
      const authResult = await login(email, reauthPassword);
      if (!authResult || !authResult.success) {
        setReauthError(
          isAr ? 'فشلت إعادة المصادقة: كلمة المرور المدخلة غير صحيحة.' : 'Re-authentication failed: Incorrect password.'
        );
        setIsProcessing(false);
        return;
      }

      // Complete the reset
      db.resetToEmptyData();
      const newStats = db.getStats();
      setStats(newStats);
      setActionSuccess(
        isAr
          ? 'تم تصفير قاعدة البيانات بنجاح إلى الحالة النظيفة! تم تسجيل الحدث الأمني.'
          : 'Database successfully reset to a clean state! The security event has been logged.'
      );
      
      // Clear sensitive states
      setReauthPassword('');
      setTypedVerification('');
      setConfirmCleanOpen(false);
      
      if (onDatabaseChanged) onDatabaseChanged();
    } catch (err: any) {
      setActionError(err.message || (isAr ? 'فشل تصفير قاعدة البيانات' : 'Failed to reset database'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResetToDemo = () => {
    setIsProcessing(true);
    setActionError(null);
    try {
      db.resetToDemoData();
      const newStats = db.getStats();
      setStats(newStats);
      setActionSuccess(
        isAr
          ? 'تم تحميل البيانات التجريبية الشاملة لمركز جلف ساند بنجاح.'
          : 'Demo data loaded successfully for Gulf Sand ERP.'
      );
      setConfirmDemoOpen(false);
      if (onDatabaseChanged) onDatabaseChanged();
    } catch (err: any) {
      setActionError(err.message || (isAr ? 'فشل تحميل البيانات التجريبية' : 'Failed to load demo data'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportJson = () => {
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
      setActionSuccess(isAr ? 'تم تصدير النسخة الاحتياطية بنجاح.' : 'Database exported successfully.');
    } catch (e: any) {
      setActionError(isAr ? 'فشل تصدير قاعدة البيانات.' : 'Export failed.');
    }
  };

  const handleExportCsv = () => {
    try {
      const transactions = db.getTable('transactions') || [];
      if (transactions.length === 0) {
        setActionError(isAr ? 'لا توجد سجلات معاملات لتصديرها بصيغة CSV.' : 'No transactions found to export.');
        return;
      }
      
      // Build CSV string with UTF-8 BOM for Arabic compatibility
      const headers = ['ID', 'Transaction Number', 'Customer Name Ar', 'Customer Name En', 'Service Name Ar', 'Service Name En', 'Status', 'Total Fee', 'Net Profit', 'Created At'];
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
      a.download = `gulfsand_transactions_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setActionSuccess(isAr ? 'تم تصدير المعاملات كملف CSV بنجاح.' : 'Transactions exported as CSV successfully.');
    } catch (e: any) {
      setActionError(isAr ? 'فشل تصدير ملف CSV.' : 'CSV export failed.');
    }
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        const ok = db.importDatabaseJson(content);
        if (ok) {
          setStats(db.getStats());
          setActionSuccess(isAr ? 'تم استيراد قاعدة البيانات بنجاح.' : 'Database imported successfully.');
          if (onDatabaseChanged) onDatabaseChanged();
        } else {
          setActionError(isAr ? 'ملف JSON غير صالح أو به خطأ في البنية.' : 'Invalid JSON file structure.');
        }
      } catch (err) {
        setActionError(isAr ? 'فشل قراءة الملف.' : 'Failed to parse file.');
      }
    };
    reader.readAsText(file);
  };

  const modalBody = (
    <div
      className={`relative w-full ${
        embedded ? 'max-w-4xl mx-auto shadow-sm my-2' : 'max-w-3xl my-6 shadow-2xl'
      } bg-white rounded-3xl border border-slate-200 overflow-hidden text-slate-900`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold">
              {isAr ? 'إدارة وتهيئة قاعدة بيانات النظام' : 'Database Management & Initialization'}
            </h2>
            <p className="text-xs text-slate-300">
              {isAr
                ? 'التحكم في حالة البيانات، التصفير للبدء من الصفر، استيراد وتصدير النسخ الاحتياطية'
                : 'Control database state, reset to clean start, or import/export backups'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
          <span>{isAr ? 'رجوع / إغلاق' : 'Back / Close'}</span>
        </button>
      </div>

        {/* Status Alerts */}
        <div className="px-6 pt-4 space-y-3">
          {actionSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-emerald-800 text-sm animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="font-medium">{actionSuccess}</div>
            </div>
          )}
          {actionError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-800 text-sm animate-fade-in">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="font-medium">{actionError}</div>
            </div>
          )}
        </div>

        {/* Database Status Banner */}
        <div className="p-6 space-y-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {isAr ? 'الحالة الحالية لقاعدة البيانات' : 'Current Database State'}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      isCleanDatabase
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isCleanDatabase ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                      }`}
                    />
                    {isCleanDatabase
                      ? isAr
                        ? 'قاعدة بيانات نظيفة (جاهزة للعمل الفعلي)'
                        : 'Clean Database (Production Ready)'
                      : isAr
                      ? 'تحتوي على بيانات تجريبية / مسجلة'
                      : 'Active Database with Records'}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    ({stats.totalRecords} {isAr ? 'إجمالي السجلات في 36 جدول' : 'total records'})
                  </span>
                </div>
              </div>

              {/* Quick Actions when in Clean state */}
              {isCleanDatabase && (
                <div className="flex items-center gap-2 flex-wrap">
                  {onOpenNewCustomer && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenNewCustomer();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{isAr ? 'إضافة أول عميل' : 'Add First Customer'}</span>
                    </button>
                  )}
                  {onOpenNewTransaction && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenNewTransaction();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>{isAr ? 'معاملة جديدة' : 'New Transaction'}</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>{isAr ? 'العملاء' : 'Customers'}</span>
                </div>
                <div className="text-xl font-bold font-mono text-slate-900 mt-1">{stats.customersCount}</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{isAr ? 'المعاملات' : 'Transactions'}</span>
                </div>
                <div className="text-xl font-bold font-mono text-slate-900 mt-1">{stats.transactionsCount}</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-amber-600" />
                  <span>{isAr ? 'الفواتير' : 'Invoices'}</span>
                </div>
                <div className="text-xl font-bold font-mono text-slate-900 mt-1">{stats.invoicesCount}</div>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isAr ? 'دليل الحسابات' : 'Chart Accounts'}</span>
                </div>
                <div className="text-xl font-bold font-mono text-slate-900 mt-1">{stats.accountsCount}</div>
              </div>
            </div>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Clean Reset */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50 to-orange-50/60 border border-rose-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 text-rose-900 font-bold mb-2">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-600">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <h3>{isAr ? 'تصفير وبدء قاعدة بيانات نظيفة' : 'Reset to Clean Database'}</h3>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed mb-3">
                  {isAr
                    ? 'يحذف كافة المعاملات والعملاء والفواتير والقيود والسجلات التجريبية، مع الاحتفاظ التام بدليل الحسابات وكتالوج الـ 13 خدمة وإعدادات المنشأة وقوالب الإيصالات للبدء بإدخال بيانات المركز الحقيقية.'
                    : 'Clears all sample transactions, customers, and entries while preserving the Chart of Accounts, 13 Service Categories, Settings, and Document Templates for real data entry.'}
                </p>

                <div className="text-[11px] text-slate-600 space-y-1 mb-4 bg-white/70 p-2.5 rounded-xl border border-rose-100">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'يحتفظ بدليل الحسابات المعتمد (21 حساب)' : 'Preserves Chart of Accounts'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'يحتفظ بكتالوج الخدمات والأسعار وقواعد الأسعار' : 'Preserves Service Catalog & Rules'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'يحتفظ بقوالب الإيصالات والفواتير الرسمية والـ QR' : 'Preserves Document Templates & QR'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-700 font-medium">
                    <X className="w-3.5 h-3.5" />
                    <span>{isAr ? 'يفرغ المعاملات والعملاء والمصروفات لتسجيل البيانات من الصفر' : 'Empties transactions & customers'}</span>
                  </div>
                </div>
              </div>

              {confirmCleanOpen ? (
                <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl space-y-3 animate-in fade-in duration-200">
                  <div className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{isAr ? 'إجراء فائق الخطورة - تأكيد التصفير النهائي؟' : 'Highly Destructive - Confirm Irreversible Reset?'}</span>
                  </div>
                  <p className="text-[11px] text-rose-800/90 leading-relaxed">
                    {isAr
                      ? 'سيتم حذف جميع سجلات الفواتير، المعاملات، العملاء، السندات والقيود فوراً وبشكل نهائي. يرجى تأكيد الهوية والعبارة لمتابعة الإجراء.'
                      : 'All records for invoices, transactions, customers, vouchers and journal entries will be permanently deleted. Please verify your identity and confirm the phrase.'}
                  </p>

                  {reauthError && (
                    <div className="text-[11px] font-bold text-rose-700 bg-rose-100/50 p-2 rounded-lg border border-rose-200">
                      {reauthError}
                    </div>
                  )}

                  {/* Phrase confirmation input */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-rose-950">
                      {isAr ? 'اكتب العبارة التالية بحروف كبيرة (CLEAR ALL DATA):' : 'Type the following phrase in capitals (CLEAR ALL DATA):'}
                    </label>
                    <input
                      type="text"
                      placeholder="CLEAR ALL DATA"
                      value={typedVerification}
                      onChange={(e) => setTypedVerification(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-rose-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-rose-500 font-mono tracking-wider"
                    />
                  </div>

                  {/* Password reauth input */}
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-rose-950">
                      {isAr ? 'أدخل كلمة مرور حسابك الحالية للمصادقة:' : 'Enter your current account password to authorize:'}
                    </label>
                    <input
                      type="password"
                      placeholder={isAr ? 'كلمة المرور' : 'Password'}
                      value={reauthPassword}
                      onChange={(e) => setReauthPassword(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-rose-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1.5">
                    <button
                      onClick={handleResetToClean}
                      disabled={isProcessing}
                      className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
                    >
                      {isProcessing ? (isAr ? 'جاري التحقق والتصفير...' : 'Verifying & resetting...') : isAr ? 'نعم، قم بالتصفير النهائي الآن' : 'Yes, Confirm & Clear All Data'}
                    </button>
                    <button
                      onClick={() => {
                        setConfirmCleanOpen(false);
                        setReauthPassword('');
                        setTypedVerification('');
                        setReauthError(null);
                      }}
                      className="py-2 px-3 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-medium border border-slate-300"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmCleanOpen(true)}
                  className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isAr ? 'تصفير إلى قاعدة بيانات نظيفة' : 'Reset to Clean Database'}</span>
                </button>
              )}
            </div>

            {/* Card 2: Demo Data Restore */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50/60 border border-indigo-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 text-indigo-900 font-bold mb-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 border border-indigo-300 flex items-center justify-center text-indigo-600">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <h3>{isAr ? 'تحميل البيانات التجريبية الشاملة' : 'Load Full Demo Data'}</h3>
                </div>
                <p className="text-xs text-indigo-800 leading-relaxed mb-3">
                  {isAr
                    ? 'يقوم بتحميل حزمة متكاملة من المعاملات والعملاء والموظفين والفواتير وسندات القبض وحركات القيود المحاسبية، وهي مثالية لأغراض التدريب والمعاينة واختبار كافة سيناريوهات النظام.'
                    : 'Populates a comprehensive set of demo customers, transactions, employees, invoices, and journal entries for testing and evaluation.'}
                </p>

                <div className="text-[11px] text-slate-600 space-y-1 mb-4 bg-white/70 p-2.5 rounded-xl border border-indigo-100">
                  <div className="flex items-center gap-1.5 text-indigo-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'عملاء أفراد وشركات من العين وأبوظبي' : 'Demo individual & corporate clients'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-indigo-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'معاملات إقامات، جوازات، تذاكر، ورخص تجارية' : 'Sample residency, flight & license tasks'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-indigo-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isAr ? 'فواتير وسندات تحصيل معتمدة ومطابقة محاسبية' : 'Sample invoices and collection vouchers'}</span>
                  </div>
                </div>
              </div>

              {confirmDemoOpen ? (
                <div className="p-3 bg-indigo-100 border border-indigo-300 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-indigo-600" />
                    <span>{isAr ? 'تأكيد استعادة البيانات التجريبية؟' : 'Confirm demo restore?'}</span>
                  </div>
                  <p className="text-[11px] text-indigo-800">
                    {isAr
                      ? 'سيتم استبدال البيانات الحالية بالبيانات التجريبية المعيارية.'
                      : 'Current records will be replaced with demo dataset.'}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleResetToDemo}
                      disabled={isProcessing}
                      className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                    >
                      {isProcessing ? (isAr ? 'جارِ التحميل...' : 'Loading...') : isAr ? 'نعم، حمّل البيانات التجريبية' : 'Yes, Load Demo'}
                    </button>
                    <button
                      onClick={() => setConfirmDemoOpen(false)}
                      className="py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-300"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDemoOpen(true)}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{isAr ? 'استعادة البيانات التجريبية' : 'Load Demo Data'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Backup & Excel Import Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-2">
              <HardDriveDownload className="w-4 h-4 text-slate-600" />
              <span>{isAr ? 'النسخ الاحتياطي والاستيراد الجماعي' : 'Backups & Bulk Import'}</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={handleExportJson}
                className="p-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-slate-800 transition-colors"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                <div className="text-start">
                  <div>{isAr ? 'تصدير نسخة JSON' : 'Export JSON Backup'}</div>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {isAr ? 'حفظ نسخة كاملة من القاعدة' : 'Download full backup'}
                  </span>
                </div>
              </button>

              <button
                onClick={handleExportCsv}
                className="p-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-slate-800 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <div className="text-start">
                  <div>{isAr ? 'تصدير ملف CSV' : 'Export CSV Format'}</div>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {isAr ? 'تصدير قائمة المعاملات' : 'Download transactions CSV'}
                  </span>
                </div>
              </button>

              <label className="p-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-slate-800 transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-amber-600" />
                <div className="text-start">
                  <div>{isAr ? 'استيراد نسخة JSON' : 'Import JSON Backup'}</div>
                  <span className="text-[10px] text-slate-500 font-normal">
                    {isAr ? 'استعادة من ملف سابق' : 'Restore from backup file'}
                  </span>
                </div>
                <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
              </label>

              {onOpenImportHub && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenImportHub();
                  }}
                  className="p-3 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-2.5 text-xs font-semibold text-indigo-900 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-indigo-600" />
                  <div className="text-start">
                    <div>{isAr ? 'استيراد جماعي' : 'Bulk Import Hub'}</div>
                    <span className="text-[10px] text-indigo-600/80 font-normal">
                      {isAr ? 'رفع ملفات العملاء والخدمات' : 'Import CSV/Excel files'}
                    </span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {isAr
                ? 'نظام جلف ساند ERP • التخزين السحابي والمحلي محمي وموثق تلقائياً'
                : 'Gulf Sand ERP • Auto-persisted & synchronized'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    );

  if (embedded) {
    return (
      <div id="database-management-canvas-view" className="w-full pb-8">
        {modalBody}
      </div>
    );
  }

  return (
    <div
      id="database-management-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {modalBody}
    </div>
  );
};
