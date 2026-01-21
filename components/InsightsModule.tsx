
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, MessageSquare, Award, Star, FileText, ChevronRight, X, Zap, Users, BarChart3, Clock, Utensils, Wine, MapPin, Smile, Frown, Calendar, GlassWater } from 'lucide-react';
import { ProjectContext, Feedback } from '../types';
import { getEventStrategySuggestions } from '../services/geminiService';

interface InsightsModuleProps {
  context: ProjectContext;
  feedback: Feedback[];
}

const InsightsModule: React.FC<InsightsModuleProps> = ({ context, feedback }) => {
  const [showFullReport, setShowFullReport] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [strategyLoading, setStrategyLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  const salesData = [
    { name: 'Mon', value: 4500 },
    { name: 'Tue', value: 5200 },
    { name: 'Wed', value: 4800 },
    { name: 'Thu', value: 6100 },
    { name: 'Fri', value: 9400 },
    { name: 'Sat', value: 12500 },
    { name: 'Sun', value: 11000 },
  ];

  const itemStats = [
    { name: 'Yard Burger', sales: 142, trend: '+12%', rating: 4.8 },
    { name: 'Sunday Punch', sales: 89, trend: '+24%', rating: 4.9 },
    { name: 'Truffle Fries', sales: 210, trend: '+18%', rating: 4.7 },
  ];

  const handleGenerateReport = () => {
    setReportLoading(true);
    setTimeout(() => {
      setReportLoading(false);
      setShowFullReport(true);
    }, 1500);
  };

  const handleFetchStrategy = async () => {
    setStrategyLoading(true);
    const holidays = [
       { date: '2024-09-24', name: 'Heritage Day' },
       { date: '2024-12-16', name: 'Day of Reconciliation' }
    ];
    const topSales = itemStats.map(i => ({ item: i.name, performance: i.trend }));
    const result = await getEventStrategySuggestions(holidays, topSales);
    if (result && result.suggestions) {
      setAiSuggestions(result.suggestions);
    }
    setStrategyLoading(false);
  };

  const positiveRemarks = feedback.filter(f => f.severity === 'low' && !f.comment.toLowerCase().includes('disappointing') && !f.comment.toLowerCase().includes('cold'));
  const complaints = feedback.filter(f => f.severity === 'high' || f.severity === 'medium');

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-4">Space Intelligence</h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Operational clarity for {context === ProjectContext.THE_YARD ? 'The Yard' : 'Sunday Theory'}.</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="bg-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200">
             Last Sync: 4m ago
           </div>
           <button 
            onClick={handleGenerateReport}
            className={`bg-brand-primary text-white px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 hover:scale-105 transition-all flex items-center gap-3 ${reportLoading ? 'opacity-50' : ''}`}
           >
             {reportLoading ? 'Processing Data...' : <>Generate Full CSV Report <ChevronRight size={14} /></>}
           </button>
        </div>
      </div>

      {/* Strategy Lab Section */}
      <div className="bg-[#0F172A] p-12 rounded-[60px] text-white shadow-2xl relative overflow-hidden border border-white/5">
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-12">
            <div className="max-w-xl">
               <div className="flex items-center gap-3 mb-4">
                  <Zap className="text-brand-accent" size={20} fill="currentColor" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-accent">Strategy Lab Engine</p>
               </div>
               <h3 className="text-5xl font-black italic tracking-tighter uppercase mb-6 leading-none text-white">Event Synthesis AI</h3>
               <p className="text-lg font-medium opacity-60 italic leading-relaxed">
                  Analyze South African holidays and real-time POS sales data to generate the next high-revenue themed nights.
               </p>
               <button 
                  onClick={handleFetchStrategy}
                  disabled={strategyLoading}
                  className="mt-8 bg-brand-accent text-slate-900 px-10 py-5 rounded-[25px] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-brand-accent/20 hover:scale-105 transition-all flex items-center gap-3 disabled:opacity-50"
               >
                  {strategyLoading ? 'Synthesizing...' : 'Ask Strategy AI'} <Zap size={18} fill="currentColor" />
               </button>
            </div>

            <div className="flex-1 grid grid-cols-1 gap-4">
               {aiSuggestions.length > 0 ? aiSuggestions.map((s, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-[35px] hover:bg-white/10 transition-all animate-in slide-in-from-right-4">
                     <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-black uppercase italic tracking-tight text-brand-accent">{s.title}</h4>
                        <div className="flex items-center gap-2 bg-brand-primary/20 px-3 py-1 rounded-lg text-[8px] font-black uppercase text-brand-primary">
                           <MapPin size={10} /> {s.recommendedZone}
                        </div>
                     </div>
                     <p className="text-xs font-bold opacity-80 leading-relaxed mb-4">"{s.rationale}"</p>
                     <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2 text-emerald-400">
                           <GlassWater size={14} />
                           <span className="text-[10px] font-black uppercase tracking-widest">Special: {s.featuredSpecial}</span>
                        </div>
                        <button className="text-[9px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors">Draft Event Architecture &rarr;</button>
                     </div>
                  </div>
               )) : (
                  <div className="h-64 border-2 border-dashed border-white/5 rounded-[50px] flex flex-col items-center justify-center text-white/20 gap-4">
                     <Calendar size={48} strokeWidth={1} />
                     <p className="text-xs font-black uppercase tracking-widest italic">Awaiting Synthesis Command</p>
                  </div>
               )}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-[50px] shadow-xl shadow-black/5 border border-white/50">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold uppercase tracking-tighter italic">Weekly Revenue Stream</h3>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-brand-primary">
              <TrendingUp size={14} /> Peak: Saturday
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#A1A1A1' }} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}
                  cursor={{ stroke: 'var(--brand-primary)', strokeWidth: 2, strokeDasharray: '5 5' }}
                />
                <Area type="monotone" dataKey="value" stroke="var(--brand-primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[#1A1A1A] p-10 rounded-[50px] text-white relative overflow-hidden group h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/20 rounded-full blur-3xl" />
            <h3 className="text-lg font-bold uppercase tracking-tighter mb-8 italic">Item Intelligence</h3>
            <div className="space-y-6">
              {itemStats.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">{item.name}</p>
                    <div className="flex items-center gap-2">
                       <span className="text-xl font-black italic">{item.sales} Units</span>
                       <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">{item.trend}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-brand-accent">
                    <Star size={12} fill="currentColor" />
                    <span className="text-sm font-black italic">{item.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-white p-10 rounded-[50px] border border-white/50 shadow-xl shadow-black/5">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter italic text-slate-800">Voice of Customer</h3>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Real-time sentiment monitoring</p>
            </div>
            <div className="p-3 bg-brand-primary/5 rounded-2xl text-brand-primary">
              <MessageSquare size={24} />
            </div>
          </div>
          
          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
            {/* Positive Feed */}
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-2">
                <Smile size={14} /> Positive Experience Log
              </p>
              {positiveRemarks.map(f => (
                <div key={f.id} className="p-6 bg-emerald-50/50 rounded-[30px] border border-emerald-100 flex gap-4">
                   <div className="flex-1">
                     <div className="flex items-center justify-between mb-2">
                       <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60">{f.category} • {f.source}</p>
                       <span className="text-[9px] font-bold opacity-30">RECENT</span>
                     </div>
                     <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{f.comment}"</p>
                   </div>
                </div>
              ))}
            </div>

            {/* Critical Feed */}
            <div className="space-y-4 pt-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 flex items-center gap-2">
                <Frown size={14} /> Critical Attention Required
              </p>
              {complaints.map(f => (
                <div key={f.id} className="p-6 bg-red-50/50 rounded-[30px] border border-red-100 flex gap-4">
                   <div className="flex-1">
                     <div className="flex items-center justify-between mb-2">
                       <p className="text-[10px] font-black uppercase tracking-widest text-red-600/60">{f.category} • {f.source}</p>
                       <span className="text-[9px] font-bold opacity-30">URGENT</span>
                     </div>
                     <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{f.comment}"</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-brand-primary p-12 rounded-[60px] text-white flex flex-col justify-between shadow-2xl shadow-brand-primary/30 relative overflow-hidden h-full">
           <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-white/5 rounded-full blur-[60px]" />
           <div className="relative z-10">
             <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6">
                <Award size={32} />
             </div>
             <h3 className="text-3xl font-black tracking-tighter italic uppercase leading-tight mb-4">Analytical Recommendations</h3>
             <p className="text-lg font-medium opacity-80 leading-relaxed italic mb-8">
               "System analysis indicates high-frequency mentions of 'Alex' in positive service logs. Suggest formalizing the Sunday Theory host protocol based on Alex's workflow to scale customer satisfaction."
             </p>
             <div className="space-y-4">
                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl">
                   <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Velocity Insight</p>
                   <p className="text-sm font-bold leading-relaxed">Friday dinner service bottleneck identified between 19:45 and 20:15. Recommend pre-staffing 1 extra runner during this window.</p>
                </div>
             </div>
           </div>
           <div className="relative z-10 mt-12 grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/5">
                 <p className="text-2xl font-black italic">+34%</p>
                 <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Growth Forecast</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-2xl border border-white/5">
                 <p className="text-2xl font-black italic">4.9/5</p>
                 <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Service Rating</p>
              </div>
           </div>
        </div>
      </div>

      {/* Full Report Preview Modal */}
      {showFullReport && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-slate-950/80 backdrop-blur-lg animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-6xl h-[85vh] rounded-[60px] shadow-2xl border border-white/50 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
              <div className="p-10 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                 <div>
                    <h3 className="text-3xl font-black italic tracking-tighter uppercase">Deep Dive Analytics Report</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Full Synthesis Export • System Reference ID: TRK-990-22</p>
                 </div>
                 <button onClick={() => setShowFullReport(false)} className="p-4 bg-white hover:bg-slate-100 border border-slate-200 rounded-3xl transition-all shadow-sm">
                    <X size={24} />
                 </button>
              </div>

              <div className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Clock size={12} /> Peak Operation
                       </p>
                       <h4 className="text-3xl font-black text-slate-800 italic">19:30-21:00</h4>
                       <p className="text-xs font-medium text-slate-400 mt-2">Fri / Sat Window</p>
                    </div>
                    <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <Users size={12} /> Top Event Day
                       </p>
                       <h4 className="text-3xl font-black text-slate-800 italic">Saturday</h4>
                       <p className="text-xs font-medium text-slate-400 mt-2">100% Avg. Capacity</p>
                    </div>
                    <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <BarChart3 size={12} /> Top Event
                       </p>
                       <h4 className="text-2xl font-black text-slate-800 italic">Theory #12</h4>
                       <p className="text-xs font-medium text-slate-400 mt-2">98.2% Ticket Sale-thru</p>
                    </div>
                    <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                          <MapPin size={12} /> Peak Arrival
                       </p>
                       <h4 className="text-3xl font-black text-slate-800 italic">Door+45m</h4>
                       <p className="text-xs font-medium text-slate-400 mt-2">Critical Ingress Wave</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                       <h4 className="text-xl font-black uppercase tracking-tighter italic border-b border-slate-100 pb-4">Volume & Traffic Rankings</h4>
                       <div className="space-y-4">
                          {[
                             { label: 'Foot Traffic', value: '1,240 weekly', trend: '+12%', icon: Users },
                             { label: 'Food Units Sold', value: '890 weekly', trend: '+5%', icon: Utensils },
                             { label: 'Beverage Velocity', value: '2,140 weekly', trend: '+22%', icon: Wine }
                          ].map((item, i) => (
                             <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-[30px] border border-slate-100">
                                <div className="flex items-center gap-4">
                                   <item.icon size={20} className="text-brand-primary" />
                                   <span className="font-bold text-slate-800">{item.label}</span>
                                </div>
                                <div className="text-right">
                                   <p className="font-black italic">{item.value}</p>
                                   <span className="text-[10px] font-black text-emerald-500">{item.trend}</span>
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-8">
                       <h4 className="text-xl font-black uppercase tracking-tighter italic border-b border-slate-100 pb-4">Service & Personnel Insight</h4>
                       <div className="space-y-6">
                          <div className="p-8 bg-brand-primary/5 rounded-[40px] border border-brand-primary/10">
                             <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-4">Mentioned Waitrons (Positive)</p>
                             <div className="flex flex-wrap gap-4">
                                <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-brand-primary/10 flex items-center gap-2">
                                   <Zap size={14} className="text-brand-primary" fill="currentColor" />
                                   <span className="text-xs font-black">Alex H.</span>
                                </div>
                                <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-brand-primary/10 flex items-center gap-2">
                                   <Zap size={14} className="text-brand-primary" fill="currentColor" />
                                   <span className="text-xs font-black">Sarah T.</span>
                                </div>
                             </div>
                             <p className="text-[10px] font-medium text-slate-500 mt-6 leading-relaxed italic">
                                Summary: Customer logs specifically note "Alex" for speed and "Sarah" for menu knowledge in Sunday Theory contexts.
                             </p>
                          </div>
                          
                          <div className="p-8 bg-red-50 rounded-[40px] border border-red-100">
                             <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4">Bottleneck Warning</p>
                             <p className="text-sm font-bold text-red-800 italic leading-relaxed">
                                Friday evening food delay is consistently linked to 19:30 table turnovers. Cross-ref with Kitchen Prep board shows 15% lag in ticket firing during this window.
                             </p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="p-10 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
                 <div className="flex items-center gap-3">
                    <FileText className="text-slate-400" size={20} />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CSV Manifest contains 128 rows of granular POS and Sentiment data.</p>
                 </div>
                 <button className="bg-brand-primary text-white px-12 py-5 rounded-3xl text-[11px] font-black uppercase tracking-widest shadow-2xl shadow-brand-primary/20 hover:scale-[1.02] transition-all flex items-center gap-3">
                    Download Full CSV Package <Zap size={18} fill="currentColor" />
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default InsightsModule;
