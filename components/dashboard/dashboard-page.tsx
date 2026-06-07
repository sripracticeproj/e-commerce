// Step 4: Merchant Dashboard Configuration View
import React, { useState, useEffect } from 'react';
import { mockDb } from '../../lib/mock-db';
import { StorefrontConfig, Product, PaymentGatewayConfig, Order, Customer, MerchantAdminAccount } from '../../types';
import { toast } from '../ui/toast';
import { AnalyticsReports } from './analytics-reports';

interface DashboardProps {
  merchantId: string;
  currentAdminId?: string;
}

const PRESETS = [
  {
    id: 'slate',
    name: 'Minimalist Slate',
    primary: '#18181B',
    secondary: '#FAFAFA',
    text: '#18181B',
    font: 'Inter',
    radius: '0.25rem',
    btnBg: '#18181B',
    btnText: '#FFFFFF',
    headerBg: '#FFFFFF',
    cardBg: '#FFFFFF',
    desc: 'Slate tones with sharp styling.'
  },
  {
    id: 'botanical',
    name: 'Organic Botanical',
    primary: '#0D9488',
    secondary: '#F0FDFA',
    text: '#115E59',
    font: 'Playfair Display',
    radius: '1.0rem',
    btnBg: '#0D9488',
    btnText: '#FFFFFF',
    headerBg: '#FFFFFF',
    cardBg: '#F0FDFA',
    desc: 'Teals and rounded corners.'
  },
  {
    id: 'amber',
    name: 'Warm Amber',
    primary: '#B45309',
    secondary: '#FFFBEB',
    text: '#78350F',
    font: 'Outfit',
    radius: '0.75rem',
    btnBg: '#D97706',
    btnText: '#FFFFFF',
    headerBg: '#FFFFFF',
    cardBg: '#FEF3C7',
    desc: 'Cozy autumn warm tones.'
  },
  {
    id: 'neon',
    name: 'Retro Neon',
    primary: '#D946EF',
    secondary: '#0F172A',
    text: '#F8FAFC',
    font: 'Roboto',
    radius: '0rem',
    btnBg: '#D946EF',
    btnText: '#0F172A',
    headerBg: '#1E293B',
    cardBg: '#1E293B',
    desc: 'Dark background with neon pink.'
  },
  {
    id: 'royal',
    name: 'Royal Gold',
    primary: '#D97706',
    secondary: '#0F172A',
    text: '#F8FAFC',
    font: 'Playfair Display',
    radius: '0.5rem',
    btnBg: '#D97706',
    btnText: '#0F172A',
    headerBg: '#1E293B',
    cardBg: '#1E293B',
    desc: 'Navy and luxury gold elements.'
  }
];

export const MerchantDashboard: React.FC<DashboardProps> = ({ merchantId, currentAdminId }) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'branding' | 'navigation' | 'layout' | 'gateways' | 'products' | 'orders' | 'customers' | 'users'>('analytics');
  const [config, setConfig] = useState<StorefrontConfig | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [gateways, setGateways] = useState<PaymentGatewayConfig[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currencyCode, setCurrencyCode] = useState('USD');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [metrics, setMetrics] = useState<any>(null);
  const [merchantName, setMerchantName] = useState<string>('');

  // Form states for product addition
  const [newProdName, setNewProdName] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdMRP, setNewProdMRP] = useState('');
  const [newProdSellingPrice, setNewProdSellingPrice] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('');
  const [newProdImg, setNewProdImg] = useState('');

  // Form states for product editing
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editProdName, setEditProdName] = useState('');
  const [editProdDesc, setEditProdDesc] = useState('');
  const [editProdMRP, setEditProdMRP] = useState('');
  const [editProdSellingPrice, setEditProdSellingPrice] = useState('');
  const [editProdCategory, setEditProdCategory] = useState('');
  const [editProdImg, setEditProdImg] = useState('');

  // Category modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Form states for gateways
  const [stripeActive, setStripeActive] = useState(false);
  const [stripePubKey, setStripePubKey] = useState('');
  const [proxyActive, setProxyActive] = useState(false);
  const [proxyUrl, setProxyUrl] = useState('');
  const [proxySecret, setProxySecret] = useState('');
  const [codActive, setCodActive] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('');

  // Customer creation form state
  const [newCustName, setNewCustName] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [showCustModal, setShowCustModal] = useState(false);

  // Form states for merchant user management
  const [storeUsers, setStoreUsers] = useState<MerchantAdminAccount[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'owner' | 'admin' | 'editor'>('admin');

  // Form states for editing merchant user
  const [editingUser, setEditingUser] = useState<MerchantAdminAccount | null>(null);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserPassword, setEditUserPassword] = useState('');
  const [editUserRole, setEditUserRole] = useState<'owner' | 'admin' | 'editor'>('admin');

  // Theme configuration states
  const [primaryColor, setPrimaryColor] = useState('');
  const [secondaryColor, setSecondaryColor] = useState('');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [borderRadius, setBorderRadius] = useState('0.5rem');
  const [textColor, setTextColor] = useState('#18181B');
  const [fontSize, setFontSize] = useState('base');
  const [buttonBgColor, setButtonBgColor] = useState('#18181B');
  const [buttonTextColor, setButtonTextColor] = useState('#FFFFFF');
  const [headerBgColor, setHeaderBgColor] = useState('#FFFFFF');
  const [cardBgColor, setCardBgColor] = useState('#FFFFFF');
  const [themePreset, setThemePreset] = useState('slate');
  const [lastLoadedMerchantId, setLastLoadedMerchantId] = useState('');
  const [orderIdFormat, setOrderIdFormat] = useState('yyyymmdd000<seq_No>');
  const [selectedDetailedOrder, setSelectedDetailedOrder] = useState<Order | null>(null);

  const applyPreset = (presetId: string) => {
    const p = PRESETS.find(pr => pr.id === presetId);
    if (p) {
      setPrimaryColor(p.primary);
      setSecondaryColor(p.secondary);
      setTextColor(p.text);
      setFontFamily(p.font);
      setBorderRadius(p.radius);
      setButtonBgColor(p.btnBg);
      setButtonTextColor(p.btnText);
      setHeaderBgColor(p.headerBg);
      setCardBgColor(p.cardBg);
      setThemePreset(p.id);
    }
  };

  const handleSaveTheme = () => {
    console.log('[Theme Save Debug] Clicked handleSaveTheme. merchantId:', merchantId, 'config:', config);
    if (!config) {
      console.warn('[Theme Save Debug] config is null! Returning early.');
      return;
    }
    const updatedConfig: StorefrontConfig = {
      ...config,
      theme: {
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        font_family: fontFamily,
        border_radius: borderRadius,
        text_color: textColor,
        font_size: fontSize,
        button_bg_color: buttonBgColor,
        button_text_color: buttonTextColor,
        header_bg_color: headerBgColor,
        card_bg_color: cardBgColor,
        theme_preset: themePreset
      }
    };
    console.log('[Theme Save Debug] Saving config:', updatedConfig);
    try {
      saveConfig(updatedConfig);
      console.log('[Theme Save Debug] saveConfig completed successfully.');
      toast.success('Storefront branding settings saved successfully.');
    } catch (e) {
      console.error('[Theme Save Debug] Error inside saveConfig:', e);
    }
  };

  useEffect(() => {
    const loadData = () => {
      const merchant = mockDb.getMerchantById(merchantId);
      if (merchant) {
        setMerchantName(merchant.name);
      }
      const currentConfig = mockDb.getStorefrontConfig(merchantId);
      setConfig(currentConfig);

      if (currentConfig && (merchantId !== lastLoadedMerchantId)) {
        setPrimaryColor(currentConfig.theme.primary_color || '#18181B');
        setSecondaryColor(currentConfig.theme.secondary_color || '#FAFAFA');
        setFontFamily(currentConfig.theme.font_family || 'Inter');
        setBorderRadius(currentConfig.theme.border_radius || '0.5rem');
        setTextColor(currentConfig.theme.text_color || '#18181B');
        setFontSize(currentConfig.theme.font_size || 'base');
        setButtonBgColor(currentConfig.theme.button_bg_color || '#18181B');
        setButtonTextColor(currentConfig.theme.button_text_color || '#FFFFFF');
        setHeaderBgColor(currentConfig.theme.header_bg_color || '#FFFFFF');
        setCardBgColor(currentConfig.theme.card_bg_color || '#FFFFFF');
        setThemePreset(currentConfig.theme.theme_preset || 'slate');
        setLastLoadedMerchantId(merchantId);
      }

      const currentCategories = mockDb.getCategories(merchantId);
      setCategories(currentCategories);

      const catalog = mockDb.getProducts(merchantId);
      setProducts(catalog);

      const currentOrders = mockDb.getOrders(merchantId, merchantId);
      setOrders(currentOrders);

      const currentCustomers = mockDb.getCustomers(merchantId, merchantId);
      setCustomers(currentCustomers);

      const gate = mockDb.getPaymentGateways(merchantId, merchantId);
      setGateways(gate);
      const stripe = gate.find(g => g.gateway_type === 'stripe');
      if (stripe) {
        setStripeActive(stripe.active);
        setStripePubKey(stripe.credentials.publicKey || '');
      }
      const proxy = gate.find(g => g.gateway_type === 'proxy_hook');
      if (proxy) {
        setProxyActive(proxy.active);
        setProxyUrl(proxy.credentials.webhookUrl || '');
        setProxySecret(proxy.credentials.secret || '');
      }
      const cod = gate.find(g => g.gateway_type === 'cod');
      if (cod) {
        setCodActive(cod.active);
      }

      const calculatedMetrics = mockDb.getDashboardMetrics(merchantId, merchantId);
      setMetrics(calculatedMetrics);

      const currencyConf = mockDb.getMerchantConfig(merchantId);
      if (currencyConf) {
        setCurrencyCode(currencyConf.currency_code);
        setCurrencySymbol(currencyConf.currency_code === 'INR' ? '₹' : currencyConf.currency_code === 'EUR' ? '€' : '$');
        if (!selectedCurrency) {
          setSelectedCurrency(currencyConf.currency_code);
        }
        setOrderIdFormat(currencyConf.order_id_format || 'yyyymmdd000<seq_No>');
      } else {
        setCurrencyCode('USD');
        setCurrencySymbol('$');
        if (!selectedCurrency) {
          setSelectedCurrency('USD');
        }
        setOrderIdFormat('yyyymmdd000<seq_No>');
      }

      const currentStoreUsers = mockDb.getMerchantAdmins(merchantId);
      setStoreUsers(currentStoreUsers);
    };

    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, [merchantId]);

  const formatPrice = (amount: number | null | undefined) => {
    const val = typeof amount === 'number' ? amount : parseFloat(amount as any);
    return isNaN(val) ? `${currencySymbol}0.00` : `${currencySymbol}${val.toFixed(2)}`;
  };

  // Push immediate update to mock database and broadcast via Realtime Engine
  const saveConfig = (newConfig: StorefrontConfig) => {
    setConfig(newConfig);
    mockDb.updateStorefrontConfig(merchantId, merchantId, newConfig);
    // Refresh dashboard stats that might depend on catalog/config
    setMetrics(mockDb.getDashboardMetrics(merchantId, merchantId));
  };

  // Create Category
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const added = mockDb.addCategory(merchantId, merchantId, newCategoryName.trim());
      const updatedCategories = mockDb.getCategories(merchantId);
      setCategories(updatedCategories);
      setNewProdCategory(added.id);
      setNewCategoryName('');
      setShowCategoryModal(false);
    } catch (err: any) {
      alert(err.message || "Failed to create category");
    }
  };

  // Add Product to Merchant Catalog
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdMRP || !newProdSellingPrice) {
      alert("Please fill in all required fields.");
      return;
    }

    const mrpVal = parseFloat(newProdMRP);
    const sellingPriceVal = parseFloat(newProdSellingPrice);

    if (isNaN(mrpVal) || mrpVal <= 0) {
      alert("MRP must be greater than 0");
      return;
    }
    if (isNaN(sellingPriceVal) || sellingPriceVal <= 0) {
      alert("Selling Price must be greater than 0");
      return;
    }
    if (sellingPriceVal > mrpVal) {
      alert("Selling Price must be less than or equal to MRP");
      return;
    }
    
    mockDb.addProduct(merchantId, {
      merchant_id: merchantId,
      name: newProdName,
      description: newProdDesc,
      price: sellingPriceVal, // Keep compatibility
      mrp: mrpVal,
      selling_price: sellingPriceVal,
      category_id: newProdCategory || undefined,
      image_url: newProdImg || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'
    });

    setProducts(mockDb.getProducts(merchantId));
    setNewProdName('');
    setNewProdDesc('');
    setNewProdMRP('');
    setNewProdSellingPrice('');
    setNewProdImg('');
    setNewProdCategory('');
    setMetrics(mockDb.getDashboardMetrics(merchantId, merchantId));
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editProdName || !editProdMRP || !editProdSellingPrice) {
      alert("Please fill in all required fields.");
      return;
    }

    const mrpVal = parseFloat(editProdMRP);
    const sellingPriceVal = parseFloat(editProdSellingPrice);

    if (isNaN(mrpVal) || mrpVal <= 0) {
      alert("MRP must be greater than 0");
      return;
    }
    if (isNaN(sellingPriceVal) || sellingPriceVal <= 0) {
      alert("Selling Price must be greater than 0");
      return;
    }
    if (sellingPriceVal > mrpVal) {
      alert("Selling Price must be less than or equal to MRP");
      return;
    }

    try {
      mockDb.updateProduct(merchantId, merchantId, editingProduct.id, {
        name: editProdName,
        description: editProdDesc,
        mrp: mrpVal,
        selling_price: sellingPriceVal,
        category_id: editProdCategory || undefined,
        image_url: editProdImg || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'
      });

      setProducts(mockDb.getProducts(merchantId));
      setMetrics(mockDb.getDashboardMetrics(merchantId, merchantId));
      setEditingProduct(null);
    } catch (err: any) {
      alert(err.message || "Failed to update product");
    }
  };

  const handleDeleteProduct = (productId: string) => {
    mockDb.deleteProduct(merchantId, merchantId, productId);
    setProducts(mockDb.getProducts(merchantId));
    setMetrics(mockDb.getDashboardMetrics(merchantId, merchantId));
  };

  // Save Gateway Credentials
  const handleSaveGateways = () => {
    mockDb.updatePaymentGateway(merchantId, merchantId, 'stripe', { publicKey: stripePubKey }, stripeActive);
    mockDb.updatePaymentGateway(merchantId, merchantId, 'proxy_hook', { webhookUrl: proxyUrl, secret: proxySecret }, proxyActive);
    mockDb.updatePaymentGateway(merchantId, merchantId, 'cod', { active: codActive }, codActive);
    setGateways(mockDb.getPaymentGateways(merchantId, merchantId));
    toast.success('Payment Gateway configurations saved successfully.');
  };

  const handleSaveCurrency = () => {
    mockDb.updateMerchantConfig(merchantId, merchantId, merchantName, selectedCurrency as 'USD' | 'EUR' | 'INR', orderIdFormat);
    setCurrencyCode(selectedCurrency);
    setCurrencySymbol(selectedCurrency === 'INR' ? '₹' : selectedCurrency === 'EUR' ? '€' : '$');
    toast.success('Store base settings saved successfully.');
  };

  const handlePrintCourierSlip = (order: Order) => {
    const cust = customers.find(c => c.customer_id === order.customer_id);
    let printEl = document.getElementById('print-area-wrapper');
    if (!printEl) {
      printEl = document.createElement('div');
      printEl.id = 'print-area-wrapper';
      document.body.appendChild(printEl);
    }
    
    const items = order.metadata?.items || [];
    const itemsListHtml = items.map((item: any) => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px 0; color: #1e293b;">${item.name}</td>
        <td style="padding: 10px 0; text-align: center; color: #1e293b;">${item.quantity || item.qty}</td>
        <td style="padding: 10px 0; text-align: right; font-family: monospace; color: #1e293b;">${formatPrice(item.price || item.selling_price || 0)}</td>
        <td style="padding: 10px 0; text-align: right; font-family: monospace; color: #1e293b;">${formatPrice((item.price || item.selling_price || 0) * (item.quantity || item.qty || 1))}</td>
      </tr>
    `).join('');

    printEl.innerHTML = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: black; padding: 40px; background: white; max-width: 600px; margin: auto; border: 2px solid #000; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="text-align: center; border-bottom: 3px double #000; padding-bottom: 20px; margin-bottom: 25px;">
          <h2 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;">${merchantName}</h2>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #4b5563; font-weight: 600; letter-spacing: 0.5px;">SHIPPING MANIFEST / COURIER PACKING SLIP</p>
        </div>
        
        <div style="margin-bottom: 25px; font-size: 14px; line-height: 1.5;">
          <div style="margin-bottom: 6px;"><strong>Order ID:</strong> <span style="font-family: monospace; font-weight: bold; font-size: 15px;">${order.order_id}</span></div>
          <div style="margin-bottom: 6px;"><strong>Created At:</strong> ${new Date(order.created_at).toLocaleString()}</div>
          <div style="margin-bottom: 6px;"><strong>Payment Gateway:</strong> <span style="text-transform: uppercase;">${order.payment_gateway}</span></div>
        </div>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px; font-size: 14px; border: 1px solid #e2e8f0; line-height: 1.6;">
          <strong style="display: block; margin-bottom: 8px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; color: #475569;">Delivery Information:</strong>
          <div style="font-weight: bold; font-size: 16px; margin-bottom: 5px; color: #0f172a;">${cust?.name || order.metadata?.customerName || 'Guest Buyer'}</div>
          <div style="margin-bottom: 4px;"><strong>Contact Phone:</strong> ${cust?.phone || order.metadata?.customerPhone || 'N/A'}</div>
          <div style="margin-bottom: 4px;"><strong>Email Address:</strong> ${cust?.email || order.metadata?.customerEmail || 'N/A'}</div>
          <div style="margin-top: 10px; font-size: 14px;">
            <strong>Shipping Destination:</strong><br/>
            <span style="font-weight: 500; color: #1e293b;">${order.metadata?.customerAddress || 'N/A'}</span>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 25px;">
          <thead>
            <tr style="border-bottom: 2px solid #0f172a; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; color: #475569;">
              <th style="text-align: left; padding-bottom: 8px;">Product Description</th>
              <th style="text-align: center; padding-bottom: 8px; width: 60px;">Quantity</th>
              <th style="text-align: right; padding-bottom: 8px; width: 90px;">Unit Rate</th>
              <th style="text-align: right; padding-bottom: 8px; width: 90px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsListHtml}
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 16px; font-weight: bold; border-top: 2px solid #0f172a; padding-top: 15px;">
          <span>Collectable Total:</span>
          <span style="font-family: monospace; font-size: 18px;">${formatPrice(order.order_total)}</span>
        </div>
        
        <div style="margin-top: 35px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 10px;">
          <div style="border: 2px solid #0f172a; display: inline-block; padding: 8px 16px; font-family: monospace; font-size: 16px; font-weight: bold; letter-spacing: 1.5px; background: #f1f5f9; text-transform: uppercase; border-radius: 4px;">
            ORDER STATUS: ${order.order_status}
          </div>
          <p style="margin: 0; font-size: 10px; color: #94a3b8;">Courier copy - attach this manifest securely to parcel face</p>
        </div>
      </div>
    `;

    window.print();
  };

  if (!config || !metrics) return <div className="p-8 text-zinc-500">Loading multi-tenant console...</div>;

  return (
    <div className="flex h-full bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      {/* Sidebar Panel */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900 flex flex-col justify-between">
        <div>
          <div className="p-6 border-b border-zinc-800">
            <h1 className="text-lg font-bold bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent truncate">
              {merchantName}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">Merchant Console</p>
          </div>
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === 'analytics' ? 'bg-zinc-800 text-teal-400 font-semibold' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }`}
            >
              Business Analytics
            </button>
            <button
              onClick={() => setActiveTab('branding')}
              className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === 'branding' ? 'bg-zinc-800 text-teal-400 font-semibold' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }`}
            >
              Branding
            </button>
            <button
              onClick={() => setActiveTab('navigation')}
              className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === 'navigation' ? 'bg-zinc-800 text-teal-400 font-semibold' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }`}
            >
              Navigation Links
            </button>
            <button
              onClick={() => setActiveTab('layout')}
              className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === 'layout' ? 'bg-zinc-800 text-teal-400 font-semibold' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }`}
            >
              Page Layout Design
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === 'products' ? 'bg-zinc-800 text-teal-400 font-semibold' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }`}
            >
              Product Catalog
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === 'orders' ? 'bg-zinc-800 text-teal-400 font-semibold' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }`}
            >
              Order History
            </button>
            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === 'customers' ? 'bg-zinc-800 text-teal-400 font-semibold' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }`}
            >
              Customer Details
            </button>
            <button
              onClick={() => setActiveTab('gateways')}
              className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === 'gateways' ? 'bg-zinc-800 text-teal-400 font-semibold' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }`}
            >
              Payment Gateways
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center px-4 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === 'users' ? 'bg-zinc-800 text-teal-400 font-semibold' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
              }`}
            >
              Store Users
            </button>
          </nav>
        </div>
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 text-xs text-zinc-500">
          Tenant Partition: <code className="text-zinc-400 text-[10px]">{merchantId}</code>
        </div>
      </aside>

      {/* Main Work Area */}
      <main className="flex-1 overflow-y-auto bg-zinc-950 p-8">
        
        {/* TABS: BUSINESS BI REPORTING */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold">Business Intelligence Reports</h2>
              <p className="text-sm text-zinc-400 mt-1">Real-time tenant metrics and transactional analytics.</p>
            </div>
            
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900">
                <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Total Revenue</p>
                <p className="text-3xl font-extrabold mt-2 text-teal-400">{formatPrice(metrics.totalRevenue)}</p>
                <div className="text-[10px] text-zinc-500 mt-1">From completed orders</div>
              </div>
              <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900">
                <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Conversion Rate</p>
                <p className="text-3xl font-extrabold mt-2 text-indigo-400">{metrics.conversionRate.toFixed(2)}%</p>
                <div className="text-[10px] text-zinc-500 mt-1">Purchases per session</div>
              </div>
              <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900">
                <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Avg Order Value (AOV)</p>
                <p className="text-3xl font-extrabold mt-2 text-pink-400">{formatPrice(metrics.averageOrderValue)}</p>
                <div className="text-[10px] text-zinc-500 mt-1">Revenue divided by orders</div>
              </div>
              <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900">
                <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Total Store Sessions</p>
                <p className="text-3xl font-extrabold mt-2 text-amber-400">{metrics.uniqueSessions}</p>
                <div className="text-[10px] text-zinc-500 mt-1">Distinct guest sessions</div>
              </div>
            </div>

            {/* Custom Interactive SVG Reports & Chart Panels */}
            <AnalyticsReports
              merchantId={merchantId}
              currencySymbol={currencySymbol}
              formatPrice={formatPrice}
            />

            {/* Top Products View */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="text-lg font-bold mb-4">Top Performing Products</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-400">
                  <thead className="text-xs uppercase bg-zinc-950 text-zinc-300">
                    <tr>
                      <th className="px-6 py-3 rounded-l-lg">Product</th>
                      <th className="px-6 py-3">Price</th>
                      <th className="px-6 py-3 rounded-r-lg">Views / Clicks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.topProducts.map((p: any) => (
                      <tr key={p.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/10">
                        <td className="px-6 py-4 font-semibold text-zinc-200 flex items-center space-x-3">
                          <img src={p.image_url} alt="" className="w-10 h-10 object-cover rounded" />
                          <span>{p.name}</span>
                        </td>
                        <td className="px-6 py-4">{formatPrice(p.price)}</td>
                        <td className="px-6 py-4">
                          <span className="bg-teal-950 text-teal-300 text-xs px-2.5 py-1 rounded-full border border-teal-800">
                            {p.views} views
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        {/* TABS: BRANDING SETTINGS */}
        {activeTab === 'branding' && (
          <div className="space-y-8 animate-fadeIn max-w-3xl">
            <div>
              <h2 className="text-2xl font-bold">Storefront Branding & Customization</h2>
              <p className="text-sm text-zinc-400 mt-1">Define typography, presets, base sizing, and visual palettes mapping your storefront design.</p>
            </div>
            
            {/* Theme Presets */}
            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-4">
              <label className="block text-xs uppercase text-zinc-400 font-semibold tracking-wider">Choose Predefined Theme Preset</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {PRESETS.map((p) => {
                  const isSelected = themePreset === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyPreset(p.id)}
                      className={`p-3 rounded-lg border text-left flex flex-col justify-between transition duration-200 ${
                        isSelected 
                          ? 'border-teal-500 bg-zinc-800/80 shadow-md shadow-teal-500/10' 
                          : 'border-zinc-800 bg-zinc-900 hover:border-zinc-700 hover:bg-zinc-800/50'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs text-zinc-100">{p.name}</div>
                        <div className="flex space-x-1 mt-2">
                          <span className="w-3.5 h-3.5 rounded-full border border-zinc-700 shadow-sm" style={{ backgroundColor: p.primary }} title="Primary" />
                          <span className="w-3.5 h-3.5 rounded-full border border-zinc-700 shadow-sm" style={{ backgroundColor: p.secondary }} title="Secondary" />
                          <span className="w-3.5 h-3.5 rounded-full border border-zinc-700 shadow-sm" style={{ backgroundColor: p.btnBg }} title="Button BG" />
                          <span className="w-3.5 h-3.5 rounded-full border border-zinc-700 shadow-sm" style={{ backgroundColor: p.headerBg }} title="Header BG" />
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-3 leading-tight font-medium">{p.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6 bg-zinc-900 p-6 rounded-xl border border-zinc-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-350 border-b border-zinc-800 pb-2 mb-4">Granular Visual Settings</h3>

              {/* Color Palette Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase text-zinc-400 font-semibold tracking-wider mb-2">Primary Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => {
                        setPrimaryColor(e.target.value);
                        setThemePreset('custom');
                      }}
                      className="w-10 h-10 bg-transparent rounded cursor-pointer border border-zinc-700"
                    />
                    <input
                      type="text"
                      value={primaryColor}
                      onChange={(e) => {
                        setPrimaryColor(e.target.value);
                        setThemePreset('custom');
                      }}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase text-zinc-400 font-semibold tracking-wider mb-2">Secondary / Background Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => {
                        setSecondaryColor(e.target.value);
                        setThemePreset('custom');
                      }}
                      className="w-10 h-10 bg-transparent rounded cursor-pointer border border-zinc-700"
                    />
                    <input
                      type="text"
                      value={secondaryColor}
                      onChange={(e) => {
                        setSecondaryColor(e.target.value);
                        setThemePreset('custom');
                      }}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase text-zinc-400 font-semibold tracking-wider mb-2">Body Text Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => {
                        setTextColor(e.target.value);
                        setThemePreset('custom');
                      }}
                      className="w-10 h-10 bg-transparent rounded cursor-pointer border border-zinc-700"
                    />
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => {
                        setTextColor(e.target.value);
                        setThemePreset('custom');
                      }}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase text-zinc-400 font-semibold tracking-wider mb-2">Button Background Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={buttonBgColor}
                      onChange={(e) => {
                        setButtonBgColor(e.target.value);
                        setThemePreset('custom');
                      }}
                      className="w-10 h-10 bg-transparent rounded cursor-pointer border border-zinc-700"
                    />
                    <input
                      type="text"
                      value={buttonBgColor}
                      onChange={(e) => {
                        setButtonBgColor(e.target.value);
                        setThemePreset('custom');
                      }}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase text-zinc-400 font-semibold tracking-wider mb-2">Button Text Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={buttonTextColor}
                      onChange={(e) => {
                        setButtonTextColor(e.target.value);
                        setThemePreset('custom');
                      }}
                      className="w-10 h-10 bg-transparent rounded cursor-pointer border border-zinc-700"
                    />
                    <input
                      type="text"
                      value={buttonTextColor}
                      onChange={(e) => {
                        setButtonTextColor(e.target.value);
                        setThemePreset('custom');
                      }}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase text-zinc-400 font-semibold tracking-wider mb-2">Header Background Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={headerBgColor}
                      onChange={(e) => {
                        setHeaderBgColor(e.target.value);
                        setThemePreset('custom');
                      }}
                      className="w-10 h-10 bg-transparent rounded cursor-pointer border border-zinc-700"
                    />
                    <input
                      type="text"
                      value={headerBgColor}
                      onChange={(e) => {
                        setHeaderBgColor(e.target.value);
                        setThemePreset('custom');
                      }}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase text-zinc-400 font-semibold tracking-wider mb-2">Product Card Background Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={cardBgColor}
                      onChange={(e) => {
                        setCardBgColor(e.target.value);
                        setThemePreset('custom');
                      }}
                      className="w-10 h-10 bg-transparent rounded cursor-pointer border border-zinc-700"
                    />
                    <input
                      type="text"
                      value={cardBgColor}
                      onChange={(e) => {
                        setCardBgColor(e.target.value);
                        setThemePreset('custom');
                      }}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Sizing and Fonts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-zinc-800 pt-6">
                <div>
                  <label className="block text-xs uppercase text-zinc-400 font-semibold tracking-wider mb-2">Typography Font Family</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => {
                      setFontFamily(e.target.value);
                      setThemePreset('custom');
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500 text-zinc-200"
                  >
                    <option value="Inter">Inter (Sans-Serif)</option>
                    <option value="Playfair Display">Playfair Display (Premium Serif)</option>
                    <option value="Outfit">Outfit (Geometric Modern)</option>
                    <option value="Roboto">Roboto (Clean Transitional)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase text-zinc-400 font-semibold tracking-wider mb-2">Base Font Size</label>
                  <select
                    value={fontSize}
                    onChange={(e) => {
                      setFontSize(e.target.value);
                      setThemePreset('custom');
                    }}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500 text-zinc-200"
                  >
                    <option value="sm">Small (14px)</option>
                    <option value="base">Medium (16px)</option>
                    <option value="lg">Large (18px)</option>
                    <option value="xl">Extra Large (20px)</option>
                  </select>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <label className="block text-xs uppercase text-zinc-400 font-semibold tracking-wider mb-2">Component Border Radius</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.125"
                      value={parseFloat(borderRadius)}
                      onChange={(e) => {
                        setBorderRadius(`${e.target.value}rem`);
                        setThemePreset('custom');
                      }}
                      className="flex-1 accent-teal-500"
                    />
                    <span className="text-sm font-mono bg-zinc-950 px-3 py-1 rounded border border-zinc-800 text-zinc-200">{borderRadius}</span>
                  </div>
                </div>
              </div>

              {/* Save Theme Settings Button */}
              <div className="pt-6 border-t border-zinc-850 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveTheme}
                  className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-zinc-950 font-bold rounded-lg transition duration-200"
                >
                  Save Store Theme Settings
                </button>
              </div>

              {/* General Store Settings Area */}
              <div className="border-t border-zinc-800/80 pt-6 mt-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-350 border-b border-zinc-800 pb-2 mb-4">General Store Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase text-zinc-400 font-semibold tracking-wider mb-2">Merchant Store Title</label>
                    <input
                      type="text"
                      value={merchantName}
                      onChange={(e) => setMerchantName(e.target.value)}
                      placeholder="e.g. Aether Minimalist Tech"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 text-zinc-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase text-zinc-400 font-semibold tracking-wider mb-2">Store Base Currency</label>
                    <select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 cursor-pointer text-zinc-200"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase text-zinc-400 font-semibold tracking-wider mb-2">Configurable Order ID Format</label>
                  <input
                    type="text"
                    value={orderIdFormat}
                    onChange={(e) => setOrderIdFormat(e.target.value)}
                    placeholder="e.g. yyyymmdd000<seq_No>"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 text-zinc-200 font-mono"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1.5 leading-relaxed">
                    Placeholders: <code className="text-teal-400">yyyy</code> (Year), <code className="text-teal-400">yy</code> (2-digit Year), <code className="text-teal-400">mm</code> (Month), <code className="text-teal-400">dd</code> (Day), <code className="text-teal-400">&lt;seq_No&gt;</code> or <code className="text-teal-400">&#123;seq&#125;</code> (Auto-incrementing sequence).
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveCurrency}
                    className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-zinc-955 text-xs font-bold rounded-lg transition"
                  >
                    Save General Store Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TABS: NAVIGATION LINKS */}
        {activeTab === 'navigation' && (
          <div className="space-y-8 animate-fadeIn max-w-2xl">
            <div>
              <h2 className="text-2xl font-bold">Navigation Links</h2>
              <p className="text-sm text-zinc-400 mt-1">Configure public header links for instant sync updating.</p>
            </div>
            
            <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-4">
              {config.navigation.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-3 bg-zinc-950 p-3 rounded border border-zinc-800/80">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => {
                      const newNav = [...config.navigation];
                      newNav[idx].label = e.target.value;
                      saveConfig({ ...config, navigation: newNav });
                    }}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-sm"
                    placeholder="Link Label"
                  />
                  <input
                    type="text"
                    value={item.link}
                    onChange={(e) => {
                      const newNav = [...config.navigation];
                      newNav[idx].link = e.target.value;
                      saveConfig({ ...config, navigation: newNav });
                    }}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-3 py-1.5 text-sm font-mono"
                    placeholder="/shop"
                  />
                  <button
                    onClick={() => {
                      const newNav = config.navigation.filter((_, i) => i !== idx);
                      saveConfig({ ...config, navigation: newNav });
                    }}
                    className="p-1.5 text-red-400 hover:bg-red-950/30 rounded border border-transparent hover:border-red-900/50"
                  >
                    Delete
                  </button>
                </div>
              ))}
              
              <button
                onClick={() => {
                  const newNav = [...config.navigation, { label: 'New Link', link: '/' }];
                  saveConfig({ ...config, navigation: newNav });
                }}
                className="w-full py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm font-semibold text-zinc-200 hover:bg-zinc-750 transition"
              >
                + Add Navigation Link
              </button>
            </div>
          </div>
        )}

        {/* TABS: PAGE LAYOUT DESIGN */}
        {activeTab === 'layout' && (
          <div className="space-y-8 animate-fadeIn max-w-2xl">
            <div>
              <h2 className="text-2xl font-bold">Page Layout & Section Config</h2>
              <p className="text-sm text-zinc-400 mt-1">Configure layout sections for client storefront rendering.</p>
            </div>
            
            <div className="space-y-6">
              {config.sections.map((section, idx) => (
                <div key={section.id} className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <span className="text-sm font-semibold uppercase tracking-wider text-zinc-300">
                      {section.type === 'hero' ? 'Hero Banner' : 'Product Grid'}
                    </span>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <span className="text-xs text-zinc-400">Visible</span>
                      <input
                        type="checkbox"
                        checked={section.visible}
                        onChange={(e) => {
                          const newSections = [...config.sections];
                          newSections[idx].visible = e.target.checked;
                          saveConfig({ ...config, sections: newSections });
                        }}
                        className="rounded accent-teal-500"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Section Title</label>
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => {
                        const newSections = [...config.sections];
                        newSections[idx].title = e.target.value;
                        saveConfig({ ...config, sections: newSections });
                      }}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  {/* Settings specific to type */}
                  {section.type === 'hero' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">CTA Button Text</label>
                        <input
                          type="text"
                          value={(section.settings as any).cta_text}
                          onChange={(e) => {
                            const newSections = [...config.sections];
                            (newSections[idx].settings as any).cta_text = e.target.value;
                            saveConfig({ ...config, sections: newSections });
                          }}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded px-3 py-2 text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">CTA Redirect Link</label>
                        <input
                          type="text"
                          value={(section.settings as any).cta_link}
                          onChange={(e) => {
                            const newSections = [...config.sections];
                            (newSections[idx].settings as any).cta_link = e.target.value;
                            saveConfig({ ...config, sections: newSections });
                          }}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded px-3 py-2 text-sm focus:outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-zinc-400 mb-1">Banner Image URL</label>
                        <input
                          type="text"
                          value={(section.settings as any).image_url}
                          onChange={(e) => {
                            const newSections = [...config.sections];
                            (newSections[idx].settings as any).image_url = e.target.value;
                            saveConfig({ ...config, sections: newSections });
                          }}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded px-3 py-2 text-sm focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {section.type === 'product_grid' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">Max Products Display Limit</label>
                        <input
                          type="number"
                          value={(section.settings as any).limit}
                          onChange={(e) => {
                            const newSections = [...config.sections];
                            (newSections[idx].settings as any).limit = parseInt(e.target.value) || 4;
                            saveConfig({ ...config, sections: newSections });
                          }}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded px-3 py-2 text-sm focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">Layout Columns Count</label>
                        <select
                          value={(section.settings as any).columns}
                          onChange={(e) => {
                            const newSections = [...config.sections];
                            (newSections[idx].settings as any).columns = parseInt(e.target.value) || 4;
                            saveConfig({ ...config, sections: newSections });
                          }}
                          className="w-full bg-zinc-950 border border-zinc-850 rounded px-3 py-2 text-sm focus:outline-none"
                        >
                          <option value={2}>2 Columns</option>
                          <option value={3}>3 Columns</option>
                          <option value={4}>4 Columns</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* TABS: PRODUCTS MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="space-y-8 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold">Product Catalog Manager</h2>
              <p className="text-sm text-zinc-400 mt-1">Manage tenant-isolated catalog entries with vector indexing mock.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Add Product Form */}
              <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 h-fit">
                <h3 className="text-lg font-bold mb-4">Add Catalog Item</h3>
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div>
                    <label htmlFor="product-name" className="block text-xs text-zinc-400 mb-1">Product Name</label>
                    <input
                      id="product-name"
                      type="text"
                      required
                      placeholder="e.g. Lavender Sleep Mist"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded px-3 py-2 text-sm focus:outline-none text-zinc-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="product-category" className="block text-xs text-zinc-400 mb-1">Category</label>
                    <div className="flex space-x-2">
                      <select
                        id="product-category"
                        value={newProdCategory}
                        onChange={(e) => setNewProdCategory(e.target.value)}
                        className="flex-1 bg-zinc-950 border border-zinc-850 rounded px-3 py-2 text-sm focus:outline-none text-zinc-200"
                      >
                        <option value="">Uncategorized</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowCategoryModal(true)}
                        className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-750 text-xs font-semibold rounded transition shrink-0"
                      >
                        + Add Category
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="product-mrp" className="block text-xs text-zinc-400 mb-1">MRP ({currencySymbol})</label>
                      <input
                        id="product-mrp"
                        type="number"
                        required
                        step="0.01"
                        placeholder="0.00"
                        value={newProdMRP}
                        onChange={(e) => setNewProdMRP(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded px-3 py-2 text-sm focus:outline-none text-zinc-200 font-mono"
                      />
                    </div>
                    <div>
                      <label htmlFor="product-selling-price" className="block text-xs text-zinc-400 mb-1">Selling Price ({currencySymbol})</label>
                      <input
                        id="product-selling-price"
                        type="number"
                        required
                        step="0.01"
                        placeholder="0.00"
                        value={newProdSellingPrice}
                        onChange={(e) => setNewProdSellingPrice(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-850 rounded px-3 py-2 text-sm focus:outline-none text-zinc-200 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Product Image</label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Paste image URL here..."
                          value={newProdImg}
                          onChange={(e) => setNewProdImg(e.target.value)}
                          className="flex-1 bg-zinc-950 border border-zinc-850 rounded px-3 py-2 text-sm focus:outline-none text-zinc-200 font-mono"
                        />
                        <label className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold rounded transition cursor-pointer shrink-0">
                          Upload File
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setNewProdImg(reader.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                      {newProdImg && (
                        <div className="relative w-full h-24 rounded border border-zinc-800 bg-zinc-955 overflow-hidden flex items-center justify-center">
                          <img src={newProdImg} alt="Preview" className="h-full object-contain" />
                          <button
                            type="button"
                            onClick={() => setNewProdImg('')}
                            className="absolute top-1 right-1 px-1.5 py-0.5 bg-red-950/85 hover:bg-red-950 text-red-400 text-[10px] rounded border border-red-900/50"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="product-description" className="block text-xs text-zinc-400 mb-1">Description</label>
                    <textarea
                      id="product-description"
                      placeholder="Enter description..."
                      value={newProdDesc}
                      onChange={(e) => setNewProdDesc(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded px-3 py-2 text-sm focus:outline-none h-24 resize-none text-zinc-200"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 rounded-lg text-sm font-semibold text-zinc-950 transition"
                  >
                    Index & Save Product
                  </button>
                </form>
              </div>

              {/* Product Catalog List */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                  <h3 className="text-lg font-bold mb-4">Catalog List</h3>
                  <div className="space-y-3">
                    {products.map(p => {
                      const cat = categories.find(c => c.id === p.category_id);
                      return (
                        <div key={p.id} className="flex items-center justify-between p-4 bg-zinc-950 rounded border border-zinc-800">
                          <div className="flex items-center space-x-4">
                            <img src={p.image_url} alt="" className="w-12 h-12 object-cover rounded border border-zinc-800" />
                            <div>
                              <h4 className="font-semibold text-sm">{p.name}</h4>
                              <p className="text-xs text-zinc-400 line-clamp-1 max-w-sm mt-0.5">{p.description}</p>
                              <span className="text-xs font-mono mt-1 block">
                                <span className="text-teal-400 font-bold">{formatPrice(p.selling_price ?? p.price)}</span>
                                {(p.mrp ?? p.price) > (p.selling_price ?? p.price) && (
                                  <span className="text-zinc-500 line-through ml-2">{formatPrice(p.mrp ?? p.price)}</span>
                                )}
                                {cat && (
                                  <span className="bg-zinc-850 text-zinc-300 text-[10px] px-2 py-0.5 rounded border border-zinc-750 ml-3 font-sans">
                                    {cat.name}
                                  </span>
                                )}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setEditProdName(p.name);
                                setEditProdDesc(p.description || '');
                                setEditProdMRP((p.mrp ?? p.price).toString());
                                setEditProdSellingPrice((p.selling_price ?? p.price).toString());
                                setEditProdCategory(p.category_id || '');
                                setEditProdImg(p.image_url || '');
                              }}
                              className="px-3 py-1.5 border border-zinc-700 hover:bg-zinc-800 text-teal-400 text-xs rounded transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="px-3 py-1.5 border border-red-900/50 hover:bg-red-950/20 text-red-400 text-xs rounded transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TABS: PAYMENT GATEWAYS CONFIG */}
        {activeTab === 'gateways' && (
          <div className="space-y-8 animate-fadeIn max-w-2xl">
            <div>
              <h2 className="text-2xl font-bold">Dynamic Payment Gateways</h2>
              <p className="text-sm text-zinc-400 mt-1">Configure keys and routes for secure multi-tenant checkoutAdapter.</p>
            </div>
            
            <div className="space-y-6">
              {/* Stripe Native Gateway Card */}
              <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-805 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                    <span className="font-bold text-zinc-200">Built-in Headless Checkout (Stripe Elements)</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={stripeActive}
                      onChange={(e) => setStripeActive(e.target.checked)}
                      className="rounded accent-teal-500"
                    />
                  </label>
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Stripe Publishable Key</label>
                  <input
                    type="text"
                    value={stripePubKey}
                    onChange={(e) => setStripePubKey(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm font-mono text-indigo-400 focus:outline-none"
                    placeholder="pk_test_..."
                  />
                </div>
              </div>

              {/* External Proxy API Hooks Gateway Card */}
              <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-805 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                    <span className="font-bold text-zinc-200">External Proxy Hooks (Third-Party Hook Relayer)</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={proxyActive}
                      onChange={(e) => setProxyActive(e.target.checked)}
                      className="rounded accent-teal-500"
                    />
                  </label>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Webhook Endpoint URL</label>
                    <input
                      type="text"
                      value={proxyUrl}
                      onChange={(e) => setProxyUrl(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm font-mono focus:outline-none"
                      placeholder="https://client-erp.com/api/checkout-hook"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Security Webhook Secret</label>
                    <input
                      type="password"
                      value={proxySecret}
                      onChange={(e) => setProxySecret(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm font-mono focus:outline-none"
                      placeholder="••••••••••••••••"
                    />
                  </div>
                </div>
              </div>

              {/* Cash on Delivery (COD) Gateway Card */}
              <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="font-bold text-zinc-200">Cash on Delivery (COD)</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={codActive}
                      onChange={(e) => setCodActive(e.target.checked)}
                      className="rounded accent-teal-500"
                    />
                  </label>
                </div>
                <p className="text-xs text-zinc-400">
                  Allow customers to place orders without upfront payment. Orders will be marked as pending payment until delivered.
                </p>
              </div>

              <button
                onClick={handleSaveGateways}
                className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-zinc-950 font-bold rounded-lg text-sm transition"
              >
                Save Payment Channels
              </button>
            </div>
          </div>
        )}

        {/* TABS: ORDER HISTORY LOGS */}
        {activeTab === 'orders' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold font-sans">Order Management Console</h2>
                <p className="text-sm text-zinc-400 mt-1">Review transaction status, manage fulfillment logistics, process refunds, and generate courier dispatch manifests.</p>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-400">
                  <thead className="text-xs uppercase bg-zinc-955 text-zinc-300">
                    <tr>
                      <th className="px-6 py-3 rounded-l-lg">Order ID</th>
                      <th className="px-6 py-3">Customer Name</th>
                      <th className="px-6 py-3">Created At</th>
                      <th className="px-6 py-3">Order Total</th>
                      <th className="px-6 py-3">Order Status</th>
                      <th className="px-6 py-3 rounded-r-lg text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-zinc-500 italic">No orders received yet.</td>
                      </tr>
                    ) : (
                      orders.map((o) => {
                        const cust = customers.find(c => c.customer_id === o.customer_id);
                        return (
                          <tr key={o.order_id} className="border-b border-zinc-800/50 hover:bg-zinc-800/10 transition">
                            <td className="px-6 py-4 font-mono text-xs text-zinc-200 font-bold">{o.order_id}</td>
                            <td className="px-6 py-4">
                              {cust ? (
                                <div>
                                  <p className="font-semibold text-zinc-200">{cust.name}</p>
                                  <p className="text-[10px] text-zinc-500 font-mono">{cust.email}</p>
                                </div>
                              ) : (
                                <div>
                                  <p className="font-semibold text-zinc-200">{o.metadata?.customerName || 'Guest Buyer'}</p>
                                  <p className="text-[10px] text-zinc-500 font-mono">{o.metadata?.customerEmail || 'N/A'}</p>
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 text-xs text-zinc-400">{new Date(o.created_at).toLocaleString()}</td>
                            <td className="px-6 py-4 font-mono font-bold text-teal-400">{formatPrice(o.order_total)}</td>
                            <td className="px-6 py-4">
                              <span className={`text-[10px] px-2.5 py-1 rounded-full border font-semibold uppercase tracking-wider ${
                                o.order_status === 'paid' ? 'bg-green-950 text-green-400 border-green-800/50' :
                                o.order_status === 'refunded' ? 'bg-indigo-950 text-indigo-400 border-indigo-850/50' :
                                o.order_status === 'pending' ? 'bg-amber-950 text-amber-400 border-amber-800/50' :
                                o.order_status === 'fulfilled' ? 'bg-teal-950 text-teal-450 border-teal-800/50' :
                                'bg-red-955/20 text-red-400 border-red-900/50'
                              }`}>
                                {o.order_status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <button
                                onClick={() => setSelectedDetailedOrder(o)}
                                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-750 text-zinc-100 border border-zinc-700 text-xs font-bold rounded-lg transition"
                              >
                                Manage
                              </button>
                              <button
                                onClick={() => handlePrintCourierSlip(o)}
                                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-750 text-teal-400 border border-zinc-700 text-xs font-bold rounded-lg transition"
                                title="Print Courier Manifest Label"
                              >
                                Print Slip
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TABS: CUSTOMER DETAILS */}
        {activeTab === 'customers' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Customer Directory</h2>
                <p className="text-sm text-zinc-400 mt-1">Directory of registered customer profiles bound exclusively to your merchant space.</p>
              </div>
              <button
                onClick={() => setShowCustModal(true)}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-zinc-950 text-xs font-bold rounded-lg transition"
              >
                + Register Customer
              </button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-400">
                  <thead className="text-xs uppercase bg-zinc-950 text-zinc-300">
                    <tr>
                      <th className="px-6 py-3 rounded-l-lg">Customer ID</th>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Email Address</th>
                      <th className="px-6 py-3">Phone Number</th>
                      <th className="px-6 py-3 rounded-r-lg">Onboarded At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.customer_id} className="border-b border-zinc-800/50 hover:bg-zinc-800/10 transition">
                        <td className="px-6 py-4 font-mono text-xs text-zinc-400">{c.customer_id}</td>
                        <td className="px-6 py-4 font-semibold text-zinc-200">{c.name}</td>
                        <td className="px-6 py-4 font-mono text-xs text-zinc-350">{c.email}</td>
                        <td className="px-6 py-4 text-zinc-300">{c.phone}</td>
                        <td className="px-6 py-4 text-xs text-zinc-500">{new Date(c.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TABS: MERCHANT USER MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Store User Accounts</h2>
                <p className="text-sm text-zinc-400 mt-1">Manage admin, owner, and editor accounts authorized for your storefront.</p>
              </div>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-zinc-955 text-xs font-bold rounded-lg transition"
              >
                + Add Store User
              </button>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-400">
                  <thead className="text-xs uppercase bg-zinc-955 text-zinc-300">
                    <tr>
                      <th className="px-6 py-3 rounded-l-lg">Username</th>
                      <th className="px-6 py-3">Email Address</th>
                      <th className="px-6 py-3">Role</th>
                      <th className="px-6 py-3">Password (Mock)</th>
                      <th className="px-6 py-3">Created At</th>
                      <th className="px-6 py-3 rounded-r-lg text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storeUsers.map((u) => (
                      <tr key={u.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/10 transition">
                        <td className="px-6 py-4 font-semibold text-zinc-200">{u.username}</td>
                        <td className="px-6 py-4 font-mono text-xs text-zinc-350">{u.email}</td>
                        <td className="px-6 py-4">
                          <span className="bg-zinc-855 text-teal-400 border border-zinc-750 text-[10px] px-2 py-0.5 rounded font-mono">
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-zinc-400">{u.password}</td>
                        <td className="px-6 py-4 text-xs text-zinc-500">{new Date(u.created_at).toLocaleString()}</td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setEditUserName(u.username);
                              setEditUserEmail(u.email);
                              setEditUserPassword(u.password || '');
                              setEditUserRole(u.role);
                              setShowEditUserModal(true);
                            }}
                            className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-750 text-teal-400 border border-zinc-700 text-xs font-bold rounded transition"
                          >
                            Edit
                          </button>
                          <button
                            disabled={u.id === currentAdminId}
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete user ${u.username}?`)) {
                                mockDb.deleteMerchantAdmin(u.id);
                                setStoreUsers(mockDb.getMerchantAdmins(merchantId));
                              }
                            }}
                            className={`px-2.5 py-1 text-xs font-bold rounded border transition ${
                              u.id === currentAdminId 
                                ? 'bg-zinc-850/50 text-zinc-600 border-zinc-800/50 cursor-not-allowed' 
                                : 'bg-red-955/20 hover:bg-red-955/40 border-red-900/50 text-red-400'
                            }`}
                            title={u.id === currentAdminId ? "Cannot delete yourself" : ""}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Customer Creation Modal */}
      {showCustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowCustModal(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-zinc-200">
            <div>
              <h3 className="text-base font-extrabold text-white">Register Customer</h3>
              <p className="text-xs text-zinc-400 mt-1">Create a new customer profile under your tenant space.</p>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newCustName || !newCustEmail || !newCustPhone) return;
              try {
                mockDb.addCustomer(merchantId, merchantId, newCustName, newCustEmail, newCustPhone);
                setCustomers(mockDb.getCustomers(merchantId, merchantId));
                setNewCustName('');
                setNewCustEmail('');
                setNewCustPhone('');
                setShowCustModal(false);
              } catch (err: any) {
                alert(err.message || 'Failed to register customer');
              }
            }} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  placeholder="e.g. Alice Smith"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 text-zinc-200"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  placeholder="alice@example.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 text-zinc-200"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 text-zinc-200"
                />
              </div>
              
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustModal(false)}
                  className="flex-1 py-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 rounded text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-teal-500 hover:bg-teal-600 text-zinc-950 rounded text-xs font-bold transition"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Creation Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowCategoryModal(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-zinc-200">
            <div>
              <h3 className="text-base font-extrabold text-white">Add New Category</h3>
              <p className="text-xs text-zinc-400 mt-1">Create a new product grouping for your store.</p>
            </div>
            
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label htmlFor="modal-category-name" className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Category Name</label>
                <input
                  id="modal-category-name"
                  type="text"
                  required
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Wellness rituals"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 text-zinc-200"
                />
              </div>
              
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 py-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 rounded text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-teal-500 hover:bg-teal-600 text-zinc-955 rounded text-xs font-bold transition"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setEditingProduct(null)} className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 text-zinc-200 overflow-y-auto max-h-[90vh]">
            <div>
              <h3 className="text-base font-extrabold text-white">Edit Catalog Item</h3>
              <p className="text-xs text-zinc-400 mt-1">Update details, pricing, and category mapping for this product.</p>
            </div>
            
            <form onSubmit={handleUpdateProduct} className="space-y-4">
              <div>
                <label htmlFor="edit-product-name" className="block text-xs text-zinc-400 mb-1">Product Name</label>
                <input
                  id="edit-product-name"
                  type="text"
                  required
                  placeholder="e.g. Lavender Sleep Mist"
                  value={editProdName}
                  onChange={(e) => setEditProdName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none text-zinc-200"
                />
              </div>
              <div>
                <label htmlFor="edit-product-category" className="block text-xs text-zinc-400 mb-1">Category</label>
                <select
                  id="edit-product-category"
                  value={editProdCategory}
                  onChange={(e) => setEditProdCategory(e.target.value)}
                  className="w-full bg-zinc-955 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none text-zinc-200"
                >
                  <option value="">Uncategorized</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edit-product-mrp" className="block text-xs text-zinc-400 mb-1">MRP ({currencySymbol})</label>
                  <input
                    id="edit-product-mrp"
                    type="number"
                    required
                    step="0.01"
                    placeholder="0.00"
                    value={editProdMRP}
                    onChange={(e) => setEditProdMRP(e.target.value)}
                    className="w-full bg-zinc-955 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none text-zinc-200 font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="edit-product-selling-price" className="block text-xs text-zinc-400 mb-1">Selling Price ({currencySymbol})</label>
                  <input
                    id="edit-product-selling-price"
                    type="number"
                    required
                    step="0.01"
                    placeholder="0.00"
                    value={editProdSellingPrice}
                    onChange={(e) => setEditProdSellingPrice(e.target.value)}
                    className="w-full bg-zinc-955 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none text-zinc-200 font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Product Image</label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="Paste image URL here..."
                      value={editProdImg}
                      onChange={(e) => setEditProdImg(e.target.value)}
                      className="flex-1 bg-zinc-955 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none text-zinc-200 font-mono"
                    />
                    <label className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold rounded transition cursor-pointer shrink-0">
                      Upload File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditProdImg(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {editProdImg && (
                    <div className="relative w-full h-24 rounded border border-zinc-800 bg-zinc-955 overflow-hidden flex items-center justify-center">
                      <img src={editProdImg} alt="Preview" className="h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => setEditProdImg('')}
                        className="absolute top-1 right-1 px-1.5 py-0.5 bg-red-955/80 hover:bg-red-950 text-red-400 text-[10px] rounded border border-red-900/50"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="edit-product-description" className="block text-xs text-zinc-400 mb-1">Description</label>
                <textarea
                  id="edit-product-description"
                  placeholder="Enter description..."
                  value={editProdDesc}
                  onChange={(e) => setEditProdDesc(e.target.value)}
                  className="w-full bg-zinc-955 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none h-24 resize-none text-zinc-200"
                />
              </div>
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 rounded text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-teal-500 hover:bg-teal-600 text-zinc-950 rounded text-xs font-bold transition"
                >
                  Save Changes
                </button>
              </div>
             </form>
          </div>
        </div>
      )}

      {/* Add Store User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowAddUserModal(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-zinc-200">
            <div>
              <h3 className="text-base font-extrabold text-white">Create Store User</h3>
              <p className="text-xs text-zinc-400 mt-1">Add a new admin account to manage this merchant store.</p>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newUserName || !newUserEmail || !newUserPassword) return;

              try {
                mockDb.addMerchantAdmin(merchantId, newUserEmail, newUserName, newUserPassword, newUserRole);
                setStoreUsers(mockDb.getMerchantAdmins(merchantId));
                setNewUserName('');
                setNewUserEmail('');
                setNewUserPassword('');
                setShowAddUserModal(false);
              } catch (err: any) {
                alert(err.message || 'Failed to create store user');
              }
            }} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. store_editor"
                  className="w-full bg-zinc-955 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 text-zinc-200"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="user@store.com"
                  className="w-full bg-zinc-955 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 text-zinc-200"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-955 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 text-zinc-200"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Role Type</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full bg-zinc-955 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 text-zinc-200 cursor-pointer"
                >
                  <option value="owner">Owner (Full access)</option>
                  <option value="admin">Admin (Manage settings)</option>
                  <option value="editor">Editor (Products only)</option>
                </select>
              </div>
              
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 py-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 rounded text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-teal-500 hover:bg-teal-600 text-zinc-955 rounded text-xs font-bold transition"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Store User Modal */}
      {showEditUserModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => {
            setShowEditUserModal(false);
            setEditingUser(null);
          }} className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-zinc-200">
            <div>
              <h3 className="text-base font-extrabold text-white">Edit Store User</h3>
              <p className="text-xs text-zinc-400 mt-1">Modify credentials or role access levels.</p>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!editUserName || !editUserEmail || !editUserPassword) return;

              try {
                mockDb.updateMerchantAdmin(editingUser.id, {
                  username: editUserName,
                  email: editUserEmail,
                  password: editUserPassword,
                  role: editUserRole
                });
                setStoreUsers(mockDb.getMerchantAdmins(merchantId));
                setShowEditUserModal(false);
                setEditingUser(null);
              } catch (err: any) {
                alert(err.message || 'Failed to update store user');
              }
            }} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  className="w-full bg-zinc-955 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 text-zinc-200"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editUserEmail}
                  onChange={(e) => setEditUserEmail(e.target.value)}
                  className="w-full bg-zinc-955 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 text-zinc-200"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Password</label>
                <input
                  type="text"
                  required
                  value={editUserPassword}
                  onChange={(e) => setEditUserPassword(e.target.value)}
                  className="w-full bg-zinc-955 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 text-zinc-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Role Type</label>
                <select
                  value={editUserRole}
                  onChange={(e) => setEditUserRole(e.target.value as any)}
                  className="w-full bg-zinc-955 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 text-zinc-200 cursor-pointer"
                >
                  <option value="owner">Owner (Full access)</option>
                  <option value="admin">Admin (Manage settings)</option>
                  <option value="editor">Editor (Products only)</option>
                </select>
              </div>
              
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditUserModal(false);
                    setEditingUser(null);
                  }}
                  className="flex-1 py-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 rounded text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-teal-500 hover:bg-teal-600 text-zinc-955 rounded text-xs font-bold transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detailed Order Management Drawer / Modal */}
      {selectedDetailedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-end font-sans">
          {/* Modal backdrop */}
          <div
            onClick={() => setSelectedDetailedOrder(null)}
            className="absolute inset-0 bg-zinc-950/70 backdrop-blur-sm transition-opacity"
          />

          {/* Drawer Body */}
          <div className="relative w-full max-w-lg bg-zinc-900 h-full border-l border-zinc-800 shadow-2xl flex flex-col justify-between z-10 animate-slideOver text-zinc-100">
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-white">Order Details</h3>
                  <p className="text-xs text-zinc-500 font-mono mt-1">ID: {selectedDetailedOrder.order_id}</p>
                </div>
                <button
                  onClick={() => setSelectedDetailedOrder(null)}
                  className="text-zinc-400 hover:text-zinc-200 font-bold p-1 text-sm bg-zinc-800 rounded-lg w-7 h-7 flex items-center justify-center border border-zinc-700"
                >
                  ✕
                </button>
              </div>

              {/* Metadata Summary Cards */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850 space-y-1">
                  <span className="text-[9px] text-zinc-500 uppercase block font-bold">Created At</span>
                  <span className="text-zinc-300 font-semibold">{new Date(selectedDetailedOrder.created_at).toLocaleString()}</span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-850 space-y-1">
                  <span className="text-[9px] text-zinc-500 uppercase block font-bold">Payment Method</span>
                  <span className="text-zinc-300 font-semibold uppercase">{selectedDetailedOrder.payment_gateway}</span>
                </div>
              </div>

              {/* Customer & Shipping Section */}
              <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-850 space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-teal-400 border-b border-zinc-850 pb-2">Customer & Courier Dispatch Details</h4>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-500 block font-bold">Name</span>
                    <span className="text-zinc-200 font-semibold">
                      {customers.find(c => c.customer_id === selectedDetailedOrder.customer_id)?.name || 
                       selectedDetailedOrder.metadata?.customerName || 'Guest Buyer'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-500 block font-bold">Phone Number</span>
                    <span className="text-zinc-200 font-mono font-semibold">
                      {customers.find(c => c.customer_id === selectedDetailedOrder.customer_id)?.phone || 
                       selectedDetailedOrder.metadata?.customerPhone || 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <span className="text-[9px] text-zinc-500 block font-bold">Email Address</span>
                  <span className="text-zinc-200 font-mono font-semibold">
                    {customers.find(c => c.customer_id === selectedDetailedOrder.customer_id)?.email || 
                     selectedDetailedOrder.metadata?.customerEmail || 'N/A'}
                  </span>
                </div>

                <div className="text-xs space-y-1 bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                  <span className="text-[9px] text-zinc-500 block font-bold mb-1">Shipping Address</span>
                  <span className="text-zinc-200 font-semibold leading-relaxed block">
                    {selectedDetailedOrder.metadata?.customerAddress || 'No shipping address provided.'}
                  </span>
                </div>
              </div>

              {/* Ordered Items Summary */}
              <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-850 space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-teal-400 border-b border-zinc-850 pb-2">Ordered Items Summary</h4>
                
                <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                  {(selectedDetailedOrder.metadata?.items || []).map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-xs bg-zinc-900 p-2.5 rounded border border-zinc-800">
                      <div className="flex-1 min-w-0 pr-3">
                        <span className="font-semibold text-zinc-200 block truncate">{item.name}</span>
                        <span className="text-[10px] text-zinc-500">Rate: {formatPrice(item.price || item.selling_price || 0)} × {item.quantity || item.qty}</span>
                      </div>
                      <span className="font-mono font-bold text-teal-400 text-right shrink-0">
                        {formatPrice((item.price || item.selling_price || 0) * (item.quantity || item.qty || 1))}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center text-sm font-bold pt-2 border-t border-zinc-850">
                  <span className="text-zinc-400">Total Order Amount</span>
                  <span className="font-mono text-teal-400 text-base">{formatPrice(selectedDetailedOrder.order_total)}</span>
                </div>
              </div>

              {/* Current Lifecycle Status */}
              <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-850 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-zinc-500 block font-bold uppercase">Current Order Status</span>
                  <span className="text-xs font-extrabold uppercase text-white font-mono mt-0.5 block tracking-wider">
                    {selectedDetailedOrder.order_status}
                  </span>
                </div>
                <span className={`w-3.5 h-3.5 rounded-full border border-zinc-950 shadow animate-pulse ${
                  selectedDetailedOrder.order_status === 'paid' ? 'bg-green-500' :
                  selectedDetailedOrder.order_status === 'refunded' ? 'bg-indigo-500' :
                  selectedDetailedOrder.order_status === 'pending' ? 'bg-amber-500' :
                  selectedDetailedOrder.order_status === 'fulfilled' ? 'bg-teal-500' : 'bg-red-500'
                }`} />
              </div>
            </div>

            {/* Actions Drawer Footer */}
            <div className="p-6 border-t border-zinc-800 bg-zinc-955 space-y-3 shrink-0">
              <button
                onClick={() => handlePrintCourierSlip(selectedDetailedOrder)}
                className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-zinc-955 font-bold rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Courier Manifest Label
              </button>

              <div className="grid grid-cols-2 gap-3">
                {/* Fulfill action */}
                {(selectedDetailedOrder.order_status === 'pending' || selectedDetailedOrder.order_status === 'paid') ? (
                  <button
                    onClick={() => {
                      try {
                        mockDb.fulfillOrder(merchantId, merchantId, selectedDetailedOrder.order_id);
                        const updated = mockDb.getOrders(merchantId, merchantId);
                        setOrders(updated);
                        const fresh = updated.find(x => x.order_id === selectedDetailedOrder.order_id);
                        if (fresh) setSelectedDetailedOrder(fresh);
                        setMetrics(mockDb.getDashboardMetrics(merchantId, merchantId));
                        toast.success('Order status successfully marked as FULFILLED.');
                      } catch (err: any) {
                        toast.error(err.message || 'Failed to fulfill order');
                      }
                    }}
                    className="py-2.5 bg-zinc-800 hover:bg-zinc-750 text-teal-400 border border-zinc-700 text-xs font-bold rounded-xl transition"
                  >
                    Mark Fulfilled
                  </button>
                ) : null}

                {/* Refund action */}
                {selectedDetailedOrder.order_status === 'paid' ? (
                  <button
                    onClick={() => {
                      if (confirm(`Authorize full refund of ${formatPrice(selectedDetailedOrder.order_total)} for this order?`)) {
                        try {
                          mockDb.refundOrder(merchantId, merchantId, selectedDetailedOrder.order_id, selectedDetailedOrder.order_total);
                          const updated = mockDb.getOrders(merchantId, merchantId);
                          setOrders(updated);
                          const fresh = updated.find(x => x.order_id === selectedDetailedOrder.order_id);
                          if (fresh) setSelectedDetailedOrder(fresh);
                          setMetrics(mockDb.getDashboardMetrics(merchantId, merchantId));
                          toast.success('Order successfully REFUNDED.');
                        } catch (err: any) {
                          toast.error(err.message || 'Failed to refund order');
                        }
                      }
                    }}
                    className="py-2.5 bg-zinc-800 hover:bg-zinc-750 text-indigo-400 border border-zinc-700 text-xs font-bold rounded-xl transition"
                  >
                    Refund Order
                  </button>
                ) : null}

                {/* Cancel action */}
                {(selectedDetailedOrder.order_status === 'pending' || selectedDetailedOrder.order_status === 'paid') ? (
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to CANCEL order ${selectedDetailedOrder.order_id}?`)) {
                        try {
                          mockDb.cancelOrder(merchantId, merchantId, selectedDetailedOrder.order_id);
                          const updated = mockDb.getOrders(merchantId, merchantId);
                          setOrders(updated);
                          const fresh = updated.find(x => x.order_id === selectedDetailedOrder.order_id);
                          if (fresh) setSelectedDetailedOrder(fresh);
                          setMetrics(mockDb.getDashboardMetrics(merchantId, merchantId));
                          toast.success('Order successfully CANCELLED.');
                        } catch (err: any) {
                          toast.error(err.message || 'Failed to cancel order');
                        }
                      }
                    }}
                    className="py-2.5 bg-red-955/20 hover:bg-red-955/40 text-red-400 border border-red-900/50 text-xs font-bold rounded-xl transition col-span-2"
                  >
                    Cancel Order
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
