/**
 * AI Client & Usage Governance Service for Gulf Sand ERP
 * 
 * Strict Safeguards:
 * 1. AI requests run ONLY on explicit user button clicks.
 * 2. Automatic calls on page load, refresh, input change, or keystrokes are STRICTLY PREVENTED.
 * 3. Debounce protection (>= 1500ms).
 * 4. Cancellation of previous pending requests via AbortController.
 * 5. Minimal required payload filtering (no full database dumps).
 * 6. Low-cost Flash model by default, Pro model only for manager-approved analysis.
 * 7. Rate limit detection with Arabic user feedback.
 */

export interface AiRequestOptions {
  feature: 'dashboard_summaries' | 'customer_analysis' | 'employee_analysis' | 'nl_search' | 'doc_classification';
  recordIds?: string[];
  dateRange?: string;
  minimalPayload?: Record<string, any>;
  modelType?: 'FLASH' | 'PRO';
  userPrompt?: string;
}

export interface AiResponseResult {
  success: boolean;
  result?: string;
  cached?: boolean;
  model?: string;
  input_tokens?: number;
  output_tokens?: number;
  latency_ms?: number;
  blocked?: boolean;
  rate_limited?: boolean;
  message_ar?: string;
  message_en?: string;
}

// Active request tracking and cancellation
let activeAbortController: AbortController | null = null;
let lastRequestTimestamp = 0;
const DEBOUNCE_DELAY_MS = 1500;

// Client-side quick cache to avoid redundant network round-trips
const clientCache = new Map<string, { data: AiResponseResult; timestamp: number }>();

function generateClientCacheKey(opts: AiRequestOptions): string {
  return JSON.stringify({
    feature: opts.feature,
    recordIds: (opts.recordIds || []).sort(),
    dateRange: opts.dateRange || '',
    modelType: opts.modelType || 'FLASH',
    userPrompt: opts.userPrompt || '',
    payloadSummary: opts.minimalPayload ? Object.keys(opts.minimalPayload).sort() : [],
  });
}

/**
 * Executes a governed, debounced AI analysis request with cancellation
 */
export async function executeGovernedAiAnalysis(
  options: AiRequestOptions
): Promise<AiResponseResult> {
  const now = Date.now();

  // 1. Debounce protection: enforce at least 1500ms between calls
  if (now - lastRequestTimestamp < DEBOUNCE_DELAY_MS) {
    const waitTime = Math.ceil((DEBOUNCE_DELAY_MS - (now - lastRequestTimestamp)) / 1000);
    return {
      success: false,
      blocked: true,
      message_ar: `يرجى الانتظار ${waitTime} ثوانٍ لتفادي تكرار إرسال الطلبات المتزامنة.`,
      message_en: `Please wait ${waitTime}s to prevent duplicate AI requests.`,
    };
  }

  // 2. Check client memory cache (1 hour validity)
  const cacheKey = generateClientCacheKey(options);
  const cached = clientCache.get(cacheKey);
  if (cached && now - cached.timestamp < 60 * 60 * 1000) {
    return {
      ...cached.data,
      cached: true,
    };
  }

  // 3. Cancel any previous unfinished request before launching a new one
  if (activeAbortController) {
    activeAbortController.abort();
    activeAbortController = null;
  }

  const controller = new AbortController();
  activeAbortController = controller;
  lastRequestTimestamp = now;

  try {
    const response = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        feature: options.feature,
        record_ids: options.recordIds || [],
        date_range: options.dateRange || '',
        minimal_payload: options.minimalPayload || {},
        model_type: options.modelType || 'FLASH',
        user_prompt: options.userPrompt || '',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        blocked: data.blocked || false,
        rate_limited: data.rate_limited || false,
        message_ar: data.message_ar || 'تعذر استكمال تحليل المساعد الذكي. يُرجى مراجعة إعدادات النظام.',
        message_en: data.message_en || 'AI analysis request failed.',
      };
    }

    // Save in client cache
    if (data.success) {
      clientCache.set(cacheKey, { data, timestamp: Date.now() });
    }

    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        blocked: true,
        message_ar: 'تم إلغاء الطلب السابق لبدء طلب جديد.',
        message_en: 'Previous AI request was canceled.',
      };
    }

    return {
      success: false,
      message_ar: error.message || 'حدث خطأ أثناء الاتصال بخدمة التحليل الذكي.',
      message_en: error.message || 'Connection error during AI request.',
    };
  } finally {
    if (activeAbortController === controller) {
      activeAbortController = null;
    }
  }
}

/**
 * Fetch Manager AI Usage Statistics & Budget Alert Info
 */
export async function fetchAiUsageDashboard(): Promise<{
  success: boolean;
  config?: any;
  stats?: any;
  recentLogs?: any[];
  message_ar?: string;
}> {
  try {
    const res = await fetch('/api/ai/usage-stats');
    if (!res.ok) {
      const err = await res.json();
      return { success: false, message_ar: err.message_ar || 'تعذر تحميل إحصائيات استهلاك AI' };
    }
    return await res.json();
  } catch (err: any) {
    return { success: false, message_ar: err.message || 'خطأ في الاتصال بالخادم' };
  }
}

/**
 * Update Manager AI Governance Settings & Kill Switch
 */
export async function updateAiGovernanceSettings(settings: {
  ai_kill_switch?: boolean;
  monthly_budget_usd?: number;
  features_enabled?: Record<string, boolean>;
}): Promise<{ success: boolean; message_ar?: string; config?: any }> {
  try {
    const res = await fetch('/api/ai/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, message_ar: err.message || 'خطأ في حفظ الإعدادات' };
  }
}
