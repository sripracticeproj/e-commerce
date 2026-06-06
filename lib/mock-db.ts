// Step 3: Local Mock Database & RLS Simulation
import { 
  Merchant, 
  Product, 
  StorefrontConfig, 
  Order, 
  PaymentGatewayConfig, 
  AnalyticsEvent,
  CartItem,
  Category,
  Customer,
  MerchantConfig
} from '../types';

// Pre-defined mockup data
const DEFAULT_MERCHANTS: Merchant[] = [
  {
    id: 'm1-solara-wellness',
    name: 'Solara Organic Botanicals',
    slug: 'solara',
    created_at: new Date('2026-01-10').toISOString()
  },
  {
    id: 'm2-aether-tech',
    name: 'Aether Minimalist Tech',
    slug: 'aether',
    created_at: new Date('2026-02-15').toISOString()
  }
];

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-solara-1', merchant_id: 'm1-solara-wellness', name: 'Apothecary', created_at: new Date('2026-01-10').toISOString() },
  { id: 'cat-solara-2', merchant_id: 'm1-solara-wellness', name: 'Wellness Rituals', created_at: new Date('2026-01-10').toISOString() },
  { id: 'cat-aether-1', merchant_id: 'm2-aether-tech', name: 'Hardware', created_at: new Date('2026-02-15').toISOString() },
  { id: 'cat-aether-2', merchant_id: 'm2-aether-tech', name: 'Desk Accessories', created_at: new Date('2026-02-15').toISOString() }
];

const DEFAULT_PRODUCTS: Product[] = [
  // Solara Botanicals
  {
    id: 'p-solara-1',
    merchant_id: 'm1-solara-wellness',
    category_id: 'cat-solara-1',
    name: 'Lavender Sleep Mist',
    description: 'Calming aromatherapeutic sleep spray formulated with organic lavender and chamomile oils to promote deep, restful relaxation.',
    price: 24.00,
    mrp: 30.00,
    selling_price: 24.00,
    image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80',
    created_at: new Date('2026-01-11').toISOString()
  },
  {
    id: 'p-solara-2',
    merchant_id: 'm1-solara-wellness',
    category_id: 'cat-solara-1',
    name: 'Rosewater Refresh Tonic',
    description: 'Hydrating floral facial mist distilled from organic Damask rose petals to balance pH and revive dull skin instantly.',
    price: 18.00,
    mrp: 22.00,
    selling_price: 18.00,
    image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
    created_at: new Date('2026-01-12').toISOString()
  },
  {
    id: 'p-solara-3',
    merchant_id: 'm1-solara-wellness',
    category_id: 'cat-solara-1',
    name: 'Eucalyptus Cleansing Oil',
    description: 'Detoxifying facial cleansing oil that lifts makeup and impurities while refreshing the senses with clean eucalyptus essence.',
    price: 28.00,
    mrp: 35.00,
    selling_price: 28.00,
    image_url: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?auto=format&fit=crop&w=600&q=80',
    created_at: new Date('2026-01-13').toISOString()
  },
  {
    id: 'p-solara-4',
    merchant_id: 'm1-solara-wellness',
    category_id: 'cat-solara-1',
    name: 'Matcha Glow Clay Mask',
    description: 'Clarifying green tea clay mask packed with antioxidants to gently exfoliate, brighten skin tone, and minimize pores.',
    price: 32.00,
    mrp: 40.00,
    selling_price: 32.00,
    image_url: 'https://images.unsplash.com/photo-1567894192231-d22d9c12214d?auto=format&fit=crop&w=600&q=80',
    created_at: new Date('2026-01-14').toISOString()
  },
  {
    id: 'p-solara-5',
    merchant_id: 'm1-solara-wellness',
    category_id: 'cat-solara-2',
    name: 'Jasmine Whipped Body Butter',
    description: 'Deeply nourishing body butter whipped with shea butter and jojoba oil, scented with exotic night-blooming jasmine flowers.',
    price: 36.00,
    mrp: 45.00,
    selling_price: 36.00,
    image_url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80',
    created_at: new Date('2026-01-15').toISOString()
  },

  // Aether Tech
  {
    id: 'p-aether-1',
    merchant_id: 'm2-aether-tech',
    category_id: 'cat-aether-2',
    name: 'Slate Leather Sleeve',
    description: 'Sleek, hand-stitched full-grain leather laptop sleeve designed specifically for MacBook Pro 14" & 16". Microfiber lining keeps it scratch-free.',
    price: 89.00,
    mrp: 110.00,
    selling_price: 89.00,
    image_url: 'https://images.unsplash.com/photo-1512909006721-3d6018887383?auto=format&fit=crop&w=600&q=80',
    created_at: new Date('2026-02-16').toISOString()
  },
  {
    id: 'p-aether-2',
    merchant_id: 'm2-aether-tech',
    category_id: 'cat-aether-1',
    name: 'Orbit MagSafe Charging Stand',
    description: 'Anodized aerospace-grade aluminum wireless charging stand. Holds iPhone securely in landscape or portrait orientation.',
    price: 59.00,
    mrp: 75.00,
    selling_price: 59.00,
    image_url: 'https://images.unsplash.com/photo-1616440347437-b1c73416efc2?auto=format&fit=crop&w=600&q=80',
    created_at: new Date('2026-02-17').toISOString()
  },
  {
    id: 'p-aether-3',
    merchant_id: 'm2-aether-tech',
    category_id: 'cat-aether-2',
    name: 'Transit Tech Pouch',
    description: 'Water-resistant cord organizer pouch made of Cordura nylon. Designed with elastic loops, zip pockets, and dual pen compartments.',
    price: 45.00,
    mrp: 55.00,
    selling_price: 45.00,
    image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    created_at: new Date('2026-02-18').toISOString()
  },
  {
    id: 'p-aether-4',
    merchant_id: 'm2-aether-tech',
    category_id: 'cat-aether-1',
    name: 'Nova Mechanical Keyboard',
    description: 'Ultra-slim 65% layout wireless mechanical keyboard with quiet linear switches, aluminum frame, and customizable white backlighting.',
    price: 149.00,
    mrp: 179.00,
    selling_price: 149.00,
    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    created_at: new Date('2026-02-19').toISOString()
  },
  {
    id: 'p-aether-5',
    merchant_id: 'm2-aether-tech',
    category_id: 'cat-aether-2',
    name: 'Merino Wool Desk Pad',
    description: 'Premium desk mat crafted from water-repellent merino wool felt. Cushions keyboard clicks and guides mouse movements smoothly.',
    price: 65.00,
    mrp: 80.00,
    selling_price: 65.00,
    image_url: 'https://images.unsplash.com/photo-1632292224971-0d45778bd364?auto=format&fit=crop&w=600&q=80',
    created_at: new Date('2026-02-20').toISOString()
  }
];

const DEFAULT_STOREFRONT_CONFIGS: Record<string, StorefrontConfig> = {
  'm1-solara-wellness': {
    theme: {
      primary_color: '#0D9488', // Teal
      secondary_color: '#F0FDFA', // Light teal background
      font_family: 'Playfair Display',
      border_radius: '1rem'
    },
    navigation: [
      { label: 'Home', link: '/' },
      { label: 'Shop Apothecary', link: '/shop' },
      { label: 'Wellness Rituals', link: '/rituals' }
    ],
    sections: [
      {
        id: 'hero-solara',
        type: 'hero',
        title: 'Cultivate Outer Glow & Inner Peace',
        visible: true,
        settings: {
          cta_text: 'Discover Organic Beauty',
          cta_link: '/shop',
          image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'
        }
      },
      {
        id: 'grid-solara',
        type: 'product_grid',
        title: 'Apothecary Collection',
        visible: true,
        settings: {
          limit: 8,
          columns: 3
        }
      }
    ]
  },
  'm2-aether-tech': {
    theme: {
      primary_color: '#18181B', // Slate Zinc
      secondary_color: '#FAFAFA', // Off-white
      font_family: 'Inter',
      border_radius: '0.25rem'
    },
    navigation: [
      { label: 'Home', link: '/' },
      { label: 'Shop Hardware', link: '/shop' },
      { label: 'Aether Project', link: '/about' }
    ],
    sections: [
      {
        id: 'hero-aether',
        type: 'hero',
        title: 'Refining Daily Tech Essentials',
        visible: true,
        settings: {
          cta_text: 'Explore Workspace Upgrades',
          cta_link: '/shop',
          image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80'
        }
      },
      {
        id: 'grid-aether',
        type: 'product_grid',
        title: 'Engineered Gear',
        visible: true,
        settings: {
          limit: 8,
          columns: 4
        }
      }
    ]
  }
};

const DEFAULT_GATEWAYS: PaymentGatewayConfig[] = [
  {
    id: 'gw-solara-1',
    merchant_id: 'm1-solara-wellness',
    gateway_type: 'stripe',
    credentials: { publicKey: 'pk_test_solara', active: true },
    active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'gw-aether-1',
    merchant_id: 'm2-aether-tech',
    gateway_type: 'proxy_hook',
    credentials: { webhookUrl: 'https://api.aethertech.com/v1/webhook', secret: 'aether_secret_key' },
    active: true,
    created_at: new Date().toISOString()
  }
];

const DEFAULT_CUSTOMERS: Customer[] = [
  { customer_id: 'cust-1', name: 'John Doe', email: 'john@example.com', phone: '+1234567890', merchant_id: 'm1-solara-wellness', created_at: new Date(Date.now() - 3600000 * 24 * 10).toISOString() },
  { customer_id: 'cust-2', name: 'Jane Smith', email: 'jane@example.com', phone: '+1987654321', merchant_id: 'm1-solara-wellness', created_at: new Date(Date.now() - 3600000 * 24 * 8).toISOString() },
  { customer_id: 'cust-3', name: 'Bob Johnson', email: 'bob@example.com', phone: '+1555666777', merchant_id: 'm2-aether-tech', created_at: new Date(Date.now() - 3600000 * 24 * 9).toISOString() }
];

const DEFAULT_MERCHANT_CONFIGS: MerchantConfig[] = [
  { merchant_id: 'm1-solara-wellness', merchant_name: 'Solara Organic Botanicals', currency_code: 'USD', created_at: new Date('2026-01-10').toISOString() },
  { merchant_id: 'm2-aether-tech', merchant_name: 'Aether Minimalist Tech', currency_code: 'USD', created_at: new Date('2026-02-15').toISOString() }
];

const DEFAULT_ORDERS: Order[] = [
  {
    order_id: 'ord-1',
    customer_id: 'cust-1',
    merchant_id: 'm1-solara-wellness',
    order_total: 42.00,
    order_status: 'paid',
    payment_gateway: 'stripe',
    metadata: { items: [{ name: 'Rosewater Refresh Tonic', qty: 1 }, { name: 'Lavender Sleep Mist', qty: 1 }] },
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString() // 3 days ago
  },
  {
    order_id: 'ord-2',
    customer_id: 'cust-2',
    merchant_id: 'm1-solara-wellness',
    order_total: 72.00,
    order_status: 'paid',
    payment_gateway: 'stripe',
    metadata: { items: [{ name: 'Matcha Glow Clay Mask', qty: 1 }, { name: 'Jasmine Whipped Body Butter', qty: 1 }] },
    created_at: new Date(Date.now() - 3600000 * 24 * 1.5).toISOString() // 1.5 days ago
  },
  {
    order_id: 'ord-3',
    customer_id: 'cust-1',
    merchant_id: 'm1-solara-wellness',
    order_total: 24.00,
    order_status: 'pending',
    payment_gateway: 'stripe',
    metadata: { items: [{ name: 'Lavender Sleep Mist', qty: 1 }] },
    created_at: new Date(Date.now() - 3600000 * 4).toISOString() // 4 hours ago
  },
  {
    order_id: 'ord-4',
    customer_id: 'cust-3',
    merchant_id: 'm2-aether-tech',
    order_total: 148.00,
    order_status: 'paid',
    payment_gateway: 'proxy_hook',
    metadata: { items: [{ name: 'Slate Leather Sleeve', qty: 1 }, { name: 'Orbit MagSafe Charging Stand', qty: 1 }] },
    created_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString() // 4 days ago
  },
  {
    order_id: 'ord-5',
    customer_id: 'cust-3',
    merchant_id: 'm2-aether-tech',
    order_total: 149.00,
    order_status: 'paid',
    payment_gateway: 'proxy_hook',
    metadata: { items: [{ name: 'Nova Mechanical Keyboard', qty: 1 }] },
    created_at: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
  }
];

const DEFAULT_ANALYTICS: AnalyticsEvent[] = [
  // Solara Botanicals
  { id: 'ae-s-1', merchant_id: 'm1-solara-wellness', event_type: 'view_item', session_id: 'sess-s1', properties: { productId: 'p-solara-1' }, created_at: new Date(Date.now() - 3600000 * 12).toISOString() },
  { id: 'ae-s-2', merchant_id: 'm1-solara-wellness', event_type: 'view_item', session_id: 'sess-s1', properties: { productId: 'p-solara-2' }, created_at: new Date(Date.now() - 3600000 * 11).toISOString() },
  { id: 'ae-s-3', merchant_id: 'm1-solara-wellness', event_type: 'add_to_cart', session_id: 'sess-s1', properties: { productId: 'p-solara-1' }, created_at: new Date(Date.now() - 3600000 * 10).toISOString() },
  { id: 'ae-s-4', merchant_id: 'm1-solara-wellness', event_type: 'purchase_complete', session_id: 'sess-s1', properties: { orderId: 'ord-1', amount: 42.00 }, value: 42.00, created_at: new Date(Date.now() - 3600000 * 9).toISOString() },
  { id: 'ae-s-5', merchant_id: 'm1-solara-wellness', event_type: 'view_item', session_id: 'sess-s2', properties: { productId: 'p-solara-4' }, created_at: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: 'ae-s-6', merchant_id: 'm1-solara-wellness', event_type: 'add_to_cart', session_id: 'sess-s2', properties: { productId: 'p-solara-4' }, created_at: new Date(Date.now() - 3600000 * 4.8).toISOString() },
  { id: 'ae-s-7', merchant_id: 'm1-solara-wellness', event_type: 'purchase_complete', session_id: 'sess-s2', properties: { orderId: 'ord-2', amount: 72.00 }, value: 72.00, created_at: new Date(Date.now() - 3600000 * 4.5).toISOString() },
  { id: 'ae-s-8', merchant_id: 'm1-solara-wellness', event_type: 'view_item', session_id: 'sess-s3', properties: { productId: 'p-solara-3' }, created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  
  // Aether Tech
  { id: 'ae-ae-1', merchant_id: 'm2-aether-tech', event_type: 'view_item', session_id: 'sess-ae1', properties: { productId: 'p-aether-1' }, created_at: new Date(Date.now() - 3600000 * 36).toISOString() },
  { id: 'ae-ae-2', merchant_id: 'm2-aether-tech', event_type: 'add_to_cart', session_id: 'sess-ae1', properties: { productId: 'p-aether-1' }, created_at: new Date(Date.now() - 3600000 * 35).toISOString() },
  { id: 'ae-ae-3', merchant_id: 'm2-aether-tech', event_type: 'purchase_complete', session_id: 'sess-ae1', properties: { orderId: 'ord-4', amount: 148.00 }, value: 148.00, created_at: new Date(Date.now() - 3600000 * 34).toISOString() },
  { id: 'ae-ae-4', merchant_id: 'm2-aether-tech', event_type: 'view_item', session_id: 'sess-ae2', properties: { productId: 'p-aether-4' }, created_at: new Date(Date.now() - 3600000 * 10).toISOString() },
  { id: 'ae-ae-5', merchant_id: 'm2-aether-tech', event_type: 'add_to_cart', session_id: 'sess-ae2', properties: { productId: 'p-aether-4' }, created_at: new Date(Date.now() - 3600000 * 9).toISOString() },
  { id: 'ae-ae-6', merchant_id: 'm2-aether-tech', event_type: 'purchase_complete', session_id: 'sess-ae2', properties: { orderId: 'ord-5', amount: 149.00 }, value: 149.00, created_at: new Date(Date.now() - 3600000 * 8).toISOString() },
  { id: 'ae-ae-7', merchant_id: 'm2-aether-tech', event_type: 'view_item', session_id: 'sess-ae3', properties: { productId: 'p-aether-5' }, created_at: new Date(Date.now() - 3600000 * 1).toISOString() }
];

// Simple Pub-Sub Event Emitter for Supabase Realtime simulation
class MockRealtimeChannel {
  private listeners: Record<string, ((data: any) => void)[]> = {};

  subscribe(channelName: string, callback: (data: any) => void) {
    if (!this.listeners[channelName]) {
      this.listeners[channelName] = [];
    }
    this.listeners[channelName].push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners[channelName] = this.listeners[channelName].filter(cb => cb !== callback);
    };
  }

  broadcast(channelName: string, data: any) {
    const callbacks = this.listeners[channelName] || [];
    callbacks.forEach(cb => cb(data));
  }
}

export const realtimeEngine = new MockRealtimeChannel();

// In-Memory Database Storage with LocalStorage persistence for browser context
class MockDatabase {
  private merchants: Merchant[] = [];
  private categories: Category[] = [];
  private products: Product[] = [];
  private storefrontConfigs: Record<string, StorefrontConfig> = {};
  private orders: Order[] = [];
  private gateways: PaymentGatewayConfig[] = [];
  private analyticsEvents: AnalyticsEvent[] = [];
  private customers: Customer[] = [];
  private merchantConfigs: MerchantConfig[] = [];
  private initialized = false;

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('ai_commerce_mock_db');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          this.merchants = parsed.merchants;
          this.categories = parsed.categories || [];
          this.products = parsed.products;
          this.storefrontConfigs = parsed.storefrontConfigs;
          this.orders = parsed.orders;
          this.gateways = parsed.gateways;
          this.analyticsEvents = parsed.analyticsEvents;
          this.customers = parsed.customers || [];
          this.merchantConfigs = parsed.merchantConfigs || [];
          this.initialized = true;
          return;
        } catch (e) {
          console.error("Failed parsing localStorage mock DB. Reinitializing defaults.", e);
        }
      }
    }
    this.merchants = [...DEFAULT_MERCHANTS];
    this.categories = [...DEFAULT_CATEGORIES];
    this.products = [...DEFAULT_PRODUCTS];
    this.storefrontConfigs = JSON.parse(JSON.stringify(DEFAULT_STOREFRONT_CONFIGS));
    this.orders = [...DEFAULT_ORDERS];
    this.gateways = [...DEFAULT_GATEWAYS];
    this.analyticsEvents = [...DEFAULT_ANALYTICS];
    this.customers = [...DEFAULT_CUSTOMERS];
    this.merchantConfigs = [...DEFAULT_MERCHANT_CONFIGS];
    this.initialized = true;
    this.save();
  }

  private save() {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('ai_commerce_mock_db', JSON.stringify({
        merchants: this.merchants,
        categories: this.categories,
        products: this.products,
        storefrontConfigs: this.storefrontConfigs,
        orders: this.orders,
        gateways: this.gateways,
        analyticsEvents: this.analyticsEvents,
        customers: this.customers,
        merchantConfigs: this.merchantConfigs
      }));
    }
  }

  // Row-Level Security Enforcing Helpers
  private assertRLS(userId: string | null, targetMerchantId: string) {
    if (!userId) {
      throw new Error("RLS Violation: Session is unauthenticated. Cannot access tenant resource.");
    }
    // Simulate user-merchant matching (by default in our mock we map user to the merchant)
    // For convenience, we assume an active user is authorized for their merchant_id
    if (userId !== targetMerchantId) {
      throw new Error(`RLS Violation: Authenticated user (id: ${userId}) cannot mutate resource belonging to merchant (id: ${targetMerchantId}).`);
    }
  }

  // PUBLIC DB METHODS

  // Resolves merchant details
  getMerchantById(id: string) {
    return this.merchants.find(m => m.id === id) || null;
  }

  getMerchantBySlug(slug: string) {
    return this.merchants.find(m => m.slug.toLowerCase() === slug.toLowerCase()) || null;
  }

  getMerchants() {
    return this.merchants;
  }

  // Resolves storefront configurations (Public read, RLS write)
  getStorefrontConfig(merchantId: string) {
    return this.storefrontConfigs[merchantId] || null;
  }

  updateStorefrontConfig(authMerchantId: string, merchantId: string, updatedConfig: StorefrontConfig) {
    this.assertRLS(authMerchantId, merchantId);
    this.storefrontConfigs[merchantId] = updatedConfig;
    this.save();
    
    // Broadcast the realtime state update to storefronts
    realtimeEngine.broadcast(`realtime:storefront_config:${merchantId}`, {
      merchantId,
      config: updatedConfig,
      timestamp: new Date().toISOString()
    });
  }

  // Resolves Categories (Public read, RLS write)
  getCategories(merchantId: string) {
    return this.categories.filter(c => c.merchant_id === merchantId);
  }

  addCategory(authMerchantId: string, merchantId: string, name: string) {
    this.assertRLS(authMerchantId, merchantId);
    const newCategory: Category = {
      id: `cat-${Math.random().toString(36).substr(2, 9)}`,
      merchant_id: merchantId,
      name,
      created_at: new Date().toISOString()
    };
    this.categories.push(newCategory);
    this.save();
    return newCategory;
  }

  // Resolves catalog (Public read, RLS write)
  getProducts(merchantId: string) {
    return this.products.filter(p => p.merchant_id === merchantId);
  }

  addProduct(authMerchantId: string, productData: Omit<Product, 'id' | 'created_at'>) {
    this.assertRLS(authMerchantId, productData.merchant_id);

    // Schema validations
    if (productData.mrp <= 0) {
      throw new Error("MRP must be greater than 0");
    }
    if (productData.selling_price <= 0) {
      throw new Error("Selling price must be greater than 0");
    }
    if (productData.selling_price > productData.mrp) {
      throw new Error("Selling price must be less than or equal to MRP");
    }

    const newProduct: Product = {
      ...productData,
      price: productData.selling_price, // map price to selling_price for backward compatibility
      id: `p-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString()
    };
    this.products.push(newProduct);
    this.save();
    return newProduct;
  }

  deleteProduct(authMerchantId: string, merchantId: string, productId: string) {
    this.assertRLS(authMerchantId, merchantId);
    this.products = this.products.filter(p => !(p.id === productId && p.merchant_id === merchantId));
    this.save();
    return true;
  }

  // Resolves payment gateways configurations (RLS read and write)
  getPaymentGateways(authMerchantId: string, merchantId: string) {
    this.assertRLS(authMerchantId, merchantId);
    return this.gateways.filter(gw => gw.merchant_id === merchantId);
  }

  updatePaymentGateway(authMerchantId: string, merchantId: string, gatewayType: 'stripe' | 'proxy_hook', credentials: Record<string, any>, active: boolean) {
    this.assertRLS(authMerchantId, merchantId);
    const existing = this.gateways.find(gw => gw.merchant_id === merchantId && gw.gateway_type === gatewayType);
    if (existing) {
      existing.credentials = credentials;
      existing.active = active;
    } else {
      this.gateways.push({
        id: `gw-${Math.random().toString(36).substr(2, 9)}`,
        merchant_id: merchantId,
        gateway_type: gatewayType,
        credentials,
        active,
        created_at: new Date().toISOString()
      });
    }
    this.save();
    return true;
  }

  // Resolves analytics (RLS read, public insert)
  getAnalyticsEvents(authMerchantId: string, merchantId: string) {
    this.assertRLS(authMerchantId, merchantId);
    return this.analyticsEvents.filter(ae => ae.merchant_id === merchantId);
  }

  recordAnalyticsEvent(merchantId: string, eventType: 'view_item' | 'add_to_cart' | 'purchase_complete', sessionId: string, properties: Record<string, any>, value?: number) {
    const newEvent: AnalyticsEvent = {
      id: `ae-${Math.random().toString(36).substr(2, 9)}`,
      merchant_id: merchantId,
      event_type: eventType,
      session_id: sessionId,
      properties,
      value,
      created_at: new Date().toISOString()
    };
    this.analyticsEvents.push(newEvent);
    this.save();
    return newEvent;
  }

  // Resolves checkout and orders (RLS read, public insert)
  getOrders(authMerchantId: string, merchantId: string) {
    this.assertRLS(authMerchantId, merchantId);
    return this.orders.filter(o => o.merchant_id === merchantId);
  }

  createOrder(merchantId: string, totalAmount: number, gateway: 'stripe' | 'proxy_hook', metadata: Record<string, any>) {
    // Generate or fetch a mock customer for the transaction to populate order history cleanly
    let customerId = metadata.customerId;
    if (!customerId) {
      const email = metadata.customerEmail || `customer_${Math.random().toString(36).substr(2, 5)}@example.com`;
      let customer = this.customers.find(c => c.email === email && c.merchant_id === merchantId);
      if (!customer) {
        customer = {
          customer_id: `cust-${Math.random().toString(36).substr(2, 9)}`,
          name: metadata.customerName || 'Guest Buyer',
          email,
          phone: metadata.customerPhone || '+1 (555) 019-2834',
          merchant_id: merchantId,
          created_at: new Date().toISOString()
        };
        this.customers.push(customer);
      }
      customerId = customer.customer_id;
    }

    const newOrder: Order = {
      order_id: `ord-${Math.random().toString(36).substr(2, 9)}`,
      customer_id: customerId,
      merchant_id: merchantId,
      order_total: totalAmount,
      order_status: gateway === 'stripe' ? 'paid' : 'pending', // stripe succeeds immediately in demo
      payment_gateway: gateway,
      metadata,
      created_at: new Date().toISOString()
    };
    this.orders.push(newOrder);
    this.save();

    // Log corresponding analytics event
    this.recordAnalyticsEvent(merchantId, 'purchase_complete', metadata.sessionId || 'sess-checkout', {
      orderId: newOrder.order_id,
      amount: totalAmount,
      items: metadata.items
    }, totalAmount);

    return newOrder;
  }

  refundOrder(authMerchantId: string, merchantId: string, orderId: string, amount: number) {
    this.assertRLS(authMerchantId, merchantId);
    const order = this.orders.find(o => o.order_id === orderId && o.merchant_id === merchantId);
    if (!order) throw new Error("Order not found");
    order.order_status = 'refunded';
    order.metadata.refunded_amount = amount;
    this.save();
    return {
      success: true,
      refundId: `ref-${Math.random().toString(36).substr(2, 9)}`,
      amountRefunded: amount,
      status: 'succeeded'
    };
  }

  // Resolves Customers (RLS read)
  getCustomers(authMerchantId: string, merchantId: string) {
    this.assertRLS(authMerchantId, merchantId);
    return this.customers.filter(c => c.merchant_id === merchantId);
  }

  addCustomer(authMerchantId: string, merchantId: string, name: string, email: string, phone: string) {
    this.assertRLS(authMerchantId, merchantId);
    const newCustomer: Customer = {
      customer_id: `cust-${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      phone,
      merchant_id: merchantId,
      created_at: new Date().toISOString()
    };
    this.customers.push(newCustomer);
    this.save();
    return newCustomer;
  }

  // Resolves Merchant Configurations
  getMerchantConfig(merchantId: string) {
    return this.merchantConfigs.find(c => c.merchant_id === merchantId) || null;
  }

  getMerchantConfigs() {
    return this.merchantConfigs;
  }

  updateMerchantConfig(authMerchantId: string, merchantId: string, name: string, currencyCode: 'INR' | 'USD' | 'EUR') {
    // RLS: Only merchant context or Super User can alter config
    this.assertRLS(authMerchantId, merchantId);
    
    // Also update merchant name in merchants table for consistency
    const merchant = this.merchants.find(m => m.id === merchantId);
    if (merchant) {
      merchant.name = name;
    }

    let config = this.merchantConfigs.find(c => c.merchant_id === merchantId);
    if (config) {
      config.merchant_name = name;
      config.currency_code = currencyCode;
    } else {
      config = {
        merchant_id: merchantId,
        merchant_name: name,
        currency_code: currencyCode,
        created_at: new Date().toISOString()
      };
      this.merchantConfigs.push(config);
    }
    this.save();
    return config;
  }

  // Calculated Dashboard metrics (isolated per tenant via RLS)
  getDashboardMetrics(authMerchantId: string, merchantId: string) {
    this.assertRLS(authMerchantId, merchantId);

    const tenantOrders = this.orders.filter(o => o.merchant_id === merchantId && o.order_status === 'paid');
    const tenantEvents = this.analyticsEvents.filter(e => e.merchant_id === merchantId);

    // Total Revenue
    const totalRevenue = tenantOrders.reduce((sum, o) => sum + Number(o.order_total), 0);

    // Total Sessions
    const uniqueSessions = new Set(tenantEvents.map(e => e.session_id)).size || 1;

    // Completed purchases
    const purchasesCount = tenantEvents.filter(e => e.event_type === 'purchase_complete').length;

    // Conversion Rate
    const conversionRate = uniqueSessions > 0 ? (purchasesCount / uniqueSessions) * 100 : 0;

    // Average Order Value
    const averageOrderValue = tenantOrders.length > 0 ? totalRevenue / tenantOrders.length : 0;

    // Top products by event counts (product views)
    const productViews: Record<string, number> = {};
    tenantEvents.filter(e => e.event_type === 'view_item').forEach(e => {
      const pId = e.properties && e.properties.productId;
      if (pId) productViews[pId] = (productViews[pId] || 0) + 1;
    });

    const topProducts = Object.entries(productViews)
      .map(([id, views]) => {
        const prod = this.products.find(p => p.id === id);
        return {
          id,
          name: prod ? prod.name : 'Unknown Product',
          price: prod ? prod.price : 0,
          image_url: prod ? prod.image_url : '',
          views
        };
      })
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    return {
      totalRevenue,
      conversionRate,
      averageOrderValue,
      uniqueSessions,
      purchasesCount,
      topProducts
    };
  }

  // ==========================================
  // SIMULATED PGVECTOR VECTOR SEMANTIC SEARCH
  // ==========================================
  // Enforces checking merchant_id FIRST prior to processing matching score.
  queryVectorSimilarity(merchantId: string, queryText: string, limit: number = 3) {
    // 1. Mandatory merchant partition filtering prior to computing similarity
    const tenantProducts = this.products.filter(p => p.merchant_id === merchantId);

    if (!queryText || queryText.trim() === '') {
      return tenantProducts.slice(0, limit).map(p => ({ ...p, similarity: 0.9 }));
    }

    const queryTokens = queryText.toLowerCase().split(/\s+/).filter(t => t.length > 2);

    // 2. Score calculation (simulating vector inner product distance calculations)
    const results = tenantProducts.map(product => {
      const name = product.name.toLowerCase();
      const desc = product.description.toLowerCase();

      let score = 0;
      queryTokens.forEach(token => {
        if (name.includes(token)) score += 0.4;
        if (desc.includes(token)) score += 0.2;
      });

      // Sigmoid normalization for realistic similarity bounds (0.0 to 1.0)
      const similarity = Math.max(0.1, Math.min(0.98, 0.1 + (score / (1 + score)) * 0.9));

      return {
        ...product,
        similarity
      };
    });

    // 3. Sort by similarity DESC
    return results
      .filter(r => r.similarity > 0.15)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }
}

export const mockDb = new MockDatabase();
export const supabaseClientSim = {
  auth: {
    // Session state simulation
    currentMerchantId: 'm1-solara-wellness',
    setMerchantContext(id: string) {
      this.currentMerchantId = id;
    },
    getMerchantContext() {
      return this.currentMerchantId;
    }
  },
  from(table: string) {
    const authId = this.auth.getMerchantContext();
    return {
      select: async (query?: string) => {
        if (table === 'merchants') {
          return { data: mockDb.getMerchants(), error: null };
        }
        if (table === 'categories') {
          return { data: mockDb.getCategories(authId), error: null };
        }
        if (table === 'products') {
          return { data: mockDb.getProducts(authId), error: null };
        }
        if (table === 'storefront_configs') {
          return { data: mockDb.getStorefrontConfig(authId), error: null };
        }
        if (table === 'orders') {
          return { data: mockDb.getOrders(authId, authId), error: null };
        }
        if (table === 'payment_gateways') {
          return { data: mockDb.getPaymentGateways(authId, authId), error: null };
        }
        if (table === 'customers') {
          return { data: mockDb.getCustomers(authId, authId), error: null };
        }
        if (table === 'merchant_configurations') {
          const config = mockDb.getMerchantConfig(authId);
          return { data: config ? [config] : [], error: null };
        }
        return { data: [], error: 'Table not supported' };
      },
      update: async (values: any) => {
        if (table === 'storefront_configs') {
          mockDb.updateStorefrontConfig(authId, authId, values);
          return { data: values, error: null };
        }
        if (table === 'merchant_configurations') {
          mockDb.updateMerchantConfig(authId, authId, values.merchant_name, values.currency_code);
          return { data: values, error: null };
        }
        return { data: null, error: 'Update not supported' };
      }
    };
  }
};
