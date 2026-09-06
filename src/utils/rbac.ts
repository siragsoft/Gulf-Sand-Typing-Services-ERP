import { UserRole } from '../types/schema';
import { TableName } from '../db/schemaDefinition';

export interface RolePermissions {
  allowedTablesCreate: TableName[] | 'ALL';
  allowedTablesEdit: TableName[] | 'ALL';
  allowedTablesDelete: TableName[] | 'ALL';
  restrictedTables: TableName[];
  sensitiveFields: string[];
  canApproveDiscounts: boolean;
  canApproveExpenses: boolean;
  canApproveLeaves: boolean;
  canManageUsers: boolean;
  canResetDatabase: boolean;
  canPostJournalEntries: boolean;
  canViewFinancialReports: boolean;
  canViewSalaries: boolean;
  canManageTemplates: boolean;
  canRevokeReceiptTokens: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  [UserRole.SYSTEM_ADMIN]: {
    allowedTablesCreate: 'ALL',
    allowedTablesEdit: 'ALL',
    allowedTablesDelete: 'ALL',
    restrictedTables: [],
    sensitiveFields: [],
    canApproveDiscounts: true,
    canApproveExpenses: true,
    canApproveLeaves: true,
    canManageUsers: true,
    canResetDatabase: true,
    canPostJournalEntries: true,
    canViewFinancialReports: true,
    canViewSalaries: true,
    canManageTemplates: true,
    canRevokeReceiptTokens: true,
  },
  [UserRole.MANAGER]: {
    allowedTablesCreate: 'ALL',
    allowedTablesEdit: 'ALL',
    allowedTablesDelete: [
      'customers',
      'services_pricing',
      'transactions',
      'transaction_details',
      'bookings',
      'invoices',
      'invoice_details',
      'collections_receipts',
      'payment_allocations',
      'expenses',
      'disbursements',
      'tasks',
      'crm_leads',
      'crm_followups',
      'documents',
    ],
    restrictedTables: ['system_settings', 'system_backups', 'users_permissions'],
    sensitiveFields: [],
    canApproveDiscounts: true,
    canApproveExpenses: true,
    canApproveLeaves: true,
    canManageUsers: false,
    canResetDatabase: false,
    canPostJournalEntries: true,
    canViewFinancialReports: true,
    canViewSalaries: true,
    canManageTemplates: true,
    canRevokeReceiptTokens: true,
  },
  [UserRole.SUPERVISOR]: {
    allowedTablesCreate: [
      'customers',
      'transactions',
      'transaction_details',
      'bookings',
      'invoices',
      'invoice_details',
      'collections_receipts',
      'tasks',
      'approvals',
      'documents',
      'crm_leads',
      'crm_followups',
      'attendance_logs',
    ],
    allowedTablesEdit: [
      'customers',
      'transactions',
      'transaction_details',
      'bookings',
      'invoices',
      'tasks',
      'approvals',
      'documents',
      'crm_leads',
      'crm_followups',
      'attendance_logs',
    ],
    allowedTablesDelete: ['crm_leads', 'crm_followups', 'tasks', 'documents'],
    restrictedTables: [
      'system_settings',
      'system_backups',
      'users_permissions',
      'audit_logs',
      'chart_of_accounts',
      'journal_entries',
      'journal_entry_lines',
      'payroll',
      'bank_reconciliations',
      'document_templates',
      'document_template_versions',
    ],
    sensitiveFields: ['basic_salary_aed', 'net_salary_aed', 'housing_allowance_aed', 'profit_margin_aed'],
    canApproveDiscounts: true,
    canApproveExpenses: false,
    canApproveLeaves: true,
    canManageUsers: false,
    canResetDatabase: false,
    canPostJournalEntries: false,
    canViewFinancialReports: false,
    canViewSalaries: false,
    canManageTemplates: false,
    canRevokeReceiptTokens: false,
  },
  [UserRole.ACCOUNTS]: {
    allowedTablesCreate: [
      'invoices',
      'invoice_details',
      'collections_receipts',
      'payment_allocations',
      'expenses',
      'disbursements',
      'chart_of_accounts',
      'journal_entries',
      'journal_entry_lines',
      'cash_bank_accounts',
      'bank_reconciliations',
      'suppliers_vendors',
      'customers',
      'tasks',
      'documents',
    ],
    allowedTablesEdit: [
      'invoices',
      'invoice_details',
      'collections_receipts',
      'expenses',
      'disbursements',
      'chart_of_accounts',
      'journal_entries',
      'cash_bank_accounts',
      'bank_reconciliations',
      'suppliers_vendors',
      'customers',
      'tasks',
    ],
    allowedTablesDelete: ['expenses', 'disbursements', 'tasks'],
    restrictedTables: [
      'system_settings',
      'system_backups',
      'users_permissions',
      'audit_logs',
      'payroll',
      'employee_performance',
      'document_templates',
      'document_template_versions',
    ],
    sensitiveFields: ['basic_salary_aed', 'net_salary_aed', 'housing_allowance_aed'],
    canApproveDiscounts: false,
    canApproveExpenses: true,
    canApproveLeaves: false,
    canManageUsers: false,
    canResetDatabase: false,
    canPostJournalEntries: true,
    canViewFinancialReports: true,
    canViewSalaries: false,
    canManageTemplates: false,
    canRevokeReceiptTokens: false,
  },
  [UserRole.OPERATIONS]: {
    allowedTablesCreate: [
      'customers',
      'transactions',
      'transaction_details',
      'bookings',
      'crm_leads',
      'crm_followups',
      'documents',
      'tasks',
    ],
    allowedTablesEdit: [
      'customers',
      'transactions',
      'transaction_details',
      'bookings',
      'crm_leads',
      'crm_followups',
      'documents',
      'tasks',
    ],
    allowedTablesDelete: [],
    restrictedTables: [
      'system_settings',
      'system_backups',
      'users_permissions',
      'audit_logs',
      'chart_of_accounts',
      'journal_entries',
      'journal_entry_lines',
      'cash_bank_accounts',
      'bank_reconciliations',
      'expenses',
      'disbursements',
      'payroll',
      'commissions',
      'employee_performance',
      'employees',
      'document_templates',
      'document_template_versions',
    ],
    sensitiveFields: [
      'standard_cost_aed',
      'profit_margin_aed',
      'profit_aed',
      'total_cost_aed',
      'net_profit_aed',
      'basic_salary_aed',
      'net_salary_aed',
      'housing_allowance_aed',
      'transport_allowance_aed',
    ],
    canApproveDiscounts: false,
    canApproveExpenses: false,
    canApproveLeaves: false,
    canManageUsers: false,
    canResetDatabase: false,
    canPostJournalEntries: false,
    canViewFinancialReports: false,
    canViewSalaries: false,
    canManageTemplates: false,
    canRevokeReceiptTokens: false,
  },
  [UserRole.HR]: {
    allowedTablesCreate: [
      'employees',
      'attendance_logs',
      'leaves',
      'payroll',
      'commissions',
      'employee_performance',
      'holidays_events',
      'training_modules',
      'documents',
      'tasks',
    ],
    allowedTablesEdit: [
      'employees',
      'attendance_logs',
      'leaves',
      'payroll',
      'commissions',
      'employee_performance',
      'holidays_events',
      'training_modules',
      'documents',
      'tasks',
    ],
    allowedTablesDelete: ['attendance_logs', 'leaves', 'tasks', 'documents'],
    restrictedTables: [
      'system_settings',
      'system_backups',
      'users_permissions',
      'audit_logs',
      'chart_of_accounts',
      'journal_entries',
      'journal_entry_lines',
      'cash_bank_accounts',
      'bank_reconciliations',
      'expenses',
      'disbursements',
      'document_templates',
      'document_template_versions',
    ],
    sensitiveFields: ['standard_cost_aed', 'profit_margin_aed'],
    canApproveDiscounts: false,
    canApproveExpenses: false,
    canApproveLeaves: true,
    canManageUsers: false,
    canResetDatabase: false,
    canPostJournalEntries: false,
    canViewFinancialReports: false,
    canViewSalaries: true,
    canManageTemplates: false,
    canRevokeReceiptTokens: false,
  },
  [UserRole.CUSTOMER_SERVICE]: {
    allowedTablesCreate: [
      'customers',
      'transactions',
      'transaction_details',
      'bookings',
      'crm_leads',
      'crm_followups',
      'tasks',
      'documents',
    ],
    allowedTablesEdit: [
      'customers',
      'transactions',
      'transaction_details',
      'bookings',
      'crm_leads',
      'crm_followups',
      'tasks',
      'documents',
    ],
    allowedTablesDelete: ['crm_leads', 'crm_followups'],
    restrictedTables: [
      'system_settings',
      'system_backups',
      'users_permissions',
      'audit_logs',
      'chart_of_accounts',
      'journal_entries',
      'journal_entry_lines',
      'cash_bank_accounts',
      'bank_reconciliations',
      'expenses',
      'disbursements',
      'payroll',
      'commissions',
      'employee_performance',
      'employees',
      'document_templates',
      'document_template_versions',
    ],
    sensitiveFields: [
      'standard_cost_aed',
      'profit_margin_aed',
      'profit_aed',
      'total_cost_aed',
      'net_profit_aed',
      'basic_salary_aed',
      'net_salary_aed',
      'housing_allowance_aed',
      'transport_allowance_aed',
    ],
    canApproveDiscounts: false,
    canApproveExpenses: false,
    canApproveLeaves: false,
    canManageUsers: false,
    canResetDatabase: false,
    canPostJournalEntries: false,
    canViewFinancialReports: false,
    canViewSalaries: false,
    canManageTemplates: false,
    canRevokeReceiptTokens: false,
  },
  [UserRole.VIEWER]: {
    allowedTablesCreate: [],
    allowedTablesEdit: [],
    allowedTablesDelete: [],
    restrictedTables: [
      'system_settings',
      'system_backups',
      'users_permissions',
      'audit_logs',
      'payroll',
      'document_templates',
      'document_template_versions',
    ],
    sensitiveFields: [
      'standard_cost_aed',
      'profit_margin_aed',
      'profit_aed',
      'total_cost_aed',
      'net_profit_aed',
      'basic_salary_aed',
      'net_salary_aed',
      'housing_allowance_aed',
    ],
    canApproveDiscounts: false,
    canApproveExpenses: false,
    canApproveLeaves: false,
    canManageUsers: false,
    canResetDatabase: false,
    canPostJournalEntries: false,
    canViewFinancialReports: false,
    canViewSalaries: false,
    canManageTemplates: false,
    canRevokeReceiptTokens: false,
  },
};

export function canManageDocumentTemplates(role: UserRole): boolean {
  return role === UserRole.SYSTEM_ADMIN || role === UserRole.MANAGER;
}

export function canCreateInTable(role: UserRole, table: TableName): boolean {
  const perm = ROLE_PERMISSIONS[role];
  if (!perm) return false;
  if (perm.allowedTablesCreate === 'ALL') return true;
  return perm.allowedTablesCreate.includes(table);
}

export function canEditInTable(role: UserRole, table: TableName): boolean {
  const perm = ROLE_PERMISSIONS[role];
  if (!perm) return false;
  if (perm.allowedTablesEdit === 'ALL') return true;
  return perm.allowedTablesEdit.includes(table);
}

export function canDeleteInTable(role: UserRole, table: TableName): boolean {
  const perm = ROLE_PERMISSIONS[role];
  if (!perm) return false;
  if (perm.allowedTablesDelete === 'ALL') return true;
  return perm.allowedTablesDelete.includes(table);
}

export function canViewTable(role: UserRole, table: TableName): boolean {
  const perm = ROLE_PERMISSIONS[role];
  if (!perm) return true;
  return !perm.restrictedTables.includes(table);
}

export function isFieldSensitiveForRole(role: UserRole, fieldName: string): boolean {
  const perm = ROLE_PERMISSIONS[role];
  if (!perm) return false;
  return perm.sensitiveFields.some((f) => fieldName.toLowerCase().includes(f.toLowerCase()));
}

export function canViewCostProfit(role: UserRole): boolean {
  return role === UserRole.SYSTEM_ADMIN || role === UserRole.MANAGER || role === UserRole.ACCOUNTS;
}

export function getRoleBadgeInfo(role: UserRole, lang: 'ar' | 'en' = 'ar'): { label: string; color: string; bg: string } {
  switch (role) {
    case UserRole.SYSTEM_ADMIN:
      return {
        label: lang === 'ar' ? 'مدير النظام (Admin)' : 'System Admin',
        color: 'text-indigo-700',
        bg: 'bg-indigo-50 border-indigo-200',
      };
    case UserRole.MANAGER:
      return {
        label: lang === 'ar' ? 'المدير التنفيذي (Manager)' : 'Executive Manager',
        color: 'text-purple-700',
        bg: 'bg-purple-50 border-purple-200',
      };
    case UserRole.SUPERVISOR:
      return {
        label: lang === 'ar' ? 'مشرف العمليات (Supervisor)' : 'Ops Supervisor',
        color: 'text-sky-700',
        bg: 'bg-sky-50 border-sky-200',
      };
    case UserRole.ACCOUNTS:
      return {
        label: lang === 'ar' ? 'المحاسب المالي (Accounts)' : 'Accountant',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50 border-emerald-200',
      };
    case UserRole.OPERATIONS:
      return {
        label: lang === 'ar' ? 'موظف العمليات (Operations)' : 'Operations Agent',
        color: 'text-amber-700',
        bg: 'bg-amber-50 border-amber-200',
      };
    case UserRole.CUSTOMER_SERVICE:
      return {
        label: lang === 'ar' ? 'خدمة العملاء (Customer Service)' : 'Customer Service',
        color: 'text-teal-700',
        bg: 'bg-teal-50 border-teal-200',
      };
    case UserRole.HR:
      return {
        label: lang === 'ar' ? 'الموارد البشرية (HR)' : 'HR Specialist',
        color: 'text-pink-700',
        bg: 'bg-pink-50 border-pink-200',
      };
    case UserRole.VIEWER:
    default:
      return {
        label: lang === 'ar' ? 'مشاهد فقط (Viewer)' : 'Read-Only Viewer',
        color: 'text-slate-700',
        bg: 'bg-slate-100 border-slate-200',
      };
  }
}

export type ErpModuleId =
  | 'OVERVIEW'
  | 'REQUESTS'
  | 'CLIENTS'
  | 'SERVICES'
  | 'DOCUMENTS'
  | 'WORKFLOW'
  | 'APPROVALS'
  | 'ACCOUNTING'
  | 'REPORTS'
  | 'USERS'
  | 'AUDIT'
  | 'SETTINGS';

export interface ModuleDefinition {
  id: ErpModuleId;
  labelAr: string;
  labelEn: string;
  descriptionAr: string;
  descriptionEn: string;
  icon: string;
  requiredRoles: UserRole[];
}

export const ERP_MODULES: ModuleDefinition[] = [
  {
    id: 'OVERVIEW',
    labelAr: 'لوحة المؤشرات',
    labelEn: 'Overview Dashboard',
    descriptionAr: 'نظرة عامة على مؤشرات الأداء والعمليات اليومية',
    descriptionEn: 'High-level operational overview & daily KPIs',
    icon: 'LayoutDashboard',
    requiredRoles: [
      UserRole.SYSTEM_ADMIN,
      UserRole.MANAGER,
      UserRole.SUPERVISOR,
      UserRole.ACCOUNTS,
      UserRole.OPERATIONS,
      UserRole.CUSTOMER_SERVICE,
      UserRole.HR,
      UserRole.VIEWER,
    ],
  },
  {
    id: 'REQUESTS',
    labelAr: 'الطلبات والمعاملات',
    labelEn: 'Requests & Transactions',
    descriptionAr: 'إدارة وتتبع معاملات الطباعة والهوية والجوازات والإقامات',
    descriptionEn: 'Manage and process government typing transactions',
    icon: 'FileText',
    requiredRoles: [
      UserRole.SYSTEM_ADMIN,
      UserRole.MANAGER,
      UserRole.SUPERVISOR,
      UserRole.OPERATIONS,
      UserRole.CUSTOMER_SERVICE,
      UserRole.ACCOUNTS,
      UserRole.VIEWER,
    ],
  },
  {
    id: 'CLIENTS',
    labelAr: 'العملاء والشركات',
    labelEn: 'Clients & Companies',
    descriptionAr: 'سجل العملاء الأفراد والشركات والجهات الشريكة',
    descriptionEn: 'Client profiles, corporate accounts & CRM followups',
    icon: 'Users',
    requiredRoles: [
      UserRole.SYSTEM_ADMIN,
      UserRole.MANAGER,
      UserRole.SUPERVISOR,
      UserRole.CUSTOMER_SERVICE,
      UserRole.OPERATIONS,
      UserRole.ACCOUNTS,
    ],
  },
  {
    id: 'SERVICES',
    labelAr: 'دليل الخدمات والأسعار',
    labelEn: 'Services & Pricing',
    descriptionAr: 'قائمة الخدمات والرسوم الحكومية ورسوم الطباعة',
    descriptionEn: 'Official government fees and typing rate cards',
    icon: 'Layers',
    requiredRoles: [
      UserRole.SYSTEM_ADMIN,
      UserRole.MANAGER,
      UserRole.SUPERVISOR,
      UserRole.OPERATIONS,
      UserRole.CUSTOMER_SERVICE,
      UserRole.ACCOUNTS,
      UserRole.VIEWER,
    ],
  },
  {
    id: 'DOCUMENTS',
    labelAr: 'المستندات والنماذج',
    labelEn: 'Documents & Templates',
    descriptionAr: 'أرشيف الوثائق وإصدار النماذج والعقود المعتمدة',
    descriptionEn: 'Document archives and dynamic contract templates',
    icon: 'BookOpen',
    requiredRoles: [
      UserRole.SYSTEM_ADMIN,
      UserRole.MANAGER,
      UserRole.SUPERVISOR,
      UserRole.OPERATIONS,
      UserRole.CUSTOMER_SERVICE,
      UserRole.VIEWER,
    ],
  },
  {
    id: 'WORKFLOW',
    labelAr: 'المتابعة وسير العمل',
    labelEn: 'Workflow & Tasks',
    descriptionAr: 'متابعة مراحل الإنجاز وتوزيع المهام والتذكيرات',
    descriptionEn: 'Task assignment, stage pipelines & follow-up queues',
    icon: 'CheckCircle2',
    requiredRoles: [
      UserRole.SYSTEM_ADMIN,
      UserRole.MANAGER,
      UserRole.SUPERVISOR,
      UserRole.OPERATIONS,
      UserRole.CUSTOMER_SERVICE,
    ],
  },
  {
    id: 'APPROVALS',
    labelAr: 'مركز الموافقات',
    labelEn: 'Approvals Center',
    descriptionAr: 'اعتماد الخصومات، المصروفات، والإجازات الإدارية',
    descriptionEn: 'Approve discounts, expense vouchers & leaves',
    icon: 'ShieldCheck',
    requiredRoles: [
      UserRole.SYSTEM_ADMIN,
      UserRole.MANAGER,
      UserRole.SUPERVISOR,
      UserRole.ACCOUNTS,
      UserRole.HR,
    ],
  },
  {
    id: 'ACCOUNTING',
    labelAr: 'المحاسبة والمالية',
    labelEn: 'Accounting & Finance',
    descriptionAr: 'الفواتير، سندات القبض والصرف، والحسابات البنكية',
    descriptionEn: 'Invoicing, receipts, petty cash, and financial ledgers',
    icon: 'Coins',
    requiredRoles: [
      UserRole.SYSTEM_ADMIN,
      UserRole.MANAGER,
      UserRole.ACCOUNTS,
    ],
  },
  {
    id: 'REPORTS',
    labelAr: 'التقارير التحليلية',
    labelEn: 'Reports & Analytics',
    descriptionAr: 'تقارير الإيرادات، الأرباح، أداء الموظفين، وضريبة VAT',
    descriptionEn: 'Business intelligence, revenue, tax & employee performance',
    icon: 'BarChart3',
    requiredRoles: [
      UserRole.SYSTEM_ADMIN,
      UserRole.MANAGER,
      UserRole.ACCOUNTS,
    ],
  },
  {
    id: 'USERS',
    labelAr: 'المستخدمون والصلاحيات',
    labelEn: 'Users & Roles',
    descriptionAr: 'إدارة حسابات الموظفين، الأدوار، وتفعيل المستخدمين',
    descriptionEn: 'User accounts, role assignment & activation invites',
    icon: 'UserPlus',
    requiredRoles: [
      UserRole.SYSTEM_ADMIN,
      UserRole.MANAGER,
    ],
  },
  {
    id: 'AUDIT',
    labelAr: 'سجل الرقابة والعمليات',
    labelEn: 'Audit Log',
    descriptionAr: 'تتبع كافة الحركات الأمنية والتعديلات بالنظام',
    descriptionEn: 'Immutable audit trail for all security and data modifications',
    icon: 'ShieldAlert',
    requiredRoles: [
      UserRole.SYSTEM_ADMIN,
    ],
  },
  {
    id: 'SETTINGS',
    labelAr: 'الإعدادات وحوكمة AI',
    labelEn: 'Settings & AI Governance',
    descriptionAr: 'إعدادات المنشأة، مفتاح الطوارئ للذكاء الاصطناعي، والنسخ الاحتياطي',
    descriptionEn: 'System preferences, AI kill-switch & database backups',
    icon: 'Sliders',
    requiredRoles: [
      UserRole.SYSTEM_ADMIN,
      UserRole.MANAGER,
    ],
  },
];

export function isModuleAllowedForRole(role: UserRole, moduleId: ErpModuleId): boolean {
  const mod = ERP_MODULES.find((m) => m.id === moduleId);
  if (!mod) return false;
  return mod.requiredRoles.includes(role);
}

export function getAllowedModulesForRole(role: UserRole): ModuleDefinition[] {
  return ERP_MODULES.filter((m) => m.requiredRoles.includes(role));
}
