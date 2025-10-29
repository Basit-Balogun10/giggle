export interface PaystackWebhookEvent {
  event: string;
  data: Record<string, unknown>;
}

export type PaystackSignature = string;

export interface PaystackChargeData {
  reference: string;
  amount: number;
  status: string;
  metadata?: Record<string, unknown>;
}
