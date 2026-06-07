// Step 6: Customer Storefront Visitor View
import React, { useState, useEffect } from 'react';
import { toast } from '../ui/toast';
import { mockDb, realtimeEngine } from '../../lib/mock-db';
import { supabaseRealtime } from '../../lib/supabase-client';
import { AIChatbot } from './ai-chatbot';
import { StorefrontConfig, Product, CartItem, CheckoutSession, PaymentGatewayConfig } from '../../types';

interface StorefrontProps {
  merchantSlug: string;
}

export const CustomerStorefront: React.FC<StorefrontProps> = ({ merchantSlug }) => {
  const [merchant, setMerchant] = useState<any>(null);
  const [config, setConfig] = useState<StorefrontConfig | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [sessionId, setSessionId] = useState('');
  
  // Checkout Modal State
  const [checkoutSession, setCheckoutSession] = useState<CheckoutSession | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedGateway, setSelectedGateway] = useState<'stripe' | 'proxy_hook' | 'cod'>('stripe');
  const [availableGateways, setAvailableGateways] = useState<PaymentGatewayConfig[]>([]);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  useEffect(() => {
    // Generate simple visitor session id
    let sess = typeof window !== 'undefined' ? window.localStorage.getItem('ai_commerce_session_id') : '';
    if (!sess) {
      sess = `sess_${Math.random().toString(36).substr(2, 9)}`;
      if (typeof window !== 'undefined') window.localStorage.setItem('ai_commerce_session_id', sess);
    }
    setSessionId(sess || '');

    // Resolve merchant by slug
    const resolvedMerchant = mockDb.getMerchantBySlug(merchantSlug);
    if (resolvedMerchant) {
      setMerchant(resolvedMerchant);
      
      const currentConfig = mockDb.getStorefrontConfig(resolvedMerchant.id);
      setConfig(currentConfig);

      const catalog = mockDb.getProducts(resolvedMerchant.id);
      setProducts(catalog);

      const currentCategories = mockDb.getCategories(resolvedMerchant.id);
      setCategories(currentCategories);

      // Load currency config
      const currencyConf = mockDb.getMerchantConfig(resolvedMerchant.id);
      if (currencyConf) {
        setCurrencyCode(currencyConf.currency_code);
        setCurrencySymbol(currencyConf.currency_code === 'INR' ? '₹' : currencyConf.currency_code === 'EUR' ? '€' : '$');
      } else {
        setCurrencyCode('USD');
        setCurrencySymbol('$');
      }

      // Load gateways config
      const gates = mockDb.getPaymentGateways(resolvedMerchant.id, resolvedMerchant.id);
      const activeGates = gates.filter(g => g.active);
      setAvailableGateways(activeGates);
      const firstActive = activeGates.find(g => g.active);
      if (firstActive) {
        setSelectedGateway(firstActive.gateway_type);
      }

      // Log landing visit analytics event
      mockDb.recordAnalyticsEvent(resolvedMerchant.id, 'view_item', sess || 'sess-unknown', { page: '/' });

      // 3. Initialize real-time configuration sync subscription
      const unsubscribe = supabaseRealtime.subscribeToStorefrontConfig(resolvedMerchant.id, (updatedConfig) => {
        console.log(`[Storefront Realtime] Instant update received for ${resolvedMerchant.name}:`, updatedConfig);
        // Animate color change via flash
        setConfig(updatedConfig);
      });

      return () => {
        unsubscribe();
      };
    }
  }, [merchantSlug]);

  // Synchronize catalog items if the mock database modifies them
  useEffect(() => {
    if (merchant) {
      const interval = setInterval(() => {
        setProducts(mockDb.getProducts(merchant.id));
        const currentCategories = mockDb.getCategories(merchant.id);
        setCategories(currentCategories);
        const currencyConf = mockDb.getMerchantConfig(merchant.id);
        if (currencyConf) {
          setCurrencyCode(currencyConf.currency_code);
          setCurrencySymbol(currencyConf.currency_code === 'INR' ? '₹' : currencyConf.currency_code === 'EUR' ? '€' : '$');
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [merchant]);

  if (!merchant || !config) {
    return <div className="p-8 text-center text-zinc-500 font-sans">Resolving storefront subdomain...</div>;
  }

  // Calculate totals
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const formatPrice = (amount: number) => `${currencySymbol}${amount.toFixed(2)}`;

  const handleNavClick = (link: string, label: string) => {
    if (link === '/') {
      setActiveCategory(null);
    } else {
      const normLabel = label.toLowerCase();
      const normLink = link.toLowerCase().replace('/', '');
      const foundCat = categories.find(c => 
        c.name.toLowerCase() === normLabel || 
        c.name.toLowerCase().includes(normLabel) ||
        normLabel.includes(c.name.toLowerCase()) ||
        c.name.toLowerCase().replace(/\s+/g, '-') === normLink
      );
      if (foundCat) {
        setActiveCategory(foundCat.id);
      } else {
        setActiveCategory(link);
      }
    }
  };

  const handleAddToCart = (product: Product | CartItem) => {
    const isCartItem = 'productId' in product;
    const pId = isCartItem ? product.productId : product.id;
    const name = isCartItem ? product.name : product.name;
    const price = isCartItem ? product.price : product.price;
    const img = isCartItem ? product.imageUrl : product.image_url;

    setCart(prev => {
      const existing = prev.find(item => item.productId === pId);
      if (existing) {
        return prev.map(item => item.productId === pId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, {
        productId: pId,
        name,
        price,
        quantity: 1,
        imageUrl: img
      }];
    });

    setIsCartOpen(true);
    
    // Record analytics event
    mockDb.recordAnalyticsEvent(merchant.id, 'add_to_cart', sessionId, {
      productId: pId,
      price,
      name
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (!existing) return prev;
      const updatedQty = existing.quantity + delta;
      if (updatedQty <= 0) {
        return prev.filter(item => item.productId !== productId);
      }
      return prev.map(item => item.productId === productId ? { ...item, quantity: updatedQty } : item);
    });
  };

  // Run dynamic adapter routing checkout process
  const handleCheckoutInit = async () => {
    setIsCheckingOut(true);
    setCheckoutError('');
    try {
      // Post request to checkout routing API endpoint
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: merchant.id,
          cartItems: cart,
          totalAmount,
          sessionId,
          customerName,
          customerEmail,
          customerPhone,
          customerAddress,
          selectedGateway
        })
      });

      // Simulating API client fetch internally if this runs in preview.html
      const data = await response.json();
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Checkout initialization failed');
      }

      setCheckoutSession(data.session);
      setCheckoutStep(2);
    } catch (e: any) {
      // Fallback checkout simulation directly utilizing db for preview robustness
      try {
        const activeGates = mockDb.getPaymentGateways(merchant.id, merchant.id);
        const activeG = activeGates.find(g => g.active && g.gateway_type === selectedGateway) || activeGates.find(g => g.active);
        if (!activeG) throw new Error("No active gateways");

        if (activeG.gateway_type === 'stripe') {
          const sessId = `cs_test_${Math.random().toString(36).substr(2, 9)}`;
          setCheckoutSession({
            sessionId: sessId,
            clientSecret: `seti_test_sec_${Math.random().toString(36).substr(2, 12)}`,
            status: 'requires_action'
          });
        } else if (activeG.gateway_type === 'cod') {
          setCheckoutSession({
            sessionId: `cod_order_${Math.random().toString(36).substr(2, 9)}`,
            status: 'requires_action'
          });
        } else {
          setCheckoutSession({
            sessionId: `ext_order_${Math.random().toString(36).substr(2, 9)}`,
            checkoutUrl: `https://external-checkout.com/pay?total=${totalAmount}`,
            status: 'redirect'
          });
        }
        setCheckoutStep(2);
      } catch (innerErr) {
        setCheckoutError(e.message || 'Checkout adapter error');
      }
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Complete Stripe simulated elements form
  const handleStripePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCVC) {
      toast.error('Please fill out card details');
      return;
    }
    setIsCheckingOut(true);
    setTimeout(() => {
      // Record purchase in mockDb
      const order = mockDb.createOrder(merchant.id, totalAmount, 'stripe', {
        items: cart,
        sessionId,
        stripeSessionId: checkoutSession?.sessionId,
        gateway: 'stripe',
        cardLast4: cardNumber.slice(-4),
        customerName,
        customerEmail,
        customerPhone,
        customerAddress
      });
      setCompletedOrder(order);
      setPaymentSuccess(true);
      setCheckoutStep(3);
      setIsCheckingOut(false);
      setCart([]);
    }, 1500);
  };

  // Dynamic Styles Injection mapping theme configuration JSON
  const customStyles = {
    '--primary-color': config.theme.primary_color,
    '--secondary-color': config.theme.secondary_color,
    '--font-family': config.theme.font_family,
    '--border-radius': config.theme.border_radius,
    '--text-color': config.theme.text_color || '#18181B',
    '--font-size': config.theme.font_size === 'sm' ? '14px' : config.theme.font_size === 'lg' ? '18px' : config.theme.font_size === 'xl' ? '20px' : '16px',
    '--button-bg-color': config.theme.button_bg_color || config.theme.primary_color,
    '--button-text-color': config.theme.button_text_color || '#FFFFFF',
    '--header-bg-color': config.theme.header_bg_color || '#FFFFFF',
    '--card-bg-color': config.theme.card_bg_color || '#FFFFFF',
  } as React.CSSProperties;

  return (
    <div 
      className="min-h-screen transition-colors duration-500 ease-in-out pb-24"
      style={{
        ...customStyles,
        fontFamily: 'var(--font-family), Inter, sans-serif',
        backgroundColor: 'var(--secondary-color, #F8FAFC)',
        color: 'var(--text-color, #18181B)',
        fontSize: 'var(--font-size, 16px)'
      }}
    >
      {/* Styles Injection block for custom font loads */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Roboto:wght@400;500;700&display=swap');
        .theme-font { font-family: var(--font-family), sans-serif; }
        .theme-primary-bg { background-color: var(--primary-color); }
        .theme-primary-text { color: var(--primary-color); }
        .theme-border-radius { border-radius: var(--border-radius); }
        .theme-border-color { border-color: var(--primary-color); }
        .theme-button {
          background-color: var(--button-bg-color) !important;
          color: var(--button-text-color) !important;
          border-radius: var(--border-radius) !important;
          transition: opacity 0.2s ease;
        }
        .theme-button:hover {
          opacity: 0.9;
        }
        .theme-header {
          background-color: var(--header-bg-color) !important;
          color: var(--text-color) !important;
        }
        .theme-card {
          background-color: var(--card-bg-color) !important;
          border-radius: var(--border-radius) !important;
        }
      `}} />

      {/* Store Header / Navbar */}
      <header className="border-b border-zinc-200 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex items-center justify-between theme-header">
        <h1 className="text-xl font-bold tracking-tight theme-primary-text">{merchant.name}</h1>
        
        <div className="flex items-center space-x-6">
          <nav className="hidden md:flex space-x-6">
            {config.navigation.map((item, idx) => {
              const isActive = (item.link === '/' && !activeCategory) || 
                               (item.link !== '/' && activeCategory === item.link) || 
                               (categories.find(c => c.id === activeCategory)?.name.toLowerCase() === item.label.toLowerCase());
              return (
                <a 
                  key={idx} 
                  href={item.link} 
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.link, item.label);
                  }}
                  className={`text-sm font-medium transition ${
                    isActive ? 'theme-primary-text font-bold' : 'text-zinc-650 hover:theme-primary-text'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <button 
            onClick={() => setIsCartOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 text-xs font-bold transition theme-button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>Cart ({totalItems})</span>
          </button>
        </div>
      </header>

      {/* Store Main Sections Builder */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-16">
        {config.sections.map((section) => {
          if (!section.visible) return null;

          if (section.type === 'hero') {
            if (activeCategory) return null;
            const settings = section.settings as any;
            return (
              <section 
                key={section.id} 
                className="relative h-[480px] theme-border-radius overflow-hidden bg-zinc-900 text-white flex items-center"
              >
                <img 
                  src={settings.image_url} 
                  alt="" 
                  className="absolute inset-0 w-full h-full object-cover opacity-60" 
                />
                <div className="relative z-10 max-w-2xl px-12 space-y-6">
                  <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">{section.title}</h2>
                  <button 
                    className="px-8 py-3.5 font-bold transition shadow-lg text-sm theme-button"
                  >
                    {settings.cta_text}
                  </button>
                </div>
              </section>
            );
          }

          if (section.type === 'product_grid') {
            const settings = section.settings as any;
            const columnsClass = settings.columns === 2 
              ? 'grid-cols-2' 
              : settings.columns === 3 
              ? 'grid-cols-1 sm:grid-cols-3' 
              : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4';

            const filtered = activeCategory
              ? products.filter(p => p.category_id === activeCategory)
              : products;
            const limitProducts = filtered.slice(0, settings.limit || 8);

            return (
              <section key={section.id} className="space-y-8">
                <div className="border-b border-zinc-200 pb-4">
                  <h3 className="text-2xl font-bold tracking-tight theme-primary-text">{section.title}</h3>
                </div>
                
                <div className={`grid gap-6 ${columnsClass}`}>
                  {limitProducts.map((p) => (
                    <div 
                      key={p.id} 
                      className="group border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between theme-card"
                    >
                      <div className="relative h-64 overflow-hidden bg-zinc-50 border-b border-zinc-100">
                        <img 
                          src={p.image_url} 
                          alt={p.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-550" 
                        />
                      </div>
                      
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h4 className="font-bold text-base text-zinc-900 group-hover:theme-primary-text transition truncate">{p.name}</h4>
                          <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">{p.description}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-lg font-bold font-mono theme-primary-text">
                            {formatPrice(p.selling_price ?? p.price)}
                            {(p.mrp ?? p.price) > (p.selling_price ?? p.price) && (
                              <span className="text-xs text-zinc-450 line-through ml-2 font-normal">
                                {formatPrice(p.mrp ?? p.price)}
                              </span>
                            )}
                          </span>
                          <button 
                            onClick={() => handleAddToCart(p)}
                            className="text-xs font-bold px-4 py-2 transition theme-button"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          }

          return null;
        })}
      </main>

      {/* Shopping Cart Side Drawer Panel */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end font-sans">
          {/* Overlay background */}
          <div 
            onClick={() => setIsCartOpen(false)} 
            className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm transition-opacity"
          />
          
          {/* Drawer Body */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between z-10 animate-slideOver">
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                <h3 className="text-lg font-extrabold text-zinc-950">Shopping Cart</h3>
                <button onClick={() => setIsCartOpen(false)} className="text-zinc-400 hover:text-zinc-650 p-1">Close</button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-20 text-zinc-400">Your cart is empty.</div>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.productId} className="flex space-x-4 p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                      <img src={item.imageUrl} alt="" className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1 flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-zinc-900 line-clamp-1">{item.name}</h4>
                          <span className="text-xs font-mono font-bold theme-primary-text">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-zinc-200 rounded-lg bg-white overflow-hidden">
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQuantity(item.productId, -1)}
                              className="px-2.5 py-1 text-zinc-500 hover:bg-zinc-100 font-bold transition text-xs"
                            >
                              -
                            </button>
                            <span className="px-3 text-xs font-semibold text-zinc-700">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateCartQuantity(item.productId, 1)}
                              className="px-2.5 py-1 text-zinc-500 hover:bg-zinc-100 font-bold transition text-xs"
                            >
                              +
                            </button>
                          </div>
                          <button 
                            onClick={() => handleRemoveFromCart(item.productId)}
                            className="text-xs text-red-500 hover:text-red-650 font-bold transition"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-zinc-200 bg-zinc-50 space-y-4">
                <div className="flex justify-between text-base font-bold text-zinc-900">
                  <span>Subtotal</span>
                  <span className="font-mono theme-primary-text">{formatPrice(totalAmount)}</span>
                </div>
                <button
                  onClick={() => {
                    setIsCheckoutOpen(true);
                    setCheckoutStep(1);
                    setIsCartOpen(false);
                  }}
                  className="w-full py-3.5 font-bold transition text-sm theme-button"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Adapter Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
          <div onClick={() => {
            if (checkoutStep !== 3) {
              setIsCheckoutOpen(false);
              setCheckoutSession(null);
            }
          }} className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" />
             <div className={`relative bg-white rounded-2xl z-10 overflow-hidden border border-zinc-100 shadow-2xl animate-scaleUp flex flex-col transition-all duration-300 ${
            checkoutStep === 3 ? 'max-w-md w-full p-6' : 'max-w-4xl w-full md:flex-row md:h-[600px] max-h-[90vh]'
          }`}>
            {checkoutStep === 3 ? (
              /* Success pane */
              <div className="text-center py-4 space-y-6 w-full">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600 text-3xl font-bold">✓</div>
                <div>
                  <h3 className="text-xl font-extrabold text-zinc-900">Order Placed Successfully!</h3>
                  <p className="text-sm text-zinc-500 mt-1">Thank you for your purchase. Your order details are below.</p>
                </div>

                {completedOrder && (
                  <div className="bg-zinc-50 p-6 rounded-xl border border-zinc-200 text-left text-sm space-y-4">
                    <div className="flex justify-between border-b border-zinc-200 pb-2">
                      <span className="font-semibold text-zinc-500">Order ID:</span>
                      <span className="font-mono text-zinc-800 font-bold">{completedOrder.order_id}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-200 pb-2">
                      <span className="font-semibold text-zinc-500">Total Captured:</span>
                      <span className="font-mono text-zinc-900 font-bold">{formatPrice(completedOrder.order_total)}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-200 pb-2">
                      <span className="font-semibold text-zinc-500">Payment Method:</span>
                      <span className="text-zinc-800 capitalize font-medium">
                        {completedOrder.payment_gateway === 'stripe' ? 'Credit Card (Stripe)' : 
                         completedOrder.payment_gateway === 'cod' ? 'Cash on Delivery (COD)' : 
                         'External Proxy'}
                      </span>
                    </div>
                    <div className="border-b border-zinc-200 pb-2">
                      <span className="font-semibold text-zinc-500 block mb-1">Shipping Address:</span>
                      <span className="text-zinc-850 font-medium">{completedOrder.metadata?.customerAddress}</span>
                    </div>
                    
                    <div>
                      <span className="font-semibold text-zinc-500 block mb-2">Purchased Items:</span>
                      <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                        {(completedOrder.metadata?.items || []).map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-xs text-zinc-700 bg-white p-2 rounded border border-zinc-150">
                            <span>{item.name} <span className="text-zinc-400">× {item.quantity}</span></span>
                            <span className="font-mono font-semibold">{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setCheckoutSession(null);
                    setPaymentSuccess(false);
                    setCompletedOrder(null);
                    setCheckoutStep(1);
                    setCustomerName('');
                    setCustomerEmail('');
                    setCustomerPhone('');
                    setCustomerAddress('');
                    setCardNumber('');
                    setCardExpiry('');
                    setCardCVC('');
                  }}
                  className="w-full py-3.5 font-bold transition text-sm theme-button shadow-md"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              /* Double-pane layout for checkout details and summary */
              <>
                {/* Left Pane: Customer and Gateway Details Form */}
                <div className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col justify-between">
                  <div>
                    {/* Progress Stepper */}
                    <div className="flex items-center justify-between mb-6 border-b border-zinc-100 pb-4">
                      <div className="flex items-center space-x-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${
                          checkoutStep >= 1 ? 'bg-zinc-900 text-white theme-primary-bg' : 'bg-zinc-200 text-zinc-500'
                        }`}>1</span>
                        <span className="text-xs font-semibold text-zinc-700">Details</span>
                      </div>
                      <div className="flex-1 h-0.5 bg-zinc-200 mx-2" />
                      <div className="flex items-center space-x-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${
                          checkoutStep >= 2 ? 'bg-zinc-900 text-white theme-primary-bg' : 'bg-zinc-200 text-zinc-500'
                        }`}>2</span>
                        <span className="text-xs font-semibold text-zinc-700">Payment</span>
                      </div>
                      <div className="flex-1 h-0.5 bg-zinc-200 mx-2" />
                      <div className="flex items-center space-x-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition ${
                          checkoutStep >= 3 ? 'bg-zinc-900 text-white theme-primary-bg' : 'bg-zinc-200 text-zinc-500'
                        }`}>3</span>
                        <span className="text-xs font-semibold text-zinc-700">Success</span>
                      </div>
                    </div>

                    {/* STEP 1: CUSTOMER DETAILS */}
                    {checkoutStep === 1 && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-extrabold text-zinc-900">Checkout Details</h3>
                          <p className="text-xs text-zinc-400 mt-1">Provide shipping and contact details to proceed</p>
                        </div>

                        {/* Customer Form */}
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          if (!customerName || !customerEmail || !customerPhone || !customerAddress) {
                            toast.error("Please fill out all details.");
                            return;
                          }
                          handleCheckoutInit();
                        }} className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Full Name</label>
                              <input
                                type="text"
                                required
                                placeholder="Jane Doe"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Email Address</label>
                              <input
                                type="email"
                                required
                                placeholder="jane@example.com"
                                value={customerEmail}
                                onChange={(e) => setCustomerEmail(e.target.value)}
                                className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Phone Number</label>
                              <input
                                type="tel"
                                required
                                placeholder="+1 (555) 019-2834"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                                className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Payment Method</label>
                              <select
                                value={selectedGateway}
                                onChange={(e) => setSelectedGateway(e.target.value as any)}
                                className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-indigo-500 cursor-pointer"
                              >
                                {availableGateways.map(gw => (
                                  <option key={gw.id} value={gw.gateway_type}>
                                    {gw.gateway_type === 'stripe' ? 'Credit Card (Stripe)' : 
                                     gw.gateway_type === 'cod' ? 'Cash on Delivery (COD)' : 
                                     'External Checkout (Proxy Hook)'}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Shipping Address</label>
                            <textarea
                              required
                              rows={2}
                              placeholder="123 Main St, New York, NY 10001"
                              value={customerAddress}
                              onChange={(e) => setCustomerAddress(e.target.value)}
                              className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-indigo-500 resize-none"
                            />
                          </div>

                          <div className="flex space-x-3 pt-2">
                            <button
                              type="button"
                              onClick={() => setIsCheckoutOpen(false)}
                              className="flex-1 py-3 border border-zinc-200 hover:bg-zinc-50 text-zinc-500 font-bold rounded-xl text-sm transition"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              disabled={isCheckingOut}
                              className="flex-1 py-3 font-bold transition text-sm theme-button"
                            >
                              {isCheckingOut ? 'Initializing Gateway...' : 'Proceed to Payment'}
                            </button>
                          </div>
                        </form>
                      </div>
                    )}

                    {/* STEP 2: PAYMENT GATEWAY FORM & REVIEW */}
                    {checkoutStep === 2 && checkoutSession && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-extrabold text-zinc-900">Authorize Payment</h3>
                          <p className="text-xs text-zinc-400 mt-1">Transaction Routed to Active Gateway</p>
                        </div>

                        {checkoutError && <div className="p-3 bg-red-50 border border-red-205 text-red-650 text-xs rounded-lg">{checkoutError}</div>}

                        {/* Built-in Stripe Elements Checkout Panel */}
                        {checkoutSession.status === 'requires_action' && selectedGateway === 'stripe' && (
                          <form onSubmit={handleStripePaymentSubmit} className="space-y-4">
                            <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50 space-y-3">
                              <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-200">
                                <span>Card Payment Adapter</span>
                                <span className="font-mono text-zinc-500">Stripe Elements Mode</span>
                              </div>
                              <div>
                                <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Card Number</label>
                                <input
                                  type="text"
                                  required
                                  value={cardNumber}
                                  onChange={(e) => setCardNumber(e.target.value)}
                                  placeholder="4242 4242 4242 4242"
                                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-indigo-500"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Expiration Date</label>
                                  <input
                                    type="text"
                                    required
                                    value={cardExpiry}
                                    onChange={(e) => setCardExpiry(e.target.value)}
                                    placeholder="MM / YY"
                                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-indigo-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">CVC Code</label>
                                  <input
                                    type="text"
                                    required
                                    value={cardCVC}
                                    onChange={(e) => setCardCVC(e.target.value)}
                                    placeholder="321"
                                    className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-900 focus:outline-none focus:border-indigo-500"
                                  />
                                </div>
                              </div>
                            </div>

                            <button
                              type="submit"
                              disabled={isCheckingOut}
                              className="w-full py-3.5 font-bold transition text-sm theme-button shadow-md"
                            >
                              {isCheckingOut ? 'Authorizing Card...' : `Authorize Charge ${formatPrice(totalAmount)}`}
                            </button>
                          </form>
                        )}

                        {/* Cash on Delivery Confirm Panel */}
                        {checkoutSession.status === 'requires_action' && selectedGateway === 'cod' && (
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            setIsCheckingOut(true);
                            setTimeout(() => {
                              const order = mockDb.createOrder(merchant.id, totalAmount, 'cod', {
                                items: cart,
                                sessionId,
                                gateway: 'cod',
                                customerName,
                                customerEmail,
                                customerPhone,
                                customerAddress
                              });
                              setCompletedOrder(order);
                              setPaymentSuccess(true);
                              setCheckoutStep(3);
                              setIsCheckingOut(false);
                              setCart([]);
                            }, 1050);
                          }} className="space-y-4">
                            <div className="border border-zinc-200 rounded-xl p-5 bg-amber-50/50 text-zinc-850 space-y-2">
                              <div className="flex items-center space-x-2 text-amber-700">
                                <span className="text-xl">💵</span>
                                <span className="font-bold text-sm">Cash on Delivery (COD)</span>
                              </div>
                              <p className="text-xs text-zinc-650 leading-relaxed">
                                Your order will be processed immediately. You will pay in cash or card directly to the delivery agent upon receiving your items.
                              </p>
                            </div>

                            <button
                              type="submit"
                              disabled={isCheckingOut}
                              className="w-full py-3.5 font-bold transition text-sm theme-button shadow-md"
                            >
                              {isCheckingOut ? 'Placing COD Order...' : `Place Cash on Delivery Order`}
                            </button>
                          </form>
                        )}

                        {/* External Proxy Redirection Checkout Panel */}
                        {checkoutSession.status === 'redirect' && (
                          <div className="space-y-4 text-center py-4">
                            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-650 text-2xl mx-auto">⇄</div>
                            <div>
                              <h4 className="font-bold text-sm text-zinc-900">Relaying Order to Third-Party Adapter</h4>
                              <p className="text-xs text-zinc-500 mt-1">Order will process externally via client integrations hook.</p>
                            </div>
                            <a
                              href={checkoutSession.checkoutUrl}
                              onClick={(e) => {
                                e.preventDefault();
                                toast.success(`Webhook Relayer Payload Dispatched! Redirecting customer to merchant billing engine...`);
                                const order = mockDb.createOrder(merchant.id, totalAmount, 'proxy_hook', {
                                  items: cart,
                                  sessionId,
                                  gateway: 'proxy_hook',
                                  externalSession: checkoutSession.sessionId,
                                  customerName,
                                  customerEmail,
                                  customerPhone,
                                  customerAddress
                                });
                                setCompletedOrder(order);
                                setPaymentSuccess(true);
                                setCheckoutStep(3);
                                setCart([]);
                              }}
                              className="inline-block w-full py-3.5 font-bold transition text-sm text-center theme-button shadow-md"
                            >
                              Redirect to External Checkout
                            </a>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => setCheckoutStep(1)}
                          className="w-full py-2.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-500 font-bold rounded-xl text-xs transition"
                        >
                          ← Back to Customer Details
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Pane: Sticky Order Summary pane */}
                <div className="w-full md:w-[340px] bg-zinc-50 border-t md:border-t-0 md:border-l border-zinc-150 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
                  <div className="space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Order Summary</h3>
                    
                    {/* Items List */}
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                      {cart.map(item => (
                        <div key={item.productId} className="flex items-center space-x-3 text-sm">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt="" className="w-10 h-10 object-cover rounded border border-zinc-200 bg-white" />
                          ) : (
                            <div className="w-10 h-10 rounded border border-zinc-200 bg-zinc-100 flex items-center justify-center text-xs text-zinc-400">🛒</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-zinc-800 truncate">{item.name}</h4>
                            <p className="text-xs text-zinc-500">{formatPrice(item.price)} × {item.quantity}</p>
                          </div>
                          <span className="font-mono font-bold text-zinc-700">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Shipping info preview in Step 2 */}
                    {checkoutStep === 2 && (
                      <div className="bg-white p-4 rounded-xl border border-zinc-200 space-y-2 text-xs text-zinc-655 shadow-sm animate-fadeIn">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100 pb-1">Delivery Target</h4>
                        <p><span className="font-semibold text-zinc-400">Name:</span> {customerName}</p>
                        <p><span className="font-semibold text-zinc-400">Phone:</span> {customerPhone}</p>
                        <p className="truncate"><span className="font-semibold text-zinc-400">Addr:</span> {customerAddress}</p>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-zinc-200 pt-4 mt-6 space-y-2">
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>Subtotal</span>
                      <span className="font-mono">{formatPrice(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>Shipping</span>
                      <span className="text-green-600 font-bold">Free</span>
                    </div>
                    <div className="border-t border-zinc-205 pt-2 flex justify-between font-bold text-zinc-900 text-sm">
                      <span>Total Amount</span>
                      <span className="font-mono theme-primary-text">{formatPrice(totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating conversational AI chat assistant */}
      <AIChatbot 
        merchantId={merchant.id} 
        merchantName={merchant.name} 
        onAddToCart={handleAddToCart} 
      />
    </div>
  );
};
