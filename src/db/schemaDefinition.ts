import { TableSchemaDefinition } from '../types/erp';

export const ALL_36_TABLE_SCHEMAS: TableSchemaDefinition[] = [
  // 1. المستخدمون والصلاحيات
  {
    table_name_ar: 'المستخدمون_والصلاحيات',
    table_name_en: 'users_permissions',
    id_prefix: 'USR',
    category: 'core',
    description_ar: 'جدول حسابات Google للموظفين، الأدوار والصلاحيات الممنوحة وإدارات العمل',
    columns: [
      { key: 'id', name_ar: 'المعرف الفريد', name_en: 'User ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'معرف فريد يبدأ بـ USR' },
      { key: 'email', name_ar: 'البريد الإلكتروني (Google)', name_en: 'Google Email', type: 'string', is_required: true, description_ar: 'حساب Google المعتمد لتسجيل الدخول' },
      { key: 'full_name_ar', name_ar: 'الاسم بالعربية', name_en: 'Arabic Name', type: 'string', is_required: true, description_ar: 'الاسم الكامل باللغة العربية' },
      { key: 'full_name_en', name_ar: 'الاسم بالإنجليزية', name_en: 'English Name', type: 'string', is_required: true, description_ar: 'الاسم الكامل بالإنجليزية' },
      { key: 'role', name_ar: 'الدور الوظيفي', name_en: 'Role', type: 'enum', is_required: true, description_ar: 'SYSTEM_ADMIN, MANAGER, SUPERVISOR, ACCOUNTS, HR, OPERATIONS, VIEWER' },
      { key: 'department', name_ar: 'القسم / الإدارة', name_en: 'Department', type: 'enum', is_required: true, description_ar: 'القسم التابع له الموظف' },
      { key: 'phone', name_ar: 'رقم الهاتف', name_en: 'Phone', type: 'string', is_required: false, description_ar: 'رقم الهاتف المباشر بالإمارات' },
      { key: 'is_active', name_ar: 'الحالة (نشط)', name_en: 'Is Active', type: 'boolean', is_required: true, description_ar: 'حالة تفعيل الحساب' },
      { key: 'can_view_cost_profit', name_ar: 'صلاحية رؤية التكلفة والأرباح', name_en: 'Can View Cost & Profit', type: 'boolean', is_required: true, description_ar: 'صلاحية حساسة محجوبة عن موظفي العمليات' },
      { key: 'discount_limit_aed', name_ar: 'حد الخصم المسموح (درهم)', name_en: 'Discount Limit AED', type: 'currency', is_required: true, description_ar: 'الحد الأقصى للخصم المباشر بدون موافقة' },
      { key: 'branch_id', name_ar: 'معرف الفرع', name_en: 'Branch ID', type: 'string', is_required: true, is_foreign_key: true, foreign_table: 'branches', description_ar: 'الفرع التابع له' },
    ],
  },
  // 2. الإعدادات
  {
    table_name_ar: 'الإعدادات',
    table_name_en: 'system_settings',
    id_prefix: 'SET',
    category: 'core',
    description_ar: 'إعدادات النظام العامة، العملة (AED)، المنطقة الزمنية، أهداف الإيراد، وجاهزية الضريبة',
    columns: [
      { key: 'id', name_ar: 'المعرف الفريد', name_en: 'Setting ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'معرف الإعداد' },
      { key: 'company_name_ar', name_ar: 'اسم المنشأة بالعربية', name_en: 'Company Name AR', type: 'string', is_required: true, description_ar: 'خدمات جلف ساند للطباعة' },
      { key: 'company_name_en', name_ar: 'اسم المنشأة بالإنجليزية', name_en: 'Company Name EN', type: 'string', is_required: true, description_ar: 'Gulfsand Typing Services' },
      { key: 'trade_license_number', name_ar: 'رقم الرخصة التجارية', name_en: 'Trade License No', type: 'string', is_required: true, description_ar: 'رقم الرخصة في العين - أبوظبي' },
      { key: 'currency', name_ar: 'العملة الرسمية', name_en: 'Currency', type: 'string', is_required: true, description_ar: 'AED - الدرهم الإماراتي' },
      { key: 'timezone', name_ar: 'المنطقة الزمنية', name_en: 'Timezone', type: 'string', is_required: true, description_ar: 'Asia/Dubai' },
      { key: 'is_vat_registered', name_ar: 'مسجل في ضريبة القيمة المضافة', name_en: 'Is VAT Registered', type: 'boolean', is_required: true, description_ar: 'حالياً غير مسجل وجاهز للتفعيل الفوري' },
      { key: 'daily_revenue_target_aed', name_ar: 'الهدف اليومي للإيراد (درهم)', name_en: 'Daily Revenue Target', type: 'currency', is_required: true, description_ar: '10,000 درهم إماراتي' },
      { key: 'standard_workdays_per_month', name_ar: 'أيام العمل القياسية شهرياً', name_en: 'Standard Workdays', type: 'number', is_required: true, description_ar: '26 يوم عمل قياسي' },
    ],
  },
  // 3. الفروع
  {
    table_name_ar: 'الفروع',
    table_name_en: 'branches',
    id_prefix: 'BR',
    category: 'core',
    description_ar: 'فروع جلف ساند (الفرع الرئيسي في العين + الفروع المستقبلية)',
    columns: [
      { key: 'id', name_ar: 'معرف الفرع', name_en: 'Branch ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'BR-001' },
      { key: 'branch_name_ar', name_ar: 'اسم الفرع بالعربية', name_en: 'Branch Name AR', type: 'string', is_required: true, description_ar: 'فرع العين الرئيسي' },
      { key: 'branch_name_en', name_ar: 'اسم الفرع بالإنجليزية', name_en: 'Branch Name EN', type: 'string', is_required: true, description_ar: 'Al Ain Main Branch' },
      { key: 'emirate', name_ar: 'الإمارة / المدينة', name_en: 'Emirate / City', type: 'string', is_required: true, description_ar: 'أبوظبي - العين' },
      { key: 'is_main_branch', name_ar: 'الفرع الرئيسي', name_en: 'Is Main', type: 'boolean', is_required: true, description_ar: 'نعم' },
    ],
  },
  // 4. العملاء
  {
    table_name_ar: 'العملاء',
    table_name_en: 'customers',
    id_prefix: 'CUS',
    category: 'crm',
    description_ar: 'بيانات العملاء (أفراد، شركات، جهات حكومية، وكالات) مع منع التكرار',
    columns: [
      { key: 'id', name_ar: 'معرف العميل', name_en: 'Customer ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'CUS-00001' },
      { key: 'name_ar', name_ar: 'اسم العميل بالعربية', name_en: 'Name AR', type: 'string', is_required: true, description_ar: 'الاسم التجاري أو الشخصي' },
      { key: 'customer_type', name_ar: 'نوع العميل', name_en: 'Type', type: 'enum', is_required: true, description_ar: 'أفراد، شركات، جهات حكومية' },
      { key: 'emirates_id', name_ar: 'رقم الهوية الإماراتية', name_en: 'Emirates ID', type: 'string', is_required: false, description_ar: '784-XXXX-XXXXXXX-X (مانع تكرار)' },
      { key: 'passport_number', name_ar: 'رقم جواز السفر', name_en: 'Passport No', type: 'string', is_required: false, description_ar: 'مانع تكرار' },
      { key: 'trade_license_no', name_ar: 'رقم الرخصة التجارية', name_en: 'Trade License', type: 'string', is_required: false, description_ar: 'للشركات (مانع تكرار)' },
      { key: 'phone', name_ar: 'رقم الهاتف', name_en: 'Phone', type: 'string', is_required: true, description_ar: 'رقم التواصل والواتساب' },
      { key: 'email', name_ar: 'البريد الإلكتروني', name_en: 'Email', type: 'string', is_required: false, description_ar: 'البريد الإلكتروني' },
      { key: 'total_spent_aed', name_ar: 'إجمالي التعاملات (درهم)', name_en: 'Total Spent AED', type: 'currency', is_required: true, description_ar: 'إجمالي المبيعات المحققة' },
      { key: 'current_balance_aed', name_ar: 'رصيد الذمم المدينة (درهم)', name_en: 'Balance AED', type: 'currency', is_required: true, description_ar: 'المستحقات المتبقية على العميل' },
    ],
  },
  // 5. الخدمات والأسعار
  {
    table_name_ar: 'الخدمات_والأسعار',
    table_name_en: 'services_pricing',
    id_prefix: 'SRV',
    category: 'operations',
    description_ar: 'دليل الخدمات الشامل (13 فئة) مع نطاق الأسعار الأدنى والأعلى والتكلفة الافتراضية',
    columns: [
      { key: 'id', name_ar: 'معرف الخدمة', name_en: 'Service ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'SRV-001' },
      { key: 'name_ar', name_ar: 'اسم الخدمة بالعربية', name_en: 'Service Name AR', type: 'string', is_required: true, description_ar: 'مثال: تجديد إقامة، فحص طبي، حجز طيران' },
      { key: 'category', name_ar: 'الفئة الرئيسية', name_en: 'Category', type: 'enum', is_required: true, description_ar: 'واحدة من الفئات الـ 13 المعتمدة' },
      { key: 'min_price_aed', name_ar: 'السعر الأدنى (درهم)', name_en: 'Min Price AED', type: 'currency', is_required: true, description_ar: 'أقل سعر بيع مسموح للموظف' },
      { key: 'max_price_aed', name_ar: 'السعر الأعلى (درهم)', name_en: 'Max Price AED', type: 'currency', is_required: true, description_ar: 'أعلى سعر بيع مسموح' },
      { key: 'default_cost_aed', name_ar: 'التكلفة الافتراضية (درهم)', name_en: 'Default Cost AED', type: 'currency', is_required: true, is_sensitive: true, description_ar: 'الرسوم الحكومية أو تكلفة المزود' },
      { key: 'commission_value', name_ar: 'قيمة / نسبة العمولة', name_en: 'Commission Value', type: 'number', is_required: true, description_ar: 'عمولة الموظف المحققة' },
      { key: 'vat_ready_flag', name_ar: 'جاهزية الضريبة', name_en: 'VAT Ready Flag', type: 'boolean', is_required: true, description_ar: 'الخضوع لضريبة 5% عند التفعيل' },
    ],
  },
  // 6. المزودون
  {
    table_name_ar: 'المزودون',
    table_name_en: 'suppliers_vendors',
    id_prefix: 'SUP',
    category: 'finance',
    description_ar: 'مزودو الخدمات الخارجية، بوابات الدفع الحكومية، خطوط الطيران والفنادق',
    columns: [
      { key: 'id', name_ar: 'معرف المزود', name_en: 'Supplier ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'SUP-0001' },
      { key: 'name_ar', name_ar: 'اسم المزود بالعربية', name_en: 'Name AR', type: 'string', is_required: true, description_ar: 'اسم الشركة أو المزود' },
      { key: 'supplier_type', name_ar: 'نوع المزود', name_en: 'Supplier Type', type: 'string', is_required: true, description_ar: 'بوابات حكومية، طيران، فنادق، تأمين' },
      { key: 'phone', name_ar: 'رقم الهاتف', name_en: 'Phone', type: 'string', is_required: true, description_ar: 'هاتف التواصل' },
      { key: 'current_balance_aed', name_ar: 'رصيد الذمم الدائنة (درهم)', name_en: 'Payable Balance AED', type: 'currency', is_required: true, description_ar: 'المبالغ المستحقة للمزود' },
    ],
  },
  // 7. المعاملات
  {
    table_name_ar: 'المعاملات',
    table_name_en: 'transactions',
    id_prefix: 'TRX',
    category: 'operations',
    description_ar: 'سجل المعاملات الرئيسي المتعدد الخدمات مع متابعة الإيراد، التكلفة، والأرباح',
    columns: [
      { key: 'id', name_ar: 'معرف المعاملة', name_en: 'Transaction ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'TRX-2026-00001' },
      { key: 'customer_id', name_ar: 'معرف العميل', name_en: 'Customer ID', type: 'string', is_required: true, is_foreign_key: true, foreign_table: 'customers', description_ar: 'العميل صاحب المعاملة' },
      { key: 'responsible_employee_id', name_ar: 'الموظف المسؤول', name_en: 'Employee ID', type: 'string', is_required: true, is_foreign_key: true, foreign_table: 'employees', description_ar: 'الموظف الذي أنشأ المعاملة' },
      { key: 'total_gross_amount_aed', name_ar: 'المبلغ الإجمالي (درهم)', name_en: 'Gross Total AED', type: 'currency', is_required: true, description_ar: 'مجموع أسعار الخدمات' },
      { key: 'total_discount_aed', name_ar: 'إجمالي الخصم (درهم)', name_en: 'Discount AED', type: 'currency', is_required: true, description_ar: 'الخصومات الممنوحة' },
      { key: 'total_net_amount_aed', name_ar: 'صافي البيع (درهم)', name_en: 'Net Total AED', type: 'currency', is_required: true, description_ar: 'المبلغ الصافي المطلوب من العميل' },
      { key: 'total_cost_aed', name_ar: 'التكلفة الإجمالية (درهم)', name_en: 'Total Cost AED', type: 'currency', is_required: true, is_sensitive: true, description_ar: 'محجوب عن موظفي العمليات' },
      { key: 'total_profit_aed', name_ar: 'صافي الربح (درهم)', name_en: 'Total Profit AED', type: 'currency', is_required: true, is_sensitive: true, description_ar: 'صافي البيع - التكلفة' },
      { key: 'collected_amount_aed', name_ar: 'المبلغ المحصل (درهم)', name_en: 'Collected AED', type: 'currency', is_required: true, description_ar: 'إجمالي الدفعات المستلمة' },
      { key: 'remaining_balance_aed', name_ar: 'المبلغ المتبقي (درهم)', name_en: 'Remaining AED', type: 'currency', is_required: true, description_ar: 'الرصيد المتبقي على العميل' },
      { key: 'status', name_ar: 'حالة المعاملة', name_en: 'Status', type: 'enum', is_required: true, description_ar: 'جديدة، قيد التنفيذ، مكتملة، ملغاة' },
    ],
  },
  // 8. تفاصيل المعاملات
  {
    table_name_ar: 'تفاصيل_المعاملات',
    table_name_en: 'transaction_details',
    id_prefix: 'TRD',
    category: 'operations',
    description_ar: 'بنود الخدمات داخل المعاملة الواحدة مع السعر المدخل، التكلفة الفعلية والربح',
    columns: [
      { key: 'id', name_ar: 'معرف البند', name_en: 'Line ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'TRD-00001' },
      { key: 'transaction_id', name_ar: 'معرف المعاملة', name_en: 'Transaction ID', type: 'string', is_required: true, is_foreign_key: true, foreign_table: 'transactions', description_ar: 'المعاملة الأم' },
      { key: 'service_id', name_ar: 'معرف الخدمة', name_en: 'Service ID', type: 'string', is_required: true, is_foreign_key: true, foreign_table: 'services_pricing', description_ar: 'الخدمة المختارة' },
      { key: 'quantity', name_ar: 'الكمية', name_en: 'Quantity', type: 'number', is_required: true, description_ar: 'عدد المعاملات/التأشيرات' },
      { key: 'selling_price_aed', name_ar: 'سعر البيع للوحدة (درهم)', name_en: 'Unit Selling Price', type: 'currency', is_required: true, description_ar: 'يجب أن يكون ضمن النطاق الأدنى والأعلى' },
      { key: 'actual_cost_aed', name_ar: 'التكلفة الفعلية (درهم)', name_en: 'Actual Cost AED', type: 'currency', is_required: true, is_sensitive: true, description_ar: 'تعدل فقط من قبل المشرف' },
      { key: 'profit_aed', name_ar: 'الربح المحقق (درهم)', name_en: 'Line Profit AED', type: 'currency', is_required: true, is_sensitive: true, description_ar: 'صافي البيع - التكلفة الفعلية' },
      { key: 'commission_aed', name_ar: 'عمولة الموظف (درهم)', name_en: 'Employee Commission', type: 'currency', is_required: true, description_ar: 'العمولة المستحقة' },
      { key: 'status', name_ar: 'حالة الخدمة', name_en: 'Status', type: 'enum', is_required: true, description_ar: 'تسمح بإغلاق خدمة وبقاء أخرى مفتوحة' },
    ],
  },
  // 9. الحجوزات
  {
    table_name_ar: 'الحجوزات',
    table_name_en: 'bookings',
    id_prefix: 'BKG',
    category: 'operations',
    description_ar: 'حجوزات الطيران، الفنادق، الباقات السياحية، رحلات العمرة وسياحة سلطنة عمان',
    columns: [
      { key: 'id', name_ar: 'معرف الحجز', name_en: 'Booking ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'BKG-2026-00001' },
      { key: 'booking_type', name_ar: 'نوع الحجز', name_en: 'Type', type: 'string', is_required: true, description_ar: 'طيران، فندق، جولة، باقة، عمرة' },
      { key: 'customer_id', name_ar: 'العميل', name_en: 'Customer ID', type: 'string', is_required: true, is_foreign_key: true, foreign_table: 'customers', description_ar: 'صاحب الحجز' },
      { key: 'booking_reference_pnr', name_ar: 'رقم الحجز PNR', name_en: 'PNR Reference', type: 'string', is_required: false, description_ar: 'مرجع الحجز لدى الطيران أو الفندق' },
      { key: 'selling_price_aed', name_ar: 'سعر البيع (درهم)', name_en: 'Selling Price AED', type: 'currency', is_required: true, description_ar: 'المطلوب من العميل' },
      { key: 'supplier_cost_aed', name_ar: 'تكلفة المزود (درهم)', name_en: 'Supplier Cost AED', type: 'currency', is_required: true, is_sensitive: true, description_ar: 'المستحق لشركة الطيران أو الفندق' },
      { key: 'profit_aed', name_ar: 'ربح الحجز (درهم)', name_en: 'Booking Profit AED', type: 'currency', is_required: true, is_sensitive: true, description_ar: 'الربح الصافي' },
      { key: 'status', name_ar: 'حالة الحجز', name_en: 'Status', type: 'enum', is_required: true, description_ar: 'مؤكد، تم الإصدار، ملغي، مسترد' },
    ],
  },
  // 10. الفواتير
  {
    table_name_ar: 'الفواتير',
    table_name_en: 'invoices',
    id_prefix: 'INV',
    category: 'finance',
    description_ar: 'فواتير المبيعات الصادرة للعملاء مع جاهزية الفاتورة الضريبية',
    columns: [
      { key: 'id', name_ar: 'رقم الفاتورة', name_en: 'Invoice ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'INV-2026-00001' },
      { key: 'transaction_id', name_ar: 'معرف المعاملة', name_en: 'Transaction ID', type: 'string', is_required: true, is_foreign_key: true, foreign_table: 'transactions', description_ar: 'المعاملة المرتبطة' },
      { key: 'customer_id', name_ar: 'معرف العميل', name_en: 'Customer ID', type: 'string', is_required: true, is_foreign_key: true, foreign_table: 'customers', description_ar: 'العميل' },
      { key: 'issue_date', name_ar: 'تاريخ الإصدار', name_en: 'Issue Date', type: 'date', is_required: true, description_ar: 'تاريخ إنشاء الفاتورة' },
      { key: 'total_amount_aed', name_ar: 'المبلغ الإجمالي (درهم)', name_en: 'Total Amount AED', type: 'currency', is_required: true, description_ar: 'إجمالي الفاتورة' },
      { key: 'paid_amount_aed', name_ar: 'المدفوع (درهم)', name_en: 'Paid Amount AED', type: 'currency', is_required: true, description_ar: 'المحصل منها' },
      { key: 'balance_due_aed', name_ar: 'المتبقي المستحق (درهم)', name_en: 'Balance Due AED', type: 'currency', is_required: true, description_ar: 'المتبقي' },
      { key: 'status', name_ar: 'حالة الفاتورة', name_en: 'Status', type: 'enum', is_required: true, description_ar: 'مسودة، مصدرة، مدفوعة بالكامل' },
    ],
  },
  // 11. تفاصيل الفواتير
  {
    table_name_ar: 'تفاصيل_الفواتير',
    table_name_en: 'invoice_details',
    id_prefix: 'IND',
    category: 'finance',
    description_ar: 'بنود الخدمات المضمنة داخل الفاتورة مع الضرائب والخصومات',
    columns: [
      { key: 'id', name_ar: 'معرف البند', name_en: 'Line ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'IND-00001' },
      { key: 'invoice_id', name_ar: 'معرف الفاتورة', name_en: 'Invoice ID', type: 'string', is_required: true, is_foreign_key: true, foreign_table: 'invoices', description_ar: 'الفاتورة الأم' },
      { key: 'description_ar', name_ar: 'الوصف بالعربية', name_en: 'Description AR', type: 'string', is_required: true, description_ar: 'وصف الخدمة' },
      { key: 'quantity', name_ar: 'الكمية', name_en: 'Quantity', type: 'number', is_required: true, description_ar: 'الكمية' },
      { key: 'unit_price_aed', name_ar: 'سعر الوحدة (درهم)', name_en: 'Unit Price AED', type: 'currency', is_required: true, description_ar: 'السعر الفردي' },
      { key: 'total_line_amount_aed', name_ar: 'إجمالي البند (درهم)', name_en: 'Total Line AED', type: 'currency', is_required: true, description_ar: 'المبلغ الإجمالي للبند' },
    ],
  },
  // 12. التحصيلات
  {
    table_name_ar: 'التحصيلات',
    table_name_en: 'collections_receipts',
    id_prefix: 'REC',
    category: 'finance',
    description_ar: 'إيصالات استلام الدفعات النقدية والبنكية من العملاء',
    columns: [
      { key: 'id', name_ar: 'رقم الإيصال', name_en: 'Receipt ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'REC-2026-00001' },
      { key: 'customer_id', name_ar: 'معرف العميل', name_en: 'Customer ID', type: 'string', is_required: true, is_foreign_key: true, foreign_table: 'customers', description_ar: 'العميل الدافع' },
      { key: 'receipt_date', name_ar: 'تاريخ التحصيل', name_en: 'Receipt Date', type: 'date', is_required: true, description_ar: 'تاريخ الاستلام' },
      { key: 'amount_aed', name_ar: 'المبلغ المحصل (درهم)', name_en: 'Amount AED', type: 'currency', is_required: true, description_ar: 'قيمة الدفعة' },
      { key: 'payment_method', name_ar: 'طريقة الدفع', name_en: 'Payment Method', type: 'enum', is_required: true, description_ar: 'نقداً، بطاقة، تحويل، محفظة' },
      { key: 'bank_account_id', name_ar: 'الحساب المودع فيه', name_en: 'Bank/Cash Account', type: 'string', is_required: true, is_foreign_key: true, foreign_table: 'cash_bank_accounts', description_ar: 'الصندوق أو البنك' },
    ],
  },
  // 13. توزيع الدفعات
  {
    table_name_ar: 'توزيع_الدفعات',
    table_name_en: 'payment_allocations',
    id_prefix: 'PAL',
    category: 'finance',
    description_ar: 'توزيع الدفعة الواحدة تناسبياً أو يدوياً على بنود الخدمات لتحديد الربحية والذمم بدقة',
    columns: [
      { key: 'id', name_ar: 'معرف التوزيع', name_en: 'Allocation ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'PAL-00001' },
      { key: 'receipt_id', name_ar: 'رقم الإيصال', name_en: 'Receipt ID', type: 'string', is_required: true, is_foreign_key: true, foreign_table: 'collections_receipts', description_ar: 'الإيصال المصدر' },
      { key: 'transaction_id', name_ar: 'معرف المعاملة', name_en: 'Transaction ID', type: 'string', is_required: true, is_foreign_key: true, foreign_table: 'transactions', description_ar: 'المعاملة المستفيدة' },
      { key: 'allocated_amount_aed', name_ar: 'المبلغ المخصص (درهم)', name_en: 'Allocated Amount AED', type: 'currency', is_required: true, description_ar: 'قيمة الحصة المخصصة' },
      { key: 'allocation_method', name_ar: 'طريقة التوزيع', name_en: 'Method', type: 'string', is_required: true, description_ar: 'تناسبي تلقائي أو يدوي' },
    ],
  },
  // 14. المصروفات
  {
    table_name_ar: 'المصروفات',
    table_name_en: 'expenses',
    id_prefix: 'EXP',
    category: 'finance',
    description_ar: 'المصروفات التشغيلية، الإيجارات، الفواتير، ومصروفات الصيانة مع سجل الموافقات',
    columns: [
      { key: 'id', name_ar: 'معرف المصروف', name_en: 'Expense ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'EXP-2026-00001' },
      { key: 'category', name_ar: 'بند المصروف', name_en: 'Category', type: 'string', is_required: true, description_ar: 'إيجار، مرافق، قرطاسية، تراخيص' },
      { key: 'account_id', name_ar: 'حساب المصروف في الدليل', name_en: 'GL Account ID', type: 'string', is_required: true, is_foreign_key: true, foreign_table: 'chart_of_accounts', description_ar: 'حساب المصروفات العامة' },
      { key: 'amount_aed', name_ar: 'المبلغ (درهم)', name_en: 'Amount AED', type: 'currency', is_required: true, description_ar: 'قيمة المصروف' },
      { key: 'paid_from_account_id', name_ar: 'مدفوع من حساب', name_en: 'Paid From Account', type: 'string', is_required: true, is_foreign_key: true, foreign_table: 'cash_bank_accounts', description_ar: 'الصندوق أو البنك' },
      { key: 'paid_to_payee', name_ar: 'المدفوع لأمره', name_en: 'Payee', type: 'string', is_required: true, description_ar: 'الجهة المستلمة' },
      { key: 'status', name_ar: 'حالة الاعتماد', name_en: 'Status', type: 'enum', is_required: true, description_ar: 'بانتظار الموافقة، معتمد، مرفوض' },
    ],
  },
  // 15. المدفوعات
  {
    table_name_ar: 'المدفوعات',
    table_name_en: 'disbursements',
    id_prefix: 'DIS',
    category: 'finance',
    description_ar: 'دفعات سداد مستحقات الموردين ومزودي الخدمات الخارجية',
    columns: [
      { key: 'id', name_ar: 'معرف الدفعة', name_en: 'Disbursement ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'DIS-2026-00001' },
      { key: 'supplier_id', name_ar: 'المزود / المورد', name_en: 'Supplier ID', type: 'string', is_required: true, is_foreign_key: true, foreign_table: 'suppliers_vendors', description_ar: 'المورد المستحق' },
      { key: 'amount_aed', name_ar: 'المبلغ المسدد (درهم)', name_en: 'Amount AED', type: 'currency', is_required: true, description_ar: 'قيمة السداد' },
      { key: 'payment_method', name_ar: 'طريقة الدفع', name_en: 'Payment Method', type: 'enum', is_required: true, description_ar: 'طريقة السداد' },
      { key: 'status', name_ar: 'حالة الدفعة', name_en: 'Status', type: 'enum', is_required: true, description_ar: 'معتمد ومسدد' },
    ],
  },
  // 16. دليل الحسابات
  {
    table_name_ar: 'دليل_الحسابات',
    table_name_en: 'chart_of_accounts',
    id_prefix: 'ACC',
    category: 'finance',
    description_ar: 'شجرة الحسابات المحاسبية المزدوجة المتوافقة مع طبيعة مكاتب الطباعة والخدمات بالإمارات',
    columns: [
      { key: 'id', name_ar: 'معرف الحساب', name_en: 'Account ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'ACC-1010' },
      { key: 'account_code', name_ar: 'رمز الحساب', name_en: 'Account Code', type: 'string', is_required: true, description_ar: 'مثال: 1010، 2010، 4010، 5010' },
      { key: 'account_name_ar', name_ar: 'اسم الحساب بالعربية', name_en: 'Account Name AR', type: 'string', is_required: true, description_ar: 'اسم الحساب' },
      { key: 'account_type', name_ar: 'نوع الحساب', name_en: 'Account Type', type: 'enum', is_required: true, description_ar: 'أصول، خصوم، حقوق ملكية، إيرادات، تكاليف، مصروفات' },
      { key: 'is_system_protected', name_ar: 'حساب نظام محمي من الحذف', name_en: 'Is System Protected', type: 'boolean', is_required: true, description_ar: 'لا يمكن حذفه للحفاظ على التوازن' },
      { key: 'current_balance_aed', name_ar: 'الرصيد الحالي (درهم)', name_en: 'Current Balance AED', type: 'currency', is_required: true, description_ar: 'رصيد الحساب الحالي' },
    ],
  },
  // 17. القيود المحاسبية
  {
    table_name_ar: 'القيود_المحاسبية',
    table_name_en: 'journal_entries',
    id_prefix: 'JRN',
    category: 'finance',
    description_ar: 'سندات القيود المحاسبية اليومية المزدوجة المشروطة بتطابق المدين مع الدائن',
    columns: [
      { key: 'id', name_ar: 'رقم القيد', name_en: 'Journal ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'JRN-2026-00001' },
      { key: 'entry_date', name_ar: 'تاريخ القيد', name_en: 'Entry Date', type: 'date', is_required: true, description_ar: 'تاريخ التسجيل' },
      { key: 'entry_type', name_ar: 'نوع القيد', name_en: 'Entry Type', type: 'string', is_required: true, description_ar: 'آلي من فاتورة، آلي من تحصيل، قيد يدوي، قيد تسوية' },
      { key: 'total_debit_aed', name_ar: 'إجمالي المدين (درهم)', name_en: 'Total Debit AED', type: 'currency', is_required: true, description_ar: 'مجموع أطراف المدين' },
      { key: 'total_credit_aed', name_ar: 'إجمالي الدائن (درهم)', name_en: 'Total Credit AED', type: 'currency', is_required: true, description_ar: 'مجموع أطراف الدائن' },
      { key: 'is_balanced', name_ar: 'متطابق محاسبياً', name_en: 'Is Balanced', type: 'boolean', is_required: true, description_ar: 'إجمالي المدين = إجمالي الدائن تماماً' },
      { key: 'status', name_ar: 'حالة القيد', name_en: 'Status', type: 'enum', is_required: true, description_ar: 'مسودة، معتمد، مرحل إلى الأستاذ العام' },
    ],
  },
  // 18. تفاصيل القيود
  {
    table_name_ar: 'تفاصيل_القيود',
    table_name_en: 'journal_entry_lines',
    id_prefix: 'JRL',
    category: 'finance',
    description_ar: 'أطراف القيد المحاسبي الفردية (حساب، مدين، دائن، شرح البند)',
    columns: [
      { key: 'id', name_ar: 'معرف الطرف', name_en: 'Line ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'JRL-00001' },
      { key: 'journal_id', name_ar: 'رقم القيد', name_en: 'Journal ID', type: 'string', is_required: true, is_foreign_key: true, foreign_table: 'journal_entries', description_ar: 'القيد الأم' },
      { key: 'account_id', name_ar: 'معرف الحساب', name_en: 'Account ID', type: 'string', is_required: true, is_foreign_key: true, foreign_table: 'chart_of_accounts', description_ar: 'الحساب المتأثر' },
      { key: 'debit_aed', name_ar: 'مدين (درهم)', name_en: 'Debit AED', type: 'currency', is_required: true, description_ar: 'مبلغ المدين' },
      { key: 'credit_aed', name_ar: 'دائن (درهم)', name_en: 'Credit AED', type: 'currency', is_required: true, description_ar: 'مبلغ الدائن' },
      { key: 'line_description_ar', name_ar: 'شرح البند بالعربية', name_en: 'Line Description AR', type: 'string', is_required: false, description_ar: 'بيان الطرف' },
    ],
  },
  // 19. الحسابات النقدية والبنكية
  {
    table_name_ar: 'الحسابات_النقدية_والبنكية',
    table_name_en: 'cash_bank_accounts',
    id_prefix: 'CBA',
    category: 'finance',
    description_ar: 'صناديق النقد والخزائن، الحسابات الجارية في بنوك الإمارات وأجهزة نقاط البيع POS',
    columns: [
      { key: 'id', name_ar: 'معرف الحساب المالي', name_en: 'Account ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'CBA-001' },
      { key: 'name_ar', name_ar: 'اسم الصندوق / الحساب', name_en: 'Name AR', type: 'string', is_required: true, description_ar: 'الصندوق الرئيسي، بنك أبوظبي التجاري ADCB' },
      { key: 'account_type', name_ar: 'النوع', name_en: 'Type', type: 'string', is_required: true, description_ar: 'صندوق نقدي، حساب بنكي، جهاز POS' },
      { key: 'current_balance_aed', name_ar: 'الرصيد الفعلي (درهم)', name_en: 'Current Balance AED', type: 'currency', is_required: true, description_ar: 'الرصيد الدفتري الحالي' },
      { key: 'is_active', name_ar: 'نشط', name_en: 'Is Active', type: 'boolean', is_required: true, description_ar: 'حالة التفعيل' },
    ],
  },
  // 20. التسويات البنكية
  {
    table_name_ar: 'التسويات_البنكية',
    table_name_en: 'bank_reconciliations',
    id_prefix: 'BRC',
    category: 'finance',
    description_ar: 'مطابقة كشوف حسابات البنوك مع القيود الدفترية وتسجيل الفروقات',
    columns: [
      { key: 'id', name_ar: 'معرف التسوية', name_en: 'Reconciliation ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'BRC-2026-001' },
      { key: 'bank_account_id', name_ar: 'الحساب البنكي', name_en: 'Bank Account ID', type: 'string', is_required: true, is_foreign_key: true, foreign_table: 'cash_bank_accounts', description_ar: 'البنك محل التسوية' },
      { key: 'statement_ending_balance_aed', name_ar: 'رصيد كشف الحساب البنكي', name_en: 'Bank Balance AED', type: 'currency', is_required: true, description_ar: 'الرصيد الوارد في كشف البنك' },
      { key: 'book_ending_balance_aed', name_ar: 'الرصيد الدفتري للنظام', name_en: 'Book Balance AED', type: 'currency', is_required: true, description_ar: 'الرصيد وفق دفاتر الشركة' },
      { key: 'difference_aed', name_ar: 'الفارق المحاسبي (درهم)', name_en: 'Difference AED', type: 'currency', is_required: true, description_ar: 'الفارق بين الرصيدين' },
      { key: 'status', name_ar: 'حالة التسوية', name_en: 'Status', type: 'enum', is_required: true, description_ar: 'مسودة، معتمد ومطابق' },
    ],
  },
  // 21. الموظفون
  {
    table_name_ar: 'الموظفون',
    table_name_en: 'employees',
    id_prefix: 'EMP',
    category: 'hr',
    description_ar: 'سجلات الموظفين، الرواتب الأساسية، البدلات، جداول العمل ومجلدات المستندات',
    columns: [
      { key: 'id', name_ar: 'الرقم الوظيفي', name_en: 'Employee ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'EMP-00001' },
      { key: 'full_name_ar', name_ar: 'الاسم بالعربية', name_en: 'Full Name AR', type: 'string', is_required: true, description_ar: 'اسم الموظف كاملاً' },
      { key: 'job_title_ar', name_ar: 'المسمى الوظيفي', name_en: 'Job Title AR', type: 'string', is_required: true, description_ar: 'طباع أول، أخصائي سياحة، محاسب' },
      { key: 'department', name_ar: 'القسم', name_en: 'Department', type: 'enum', is_required: true, description_ar: 'القسم التابع له' },
      { key: 'basic_salary_aed', name_ar: 'الراتب الأساسي (درهم)', name_en: 'Basic Salary AED', type: 'currency', is_required: true, description_ar: 'الأساس في احتساب الإضافي والبدلات' },
      { key: 'housing_allowance_aed', name_ar: 'بدل السكن (درهم)', name_en: 'Housing Allowance', type: 'currency', is_required: true, description_ar: 'بدل السكن الشهري' },
      { key: 'transport_allowance_aed', name_ar: 'بدل الانتقال (درهم)', name_en: 'Transport Allowance', type: 'currency', is_required: true, description_ar: 'بدل المواصلات' },
      { key: 'work_schedule_type', name_ar: 'نظام الدوام', name_en: 'Work Schedule', type: 'string', is_required: true, description_ar: 'فترة واحدة أو فترتان (8-14 و 18-22)' },
      { key: 'is_active', name_ar: 'على رأس العمل', name_en: 'Is Active', type: 'boolean', is_required: true, description_ar: 'حالة الموظف' },
    ],
  },
  // 22. الحضور والانصراف
  {
    table_name_ar: 'الحضور_والانصراف',
    table_name_en: 'attendance_logs',
    id_prefix: 'ATT',
    category: 'hr',
    description_ar: 'سجل الحضور اليومي للفترتين الصباحية والمسائية مع حساب ساعات التأخير والإضافي',
    columns: [
      { key: 'id', name_ar: 'معرف السجل', name_en: 'Attendance ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'ATT-00001' },
      { key: 'employee_id', name_ar: 'الموظف', name_en: 'Employee ID', type: 'string', is_required: true, is_foreign_key: true, foreign_table: 'employees', description_ar: 'الموظف' },
      { key: 'date', name_ar: 'التاريخ', name_en: 'Date', type: 'date', is_required: true, description_ar: 'تاريخ يوم العمل' },
      { key: 'total_worked_hours', name_ar: 'إجمالي ساعات العمل', name_en: 'Worked Hours', type: 'number', is_required: true, description_ar: 'الصافي القياسي المستهدف 9 ساعات' },
      { key: 'late_minutes', name_ar: 'دقائق التأخير', name_en: 'Late Minutes', type: 'number', is_required: true, description_ar: 'دقائق التأخر عن بداية الوردية' },
      { key: 'overtime_hours', name_ar: 'ساعات العمل الإضافي', name_en: 'Overtime Hours', type: 'number', is_required: true, description_ar: 'الساعات المعتمدة بعد الدوام' },
      { key: 'status', name_ar: 'الحالة اليومية', name_en: 'Status', type: 'string', is_required: true, description_ar: 'حاضر، متأخر، غائب، إجازة' },
    ],
  },
  // 23. الإجازات
  {
    table_name_ar: 'الإجازات',
    table_name_en: 'leaves',
    id_prefix: 'LEA',
    category: 'hr',
    description_ar: 'طلبات الإجازات السنوية والمرضية والطارئة وخصم أيام الإجازة بدون راتب',
    columns: [
      { key: 'id', name_ar: 'رقم طلب الإجازة', name_en: 'Leave ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'LEA-2026-001' },
      { key: 'employee_id', name_ar: 'الموظف', name_en: 'Employee ID', type: 'string', is_required: true, is_foreign_key: true, foreign_table: 'employees', description_ar: 'الموظف صاحب الطلب' },
      { key: 'leave_type', name_ar: 'نوع الإجازة', name_en: 'Leave Type', type: 'string', is_required: true, description_ar: 'سنوية، مرضية، طارئة، بدون راتب' },
      { key: 'days_count', name_ar: 'عدد الأيام', name_en: 'Days Count', type: 'number', is_required: true, description_ar: 'المدة الإجمالية' },
      { key: 'is_paid', name_ar: 'مدفوعة الراتب', name_en: 'Is Paid', type: 'boolean', is_required: true, description_ar: 'هل تخصم من الراتب أم مدفوعة' },
      { key: 'status', name_ar: 'حالة الطلب', name_en: 'Status', type: 'enum', is_required: true, description_ar: 'بانتظار الموافقة، معتمد، مرفوض' },
    ],
  },
  // 24. الرواتب
  {
    table_name_ar: 'الرواتب',
    table_name_en: 'payroll',
    id_prefix: 'PAY',
    category: 'hr',
    description_ar: 'مسير الرواتب الشهري المعتمد على معادلة 26 يوم عمل + العمولات والإضافي والخصومات',
    columns: [
      { key: 'id', name_ar: 'مسير الراتب', name_en: 'Payroll Slip ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'PAY-2026-08-EMP001' },
      { key: 'month_year', name_ar: 'الشهر والسنة', name_en: 'Month Year', type: 'string', is_required: true, description_ar: '2026-08' },
      { key: 'employee_id', name_ar: 'الموظف', name_en: 'Employee ID', type: 'string', is_required: true, is_foreign_key: true, foreign_table: 'employees', description_ar: 'الموظف المستحق' },
      { key: 'basic_salary_aed', name_ar: 'الراتب الأساسي (درهم)', name_en: 'Basic Salary', type: 'currency', is_required: true, description_ar: 'الراتب الأساسي' },
      { key: 'approved_commissions_aed', name_ar: 'العمولات المعتمدة (درهم)', name_en: 'Approved Commissions', type: 'currency', is_required: true, description_ar: 'عمولات المبيعات المحصلة' },
      { key: 'approved_overtime_aed', name_ar: 'الإضافي المعتمد (درهم)', name_en: 'Approved Overtime', type: 'currency', is_required: true, description_ar: 'قيمة الساعات الإضافية' },
      { key: 'deductions_aed', name_ar: 'الخصومات والغياب (درهم)', name_en: 'Deductions AED', type: 'currency', is_required: true, description_ar: 'خصومات الغياب والجزاءات' },
      { key: 'net_salary_aed', name_ar: 'صافي الراتب المستحق (درهم)', name_en: 'Net Payable Salary', type: 'currency', is_required: true, description_ar: 'الأساسي + البدلات + العمولات + الإضافي - الخصومات' },
      { key: 'status', name_ar: 'حالة المسير', name_en: 'Status', type: 'enum', is_required: true, description_ar: 'مسودة، مراجعة HR، مراجعة الحسابات، معتمد ومقفل' },
    ],
  },
  // 25. العمولات
  {
    table_name_ar: 'العمولات',
    table_name_en: 'commissions',
    id_prefix: 'COM',
    category: 'hr',
    description_ar: 'سجل استحقاق العمولات الفردية المرتبطة باكتمال التحصيل من العملاء',
    columns: [
      { key: 'id', name_ar: 'معرف العمولة', name_en: 'Commission ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'COM-2026-0001' },
      { key: 'employee_id', name_ar: 'الموظف المستحق', name_en: 'Employee ID', type: 'string', is_required: true, is_foreign_key: true, foreign_table: 'employees', description_ar: 'الموظف' },
      { key: 'transaction_id', name_ar: 'المعاملة المرتبطة', name_en: 'Transaction ID', type: 'string', is_required: true, is_foreign_key: true, foreign_table: 'transactions', description_ar: 'المعاملة المحققة' },
      { key: 'calculated_commission_aed', name_ar: 'قيمة العمولة (درهم)', name_en: 'Commission Amount AED', type: 'currency', is_required: true, description_ar: 'المبلغ المحتسب' },
      { key: 'is_fully_collected', name_ar: 'تم التحصيل بالكامل', name_en: 'Is Fully Collected', type: 'boolean', is_required: true, description_ar: 'شرط الصرف' },
      { key: 'status', name_ar: 'حالة العمولة', name_en: 'Status', type: 'enum', is_required: true, description_ar: 'مستحقة، معتمدة، مصروفة مع الراتب' },
    ],
  },
  // 26. أداء الموظفين
  {
    table_name_ar: 'أداء_الموظفين',
    table_name_en: 'employee_performance',
    id_prefix: 'PRF',
    category: 'hr',
    description_ar: 'متابعة أهداف الموظفين الشهرية ونسب الإنجاز والإيراد المحقق',
    columns: [
      { key: 'id', name_ar: 'معرف سجل الأداء', name_en: 'Performance ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'PRF-2026-08-01' },
      { key: 'employee_id', name_ar: 'الموظف', name_en: 'Employee ID', type: 'string', is_required: true, is_foreign_key: true, foreign_table: 'employees', description_ar: 'الموظف' },
      { key: 'monthly_revenue_target_aed', name_ar: 'الهدف الشهري للإيراد (درهم)', name_en: 'Revenue Target AED', type: 'currency', is_required: true, description_ar: 'المستهدف' },
      { key: 'achieved_revenue_aed', name_ar: 'الإيراد المحقق الفعلي (درهم)', name_en: 'Achieved Revenue AED', type: 'currency', is_required: true, description_ar: 'المحقق' },
      { key: 'target_achievement_pct', name_ar: 'نسبة تحقيق الهدف %', name_en: 'Achievement %', type: 'number', is_required: true, description_ar: 'النسبة المئوية' },
    ],
  },
  // 27. المستندات
  {
    table_name_ar: 'المستندات',
    table_name_en: 'documents',
    id_prefix: 'DOC',
    category: 'operations',
    description_ar: 'سجل وثائق Google Drive ومتابعة تنبيهات انتهاء الهويات والجوازات والرخص (60، 30، 7، 0 يوم)',
    columns: [
      { key: 'id', name_ar: 'رقم المستند', name_en: 'Doc ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'DOC-00001' },
      { key: 'title_ar', name_ar: 'عنوان المستند بالعربية', name_en: 'Title AR', type: 'string', is_required: true, description_ar: 'هوية إماراتية، جواز سفر، رخصة تجارية' },
      { key: 'document_type', name_ar: 'نوع الوثيقة', name_en: 'Document Type', type: 'enum', is_required: true, description_ar: 'الهوية، الجواز، عقد العمل، الفحص الطبي' },
      { key: 'file_name', name_ar: 'اسم الملف', name_en: 'File Name', type: 'string', is_required: true, description_ar: 'اسم الملف المرفوع' },
      { key: 'expiry_date', name_ar: 'تاريخ الانتهاء', name_en: 'Expiry Date', type: 'date', is_required: false, description_ar: 'يستخدم للتنبيهات الآلية' },
      { key: 'is_expired', name_ar: 'منتهي الصلاحية', name_en: 'Is Expired', type: 'boolean', is_required: true, description_ar: 'تحديث تلقائي' },
      { key: 'related_customer_id', name_ar: 'العميل المرتبط', name_en: 'Customer ID', type: 'string', is_required: false, is_foreign_key: true, foreign_table: 'customers', description_ar: 'العميل' },
      { key: 'related_employee_id', name_ar: 'الموظف المرتبط', name_en: 'Employee ID', type: 'string', is_required: false, is_foreign_key: true, foreign_table: 'employees', description_ar: 'الموظف' },
    ],
  },
  // 28. المهام
  {
    table_name_ar: 'المهام',
    table_name_en: 'tasks',
    id_prefix: 'TSK',
    category: 'operations',
    description_ar: 'مهام العمل الإدارية والتشغيلية وتوزيع المسؤوليات على الموظفين',
    columns: [
      { key: 'id', name_ar: 'معرف المهمة', name_en: 'Task ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'TSK-0001' },
      { key: 'title_ar', name_ar: 'عنوان المهمة بالعربية', name_en: 'Title AR', type: 'string', is_required: true, description_ar: 'عنوان المهمة' },
      { key: 'assigned_to_employee_id', name_ar: 'المسند إليه', name_en: 'Assigned To', type: 'string', is_required: true, is_foreign_key: true, foreign_table: 'employees', description_ar: 'الموظف المكلف' },
      { key: 'due_date', name_ar: 'تاريخ الاستحقاق', name_en: 'Due Date', type: 'date', is_required: true, description_ar: 'الموعد النهائي' },
      { key: 'priority', name_ar: 'الأولوية', name_en: 'Priority', type: 'string', is_required: true, description_ar: 'منخفضة، متوسطة، عالية، عاجلة' },
      { key: 'status', name_ar: 'حالة المهمة', name_en: 'Status', type: 'string', is_required: true, description_ar: 'جديدة، قيد التنفيذ، مكتملة' },
    ],
  },
  // 29. الموافقات
  {
    table_name_ar: 'الموافقات',
    table_name_en: 'approvals',
    id_prefix: 'APP',
    category: 'core',
    description_ar: 'سجل تدفق الموافقات (المصروفات، الخصومات الاستثنائية، الاستردادات، وتعديل الحضور)',
    columns: [
      { key: 'id', name_ar: 'رقم طلب الموافقة', name_en: 'Approval ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'APP-0001' },
      { key: 'approval_type', name_ar: 'نوع العملية', name_en: 'Operation Type', type: 'enum', is_required: true, description_ar: 'مصروف، خصم، استرداد، إجازة' },
      { key: 'reference_id', name_ar: 'المرجع المرتبط', name_en: 'Reference ID', type: 'string', is_required: true, description_ar: 'رقم المصروف أو المعاملة' },
      { key: 'requester_name', name_ar: 'مقدم الطلب', name_en: 'Requester', type: 'string', is_required: true, description_ar: 'الموظف طالب الاعتماد' },
      { key: 'amount_aed', name_ar: 'المبلغ المعني (درهم)', name_en: 'Amount AED', type: 'currency', is_required: false, description_ar: 'القيمة المالية إن وجدت' },
      { key: 'status', name_ar: 'حالة الاعتماد', name_en: 'Status', type: 'enum', is_required: true, description_ar: 'بانتظار الموافقة، معتمد، مرفوض' },
    ],
  },
  // 30. العطلات والمناسبات
  {
    table_name_ar: 'العطلات_والمناسبات',
    table_name_en: 'holidays_events',
    id_prefix: 'HOL',
    category: 'hr',
    description_ar: 'أيام العطلات الرسمية المعتمدة في دولة الإمارات (الأعياد الوطنية، الأعياد الدينية)',
    columns: [
      { key: 'id', name_ar: 'معرف العطلة', name_en: 'Holiday ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'HOL-001' },
      { key: 'holiday_name_ar', name_ar: 'اسم العطلة بالعربية', name_en: 'Holiday Name AR', type: 'string', is_required: true, description_ar: 'اليوم الوطني، عيد الفطر، رأس السنة' },
      { key: 'start_date', name_ar: 'تاريخ البداية', name_en: 'Start Date', type: 'date', is_required: true, description_ar: 'بداية العطلة' },
      { key: 'end_date', name_ar: 'تاريخ النهاية', name_en: 'End Date', type: 'date', is_required: true, description_ar: 'نهاية العطلة' },
      { key: 'days_count', name_ar: 'عدد الأيام', name_en: 'Days', type: 'number', is_required: true, description_ar: 'عدد أيام الإجازة' },
      { key: 'is_paid', name_ar: 'عطلة مدفوعة', name_en: 'Is Paid', type: 'boolean', is_required: true, description_ar: 'عطلة رسمية مدفوعة الأجر' },
    ],
  },
  // 31. العملاء المحتملون
  {
    table_name_ar: 'العملاء_المحتملون',
    table_name_en: 'crm_leads',
    id_prefix: 'LED',
    category: 'crm',
    description_ar: 'إدارة مسار المبيعات واستفسارات العملاء ومصادر التواصل وقيمة الفرص المتوقعة',
    columns: [
      { key: 'id', name_ar: 'معرف الاستفسار', name_en: 'Lead ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'LED-0001' },
      { key: 'customer_name', name_ar: 'اسم العميل المحتمل', name_en: 'Customer Name', type: 'string', is_required: true, description_ar: 'الاسم أو الشركة' },
      { key: 'phone', name_ar: 'رقم الهاتف', name_en: 'Phone', type: 'string', is_required: true, description_ar: 'رقم الاتصال' },
      { key: 'lead_source', name_ar: 'مصدر التواصل', name_en: 'Source', type: 'string', is_required: true, description_ar: 'زيارة، اتصال، واتساب، توصية' },
      { key: 'estimated_value_aed', name_ar: 'القيمة المتوقعة (درهم)', name_en: 'Estimated Value AED', type: 'currency', is_required: true, description_ar: 'القيمة التقديرية' },
      { key: 'stage', name_ar: 'مرحلة المسار', name_en: 'Stage', type: 'string', is_required: true, description_ar: 'استفسار جديد، متابعة، عرض سعر، تحول لمعاملة' },
    ],
  },
  // 32. المتابعات
  {
    table_name_ar: 'المتابعات',
    table_name_en: 'crm_followups',
    id_prefix: 'FLW',
    category: 'crm',
    description_ar: 'سجل الاتصالات والمتابعات الدورية مع العملاء المحتملين وتحديد مواعيد الإجراء القادم',
    columns: [
      { key: 'id', name_ar: 'معرف المتابعة', name_en: 'Followup ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'FLW-0001' },
      { key: 'lead_id', name_ar: 'العميل المحتمل', name_en: 'Lead ID', type: 'string', is_required: true, is_foreign_key: true, foreign_table: 'crm_leads', description_ar: 'الفرصة المعنية' },
      { key: 'followup_date', name_ar: 'تاريخ المتابعة', name_en: 'Followup Date', type: 'date', is_required: true, description_ar: 'تاريخ الاتصال' },
      { key: 'summary_ar', name_ar: 'ملخص المحادثة', name_en: 'Summary AR', type: 'string', is_required: true, description_ar: 'ما تم الاتفاق عليه' },
      { key: 'next_action_date', name_ar: 'تاريخ الإجراء القادم', name_en: 'Next Action Date', type: 'date', is_required: false, description_ar: 'الموعد القادم' },
    ],
  },
  // 33. سجل الإشعارات
  {
    table_name_ar: 'سجل_الإشعارات',
    table_name_en: 'notification_logs',
    id_prefix: 'NOT',
    category: 'system',
    description_ar: 'سجل إرسال رسائل البريد الإلكتروني وتنبيهات انتهاء الوثائق والموافقات',
    columns: [
      { key: 'id', name_ar: 'معرف الإشعار', name_en: 'Notification ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'NOT-0001' },
      { key: 'notification_type', name_ar: 'نوع الإشعار', name_en: 'Type', type: 'string', is_required: true, description_ar: 'انتهاء مستند، موافقة، إغلاق شهري' },
      { key: 'recipient_email', name_ar: 'البريد المرسل إليه', name_en: 'Recipient Email', type: 'string', is_required: true, description_ar: 'عنوان البريد الإلكتروني' },
      { key: 'subject_ar', name_ar: 'عنوان الرسالة', name_en: 'Subject', type: 'string', is_required: true, description_ar: 'موضوع الإشعار' },
      { key: 'delivery_status', name_ar: 'حالة التسليم', name_en: 'Delivery Status', type: 'string', is_required: true, description_ar: 'تم الإرسال بنجاح، فشل' },
    ],
  },
  // 34. سجل التعديلات
  {
    table_name_ar: 'سجل_التعديلات',
    table_name_en: 'audit_logs',
    id_prefix: 'AUD',
    category: 'system',
    description_ar: 'سجل التدقيق الأمني المحمي لتسجيل كافة عمليات الإنشاء والتعديل والحذف والقيم السابقة والجديدة',
    columns: [
      { key: 'id', name_ar: 'معرف التدقيق', name_en: 'Audit ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'AUD-00001' },
      { key: 'user_email', name_ar: 'بريد المستخدم', name_en: 'User Email', type: 'string', is_required: true, description_ar: 'حساب منفذ العملية' },
      { key: 'action_type', name_ar: 'نوع العملية', name_en: 'Action Type', type: 'string', is_required: true, description_ar: 'إنشاء، تعديل، حذف، ترحيل، إغلاق' },
      { key: 'module_name', name_ar: 'الوحدة / الشاشة', name_en: 'Module', type: 'string', is_required: true, description_ar: 'المعاملات، الفواتير، الحسابات' },
      { key: 'record_id', name_ar: 'معرف السجل المعني', name_en: 'Record ID', type: 'string', is_required: true, description_ar: 'رقم المعاملة أو القيد' },
      { key: 'change_summary_ar', name_ar: 'بيان التغيير بالعربية', name_en: 'Change Summary', type: 'string', is_required: true, description_ar: 'وصف ما تم تغييره' },
    ],
  },
  // 35. الأرشيف
  {
    table_name_ar: 'الأرشيف',
    table_name_en: 'archive_records',
    id_prefix: 'ARC',
    category: 'system',
    description_ar: 'سجل الإغلاقات الشهرية وقفل التعديلات على الفترات المالية المنتهية',
    columns: [
      { key: 'id', name_ar: 'معرف الأرشيف', name_en: 'Archive ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'ARC-2026-08' },
      { key: 'period_month_year', name_ar: 'الفترة المغلقة', name_en: 'Period', type: 'string', is_required: true, description_ar: 'الشهر والسنة 2026-08' },
      { key: 'total_revenue_aed', name_ar: 'إجمالي الإيراد المقفل (درهم)', name_en: 'Closed Revenue AED', type: 'currency', is_required: true, description_ar: 'الإيراد المحقق' },
      { key: 'total_profit_aed', name_ar: 'صافي الربح المقفل (درهم)', name_en: 'Closed Profit AED', type: 'currency', is_required: true, is_sensitive: true, description_ar: 'الربح الصافي للفترة' },
      { key: 'is_locked', name_ar: 'الفترة مقفلة', name_en: 'Is Locked', type: 'boolean', is_required: true, description_ar: 'تمنع التعديل العادي' },
    ],
  },
  // 36. النسخ الاحتياطية
  {
    table_name_ar: 'النسخ_الاحتياطية',
    table_name_en: 'system_backups',
    id_prefix: 'BKP',
    category: 'system',
    description_ar: 'سجل النسخ الاحتياطية لقواعد بيانات النظام مع الحماية الدائمة',
    columns: [
      { key: 'id', name_ar: 'معرف النسخة', name_en: 'Backup ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'BKP-2026-08-15-001' },
      { key: 'backup_type', name_ar: 'نوع النسخة', name_en: 'Type', type: 'string', is_required: true, description_ar: 'تلقائي يومي، إغلاق شهري، يدوي' },
      { key: 'records_count', name_ar: 'عدد السجلات المنسوخة', name_en: 'Records Count', type: 'number', is_required: true, description_ar: 'إجمالي السجلات' },
      { key: 'is_permanent_protected', name_ar: 'نسخة دائمة محمية', name_en: 'Permanent Protected', type: 'boolean', is_required: true, description_ar: 'لا يمكن حذفها من المستخدمين العاديين' },
    ],
  },
  // 37. دليل الاستخدام والتدريب
  {
    table_name_ar: 'دليل_الاستخدام_والتدريب',
    table_name_en: 'training_modules',
    id_prefix: 'TRN',
    category: 'knowledge',
    description_ar: 'الموسوعة التدريبية التفاعلية وإجراءات العمل القياسية (SOPs) واختبارات الموظفين',
    columns: [
      { key: 'id', name_ar: 'معرف الوحدة التدريبية', name_en: 'Module ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'TRN-001' },
      { key: 'title_ar', name_ar: 'عنوان الدليل التدريبي', name_en: 'Title AR', type: 'string', is_required: true, description_ar: 'دليل المعاملات، دليل المحاسبة' },
      { key: 'category', name_ar: 'الفئة', name_en: 'Category', type: 'string', is_required: true, description_ar: 'المعاملات، المحاسبة، الموارد البشرية' },
      { key: 'estimated_minutes', name_ar: 'الوقت التقديري (دقائق)', name_en: 'Minutes', type: 'number', is_required: true, description_ar: 'مدة دراسة الدليل' },
    ],
  },
  // 38. إدارة قوالب المستندات
  {
    table_name_ar: 'إدارة_قوالب_المستندات',
    table_name_en: 'document_templates',
    id_prefix: 'TPL',
    category: 'system',
    description_ar: 'قوالب النصوص العربية المعتمدة للإيصالات، الفواتير، عروض الأسعار والمستندات الرسمية',
    columns: [
      { key: 'id', name_ar: 'معرف القالب', name_en: 'Template ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'TPL-001' },
      { key: 'document_type', name_ar: 'نوع المستند', name_en: 'Document Type', type: 'string', is_required: true, description_ar: 'نوع المستند المرتبط به القالب' },
      { key: 'name_ar', name_ar: 'اسم القالب بالعربية', name_en: 'Name AR', type: 'string', is_required: true, description_ar: 'قالب الإيصالات الرسمي' },
      { key: 'version', name_ar: 'رقم الإصدار', name_en: 'Version', type: 'number', is_required: true, description_ar: '1, 2, 3...' },
      { key: 'is_active', name_ar: 'القالب النشط', name_en: 'Is Active', type: 'boolean', is_required: true, description_ar: 'قالب وحيد نشط لكل نوع مستند' },
      { key: 'title_ar', name_ar: 'عنوان المستند بالعربية', name_en: 'Title AR', type: 'string', is_required: true, description_ar: 'إيصال استلام واستحقاق ضريبي' },
      { key: 'company_name_ar', name_ar: 'اسم المركز بالعربية', name_en: 'Company Name AR', type: 'string', is_required: true, description_ar: 'جلف ساند للطباعة والخدمات' },
    ],
  },
  // 39. أرشيف إصدارات القوالب
  {
    table_name_ar: 'أرشيف_إصدارات_القوالب',
    table_name_en: 'document_template_versions',
    id_prefix: 'TPV',
    category: 'system',
    description_ar: 'سجل الإصدارات السابقة لقوالب المستندات مع إمكانية الاسترجاع الفوري',
    columns: [
      { key: 'id', name_ar: 'معرف الإصدار', name_en: 'Version ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'TPV-001' },
      { key: 'template_id', name_ar: 'معرف القالب', name_en: 'Template ID', type: 'string', is_required: true, is_foreign_key: true, foreign_table: 'document_templates', description_ar: 'TPL-001' },
      { key: 'version_number', name_ar: 'رقم الإصدار', name_en: 'Version Number', type: 'number', is_required: true, description_ar: 'رقم الإصدار السابق' },
      { key: 'change_summary_ar', name_ar: 'ملخص التعديل', name_en: 'Change Summary', type: 'string', is_required: true, description_ar: 'تحديث الشروط والأحكام' },
    ],
  },
  // 40. رموز التحقق الإلكتروني للإيصالات
  {
    table_name_ar: 'رموز_التحقق_الإلكتروني',
    table_name_en: 'receipt_verification_tokens',
    id_prefix: 'RVT',
    category: 'system',
    description_ar: 'رموز التحقق المشفرة للتحقق الآمن من صحة وموثوقية الإيصالات والمستندات المطبوعة',
    columns: [
      { key: 'id', name_ar: 'المعرف الفريد', name_en: 'Token ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'RVT-001' },
      { key: 'token', name_ar: 'رمز التحقق الآمن', name_en: 'Secure Token', type: 'string', is_required: true, description_ar: 'رمز عشوائي مشفر فريد' },
      { key: 'receipt_number', name_ar: 'رقم الإيصال', name_en: 'Receipt Number', type: 'string', is_required: true, description_ar: 'REC-2026-00001' },
      { key: 'status', name_ar: 'حالة الصلاحية', name_en: 'Status', type: 'enum', is_required: true, description_ar: 'VALID, REVOKED, EXPIRED' },
    ],
  },
  // 41. سجل استعلامات التحقق
  {
    table_name_ar: 'سجل_استعلامات_التحقق',
    table_name_en: 'receipt_verification_logs',
    id_prefix: 'RVL',
    category: 'system',
    description_ar: 'سجل تدقيق لكافة محاولات مسح واستعلام رموز الـ QR للإيصالات مع حماية الخصوصية',
    columns: [
      { key: 'id', name_ar: 'المعرف', name_en: 'Log ID', type: 'string', is_required: true, is_primary_key: true, description_ar: 'RVL-001' },
      { key: 'token', name_ar: 'الرمز المستعلم', name_en: 'Token', type: 'string', is_required: true, description_ar: 'الرمز المشفر' },
      { key: 'verification_status', name_ar: 'نتيجة الفحص', name_en: 'Status Result', type: 'string', is_required: true, description_ar: 'صحيح، ملغى، منتهي، غير موجود' },
    ],
  },
];

export const TableCategory = {
  CORE_SETUP: 'core',
  CRM_CUSTOMERS: 'crm',
  SERVICES_PRICING: 'services',
  OPERATIONS: 'operations',
  INVOICING_COLLECTIONS: 'invoicing',
  FINANCE_ACCOUNTING: 'accounting',
  HR_PAYROLL: 'hr',
  GOVERNANCE_SYSTEM: 'system',
} as const;

export type TableCategoryType = typeof TableCategory[keyof typeof TableCategory];

export type TableName =
  | 'users_permissions'
  | 'system_settings'
  | 'branches'
  | 'customers'
  | 'services_pricing'
  | 'suppliers_vendors'
  | 'transactions'
  | 'transaction_details'
  | 'bookings'
  | 'invoices'
  | 'invoice_details'
  | 'collections_receipts'
  | 'payment_allocations'
  | 'expenses'
  | 'disbursements'
  | 'chart_of_accounts'
  | 'journal_entries'
  | 'journal_entry_lines'
  | 'cash_bank_accounts'
  | 'bank_reconciliations'
  | 'employees'
  | 'attendance_logs'
  | 'leaves'
  | 'payroll'
  | 'commissions'
  | 'employee_performance'
  | 'documents'
  | 'tasks'
  | 'approvals'
  | 'holidays_events'
  | 'crm_leads'
  | 'crm_followups'
  | 'notification_logs'
  | 'audit_logs'
  | 'archive_records'
  | 'system_backups'
  | 'training_modules'
  | 'document_templates'
  | 'document_template_versions'
  | 'receipt_verification_tokens'
  | 'receipt_verification_logs'
  | 'auth_sessions'
  | 'auth_tokens'
  | 'security_audit_logs';

export interface FieldDefinition {
  name: string;
  labelAr: string;
  labelEn: string;
  type: string;
  required: boolean;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  foreignTable?: string;
  isSensitive?: boolean;
  description?: string;
}

export interface TableRelation {
  fromField: string;
  toTable: string;
  toField: string;
  type: string;
}

export interface TableMetadata {
  nameAr: string;
  nameEn: string;
  idPrefix: string;
  category: string;
  description: string;
  fields: FieldDefinition[];
  relations: TableRelation[];
}

export const TABLE_SCHEMAS: Record<TableName, TableMetadata> = ALL_36_TABLE_SCHEMAS.reduce((acc, schema) => {
  const fields: FieldDefinition[] = schema.columns.map((c) => ({
    name: c.key,
    labelAr: c.name_ar,
    labelEn: c.name_en,
    type: c.type,
    required: c.is_required,
    isPrimaryKey: c.is_primary_key,
    isForeignKey: c.is_foreign_key,
    foreignTable: c.foreign_table,
    isSensitive: c.is_sensitive,
    description: c.description_ar,
  }));

  const relations: TableRelation[] = schema.columns
    .filter((c) => c.is_foreign_key && c.foreign_table)
    .map((c) => ({
      fromField: c.key,
      toTable: c.foreign_table!,
      toField: 'id',
      type: '1:N',
    }));

  acc[schema.table_name_en as TableName] = {
    nameAr: schema.table_name_ar.replace(/_/g, ' '),
    nameEn: schema.table_name_en,
    idPrefix: schema.id_prefix,
    category: schema.category,
    description: schema.description_ar,
    fields,
    relations,
  };

  return acc;
}, {} as Record<TableName, TableMetadata>);

