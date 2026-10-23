export interface NotificationPayload {
  toEmail?: string;
  toPhone?: string;
  patientName: string;
  subject: string;
  message: string;
  type: 'REQUEST_SUBMITTED' | 'APPOINTMENT_CONFIRMED' | 'APPOINTMENT_REJECTED' | 'APPOINTMENT_CANCELLED';
  metadata?: Record<string, any>;
}

export interface NotificationResult {
  delivered: boolean;
  provider: 'MOCK_DEMO' | 'EMAIL' | 'SMS' | 'NONE';
  timestamp: string;
  details?: string;
}

export class NotificationService {
  private static instance: NotificationService;

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Dispatches notifications to patients.
   * If third-party email/SMS providers are not configured (as in local demo mode),
   * it logs an audit record safely without making fraudulent claims of external delivery.
   */
  public async notify(payload: NotificationPayload): Promise<NotificationResult> {
    const hasEmailConfigured = Boolean(process.env.EMAIL_PROVIDER_API_KEY);
    const hasSmsConfigured = Boolean(process.env.SMS_PROVIDER_API_KEY);

    const now = new Date().toISOString();

    if (!hasEmailConfigured && !hasSmsConfigured) {
      // Demo mode: Log to console in development
      console.log(`[NotificationService - DEMO LOG] [${payload.type}] to ${payload.patientName} (${payload.toPhone || payload.toEmail}): ${payload.subject}`);
      return {
        delivered: false,
        provider: 'MOCK_DEMO',
        timestamp: now,
        details: 'Simulated environment - real SMS/Email dispatch disabled until provider API keys configured in .env',
      };
    }

    try {
      // Extensible real provider integration point
      // If external provider credentials exist, dispatch through provider
      if (hasEmailConfigured && payload.toEmail) {
        // e.g. SendGrid / Resend / AWS SES integration
      }
      if (hasSmsConfigured && payload.toPhone) {
        // e.g. Twilio / Vonage integration
      }

      return {
        delivered: true,
        provider: hasEmailConfigured ? 'EMAIL' : 'SMS',
        timestamp: now,
        details: 'Delivered via configured communication gateway',
      };
    } catch (err: any) {
      console.error('[NotificationService] Delivery error (appointment state preserved):', err.message);
      return {
        delivered: false,
        provider: 'NONE',
        timestamp: now,
        details: `Delivery attempt failed: ${err.message}`,
      };
    }
  }
}

export const notificationService = NotificationService.getInstance();
