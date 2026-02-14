
import React, { useState, useCallback } from 'react';
import { SocialPlatform, SocialLink, ProjectContext, Feedback, TaskPriority, TaskCategory, TaskStatus } from '../types';
// Fixed: Added ArrowRight to the lucide-react imports
import { Facebook, Instagram, Linkedin, Twitter, Youtube, Globe, Radio, Plus, X, Save, Zap, MessageSquare, TrendingUp, Link as LinkIcon, Smartphone, Target, Info, Loader2, ChevronRight, CheckCircle2, Trash2, ShieldCheck, KeyRound, Lock, Eye, Sparkles, Lightbulb, Clapperboard, ArrowRight } from 'lucide-react';
import { synthesizeSocialIntelligence } from '../services/geminiService';

interface SocialIntelModuleProps {
  links: SocialLink[];
  context: ProjectContext;
  onAddLink: (link: Omit<SocialLink, 'id' | 'status'>) => void;
  onDeleteLink: (id: string) => void;
  onInjectTasks: (tasks: any[]) => void;
  onInjectFeedback: (feedback: Feedback[]) => void;
}

const SocialIntelModule: React.FC<SocialIntelModuleProps> = ({ 
  links, context, onAddLink, onDeleteLink, onInjectTasks, onInjectFeedback 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [intel, setIntel] = useState<any>(null);
  const [authStep, setAuthStep] = useState<'platform' | 'authenticating' | 'success'>('platform');
  
  const [formData, setFormData] = useState({
    platform: SocialPlatform.INSTAGRAM,
    url: ''
  });

  const platforms = [
    { id: SocialPlatform.INSTAGRAM, icon: Instagram, color: 'text-pink-500', brand: 'Instagram' },
    { id: SocialPlatform.FACEBOOK, icon: Facebook, color: 'text-blue-600', brand: 'Facebook' },
    { id: SocialPlatform.TIKTOK, icon: Smartphone, color: 'text-slate-900', brand: 'TikTok' },
    { id: SocialPlatform.TWITTER, icon: Twitter, color: 'text-sky-400', brand: 'X (Twitter)' },
    { id: SocialPlatform.LINKEDIN, icon: Linkedin, color: 'text-blue-700', brand: 'LinkedIn' },
    { id: SocialPlatform.YOUTUBE, icon: Youtube, color: 'text-red-600', brand: 'YouTube' },
    { id: SocialPlatform.WEBSITE, icon: Globe, color: 'text-slate-500', brand: 'Website' },
  ];

  const handleFetchPulse = async () => {
    if (links.length === 0) return;
    setIsSynthesizing(true);
    const result = await synthesizeSocialIntelligence(links, context);
    if (result) {
      setIntel(result);
    }
    setIsSynthesizing(false);
  };

  const simulateAuth = async (platform: SocialPlatform) => {
    setFormData(prev => ({ ...prev, platform }));
    setAuthStep('authenticating');
    
    // Simulate OAuth Delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Generate Mock Metrics
    const followers = Math.floor(Math.random() * 50000) + 2000;
    const postsCount = Math.floor(Math.random() * 500) + 50;
    const topPosts = [
       { title: "Weekend Recap: Sold Out Sunday", reach: 12400, engagement: 850 },
       { title: "Chef's Special: The Yard Burger", reach: 8900, engagement: 420 }
    ];

    onAddLink({ 
      platform, 
      url: `https://${platform}.com/official_handle`,
      followers,
      postsCount,
      topPosts
    });
    
    setAuthStep('success');
    setTimeout(() => {
       setIsModalOpen(false);
       setAuthStep('platform');
    }, 1500);
  };

  const integrateIntelligence = () => {
    if (!intel) return;
    
    const newTasks = intel.suggestedTasks.map((t: any) => ({
      id: `ai-social-${Date.now()}-${Math.random()}`,
      title: t.title,
      description: t.description,
      priority: t.priority.toLowerCase() as TaskPriority,
      category: 'marketing' as TaskCategory,
      status: TaskStatus.TODO,
      assignees: [],
      dueDate: new Date().toISOString().split('T')[0],
      isRecurring: false,
      recurrenceType: 'none',
      context,
      progress: 0
    }));

    const newFeedback = intel.comments.map((c: any) => ({
      id: `ai-feedback-${Date.now()}-${Math.random()}`,
      source: c.platform.toLowerCase() as any,
      category: c.category.toLowerCase() as any,
      severity: c.severity.toLowerCase() as any,
      comment: c.comment,
      handle: c.handle,
      resolved: false,
      timestamp: new Date().toISOString()
    }));

    onInjectTasks(newTasks);
    onInjectFeedback(newFeedback);
    setIntel(null);
  };

  const activePlat = platforms.find(p => p.id === formData.platform);

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
             <Radio className="text-brand-accent animate-pulse" size={16} />
             <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-accent">Live Listening Post</p>
          </div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-6">Digital Presence</h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Real-time social metrics and sentiment analysis.</p>
        </div>
        <div className="flex gap-4">
           <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-white border-2 border-slate-100 px-8 py-5 rounded-[30px] text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all shadow-sm flex items-center gap-3"
           >
             <LinkIcon size={18} /> Add Social Hub
           </button>
           <button 
            onClick={handleFetchPulse}
            disabled={links.length === 0 || isSynthesizing}
            className="bg-brand-primary text-white px-10 py-5 rounded-[30px] text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all flex items-center gap-3 disabled:opacity-30"
           >
             {isSynthesizing ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
             Synthesize Signal
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-1 space-y-8">
           <h3 className="text-xl font-black uppercase tracking-tighter italic text-slate-800 flex items-center gap-3"><ShieldCheck size={20} className="text-emerald-500" /> Connected Hubs</h3>
           <div className="grid grid-cols-1 gap-6">
              {links.map(link => {
                const plat = platforms.find(p => p.id === link.platform);
                return (
                  <div key={link.id} className="bg-white p-8 rounded-[45px] border border-slate-50 shadow-xl shadow-black/5 hover:border-brand-primary/20 transition-all group">
                     <div className="flex justify-between items-start mb-6">
                        <div className={`p-4 rounded-2xl bg-slate-50 ${plat?.color} shadow-sm`}><plat?.icon size={24} /></div>
                        <button onClick={() => onDeleteLink(link.id)} className="p-2 text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                     </div>
                     <div className="mb-6">
                        <h4 className="text-lg font-black uppercase tracking-tight text-slate-800 leading-none">{plat?.brand}</h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 truncate">@{link.url.split('/').pop()}</p>
                     </div>
                     <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
                        <div>
                           <p className="text-xl font-black italic text-slate-800 tracking-tighter">{(link.followers || 0).toLocaleString()}</p>
                           <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Followers</p>
                        </div>
                        <div className="text-right">
                           <p className="text-xl font-black italic text-slate-800 tracking-tighter">{link.postsCount || 0}</p>
                           <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest">Post Volume</p>
                        </div>
                     </div>
                     {link.topPosts && link.topPosts.length > 0 && (
                        <div className="mt-6 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                           <TrendingUp size={14} className="text-emerald-500" />
                           <p className="text-[8px] font-black uppercase text-emerald-800 tracking-widest truncate">Peak: {link.topPosts[0].title}</p>
                        </div>
                     )}
                  </div>
                );
              })}
              {links.length === 0 && (
                <div className="p-16 border-2 border-dashed border-slate-200 rounded-[50px] flex flex-col items-center justify-center opacity-30 text-center">
                   <LinkIcon size={48} className="mb-4" />
                   <p className="text-xs font-black uppercase tracking-[0.2em]">Platform Registry Empty</p>
                </div>
              )}
           </div>
        </div>

        <div className="lg:col-span-3 space-y-12">
           {isSynthesizing ? (
              <div className="h-[700px] bg-slate-900 rounded-[60px] flex flex-col items-center justify-center text-center p-12 relative overflow-hidden">
                 <div className="absolute inset-0 bg-brand-primary/5 animate-pulse" />
                 <Loader2 size={80} className="text-brand-accent animate-spin mb-10" />
                 <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-4 leading-none">Scraping Digital Noise</h3>
                 <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-xs">Parsing connected links for discourse, trends, and reach...</p>
              </div>
           ) : intel ? (
              <div className="space-y-12 animate-in zoom-in-95 duration-500">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-[#1A1A1A] p-12 rounded-[50px] text-white relative overflow-hidden flex flex-col justify-between h-72 border border-white/5">
                       <div className="absolute top-0 right-0 p-10 opacity-5"><Target size={160} /></div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-brand-primary mb-6">Aggregate Sentiment</p>
                          <h4 className="text-8xl font-black italic tracking-tighter text-white leading-none">{intel.sentimentScore}%</h4>
                       </div>
                       <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-primary shadow-[0_0_20px_rgba(175,67,29,0.7)] transition-all duration-1000" style={{ width: `${intel.sentimentScore}%` }} />
                       </div>
                    </div>
                    <div className="bg-brand-primary p-12 rounded-[50px] text-white flex flex-col justify-between h-72 shadow-2xl shadow-brand-primary/20">
                       <div>
                          <div className="flex items-center gap-3 mb-4">
                             <TrendingUp size={28} />
                             <h4 className="text-2xl font-black italic uppercase tracking-tighter">Market Synthesis</h4>
                          </div>
                          <p className="text-lg font-medium italic leading-relaxed opacity-90">"{intel.summary}"</p>
                       </div>
                       <button onClick={integrateIntelligence} className="w-full mt-6 py-5 bg-white text-slate-900 rounded-[25px] text-[10px] font-black uppercase tracking-[0.3em] shadow-xl hover:scale-102 transition-transform flex items-center justify-center gap-3">Inject Tactical Data <ChevronRight size={14} /></button>
                    </div>
                 </div>

                 {/* Trend Pulse Section */}
                 <div className="space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-[0.5em] text-slate-400 flex items-center gap-3"><Sparkles size={16} className="text-brand-accent" /> Trending Pulse</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       {intel.platformTrends?.map((trend: any, i: number) => (
                          <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl shadow-black/5 hover:border-brand-primary/30 transition-all flex flex-col justify-between group">
                             <div>
                                <div className="flex justify-between items-start mb-4">
                                   <span className="text-[10px] font-black uppercase text-brand-primary">{trend.platform}</span>
                                   <Zap size={14} className="text-brand-accent" fill="currentColor" />
                                </div>
                                <h5 className="text-lg font-black italic text-slate-800 uppercase tracking-tight mb-3">#{trend.trendName}</h5>
                                <p className="text-xs font-medium text-slate-500 leading-relaxed italic">"{trend.brandParticipationIdea}"</p>
                             </div>
                             <button className="mt-6 text-[9px] font-black uppercase tracking-widest text-brand-primary flex items-center gap-2">Draft Script <ArrowRight size={10} /></button>
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* Content Laboratory */}
                 <div className="space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-[0.5em] text-slate-400 flex items-center gap-3"><Clapperboard size={16} /> Content Laboratory</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {intel.creativeBriefs?.map((brief: any, i: number) => (
                          <div key={i} className="bg-slate-50 p-10 rounded-[50px] border border-slate-200 flex flex-col gap-6 group hover:bg-white transition-all">
                             <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-brand-accent"><Lightbulb size={24} /></div>
                                <div>
                                   <p className="text-[10px] font-black uppercase text-slate-400">{brief.platform} Strategy</p>
                                   <h5 className="text-lg font-black italic text-slate-800 uppercase tracking-tighter">Scale Success: "{brief.basedOnPost}"</h5>
                                </div>
                             </div>
                             <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                <p className="text-[9px] font-black uppercase text-brand-primary mb-2">The Idea</p>
                                <p className="text-sm font-bold text-slate-700 leading-relaxed">"{brief.newContentIdea}"</p>
                             </div>
                             <div className="flex items-start gap-3">
                                <Info size={14} className="text-slate-300 mt-0.5 shrink-0" />
                                <p className="text-[10px] font-medium text-slate-400 italic">"Why it works: {brief.strategyRationale}"</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                       <h4 className="text-xs font-black uppercase tracking-[0.5em] text-slate-400 flex items-center gap-3"><MessageSquare size={16} /> Customer Sentinel</h4>
                       <div className="space-y-6">
                          {intel.comments.map((c: any, i: number) => (
                             <div key={i} className={`p-8 rounded-[40px] border transition-all group ${c.isPhysicalFeedback ? 'bg-indigo-50 border-indigo-100 shadow-indigo-500/5' : 'bg-white border-slate-100 shadow-xl shadow-black/5 hover:border-brand-primary/30'}`}>
                                <div className="flex justify-between items-start mb-4">
                                   <div className="flex items-center gap-3">
                                      <span className="text-[10px] font-black uppercase text-brand-primary">{c.platform}</span>
                                      <span className="text-[10px] font-bold text-slate-300 italic">@{c.handle}</span>
                                   </div>
                                   <div className="flex flex-col items-end gap-2">
                                      <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${c.severity === 'high' ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-emerald-50 text-emerald-500 border border-emerald-100'}`}>{c.severity} attention</div>
                                      {c.isPhysicalFeedback && (
                                         <div className="px-2 py-0.5 bg-indigo-600 text-white rounded-lg text-[7px] font-black uppercase tracking-widest flex items-center gap-1">
                                            <Eye size={8} /> Voice of Customer
                                         </div>
                                      )}
                                   </div>
                                </div>
                                <p className="text-sm font-bold text-slate-700 leading-relaxed italic">"{c.comment}"</p>
                             </div>
                          ))}
                       </div>
                    </div>

                    <div className="space-y-6">
                       <h4 className="text-xs font-black uppercase tracking-[0.5em] text-slate-400 flex items-center gap-3"><Zap size={16} fill="currentColor" /> Autonomous Recommendations</h4>
                       <div className="space-y-6">
                          {intel.suggestedTasks.map((t: any, i: number) => (
                             <div key={i} className="p-8 bg-slate-900 rounded-[40px] border border-white/5 text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 transition-transform"><Target size={120} /></div>
                                <h5 className="text-lg font-black italic uppercase tracking-tight mb-2 text-brand-accent">{t.title}</h5>
                                <p className="text-xs font-bold text-white/50 leading-relaxed italic pr-12">"{t.description}"</p>
                                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-6">
                                   <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">Target Role: {t.assignedRole}</span>
                                   <CheckCircle2 size={16} className="text-brand-primary opacity-40" />
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
           ) : (
              <div className="h-[700px] bg-white rounded-[60px] border-4 border-dashed border-slate-100 flex flex-col items-center justify-center text-center p-12 opacity-30">
                 <div className="p-10 bg-slate-50 rounded-full mb-8"><Radio size={120} strokeWidth={1} className="text-slate-300" /></div>
                 <h3 className="text-4xl font-black italic uppercase tracking-tighter text-slate-800 mb-4">Signal Silence</h3>
                 <p className="text-slate-400 font-bold uppercase tracking-[0.4em] text-[10px] max-w-sm mx-auto">Establish secure platform links to begin digital reach synthesis.</p>
              </div>
           )}
        </div>
      </div>

      {/* Link Presence Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-2xl rounded-[60px] shadow-2xl border-4 border-white overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                 <div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900">Establish Link</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Platform Identity Integration</p>
                 </div>
                 <button onClick={() => { setIsModalOpen(false); setAuthStep('platform'); }} className="p-3 hover:bg-slate-100 rounded-full transition-colors"><X size={28} /></button>
              </div>
              
              <div className="p-10">
                 {authStep === 'platform' && (
                    <div className="space-y-8">
                       <p className="text-sm font-bold text-slate-500 italic text-center px-12">Select a digital hub to authorize Trackly as a secure listener for engagement metrics.</p>
                       <div className="grid grid-cols-2 gap-4">
                          {platforms.map(p => (
                             <button 
                                key={p.id} type="button" 
                                onClick={() => simulateAuth(p.id)}
                                className="group p-8 rounded-[40px] bg-slate-50 border-2 border-transparent hover:border-brand-primary hover:bg-white transition-all text-center flex flex-col items-center gap-4 shadow-sm"
                             >
                                <div className={`p-5 rounded-[25px] bg-white shadow-md transition-transform group-hover:scale-110 ${p.color}`}><p.icon size={32} /></div>
                                <div>
                                   <h4 className="text-lg font-black uppercase tracking-tight italic text-slate-800 leading-none">{p.brand}</h4>
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Authorize Sync</p>
                                </div>
                             </button>
                          ))}
                       </div>
                    </div>
                 )}

                 {authStep === 'authenticating' && (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-10 animate-in fade-in duration-500">
                       <div className="relative">
                          <div className={`w-32 h-32 rounded-[45px] bg-slate-50 shadow-xl flex items-center justify-center ${activePlat?.color}`}>
                             {activePlat && <activePlat.icon size={56} />}
                          </div>
                          <div className="absolute inset-0 rounded-[45px] border-4 border-brand-primary animate-ping opacity-20" />
                          <div className="absolute -bottom-2 -right-2 p-3 bg-brand-primary text-white rounded-2xl shadow-xl animate-bounce">
                             <KeyRound size={24} />
                          </div>
                       </div>
                       <div>
                          <h4 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-3">Gateway Secure</h4>
                          <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px]">Authorizing protocol with {activePlat?.brand} API...</p>
                       </div>
                       <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-primary animate-loading-bar shadow-[0_0_10px_#af431d]" />
                       </div>
                    </div>
                 )}

                 {authStep === 'success' && (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-10 animate-in zoom-in-95 duration-500">
                       <div className="w-32 h-32 rounded-[45px] bg-emerald-500 text-white shadow-2xl flex items-center justify-center">
                          <ShieldCheck size={64} />
                       </div>
                       <div>
                          <h4 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 mb-3">Sync Active</h4>
                          <p className="text-emerald-600 font-black uppercase tracking-[0.4em] text-[10px]">Presence integrated into core pulse.</p>
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default SocialIntelModule;
