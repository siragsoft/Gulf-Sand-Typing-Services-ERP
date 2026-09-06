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
import { ROLE_PERMISSIONS, canCreateInTable, canDeleteInTable, canEditInTable } from '../utils/rbac';
import { generateCustomerProfilePDF } from '../utils/pdfGenerator';
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
  Eye,
  Download,
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
  FileCheck,
  AlertCircle,
  Clock3,
  PhoneCall,
  Share2,
} from 'lucide-react';

interface CRMProps {
  currentRole: UserRole;
  lang: 'ar' | 'en';
  onOpenNewTransactionForCustomer?: (customerId: string, customerName: string) => void;
  onOpenNewInvoiceForCustomer?: (customerId: string, customerName: string) => void;
  onViewRecord?: (record: any) => void;
  initialSelectedCustomerId?: string | null;
}

export const CRM: React.FC<CRMProps> = ({
  currentRole,
  lang,
  onOpenNewTransactionForCustomer,
  onOpenNewInvoiceForCustomer,
  onViewRecord,
  initialSelectedCustomerId,
}) => {
  const isRtl = lang === 'ar';
  const rolePerm = ROLE_PERMISSIONS[currentRole];
  const canViewFinancials = rolePerm ? rolePerm.canViewFinancialReports : true;
  const canCreateCustomer = canCreateInTable(currentRole, 'customers');
  const canEditCustomer = canEditInTable(currentRole, 'customers');
  const canDeleteCustomer = canDeleteInTable(currentRole, 'customers');

  // Database reactive collections
  const [customers, setCustomers] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [crmFollowups, setCrmFollowups] = useState<any[]>([]);

  // Selection & UI state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(initialSelectedCustomerId || null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SERVICES' | 'DOCUMENTS' | 'FOLLOWUPS' | 'FINANCES'>('OVERVIEW');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'INDIVIDUAL' | 'COMPANY' | 'VIP' | 'EXPIRING_DOCS' | 'ACTIVE_SERVICES'>('ALL');
  const [sortBy, setSortBy] = useState<'RECENT' | 'SPENT_DESC' | 'SERVICES_DESC' | 'NAME'>('RECENT');

  // Modals state
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [isEditCustomerModalOpen, setIsEditCustomerModalOpen] = useState(false);
  const [isAddDocModalOpen, setIsAddDocModalOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);

  // Form states
  const [customerFormData, setCustomerFormData] = useState<any>({
    customer_type: CustomerType.INDIVIDUAL,
    full_name_ar: '',
    full_name_en: '',
    phone: '',
    email: '',
    emirates_id_number: '',
    passport_number: '',
    trade_license_number: '',
    tax_registration_number_trn: '',
    address: 'العين، الإمارات العربية المتحدة',
    source: 'زيارة مباشرة للمكتب',
    is_vip: false,
    notes: '',
  });

  const [docFormData, setDocFormData] = useState({
    document_type: 'بطاقة الهوية الإماراتية (Emirates ID)',
    document_number: '',
    issue_date: new Date().toISOString().slice(0, 10),
    expiry_date: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
    notes: '',
  });

  const [noteFormData, setNoteFormData] = useState({
    contact_method: 'واتساب',
    interaction_type: 'تذكير بتجديد الوثائق',
    summary: '',
    next_action: '',
    next_action_date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
  });

  // Load database
  const reloadData = () => {
    setCustomers(db.getAll('customers') || []);
    setTransactions(db.getAll('transactions') || []);
    setInvoices(db.getAll('invoices') || []);
    setReceipts(db.getAll('collections_receipts') || []);
    setDocuments(db.getAll('documents') || []);
    setCrmFollowups(db.getAll('crm_followups') || []);
  };

  useEffect(() => {
    reloadData();
    const unsub1 = db.subscribe('customers', () => setCustomers(db.getAll('customers') || []));
    const unsub2 = db.subscribe('transactions', () => setTransactions(db.getAll('transactions') || []));
    const unsub3 = db.subscribe('invoices', () => setInvoices(db.getAll('invoices') || []));
    const unsub4 = db.subscribe('documents', () => setDocuments(db.getAll('documents') || []));
    const unsub5 = db.subscribe('crm_followups', () => setCrmFollowups(db.getAll('crm_followups') || []));
    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
      unsub5();
    };
  }, []);

  // Update selected customer if initial changes
  useEffect(() => {
    if (initialSelectedCustomerId) {
      setSelectedCustomerId(initialSelectedCustomerId);
    }
  }, [initialSelectedCustomerId]);

  // If no customer selected, select first customer by default on desktop
  useEffect(() => {
    if (!selectedCustomerId && customers.length > 0) {
      setSelectedCustomerId(customers[0].id);
    }
  }, [customers, selectedCustomerId]);

  // Selected customer object and associated records
  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId) || customers[0] || null;
  }, [customers, selectedCustomerId]);

  const customerTransactions = useMemo(() => {
    if (!selectedCustomer) return [];
    return transactions.filter(
      (t) =>
        t.customer_id === selectedCustomer.id ||
        t.customer_name_ar === selectedCustomer.full_name_ar ||
        t.customer_name_en === selectedCustomer.full_name_en
    );
  }, [transactions, selectedCustomer]);

  const customerInvoices = useMemo(() => {
    if (!selectedCustomer) return [];
    return invoices.filter(
      (i) =>
        i.customer_id === selectedCustomer.id ||
        i.customer_name === selectedCustomer.full_name_ar ||
        i.customer_name === selectedCustomer.full_name_en
    );
  }, [invoices, selectedCustomer]);

  const customerDocuments = useMemo(() => {
    if (!selectedCustomer) return [];
    return documents.filter(
      (d) =>
        d.customer_id === selectedCustomer.id ||
        d.entity_id === selectedCustomer.id ||
        d.customer_name === selectedCustomer.full_name_ar
    );
  }, [documents, selectedCustomer]);

  const customerFollowups = useMemo(() => {
    if (!selectedCustomer) return [];
    return crmFollowups.filter(
      (f) =>
        f.customer_id === selectedCustomer.id ||
        f.customer_name === selectedCustomer.full_name_ar
    );
  }, [crmFollowups, selectedCustomer]);

  // Helper for document status calculations
  const getDocumentExpiryStatus = (expiryDateStr?: string) => {
    if (!expiryDateStr) return { status: 'UNKNOWN', label: isRtl ? 'غير محدد' : 'Unknown', color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400', days: 0 };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expDate = new Date(expiryDateStr);
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        status: 'EXPIRED',
        label: isRtl ? `منتهية منذ ${Math.abs(diffDays)} يوم` : `Expired ${Math.abs(diffDays)}d ago`,
        color: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800',
        days: diffDays,
      };
    }
    if (diffDays <= 30) {
      return {
        status: 'EXPIRING_SOON',
        label: isRtl ? `تنتهي خلال ${diffDays} يوم` : `Expires in ${diffDays}d`,
        color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
        days: diffDays,
      };
    }
    return {
      status: 'VALID',
      label: isRtl ? `سارية (${diffDays} يوم متبقي)` : `Valid (${diffDays}d left)`,
      color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
      days: diffDays,
    };
  };

  // Filtered customer list
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((cust) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          cust.full_name_ar?.toLowerCase().includes(query) ||
          cust.full_name_en?.toLowerCase().includes(query) ||
          cust.phone?.includes(query) ||
          cust.email?.toLowerCase().includes(query) ||
          cust.emirates_id_number?.includes(query) ||
          cust.passport_number?.toLowerCase().includes(query) ||
          cust.trade_license_number?.includes(query) ||
          cust.id?.toLowerCase().includes(query);

        if (!matchesSearch) return false;

        if (typeFilter === 'INDIVIDUAL') return cust.customer_type === CustomerType.INDIVIDUAL;
        if (typeFilter === 'COMPANY') return cust.customer_type === CustomerType.COMPANY;
        if (typeFilter === 'VIP') return cust.is_vip === true;

        if (typeFilter === 'EXPIRING_DOCS') {
          const custDocs = documents.filter((d) => d.customer_id === cust.id || d.entity_id === cust.id);
          return custDocs.some((d) => {
            const exp = getDocumentExpiryStatus(d.expiry_date);
            return exp.status === 'EXPIRED' || exp.status === 'EXPIRING_SOON';
          });
        }

        if (typeFilter === 'ACTIVE_SERVICES') {
          const custTrx = transactions.filter((t) => t.customer_id === cust.id);
          return custTrx.some((t) => t.status === TransactionStatus.IN_PROGRESS || t.status === TransactionStatus.WAITING_DOCUMENTS);
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'SPENT_DESC') {
          return (Number(b.total_spent_aed) || 0) - (Number(a.total_spent_aed) || 0);
        }
        if (sortBy === 'SERVICES_DESC') {
          return (Number(b.total_transactions_count) || 0) - (Number(a.total_transactions_count) || 0);
        }
        if (sortBy === 'NAME') {
          return (a.full_name_ar || '').localeCompare(b.full_name_ar || '');
        }
        // Recent
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      });
  }, [customers, searchQuery, typeFilter, sortBy, documents, transactions]);

  // Customer Financial Totals
  const customerFinancials = useMemo(() => {
    if (!selectedCustomer) return { totalRevenue: 0, totalPaid: 0, pendingBalance: 0, servicesCount: 0 };
    const totalRevenue = customerTransactions.reduce((sum, t) => sum + (Number(t.total_amount_aed) || 0), 0);
    const totalPaid = customerInvoices
      .filter((i) => i.status === InvoiceStatus.PAID)
      .reduce((sum, i) => sum + (Number(i.total_amount_aed) || 0), 0);
    const pendingBalance = customerInvoices
      .filter((i) => i.status === InvoiceStatus.ISSUED || i.status === InvoiceStatus.PARTIALLY_PAID || i.status === InvoiceStatus.OVERDUE)
      .reduce((sum, i) => sum + (Number(i.balance_due_aed) || Number(i.total_amount_aed) || 0), 0);


    return {
      totalRevenue: totalRevenue || selectedCustomer.total_spent_aed || 0,
      totalPaid,
      pendingBalance,
      servicesCount: customerTransactions.length || selectedCustomer.total_transactions_count || 0,
    };
  }, [selectedCustomer, customerTransactions, customerInvoices]);

  // Handle Save New Customer
  const handleSaveNewCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerFormData.full_name_ar.trim() && !customerFormData.full_name_en.trim()) {
      alert(isRtl ? 'يرجى إدخال اسم العميل' : 'Please enter customer name');
      return;
    }

    const newId = db.generateId('customers');
    const newRecord = {
      id: newId,
      customer_type: customerFormData.customer_type,
      full_name_ar: customerFormData.full_name_ar || customerFormData.full_name_en,
      full_name_en: customerFormData.full_name_en || customerFormData.full_name_ar,
      phone: customerFormData.phone || '+971 50 000 0000',
      email: customerFormData.email || '',
      emirates_id_number: customerFormData.emirates_id_number || '',
      passport_number: customerFormData.passport_number || '',
      trade_license_number: customerFormData.trade_license_number || '',
      tax_registration_number_trn: customerFormData.tax_registration_number_trn || '',
      address: customerFormData.address || 'العين، الإمارات',
      source: customerFormData.source || 'زيارة مباشرة',
      is_vip: !!customerFormData.is_vip,
      notes: customerFormData.notes || '',
      total_spent_aed: 0,
      total_transactions_count: 0,
      created_at: new Date().toISOString(),
    };

    db.insert('customers', newRecord);
    setIsNewCustomerModalOpen(false);
    setSelectedCustomerId(newId);
  };

  // Handle Update Customer
  const handleUpdateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    db.update('customers', selectedCustomer.id, {
      customer_type: customerFormData.customer_type,
      full_name_ar: customerFormData.full_name_ar,
      full_name_en: customerFormData.full_name_en,
      phone: customerFormData.phone,
      email: customerFormData.email,
      emirates_id_number: customerFormData.emirates_id_number,
      passport_number: customerFormData.passport_number,
      trade_license_number: customerFormData.trade_license_number,
      tax_registration_number_trn: customerFormData.tax_registration_number_trn,
      address: customerFormData.address,
      is_vip: customerFormData.is_vip,
      notes: customerFormData.notes,
    });

    setIsEditCustomerModalOpen(false);
  };

  // Open Edit Modal with current data
  const handleOpenEdit = () => {
    if (!selectedCustomer) return;
    setCustomerFormData({
      customer_type: selectedCustomer.customer_type || CustomerType.INDIVIDUAL,
      full_name_ar: selectedCustomer.full_name_ar || '',
      full_name_en: selectedCustomer.full_name_en || '',
      phone: selectedCustomer.phone || '',
      email: selectedCustomer.email || '',
      emirates_id_number: selectedCustomer.emirates_id_number || '',
      passport_number: selectedCustomer.passport_number || '',
      trade_license_number: selectedCustomer.trade_license_number || '',
      tax_registration_number_trn: selectedCustomer.tax_registration_number_trn || '',
      address: selectedCustomer.address || '',
      source: selectedCustomer.source || 'زيارة مباشرة',
      is_vip: !!selectedCustomer.is_vip,
      notes: selectedCustomer.notes || '',
    });
    setIsEditCustomerModalOpen(true);
  };

  // Handle Add Document
  const handleSaveDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const newDoc = {
      id: db.generateId('documents'),
      customer_id: selectedCustomer.id,
      customer_name: selectedCustomer.full_name_ar,
      document_type: docFormData.document_type,
      document_number: docFormData.document_number || 'DOC-' + Math.floor(100000 + Math.random() * 900000),
      issue_date: docFormData.issue_date,
      expiry_date: docFormData.expiry_date,
      notes: docFormData.notes,
      file_status: 'مرفوع وسارٍ',
      created_at: new Date().toISOString(),
    };

    db.insert('documents', newDoc);
    setIsAddDocModalOpen(false);
    setDocFormData({
      document_type: 'بطاقة الهوية الإماراتية (Emirates ID)',
      document_number: '',
      issue_date: new Date().toISOString().slice(0, 10),
      expiry_date: new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10),
      notes: '',
    });
  };

  // Handle Add CRM Followup Note
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const newNote = {
      id: db.generateId('crm_followups'),
      customer_id: selectedCustomer.id,
      customer_name: selectedCustomer.full_name_ar,
      contact_method: noteFormData.contact_method,
      interaction_type: noteFormData.interaction_type,
      summary: noteFormData.summary,
      next_action: noteFormData.next_action,
      next_action_date: noteFormData.next_action_date,
      status: 'مكتمل',
      created_at: new Date().toISOString(),
    };

    db.insert('crm_followups', newNote);
    setIsAddNoteModalOpen(false);
    setNoteFormData({
      contact_method: 'واتساب',
      interaction_type: 'تذكير بتجديد الوثائق',
      summary: '',
      next_action: '',
      next_action_date: new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
    });
  };

  // WhatsApp click handler
  const handleWhatsAppCustomer = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const greeting = isRtl
      ? `السلام عليكم أخي الكريم ${name}، نتواصل معك من مركز جلف ساند للخدمات والطباعة بخصوص معاملاتكم.`
      : `Hello ${name}, Gulf Sand Typing Services reaching out regarding your transactions.`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(greeting)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-md border border-blue-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-inner">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  {isRtl ? 'نظام إدارة علاقات العملاء (CRM) والملفات' : 'Customer Relationship Management (CRM)'}
                </h1>
                <p className="text-xs sm:text-sm text-blue-200 mt-0.5">
                  {isRtl
                    ? 'إدارة الملفات الشاملة، بيانات التواصل، سجل المعاملات والطباعة، وحالات وتنبيهات تجديد الوثائق'
                    : 'Manage customer profiles, contact info, typing service history, and document expiry tracking'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              id="crm-btn-add-customer"
              onClick={() => {
                setCustomerFormData({
                  customer_type: CustomerType.INDIVIDUAL,
                  full_name_ar: '',
                  full_name_en: '',
                  phone: '+971 5',
                  email: '',
                  emirates_id_number: '784-',
                  passport_number: '',
                  trade_license_number: '',
                  tax_registration_number_trn: '',
                  address: 'العين، أبوظبي',
                  source: 'زيارة مباشرة للمكتب',
                  is_vip: false,
                  notes: '',
                });
                setIsNewCustomerModalOpen(true);
              }}
              disabled={!canCreateCustomer}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{isRtl ? 'إضافة عميل جديد' : 'New Customer'}</span>
            </button>
          </div>
        </div>

        {/* Quick KPI Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-sm">
            <div className="text-blue-300 text-[11px] font-bold uppercase">{isRtl ? 'إجمالي العملاء' : 'Total Customers'}</div>
            <div className="text-xl font-black mt-1">{customers.length}</div>
            <div className="text-[10px] text-blue-200 mt-0.5">{customers.filter(c => c.customer_type === CustomerType.COMPANY).length} {isRtl ? 'شركات' : 'Companies'}</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-sm">
            <div className="text-amber-300 text-[11px] font-bold uppercase">{isRtl ? 'عملاء VIP' : 'VIP Accounts'}</div>
            <div className="text-xl font-black mt-1 text-amber-300">{customers.filter(c => c.is_vip).length}</div>
            <div className="text-[10px] text-blue-200 mt-0.5">{isRtl ? 'حسابات ذات أولوية' : 'Priority status'}</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-sm">
            <div className="text-rose-300 text-[11px] font-bold uppercase">{isRtl ? 'وثائق تتطلب التجديد' : 'Expiring Documents'}</div>
            <div className="text-xl font-black mt-1 text-rose-300">
              {documents.filter(d => {
                const s = getDocumentExpiryStatus(d.expiry_date);
                return s.status === 'EXPIRED' || s.status === 'EXPIRING_SOON';
              }).length}
            </div>
            <div className="text-[10px] text-blue-200 mt-0.5">{isRtl ? 'هوية، إقامة، جواز أو رخصة' : 'IDs, Visas, Licenses'}</div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-sm">
            <div className="text-emerald-300 text-[11px] font-bold uppercase">{isRtl ? 'إجمالي إيرادات العملاء' : 'Total Revenues'}</div>
            <div className="text-xl font-black mt-1 text-emerald-300">
              {customers.reduce((sum, c) => sum + (Number(c.total_spent_aed) || 0), 0).toLocaleString()} <span className="text-xs font-normal">AED</span>
            </div>
            <div className="text-[10px] text-blue-200 mt-0.5">{transactions.length} {isRtl ? 'معاملة مسجلة' : 'Logged transactions'}</div>
          </div>
        </div>
      </div>

      {/* Main 2-Column CRM Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Customer Directory (4 cols on LG) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                {isRtl ? 'دليل العملاء والشركات' : 'Customer Directory'}
              </h2>
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              {filteredCustomers.length}
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute top-3 start-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRtl ? 'بحث بالاسم، رقم الهاتف، الهوية، أو الرخصة...' : 'Search by name, phone, EID, license...'}
              className="w-full ps-9 pe-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute top-2.5 end-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                typeFilter === 'ALL'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {isRtl ? 'الكل' : 'All'}
            </button>
            <button
              onClick={() => setTypeFilter('INDIVIDUAL')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                typeFilter === 'INDIVIDUAL'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {isRtl ? 'أفراد' : 'Individuals'}
            </button>
            <button
              onClick={() => setTypeFilter('COMPANY')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                typeFilter === 'COMPANY'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {isRtl ? 'شركات' : 'Companies'}
            </button>
            <button
              onClick={() => setTypeFilter('VIP')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                typeFilter === 'VIP'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              VIP
            </button>
            <button
              onClick={() => setTypeFilter('EXPIRING_DOCS')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                typeFilter === 'EXPIRING_DOCS'
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {isRtl ? 'وثائق قاربت الانتهاء' : 'Expiring Docs'}
            </button>
          </div>

          {/* Customer Scroll List */}
          <div className="space-y-2 max-h-[620px] overflow-y-auto pe-1">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">{isRtl ? 'لا توجد نتائج مطابقة' : 'No matching customers found'}</p>
              </div>
            ) : (
              filteredCustomers.map((cust) => {
                const isSelected = selectedCustomer?.id === cust.id;
                const isCompany = cust.customer_type === CustomerType.COMPANY;
                return (
                  <div
                    key={cust.id}
                    onClick={() => setSelectedCustomerId(cust.id)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 shadow-sm'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                            isCompany
                              ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                              : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          }`}
                        >
                          {isCompany ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-1">
                              {isRtl ? cust.full_name_ar || cust.full_name_en : cust.full_name_en || cust.full_name_ar}
                            </h3>
                            {cust.is_vip && (
                              <span className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-[9px] font-black px-1 rounded-sm">
                                VIP
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <span className="font-mono">{cust.phone}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-end shrink-0">
                        <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {Number(cust.total_spent_aed || 0).toLocaleString()} AED
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {cust.total_transactions_count || 0} {isRtl ? 'معاملة' : 'jobs'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Customer Profile Workspace (8 cols on LG) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedCustomer ? (
            <>
              {/* Profile Card Summary */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 relative">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 text-xl font-bold shadow-md ${
                        selectedCustomer.customer_type === CustomerType.COMPANY
                          ? 'bg-purple-600 text-white'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {selectedCustomer.customer_type === CustomerType.COMPANY ? (
                        <Building2 className="w-8 h-8" />
                      ) : (
                        <User className="w-8 h-8" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
                          {selectedCustomer.full_name_ar}
                        </h2>
                        {selectedCustomer.full_name_en && (
                          <span className="text-xs text-slate-400 font-normal">
                            ({selectedCustomer.full_name_en})
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            selectedCustomer.customer_type === CustomerType.COMPANY
                              ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                              : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          }`}
                        >
                          {selectedCustomer.customer_type === CustomerType.COMPANY
                            ? isRtl
                              ? 'منشأة / شركة'
                              : 'Corporate'
                            : isRtl
                            ? 'فرد / متعامل'
                            : 'Individual'}
                        </span>
                        {selectedCustomer.is_vip && (
                          <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current" /> VIP
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 mt-2">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-blue-600" />
                          <span className="font-mono">{selectedCustomer.phone}</span>
                        </div>
                        {selectedCustomer.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{selectedCustomer.email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          <span>{selectedCustomer.address || 'العين'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions (WhatsApp, Call, Edit) */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleWhatsAppCustomer(selectedCustomer.phone, selectedCustomer.full_name_ar)}
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                      title={isRtl ? 'محادثة فورية على الواتساب' : 'WhatsApp Chat'}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>

                    <a
                      href={`tel:${selectedCustomer.phone}`}
                      className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'اتصال' : 'Call'}</span>
                    </a>

                    <button
                      onClick={() =>
                        generateCustomerProfilePDF({
                          customer: selectedCustomer,
                          transactions: customerTransactions,
                          invoices: customerInvoices,
                          lang: isRtl ? 'ar' : 'en',
                        })
                      }
                      className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                      title={isRtl ? 'تصدير ملف العميل كملف PDF رسمي' : 'Export Official Client PDF'}
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'تصدير PDF' : 'Export PDF'}</span>
                    </button>

                    {canEditCustomer && (
                      <button
                        onClick={handleOpenEdit}
                        className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'تعديل الملف' : 'Edit'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Identification Badges Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-b border-slate-100 dark:border-slate-800 text-xs">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                    <span className="text-slate-400 text-[10px] block">{isRtl ? 'الهوية الإماراتية' : 'Emirates ID'}</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {selectedCustomer.emirates_id_number || (isRtl ? 'غير مسجل' : 'Not recorded')}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                    <span className="text-slate-400 text-[10px] block">{isRtl ? 'جواز السفر' : 'Passport No'}</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {selectedCustomer.passport_number || (isRtl ? 'غير مسجل' : 'Not recorded')}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                    <span className="text-slate-400 text-[10px] block">{isRtl ? 'الرخصة التجارية' : 'Trade License'}</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {selectedCustomer.trade_license_number || (isRtl ? 'غير متوفر' : 'N/A')}
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
                    <span className="text-slate-400 text-[10px] block">{isRtl ? 'الرقم الضريبي TRN' : 'TRN Tax No'}</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-xs">
                      {selectedCustomer.tax_registration_number_trn || (isRtl ? 'غير مسجل' : 'N/A')}
                    </span>
                  </div>
                </div>

                {/* Sub-Tabs: Overview, Services History, Document Status, Follow-ups */}
                <div className="flex items-center gap-2 pt-4 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('OVERVIEW')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 ${
                      activeTab === 'OVERVIEW'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>{isRtl ? 'نظرة عامة' : 'Overview'}</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('SERVICES')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 ${
                      activeTab === 'SERVICES'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>
                      {isRtl ? 'سجل المعاملات والخدمات' : 'Service History'} ({customerTransactions.length})
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('DOCUMENTS')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 ${
                      activeTab === 'DOCUMENTS'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>
                      {isRtl ? 'حالة الوثائق والتجديدات' : 'Document Status'} ({customerDocuments.length})
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('FOLLOWUPS')}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shrink-0 ${
                      activeTab === 'FOLLOWUPS'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>
                      {isRtl ? 'سجل المتابعات والملاحظات' : 'CRM Follow-ups'} ({customerFollowups.length})
                    </span>
                  </button>
                </div>
              </div>

              {/* TAB 1: OVERVIEW */}
              {activeTab === 'OVERVIEW' && (
                <div className="space-y-6">
                  {/* Financial & Service Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-bold uppercase">{isRtl ? 'إجمالي المعاملات المنجزة' : 'Total Typing Jobs'}</span>
                        <FileSpreadsheet className="w-4 h-4 text-blue-500" />
                      </div>
                      <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                        {customerFinancials.servicesCount}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {customerTransactions.filter(t => t.status === TransactionStatus.COMPLETED).length} {isRtl ? 'معاملة مكتملة ومسلمة' : 'completed'}
                      </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-bold uppercase">{isRtl ? 'إجمالي المبيعات والرسوم' : 'Total Revenue'}</span>
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {customerFinancials.totalRevenue.toLocaleString()} <span className="text-xs font-normal">AED</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {isRtl ? 'شامل الرسوم الحكومية وأتعاب الطباعة' : 'Gov fees & typing charges'}
                      </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                      <div className="flex items-center justify-between text-slate-400 mb-2">
                        <span className="text-xs font-bold uppercase">{isRtl ? 'المستحقات المعلقة' : 'Pending Dues'}</span>
                        <Receipt className="w-4 h-4 text-rose-500" />
                      </div>
                      <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
                        {customerFinancials.pendingBalance.toLocaleString()} <span className="text-xs font-normal">AED</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {customerFinancials.pendingBalance > 0 ? (isRtl ? 'فواتير بحاجة لتحصيل' : 'Unpaid invoices') : (isRtl ? 'تم سداد جميع المبالغ' : 'All clear')}
                      </p>
                    </div>
                  </div>

                  {/* Quick Action Triggers for Customer */}
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 p-4 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <Plus className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-blue-950 dark:text-blue-200">
                          {isRtl ? 'فتح معاملة أو فاتورة فورية لهذا العميل' : 'Launch new job or invoice for this customer'}
                        </h4>
                        <p className="text-[11px] text-blue-800 dark:text-blue-300">
                          {isRtl ? 'تعبئة بيانات العميل تلقائياً في نافذة المعاملات' : 'Auto-populates customer data in quick actions'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {onOpenNewTransactionForCustomer && (
                        <button
                          onClick={() => onOpenNewTransactionForCustomer(selectedCustomer.id, selectedCustomer.full_name_ar)}
                          className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          {isRtl ? '+ معاملة طباعة جديدة' : '+ New Typing Job'}
                        </button>
                      )}
                      {onOpenNewInvoiceForCustomer && (
                        <button
                          onClick={() => onOpenNewInvoiceForCustomer(selectedCustomer.id, selectedCustomer.full_name_ar)}
                          className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                        >
                          {isRtl ? '+ إصدار فاتورة' : '+ Create Invoice'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Customer Notes */}
                  {selectedCustomer.notes && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 p-4 rounded-2xl text-xs text-amber-900 dark:text-amber-200">
                      <div className="font-bold mb-1 flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                        <Sparkles className="w-4 h-4" /> {isRtl ? 'ملاحظات خاصة بالعميل:' : 'Customer Notes:'}
                      </div>
                      <p className="leading-relaxed whitespace-pre-wrap">{selectedCustomer.notes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SERVICE HISTORY */}
              {activeTab === 'SERVICES' && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {isRtl ? 'سجل المعاملات والطباعة الإلكترونية' : 'Typing & Transaction History'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isRtl ? 'قائمة بجميع المعاملات التي تم إنجازها للعميل' : 'All processed governmental typing applications'}
                      </p>
                    </div>

                    {onOpenNewTransactionForCustomer && (
                      <button
                        onClick={() => onOpenNewTransactionForCustomer(selectedCustomer.id, selectedCustomer.full_name_ar)}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isRtl ? 'معاملة جديدة' : 'New Service'}</span>
                      </button>
                    )}
                  </div>

                  {customerTransactions.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">{isRtl ? 'لا توجد معاملات مسجلة بعد لهذا العميل' : 'No transactions recorded yet'}</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-start">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                            <th className="pb-3 text-start">{isRtl ? 'رقم المعاملة' : 'Transaction ID'}</th>
                            <th className="pb-3 text-start">{isRtl ? 'الخدمة والتصنيف' : 'Service & Category'}</th>
                            <th className="pb-3 text-start">{isRtl ? 'التاريخ' : 'Date'}</th>
                            <th className="pb-3 text-start">{isRtl ? 'الرسوم الحكومية' : 'Gov Fees'}</th>
                            <th className="pb-3 text-start">{isRtl ? 'رسوم الطباعة' : 'Typing Fee'}</th>
                            <th className="pb-3 text-start">{isRtl ? 'الإجمالي' : 'Total'}</th>
                            <th className="pb-3 text-start">{isRtl ? 'الحالة' : 'Status'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {customerTransactions.map((trx) => (
                            <tr key={trx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              <td className="py-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                                {trx.transaction_id || trx.id}
                              </td>
                              <td className="py-3">
                                <div className="font-bold text-slate-800 dark:text-slate-200">
                                  {trx.service_name_ar || trx.service_name_en || trx.service_category}
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium">{trx.service_category}</div>
                              </td>
                              <td className="py-3 text-slate-500 font-mono text-[11px]">
                                {trx.transaction_date || trx.created_at?.slice(0, 10)}
                              </td>
                              <td className="py-3 text-slate-600 dark:text-slate-300 font-mono">
                                {Number(trx.government_fee_aed || 0).toLocaleString()} AED
                              </td>
                              <td className="py-3 text-slate-600 dark:text-slate-300 font-mono">
                                {Number(trx.typing_fee_aed || 0).toLocaleString()} AED
                              </td>
                              <td className="py-3 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                                {Number(trx.total_amount_aed || 0).toLocaleString()} AED
                              </td>
                              <td className="py-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    trx.status === TransactionStatus.COMPLETED
                                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                      : trx.status === TransactionStatus.IN_PROGRESS
                                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                      : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                                  }`}
                                >
                                  {trx.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: DOCUMENT STATUS & EXPIRY */}
              {activeTab === 'DOCUMENTS' && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {isRtl ? 'محفظة الوثائق وتنبيهات تجديد الصلاحية' : 'Document Status & Expiry Hub'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isRtl
                          ? 'متابعة صلاحية الهوية، الإقامة، الجوازات، والرخص مع حساب الأيام المتبقية تلقائياً'
                          : 'Live expiry radar for Emirates ID, Passports, Residence Visas, and Trade Licenses'}
                      </p>
                    </div>

                    <button
                      onClick={() => setIsAddDocModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'إضافة وثيقة للملف' : 'Add Document'}</span>
                    </button>
                  </div>

                  {customerDocuments.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <FileCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">{isRtl ? 'لا توجد وثائق مسجلة بعد لهذا العميل' : 'No documents recorded for this customer'}</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customerDocuments.map((doc) => {
                        const exp = getDocumentExpiryStatus(doc.expiry_date);
                        return (
                          <div
                            key={doc.id}
                            className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center shrink-0">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                                    {doc.document_type}
                                  </h4>
                                  <div className="font-mono text-[11px] text-slate-500">
                                    {doc.document_number}
                                  </div>
                                </div>
                              </div>

                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${exp.color}`}>
                                {exp.label}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                              <div>
                                <span className="text-slate-400 block text-[10px]">{isRtl ? 'تاريخ الإصدار' : 'Issue Date'}</span>
                                <span className="font-mono">{doc.issue_date || '-'}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[10px]">{isRtl ? 'تاريخ الانتهاء' : 'Expiry Date'}</span>
                                <span className="font-mono font-bold">{doc.expiry_date || '-'}</span>
                              </div>
                            </div>

                            {doc.notes && (
                              <p className="text-[11px] text-slate-500 italic bg-white/50 dark:bg-slate-900/50 p-2 rounded-lg">
                                {doc.notes}
                              </p>
                            )}

                            {/* WhatsApp Expiry Reminder Action */}
                            {(exp.status === 'EXPIRED' || exp.status === 'EXPIRING_SOON') && (
                              <button
                                onClick={() => {
                                  const msg = isRtl
                                    ? `السلام عليكم ${selectedCustomer.full_name_ar}، نود تذكيركم بأن وثيقة (${doc.document_type}) الخاصة بكم تنتهي بتاريخ ${doc.expiry_date}. مركز جلف ساند للخدمات جاهز لمباشرة إجراءات التجديد فوراً.`
                                    : `Hello ${selectedCustomer.full_name_ar}, your ${doc.document_type} expires on ${doc.expiry_date}. Gulf Sand Typing Center is ready to process your renewal.`;
                                  window.open(`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                                }}
                                className="w-full py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-2xs"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>{isRtl ? 'إرسال تذكير تجديد عبر الواتساب' : 'Send WhatsApp Renewal Reminder'}</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: CRM FOLLOW-UPS */}
              {activeTab === 'FOLLOWUPS' && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {isRtl ? 'سجل الاتصالات والمتابعات الدورية' : 'Interaction Logs & Notes'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {isRtl ? 'توثيق المكالمات، رسائل الواتساب، والزيارات الميدانية' : 'Track customer touchpoints, callbacks, and renewal followups'}
                      </p>
                    </div>

                    <button
                      onClick={() => setIsAddNoteModalOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isRtl ? 'إضافة متابعة جديدة' : 'Add Note'}</span>
                    </button>
                  </div>

                  {customerFollowups.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      <p className="text-xs">{isRtl ? 'لا توجد ملاحظات أو متابعات سابقة' : 'No follow-up notes recorded'}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {customerFollowups.map((note) => (
                        <div
                          key={note.id}
                          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                                {note.contact_method}
                              </span>
                              <span className="font-bold text-slate-700 dark:text-slate-200">
                                {note.interaction_type}
                              </span>
                            </div>
                            <span className="text-slate-400 text-[11px] font-mono">
                              {note.created_at?.slice(0, 10)}
                            </span>
                          </div>

                          <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                            {note.summary}
                          </p>

                          {note.next_action && (
                            <div className="flex items-center gap-2 text-[11px] bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 p-2 rounded-xl border border-amber-200 dark:border-amber-900/50">
                              <Clock3 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span className="font-bold">{isRtl ? 'الإجراء القادم:' : 'Next Action:'}</span>
                              <span>{note.next_action}</span>
                              <span className="ms-auto font-mono font-bold">({note.next_action_date})</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                {isRtl ? 'يرجى اختيار عميل من القائمة' : 'Select a customer to view profile'}
              </h3>
            </div>
          )}
        </div>
      </div>

      {/* Modal: New Customer */}
      {isNewCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">
                    {isRtl ? 'إضافة عميل جديد للنظام' : 'Add New Customer Profile'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isRtl ? 'إنشاء ملف متعامل أو شركة مع كافة الوثائق' : 'Create individual or corporate client profile'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewCustomerModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveNewCustomer} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'نوع العميل' : 'Customer Type'}
                  </label>
                  <select
                    value={customerFormData.customer_type}
                    onChange={(e) => setCustomerFormData({ ...customerFormData, customer_type: e.target.value as CustomerType })}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value={CustomerType.INDIVIDUAL}>{isRtl ? 'فرد / متعامل' : 'Individual'}</option>
                    <option value={CustomerType.COMPANY}>{isRtl ? 'شركة / منشأة' : 'Company'}</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="new-cust-vip"
                    checked={customerFormData.is_vip}
                    onChange={(e) => setCustomerFormData({ ...customerFormData, is_vip: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                  />
                  <label htmlFor="new-cust-vip" className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {isRtl ? 'تصنيف كعميل VIP (أولوية قصوى)' : 'Mark as VIP Customer'}
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'الاسم باللغة العربية *' : 'Name in Arabic *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={customerFormData.full_name_ar}
                    onChange={(e) => setCustomerFormData({ ...customerFormData, full_name_ar: e.target.value })}
                    placeholder={isRtl ? 'مثال: محمد راشد النعيمي' : 'Arabic Name'}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'الاسم باللغة الإنجليزية' : 'Name in English'}
                  </label>
                  <input
                    type="text"
                    value={customerFormData.full_name_en}
                    onChange={(e) => setCustomerFormData({ ...customerFormData, full_name_en: e.target.value })}
                    placeholder="Mohammed Rashed"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'رقم الهاتف / الواتساب *' : 'Phone / WhatsApp *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={customerFormData.phone}
                    onChange={(e) => setCustomerFormData({ ...customerFormData, phone: e.target.value })}
                    placeholder="+971 50 123 4567"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'البريد الإلكتروني' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={customerFormData.email}
                    onChange={(e) => setCustomerFormData({ ...customerFormData, email: e.target.value })}
                    placeholder="client@domain.ae"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'رقم الهوية الإماراتية' : 'Emirates ID'}
                  </label>
                  <input
                    type="text"
                    value={customerFormData.emirates_id_number}
                    onChange={(e) => setCustomerFormData({ ...customerFormData, emirates_id_number: e.target.value })}
                    placeholder="784-1990-1234567-1"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'رقم جواز السفر' : 'Passport Number'}
                  </label>
                  <input
                    type="text"
                    value={customerFormData.passport_number}
                    onChange={(e) => setCustomerFormData({ ...customerFormData, passport_number: e.target.value })}
                    placeholder="N1234567"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>

                {customerFormData.customer_type === CustomerType.COMPANY && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {isRtl ? 'رقم الرخصة التجارية' : 'Trade License No'}
                      </label>
                      <input
                        type="text"
                        value={customerFormData.trade_license_number}
                        onChange={(e) => setCustomerFormData({ ...customerFormData, trade_license_number: e.target.value })}
                        placeholder="CN-123456"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        {isRtl ? 'الرقم الضريبي TRN' : 'TRN Tax Number'}
                      </label>
                      <input
                        type="text"
                        value={customerFormData.tax_registration_number_trn}
                        onChange={(e) => setCustomerFormData({ ...customerFormData, tax_registration_number_trn: e.target.value })}
                        placeholder="100234567800003"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                      />
                    </div>
                  </>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isRtl ? 'العنوان والموقع' : 'Address / City'}
                </label>
                <input
                  type="text"
                  value={customerFormData.address}
                  onChange={(e) => setCustomerFormData({ ...customerFormData, address: e.target.value })}
                  placeholder="العين، وسط المدينة"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isRtl ? 'ملاحظات إضافية' : 'Notes'}
                </label>
                <textarea
                  rows={2}
                  value={customerFormData.notes}
                  onChange={(e) => setCustomerFormData({ ...customerFormData, notes: e.target.value })}
                  placeholder={isRtl ? 'أي تفاصيل خاصة بمعاملات العميل...' : 'Customer specific instructions...'}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewCustomerModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md cursor-pointer"
                >
                  {isRtl ? 'حفظ العميل' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Customer */}
      {isEditCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="font-black text-slate-900 dark:text-slate-100 text-base mb-4">
              {isRtl ? 'تعديل بيانات الملف' : 'Edit Customer Profile'}
            </h3>
            <form onSubmit={handleUpdateCustomer} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{isRtl ? 'الاسم عربي' : 'Arabic Name'}</label>
                  <input
                    type="text"
                    value={customerFormData.full_name_ar}
                    onChange={(e) => setCustomerFormData({ ...customerFormData, full_name_ar: e.target.value })}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{isRtl ? 'رقم الهاتف' : 'Phone'}</label>
                  <input
                    type="text"
                    value={customerFormData.phone}
                    onChange={(e) => setCustomerFormData({ ...customerFormData, phone: e.target.value })}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{isRtl ? 'الهوية الإماراتية' : 'Emirates ID'}</label>
                  <input
                    type="text"
                    value={customerFormData.emirates_id_number}
                    onChange={(e) => setCustomerFormData({ ...customerFormData, emirates_id_number: e.target.value })}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{isRtl ? 'جواز السفر' : 'Passport No'}</label>
                  <input
                    type="text"
                    value={customerFormData.passport_number}
                    onChange={(e) => setCustomerFormData({ ...customerFormData, passport_number: e.target.value })}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">{isRtl ? 'ملاحظات' : 'Notes'}</label>
                <textarea
                  rows={2}
                  value={customerFormData.notes}
                  onChange={(e) => setCustomerFormData({ ...customerFormData, notes: e.target.value })}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditCustomerModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-500"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl"
                >
                  {isRtl ? 'تحديث' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Document */}
      {isAddDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="font-black text-slate-900 dark:text-slate-100 text-base mb-4">
              {isRtl ? 'إضافة وثيقة أو تجديد مستند' : 'Add / Update Document'}
            </h3>
            <form onSubmit={handleSaveDocument} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isRtl ? 'نوع الوثيقة' : 'Document Type'}
                </label>
                <select
                  value={docFormData.document_type}
                  onChange={(e) => setDocFormData({ ...docFormData, document_type: e.target.value })}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="بطاقة الهوية الإماراتية (Emirates ID)">بطاقة الهوية الإماراتية (Emirates ID)</option>
                  <option value="جواز السفر (Passport)">جواز السفر (Passport)</option>
                  <option value="تأشيرة الإقامة (Residence Visa)">تأشيرة الإقامة (Residence Visa)</option>
                  <option value="الرخصة التجارية (Trade License)">الرخصة التجارية (Trade License)</option>
                  <option value="بطاقة المنشأة والعمل (Establishment / Labor Card)">بطاقة المنشأة والعمل (Labor Card)</option>
                  <option value="عقد الإيجار والتوثيق (Tawtheeq / Ejari)">عقد الإيجار والتوثيق (Tawtheeq / Ejari)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isRtl ? 'رقم الوثيقة' : 'Document Number'}
                </label>
                <input
                  type="text"
                  required
                  value={docFormData.document_number}
                  onChange={(e) => setDocFormData({ ...docFormData, document_number: e.target.value })}
                  placeholder="784-..."
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'تاريخ الإصدار' : 'Issue Date'}
                  </label>
                  <input
                    type="date"
                    value={docFormData.issue_date}
                    onChange={(e) => setDocFormData({ ...docFormData, issue_date: e.target.value })}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'تاريخ الانتهاء' : 'Expiry Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={docFormData.expiry_date}
                    onChange={(e) => setDocFormData({ ...docFormData, expiry_date: e.target.value })}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isRtl ? 'ملاحظات' : 'Notes'}
                </label>
                <input
                  type="text"
                  value={docFormData.notes}
                  onChange={(e) => setDocFormData({ ...docFormData, notes: e.target.value })}
                  placeholder={isRtl ? 'تم التحقق من النسخة الأصلية...' : 'Verified from original...'}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddDocModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-500"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-xl"
                >
                  {isRtl ? 'حفظ الوثيقة' : 'Save Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add CRM Follow-up Note */}
      {isAddNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="font-black text-slate-900 dark:text-slate-100 text-base mb-4">
              {isRtl ? 'إضافة ملاحظة أو تسجيل تواصل' : 'Log CRM Interaction'}
            </h3>
            <form onSubmit={handleSaveNote} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'طريقة التواصل' : 'Contact Channel'}
                  </label>
                  <select
                    value={noteFormData.contact_method}
                    onChange={(e) => setNoteFormData({ ...noteFormData, contact_method: e.target.value })}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="واتساب">واتساب (WhatsApp)</option>
                    <option value="مكالمة هاتفية">مكالمة هاتفية (Phone Call)</option>
                    <option value="زيارة للمكتب">زيارة للمكتب (In-Person)</option>
                    <option value="بريد إلكتروني">بريد إلكتروني (Email)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'نوع المتابعة' : 'Interaction Type'}
                  </label>
                  <select
                    value={noteFormData.interaction_type}
                    onChange={(e) => setNoteFormData({ ...noteFormData, interaction_type: e.target.value })}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="تذكير بتجديد الوثائق">تذكير بتجديد الوثائق</option>
                    <option value="استفسار عن معاملة">استفسار عن معاملة</option>
                    <option value="متابعة سداد فاتورة">متابعة سداد فاتورة</option>
                    <option value="عرض خدمات جديدة">عرض خدمات جديدة</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isRtl ? 'ملخص المحادثة والملاحظة *' : 'Conversation Summary *'}
                </label>
                <textarea
                  required
                  rows={3}
                  value={noteFormData.summary}
                  onChange={(e) => setNoteFormData({ ...noteFormData, summary: e.target.value })}
                  placeholder={isRtl ? 'تم إبلاغ العميل بضرورة تجديد إقامة العامل المساعد...' : 'Details of conversation...'}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'الإجراء القادم المجدول' : 'Next Action'}
                  </label>
                  <input
                    type="text"
                    value={noteFormData.next_action}
                    onChange={(e) => setNoteFormData({ ...noteFormData, next_action: e.target.value })}
                    placeholder={isRtl ? 'معاودة الاتصال للاستلام' : 'Callback'}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isRtl ? 'تاريخ الإجراء القادم' : 'Followup Date'}
                  </label>
                  <input
                    type="date"
                    value={noteFormData.next_action_date}
                    onChange={(e) => setNoteFormData({ ...noteFormData, next_action_date: e.target.value })}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddNoteModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-500"
                >
                  {isRtl ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-xl"
                >
                  {isRtl ? 'حفظ المتابعة' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
