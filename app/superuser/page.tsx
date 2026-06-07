'use client';

import React, { useState, useEffect } from 'react';
import { mockDb, supabaseClientSim } from '../../lib/mock-db';
import { MerchantDashboard } from '../../components/dashboard/dashboard-page';
import { Merchant, MerchantAdminAccount } from '../../types';
import { toast } from '../../components/ui/toast';

export default function SuperUserPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [selectedMerchantId, setSelectedMerchantId] = useState('');
  const [role, setRole] = useState<'super_user' | 'merchant_admin'>('super_user');
  const [activeView, setActiveView] = useState<'console' | 'platform_admin'>('platform_admin');
  
  // Onboarding Form States
  const [onboardName, setOnboardName] = useState('');
  const [onboardSlug, setOnboardSlug] = useState('');
  const [showOnboardModal, setShowOnboardModal] = useState(false);

  // Admin Credentials and Login States
  const [currentAdmin, setCurrentAdmin] = useState<MerchantAdminAccount | null>(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Onboarding Admin Credentials Form States
  const [onboardAdminUsername, setOnboardAdminUsername] = useState('');
  const [onboardAdminEmail, setOnboardAdminEmail] = useState('');
  const [onboardAdminPassword, setOnboardAdminPassword] = useState('');

  // Platform Admins Management States
  const [adminsList, setAdminsList] = useState<MerchantAdminAccount[]>([]);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [newAdminMerchantId, setNewAdminMerchantId] = useState('');
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');

  // Edit Admin Credentials States
  const [editingAdmin, setEditingAdmin] = useState<MerchantAdminAccount | null>(null);
  const [showEditAdminModal, setShowEditAdminModal] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<'owner' | 'admin' | 'editor'>('admin');

  // Row state for currency selection changes before saving
  const [tempCurrencies, setTempCurrencies] = useState<Record<string, 'USD' | 'EUR' | 'INR'>>({});

  // Sub-tabs for superuser dashboard
  const [superTab, setSuperTab] = useState<'overview' | 'merchants' | 'admins'>('overview');
  const [searchAdminQuery, setSearchAdminQuery] = useState('');
  const [filterAdminMerchant, setFilterAdminMerchant] = useState('all');

  useEffect(() => {
    // Load active tenants from mock db
    const tenants = mockDb.getMerchants();
    setMerchants(tenants);
    if (tenants.length > 0) {
      setSelectedMerchantId(tenants[0].id);
      supabaseClientSim.auth.setMerchantContext(tenants[0].id);
    }

    // Load active admin session if exists
    const savedAdmin = localStorage.getItem('ai_commerce_admin_session');
    if (savedAdmin) {
      try {
        const parsed = JSON.parse(savedAdmin);
        // Verify it still exists in db
        const verified = mockDb.getMerchantAdmins().find(a => a.id === parsed.id);
        if (verified && verified.username === 'superuser') {
          setCurrentAdmin(verified);
          setRole('super_user');
          setActiveView('platform_admin');
        } else {
          // If not superuser, clear and force superuser login
          localStorage.removeItem('ai_commerce_admin_session');
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Load admins list
    setAdminsList(mockDb.getMerchantAdmins());
  }, []);

  // Sync auth context whenever selected merchant changes
  useEffect(() => {
    if (selectedMerchantId) {
      supabaseClientSim.auth.setMerchantContext(selectedMerchantId);
    }
  }, [selectedMerchantId]);

  const handleRoleChange = (newRole: 'super_user' | 'merchant_admin') => {
    setRole(newRole);
    if (newRole === 'merchant_admin') {
      setActiveView('console');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginUsername || !loginPassword) {
      setLoginError('Username and password are required');
      return;
    }

    const admin = mockDb.verifyMerchantAdmin(loginUsername, loginPassword);
    if (admin) {
      if (admin.username !== 'superuser') {
        setLoginError('Access denied: You must be a Super User to access this portal.');
        return;
      }
      setCurrentAdmin(admin);
      localStorage.setItem('ai_commerce_admin_session', JSON.stringify(admin));
      setRole('super_user');
      setActiveView('platform_admin');
      setLoginUsername('');
      setLoginPassword('');
    } else {
      setLoginError('Invalid admin credentials. Please try again.');
    }
  };

  const handleLogout = () => {
    setCurrentAdmin(null);
    localStorage.removeItem('ai_commerce_admin_session');
  };

  const handleOnboardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardName || !onboardSlug) return;

    // Instantly onboard a new merchant tenant
    const newMerchantId = `m-${Math.random().toString(36).substr(2, 9)}`;
    const newMerchant: Merchant = {
      id: newMerchantId,
      name: onboardName,
      slug: onboardSlug.toLowerCase().replace(/\s+/g, '-'),
      created_at: new Date().toISOString()
    };

    // Add to mockDb
    mockDb.getMerchants().push(newMerchant);
    // Initialize default configuration
    const defaultConf = {
      theme: {
        primary_color: '#3B82F6', // Blue default
        secondary_color: '#F0F9FF',
        font_family: 'Inter',
        border_radius: '0.5rem'
      },
      navigation: [
        { label: 'Home', link: '/' },
        { label: 'Products', link: '/shop' }
      ],
      sections: [
        {
          id: `hero-${newMerchantId}`,
          type: 'hero' as const,
          title: `Welcome to ${onboardName}`,
          visible: true,
          settings: {
            cta_text: 'Shop Now',
            cta_link: '/shop',
            image_url: 'https://images.unsplash.com/photo-1472851294608-062f824d296e?auto=format&fit=crop&w=1200&q=80'
          }
        },
        {
          id: `grid-${newMerchantId}`,
          type: 'product_grid' as const,
          title: 'Featured Collection',
          visible: true,
          settings: {
            limit: 4,
            columns: 2
          }
        }
      ]
    };
    mockDb.updateStorefrontConfig(newMerchantId, newMerchantId, defaultConf);

    // Initialize default merchant configuration (USD default)
    mockDb.updateMerchantConfig(newMerchantId, newMerchantId, onboardName, 'USD');

    // Add 2 mock products
    mockDb.addProduct(newMerchantId, {
      merchant_id: newMerchantId,
      name: `${onboardName} Classic Item`,
      description: 'Our signature product crafted from the finest premium materials, backed by quality assurances.',
      price: 49.99,
      mrp: 59.99,
      selling_price: 49.99,
      image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'
    });

    mockDb.addProduct(newMerchantId, {
      merchant_id: newMerchantId,
      name: 'Essential Companion Pack',
      description: 'The perfect starter accessory bundle for daily use and travel comfort.',
      price: 29.99,
      mrp: 39.99,
      selling_price: 29.99,
      image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80'
    });

    // Add gateway
    mockDb.updatePaymentGateway(newMerchantId, newMerchantId, 'stripe', { publicKey: `pk_test_${newMerchantId}` }, true);
    mockDb.updatePaymentGateway(newMerchantId, newMerchantId, 'cod', { active: true }, true);

    // Create admin credentials
    if (onboardAdminUsername && onboardAdminEmail && onboardAdminPassword) {
      mockDb.addMerchantAdmin(newMerchantId, onboardAdminEmail, onboardAdminUsername, onboardAdminPassword);
    } else {
      // Default admin account
      mockDb.addMerchantAdmin(newMerchantId, `admin@${newMerchant.slug}.com`, `${newMerchant.slug}_admin`, 'password123');
    }

    // Refresh data
    const updatedTenants = mockDb.getMerchants();
    setMerchants(updatedTenants);
    setSelectedMerchantId(newMerchantId);
    setAdminsList([...mockDb.getMerchantAdmins()]);
    toast.success(`Merchant store "${onboardName}" provisioned successfully!`);

    // Reset Form
    setOnboardName('');
    setOnboardSlug('');
    setOnboardAdminUsername('');
    setOnboardAdminEmail('');
    setOnboardAdminPassword('');
    setShowOnboardModal(false);
  };

  const activeMerchant = merchants.find(m => m.id === selectedMerchantId);

  // Security Access Denied block if session is parsed and is not superuser
  if (currentAdmin && currentAdmin.username !== 'superuser') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-zinc-955 text-zinc-150 font-sans">
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl max-w-md text-center space-y-4 shadow-2xl">
          <p className="text-red-400 text-4xl">⚠️</p>
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
          <p className="text-xs text-zinc-400">Only the Platform Super User has authorization to access the global admin portal.</p>
          <a href="/merchant" className="inline-block px-4 py-2 bg-teal-500 hover:bg-teal-650 text-zinc-955 text-xs font-bold rounded transition">
            Go to Merchant Console
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden">
      
      {!currentAdmin ? (
        /* Super User Login Screen */
        <div className="flex-1 flex items-center justify-center p-8 bg-zinc-955 animate-fadeIn">
          <div className="relative max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <span className="w-12 h-12 bg-teal-500/10 border border-teal-500/30 text-teal-450 text-2xl font-bold rounded-xl flex items-center justify-center mx-auto mb-2">
                🛡️
              </span>
              <h2 className="text-xl font-extrabold text-white">Super User Portal</h2>
              <p className="text-xs text-zinc-400">Enter your platform administrator credentials.</p>
            </div>

            {loginError && (
              <div className="p-3 bg-red-950/20 border border-red-900/50 text-red-400 text-xs rounded-lg font-medium animate-fadeIn">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Super User Username</label>
                <input
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="superuser"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 text-zinc-200"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 text-zinc-200"
                />
              </div>
              
              <button
                type="submit"
                className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-zinc-950 font-bold rounded-lg text-sm transition"
              >
                Access Platform Console
              </button>
            </form>

            <div className="border-t border-zinc-800/80 pt-4 text-center">
              <span className="text-[10px] text-zinc-500 block uppercase font-mono tracking-widest mb-2">Demo Admin Login</span>
              <div className="bg-zinc-955 p-2.5 rounded border border-zinc-850 text-left max-w-[200px] mx-auto text-[10px] font-mono">
                <p className="text-teal-400 font-bold">Platform Super User</p>
                <p className="mt-0.5">User: superuser</p>
                <p>Pass: password123</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Authenticated Superuser Workspace */
        <>
          {/* LEFT SIDEBAR NAVIGATION */}
          <aside className="w-64 border-r border-zinc-850 bg-zinc-900 flex flex-col justify-between shrink-0">
            <div>
              {/* Logo block */}
              <div className="p-6 border-b border-zinc-850 flex items-center space-x-3">
                <span className="w-6 h-6 bg-gradient-to-tr from-teal-400 to-indigo-500 rounded-lg flex items-center justify-center text-xs shadow-md shadow-teal-500/20">🛡️</span>
                <div>
                  <h1 className="text-xs font-black tracking-widest text-white uppercase bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">
                    Platform Admin
                  </h1>
                  <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">Superuser Console</p>
                </div>
              </div>

              {/* Navigation tabs */}
              <nav className="p-4 space-y-1.5">
                <button
                  onClick={() => {
                    setActiveView('platform_admin');
                    setSuperTab('overview');
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeView === 'platform_admin' && superTab === 'overview'
                      ? 'bg-zinc-800 text-teal-400 border-l-4 border-teal-500'
                      : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
                  </svg>
                  <span>Platform Overview</span>
                </button>

                <button
                  onClick={() => {
                    setActiveView('platform_admin');
                    setSuperTab('merchants');
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeView === 'platform_admin' && superTab === 'merchants'
                      ? 'bg-zinc-800 text-teal-400 border-l-4 border-teal-500'
                      : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Merchant Directory</span>
                </button>

                <button
                  onClick={() => {
                    setActiveView('platform_admin');
                    setSuperTab('admins');
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeView === 'platform_admin' && superTab === 'admins'
                      ? 'bg-zinc-800 text-teal-400 border-l-4 border-teal-500'
                      : 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200'
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span>Store Administrators</span>
                </button>

                {role === 'super_user' && activeView === 'console' && (
                  <div className="pt-4 pb-2 border-t border-zinc-850 my-2">
                    <span className="px-4 text-[9px] font-mono uppercase text-zinc-500 block font-bold tracking-widest">Active Preview Sandbox</span>
                    <button
                      onClick={() => setActiveView('platform_admin')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold bg-red-955/20 hover:bg-red-955/40 text-red-400 border border-red-900/40 mt-2 transition"
                    >
                      ← Exit Preview Mode
                    </button>
                  </div>
                )}
                
                <div className="pt-4 pb-2 border-t border-zinc-850 my-2">
                  <span className="px-4 text-[9px] font-mono uppercase text-zinc-500 block font-bold tracking-widest">Provisioning Actions</span>
                </div>

                <button
                  onClick={() => setShowOnboardModal(true)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold bg-teal-950/30 hover:bg-teal-950/60 border border-teal-900/40 text-teal-400 transition"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Onboard New Tenant</span>
                </button>
              </nav>
            </div>

            {/* Sidebar Footer */}
            <div className="p-4 border-t border-zinc-850 bg-zinc-950/50 space-y-3">
              <div className="flex items-center space-x-3 bg-zinc-900 border border-zinc-850 p-2.5 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-teal-450">@</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-zinc-200 truncate">Super User Account</p>
                  <p className="text-[9px] text-zinc-500 font-mono truncate">active_session: rls_master</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full py-2 bg-zinc-900 hover:bg-red-955/20 text-zinc-450 hover:text-red-400 border border-zinc-800 hover:border-red-900/50 text-xs font-bold rounded-xl transition"
              >
                Logout Session
              </button>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 flex flex-col bg-zinc-950 overflow-hidden">
            
            {/* Conditional Render Sandbox Preview or Platform Tab */}
            {activeView === 'console' && activeMerchant ? (
              <div className="w-full h-full flex flex-col">
                <div className="bg-gradient-to-r from-red-955/20 via-zinc-950 to-zinc-950 border-b border-red-900/50 px-6 py-2.5 flex items-center justify-between text-xs shrink-0 z-10 shadow-lg font-sans">
                  <div className="flex items-center space-x-3 text-red-400 font-mono text-[10px] tracking-wider">
                    <span className="animate-pulse inline-block w-2.5 h-2.5 rounded-full bg-red-500 shadow-md shadow-red-500/50" />
                    <span className="font-extrabold uppercase">Security Override Sandbox (RLS Context)</span>
                    <span className="text-zinc-700">|</span>
                    <span className="text-zinc-300 font-sans">Superuser previewing console for: <strong className="text-white text-xs">{activeMerchant.name}</strong></span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <a
                      href={`/store/${activeMerchant.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-750 text-[10px] font-bold rounded-lg transition-all"
                    >
                      View Storefront ↗
                    </a>
                    <button
                      onClick={() => setActiveView('platform_admin')}
                      className="px-3 py-1 bg-red-950/50 hover:bg-red-900/40 text-red-300 border border-red-900/50 text-[10px] font-bold rounded-lg transition-all"
                    >
                      ← Exit Sandbox Preview
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <MerchantDashboard 
                    key={`dash-${selectedMerchantId}`} 
                    merchantId={selectedMerchantId} 
                    currentAdminId={currentAdmin?.id} 
                  />
                </div>
              </div>
            ) : (
              /* Normal Admin Tab Space */
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top header */}
                <header className="h-16 border-b border-zinc-850 px-8 flex items-center justify-between shrink-0 bg-zinc-900/20 backdrop-blur-md">
                  <h2 className="text-base font-extrabold text-white font-sans">
                    {superTab === 'overview' && 'Platform Overview Metrics'}
                    {superTab === 'merchants' && 'Merchant Profiles & Tenant Directories'}
                    {superTab === 'admins' && 'Administrative Account Directories'}
                  </h2>
                  
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-zinc-400 font-semibold bg-zinc-900 border border-zinc-850 px-3 py-1 rounded-xl">
                      Active tenants: <strong className="text-teal-400 font-mono">{merchants.length}</strong>
                    </span>
                    <span className="text-xs text-zinc-400 font-semibold bg-zinc-900 border border-zinc-850 px-3 py-1 rounded-xl">
                      Total admins: <strong className="text-teal-400 font-mono">{adminsList.filter(admin => admin.username !== 'superuser').length}</strong>
                    </span>
                  </div>
                </header>

                {/* Sub-tab scroll workspace */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 max-w-5xl w-full mx-auto">
                  
                  {/* OVERVIEW SCREEN */}
                  {superTab === 'overview' && (
                    <div className="space-y-8 animate-fadeIn">
                      
                      {/* Metric cards */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="p-6 bg-zinc-900 border border-zinc-850 rounded-2xl shadow-xl flex flex-col justify-between">
                          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Provisioned Stores</span>
                          <span className="text-3xl font-black text-white mt-2 font-sans">{merchants.length}</span>
                          <span className="text-[10px] text-zinc-550 mt-1 font-mono">Total SaaS tenants</span>
                        </div>

                        <div className="p-6 bg-zinc-900 border border-zinc-850 rounded-2xl shadow-xl flex flex-col justify-between">
                          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Store Operators</span>
                          <span className="text-3xl font-black text-indigo-400 mt-2 font-sans">
                            {adminsList.filter(admin => admin.username !== 'superuser').length}
                          </span>
                          <span className="text-[10px] text-zinc-550 mt-1 font-mono">Excluding superuser</span>
                        </div>

                        <div className="p-6 bg-zinc-900 border border-zinc-850 rounded-2xl shadow-xl flex flex-col justify-between">
                          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Total Transactions</span>
                          <span className="text-3xl font-black text-pink-400 mt-2 font-sans">
                            {merchants.flatMap(m => mockDb.getOrders(m.id, m.id) || []).length}
                          </span>
                          <span className="text-[10px] text-zinc-550 mt-1 font-mono">Aggregated logs count</span>
                        </div>

                        <div className="p-6 bg-zinc-900 border border-zinc-850 rounded-2xl shadow-xl flex flex-col justify-between">
                          <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Platform Gross GMV</span>
                          <span className="text-3xl font-black text-teal-405 mt-2 font-mono">
                            ${merchants.flatMap(m => mockDb.getOrders(m.id, m.id) || [])
                              .reduce((sum, o) => sum + (o.order_status === 'refunded' ? 0 : o.order_total), 0)
                              .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          <span className="text-[10px] text-zinc-550 mt-1 font-mono">Equivalent USD value</span>
                        </div>
                      </div>

                      {/* Banner quick provisioning */}
                      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-teal-950/20 border border-zinc-850 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                        <div className="space-y-1 md:max-w-2xl text-left">
                          <h3 className="text-base font-extrabold text-white">Provision another e-commerce tenant instantly?</h3>
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            Onboard a new merchant space with default visual catalog presets, active mock gateways, 2 featured starter products, and ready-to-use admin logins.
                          </p>
                        </div>
                        <button
                          onClick={() => setShowOnboardModal(true)}
                          className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-zinc-950 text-xs font-bold rounded-xl transition shadow-lg shadow-teal-500/10 shrink-0 font-sans"
                        >
                          ⚡ Onboard Tenant Instantly
                        </button>
                      </div>

                      {/* Currency Locale Distribution */}
                      <div className="bg-zinc-900 border border-zinc-850 rounded-2xl p-6 shadow-xl space-y-4">
                        <h3 className="text-xs font-bold text-white uppercase tracking-widest text-left">Currency Locale Bindings</h3>
                        <div className="space-y-3">
                          {['USD', 'EUR', 'INR'].map(currency => {
                            const count = merchants.filter(m => (mockDb.getMerchantConfig(m.id)?.currency_code || 'USD') === currency).length;
                            const pct = merchants.length > 0 ? (count / merchants.length) * 100 : 0;
                            return (
                              <div key={currency} className="space-y-1">
                                <div className="flex justify-between text-xs font-mono">
                                  <span className="text-zinc-400 font-bold">{currency} locale bindings</span>
                                  <span className="text-zinc-500">{count} Store(s) ({pct.toFixed(0)}%)</span>
                                </div>
                                <div className="w-full bg-zinc-950 rounded-full h-2 overflow-hidden border border-zinc-850">
                                  <div 
                                    className={`h-full transition-all duration-500 rounded-full ${
                                      currency === 'USD' ? 'bg-teal-500' : currency === 'EUR' ? 'bg-indigo-500' : 'bg-pink-500'
                                    }`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MERCHANTS SCREEN */}
                  {superTab === 'merchants' && (
                    <div className="bg-zinc-900 border border-zinc-850 rounded-2xl p-6 shadow-xl space-y-6 animate-fadeIn text-left">
                      <div>
                        <h3 className="text-base font-bold text-white">Merchant Subdomains & Currencies</h3>
                        <p className="text-xs text-zinc-400 mt-1">Configure active client storefront details, update slug subdomains, and manage currency settings.</p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-zinc-450">
                          <thead className="text-xs uppercase bg-zinc-955 text-zinc-300">
                            <tr>
                              <th className="px-6 py-3.5 rounded-l-xl">Merchant Name</th>
                              <th className="px-6 py-3.5">Subdomain Slug</th>
                              <th className="px-6 py-3.5">Currency Locale</th>
                              <th className="px-6 py-3.5 rounded-r-xl text-right">Preview Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {merchants.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="text-center py-10 text-zinc-500 italic">No stores provisioned yet.</td>
                              </tr>
                            ) : (
                              merchants.map((m) => {
                                const config = mockDb.getMerchantConfig(m.id) || { currency_code: 'USD' };
                                const currentSel = tempCurrencies[m.id] || config.currency_code;
                                const hasChanged = tempCurrencies[m.id] !== undefined && tempCurrencies[m.id] !== config.currency_code;

                                return (
                                  <tr key={m.id} className="border-b border-zinc-850/50 hover:bg-zinc-800/10 transition">
                                    <td className="px-6 py-4 font-semibold text-zinc-200">
                                      <input
                                        type="text"
                                        value={m.name}
                                        onChange={(e) => {
                                          const newName = e.target.value;
                                          setMerchants(prev => prev.map(item => item.id === m.id ? { ...item, name: newName } : item));
                                          mockDb.updateMerchantConfig(m.id, m.id, newName, config.currency_code as 'USD'|'EUR'|'INR');
                                        }}
                                        className="bg-transparent border-b border-dashed border-zinc-700 hover:border-teal-500 focus:border-teal-500 focus:outline-none px-1 py-0.5 w-64 text-zinc-100 font-semibold"
                                      />
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs text-zinc-450">{m.slug}</td>
                                    <td className="px-6 py-4">
                                      <div className="flex items-center space-x-2">
                                        <select
                                          value={currentSel}
                                          onChange={(e) => {
                                            const newCurr = e.target.value as 'USD' | 'EUR' | 'INR';
                                            setTempCurrencies(prev => ({ ...prev, [m.id]: newCurr }));
                                          }}
                                          className="bg-zinc-950 border border-zinc-850 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                                        >
                                          <option value="USD">USD ($)</option>
                                          <option value="EUR">EUR (€)</option>
                                          <option value="INR">INR (₹)</option>
                                        </select>
                                        {hasChanged && (
                                          <button
                                            onClick={() => {
                                              mockDb.updateMerchantConfig(m.id, m.id, m.name, currentSel);
                                              setMerchants([...mockDb.getMerchants()]);
                                              setTempCurrencies(prev => {
                                                const copy = { ...prev };
                                                delete copy[m.id];
                                                return copy;
                                              });
                                              toast.success(`Currency for ${m.name} successfully updated to ${currentSel}.`);
                                            }}
                                            className="px-2.5 py-1.5 bg-green-500 hover:bg-green-600 text-zinc-950 text-xs font-bold rounded-lg transition shadow-lg shadow-green-500/10"
                                          >
                                            Save
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                      <button
                                        onClick={() => {
                                          setSelectedMerchantId(m.id);
                                          setActiveView('console');
                                        }}
                                        className="px-3.5 py-1.5 bg-zinc-850 hover:bg-zinc-800 text-teal-400 border border-zinc-700 text-xs font-bold rounded-lg transition"
                                      >
                                        Manage Preview
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
                  )}

                  {/* ADMINS SCREEN */}
                  {superTab === 'admins' && (
                    <div className="bg-zinc-900 border border-zinc-850 rounded-2xl p-6 shadow-xl space-y-6 animate-fadeIn text-left">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-850 pb-4">
                        <div>
                          <h3 className="text-base font-bold text-white">Merchant Admin Accounts</h3>
                          <p className="text-xs text-zinc-400 mt-1">Credentials used by merchant admins to authenticate and access their stores.</p>
                        </div>
                        <button
                          onClick={() => {
                            if (merchants.length > 0) {
                              setNewAdminMerchantId(merchants[0].id);
                              setShowCreateAdminModal(true);
                            } else {
                              toast.warning('Please onboard a merchant first.');
                            }
                          }}
                          className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-650 text-zinc-950 text-xs font-bold rounded-lg transition shrink-0"
                        >
                          + Create Merchant Admin
                        </button>
                      </div>

                      {/* Filters */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Search Account Profiles</label>
                          <input
                            type="text"
                            value={searchAdminQuery}
                            onChange={(e) => setSearchAdminQuery(e.target.value)}
                            placeholder="Search by username or email..."
                            className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500 text-zinc-200"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Filter by Store Tenant</label>
                          <select
                            value={filterAdminMerchant}
                            onChange={(e) => setFilterAdminMerchant(e.target.value)}
                            className="w-full bg-zinc-955 border border-zinc-850 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-teal-500 text-zinc-200 cursor-pointer"
                          >
                            <option value="all">All Stores</option>
                            {merchants.map(m => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-zinc-400">
                          <thead className="text-xs uppercase bg-zinc-955 text-zinc-300">
                            <tr>
                              <th className="px-6 py-3.5 rounded-l-xl">Username</th>
                              <th className="px-6 py-3.5">Email</th>
                              <th className="px-6 py-3.5">Merchant Store</th>
                              <th className="px-6 py-3.5">Password (Cleartext)</th>
                              <th className="px-6 py-3.5">Role</th>
                              <th className="px-6 py-3.5 rounded-r-xl text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {adminsList
                              .filter(admin => admin.username !== 'superuser')
                              .filter(admin => {
                                if (filterAdminMerchant !== 'all' && admin.merchant_id !== filterAdminMerchant) return false;
                                if (searchAdminQuery) {
                                  const q = searchAdminQuery.toLowerCase();
                                  return admin.username.toLowerCase().includes(q) || admin.email.toLowerCase().includes(q);
                                }
                                return true;
                              })
                              .map((admin) => {
                                const store = merchants.find(m => m.id === admin.merchant_id);
                                return (
                                  <tr key={admin.id} className="border-b border-zinc-850/50 hover:bg-zinc-800/10 transition">
                                    <td className="px-6 py-4 font-semibold text-zinc-200">{admin.username}</td>
                                    <td className="px-6 py-4 font-mono text-xs text-zinc-450">{admin.email}</td>
                                    <td className="px-6 py-4 text-zinc-350">{store ? store.name : 'Unknown Store'}</td>
                                    <td className="px-6 py-4 font-mono text-xs text-zinc-450">{admin.password}</td>
                                    <td className="px-6 py-4">
                                      <span className="bg-zinc-805 text-teal-400 border border-zinc-700 text-[10px] px-2 py-0.5 rounded font-mono uppercase">
                                        {admin.role}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2 shrink-0">
                                      <button
                                        onClick={() => {
                                          setEditingAdmin(admin);
                                          setEditUsername(admin.username);
                                          setEditEmail(admin.email);
                                          setEditPassword(admin.password || '');
                                          setEditRole(admin.role);
                                          setShowEditAdminModal(true);
                                        }}
                                        className="px-2.5 py-1 bg-zinc-805 hover:bg-zinc-750 text-teal-400 border border-zinc-700 text-xs font-bold rounded-lg transition"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => {
                                          if (confirm(`Are you sure you want to delete user ${admin.username}?`)) {
                                            mockDb.deleteMerchantAdmin(admin.id);
                                            setAdminsList([...mockDb.getMerchantAdmins()]);
                                            toast.success(`Admin account @${admin.username} deleted.`);
                                          }
                                        }}
                                        className="px-2.5 py-1 bg-red-955/20 hover:bg-red-955/40 border border-red-900/50 text-red-400 text-xs font-bold rounded-lg transition"
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}
          </main>
        </>
      )}

      {/* Instantly Onboard Tenant Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowOnboardModal(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div className="relative bg-zinc-900 border border-zinc-850 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-zinc-205 animate-scaleUp">
            <div>
              <h3 className="text-base font-extrabold text-white">Onboard New Store Tenant</h3>
              <p className="text-xs text-zinc-400 mt-1 font-sans">Setup domain, default catalog items, and mock payment channels.</p>
            </div>
            
            <form onSubmit={handleOnboardSubmit} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Store / Merchant Name</label>
                <input
                  type="text"
                  required
                  value={onboardName}
                  onChange={(e) => {
                    setOnboardName(e.target.value);
                    setOnboardSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                  }}
                  placeholder="e.g. Neon Optics"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 text-zinc-200"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Subdomain Slug</label>
                <input
                  type="text"
                  required
                  value={onboardSlug}
                  onChange={(e) => setOnboardSlug(e.target.value)}
                  placeholder="neon-optics"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 font-mono text-teal-400"
                />
              </div>

              <div className="border-t border-zinc-850 pt-4 mt-4 space-y-3">
                <span className="text-xs font-bold text-teal-400 block uppercase tracking-wider">Initial Admin Credentials</span>
                
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Admin Username</label>
                  <input
                    type="text"
                    required
                    value={onboardAdminUsername}
                    onChange={(e) => setOnboardAdminUsername(e.target.value)}
                    placeholder="e.g. neon_admin"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 text-zinc-200"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Admin Email Address</label>
                  <input
                    type="email"
                    required
                    value={onboardAdminEmail}
                    onChange={(e) => setOnboardAdminEmail(e.target.value)}
                    placeholder="admin@store.com"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 text-zinc-200"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Admin Password</label>
                  <input
                    type="password"
                    required
                    value={onboardAdminPassword}
                    onChange={(e) => setOnboardAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 text-zinc-200"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowOnboardModal(false);
                    setOnboardAdminUsername('');
                    setOnboardAdminEmail('');
                    setOnboardAdminPassword('');
                  }}
                  className="flex-1 py-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 rounded text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-teal-500 hover:bg-teal-600 text-zinc-955 rounded text-xs font-bold transition"
                >
                  Provision Space
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Merchant Admin Modal */}
      {showCreateAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowCreateAdminModal(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div className="relative bg-zinc-900 border border-zinc-850 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-zinc-200 animate-scaleUp">
            <div>
              <h3 className="text-base font-extrabold text-white">Create Merchant Admin</h3>
              <p className="text-xs text-zinc-400 mt-1">Assign a new administrator account to a merchant store.</p>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!newAdminUsername || !newAdminEmail || !newAdminPassword || !newAdminMerchantId) return;

              mockDb.addMerchantAdmin(newAdminMerchantId, newAdminEmail, newAdminUsername, newAdminPassword);
              setAdminsList([...mockDb.getMerchantAdmins()]);
              toast.success(`Admin @${newAdminUsername} created successfully.`);
              
              setNewAdminUsername('');
              setNewAdminEmail('');
              setNewAdminPassword('');
              setShowCreateAdminModal(false);
            }} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Target Store</label>
                <select
                  value={newAdminMerchantId}
                  onChange={(e) => setNewAdminMerchantId(e.target.value)}
                  className="w-full bg-zinc-955 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 text-zinc-200 cursor-pointer"
                >
                  {merchants.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={newAdminUsername}
                  onChange={(e) => setNewAdminUsername(e.target.value)}
                  placeholder="e.g. custom_admin"
                  className="w-full bg-zinc-955 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 text-zinc-200"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-zinc-955 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 text-zinc-200"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-955 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 text-zinc-200"
                />
              </div>
              
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateAdminModal(false);
                    setNewAdminUsername('');
                    setNewAdminEmail('');
                    setNewAdminPassword('');
                  }}
                  className="flex-1 py-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 rounded text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-teal-500 hover:bg-teal-600 text-zinc-955 rounded text-xs font-bold transition"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Merchant Admin Modal */}
      {showEditAdminModal && editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => {
            setShowEditAdminModal(false);
            setEditingAdmin(null);
          }} className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div className="relative bg-zinc-900 border border-zinc-850 rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-zinc-200 animate-scaleUp">
            <div>
              <h3 className="text-base font-extrabold text-white">Edit Merchant Admin</h3>
              <p className="text-xs text-zinc-400 mt-1">Modify credentials or role for this store admin.</p>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!editUsername || !editEmail || !editPassword) return;

              mockDb.updateMerchantAdmin(editingAdmin.id, {
                username: editUsername,
                email: editEmail,
                password: editPassword,
                role: editRole
              });
              setAdminsList([...mockDb.getMerchantAdmins()]);
              toast.success(`Admin @${editUsername} updated successfully.`);
              
              setShowEditAdminModal(false);
              setEditingAdmin(null);
            }} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 text-zinc-200"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 text-zinc-200"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Password</label>
                <input
                  type="text"
                  required
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full bg-zinc-955 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 text-zinc-200 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm focus:outline-none focus:border-teal-500 text-zinc-200 cursor-pointer"
                >
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                </select>
              </div>
              
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditAdminModal(false);
                    setEditingAdmin(null);
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
    </div>
  );
}
