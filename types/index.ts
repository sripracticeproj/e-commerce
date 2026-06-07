// Step 2: TypeScript Domain Layout

export interface Category {
  id: string;
  merchant_id: string;
  name: string;
  created_at: string;
}

export interface ThemeConfig {
  primary_color: string;
  secondary_color: string;
  font_family: string;
  border_radius: string;
  text_color?: string;
  font_size?: string;
  button_bg_color?: string;
  button_text_color?: string;
  header_bg_color?: string;
  card_bg_color?: string;
  theme_preset?: string;
}

export interface NavigationItem {
  label: string;
  link: string;
}

export type SectionType = 'hero' | 'product_grid';

export interface HeroSectionSettings {
  cta_text: string;
  cta_link: string;
  image_url: string;
}

export interface ProductGridSettings {
  limit: number;
  columns: number;
}

export interface StorefrontSection {
  id: string;
  type: SectionType;
  title: string;
  visible: boolean;
  settings: HeroSectionSettings | ProductGridSettings;
}

export interface StorefrontConfig {
  theme: ThemeConfig;
  navigation: NavigationItem[];
  sections: StorefrontSection[];
}

// Database Entity Interfaces
export interface Merchant {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface User {
  id: string;
  merchant_id: string;
  email: string;
  role: 'owner' | 'admin' | 'editor';
  created_at: string;
}

export interface MerchantAdminAccount {
  id: string;
  merchant_id: string;
  email: string;
  username: string;
  password?: string;
  role: 'owner' | 'admin' | 'editor';
  created_at: string;
}


export interface Product {
  id: string;
  merchant_id: string;
  name: string;
  description: string;
  price: number;
  mrp: number;
  selling_price: number;
  category_id?: string;
  image_url?: string;
  embedding?: number[]; // Vector embedding representation
  created_at: string;
}

export interface Customer {
  customer_id: string;
  name: string;
  email: string;
  phone: string;
  merchant_id: string;
  created_at: string;
}

export interface MerchantConfig {
  merchant_id: string;
  merchant_name: string;
  currency_code: 'INR' | 'USD' | 'EUR';
  order_id_format?: string;
  last_seq_no?: number;
  created_at: string;
}

export interface Order {
  order_id: string;
  customer_id?: string;
  merchant_id: string;
  order_total: number;
  order_status: 'pending' | 'paid' | 'fulfilled' | 'cancelled' | 'refunded';
  payment_gateway: 'stripe' | 'proxy_hook' | 'cod';
  metadata: Record<string, any>;
  created_at: string;
}

export interface PaymentGatewayConfig {
  id: string;
  merchant_id: string;
  gateway_type: 'stripe' | 'proxy_hook' | 'cod';
  credentials: Record<string, any>;
  active: boolean;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  merchant_id: string;
  event_type: 'view_item' | 'add_to_cart' | 'purchase_complete';
  session_id: string;
  properties: Record<string, any>;
  value?: number;
  created_at: string;
}

// Checkout & Payment Adapter Types
export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface CheckoutSession {
  sessionId: string;
  checkoutUrl?: string;
  clientSecret?: string; // For Stripe elements
  status: 'success' | 'redirect' | 'requires_action';
}

export interface WebhookResult {
  success: boolean;
  orderId?: string;
  eventProcessed: string;
  error?: string;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  amountRefunded: number;
  status: string;
}

// Core Adapter Contract
export interface ICartPaymentAdapter {
  initializeCheckout(
    cartItems: CartItem[],
    totalAmount: number,
    metadata: Record<string, any>
  ): Promise<CheckoutSession>;
  
  processWebhook(
    payload: any, 
    signature: string
  ): Promise<WebhookResult>;
  
  refundOrder(
    orderId: string, 
    amount: number
  ): Promise<RefundResult>;
}
