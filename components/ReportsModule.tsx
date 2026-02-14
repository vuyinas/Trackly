
import React, { useMemo } from 'react';
import { Order, ProcurementOrder, PayrollRecord, Feedback, ProjectContext, SocialLink, Sector, Business } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { DollarSign, TrendingDown, TrendingUp, Users, Zap, ShieldCheck, FileText, Download, Target, Activity, Share2, Eye, MessageSquare, Radio } from 'lucide-react';

interface ReportsModuleProps {
  orders: Order[];
  procurement: ProcurementOrder[];
  payroll: PayrollRecord[];
  feedback: Feedback[];
  socialLinks?: SocialLink[];
  context: ProjectContext;
  activeSector: Sector;
  businesses: Business[];
}

const ReportsModule: React.FC<ReportsModuleProps> = ({ orders, procurement, payroll, feedback, socialLinks = [], context, activeSector, businesses }) => {
  const financialSummary = useMemo(() => {
    const revenue = orders.filter(o => o.context === context && o.status === 'paid').reduce((s, o) => s + o.total, 0);
    const stockSpend = procurement.filter(o => o.context === context && (o.status === 'ordered' || o.status === 'delivered')).reduce((s, o) => s + o.totalCost, 0);
    const staffSpend = payroll.reduce((s, p) => s + p.grossPay, 0);
    const profit = revenue - (stockSpend + staffSpend);
    return { revenue, stockSpend, staffSpend, profit };
  }, [orders, procurement, payroll, context]);

  const socialSummary = useMemo(() => {
     const totalReach = socialLinks.reduce((acc, link) => acc + (link.followers || 0), 0);
     const totalEngagement = socialLinks.reduce((acc, link) => acc + (link.topPosts?.reduce((a, p) => a + p.engagement, 0) || 0), 0);
     const postsWeekly = socialLinks.reduce((acc, link) => acc + (link.postsCount || 0), 0);
     return { totalReach, totalEngagement, postsWeekly };
  }, [socialLinks]);

  const cashFlowData = [
    { name: 'Revenue', value: financialSummary.revenue, color: '#10b981' },
    { name: 'Supply Chain', value: financialSummary.stockSpend, color: '#f59e0b' },
    { name: 'Payroll', value: financialSummary.staffSpend, color: '#6366f1' },
  ];

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-700 bg-[#28374a] min-h-[calc(100vh-73px)] text-white">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
        <div>
           <div className="flex items-center gap-3 mb-3">
              <ShieldCheck className="text-brand-accent" size={16} />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-accent">Executive Command</p>
           </div>
           <h2 className="text-6xl font-black tracking-tighter uppercase italic leading-none">Reports</h2>
        </div>
        <button className="bg-white text-slate-900 px-10 py-5 rounded-[25px] text-xs font-black uppercase tracking-widest shadow-2xl flex items-center gap-3 hover:scale-105 transition-all">
           <Download size={18} /> Export Ledger
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         <div className="bg-white/5 p-10 rounded-[50px] border border-white/5 flex flex-col justify-between">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-6">Gross Sales</p>
            <h3 className="text-4xl font-black italic tracking-tighter text-emerald-400">R{financialSummary.revenue.toLocaleString()}</h3>
         </div>
         <div className="bg-white/5 p-10 rounded-[50px] border border-white/5 flex flex-col justify-between">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-6">Supply Chain</p>
            <h3 className="text-4xl font-black italic tracking-tighter text-amber-400">R{financialSummary.stockSpend.toLocaleString()}</h3>
         </div>
         <div className="bg-white/5 p-10 rounded-[50px] border border-white/5 flex flex-col justify-between">
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-6">Payroll</p>
            <h3 className="text-4xl font-black italic tracking-tighter text-indigo-400">R{financialSummary.staffSpend.toLocaleString()}</h3>
         </div>
         <div className={`p-10 rounded-[50px] border flex flex-col justify-between shadow-2xl ${financialSummary.profit >= 0 ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-6">Net (Current)</p>
            <h3 className={`text-4xl font-black italic tracking-tighter ${financialSummary.profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>R{financialSummary.profit.toLocaleString()}</h3>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         <div className="lg:col-span-2 bg-white/5 rounded-[60px] p-12 border border-white/5 relative overflow-hidden">
            <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-12">Cash Flow Distribution</h3>
            <div className="h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashFlowData} layout="vertical">
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: 'white', fontWeight: 900, fontSize: 10}} />
                     <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '12px'}} />
                     <Bar dataKey="value" radius={[0, 20, 20, 0]} barSize={40}>
                        {cashFlowData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
         <div className="bg-brand-primary p-12 rounded-[60px] shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
            <h4 className="text-3xl font-black italic tracking-tighter uppercase leading-tight mb-4">Analytical Pulse</h4>
            <p className="text-lg font-medium opacity-80 leading-relaxed italic mb-8">"Operations optimized. Fiscal velocity tracking at 112% of baseline projections for this cycle."</p>
         </div>
      </div>
    </div>
  );
};

export default ReportsModule;
