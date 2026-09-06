/**
 * Browser Notification API Integration for Gulf Sand Typing ERP
 * Handles real-time system alerts for HR document renewals, booking confirmations, and audit logs.
 */

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'HR_RENEWAL' | 'BOOKING' | 'FINANCIAL' | 'INFO';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

class BrowserNotificationManager {
  private inAppNotifications: AppNotification[] = [];
  private listeners: Set<() => void> = new Set();
  private checkedEmployeesSet: Set<string> = new Set();

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  public async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const perm = await Notification.requestPermission();
      this.notifyListeners();
      return perm === 'granted';
    } catch (e) {
      console.warn('Error requesting notification permission:', e);
      return false;
    }
  }

  public sendNotification(
    title: string,
    body: string,
    type: 'HR_RENEWAL' | 'BOOKING' | 'FINANCIAL' | 'INFO' = 'INFO',
    iconUrl?: string
  ): boolean {
    const timestamp = new Date().toISOString();
    const id = `NOTIF-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    // Store in internal reactive list
    this.inAppNotifications.unshift({
      id,
      title,
      message: body,
      type,
      timestamp,
      read: false,
    });
    this.notifyListeners();

    // Trigger Native Browser Notification if granted
    if (this.isSupported() && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body,
          icon: iconUrl || '/favicon.ico',
          badge: '/favicon.ico',
          tag: id,
          silent: false,
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
        };
        return true;
      } catch (e) {
        console.warn('Native notification failed, stored as in-app notification:', e);
      }
    }
    return false;
  }

  // HR Document Expiration Radar Trigger
  public notifyDocumentRenewal(employeeName: string, docName: string, daysLeft: number) {
    const title = daysLeft < 0 
      ? `🚨 وثيقة منتهية الصلاحية: ${employeeName}`
      : `⚠️ تنبيه تجديد وثيقة: ${employeeName}`;
    const body = daysLeft < 0
      ? `انتهت صلاحية ${docName} للموظف ${employeeName} منذ ${Math.abs(daysLeft)} يوم. يرجى التجديد العاجل!`
      : `تنتهي صلاحية ${docName} للموظف ${employeeName} خلال ${daysLeft} يوم. يرجى البدء في إجراءات التجديد.`;

    this.sendNotification(title, body, 'HR_RENEWAL');
  }

  // New Booking Confirmation Trigger
  public notifyBookingConfirmed(
    bookingCode: string,
    customerName: string,
    serviceName: string,
    dateTime: string
  ) {
    const title = `📅 تم تأكيد حجز موعد جديد: ${bookingCode}`;
    const body = `العميل: ${customerName} | الخدمة: ${serviceName} | الموعد: ${dateTime}`;
    this.sendNotification(title, body, 'BOOKING');
  }

  // Financial & Audit Trigger
  public notifyAuditAction(action: string, entity: string, userName: string) {
    const title = `🛡️ سجل التدقيق: ${action}`;
    const body = `قام المستخدم ${userName} بإجراء [${action}] على [${entity}]`;
    this.sendNotification(title, body, 'FINANCIAL');
  }

  // Scan and detect approaching renewals
  public checkEmployeesDocumentRenewals(employees: any[]) {
    if (!employees || employees.length === 0) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    employees.forEach((emp) => {
      const joinYear = new Date(emp.join_date || '2024-01-01').getFullYear();
      const visaExpiry = new Date(`${joinYear + 2}-09-15`);
      const idExpiry = new Date(`${joinYear + 2}-08-20`);

      const daysDiff = (targetDate: Date) =>
        Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      const visaDays = daysDiff(visaExpiry);
      const idDays = daysDiff(idExpiry);

      const checkKey = `${emp.id}-check`;
      if (!this.checkedEmployeesSet.has(checkKey)) {
        if (visaDays <= 30) {
          this.notifyDocumentRenewal(emp.full_name_ar, 'تأشيرة الإقامة (Residence Visa)', visaDays);
        }
        if (idDays <= 30) {
          this.notifyDocumentRenewal(emp.full_name_ar, 'الهوية الإماراتية (Emirates ID)', idDays);
        }
        this.checkedEmployeesSet.add(checkKey);
      }
    });
  }

  public getNotifications(): AppNotification[] {
    return this.inAppNotifications;
  }

  public markAsRead(id: string) {
    this.inAppNotifications = this.inAppNotifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    this.notifyListeners();
  }

  public markAllAsRead() {
    this.inAppNotifications = this.inAppNotifications.map((n) => ({ ...n, read: true }));
    this.notifyListeners();
  }

  public clearAll() {
    this.inAppNotifications = [];
    this.notifyListeners();
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notifyListeners() {
    this.listeners.forEach((cb) => cb());
  }
}

export const browserNotificationService = new BrowserNotificationManager();
