
import React from 'react';
import { LayoutDashboard, CheckSquare, Users, Mail, Calendar, Clock, LogOut, ShoppingCart, UtensilsCrossed, Zap, ChevronRight, BarChart3, Music, Truck, Ticket, HeartPulse } from 'lucide-react';
import { AppMode, ProjectContext, UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  context: ProjectContext;
  setContext: (ctx: ProjectContext) => void;
  role: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, setActiveTab, appMode, setAppMode, context, setContext, role 
}) => {
  const isManager = role === UserRole.OWNER || role === UserRole.MANAGER;

  const tracklyItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Pulse' },
    { id: 'tasks', icon: CheckSquare, label: 'Ops Board' },
    { id: 'deliveries', icon: Truck, label: 'Supply Chain' },
    { id: 'ticketing', icon: Ticket, label: 'Ticketing', context: ProjectContext.SUNDAY_THEORY },
    { id: 'events', icon: Music, label: 'Events' },
    { id: 'insights', icon: BarChart3, label: 'Insights' },
    { id: 'team', icon: Users, label: 'Staff' },
    { id: 'shifts', icon: Calendar, label: 'Scheduling' },
    { id: 'break', icon: HeartPulse, label: 'Wellness' },
  ];

  return (
    <div className="w-64 bg-[#1A1A1A] h-screen flex flex-col text-[#A1A1A1] fixed left-0 top-0 z-40 theme-transition border-r border-white/5">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center font-black text-[#1A1A1A]">T</div>
            <h1 className="text-xl font-black text-white tracking-tighter italic">TRACKLY</h1>
          </div>
        </div>

        {isManager && (
          <div className="flex p-1 bg-white/5 rounded-2xl mb-8 border border-white/5">
            <button 
              onClick={() => setAppMode(AppMode.TRACKLY)}
              className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all ${appMode === AppMode.TRACKLY ? 'bg-brand-primary text-white shadow-lg' : 'hover:text-white'}`}
            >
              <Zap size={14} className="mb-1" />
              <span className="text-[9px] font-black uppercase tracking-widest">OPS</span>
            </button>
            <button 
              onClick={() => setAppMode(AppMode.POS)}
              className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all ${appMode === AppMode.POS ? 'bg-brand-accent text-[#1A1A1A] shadow-lg' : 'hover:text-white'}`}
            >
              <ShoppingCart size={14} className="mb-1" />
              <span className="text-[9px] font-black uppercase tracking-widest">POS</span>
            </button>
          </div>
        )}

        <div className="space-y-2 mb-8">
          <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] px-2 mb-3">Operating Context</p>
          <button 
            onClick={() => setContext(ProjectContext.THE_YARD)}
            className={`w-full group text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${context === ProjectContext.THE_YARD ? 'bg-white/10 text-white shadow-xl shadow-black/20' : 'hover:bg-white/5'}`}
          >
            <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${context === ProjectContext.THE_YARD ? 'bg-[#AF431D]' : 'bg-white/20'}`} />
               The Yard
            </div>
            {context === ProjectContext.THE_YARD && <ChevronRight size={14} className="text-brand-accent" />}
          </button>
          <button 
            onClick={() => setContext(ProjectContext.SUNDAY_THEORY)}
            className={`w-full group text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${context === ProjectContext.SUNDAY_THEORY ? 'bg-white/10 text-white shadow-xl shadow-black/20' : 'hover:bg-white/5'}`}
          >
             <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${context === ProjectContext.SUNDAY_THEORY ? 'bg-[#8B8635]' : 'bg-white/20'}`} />
               Sunday Theory
            </div>
            {context === ProjectContext.SUNDAY_THEORY && <ChevronRight size={14} className="text-brand-accent" />}
          </button>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
        {appMode === AppMode.TRACKLY ? (
          tracklyItems.filter(item => !item.context || item.context === context).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-brand-primary text-white shadow-xl shadow-black/20' 
                  : 'hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={18} strokeWidth={2.5} />
              <span className="font-bold text-xs uppercase tracking-widest">{item.label}</span>
            </button>
          ))
        ) : (
          <div className="space-y-2">
             <button
              onClick={() => setActiveTab('pos-terminal')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === 'pos-terminal' ? 'bg-brand-accent text-[#1A1A1A] shadow-lg' : 'hover:bg-white/5 hover:text-white'}`}
            >
              <ShoppingCart size={18} strokeWidth={2.5} />
              <span className="font-black text-xs uppercase tracking-widest">Sales Terminal</span>
            </button>
            <button
              onClick={() => setActiveTab('kds')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === 'kds' ? 'bg-white/10 text-white shadow-lg' : 'hover:bg-white/5 hover:text-white'}`}
            >
              <UtensilsCrossed size={18} strokeWidth={2.5} />
              <span className="font-black text-xs uppercase tracking-widest">Kitchen Queue</span>
            </button>
          </div>
        )}
      </nav>

      <div className="p-6 mt-auto">
        <button 
          onClick={() => window.location.reload()}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all border border-transparent hover:border-red-500/20"
        >
          <LogOut size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">Lock Terminal</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
