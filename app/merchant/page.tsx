'use client';

import React, { useState, useEffect } from 'react';
import { mockDb, supabaseClientSim } from '../../lib/mock-db';
import { MerchantDashboard } from '../../components/dashboard/dashboard-page';
import { Merchant, MerchantAdminAccount } from '../../types';

export default function MerchantPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [selectedMerchantId, setSelectedMerchantId] = useState('');
  
  // Admin Credentials and Login States
  const [currentAdmin, setCurrentAdmin] = useState<MerchantAdminAccount | null>(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

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
        if (verified) {
          setCurrentAdmin(verified);
          setSelectedMerchantId(verified.merchant_id);
          supabaseClientSim.auth.setMerchantContext(verified.merchant_id);
        } else {
          localStorage.removeItem('ai_commerce_admin_session');
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Sync auth context whenever selected merchant changes
  useEffect(() => {
    if (selectedMerchantId) {
      if (selectedMerchantId === 'platform-master' && merchants.length > 0) {
        setSelectedMerchantId(merchants[0].id);
        supabaseClientSim.auth.setMerchantContext(merchants[0].id);
      } else {
        supabaseClientSim.auth.setMerchantContext(selectedMerchantId);
      }
    }
  }, [selectedMerchantId, merchants]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginUsername || !loginPassword) {
      setLoginError('Username and password are required');
      return;
    }

    const admin = mockDb.verifyMerchantAdmin(loginUsername, loginPassword);
    if (admin) {
      setCurrentAdmin(admin);
      localStorage.setItem('ai_commerce_admin_session', JSON.stringify(admin));
      if (admin.username === 'superuser' && merchants.length > 0) {
        setSelectedMerchantId(merchants[0].id);
        supabaseClientSim.auth.setMerchantContext(merchants[0].id);
      } else {
        setSelectedMerchantId(admin.merchant_id);
        supabaseClientSim.auth.setMerchantContext(admin.merchant_id);
      }
      setLoginUsername('');
      setLoginPassword('');
    } else {
      setLoginError('Invalid admin credentials. Please try again.');
    }
  };

  const handleLogout = () => {
    setCurrentAdmin(null);
    localStorage.removeItem('ai_commerce_admin_session');
    // Default back to first merchant
    const tenants = mockDb.getMerchants();
    if (tenants.length > 0) {
      setSelectedMerchantId(tenants[0].id);
      supabaseClientSim.auth.setMerchantContext(tenants[0].id);
    }
  };

  let activeMerchant = merchants.find(m => m.id === selectedMerchantId);
  if (!activeMerchant && currentAdmin?.username === 'superuser' && merchants.length > 0) {
    activeMerchant = merchants[0];
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-955 font-sans overflow-hidden">
      
      {/* Top Header Strip */}
      <header className="h-16 bg-zinc-900 border-b border-zinc-800 px-6 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 bg-gradient-to-tr from-teal-400 to-indigo-500 rounded-full animate-pulse"></span>
            <span className="font-extrabold text-sm text-white tracking-wider uppercase">AI-Commerce Merchant Console</span>
          </div>

          <div className="h-4 w-px bg-zinc-800"></div>

          {currentAdmin ? (
            <div className="flex items-center space-x-4">
              <span className="text-xs text-zinc-400 font-medium">Admin:</span>
              <span className="text-xs font-bold text-teal-400 font-mono bg-zinc-950 border border-zinc-800 px-2 py-1 rounded">
                @{currentAdmin.username}
              </span>
              {currentAdmin.username === 'superuser' && (
                <div className="flex items-center space-x-2 bg-zinc-950 border border-zinc-850 px-2.5 py-1 rounded">
                  <span className="text-xs text-zinc-400">Preview Tenant:</span>
                  <select
                    value={selectedMerchantId}
                    onChange={(e) => setSelectedMerchantId(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 rounded px-2 py-0.5 text-xs text-zinc-200 focus:outline-none cursor-pointer"
                  >
                    {merchants.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-red-955 hover:bg-red-900 border border-red-800 text-red-200 text-xs font-bold rounded transition-all"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded font-semibold uppercase tracking-wider">
                Authentication Required
              </span>
            </div>
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
          <span className="bg-zinc-800 text-zinc-450 border border-zinc-700 text-[10px] px-2.5 py-1 rounded font-mono">
            {currentAdmin && currentAdmin.username === 'superuser' ? 'Platform RLS Override' : 'RLS Active'}
          </span>
        </div>
      </header>

      {/* Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {!currentAdmin ? (
          /* Merchant Admin Login Screen */
          <div className="flex-1 flex items-center justify-center p-8 bg-zinc-955 animate-fadeIn">
            <div className="relative max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl space-y-6">
              <div className="text-center space-y-2">
                <span className="w-12 h-12 bg-teal-500/10 border border-teal-500/30 text-teal-450 text-2xl font-bold rounded-xl flex items-center justify-center mx-auto mb-2">
                  🔐
                </span>
                <h2 className="text-xl font-extrabold text-white">Merchant Admin Login</h2>
                <p className="text-xs text-zinc-400">Enter your store administrator username or email and password.</p>
              </div>

              {loginError && (
                <div className="p-3 bg-red-950/20 border border-red-900/50 text-red-400 text-xs rounded-lg font-medium">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Username or Email</label>
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="e.g. solara_admin"
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
                  className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-zinc-955 font-bold rounded-lg text-sm transition"
                >
                  Access Merchant Dashboard
                </button>
              </form>

              <div className="border-t border-zinc-800/80 pt-4 text-center">
                <span className="text-[10px] text-zinc-500 block uppercase font-mono tracking-widest mb-2">Demo Admin Logins</span>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-zinc-455 font-mono">
                  <div className="bg-zinc-950 p-2.5 rounded border border-zinc-850 text-left">
                    <p className="text-teal-400 font-bold">Solara Admin</p>
                    <p className="mt-0.5">User: solara_admin</p>
                    <p>Pass: password123</p>
                  </div>
                  <div className="bg-zinc-950 p-2.5 rounded border border-zinc-850 text-left">
                    <p className="text-teal-400 font-bold">Aether Admin</p>
                    <p className="mt-0.5">User: aether_admin</p>
                    <p>Pass: password123</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : activeMerchant ? (
          <div className="w-full h-full flex flex-col">
            <div className="h-10 bg-zinc-900 px-6 border-b border-zinc-800 flex items-center justify-between text-xs text-zinc-400 shrink-0">
              <span className="font-semibold text-zinc-305">Console for: <span className="text-teal-400 font-bold">{activeMerchant.name}</span></span>
              <span className="font-mono text-[10px] text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                merchant_id: {selectedMerchantId}
              </span>
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
          <div className="m-auto text-zinc-500 text-sm">Please log in with a valid merchant administrator account.</div>
        )}
      </div>
    </div>
  );
}
