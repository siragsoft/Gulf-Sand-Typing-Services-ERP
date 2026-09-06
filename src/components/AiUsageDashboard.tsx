import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  Sliders,
  Power,
  Activity,
  DollarSign,
  Cpu,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Zap,
  PlayCircle,
  Database,
  FileCheck,
  Check,
  XCircle,
  EyeOff,
  BarChart,
  UserCheck
} from 'lucide-react';
import { Language } from '../i18n/translations';
import { fetchAiUsageDashboard, updateAiGovernanceSettings } from '../utils/aiClient';
import { runAiGovernanceAuditTests, TestCaseResult } from '../tests/aiGovernanceTests';

interface AiUsageDashboardProps {
  lang: Language;
}

export const AiUsageDashboard: React.FC<AiUsageDashboardProps> = ({ lang }) => {
  const isAr = lang === 'ar';

  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState<any>(null);
  const [updating, setUpdating] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Test suite execution state
  const [runningTests, setRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<TestCaseResult[] | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await fetchAiUsageDashboard();
    if (data.success) {
      setStatsData(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleKillSwitch = async () => {
    if (!statsData) return;
    const newStatus = !statsData.config.ai_kill_switch;
    setUpdating(true);
    const res = await updateAiGovernanceSettings({ ai_kill_switch: newStatus });
    if (res.success) {
      setActionMessage({
        type: 'success',
        text: newStatus
          ? isAr
            ? 'تم تفعيل مفتاح الطوارئ (Kill Switch) وإيقاف كافة طلبات الذكاء الاصطناعي فورياً.'
            : 'AI Emergency Kill Switch ACTIVATED. All AI requests disabled.'
          : isAr
          ? 'تم إلغاء مفتاح الطوارئ وإعادة تفعيل خدمات الذكاء الاصطناعي.'
          : 'AI services re-enabled successfully.',
      });
      loadData();
    } else {
      setActionMessage({
        type: 'error',
        text: res.message_ar || 'فشل تحديث الإعدادات',
      });
    }
    setUpdating(false);
  };

  const handleToggleFeature = async (featureKey: string) => {
    if (!statsData) return;
    const currentStatus = statsData.config.features_enabled[featureKey];
    setUpdating(true);
    const updatedFeatures = {
      ...statsData.config.features_enabled,
      [featureKey]: !currentStatus,
    };
    const res = await updateAiGovernanceSettings({ features_enabled: updatedFeatures });
    if (res.success) {
      setActionMessage({
        type: 'success',
        text: isAr ? 'تم تحديث صلاحيات الميزة بنجاح.' : 'Feature toggle updated.',
      });
      loadData();
    }
    setUpdating(false);
  };

  const handleRunTests = async () => {
    setRunningTests(true);
    setTestResults(null);
    try {
      const results = await runAiGovernanceAuditTests();
      setTestResults(results);
      loadData();
    } catch (err: any) {
      console.error('Test run failed', err);
    }
    setRunningTests(false);
  };

  const stats = statsData?.stats || {
    totalCalls: 0,
    successfulCalls: 0,
    cachedCalls: 0,
    blockedCalls: 0,
    totalCostUsd: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    dailySystemCount: 0,
    dailySystemLimit: 100,
    dailyUserLimit: 20,
    monthlyBudgetUsd: 50,
    budgetUsagePct: 0,
    budgetWarnings: [],
  };

  const config = statsData?.config || {
    ai_kill_switch: false,
    monthly_budget_usd: 50,
    features_enabled: {
      dashboard_summaries: true,
      customer_analysis: true,
      employee_analysis: true,
      nl_search: true,
      doc_classification: true,
    },
  };

  const recentLogs = statsData?.recentLogs || [];

  return (
    <div className="space-y-6">
      {/* Top Header & Emergency Kill Switch Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shrink-0">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold">
                {isAr ? 'لوحة حوكمة وضبط استهلاك الذكاء الاصطناعي (Gemini)' : 'Gemini AI Governance & Usage Safeguards'}
              </h2>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Flash 3.7 Active
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'إدارة الميزانية، حظر الاستدعاء التلقائي، منع التكرار، والتحكم في مفتاح الطوارئ'
                : 'Budget controls, auto-call prevention, request caching, and emergency kill switch'}
            </p>
          </div>
        </div>

        {/* Global Kill Switch Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            title={isAr ? 'تحديث البيانات' : 'Refresh'}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            id="btn-toggle-ai-kill-switch"
            onClick={handleToggleKillSwitch}
            disabled={updating}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg active:scale-95 ${
              config.ai_kill_switch
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>
              {config.ai_kill_switch
                ? isAr
                  ? 'مفتاح الطوارئ مُفعّل (AI معطل)'
                  : 'Kill Switch ACTIVE (AI Disabled)'
                : isAr
                ? 'مفتاح الطوارئ (إيقاف فوري للذكاء الاصطناعي)'
                : 'Emergency Kill Switch (Active)'}
            </span>
          </button>
        </div>
      </div>

      {/* Action Notification Message */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-slate-600 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Budget & Daily Limits KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Monthly Budget & Warnings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              {isAr ? 'الميزانية الشهرية المرصودة' : 'Monthly AI Budget'}
            </span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">${stats.totalCostUsd}</span>
            <span className="text-xs font-semibold text-slate-400">/ ${stats.monthlyBudgetUsd} USD</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                stats.budgetUsagePct >= 100
                  ? 'bg-rose-600'
                  : stats.budgetUsagePct >= 80
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(stats.budgetUsagePct, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>{isAr ? 'الاستهلاك:' : 'Usage:'} {stats.budgetUsagePct}%</span>
            {stats.budgetUsagePct >= 80 && (
              <span className="text-amber-600 flex items-center gap-1 font-bold">
                <AlertTriangle className="w-3 h-3" />
                {isAr ? 'تنبيه استهلاك' : 'Warning'}
              </span>
            )}
          </div>
        </div>

        {/* Card 2: System Daily Limit (100 req/day) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              {isAr ? 'حد النظام اليومي' : 'System Daily Quota'}
            </span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-600">{stats.dailySystemCount}</span>
            <span className="text-xs font-semibold text-slate-400">/ {stats.dailySystemLimit} {isAr ? 'طلب' : 'req'}</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all"
              style={{ width: `${Math.min((stats.dailySystemCount / stats.dailySystemLimit) * 100, 100)}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-500 block">
            {isAr ? 'حد أمان النظام لمنع الاستهلاك المفرط' : 'Hard daily cap prevents excessive billing'}
          </span>
        </div>

        {/* Card 3: User Daily Limit (20 req/day) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              {isAr ? 'حد المستخدم اليومي' : 'Per-User Daily Quota'}
            </span>
            <UserCheck className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-teal-700">{stats.dailyUserLimit}</span>
            <span className="text-xs font-semibold text-slate-400">{isAr ? 'طلب/مستخدم/يوم' : 'req/user/day'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{isAr ? 'حظر فوري مع إشعار عربي عند التجاوز' : 'Enforced with Arabic limit prompt'}</span>
          </div>
        </div>

        {/* Card 4: Cache & Safeguards Efficiency */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              {isAr ? 'كفاءة الكاش وتوفير التوكن' : 'Cache & Token Savings'}
            </span>
            <Database className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-600">{stats.cachedCalls}</span>
            <span className="text-xs font-semibold text-slate-400">/ {stats.totalCalls} {isAr ? 'طلب موفر' : 'saved'}</span>
          </div>
          <div className="text-[11px] text-slate-500">
            {isAr
              ? `إجمالي التوكن المستهلك: ${stats.totalInputTokens + stats.totalOutputTokens}`
              : `Total Tokens: ${stats.totalInputTokens + stats.totalOutputTokens}`}
          </div>
        </div>
      </div>

      {/* Feature-Level Toggles Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {isAr ? 'التحكم في ميزات الذكاء الاصطناعي (Feature-Level Switches)' : 'Feature-Level AI Toggles'}
            </h3>
            <p className="text-xs text-slate-500">
              {isAr
                ? 'يمكن لمدير النظام تعطيل أو تفعيل ميزات AI الفردية لتوفير التكاليف وحصر الاستخدام'
                : 'Individually enable or disable AI capabilities to preserve budget and control access'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {[
            {
              key: 'dashboard_summaries',
              titleAr: 'ملخصات لوحة المؤشرات',
              titleEn: 'Dashboard Summaries',
              descAr: 'تحليل الأداء التشغيلي والمالي بضغطة زر',
              descEn: 'Executive operational summary',
            },
            {
              key: 'customer_analysis',
              titleAr: 'تحليل حسابات العملاء',
              titleEn: 'Customer Account Insights',
              descAr: 'تقييم ولاء العميل واقتراح الخدمات التكميلية',
              descEn: 'Client history & service recommendations',
            },
            {
              key: 'employee_analysis',
              titleAr: 'تحليل إنتاجية الموظفين',
              titleEn: 'Employee Performance AI',
              descAr: 'مؤشرات دقة الطباعة ومعدل الإنجاز',
              descEn: 'Typing accuracy & task velocity metrics',
            },
            {
              key: 'nl_search',
              titleAr: 'البحث المتقدم باللغة الطبيعية',
              titleEn: 'Natural Language Search',
              descAr: 'البحث الذكي في سجلات المعاملات والعملاء',
              descEn: 'Semantic search across ERP records',
            },
            {
              key: 'doc_classification',
              titleAr: 'تصنيف المستندات والنماذج',
              titleEn: 'Document Classification',
              descAr: 'التعرف على نوع الهوية أو الجواز والمستندات الرسمية',
              descEn: 'Smart document type categorization',
            },
          ].map((item) => {
            const isEnabled = config.features_enabled[item.key] !== false;
            return (
              <div
                key={item.key}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    {isAr ? item.titleAr : item.titleEn}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {isAr ? item.descAr : item.descEn}
                  </p>
                </div>

                <button
                  onClick={() => handleToggleFeature(item.key)}
                  disabled={updating}
                  className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    isEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      isEnabled ? 'left-5' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Compliance & Governance Automated Verification Test Suite */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                {isAr ? 'فحص تدقيق ضوابط وحوكمة الذكاء الاصطناعي' : 'Automated AI Governance Audit Suite'}
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              {isAr
                ? 'إجراء اختبارات حية تثبت منع الاستدعاء التلقائي، عمل الكاش، حظر التكرار، مفتاح الطوارئ، وحماية مفاتيح API'
                : 'Execute live tests proving zero auto-calls, debounce protection, caching, limits, and kill switch'}
            </p>
          </div>

          <button
            id="btn-run-ai-governance-tests"
            onClick={handleRunTests}
            disabled={runningTests}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-indigo-200 transition cursor-pointer active:scale-95"
          >
            {runningTests ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <PlayCircle className="w-4 h-4" />
            )}
            <span>
              {runningTests
                ? isAr
                  ? 'جارٍ تشغيل الفحص والتدقيق...'
                  : 'Running Compliance Tests...'
                : isAr
                ? 'تشغيل فحص الضوابط والامتثال'
                : 'Run Governance Audit'}
            </span>
          </button>
        </div>

        {/* Test Results Table */}
        {testResults && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600 pb-1 border-b border-slate-100">
              <span>{isAr ? 'نتائج التدقيق الآلي (8 اختبارات)' : 'Audit Results (8 Tests)'}</span>
              <span className="text-emerald-600">
                {testResults.filter((r) => r.passed).length} / {testResults.length} {isAr ? 'ناجح' : 'Passed'}
              </span>
            </div>

            <div className="space-y-2">
              {testResults.map((t) => (
                <div
                  key={t.id}
                  className={`p-3.5 rounded-2xl border text-xs flex items-start justify-between gap-3 ${
                    t.passed
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                      : 'bg-rose-50 border-rose-200 text-rose-950'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {t.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <div className="font-bold">{isAr ? t.nameAr : t.nameEn}</div>
                      <p className="text-[11px] text-slate-600 mt-0.5">{t.details}</p>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-500 shrink-0">
                    {t.durationMs}ms
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Live AI Request Usage Log Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              {isAr ? 'سجل عمليات واستعلامات الذكاء الاصطناعي (Audit Log)' : 'Live AI Audit Log'}
            </h3>
            <p className="text-xs text-slate-500">
              {isAr
                ? 'توثيق دقيق لكل طلب يشمل المستخدم، التوكن، الحالة، والتكلفة التقديرية'
                : 'Detailed audit trail with timestamp, user, feature, model, token count, and cost'}
            </p>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            {recentLogs.length} {isAr ? 'حركة مسجلة' : 'records'}
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px] font-bold">
              <tr>
                <th className="p-3 text-start">{isAr ? 'الوقت' : 'Timestamp'}</th>
                <th className="p-3 text-start">{isAr ? 'المستخدم' : 'User'}</th>
                <th className="p-3 text-start">{isAr ? 'الميزة' : 'Feature'}</th>
                <th className="p-3 text-start">{isAr ? 'النموذج' : 'Model'}</th>
                <th className="p-3 text-center">{isAr ? 'التوكن (د/خ)' : 'Tokens (In/Out)'}</th>
                <th className="p-3 text-center">{isAr ? 'الحالة' : 'Status'}</th>
                <th className="p-3 text-end">{isAr ? 'التكلفة ($)' : 'Cost ($)'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    {isAr ? 'لا توجد استعلامات ذكاء اصطناعي مسجلة بعد.' : 'No AI requests logged yet.'}
                  </td>
                </tr>
              ) : (
                recentLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 font-mono text-[11px] text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString(isAr ? 'ar-AE' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="p-3 font-medium text-slate-900">{log.user_email}</td>
                    <td className="p-3">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {log.feature}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[10px] text-indigo-700">{log.model}</td>
                    <td className="p-3 text-center font-mono text-[11px]">
                      {log.input_token_estimate} / {log.output_token_estimate}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.status === 'CACHED'
                            ? 'bg-sky-100 text-sky-800'
                            : log.status === 'BLOCKED'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3 text-end font-mono font-semibold text-slate-900">
                      ${log.cost_estimate_usd?.toFixed(5) || '0.00000'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
