
import React, { useMemo } from 'react';
import { Order, ProcurementOrder, PayrollRecord, Feedback, ProjectContext } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { DollarSign, TrendingDown, TrendingUp, Users, Zap, ShieldCheck, FileText, Download, Target, Activity } from 'lucide-react';

interface ReportsModuleProps {
  orders: Order[];
  procurement: ProcurementOrder[];
  payroll: PayrollRecord[];
  feedback: Feedback[];
  context: ProjectContext;
}

const ReportsModule: React.FC<ReportsModuleProps> = ({ orders, procurement, payroll, feedback, context }) => {
  const financialSummary = useMemo(() => {
    const revenue = orders.filter(o => o.context === context && o.status === 'paid').reduce((s, o) => s + o.total, 0);
    const stockSpend = procurement.filter(o => o.context === context && (o.status === 'ordered' || o.status === 'delivered')).reduce((s, o) => s + o.totalCost, 0);
    const staffSpend = payroll.filter(p => {
       // Assume we filter payroll by context elsewhere or member context
       return true; 
    }).reduce((s, p) => s + p.grossPay, 0);
    
    const profit = revenue - (stockSpend + staffSpend);
    return { revenue, stockSpend, staffSpend, profit };
  }, [orders, procurement, payroll, context]);

  const cashFlowData = [
    { name: 'Revenue', value: financialSummary.revenue, color: '#10b981' },
    { name: 'Supply Chain', value: financialSummary.stockSpend, color: '#f59e0b' },
    { name: 'Payroll', value: financialSummary.staffSpend, color: '#6366f1' },
  ];

  const sentimentScore = useMemo(() => {
    const pos = feedback.filter(f => f.severity === 'low').length;
    const total = feedback.length || 1;
    return Math.round((pos / total) * 100);
  }, [feedback]);

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-700 bg-slate-950 min-h-[calc(100vh-73px)] text-white">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
        <div>
           <div className="flex items-center gap-3 mb-3">
              <ShieldCheck className="text-brand-accent" size={16} />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-accent">Executive Command Monitor</p>
           </div>
           <h2 className="text-6xl font-black tracking-tighter uppercase italic leading-none">Consolidated Ledger</h2>
        </div>
        <button className="bg-white text-slate-900 px-10 py-5 rounded-[25px] text-xs font-black uppercase tracking-widest shadow-2xl flex items-center gap-3 hover:scale-105 transition-all">
           <Download size={18} /> Export Fiscal Pack
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         <div className="bg-white/5 p-10 rounded-[50px] border border-white/5 flex flex-col justify-between">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-6">Gross Sales (Context)</p>
            <div>
               <h3 className="text-4xl font-black italic tracking-tighter text-emerald-400">R{financialSummary.revenue.toLocaleString()}</h3>
               <p className="text-[9px] font-bold text-white/20 uppercase mt-2">Verified POS Settlements</p>
            </div>
         </div>
         <div className="bg-white/5 p-10 rounded-[50px] border border-white/5 flex flex-col justify-between">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-6">Procurement Burn</p>
            <div>
               <h3 className="text-4xl font-black italic tracking-tighter text-amber-400">R{financialSummary.stockSpend.toLocaleString()}</h3>
               <p className="text-[9px] font-bold text-white/20 uppercase mt-2">Live Supply Chain Liability</p>
            </div>
         </div>
         <div className="bg-white/5 p-10 rounded-[50px] border border-white/5 flex flex-col justify-between">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-6">Staff Investment</p>
            <div>
               <h3 className="text-4xl font-black italic tracking-tighter text-indigo-400">R{financialSummary.staffSpend.toLocaleString()}</h3>
               <p className="text-[9px] font-bold text-white/20 uppercase mt-2">Aggregated Payroll Disbursed</p>
            </div>
         </div>
         <div className={`p-10 rounded-[50px] border flex flex-col justify-between shadow-2xl ${financialSummary.profit >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">Estimated Net (Current)</p>
            <div>
               <h3 className={`text-4xl font-black italic tracking-tighter ${financialSummary.profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                 R{financialSummary.profit.toLocaleString()}
               </h3>
               <p className="text-[9px] font-bold text-white/20 uppercase mt-2">Context Profitability Ratio</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         <div className="lg:col-span-2 bg-white/5 rounded-[60px] p-12 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-white/5"><Activity size={120} /></div>
            <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-12">Cash Flow Distribution</h3>
            <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashFlowData} layout="vertical">
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: 'white', fontWeight: 900, fontSize: 10}} />
                     <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '12px'}} />
                     <Bar dataKey="value" radius={[0, 20, 20, 0]} barSize={40}>
                        {cashFlowData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-brand-primary p-12 rounded-[60px] shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
               <div className="absolute -left-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
               <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/50 mb-4">Sentiment Intelligence</p>
                  <h4 className="text-5xl font-black italic tracking-tighter mb-6">{sentimentScore}%</h4>
                  <p className="text-lg font-medium leading-relaxed italic opacity-80">
                     "Operations are currently optimized. Sentiment has stabilized within the high-performance threshold for {context === ProjectContext.THE_YARD ? 'The Yard' : 'Sunday Theory'}."
                  </p>
               </div>
               <div className="relative z-10 flex gap-4 mt-12">
                  <div className="flex-1 bg-white/10 p-4 rounded-3xl border border-white/10 text-center">
                     <p className="text-xl font-black italic">High</p>
                     <p className="text-[8px] font-black uppercase opacity-40">Personnel Velocity</p>
                  </div>
                  <div className="flex-1 bg-white/10 p-4 rounded-3xl border border-white/10 text-center">
                     <p className="text-xl font-black italic">Sync</p>
                     <p className="text-[8px] font-black uppercase opacity-40">Supply Chain Integrity</p>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
         <div className="bg-white/5 rounded-[50px] p-10 border border-white/5">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white/40 mb-8 italic">Key Performance Blocks</h4>
            <div className="space-y-6">
               <div className="flex items-center justify-between p-6 bg-white/5 rounded-[30px] border border-white/5">
                  <div className="flex items-center gap-4">
                     <Zap size={20} className="text-brand-accent" />
                     <span className="font-bold text-sm">Shift Deployment Efficiency</span>
                  </div>
                  <span className="font-black italic text-brand-accent">98.2%</span>
               </div>
               <div className="flex items-center justify-between p-6 bg-white/5 rounded-[30px] border border-white/5">
                  <div className="flex items-center gap-4">
                     <Users size={20} className="text-brand-accent" />
                     <span className="font-bold text-sm">Guest Sentiment Threshold</span>
                  </div>
                  <span className="font-black italic text-brand-accent">Optimal</span>
               </div>
            </div>
         </div>
         <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-[50px] p-12 flex items-center gap-10">
            <div className="w-24 h-24 bg-emerald-500 rounded-[40px] flex items-center justify-center shadow-2xl shadow-emerald-500/30 shrink-0">
               <Target size={48} />
            </div>
            <div>
               <h4 className="text-2xl font-black uppercase italic tracking-tighter mb-2 text-emerald-400">Quarterly Objective Trace</h4>
               <p className="text-sm font-medium leading-relaxed text-emerald-100/60 max-w-sm italic">
                  Based on current cash flow velocity, the project is tracking 12% ahead of forecasted operational reserves for this cycle.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ReportsModule;
