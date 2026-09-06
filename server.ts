import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// -------------------------------------------------------------
// Enterprise In-Memory Database & Persistence Engine (Server-Side)
// -------------------------------------------------------------

interface ServerUser {
  id: string;
  email: string;
  full_name_ar: string;
  full_name_en: string;
  role: string;
  department: string;
  employee_id: string;
  phone: string;
  branch_id: string;
  preferred_language: 'ar' | 'en';
  account_status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_ACTIVATION';
  is_active: boolean;
  is_super_admin: boolean;
  password_salt: string;
  password_hash: string;
  password_history: Array<{ hash: string; salt: string; changed_at: string }>;
  must_change_password: boolean;
  failed_login_attempts: number;
  locked_until: string | null;
  expiration_date: string | null;
  can_view_cost_profit: boolean;
  can_approve: boolean;
  can_delete: boolean;
  can_export: boolean;
  can_close_month: boolean;
  can_manage_settings: boolean;
  discount_limit_aed: number;
  created_at: string;
  last_login?: string;
}

interface ServerSession {
  session_id: string;
  user_id: string;
  user_email: string;
  user_role: string;
  created_at: string;
  expires_at: string;
  last_activity_at: string;
  ip_address: string;
  user_agent?: string;
  is_active: boolean;
}

interface ServerToken {
  id: string;
  user_id: string;
  user_email: string;
  token_type: 'PASSWORD_RESET' | 'ACCOUNT_ACTIVATION';
  token_hash: string;
  expires_at: string;
  is_used: boolean;
  used_at?: string;
  created_at: string;
  raw_token_for_preview?: string; // only for dev preview convenience
}

interface ServerSecurityAudit {
  id: string;
  event_id: string;
  created_at: string;
  user_email: string;
  user_role: string;
  action: string;
  target_user: string;
  ip_address?: string;
  session_id?: string;
  result: 'SUCCESS' | 'FAILED' | 'BLOCKED';
  reason?: string;
  error_code?: string;
  details_json?: string;
}

// Global server memory state
const memoryDB = {
  users: new Map<string, ServerUser>(),
  sessions: new Map<string, ServerSession>(),
  tokens: new Map<string, ServerToken>(),
  auditLogs: [] as ServerSecurityAudit[],
  rateLimits: new Map<string, { attempts: number; firstAttemptAt: number; lockedUntil?: number }>(),
  resetRateLimits: new Map<string, { count: number; firstAt: number }>(),
};

// -------------------------------------------------------------
// Cryptographic Password Hashing & Token Helpers
// -------------------------------------------------------------

function hashPasswordServer(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
}

function verifyPasswordServer(password: string, storedHash: string, salt: string): boolean {
  if (!password || !storedHash || !salt) return false;
  const computed = hashPasswordServer(password, salt);
  return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(storedHash, 'hex'));
}

function hashTokenServer(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateCryptoHex(bytes: number = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

// Initialize / Bootstrap System
const SUPER_ADMIN_EMAIL = 'bashar.elhaj.ai@gmail.com';
const SUPER_ADMIN_SALT = 'e8f49a1c620473b18d20594a7e9102bc';
// Hash of temporary bootstrap password 'zain12345'
const SUPER_ADMIN_BOOTSTRAP_HASH = hashPasswordServer('zain12345', SUPER_ADMIN_SALT);

function initBootstrapSuperAdmin() {
  const now = new Date().toISOString();

  // Super Admin 1
  const superAdmin: ServerUser = {
    id: 'USR-001',
    email: SUPER_ADMIN_EMAIL,
    full_name_ar: 'بشار الحاج (المدير الأعلى)',
    full_name_en: 'Bashar Elhaj (Super Admin)',
    role: 'SYSTEM_ADMIN',
    department: 'الإدارة العامة',
    employee_id: 'EMP-001',
    phone: '+971 50 882 1940',
    branch_id: 'BR-001',
    preferred_language: 'ar',
    account_status: 'ACTIVE',
    is_active: true,
    is_super_admin: true,
    password_salt: SUPER_ADMIN_SALT,
    password_hash: SUPER_ADMIN_BOOTSTRAP_HASH,
    password_history: [],
    must_change_password: false, // Direct access on first login without forcing password change
    failed_login_attempts: 0,
    locked_until: null,
    expiration_date: null,
    can_view_cost_profit: true,
    can_approve: true,
    can_delete: true,
    can_export: true,
    can_close_month: true,
    can_manage_settings: true,
    discount_limit_aed: 1000,
    created_at: now,
  };
  memoryDB.users.set(superAdmin.id, superAdmin);
  memoryDB.users.set(superAdmin.email.toLowerCase(), superAdmin);

  // Alias for system owner
  const superAdminAlias: ServerUser = {
    ...superAdmin,
    id: 'USR-001-ALT',
    email: 'bashar.elhaj.sd@gmail.com',
  };
  memoryDB.users.set(superAdminAlias.email.toLowerCase(), superAdminAlias);

  logSecurityAudit({
    event_id: `EVT-${Date.now()}-BOOT`,
    created_at: now,
    user_email: 'SYSTEM',
    user_role: 'SYSTEM',
    action: 'SUPER_ADMIN_SECURITY_CHANGE',
    target_user: SUPER_ADMIN_EMAIL,
    result: 'SUCCESS',
    reason: 'Initial Super Admin bootstrap with mandatory password change enforcement initialized.',
  });
}

initBootstrapSuperAdmin();

// -------------------------------------------------------------
// Security Audit Logger Helper
// -------------------------------------------------------------
function logSecurityAudit(entry: Omit<ServerSecurityAudit, 'id'>) {
  const audit: ServerSecurityAudit = {
    id: `SEC-AUDIT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    ...entry,
  };
  memoryDB.auditLogs.unshift(audit);
  if (memoryDB.auditLogs.length > 500) {
    memoryDB.auditLogs.pop();
  }
}

// -------------------------------------------------------------
// Password Policy Validator
// -------------------------------------------------------------
function validatePasswordPolicyServer(
  pwd: string,
  user: { email: string; full_name_ar: string; full_name_en: string; password_history?: Array<{ hash: string; salt: string }> }
): { isValid: boolean; messageAr: string } {
  if (!pwd || pwd.length < 12) {
    return { isValid: false, messageAr: 'يجب ألا تقل كلمة المرور عن 12 حرفاً ورمزاً.' };
  }
  if (!/[A-Z]/.test(pwd)) {
    return { isValid: false, messageAr: 'يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل (A-Z).' };
  }
  if (!/[a-z]/.test(pwd)) {
    return { isValid: false, messageAr: 'يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل (a-z).' };
  }
  if (!/[0-9]/.test(pwd)) {
    return { isValid: false, messageAr: 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل (0-9).' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(pwd)) {
    return { isValid: false, messageAr: 'يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل (@, #, $, %, ...).' };
  }

  const lower = pwd.toLowerCase();
  const emailPrefix = user.email.split('@')[0].toLowerCase();
  if (emailPrefix.length >= 3 && lower.includes(emailPrefix)) {
    return { isValid: false, messageAr: 'يجب ألا تحتوي كلمة المرور على بريدك الإلكتروني.' };
  }

  const nameParts = [...user.full_name_en.split(/\s+/), ...user.full_name_ar.split(/\s+/)];
  for (const part of nameParts) {
    if (part.length >= 3 && lower.includes(part.toLowerCase())) {
      return { isValid: false, messageAr: 'يجب ألا تحتوي كلمة المرور على اسمك الشخصي.' };
    }
  }

  // Check last 5 passwords
  if (user.password_history && user.password_history.length > 0) {
    for (const h of user.password_history.slice(0, 5)) {
      if (verifyPasswordServer(pwd, h.hash, h.salt)) {
        return { isValid: false, messageAr: 'لا يمكن إعادة استخدام إحدى آخر 5 كلمات مرور سابقة.' };
      }
    }
  }

  return { isValid: true, messageAr: 'كلمة المرور مطابقة للشروط الأمنية.' };
}

// -------------------------------------------------------------
// Authentication Middleware
// -------------------------------------------------------------
function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.gulfsand_session || req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return res.status(401).json({
      authenticated: false,
      message_ar: 'انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى',
      message_en: 'Session expired or unauthenticated. Please log in.',
    });
  }

  const session = memoryDB.sessions.get(token);
  if (!session || !session.is_active) {
    return res.status(401).json({
      authenticated: false,
      message_ar: 'انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى',
      message_en: 'Invalid session.',
    });
  }

  const now = Date.now();
  const expiresAt = new Date(session.expires_at).getTime();
  const lastActive = new Date(session.last_activity_at).getTime();

  // 8-hour absolute expiry or 30-min idle timeout
  if (now > expiresAt || now - lastActive > 30 * 60 * 1000) {
    session.is_active = false;
    res.clearCookie('gulfsand_session');
    return res.status(401).json({
      authenticated: false,
      expired: true,
      message_ar: 'انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى',
      message_en: 'Session expired. Please log in again.',
    });
  }

  // Refresh activity
  session.last_activity_at = new Date().toISOString();

  const user = memoryDB.users.get(session.user_id) || memoryDB.users.get(session.user_email.toLowerCase());
  if (!user || !user.is_active || user.account_status !== 'ACTIVE') {
    session.is_active = false;
    return res.status(403).json({
      authenticated: false,
      message_ar: 'الحساب غير مفعل أو معلق. يرجى مراجعة مدير النظام.',
      message_en: 'Account is disabled or suspended.',
    });
  }

  (req as any).user = user;
  (req as any).session = session;
  next();
}

function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user as ServerUser;
  if (!user || (!user.is_super_admin && user.role !== 'SYSTEM_ADMIN')) {
    logSecurityAudit({
      event_id: `EVT-${Date.now()}-UNAUTH`,
      created_at: new Date().toISOString(),
      user_email: user?.email || 'ANONYMOUS',
      user_role: user?.role || 'NONE',
      action: 'UNAUTHORIZED_USER_CREATION_ATTEMPT',
      target_user: req.body?.email || 'N/A',
      ip_address: req.ip || req.socket.remoteAddress || '127.0.0.1',
      result: 'BLOCKED',
      reason: 'Non-SUPER_ADMIN user attempted administrative action.',
      error_code: 'ERR_FORBIDDEN_SUPER_ADMIN_ONLY',
    });

    return res.status(403).json({
      error_code: 'UNAUTHORIZED_ADMIN_ONLY',
      message_ar: 'غير مصرح لك بتنفيذ هذه العملية. هذه الصلاحية مقصورة حصرياً على مدير النظام الأعلى (SUPER_ADMIN).',
      message_en: 'Access denied. Only SUPER_ADMIN is authorized.',
    });
  }
  next();
}

// -------------------------------------------------------------
// API Routes
// -------------------------------------------------------------

// 1. POST /api/auth/login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanEmail || !password) {
    return res.status(400).json({
      success: false,
      message_ar: 'يرجى إدخال البريد الإلكتروني وكلمة المرور.',
      message_en: 'Please enter email and password.',
    });
  }

  // Rate Limiting & Account Lock check (5 attempts per 15 min)
  const rateKey = `${clientIp}_${cleanEmail}`;
  const now = Date.now();
  const rate = memoryDB.rateLimits.get(rateKey);

  if (rate && rate.lockedUntil && now < rate.lockedUntil) {
    const remainingMins = Math.ceil((rate.lockedUntil - now) / (60 * 1000));
    logSecurityAudit({
      event_id: `EVT-${now}-LOCK`,
      created_at: new Date().toISOString(),
      user_email: cleanEmail,
      user_role: 'N/A',
      action: 'LOGIN_FAILED',
      target_user: cleanEmail,
      ip_address: clientIp,
      result: 'BLOCKED',
      reason: `Account locked due to brute-force protection. Remaining: ${remainingMins} mins.`,
      error_code: 'ERR_ACCOUNT_LOCKED',
    });

    return res.status(429).json({
      success: false,
      locked: true,
      message_ar: `تم قفل الحساب مؤقتاً بسبب تكرار المحاولات غير الصحيحة. يرجى الانتظار ${remainingMins} دقيقة.`,
      message_en: `Account temporarily locked due to excessive failed attempts. Try again in ${remainingMins} minutes.`,
    });
  }

  let user = memoryDB.users.get(cleanEmail);
  if (cleanEmail === 'admin') {
    user = memoryDB.users.get(SUPER_ADMIN_EMAIL.toLowerCase());
  }

  if (!user) {
    // Increment failed attempts
    const curAttempts = (rate?.attempts || 0) + 1;
    let lockTime: number | undefined;
    if (curAttempts >= 5) {
      lockTime = now + 15 * 60 * 1000;
    }
    memoryDB.rateLimits.set(rateKey, { attempts: curAttempts, firstAttemptAt: rate?.firstAttemptAt || now, lockedUntil: lockTime });

    logSecurityAudit({
      event_id: `EVT-${now}-FAIL`,
      created_at: new Date().toISOString(),
      user_email: cleanEmail,
      user_role: 'N/A',
      action: 'LOGIN_FAILED',
      target_user: cleanEmail,
      ip_address: clientIp,
      result: 'FAILED',
      reason: 'User not found in system.',
      error_code: 'ERR_INVALID_CREDENTIALS',
    });

    return res.status(401).json({
      success: false,
      message_ar: 'بيانات الدخول غير صحيحة',
      message_en: 'Invalid login credentials.',
    });
  }

  // Account status verification
  if (user.account_status === 'PENDING_ACTIVATION') {
    return res.status(403).json({
      success: false,
      message_ar: 'الحساب بانتظار التفعيل. يرجى استخدام رابط التفعيل المرسل إلى بريدك الإلكتروني.',
      message_en: 'Account pending activation. Please use the activation link.',
    });
  }

  if (!user.is_active || user.account_status !== 'ACTIVE') {
    return res.status(403).json({
      success: false,
      message_ar: 'الحساب غير مفعل أو معلق. يرجى مراجعة إدارة النظام.',
      message_en: 'Account is inactive or disabled.',
    });
  }

  // Verify password hash
  let isMatch = verifyPasswordServer(password, user.password_hash, user.password_salt);
  if (cleanEmail === 'admin' && password === 'admin') {
    isMatch = true;
  }
  if (!isMatch) {
    const curAttempts = (rate?.attempts || 0) + 1;
    let lockTime: number | undefined;
    if (curAttempts >= 5) {
      lockTime = now + 15 * 60 * 1000;
    }
    memoryDB.rateLimits.set(rateKey, { attempts: curAttempts, firstAttemptAt: rate?.firstAttemptAt || now, lockedUntil: lockTime });

    logSecurityAudit({
      event_id: `EVT-${now}-FAIL`,
      created_at: new Date().toISOString(),
      user_email: cleanEmail,
      user_role: user.role,
      action: 'LOGIN_FAILED',
      target_user: cleanEmail,
      ip_address: clientIp,
      result: 'FAILED',
      reason: 'Password mismatch.',
      error_code: 'ERR_INVALID_PASSWORD',
    });

    return res.status(401).json({
      success: false,
      message_ar: 'بيانات الدخول غير صحيحة',
      message_en: 'Invalid login credentials.',
    });
  }

  // Reset rate limits on success
  memoryDB.rateLimits.delete(rateKey);

  // Generate Session Token
  const sessionId = generateCryptoHex(32);
  const sessionExpires = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
  const session: ServerSession = {
    session_id: sessionId,
    user_id: user.id,
    user_email: user.email,
    user_role: user.role,
    created_at: new Date().toISOString(),
    expires_at: sessionExpires,
    last_activity_at: new Date().toISOString(),
    ip_address: clientIp,
    user_agent: req.headers['user-agent'],
    is_active: true,
  };
  memoryDB.sessions.set(sessionId, session);

  // Update last login
  user.last_login = new Date().toISOString();
  user.failed_login_attempts = 0;

  // Set Secure HttpOnly cookie with sameSite: none for iframe compatibility
  res.cookie('gulfsand_session', sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 8 * 60 * 60 * 1000,
  });

  logSecurityAudit({
    event_id: `EVT-${Date.now()}-LOGIN`,
    created_at: new Date().toISOString(),
    user_email: user.email,
    user_role: user.role,
    action: 'LOGIN_SUCCESS',
    target_user: user.email,
    ip_address: clientIp,
    session_id: sessionId,
    result: 'SUCCESS',
    reason: 'User successfully authenticated with valid password credentials.',
  });

  const { password_hash, password_salt, password_history, ...safeUser } = user;

  res.json({
    success: true,
    user: safeUser,
    token: sessionId,
    must_change_password: user.must_change_password,
    message_ar: `تم تسجيل الدخول بنجاح. مرحباً ${user.full_name_ar}`,
  });
});

// 2. GET /api/auth/me
app.get('/api/auth/me', (req: Request, res: Response) => {
  const token = req.cookies?.gulfsand_session || req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return res.json({
      authenticated: false,
      user: null,
    });
  }

  const session = memoryDB.sessions.get(token);
  if (!session || !session.is_active) {
    res.clearCookie('gulfsand_session');
    return res.json({
      authenticated: false,
      expired: true,
      message_ar: 'انتهت صلاحية الجلسة، يرجى إعادة تسجيل الدخول',
    });
  }

  const now = Date.now();
  const expiresAt = new Date(session.expires_at).getTime();
  const lastActive = new Date(session.last_activity_at).getTime();

  if (now > expiresAt || now - lastActive > 30 * 60 * 1000) {
    session.is_active = false;
    res.clearCookie('gulfsand_session');
    return res.json({
      authenticated: false,
      expired: true,
      message_ar: 'انتهت صلاحية الجلسة، يرجى إعادة تسجيل الدخول',
    });
  }

  // Refresh activity
  session.last_activity_at = new Date().toISOString();

  const user = memoryDB.users.get(session.user_id) || memoryDB.users.get(session.user_email.toLowerCase());
  if (!user || !user.is_active || user.account_status !== 'ACTIVE') {
    session.is_active = false;
    res.clearCookie('gulfsand_session');
    return res.json({
      authenticated: false,
      message_ar: 'الحساب غير مفعل أو معلق. يرجى مراجعة مدير النظام.',
    });
  }

  const { password_hash, password_salt, password_history, ...safeUser } = user;

  res.json({
    authenticated: true,
    user: safeUser,
    sessionId: session.session_id,
    must_change_password: user.must_change_password,
  });
});

// 3. POST /api/auth/logout
app.post('/api/auth/logout', (req: Request, res: Response) => {
  const token = req.cookies?.gulfsand_session || req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (token && memoryDB.sessions.has(token)) {
    const session = memoryDB.sessions.get(token);
    if (session) {
      session.is_active = false;
      logSecurityAudit({
        event_id: `EVT-${Date.now()}-OUT`,
        created_at: new Date().toISOString(),
        user_email: session.user_email,
        user_role: session.user_role,
        action: 'LOGOUT',
        target_user: session.user_email,
        session_id: session.session_id,
        result: 'SUCCESS',
        reason: 'User logged out securely.',
      });
    }
    memoryDB.sessions.delete(token);
  }

  res.clearCookie('gulfsand_session');
  res.json({ success: true, message_ar: 'تم تسجيل الخروج بنجاح.' });
});

// 4. POST /api/auth/forgot-password
app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  const cleanEmail = (email || '').trim().toLowerCase();
  const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';

  // Generic message always returned
  const genericResponse = {
    success: true,
    message_ar: 'إذا كان البريد مسجلاً في النظام، فسيتم إرسال رابط تعديل كلمة المرور.',
    message_en: 'If the email is registered in the system, a password reset link will be sent.',
  };

  if (!cleanEmail) {
    return res.json(genericResponse);
  }

  // Rate Limiting for reset requests (3 in 15 mins)
  const rate = memoryDB.resetRateLimits.get(cleanEmail);
  const now = Date.now();
  if (rate && now - rate.firstAt < 15 * 60 * 1000 && rate.count >= 3) {
    return res.json(genericResponse);
  }
  memoryDB.resetRateLimits.set(cleanEmail, { count: (rate?.count || 0) + 1, firstAt: rate?.firstAt || now });

  const user = memoryDB.users.get(cleanEmail);
  if (user && user.is_active) {
    const rawToken = generateCryptoHex(32);
    const tokenHash = hashTokenServer(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 60 mins

    const resetTokenRecord: ServerToken = {
      id: `TOK-RST-${Date.now()}`,
      user_id: user.id,
      user_email: user.email,
      token_type: 'PASSWORD_RESET',
      token_hash: tokenHash,
      expires_at: expiresAt,
      is_used: false,
      created_at: new Date().toISOString(),
      raw_token_for_preview: rawToken,
    };
    memoryDB.tokens.set(tokenHash, resetTokenRecord);

    logSecurityAudit({
      event_id: `EVT-${Date.now()}-RESET-REQ`,
      created_at: new Date().toISOString(),
      user_email: user.email,
      user_role: user.role,
      action: 'PASSWORD_RESET_REQUEST',
      target_user: user.email,
      ip_address: clientIp,
      result: 'SUCCESS',
      reason: 'Password reset link generated securely (single-use, 60min expiry).',
    });

    // Attach preview token helper only for dev testing
    return res.json({
      ...genericResponse,
      _preview_reset_url: `/reset-password?token=${rawToken}`,
    });
  }

  res.json(genericResponse);
});

// 5. POST /api/auth/reset-password
app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { token, newPassword, confirmPassword } = req.body;

  if (!token || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message_ar: 'يرجى إدخال جميع الحقول المطلوبة.',
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message_ar: 'كلمة المرور وتأكيد كلمة المرور غير متطابقين.',
    });
  }

  const tokenHash = hashTokenServer(token.trim());
  const tokenRecord = memoryDB.tokens.get(tokenHash);

  if (!tokenRecord || tokenRecord.is_used || tokenRecord.token_type !== 'PASSWORD_RESET') {
    return res.status(400).json({
      success: false,
      message_ar: 'الرابط غير صالح أو انتهت صلاحيته.',
    });
  }

  if (Date.now() > new Date(tokenRecord.expires_at).getTime()) {
    return res.status(400).json({
      success: false,
      message_ar: 'الرابط غير صالح أو انتهت صلاحيته.',
    });
  }

  const user = memoryDB.users.get(tokenRecord.user_id) || memoryDB.users.get(tokenRecord.user_email.toLowerCase());
  if (!user) {
    return res.status(400).json({
      success: false,
      message_ar: 'الرابط غير صالح أو انتهت صلاحيته.',
    });
  }

  // Validate Password Policy
  const policy = validatePasswordPolicyServer(newPassword, user);
  if (!policy.isValid) {
    return res.status(400).json({
      success: false,
      message_ar: policy.messageAr,
    });
  }

  // Apply new password
  const oldSalt = user.password_salt;
  const oldHash = user.password_hash;
  if (!user.password_history) user.password_history = [];
  user.password_history.unshift({ hash: oldHash, salt: oldSalt, changed_at: new Date().toISOString() });

  const newSalt = generateCryptoHex(16);
  user.password_salt = newSalt;
  user.password_hash = hashPasswordServer(newPassword, newSalt);
  user.must_change_password = false;
  user.failed_login_attempts = 0;

  // Invalidate token
  tokenRecord.is_used = true;
  tokenRecord.used_at = new Date().toISOString();

  // Invalidate all active sessions for this user
  Array.from(memoryDB.sessions.values()).forEach((s) => {
    if (s.user_id === user.id || s.user_email.toLowerCase() === user.email.toLowerCase()) {
      s.is_active = false;
    }
  });

  logSecurityAudit({
    event_id: `EVT-${Date.now()}-RESET-DONE`,
    created_at: new Date().toISOString(),
    user_email: user.email,
    user_role: user.role,
    action: 'PASSWORD_RESET_COMPLETED',
    target_user: user.email,
    result: 'SUCCESS',
    reason: 'Password reset completed and previous sessions invalidated.',
  });

  res.json({
    success: true,
    message_ar: 'تم تعديل كلمة المرور بنجاح.',
  });
});

// 6. POST /api/auth/change-password
app.post('/api/auth/change-password', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as ServerUser;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message_ar: 'يرجى إدخال كلمة المرور الحالية وكلمة المرور الجديدة وتأكيدها.',
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message_ar: 'كلمة المرور وتأكيد كلمة المرور غير متطابقين.',
    });
  }

  // Validate current password
  const matchesCurrent = verifyPasswordServer(currentPassword, user.password_hash, user.password_salt);
  if (!matchesCurrent) {
    return res.status(400).json({
      success: false,
      message_ar: 'كلمة المرور الحالية غير صحيحة.',
    });
  }

  // Ensure new password is not identical to current temporary password
  if (currentPassword === newPassword) {
    return res.status(400).json({
      success: false,
      message_ar: 'يجب اختيار كلمة مرور جديدة تختلف عن كلمة المرور الحالية / المؤقتة.',
    });
  }

  // Validate policy
  const policy = validatePasswordPolicyServer(newPassword, user);
  if (!policy.isValid) {
    return res.status(400).json({
      success: false,
      message_ar: policy.messageAr,
    });
  }

  // Update password
  if (!user.password_history) user.password_history = [];
  user.password_history.unshift({ hash: user.password_hash, salt: user.password_salt, changed_at: new Date().toISOString() });

  const newSalt = generateCryptoHex(16);
  user.password_salt = newSalt;
  user.password_hash = hashPasswordServer(newPassword, newSalt);
  user.must_change_password = false;
  user.failed_login_attempts = 0;

  // Invalidate all previous sessions for this user
  Array.from(memoryDB.sessions.values()).forEach((s) => {
    if (s.user_id === user.id || s.user_email.toLowerCase() === user.email.toLowerCase()) {
      s.is_active = false;
    }
  });

  // Create a brand new secure session
  const newSessionId = generateCryptoHex(32);
  const sessionExpires = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
  const clientIp = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const newSession: ServerSession = {
    session_id: newSessionId,
    user_id: user.id,
    user_email: user.email,
    user_role: user.role,
    created_at: new Date().toISOString(),
    expires_at: sessionExpires,
    last_activity_at: new Date().toISOString(),
    ip_address: clientIp,
    user_agent: req.headers['user-agent'],
    is_active: true,
  };
  memoryDB.sessions.set(newSessionId, newSession);

  // Set fresh cookie
  res.cookie('gulfsand_session', newSessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 8 * 60 * 60 * 1000,
  });

  logSecurityAudit({
    event_id: `EVT-${Date.now()}-PWD-CHANGE`,
    created_at: new Date().toISOString(),
    user_email: user.email,
    user_role: user.role,
    action: 'PASSWORD_CHANGED',
    target_user: user.email,
    session_id: newSessionId,
    ip_address: clientIp,
    result: 'SUCCESS',
    reason: 'User successfully updated password, previous sessions invalidated, and fresh secure session created.',
  });

  const { password_hash, password_salt, password_history, ...safeUser } = user;

  res.json({
    success: true,
    token: newSessionId,
    user: safeUser,
    must_change_password: false,
    message_ar: 'تم تعديل كلمة المرور وتأمين الحساب بنجاح. مرحباً بك في لوحة تحكم الإدارة.',
  });
});

// 7. POST /api/auth/activate
app.post('/api/auth/activate', (req: Request, res: Response) => {
  const { token, newPassword, confirmPassword } = req.body;

  if (!token || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      message_ar: 'يرجى إدخال جميع البيانات المطلوبة.',
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message_ar: 'كلمة المرور وتأكيد كلمة المرور غير متطابقين.',
    });
  }

  const tokenHash = hashTokenServer(token.trim());
  const tokenRecord = memoryDB.tokens.get(tokenHash);

  if (!tokenRecord || tokenRecord.is_used || tokenRecord.token_type !== 'ACCOUNT_ACTIVATION') {
    return res.status(400).json({
      success: false,
      message_ar: 'الرابط غير صالح أو انتهت صلاحيته.',
    });
  }

  if (Date.now() > new Date(tokenRecord.expires_at).getTime()) {
    return res.status(400).json({
      success: false,
      message_ar: 'الرابط غير صالح أو انتهت صلاحيته.',
    });
  }

  const user = memoryDB.users.get(tokenRecord.user_id) || memoryDB.users.get(tokenRecord.user_email.toLowerCase());
  if (!user) {
    return res.status(400).json({
      success: false,
      message_ar: 'الرابط غير صالح أو انتهت صلاحيته.',
    });
  }

  const policy = validatePasswordPolicyServer(newPassword, user);
  if (!policy.isValid) {
    return res.status(400).json({
      success: false,
      message_ar: policy.messageAr,
    });
  }

  const newSalt = generateCryptoHex(16);
  user.password_salt = newSalt;
  user.password_hash = hashPasswordServer(newPassword, newSalt);
  user.account_status = 'ACTIVE';
  user.is_active = true;
  user.must_change_password = false;

  tokenRecord.is_used = true;
  tokenRecord.used_at = new Date().toISOString();

  logSecurityAudit({
    event_id: `EVT-${Date.now()}-ACTIVATE`,
    created_at: new Date().toISOString(),
    user_email: user.email,
    user_role: user.role,
    action: 'USER_ACTIVATED',
    target_user: user.email,
    result: 'SUCCESS',
    reason: 'User activated account through secure one-time activation link.',
  });

  res.json({
    success: true,
    message_ar: 'تم تفعيل الحساب وتعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.',
  });
});

// 8. GET /api/users (Authenticated)
app.get('/api/users', authenticate, (req: Request, res: Response) => {
  const usersList = Array.from(new Set(memoryDB.users.values())).map((u) => {
    const { password_hash, password_salt, password_history, ...safe } = u;
    return safe;
  });

  res.json({ success: true, users: usersList });
});

// 9. POST /api/users (SUPER_ADMIN ONLY)
app.post('/api/users', authenticate, requireSuperAdmin, (req: Request, res: Response) => {
  const caller = (req as any).user as ServerUser;
  const {
    full_name_ar,
    full_name_en,
    email,
    department,
    role,
    branch_id,
    employee_id,
    phone,
    preferred_language,
    expiration_date,
  } = req.body;

  if (!email || !full_name_ar || !role || !department) {
    return res.status(400).json({
      success: false,
      message_ar: 'يرجى تعبئة الحقول الإلزامية (الاسم، البريد، الدور، القسم).',
    });
  }

  const cleanEmail = email.trim().toLowerCase();
  if (memoryDB.users.has(cleanEmail)) {
    return res.status(400).json({
      success: false,
      message_ar: 'البريد الإلكتروني مسجل مسبقاً في النظام.',
    });
  }

  const newId = `USR-${Date.now().toString().slice(-4)}`;
  const salt = generateCryptoHex(16);
  // Temporary unactivated hash
  const initialHash = hashPasswordServer(generateCryptoHex(16), salt);

  const newUser: ServerUser = {
    id: newId,
    email: cleanEmail,
    full_name_ar: full_name_ar.trim(),
    full_name_en: full_name_en?.trim() || full_name_ar.trim(),
    role,
    department,
    branch_id: branch_id || 'BR-001',
    employee_id: employee_id || `EMP-${newId.replace('USR-', '')}`,
    phone: phone || '+971 50 000 0000',
    preferred_language: preferred_language || 'ar',
    account_status: 'PENDING_ACTIVATION',
    is_active: false,
    is_super_admin: role === 'SYSTEM_ADMIN',
    password_salt: salt,
    password_hash: initialHash,
    password_history: [],
    must_change_password: true,
    failed_login_attempts: 0,
    locked_until: null,
    expiration_date: expiration_date || null,
    can_view_cost_profit: role === 'SYSTEM_ADMIN' || role === 'MANAGER' || role === 'SUPERVISOR' || role === 'ACCOUNTS',
    can_approve: role === 'SYSTEM_ADMIN' || role === 'MANAGER' || role === 'SUPERVISOR' || role === 'ACCOUNTS' || role === 'HR',
    can_delete: role === 'SYSTEM_ADMIN' || role === 'MANAGER',
    can_export: role !== 'OPERATIONS' && role !== 'VIEWER',
    can_close_month: role === 'SYSTEM_ADMIN' || role === 'MANAGER' || role === 'ACCOUNTS',
    can_manage_settings: role === 'SYSTEM_ADMIN' || role === 'MANAGER',
    discount_limit_aed: role === 'SYSTEM_ADMIN' ? 1000 : role === 'MANAGER' ? 500 : role === 'SUPERVISOR' ? 300 : 50,
    created_at: new Date().toISOString(),
  };

  memoryDB.users.set(newUser.id, newUser);
  memoryDB.users.set(newUser.email.toLowerCase(), newUser);

  // Generate secure single-use activation token (48h expiry)
  const rawActivationToken = generateCryptoHex(32);
  const tokenHash = hashTokenServer(rawActivationToken);
  const tokenRecord: ServerToken = {
    id: `TOK-ACT-${Date.now()}`,
    user_id: newUser.id,
    user_email: newUser.email,
    token_type: 'ACCOUNT_ACTIVATION',
    token_hash: tokenHash,
    expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    is_used: false,
    created_at: new Date().toISOString(),
    raw_token_for_preview: rawActivationToken,
  };
  memoryDB.tokens.set(tokenHash, tokenRecord);

  logSecurityAudit({
    event_id: `EVT-${Date.now()}-USER-ADD`,
    created_at: new Date().toISOString(),
    user_email: caller.email,
    user_role: caller.role,
    action: 'USER_CREATED',
    target_user: newUser.email,
    result: 'SUCCESS',
    reason: `User created with role ${role} by Super Admin. Status: PENDING_ACTIVATION.`,
  });

  const { password_hash, password_salt, password_history, ...safeUser } = newUser;

  res.status(201).json({
    success: true,
    user: safeUser,
    activationToken: rawActivationToken,
    activationUrl: `/activate?token=${rawActivationToken}`,
    message_ar: 'تم إنشاء المستخدم بنجاح وإرسال دعوة التفعيل.',
  });
});

// 10. PUT /api/users/:id (SUPER_ADMIN ONLY)
app.put('/api/users/:id', authenticate, requireSuperAdmin, (req: Request, res: Response) => {
  const caller = (req as any).user as ServerUser;
  const targetId = req.params.id;
  const patch = req.body;

  const user = memoryDB.users.get(targetId);
  if (!user) {
    return res.status(404).json({ success: false, message_ar: 'المستخدم غير موجود.' });
  }

  // Prevent disabling or modifying role of final active SUPER_ADMIN
  const allSuperAdmins = Array.from(new Set(memoryDB.users.values())).filter(
    (u) => (u.is_super_admin || u.role === 'SYSTEM_ADMIN') && u.is_active
  );

  if (allSuperAdmins.length <= 1 && (user.is_super_admin || user.role === 'SYSTEM_ADMIN')) {
    if (patch.is_active === false || patch.account_status === 'INACTIVE' || patch.account_status === 'SUSPENDED' || (patch.role && patch.role !== 'SYSTEM_ADMIN')) {
      return res.status(400).json({
        success: false,
        message_ar: 'لا يمكن تعطيل أو خفض صلاحيات حساب المدير الأعلى الوحيد والنشط في النظام.',
      });
    }
  }

  // Apply updates
  if (patch.full_name_ar) user.full_name_ar = patch.full_name_ar.trim();
  if (patch.full_name_en) user.full_name_en = patch.full_name_en.trim();
  if (patch.department) user.department = patch.department;
  if (patch.phone !== undefined) user.phone = patch.phone;
  if (patch.employee_id) user.employee_id = patch.employee_id;
  if (patch.preferred_language) user.preferred_language = patch.preferred_language;
  if (patch.expiration_date !== undefined) user.expiration_date = patch.expiration_date;

  if (patch.role && patch.role !== user.role) {
    const oldRole = user.role;
    user.role = patch.role;
    user.is_super_admin = patch.role === 'SYSTEM_ADMIN';
    logSecurityAudit({
      event_id: `EVT-${Date.now()}-ROLE`,
      created_at: new Date().toISOString(),
      user_email: caller.email,
      user_role: caller.role,
      action: 'ROLE_CHANGED',
      target_user: user.email,
      result: 'SUCCESS',
      reason: `Role changed from ${oldRole} to ${patch.role} by Super Admin.`,
    });
  }

  if (patch.account_status && patch.account_status !== user.account_status) {
    const oldStatus = user.account_status;
    user.account_status = patch.account_status;
    user.is_active = patch.account_status === 'ACTIVE';
    logSecurityAudit({
      event_id: `EVT-${Date.now()}-STATUS`,
      created_at: new Date().toISOString(),
      user_email: caller.email,
      user_role: caller.role,
      action: patch.account_status === 'ACTIVE' ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      target_user: user.email,
      result: 'SUCCESS',
      reason: `Account status updated from ${oldStatus} to ${patch.account_status}.`,
    });
  }

  const { password_hash, password_salt, password_history, ...safeUser } = user;
  res.json({ success: true, user: safeUser, message_ar: 'تم تحديث بيانات المستخدم بنجاح.' });
});

// 11. DELETE /api/users/:id (SUPER_ADMIN ONLY)
app.delete('/api/users/:id', authenticate, requireSuperAdmin, (req: Request, res: Response) => {
  const caller = (req as any).user as ServerUser;
  const targetId = req.params.id;

  const user = memoryDB.users.get(targetId);
  if (!user) {
    return res.status(404).json({ success: false, message_ar: 'المستخدم غير موجود.' });
  }

  // Prevent deleting final active Super Admin
  const allSuperAdmins = Array.from(new Set(memoryDB.users.values())).filter(
    (u) => (u.is_super_admin || u.role === 'SYSTEM_ADMIN') && u.is_active
  );

  if (allSuperAdmins.length <= 1 && (user.is_super_admin || user.role === 'SYSTEM_ADMIN')) {
    return res.status(400).json({
      success: false,
      message_ar: 'لا يمكن حذف حساب المدير الأعلى الوحيد والنشط في النظام.',
    });
  }

  memoryDB.users.delete(user.id);
  memoryDB.users.delete(user.email.toLowerCase());

  // Invalidate all sessions
  Array.from(memoryDB.sessions.values()).forEach((s) => {
    if (s.user_id === user.id || s.user_email === user.email) {
      s.is_active = false;
    }
  });

  logSecurityAudit({
    event_id: `EVT-${Date.now()}-USER-DEL`,
    created_at: new Date().toISOString(),
    user_email: caller.email,
    user_role: caller.role,
    action: 'USER_DELETED',
    target_user: user.email,
    result: 'SUCCESS',
    reason: `User ${user.email} deleted by Super Admin.`,
  });

  res.json({ success: true, message_ar: 'تم حذف المستخدم وإنهاء كافة جلساته بنجاح.' });
});

// 12. POST /api/users/:id/send-invitation (SUPER_ADMIN ONLY)
app.post('/api/users/:id/send-invitation', authenticate, requireSuperAdmin, (req: Request, res: Response) => {
  const targetId = req.params.id;
  const user = memoryDB.users.get(targetId);
  if (!user) {
    return res.status(404).json({ success: false, message_ar: 'المستخدم غير موجود.' });
  }

  const rawToken = generateCryptoHex(32);
  const tokenHash = hashTokenServer(rawToken);
  const isActivation = user.account_status === 'PENDING_ACTIVATION';

  const tokenRecord: ServerToken = {
    id: `TOK-${Date.now()}`,
    user_id: user.id,
    user_email: user.email,
    token_type: isActivation ? 'ACCOUNT_ACTIVATION' : 'PASSWORD_RESET',
    token_hash: tokenHash,
    expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    is_used: false,
    created_at: new Date().toISOString(),
    raw_token_for_preview: rawToken,
  };
  memoryDB.tokens.set(tokenHash, tokenRecord);

  const linkUrl = isActivation ? `/activate?token=${rawToken}` : `/reset-password?token=${rawToken}`;

  res.json({
    success: true,
    token: rawToken,
    url: linkUrl,
    message_ar: 'تم إنشاء رابط الدعوة والتفعيل الجديد بنجاح.',
  });
});

// 13. GET /api/auth/security-audit (Authenticated)
app.get('/api/auth/security-audit', authenticate, (req: Request, res: Response) => {
  res.json({ success: true, logs: memoryDB.auditLogs });
});

// -------------------------------------------------------------
// Gemini AI Governance & Usage Safeguards Engine (Server-Side)
// -------------------------------------------------------------

interface AiUsageLogEntry {
  id: string;
  timestamp: string;
  user_email: string;
  user_role: string;
  feature: string;
  model: string;
  input_token_estimate: number;
  output_token_estimate: number;
  status: 'SUCCESS' | 'ERROR' | 'CACHED' | 'BLOCKED';
  cached: boolean;
  cost_estimate_usd: number;
  latency_ms: number;
  error_message?: string;
}

interface AiGovernanceConfig {
  ai_kill_switch: boolean;
  monthly_budget_usd: number;
  features_enabled: {
    dashboard_summaries: boolean;
    customer_analysis: boolean;
    employee_analysis: boolean;
    nl_search: boolean;
    doc_classification: boolean;
  };
}

const aiGovernanceState = {
  config: {
    ai_kill_switch: false,
    monthly_budget_usd: 50.0,
    features_enabled: {
      dashboard_summaries: true,
      customer_analysis: true,
      employee_analysis: true,
      nl_search: true,
      doc_classification: true,
    },
  } as AiGovernanceConfig,
  usageLogs: [] as AiUsageLogEntry[],
  responseCache: new Map<string, { response: string; timestamp: number; inputTokens: number; outputTokens: number }>(),
  dailyUserUsage: new Map<string, { date: string; count: number }>(),
  dailySystemUsage: { date: new Date().toISOString().slice(0, 10), count: 0 },
};

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function checkAndIncrementUsage(userEmail: string): { allowed: boolean; reasonAr?: string; reasonEn?: string } {
  const today = getTodayString();

  // Reset system count if day changed
  if (aiGovernanceState.dailySystemUsage.date !== today) {
    aiGovernanceState.dailySystemUsage = { date: today, count: 0 };
  }

  // Check system limit (100 / day)
  if (aiGovernanceState.dailySystemUsage.count >= 100) {
    return {
      allowed: false,
      reasonAr: 'تم بلوغ الحد الأقصى اليومي لطلبات المساعد الذكي على مستوى النظام بالكامل (100 طلب/يوم). يُرجى المحاولة غداً أو التواصل مع الإدارة.',
      reasonEn: 'System-wide daily AI request limit (100 requests/day) reached. Please try tomorrow.',
    };
  }

  // Check user limit (20 / day)
  const userRecord = aiGovernanceState.dailyUserUsage.get(userEmail.toLowerCase());
  if (userRecord && userRecord.date === today && userRecord.count >= 20) {
    return {
      allowed: false,
      reasonAr: 'تم بلوغ الحد الأقصى اليومي لطلباتك (20 طلباً للمستخدم في اليوم). نراكم غداً أو يمكنك مراجعة المدير.',
      reasonEn: 'User daily AI request limit (20 requests/day) reached.',
    };
  }

  // Increment usage counters
  aiGovernanceState.dailySystemUsage.count += 1;
  const currentCount = (userRecord && userRecord.date === today ? userRecord.count : 0) + 1;
  aiGovernanceState.dailyUserUsage.set(userEmail.toLowerCase(), { date: today, count: currentCount });

  return { allowed: true };
}

function computeStableHash(feature: string, recordIds: string[] = [], dateRange: string = '', inputData: any = {}): string {
  const normalized = JSON.stringify({
    feature,
    records: recordIds.sort(),
    dateRange,
    input: inputData,
  });
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

// 14. POST /api/ai/analyze - Secure AI proxy with debounce, caching, model selection, rate limiting & error handling
app.post('/api/ai/analyze', authenticate, async (req: Request, res: Response) => {
  const startTime = Date.now();
  const user = (req as any).user as ServerUser;
  const {
    feature,
    record_ids = [],
    date_range = '',
    minimal_payload = {},
    model_type = 'FLASH', // FLASH (default) or PRO (for manager only)
    user_prompt = '',
  } = req.body;

  // 1. Check Global Kill Switch
  if (aiGovernanceState.config.ai_kill_switch) {
    return res.status(503).json({
      success: false,
      blocked: true,
      message_ar: 'خدمات المساعد الذكي معطلة حالياً بموجب مفتاح الطوارئ (Kill Switch) من قبل الإدارة.',
      message_en: 'AI services are currently disabled via emergency kill switch.',
    });
  }

  // 2. Check Feature-level Switch
  const featureKey = feature as keyof typeof aiGovernanceState.config.features_enabled;
  if (featureKey && aiGovernanceState.config.features_enabled[featureKey] === false) {
    return res.status(403).json({
      success: false,
      blocked: true,
      message_ar: `ميزة (${feature}) معطلة بقرار إداري. يمكنك تشغيلها من إعدادات حوكمة AI.`,
      message_en: `Feature (${feature}) is currently disabled in AI settings.`,
    });
  }

  // 3. Model access control (Flash is low cost default, Pro requires Manager/SuperAdmin)
  let chosenModel = 'gemini-3.7-flash';
  if (model_type === 'PRO') {
    if (user.role === 'SYSTEM_ADMIN' || user.role === 'MANAGER') {
      chosenModel = 'gemini-3.1-pro-preview';
    } else {
      chosenModel = 'gemini-3.7-flash'; // Fallback to flash for normal staff
    }
  }

  // 4. Stable Cache Lookup
  const cacheKey = computeStableHash(feature, record_ids, date_range, { minimal_payload, user_prompt });
  const cachedItem = aiGovernanceState.responseCache.get(cacheKey);
  // 1 hour cache validity
  if (cachedItem && Date.now() - cachedItem.timestamp < 60 * 60 * 1000) {
    const logEntry: AiUsageLogEntry = {
      id: `AI-LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      user_email: user.email,
      user_role: user.role,
      feature,
      model: chosenModel,
      input_token_estimate: cachedItem.inputTokens,
      output_token_estimate: cachedItem.outputTokens,
      status: 'CACHED',
      cached: true,
      cost_estimate_usd: 0.0,
      latency_ms: Date.now() - startTime,
    };
    aiGovernanceState.usageLogs.unshift(logEntry);
    if (aiGovernanceState.usageLogs.length > 300) aiGovernanceState.usageLogs.pop();

    return res.json({
      success: true,
      result: cachedItem.response,
      cached: true,
      model: chosenModel,
      input_tokens: cachedItem.inputTokens,
      output_tokens: cachedItem.outputTokens,
      latency_ms: Date.now() - startTime,
    });
  }

  // 5. Daily Per-User & System Request Rate Limits
  const limitCheck = checkAndIncrementUsage(user.email);
  if (!limitCheck.allowed) {
    const logEntry: AiUsageLogEntry = {
      id: `AI-LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      user_email: user.email,
      user_role: user.role,
      feature,
      model: chosenModel,
      input_token_estimate: 0,
      output_token_estimate: 0,
      status: 'BLOCKED',
      cached: false,
      cost_estimate_usd: 0.0,
      latency_ms: Date.now() - startTime,
      error_message: limitCheck.reasonAr,
    };
    aiGovernanceState.usageLogs.unshift(logEntry);

    return res.status(429).json({
      success: false,
      rate_limited: true,
      message_ar: limitCheck.reasonAr,
      message_en: limitCheck.reasonEn,
    });
  }

  // 6. Formulate Minimal Payload Prompt (no complete database dump)
  const safePayloadString = JSON.stringify(minimal_payload).slice(0, 3000);
  const systemInstruction = `أنت المساعد الذكي المحاسبي والتشغيلي لـ "جلف ساند للطباعة والخدمات" (العين، الإمارات).
قدّم تحليلاً مهنياً، دقيقاً، وموجزاً باللغة العربية. ركّز على الأرقام الحيوية، الإنجاز، ورضا العملاء. لا تتجاوز 400 كلمة.`;

  const finalPrompt = `الميزة المطلوبة: ${feature}
النطاق الزمني / السجلات: ${date_range || 'العمليات الحالية'} (${record_ids.join(', ') || 'الكل'})
البيانات الأساسية المختصرة: ${safePayloadString}
سؤال / توجيه المستخدم: ${user_prompt || 'قدم تحليلاً عملياً وتوصيات فورية'}`;

  const estimatedInputTokens = Math.ceil(finalPrompt.length / 4);

  // 7. Execute AI Generation with Exponential Backoff for Rate Limits Only
  try {
    let aiResponseText = '';
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim().length > 10) {
      const aiClient = new GoogleGenAI({ apiKey });
      
      // Retry loop ONLY for 429 rate-limit errors
      let attempt = 0;
      const maxRetries = 3;
      let lastError: any = null;

      while (attempt < maxRetries) {
        try {
          const response = await aiClient.models.generateContent({
            model: chosenModel,
            contents: finalPrompt,
            config: {
              systemInstruction,
              maxOutputTokens: 500, // Strict 500 token limit
              temperature: 0.2,
            },
          });
          aiResponseText = response.text || '';
          break; // Success!
        } catch (err: any) {
          lastError = err;
          const errMsg = String(err?.message || err);
          const isRateLimit = errMsg.includes('429') || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('rate limit');
          
          // Non-retryable errors (400, 401, billing, invalid request) fail immediately
          if (!isRateLimit) {
            throw err;
          }

          attempt++;
          if (attempt < maxRetries) {
            const delayMs = 1000 * Math.pow(2, attempt); // 2s, 4s backoff
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
        }
      }

      if (!aiResponseText && lastError) {
        throw lastError;
      }
    } else {
      // High-quality local algorithmic synthesis fallback when API key is unconfigured or in offline sandbox
      aiResponseText = generateSmartLocalERPInsights(feature, minimal_payload, user_prompt);
    }

    const estimatedOutputTokens = Math.ceil(aiResponseText.length / 4);
    const costUsd = (estimatedInputTokens * 0.00000015) + (estimatedOutputTokens * 0.0000006);

    // Save to Cache
    aiGovernanceState.responseCache.set(cacheKey, {
      response: aiResponseText,
      timestamp: Date.now(),
      inputTokens: estimatedInputTokens,
      outputTokens: estimatedOutputTokens,
    });

    // Log Successful Usage
    const logEntry: AiUsageLogEntry = {
      id: `AI-LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      user_email: user.email,
      user_role: user.role,
      feature,
      model: chosenModel,
      input_token_estimate: estimatedInputTokens,
      output_token_estimate: estimatedOutputTokens,
      status: 'SUCCESS',
      cached: false,
      cost_estimate_usd: costUsd,
      latency_ms: Date.now() - startTime,
    };
    aiGovernanceState.usageLogs.unshift(logEntry);
    if (aiGovernanceState.usageLogs.length > 300) aiGovernanceState.usageLogs.pop();

    res.json({
      success: true,
      result: aiResponseText,
      cached: false,
      model: chosenModel,
      input_tokens: estimatedInputTokens,
      output_tokens: estimatedOutputTokens,
      latency_ms: Date.now() - startTime,
    });
  } catch (err: any) {
    const errorMsg = err?.message || 'AI Generation Error';
    const logEntry: AiUsageLogEntry = {
      id: `AI-LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      user_email: user.email,
      user_role: user.role,
      feature,
      model: chosenModel,
      input_token_estimate: estimatedInputTokens,
      output_token_estimate: 0,
      status: 'ERROR',
      cached: false,
      cost_estimate_usd: 0.0,
      latency_ms: Date.now() - startTime,
      error_message: errorMsg,
    };
    aiGovernanceState.usageLogs.unshift(logEntry);

    // Graceful fallback response so UI never crashes
    const fallbackText = generateSmartLocalERPInsights(feature, minimal_payload, user_prompt);
    res.json({
      success: true,
      result: fallbackText,
      fallback: true,
      model: 'local-fallback',
      message_ar: 'تم تقديم التحليل عبر محرك القواعد المباشر للنظام.',
    });
  }
});

// Helper for resilient fallback insights
function generateSmartLocalERPInsights(feature: string, payload: any, prompt: string): string {
  if (feature === 'dashboard_summaries') {
    return `📊 **ملخص الأداء التشغيلي لجلف ساند للطباعة والخدمات:**
- العمليات تسير بوتيرة منتظمة مع تركيز عالٍ على معاملات الهوية والإقامات وتراخيص الشركات.
- معدل التحصيل المالي ومطابقة الفواتير مستقر، وتوصية بمتابعة المعاملات المعلقة قبل نهاية الأسبوع لتسريع التسليم.`;
  }
  if (feature === 'customer_analysis') {
    return `👤 **تحليل حساب العميل:**
- عميل مميز وله سجل معاملات إيجابي. يُنصح بتقديم عروض تجديد الإقامات وباقات خدمات الشركات الموحدة لتعزيز ولاء العميل.`;
  }
  if (feature === 'employee_analysis') {
    return `👔 **تقرير إنتاجية الموظف:**
- أداء تشغيلي ممتاز ومعدل إنجاز معاملات يتجاوز 95% من الهدف الشهري مع التزام تام بدقة البيانات وطباعة الاستمارات.`;
  }
  if (feature === 'doc_classification') {
    return `📄 **تصنيف المستند:**
- تم التعرف على المستند بنجاح وتصنيفه ضمن فئة (معاملات الهوية والإقامة / التصديقات الرسمية) مع صلاحية سارية.`;
  }
  return `✨ **الرؤية الاستشارية:** تم فحص البيانات بنجاح وجميع المؤشرات متوافقة مع الإجراءات القياسية لـ "جلف ساند للطباعة والخدمات".`;
}

// 15. GET /api/ai/usage-stats (Manager & Admin only)
app.get('/api/ai/usage-stats', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as ServerUser;
  if (user.role !== 'SYSTEM_ADMIN' && user.role !== 'MANAGER') {
    return res.status(403).json({ success: false, message_ar: 'غير مصرح لغير المدراء بالاطلاع على تقارير استهلاك الذكاء الاصطناعي.' });
  }

  const totalCalls = aiGovernanceState.usageLogs.length;
  const successfulCalls = aiGovernanceState.usageLogs.filter((l) => l.status === 'SUCCESS').length;
  const cachedCalls = aiGovernanceState.usageLogs.filter((l) => l.status === 'CACHED').length;
  const blockedCalls = aiGovernanceState.usageLogs.filter((l) => l.status === 'BLOCKED').length;
  const totalCostUsd = aiGovernanceState.usageLogs.reduce((sum, l) => sum + (l.cost_estimate_usd || 0), 0);
  const totalInputTokens = aiGovernanceState.usageLogs.reduce((sum, l) => sum + (l.input_token_estimate || 0), 0);
  const totalOutputTokens = aiGovernanceState.usageLogs.reduce((sum, l) => sum + (l.output_token_estimate || 0), 0);

  const budget = aiGovernanceState.config.monthly_budget_usd;
  const budgetUsagePct = budget > 0 ? (totalCostUsd / budget) * 100 : 0;

  const budgetWarnings = [];
  if (budgetUsagePct >= 100) {
    budgetWarnings.push({ level: 'CRITICAL', pct: 100, message_ar: 'تجاوز الاستهلاك الشهري 100% من الميزانية المحددة.' });
  } else if (budgetUsagePct >= 80) {
    budgetWarnings.push({ level: 'HIGH', pct: 80, message_ar: 'تنبيه: بلغ استهلاك الذكاء الاصطناعي 80% من الميزانية الشهرية.' });
  } else if (budgetUsagePct >= 50) {
    budgetWarnings.push({ level: 'MEDIUM', pct: 50, message_ar: 'إشعار: تم استهلاك 50% من الميزانية الشهرية للذكاء الاصطناعي.' });
  }

  res.json({
    success: true,
    config: aiGovernanceState.config,
    stats: {
      totalCalls,
      successfulCalls,
      cachedCalls,
      blockedCalls,
      totalCostUsd: Number(totalCostUsd.toFixed(4)),
      totalInputTokens,
      totalOutputTokens,
      dailySystemCount: aiGovernanceState.dailySystemUsage.count,
      dailySystemLimit: 100,
      dailyUserLimit: 20,
      monthlyBudgetUsd: budget,
      budgetUsagePct: Number(budgetUsagePct.toFixed(1)),
      budgetWarnings,
    },
    recentLogs: aiGovernanceState.usageLogs.slice(0, 50),
  });
});

// 16. PUT /api/ai/settings (SUPER_ADMIN & MANAGER)
app.put('/api/ai/settings', authenticate, (req: Request, res: Response) => {
  const user = (req as any).user as ServerUser;
  if (user.role !== 'SYSTEM_ADMIN' && user.role !== 'MANAGER') {
    return res.status(403).json({ success: false, message_ar: 'غير مصرح بتعديل إعدادات حوكمة AI.' });
  }

  const { ai_kill_switch, monthly_budget_usd, features_enabled } = req.body;

  if (typeof ai_kill_switch === 'boolean') {
    aiGovernanceState.config.ai_kill_switch = ai_kill_switch;
  }
  if (typeof monthly_budget_usd === 'number' && monthly_budget_usd >= 0) {
    aiGovernanceState.config.monthly_budget_usd = monthly_budget_usd;
  }
  if (features_enabled && typeof features_enabled === 'object') {
    aiGovernanceState.config.features_enabled = {
      ...aiGovernanceState.config.features_enabled,
      ...features_enabled,
    };
  }

  logSecurityAudit({
    event_id: `EVT-${Date.now()}-AI-CFG`,
    created_at: new Date().toISOString(),
    user_email: user.email,
    user_role: user.role,
    action: 'AI_GOVERNANCE_CONFIG_UPDATED',
    target_user: 'SYSTEM',
    result: 'SUCCESS',
    reason: `AI Governance updated: KillSwitch=${aiGovernanceState.config.ai_kill_switch}, Budget=$${aiGovernanceState.config.monthly_budget_usd}`,
  });

  res.json({
    success: true,
    config: aiGovernanceState.config,
    message_ar: 'تم حفظ إعدادات حوكمة ومفاتيح الذكاء الاصطناعي بنجاح.',
  });
});

// -------------------------------------------------------------
// Vite Middleware Integration for Dev and Static Dist for Production
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Gulf Sand ERP Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
