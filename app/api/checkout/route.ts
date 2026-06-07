// Step 5: Gateway Routing API Route
import { NextResponse } from 'next/server';
import { mockDb } from '../../../lib/mock-db';
import { StripePaymentAdapter } from '../../../lib/payments/stripe-adapter';
import { ProxyHookPaymentAdapter } from '../../../lib/payments/proxy-adapter';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { merchantId, cartItems, totalAmount, sessionId, selectedGateway } = body;

    if (!merchantId || !cartItems || !totalAmount) {
      return NextResponse.json({ error: 'Missing required checkout fields' }, { status: 400 });
    }

    // 1. Resolve payment gateway configuration from the partition database
    // For local mock simulation, we query using mockDb
    const gateways = mockDb.getPaymentGateways(merchantId, merchantId);
    const activeGateway = selectedGateway 
      ? gateways.find(gw => gw.active && gw.gateway_type === selectedGateway)
      : gateways.find(gw => gw.active);

    if (!activeGateway) {
      return NextResponse.json({ error: 'No active payment gateway configured for this merchant.' }, { status: 400 });
    }

    // 2. Dynamically resolve and activate the corresponding adapter
    if (activeGateway.gateway_type === 'stripe') {
      const publicKey = activeGateway.credentials.publicKey || 'pk_test_default';
      const stripeAdapter = new StripePaymentAdapter(merchantId, publicKey);
      
      const session = await stripeAdapter.initializeCheckout(cartItems, totalAmount, { sessionId });
      return NextResponse.json({ success: true, session });
    } 
    
    if (activeGateway.gateway_type === 'proxy_hook') {
      const webhookUrl = activeGateway.credentials.webhookUrl;
      const secret = activeGateway.credentials.secret || '';
      
      if (!webhookUrl) {
        return NextResponse.json({ error: 'Proxy Hook Webhook URL is unconfigured.' }, { status: 400 });
      }

      const proxyAdapter = new ProxyHookPaymentAdapter(merchantId, webhookUrl, secret);
      const session = await proxyAdapter.initializeCheckout(cartItems, totalAmount, { sessionId });
      return NextResponse.json({ success: true, session });
    }

    return NextResponse.json({ error: 'Unsupported gateway type' }, { status: 400 });
  } catch (error: any) {
    console.error('[CheckoutAPI] Error routing transaction:', error);
    return NextResponse.json({ error: error.message || 'Internal checkout routing error' }, { status: 500 });
  }
}
