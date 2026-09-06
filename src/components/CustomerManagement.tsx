import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../db';
import {
  UserRole,
  CustomerType,
  TransactionStatus,
  BookingStatus,
  InvoiceStatus,
  ServiceCategory,
} from '../types/schema';
import { ROLE_PERMISSIONS, canCreateInTable, canDeleteInTable } from '../utils/rbac';
import { generateCustomerProfilePDF, generateTransactionReceiptPDF } from '../utils/pdfGenerator';
import {
  Users,
  Search,
  Plus,
  Filter,
  Phone,
  Mail,
  Building2,
  User,
  Star,
  DollarSign,
  FileSpreadsheet,
  Receipt,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Edit3,
  Trash2,
  MessageSquare,
  Plane,
  Eye,
  Download,
  Upload,
  Printer,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  X,
  CreditCard,
  Send,
  HelpCircle,
  Briefcase,
  Layers,
  MapPin,
  Check,
} from 'lucide-react';

interface CustomerManagementProps {
  currentRole: UserRole;
  lang: 'ar' | 'en';
  onOpenNewTransactionForCustomer?: (customerId: string, customerName: string) => void;
  onOpenNewInvoiceForCustomer?: (customerId: string, customerName: string) => void;
  onViewRecord?: (record: any) => void;
}

export const CustomerManagement: React.FC<CustomerManagementProps> = ({
  currentRole,
  lang,
  onOpenNewTransactionForCustomer,
  onOpenNewInvoiceForCustomer,
  onViewRecord,
}) => {
  const isRtl = lang === 'ar';
  const rolePerm = ROLE_PERMISSIONS[currentRole];
  const canViewFinancials = rolePerm ? rolePerm.canViewFinancialReports : true;
  const canCreateCustomer = canCreateInTable(currentRole, 'customers');
  const canDeleteCustomer = canDeleteInTable(currentRole, 'customers');

  // Database state
  const [customers, setCustomers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionDetails, setTransactionDetails] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [crmFollowups, setCrmFollowups] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  // Selection & UI state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<
    'typing_jobs' | 'financials' | 'documents' | 'bookings' | 'crm_notes' | 'edit_profile'
  >('typing_jobs');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INDIVIDUAL' | 'COMPANY' | 'VIP' | 'HAS_DUES' | 'ACTIVE_JOBS'>('ALL');
  const [sortBy, setSortBy] = useState<'RECENT' | 'SPENT_DESC' | 'JOBS_DESC' | 'DUES_DESC' | 'NAME'>('RECENT');

  // Modal / Form state
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [isAddDocumentModalOpen, setIsAddDocumentModalOpen] = useState(false);
  const [isCsvImportModalOpen, setIsCsvImportModalOpen] = useState(false);

  // CSV Import State
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // New Customer Form State
  const [newCustomerType, setNewCustomerType] = useState<CustomerType>(CustomerType.INDIVIDUAL);
  const [newNameAr, setNewNameAr] = useState('');
  const [newNameEn, setNewNameEn] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newEmiratesId, setNewEmiratesId] = useState('');
  const [newPassportNo, setNewPassportNo] = useState('');
  const [newTradeLicenseNo, setNewTradeLicenseNo] = useState('');
  const [newTrnTaxNo, setNewTrnTaxNo] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newSource, setNewSource] = useState('زيارة مباشرة للمكتب');
  const [newIsVip, setNewIsVip] = useState(false);
  const [newNotes, setNewNotes] = useState('');
  const [newFormError, setNewFormError] = useState<string | null>(null);

  // Quick CRM Note Form State
  const [newCrmMethod, setNewCrmMethod] = useState('واتساب');
  const [newCrmSummary, setNewCrmSummary] = useState('');
  const [newCrmNextAction, setNewCrmNextAction] = useState('');
  const [newCrmNextDate, setNewCrmNextDate] = useState('2026-08-18');

  // Quick Add Document Form State
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocType, setNewDocType] = useState('بطاقة هوية إماراتية');
  const [newDocExpiry, setNewDocExpiry] = useState('2027-08-15');
  const [newDocNotes, setNewDocNotes] = useState('');

  // Edit Profile Form State
  const [editFormData, setEditFormData] = useState<any>({});
  const [editFormSuccess, setEditFormSuccess] = useState(false);

  // Refresh all state from DB
  const refreshAll = () => {
    const custs = db.getAll('customers');
    setCustomers(custs);
    setTransactions(db.getAll('transactions'));
    setTransactionDetails(db.getAll('transaction_details'));
    setInvoices(db.getAll('invoices'));
    setReceipts(db.getAll('collections_receipts'));
    setDocuments(db.getAll('documents'));
    setBookings(db.getAll('bookings'));
    setCrmFollowups(db.getAll('crm_followups'));
    setEmployees(db.getAll('employees'));

    // Set default selected customer if none selected
    if (!selectedCustomerId && custs.length > 0) {
      setSelectedCustomerId(custs[0].id);
    }
  };

  useEffect(() => {
    refreshAll();
    const unsubs = [
      db.subscribe('customers', refreshAll),
      db.subscribe('transactions', refreshAll),
      db.subscribe('transaction_details', refreshAll),
      db.subscribe('invoices', refreshAll),
      db.subscribe('collections_receipts', refreshAll),
      db.subscribe('documents', refreshAll),
      db.subscribe('bookings', refreshAll),
      db.subscribe('crm_followups', refreshAll),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  // Update Edit Form state whenever selected customer changes
  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || customers[0] || null;
  }, [customers, selectedCustomerId]);

  useEffect(() => {
    if (selectedCustomer) {
      setEditFormData({
        name_ar: selectedCustomer.name_ar || '',
        name_en: selectedCustomer.name_en || '',
        phone: selectedCustomer.phone || '',
        email: selectedCustomer.email || '',
        customer_type: selectedCustomer.customer_type || CustomerType.INDIVIDUAL,
        emirates_id: selectedCustomer.emirates_id || '',
        passport_number: selectedCustomer.passport_number || '',
        trade_license_no: selectedCustomer.trade_license_no || '',
        trn_tax_number: selectedCustomer.trn_tax_number || '',
        address: selectedCustomer.address || '',
        is_vip: !!selectedCustomer.is_vip,
        customer_source: selectedCustomer.customer_source || '',
        notes: selectedCustomer.notes || '',
        credit_limit_aed: selectedCustomer.credit_limit_aed || 0,
      });
      setEditFormSuccess(false);
    }
  }, [selectedCustomer]);

  // Customer typing jobs (Transactions)
  const customerTransactions = useMemo(() => {
    if (!selectedCustomer) return [];
    return transactions.filter(
      (t) =>
        t.customer_id === selectedCustomer.id ||
        (t.customer_name_ar && t.customer_name_ar.trim() === selectedCustomer.name_ar.trim())
    );
  }, [transactions, selectedCustomer]);

  // Customer Invoices
  const customerInvoices = useMemo(() => {
    if (!selectedCustomer) return [];
    return invoices.filter(
      (inv) =>
        inv.customer_id === selectedCustomer.id ||
        (inv.customer_name_ar && inv.customer_name_ar.trim() === selectedCustomer.name_ar.trim())
    );
  }, [invoices, selectedCustomer]);

  // Customer Receipts
  const customerReceipts = useMemo(() => {
    if (!selectedCustomer) return [];
    return receipts.filter(
      (rec) =>
        rec.customer_id === selectedCustomer.id ||
        (rec.customer_name_ar && rec.customer_name_ar.trim() === selectedCustomer.name_ar.trim())
    );
  }, [receipts, selectedCustomer]);

  // Customer Documents
  const customerDocuments = useMemo(() => {
    if (!selectedCustomer) return [];
    return documents.filter(
      (doc) =>
        doc.related_customer_id === selectedCustomer.id ||
        doc.customer_id === selectedCustomer.id ||
        (doc.title_ar && doc.title_ar.includes(selectedCustomer.name_ar.split(' ')[0]))
    );
  }, [documents, selectedCustomer]);

  // Customer Bookings
  const customerBookings = useMemo(() => {
    if (!selectedCustomer) return [];
    return bookings.filter(
      (b) =>
        b.customer_id === selectedCustomer.id ||
        (b.customer_name_ar && b.customer_name_ar.trim() === selectedCustomer.name_ar.trim())
    );
  }, [bookings, selectedCustomer]);

  // Customer CRM Followups
  const customerCrmNotes = useMemo(() => {
    if (!selectedCustomer) return [];
    return crmFollowups.filter(
      (flw) =>
        flw.customer_id === selectedCustomer.id ||
        flw.lead_id === selectedCustomer.id ||
        flw.customer_name === selectedCustomer.name_ar
    );
  }, [crmFollowups, selectedCustomer]);

  // Filtered and Sorted Customer Directory
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      // Search matching: name, phone, email, emirates id, trade license, customer_code
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchNameAr = (c.name_ar || '').toLowerCase().includes(q);
        const matchNameEn = (c.name_en || '').toLowerCase().includes(q);
        const matchPhone = (c.phone || '').toLowerCase().includes(q);
        const matchEmail = (c.email || '').toLowerCase().includes(q);
        const matchEid = (c.emirates_id || '').toLowerCase().includes(q);
        const matchLicense = (c.trade_license_no || '').toLowerCase().includes(q);
        const matchCode = (c.customer_code || c.id || '').toLowerCase().includes(q);
        if (!matchNameAr && !matchNameEn && !matchPhone && !matchEmail && !matchEid && !matchLicense && !matchCode) {
          return false;
        }
      }

      // Filter Type matching
      if (filterType === 'INDIVIDUAL' && c.customer_type !== CustomerType.INDIVIDUAL && c.customer_type !== 'أفراد' && c.customer_type !== 'فرد') {
        return false;
      }
      if (filterType === 'COMPANY' && c.customer_type !== CustomerType.COMPANY && c.customer_type !== 'شركات' && c.customer_type !== 'شركة') {
        return false;
      }
      if (filterType === 'VIP' && !c.is_vip) {
        return false;
      }
      if (filterType === 'HAS_DUES' && (Number(c.current_balance_aed) || 0) <= 0 && (Number(c.outstanding_balance_aed) || 0) <= 0) {
        return false;
      }
      if (filterType === 'ACTIVE_JOBS') {
        const hasActive = transactions.some(
          (t) =>
            (t.customer_id === c.id || t.customer_name_ar === c.name_ar) &&
            (t.status === TransactionStatus.IN_PROGRESS || t.status === TransactionStatus.NEW || t.status === 'قيد التنفيذ' || t.status === 'جديدة')
        );
        if (!hasActive) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'SPENT_DESC') {
        return (Number(b.total_spent_aed) || 0) - (Number(a.total_spent_aed) || 0);
      }
      if (sortBy === 'JOBS_DESC') {
        return (Number(b.total_transactions_count) || 0) - (Number(a.total_transactions_count) || 0);
      }
      if (sortBy === 'DUES_DESC') {
        const dueA = Number(a.current_balance_aed) || Number(a.outstanding_balance_aed) || 0;
        const dueB = Number(b.current_balance_aed) || Number(b.outstanding_balance_aed) || 0;
        return dueB - dueA;
      }
      if (sortBy === 'NAME') {
        return (a.name_ar || '').localeCompare(b.name_ar || '');
      }
      // RECENT default
      return (b.created_at || '').localeCompare(a.created_at || '');
    });
  }, [customers, transactions, searchQuery, filterType, sortBy]);

  // Metrics Bar Computations
  const totalActiveCustomers = customers.length;
  const individualCount = customers.filter((c) => c.customer_type === CustomerType.INDIVIDUAL || c.customer_type === 'أفراد' || c.customer_type === 'فرد').length;
  const companyCount = customers.filter((c) => c.customer_type === CustomerType.COMPANY || c.customer_type === 'شركات' || c.customer_type === 'شركة').length;
  const vipCount = customers.filter((c) => c.is_vip).length;
  const totalReceivablesAED = customers.reduce((acc, c) => acc + (Number(c.current_balance_aed) || Number(c.outstanding_balance_aed) || 0), 0);
  const totalLifetimeSpentAED = customers.reduce((acc, c) => acc + (Number(c.total_spent_aed) || 0), 0);

  // Handle New Customer Creation with Duplicate Detection
  const handleCreateNewCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    setNewFormError(null);

    if (!canCreateCustomer) {
      setNewFormError(isRtl ? 'ليس لديك صلاحية لإضافة عملاء جدد.' : 'Unauthorized to add customers.');
      return;
    }

    if (!newNameAr.trim()) {
      setNewFormError(isRtl ? 'يرجى إدخال اسم العميل باللغة العربية.' : 'Please enter customer Arabic name.');
      return;
    }

    if (!newPhone.trim()) {
      setNewFormError(isRtl ? 'يرجى إدخال رقم الهاتف للتواصل.' : 'Please enter contact phone.');
      return;
    }

    // Duplicate detection: Phone, Emirates ID, or Trade License
    const duplicatePhone = customers.find((c) => c.phone && c.phone.replace(/\s+/g, '') === newPhone.replace(/\s+/g, ''));
    if (duplicatePhone) {
      setNewFormError(
        isRtl
          ? `تنبيه تكرار: يوجد عميل مسجل بنفس رقم الهاتف (${duplicatePhone.name_ar} - ${duplicatePhone.customer_code || duplicatePhone.id}).`
          : `Duplicate phone number already belongs to: ${duplicatePhone.name_ar}`
      );
      return;
    }

    if (newEmiratesId.trim()) {
      const duplicateEid = customers.find((c) => c.emirates_id && c.emirates_id.replace(/[-\s]/g, '') === newEmiratesId.replace(/[-\s]/g, ''));
      if (duplicateEid) {
        setNewFormError(
          isRtl
            ? `تنبيه تكرار: توجد هوية إماراتية مسجلة مسبقاً للعميل (${duplicateEid.name_ar}).`
            : `Duplicate Emirates ID already exists for: ${duplicateEid.name_ar}`
        );
        return;
      }
    }

    try {
      const generatedCode = db.generateId('customers');
      const newCust: any = db.insert('customers', {
        customer_code: generatedCode,
        name_ar: newNameAr.trim(),
        name_en: newNameEn.trim() || newNameAr.trim(),
        customer_type: newCustomerType,
        phone: newPhone.trim(),
        email: newEmail.trim(),
        emirates_id: newEmiratesId.trim(),
        passport_number: newPassportNo.trim(),
        trade_license_no: newTradeLicenseNo.trim(),
        trn_tax_number: newTrnTaxNo.trim(),
        address: newAddress.trim() || 'العين، أبوظبي',
        preferred_language: 'ar',
        customer_source: newSource,
        is_vip: newIsVip,
        notes: newNotes.trim(),
        total_transactions_count: 0,
        total_spent_aed: 0,
        current_balance_aed: 0,
        status: 'نشط',
        branch_id: 'BR-001',
      });

      // Log in audit trail
      db.insert('audit_logs', {
        user_name_ar: 'مدير النظام',
        action_type: 'إنشاء',
        module_name: 'إدارة العملاء',
        record_id: newCust.id,
        table_name: 'customers',
        change_summary_ar: `إضافة ملف عميل جديد: ${newCust.name_ar} (${newCust.customer_code})`,
      });

      // Reset form
      setNewNameAr('');
      setNewNameEn('');
      setNewPhone('');
      setNewEmail('');
      setNewEmiratesId('');
      setNewPassportNo('');
      setNewTradeLicenseNo('');
      setNewTrnTaxNo('');
      setNewAddress('');
      setNewNotes('');
      setNewIsVip(false);
      setIsNewCustomerModalOpen(false);
      setSelectedCustomerId(newCust.id);
      refreshAll();
    } catch (err: any) {
      setNewFormError(err.message || 'حدث خطأ أثناء حفظ العميل.');
    }
  };

  // Handle Profile Update
  const handleSaveProfileChanges = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    try {
      db.update('customers', selectedCustomer.id, {
        name_ar: editFormData.name_ar,
        name_en: editFormData.name_en,
        phone: editFormData.phone,
        email: editFormData.email,
        customer_type: editFormData.customer_type,
        emirates_id: editFormData.emirates_id,
        passport_number: editFormData.passport_number,
        trade_license_no: editFormData.trade_license_no,
        trn_tax_number: editFormData.trn_tax_number,
        address: editFormData.address,
        is_vip: !!editFormData.is_vip,
        customer_source: editFormData.customer_source,
        notes: editFormData.notes,
        credit_limit_aed: Number(editFormData.credit_limit_aed) || 0,
      });

      setEditFormSuccess(true);
      setTimeout(() => setEditFormSuccess(false), 3000);
      refreshAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle Adding a CRM Note
  const handleAddCrmNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !newCrmSummary.trim()) return;

    try {
      db.insert('crm_followups', {
        customer_id: selectedCustomer.id,
        customer_name: selectedCustomer.name_ar,
        lead_id: selectedCustomer.id,
        followup_date: new Date().toISOString().substring(0, 10),
        contact_method: newCrmMethod,
        summary_ar: newCrmSummary.trim(),
        next_action_ar: newCrmNextAction.trim() || 'متابعة لاحقة',
        next_action_date: newCrmNextDate,
        status: 'مكتمل',
        employee_id: 'EMP-00002',
        branch_id: 'BR-001',
      });

      setNewCrmSummary('');
      setNewCrmNextAction('');
      refreshAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Handle Quick Document Attachment
  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !newDocTitle.trim()) return;

    try {
      const docCode = db.generateId('documents');
      db.insert('documents', {
        doc_code: docCode,
        title_ar: `${newDocTitle.trim()} - ${selectedCustomer.name_ar}`,
        title_en: `${newDocTitle.trim()} - ${selectedCustomer.name_en || selectedCustomer.name_ar}`,
        document_type: newDocType,
        file_name: `${newDocType.toLowerCase().replace(/\s+/g, '_')}_${selectedCustomer.id}.pdf`,
        file_type: 'pdf',
        file_size_bytes: 1024000,
        issue_date: new Date().toISOString().substring(0, 10),
        expiry_date: newDocExpiry,
        days_until_expiry: 365,
        related_customer_id: selectedCustomer.id,
        is_expired: false,
        notes: newDocNotes.trim() || 'مستند رسمي مرفق بالملف',
        status: 'نشط',
        branch_id: 'BR-001',
      });

      setNewDocTitle('');
      setNewDocNotes('');
      setIsAddDocumentModalOpen(false);
      refreshAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Quick Settle Balance Handler
  const handleQuickSettleBalance = () => {
    if (!selectedCustomer) return;
    const balance = Number(selectedCustomer.current_balance_aed) || Number(selectedCustomer.outstanding_balance_aed) || 0;
    if (balance <= 0) {
      alert(isRtl ? 'رصيد العميل مسدد بالكامل ولا توجد مستحقات.' : 'Client balance is already fully settled.');
      return;
    }

    const confirmPay = window.confirm(
      isRtl
        ? `هل تريد تسجيل إيصال قبض نقدي بمبلغ ${balance.toLocaleString()} د.إ لتسوية حساب العميل؟`
        : `Record cash receipt of ${balance.toLocaleString()} AED to settle balance?`
    );

    if (confirmPay) {
      try {
        const recCode = db.generateId('collections_receipts');
        db.insert('collections_receipts', {
          receipt_number: recCode,
          customer_id: selectedCustomer.id,
          customer_name_ar: selectedCustomer.name_ar,
          amount_aed: balance,
          payment_method: 'نقداً (الصندوق الرئيسي)',
          payment_date: new Date().toISOString().substring(0, 10),
          notes: 'تسوية رصيد ذمة العميل بالكامل عبر إدارة العملاء',
          status: 'معتمد',
          branch_id: 'BR-001',
        });

        db.update('customers', selectedCustomer.id, {
          current_balance_aed: 0,
          outstanding_balance_aed: 0,
        });

        alert(isRtl ? 'تم تسجيل إيصال القبض وتسوية الحساب بنجاح!' : 'Receipt created and account settled!');
        refreshAll();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  // Export Customer Directory CSV
  const handleExportCSV = () => {
    const headers = 'Code,Name_AR,Name_EN,Type,Phone,Email,Emirates_ID,Trade_License,Total_Spent_AED,Balance_Due_AED\n';
    const rows = customers
      .map(
        (c) =>
          `"${c.customer_code || c.id}","${c.name_ar}","${c.name_en || ''}","${c.customer_type}","${c.phone}","${c.email || ''}","${c.emirates_id || ''}","${c.trade_license_no || ''}",${c.total_spent_aed || 0},${c.current_balance_aed || 0}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Gulfsand_Customers_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadTemplateCsv = () => {
    const headers = ['name_ar', 'name_en', 'customer_type', 'phone', 'email', 'emirates_id', 'passport_number', 'trade_license_no'];
    const sampleRows = [
      ['أحمد محمد', 'Ahmed Mohamed', 'INDIVIDUAL', '+971 50 123 4567', 'ahmed@example.com', '784-1990-1234567-1', 'N123456', ''],
      ['شركة الرمال الذهبية', 'Golden Sands LLC', 'COMPANY', '+971 3 765 4321', 'info@goldensands.ae', '', '', 'CN-1234567']
    ];
    const csvContent = "\uFEFF" + [headers.join(','), ...sampleRows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gulfsand_crm_import_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCsvImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return;

    setIsImporting(true);
    setImportStatus(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split(/\r?\n/);
        if (lines.length < 2) {
          throw new Error(isRtl ? 'ملف CSV فارغ أو غير صالح.' : 'CSV file is empty or invalid.');
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
        const nameArIndex = headers.indexOf('name_ar');
        const nameEnIndex = headers.indexOf('name_en');
        const typeIndex = headers.indexOf('customer_type');
        const phoneIndex = headers.indexOf('phone');
        const emailIndex = headers.indexOf('email');
        const eidIndex = headers.indexOf('emirates_id');
        const passportIndex = headers.indexOf('passport_number');
        const licenseIndex = headers.indexOf('trade_license_no');

        if (nameArIndex === -1 || nameEnIndex === -1) {
          throw new Error(isRtl ? 'يجب أن يحتوي الملف على عمودي name_ar و name_en على الأقل.' : 'File must contain at least name_ar and name_en headers.');
        }

        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;

        const existingCustomers = db.getAll('customers') || [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Split by comma, respecting quotes
          const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
          const cells = matches.map(c => c.trim().replace(/^["']|["']$/g, ''));

          if (cells.length < Math.max(nameArIndex, nameEnIndex) + 1) {
            errorCount++;
            continue;
          }

          const nameAr = cells[nameArIndex];
          const nameEn = cells[nameEnIndex];
          if (!nameAr || !nameEn) {
            errorCount++;
            continue;
          }

          const customerType = cells[typeIndex] === 'COMPANY' ? CustomerType.COMPANY : CustomerType.INDIVIDUAL;
          const phone = cells[phoneIndex] || '';
          const email = cells[emailIndex] || '';
          const emiratesId = cells[eidIndex] || '';
          const passport = cells[passportIndex] || '';
          const license = cells[licenseIndex] || '';

          // Check for duplicate phone or emirates_id in DB to prevent integrity errors
          const isDuplicate = existingCustomers.some((c: any) => {
            const matchPhone = phone && c.phone && c.phone.replace(/\s+/g, '') === phone.replace(/\s+/g, '');
            const matchEid = emiratesId && c.emirates_id && c.emirates_id.replace(/[-\s]/g, '') === emiratesId.replace(/[-\s]/g, '');
            return matchPhone || matchEid;
          });

          if (isDuplicate) {
            skipCount++;
            continue;
          }

          try {
            db.insert('customers', {
              name_ar: nameAr,
              name_en: nameEn,
              customer_type: customerType,
              phone: phone,
              email: email,
              emirates_id: emiratesId,
              passport_no: passport,
              trade_license_no: license,
              status: 'نشط',
              current_balance_aed: 0,
              total_spent_aed: 0,
              is_vip: false,
              trn_tax_no: '',
              notes: isRtl ? 'تم الاستيراد بواسطة CSV' : 'Imported via CSV template',
            });
            successCount++;
          } catch (err) {
            errorCount++;
          }
        }

        // Log to Audit Log!
        db.logAudit('إنشاء', 'customers', 'CSV-IMPORT', `تم استيراد ${successCount} عميل بنجاح عبر ملف CSV (تخطي: ${skipCount}، أخطاء: ${errorCount}).`);

        setImportStatus({
          success: true,
          message: isRtl
            ? `تم الاستيراد بنجاح: تم تسجيل ${successCount} عملاء جديد، وتخطي ${skipCount} مكررين، و ${errorCount} أسطر غير صالحة.`
            : `Import completed: ${successCount} new clients created, ${skipCount} duplicates skipped, and ${errorCount} invalid rows skipped.`
        });
        setCsvFile(null);
      } catch (err: any) {
        setImportStatus({
          success: false,
          message: err.message || (isRtl ? 'فشل معالجة ملف CSV.' : 'Failed to parse CSV file.')
        });
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(csvFile);
  };

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* 1. Header & Key CRM Metrics Row */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                {isRtl ? 'منظومة إدارة العملاء وسجل المعاملات والطباعة' : 'Customer Management & Typing Job Dossier'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isRtl
                  ? 'دليل شامل لبيانات العملاء، متابعة سجل طلبات الطباعة، الفواتير، الوثائق، وتاريخ التواصل'
                  : '360° client profiles, typing transaction history, invoices, compliance documents & CRM follow-ups'}
              </p>
            </div>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5 self-end md:self-center">
          <button
            onClick={() => setIsCsvImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            {isRtl ? 'استيراد CSV' : 'Import CSV'}
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            {isRtl ? 'تصدير CSV' : 'Export CSV'}
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            {isRtl ? 'طباعة' : 'Print'}
          </button>

          {canCreateCustomer && (
            <button
              onClick={() => setIsNewCustomerModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              {isRtl ? 'إضافة عميل جديد' : 'New Customer'}
            </button>
          )}
        </div>
      </div>

      {/* 2. Top Metric KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Customers */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-500 font-medium">{isRtl ? 'إجمالي العملاء المسجلين' : 'Total Customers'}</span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {totalActiveCustomers}
            </div>
            <span className="text-[10px] text-slate-500">
              {individualCount} {isRtl ? 'أفراد' : 'Ind'} • {companyCount} {isRtl ? 'شركات' : 'Corp'} ({vipCount} ⭐ VIP)
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Total Typing Jobs */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-500 font-medium">{isRtl ? 'إجمالي معاملات الطباعة' : 'Typing Jobs Recorded'}</span>
            <div className="text-xl sm:text-2xl font-black text-indigo-600 font-mono">
              {transactions.length}
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">
              {transactions.filter((t) => t.status === 'مكتملة' || t.status === 'COMPLETED').length} {isRtl ? 'معاملة منجزة' : 'completed'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
        </div>

        {/* Customer Lifetime Spending */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-500 font-medium">{isRtl ? 'إجمالي مبيعات العملاء' : 'Customer Lifetime Value'}</span>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
              {canViewFinancials ? `${totalLifetimeSpentAED.toLocaleString()} د.إ` : '***,*** د.إ'}
            </div>
            <span className="text-[10px] text-slate-500">{isRtl ? 'إجمالي المبالغ المسددة' : 'Gross revenue'}</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Outstanding Receivables */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[11px] text-slate-500 font-medium">{isRtl ? 'الذمم المدينة المستحقة' : 'Outstanding Balances'}</span>
            <div className="text-xl sm:text-2xl font-black text-amber-600 font-mono">
              {totalReceivablesAED.toLocaleString()} د.إ
            </div>
            <span className="text-[10px] text-amber-700 font-medium">
              {customers.filter((c) => (Number(c.current_balance_aed) || 0) > 0).length} {isRtl ? 'عملاء عليهم مستحقات' : 'clients with dues'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Main Split View: Left Column (Directory & Search) / Right Column (Customer 360° Profile & Typing History) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Customer Directory & Search/Filter (4 cols) */}
        <div className="lg:col-span-4 space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRtl ? 'بحث بالاسم، الهاتف، الهوية، الرخصة...' : 'Search name, phone, EID, license...'}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-9 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-2.5 rtl:left-3 rtl:right-auto ltr:right-3 ltr:left-auto text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-semibold">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                filterType === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isRtl ? 'الكل' : 'All'} ({customers.length})
            </button>
            <button
              onClick={() => setFilterType('INDIVIDUAL')}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                filterType === 'INDIVIDUAL' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isRtl ? 'أفراد' : 'Individuals'}
            </button>
            <button
              onClick={() => setFilterType('COMPANY')}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                filterType === 'COMPANY' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {isRtl ? 'شركات' : 'Companies'}
            </button>
            <button
              onClick={() => setFilterType('VIP')}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 ${
                filterType === 'VIP' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <Star className="w-3 h-3 fill-current" />
              VIP
            </button>
            <button
              onClick={() => setFilterType('HAS_DUES')}
              className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                filterType === 'HAS_DUES' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              {isRtl ? 'مستحقات' : 'Dues'}
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-1 border-t border-slate-100">
            <span>{isRtl ? 'النتائج:' : 'Results:'} <b>{filteredCustomers.length}</b></span>
            <div className="flex items-center gap-1">
              <span>{isRtl ? 'ترتيب:' : 'Sort:'}</span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-[10px] text-slate-700 focus:outline-none"
              >
                <option value="RECENT">{isRtl ? 'الأحدث تسجيلاً' : 'Most Recent'}</option>
                <option value="SPENT_DESC">{isRtl ? 'الأعلى مبيعاً (LTV)' : 'Highest Spend'}</option>
                <option value="JOBS_DESC">{isRtl ? 'الأكثر معاملات' : 'Most Jobs'}</option>
                <option value="DUES_DESC">{isRtl ? 'الأعلى مديونية' : 'Highest Due'}</option>
                <option value="NAME">{isRtl ? 'أبجدياً' : 'Alphabetical'}</option>
              </select>
            </div>
          </div>

          {/* Customer Directory List */}
          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>{isRtl ? 'لا يوجد عملاء مطابقين للبحث' : 'No matching customers found'}</p>
              </div>
            ) : (
              filteredCustomers.map((cust) => {
                const isSelected = selectedCustomer && selectedCustomer.id === cust.id;
                const isCompany = cust.customer_type === CustomerType.COMPANY || cust.customer_type === 'شركات' || cust.customer_type === 'شركة';
                const balanceDue = Number(cust.current_balance_aed) || Number(cust.outstanding_balance_aed) || 0;
                const jobsCount = transactions.filter((t) => t.customer_id === cust.id || t.customer_name_ar === cust.name_ar).length || cust.total_transactions_count || 0;

                return (
                  <div
                    key={cust.id}
                    onClick={() => setSelectedCustomerId(cust.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-xs relative ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-400 shadow-xs ring-1 ring-blue-400'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isCompany
                              ? 'bg-emerald-100 text-emerald-800'
                              : cust.is_vip
                              ? 'bg-amber-100 text-amber-800 ring-1 ring-amber-300'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {isCompany ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 line-clamp-1">{cust.name_ar}</span>
                            {cust.is_vip && (
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            {cust.customer_code || cust.id}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                          isCompany ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {isCompany ? (isRtl ? 'شركة' : 'Corp') : isRtl ? 'فرد' : 'Ind'}
                      </span>
                    </div>

                    {/* Phone & ID info */}
                    <div className="mt-2 text-[11px] text-slate-600 flex items-center justify-between pt-2 border-t border-slate-100/80">
                      <span className="font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {cust.phone}
                      </span>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {jobsCount} {isRtl ? 'معاملة' : 'jobs'}
                      </span>
                    </div>

                    {/* Outstanding Balance Warning */}
                    {balanceDue > 0 && (
                      <div className="mt-1.5 text-[10px] bg-rose-50 text-rose-800 font-semibold px-2 py-0.5 rounded flex items-center justify-between border border-rose-200">
                        <span>{isRtl ? 'مستحق الدفع:' : 'Balance Due:'}</span>
                        <span className="font-mono">{balanceDue.toLocaleString()} د.إ</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Customer 360° Profile & Comprehensive Typing Job History (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedCustomer ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-5">
              {/* Customer Profile Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 text-white p-5 rounded-2xl border border-slate-800 relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/20">
                        {selectedCustomer.customer_code || selectedCustomer.id}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                          selectedCustomer.customer_type === CustomerType.COMPANY || selectedCustomer.customer_type === 'شركات'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/20'
                            : 'bg-slate-700 text-slate-200'
                        }`}
                      >
                        {selectedCustomer.customer_type}
                      </span>
                      {selectedCustomer.is_vip && (
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/20 font-bold">
                          <Star className="w-3 h-3 fill-current" />
                          {isRtl ? 'عميل مميز VIP' : 'VIP Client'}
                        </span>
                      )}
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      {selectedCustomer.name_ar}
                    </h2>
                    {selectedCustomer.name_en && (
                      <p className="text-xs text-slate-300 font-medium">
                        {selectedCustomer.name_en}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                      <a
                        href={`tel:${selectedCustomer.phone}`}
                        className="flex items-center gap-1 text-blue-300 hover:underline font-mono"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {selectedCustomer.phone}
                      </a>
                      {selectedCustomer.email && (
                        <a
                          href={`mailto:${selectedCustomer.email}`}
                          className="flex items-center gap-1 text-slate-300 hover:underline"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          {selectedCustomer.email}
                        </a>
                      )}
                      <span className="flex items-center gap-1 text-slate-400">
                        <MapPin className="w-3.5 h-3.5" />
                        {selectedCustomer.address || 'العين، أبوظبي'}
                      </span>
                    </div>
                  </div>

                  {/* Client Financial Balance Box */}
                  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/15 min-w-[200px] text-right space-y-1.5 shadow-inner">
                    <span className="text-[11px] text-slate-300 block">
                      {isRtl ? 'الرصيد المستحق (الذمة):' : 'Outstanding Balance:'}
                    </span>
                    <div
                      className={`text-xl font-black font-mono ${
                        (Number(selectedCustomer.current_balance_aed) || Number(selectedCustomer.outstanding_balance_aed) || 0) > 0
                          ? 'text-amber-300'
                          : 'text-emerald-400'
                      }`}
                    >
                      {(Number(selectedCustomer.current_balance_aed) || Number(selectedCustomer.outstanding_balance_aed) || 0).toLocaleString()} د.إ
                    </div>
                    {(Number(selectedCustomer.current_balance_aed) || Number(selectedCustomer.outstanding_balance_aed) || 0) > 0 ? (
                      <button
                        onClick={handleQuickSettleBalance}
                        className="w-full py-1 px-2 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[10px] transition-colors"
                      >
                        {isRtl ? 'قبض وتسوية الرصيد' : 'Settle Balance'}
                      </button>
                    ) : (
                      <span className="text-[10px] text-emerald-300 flex items-center gap-1 justify-end">
                        <CheckCircle2 className="w-3 h-3" />
                        {isRtl ? 'الحساب مسدد بالكامل' : 'Fully Settled'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Action Toolbar for Selected Client */}
                <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      if (onOpenNewTransactionForCustomer) {
                        onOpenNewTransactionForCustomer(selectedCustomer.id, selectedCustomer.name_ar);
                      } else {
                        alert(isRtl ? `فتح معاملة جديدة للعميل ${selectedCustomer.name_ar}` : 'Create transaction');
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isRtl ? 'بدء معاملة طباعة جديدة' : 'New Typing Job'}
                  </button>

                  <button
                    onClick={() => {
                      if (onOpenNewInvoiceForCustomer) {
                        onOpenNewInvoiceForCustomer(selectedCustomer.id, selectedCustomer.name_ar);
                      } else {
                        alert(isRtl ? `إصدار فاتورة ضريبية للعميل ${selectedCustomer.name_ar}` : 'Issue Invoice');
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                  >
                    <Receipt className="w-3.5 h-3.5 text-emerald-400" />
                    {isRtl ? 'إصدار فاتورة ضريبية' : 'Issue Invoice'}
                  </button>

                  <button
                    onClick={() => setIsAddDocumentModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    {isRtl ? 'إرفاق مستند/هوية' : 'Attach Document'}
                  </button>

                  <button
                    onClick={() =>
                      generateCustomerProfilePDF({
                        customer: selectedCustomer,
                        transactions: customerTransactions,
                        invoices: customerInvoices,
                        lang: isRtl ? 'ar' : 'en',
                      })
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    {isRtl ? 'تصدير ملف العميل (PDF)' : 'Export Profile (PDF)'}
                  </button>

                  <a
                    href={`https://wa.me/${(selectedCustomer.phone || '').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors mr-auto rtl:mr-auto rtl:ml-0"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    {isRtl ? 'محادثة واتساب' : 'WhatsApp'}
                  </a>
                </div>
              </div>

              {/* Navigation Sub-Tabs inside Customer Dossier */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 text-xs font-semibold">
                <button
                  onClick={() => setActiveProfileTab('typing_jobs')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                    activeProfileTab === 'typing_jobs'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  {isRtl ? '1. سجل طلبات الطباعة والمعاملات' : '1. Typing Jobs History'}
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                    {customerTransactions.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveProfileTab('financials')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                    activeProfileTab === 'financials'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  {isRtl ? '2. الفواتير والتحصيلات' : '2. Invoices & Receipts'}
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                    {customerInvoices.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveProfileTab('documents')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                    activeProfileTab === 'documents'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  {isRtl ? '3. الوثائق والهويات' : '3. Documents & IDs'}
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                    {customerDocuments.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveProfileTab('bookings')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                    activeProfileTab === 'bookings'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Plane className="w-3.5 h-3.5" />
                  {isRtl ? '4. حجوزات السفر والسياحة' : '4. Travel & Bookings'}
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                    {customerBookings.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveProfileTab('crm_notes')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                    activeProfileTab === 'crm_notes'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  {isRtl ? '5. سجل المتابعة والملاحظات' : '5. CRM Follow-ups'}
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                    {customerCrmNotes.length}
                  </span>
                </button>

                <button
                  onClick={() => setActiveProfileTab('edit_profile')}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                    activeProfileTab === 'edit_profile'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  {isRtl ? '6. تعديل البيانات' : '6. Edit Details'}
                </button>
              </div>

              {/* TAB 1: Typing Job History & Pipeline (سجل وإحصائيات المعاملات والطباعة) */}
              {activeProfileTab === 'typing_jobs' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {isRtl ? 'سجل معاملات الطباعة والخدمات الحكومية للعميل' : 'Typing & Government Transaction History'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {isRtl ? 'تتبع فوري لمراحل إنجاز الإقامات، تسهيل، الجوازات، ورخص دائرة التنمية الاقتصادية' : 'Live tracking for ICP visas, Tasheel, Sudan passports, and DED licenses'}
                      </p>
                    </div>

                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {isRtl ? 'إجمالي المعاملات:' : 'Total Jobs:'} <b>{customerTransactions.length}</b>
                    </span>
                  </div>

                  {customerTransactions.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 space-y-3">
                      <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-400" />
                      <p className="text-xs font-medium">
                        {isRtl
                          ? 'لم يتم تسجيل أي معاملات طباعة لهذا العميل حتى الآن.'
                          : 'No typing transactions registered for this client yet.'}
                      </p>
                      <button
                        onClick={() => {
                          if (onOpenNewTransactionForCustomer) {
                            onOpenNewTransactionForCustomer(selectedCustomer.id, selectedCustomer.name_ar);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {isRtl ? 'إنشاء أول معاملة طباعة' : 'Start First Typing Job'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customerTransactions.map((trx) => {
                        // Find child items in transaction_details
                        const details = transactionDetails.filter((d) => d.transaction_id === trx.id);

                        return (
                          <div
                            key={trx.id}
                            className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 space-y-3 hover:bg-slate-50 transition-colors"
                          >
                            {/* Transaction Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-sm text-slate-900">{trx.transaction_code || trx.id}</span>
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    trx.status === 'مكتملة' || trx.status === 'COMPLETED'
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : trx.status === 'قيد التنفيذ' || trx.status === 'IN_PROGRESS'
                                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                                  }`}
                                >
                                  {trx.status}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span>{isRtl ? 'تاريخ البدء:' : 'Start:'} <b className="text-slate-700 font-mono">{(trx.start_date || trx.created_at || '').substring(0, 10)}</b></span>
                                <span>{isRtl ? 'الموظف المسؤول:' : 'Typist:'} <b className="text-slate-800">{trx.responsible_employee_name || 'موظف جلف ساند'}</b></span>
                              </div>
                            </div>

                            {/* Services Line Items Breakdown */}
                            <div className="space-y-1.5">
                              <span className="text-[11px] font-semibold text-slate-600 block">
                                {isRtl ? 'الخدمات وبنود المعاملة المنجزة:' : 'Included Services:'}
                              </span>
                              {details.length > 0 ? (
                                <div className="divide-y divide-slate-200/60 bg-white rounded-xl border border-slate-200/80 p-2.5 space-y-1.5">
                                  {details.map((item) => (
                                    <div key={item.id} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs">
                                      <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                        <span className="font-medium text-slate-800">{item.service_name_ar}</span>
                                        <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded font-mono">
                                          {item.service_category}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className="text-[11px] text-slate-500">{isRtl ? 'الكمية:' : 'Qty:'} {item.quantity || 1}</span>
                                        <span className="font-mono font-bold text-slate-900">
                                          {Number(item.net_selling_amount_aed || item.selling_price_aed || 0).toLocaleString()} د.إ
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-xs text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200">
                                  {trx.notes || (isRtl ? 'معاملة طباعة وتخليص معاملات حكومية' : 'General typing & gov clearing job')}
                                </div>
                              )}
                            </div>

                            {/* Financial Summary per Job */}
                            <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-200 text-xs">
                              <div className="flex items-center gap-4 text-slate-600">
                                <span>{isRtl ? 'المبلغ الصافي:' : 'Net Total:'} <b className="text-slate-900 font-mono text-sm">{Number(trx.total_net_amount_aed || 0).toLocaleString()} د.إ</b></span>
                                {canViewFinancials && (
                                  <>
                                    <span>{isRtl ? 'الرسوم الحكومية:' : 'Gov Cost:'} <b className="text-slate-600 font-mono">{Number(trx.total_cost_aed || 0).toLocaleString()} د.إ</b></span>
                                    <span>{isRtl ? 'صافي ربح الطباعة:' : 'Typing Profit:'} <b className="text-emerald-700 font-mono">{Number(trx.total_profit_aed || 0).toLocaleString()} د.إ</b></span>
                                  </>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    generateTransactionReceiptPDF({
                                      transaction: trx,
                                      transactionDetails: details,
                                      customer: selectedCustomer,
                                      lang: isRtl ? 'ar' : 'en',
                                    })
                                  }
                                  className="px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 text-xs font-bold transition-colors flex items-center gap-1"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                  {isRtl ? 'إيصال ضريبي (PDF)' : 'Tax Receipt (PDF)'}
                                </button>

                                <button
                                  onClick={() => onViewRecord && onViewRecord(trx)}
                                  className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors flex items-center gap-1"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  {isRtl ? 'عرض السجل الكامل' : 'View Record'}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: Financials & Invoices */}
              {activeProfileTab === 'financials' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {isRtl ? 'الفواتير الضريبية وإيصالات التحصيل' : 'Invoices & Collection Receipts'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {isRtl ? 'كشف الحساب المالي، الفواتير الصادرة، وسندات القبض المسجلة' : 'Customer billing ledger and payment vouchers'}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        if (onOpenNewInvoiceForCustomer) {
                          onOpenNewInvoiceForCustomer(selectedCustomer.id, selectedCustomer.name_ar);
                        }
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {isRtl ? 'فاتورة ضريبية جديدة' : 'New Invoice'}
                    </button>
                  </div>

                  {/* Invoices Table */}
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-xs text-right" dir={isRtl ? 'rtl' : 'ltr'}>
                      <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">{isRtl ? 'رقم الفاتورة' : 'Invoice #'}</th>
                          <th className="py-2.5 px-3">{isRtl ? 'التاريخ' : 'Date'}</th>
                          <th className="py-2.5 px-3">{isRtl ? 'الإجمالي (مع VAT)' : 'Total (with VAT)'}</th>
                          <th className="py-2.5 px-3">{isRtl ? 'المسدد' : 'Paid'}</th>
                          <th className="py-2.5 px-3">{isRtl ? 'المتبقي' : 'Due'}</th>
                          <th className="py-2.5 px-3">{isRtl ? 'الحالة' : 'Status'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {customerInvoices.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-6 text-center text-slate-400">
                              {isRtl ? 'لا توجد فواتير صادرة لهذا العميل بعد.' : 'No invoices issued for this client.'}
                            </td>
                          </tr>
                        ) : (
                          customerInvoices.map((inv) => (
                            <tr key={inv.id} className="hover:bg-slate-50/80">
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{inv.invoice_number || inv.id}</td>
                              <td className="py-2.5 px-3 font-mono text-slate-600">{(inv.issue_date || inv.created_at || '').substring(0, 10)}</td>
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{Number(inv.total_amount_aed || 0).toLocaleString()} د.إ</td>
                              <td className="py-2.5 px-3 font-mono text-emerald-700">{Number(inv.paid_amount_aed || 0).toLocaleString()} د.إ</td>
                              <td className="py-2.5 px-3 font-mono text-amber-700 font-bold">{Number(inv.balance_due_aed || 0).toLocaleString()} د.إ</td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    inv.status === 'مدفوعة بالكامل' || inv.status === 'PAID'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : inv.status === 'مدفوعة جزئياً' || inv.status === 'PARTIALLY_PAID'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {inv.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Collections Receipts List */}
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-slate-800 block">
                      {isRtl ? 'سندات وإيصالات القبض المسددة:' : 'Receipt Vouchers Recorded:'}
                    </span>
                    {customerReceipts.length === 0 ? (
                      <div className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                        {isRtl ? 'لا توجد إيصالات قبض سابقة' : 'No previous payment receipts recorded.'}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {customerReceipts.map((rec) => (
                          <div key={rec.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                            <div>
                              <span className="font-mono font-bold text-slate-900">{rec.receipt_number || rec.id}</span>
                              <p className="text-[10px] text-slate-500 font-mono mt-0.5">{rec.payment_date || rec.created_at}</p>
                              <p className="text-[11px] text-slate-600">{rec.payment_method}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-mono font-black text-sm text-emerald-700">
                                +{Number(rec.amount_aed || 0).toLocaleString()} د.إ
                              </span>
                              <span className="text-[10px] text-emerald-600 block">{rec.status || 'معتمد'}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: Official Documents & IDs */}
              {activeProfileTab === 'documents' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {isRtl ? 'وثائق ومستندات العميل الرسمية' : 'Official Client Documents & Identification'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {isRtl ? 'بطاقات الهوية الإماراتية، الجوازات، والرخص التجارية وتواريخ انتهائها' : 'Emirates IDs, Passports, and Trade Licenses with expiry countdowns'}
                      </p>
                    </div>

                    <button
                      onClick={() => setIsAddDocumentModalOpen(true)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {isRtl ? 'إرفاق مستند جديد' : 'Attach Document'}
                    </button>
                  </div>

                  {/* Documents List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {customerDocuments.length === 0 ? (
                      <div className="col-span-2 p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 space-y-2">
                        <FileText className="w-8 h-8 mx-auto text-slate-400" />
                        <p className="text-xs">{isRtl ? 'لا توجد مستندات مرفقة لهذا العميل حالياً' : 'No documents attached'}</p>
                      </div>
                    ) : (
                      customerDocuments.map((doc) => {
                        const daysLeft = Number(doc.days_until_expiry) || 999;
                        const isExpiringSoon = daysLeft <= 30;

                        return (
                          <div
                            key={doc.id}
                            className={`p-4 rounded-xl border transition-colors flex flex-col justify-between space-y-2 ${
                              daysLeft <= 7
                                ? 'bg-rose-50/70 border-rose-200'
                                : isExpiringSoon
                                ? 'bg-amber-50/70 border-amber-200'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-0.5">
                                  <span className="font-bold text-xs text-slate-900">{doc.title_ar}</span>
                                  <span className="text-[10px] text-slate-400 font-mono block">{doc.doc_code || doc.id}</span>
                                </div>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                    daysLeft <= 7
                                      ? 'bg-rose-600 text-white'
                                      : isExpiringSoon
                                      ? 'bg-amber-600 text-white'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {daysLeft <= 0
                                    ? isRtl ? 'منتهي الصلاحية' : 'Expired'
                                    : `${daysLeft} ${isRtl ? 'يوم متبقي' : 'days left'}`}
                                </span>
                              </div>

                              <p className="text-[11px] text-slate-600 mt-2">
                                {isRtl ? 'تاريخ الانتهاء:' : 'Expires:'} <b className="font-mono text-slate-800">{doc.expiry_date || 'غير محدد'}</b>
                              </p>
                              {doc.notes && <p className="text-[10px] text-slate-500 mt-0.5">{doc.notes}</p>}
                            </div>

                            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                              <span className="text-slate-400 font-mono">{doc.file_name || 'document.pdf'}</span>
                              <span className="text-blue-600 font-semibold cursor-pointer hover:underline">
                                {isRtl ? 'تحميل / معاينة' : 'Download'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: Travel & Tourism Bookings */}
              {activeProfileTab === 'bookings' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {isRtl ? 'حجوزات السفر، الطيران والعمرة' : 'Travel, Flights & Umrah Bookings'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {isRtl ? 'حجوزات الطيران، الفنادق، وباقات العمرة المسجلة باسم العميل' : 'Flight tickets, hotel vouchers and Umrah packages'}
                      </p>
                    </div>

                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {isRtl ? 'إجمالي الحجوزات:' : 'Bookings:'} <b>{customerBookings.length}</b>
                    </span>
                  </div>

                  {customerBookings.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 space-y-2">
                      <Plane className="w-8 h-8 mx-auto text-slate-400" />
                      <p className="text-xs">{isRtl ? 'لا توجد حجوزات طيران أو سياحة مسجلة لهذا العميل' : 'No travel bookings recorded'}</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {customerBookings.map((b) => (
                        <div key={b.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-slate-900">{b.booking_code || b.id}</span>
                              <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-bold">
                                {b.booking_type}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold">
                                {b.status}
                              </span>
                            </div>
                            <p className="text-slate-800 font-semibold">{b.destination || 'دبي / مكة المكرمة'}</p>
                            <p className="text-[11px] text-slate-500">
                              {isRtl ? 'تاريخ السفر:' : 'Travel Date:'} <b className="font-mono text-slate-700">{b.travel_date_departure || 'N/A'}</b>
                            </p>
                          </div>

                          <div className="text-right self-end sm:self-center">
                            <span className="font-mono font-black text-sm text-slate-900 block">
                              {Number(b.selling_price_aed || 0).toLocaleString()} د.إ
                            </span>
                            <button
                              onClick={() => onViewRecord && onViewRecord(b)}
                              className="text-[11px] text-blue-600 hover:underline font-semibold"
                            >
                              {isRtl ? 'تفاصيل الحجز' : 'View Booking'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: CRM Notes & Communication Logs */}
              {activeProfileTab === 'crm_notes' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {isRtl ? 'سجل المتابعة والتواصل والملاحظات الخاصة' : 'CRM Follow-ups & Communication History'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {isRtl ? 'توثيق الاتصالات الهاتفية، محادثات الواتساب، والزيارات المكتبية' : 'Interaction logs across WhatsApp, calls, and office visits'}
                      </p>
                    </div>
                  </div>

                  {/* Add New CRM Note Form */}
                  <form onSubmit={handleAddCrmNote} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5 text-blue-600" />
                      {isRtl ? 'تسجيل متابعة / اتصال جديد مع العميل' : 'Log New Interaction'}
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] text-slate-600 font-medium block mb-1">
                          {isRtl ? 'طريقة التواصل' : 'Method'}
                        </label>
                        <select
                          value={newCrmMethod}
                          onChange={(e) => setNewCrmMethod(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="واتساب">واتساب (WhatsApp)</option>
                          <option value="اتصال هاتفي">اتصال هاتفي (Phone Call)</option>
                          <option value="زيارة مكتبية">زيارة مكتبية (Office Visit)</option>
                          <option value="بريد إلكتروني">بريد إلكتروني (Email)</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[11px] text-slate-600 font-medium block mb-1">
                          {isRtl ? 'الإجراء القادم والموعد' : 'Next Action & Date'}
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newCrmNextAction}
                            onChange={(e) => setNewCrmNextAction(e.target.value)}
                            placeholder={isRtl ? 'مثال: إرسال عرض سعر تجديد الإقامات' : 'e.g. Follow up on quota'}
                            className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs"
                          />
                          <input
                            type="date"
                            value={newCrmNextDate}
                            onChange={(e) => setNewCrmNextDate(e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-600 font-medium block mb-1">
                        {isRtl ? 'ملخص ما دار في التواصل / الملاحظة' : 'Summary & Notes'}
                      </label>
                      <textarea
                        rows={2}
                        value={newCrmSummary}
                        onChange={(e) => setNewCrmSummary(e.target.value)}
                        placeholder={isRtl ? 'أدخل تفاصيل ما تم الاتفاق عليه مع العميل...' : 'Enter interaction notes...'}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!newCrmSummary.trim()}
                        className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs"
                      >
                        {isRtl ? 'حفظ المتابعة في السجل' : 'Save CRM Note'}
                      </button>
                    </div>
                  </form>

                  {/* CRM Followups Timeline */}
                  <div className="space-y-2.5">
                    {customerCrmNotes.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        {isRtl ? 'لا توجد ملاحظات أو متابعات سابقة مسجلة' : 'No previous CRM logs.'}
                      </div>
                    ) : (
                      customerCrmNotes.map((note) => (
                        <div key={note.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{note.contact_method}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{note.followup_date || note.created_at}</span>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                              {note.status || 'مكتمل'}
                            </span>
                          </div>

                          <p className="text-slate-800 text-xs leading-relaxed">{note.summary_ar}</p>

                          {note.next_action_ar && (
                            <div className="pt-1.5 border-t border-slate-200/60 text-[11px] text-blue-700 flex items-center justify-between">
                              <span>{isRtl ? 'الإجراء التالي:' : 'Next Action:'} <b>{note.next_action_ar}</b></span>
                              <span className="font-mono text-slate-500">{note.next_action_date}</span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 6: Edit Customer Profile Details */}
              {activeProfileTab === 'edit_profile' && (
                <form onSubmit={handleSaveProfileChanges} className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {isRtl ? 'تعديل البيانات الأساسية لملف العميل' : 'Edit Customer Information'}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {isRtl ? 'تحديث أرقام التواصل، الهوية الإماراتية، والرخصة التجارية' : 'Update phone, Emirates ID, and licensing'}
                      </p>
                    </div>

                    {editFormSuccess && (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-bold border border-emerald-200">
                        <Check className="w-3.5 h-3.5" />
                        {isRtl ? 'تم حفظ التعديلات بنجاح' : 'Saved successfully!'}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">{isRtl ? 'اسم العميل (عربي) *' : 'Name (Arabic) *'}</label>
                      <input
                        type="text"
                        required
                        value={editFormData.name_ar || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, name_ar: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold block mb-1">{isRtl ? 'اسم العميل (إنجليزي)' : 'Name (English)'}</label>
                      <input
                        type="text"
                        value={editFormData.name_en || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, name_en: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold block mb-1">{isRtl ? 'رقم الهاتف / الواتساب *' : 'Phone / WhatsApp *'}</label>
                      <input
                        type="text"
                        required
                        value={editFormData.phone || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold block mb-1">{isRtl ? 'البريد الإلكتروني' : 'Email Address'}</label>
                      <input
                        type="email"
                        value={editFormData.email || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold block mb-1">{isRtl ? 'رقم الهوية الإماراتية' : 'Emirates ID'}</label>
                      <input
                        type="text"
                        placeholder="784-19XX-XXXXXXX-X"
                        value={editFormData.emirates_id || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, emirates_id: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold block mb-1">{isRtl ? 'رقم الرخصة التجارية (للشركات)' : 'Trade License No'}</label>
                      <input
                        type="text"
                        placeholder="CN-XXXXXXX"
                        value={editFormData.trade_license_no || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, trade_license_no: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold block mb-1">{isRtl ? 'الرقم الضريبي TRN' : 'VAT TRN Number'}</label>
                      <input
                        type="text"
                        placeholder="100XXXXXXXXXXXX"
                        value={editFormData.trn_tax_number || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, trn_tax_number: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold block mb-1">{isRtl ? 'العنوان ومنطقة السكن' : 'Address / Area'}</label>
                      <input
                        type="text"
                        value={editFormData.address || ''}
                        onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                        placeholder={isRtl ? 'مثال: منطقة فلج هزاع، العين' : 'Al Ain, Abu Dhabi'}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                      <input
                        type="checkbox"
                        checked={!!editFormData.is_vip}
                        onChange={(e) => setEditFormData({ ...editFormData, is_vip: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span>{isRtl ? 'تصنيف كعميل مميز (VIP Client ⭐)' : 'Mark as VIP Client'}</span>
                    </label>
                  </div>

                  <div className="flex justify-end pt-3 border-t border-slate-100 gap-2">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      {isRtl ? 'حفظ التعديلات' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 space-y-3">
              <Users className="w-12 h-12 mx-auto opacity-30" />
              <p className="text-sm font-medium">{isRtl ? 'يرجى اختيار عميل من القائمة لعرض تفاصيله' : 'Select a customer to view profile'}</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: Comprehensive New Customer Modal */}
      {isNewCustomerModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsNewCustomerModalOpen(false);
          }}
        >
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">
                    {isRtl ? 'إضافة ملف عميل جديد في المنظومة' : 'Add New Customer Profile'}
                  </h3>
                  <p className="text-xs text-blue-200">
                    {isRtl ? 'تسجيل عميل جديد مع الفحص التلقائي لعدم التكرار' : 'Customer creation with duplicate checking'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewCustomerModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error banner */}
            {newFormError && (
              <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{newFormError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleCreateNewCustomer} className="p-6 space-y-4 text-xs">
              {/* Type Switcher */}
              <div>
                <label className="text-slate-700 font-bold block mb-1.5">{isRtl ? 'نوع العميل:' : 'Customer Type:'}</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewCustomerType(CustomerType.INDIVIDUAL)}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                      newCustomerType === CustomerType.INDIVIDUAL
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    {isRtl ? 'أفراد (شخصي)' : 'Individual'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewCustomerType(CustomerType.COMPANY)}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                      newCustomerType === CustomerType.COMPANY
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Building2 className="w-4 h-4" />
                    {isRtl ? 'شركات ومؤسسات' : 'Company'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewCustomerType(CustomerType.GOVERNMENT)}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                      newCustomerType === CustomerType.GOVERNMENT
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    {isRtl ? 'جهات حكومية' : 'Government'}
                  </button>
                </div>
              </div>

              {/* Names & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">
                    {isRtl ? 'الاسم باللغة العربية *' : 'Arabic Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newNameAr}
                    onChange={(e) => setNewNameAr(e.target.value)}
                    placeholder={isRtl ? 'مثال: شركة الخليج للتجارة' : 'Arabic Name'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">
                    {isRtl ? 'الاسم باللغة الإنجليزية' : 'English Name'}
                  </label>
                  <input
                    type="text"
                    value={newNameEn}
                    onChange={(e) => setNewNameEn(e.target.value)}
                    placeholder="English Name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">
                    {isRtl ? 'رقم الهاتف / الواتساب *' : 'Phone / WhatsApp *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="+971 50 XXXXXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">
                    {isRtl ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="client@domain.ae"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                {newCustomerType === CustomerType.INDIVIDUAL ? (
                  <>
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">
                        {isRtl ? 'رقم الهوية الإماراتية' : 'Emirates ID'}
                      </label>
                      <input
                        type="text"
                        value={newEmiratesId}
                        onChange={(e) => setNewEmiratesId(e.target.value)}
                        placeholder="784-19XX-XXXXXXX-X"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold block mb-1">
                        {isRtl ? 'رقم جواز السفر' : 'Passport No'}
                      </label>
                      <input
                        type="text"
                        value={newPassportNo}
                        onChange={(e) => setNewPassportNo(e.target.value)}
                        placeholder="P0XXXXXX"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-slate-700 font-bold block mb-1">
                        {isRtl ? 'رقم الرخصة التجارية DED' : 'Trade License No'}
                      </label>
                      <input
                        type="text"
                        value={newTradeLicenseNo}
                        onChange={(e) => setNewTradeLicenseNo(e.target.value)}
                        placeholder="CN-XXXXXXX"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-slate-700 font-bold block mb-1">
                        {isRtl ? 'الرقم الضريبي TRN' : 'VAT TRN Number'}
                      </label>
                      <input
                        type="text"
                        value={newTrnTaxNo}
                        onChange={(e) => setNewTrnTaxNo(e.target.value)}
                        placeholder="100XXXXXXXXXXXX"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="text-slate-700 font-bold block mb-1">
                    {isRtl ? 'العنوان بالعين' : 'Address in Al Ain'}
                  </label>
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder={isRtl ? 'المرخانية، العين' : 'Al Ain'}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">
                    {isRtl ? 'مصدر استقطاب العميل' : 'Source'}
                  </label>
                  <select
                    value={newSource}
                    onChange={(e) => setNewSource(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="زيارة مباشرة للمكتب">زيارة مباشرة للمكتب (Walk-in)</option>
                    <option value="واتساب">واتساب (WhatsApp)</option>
                    <option value="توصية عميل سابق">توصية عميل سابق (Referral)</option>
                    <option value="عقد شركة سنوي">عقد شركة سنوي (Corporate)</option>
                    <option value="موقع إلكتروني / إعلان">إعلانات وتواصل اجتماعي (Social)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">{isRtl ? 'ملاحظات إضافية' : 'Notes'}</label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder={isRtl ? 'أي متطلبات أو شروط خاصة بالعميل...' : 'Special notes...'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={newIsVip}
                    onChange={(e) => setNewIsVip(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span>{isRtl ? 'تصنيف كعميل مميز (VIP Client ⭐)' : 'Mark as VIP Client'}</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewCustomerModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs transition-colors"
                >
                  {isRtl ? 'إضافة العميل للمنظومة' : 'Create Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Document / ID Modal */}
      {isAddDocumentModalOpen && selectedCustomer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddDocumentModalOpen(false);
          }}
        >
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 to-blue-900 text-white">
              <h3 className="font-bold text-sm">
                {isRtl ? `إرفاق مستند للعميل: ${selectedCustomer.name_ar}` : 'Attach Client Document'}
              </h3>
              <button
                onClick={() => setIsAddDocumentModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDocument} className="p-6 space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">{isRtl ? 'عنوان المستند *' : 'Title *'}</label>
                <input
                  type="text"
                  required
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder={isRtl ? 'مثال: بطاقة الهوية الإماراتية 2026' : 'Emirates ID 2026'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">{isRtl ? 'نوع المستند' : 'Type'}</label>
                  <select
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white"
                  >
                    <option value="بطاقة هوية إماراتية">بطاقة هوية إماراتية (Emirates ID)</option>
                    <option value="جواز سفر">جواز سفر (Passport)</option>
                    <option value="رخصة تجارية">رخصة تجارية (Trade License)</option>
                    <option value="بطاقة منشأة">بطاقة منشأة (Establishment Card)</option>
                    <option value="وكالة قانونية">وكالة قانونية (Power of Attorney)</option>
                    <option value="عقد إيجار توثيق">عقد إيجار توثيق (Tawtheeq)</option>
                    <option value="مستند آخر">مستند آخر (Other)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-700 font-bold block mb-1">{isRtl ? 'تاريخ الانتهاء' : 'Expiry Date'}</label>
                  <input
                    type="date"
                    required
                    value={newDocExpiry}
                    onChange={(e) => setNewDocExpiry(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">{isRtl ? 'ملاحظات' : 'Notes'}</label>
                <input
                  type="text"
                  value={newDocNotes}
                  onChange={(e) => setNewDocNotes(e.target.value)}
                  placeholder={isRtl ? 'ملاحظات التجديد والتنبيه...' : 'Notes...'}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddDocumentModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold"
                >
                  {isRtl ? 'حفظ وإرفاق المستند' : 'Attach Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL 3: CSV Template Import Hub */}
      {isCsvImportModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsCsvImportModalOpen(false);
          }}
        >
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 text-slate-900" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-950 text-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">
                    {isRtl ? 'استيراد العملاء عبر ملف CSV' : 'Import Customers via CSV Template'}
                  </h3>
                  <p className="text-xs text-emerald-200">
                    {isRtl ? 'تنزيل قالب معتمد وإدخال السجلات بسرعة' : 'Download master template & populate records instantly'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCsvImportModalOpen(false);
                  setImportStatus(null);
                  setCsvFile(null);
                }}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Step 1: Download Template Instruction Card */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <h4 className="text-xs font-bold text-emerald-950">
                    {isRtl ? 'الخطوة 1: تنزيل وتعبئة قالب الإدخال' : 'Step 1: Download & Fill Out Template'}
                  </h4>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    {isRtl
                      ? 'لضمان نجاح الاستيراد التلقائي، يرجى استخدام القالب المعتمد الذي يحتوي على الأعمدة الصحيحة والمطلوبة لملف العميل.'
                      : 'To ensure seamless import, download our verified template with all required and recommended database headers.'}
                  </p>
                  <button
                    type="button"
                    onClick={downloadTemplateCsv}
                    className="inline-flex items-center gap-1.5 py-1 px-3.5 rounded-lg bg-white hover:bg-emerald-100 text-emerald-950 text-xs font-bold border border-emerald-200 shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isRtl ? 'تحميل قالب CSV الفارغ' : 'Download Blank Template'}</span>
                  </button>
                </div>
              </div>

              {/* Status Alert block */}
              {importStatus && (
                <div
                  className={`p-4 rounded-xl text-xs flex items-start gap-3 border ${
                    importStatus.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {importStatus.success ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="font-semibold leading-relaxed">{importStatus.message}</div>
                </div>
              )}

              {/* Step 2: Upload Area */}
              <form onSubmit={handleCsvImport} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700">
                    {isRtl ? 'الخطوة 2: حدد ملف CSV المطلوب استيراده' : 'Step 2: Choose filled CSV file'}
                  </label>
                  
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 bg-slate-50 hover:bg-slate-100/50 transition-colors text-center relative">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setCsvFile(file);
                        setImportStatus(null);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="w-10 h-10 mx-auto text-slate-400 mb-2" />
                    <p className="text-xs font-bold text-slate-700">
                      {csvFile ? csvFile.name : isRtl ? 'اسحب ملف الـ CSV هنا أو اضغط للتصفح' : 'Drag & drop CSV file here or click to browse'}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {isRtl ? 'يدعم الملفات بصيغة .csv فقط (الحد الأقصى 5 ميجابايت)' : 'Supports .csv extension only (Max 5MB)'}
                    </p>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCsvImportModalOpen(false);
                      setImportStatus(null);
                      setCsvFile(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
                  >
                    {isRtl ? 'إغلاق' : 'Close'}
                  </button>
                  <button
                    type="submit"
                    disabled={!csvFile || isImporting}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isImporting ? (isRtl ? 'جاري الاستيراد...' : 'Importing...') : isRtl ? 'بدء استيراد البيانات' : 'Start Bulk Import'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
