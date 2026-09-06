import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole, Department, UserPermissionRecord, SecurityAuditRecord } from '../types/schema';
import { BrandingSettingsModal } from './BrandingSettingsModal';
import {
  Users,
  UserPlus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Edit2,
  Trash2,
  KeyRound,
  Lock,
  History,
  Mail,
  Phone,
  Building,
  Calendar,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Palette,
} from 'lucide-react';

interface UserManagementHubProps {
  onOpenActivationUrl?: (token: string) => void;
  lang?: 'ar' | 'en';
}

export const UserManagementHub: React.FC<UserManagementHubProps> = ({ onOpenActivationUrl, lang = 'ar' }) => {
  const {
    isSuperAdmin,
    currentUser,
    fetchUsersList,
    createUser,
    updateUser,
    deleteUser,
    resendInvitation,
    fetchSecurityAuditLogs,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');
  const [users, setUsers] = useState<UserPermissionRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBrandingModal, setShowBrandingModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserPermissionRecord | null>(null);

  // Form states
  const [fullNameAr, setFullNameAr] = useState('');
  const [fullNameEn, setFullNameEn] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.OPERATIONS);
  const [department, setDepartment] = useState<Department>(Department.TYPING_OPERATIONS);
  const [branchId, setBranchId] = useState('BR-001');
  const [employeeId, setEmployeeId] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredLang, setPreferredLang] = useState<'ar' | 'en'>('ar');
  const [expirationDate, setExpirationDate] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [createdActivationUrl, setCreatedActivationUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Load Data
  const loadData = async () => {
    setLoading(true);
    const usersList = await fetchUsersList();
    setUsers(usersList);
    const logs = await fetchSecurityAuditLogs();
    setAuditLogs(logs);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.full_name_ar?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.full_name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.employee_id?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && (u.account_status === 'ACTIVE' || u.is_active)) ||
        (statusFilter === 'PENDING_ACTIVATION' && u.account_status === 'PENDING_ACTIVATION') ||
        (statusFilter === 'INACTIVE' && (u.account_status === 'INACTIVE' || !u.is_active || u.account_status === 'SUSPENDED'));

      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Handle User Creation (SUPER_ADMIN Only)
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setCreatedActivationUrl(null);

    if (!email.trim() || !fullNameAr.trim()) {
      setFormError('يرجى ملء كافة الحقول الإلزامية (الاسم بالعربية والبريد الإلكتروني).');
      return;
    }

    setLoading(true);
    const res = await createUser({
      full_name_ar: fullNameAr.trim(),
      full_name_en: fullNameEn.trim() || fullNameAr.trim(),
      email: email.trim().toLowerCase(),
      role,
      department,
      branch_id: branchId,
      employee_id: employeeId.trim() || `EMP-${Date.now().toString().slice(-3)}`,
      phone: phone.trim() || '+971 50 000 0000',
      preferred_language: preferredLang,
      expiration_date: expirationDate || null,
      account_status: 'PENDING_ACTIVATION',
      is_active: false,
    });
    setLoading(false);

    if (res.success) {
      setFormSuccess('تم إنشاء حساب المستخدم بنجاح وتوليد رابط التفعيل ذو الاستخدام الواحد.');
      if (res.activationUrl) {
        setCreatedActivationUrl(res.activationUrl);
      }
      loadData();
    } else {
      setFormError(res.message_ar || 'فشل إنشاء المستخدم.');
    }
  };

  // Handle User Update
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFormError('');

    setLoading(true);
    const res = await updateUser(selectedUser.id, {
      full_name_ar: fullNameAr.trim(),
      full_name_en: fullNameEn.trim() || fullNameAr.trim(),
      role,
      department,
      employee_id: employeeId.trim(),
      phone: phone.trim(),
      preferred_language: preferredLang,
      expiration_date: expirationDate || null,
    });
    setLoading(false);

    if (res.success) {
      setShowEditModal(false);
      loadData();
    } else {
      setFormError(res.message_ar || 'فشل تحديث البيانات.');
    }
  };

  // Handle Status Toggle
  const handleToggleStatus = async (user: UserPermissionRecord, newStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED') => {
    setLoading(true);
    const res = await updateUser(user.id, {
      account_status: newStatus,
      is_active: newStatus === 'ACTIVE',
    });
    setLoading(false);
    if (res.success) {
      loadData();
    } else {
      alert(res.message_ar || 'فشل تعديل حالة الحساب.');
    }
  };

  // Handle Delete
  const handleDeleteUser = async (user: UserPermissionRecord) => {
    if (!window.confirm(`هل أنت متأكد من رغبتك في حذف حساب المستخدم "${user.full_name_ar}" نهائياً من النظام؟`)) {
      return;
    }

    setLoading(true);
    const res = await deleteUser(user.id);
    setLoading(false);
    if (res.success) {
      loadData();
    } else {
      alert(res.message_ar || 'فشل حذف المستخدم.');
    }
  };

  // Handle Resend Invitation Link
  const handleResendLink = async (user: UserPermissionRecord) => {
    setLoading(true);
    const res = await resendInvitation(user.id);
    setLoading(false);
    if (res.success && res.url) {
      setCreatedActivationUrl(res.url);
      setShowCreateModal(true);
      setFormSuccess(`تم إنشاء رابط دعوة جديد للمستخدم ${user.full_name_ar}.`);
    } else {
      alert(res.message_ar || 'فشل إنشاء الرابط.');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(window.location.origin + text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const openEditModal = (user: UserPermissionRecord) => {
    setSelectedUser(user);
    setFullNameAr(user.full_name_ar || '');
    setFullNameEn(user.full_name_en || '');
    setEmail(user.email || '');
    setRole(user.role);
    setDepartment(user.department);
    setEmployeeId(user.employee_id || '');
    setPhone(user.phone || '');
    setPreferredLang(user.preferred_language || 'ar');
    setExpirationDate(user.expiration_date || '');
    setFormError('');
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFullNameAr('');
    setFullNameEn('');
    setEmail('');
    setRole(UserRole.OPERATIONS);
    setDepartment(Department.TYPING_OPERATIONS);
    setBranchId('BR-001');
    setEmployeeId(`EMP-${Date.now().toString().slice(-3)}`);
    setPhone('+971 50 ');
    setPreferredLang('ar');
    setExpirationDate('');
    setFormError('');
    setFormSuccess('');
    setCreatedActivationUrl(null);
  };

  // If user is NOT Super Admin, enforce strict block
  if (!isSuperAdmin) {
    return (
      <div className="p-8 text-center" dir="rtl">
        <div className="max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-400 mx-auto flex items-center justify-center mb-4 border border-rose-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">منطقة محظورة</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            عذراً، إدارة المستخدمين وإنشاء الحسابات مقصورة حصرياً على مدير النظام الأعلى (SUPER_ADMIN) وفقاً للسياسات الأمنية المعتمدة لنظام جلف ساند.
          </p>
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400">
            حسابك الحالي: <span className="font-bold text-slate-200">{currentUser?.fullNameAr}</span> ({currentUser?.role})
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>مركز إدارة المستخدمين والصلاحيات والأمان</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                  SUPER_ADMIN ONLY
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                التحكم بالوصول، إنشاء الموظفين، إدارة الصلاحيات ومراقبة سجلات الأمان
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons & Tabs */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'users' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>دليل المستخدمين ({users.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'audit' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>سجل الأمان والتدقيق</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="manage-branding-btn"
              type="button"
              onClick={() => setShowBrandingModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
              title="إدارة الشعار وهوية المكتب المركزية"
            >
              <Palette className="w-4 h-4 text-amber-400" />
              <span>شعار وهوية المكتب</span>
            </button>

            {activeTab === 'users' && (
              <button
                id="create-user-btn"
                type="button"
                onClick={() => {
                  resetForm();
                  setShowCreateModal(true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>إنشاء مستخدم جديد</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'users' ? (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم، البريد أو الرقم الوظيفي..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 pl-9 text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none"
              >
                <option value="ALL">جميع الأدوار الوظيفية</option>
                <option value={UserRole.SYSTEM_ADMIN}>المدير الأعلى (SYSTEM_ADMIN)</option>
                <option value={UserRole.MANAGER}>مدير الفرع (MANAGER)</option>
                <option value={UserRole.SUPERVISOR}>مشرف (SUPERVISOR)</option>
                <option value={UserRole.ACCOUNTS}>محاسب (ACCOUNTS)</option>
                <option value={UserRole.HR}>موارد بشرية (HR)</option>
                <option value={UserRole.OPERATIONS}>طباعة وعمليات (OPERATIONS)</option>
                <option value={UserRole.VIEWER}>مشاهد (VIEWER)</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none"
              >
                <option value="ALL">جميع الحالات</option>
                <option value="ACTIVE">نشط (Active)</option>
                <option value="PENDING_ACTIVATION">بانتظار التفعيل (Pending)</option>
                <option value="INACTIVE">غير مفعل / معلق (Inactive)</option>
              </select>

              <button
                type="button"
                onClick={loadData}
                className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                title="تحديث القائمة"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">المستخدم</th>
                    <th className="py-3.5 px-4">الدور الوظيفي</th>
                    <th className="py-3.5 px-4">القسم والفرع</th>
                    <th className="py-3.5 px-4">حالة الحساب</th>
                    <th className="py-3.5 px-4">الرقم الوظيفي والتواصل</th>
                    <th className="py-3.5 px-4">تاريخ الانتهاء</th>
                    <th className="py-3.5 px-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map((user) => {
                    const isUserSuperAdmin = user.is_super_admin || user.role === UserRole.SYSTEM_ADMIN;
                    const status = user.account_status || (user.is_active ? 'ACTIVE' : 'INACTIVE');

                    return (
                      <tr key={user.id} className="hover:bg-slate-850/50 transition-colors">
                        {/* User info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                              isUserSuperAdmin ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {user.full_name_ar?.charAt(0) || 'م'}
                            </div>
                            <div>
                              <div className="font-bold text-slate-100 flex items-center gap-1.5">
                                <span>{user.full_name_ar}</span>
                                {isUserSuperAdmin && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                                    SUPER_ADMIN
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400" dir="ltr">{user.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            user.role === UserRole.SYSTEM_ADMIN ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                            user.role === UserRole.MANAGER ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30' :
                            user.role === UserRole.ACCOUNTS ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                            user.role === UserRole.SUPERVISOR ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30' :
                            'bg-slate-800 text-slate-300'
                          }`}>
                            {user.role}
                          </span>
                        </td>

                        {/* Department & Branch */}
                        <td className="py-3.5 px-4">
                          <div className="text-slate-200 font-medium">{user.department}</div>
                          <div className="text-[11px] text-slate-500">{user.branch_id || 'فرع العين الرئيسي'}</div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {status === 'ACTIVE' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>نشط</span>
                            </span>
                          )}
                          {status === 'PENDING_ACTIVATION' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 text-[11px] font-semibold border border-amber-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              <span>بانتظار التفعيل</span>
                            </span>
                          )}
                          {(status === 'INACTIVE' || status === 'SUSPENDED') && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-300 text-[11px] font-semibold border border-rose-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                              <span>{status === 'SUSPENDED' ? 'معلق' : 'غير مفعل'}</span>
                            </span>
                          )}
                        </td>

                        {/* Employee ID & Phone */}
                        <td className="py-3.5 px-4">
                          <div className="font-mono text-slate-300">{user.employee_id || '-'}</div>
                          <div className="text-[11px] text-slate-500" dir="ltr">{user.phone || '-'}</div>
                        </td>

                        {/* Expiration Date */}
                        <td className="py-3.5 px-4 text-slate-400">
                          {user.expiration_date ? user.expiration_date : 'غير محدد'}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditModal(user)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                              title="تعديل المستخدم"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleResendLink(user)}
                              className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors"
                              title="إنشاء رابط تفعيل / استعادة"
                            >
                              <KeyRound className="w-3.5 h-3.5" />
                            </button>

                            {status === 'ACTIVE' ? (
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(user, 'INACTIVE')}
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                                title="تعطيل الحساب"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(user, 'ACTIVE')}
                                className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                                title="تفعيل الحساب"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 transition-colors"
                              title="حذف المستخدم"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Security Audit Log Tab */
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-400" />
                  <span>سجل التدقيق الأمني المباشر (Security Audit Trail)</span>
                </h3>
                <p className="text-xs text-slate-400">توثيق كافة عمليات الدخول، محاولات الدخول، تغيير الأدوار وتعديل كلمات المرور</p>
              </div>
              <button
                type="button"
                onClick={loadData}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>تحديث السجل</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-semibold">
                  <tr>
                    <th className="py-3 px-3">التاريخ والوقت</th>
                    <th className="py-3 px-3">نوع الحدث الأمني</th>
                    <th className="py-3 px-3">المستخدم المنفّذ</th>
                    <th className="py-3 px-3">المستخدم المستهدف</th>
                    <th className="py-3 px-3">النتيجة</th>
                    <th className="py-3 px-3">التفاصيل والسبب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        لا توجد سجلات أمنية مسجلة حتى الآن.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-850/40">
                        <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                          {new Date(log.created_at).toLocaleString('ar-AE')}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.action.includes('SUCCESS') || log.action === 'USER_CREATED' || log.action === 'USER_ACTIVATED' ? 'bg-emerald-500/15 text-emerald-400' :
                            log.action.includes('FAIL') || log.action === 'UNAUTHORIZED_USER_CREATION_ATTEMPT' ? 'bg-rose-500/15 text-rose-400' :
                            'bg-amber-500/15 text-amber-400'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 font-medium" dir="ltr">
                          {log.user_email}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400" dir="ltr">
                          {log.target_user}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-flex items-center gap-1 font-bold ${
                            log.result === 'SUCCESS' ? 'text-emerald-400' : log.result === 'BLOCKED' ? 'text-amber-400' : 'text-rose-400'
                          }`}>
                            {log.result === 'SUCCESS' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                            <span>{log.result}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                          {log.reason || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">إنشاء مستخدم جديد (SUPER_ADMIN)</h3>
                  <p className="text-xs text-slate-400">إضافة موظف وتوليد رابط التفعيل ذو الاستخدام الواحد</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm px-2 py-1"
              >
                إغلاق
              </button>
            </div>

            {formSuccess && createdActivationUrl ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs">
                  <div className="font-bold text-emerald-300 text-sm mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تم إنشاء المستخدم بنجاح!</span>
                  </div>
                  <div>حالة الحساب: <strong>بانتظار التفعيل (PENDING_ACTIVATION)</strong>. لا يمكن تسجيل الدخول بدون تعيين كلمة المرور عبر رابط التفعيل.</div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="text-xs text-amber-400 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>رابط تفعيل الحساب وتعيين كلمة المرور:</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-slate-300 text-xs font-mono break-all" dir="ltr">
                    {window.location.origin + createdActivationUrl}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(createdActivationUrl)}
                      className="flex-1 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'تم نسخ الرابط!' : 'نسخ الرابط'}</span>
                    </button>

                    {onOpenActivationUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateModal(false);
                          const tok = createdActivationUrl.split('token=')[1];
                          if (tok) onOpenActivationUrl(tok);
                        }}
                        className="flex-1 py-2 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <span>اختبار التفعيل الآن</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  إغلاق
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                {formError && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>{formError}</div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="full-name-ar">
                      الاسم الكامل بالعربية *
                    </label>
                    <input
                      id="full-name-ar"
                      type="text"
                      value={fullNameAr}
                      onChange={(e) => setFullNameAr(e.target.value)}
                      placeholder="مثال: زايد المنصوري"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="full-name-en">
                      الاسم بالإنجليزية (Full Name)
                    </label>
                    <input
                      id="full-name-en"
                      type="text"
                      value={fullNameEn}
                      onChange={(e) => setFullNameEn(e.target.value)}
                      placeholder="e.g. Zayed Al Mansoori"
                      dir="ltr"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-left"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="user-email-input">
                      البريد الإلكتروني المعتمد *
                    </label>
                    <input
                      id="user-email-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="zayed@gulfsandtyping.ae"
                      dir="ltr"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 text-left"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="role-select">
                      الدور الوظيفي والصلاحيات *
                    </label>
                    <select
                      id="role-select"
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none"
                    >
                      <option value={UserRole.OPERATIONS}>موظف طباعة وعمليات (OPERATIONS)</option>
                      <option value={UserRole.SUPERVISOR}>مشرف فرع (SUPERVISOR)</option>
                      <option value={UserRole.ACCOUNTS}>محاسب مالي (ACCOUNTS)</option>
                      <option value={UserRole.HR}>موارد بشرية (HR)</option>
                      <option value={UserRole.MANAGER}>مدير الفرع (MANAGER)</option>
                      <option value={UserRole.VIEWER}>مشاهد تقارير فقط (VIEWER)</option>
                      <option value={UserRole.SYSTEM_ADMIN}>مدير نظام أعلى (SYSTEM_ADMIN)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="dept-select">
                      القسم / الإدارة *
                    </label>
                    <select
                      id="dept-select"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value as Department)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none"
                    >
                      <option value={Department.TYPING_OPERATIONS}>قسم الطباعة والمعاملات</option>
                      <option value={Department.ACCOUNTS_FINANCE}>قسم المحاسبة والمالية</option>
                      <option value={Department.HUMAN_RESOURCES}>قسم الموارد البشرية</option>
                      <option value={Department.MANAGEMENT}>الإدارة العامة</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="emp-id-input">
                      الرقم الوظيفي
                    </label>
                    <input
                      id="emp-id-input"
                      type="text"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      placeholder="EMP-010"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="phone-input">
                      رقم الهاتف
                    </label>
                    <input
                      id="phone-input"
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+971 50 123 4567"
                      dir="ltr"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none text-left"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="lang-select">
                      لغة الواجهة المفضلة
                    </label>
                    <select
                      id="lang-select"
                      value={preferredLang}
                      onChange={(e) => setPreferredLang(e.target.value as 'ar' | 'en')}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none"
                    >
                      <option value="ar">العربية (Arabic)</option>
                      <option value="en">الإنجليزية (English)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="exp-date-input">
                      تاريخ انتهاء الصلاحية (اختياري)
                    </label>
                    <input
                      id="exp-date-input"
                      type="date"
                      value={expirationDate}
                      onChange={(e) => setExpirationDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <div className="font-semibold text-slate-300 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>آلية التفعيل والأمان:</span>
                  </div>
                  <div>عند إنشاء المستخدم، لن يتم تعيين كلمة مرور افتراضية ضعيفة. بل سيتم إنشاء رابط تفعيل آمن لمرة واحدة يتيح للمستخدم تعيين كلمة مرور شخصية تحقق شروط الأمان.</div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {loading ? 'جاري الإنشاء...' : 'إنشاء المستخدم وتوليد الرابط'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Edit2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-100">تعديل بيانات المستخدم والدور</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm px-2 py-1"
              >
                إغلاق
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>{formError}</div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="edit-name-ar">
                  الاسم الكامل بالعربية
                </label>
                <input
                  id="edit-name-ar"
                  type="text"
                  value={fullNameAr}
                  onChange={(e) => setFullNameAr(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="edit-role-select">
                  الدور الوظيفي والصلاحيات
                </label>
                <select
                  id="edit-role-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none"
                >
                  <option value={UserRole.OPERATIONS}>موظف طباعة وعمليات (OPERATIONS)</option>
                  <option value={UserRole.SUPERVISOR}>مشرف فرع (SUPERVISOR)</option>
                  <option value={UserRole.ACCOUNTS}>محاسب مالي (ACCOUNTS)</option>
                  <option value={UserRole.HR}>موارد بشرية (HR)</option>
                  <option value={UserRole.MANAGER}>مدير الفرع (MANAGER)</option>
                  <option value={UserRole.VIEWER}>مشاهد تقارير فقط (VIEWER)</option>
                  <option value={UserRole.SYSTEM_ADMIN}>مدير نظام أعلى (SYSTEM_ADMIN)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1" htmlFor="edit-dept-select">
                  القسم
                </label>
                <select
                  id="edit-dept-select"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as Department)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 text-xs focus:outline-none"
                >
                  <option value={Department.TYPING_OPERATIONS}>قسم الطباعة والمعاملات</option>
                  <option value={Department.ACCOUNTS_FINANCE}>قسم المحاسبة والمالية</option>
                  <option value={Department.HUMAN_RESOURCES}>قسم الموارد البشرية</option>
                  <option value={Department.MANAGEMENT}>الإدارة العامة</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                >
                  {loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Branding & Logo Settings Modal */}
      {showBrandingModal && (
        <BrandingSettingsModal
          isOpen={showBrandingModal}
          onClose={() => setShowBrandingModal(false)}
          lang={lang}
        />
      )}
    </div>
  );
};
