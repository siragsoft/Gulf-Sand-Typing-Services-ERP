export type Language = 'ar' | 'en';

export interface Translations {
  appName: string;
  location: string;
  phaseBadge: string;
  subtitle: string;
  roleSimLabel: string;
  roles: {
    system_admin: string;
    manager: string;
    supervisor: string;
    accounts: string;
    operations: string;
    hr: string;
    viewer: string;
  };
  quickActions: {
    title: string;
    newTransaction: string;
    newCustomer: string;
    newInvoice: string;
    newExpense: string;
    newJournalEntry: string;
    addRecord: string;
    unauthorizedBadge: string;
  };
  actions: {
    runTests: string;
    restoreDemo: string;
    resetEmpty: string;
    exportJson: string;
    importJson: string;
    close: string;
    viewDetails: string;
    editRecord: string;
    deleteRecord: string;
    archiveRecord: string;
    searchTables: string;
    searchData: string;
    allCategories: string;
    rerunTests: string;
    runningTests: string;
    toggleTables: string;
  };
  stats: {
    totalTables: string;
    tablesDesc: string;
    totalRecords: string;
    recordsDesc: string;
    servicesCatalog: string;
    servicesDesc: string;
    customersCRM: string;
    customersDesc: string;
    chartOfAccounts: string;
    accountsDesc: string;
    systemIntegrity: string;
    integrityDesc: string;
  };
  categories: {
    core: string;
    crm: string;
    services: string;
    operations: string;
    invoicing: string;
    accounting: string;
    hr: string;
    system: string;
  };
  tabs: {
    dashboard: string;
    customers: string;
    templates: string;
    reports: string;
    accounting: string;
    hr: string;
    data: string;
    operationsHub: string;
    approvals: string;
    schema: string;
    tests: string;
  };
  tableHeaders: {
    id: string;
    actions: string;
    fieldName: string;
    label: string;
    type: string;
    required: string;
    descriptionRules: string;
  };
  notifications: {
    exportSuccess: string;
    importSuccess: string;
    importError: string;
    demoResetConfirm: string;
    demoResetSuccess: string;
    emptyResetConfirm: string;
    emptyResetSuccess: string;
    costProfitHidden: string;
    emptyRecordsTitle: string;
    emptyRecordsDesc: string;
    deleteConfirm: string;
    deleteSuccess: string;
    unauthorizedAction: string;
  };
  schemaMeta: {
    governanceTitle: string;
    codeTableName: string;
    category: string;
    idPrefixFormat: string;
    foreignKeysTitle: string;
    noForeignKeys: string;
    columnsTitle: string;
    requiredBadge: string;
    optionalBadge: string;
    recordDetails: string;
    hiddenRoleBadge: string;
  };
  testsMeta: {
    title: string;
    subtitle: string;
    testsPassing: string;
  };
}

export const translations: Record<Language, Translations> = {
  ar: {
    appName: 'جلف ساند للطباعة والخدمات',
    location: 'العين - أبوظبي',
    phaseBadge: 'المرحلة التشغيلية المتكاملة (36 جدولاً مع الصلاحيات)',
    subtitle: 'جلف ساند للطباعة والخدمات (GULFSAND TYPING SERVICES) • منظومة العمليات، المعاملات، الفواتير، والمالية الموحدة',
    roleSimLabel: 'الدور النشط:',
    roles: {
      system_admin: 'مدير النظام (System Admin)',
      manager: 'المدير التنفيذي (Manager)',
      supervisor: 'مشرف العمليات (Supervisor)',
      accounts: 'المحاسب المالي (Accounts)',
      operations: 'موظف العمليات (Operations)',
      hr: 'مسؤول الموارد البشرية (HR)',
      viewer: 'مشاهد فقط (Viewer)',
    },
    quickActions: {
      title: 'إجراءات سريعة فورية:',
      newTransaction: 'معاملة جديدة',
      newCustomer: 'عميل جديد',
      newInvoice: 'فاتورة ضريبية',
      newExpense: 'سند صرف',
      newJournalEntry: 'قيد محاسبي',
      addRecord: 'إضافة سجل',
      unauthorizedBadge: 'غير مصرح لدورك',
    },
    actions: {
      runTests: 'فحص التكاملية',
      restoreDemo: 'استعادة بيانات العرض',
      resetEmpty: 'تصفير لقاعدة نظيفة',
      exportJson: 'تصدير JSON',
      importJson: 'استيراد JSON',
      close: 'إإغلاق',
      viewDetails: 'عرض',
      editRecord: 'تعديل',
      deleteRecord: 'حذف',
      archiveRecord: 'أرشفة',
      searchTables: 'بحث في أسماء الجداول...',
      searchData: 'بحث في السجلات...',
      allCategories: 'الكل',
      rerunTests: 'إعادة تشغيل الاختبارات',
      runningTests: 'جاري الفحص...',
      toggleTables: 'قائمة الجداول الـ 36',
    },
    stats: {
      totalTables: 'إجمالي الجداول',
      tablesDesc: '36 جدولاً مترابطاً',
      totalRecords: 'إجمالي السجلات',
      recordsDesc: 'محدثة في الوقت الفعلي',
      servicesCatalog: 'دليل الخدمات',
      servicesDesc: '13 فئة تسعيرية',
      customersCRM: 'العملاء والشركات',
      customersDesc: 'CRM نشط ومعتمد',
      chartOfAccounts: 'شجرة الحسابات GL',
      accountsDesc: 'دليل محاسبي إماراتي',
      systemIntegrity: 'تكاملية النظام',
      integrityDesc: 'فحوصات حماية القواعد',
    },
    categories: {
      core: 'الإعدادات',
      crm: 'العملاء',
      services: 'الخدمات',
      operations: 'العمليات',
      invoicing: 'الفواتير',
      accounting: 'المحاسبة',
      hr: 'الموارد البشرية',
      system: 'الحوكمة',
    },
    tabs: {
      dashboard: 'لوحة المؤشرات التنفيذية',
      accounting: 'لوحة الحسابات والمصروفات (GL)',
      hr: 'الموارد البشرية والرواتب (HR)',
      customers: 'إدارة العملاء والملفات (CRM)',
      templates: 'إدارة قوالب المستندات',
      reports: 'التقارير المتقدمة والتحليلات',
      data: 'مدير السجلات والجداول (40)',
      operationsHub: 'مسار المعاملات والعمليات',
      approvals: 'مركز الموافقات والحوكمة',
      schema: 'هيكل الأعمدة والعلاقات',
      tests: 'فحص التكاملية والأمان',
    },
    tableHeaders: {
      id: '# المعرف',
      actions: 'إجراءات',
      fieldName: 'اسم العمود (Field)',
      label: 'التسمية بالعربية',
      type: 'نوع البيانات (Type)',
      required: 'إجباري؟',
      descriptionRules: 'الوصف والقواعد',
    },
    notifications: {
      exportSuccess: 'تم تصدير قاعدة البيانات كملف JSON بنجاح.',
      importSuccess: 'تم استيراد قاعدة البيانات بنجاح واستعادة البيانات.',
      importError: 'فشل استيراد الملف. تأكد من صحة تنسيق JSON.',
      demoResetConfirm: 'هل أنت متأكد من رغبتك في إعادة تحميل البيانات التجريبية الغنية؟',
      demoResetSuccess: 'تمت استعادة البيانات التجريبية لـ جلف ساند للطباعة والخدمات بنجاح.',
      emptyResetConfirm: 'هل أنت متأكد من تصفير قاعدة البيانات إلى الحالة النظيفة؟',
      emptyResetSuccess: 'تمت تهيئة قاعدة البيانات النظيفة بالثوابت والإعدادات فقط.',
      costProfitHidden: 'تم حجب أعمدة التكلفة وهوامش الأرباح لدور',
      emptyRecordsTitle: 'لا توجد سجلات في هذا الجدول حالياً.',
      emptyRecordsDesc: 'يمكنك الضغط على زر "+ إضافة سجل جديد" بالأعلى لإنشاء أول سجل.',
      deleteConfirm: 'هل أنت متأكد من حذف / أرشفة هذا السجل؟',
      deleteSuccess: 'تمت أرشفة السجل بنجاح وسجله في سجل التدقيق.',
      unauthorizedAction: 'عذراً، دورك الحالي لا يمتلك الصلاحية المطلوبة لتنفيذ هذا الإجراء.',
    },
    schemaMeta: {
      governanceTitle: 'معلومات الحوكمة والمفتاح الأساسي',
      codeTableName: 'اسم الجدول البرمجي:',
      category: 'التصنيف الوظيفي:',
      idPrefixFormat: 'نمط توليد المعرف:',
      foreignKeysTitle: 'العلاقات مع الجداول الأخرى (Foreign Keys)',
      noForeignKeys: 'لا توجد علاقات خارجية مرتبطة بهذا الجدول.',
      columnsTitle: 'قائمة الأعمدة والأنواع والقيود',
      requiredBadge: 'مطلوب',
      optionalBadge: 'اختياري',
      recordDetails: 'تفاصيل السجل الكاملة',
      hiddenRoleBadge: '*** محجوب لصلاحية',
    },
    testsMeta: {
      title: 'اختبارات التحقق والتكاملية الآلية لقواعد بيانات جلف ساند للطباعة والخدمات',
      subtitle: 'يتم اختبار قواعد حماية الأسعار، توازن القيود، عدم تكرار العملاء، وأمان الصلاحيات.',
      testsPassing: 'فحوصات مجتازة بنجاح',
    },
  },
  en: {
    appName: 'GULFSAND TYPING SERVICES',
    location: 'Al Ain - Abu Dhabi',
    phaseBadge: 'Full Operational Enterprise ERP (36 Tables & RBAC)',
    subtitle: 'GULFSAND TYPING SERVICES ERP • Unified Operations, Invoicing & Financial Accounting',
    roleSimLabel: 'Active Role:',
    roles: {
      system_admin: 'System Admin',
      manager: 'Manager',
      supervisor: 'Supervisor',
      accounts: 'Financial Accountant',
      operations: 'Operations Staff (Cost Hidden)',
      hr: 'HR Specialist',
      viewer: 'Viewer Only',
    },
    quickActions: {
      title: 'Quick Actions:',
      newTransaction: 'New Transaction',
      newCustomer: 'New Customer',
      newInvoice: 'Tax Invoice',
      newExpense: 'Expense Voucher',
      newJournalEntry: 'Journal Entry',
      addRecord: 'Add Record',
      unauthorizedBadge: 'Restricted for Role',
    },
    actions: {
      runTests: 'Run Integrity Tests',
      restoreDemo: 'Restore Demo Data',
      resetEmpty: 'Reset to Clean DB',
      exportJson: 'Export JSON',
      importJson: 'Import JSON',
      close: 'Close',
      viewDetails: 'View',
      editRecord: 'Edit',
      deleteRecord: 'Delete',
      archiveRecord: 'Archive',
      searchTables: 'Search table names...',
      searchData: 'Search in records...',
      allCategories: 'All',
      rerunTests: 'Rerun All Tests',
      runningTests: 'Running tests...',
      toggleTables: 'Tables Menu (36)',
    },
    stats: {
      totalTables: 'Total Tables',
      tablesDesc: '36 Relational Tables',
      totalRecords: 'Total Records',
      recordsDesc: 'Updated in Real-Time',
      servicesCatalog: 'Services Catalog',
      servicesDesc: '13 Pricing Categories',
      customersCRM: 'CRM & Accounts',
      customersDesc: 'Verified Active Profiles',
      chartOfAccounts: 'Chart of Accounts (GL)',
      accountsDesc: 'UAE Standard Accounting',
      systemIntegrity: 'System Integrity',
      integrityDesc: 'Rule-Protection Checks',
    },
    categories: {
      core: 'Core Setup',
      crm: 'CRM & Clients',
      services: 'Services & Pricing',
      operations: 'Operations',
      invoicing: 'Invoicing & Collections',
      accounting: 'Finance & Accounts',
      hr: 'HR & Payroll',
      system: 'Governance & Logs',
    },
    tabs: {
      dashboard: 'Executive Dashboard',
      accounting: 'Accounting & Expenses (GL)',
      hr: 'HR & Payroll Management',
      customers: 'Customer Management (CRM)',
      templates: 'Document Templates (Manager)',
      reports: 'Advanced Reports & Visuals',
      data: 'Master Data & Records (40)',
      operationsHub: 'Operations & Transactions Pipeline',
      approvals: 'Governance & Approvals',
      schema: 'Schema & Relations',
      tests: 'Security & Integrity Tests',
    },
    tableHeaders: {
      id: '# ID',
      actions: 'Actions',
      fieldName: 'Field Name',
      label: 'Label',
      type: 'Data Type',
      required: 'Required?',
      descriptionRules: 'Description & Rules',
    },
    notifications: {
      exportSuccess: 'Database successfully exported as JSON file.',
      importSuccess: 'Database imported successfully and state restored.',
      importError: 'Import failed. Please ensure valid JSON format.',
      demoResetConfirm: 'Are you sure you want to reload the rich demo dataset?',
      demoResetSuccess: 'GULFSAND TYPING SERVICES demo dataset restored successfully.',
      emptyResetConfirm: 'Are you sure you want to reset to an empty production state?',
      emptyResetSuccess: 'Database initialized to clean production setup.',
      costProfitHidden: 'Cost and profit margin columns are hidden for role',
      emptyRecordsTitle: 'No records found in this table.',
      emptyRecordsDesc: 'Click "+ Add New Record" above to create the first entry.',
      deleteConfirm: 'Are you sure you want to archive/delete this record?',
      deleteSuccess: 'Record archived successfully and logged in audit trail.',
      unauthorizedAction: 'Unauthorized: Your current role lacks permission for this action.',
    },
    schemaMeta: {
      governanceTitle: 'Governance & Primary Key Information',
      codeTableName: 'Table Identifier:',
      category: 'Functional Category:',
      idPrefixFormat: 'ID Generator Format:',
      foreignKeysTitle: 'Foreign Key Relationships',
      noForeignKeys: 'No foreign key relations attached to this table.',
      columnsTitle: 'Columns, Types & Integrity Constraints',
      requiredBadge: 'Required',
      optionalBadge: 'Optional',
      recordDetails: 'Complete Record Details',
      hiddenRoleBadge: '*** Hidden for role',
    },
    testsMeta: {
      title: 'Automated Integrity & Business Logic Verification',
      subtitle: 'Testing pricing boundary protection, double-entry balance, customer uniqueness, and RBAC.',
      testsPassing: 'Passed successfully',
    },
  },
};
