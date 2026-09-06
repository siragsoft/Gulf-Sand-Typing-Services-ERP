import { UserRole, Department } from './schema';

export type NavigationModuleId =
  | 'overview'
  | 'dashboard'
  | 'customers'
  | 'transactions'
  | 'services'
  | 'bookings'
  | 'invoices'
  | 'collections'
  | 'expenses'
  | 'accounting'
  | 'hr'
  | 'attendance'
  | 'leaves'
  | 'payroll'
  | 'documents'
  | 'tasks_approvals'
  | 'reports'
  | 'training'
  | 'settings'
  | 'schema_explorer';

export interface CurrentUserSession {
  email: string;
  name_ar: string;
  name_en: string;
  role: UserRole;
  department: Department;
  branch_id: string;
  avatar_url?: string;
  can_view_cost_profit: boolean;
  can_approve: boolean;
  can_delete: boolean;
  can_export: boolean;
  can_close_month: boolean;
  can_manage_settings: boolean;
  discount_limit_aed: number;
}

export interface DateRangeFilter {
  preset: 'today' | 'this_week' | 'this_month' | 'this_year' | 'custom';
  start_date: string;
  end_date: string;
}

export interface QuickActionItem {
  id: string;
  label_ar: string;
  label_en: string;
  icon: string;
  allowed_roles: UserRole[];
  modal_action: string;
}

export interface TableColumnMetadata {
  key: string;
  name_ar: string;
  name_en: string;
  type: 'string' | 'number' | 'currency' | 'boolean' | 'date' | 'enum' | 'json' | 'array';
  is_required: boolean;
  is_primary_key?: boolean;
  is_foreign_key?: boolean;
  foreign_table?: string;
  is_sensitive?: boolean; // Hidden from Operations role
  description_ar: string;
}

export interface TableSchemaDefinition {
  table_name_ar: string;
  table_name_en: string;
  id_prefix: string;
  category: 'core' | 'crm' | 'operations' | 'finance' | 'hr' | 'system' | 'knowledge';
  description_ar: string;
  columns: TableColumnMetadata[];
}
