import {
  UserPermissionRecord,
  SystemSettingsRecord,
  BranchRecord,
  AccountRecord,
  ServicePricingRecord,
  CashBankAccountRecord,
  HolidayRecord,
  TrainingModuleRecord,
  UserRole,
  Department,
  ServiceCategory,
  AccountType,
  CommissionType,
} from '../types/schema';

export interface DatabaseState {
  users_permissions: UserPermissionRecord[];
  system_settings: SystemSettingsRecord[];
  branches: BranchRecord[];
  customers: any[];
  services_pricing: ServicePricingRecord[];
  suppliers_vendors: any[];
  transactions: any[];
  transaction_details: any[];
  bookings: any[];
  invoices: any[];
  invoice_details: any[];
  collections_receipts: any[];
  payment_allocations: any[];
  expenses: any[];
  disbursements: any[];
  chart_of_accounts: AccountRecord[];
  journal_entries: any[];
  journal_entry_lines: any[];
  cash_bank_accounts: CashBankAccountRecord[];
  bank_reconciliations: any[];
  employees: any[];
  attendance_logs: any[];
  leaves: any[];
  payroll: any[];
  commissions: any[];
  employee_performance: any[];
  documents: any[];
  tasks: any[];
  approvals: any[];
  holidays_events: HolidayRecord[];
  crm_leads: any[];
  crm_followups: any[];
  notification_logs: any[];
  audit_logs: any[];
  archive_records: any[];
  system_backups: any[];
  training_modules: TrainingModuleRecord[];
  document_templates: any[];
  document_template_versions: any[];
  receipt_verification_tokens: any[];
  receipt_verification_logs: any[];
  auth_sessions: any[];
  auth_tokens: any[];
  security_audit_logs: any[];
}

export function getDefaultDocumentTemplates(now: string = new Date().toISOString()): any[] {
  return [
    {
      id: 'TPL-001',
      created_at: now,
      created_by: 'USR-001',
      updated_at: now,
      updated_by: 'USR-001',
      branch_id: 'BR-001',
      status: 'نشط',
      template_code: 'TPL-TRX-001',
      document_type: 'TRANSACTION_RECEIPT',
      name_ar: 'قالب إيصال المعاملة الضريبي الرسمي',
      name_en: 'Official Tax Transaction Receipt Template',
      version: 1,
      is_active: true,
      title_ar: 'إيصال استلام واستحقاق ضريبي',
      title_en: 'TAX RECEIPT VOUCHER',
      header_text_ar: 'خدمات جلف ساند للطباعة والترجمة القانونية',
      header_text_en: 'GULFSAND TYPING & TRANSLATION SERVICES',
      subheader_text_ar: 'رخصة تجارية: CN-1294821 | الرقم الضريبي (TRN): 100482910400003 | العين، أبوظبي',
      subheader_text_en: 'Trade License: CN-1294821 | TRN: 100482910400003 | Al Ain, UAE',
      footer_text_ar: 'تم إصدار هذا المستند إلكترونياً عبر منظومة جلف ساند السحابية ERP ومحمي برمز التحقق المشفر.',
      footer_text_en: 'Electronically generated via Gulfsand ERP Cloud. Authenticity verified via secure QR token.',
      disclaimer_ar: 'الرسوم الحكومية غير قابلة للاسترداد نهائياً بعد إرسال الطلب واعتماده لدى البوابات الاتحادية والمحلية.',
      disclaimer_en: 'Government fees are strictly non-refundable once processed through federal/local portals.',
      terms_conditions_ar: '1. يرجى التأكد التام من مطابقة الأسماء وأرقام الجوازات والهوية الإماراتية المطبوعة.\n2. يعتبر هذا الإيصال وثيقة استلام رسمية ومطالبة مالية معتمدة.\n3. يرجى إبراز هذا الإيصال عند استلام المعاملات أو الاستفسار عن المتابعة.',
      terms_conditions_en: '1. Please review typed names, passport numbers and Emirates IDs before departure.\n2. This receipt is an official tax voucher and proof of payment.\n3. Retain this receipt for tracking and official document collection.',
      customer_instructions_ar: 'امسح رمز الاستجابة السريعة (QR) بكاميرا هاتفك للتحقق المباشر من صحة الإيصال وموثوقيته.',
      customer_instructions_en: 'Scan the QR code with your phone camera to verify receipt authenticity.',
      company_name_ar: 'خدمات جلف ساند للطباعة والترجمة',
      company_name_en: 'Gulfsand Typing & Translation Services',
      company_address_ar: 'منطقة المويجعي، شارع خليفة بن زايد، العين، أبوظبي، الإمارات العربية المتحدة',
      company_address_en: 'Al Muwaiji, Khalifa Bin Zayed St, Al Ain, Abu Dhabi, UAE',
      phone_primary: '+971 3 721 8899',
      phone_secondary: '+971 50 776 5432',
      email_official: 'support@gulfsandtyping.ae',
      show_logo: true,
      show_qr: true,
      qr_label_ar: 'امسح الرمز للتحقق من صحة الإيصال',
      qr_label_en: 'Scan to verify receipt authenticity',
      updated_by_name: 'بشار الحاج (المدير العام)',
    },
    {
      id: 'TPL-002',
      created_at: now,
      created_by: 'USR-001',
      updated_at: now,
      updated_by: 'USR-001',
      branch_id: 'BR-001',
      status: 'نشط',
      template_code: 'TPL-INV-001',
      document_type: 'INVOICE',
      name_ar: 'قالب الفاتورة الضريبية المعتمدة',
      name_en: 'Official Tax Invoice Template',
      version: 1,
      is_active: true,
      title_ar: 'فاتورة ضريبية رسمية',
      title_en: 'TAX INVOICE',
      header_text_ar: 'خدمات جلف ساند للطباعة والمعاملات',
      header_text_en: 'GULFSAND TYPING & BUSINESS SERVICES',
      subheader_text_ar: 'العين - أبوظبي | هاتف: 037218899 | info@gulfsandtyping.ae',
      subheader_text_en: 'Al Ain - Abu Dhabi | Tel: +971 3 721 8899',
      footer_text_ar: 'شكراً لتعاملكم مع جلف ساند - نسعد دائماً بخدمتكم في إنجاز كافة معاملاتكم الحكومية والتجارية.',
      footer_text_en: 'Thank you for choosing Gulf Sand Typing Services.',
      disclaimer_ar: 'تخضع هذه الفاتورة للقوانين الاتحادية لضريبة القيمة المضافة في دولة الإمارات العربية المتحدة.',
      disclaimer_en: 'Subject to UAE Federal Tax Authority rules and regulations.',
      terms_conditions_ar: 'تستحق هذه الفاتورة خلال 14 يوماً من تاريخ الإصدار للشركات ذات التسهيلات المعتمدة.',
      terms_conditions_en: 'Payment due within agreed term of 14 days.',
      customer_instructions_ar: 'يمكن سداد قيمة الفاتورة نقداً بالفرع أو عبر التحويل البنكي لحساب المنشأة المعتمد.',
      customer_instructions_en: 'Payment can be made via Cash or Direct Bank Transfer.',
      company_name_ar: 'خدمات جلف ساند للطباعة والترجمة',
      company_name_en: 'Gulfsand Typing Services',
      company_address_ar: 'شارع خليفة بن زايد، المويجعي، العين',
      company_address_en: 'Khalifa Bin Zayed St, Al Ain, UAE',
      phone_primary: '+971 3 721 8899',
      email_official: 'billing@gulfsandtyping.ae',
      show_logo: true,
      show_qr: true,
      qr_label_ar: 'امسح الرمز للتحقق من الفاتورة',
      qr_label_en: 'Scan to verify tax invoice',
      updated_by_name: 'بشار الحاج (المدير العام)',
    },
    {
      id: 'TPL-003',
      created_at: now,
      created_by: 'USR-001',
      updated_at: now,
      updated_by: 'USR-001',
      branch_id: 'BR-001',
      status: 'نشط',
      template_code: 'TPL-QUO-001',
      document_type: 'QUOTATION',
      name_ar: 'قالب عرض أسعار الخدمات',
      name_en: 'Official Quotation Template',
      version: 1,
      is_active: true,
      title_ar: 'عرض أسعار خدمات ومعاملات',
      title_en: 'PRICE QUOTATION',
      header_text_ar: 'خدمات جلف ساند للطباعة والترجمة وتأسيس الشركات',
      header_text_en: 'GULFSAND TYPING & CORPORATE SERVICES',
      subheader_text_ar: 'العين - أبوظبي | مركز متكامل لكافة المعاملات الحكومية ورخص الأعمال',
      subheader_text_en: 'Al Ain - Abu Dhabi | Integrated Corporate & Typing Center',
      footer_text_ar: 'يسرنا تقديم أفضل الخدمات مع الالتزام بأعلى معايير السرعة والدقة والسرية.',
      footer_text_en: 'We are committed to delivering fast, accurate and confidential typing solutions.',
      disclaimer_ar: 'الأسعار التقديرية قابلة للتعديل في حال تغير الرسوم الحكومية الرسمية من قبل الهيئات المختصة.',
      disclaimer_en: 'Government fees are subject to regulatory updates by official entities.',
      terms_conditions_ar: '1. هذا العرض سارٍ لمدة 15 يوماً من تاريخ إصداره.\n2. الأسعار تشمل رسوم الطباعة والاستشارات الإجرائية.',
      terms_conditions_en: '1. Quotation valid for 15 days from issuance.\n2. Includes processing and consultation fees.',
      customer_instructions_ar: 'للموافقة على عرض الأسعار، يرجى التوقيع وإعادة إرسال النسخة عبر الواتساب أو البريد الإلكتروني.',
      customer_instructions_en: 'To accept, please sign and return via WhatsApp or email.',
      company_name_ar: 'خدمات جلف ساند للطباعة',
      company_name_en: 'Gulfsand Typing & Translation',
      company_address_ar: 'المويجعي، العين، أبوظبي',
      company_address_en: 'Al Muwaiji, Al Ain, Abu Dhabi',
      phone_primary: '+971 3 721 8899',
      email_official: 'quotes@gulfsandtyping.ae',
      show_logo: true,
      show_qr: false,
      qr_label_ar: 'امسح للتحقق من العرض',
      qr_label_en: 'Scan to verify quotation',
      updated_by_name: 'بشار الحاج (المدير العام)',
    },
    {
      id: 'TPL-004',
      created_at: now,
      created_by: 'USR-001',
      updated_at: now,
      updated_by: 'USR-001',
      branch_id: 'BR-001',
      status: 'نشط',
      template_code: 'TPL-BKG-001',
      document_type: 'BOOKING_CONFIRMATION',
      name_ar: 'قالب بطاقة تأكيد حجز الموعد',
      name_en: 'Appointment Booking Pass Template',
      version: 1,
      is_active: true,
      title_ar: 'بطاقة تأكيد حجز موعد ومراجعة',
      title_en: 'APPOINTMENT BOOKING PASS',
      header_text_ar: 'مركز جلف ساند لخدمات المراجعين والمعاملات',
      header_text_en: 'GULFSAND CUSTOMER SERVICE & TYPING CENTER',
      subheader_text_ar: 'نظام حجز المواعيد المسبق وتسهيل المعاملات | العين - أبوظبي',
      subheader_text_en: 'Al Ain Customer Service Center | Appointment Voucher',
      footer_text_ar: 'شكراً لاختياركم مركز جلف ساند. نتمنى لكم تجربة خدمة مريحة وسلسة.',
      footer_text_en: 'Thank you for choosing Gulfsand. Please arrive on time.',
      disclaimer_ar: 'في حال التأخر عن الموعد المحدد لأكثر من 15 دقيقة، قد يتم إعادة جدولة الموعد حسب المتاح.',
      disclaimer_en: 'Arrivals delayed over 15 minutes may be rescheduled.',
      terms_conditions_ar: '1. يرجى الحضور قبل الموعد بـ 10 دقائق.\n2. إحضار أصل الهوية الإماراتية وجواز السفر والمستندات المطلوبة.\n3. إبراز رمز الحجز لموظف الاستقبال عند الوصول.',
      terms_conditions_en: '1. Please arrive 10 minutes early.\n2. Bring Emirates ID and original passports.\n3. Present booking barcode to reception.',
      customer_instructions_ar: 'توجه إلى مكتب الاستقبال وقدم هذا المستند للحصول على تذكرة الدور المباشرة.',
      customer_instructions_en: 'Present this pass at reception for instant counter assignment.',
      company_name_ar: 'مركز جلف ساند للطباعة',
      company_name_en: 'Gulfsand Typing Center',
      company_address_ar: 'شارع خليفة بن زايد، العين',
      company_address_en: 'Khalifa Bin Zayed St, Al Ain',
      phone_primary: '+971 3 721 8899',
      email_official: 'reception@gulfsandtyping.ae',
      show_logo: true,
      show_qr: true,
      qr_label_ar: 'امسح الرمز للتحقق من صحة الموعد',
      qr_label_en: 'Scan to verify booking pass',
      updated_by_name: 'بشار الحاج (المدير العام)',
    },
    {
      id: 'TPL-005',
      created_at: now,
      created_by: 'USR-001',
      updated_at: now,
      updated_by: 'USR-001',
      branch_id: 'BR-001',
      status: 'نشط',
      template_code: 'TPL-PAY-001',
      document_type: 'PAYMENT_RECEIPT',
      name_ar: 'قالب سند القبض والتحصيل المالي',
      name_en: 'Official Payment Receipt Template',
      version: 1,
      is_active: true,
      title_ar: 'سند قبض وتحصيل مالي معتمد',
      title_en: 'OFFICIAL PAYMENT RECEIPT',
      header_text_ar: 'خدمات جلف ساند للطباعة والترجمة - قسم المحاسبة',
      header_text_en: 'GULFSAND TYPING - FINANCE & CASH DESK',
      subheader_text_ar: 'العين - أبوظبي | الصندوق الرئيسي والتحصيل المالي',
      subheader_text_en: 'Al Ain Main Cashier & Finance Department',
      footer_text_ar: 'سند قبض رسمي معتمد صادر من النظام المحاسبي لجلف ساند.',
      footer_text_en: 'Official verified receipt issued by Gulfsand Accounting ERP.',
      disclaimer_ar: 'لا يعتمد هذا السند في حال وجود أي شطب أو تعديل يدوي.',
      disclaimer_en: 'Void if altered or overwritten manually.',
      terms_conditions_ar: 'المبلغ المذكور تم قيده في الحساب المالي للعميل ويعتبر إبراء ذمة بالمبلغ المحدد فقط.',
      terms_conditions_en: 'Payment successfully credited to client ledger account.',
      customer_instructions_ar: 'يرجى الاحتفاظ بسند القبض للمطابقة المحاسبية.',
      customer_instructions_en: 'Please keep this receipt for financial reconciliation.',
      company_name_ar: 'خدمات جلف ساند للطباعة',
      company_name_en: 'Gulfsand Typing Services',
      company_address_ar: 'العين، أبوظبي',
      company_address_en: 'Al Ain, Abu Dhabi',
      phone_primary: '+971 3 721 8899',
      email_official: 'accounts@gulfsandtyping.ae',
      show_logo: true,
      show_qr: true,
      qr_label_ar: 'امسح للتحقق من سند القبض',
      qr_label_en: 'Scan to verify payment receipt',
      updated_by_name: 'بشار الحاج (المدير العام)',
    },
    {
      id: 'TPL-006',
      created_at: now,
      created_by: 'USR-001',
      updated_at: now,
      updated_by: 'USR-001',
      branch_id: 'BR-001',
      status: 'نشط',
      template_code: 'TPL-STM-001',
      document_type: 'CUSTOMER_STATEMENT',
      name_ar: 'قالب كشف حساب العميل والتعاملات',
      name_en: 'Customer Statement & Dossier Template',
      version: 1,
      is_active: true,
      title_ar: 'كشف حساب وتعاملات العميل المعتمد',
      title_en: 'OFFICIAL CLIENT DOSSIER & STATEMENT',
      header_text_ar: 'خدمات جلف ساند للطباعة والترجمة القانونية',
      header_text_en: 'GULFSAND TYPING & TRANSLATION SERVICES',
      subheader_text_ar: 'ملف العميل الموحد وسجل المعاملات والذمم المالية | العين، أبوظبي',
      subheader_text_en: 'Consolidated Client Dossier & Statement of Account | Al Ain, UAE',
      footer_text_ar: 'كشف حساب إلكتروني رسمي مطابق لقيود الأستاذ العام في نظام جلف ساند ERP.',
      footer_text_en: 'Official client statement matching General Ledger records.',
      disclaimer_ar: 'يعتبر هذا الكشف نهائياً ومطابقاً ما لم يرد اعتراض خطي خلال 7 أيام عمل من تاريخ استلامه.',
      disclaimer_en: 'Deemed accurate unless written objection received within 7 business days.',
      terms_conditions_ar: '1. يوضح الكشف كافة المعاملات المنجزة والمبالغ المسددة والمتبقية.\n2. الذمم المستحقة واجبة السداد حسب الشروط الائتمانية.',
      terms_conditions_en: '1. Shows all completed services, paid amounts and balance due.\n2. Balances payable per credit agreement.',
      customer_instructions_ar: 'لسداد الرصيد المتبقي أو الاستفسار عن بند، يرجى التواصل مع إدارة المحاسبة.',
      customer_instructions_en: 'For balance settlement or inquiries, contact Accounts.',
      company_name_ar: 'خدمات جلف ساند للطباعة والترجمة',
      company_name_en: 'Gulfsand Typing & Translation',
      company_address_ar: 'المويجعي، العين، أبوظبي',
      company_address_en: 'Al Muwaiji, Al Ain, Abu Dhabi',
      phone_primary: '+971 3 721 8899',
      email_official: 'crm@gulfsandtyping.ae',
      show_logo: true,
      show_qr: true,
      qr_label_ar: 'امسح الرمز للتحقق من صحة كشف الحساب',
      qr_label_en: 'Scan to verify customer dossier',
      updated_by_name: 'بشار الحاج (المدير العام)',
    },
  ];
}

export function getEmptyDatabaseSeed(): DatabaseState {
  const now = new Date().toISOString();

  return {
    document_templates: getDefaultDocumentTemplates(now),
    document_template_versions: [],
    receipt_verification_tokens: [],
    receipt_verification_logs: [],
    auth_sessions: [],
    auth_tokens: [],
    security_audit_logs: [],
    // 1. الإعدادات
    system_settings: [
      {
        id: 'SET-001',
        created_at: now,
        created_by: 'system',
        updated_at: now,
        updated_by: 'system',
        branch_id: 'BR-001',
        status: 'نشط',
        company_name_ar: 'جلف ساند لخدمات الطباعة والمعاملات',
        company_name_en: 'Gulf Sand Typing & Business Services',
        trade_license_number: 'CN-1984250',
        address_al_ain: 'منطقة المويجعي، شارع خليفة بن زايد، العين، أبوظبي، الإمارات العربية المتحدة',
        phone_primary: '+971 3 766 5400',
        phone_secondary: '+971 50 882 1940',
        email_official: 'info@gulfsandtyping.ae',
        currency: 'AED',
        timezone: 'Asia/Dubai',
        is_vat_registered: false,
        vat_trn: '',
        vat_rate_percentage: 5.0,
        daily_revenue_target_aed: 10000.0,
        monthly_revenue_target_aed: 260000.0,
        monthly_profit_target_aed: 95000.0,
        standard_workdays_per_month: 26,
        weekly_holiday: 'Saturday',
        google_drive_root_folder_id: 'gulfsand_root_drive_id',
        notification_email_recipients: ['bashar.elhaj.sd@gmail.com', 'admin@gulfsandtyping.ae'],
      },
    ],

    // 2. الفروع
    branches: [
      {
        id: 'BR-001',
        created_at: now,
        created_by: 'system',
        updated_at: now,
        updated_by: 'system',
        branch_id: 'BR-001',
        status: 'نشط',
        branch_code: 'BR-001',
        branch_name_ar: 'الفرع الرئيسي - العين',
        branch_name_en: 'Main Branch - Al Ain',
        emirate: 'أبوظبي - العين',
        location_details: 'بجانب مركز تسهيل وتوجيه، المويجعي، العين',
        is_main_branch: true,
        manager_user_id: 'USR-001',
        phone: '+971 3 766 5400',
      },
    ],

    // 3. المستخدمون والصلاحيات
    users_permissions: [
      {
        id: 'USR-001',
        created_at: now,
        created_by: 'system',
        updated_at: now,
        updated_by: 'system',
        branch_id: 'BR-001',
        status: 'نشط',
        email: 'bashar.elhaj.ai@gmail.com',
        full_name_ar: 'بشار الحاج (المدير الأعلى)',
        full_name_en: 'Bashar Elhaj (Super Admin)',
        role: UserRole.SYSTEM_ADMIN,
        department: Department.MANAGEMENT,
        employee_id: 'EMP-001',
        phone: '+971 50 882 1940',
        preferred_language: 'ar',
        account_status: 'ACTIVE',
        is_active: true,
        is_super_admin: true,
        password_salt: 'e8f49a1c620473b18d20594a7e9102bc',
        // PBKDF2 SHA-512 100k salted hash of bootstrap temporary password
        password_hash: '22839dc390b14c33aa52e85a539bc27a1dfa6e7dfad9e3fcfa17ca21ffbc4be7163db444a0e9ecbe8f2bbff1d6a99fc69c73bb1b2e67cbdb14a1e94119db1d63',
        password_history: [],
        must_change_password: false,
        failed_login_attempts: 0,
        can_view_cost_profit: true,
        can_approve: true,
        can_delete: true,
        can_export: true,
        can_close_month: true,
        can_manage_settings: true,
        discount_limit_aed: 1000.0,
        last_login: now,
      },
    ],

    // 4. دليل الحسابات
    chart_of_accounts: [
      // 1000 - الأصول (Assets)
      { id: 'ACC-1010', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', account_code: '1010', account_name_ar: 'الصندوق الرئيسي (النقدية باليد)', account_name_en: 'Main Cash Box', account_type: AccountType.ASSET, is_leaf: true, is_system_protected: true, current_balance_aed: 0, opening_balance_aed: 0 },
      { id: 'ACC-1020', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', account_code: '1020', account_name_ar: 'العهدة النقدية للموظفين', account_name_en: 'Petty Cash', account_type: AccountType.ASSET, is_leaf: true, is_system_protected: true, current_balance_aed: 0, opening_balance_aed: 0 },
      { id: 'ACC-1030', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', account_code: '1030', account_name_ar: 'حساب بنك أبوظبي التجاري (ADCB)', account_name_en: 'ADCB Current Account', account_type: AccountType.ASSET, is_leaf: true, is_system_protected: true, current_balance_aed: 0, opening_balance_aed: 0 },
      { id: 'ACC-1040', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', account_code: '1040', account_name_ar: 'حساب بنك أبوظبي الأول (FAB)', account_name_en: 'FAB Current Account', account_type: AccountType.ASSET, is_leaf: true, is_system_protected: true, current_balance_aed: 0, opening_balance_aed: 0 },
      { id: 'ACC-1050', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', account_code: '1050', account_name_ar: 'أجهزة نقاط البيع POS وبطاقات الائتمان', account_name_en: 'POS Terminals & Card Clearing', account_type: AccountType.ASSET, is_leaf: true, is_system_protected: true, current_balance_aed: 0, opening_balance_aed: 0 },
      { id: 'ACC-1200', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', account_code: '1200', account_name_ar: 'الذمم المدينة (حسابات العملاء)', account_name_en: 'Accounts Receivable', account_type: AccountType.ASSET, is_leaf: true, is_system_protected: true, current_balance_aed: 0, opening_balance_aed: 0 },
      { id: 'ACC-1300', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', account_code: '1300', account_name_ar: 'أرصدة البوابات الحكومية المدفوعة مسبقاً (ICP/Tasheel)', account_name_en: 'Prepaid Gov Gateways Balance', account_type: AccountType.ASSET, is_leaf: true, is_system_protected: true, current_balance_aed: 0, opening_balance_aed: 0 },

      // 2000 - الخصوم (Liabilities)
      { id: 'ACC-2010', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', account_code: '2010', account_name_ar: 'الذمم الدائنة (الموردون وخطوط الطيران)', account_name_en: 'Accounts Payable & Suppliers', account_type: AccountType.LIABILITY, is_leaf: true, is_system_protected: true, current_balance_aed: 0, opening_balance_aed: 0 },
      { id: 'ACC-2020', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', account_code: '2020', account_name_ar: 'أمانات ودفعات مقدمة من العملاء', account_name_en: 'Customer Advances & Deposits', account_type: AccountType.LIABILITY, is_leaf: true, is_system_protected: true, current_balance_aed: 0, opening_balance_aed: 0 },
      { id: 'ACC-2030', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', account_code: '2030', account_name_ar: 'رواتب وعمولات مستحقة الدفع', account_name_en: 'Accrued Payroll & Commissions', account_type: AccountType.LIABILITY, is_leaf: true, is_system_protected: true, current_balance_aed: 0, opening_balance_aed: 0 },
      { id: 'ACC-2040', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', account_code: '2040', account_name_ar: 'ضريبة القيمة المضافة المستحقة (VAT Ready)', account_name_en: 'VAT Output Liability', account_type: AccountType.LIABILITY, is_leaf: true, is_system_protected: true, current_balance_aed: 0, opening_balance_aed: 0 },

      // 3000 - حقوق الملكية (Equity)
      { id: 'ACC-3010', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', account_code: '3010', account_name_ar: 'رأس المال المدفوع', account_name_en: 'Paid-up Capital', account_type: AccountType.EQUITY, is_leaf: true, is_system_protected: true, current_balance_aed: 0, opening_balance_aed: 0 },
      { id: 'ACC-3020', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', account_code: '3020', account_name_ar: 'الأرباح والخسائر المبقاة', account_name_en: 'Retained Earnings', account_type: AccountType.EQUITY, is_leaf: true, is_system_protected: true, current_balance_aed: 0, opening_balance_aed: 0 },

      // 4000 - الإيرادات (Revenue)
      { id: 'ACC-4010', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', account_code: '4010', account_name_ar: 'إيرادات خدمات الإقامة والزيارة والجوازات', account_name_en: 'Residency & Visa Revenue', account_type: AccountType.REVENUE, is_leaf: true, is_system_protected: true, current_balance_aed: 0, opening_balance_aed: 0 },
      { id: 'ACC-4020', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', account_code: '4020', account_name_ar: 'إيرادات حجز الطيران وتذاكر السفر', account_name_en: 'Flight Booking Revenue', account_type: AccountType.REVENUE, is_leaf: true, is_system_protected: true, current_balance_aed: 0, opening_balance_aed: 0 },
      { id: 'ACC-4030', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', account_code: '4030', account_name_ar: 'إيرادات الفنادق والباقات السياحية والعمرة', account_name_en: 'Tourism & Package Revenue', account_type: AccountType.REVENUE, is_leaf: true, is_system_protected: true, current_balance_aed: 0, opening_balance_aed: 0 },
      { id: 'ACC-4040', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', account_code: '4040', account_name_ar: 'إيرادات خدمات السودان والمعاملات القنصلية', account_name_en: 'Sudan Embassy Services Revenue', account_type: AccountType.REVENUE, is_leaf: true, is_system_protected: true, current_balance_aed: 0, opening_balance_aed: 0 },
      { id: 'ACC-4050', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', account_code: '4050', account_name_ar: 'إيرادات الطباعة والترجمة القانونية والشركات', account_name_en: 'Typing & Legal Translation Revenue', account_type: AccountType.REVENUE, is_leaf: true, is_system_protected: true, current_balance_aed: 0, opening_balance_aed: 0 },

      // 5000 - تكلفة الخدمات المباشرة (Cost of Sales / Direct Service Costs)
      { id: 'ACC-5010', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', account_code: '5010', account_name_ar: 'رسوم المعاملات الحكومية المباشرة (ICP / Tasheel)', account_name_en: 'Direct Gov Gateway Fees', account_type: AccountType.COST_OF_SALES, is_leaf: true, is_system_protected: true, current_balance_aed: 0, opening_balance_aed: 0 },
      { id: 'ACC-5020', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', account_code: '5020', account_name_ar: 'تكلفة تذاكر الطيران والفنادق للمزودين', account_name_en: 'Airlines & Hotels Supplier Cost', account_type: AccountType.COST_OF_SALES, is_leaf: true, is_system_protected: true, current_balance_aed: 0, opening_balance_aed: 0 },
      { id: 'ACC-5030', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', account_code: '5030', account_name_ar: 'تكاليف المترجمين والمزودين الخارجيين', account_name_en: 'External Translators & Services', account_type: AccountType.COST_OF_SALES, is_leaf: true, is_system_protected: true, current_balance_aed: 0, opening_balance_aed: 0 },

      // 6000 - المصروفات التشغيلية والإدارية (Operating Expenses)
      { id: 'ACC-6010', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', account_code: '6010', account_name_ar: 'إيجار مقر المكتب بالعين', account_name_en: 'Office Rent - Al Ain', account_type: AccountType.OPERATING_EXPENSE, is_leaf: true, is_system_protected: true, current_balance_aed: 0, opening_balance_aed: 0 },
      { id: 'ACC-6020', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', account_code: '6020', account_name_ar: 'رواتب وأجور الموظفين والبدلات', account_name_en: 'Employee Salaries & Allowances', account_type: AccountType.OPERATING_EXPENSE, is_leaf: true, is_system_protected: true, current_balance_aed: 0, opening_balance_aed: 0 },
      { id: 'ACC-6030', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', account_code: '6030', account_name_ar: 'عمولات المبيعات للموظفين', account_name_en: 'Employee Sales Commissions', account_type: AccountType.OPERATING_EXPENSE, is_leaf: true, is_system_protected: true, current_balance_aed: 0, opening_balance_aed: 0 },
      { id: 'ACC-6040', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', account_code: '6040', account_name_ar: 'فواتير الكهرباء والماء والإنترنت (AADC / Etisalat)', account_name_en: 'Utilities & Internet', account_type: AccountType.OPERATING_EXPENSE, is_leaf: true, is_system_protected: true, current_balance_aed: 0, opening_balance_aed: 0 },
      { id: 'ACC-6050', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', account_code: '6050', account_name_ar: 'أحبار وقرطاسية ومستلزمات الطباعة', account_name_en: 'Printing Supplies & Stationery', account_type: AccountType.OPERATING_EXPENSE, is_leaf: true, is_system_protected: true, current_balance_aed: 0, opening_balance_aed: 0 },
      { id: 'ACC-6060', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', account_code: '6060', account_name_ar: 'رسوم الرخص والاشتراكات الحكومية والبرمجيات', account_name_en: 'Licensing, Gov & Software Fees', account_type: AccountType.OPERATING_EXPENSE, is_leaf: true, is_system_protected: true, current_balance_aed: 0, opening_balance_aed: 0 },
    ],

    // 5. الحسابات النقدية والبنكية
    cash_bank_accounts: [
      { id: 'CBA-001', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', account_code: 'CBA-001', name_ar: 'الصندوق النقدي الرئيسي (الخزينة)', name_en: 'Main Office Cash Drawer', account_type: 'صندوق نقدي', linked_gl_account_id: 'ACC-1010', current_balance_aed: 0, is_active: true },
      { id: 'CBA-002', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', account_code: 'CBA-002', name_ar: 'حساب بنك أبوظبي التجاري ADCB', name_en: 'ADCB Business Current', account_type: 'حساب بنكي', bank_name: 'ADCB Al Ain', iban_or_account_number: 'AE440030012345678901234', linked_gl_account_id: 'ACC-1030', current_balance_aed: 0, is_active: true },
      { id: 'CBA-003', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', account_code: 'CBA-003', name_ar: 'جهاز نقاط البيع شبكة / POS Terminal', name_en: 'POS Network Terminal', account_type: 'جهاز POS', linked_gl_account_id: 'ACC-1050', current_balance_aed: 0, is_active: true },
    ],

    // 6. الخدمات والأسعار (13 Category Catalog)
    services_pricing: [
      // 1. الإقامة والزيارة
      { id: 'SRV-001', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', service_code: 'SRV-001', name_ar: 'تجديد إقامة - القطاع الخاص (تسهيل + الجوازات)', name_en: 'Residence Renewal - Private Sector', category: ServiceCategory.RESIDENCY_VISIT, subcategory: 'الإقامات', min_price_aed: 450.0, max_price_aed: 650.0, default_cost_aed: 350.0, estimated_duration_hours: 24, required_documents: ['جواز السفر ساري المفعول', 'الهوية السابقة', 'الفحص الطبي', 'عقد الإيجار الموثق'], responsible_department: Department.TYPING_OPERATIONS, commission_type: CommissionType.FIXED_AMOUNT, commission_value: 20.0, vat_ready_flag: true, vat_applicable_percentage: 5.0, priority_order: 1, is_active: true },
      { id: 'SRV-002', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', service_code: 'SRV-002', name_ar: 'إصدار تأشيرة زيارة سياحية (60 يوماً)', name_en: 'Tourist Visit Visa - 60 Days', category: ServiceCategory.RESIDENCY_VISIT, subcategory: 'التأشيرات', min_price_aed: 550.0, max_price_aed: 800.0, default_cost_aed: 450.0, estimated_duration_hours: 48, required_documents: ['صورة جواز السفر', 'صورة شخصية خلفية بيضاء'], responsible_department: Department.TYPING_OPERATIONS, commission_type: CommissionType.FIXED_AMOUNT, commission_value: 25.0, vat_ready_flag: true, vat_applicable_percentage: 5.0, priority_order: 2, is_active: true },
      { id: 'SRV-003', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', service_code: 'SRV-003', name_ar: 'معاملة الإقامة الذهبية (ترشيح وإصدار 10 سنوات)', name_en: 'Golden Visa Nomination & Issuance (10 Yrs)', category: ServiceCategory.RESIDENCY_VISIT, subcategory: 'الإقامة الذهبية', min_price_aed: 2500.0, max_price_aed: 4500.0, default_cost_aed: 1800.0, estimated_duration_hours: 72, required_documents: ['عقد ملكية عقار أو شهادة راتب أو إيداع بنكي', 'جواز السفر', 'كشف حساب 6 أشهر'], responsible_department: Department.TYPING_OPERATIONS, commission_type: CommissionType.PERCENTAGE, commission_value: 10.0, vat_ready_flag: true, vat_applicable_percentage: 5.0, priority_order: 3, is_active: true },

      // 2. المركبات
      { id: 'SRV-004', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', service_code: 'SRV-004', name_ar: 'تجديد ملكية مركبة وفحص فني (مرور أبوظبي)', name_en: 'Vehicle Registration Renewal & Inspection', category: ServiceCategory.VEHICLES, min_price_aed: 200.0, max_price_aed: 350.0, default_cost_aed: 150.0, estimated_duration_hours: 12, required_documents: ['وثيقة التأمين', 'شهادة الفحص الفني', 'الهوية الإماراتية'], responsible_department: Department.TYPING_OPERATIONS, commission_type: CommissionType.FIXED_AMOUNT, commission_value: 15.0, vat_ready_flag: true, vat_applicable_percentage: 5.0, priority_order: 4, is_active: true },

      // 3. السفر والسياحة & 4. الطيران
      { id: 'SRV-005', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', service_code: 'SRV-005', name_ar: 'حجز وإصدار تذاكر طيران دولية ومحلية', name_en: 'International Flight Ticket Issuance', category: ServiceCategory.FLIGHT_TICKETS, min_price_aed: 50.0, max_price_aed: 5000.0, default_cost_aed: 40.0, estimated_duration_hours: 2, required_documents: ['جواز السفر'], responsible_department: Department.TOURISM_TRAVEL, commission_type: CommissionType.PERCENTAGE, commission_value: 5.0, vat_ready_flag: true, vat_applicable_percentage: 5.0, priority_order: 5, is_active: true },

      // 5. الفنادق & 6. التفويجات والجولات & 7. الباقات
      { id: 'SRV-006', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', service_code: 'SRV-006', name_ar: 'باقة رحلات العمرة براً وجواً (شاملة الفندق والنقل)', name_en: 'Umrah Package (Transport & Hotel)', category: ServiceCategory.TOUR_PACKAGES, min_price_aed: 1200.0, max_price_aed: 3500.0, default_cost_aed: 950.0, estimated_duration_hours: 48, required_documents: ['جواز السفر', 'تأشيرة الدخول', 'شهادة التطعيم'], responsible_department: Department.TOURISM_TRAVEL, commission_type: CommissionType.FIXED_AMOUNT, commission_value: 50.0, vat_ready_flag: true, vat_applicable_percentage: 5.0, priority_order: 6, is_active: true },
      { id: 'SRV-007', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', service_code: 'SRV-007', name_ar: 'رحلة سياحية إلى سلطنة عمان (البريمي ومسندم)', name_en: 'Oman Tourism & Visa Run Package', category: ServiceCategory.TOURS_TRANSFERS, min_price_aed: 350.0, max_price_aed: 600.0, default_cost_aed: 250.0, estimated_duration_hours: 24, required_documents: ['جواز السفر الأصلي', 'الهوية الإماراتية'], responsible_department: Department.TOURISM_TRAVEL, commission_type: CommissionType.FIXED_AMOUNT, commission_value: 20.0, vat_ready_flag: true, vat_applicable_percentage: 5.0, priority_order: 7, is_active: true },

      // 8. التأمين السياحي
      { id: 'SRV-008', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', service_code: 'SRV-008', name_ar: 'إصدار وثيقة تأمين السفر الدولي وتأشيرة شنغن', name_en: 'International Travel & Schengen Insurance', category: ServiceCategory.TRAVEL_INSURANCE, min_price_aed: 120.0, max_price_aed: 300.0, default_cost_aed: 80.0, estimated_duration_hours: 4, required_documents: ['جواز السفر', 'تواريخ السفر'], responsible_department: Department.TOURISM_TRAVEL, commission_type: CommissionType.FIXED_AMOUNT, commission_value: 15.0, vat_ready_flag: true, vat_applicable_percentage: 5.0, priority_order: 8, is_active: true },

      // 9. القضاء والعدالة
      { id: 'SRV-009', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', service_code: 'SRV-009', name_ar: 'طباعة وتوثيق وكالة عامة / خاصة (محاكم أبوظبي)', name_en: 'Power of Attorney Drafting & Notarization', category: ServiceCategory.JUSTICE_LEGAL, min_price_aed: 300.0, max_price_aed: 500.0, default_cost_aed: 150.0, estimated_duration_hours: 12, required_documents: ['الهوية الإماراتية للموكل والوكيل', 'نص الوكالة المطلوب'], responsible_department: Department.TYPING_OPERATIONS, commission_type: CommissionType.FIXED_AMOUNT, commission_value: 20.0, vat_ready_flag: true, vat_applicable_percentage: 5.0, priority_order: 9, is_active: true },

      // 10. خدمات السودان
      { id: 'SRV-010', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', service_code: 'SRV-010', name_ar: 'تجديد الجواز السوداني والمعاملات القنصلية', name_en: 'Sudan Passport Renewal & Consular Services', category: ServiceCategory.SUDAN_SERVICES, min_price_aed: 400.0, max_price_aed: 800.0, default_cost_aed: 300.0, estimated_duration_hours: 72, required_documents: ['الرقم الوطني', 'الجواز القديم', 'صورة شخصية'], responsible_department: Department.TYPING_OPERATIONS, commission_type: CommissionType.FIXED_AMOUNT, commission_value: 30.0, vat_ready_flag: true, vat_applicable_percentage: 5.0, priority_order: 10, is_active: true },

      // 11. الشركات والأعمال
      { id: 'SRV-011', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', service_code: 'SRV-011', name_ar: 'تأسيس وتجديد رخصة تجارية - دائرة التنمية الاقتصادية DED', name_en: 'Trade License Issuance & Renewal (DED)', category: ServiceCategory.BUSINESS_COMPANIES, min_price_aed: 1500.0, max_price_aed: 3500.0, default_cost_aed: 1000.0, estimated_duration_hours: 48, required_documents: ['عقد التأسيس', 'عقد إيجار توثيق', 'جوازات وهوية الشركاء'], responsible_department: Department.TYPING_OPERATIONS, commission_type: CommissionType.PERCENTAGE, commission_value: 8.0, vat_ready_flag: true, vat_applicable_percentage: 5.0, priority_order: 11, is_active: true },

      // 12. خدمات VAT
      { id: 'SRV-012', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', service_code: 'SRV-012', name_ar: 'التسجيل وتقديم الإقرار الضريبي لضريبة القيمة المضافة (FTA)', name_en: 'VAT Registration & Return Filing (FTA)', category: ServiceCategory.VAT_SERVICES, min_price_aed: 500.0, max_price_aed: 1500.0, default_cost_aed: 200.0, estimated_duration_hours: 24, required_documents: ['الرخصة التجارية', 'كشف المبيعات والمصروفات', 'شهادة الحساب البنكي'], responsible_department: Department.ACCOUNTS_FINANCE, commission_type: CommissionType.PERCENTAGE, commission_value: 10.0, vat_ready_flag: true, vat_applicable_percentage: 5.0, priority_order: 12, is_active: true },

      // 13. الطباعة والترجمة
      { id: 'SRV-013', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', service_code: 'SRV-013', name_ar: 'ترجمة قانونية معتمدة (عربي - إنجليزي / صفحة)', name_en: 'Certified Legal Translation (Per Page)', category: ServiceCategory.TYPING_TRANSLATION, min_price_aed: 60.0, max_price_aed: 120.0, default_cost_aed: 40.0, estimated_duration_hours: 12, required_documents: ['المستند الأصلي المراد ترجمته'], responsible_department: Department.TYPING_OPERATIONS, commission_type: CommissionType.FIXED_AMOUNT, commission_value: 10.0, vat_ready_flag: true, vat_applicable_percentage: 5.0, priority_order: 13, is_active: true },
    ],

    // 7. العطلات والمناسبات الرسمية لدولة الإمارات
    holidays_events: [
      { id: 'HOL-001', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', holiday_name_ar: 'رأس السنة الميلادية', holiday_name_en: 'New Year Day', start_date: '2026-01-01', end_date: '2026-01-01', days_count: 1, is_paid: true, year: 2026 },
      { id: 'HOL-002', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', holiday_name_ar: 'عيد الفطر المبارك', holiday_name_en: 'Eid Al Fitr', start_date: '2026-03-20', end_date: '2026-03-23', days_count: 4, is_paid: true, year: 2026 },
      { id: 'HOL-003', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', holiday_name_ar: 'وقفة عرفة وعيد الأضحى المبارك', holiday_name_en: 'Arafah & Eid Al Adha', start_date: '2026-05-27', end_date: '2026-05-30', days_count: 4, is_paid: true, year: 2026 },
      { id: 'HOL-004', created_at: now, created_by: 'system', updated_at: now, updated_by: 'system', branch_id: 'BR-001', status: 'نشط', holiday_name_ar: 'اليوم الوطني الإماراتي (عيد الاتحاد)', holiday_name_en: 'UAE National Day', start_date: '2026-12-02', end_date: '2026-12-03', days_count: 2, is_paid: true, year: 2026 },
    ],

    // 8. دليل الاستخدام والتدريب
    training_modules: [
      {
        id: 'TRN-001',
        created_at: now,
        created_by: 'system',
        updated_at: now,
        updated_by: 'system',
        branch_id: 'BR-001',
        status: 'نشط',
        module_code: 'TRN-001',
        title_ar: 'دليل إنشاء المعاملات المتعددة الخدمات والتحقق من الأسعار',
        category: 'المعاملات والطباعة',
        target_roles: [UserRole.OPERATIONS, UserRole.SUPERVISOR, UserRole.MANAGER],
        estimated_minutes: 15,
        content_markdown: `# دليل إنشاء المعاملات في جلف ساند للطباعة والخدمات
1. اضغط على زر **معاملة جديدة**.
2. اختر العميل أو أنشئ عميلاً جديداً (يتم فحص الهوية ورقم الهاتف لمنع التكرار).
3. أضف بنود الخدمات المطلوبة (مثل: تجديد إقامة + فحص طبي + تأمين سياحي).
4. تأكد من إدخال سعر البيع ضمن النطاق المسموح بين السعر الأدنى والأعلى.
5. احفظ المعاملة وأصدر الفاتورة أو سند الاستلام.`,
        quiz_questions: [
          {
            question_ar: 'ماذا يحدث إذا أدخل موظف العمليات سعراً أقل من السعر الأدنى المحدد للخدمة؟',
            options_ar: ['يقبل النظام السعر تلقائياً', 'يرفض النظام السعر ويطلب موافقة المشرف', 'يتم إلغاء المعاملة تماماً'],
            correct_option_index: 1,
            explanation_ar: 'النظام يطبق قاعدة السعر الأدنى والأعلى لحماية أرباح المنشأة، وتتطلب التجاوزات اعتماد المشرف.',
          },
        ],
      },
    ],

    // باقي الجداول تكون فارغة تماماً في النسخة النظيفة (Empty DB)
    customers: [],
    suppliers_vendors: [],
    transactions: [],
    transaction_details: [],
    bookings: [],
    invoices: [],
    invoice_details: [],
    collections_receipts: [],
    payment_allocations: [],
    expenses: [],
    disbursements: [],
    journal_entries: [],
    journal_entry_lines: [],
    bank_reconciliations: [],
    employees: [],
    attendance_logs: [],
    leaves: [],
    payroll: [],
    commissions: [],
    employee_performance: [],
    documents: [],
    tasks: [],
    approvals: [],
    crm_leads: [],
    crm_followups: [],
    notification_logs: [],
    audit_logs: [],
    archive_records: [],
    system_backups: [],
  };
}
