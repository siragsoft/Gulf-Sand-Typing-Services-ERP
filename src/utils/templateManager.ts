import { db } from '../db/database';
import {
  DocumentTemplateRecord,
  DocumentTemplateType,
  DocumentTemplateVersionRecord,
  UserRole,
} from '../types/schema';
import { getDefaultDocumentTemplates } from '../db/seedEmptyData';

export interface TemplateVariableInfo {
  key: string;
  nameAr: string;
  nameEn: string;
  example: string;
  category: 'general' | 'customer' | 'financial' | 'operational';
}

export const TEMPLATE_VARIABLES: TemplateVariableInfo[] = [
  {
    key: '{{company_name}}',
    nameAr: 'اسم المنشأة / المركز',
    nameEn: 'Company / Center Name',
    example: 'جلف ساند للطباعة والخدمات',
    category: 'general',
  },
  {
    key: '{{customer_name}}',
    nameAr: 'اسم العميل المعتمد',
    nameEn: 'Customer Full Name',
    example: 'محمد عبدالله الشامسي',
    category: 'customer',
  },
  {
    key: '{{customer_id}}',
    nameAr: 'كود العميل',
    nameEn: 'Customer Code / ID',
    example: 'CUS-00042',
    category: 'customer',
  },
  {
    key: '{{transaction_id}}',
    nameAr: 'رقم المعاملة',
    nameEn: 'Transaction Reference Number',
    example: 'TRX-2026-00120',
    category: 'operational',
  },
  {
    key: '{{receipt_number}}',
    nameAr: 'رقم الإيصال / السند',
    nameEn: 'Receipt Number',
    example: 'REC-2026-00085',
    category: 'financial',
  },
  {
    key: '{{invoice_number}}',
    nameAr: 'رقم الفاتورة الضريبية',
    nameEn: 'Invoice Number',
    example: 'INV-2026-00085',
    category: 'financial',
  },
  {
    key: '{{transaction_date}}',
    nameAr: 'تاريخ المعاملة والإصدار',
    nameEn: 'Transaction Date',
    example: '2026-08-15',
    category: 'operational',
  },
  {
    key: '{{services_summary}}',
    nameAr: 'ملخص الخدمات والبنود',
    nameEn: 'Services Summary',
    example: 'تجديد إقامة عائلية + فحص طبي + بطاقة الهوية',
    category: 'operational',
  },
  {
    key: '{{total_amount}}',
    nameAr: 'إجمالي المبلغ (درهم)',
    nameEn: 'Total Amount (AED)',
    example: '1,250.00 درهم',
    category: 'financial',
  },
  {
    key: '{{paid_amount}}',
    nameAr: 'المبلغ المسدد (درهم)',
    nameEn: 'Paid Amount (AED)',
    example: '1,250.00 درهم',
    category: 'financial',
  },
  {
    key: '{{remaining_amount}}',
    nameAr: 'المبلغ المتبقي (درهم)',
    nameEn: 'Remaining Balance (AED)',
    example: '0.00 درهم',
    category: 'financial',
  },
  {
    key: '{{responsible_employee}}',
    nameAr: 'الموظف المسؤول / الكاشير',
    nameEn: 'Responsible Employee',
    example: 'أحمد المنصوري',
    category: 'operational',
  },
  {
    key: '{{qr_verification_url}}',
    nameAr: 'رابط التحقق الإلكتروني المشفر',
    nameEn: 'Verification URL',
    example: 'https://gulfsanderp.ae/verify/receipt/gs_vfy_9a8b7c',
    category: 'general',
  },
];

/**
 * Safely replaces all {{var_name}} placeholders with values.
 * Missing or undefined variables are safely replaced with an empty string `""` without breaking layout or PDF.
 */
export function replaceTemplateVariables(
  rawText: string | undefined | null,
  variables: Record<string, string | number | undefined | null>
): string {
  if (!rawText) return '';

  return rawText.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    const fullKey = `{{${key}}}`;
    const value = variables[fullKey] ?? variables[key];
    if (value === undefined || value === null) {
      return '';
    }
    return String(value);
  });
}

/**
 * Retrieves the currently active template for the specified document type.
 * If none exists, initializes and returns a default fallback.
 */
export function getActiveDocumentTemplate(documentType: DocumentTemplateType): DocumentTemplateRecord {
  const templates = db.getTable<DocumentTemplateRecord>('document_templates');
  const active = templates.find((t) => t.document_type === documentType && t.is_active);

  if (active) return active;

  // Find any template of this type
  const fallback = templates.find((t) => t.document_type === documentType);
  if (fallback) return fallback;

  // Generate from default seed templates
  const defaults = getDefaultDocumentTemplates();
  const defaultMatch = defaults.find((t) => t.document_type === documentType) || defaults[0];

  try {
    const inserted = db.insert<DocumentTemplateRecord>('document_templates', {
      ...defaultMatch,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    return inserted;
  } catch {
    return defaultMatch;
  }
}

/**
 * Fetches all templates for all types
 */
export function getAllDocumentTemplates(): DocumentTemplateRecord[] {
  return db.getTable<DocumentTemplateRecord>('document_templates');
}

/**
 * Saves or updates a document template with versioning, single-active enforcement and audit logging.
 * Protected: Only SYSTEM_ADMIN and MANAGER are authorized.
 */
export function saveDocumentTemplate(
  templateData: Partial<DocumentTemplateRecord> & { document_type: DocumentTemplateType; title_ar: string },
  user: { id: string; role: UserRole; name: string }
): { success: boolean; template?: DocumentTemplateRecord; message: string } {
  if (user.role !== UserRole.SYSTEM_ADMIN && user.role !== UserRole.MANAGER) {
    return {
      success: false,
      message: 'غير مصرح: يحق فقط للمديرين ومسؤولي النظام تعديل قوالب المستندات الرسمية',
    };
  }

  const now = new Date().toISOString();
  const allTemplates = db.getTable<DocumentTemplateRecord>('document_templates');
  const existing = templateData.id ? allTemplates.find((t) => t.id === templateData.id) : null;

  // Single-active enforcement: If setting active, deactivate others for this document_type
  if (templateData.is_active !== false) {
    allTemplates
      .filter((t) => t.document_type === templateData.document_type && t.id !== templateData.id)
      .forEach((t) => {
        if (t.is_active) {
          db.update<DocumentTemplateRecord>('document_templates', t.id, { is_active: false, updated_at: now });
        }
      });
  }

  if (existing) {
    // 1. Archive current version to document_template_versions
    const versionNumber = existing.version || 1;
    const versionSnapshot: Omit<DocumentTemplateVersionRecord, 'id'> = {
      created_at: now,
      created_by: user.id,
      updated_at: now,
      updated_by: user.id,
      branch_id: existing.branch_id || 'BR-001',
      status: 'مؤرشف',
      template_id: existing.id,
      document_type: existing.document_type,
      version_number: versionNumber,
      snapshot_json: JSON.stringify(existing),
      change_summary_ar: `تعديل القالب بواسطة ${user.name} - إصدار ${versionNumber}`,
      created_by_name: user.name,
    };
    db.insert<DocumentTemplateVersionRecord>('document_template_versions', versionSnapshot);

    // 2. Update existing template with bumped version
    const updated = db.update<DocumentTemplateRecord>('document_templates', existing.id, {
      ...templateData,
      version: versionNumber + 1,
      updated_at: now,
      updated_by: user.id,
      updated_by_name: user.name,
      is_active: templateData.is_active !== undefined ? templateData.is_active : true,
    });

    db.logAudit(
      'تعديل',
      'document_templates',
      existing.id,
      `تحديث قالب ${existing.name_ar} إلى الإصدار ${versionNumber + 1} بواسطة ${user.name}`
    );

    return { success: true, template: updated, message: 'تم حفظ القالب وترقية الإصدار بنجاح' };
  } else {
    // Create new template record
    const newRecord: Omit<DocumentTemplateRecord, 'id'> = {
      created_at: now,
      created_by: user.id,
      updated_at: now,
      updated_by: user.id,
      branch_id: 'BR-001',
      status: 'نشط',
      template_code: db.generateId('document_templates'),
      document_type: templateData.document_type,
      name_ar: templateData.name_ar || `قالب ${templateData.document_type}`,
      name_en: templateData.name_en || 'Document Template',
      version: 1,
      is_active: templateData.is_active !== undefined ? templateData.is_active : true,
      title_ar: templateData.title_ar,
      title_en: templateData.title_en || '',
      header_text_ar: templateData.header_text_ar || 'جلف ساند للطباعة والخدمات',
      header_text_en: templateData.header_text_en || 'GULFSAND TYPING SERVICES',
      subheader_text_ar: templateData.subheader_text_ar || '',
      subheader_text_en: templateData.subheader_text_en || '',
      footer_text_ar: templateData.footer_text_ar || 'تم إصدار المستند إلكترونياً.',
      footer_text_en: templateData.footer_text_en || 'Generated electronically.',
      disclaimer_ar: templateData.disclaimer_ar || 'الرسوم الحكومية غير قابلة للاسترداد.',
      disclaimer_en: templateData.disclaimer_en || 'Government fees are non-refundable.',
      terms_conditions_ar: templateData.terms_conditions_ar || '1. يرجى مراجعة البيانات قبل المغادرة.',
      terms_conditions_en: templateData.terms_conditions_en || '1. Please review details.',
      customer_instructions_ar: templateData.customer_instructions_ar || 'امسح رمز الاستجابة السريعة للتحقق.',
      customer_instructions_en: templateData.customer_instructions_en || 'Scan QR to verify.',
      company_name_ar: templateData.company_name_ar || 'جلف ساند للطباعة والخدمات',
      company_name_en: templateData.company_name_en || 'GULFSAND TYPING SERVICES',
      company_address_ar: templateData.company_address_ar || 'المويجعي، العين، أبوظبي',
      company_address_en: templateData.company_address_en || 'Al Ain, UAE',
      phone_primary: templateData.phone_primary || '+971 3 721 8899',
      phone_secondary: templateData.phone_secondary || '',
      email_official: templateData.email_official || 'support@gulfsandtyping.ae',
      show_logo: templateData.show_logo !== undefined ? templateData.show_logo : true,
      show_qr: templateData.show_qr !== undefined ? templateData.show_qr : true,
      qr_label_ar: templateData.qr_label_ar || 'امسح الرمز للتحقق من صحة الإيصال',
      qr_label_en: templateData.qr_label_en || 'Scan to verify receipt authenticity',
      updated_by_name: user.name,
    };

    const inserted = db.insert<DocumentTemplateRecord>('document_templates', newRecord);
    db.logAudit('إنشاء', 'document_templates', inserted.id, `إنشاء قالب مستند جديد: ${inserted.name_ar} بواسطة ${user.name}`);

    return { success: true, template: inserted, message: 'تم إنشاء القالب الجديد وتفعيله بنجاح' };
  }
}

/**
 * Returns version history for a given template ID
 */
export function getTemplateVersions(templateId: string): DocumentTemplateVersionRecord[] {
  const versions = db.getTable<DocumentTemplateVersionRecord>('document_template_versions');
  return versions
    .filter((v) => v.template_id === templateId)
    .sort((a, b) => (b.version_number || 0) - (a.version_number || 0));
}

/**
 * Restores a previous version of a document template.
 * Bumps the version number and activates the restored content.
 */
export function restoreDocumentTemplateVersion(
  versionId: string,
  user: { id: string; role: UserRole; name: string }
): { success: boolean; template?: DocumentTemplateRecord; message: string } {
  if (user.role !== UserRole.SYSTEM_ADMIN && user.role !== UserRole.MANAGER) {
    return {
      success: false,
      message: 'غير مصرح: يحق للمديرين فقط استرجاع إصدارات القوالب السابقة',
    };
  }

  const versionRecord = db.getById<DocumentTemplateVersionRecord>('document_template_versions', versionId);
  if (!versionRecord) {
    return { success: false, message: 'لم يتم العثور على سجل الإصدار المطلوب' };
  }

  let snapshot: Partial<DocumentTemplateRecord>;
  try {
    snapshot = JSON.parse(versionRecord.snapshot_json);
  } catch {
    return { success: false, message: 'بيانات الإصدار المؤرشف تالفة أو غير صالحة' };
  }

  const currentTemplate = db.getById<DocumentTemplateRecord>('document_templates', versionRecord.template_id);
  const nextVersion = ((currentTemplate?.version || 1) + 1);
  const now = new Date().toISOString();

  // Archive current before restoring
  if (currentTemplate) {
    db.insert<DocumentTemplateVersionRecord>('document_template_versions', {
      created_at: now,
      created_by: user.id,
      updated_at: now,
      updated_by: user.id,
      branch_id: 'BR-001',
      status: 'مؤرشف',
      template_id: currentTemplate.id,
      document_type: currentTemplate.document_type,
      version_number: currentTemplate.version || 1,
      snapshot_json: JSON.stringify(currentTemplate),
      change_summary_ar: `أرشفة آلية قبل استرجاع الإصدار رقم ${versionRecord.version_number}`,
      created_by_name: user.name,
    });
  }

  // Restore fields onto existing template
  const { id: _, created_at: __, ...restoredFields } = snapshot;

  const updated = db.update<DocumentTemplateRecord>('document_templates', versionRecord.template_id, {
    ...restoredFields,
    version: nextVersion,
    is_active: true,
    updated_at: now,
    updated_by: user.id,
    updated_by_name: user.name,
    last_restored_from_version: versionRecord.version_number,
  });

  db.logAudit(
    'استرجاع',
    'document_templates',
    versionRecord.template_id,
    `استرجاع القالب من الإصدار ${versionRecord.version_number} وتعيينه كإصدار نشط رقم ${nextVersion} بواسطة ${user.name}`
  );

  return {
    success: true,
    template: updated,
    message: `تم استرجاع الإصدار رقم ${versionRecord.version_number} بنجاح وترقيته إلى الإصدار النشط v${nextVersion}`,
  };
}
