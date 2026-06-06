// Step 5: Proxy Hook Adapter Implementation
import { ICartPaymentAdapter, CartItem, CheckoutSession, WebhookResult, RefundResult } from '../../types';
import { mockDb } from '../mock-db';

export class ProxyHookPaymentAdapter implements ICartPaymentAdapter {
  private webhookUrl: string;
  private secret: string;
  private merchantId: string;

  constructor(merchantId: string, webhookUrl: string, secret: string) {
    this.merchantId = merchantId;
    this.webhookUrl = webhookUrl;
    this.secret = secret;
  }

  async initializeCheckout(
    cartItems: CartItem[],
    totalAmount: number,
    metadata: Record<string, any>
  ): Promise<CheckoutSession> {
    console.log(`[ProxyHookPaymentAdapter] Relaying checkout payload to third-party endpoint: ${this.webhookUrl}`);
    
    // Simulate computing HMAC signature of payload
    const payloadString = JSON.stringify({ cartItems, totalAmount, metadata });
    // In real app: crypto.createHmac('sha256', this.secret).update(payloadString).digest('hex')
    const mockSignature = `sha256=mock_hmac_${Math.random().toString(36).substr(2, 10)}`;

    console.log(`[ProxyHookPaymentAdapter] Webhook payload signed with Signature: ${mockSignature}`);

    // Create a pending order in mock database
    const orderId = `ord_proxy_${Math.random().toString(36).substr(2, 9)}`;
    mockDb.createOrder(this.merchantId, totalAmount, 'proxy_hook', {
      items: cartItems,
      proxyOrderId: orderId,
      sessionId: metadata.sessionId,
      status: 'pending'
    });

    // Simulate sending POST request to external system
    // For demo, we return a mock external redirect checkout URL
    return {
      sessionId: orderId,
      checkoutUrl: `https://external-checkout.medusajs.com/pay?session_id=${orderId}&sig=${mockSignature}`,
      status: 'redirect'
    };
  }

  async processWebhook(payload: any, signature: string): Promise<WebhookResult> {
    console.log(`[ProxyHookPaymentAdapter] Verifying external signature: ${signature}`);
    
    // In a real app we'd verify HMAC signature matches computed signature using this.secret
    const orderId = payload.orderId;
    
    if (signature.startsWith('sha255=') || signature.includes('mock_hmac')) {
      return {
        success: true,
        orderId,
        eventProcessed: 'payment.captured'
      };
    }

    return {
      success: false,
      eventProcessed: 'payment.captured',
      error: 'Invalid signature verification failed'
    };
  }

  async refundOrder(orderId: string, amount: number): Promise<RefundResult> {
    console.log(`[ProxyHookPaymentAdapter] Relaying refund request to ${this.webhookUrl} for order ${orderId}`);
    
    // Process local refund state
    const res = mockDb.refundOrder(this.merchantId, this.merchantId, orderId, amount);

    return {
      success: true,
      refundId: `ref_proxy_${res.refundId}`,
      amountRefunded: res.amountRefunded,
      status: 'external_refund_initiated'
    };
  }
}
