/**
 * Gulfsand Typing Services ERP - Comprehensive Schema Types
 * Al Ain, Abu Dhabi, UAE | Currency: AED | RTL Arabic First
 */

export enum UserRole {
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  MANAGER = 'MANAGER',
  SUPERVISOR = 'SUPERVISOR',
  ACCOUNTS = 'ACCOUNTS',
  HR = 'HR',
  OPERATIONS = 'OPERATIONS',
  CUSTOMER_SERVICE = 'CUSTOMER_SERVICE',
  VIEWER = 'VIEWER',
}

export enum Department {
  MANAGEMENT = 'الإدارة العامة',
  TYPING_OPERATIONS = 'قسم الطباعة والمعاملات',
  TOURISM_TRAVEL = 'قسم السياحة والسفر',
  ACCOUNTS_FINANCE = 'قسم المحاسبة والمالية',
  HUMAN_RESOURCES = 'الموارد البشرية',
  CUSTOMER_SERVICE = 'خدمة العملاء والاستقبال',
}

export enum CustomerType {
  INDIVIDUAL = 'أفراد',
  COMPANY = 'شركات',
  GOVERNMENT = 'جهات حكومية',
  PARTNER_AGENCY = 'وكالات وشركاء',
  CUSTOM = 'مخصص',
}

export enum ServiceCategory {
  RESIDENCY_VISIT = 'الإقامة والزيارة',
  VEHICLES = 'المركبات',
  TRAVEL_TOURISM = 'السفر والسياحة',
  FLIGHT_TICKETS = 'الطيران وحجز التذاكر',
  HOTELS = 'الفنادق',
  TOURS_TRANSFERS = 'التفويجات والجولات السياحية',
  TOUR_PACKAGES = 'الباقات السياحية',
  TRAVEL_INSURANCE = 'التأمين السياحي',
  JUSTICE_LEGAL = 'القضاء والعدالة',
  SUDAN_SERVICES = 'خدمات السودان',
  BUSINESS_COMPANIES = 'الشركات والأعمال',
  VAT_SERVICES = 'خدمات VAT',
  TYPING_TRANSLATION = 'الطباعة والترجمة',
}

export enum TransactionStatus {
  DRAFT = 'مسودة',
  NEW = 'جديدة',
  IN_PROGRESS = 'قيد التنفيذ',
  WAITING_DOCUMENTS = 'بانتظار المستندات',
  WAITING_APPROVAL = 'بانتظار الموافقة',
  PARTIALLY_COMPLETED = 'مكتملة جزئياً',
  COMPLETED = 'مكتملة',
  DEFERRED = 'مؤجلة',
  CANCELLED = 'ملغاة',
  CLOSED = 'مغلقة ومؤرشفة',
}

export enum BookingStatus {
  NEW_REQUEST = 'طلب جديد',
  CONFIRMED = 'مؤكد',
  WAITING_PAYMENT = 'بانتظار الدفع',
  PAID = 'مدفوع',
  DEFERRED = 'مؤجل',
  MODIFIED = 'معدل',
  CANCELLED = 'ملغي',
  REFUNDED = 'مسترد',
  COMPLETED = 'مكتمل',
  ISSUED = 'تم الإصدار',
  REISSUED = 'أعيد إصداره',
  UPGRADED = 'تمت الترقية',
}

export enum InvoiceStatus {
  DRAFT = 'مسودة',
  ISSUED = 'مصدرة',
  PARTIALLY_PAID = 'مدفوعة جزئياً',
  PAID = 'مدفوعة بالكامل',
  OVERDUE = 'متأخرة',
  CANCELLED = 'ملغاة',
  REFUNDED = 'مستردة',
}

export enum PaymentMethod {
  CASH = 'نقداً (الصندوق الرئيسي)',
  PETTY_CASH = 'عهدة نقدية',
  BANK_TRANSFER = 'تحويل بنكي',
  POS_CARD = 'بطاقة بنكية / جهاز POS',
  PAYMENT_GATEWAY = 'بوابة دفع إلكتروني',
  E_WALLET = 'محفظة إلكترونية',
  CHEQUE = 'شيك بنكي',
}

export enum AccountType {
  ASSET = 'أصول',
  LIABILITY = 'خصوم / التزامات',
  EQUITY = 'حقوق الملكية',
  REVENUE = 'إيرادات',
  COST_OF_SALES = 'تكلفة الخدمات المباشرة',
  OPERATING_EXPENSE = 'مصروفات تشغيلية',
}

export enum JournalStatus {
  DRAFT = 'مسودة',
  UNDER_REVIEW = 'قيد المراجعة',
  APPROVED = 'معتمد',
  POSTED = 'مرحل إلى الأستاذ العام',
  REJECTED = 'مرفوض',
  CORRECTED = 'تم تصحيحه / تسويته',
}

export enum ApprovalType {
  EXPENSE = 'مصروف مالي',
  PAYMENT = 'دفعة مورد',
  DISCOUNT = 'خصم استثنائي',
  REFUND = 'استرداد مالي',
  MANUAL_JOURNAL = 'قيد محاسبي يدوي',
  PAYROLL = 'اعتماد مسير رواتب',
  OVERTIME = 'ساعات إضافية',
  ATTENDANCE_CORRECTION = 'تصحيح حضور وانصراف',
  LEAVE_REQUEST = 'طلب إجازة',
}

export enum ApprovalStatus {
  PENDING = 'بانتظار الموافقة',
  REVIEWED = 'تمت المراجعة',
  APPROVED = 'معتمد',
  REJECTED = 'مرفوض',
  CANCELLED = 'ملغي',
}

export enum DocumentType {
  EMIRATES_ID = 'بطاقة الهوية الإماراتية',
  PASSPORT = 'جواز السفر',
  RESIDENCE_VISA = 'تأشيرة الإقامة / الزيارة',
  TRADE_LICENSE = 'الرخصة التجارية',
  LABOUR_CARD = 'بطاقة العمل',
  EMPLOYMENT_CONTRACT = 'عقد العمل',
  HEALTH_INSURANCE = 'التأمين الصحي',
  MEDICAL_EXAM = 'الفحص الطبي',
  CERTIFICATE = 'شهادات ومؤهلات',
  POWER_OF_ATTORNEY = 'وكالة قانونية',
  INVOICE_RECEIPT = 'فاتورة / إيصال',
  OTHER = 'مستند آخر',
}

export enum CommissionType {
  PERCENTAGE = 'نسبة مئوية',
  FIXED_AMOUNT = 'مبلغ ثابت',
  CUSTOM_RULE = 'قاعدة مخصصة',
}

// -------------------------------------------------------------
// Base Record Interface
// -------------------------------------------------------------
export interface BaseEntity {
  id: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  branch_id: string;
  status: string;
  audit_ref?: string;
}

// -------------------------------------------------------------
// 1. المستخدمون والصلاحيات (users_permissions)
// -------------------------------------------------------------
export interface UserPermissionRecord extends BaseEntity {
  email: string;
  full_name_ar: string;
  full_name_en: string;
  role: UserRole;
  department: Department;
  employee_id?: string;
  phone?: string;
  preferred_language?: 'ar' | 'en';
  account_status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_ACTIVATION';
  is_active: boolean;
  is_super_admin?: boolean;
  password_hash?: string;
  password_salt?: string;
  password_history?: Array<{ hash: string; salt: string; changed_at: string }>;
  must_change_password?: boolean;
  failed_login_attempts?: number;
  locked_until?: string | null;
  expiration_date?: string | null;
  can_view_cost_profit: boolean;
  can_approve: boolean;
  can_delete: boolean;
  can_export: boolean;
  can_close_month: boolean;
  can_manage_settings: boolean;
  discount_limit_aed: number;
  last_login?: string;
}

export interface AuthSessionRecord extends BaseEntity {
  session_id: string;
  user_id: string;
  user_email: string;
  user_role: UserRole;
  expires_at: string;
  last_activity_at: string;
  ip_address: string;
  user_agent?: string;
  is_active: boolean;
}

export interface AuthTokenRecord extends BaseEntity {
  user_id: string;
  user_email: string;
  token_type: 'PASSWORD_RESET' | 'ACCOUNT_ACTIVATION';
  token_hash: string;
  expires_at: string;
  is_used: boolean;
  used_at?: string;
}

export type SecurityEventAction =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET_COMPLETED'
  | 'PASSWORD_CHANGED'
  | 'USER_CREATED'
  | 'USER_ACTIVATED'
  | 'USER_DEACTIVATED'
  | 'USER_DELETED'
  | 'ROLE_CHANGED'
  | 'PERMISSION_CHANGED'
  | 'UNAUTHORIZED_USER_CREATION_ATTEMPT'
  | 'SUPER_ADMIN_SECURITY_CHANGE';

export interface SecurityAuditRecord extends BaseEntity {
  event_id: string;
  user_email: string;
  user_role: string;
  action: SecurityEventAction;
  target_user: string;
  ip_address?: string;
  session_id?: string;
  result: 'SUCCESS' | 'FAILED' | 'BLOCKED';
  reason?: string;
  error_code?: string;
  details_json?: string;
}

// -------------------------------------------------------------
// 2. الإعدادات (system_settings)
// -------------------------------------------------------------
export interface SystemSettingsRecord extends BaseEntity {
  company_name_ar: string;
  company_name_en: string;
  trade_license_number: string;
  address_al_ain: string;
  phone_primary: string;
  phone_secondary?: string;
  email_official: string;
  currency: string; // 'AED'
  timezone: string; // 'Asia/Dubai'
  is_vat_registered: boolean;
  vat_trn?: string;
  vat_rate_percentage: number; // 5% when active
  daily_revenue_target_aed: number; // e.g. 10,000 AED
  monthly_revenue_target_aed: number;
  monthly_profit_target_aed: number;
  standard_workdays_per_month: number; // 26
  weekly_holiday: string; // 'Saturday'
  google_drive_root_folder_id?: string;
  notification_email_recipients: string[];
}

// -------------------------------------------------------------
// 3. الفروع (branches)
// -------------------------------------------------------------
export interface BranchRecord extends BaseEntity {
  branch_code: string; // e.g. 'BR-001'
  branch_name_ar: string;
  branch_name_en: string;
  emirate: string; // 'Abu Dhabi - Al Ain'
  location_details: string;
  is_main_branch: boolean;
  manager_user_id: string;
  phone: string;
}

// -------------------------------------------------------------
// 4. العملاء (customers)
// -------------------------------------------------------------
export interface CustomerRecord extends BaseEntity {
  customer_code: string; // CUS-00001
  name_ar: string;
  name_en?: string;
  customer_type: CustomerType;
  emirates_id?: string; // Duplicate detection field
  passport_number?: string; // Duplicate detection field
  trade_license_no?: string; // Duplicate detection field
  phone: string; // Duplicate detection field
  email?: string; // Duplicate detection field
  address?: string;
  preferred_language: 'ar' | 'en';
  customer_source?: string;
  responsible_employee_id?: string;
  notes?: string;
  drive_folder_id?: string;
  is_vip: boolean;
  total_transactions_count: number;
  total_spent_aed: number;
  current_balance_aed: number; // Receivables owed
}

// -------------------------------------------------------------
// 5. الخدمات والأسعار (services_pricing)
// -------------------------------------------------------------
export interface ServicePricingRecord extends BaseEntity {
  service_code: string; // SRV-001
  name_ar: string;
  name_en: string;
  category: ServiceCategory;
  subcategory?: string;
  min_price_aed: number; // Validation minimum
  max_price_aed: number; // Validation maximum
  default_cost_aed: number; // Direct supplier/gov fee cost
  estimated_duration_hours: number;
  required_documents: string[];
  responsible_department: Department;
  responsible_employee_id?: string;
  commission_type: CommissionType;
  commission_value: number; // percentage or fixed AED
  discount_policy?: string;
  payment_policy?: string;
  vat_ready_flag: boolean;
  vat_applicable_percentage: number; // 0 or 5
  priority_order: number;
  is_active: boolean;
}

// -------------------------------------------------------------
// 6. المزودون (suppliers_vendors)
// -------------------------------------------------------------
export interface SupplierRecord extends BaseEntity {
  supplier_code: string; // SUP-0001
  name_ar: string;
  name_en: string;
  supplier_type: string; // 'طيران', 'فنادق', 'بوابات حكومية', 'تأمين'
  contact_person?: string;
  phone: string;
  email?: string;
  address?: string;
  tax_number?: string;
  account_id: string; // Linked Chart of Accounts ID (Accounts Payable)
  current_balance_aed: number;
  payment_terms?: string;
}

// -------------------------------------------------------------
// 7. المعاملات (transactions)
// -------------------------------------------------------------
export interface TransactionRecord extends BaseEntity {
  transaction_code: string; // TRX-2026-00001
  customer_id: string;
  customer_name_ar: string;
  customer_phone: string;
  responsible_employee_id: string;
  responsible_employee_name: string;
  department: Department;
  start_date: string;
  due_date: string;
  completion_date?: string;
  status: TransactionStatus;
  items_count: number;
  total_gross_amount_aed: number;
  total_discount_aed: number;
  total_net_amount_aed: number;
  total_cost_aed: number; // Hidden from Operations role
  total_profit_aed: number; // Hidden from Operations role
  profit_margin_pct: number;
  collected_amount_aed: number;
  remaining_balance_aed: number;
  invoice_id?: string;
  notes?: string;
  drive_folder_id?: string;
}

// -------------------------------------------------------------
// 8. تفاصيل المعاملات (transaction_details)
// -------------------------------------------------------------
export interface TransactionDetailRecord extends BaseEntity {
  transaction_id: string; // Foreign key
  service_id: string;
  service_name_ar: string;
  service_category: ServiceCategory;
  quantity: number;
  min_price_aed: number;
  max_price_aed: number;
  selling_price_aed: number; // Entered by user, validated within min/max
  gross_amount_aed: number; // price * quantity
  discount_aed: number;
  net_selling_amount_aed: number; // gross - discount
  default_cost_aed: number;
  actual_cost_aed: number; // Editable by supervisor only
  profit_aed: number; // net_selling - actual_cost
  profit_margin_pct: number;
  commission_aed: number;
  responsible_employee_id: string;
  status: TransactionStatus;
  notes?: string;
}

// -------------------------------------------------------------
// 9. الحجوزات (bookings)
// -------------------------------------------------------------
export interface BookingRecord extends BaseEntity {
  booking_code: string; // BKG-2026-00001
  booking_type: 'طيران' | 'فندق' | 'جولة سياحية' | 'باقة شاملة' | 'تأمين سفر' | 'عمرة وسياحة سعودية' | 'سياحة عمان' | 'أخرى';
  customer_id: string;
  customer_name_ar: string;
  supplier_id?: string;
  supplier_name?: string;
  booking_reference_pnr?: string;
  passenger_details: Array<{
    name_en: string;
    passport_number: string;
    nationality: string;
    dob?: string;
  }>;
  travel_date_departure: string;
  travel_date_return?: string;
  destination: string;
  selling_price_aed: number;
  supplier_cost_aed: number;
  profit_aed: number;
  commission_aed: number;
  cancellation_fee_aed: number;
  status: BookingStatus;
  responsible_employee_id: string;
  notes?: string;
  drive_folder_id?: string;
}

// -------------------------------------------------------------
// 10. الفواتير (invoices) & 11. تفاصيل الفواتير
// -------------------------------------------------------------
export interface InvoiceRecord extends BaseEntity {
  invoice_code: string; // INV-2026-00001
  transaction_id: string;
  customer_id: string;
  customer_name_ar: string;
  issue_date: string;
  due_date: string;
  subtotal_aed: number;
  discount_aed: number;
  vat_amount_aed: number; // 0 AED unless VAT active
  total_amount_aed: number;
  paid_amount_aed: number;
  balance_due_aed: number;
  status: InvoiceStatus;
  pdf_drive_url?: string;
  notes?: string;
}

export interface InvoiceDetailRecord extends BaseEntity {
  invoice_id: string;
  service_id: string;
  description_ar: string;
  quantity: number;
  unit_price_aed: number;
  discount_aed: number;
  tax_rate_pct: number;
  tax_amount_aed: number;
  total_line_amount_aed: number;
}

// -------------------------------------------------------------
// 12. التحصيلات (collections_receipts) & 13. توزيع الدفعات
// -------------------------------------------------------------
export interface ReceiptRecord extends BaseEntity {
  receipt_code: string; // REC-2026-00001
  customer_id: string;
  customer_name_ar: string;
  transaction_id?: string;
  invoice_id?: string;
  receipt_date: string;
  amount_aed: number;
  payment_method: PaymentMethod;
  bank_account_id: string;
  reference_or_cheque_no?: string;
  received_by_employee_id: string;
  status: 'معتمد' | 'ملغي' | 'مسترد';
  pdf_drive_url?: string;
  notes?: string;
}

export interface PaymentAllocationRecord extends BaseEntity {
  receipt_id: string;
  transaction_id: string;
  transaction_detail_id?: string; // specific service line or proportional
  allocated_amount_aed: number;
  allocation_method: 'تناسبي تلقائي' | 'يدوي لخدمة محددة';
}

// -------------------------------------------------------------
// 14. المصروفات (expenses) & 15. المدفوعات (disbursements)
// -------------------------------------------------------------
export interface ExpenseRecord extends BaseEntity {
  expense_code: string; // EXP-2026-00001
  category: 'إيجار' | 'رواتب' | 'فواتير ومرافق' | 'قرطاسية ومطبوعات' | 'رسوم حكومية وترخيص' | 'صيانة وبرمجيات' | 'ضيافة ونظافة' | 'أخرى';
  account_id: string; // Linked Chart of Accounts (Operating Expense)
  amount_aed: number;
  expense_date: string;
  payment_method: PaymentMethod;
  paid_from_account_id: string; // Cash or Bank Account ID
  paid_to_payee: string;
  beneficiary_details?: string;
  receipt_document_id?: string;
  status: ApprovalStatus;
  approved_by?: string;
  approval_date?: string;
  notes?: string;
}

export interface DisbursementRecord extends BaseEntity {
  disbursement_code: string; // DIS-2026-00001
  supplier_id: string;
  supplier_name: string;
  amount_aed: number;
  disbursement_date: string;
  payment_method: PaymentMethod;
  paid_from_account_id: string;
  status: ApprovalStatus;
  approved_by?: string;
  notes?: string;
}

// -------------------------------------------------------------
// 16. دليل الحسابات (chart_of_accounts)
// -------------------------------------------------------------
export interface AccountRecord extends BaseEntity {
  account_code: string; // e.g. 1010, 1020, 2010, 4010, 5010
  account_name_ar: string;
  account_name_en: string;
  account_type: AccountType;
  parent_account_code?: string;
  is_leaf: boolean;
  is_system_protected: boolean; // cannot be deleted
  current_balance_aed: number;
  opening_balance_aed: number;
  description?: string;
}

// -------------------------------------------------------------
// 17. القيود المحاسبية (journal_entries) & 18. تفاصيل القيود
// -------------------------------------------------------------
export interface JournalEntryRecord extends BaseEntity {
  journal_code: string; // JRN-2026-00001
  entry_date: string;
  entry_type: 'آلي من فاتورة' | 'آلي من تحصيل' | 'آلي من مصروف' | 'آلي من رواتب' | 'قيد يدوي' | 'قيد تسوية / عكسي';
  reference_type?: 'INVOICE' | 'RECEIPT' | 'EXPENSE' | 'PAYROLL' | 'REFUND' | 'MANUAL';
  reference_id?: string;
  total_debit_aed: number;
  total_credit_aed: number;
  is_balanced: boolean; // MUST BE true (debit == credit)
  status: JournalStatus;
  posted_by?: string;
  posted_at?: string;
  reversed_by_journal_id?: string;
  notes?: string;
}

export interface JournalDetailRecord extends BaseEntity {
  journal_id: string;
  account_id: string;
  account_code: string;
  account_name_ar: string;
  debit_aed: number;
  credit_aed: number;
  line_description_ar?: string;
}

// -------------------------------------------------------------
// 19. الحسابات النقدية والبنكية (cash_bank_accounts) & 20. التسويات
// -------------------------------------------------------------
export interface CashBankAccountRecord extends BaseEntity {
  account_code: string; // CBA-001
  name_ar: string;
  name_en: string;
  account_type: 'صندوق نقدي' | 'حساب بنكي' | 'جهاز POS' | 'بوابة دفع';
  bank_name?: string; // e.g. ADCB, FAB, Dubai Islamic
  iban_or_account_number?: string;
  linked_gl_account_id: string;
  current_balance_aed: number;
  is_active: boolean;
}

export interface BankReconciliationRecord extends BaseEntity {
  reconciliation_code: string; // REC-BNK-2026-001
  bank_account_id: string;
  statement_start_date: string;
  statement_end_date: string;
  statement_ending_balance_aed: number;
  book_ending_balance_aed: number;
  difference_aed: number;
  matched_count: number;
  unmatched_count: number;
  status: 'مسودة' | 'معتمد ومطابق' | 'معلق لوجود فروقات';
  approved_by_accounts?: string;
}

// -------------------------------------------------------------
// 21. الموظفون (employees)
// -------------------------------------------------------------
export interface EmployeeRecord extends BaseEntity {
  employee_code: string; // EMP-00001
  full_name_ar: string;
  full_name_en: string;
  email: string;
  phone: string;
  role: UserRole;
  department: Department;
  job_title_ar: string;
  national_id_or_emirates_id: string;
  passport_number: string;
  join_date: string;
  contract_type: 'دوام كامل' | 'دوام جزئي' | 'فترة تجربة';
  basic_salary_aed: number;
  housing_allowance_aed: number;
  transport_allowance_aed: number;
  other_allowance_aed: number;
  commission_target_aed: number;
  work_schedule_type: 'فترة واحدة (08:00 - 17:00)' | 'فترتان صباحية ومسائية (08:00 - 14:00 و 18:00 - 22:00)' | 'مخصص';
  drive_folder_id?: string;
  is_active: boolean;
}

// -------------------------------------------------------------
// 22. الحضور والانصراف (attendance_logs)
// -------------------------------------------------------------
export interface AttendanceRecord extends BaseEntity {
  employee_id: string;
  employee_name_ar: string;
  date: string;
  shift_1_in?: string;
  shift_1_out?: string;
  shift_2_in?: string;
  shift_2_out?: string;
  total_worked_hours: number;
  late_minutes: number;
  early_leave_minutes: number;
  overtime_hours: number;
  status: 'حاضر' | 'متأخر' | 'غائب' | 'إجازة' | 'عطلة رسمية';
  is_corrected: boolean;
  correction_reason?: string;
  approved_by?: string;
}

// -------------------------------------------------------------
// 23. الإجازات (leaves)
// -------------------------------------------------------------
export interface LeaveRecord extends BaseEntity {
  leave_code: string; // LEA-2026-001
  employee_id: string;
  employee_name_ar: string;
  leave_type: 'سنوية' | 'مرضية' | 'طارئة' | 'بدون راتب' | 'أخرى';
  start_date: string;
  end_date: string;
  days_count: number;
  is_paid: boolean;
  reason?: string;
  status: ApprovalStatus;
  approved_by?: string;
}

// -------------------------------------------------------------
// 24. الرواتب (payroll) & 25. العمولات (commissions)
// -------------------------------------------------------------
export interface PayrollRecord extends BaseEntity {
  payroll_code: string; // PAY-2026-01-EMP001
  month_year: string; // '2026-08'
  employee_id: string;
  employee_name_ar: string;
  standard_days: number; // 26 days standard UAE
  actual_worked_days: number;
  basic_salary_aed: number;
  allowances_aed: number;
  approved_commissions_aed: number;
  approved_overtime_aed: number;
  deductions_aed: number;
  loan_deductions_aed: number;
  net_salary_aed: number; // basic + allowances + comm + ot - ded - loans
  status: 'مسودة' | 'مراجعة HR' | 'مراجعة الحسابات' | 'معتمد ومقفل' | 'مدفوع';
  paid_date?: string;
  journal_id?: string;
}

export interface CommissionRecord extends BaseEntity {
  commission_code: string; // COM-2026-0001
  employee_id: string;
  employee_name_ar: string;
  transaction_id: string;
  service_id: string;
  transaction_amount_aed: number;
  commission_rate_or_val: number;
  calculated_commission_aed: number;
  is_fully_collected: boolean; // Commission payable upon full collection
  status: 'مستحقة' | 'معتمدة' | 'مصروفة مع الراتب' | 'ملغاة';
  payroll_id?: string;
}

// -------------------------------------------------------------
// 26. أداء الموظفين (employee_performance)
// -------------------------------------------------------------
export interface PerformanceRecord extends BaseEntity {
  employee_id: string;
  month_year: string;
  monthly_revenue_target_aed: number;
  achieved_revenue_aed: number;
  transactions_completed_count: number;
  customer_satisfaction_score: number; // 1-5
  target_achievement_pct: number;
}

// -------------------------------------------------------------
// 27. المستندات (documents)
// -------------------------------------------------------------
export interface DocumentRecord extends BaseEntity {
  doc_code: string; // DOC-00001
  title_ar: string;
  document_type: DocumentType;
  file_name: string;
  file_type: string; // pdf, jpg, png, docx
  file_size_bytes: number;
  drive_file_id?: string;
  drive_url?: string;
  issue_date?: string;
  expiry_date?: string; // Track for 60, 30, 7, 0 days alert
  days_until_expiry?: number;
  related_customer_id?: string;
  related_transaction_id?: string;
  related_employee_id?: string;
  is_expired: boolean;
  notes?: string;
}

// -------------------------------------------------------------
// 28. المهام (tasks) & 29. الموافقات (approvals)
// -------------------------------------------------------------
export interface TaskRecord extends BaseEntity {
  task_code: string; // TSK-0001
  title_ar: string;
  description_ar?: string;
  assigned_to_employee_id: string;
  assigned_to_name: string;
  due_date: string;
  priority: 'منخفضة' | 'متوسطة' | 'عالية' | 'عاجلة جداً';
  status: 'جديدة' | 'قيد التنفيذ' | 'مكتملة' | 'ملغاة';
  related_transaction_id?: string;
}

export interface ApprovalRecord extends BaseEntity {
  approval_code: string; // APP-0001
  approval_type: ApprovalType;
  reference_id: string; // e.g. EXP-001, LEA-001, TRX-001
  requester_employee_id: string;
  requester_name: string;
  amount_aed?: number;
  reason_ar: string;
  current_approver_role: UserRole;
  status: ApprovalStatus;
  action_by_user_id?: string;
  action_timestamp?: string;
  action_comments?: string;
}

// -------------------------------------------------------------
// 30. العطلات والمناسبات (holidays_events)
// -------------------------------------------------------------
export interface HolidayRecord extends BaseEntity {
  holiday_name_ar: string;
  holiday_name_en: string;
  start_date: string;
  end_date: string;
  days_count: number;
  is_paid: boolean;
  year: number;
}

// -------------------------------------------------------------
// 31. العملاء المحتملون (crm_leads) & 32. المتابعات (crm_followups)
// -------------------------------------------------------------
export interface LeadRecord extends BaseEntity {
  lead_code: string; // LED-0001
  customer_name: string;
  phone: string;
  email?: string;
  lead_source: 'زيارة مباشرة' | 'اتصال هاتفي' | 'واتساب' | 'توصية عميل' | 'موقع إلكتروني' | 'أخرى';
  interested_service_category: ServiceCategory;
  estimated_value_aed: number;
  stage: 'استفسار جديد' | 'عميل محتمل' | 'متابعة' | 'عرض سعر' | 'تحول إلى معاملة ناجحة' | 'ملغي / مفقود';
  responsible_employee_id: string;
  next_followup_date?: string;
  converted_customer_id?: string;
}

export interface FollowupRecord extends BaseEntity {
  lead_id: string;
  followup_date: string;
  contact_method: 'اتصال' | 'واتساب' | 'زيارة' | 'بريد إلكتروني';
  summary_ar: string;
  next_action_ar?: string;
  next_action_date?: string;
  employee_id: string;
}

// -------------------------------------------------------------
// 33. سجل الإشعارات (notification_logs)
// -------------------------------------------------------------
export interface NotificationLogRecord extends BaseEntity {
  notification_type: 'تنبيه انتهاء مستند' | 'طلب موافقة' | 'تأكيد حجز' | 'إشعار تحصيل' | 'إغلاق شهري' | 'نظام';
  recipient_email: string;
  recipient_phone?: string;
  recipient_name: string;
  subject_ar: string;
  body_text: string;
  delivery_status: 'تم الإرسال بنجاح' | 'فشل الإرسال' | 'معلق';
  error_message?: string;
  related_document_id?: string;
}

// -------------------------------------------------------------
// 34. سجل التعديلات (audit_logs)
// -------------------------------------------------------------
export interface AuditLogRecord extends BaseEntity {
  user_email: string;
  user_name_ar: string;
  action_type: 'إنشاء' | 'تعديل' | 'حذف' | 'اعتماد' | 'ترحيل' | 'إلغاء' | 'إغلاق شهري' | 'استعادة نسخة احتياطية';
  module_name: string;
  record_id: string;
  table_name: string;
  old_values_json?: string;
  new_values_json?: string;
  change_summary_ar: string;
  ip_address?: string;
}

// -------------------------------------------------------------
// 35. الأرشيف (archive_records) & 36. النسخ الاحتياطية (system_backups)
// -------------------------------------------------------------
export interface ArchiveRecord extends BaseEntity {
  archive_code: string; // ARC-2026-08
  period_month_year: string;
  archived_at: string;
  archived_by: string;
  transactions_count: number;
  total_revenue_aed: number;
  total_cost_aed: number;
  total_profit_aed: number;
  is_locked: boolean;
  reopened_by?: string;
  reopening_reason?: string;
}

export interface BackupRecord extends BaseEntity {
  backup_code: string; // BKP-2026-08-15-001
  backup_type: 'تلقائي يومي' | 'إغلاق شهري' | 'يدوي';
  created_at: string;
  created_by: string;
  records_count: number;
  file_size_kb: number;
  is_permanent_protected: boolean;
  description?: string;
  backup_data_json: string;
}

// -------------------------------------------------------------
// 37. دليل الاستخدام والتدريب (training_modules)
// -------------------------------------------------------------
export interface TrainingModuleRecord extends BaseEntity {
  module_code: string; // TRN-001
  title_ar: string;
  category: 'النظام العام' | 'المعاملات والطباعة' | 'المحاسبة والمالية' | 'السياحة والحجوزات' | 'الموارد البشرية' | 'المستندات والأمان';
  target_roles: UserRole[];
  content_markdown: string;
  estimated_minutes: number;
  quiz_questions?: Array<{
    question_ar: string;
    options_ar: string[];
    correct_option_index: number;
    explanation_ar: string;
  }>;
}

// -------------------------------------------------------------
// 38. إدارة قوالب المستندات (document_templates)
// -------------------------------------------------------------
export type DocumentTemplateType =
  | 'TRANSACTION_RECEIPT'
  | 'INVOICE'
  | 'QUOTATION'
  | 'BOOKING_CONFIRMATION'
  | 'PAYMENT_RECEIPT'
  | 'CUSTOMER_STATEMENT'
  | 'CUSTOM';

export interface DocumentTemplateRecord extends BaseEntity {
  template_code: string; // TPL-TRX-001
  document_type: DocumentTemplateType;
  name_ar: string;
  name_en?: string;
  version: number;
  is_active: boolean;
  title_ar: string;
  title_en: string;
  header_text_ar: string;
  header_text_en: string;
  subheader_text_ar?: string;
  subheader_text_en?: string;
  footer_text_ar: string;
  footer_text_en: string;
  disclaimer_ar: string;
  disclaimer_en: string;
  terms_conditions_ar: string;
  terms_conditions_en: string;
  customer_instructions_ar?: string;
  customer_instructions_en?: string;
  company_name_ar: string;
  company_name_en: string;
  company_address_ar: string;
  company_address_en: string;
  phone_primary: string;
  phone_secondary?: string;
  email_official: string;
  show_logo: boolean;
  logo_url?: string;
  show_qr: boolean;
  qr_label_ar: string;
  qr_label_en: string;
  updated_by_name?: string;
  last_restored_from_version?: number;
}

// -------------------------------------------------------------
// 39. أرشيف إصدارات القوالب (document_template_versions)
// -------------------------------------------------------------
export interface DocumentTemplateVersionRecord extends BaseEntity {
  template_id: string;
  document_type: DocumentTemplateType;
  version_number: number;
  snapshot_json: string;
  change_summary_ar: string;
  created_by_name: string;
}

// -------------------------------------------------------------
// 40. رموز التحقق الإلكتروني للإيصالات (receipt_verification_tokens)
// -------------------------------------------------------------
export type VerificationTokenStatus = 'VALID' | 'REVOKED' | 'EXPIRED' | 'NOT_FOUND';

export interface ReceiptVerificationTokenRecord extends BaseEntity {
  token: string; // Cryptographically secure token
  receipt_number: string;
  transaction_id: string;
  customer_id: string;
  customer_name_masked: string; // Privacy safe masked name (e.g., م*** ح***)
  service_summary: string;
  total_amount_aed: number;
  paid_amount_aed: number;
  remaining_amount_aed: number;
  is_amount_masked: boolean;
  status: VerificationTokenStatus;
  generated_at: string;
  expires_at?: string;
  revoked_at?: string;
  revoked_by?: string;
  revocation_reason?: string;
  qr_code_data_url?: string;
  verification_count: number;
  last_verified_at?: string;
}

// -------------------------------------------------------------
// 41. سجل عمليات التحقق (receipt_verification_logs)
// -------------------------------------------------------------
export interface ReceiptVerificationLogRecord extends BaseEntity {
  token: string;
  receipt_number: string;
  verified_at: string;
  ip_address: string;
  user_agent?: string;
  verification_status: VerificationTokenStatus;
  referrer?: string;
}

