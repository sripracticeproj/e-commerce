// Step 4: Merchant Dashboard Configuration View
import React, { useState, useEffect } from 'react';
import { mockDb } from '../../lib/mock-db';
import { StorefrontConfig, Product, PaymentGatewayConfig, Order, Customer } from '../../types';

interface DashboardProps {
  merchantId: string;
}

export const MerchantDashboard: React.FC<DashboardProps> = ({ merchantId }) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'branding' | 'navigation' | 'layout' | 'gateways' | 'products' | 'orders' | 'customers'>('analytics');
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

  // Category modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Form states for gateways
  const [stripeActive, setStripeActive] = useState(false);
  const [stripePubKey, setStripePubKey] = useState('');
  const [proxyActive, setProxyActive] = useState(false);
  const [proxyUrl, setProxyUrl] = useState('');
  const [proxySecret, setProxySecret] = useState('');

  // Customer creation form state
  const [newCustName, setNewCustName] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [showCustModal, setShowCustModal] = useState(false);

  useEffect(() => {
    const loadData = () => {
      const merchant = mockDb.getMerchantById(merchantId);
      if (merchant) {
        setMerchantName(merchant.name);
      }
      const currentConfig = mockDb.getStorefrontConfig(merchantId);
      setConfig(currentConfig);

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

      const calculatedMetrics = mockDb.getDashboardMetrics(merchantId, merchantId);
      setMetrics(calculatedMetrics);

      const currencyConf = mockDb.getMerchantConfig(merchantId);
      if (currencyConf) {
        setCurrencyCode(currencyConf.currency_code);
        setCurrencySymbol(currencyConf.currency_code === 'INR' ? '₹' : currencyConf.currency_code === 'EUR' ? '€' : '$');
      } else {
        setCurrencyCode('USD');
        setCurrencySymbol('$');
      }
    };

    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, [merchantId]);

  const formatPrice = (amount: number) => `${currencySymbol}${amount.toFixed(2)}`;

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

  const handleDeleteProduct = (productId: string) => {
    mockDb.deleteProduct(merchantId, merchantId, productId);
    setProducts(mockDb.getProducts(merchantId));
    setMetrics(mockDb.getDashboardMetrics(merchantId, merchantId));
  };

  // Save Gateway Credentials
  const handleSaveGateways = () => {
    mockDb.updatePaymentGateway(merchantId, merchantId, 'stripe', { publicKey: stripePubKey }, stripeActive);
    mockDb.updatePaymentGateway(merchantId, merchantId, 'proxy_hook', { webhookUrl: proxyUrl, secret: proxySecret }, proxyActive);
    setGateways(mockDb.getPaymentGateways(merchantId, merchantId));
    alert('Payment Gateway configurations saved successfully.');
  };

  if (!config || !metrics) return <div className="p-8 text-zinc-500">Loading multi-tenant console...</div>;

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
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
          <div className="space-y-8 animate-fadeIn max-w-2xl">
            <div>
              <h2 className="text-2xl font-bold">Storefront Branding</h2>
              <p className="text-sm text-zinc-400 mt-1">Define global visual tokens mapping storefront designs.</p>
            </div>
            
            <div className="space-y-6 bg-zinc-900 p-6 rounded-xl border border-zinc-800">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase text-zinc-400 font-semibold tracking-wider mb-2">Primary Theme Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={config.theme.primary_color}
                      onChange={(e) => saveConfig({
                        ...config,
                        theme: { ...config.theme, primary_color: e.target.value }
                      })}
                      className="w-10 h-10 bg-transparent rounded cursor-pointer border border-zinc-700"
                    />
                    <input
                      type="text"
                      value={config.theme.primary_color}
                      onChange={(e) => saveConfig({
                        ...config,
                        theme: { ...config.theme, primary_color: e.target.value }
                      })}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs uppercase text-zinc-400 font-semibold tracking-wider mb-2">Secondary/Background Color</label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={config.theme.secondary_color}
                      onChange={(e) => saveConfig({
                        ...config,
                        theme: { ...config.theme, secondary_color: e.target.value }
                      })}
                      className="w-10 h-10 bg-transparent rounded cursor-pointer border border-zinc-700"
                    />
                    <input
                      type="text"
                      value={config.theme.secondary_color}
                      onChange={(e) => saveConfig({
                        ...config,
                        theme: { ...config.theme, secondary_color: e.target.value }
                      })}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-zinc-400 font-semibold tracking-wider mb-2">Typography Font Family</label>
                <select
                  value={config.theme.font_family}
                  onChange={(e) => saveConfig({
                    ...config,
                    theme: { ...config.theme, font_family: e.target.value }
                  })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2.5 text-sm focus:outline-none focus:border-teal-500"
                >
                  <option value="Inter">Inter (Sans-Serif)</option>
                  <option value="Playfair Display">Playfair Display (Premium Serif)</option>
                  <option value="Outfit">Outfit (Geometric Modern)</option>
                  <option value="Roboto">Roboto (Clean Transitional)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase text-zinc-400 font-semibold tracking-wider mb-2">Component Border Radius</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.125"
                    value={parseFloat(config.theme.border_radius)}
                    onChange={(e) => saveConfig({
                      ...config,
                      theme: { ...config.theme, border_radius: `${e.target.value}rem` }
                    })}
                    className="flex-1 accent-teal-500"
                  />
                  <span className="text-sm font-mono bg-zinc-950 px-3 py-1 rounded border border-zinc-800">{config.theme.border_radius}</span>
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
                    <label htmlFor="product-image" className="block text-xs text-zinc-400 mb-1">Image URL</label>
                    <input
                      id="product-image"
                      type="text"
                      placeholder="https://..."
                      value={newProdImg}
                      onChange={(e) => setNewProdImg(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-850 rounded px-3 py-2 text-sm focus:outline-none text-zinc-200 font-mono"
                    />
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
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="px-3 py-1.5 border border-red-900/50 hover:bg-red-950/20 text-red-400 text-xs rounded transition"
                          >
                            Delete
                          </button>
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
            <div>
              <h2 className="text-2xl font-bold">Order History Logs</h2>
              <p className="text-sm text-zinc-400 mt-1">Real-time listing of customer orders scoped to this tenant partition.</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-400">
                  <thead className="text-xs uppercase bg-zinc-950 text-zinc-300">
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
                    {orders.map((o) => {
                      const cust = customers.find(c => c.customer_id === o.customer_id);
                      return (
                        <tr key={o.order_id} className="border-b border-zinc-800/50 hover:bg-zinc-800/10 transition">
                          <td className="px-6 py-4 font-mono text-xs text-zinc-200 font-bold">{o.order_id}</td>
                          <td className="px-6 py-4">
                            {cust ? (
                              <div>
                                <p className="font-semibold text-zinc-200">{cust.name}</p>
                                <p className="text-[10px] text-zinc-500">{cust.email}</p>
                              </div>
                            ) : (
                              <span className="text-zinc-500 italic">Guest Buyer</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-xs text-zinc-400">{new Date(o.created_at).toLocaleString()}</td>
                          <td className="px-6 py-4 font-mono font-bold text-teal-400">{formatPrice(o.order_total)}</td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] px-2.5 py-1 rounded-full border font-semibold ${
                              o.order_status === 'paid' ? 'bg-green-950 text-green-400 border-green-800' :
                              o.order_status === 'refunded' ? 'bg-indigo-950 text-indigo-400 border-indigo-850' :
                              o.order_status === 'pending' ? 'bg-amber-950 text-amber-400 border-amber-800' :
                              'bg-zinc-900 text-zinc-400 border-zinc-700'
                            }`}>
                              {o.order_status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {o.order_status === 'paid' && (
                              <button
                                onClick={() => {
                                  if (confirm(`Refund order ${o.order_id} for ${formatPrice(o.order_total)}?`)) {
                                    try {
                                      mockDb.refundOrder(merchantId, merchantId, o.order_id, o.order_total);
                                      setOrders(mockDb.getOrders(merchantId, merchantId));
                                      setMetrics(mockDb.getDashboardMetrics(merchantId, merchantId));
                                    } catch (err: any) {
                                      alert(err.message || 'Failed to refund order');
                                    }
                                  }
                                }}
                                className="px-2.5 py-1 bg-red-950/20 hover:bg-red-950/40 border border-red-900/50 text-red-400 text-xs rounded transition"
                              >
                                Refund
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
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
                  className="flex-1 py-2 bg-teal-500 hover:bg-teal-600 text-zinc-950 rounded text-xs font-bold transition"
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
