import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { validatePasswordPolicy } from '../utils/cryptoAuth';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  KeyRound,
  AlertTriangle,
} from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  isMandatoryFirstLogin?: boolean;
  onClose?: () => void;
  lang?: 'ar' | 'en' | string;
  embedded?: boolean;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  isMandatoryFirstLogin = false,
  onClose,
  lang = 'ar',
  embedded = false,
}) => {
  const { changePassword, currentUser } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const policy = useMemo(() => {
    return validatePasswordPolicy(newPassword, {
      email: currentUser?.email,
      fullNameAr: currentUser?.fullNameAr,
      fullNameEn: currentUser?.fullNameEn,
    });
  }, [newPassword, currentUser]);

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage('يرجى ملء كافة الحقول المطلوبة.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('كلمة المرور وتأكيد كلمة المرور غير متطابقين.');
      return;
    }

    if (!policy.isValid) {
      setErrorMessage('يرجى التأكد من استيفاء كافة الشروط الأمنية لكلمة المرور.');
      return;
    }

    setLoading(true);
    const res = await changePassword(currentPassword, newPassword, confirmPassword);
    setLoading(false);

    if (res.sessionExpired) {
      if (onClose) onClose();
      return;
    }

    if (res.success) {
      setSuccessMessage(res.message_ar || 'تم تعديل كلمة المرور بنجاح.');
      setTimeout(() => {
        if (onClose) onClose();
      }, 1500);
    } else {
      setErrorMessage(res.message_ar || 'فشل تعديل كلمة المرور. تحقق من كلمة المرور الحالية.');
    }
  };

  const modalBody = (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl ${embedded ? 'max-w-xl mx-auto my-2 shadow-sm' : 'max-w-md w-full shadow-2xl'} p-6 sm:p-7 animate-scaleUp`}>
      {/* Modal Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              {isMandatoryFirstLogin ? 'تغيير كلمة المرور المؤقتة إلزامياً' : 'تعديل كلمة المرور'}
            </h3>
            <p className="text-xs text-slate-400">
              {isMandatoryFirstLogin
                ? 'يجب تعيين كلمة مرور قوية جديدة قبل المتابعة واستخدام النظام'
                : 'تحديث بيانات الدخول الخاصة بحسابك'}
            </p>
          </div>
        </div>

        {!isMandatoryFirstLogin && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
          >
            إلغاء / رجوع
          </button>
        )}
      </div>

        {/* Mandatory Warning Banner */}
        {isMandatoryFirstLogin && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-300">إجراء أمني إلزامي عند أول دخول:</div>
              <div>تم تسجيل دخولك بكلمة المرور المؤقتة. يُلزم النظام المدير بتعيين كلمة مرور مخصصة وقوية للوصول لكافة وحدات ERP.</div>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successMessage ? (
          <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="font-semibold">{successMessage}</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>{errorMessage}</div>
              </div>
            )}

            {/* Current Password */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="current-pwd">
                الكلمة المرور الحالية (أو المؤقتة)
              </label>
              <input
                id="current-pwd"
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                dir="ltr"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-left"
                disabled={loading}
                required
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="modal-new-pwd">
                كلمة المرور الجديدة
              </label>
              <div className="relative">
                <input
                  id="modal-new-pwd"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  dir="ltr"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 pl-10 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-left"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-2.5 text-slate-500 hover:text-slate-300 p-0.5"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="modal-confirm-pwd">
                تأكيد كلمة المرور الجديدة
              </label>
              <input
                id="modal-confirm-pwd"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                dir="ltr"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-left"
                disabled={loading}
                required
              />
            </div>

            {confirmPassword.length > 0 && (
              <div className={`text-xs flex items-center gap-1.5 ${passwordsMatch ? 'text-emerald-400' : 'text-rose-400'}`}>
                {passwordsMatch ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>كلمتا المرور متطابقتان</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>كلمة المرور وتأكيد كلمة المرور غير متطابقين.</span>
                  </>
                )}
              </div>
            )}

            {/* Policy Checklist */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5">
              <div className="text-slate-300 font-semibold mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>الشروط الأمنية المعتمدة:</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div className={`flex items-center gap-1.5 ${policy.rules.minLength ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {policy.rules.minLength ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <div className="w-3 h-3 rounded-full border border-slate-600" />}
                  <span>12 حرفاً على الأقل</span>
                </div>
                <div className={`flex items-center gap-1.5 ${policy.rules.hasUpper ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {policy.rules.hasUpper ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <div className="w-3 h-3 rounded-full border border-slate-600" />}
                  <span>حرف كبير (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${policy.rules.hasLower ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {policy.rules.hasLower ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <div className="w-3 h-3 rounded-full border border-slate-600" />}
                  <span>حرف صغير (a-z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${policy.rules.hasNumber ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {policy.rules.hasNumber ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <div className="w-3 h-3 rounded-full border border-slate-600" />}
                  <span>رقم واحد (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 col-span-2 ${policy.rules.hasSpecial ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {policy.rules.hasSpecial ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <div className="w-3 h-3 rounded-full border border-slate-600" />}
                  <span>رمز خاص واحد (@, #, $, %, ...)</span>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-2 pt-2">
              {!isMandatoryFirstLogin && onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                >
                  إلغاء
                </button>
              )}
              <button
                type="submit"
                disabled={loading || !policy.isValid || !passwordsMatch}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {loading ? 'جاري الحفظ...' : 'حفظ كلمة المرور الجديدة'}
              </button>
            </div>
          </form>
        )}
      </div>
    );

  if (embedded) {
    return (
      <div id="change-password-canvas-view" className="w-full pb-8" dir="rtl">
        {modalBody}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" dir="rtl">
      {modalBody}
    </div>
  );
};
