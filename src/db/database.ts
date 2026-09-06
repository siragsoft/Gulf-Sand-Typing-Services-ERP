import { DatabaseState, getEmptyDatabaseSeed } from './seedEmptyData';
import { getDemoDatabaseSeed } from './seedDemoData';
import { TABLE_SCHEMAS, TableName } from './schemaDefinition';
import { UserRole } from '../types/schema';

const STORAGE_KEY = 'gulfsand_erp_database_v1';

type ChangeListener = (tableName: TableName, data: any[]) => void;

class DatabaseEngine {
  private state: DatabaseState;
  private listeners: Map<TableName | 'ALL', Set<ChangeListener>> = new Map();
  private currentUserId: string = 'USR-001';
  private currentUserEmail: string = 'bashar.elhaj.sd@gmail.com';
  private currentUserName: string = 'بشار الحاج';

  constructor() {
    this.state = this.loadFromStorage();
  }

  // Set active session for audit tracking
  public setCurrentUser(user: { id: string; email: string; name: string }) {
    this.currentUserId = user.id;
    this.currentUserEmail = user.email;
    this.currentUserName = user.name;
  }

  private loadFromStorage(): DatabaseState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure all tables exist
        const empty = getEmptyDatabaseSeed();
        const merged = { ...empty, ...parsed };
        if (merged.users_permissions && Array.isArray(merged.users_permissions)) {
          merged.users_permissions = merged.users_permissions.map((u: any) => {
            if (u.is_super_admin || u.email?.toLowerCase().includes('bashar.elhaj')) {
              return { ...u, must_change_password: false };
            }
            return u;
          });
        }
        if (!merged.document_templates || merged.document_templates.length === 0) {
          merged.document_templates = empty.document_templates;
        }
        return merged;
      }
    } catch (e) {
      console.warn('Failed to read from localStorage, using demo seed instead.', e);
    }
    const demo = getDemoDatabaseSeed();
    this.persistToStorage(demo);
    return demo;
  }

  private persistToStorage(stateToSave: DatabaseState = this.state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  public subscribe(tableName: TableName | 'ALL', callback: ChangeListener): () => void {
    if (!this.listeners.has(tableName)) {
      this.listeners.set(tableName, new Set());
    }
    this.listeners.get(tableName)!.add(callback);

    return () => {
      this.listeners.get(tableName)?.delete(callback);
    };
  }

  private notifyListeners(tableName: TableName) {
    const tableListeners = this.listeners.get(tableName);
    const allListeners = this.listeners.get('ALL');
    const tableData = this.state[tableName as keyof DatabaseState] || [];

    if (tableListeners) {
      tableListeners.forEach((cb) => cb(tableName, tableData));
    }
    if (allListeners) {
      allListeners.forEach((cb) => cb(tableName, tableData));
    }
  }

  // Sequence / ID Generator
  public generateId(tableName: TableName): string {
    const meta = TABLE_SCHEMAS[tableName];
    const prefix = meta?.idPrefix || 'REC';
    const year = new Date().getFullYear();
    const tableList = (this.state[tableName as keyof DatabaseState] as any[]) || [];
    const count = tableList.length + 1;
    const padded = String(count).padStart(5, '0');

    if (prefix === 'TRX' || prefix === 'INV' || prefix === 'REC' || prefix === 'EXP' || prefix === 'JRN' || prefix === 'BKG') {
      return `${prefix}-${year}-${padded}`;
    }
    return `${prefix}-${padded}`;
  }

  // Audit Logging
  public logAudit(action: 'إنشاء' | 'تعديل' | 'حذف' | 'استرجاع' | 'إقفال' | 'أرشفة', tableName: TableName, recordId: string, summary: string) {
    const now = new Date().toISOString();
    const auditRecord = {
      id: this.generateId('audit_logs'),
      created_at: now,
      created_by: this.currentUserId,
      updated_at: now,
      updated_by: this.currentUserId,
      branch_id: 'BR-001',
      status: 'مسجل',
      user_email: this.currentUserEmail,
      user_name_ar: this.currentUserName,
      action_type: action,
      module_name: TABLE_SCHEMAS[tableName]?.nameAr || tableName,
      record_id: recordId,
      table_name: tableName,
      change_summary_ar: summary,
    };

    if (!this.state.audit_logs) this.state.audit_logs = [];
    this.state.audit_logs.unshift(auditRecord);
    this.persistToStorage();
    this.notifyListeners('audit_logs');
  }

  // Generic Query
  public getAll<T = any>(tableName: TableName): T[] {
    return ((this.state[tableName as keyof DatabaseState] as T[]) || []).filter(
      (item: any) => item?.status !== 'مؤرشف' && item?.status !== 'محذوف'
    );
  }

  public getTable<T = any>(tableName: TableName): T[] {
    return ((this.state[tableName as keyof DatabaseState] as T[]) || []);
  }

  public getAllIncludingArchived<T = any>(tableName: TableName): T[] {
    return ((this.state[tableName as keyof DatabaseState] as T[]) || []);
  }

  public getById<T = any>(tableName: TableName, id: string): T | undefined {
    const list = (this.state[tableName as keyof DatabaseState] as any[]) || [];
    return list.find((item: any) => item.id === id);
  }

  // Generic Create
  public insert<T = any>(tableName: TableName, recordData: Partial<T>): T {
    const now = new Date().toISOString();
    const id = (recordData as any).id || this.generateId(tableName);
    
    const fullRecord = {
      id,
      created_at: now,
      created_by: this.currentUserId,
      updated_at: now,
      updated_by: this.currentUserId,
      branch_id: (recordData as any).branch_id || 'BR-001',
      status: (recordData as any).status || 'نشط',
      ...recordData,
    } as any;

    // Relational / Business Validations
    this.validateRecord(tableName, fullRecord);

    const list = (this.state[tableName as keyof DatabaseState] as any[]) || [];
    list.unshift(fullRecord);
    (this.state as any)[tableName] = list;

    this.persistToStorage();
    this.logAudit('إنشاء', tableName, id, `تم إنشاء سجل جديد في جدول ${TABLE_SCHEMAS[tableName]?.nameAr || tableName} برقم ${id}`);
    this.notifyListeners(tableName);

    return fullRecord;
  }

  // Generic Update
  public update<T = any>(tableName: TableName, id: string, patch: Partial<T>): T {
    const list = (this.state[tableName as keyof DatabaseState] as any[]) || [];
    const index = list.findIndex((item: any) => item.id === id);

    if (index === -1) {
      throw new Error(`Record with ID ${id} not found in ${tableName}`);
    }

    const updated = {
      ...list[index],
      ...patch,
      updated_at: new Date().toISOString(),
      updated_by: this.currentUserId,
    };

    this.validateRecord(tableName, updated);

    list[index] = updated;
    (this.state as any)[tableName] = list;

    this.persistToStorage();
    this.logAudit('تعديل', tableName, id, `تم تحديث السجل ${id} في جدول ${TABLE_SCHEMAS[tableName]?.nameAr || tableName}`);
    this.notifyListeners(tableName);

    return updated;
  }

  // Generic Soft Delete / Archive
  public delete(tableName: TableName, id: string, permanent: boolean = false): boolean {
    const list = (this.state[tableName as keyof DatabaseState] as any[]) || [];
    const index = list.findIndex((item: any) => item.id === id);

    if (index === -1) return false;

    if (permanent) {
      list.splice(index, 1);
    } else {
      list[index].status = 'مؤرشف';
      list[index].updated_at = new Date().toISOString();
      list[index].updated_by = this.currentUserId;
    }

    (this.state as any)[tableName] = list;
    this.persistToStorage();
    this.logAudit(permanent ? 'حذف' : 'أرشفة', tableName, id, `تم ${permanent ? 'الحذف النهائي لـ' : 'أرشفة'} السجل ${id} في جدول ${TABLE_SCHEMAS[tableName]?.nameAr || tableName}`);
    this.notifyListeners(tableName);
    return true;
  }

  // Business Rules Validation Engine
  private validateRecord(tableName: TableName, record: any) {
    // 1. Transaction Detail Min/Max Price enforcement
    if (tableName === 'transaction_details' && record.selling_price_aed !== undefined) {
      if (record.min_price_aed !== undefined && record.selling_price_aed < record.min_price_aed) {
        throw new Error(`سعر البيع (${record.selling_price_aed} د.إ) أقل من السعر الأدنى المعتمد (${record.min_price_aed} د.إ) لخدمة "${record.service_name_ar}". يتطلب موافقة المشرف.`);
      }
      if (record.max_price_aed !== undefined && record.selling_price_aed > record.max_price_aed) {
        throw new Error(`سعر البيع (${record.selling_price_aed} د.إ) يتجاوز الحد الأقصى المسموح (${record.max_price_aed} د.إ) لخدمة "${record.service_name_ar}".`);
      }
    }

    // 2. Journal Entry Balanced Debits and Credits
    if (tableName === 'journal_entries') {
      if (record.total_debit_aed !== record.total_credit_aed) {
        throw new Error(`القيد المحاسبي غير متوازن! إجمالي المدين (${record.total_debit_aed} د.إ) لا يساوي إجمالي الدائن (${record.total_credit_aed} د.إ).`);
      }
    }

    // 3. Duplicate Customer Phone / Emirates ID check on new inserts
    if (tableName === 'customers' && record.status !== 'مؤرشف') {
      const existing = (this.state.customers || []).filter((c: any) => c.id !== record.id && c.status !== 'مؤرشف');
      if (record.phone) {
        const dupPhone = existing.find((c: any) => c.phone && c.phone.replace(/\s+/g, '') === record.phone.replace(/\s+/g, ''));
        if (dupPhone) {
          throw new Error(`رقم الهاتف (${record.phone}) مسجل مسبقاً للعميل "${dupPhone.name_ar}" (رمز: ${dupPhone.customer_code}). لمنع تكرار الحسابات، يرجى استخدام العميل الحالي.`);
        }
      }
      if (record.emirates_id) {
        const dupEid = existing.find((c: any) => c.emirates_id && c.emirates_id.replace(/[-\s]/g, '') === record.emirates_id.replace(/[-\s]/g, ''));
        if (dupEid) {
          throw new Error(`رقم الهوية الإماراتية (${record.emirates_id}) مسجل مسبقاً للعميل "${dupEid.name_ar}".`);
        }
      }
    }
  }

  // System Resets & Backup tools
  public resetToDemoData(): void {
    const demo = getDemoDatabaseSeed();
    this.state = demo;
    this.persistToStorage(demo);
    this.logAudit('استرجاع', 'system_backups', 'DEMO-RESTORE', 'تم استعادة بيانات العرض التجريبية بنجاح.');
    Object.keys(TABLE_SCHEMAS).forEach((t) => this.notifyListeners(t as TableName));
  }

  public resetToEmptyData(): void {
    const empty = getEmptyDatabaseSeed();
    this.state = empty;
    this.persistToStorage(empty);
    this.logAudit('استرجاع', 'system_backups', 'EMPTY-INIT', 'تم تهيئة النظام بقاعدة بيانات نظيفة وجاهزة للعمل الفعلي.');
    Object.keys(TABLE_SCHEMAS).forEach((t) => this.notifyListeners(t as TableName));
  }

  public exportDatabaseJson(): string {
    return JSON.stringify(this.state, null, 2);
  }

  public importDatabaseJson(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      const empty = getEmptyDatabaseSeed();
      this.state = { ...empty, ...parsed };
      this.persistToStorage(this.state);
      this.logAudit('استرجاع', 'system_backups', 'JSON-IMPORT', 'تم استيراد نسخة احتياطية من ملف JSON بنجاح.');
      Object.keys(TABLE_SCHEMAS).forEach((t) => this.notifyListeners(t as TableName));
      return true;
    } catch (e) {
      console.error('Failed to import database JSON:', e);
      return false;
    }
  }

  public getDatabaseState(): DatabaseState {
    return this.state;
  }

  public getStats() {
    return {
      tablesCount: Object.keys(TABLE_SCHEMAS).length,
      totalRecords: Object.keys(this.state).reduce((sum, key) => {
        const arr = (this.state as any)[key];
        return sum + (Array.isArray(arr) ? arr.length : 0);
      }, 0),
      customersCount: this.state.customers?.length || 0,
      servicesCount: this.state.services_pricing?.length || 0,
      transactionsCount: this.state.transactions?.length || 0,
      invoicesCount: this.state.invoices?.length || 0,
      employeesCount: this.state.employees?.length || 0,
      accountsCount: this.state.chart_of_accounts?.length || 0,
    };
  }
}

// Global Singleton Instance
export const db = new DatabaseEngine();
