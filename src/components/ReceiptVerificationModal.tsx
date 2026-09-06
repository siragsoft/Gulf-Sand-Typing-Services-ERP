import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  QrCode,
  Copy,
  CheckCircle2,
  X,
  Lock,
  Calendar,
  DollarSign,
  User,
  FileText,
  Ban,
  ExternalLink,
  Download,
} from 'lucide-react';
import {
  verifyReceiptToken,
  revokeReceiptVerificationToken,
  VerificationResult,
  getReceiptVerificationUrl,
} from '../utils/qrVerification';
import { UserRole } from '../types/schema';

interface ReceiptVerificationModalProps {
  token: string;
  isOpen: boolean;
  onClose: () => void;
  currentUser?: {
    id: string;
    role: UserRole;
    name: string;
  };
  onTokenRevoked?: () => void;
  embedded?: boolean;
}

export const ReceiptVerificationModal: React.FC<ReceiptVerificationModalProps> = ({
  token,
  isOpen,
  onClose,
  currentUser,
  onTokenRevoked,
  embedded = false,
}) => {
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [inputQuery, setInputQuery] = useState(token || '');
  const [copied, setCopied] = useState(false);
  const [showRevokeForm, setShowRevokeForm] = useState(false);
  const [revokeReason, setRevokeReason] = useState('');
  const [revokeError, setRevokeError] = useState<string | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const isManager =
    currentUser && (currentUser.role === UserRole.SYSTEM_ADMIN || currentUser.role === UserRole.MANAGER);

  const runVerification = (query: string) => {
    if (!query.trim()) {
      setResult({
        status: 'NOT_FOUND',
        verifiedByBadge: 'جلف ساند للطباعة والخدمات',
        message_ar: 'يرجى إدخال رمز التحقق (Token) أو رقم الإيصال للتحقق من صحته.',
        message_en: 'Please enter verification token or receipt reference number.',
      });
      return;
    }
    const res = verifyReceiptToken(query.trim());
    setResult(res);
    setShowRevokeForm(false);
    setRevokeReason('');
    setRevokeError(null);
  };

  useEffect(() => {
    if (isOpen) {
      const q = token || inputQuery || 'TRX-001';
      setInputQuery(q);
      runVerification(q);
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const currentActiveToken = result?.token || token || inputQuery;
  const verificationUrl = getReceiptVerificationUrl(currentActiveToken);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleRevoke = () => {
    if (!currentUser || !isManager) return;
    if (!revokeReason.trim()) {
      setRevokeError('يرجى كتابة سبب الإلغاء الإداري بوضوح');
      return;
    }

    setIsRevoking(true);
    setRevokeError(null);

    const res = revokeReceiptVerificationToken(result?.token || token, revokeReason, currentUser);
    if (res.success) {
      // Re-verify to refresh state
      const refreshed = verifyReceiptToken(token);
      setResult(refreshed);
      setShowRevokeForm(false);
      if (onTokenRevoked) onTokenRevoked();
    } else {
      setRevokeError(res.message);
    }
    setIsRevoking(false);
  };

  const modalBody = (
    <div
      className={`bg-white rounded-3xl ${
        embedded ? 'max-w-2xl mx-auto my-2 shadow-sm' : 'max-w-xl w-full my-8 shadow-2xl'
      } border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200`}
    >
      {/* Header Header Status Banner */}
      <div
        className={`p-6 text-white flex items-center justify-between ${
          result?.status === 'VALID'
            ? 'bg-gradient-to-r from-emerald-600 to-teal-700'
            : result?.status === 'REVOKED'
            ? 'bg-gradient-to-r from-rose-600 to-red-700'
            : 'bg-gradient-to-r from-slate-700 to-slate-900'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            {result?.status === 'VALID' ? (
              <ShieldCheck className="w-7 h-7 text-emerald-200" />
            ) : result?.status === 'REVOKED' ? (
              <ShieldAlert className="w-7 h-7 text-rose-200" />
            ) : (
              <AlertTriangle className="w-7 h-7 text-amber-200" />
            )}
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-white/80">
              بوابة التحقق الإلكتروني من الإيصالات
            </div>
            <h2 className="text-xl font-bold">
              {result?.status === 'VALID'
                ? 'إيصال رسمي معتمد وأصلي'
                : result?.status === 'REVOKED'
                ? 'إيصال ملغي رسمياً من الإدارة'
                : 'رمز تحقق غير صالح أو غير موجود'}
            </h2>
          </div>
        </div>

        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
          <span>رجوع / إغلاق</span>
        </button>
      </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Quick Search/Scan Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="input-verify-token-search"
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') runVerification(inputQuery);
                }}
                placeholder="أدخل رمز الـ QR أو رقم الإيصال (مثال: REC-2026-00001 أو TRX-001)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-slate-50"
              />
            </div>
            <button
              id="btn-run-verify-query"
              onClick={() => runVerification(inputQuery)}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm shrink-0"
            >
              <QrCode className="w-4 h-4" />
              <span>فحص</span>
            </button>
          </div>

          {/* Status Message */}
          <div
            className={`p-4 rounded-2xl border text-sm leading-relaxed ${
              result?.status === 'VALID'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : result?.status === 'REVOKED'
                ? 'bg-rose-50 text-rose-900 border-rose-200'
                : 'bg-amber-50 text-amber-900 border-amber-200'
            }`}
          >
            <p className="font-semibold">{result?.message_ar}</p>
            <p className="text-xs mt-1 text-slate-500 font-sans" dir="ltr">
              {result?.message_en}
            </p>
          </div>

          {/* Details Card */}
          {result?.receiptNumber && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3.5 text-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" /> رقم الإيصال المرجعي:
                </span>
                <span className="font-mono font-bold text-slate-900">{result.receiptNumber}</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400" /> اسم العميل (حماية الخصوصية):
                </span>
                <span className="font-bold text-slate-800">{result.customerNameMasked}</span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-slate-400" /> المبلغ الإجمالي / المسدد:
                </span>
                <div className="text-left font-mono font-bold text-slate-900" dir="ltr">
                  <span>{result.totalAmountAED?.toFixed(2)} AED</span>
                  <span className="text-xs text-emerald-600 font-sans mr-2">(تم سداد: {result.paidAmountAED?.toFixed(2)} AED)</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" /> تاريخ وتوقيت الإصدار:
                </span>
                <span className="text-xs text-slate-700 font-mono">
                  {result.generatedAt ? result.generatedAt.slice(0, 19).replace('T', ' ') : 'N/A'}
                </span>
              </div>

              {result.revokedAt && (
                <div className="pt-2 border-t border-rose-200 text-rose-800">
                  <div className="text-xs font-bold">سبب وتاريخ الإلغاء:</div>
                  <div className="text-xs mt-0.5">{result.revocationReason} ({result.revokedAt.slice(0, 10)})</div>
                </div>
              )}
            </div>
          )}

          {/* Share & Copy Link */}
          <div className="bg-slate-100/80 p-3 rounded-2xl flex items-center justify-between gap-3 border border-slate-200">
            <div className="truncate text-xs font-mono text-slate-600 select-all" dir="ltr">
              {verificationUrl}
            </div>
            <button
              id="btn-copy-verify-url"
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold flex items-center gap-1.5 shrink-0 shadow-sm transition-all"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم النسخ' : 'نسخ الرابط'}</span>
            </button>
          </div>

          {/* Manager Revocation Section */}
          {isManager && result?.status === 'VALID' && (
            <div className="pt-2">
              {!showRevokeForm ? (
                <button
                  id="btn-show-revoke-receipt"
                  onClick={() => setShowRevokeForm(true)}
                  className="w-full py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Ban className="w-4 h-4" />
                  <span>إلغاء صلاحية هذا الإيصال (خاص بالمديرين)</span>
                </button>
              ) : (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" /> تأكيد إلغاء صلاحية الإيصال الضريبي
                  </h4>
                  <input
                    type="text"
                    value={revokeReason}
                    onChange={(e) => setRevokeReason(e.target.value)}
                    placeholder="اكتب سبب الإلغاء المحاسبي أو الإداري..."
                    className="w-full px-3 py-2 rounded-xl border border-rose-300 text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none bg-white"
                  />
                  {revokeError && <p className="text-xs text-rose-600 font-medium">{revokeError}</p>}
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => setShowRevokeForm(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800"
                    >
                      تراجع
                    </button>
                    <button
                      id="btn-confirm-revoke"
                      onClick={handleRevoke}
                      disabled={isRevoking}
                      className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm disabled:opacity-50"
                    >
                      {isRevoking ? 'جارٍ الإلغاء...' : 'تأكيد الإلغاء النهائي'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );

  if (embedded) {
    return (
      <div id="receipt-verify-canvas-view" className="w-full pb-8" dir="rtl">
        {modalBody}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" dir="rtl">
      {modalBody}
    </div>
  );
};
