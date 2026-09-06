import React, { useState, useEffect } from 'react';
import { TABLE_SCHEMAS, TableName, FieldDefinition } from '../db/schemaDefinition';
import { db } from '../db/database';
import { UserRole } from '../types/schema';
import { canCreateInTable, canEditInTable, isFieldSensitiveForRole } from '../utils/rbac';
import { X, Save, AlertTriangle, CheckCircle2, Lock, ShieldAlert, Sparkles } from 'lucide-react';

interface RecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableName: TableName;
  initialRecord?: any; // If present, mode is EDIT; otherwise CREATE
  currentRole: UserRole;
  lang: 'ar' | 'en';
  onSaved: (savedRecord: any) => void;
  embedded?: boolean;
}

export const RecordModal: React.FC<RecordModalProps> = ({
  isOpen,
  onClose,
  tableName,
  initialRecord,
  currentRole,
  lang,
  onSaved,
  embedded = false,
}) => {
  const isEdit = !!initialRecord;
  const tableMeta = TABLE_SCHEMAS[tableName];

  const canPerformAction = isEdit
    ? canEditInTable(currentRole, tableName)
    : canCreateInTable(currentRole, tableName);

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic relation lists for foreign keys
  const [relationOptions, setRelationOptions] = useState<Record<string, { id: string; label: string }[]>>({});

  useEffect(() => {
    if (!isOpen) return;

    // Initialize form data
    if (isEdit && initialRecord) {
      setFormData({ ...initialRecord });
    } else {
      const initial: Record<string, any> = {};
      if (tableMeta && tableMeta.fields) {
        tableMeta.fields.forEach((f) => {
          if (f.name === 'id') return; // Auto generated
          if (f.type === 'boolean') initial[f.name] = true;
          else if (f.type === 'number') initial[f.name] = 0;
          else if (f.name === 'status') initial[f.name] = 'نشط';
          else initial[f.name] = '';
        });
      }
      setFormData(initial);
    }

    setErrorMessage(null);
    setSuccessMessage(null);

    // Fetch related foreign table data for dropdowns
    if (tableMeta && tableMeta.fields) {
      const optionsMap: Record<string, { id: string; label: string }[]> = {};
      tableMeta.fields.forEach((f) => {
        if (f.isForeignKey && f.foreignTable) {
          const relatedRecords = db.getAll(f.foreignTable as TableName);
          optionsMap[f.name] = relatedRecords.map((r: any) => {
            const label =
              r.name_ar ||
              r.full_name_ar ||
              r.branch_name_ar ||
              r.category_name_ar ||
              r.service_name_ar ||
              r.account_name_ar ||
              r.company_name_ar ||
              r.id;
            return { id: r.id, label: `${r.id} - ${label}` };
          });
        }
      });
      setRelationOptions(optionsMap);
    }
  }, [isOpen, tableName, initialRecord, isEdit]);

  if (!isOpen) return null;

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!canPerformAction) {
      setErrorMessage(
        lang === 'ar'
          ? 'عذراً، لا تملك الصلاحية اللازمة لتنفيذ هذه العملية بناءً على دورك الحالي.'
          : 'Unauthorized: Your current role lacks permission for this action.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      let result;
      if (isEdit) {
        result = db.update(tableName, initialRecord.id, formData);
      } else {
        result = db.insert(tableName, formData);
      }

      setSuccessMessage(
        isEdit
          ? lang === 'ar'
            ? 'تم تحديث السجل بنجاح!'
            : 'Record updated successfully!'
          : lang === 'ar'
          ? 'تم إنشاء السجل بنجاح!'
          : 'Record created successfully!'
      );

      setTimeout(() => {
        onSaved(result);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ أثناء حفظ السجل.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalBody = (
    <div
      id="record-modal-dialog"
      className={`relative w-full ${
        embedded ? 'max-w-4xl mx-auto my-2 shadow-sm' : 'max-w-3xl my-8 shadow-2xl max-h-[90vh]'
      } bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* Modal Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
            {isEdit ? <Save className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isEdit
                ? lang === 'ar'
                  ? `تعديل السجل (${initialRecord.id})`
                  : `Edit Record (${initialRecord.id})`
                : lang === 'ar'
                ? `إضافة سجل جديد في: ${tableMeta?.nameAr || tableName}`
                : `New Record in: ${tableMeta?.nameEn || tableName}`}
            </h3>
            <p className="text-xs text-slate-500">
              {lang === 'ar'
                ? `الجدول: ${tableName} | الصلاحية المطلوبة: مسموح لدورك (${currentRole})`
                : `Table: ${tableName} | Authorized for role (${currentRole})`}
            </p>
          </div>
        </div>
        <button
          id="close-record-modal-btn"
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
          <span>{lang === 'ar' ? 'رجوع / إغلاق' : 'Back / Close'}</span>
        </button>
      </div>

        {/* Permission Warning if not allowed */}
        {!canPerformAction && (
          <div className="mx-6 mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-amber-900 text-sm">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">
                {lang === 'ar' ? 'تنبيه الصلاحيات المقيدة' : 'Restricted Role Access'}
              </div>
              <p className="text-xs text-amber-700 mt-1">
                {lang === 'ar'
                  ? `دورك الحالي (${currentRole}) لا يمتلك صلاحية ${isEdit ? 'تعديل' : 'إضافة'} سجلات في جدول "${tableMeta?.nameAr}". يمكنك فقط استعراض البيانات.`
                  : `Your role (${currentRole}) does not have permission to ${isEdit ? 'edit' : 'create'} records in table "${tableName}". You can only view.`}
              </p>
            </div>
          </div>
        )}

        {/* Notification alerts */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tableMeta?.fields.map((field) => {
              const fieldName = field.name;
              const isSensitive = isFieldSensitiveForRole(currentRole, fieldName);
              const isReadOnly = fieldName === 'id' || fieldName === 'created_at' || fieldName === 'updated_at';
              const hasRelation = relationOptions[fieldName];

              if (isSensitive) {
                return (
                  <div key={fieldName} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-amber-500" />
                      {lang === 'ar' ? field.labelAr : field.labelEn || field.name}
                      <span className="text-[10px] font-mono">({fieldName})</span>
                    </label>
                    <div className="text-xs text-slate-400 font-mono py-1.5 px-2.5 bg-slate-100 rounded-lg">
                      {lang === 'ar' ? '*** محجوب لحماية السرية المالية' : '*** Confidential & Hidden for Role'}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={fieldName}
                  className={`space-y-1.5 ${
                    fieldName.includes('notes') || fieldName.includes('description') || fieldName.includes('address')
                      ? 'md:col-span-2'
                      : ''
                  }`}
                >
                  <label className="block text-xs font-semibold text-slate-700">
                    {lang === 'ar' ? field.labelAr : field.labelEn || field.name}
                    <span className="text-[10px] text-slate-400 font-mono ml-1 mr-1">({fieldName})</span>
                    {field.required && <span className="text-rose-500 mr-1 ml-1">*</span>}
                  </label>

                  {isReadOnly ? (
                    <input
                      type="text"
                      disabled
                      value={formData[fieldName] || (fieldName === 'id' ? '(سيتم التوليد تلقائياً)' : '-')}
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-sm font-mono cursor-not-allowed"
                    />
                  ) : hasRelation ? (
                    <select
                      value={formData[fieldName] || ''}
                      disabled={!canPerformAction}
                      onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">{lang === 'ar' ? '-- اختر من القائمة --' : '-- Select --'}</option>
                      {hasRelation.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : fieldName === 'status' ? (
                    <select
                      value={formData[fieldName] || 'نشط'}
                      disabled={!canPerformAction}
                      onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="نشط">{lang === 'ar' ? 'نشط' : 'Active'}</option>
                      <option value="جديدة">{lang === 'ar' ? 'جديدة' : 'New'}</option>
                      <option value="قيد التنفيذ">{lang === 'ar' ? 'قيد التنفيذ' : 'In Progress'}</option>
                      <option value="بانتظار الموافقة">{lang === 'ar' ? 'بانتظار الموافقة' : 'Pending Approval'}</option>
                      <option value="مكتملة">{lang === 'ar' ? 'مكتملة' : 'Completed'}</option>
                      <option value="مدفوعة">{lang === 'ar' ? 'مدفوعة' : 'Paid'}</option>
                      <option value="معلقة">{lang === 'ar' ? 'معلقة' : 'Pending'}</option>
                      <option value="ملغاة">{lang === 'ar' ? 'ملغاة' : 'Cancelled'}</option>
                      <option value="مؤرشف">{lang === 'ar' ? 'مؤرشف' : 'Archived'}</option>
                    </select>
                  ) : field.type === 'number' ? (
                    <input
                      type="number"
                      step="any"
                      value={formData[fieldName] ?? 0}
                      disabled={!canPerformAction}
                      onChange={(e) => handleFieldChange(fieldName, parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  ) : field.type === 'boolean' ? (
                    <div className="flex items-center gap-3 pt-2">
                      <input
                        type="checkbox"
                        id={`cb-${fieldName}`}
                        checked={!!formData[fieldName]}
                        disabled={!canPerformAction}
                        onChange={(e) => handleFieldChange(fieldName, e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor={`cb-${fieldName}`} className="text-xs text-slate-700 cursor-pointer">
                        {lang === 'ar' ? 'نعم / تفعيل' : 'Yes / Active'}
                      </label>
                    </div>
                  ) : field.type === 'date' || fieldName.includes('_date') ? (
                    <input
                      type="date"
                      value={formData[fieldName] || ''}
                      disabled={!canPerformAction}
                      onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : fieldName.includes('notes') || fieldName.includes('description') || fieldName.includes('address') ? (
                    <textarea
                      rows={3}
                      value={formData[fieldName] || ''}
                      disabled={!canPerformAction}
                      onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData[fieldName] || ''}
                      disabled={!canPerformAction}
                      onChange={(e) => handleFieldChange(fieldName, e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              id="cancel-record-modal-btn"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {lang === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              id="submit-record-modal-btn"
              disabled={!canPerformAction || isSubmitting}
              className={`px-6 py-2.5 rounded-xl text-white text-sm font-medium flex items-center gap-2 shadow-sm transition-all ${
                !canPerformAction || isSubmitting
                  ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95 cursor-pointer'
              }`}
            >
              <Save className="w-4 h-4" />
              {isSubmitting
                ? lang === 'ar'
                  ? 'جاري الحفظ...'
                  : 'Saving...'
                : isEdit
                ? lang === 'ar'
                  ? 'حفظ التعديلات'
                  : 'Save Changes'
                : lang === 'ar'
                ? 'إضافة السجل'
                : 'Create Record'}
            </button>
          </div>
        </form>
      </div>
    );

  if (embedded) {
    return (
      <div id="record-canvas-view" className="w-full pb-8">
        {modalBody}
      </div>
    );
  }

  return (
    <div
      id="record-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {modalBody}
    </div>
  );
};
