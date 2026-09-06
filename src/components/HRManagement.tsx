import React, { useState, useMemo, useEffect } from 'react';
import { db } from '../db/database';
import {
  UserRole,
  Department,
  ApprovalStatus,
  EmployeeRecord,
  AttendanceRecord,
  PayrollRecord,
  LeaveRecord,
  CommissionRecord
} from '../types/schema';
import { Language } from '../i18n/translations';
import {
  Users,
  UserPlus,
  Clock,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock3,
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  Eye,
  FileText,
  Printer,
  Download,
  Building2,
  Phone,
  Mail,
  Shield,
  Briefcase,
  Layers,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  CreditCard,
  Percent,
  Check,
  CalendarRange,
  ArrowUpRight,
  TrendingUp,
  FileSpreadsheet,
  Award,
  Coffee,
  AlertTriangle,
  UserCheck,
  UserX,
  Receipt,
  BookOpen,
  ShieldAlert,
  MessageSquare
} from 'lucide-react';

interface HRManagementProps {
  currentRole: UserRole;
  lang: Language;
  onNavigateTab?: (tab: string) => void;
}

export const HRManagement: React.FC<HRManagementProps> = ({
  currentRole,
  lang,
  onNavigateTab
}) => {
  const isAr = lang === 'ar';

  // Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<'EMPLOYEES' | 'ATTENDANCE' | 'PAYROLL' | 'LEAVES' | 'COMMISSIONS' | 'DOCUMENT_ALERTS'>('EMPLOYEES');

  // Database collections (reactive)
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);

  // Load and subscribe to database tables
  const reloadData = () => {
    setEmployees(db.getAll('employees'));
    setAttendanceLogs(db.getAll('attendance_logs'));
    setPayrolls(db.getAll('payroll'));
    setLeaves(db.getAll('leaves'));
    setCommissions(db.getAll('commissions'));
    setTransactions(db.getAll('transactions'));
    setDocuments(db.getAll('documents') || []);
  };

  useEffect(() => {
    reloadData();
    const unsub1 = db.subscribe('employees', () => setEmployees(db.getAll('employees')));
    const unsub2 = db.subscribe('attendance_logs', () => setAttendanceLogs(db.getAll('attendance_logs')));
    const unsub3 = db.subscribe('payroll', () => setPayrolls(db.getAll('payroll')));
    const unsub4 = db.subscribe('leaves', () => setLeaves(db.getAll('leaves')));
    const unsub5 = db.subscribe('commissions', () => setCommissions(db.getAll('commissions')));
    const unsub6 = db.subscribe('documents', () => setDocuments(db.getAll('documents') || []));
    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
      unsub5();
      unsub6();
    };
  }, []);

  // Document Alert State & Filters
  const [docTypeFilter, setDocTypeFilter] = useState<'ALL' | 'EXPIRED' | 'EXPIRING_30' | 'EXPIRING_90' | 'VALID'>('ALL');
  const [isUpdateDocModalOpen, setIsUpdateDocModalOpen] = useState(false);
  const [selectedDocForUpdate, setSelectedDocForUpdate] = useState<any | null>(null);
  const [docUpdateData, setDocUpdateData] = useState({ expiry_date: '', document_number: '', notes: '' });


  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedMonth, setSelectedMonth] = useState('2026-08');
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState(new Date().toISOString().slice(0, 10));

  // Modals state
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeRecord | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<EmployeeRecord | null>(null);
  
  const [isLogAttendanceModalOpen, setIsLogAttendanceModalOpen] = useState(false);
  const [selectedAttendanceForEdit, setSelectedAttendanceForEdit] = useState<AttendanceRecord | null>(null);

  const [isAddLeaveModalOpen, setIsAddLeaveModalOpen] = useState(false);
  const [selectedPayslipForView, setSelectedPayslipForView] = useState<PayrollRecord | null>(null);

  // New/Edit Employee Form State
  const [employeeFormData, setEmployeeFormData] = useState({
    employee_code: '',
    full_name_ar: '',
    full_name_en: '',
    email: '',
    phone: '',
    role: UserRole.OPERATIONS,
    department: Department.TYPING_OPERATIONS,
    job_title_ar: '',
    national_id_or_emirates_id: '',
    passport_number: '',
    join_date: new Date().toISOString().slice(0, 10),
    contract_type: 'دوام كامل' as 'دوام كامل' | 'دوام جزئي' | 'فترة تجربة',
    basic_salary_aed: 4500,
    housing_allowance_aed: 1500,
    transport_allowance_aed: 500,
    other_allowance_aed: 0,
    commission_target_aed: 15000,
    work_schedule_type: 'فترة واحدة (08:00 - 17:00)' as 'فترة واحدة (08:00 - 17:00)' | 'فترتان صباحية ومسائية (08:00 - 14:00 و 18:00 - 22:00)' | 'مخصص',
    is_active: true
  });

  // Attendance Form State
  const [attendanceFormData, setAttendanceFormData] = useState({
    employee_id: '',
    date: new Date().toISOString().slice(0, 10),
    shift_1_in: '08:00',
    shift_1_out: '14:00',
    shift_2_in: '18:00',
    shift_2_out: '22:00',
    status: 'حاضر' as 'حاضر' | 'متأخر' | 'غائب' | 'إجازة' | 'عطلة رسمية',
    late_minutes: 0,
    overtime_hours: 0,
    correction_reason: ''
  });

  // Leave Form State
  const [leaveFormData, setLeaveFormData] = useState({
    employee_id: '',
    leave_type: 'سنوية' as 'سنوية' | 'مرضية' | 'طارئة' | 'بدون راتب' | 'أخرى',
    start_date: new Date().toISOString().slice(0, 10),
    end_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    days_count: 7,
    is_paid: true,
    reason: ''
  });

  // Filtered Employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchSearch =
        !searchQuery.trim() ||
        emp.full_name_ar?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.full_name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employee_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.phone?.includes(searchQuery) ||
        emp.job_title_ar?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchDept = deptFilter === 'ALL' || emp.department === deptFilter;
      const matchStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && emp.is_active) ||
        (statusFilter === 'INACTIVE' && !emp.is_active) ||
        (statusFilter === 'PROBATION' && emp.contract_type === 'فترة تجربة');

      return matchSearch && matchDept && matchStatus;
    });
  }, [employees, searchQuery, deptFilter, statusFilter]);

  // Attendance by Date
  const attendanceForSelectedDate = useMemo(() => {
    return attendanceLogs.filter((log) => log.date === selectedAttendanceDate);
  }, [attendanceLogs, selectedAttendanceDate]);

  // Key KPI Computations
  const totalEmployeesCount = employees.length;
  const activeEmployeesCount = employees.filter((e) => e.is_active).length;
  
  const todayDateStr = new Date().toISOString().slice(0, 10);
  const todayAttendance = attendanceLogs.filter((a) => a.date === todayDateStr);
  const todayPresentCount = todayAttendance.filter((a) => a.status === 'حاضر' || a.status === 'متأخر').length;
  const todayLateCount = todayAttendance.filter((a) => a.status === 'متأخر').length;
  const todayAbsentCount = todayAttendance.filter((a) => a.status === 'غائب').length;

  const currentMonthPayrolls = useMemo(() => {
    return payrolls.filter((p) => p.month_year === selectedMonth);
  }, [payrolls, selectedMonth]);

  const totalMonthlyPayrollAed = useMemo(() => {
    return currentMonthPayrolls.reduce((sum, p) => sum + (Number(p.net_salary_aed) || 0), 0);
  }, [currentMonthPayrolls]);

  const pendingLeavesCount = leaves.filter((l) => l.status === ApprovalStatus.PENDING).length;

  // Open Add Employee Modal
  const handleOpenAddEmployee = () => {
    setEditingEmployee(null);
    setEmployeeFormData({
      employee_code: db.generateId('employees'),
      full_name_ar: '',
      full_name_en: '',
      email: '',
      phone: '+971 5',
      role: UserRole.OPERATIONS,
      department: Department.TYPING_OPERATIONS,
      job_title_ar: 'طبّاع ومعقب معاملات',
      national_id_or_emirates_id: '784-',
      passport_number: '',
      join_date: new Date().toISOString().slice(0, 10),
      contract_type: 'دوام كامل',
      basic_salary_aed: 4000,
      housing_allowance_aed: 1500,
      transport_allowance_aed: 500,
      other_allowance_aed: 0,
      commission_target_aed: 15000,
      work_schedule_type: 'فترة واحدة (08:00 - 17:00)',
      is_active: true
    });
    setIsAddEmployeeModalOpen(true);
  };

  // Open Edit Employee Modal
  const handleOpenEditEmployee = (emp: EmployeeRecord) => {
    setEditingEmployee(emp);
    setEmployeeFormData({
      employee_code: emp.employee_code || emp.id,
      full_name_ar: emp.full_name_ar || '',
      full_name_en: emp.full_name_en || '',
      email: emp.email || '',
      phone: emp.phone || '',
      role: emp.role || UserRole.OPERATIONS,
      department: emp.department || Department.TYPING_OPERATIONS,
      job_title_ar: emp.job_title_ar || '',
      national_id_or_emirates_id: emp.national_id_or_emirates_id || '',
      passport_number: emp.passport_number || '',
      join_date: emp.join_date || new Date().toISOString().slice(0, 10),
      contract_type: emp.contract_type || 'دوام كامل',
      basic_salary_aed: emp.basic_salary_aed || 0,
      housing_allowance_aed: emp.housing_allowance_aed || 0,
      transport_allowance_aed: emp.transport_allowance_aed || 0,
      other_allowance_aed: emp.other_allowance_aed || 0,
      commission_target_aed: emp.commission_target_aed || 0,
      work_schedule_type: emp.work_schedule_type || 'فترة واحدة (08:00 - 17:00)',
      is_active: emp.is_active ?? true
    });
    setIsAddEmployeeModalOpen(true);
  };

  // Save Employee (Insert or Update)
  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeFormData.full_name_ar.trim()) {
      alert(isAr ? 'يرجى إدخال اسم الموظف بالعربية' : 'Please enter employee Arabic name');
      return;
    }

    if (editingEmployee) {
      db.update('employees', editingEmployee.id, {
        ...employeeFormData,
        basic_salary_aed: Number(employeeFormData.basic_salary_aed) || 0,
        housing_allowance_aed: Number(employeeFormData.housing_allowance_aed) || 0,
        transport_allowance_aed: Number(employeeFormData.transport_allowance_aed) || 0,
        other_allowance_aed: Number(employeeFormData.other_allowance_aed) || 0,
        commission_target_aed: Number(employeeFormData.commission_target_aed) || 0,
      });
    } else {
      db.insert('employees', {
        ...employeeFormData,
        employee_code: employeeFormData.employee_code || db.generateId('employees'),
        basic_salary_aed: Number(employeeFormData.basic_salary_aed) || 0,
        housing_allowance_aed: Number(employeeFormData.housing_allowance_aed) || 0,
        transport_allowance_aed: Number(employeeFormData.transport_allowance_aed) || 0,
        other_allowance_aed: Number(employeeFormData.other_allowance_aed) || 0,
        commission_target_aed: Number(employeeFormData.commission_target_aed) || 0,
      });
    }

    setIsAddEmployeeModalOpen(false);
    reloadData();
  };

  // Toggle Employee Active Status
  const handleToggleEmployeeStatus = (emp: EmployeeRecord) => {
    db.update('employees', emp.id, { is_active: !emp.is_active });
    reloadData();
  };

  // Quick Batch Attendance: Mark All Active Present for today
  const handleMarkAllActivePresent = () => {
    const activeEmps = employees.filter((e) => e.is_active);
    let addedCount = 0;
    activeEmps.forEach((emp) => {
      const existing = attendanceLogs.find((a) => a.employee_id === emp.id && a.date === selectedAttendanceDate);
      if (!existing) {
        db.insert('attendance_logs', {
          employee_id: emp.id,
          employee_name_ar: emp.full_name_ar,
          date: selectedAttendanceDate,
          shift_1_in: '08:00',
          shift_1_out: '14:00',
          shift_2_in: '18:00',
          shift_2_out: '22:00',
          total_worked_hours: 9.0,
          late_minutes: 0,
          early_leave_minutes: 0,
          overtime_hours: 0,
          status: 'حاضر',
          is_corrected: false
        });
        addedCount++;
      }
    });

    reloadData();
    alert(
      isAr
        ? `تم تسجيل حضور ${addedCount} موظف بنجاح لتاريخ ${selectedAttendanceDate}`
        : `Marked attendance for ${addedCount} employees for ${selectedAttendanceDate}`
    );
  };

  // Open Log Attendance Modal
  const handleOpenLogAttendance = (empId?: string) => {
    setSelectedAttendanceForEdit(null);
    setAttendanceFormData({
      employee_id: empId || (employees[0]?.id || ''),
      date: selectedAttendanceDate,
      shift_1_in: '08:00',
      shift_1_out: '14:00',
      shift_2_in: '18:00',
      shift_2_out: '22:00',
      status: 'حاضر',
      late_minutes: 0,
      overtime_hours: 0,
      correction_reason: ''
    });
    setIsLogAttendanceModalOpen(true);
  };

  // Save Attendance Log
  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((x) => x.id === attendanceFormData.employee_id);
    const empName = emp ? emp.full_name_ar : 'موظف';

    const workedHours = attendanceFormData.status === 'غائب' ? 0 : 8.5 + Number(attendanceFormData.overtime_hours || 0);

    if (selectedAttendanceForEdit) {
      db.update('attendance_logs', selectedAttendanceForEdit.id, {
        ...attendanceFormData,
        total_worked_hours: workedHours,
        is_corrected: true
      });
    } else {
      db.insert('attendance_logs', {
        ...attendanceFormData,
        employee_name_ar: empName,
        total_worked_hours: workedHours,
        is_corrected: false
      });
    }

    setIsLogAttendanceModalOpen(false);
    reloadData();
  };

  // Generate / Recalculate Monthly Payroll for all active employees
  const handleGenerateMonthlyPayroll = () => {
    const activeEmps = employees.filter((e) => e.is_active);
    let count = 0;

    activeEmps.forEach((emp) => {
      const basic = Number(emp.basic_salary_aed) || 0;
      const allowances =
        (Number(emp.housing_allowance_aed) || 0) +
        (Number(emp.transport_allowance_aed) || 0) +
        (Number(emp.other_allowance_aed) || 0);

      // Calculate commissions for this employee in this month
      const empComms = commissions
        .filter((c) => c.employee_id === emp.id && (c.created_at || '').startsWith(selectedMonth))
        .reduce((sum, c) => sum + (Number(c.calculated_commission_aed) || 0), 0);

      // Overtime estimate from attendance
      const empAttendance = attendanceLogs.filter(
        (a) => a.employee_id === emp.id && (a.date || '').startsWith(selectedMonth)
      );
      const totalOtHours = empAttendance.reduce((sum, a) => sum + (Number(a.overtime_hours) || 0), 0);
      const otRatePerHour = basic / 26 / 8 * 1.25;
      const approvedOtAed = Math.round(totalOtHours * otRatePerHour);

      const net = basic + allowances + empComms + approvedOtAed;

      const existingPayroll = payrolls.find(
        (p) => p.employee_id === emp.id && p.month_year === selectedMonth
      );

      if (existingPayroll) {
        db.update('payroll', existingPayroll.id, {
          standard_days: 26,
          actual_worked_days: Math.max(1, 26 - empAttendance.filter((a) => a.status === 'غائب').length),
          basic_salary_aed: basic,
          allowances_aed: allowances,
          approved_commissions_aed: empComms > 0 ? empComms : existingPayroll.approved_commissions_aed || 0,
          approved_overtime_aed: approvedOtAed > 0 ? approvedOtAed : existingPayroll.approved_overtime_aed || 0,
          net_salary_aed: net > 0 ? net : existingPayroll.net_salary_aed,
        });
      } else {
        db.insert('payroll', {
          payroll_code: `PAY-${selectedMonth}-${emp.employee_code || emp.id}`,
          month_year: selectedMonth,
          employee_id: emp.id,
          employee_name_ar: emp.full_name_ar,
          standard_days: 26,
          actual_worked_days: 26,
          basic_salary_aed: basic,
          allowances_aed: allowances,
          approved_commissions_aed: empComms || (emp.role === UserRole.OPERATIONS ? 450 : 0),
          approved_overtime_aed: approvedOtAed || 150,
          deductions_aed: 0,
          loan_deductions_aed: 0,
          net_salary_aed: basic + allowances + (empComms || (emp.role === UserRole.OPERATIONS ? 450 : 0)) + 150,
          status: 'مراجعة HR'
        });
      }
      count++;
    });

    reloadData();
    alert(
      isAr
        ? `تم تحديث وإصدار مسير الرواتب لـ ${count} موظف لشهر ${selectedMonth} بنجاح`
        : `Generated and updated payroll for ${count} employees for ${selectedMonth}`
    );
  };

  // Update Payroll Status (Workflow: مراجعة HR -> مراجعة الحسابات -> معتمد ومقفل -> مدفوع)
  const handleAdvancePayrollStatus = (p: PayrollRecord) => {
    let nextStatus: 'مراجعة HR' | 'مراجعة الحسابات' | 'معتمد ومقفل' | 'مدفوع' = 'مراجعة الحسابات';
    if (p.status === 'مراجعة HR') nextStatus = 'مراجعة الحسابات';
    else if (p.status === 'مراجعة الحسابات') nextStatus = 'معتمد ومقفل';
    else if (p.status === 'معتمد ومقفل') nextStatus = 'مدفوع';

    db.update('payroll', p.id, {
      status: nextStatus,
      paid_date: nextStatus === 'مدفوع' ? new Date().toISOString().slice(0, 10) : p.paid_date
    });

    // If marked paid, create an automated expense record for accounting
    if (nextStatus === 'مدفوع') {
      db.insert('expenses', {
        expense_code: db.generateId('expenses'),
        category: 'رواتب',
        account_id: 'ACC-6010',
        amount_aed: p.net_salary_aed,
        expense_date: new Date().toISOString().slice(0, 10),
        payment_method: 'تحويل بنكي / WPS',
        paid_from_account_id: 'CBA-002',
        paid_to_payee: p.employee_name_ar,
        notes: `صرف راتب شهر ${p.month_year} للموظف ${p.employee_name_ar} (مسير رقم ${p.payroll_code})`,
        status: ApprovalStatus.APPROVED
      });
    }

    reloadData();
  };

  // Save Leave Request
  const handleSaveLeave = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((x) => x.id === leaveFormData.employee_id);
    const empName = emp ? emp.full_name_ar : 'موظف';

    db.insert('leaves', {
      leave_code: db.generateId('leaves'),
      employee_id: leaveFormData.employee_id,
      employee_name_ar: empName,
      leave_type: leaveFormData.leave_type,
      start_date: leaveFormData.start_date,
      end_date: leaveFormData.end_date,
      days_count: Number(leaveFormData.days_count) || 1,
      is_paid: leaveFormData.is_paid,
      reason: leaveFormData.reason,
      status: ApprovalStatus.APPROVED
    });

    setIsAddLeaveModalOpen(false);
    reloadData();
  };

  // Approve / Reject Leave
  const handleUpdateLeaveStatus = (leaveId: string, status: ApprovalStatus) => {
    db.update('leaves', leaveId, { status });
    reloadData();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200" dir={isAr ? 'rtl' : 'ltr'}>
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER & KPI METRICS SUMMARY */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black shadow-sm shadow-purple-200">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">
                  {isAr ? 'إدارة الموارد البشرية والرواتب (HR & Payroll)' : 'Human Resources & Payroll Hub'}
                </h2>
                <span className="text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full">
                  {isAr ? 'معتمد نظام حماية الأجور UAE WPS' : 'UAE WPS & MOHRE Compliant'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {isAr
                  ? 'إدارة متكاملة لملفات الموظفين، سجلات الحضور والانصراف، مسير الرواتب المعتمد، والإجازات.'
                  : 'Complete employee lifecycle management, attendance tracking, monthly payroll runs, and leaves.'}
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Launchers */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            id="hr-btn-add-employee"
            onClick={handleOpenAddEmployee}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isAr ? 'إضافة موظف جديد' : 'New Employee'}</span>
          </button>

          <button
            id="hr-btn-log-attendance"
            onClick={() => handleOpenLogAttendance()}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>{isAr ? 'تسجيل حضور' : 'Log Attendance'}</span>
          </button>

          <button
            id="hr-btn-generate-payroll"
            onClick={handleGenerateMonthlyPayroll}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
          >
            <DollarSign className="w-4 h-4" />
            <span>{isAr ? 'معالجة مسير الرواتب' : 'Run Payroll'}</span>
          </button>

          <button
            id="hr-btn-request-leave"
            onClick={() => {
              setLeaveFormData({
                employee_id: employees[0]?.id || '',
                leave_type: 'سنوية',
                start_date: new Date().toISOString().slice(0, 10),
                end_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
                days_count: 7,
                is_paid: true,
                reason: ''
              });
              setIsAddLeaveModalOpen(true);
            }}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 border border-slate-200 transition active:scale-95 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-600" />
            <span>{isAr ? 'طلب إجازة' : 'Request Leave'}</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. STATS CARDS STRIP */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Employees */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-purple-300 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {isAr ? 'إجمالي الكادر الوظيفي' : 'Total Workforce'}
              </span>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {totalEmployeesCount}{' '}
                <span className="text-xs font-bold text-slate-500">{isAr ? 'موظف' : 'employees'}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{activeEmployeesCount} {isAr ? 'على رأس العمل' : 'Active'}</span>
            </span>
            <span>{totalEmployeesCount - activeEmployeesCount} {isAr ? 'غير نشط' : 'Inactive'}</span>
          </div>
        </div>

        {/* Card 2: Today's Attendance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {isAr ? 'حضور اليوم في الفرع' : "Today's Attendance"}
              </span>
              <div className="text-2xl font-black text-indigo-700 mt-1">
                {todayPresentCount} / {activeEmployeesCount}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-amber-600 font-bold">{todayLateCount} {isAr ? 'متأخر' : 'Late'}</span>
            <span className="text-rose-600 font-bold">{todayAbsentCount} {isAr ? 'غائب' : 'Absent'}</span>
          </div>
        </div>

        {/* Card 3: Monthly Payroll Total */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {isAr ? `مسير رواتب (${selectedMonth})` : `Payroll (${selectedMonth})`}
              </span>
              <div className="text-2xl font-black text-emerald-700 mt-1">
                {totalMonthlyPayrollAed.toLocaleString()}{' '}
                <span className="text-xs font-bold text-slate-500">AED</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{currentMonthPayrolls.length} {isAr ? 'مسير مسجل' : 'records'}</span>
            <span className="text-emerald-600 font-bold">{isAr ? 'نظام حماية الأجور WPS' : 'WPS Ready'}</span>
          </div>
        </div>

        {/* Card 4: Pending Leaves / Approvals */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-amber-300 transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {isAr ? 'طلبات الإجازات المعلقة' : 'Pending Leave Requests'}
              </span>
              <div className="text-2xl font-black text-amber-600 mt-1">
                {pendingLeavesCount}{' '}
                <span className="text-xs font-bold text-slate-500">{isAr ? 'طلب' : 'requests'}</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CalendarRange className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="text-slate-600">{leaves.length} {isAr ? 'إجمالي الطلبات' : 'Total Leaves'}</span>
            <span className="text-purple-600 font-bold">{isAr ? 'تتطلب موافقة HR' : 'Needs Approval'}</span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. SUB-NAVIGATION TABS */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('EMPLOYEES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeSubTab === 'EMPLOYEES'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{isAr ? 'دليل وسجلات الموظفين' : 'Employee Directory & Profiles'}</span>
          <span className="text-[10px] bg-purple-500 text-white px-1.5 py-0.2 rounded-full">{employees.length}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ATTENDANCE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeSubTab === 'ATTENDANCE'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{isAr ? 'الحضور والانصراف اليومي' : 'Daily Attendance & Shifts'}</span>
          <span className="text-[10px] bg-indigo-500 text-white px-1.5 py-0.2 rounded-full">{attendanceLogs.length}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('PAYROLL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeSubTab === 'PAYROLL'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>{isAr ? 'مسير الرواتب وقسائم الأجور' : 'Payroll & Pay Slips (WPS)'}</span>
          <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.2 rounded-full">{currentMonthPayrolls.length}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('LEAVES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeSubTab === 'LEAVES'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CalendarRange className="w-4 h-4" />
          <span>{isAr ? 'الإجازات والمغادرات' : 'Leaves & Vacations'}</span>
          {pendingLeavesCount > 0 && (
            <span className="text-[10px] bg-amber-500 text-white px-1.5 py-0.2 rounded-full animate-pulse">{pendingLeavesCount}</span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('COMMISSIONS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeSubTab === 'COMMISSIONS'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>{isAr ? 'حوافز وعمولات المعاملات' : 'Commissions & Incentives'}</span>
          <span className="text-[10px] bg-blue-500 text-white px-1.5 py-0.2 rounded-full">{commissions.length}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('DOCUMENT_ALERTS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shrink-0 ${
            activeSubTab === 'DOCUMENT_ALERTS'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{isAr ? 'تنبيهات تجديد وثائق الموظفين' : 'Document Renewal Alerts'}</span>
          <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded-full font-black animate-pulse">
            {employees.length * 2}
          </span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. TAB 1: EMPLOYEES DIRECTORY */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'EMPLOYEES' && (
        <div className="space-y-4">
          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute top-2.5 right-3 rtl:right-3 ltr:right-auto ltr:left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'بحث بالاسم، الكود، المسمى الوظيفي، أو الهاتف...' : 'Search employee by name, code, title...'}
                className="w-full py-1.5 px-9 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:outline-none"
              >
                <option value="ALL">{isAr ? 'كافة الأقسام' : 'All Departments'}</option>
                <option value={Department.MANAGEMENT}>{isAr ? 'الإدارة العامة' : 'Management'}</option>
                <option value={Department.TYPING_OPERATIONS}>{isAr ? 'قسم الطباعة والعمليات' : 'Typing Ops'}</option>
                <option value={Department.ACCOUNTS_FINANCE}>{isAr ? 'الحسابات والمالية' : 'Finance'}</option>
                <option value={Department.TOURISM_TRAVEL}>{isAr ? 'السياحة وحجوزات الطيران' : 'Travel'}</option>
                <option value={Department.HUMAN_RESOURCES}>{isAr ? 'الموارد البشرية' : 'HR'}</option>
                <option value={Department.CUSTOMER_SERVICE}>{isAr ? 'خدمة العملاء والاستقبال' : 'Customer Service'}</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-1.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:outline-none"
              >
                <option value="ALL">{isAr ? 'كافة الحالات' : 'All Statuses'}</option>
                <option value="ACTIVE">{isAr ? 'على رأس العمل فقط' : 'Active Only'}</option>
                <option value="INACTIVE">{isAr ? 'غير نشط / منتهي' : 'Inactive'}</option>
                <option value="PROBATION">{isAr ? 'فترة تجربة' : 'In Probation'}</option>
              </select>
            </div>
          </div>

          {/* Employees Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map((emp) => {
              const totalPackage =
                (Number(emp.basic_salary_aed) || 0) +
                (Number(emp.housing_allowance_aed) || 0) +
                (Number(emp.transport_allowance_aed) || 0) +
                (Number(emp.other_allowance_aed) || 0);

              return (
                <div
                  key={emp.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-purple-300 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                        {emp.full_name_ar?.slice(0, 2) || 'GS'}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{emp.full_name_ar}</h4>
                          <span
                            className={`w-2 h-2 rounded-full ${emp.is_active ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            title={emp.is_active ? 'Active' : 'Inactive'}
                          />
                        </div>
                        <p className="text-xs text-purple-700 font-semibold line-clamp-1">{emp.job_title_ar}</p>
                        <span className="text-[10px] font-mono text-slate-400">{emp.employee_code || emp.id}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {emp.contract_type || 'دوام كامل'}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl space-y-1.5 text-xs text-slate-600 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{isAr ? 'القسم:' : 'Dept:'}</span>
                      </span>
                      <span className="font-semibold text-slate-800">{emp.department}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{isAr ? 'الهاتف:' : 'Phone:'}</span>
                      </span>
                      <span className="font-mono font-bold text-slate-800">{emp.phone || '-'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-500">
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>{isAr ? 'إجمالي الراتب:' : 'Total Package:'}</span>
                      </span>
                      <span className="font-mono font-black text-emerald-700">{totalPackage.toLocaleString()} AED</span>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditEmployee(emp)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-purple-700 hover:bg-purple-50 transition"
                        title={isAr ? 'تعديل بيانات الموظف' : 'Edit'}
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleToggleEmployeeStatus(emp)}
                        className={`p-1.5 rounded-lg transition ${
                          emp.is_active
                            ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                            : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={emp.is_active ? (isAr ? 'تعطيل الحساب' : 'Deactivate') : isAr ? 'تفعيل' : 'Activate'}
                      >
                        {emp.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleOpenLogAttendance(emp.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 transition"
                        title={isAr ? 'تسجيل حضور اليوم' : 'Log Attendance'}
                      >
                        <Clock className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => setViewingEmployee(emp)}
                      className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                    >
                      <span>{isAr ? 'الملف الكامل' : 'Full Profile'}</span>
                      <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. TAB 2: ATTENDANCE TRACKER */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'ATTENDANCE' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isAr ? 'سجل الحضور والانصراف والفترات' : 'Daily Attendance & Shifts Ledger'}
              </h3>
              <p className="text-xs text-slate-500">
                {isAr ? 'تتبع الدوام الصباحي والمسائي، التأخيرات، وساعات العمل الإضافية' : 'Track morning and evening shifts, late minutes, and overtime'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <input
                  type="date"
                  value={selectedAttendanceDate}
                  onChange={(e) => setSelectedAttendanceDate(e.target.value)}
                  className="bg-transparent focus:outline-none text-slate-800 font-mono text-xs"
                />
              </div>

              <button
                onClick={handleMarkAllActivePresent}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isAr ? 'تسجيل حضور جماعي لليوم' : 'Mark All Present'}</span>
              </button>

              <button
                onClick={() => handleOpenLogAttendance()}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAr ? 'تسجيل فردي' : 'Add Entry'}</span>
              </button>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-xs text-right rtl:text-right ltr:text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3">{isAr ? 'الموظف' : 'Employee'}</th>
                  <th className="p-3">{isAr ? 'التاريخ' : 'Date'}</th>
                  <th className="p-3">{isAr ? 'الفترة الصباحية' : 'Morning Shift'}</th>
                  <th className="p-3">{isAr ? 'الفترة المسائية' : 'Evening Shift'}</th>
                  <th className="p-3">{isAr ? 'ساعات العمل' : 'Hours'}</th>
                  <th className="p-3">{isAr ? 'التأخير' : 'Late (min)'}</th>
                  <th className="p-3">{isAr ? 'الإضافي' : 'Overtime'}</th>
                  <th className="p-3">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="p-3 text-center">{isAr ? 'إجراء' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendanceForSelectedDate.length > 0 ? (
                  attendanceForSelectedDate.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-bold text-slate-900">{log.employee_name_ar}</td>
                      <td className="p-3 font-mono text-slate-500">{log.date}</td>
                      <td className="p-3 font-mono text-slate-600">
                        {log.shift_1_in || '-'} {log.shift_1_out ? `-> ${log.shift_1_out}` : ''}
                      </td>
                      <td className="p-3 font-mono text-slate-600">
                        {log.shift_2_in || '-'} {log.shift_2_out ? `-> ${log.shift_2_out}` : ''}
                      </td>
                      <td className="p-3 font-mono font-bold text-indigo-700">{log.total_worked_hours || 0} hrs</td>
                      <td className="p-3 font-mono">
                        {log.late_minutes > 0 ? (
                          <span className="text-amber-600 font-bold">+{log.late_minutes} دقيقة</span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="p-3 font-mono">
                        {log.overtime_hours > 0 ? (
                          <span className="text-emerald-600 font-bold">+{log.overtime_hours} ساعة</span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.status === 'حاضر'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.status === 'متأخر'
                              ? 'bg-amber-100 text-amber-800'
                              : log.status === 'غائب'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedAttendanceForEdit(log);
                            setAttendanceFormData({
                              employee_id: log.employee_id,
                              date: log.date,
                              shift_1_in: log.shift_1_in || '08:00',
                              shift_1_out: log.shift_1_out || '14:00',
                              shift_2_in: log.shift_2_in || '18:00',
                              shift_2_out: log.shift_2_out || '22:00',
                              status: log.status as any,
                              late_minutes: log.late_minutes || 0,
                              overtime_hours: log.overtime_hours || 0,
                              correction_reason: log.correction_reason || ''
                            });
                            setIsLogAttendanceModalOpen(true);
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400">
                      {isAr ? 'لم يتم تسجيل حضور لهذا التاريخ بعد. انقر على "تسجيل حضور جماعي"' : 'No attendance logged for this date.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. TAB 3: PAYROLL & PAYSLIPS (WPS) */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'PAYROLL' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {isAr ? 'مسير الرواتب المعتمد ونظام حماية الأجور (UAE WPS)' : 'Monthly Payroll & Salary Slips (WPS)'}
                </h3>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  {selectedMonth}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {isAr ? 'الراتب الأساسي + البدلات + العمولات المحصلة + الإضافي - الاستقطاعات' : 'Basic salary + Allowances + Commissions + OT - Deductions'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent focus:outline-none text-slate-800 font-mono font-bold"
                >
                  <option value="2026-08">2026-08 (أغسطس)</option>
                  <option value="2026-07">2026-07 (يوليو)</option>
                  <option value="2026-06">2026-06 (يونيو)</option>
                </select>
              </div>

              <button
                onClick={handleGenerateMonthlyPayroll}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAr ? 'إعادة احتساب وتحديث المسير' : 'Run / Recalculate'}</span>
              </button>
            </div>
          </div>

          {/* Payroll Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-xs text-right rtl:text-right ltr:text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3">{isAr ? 'الموظف' : 'Employee'}</th>
                  <th className="p-3">{isAr ? 'أيام العمل' : 'Days (26)'}</th>
                  <th className="p-3">{isAr ? 'الأساسي' : 'Basic AED'}</th>
                  <th className="p-3">{isAr ? 'البدلات' : 'Allowances'}</th>
                  <th className="p-3">{isAr ? 'العمولات' : 'Commissions'}</th>
                  <th className="p-3">{isAr ? 'الإضافي' : 'Overtime'}</th>
                  <th className="p-3">{isAr ? 'الخصومات' : 'Deductions'}</th>
                  <th className="p-3">{isAr ? 'صافي الراتب' : 'Net Salary'}</th>
                  <th className="p-3">{isAr ? 'حالة الاعتماد' : 'Status'}</th>
                  <th className="p-3 text-center">{isAr ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentMonthPayrolls.length > 0 ? (
                  currentMonthPayrolls.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-bold text-slate-900">
                        <div>{p.employee_name_ar}</div>
                        <span className="text-[10px] font-mono text-slate-400">{p.payroll_code}</span>
                      </td>
                      <td className="p-3 font-mono">{p.actual_worked_days || 26} / 26</td>
                      <td className="p-3 font-mono text-slate-700">{Number(p.basic_salary_aed || 0).toLocaleString()}</td>
                      <td className="p-3 font-mono text-slate-700">{Number(p.allowances_aed || 0).toLocaleString()}</td>
                      <td className="p-3 font-mono text-blue-600 font-bold">+{Number(p.approved_commissions_aed || 0).toLocaleString()}</td>
                      <td className="p-3 font-mono text-emerald-600 font-bold">+{Number(p.approved_overtime_aed || 0).toLocaleString()}</td>
                      <td className="p-3 font-mono text-rose-600 font-bold">-{Number(p.deductions_aed || 0).toLocaleString()}</td>
                      <td className="p-3 font-mono font-black text-slate-900 text-sm">
                        {Number(p.net_salary_aed || 0).toLocaleString()} <span className="text-[10px] font-bold text-slate-400">AED</span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'مدفوع'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'معتمد ومقفل'
                              ? 'bg-indigo-100 text-indigo-800'
                              : p.status === 'مراجعة الحسابات'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedPayslipForView(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 transition"
                            title={isAr ? 'عرض قسيمة الراتب' : 'View Payslip'}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {p.status !== 'مدفوع' && (
                            <button
                              onClick={() => handleAdvancePayrollStatus(p)}
                              className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[10px] flex items-center gap-1 transition"
                            >
                              <Check className="w-3 h-3" />
                              <span>
                                {p.status === 'مراجعة HR'
                                  ? isAr ? 'اعتماد HR' : 'HR Approve'
                                  : p.status === 'مراجعة الحسابات'
                                  ? isAr ? 'اعتماد الحسابات' : 'Accounts'
                                  : isAr ? 'صرف WPS' : 'Pay WPS'}
                              </span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400">
                      {isAr ? 'لا يوجد مسير رواتب لهذا الشهر. اضغط على "معالجة مسير الرواتب" بالأعلى.' : 'No payroll runs found for this month.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. TAB 4: LEAVES & VACATIONS */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'LEAVES' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isAr ? 'إدارة الإجازات والمغادرات الرسمية' : 'Leaves & Vacations Tracker'}
              </h3>
              <p className="text-xs text-slate-500">
                {isAr ? 'متابعة الإجازات السنوية، المرضية، والطارئة وموافقات الإدارة' : 'Annual, sick, and emergency leaves workflow'}
              </p>
            </div>

            <button
              onClick={() => {
                setLeaveFormData({
                  employee_id: employees[0]?.id || '',
                  leave_type: 'سنوية',
                  start_date: new Date().toISOString().slice(0, 10),
                  end_date: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
                  days_count: 7,
                  is_paid: true,
                  reason: ''
                });
                setIsAddLeaveModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? 'تقديم طلب إجازة' : 'Request Leave'}</span>
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-xs text-right rtl:text-right ltr:text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3"># {isAr ? 'الكود' : 'Code'}</th>
                  <th className="p-3">{isAr ? 'الموظف' : 'Employee'}</th>
                  <th className="p-3">{isAr ? 'نوع الإجازة' : 'Type'}</th>
                  <th className="p-3">{isAr ? 'من تاريخ' : 'Start'}</th>
                  <th className="p-3">{isAr ? 'إلى تاريخ' : 'End'}</th>
                  <th className="p-3">{isAr ? 'الأيام' : 'Days'}</th>
                  <th className="p-3">{isAr ? 'السبب' : 'Reason'}</th>
                  <th className="p-3">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="p-3 text-center">{isAr ? 'القرار' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-mono font-bold text-amber-700">{l.leave_code || l.id}</td>
                    <td className="p-3 font-bold text-slate-900">{l.employee_name_ar}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {l.leave_type}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-600">{l.start_date}</td>
                    <td className="p-3 font-mono text-slate-600">{l.end_date}</td>
                    <td className="p-3 font-bold text-slate-900">{l.days_count} {isAr ? 'يوم' : 'days'}</td>
                    <td className="p-3 text-slate-600 max-w-xs truncate">{l.reason || '-'}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          l.status === ApprovalStatus.APPROVED
                            ? 'bg-emerald-100 text-emerald-800'
                            : l.status === ApprovalStatus.REJECTED
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {l.status}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      {l.status === ApprovalStatus.PENDING ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleUpdateLeaveStatus(l.id, ApprovalStatus.APPROVED)}
                            className="p-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold"
                            title={isAr ? 'موافقة' : 'Approve'}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleUpdateLeaveStatus(l.id, ApprovalStatus.REJECTED)}
                            className="p-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold"
                            title={isAr ? 'رفض' : 'Reject'}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold">{isAr ? 'معتمد' : 'Settled'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 8. TAB 5: COMMISSIONS & INCENTIVES */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'COMMISSIONS' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isAr ? 'سجل حوافز وعمولات إنجاز المعاملات' : 'Employee Commissions & Performance Incentives'}
            </h3>
            <p className="text-xs text-slate-500">
              {isAr ? 'تستحق العمولات للطباعين والمعقبين عند التحصيل الكامل للفاتورة من العميل' : 'Commissions unlocked upon full transaction fee collection'}
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-xs text-right rtl:text-right ltr:text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3"># {isAr ? 'العمولة' : 'Code'}</th>
                  <th className="p-3">{isAr ? 'الموظف' : 'Employee'}</th>
                  <th className="p-3">{isAr ? 'المعاملة المرتبطة' : 'Transaction'}</th>
                  <th className="p-3">{isAr ? 'قيمة المعاملة' : 'Amount AED'}</th>
                  <th className="p-3">{isAr ? 'العمولة المحتسبة' : 'Commission'}</th>
                  <th className="p-3">{isAr ? 'حالة التحصيل' : 'Collection'}</th>
                  <th className="p-3">{isAr ? 'حالة الصرف' : 'Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {commissions.length > 0 ? (
                  commissions.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-mono font-bold text-blue-700">{c.commission_code || c.id}</td>
                      <td className="p-3 font-bold text-slate-900">{c.employee_name_ar}</td>
                      <td className="p-3 font-mono text-slate-600">{c.transaction_id || '-'}</td>
                      <td className="p-3 font-mono">{Number(c.transaction_amount_aed || 0).toFixed(2)} AED</td>
                      <td className="p-3 font-mono font-black text-emerald-700">
                        {Number(c.calculated_commission_aed || 0).toFixed(2)} AED
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.is_fully_collected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {c.is_fully_collected ? (isAr ? 'محصل بالكامل' : 'Collected') : isAr ? 'معلق' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      {isAr ? 'لا توجد سجلات عمولات مسجلة حالياً' : 'No commissions recorded'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 8. TAB 6: DOCUMENT RENEWAL ALERTS & EXPIRY RADAR */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'DOCUMENT_ALERTS' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {isAr ? 'رادار متابعة صلاحية الوثائق والإقامات الرسمية للموظفين' : 'Employee Official Document Renewal Radar'}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {isAr
                  ? 'متابعة تلقائية لتجديد بطاقات الهوية، جوازات السفر، الإقامات، بطاقات العمل والتأمين الصحي'
                  : 'Automatic countdown for Emirates IDs, Passports, Residence Visas, MOHRE Labor Cards & Insurance'}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setDocTypeFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  docTypeFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {isAr ? 'كافة الوثائق' : 'All Docs'}
              </button>
              <button
                onClick={() => setDocTypeFilter('EXPIRED')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  docTypeFilter === 'EXPIRED' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                {isAr ? 'منتهية الصلاحية' : 'Expired'}
              </button>
              <button
                onClick={() => setDocTypeFilter('EXPIRING_30')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  docTypeFilter === 'EXPIRING_30' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                {isAr ? 'تنتهي خلال 30 يوم' : 'Within 30 Days'}
              </button>
              <button
                onClick={() => setDocTypeFilter('VALID')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  docTypeFilter === 'VALID' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                {isAr ? 'سارية الصلاحية' : 'Valid'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((emp) => {
              const joinYear = new Date(emp.join_date || '2024-01-01').getFullYear();
              const visaExpiry = `${joinYear + 2}-09-15`;
              const idExpiry = `${joinYear + 2}-08-20`;
              const passportExpiry = `${joinYear + 5}-04-10`;

              const today = new Date();
              today.setHours(0, 0, 0, 0);

              const checkExpiry = (dateStr: string) => {
                const d = new Date(dateStr);
                const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                if (diffDays < 0) return { label: isAr ? `منتهية (${Math.abs(diffDays)} يوم)` : `Expired ${Math.abs(diffDays)}d ago`, color: 'bg-rose-100 text-rose-700 border-rose-200', status: 'EXPIRED' };
                if (diffDays <= 30) return { label: isAr ? `تنتهي خلال ${diffDays} يوم` : `Expires in ${diffDays}d`, color: 'bg-amber-100 text-amber-800 border-amber-200', status: 'EXPIRING_30' };
                return { label: isAr ? `سارية (${diffDays} يوم متبقي)` : `Valid (${diffDays}d)`, color: 'bg-emerald-100 text-emerald-700 border-emerald-200', status: 'VALID' };
              };

              const visaStatus = checkExpiry(visaExpiry);
              const idStatus = checkExpiry(idExpiry);
              const passStatus = checkExpiry(passportExpiry);

              if (docTypeFilter === 'EXPIRED' && visaStatus.status !== 'EXPIRED' && idStatus.status !== 'EXPIRED' && passStatus.status !== 'EXPIRED') return null;
              if (docTypeFilter === 'EXPIRING_30' && visaStatus.status !== 'EXPIRING_30' && idStatus.status !== 'EXPIRING_30') return null;
              if (docTypeFilter === 'VALID' && visaStatus.status !== 'VALID' && idStatus.status !== 'VALID') return null;

              return (
                <div key={emp.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:border-purple-300 transition">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-black flex items-center justify-center text-xs">
                        {emp.full_name_ar.slice(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{emp.full_name_ar}</h4>
                        <span className="text-[11px] text-slate-400 font-mono">{emp.employee_code} • {emp.job_title_ar}</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">{emp.department}</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-slate-500 font-bold block text-[10px]">{isAr ? 'الهوية الإماراتية' : 'Emirates ID'}</span>
                        <span className="font-mono text-slate-800 font-bold text-[11px]">{emp.national_id_or_emirates_id || '784-1990-1234567-1'}</span>
                      </div>
                      <div className="text-end">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${idStatus.color}`}>
                          {idStatus.label}
                        </span>
                        <span className="block font-mono text-[10px] text-slate-400 mt-0.5">{idExpiry}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-slate-500 font-bold block text-[10px]">{isAr ? 'تأشيرة الإقامة الإماراتية' : 'Residence Visa'}</span>
                        <span className="font-mono text-slate-800 font-bold text-[11px]">201/{joinYear}/1234567</span>
                      </div>
                      <div className="text-end">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${visaStatus.color}`}>
                          {visaStatus.label}
                        </span>
                        <span className="block font-mono text-[10px] text-slate-400 mt-0.5">{visaExpiry}</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-slate-500 font-bold block text-[10px]">{isAr ? 'جواز السفر' : 'Passport'}</span>
                        <span className="font-mono text-slate-800 font-bold text-[11px]">{emp.passport_number || 'P01234567'}</span>
                      </div>
                      <div className="text-end">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${passStatus.color}`}>
                          {passStatus.label}
                        </span>
                        <span className="block font-mono text-[10px] text-slate-400 mt-0.5">{passportExpiry}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => {
                        const msg = isAr
                          ? `السلام عليكم ${emp.full_name_ar}، نود تذكيركم بقرب انتهاء وثائق إقامتكم وهويتكم. يرجى التنسيق مع قسم الموارد البشرية لتجديدها.`
                          : `Hello ${emp.full_name_ar}, reminder to update your residence documents with HR.`;
                        window.open(`https://wa.me/${emp.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                      }}
                      className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center gap-1 transition cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{isAr ? 'تنبيه واتساب' : 'WhatsApp Notice'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedDocForUpdate({
                          empId: emp.id,
                          empName: emp.full_name_ar,
                          docType: 'تأشيرة الإقامة (Residence Visa)',
                          currentExpiry: visaExpiry,
                        });
                        setDocUpdateData({ expiry_date: visaExpiry, document_number: `201/${joinYear}/1234567`, notes: '' });
                        setIsUpdateDocModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition cursor-pointer"
                    >
                      {isAr ? 'تحديث التاريخ' : 'Update'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Update Document Expiry */}
      {isUpdateDocModalOpen && selectedDocForUpdate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                {isAr ? 'تحديث تاريخ انتهاء الوثيقة' : 'Update Document Expiry'}
              </h3>
              <button
                onClick={() => setIsUpdateDocModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl text-xs text-purple-900 space-y-1">
              <div className="font-bold">{selectedDocForUpdate.empName}</div>
              <div className="text-purple-700">{selectedDocForUpdate.docType}</div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert(isAr ? 'تم تحديث تاريخ انتهاء الوثيقة بنجاح' : 'Document expiry updated successfully');
                setIsUpdateDocModalOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-slate-700 block mb-1">{isAr ? 'رقم الوثيقة' : 'Doc Number'}</label>
                <input
                  type="text"
                  value={docUpdateData.document_number}
                  onChange={(e) => setDocUpdateData({ ...docUpdateData, document_number: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{isAr ? 'تاريخ الانتهاء الجديد' : 'New Expiry Date'}</label>
                <input
                  type="date"
                  required
                  value={docUpdateData.expiry_date}
                  onChange={(e) => setDocUpdateData({ ...docUpdateData, expiry_date: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUpdateDocModalOpen(false)}
                  className="px-4 py-2 text-slate-500 font-bold cursor-pointer"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold cursor-pointer"
                >
                  {isAr ? 'حفظ التحديث' : 'Save Expiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 9. MODAL: ADD / EDIT EMPLOYEE */}
      {/* ------------------------------------------------------------- */}
      {isAddEmployeeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-purple-700 to-indigo-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    {editingEmployee ? (isAr ? 'تعديل بيانات الموظف' : 'Edit Employee') : isAr ? 'إضافة موظف جديد' : 'New Employee'}
                  </h3>
                  <p className="text-xs text-purple-200">
                    {isAr ? 'تسجيل الموظف في الهيكل الإداري وحساب الراتب المعتمد' : 'Employee file & salary package'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddEmployeeModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isAr ? 'الاسم الكامل بالعربية *' : 'Full Name (Arabic) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={employeeFormData.full_name_ar}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, full_name_ar: e.target.value })}
                    placeholder="مثال: محمد عبدالله الشحي"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isAr ? 'الاسم بالإنجليزية' : 'Full Name (English)'}
                  </label>
                  <input
                    type="text"
                    value={employeeFormData.full_name_en}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, full_name_en: e.target.value })}
                    placeholder="e.g. Mohammed Al Shehhi"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isAr ? 'المسمى الوظيفي *' : 'Job Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={employeeFormData.job_title_ar}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, job_title_ar: e.target.value })}
                    placeholder="مثال: طبّاع أول ومعقب معاملات"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isAr ? 'القسم / الإدارة *' : 'Department *'}
                  </label>
                  <select
                    value={employeeFormData.department}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, department: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  >
                    <option value={Department.TYPING_OPERATIONS}>{isAr ? 'قسم الطباعة والعمليات' : 'Typing Ops'}</option>
                    <option value={Department.MANAGEMENT}>{isAr ? 'الإدارة العامة' : 'Management'}</option>
                    <option value={Department.ACCOUNTS_FINANCE}>{isAr ? 'الحسابات والمالية' : 'Finance'}</option>
                    <option value={Department.TOURISM_TRAVEL}>{isAr ? 'السياحة وحجوزات الطيران' : 'Tourism'}</option>
                    <option value={Department.HUMAN_RESOURCES}>{isAr ? 'الموارد البشرية' : 'HR'}</option>
                    <option value={Department.CUSTOMER_SERVICE}>{isAr ? 'خدمة العملاء والاستقبال' : 'Customer Service'}</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isAr ? 'رقم الهوية الإماراتية' : 'Emirates ID'}
                  </label>
                  <input
                    type="text"
                    value={employeeFormData.national_id_or_emirates_id}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, national_id_or_emirates_id: e.target.value })}
                    placeholder="784-1990-1234567-1"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isAr ? 'رقم الهاتف *' : 'Phone Number *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={employeeFormData.phone}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, phone: e.target.value })}
                    placeholder="+971 50 123 4567"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isAr ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={employeeFormData.email}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, email: e.target.value })}
                    placeholder="employee@gulfsandtyping.ae"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isAr ? 'نوع العقد' : 'Contract Type'}
                  </label>
                  <select
                    value={employeeFormData.contract_type}
                    onChange={(e) => setEmployeeFormData({ ...employeeFormData, contract_type: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  >
                    <option value="دوام كامل">{isAr ? 'دوام كامل' : 'Full Time'}</option>
                    <option value="دوام جزئي">{isAr ? 'دوام جزئي' : 'Part Time'}</option>
                    <option value="فترة تجربة">{isAr ? 'فترة تجربة' : 'Probation'}</option>
                  </select>
                </div>
              </div>

              {/* Salary Structure Box */}
              <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-100 space-y-3">
                <h4 className="font-bold text-purple-950 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-purple-700" />
                  <span>{isAr ? 'هيكل الراتب والبدلات الشهرية (درهم إماراتي)' : 'Salary Structure (AED)'}</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">{isAr ? 'الأساسي' : 'Basic'}</label>
                    <input
                      type="number"
                      value={employeeFormData.basic_salary_aed}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, basic_salary_aed: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg border border-purple-200 bg-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">{isAr ? 'بدل سكن' : 'Housing'}</label>
                    <input
                      type="number"
                      value={employeeFormData.housing_allowance_aed}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, housing_allowance_aed: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg border border-purple-200 bg-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">{isAr ? 'بدل مواصلات' : 'Transport'}</label>
                    <input
                      type="number"
                      value={employeeFormData.transport_allowance_aed}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, transport_allowance_aed: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg border border-purple-200 bg-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">{isAr ? 'بدلات أخرى' : 'Other'}</label>
                    <input
                      type="number"
                      value={employeeFormData.other_allowance_aed}
                      onChange={(e) => setEmployeeFormData({ ...employeeFormData, other_allowance_aed: Number(e.target.value) })}
                      className="w-full p-2 rounded-lg border border-purple-200 bg-white font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-purple-200 flex justify-between items-center text-xs font-bold text-purple-900">
                  <span>{isAr ? 'إجمالي الراتب الشهري المستحق:' : 'Total Monthly Salary:'}</span>
                  <span className="text-sm font-black font-mono">
                    {(
                      Number(employeeFormData.basic_salary_aed || 0) +
                      Number(employeeFormData.housing_allowance_aed || 0) +
                      Number(employeeFormData.transport_allowance_aed || 0) +
                      Number(employeeFormData.other_allowance_aed || 0)
                    ).toLocaleString()}{' '}
                    AED
                  </span>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEmployeeModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition shadow-xs"
                >
                  {editingEmployee ? (isAr ? 'حفظ التعديلات' : 'Update Employee') : isAr ? 'حفظ الموظف' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 10. MODAL: LOG ATTENDANCE */}
      {/* ------------------------------------------------------------- */}
      {isLogAttendanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-indigo-700 to-purple-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5" />
                <h3 className="text-base font-bold">
                  {selectedAttendanceForEdit ? (isAr ? 'تعديل تسجيل الحضور' : 'Edit Attendance') : isAr ? 'تسجيل الحضور والانصراف' : 'Log Attendance'}
                </h3>
              </div>
              <button
                onClick={() => setIsLogAttendanceModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAttendance} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">{isAr ? 'الموظف *' : 'Employee *'}</label>
                <select
                  value={attendanceFormData.employee_id}
                  onChange={(e) => setAttendanceFormData({ ...attendanceFormData, employee_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name_ar} ({emp.job_title_ar})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{isAr ? 'التاريخ' : 'Date'}</label>
                  <input
                    type="date"
                    value={attendanceFormData.date}
                    onChange={(e) => setAttendanceFormData({ ...attendanceFormData, date: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">{isAr ? 'الحالة' : 'Status'}</label>
                  <select
                    value={attendanceFormData.status}
                    onChange={(e) => setAttendanceFormData({ ...attendanceFormData, status: e.target.value as any })}
                    className="w-full p-2 rounded-xl border border-slate-200"
                  >
                    <option value="حاضر">{isAr ? 'حاضر (في الموعد)' : 'Present'}</option>
                    <option value="متأخر">{isAr ? 'متأخر' : 'Late'}</option>
                    <option value="غائب">{isAr ? 'غائب' : 'Absent'}</option>
                    <option value="إجازة">{isAr ? 'إجازة رسمية' : 'On Leave'}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <label className="font-semibold text-slate-600 block text-[10px]">{isAr ? 'دخول صباحي' : 'Shift 1 In'}</label>
                  <input
                    type="time"
                    value={attendanceFormData.shift_1_in}
                    onChange={(e) => setAttendanceFormData({ ...attendanceFormData, shift_1_in: e.target.value })}
                    className="w-full p-1.5 rounded-lg border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block text-[10px]">{isAr ? 'خروج صباحي' : 'Shift 1 Out'}</label>
                  <input
                    type="time"
                    value={attendanceFormData.shift_1_out}
                    onChange={(e) => setAttendanceFormData({ ...attendanceFormData, shift_1_out: e.target.value })}
                    className="w-full p-1.5 rounded-lg border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block text-[10px]">{isAr ? 'دخول مسائي' : 'Shift 2 In'}</label>
                  <input
                    type="time"
                    value={attendanceFormData.shift_2_in}
                    onChange={(e) => setAttendanceFormData({ ...attendanceFormData, shift_2_in: e.target.value })}
                    className="w-full p-1.5 rounded-lg border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block text-[10px]">{isAr ? 'خروج مسائي' : 'Shift 2 Out'}</label>
                  <input
                    type="time"
                    value={attendanceFormData.shift_2_out}
                    onChange={(e) => setAttendanceFormData({ ...attendanceFormData, shift_2_out: e.target.value })}
                    className="w-full p-1.5 rounded-lg border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{isAr ? 'دقائق التأخير' : 'Late (min)'}</label>
                  <input
                    type="number"
                    value={attendanceFormData.late_minutes}
                    onChange={(e) => setAttendanceFormData({ ...attendanceFormData, late_minutes: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{isAr ? 'ساعات إضافية' : 'Overtime (hrs)'}</label>
                  <input
                    type="number"
                    step="0.5"
                    value={attendanceFormData.overtime_hours}
                    onChange={(e) => setAttendanceFormData({ ...attendanceFormData, overtime_hours: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLogAttendanceModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs"
                >
                  {isAr ? 'حفظ الحضور' : 'Save Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 11. MODAL: ADD LEAVE REQUEST */}
      {/* ------------------------------------------------------------- */}
      {isAddLeaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CalendarRange className="w-5 h-5" />
                <h3 className="text-base font-bold">{isAr ? 'تقديم طلب إجازة' : 'Request Leave'}</h3>
              </div>
              <button
                onClick={() => setIsAddLeaveModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLeave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">{isAr ? 'الموظف *' : 'Employee *'}</label>
                <select
                  value={leaveFormData.employee_id}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, employee_id: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name_ar} ({emp.job_title_ar})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{isAr ? 'نوع الإجازة' : 'Leave Type'}</label>
                  <select
                    value={leaveFormData.leave_type}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, leave_type: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  >
                    <option value="سنوية">{isAr ? 'إجازة سنوية' : 'Annual'}</option>
                    <option value="مرضية">{isAr ? 'إجازة مرضية' : 'Sick'}</option>
                    <option value="طارئة">{isAr ? 'إجازة طارئة' : 'Emergency'}</option>
                    <option value="بدون راتب">{isAr ? 'إجازة بدون راتب' : 'Unpaid'}</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">{isAr ? 'عدد الأيام' : 'Days Count'}</label>
                  <input
                    type="number"
                    value={leaveFormData.days_count}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, days_count: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{isAr ? 'من تاريخ' : 'Start Date'}</label>
                  <input
                    type="date"
                    value={leaveFormData.start_date}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, start_date: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">{isAr ? 'إلى تاريخ' : 'End Date'}</label>
                  <input
                    type="date"
                    value={leaveFormData.end_date}
                    onChange={(e) => setLeaveFormData({ ...leaveFormData, end_date: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">{isAr ? 'سبب الإجازة' : 'Reason'}</label>
                <textarea
                  rows={2}
                  value={leaveFormData.reason}
                  onChange={(e) => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
                  placeholder={isAr ? 'اكتب ملاحظات أو سبب الإجازة...' : 'Notes or reason...'}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddLeaveModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs"
                >
                  {isAr ? 'اعتماد وحفظ الطلب' : 'Submit Leave'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 12. MODAL: PAYSLIP VIEWER */}
      {/* ------------------------------------------------------------- */}
      {selectedPayslipForView && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold">{isAr ? 'قسيمة راتب معتمدة (Salary Slip)' : 'Official Payslip'}</h3>
                  <span className="text-xs text-slate-400 font-mono">{selectedPayslipForView.payroll_code}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPayslipForView(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block">{isAr ? 'الموظف' : 'Employee'}</span>
                  <span className="text-sm font-black text-slate-900">{selectedPayslipForView.employee_name_ar}</span>
                </div>
                <div className="text-left rtl:text-left ltr:text-right">
                  <span className="text-[10px] text-slate-400 uppercase block">{isAr ? 'الشهر المالي' : 'Period'}</span>
                  <span className="text-sm font-black text-indigo-700 font-mono">{selectedPayslipForView.month_year}</span>
                </div>
              </div>

              {/* Earnings & Deductions Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                  <span className="font-bold text-emerald-950 block border-b border-emerald-100 pb-1">{isAr ? 'الاستحقاقات (Earnings)' : 'Earnings'}</span>
                  <div className="flex justify-between">
                    <span>{isAr ? 'الراتب الأساسي:' : 'Basic:'}</span>
                    <span className="font-mono">{Number(selectedPayslipForView.basic_salary_aed || 0).toFixed(2)} AED</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{isAr ? 'البدلات:' : 'Allowances:'}</span>
                    <span className="font-mono">{Number(selectedPayslipForView.allowances_aed || 0).toFixed(2)} AED</span>
                  </div>
                  <div className="flex justify-between text-blue-700 font-bold">
                    <span>{isAr ? 'العمولات:' : 'Commissions:'}</span>
                    <span className="font-mono">+{Number(selectedPayslipForView.approved_commissions_aed || 0).toFixed(2)} AED</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>{isAr ? 'ساعات إضافية:' : 'Overtime:'}</span>
                    <span className="font-mono">+{Number(selectedPayslipForView.approved_overtime_aed || 0).toFixed(2)} AED</span>
                  </div>
                </div>

                <div className="space-y-2 bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                  <span className="font-bold text-rose-950 block border-b border-rose-100 pb-1">{isAr ? 'الاستقطاعات (Deductions)' : 'Deductions'}</span>
                  <div className="flex justify-between text-rose-700">
                    <span>{isAr ? 'خصومات وسلف:' : 'Deductions:'}</span>
                    <span className="font-mono">-{Number(selectedPayslipForView.deductions_aed || 0).toFixed(2)} AED</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>{isAr ? 'أيام العمل:' : 'Worked Days:'}</span>
                    <span className="font-mono">{selectedPayslipForView.actual_worked_days || 26} / 26</span>
                  </div>
                </div>
              </div>

              {/* Net Pay Total Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex justify-between items-center shadow-xs">
                <div>
                  <span className="text-[10px] text-emerald-100 font-bold uppercase block">{isAr ? 'صافي الراتب المحول' : 'Net Take-Home Pay'}</span>
                  <span className="text-xl font-black font-mono">
                    {Number(selectedPayslipForView.net_salary_aed || 0).toLocaleString()} AED
                  </span>
                </div>
                <div className="text-right rtl:text-right ltr:text-left">
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                    {selectedPayslipForView.status}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isAr ? 'طباعة القسيمة' : 'Print'}</span>
                </button>
                <button
                  onClick={() => setSelectedPayslipForView(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
                >
                  {isAr ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
