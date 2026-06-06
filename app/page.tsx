'use client';

import React, { useState, useEffect } from 'react';
import { mockDb, supabaseClientSim } from '../lib/mock-db';
import { MerchantDashboard } from '../components/dashboard/dashboard-page';
import { Merchant } from '../types';

export default function Home() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [selectedMerchantId, setSelectedMerchantId] = useState('');
  const [role, setRole] = useState<'super_user' | 'merchant_admin'>('super_user');
  const [activeView, setActiveView] = useState<'console' | 'platform_admin'>('platform_admin');
  
  // Onboarding Form States
  const [onboardName, setOnboardName] = useState('');
  const [onboardSlug, setOnboardSlug] = useState('');
  const [showOnboardModal, setShowOnboardModal] = useState(false);

  useEffect(() => {
    // Load active tenants from mock db
    const tenants = mockDb.getMerchants();
    setMerchants(tenants);
    if (tenants.length > 0) {
      setSelectedMerchantId(tenants[0].id);
      supabaseClientSim.auth.setMerchantContext(tenants[0].id);
    }
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

    // Refresh tenants list
    const updatedTenants = mockDb.getMerchants();
    setMerchants(updatedTenants);
    setSelectedMerchantId(newMerchantId);

    // Reset Form
    setOnboardName('');
    setOnboardSlug('');
    setShowOnboardModal(false);
  };

  const activeMerchant = merchants.find(m => m.id === selectedMerchantId);

  return (
    <div className="flex flex-col h-screen bg-zinc-950 font-sans overflow-hidden">
      
      {/* Top Multi-Tenant Control Strip */}
      <header className="h-16 bg-zinc-900 border-b border-zinc-800 px-6 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-gradient-to-tr from-teal-400 to-indigo-500 rounded-full animate-pulse"></span>
            <span className="font-extrabold text-sm text-white tracking-wider uppercase">AI-Commerce Enterprise</span>
          </div>

          <div className="h-4 w-px bg-zinc-800"></div>

          {/* Role Switcher */}
          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5">
            <button
              onClick={() => handleRoleChange('super_user')}
              className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                role === 'super_user' ? 'bg-teal-500 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Super User
            </button>
            <button
              onClick={() => handleRoleChange('merchant_admin')}
              className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                role === 'merchant_admin' ? 'bg-teal-500 text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Merchant Admin
            </button>
          </div>

          {role === 'super_user' && (
            <>
              <div className="h-4 w-px bg-zinc-800"></div>
              {/* Navigation View for Super User */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setActiveView('platform_admin')}
                  className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                    activeView === 'platform_admin' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Platform Portal
                </button>
                <button
                  onClick={() => setActiveView('console')}
                  className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                    activeView === 'console' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Merchant Console
                </button>
              </div>
            </>
          )}

          {/* Active Tenant Selector (Only visible for Super User in Console mode) */}
          {role === 'super_user' && activeView === 'console' && (
            <>
              <div className="h-4 w-px bg-zinc-800"></div>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-zinc-400 font-medium">Select Tenant Space:</span>
                <select
                  value={selectedMerchantId}
                  onChange={(e) => setSelectedMerchantId(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  {merchants.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.slug})</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {activeMerchant && (
            <a
              href={`/store/${activeMerchant.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-1.5 bg-zinc-850 hover:bg-zinc-800 text-zinc-200 border border-zinc-750 text-xs font-bold rounded transition"
            >
              Preview Storefront
            </a>
          )}
          {role === 'super_user' && (
            <button
              onClick={() => setShowOnboardModal(true)}
              className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-600 text-zinc-950 text-xs font-bold rounded transition"
            >
              + Onboard Merchant Instantly
            </button>
          )}
          
          <span className="bg-zinc-800 text-zinc-400 border border-zinc-700 text-[10px] px-2.5 py-1 rounded font-mono">
            {role === 'super_user' ? 'Super User RLS Override' : 'RLS Active'}
          </span>
        </div>
      </header>

      {/* Admin Dashboard Workspace Container */}
      <div className="flex-1 flex overflow-hidden">
        {role === 'super_user' && activeView === 'platform_admin' ? (
          /* Super User Master Admin Portal */
          <div className="flex-1 overflow-y-auto p-8 space-y-8 max-w-4xl mx-auto text-zinc-200 animate-fadeIn">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">Platform Super User Admin Portal</h2>
              <p className="text-sm text-zinc-400 mt-1">Manage global merchant profiles, provision tenants, and bind currency configurations.</p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <h3 className="text-base font-bold text-white">Onboarded Merchant Profiles</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-400">
                  <thead className="text-xs uppercase bg-zinc-950 text-zinc-300">
                    <tr>
                      <th className="px-6 py-3 rounded-l-lg">Merchant Name</th>
                      <th className="px-6 py-3">Slug</th>
                      <th className="px-6 py-3">Currency Binding</th>
                      <th className="px-6 py-3 rounded-r-lg text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {merchants.map((m) => {
                      const config = mockDb.getMerchantConfig(m.id) || { currency_code: 'USD' };
                      return (
                        <tr key={m.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/10 transition">
                          <td className="px-6 py-4 font-semibold text-zinc-200">
                            <input
                              type="text"
                              value={m.name}
                              onChange={(e) => {
                                const newName = e.target.value;
                                setMerchants(prev => prev.map(item => item.id === m.id ? { ...item, name: newName } : item));
                                mockDb.updateMerchantConfig(m.id, m.id, newName, config.currency_code as 'USD'|'EUR'|'INR');
                              }}
                              className="bg-transparent border-b border-dashed border-zinc-700 hover:border-teal-500 focus:border-teal-500 focus:outline-none px-1 py-0.5 w-64"
                            />
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-zinc-400">{m.slug}</td>
                          <td className="px-6 py-4">
                            <select
                              value={config.currency_code}
                              onChange={(e) => {
                                const newCurr = e.target.value as 'USD' | 'EUR' | 'INR';
                                mockDb.updateMerchantConfig(m.id, m.id, m.name, newCurr);
                                setMerchants([...mockDb.getMerchants()]);
                              }}
                              className="bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-teal-500 cursor-pointer"
                            >
                              <option value="USD">USD ($)</option>
                              <option value="EUR">EUR (€)</option>
                              <option value="INR">INR (₹)</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedMerchantId(m.id);
                                setActiveView('console');
                              }}
                              className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-teal-400 border border-zinc-700 text-xs font-bold rounded transition"
                            >
                              Manage Console
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : activeMerchant ? (
          <div className="w-full h-full flex flex-col">
            <div className="h-10 bg-zinc-900 px-6 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400 shrink-0">
              <span className="font-semibold text-zinc-300">Tenant Merchant Console: <span className="text-teal-400 font-bold">{activeMerchant.name}</span></span>
              <span className="font-mono text-[10px] text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                merchant_id: {selectedMerchantId}
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              {/* Dynamically render dashboard page for selected merchant */}
              <MerchantDashboard key={`dash-${selectedMerchantId}`} merchantId={selectedMerchantId} />
            </div>
          </div>
        ) : (
          <div className="m-auto text-zinc-500 text-sm">Please select or onboard a merchant.</div>
        )}
      </div>

      {/* Instantly Onboard Tenant Modal */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowOnboardModal(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
          <div className="relative bg-zinc-900 border border-zinc-850 rounded-xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-zinc-200">
            <div>
              <h3 className="text-base font-extrabold text-white">Onboard New Merchant</h3>
              <p className="text-xs text-zinc-400 mt-1">Provision tenant, catalog indices, and payment adapter hooks.</p>
            </div>
            
            <form onSubmit={handleOnboardSubmit} className="space-y-4">
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
              
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="flex-1 py-2 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 rounded text-xs font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-teal-500 hover:bg-teal-600 text-zinc-950 rounded text-xs font-bold transition"
                >
                  Provision space
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
