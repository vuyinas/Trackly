
import React, { useState } from 'react';
import { LayoutDashboard, CheckSquare, Users, Calendar as CalendarIcon, Clock, LogOut, ShoppingCart, UtensilsCrossed, Zap, ChevronRight, BarChart3, Music, Truck, Ticket, ClipboardList, Receipt, Settings2, HeartPulse, Video, Landmark, FileBarChart, Menu, X } from 'lucide-react';
import { AppMode, ProjectContext, UserRole, Responsibility, UserProfile } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  context: ProjectContext;
  setContext: (ctx: ProjectContext) => void;
  user: UserProfile;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, setActiveTab, appMode, setAppMode, context, setContext, user, onLogout 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isManager = user.role === UserRole.OWNER || user.role === UserRole.MANAGER;

  const hasAccess = (resp: Responsibility) => user.responsibilities.includes(resp);

  const tracklyItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Pulse', resp: Responsibility.DASHBOARD },
    { id: 'tasks', icon: CheckSquare, label: 'Ops Board', resp: Responsibility.TASKS },
    { id: 'calendar', icon: CalendarIcon, label: 'Calendar', resp: Responsibility.CALENDAR },
    { id: 'meeting-room', icon: Video, label: 'Meeting Hub', resp: Responsibility.MEETINGS },
    { id: 'deliveries', icon: Truck, label: 'Supply Chain', resp: Responsibility.SUPPLY_CHAIN },
    { id: 'ticketing', icon: Ticket, label: 'Ticketing', resp: Responsibility.TICKETING },
    { id: 'execution', icon: ClipboardList, label: 'Execution Hub', resp: Responsibility.EXECUTION },
    { id: 'events', icon: Music, label: 'Events', resp: Responsibility.EVENTS },
    { id: 'insights', icon: BarChart3, label: 'Insights', resp: Responsibility.INSIGHTS },
    { id: 'reports', icon: FileBarChart, label: 'Reports', resp: Responsibility.REPORTS },
    { id: 'team', icon: Users, label: 'Staff Hub', resp: Responsibility.STAFF },
    { id: 'shifts', icon: Clock, label: 'Scheduling', resp: Responsibility.SHIFT_PLANNER },
    { id: 'payroll', icon: Landmark, label: 'Payroll', resp: Responsibility.PAYROLL },
    { id: 'break', icon: HeartPulse, label: 'Wellness', resp: Responsibility.WELLNESS },
  ].filter(item => hasAccess(item.resp));

  const posItems = [
    { id: 'pos-terminal', icon: ShoppingCart, label: 'Sale Terminal', resp: Responsibility.POS },
    { id: 'kds', icon: UtensilsCrossed, label: 'Kitchen Queue', resp: Responsibility.KDS },
    { id: 'bills', icon: Receipt, label: 'Bill Hub', resp: Responsibility.BILLS },
    { id: 'menu-manager', icon: Settings2, label: 'Menu Lab', resp: Responsibility.MENU_MANAGER },
  ].filter(item => hasAccess(item.resp));

  const NavContent = () => (
    <>
      <div className="p-4 md:p-6 shrink-0 overflow-hidden">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="min-w-[32px] w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center font-black text-[#1A1A1A]">T</div>
            <h1 className="text-xl font-black text-white tracking-tighter italic md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">TRACKLY</h1>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-white/40 p-2"><X size={20} /></button>
        </div>

        {isManager && (
          <div className="flex p-1 bg-white/5 rounded-2xl mb-8 border border-white/10 md:min-w-[48px]">
            <button 
              onClick={() => { setAppMode(AppMode.TRACKLY); setActiveTab('dashboard'); }}
              className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all ${appMode === AppMode.TRACKLY ? 'bg-brand-primary text-white shadow-lg' : 'hover:text-white'}`}
            >
              <Zap size={14} />
              <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest mt-0.5 md:opacity-0 md:group-hover:opacity-100 whitespace-nowrap">OPS</span>
            </button>
            <button 
              onClick={() => { setAppMode(AppMode.POS); setActiveTab('pos-terminal'); }}
              className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all ${appMode === AppMode.POS ? 'bg-brand-accent text-[#1A1A1A] shadow-lg' : 'hover:text-white'}`}
            >
              <ShoppingCart size={14} />
              <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest mt-0.5 md:opacity-0 md:group-hover:opacity-100 whitespace-nowrap">POS</span>
            </button>
          </div>
        )}

        <div className="space-y-2 mb-8">
          <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] px-2 mb-3 md:opacity-0 md:group-hover:opacity-100 whitespace-nowrap">Context</p>
          <button 
            onClick={() => setContext(ProjectContext.THE_YARD)}
            className={`w-full group/btn text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${context === ProjectContext.THE_YARD ? 'bg-white/10 text-white shadow-xl' : 'hover:bg-white/5'}`}
          >
            <div className="flex items-center gap-2">
               <div className={`min-w-[8px] w-2 h-2 rounded-full ${context === ProjectContext.THE_YARD ? 'bg-[#AF431D]' : 'bg-white/20'}`} />
               <span className="md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">The Yard</span>
            </div>
            {context === ProjectContext.THE_YARD && <ChevronRight size={14} className="text-brand-accent md:opacity-0 md:group-hover:opacity-100" />}
          </button>
          <button 
            onClick={() => setContext(ProjectContext.SUNDAY_THEORY)}
            className={`w-full group/btn text-left px-4 py-3 rounded-2xl text-xs font-bold flex items-center justify-between transition-all ${context === ProjectContext.SUNDAY_THEORY ? 'bg-white/10 text-white shadow-xl' : 'hover:bg-white/5'}`}
          >
             <div className="flex items-center gap-2">
               <div className={`min-w-[8px] w-2 h-2 rounded-full ${context === ProjectContext.SUNDAY_THEORY ? 'bg-[#8B8635]' : 'bg-white/20'}`} />
               <span className="md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">Sunday Theory</span>
            </div>
            {context === ProjectContext.SUNDAY_THEORY && <ChevronRight size={14} className="text-brand-accent md:opacity-0 md:group-hover:opacity-100" />}
          </button>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {(appMode === AppMode.TRACKLY ? tracklyItems : posItems).map((item) => (
          <button
            key={item.id}
            onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group/nav ${
              activeTab === item.id 
                ? (appMode === AppMode.TRACKLY ? 'bg-brand-primary text-white' : 'bg-brand-accent text-[#1A1A1A]') 
                : 'hover:bg-white/5 hover:text-white'
            }`}
          >
            <item.icon size={18} strokeWidth={2.5} className="shrink-0" />
            <span className="font-bold text-[10px] md:text-xs uppercase tracking-widest md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 md:p-6 mt-auto overflow-hidden">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all border border-transparent hover:border-red-500/20"
        >
          <LogOut size={16} className="shrink-0" />
          <span className="text-[9px] font-black uppercase tracking-widest md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">Lock Terminal</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Collapsible Hover Sidebar */}
      <div className="hidden md:flex flex-col bg-[#1A1A1A] h-screen text-[#A1A1A1] fixed left-0 top-0 z-40 theme-transition border-r border-white/5 w-20 hover:w-64 group transition-all duration-300 ease-in-out shadow-2xl">
        <NavContent />
      </div>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#1A1A1A] z-40 flex items-center justify-between px-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-accent rounded-lg flex items-center justify-center font-black text-[#1A1A1A]">T</div>
          <h1 className="text-lg font-black text-white tracking-tighter italic">TRACKLY</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)} className="text-white p-2">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="fixed inset-y-0 left-0 w-[280px] bg-[#1A1A1A] shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <NavContent />
          </div>
          <div className="flex-1 h-full" onClick={() => setIsMobileMenuOpen(false)} />
        </div>
      )}
    </>
  );
};

export default Sidebar;
