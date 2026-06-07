'use client';

import React, { useState, useEffect } from 'react';
import { mockDb } from '../lib/mock-db';
import { Merchant } from '../types';

export default function Home() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);

  useEffect(() => {
    setMerchants(mockDb.getMerchants());
  }, []);

  return (
    <div className="h-screen overflow-y-auto bg-zinc-955 text-zinc-100 font-sans flex flex-col justify-between overflow-x-hidden relative">
      
      {/* Background Decorative Gradient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>

      {/* Top Header Navbar */}
      <header className="h-20 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur px-8 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-2">
          <span className="w-3.5 h-3.5 bg-gradient-to-tr from-teal-400 to-indigo-500 rounded-full animate-pulse"></span>
          <span className="font-black text-sm text-white tracking-widest uppercase">AI-Commerce Enterprise</span>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="/superuser"
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-teal-450 border border-zinc-800 text-xs font-bold rounded-lg transition"
          >
            Super User Access
          </a>
          <a
            href="/merchant"
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-zinc-950 text-xs font-bold rounded-lg transition"
          >
            Merchant Console Login
          </a>
        </div>
      </header>

      {/* Main Gateway Options */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-6xl mx-auto z-10 space-y-16">
        
        {/* Title Heading */}
        <div className="text-center space-y-4 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Multi-Tenant <span className="bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">Commerce Platform</span> Gateway
          </h1>
          <p className="text-sm md:text-base text-zinc-400 font-medium leading-relaxed">
            Provision storefronts, manage payment integrations, handle global currencies, and customize layouts through dedicated workspaces.
          </p>
        </div>

        {/* Dashboard Workspaces Directory Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          
          {/* Super User Card */}
          <div className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl hover:border-zinc-700/80 transition-all duration-300 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="w-12 h-12 bg-teal-500/10 border border-teal-500/30 text-teal-450 text-2xl font-bold rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                🛡️
              </span>
              <h3 className="text-xl font-bold text-white group-hover:text-teal-400 transition-colors">Platform Super User Portal</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Global administrator portal. Onboard new merchant spaces, manage tenant database records, bind currencies, and review system-wide credentials records.
              </p>
            </div>
            <a
              href="/superuser"
              className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 text-zinc-100 border border-zinc-800 hover:border-teal-500/30 text-xs font-bold rounded-xl text-center transition-all shadow-md"
            >
              Launch Super User Portal
            </a>
          </div>

          {/* Merchant Admin Card */}
          <div className="group relative bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl hover:border-zinc-700/80 transition-all duration-300 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <span className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-2xl font-bold rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                ⚙️
              </span>
              <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">Merchant Dashboard Console</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Tenant administration console. Log in to edit your storefront layout, customize font styles and colors, manage products catalog, review order histories, and register local administrators.
              </p>
            </div>
            <a
              href="/merchant"
              className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-zinc-950 text-xs font-bold rounded-xl text-center transition-all shadow-md"
            >
              Launch Merchant Console
            </a>
          </div>

        </div>

        {/* Live Storefront Previews Section */}
        <div className="w-full space-y-6 pt-6">
          <div className="border-b border-zinc-900 pb-4 text-center">
            <h3 className="text-lg font-bold text-white">Live Storefront Previews</h3>
            <p className="text-xs text-zinc-500 mt-1">Visit the public storefronts of active tenants currently operating on the platform.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            {merchants.map((m) => {
              const currencyConf = mockDb.getMerchantConfig(m.id) || { currency_code: 'USD' };
              const symbol = currencyConf.currency_code === 'INR' ? '₹' : currencyConf.currency_code === 'EUR' ? '€' : '$';

              return (
                <div key={m.id} className="bg-zinc-900/60 border border-zinc-850 rounded-xl p-6 hover:bg-zinc-900 hover:border-zinc-800 transition duration-300 flex items-center justify-between">
                  <div className="space-y-1 pr-4">
                    <h4 className="font-bold text-zinc-200 text-sm truncate">{m.name}</h4>
                    <p className="text-[10px] text-zinc-500 font-mono truncate">slug: /store/{m.slug}</p>
                    <div className="pt-2 flex items-center space-x-2">
                      <span className="bg-zinc-950 border border-zinc-800 text-teal-400 text-[9px] px-2 py-0.5 rounded font-bold font-mono">
                        {currencyConf.currency_code} ({symbol})
                      </span>
                      <span className="bg-zinc-950 border border-zinc-800 text-indigo-400 text-[9px] px-2 py-0.5 rounded font-bold font-mono">
                        Active
                      </span>
                    </div>
                  </div>
                  <a
                    href={`/store/${m.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-300 border border-zinc-700 text-xs font-bold rounded-lg transition"
                  >
                    View Store →
                  </a>
                </div>
              );
            })}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="h-16 border-t border-zinc-900/80 bg-zinc-950/20 px-8 flex items-center justify-between z-10 shrink-0 text-zinc-500 text-[10px]">
        <span>© 2026 AI-Commerce Enterprise Engine. All rights reserved.</span>
        <span className="font-mono bg-zinc-900/40 px-2.5 py-1 rounded border border-zinc-900">v1.2.0 (Routed Portals)</span>
      </footer>

    </div>
  );
}
