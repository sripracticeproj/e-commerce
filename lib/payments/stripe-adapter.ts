// Step 5: Stripe Adapter Implementation
import { ICartPaymentAdapter, CartItem, CheckoutSession, WebhookResult, RefundResult } from '../../types';
import { mockDb } from '../mock-db';

export class StripePaymentAdapter implements ICartPaymentAdapter {
  private publicKey: string;
  private merchantId: string;

  constructor(merchantId: string, publicKey: string) {
    this.merchantId = merchantId;
    this.publicKey = publicKey;
  }

  async initializeCheckout(
    cartItems: CartItem[],
    totalAmount: number,
    metadata: Record<string, any>
  ): Promise<CheckoutSession> {
    console.log(`[StripePaymentAdapter] Initializing checkout with Stripe Key: ${this.publicKey}`);
    
    // Simulate API request to Stripe
    const sessionId = `cs_test_${Math.random().toString(36).substr(2, 9)}`;
    const clientSecret = `seti_test_secret_${Math.random().toString(36).substr(2, 15)}`;

    // Create pending order record in database (isolated per merchant)
    mockDb.createOrder(this.merchantId, totalAmount, 'stripe', {
      items: cartItems,
      stripeSessionId: sessionId,
      sessionId: metadata.sessionId,
      status: 'pending'
    });

    return {
      sessionId,
      clientSecret,
      status: 'requires_action'
    };
  }

  async processWebhook(payload: any, signature: string): Promise<WebhookResult> {
    console.log('[StripePaymentAdapter] Processing webhook event...', payload);
    
    // In Stripe Elements demo, we simulate a checkout.session.completed event
    if (payload.type === 'checkout.session.completed') {
      const sessionId = payload.data.object.id;
      
      // Update order status in db
      return {
        success: true,
        orderId: `ord_stripe_${sessionId}`,
        eventProcessed: 'checkout.session.completed'
      };
    }

    return {
      success: false,
      eventProcessed: payload.type,
      error: 'Unhandled Stripe event type'
    };
  }

  async refundOrder(orderId: string, amount: number): Promise<RefundResult> {
    console.log(`[StripePaymentAdapter] Issuing refund for order ${orderId} of amount $${amount}`);
    
    // Call mockDb to set order as refunded
    const res = mockDb.refundOrder(this.merchantId, this.merchantId, orderId, amount);
    
    return {
      success: true,
      refundId: res.refundId,
      amountRefunded: res.amountRefunded,
      status: 'succeeded'
    };
  }
}
