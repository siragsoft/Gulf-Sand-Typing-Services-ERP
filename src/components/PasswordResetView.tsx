import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { validatePasswordPolicy } from '../utils/cryptoAuth';
import { GulfSandLogo, GulfSandEmblem } from './GulfSandLogo';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  Building2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface PasswordResetViewProps {
  token: string;
  type: 'reset' | 'activate';
  onBackToLogin: () => void;
}

export const PasswordResetView: React.FC<PasswordResetViewProps> = ({
  token,
  type,
  onBackToLogin,
}) => {
  const { resetPassword, activateAccount } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const policy = useMemo(() => {
    return validatePasswordPolicy(newPassword);
  }, [newPassword]);

  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!newPassword || !confirmPassword) {
      setErrorMessage('يرجى ملء جميع الحقول المطلوبة.');
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
    if (type === 'activate') {
      const res = await activateAccount(token, newPassword, confirmPassword);
      setLoading(false);
      if (res.success) {
        setSuccessMessage(res.message_ar || 'تم تفعيل حسابك وتعيين كلمة المرور بنجاح.');
      } else {
        setErrorMessage(res.message_ar || 'الرابط غير صالح أو انتهت صلاحيته.');
      }
    } else {
      const res = await resetPassword(token, newPassword, confirmPassword);
      setLoading(false);
      if (res.success) {
        setSuccessMessage(res.message_ar || 'تم تعديل كلمة المرور بنجاح.');
      } else {
        setErrorMessage(res.message_ar || 'الرابط غير صالح أو انتهت صلاحيته.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans text-slate-100" dir="rtl">
      {/* Background Lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-6 flex flex-col items-center">
          <div className="mb-3">
            <GulfSandLogo size="md" variant="mark" />
          </div>
          <h1 className="text-xl font-bold text-slate-100">
            {type === 'activate' ? 'تفعيل الحساب وتعيين كلمة المرور' : 'تعديل كلمة المرور'}
          </h1>
          <p className="text-xs text-amber-400 font-bold mt-1">
            جلف ساند لإدارة الأعمال • معايير الأمان المتقدمة
          </p>
        </div>

        {/* Success Card */}
        {successMessage ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5 animate-scaleUp">
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-sm flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 shrink-0 text-emerald-400 mt-0.5" />
              <div>
                <div className="font-bold text-emerald-300 text-base">تمت العملية بنجاح!</div>
                <div className="text-xs mt-1 text-emerald-200/90">{successMessage}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>تسجيل الدخول الآن</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Form Card */
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
            {errorMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <div>{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="new-password">
                  كلمة المرور الجديدة
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    dir="ltr"
                    className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 pl-10 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-left"
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

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5" htmlFor="confirm-password">
                  تأكيد كلمة المرور
                </label>
                <input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  dir="ltr"
                  className="w-full bg-slate-950/70 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-left"
                  disabled={loading}
                  required
                />
              </div>

              {/* Password Match Status */}
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

              {/* Live Password Policy Checklist */}
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-2">
                <div className="text-slate-300 font-semibold mb-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>الشروط الأمنية لكلمة المرور:</span>
                </div>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px]">
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
                    <span>رمز خاص واحد على الأقل (@, #, $, %, ...)</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !policy.isValid || !passwordsMatch}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>حفظ كلمة المرور الجديدة</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onBackToLogin}
                className="w-full py-2.5 text-center text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                العودة إلى شاشة تسجيل الدخول
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
