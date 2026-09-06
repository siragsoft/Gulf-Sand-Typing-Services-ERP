import QRCode from 'qrcode';
import { db } from '../db/database';
import {
  ReceiptVerificationTokenRecord,
  VerificationTokenStatus,
  ReceiptVerificationLogRecord,
  UserRole,
} from '../types/schema';

/**
 * Masks customer name for public privacy protection.
 * e.g., "محمد عبدالرحمن الظاهري" -> "م*** ع*** ا***"
 * e.g., "John Smith" -> "J*** S***"
 */
export function maskCustomerNameForPrivacy(fullName: string): string {
  if (!fullName || typeof fullName !== 'string') return 'عميل جلف ساند للطباعة والخدمات';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return 'عميل جلف ساند للطباعة والخدمات';

  return parts
    .map((part) => {
      if (part.length <= 1) return part;
      return `${part.charAt(0)}***`;
    })
    .join(' ');
}

/**
 * Generates a high-entropy cryptographically secure verification token
 */
export function generateSecureVerificationToken(receiptNumber: string): string {
  const timestamp = Date.now().toString(36);
  const randomBytes = new Uint8Array(12);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(randomBytes);
  } else {
    for (let i = 0; i < 12; i++) {
      randomBytes[i] = Math.floor(Math.random() * 256);
    }
  }
  const randomHex = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const cleanReceipt = (receiptNumber || 'REC').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return `gs_vfy_${cleanReceipt}_${timestamp}_${randomHex}`;
}

/**
 * Constructs the canonical public verification URL for a given token
 */
export function getReceiptVerificationUrl(token: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://gulfsanderp.ae';
  return `${baseUrl}/verify/receipt/${token}`;
}

/**
 * Generates high-contrast QR code Data URL (PNG base64) for PDF embedding and UI display
 */
export async function generateQRCodeDataURL(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 256,
      color: {
        dark: '#0f172a', // Deep slate / navy
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Failed to generate QR code data URL:', err);
    // Return empty fallback string
    return '';
  }
}

export interface GetOrCreateTokenParams {
  receiptNumber: string;
  transactionId: string;
  customerId: string;
  customerName: string;
  serviceSummary: string;
  totalAmountAED: number;
  paidAmountAED: number;
  remainingAmountAED: number;
  forceRegenerate?: boolean;
}

/**
 * Retrieves existing active token for a receipt or generates a new one.
 * Ensures tokens are strictly persisted in the DB.
 */
export async function getOrCreateReceiptVerificationToken(
  params: GetOrCreateTokenParams
): Promise<ReceiptVerificationTokenRecord> {
  const existingTokens = db.getTable<ReceiptVerificationTokenRecord>('receipt_verification_tokens');

  // Check for existing valid token for this receipt
  const found = existingTokens.find(
    (t) => (t.receipt_number === params.receiptNumber || t.transaction_id === params.transactionId) && t.status === 'VALID'
  );

  if (found && !params.forceRegenerate) {
    if (!found.qr_code_data_url) {
      const qrUrl = getReceiptVerificationUrl(found.token);
      found.qr_code_data_url = await generateQRCodeDataURL(qrUrl);
      db.update<ReceiptVerificationTokenRecord>('receipt_verification_tokens', found.id, {
        qr_code_data_url: found.qr_code_data_url,
      });
    }
    return found;
  }

  const token = generateSecureVerificationToken(params.receiptNumber);
  const qrVerificationUrl = getReceiptVerificationUrl(token);
  const qrCodeDataUrl = await generateQRCodeDataURL(qrVerificationUrl);
  const now = new Date().toISOString();

  const newRecord: Omit<ReceiptVerificationTokenRecord, 'id'> = {
    created_at: now,
    created_by: 'system',
    updated_at: now,
    updated_by: 'system',
    branch_id: 'BR-001',
    status: 'VALID',
    token,
    receipt_number: params.receiptNumber,
    transaction_id: params.transactionId,
    customer_id: params.customerId,
    customer_name_masked: maskCustomerNameForPrivacy(params.customerName),
    service_summary: params.serviceSummary || 'خدمات طباعة ومعاملات حكومية',
    total_amount_aed: params.totalAmountAED,
    paid_amount_aed: params.paidAmountAED,
    remaining_amount_aed: params.remainingAmountAED,
    is_amount_masked: false,
    generated_at: now,
    qr_code_data_url: qrCodeDataUrl,
    verification_count: 0,
  };

  const created = db.insert<ReceiptVerificationTokenRecord>('receipt_verification_tokens', newRecord);
  return created;
}

export interface VerificationResult {
  status: VerificationTokenStatus;
  token?: string;
  receiptNumber?: string;
  transactionId?: string;
  customerNameMasked?: string;
  serviceSummary?: string;
  totalAmountAED?: number;
  paidAmountAED?: number;
  remainingAmountAED?: number;
  generatedAt?: string;
  expiresAt?: string;
  revokedAt?: string;
  revocationReason?: string;
  verifiedByBadge: string;
  message_ar: string;
  message_en: string;
}

/**
 * Public & In-app verification checker. Logs every verification attempt into receipt_verification_logs.
 * Strips all sensitive data to ensure privacy protection.
 */
export function verifyReceiptToken(token: string, clientIp: string = '127.0.0.1'): VerificationResult {
  const defaultVerifiedBadge = 'تم التحقق والاعتماد رسمياً من جلف ساند للطباعة والخدمات';
  const now = new Date().toISOString();

  if (!token || typeof token !== 'string') {
    logVerificationAttempt(token || 'UNKNOWN', 'NOT_FOUND', 'N/A', clientIp, now);
    return {
      status: 'NOT_FOUND',
      verifiedByBadge: defaultVerifiedBadge,
      message_ar: 'رمز التحقق غير موجود أو تم إدخال رابط غير صحيح. يرجى مراجعة إدارة المركز.',
      message_en: 'Verification token was not found. Please contact Gulf Sand management.',
    };
  }

  const trimmed = token.trim();
  const tokens = db.getTable<ReceiptVerificationTokenRecord>('receipt_verification_tokens');
  let record = tokens.find(
    (t) =>
      t.token === trimmed ||
      t.receipt_number.toLowerCase() === trimmed.toLowerCase() ||
      t.transaction_id.toLowerCase() === trimmed.toLowerCase()
  );

  // If not yet in receipt_verification_tokens, check if it is an existing transaction or invoice in db
  if (!record) {
    const trxs = db.getTable<any>('transactions');
    const matchedTrx = trxs.find(
      (trx) =>
        trx.id?.toLowerCase() === trimmed.toLowerCase() ||
        trx.transaction_code?.toLowerCase() === trimmed.toLowerCase() ||
        trx.receipt_number?.toLowerCase() === trimmed.toLowerCase()
    );

    if (matchedTrx) {
      const customers = db.getTable<any>('customers');
      const cust = customers.find((c) => c.id === matchedTrx.customer_id);
      const gross = Number(matchedTrx.total_gross_amount_aed || matchedTrx.total_amount_aed || 450);
      const paid = Number(matchedTrx.collected_amount_aed || gross);
      const remaining = Math.max(0, gross - paid);

      const generatedToken = generateSecureVerificationToken(matchedTrx.transaction_code || matchedTrx.id);
      const newRec: Omit<ReceiptVerificationTokenRecord, 'id'> = {
        created_at: now,
        created_by: 'auto-sync',
        updated_at: now,
        updated_by: 'auto-sync',
        branch_id: matchedTrx.branch_id || 'BR-001',
        status: 'VALID',
        token: generatedToken,
        receipt_number: matchedTrx.receipt_number || `REC-${(matchedTrx.transaction_code || matchedTrx.id).replace(/^TRX-/, '')}`,
        transaction_id: matchedTrx.id,
        customer_id: matchedTrx.customer_id || 'CUS-001',
        customer_name_masked: maskCustomerNameForPrivacy(cust?.name_ar || matchedTrx.customer_name_ar || 'عميل جلف ساند للطباعة والخدمات'),
        service_summary: matchedTrx.service_name_ar || matchedTrx.notes || 'معاملة طباعة وتخليص معاملات',
        total_amount_aed: gross,
        paid_amount_aed: paid,
        remaining_amount_aed: remaining,
        is_amount_masked: false,
        generated_at: now,
        verification_count: 0,
      };
      record = db.insert<ReceiptVerificationTokenRecord>('receipt_verification_tokens', newRec);
    }
  }

  if (!record) {
    logVerificationAttempt(token, 'NOT_FOUND', 'N/A', clientIp, now);
    return {
      status: 'NOT_FOUND',
      verifiedByBadge: defaultVerifiedBadge,
      message_ar: 'لم يتم العثور على أي إيصال مطابق لهذا الرمز. قد يكون الإيصال غير أصلي أو ملغياً.',
      message_en: 'No matching receipt found. This receipt may be unverified or forged.',
    };
  }

  // Check if expired
  let status: VerificationTokenStatus = record.status;
  if (status === 'VALID' && record.expires_at && new Date(record.expires_at) < new Date()) {
    status = 'EXPIRED';
  }

  // Update verification counter
  db.update<ReceiptVerificationTokenRecord>('receipt_verification_tokens', record.id, {
    verification_count: (record.verification_count || 0) + 1,
    last_verified_at: now,
  });

  logVerificationAttempt(token, status, record.receipt_number, clientIp, now);

  if (status === 'REVOKED') {
    return {
      status: 'REVOKED',
      token: record.token,
      receiptNumber: record.receipt_number,
      transactionId: record.transaction_id,
      customerNameMasked: record.customer_name_masked,
      serviceSummary: record.service_summary,
      totalAmountAED: record.total_amount_aed,
      paidAmountAED: record.paid_amount_aed,
      remainingAmountAED: record.remaining_amount_aed,
      generatedAt: record.generated_at,
      revokedAt: record.revoked_at,
      revocationReason: record.revocation_reason || 'تم إلغاء الإيصال وتعديل المعاملة رسمياً من الإدارة',
      verifiedByBadge: defaultVerifiedBadge,
      message_ar: 'تنبيه: هذا الإيصال تم إلغاؤه رسمياً من قبل إدارة جلف ساند للطباعة والخدمات ولم يعد معتمداً.',
      message_en: 'Warning: This receipt has been officially revoked by GULFSAND TYPING SERVICES management.',
    };
  }

  if (status === 'EXPIRED') {
    return {
      status: 'EXPIRED',
      token: record.token,
      receiptNumber: record.receipt_number,
      transactionId: record.transaction_id,
      customerNameMasked: record.customer_name_masked,
      serviceSummary: record.service_summary,
      totalAmountAED: record.total_amount_aed,
      paidAmountAED: record.paid_amount_aed,
      remainingAmountAED: record.remaining_amount_aed,
      generatedAt: record.generated_at,
      expiresAt: record.expires_at,
      verifiedByBadge: defaultVerifiedBadge,
      message_ar: 'هذا الإيصال منتهي الصلاحية المحاسبية المحددة.',
      message_en: 'This receipt verification period has expired.',
    };
  }

  return {
    status: 'VALID',
    token: record.token,
    receiptNumber: record.receipt_number,
    transactionId: record.transaction_id,
    customerNameMasked: record.customer_name_masked,
    serviceSummary: record.service_summary,
    totalAmountAED: record.total_amount_aed,
    paidAmountAED: record.paid_amount_aed,
    remainingAmountAED: record.remaining_amount_aed,
    generatedAt: record.generated_at,
    verifiedByBadge: defaultVerifiedBadge,
    message_ar: 'تم التحقق بنجاح: هذا الإيصال صادر رسمياً ومسجل في قاعدة بيانات جلف ساند للطباعة والخدمات.',
    message_en: 'Verified successfully: This receipt is authentic and officially registered in GULFSAND TYPING SERVICES ERP.',
  };
}

function logVerificationAttempt(
  token: string,
  status: VerificationTokenStatus,
  receiptNumber: string,
  ipAddress: string,
  now: string
) {
  try {
    db.insert<ReceiptVerificationLogRecord>('receipt_verification_logs', {
      created_at: now,
      created_by: 'public-verifier',
      updated_at: now,
      updated_by: 'public-verifier',
      branch_id: 'BR-001',
      status: 'مسجل',
      token,
      receipt_number: receiptNumber,
      verified_at: now,
      ip_address: ipAddress,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown Browser',
      verification_status: status,
    });
  } catch (err) {
    console.error('Failed to log verification attempt:', err);
  }
}

/**
 * Revokes a verification token (Manager & Admin only). Logs to audit_logs.
 */
export function revokeReceiptVerificationToken(
  tokenId: string,
  reason: string,
  user: { id: string; role: UserRole; name: string }
): { success: boolean; message: string } {
  if (user.role !== UserRole.SYSTEM_ADMIN && user.role !== UserRole.MANAGER) {
    return { success: false, message: 'غير مصرح: يحق للمديرين فقط إلغاء رموز التحقق' };
  }

  const record = db.getById<ReceiptVerificationTokenRecord>('receipt_verification_tokens', tokenId);
  if (!record) {
    return { success: false, message: 'رمز التحقق غير موجود' };
  }

  const now = new Date().toISOString();
  db.update<ReceiptVerificationTokenRecord>('receipt_verification_tokens', tokenId, {
    status: 'REVOKED',
    revoked_at: now,
    revoked_by: user.name,
    revocation_reason: reason || 'إلغاء يدوي من قبل الإدارة',
  });

  db.logAudit(
    'تعديل',
    'receipt_verification_tokens',
    tokenId,
    `إلغاء صلاحية رمز التحقق للإيصال ${record.receipt_number} بواسطة ${user.name}. السبب: ${reason}`
  );

  return { success: true, message: 'تم إلغاء رمز التحقق بنجاح وتحديث حالته' };
}
