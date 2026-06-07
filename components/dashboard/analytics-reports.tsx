'use client';

import React, { useState } from 'react';

interface AnalyticsReportsProps {
  merchantId: string;
  currencySymbol: string;
  formatPrice: (amount: number) => string;
}

export const AnalyticsReports: React.FC<AnalyticsReportsProps> = ({
  merchantId,
  currencySymbol,
  formatPrice,
}) => {
  const [reportType, setReportType] = useState<'sales' | 'traffic' | 'categories'>('sales');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'all'>('7d');

  // Simulated metrics based on selected date range
  const dateRangeMultiplier = dateRange === '7d' ? 1 : dateRange === '30d' ? 4.2 : 15.6;

  const salesData = [
    { label: 'Mon', revenue: 1420 * dateRangeMultiplier, orders: 12 },
    { label: 'Tue', revenue: 1980 * dateRangeMultiplier, orders: 15 },
    { label: 'Wed', revenue: 1650 * dateRangeMultiplier, orders: 14 },
    { label: 'Thu', revenue: 2450 * dateRangeMultiplier, orders: 19 },
    { label: 'Fri', revenue: 3100 * dateRangeMultiplier, orders: 25 },
    { label: 'Sat', revenue: 4200 * dateRangeMultiplier, orders: 32 },
    { label: 'Sun', revenue: 3800 * dateRangeMultiplier, orders: 28 },
  ];

  const trafficData = [
    { label: 'Mon', visitors: 450 * dateRangeMultiplier, pageViews: 1200 * dateRangeMultiplier },
    { label: 'Tue', visitors: 620 * dateRangeMultiplier, pageViews: 1850 * dateRangeMultiplier },
    { label: 'Wed', visitors: 580 * dateRangeMultiplier, pageViews: 1540 * dateRangeMultiplier },
    { label: 'Thu', visitors: 890 * dateRangeMultiplier, pageViews: 2400 * dateRangeMultiplier },
    { label: 'Fri', visitors: 1100 * dateRangeMultiplier, pageViews: 3200 * dateRangeMultiplier },
    { label: 'Sat', visitors: 1350 * dateRangeMultiplier, pageViews: 4100 * dateRangeMultiplier },
    { label: 'Sun', visitors: 1200 * dateRangeMultiplier, pageViews: 3600 * dateRangeMultiplier },
  ];

  const categoryShare = [
    { name: 'Hardware & Accessories', value: 45, color: '#3B82F6', totalSales: 8900 * dateRangeMultiplier },
    { name: 'Desk Elements', value: 30, color: '#10B981', totalSales: 5930 * dateRangeMultiplier },
    { name: 'Apothecary Products', value: 15, color: '#F59E0B', totalSales: 2970 * dateRangeMultiplier },
    { name: 'Wellness Rituals', value: 10, color: '#EC4899', totalSales: 1980 * dateRangeMultiplier },
  ];

  const totalRevenue = salesData.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = salesData.reduce((sum, item) => sum + item.orders, 0);
  const totalVisitors = trafficData.reduce((sum, item) => sum + item.visitors, 0);
  const totalPageViews = trafficData.reduce((sum, item) => sum + item.pageViews, 0);

  // Print function specifically cloning the current screen into print-area-wrapper
  const handlePrint = () => {
    // Check if element wrapper exists on document
    let printEl = document.getElementById('print-area-wrapper');
    if (!printEl) {
      printEl = document.createElement('div');
      printEl.id = 'print-area-wrapper';
      document.body.appendChild(printEl);
    }

    // Get report content HTML
    const reportContent = document.getElementById('analytics-report-content');
    if (reportContent) {
      printEl.innerHTML = `
        <div style="font-family: sans-serif; color: black; padding: 40px; background: white;">
          <div style="border-bottom: 2px solid #ccc; padding-bottom: 20px; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 1px;">AI-Commerce BI Report</h1>
            <p style="margin: 5px 0 0 0; color: #555; font-size: 14px;">Tenant ID: ${merchantId} | Date Generated: ${new Date().toLocaleDateString()}</p>
            <p style="margin: 5px 0 0 0; color: #555; font-size: 14px;">Report Type: ${reportType.toUpperCase()} | Date Period: ${dateRange === '7d' ? 'Last 7 Days' : dateRange === '30d' ? 'Last 30 Days' : 'All Time'}</p>
          </div>
          ${reportContent.innerHTML}
          <div style="margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #888; font-size: 11px;">
            Confidential - For Internal Store Administration Only
          </div>
        </div>
      `;

      // Hide all standard elements for printing
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-zinc-900 p-4 rounded-xl border border-zinc-850">
        {/* Report selection buttons */}
        <div className="flex bg-zinc-950 p-1 border border-zinc-800 rounded-lg shrink-0">
          <button
            onClick={() => setReportType('sales')}
            className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${
              reportType === 'sales' ? 'bg-teal-500 text-zinc-955' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Sales & Revenue
          </button>
          <button
            onClick={() => setReportType('traffic')}
            className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${
              reportType === 'traffic' ? 'bg-teal-500 text-zinc-955' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Traffic & Visitors
          </button>
          <button
            onClick={() => setReportType('categories')}
            className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${
              reportType === 'categories' ? 'bg-teal-500 text-zinc-955' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Categories Share
          </button>
        </div>

        {/* Date range + Print controls */}
        <div className="flex items-center gap-3 justify-end">
          <select
            value={dateRange}
            onChange={(e: any) => setDateRange(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-bold text-zinc-200 focus:outline-none cursor-pointer"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>

          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 text-xs font-bold rounded-lg transition flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Report
          </button>
        </div>
      </div>

      {/* Main Report Container */}
      <div id="analytics-report-content" className="space-y-6">
        
        {/* Sales & Revenue Report */}
        {reportType === 'sales' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Stat summaries */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-5 bg-zinc-900 border border-zinc-850 rounded-xl">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Report Total Revenue</p>
                <p className="text-2xl font-black text-teal-400 mt-1">{formatPrice(totalRevenue)}</p>
              </div>
              <div className="p-5 bg-zinc-900 border border-zinc-850 rounded-xl">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Total Orders Logged</p>
                <p className="text-2xl font-black text-indigo-400 mt-1">{totalOrders}</p>
              </div>
              <div className="p-5 bg-zinc-900 border border-zinc-850 rounded-xl">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Average Cart Size</p>
                <p className="text-2xl font-black text-pink-400 mt-1">{formatPrice(totalRevenue / (totalOrders || 1))}</p>
              </div>
            </div>

            {/* SVG Area Chart */}
            <div className="p-6 bg-zinc-900 border border-zinc-850 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">Revenue Trend Line</h3>
                <span className="text-[10px] text-zinc-500 font-mono">Daily aggregate (Sales & VAT inclusive)</span>
              </div>
              
              {/* Area SVG Chart */}
              <div className="relative h-64 w-full">
                <svg className="w-full h-full" viewBox="0 0 700 250" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="revenue-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.4"/>
                      <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.0"/>
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="50" y1="30" x2="650" y2="30" stroke="#27272a" strokeDasharray="3 3" />
                  <line x1="50" y1="80" x2="650" y2="80" stroke="#27272a" strokeDasharray="3 3" />
                  <line x1="50" y1="130" x2="650" y2="130" stroke="#27272a" strokeDasharray="3 3" />
                  <line x1="50" y1="180" x2="650" y2="180" stroke="#27272a" strokeDasharray="3 3" />
                  <line x1="50" y1="220" x2="650" y2="220" stroke="#3f3f46" strokeWidth="1.5" />
                  
                  {/* Chart Path and Fill */}
                  <path
                    d="M 50,220 L 50,180 L 150,150 L 250,170 L 350,120 L 450,100 L 550,50 L 650,70 L 650,220 Z"
                    fill="url(#revenue-grad)"
                  />
                  <path
                    d="M 50,180 L 150,150 L 250,170 L 350,120 L 450,100 L 550,50 L 650,70"
                    fill="none"
                    stroke="#14B8A6"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  
                  {/* Active Nodes */}
                  <circle cx="50" cy="180" r="5" fill="#14B8A6" stroke="#09090b" strokeWidth="2" />
                  <circle cx="150" cy="150" r="5" fill="#14B8A6" stroke="#09090b" strokeWidth="2" />
                  <circle cx="250" cy="170" r="5" fill="#14B8A6" stroke="#09090b" strokeWidth="2" />
                  <circle cx="350" cy="120" r="5" fill="#14B8A6" stroke="#09090b" strokeWidth="2" />
                  <circle cx="450" cy="100" r="5" fill="#14B8A6" stroke="#09090b" strokeWidth="2" />
                  <circle cx="550" cy="50" r="5" fill="#14B8A6" stroke="#09090b" strokeWidth="2" />
                  <circle cx="650" cy="70" r="5" fill="#14B8A6" stroke="#09090b" strokeWidth="2" />
                  
                  {/* Axis Text */}
                  <text x="50" y="240" fill="#71717a" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Mon</text>
                  <text x="150" y="240" fill="#71717a" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Tue</text>
                  <text x="250" y="240" fill="#71717a" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Wed</text>
                  <text x="350" y="240" fill="#71717a" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Thu</text>
                  <text x="450" y="240" fill="#71717a" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Fri</text>
                  <text x="550" y="240" fill="#71717a" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Sat</text>
                  <text x="650" y="240" fill="#71717a" fontSize="10" textAnchor="middle" fontFamily="sans-serif">Sun</text>
                </svg>
              </div>
            </div>

            {/* Detailed data table */}
            <div className="bg-zinc-900 border border-zinc-850 rounded-xl p-5">
              <h4 className="text-sm font-bold mb-4 uppercase tracking-wider text-zinc-300">Sales Breakdown Table</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-400">
                  <thead className="bg-zinc-950 uppercase text-zinc-300 font-bold">
                    <tr>
                      <th className="px-5 py-3 rounded-l-lg">Day Interval</th>
                      <th className="px-5 py-3">Orders Volume</th>
                      <th className="px-5 py-3 rounded-r-lg text-right font-mono">Gross Revenues</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.map((d, i) => (
                      <tr key={i} className="border-b border-zinc-800/60 hover:bg-zinc-800/10">
                        <td className="px-5 py-3 font-semibold text-zinc-200">{d.label}</td>
                        <td className="px-5 py-3 text-zinc-400">{d.orders} purchases</td>
                        <td className="px-5 py-3 text-right font-bold text-teal-400 font-mono">{formatPrice(d.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Traffic & Visitors Report */}
        {reportType === 'traffic' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Stat summaries */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-5 bg-zinc-900 border border-zinc-850 rounded-xl">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Total Unique Visitors</p>
                <p className="text-2xl font-black text-amber-400 mt-1">{totalVisitors} visitors</p>
              </div>
              <div className="p-5 bg-zinc-900 border border-zinc-850 rounded-xl">
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Aggregated Page Views</p>
                <p className="text-2xl font-black text-indigo-400 mt-1">{totalPageViews} views</p>
              </div>
            </div>

            {/* SVG Bar Chart */}
            <div className="p-6 bg-zinc-900 border border-zinc-850 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-200">Traffic Log Volume</h3>
                <span className="text-[10px] text-zinc-500 font-mono">Comparing Visitors vs Views</span>
              </div>
              
              {/* Bar Chart */}
              <div className="relative h-64 w-full">
                <svg className="w-full h-full" viewBox="0 0 700 250" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="50" y1="30" x2="650" y2="30" stroke="#27272a" strokeDasharray="3 3" />
                  <line x1="50" y1="130" x2="650" y2="130" stroke="#27272a" strokeDasharray="3 3" />
                  <line x1="50" y1="220" x2="650" y2="220" stroke="#3f3f46" strokeWidth="1.5" />
                  
                  {/* SVG Bars loop */}
                  {trafficData.map((d, idx) => {
                    const x = 70 + idx * 80;
                    
                    // Simple ratios for scaling
                    const maxVal = 4100 * dateRangeMultiplier;
                    const hViews = Math.max(10, (d.pageViews / maxVal) * 170);
                    const hVisitors = Math.max(5, (d.visitors / maxVal) * 170);
                    
                    return (
                      <g key={idx}>
                        {/* Page Views Bar (Indigo) */}
                        <rect
                          x={x}
                          y={220 - hViews}
                          width="24"
                          height={hViews}
                          fill="#6366F1"
                          rx="4"
                          className="hover:opacity-85 transition-opacity cursor-pointer"
                        />
                        {/* Visitors Bar (Amber) */}
                        <rect
                          x={x + 8}
                          y={220 - hVisitors}
                          width="12"
                          height={hVisitors}
                          fill="#F59E0B"
                          rx="2"
                          className="hover:opacity-85 transition-opacity cursor-pointer"
                        />
                      </g>
                    );
                  })}
                  
                  {/* Axis Text */}
                  {trafficData.map((d, idx) => (
                    <text
                      key={idx}
                      x={85 + idx * 80}
                      y="240"
                      fill="#71717a"
                      fontSize="10"
                      textAnchor="middle"
                      fontFamily="sans-serif"
                    >
                      {d.label}
                    </text>
                  ))}
                </svg>
              </div>
            </div>

            {/* Detailed data table */}
            <div className="bg-zinc-900 border border-zinc-850 rounded-xl p-5">
              <h4 className="text-sm font-bold mb-4 uppercase tracking-wider text-zinc-300">Traffic Breakdown Table</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-400">
                  <thead className="bg-zinc-950 uppercase text-zinc-300 font-bold">
                    <tr>
                      <th className="px-5 py-3 rounded-l-lg">Day Interval</th>
                      <th className="px-5 py-3">Unique Visitors</th>
                      <th className="px-5 py-3">Total Page Views</th>
                      <th className="px-5 py-3 rounded-r-lg text-right">Avg Views / Session</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trafficData.map((d, i) => (
                      <tr key={i} className="border-b border-zinc-800/60 hover:bg-zinc-800/10">
                        <td className="px-5 py-3 font-semibold text-zinc-200">{d.label}</td>
                        <td className="px-5 py-3 text-amber-400 font-semibold">{d.visitors} guests</td>
                        <td className="px-5 py-3 text-indigo-400 font-semibold">{d.pageViews} clicks</td>
                        <td className="px-5 py-3 text-right font-bold text-zinc-300">{(d.pageViews / d.visitors).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Category Share Report */}
        {reportType === 'categories' && (
          <div className="space-y-6 animate-fadeIn">
            {/* SVG Pie Chart / Donut Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* SVG Donut Illustration */}
              <div className="p-6 bg-zinc-900 border border-zinc-850 rounded-xl flex flex-col items-center justify-center space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-250 w-full text-left">Category Market Share Donut</h3>
                
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                    {/* Background Ring */}
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#27272a" strokeWidth="12" />
                    
                    {/* SEGMENT 1: 45% (blue) - starts at 0, offset = 0, length = 2 * PI * R * 0.45 = 2 * 3.1415 * 40 * 0.45 = 113.1 */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="12"
                      strokeDasharray="113.1 251.3"
                      strokeDashoffset="0"
                    />
                    
                    {/* SEGMENT 2: 30% (green) - offset = -113.1, length = 75.4 */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#10B981"
                      strokeWidth="12"
                      strokeDasharray="75.4 251.3"
                      strokeDashoffset="-113.1"
                    />

                    {/* SEGMENT 3: 15% (orange) - offset = -188.5, length = 37.7 */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="12"
                      strokeDasharray="37.7 251.3"
                      strokeDashoffset="-188.5"
                    />

                    {/* SEGMENT 4: 10% (pink) - offset = -226.2, length = 25.1 */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#EC4899"
                      strokeWidth="12"
                      strokeDasharray="25.1 251.3"
                      strokeDashoffset="-226.2"
                    />
                  </svg>
                  
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-white">100%</span>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">Catalog</span>
                  </div>
                </div>
              </div>

              {/* Share detailed metrics list */}
              <div className="p-6 bg-zinc-900 border border-zinc-850 rounded-xl flex flex-col justify-between space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-250">Share Allocations</h3>
                
                <div className="space-y-4">
                  {categoryShare.map((cat, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="font-semibold text-zinc-300">{cat.name}</span>
                        </div>
                        <span className="font-bold text-zinc-100">{cat.value}%</span>
                      </div>
                      <div className="w-full bg-zinc-950 h-2 rounded-full overflow-hidden border border-zinc-850">
                        <div className="h-full rounded-full" style={{ backgroundColor: cat.color, width: `${cat.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Detailed data table */}
            <div className="bg-zinc-900 border border-zinc-850 rounded-xl p-5">
              <h4 className="text-sm font-bold mb-4 uppercase tracking-wider text-zinc-300">Category Sales Ledger</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-400">
                  <thead className="bg-zinc-950 uppercase text-zinc-300 font-bold">
                    <tr>
                      <th className="px-5 py-3 rounded-l-lg">Category Label</th>
                      <th className="px-5 py-3">Market Share Percentage</th>
                      <th className="px-5 py-3 rounded-r-lg text-right font-mono">Calculated Sales Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryShare.map((d, i) => (
                      <tr key={i} className="border-b border-zinc-800/60 hover:bg-zinc-800/10">
                        <td className="px-5 py-3 font-semibold text-zinc-200">{d.name}</td>
                        <td className="px-5 py-3 font-mono font-semibold text-indigo-400">{d.value}%</td>
                        <td className="px-5 py-3 text-right font-bold text-teal-400 font-mono">{formatPrice(d.totalSales)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
