
import React from 'react';
import { LayoutDashboard, CheckSquare, Users, ShoppingCart, Zap, Music, Ticket, Bed, Utensils, Brush, BookOpen, Hammer, Coffee, Star, Truck, BarChart3, Calendar, HeartPulse, Receipt, UtensilsCrossed, Menu as MenuIcon, Landmark, FileText, Radio, Video, Box, Music4, ClipboardList } from 'lucide-react';
import { AppMode, ProjectContext, UserRole, UserProfile, Business, Sector, Responsibility } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  appMode: AppMode;
  setAppMode: (mode: AppMode) => void;
  context: ProjectContext;
  setContext: (ctx: ProjectContext) => void;
  user: UserProfile;
  activeSector: Sector;
  onSectorChange: (sector: Sector) => void;
  businesses: Business[];
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, setActiveTab, appMode, setAppMode, context, setContext, user, 
  activeSector, onSectorChange, businesses
}) => {
  const isOwner = user?.role === UserRole.OWNER;
  const isManager = isOwner || user?.role === UserRole.MANAGER;

  // Domain Isolation: Staff only see their assigned sector. Owners see all.
  const accessibleSectors = isOwner 
    ? [Sector.THE_YARD, Sector.SUNDAY_THEORY, Sector.HOTEL] 
    : businesses.filter(b => user.assignedBusinesses.includes(b.id)).map(b => b.sector);

  const hasAccess = (res: Responsibility) => isOwner || user.responsibilities.includes(res);

  const hospitalityOps = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Pulse', res: Responsibility.DASHBOARD },
    { id: 'tasks', icon: CheckSquare, label: 'Ops Board', res: Responsibility.TASKS },
    { id: 'execution', icon: ClipboardList, label: 'Execution Hub', res: Responsibility.EXECUTION },
    { id: 'calendar', icon: Calendar, label: 'Calendar', res: Responsibility.CALENDAR },
    { id: 'meeting-hub', icon: Video, label: 'Meeting Hub', res: Responsibility.MEETINGS },
    { id: 'deliveries', icon: Truck, label: 'Supply Chain', res: Responsibility.DELIVERIES },
    { id: 'ticketing', icon: Ticket, label: 'Ticketing', res: Responsibility.TICKETING },
    { id: 'events', icon: Music, label: 'Events', res: Responsibility.EVENTS },
    { id: 'insights', icon: BarChart3, label: 'Insights', res: Responsibility.INSIGHTS },
    { id: 'social-intel', icon: Radio, label: 'Social Pulse', res: Responsibility.SOCIAL },
    { id: 'staff', icon: Users, label: 'Staff Hub', res: Responsibility.STAFF },
    { id: 'payroll', icon: Landmark, label: 'Payroll', res: Responsibility.PAYROLL },
    { id: 'reports', icon: FileText, label: 'Reports', res: Responsibility.REPORTS },
    { id: 'shifts', icon: Calendar, label: 'Scheduling', res: Responsibility.SHIFTS },
    { id: 'break', icon: HeartPulse, label: 'Wellness', res: Responsibility.STAFF },
  ].filter(item => hasAccess(item.res));

  const hotelOps = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'T3S Pulse', res: Responsibility.DASHBOARD },
    { id: 'tasks', icon: CheckSquare, label: 'Ops Board', res: Responsibility.TASKS },
    { id: 'meeting-hub', icon: Video, label: 'Meeting Hub', res: Responsibility.MEETINGS },
    { id: 'inventory', icon: Box, label: 'Inventory', res: Responsibility.INVENTORY },
    { id: 'guest-management', icon: BookOpen, label: 'Guest Ledger', res: Responsibility.GUEST_LEDGER },
    { id: 'housekeeping', icon: Brush, label: 'Housekeeping', res: Responsibility.HOUSEKEEPING },
    { id: 'vip-residency', icon: Star, label: 'Talent Stay', res: Responsibility.VIP },
    { id: 'hotel-dining', icon: Coffee, label: 'Dining Hub', res: Responsibility.DINING },
    { id: 'deliveries', icon: Truck, label: 'Supply Chain', res: Responsibility.DELIVERIES },
    { id: 'facilities', icon: Hammer, label: 'Maintenance', res: Responsibility.FACILITIES },
    { id: 'staff', icon: Users, label: 'Staff Hub', res: Responsibility.STAFF },
    { id: 'payroll', icon: Landmark, label: 'Payroll', res: Responsibility.PAYROLL },
    { id: 'reports', icon: FileText, label: 'Reports', res: Responsibility.REPORTS },
    { id: 'insights', icon: BarChart3, label: 'Insights', res: Responsibility.INSIGHTS },
    { id: 'shifts', icon: Calendar, label: 'Scheduling', res: Responsibility.SHIFTS },
    { id: 'break', icon: HeartPulse, label: 'Wellness', res: Responsibility.STAFF },
  ].filter(item => hasAccess(item.res));

  const hospitalityPos = [
    { id: 'pos-terminal', icon: ShoppingCart, label: 'Sales Terminal' },
    { id: 'kds', icon: UtensilsCrossed, label: 'Kitchen Queue' },
    { id: 'bills', icon: Receipt, label: 'Settlements' },
    { id: 'menu-manager', icon: MenuIcon, label: 'Menu Lab' },
  ];

  const hotelPos = [
    { id: 'pos-terminal', icon: ShoppingCart, label: 'Sales Terminal' },
    { id: 'kds', icon: UtensilsCrossed, label: 'Kitchen Queue' },
    { id: 'bills', icon: Receipt, label: 'Settlements' },
    { id: 'menu-manager', icon: MenuIcon, label: 'Menu Lab' },
  ];

  let items = [];
  if (appMode === AppMode.POS) {
    items = activeSector === Sector.HOTEL ? hotelPos : hospitalityPos;
  } else {
    items = activeSector === Sector.HOTEL ? hotelOps : hospitalityOps;
  }

  return (
    <div className="hidden md:flex flex-col bg-[#1A1A1A] h-screen text-[#A1A1A1] fixed left-0 top-0 z-40 border-r border-white/5 w-20 hover:w-64 group transition-all duration-300 ease-in-out shadow-2xl">
      <div className="flex flex-col h-full overflow-hidden">
        <div className="p-4 shrink-0">
          {(isOwner || (accessibleSectors.length > 1 && isManager)) && (
            <div className="flex bg-white/5 rounded-2xl mb-4 border border-white/10 p-1 flex-col gap-1">
               {accessibleSectors.includes(Sector.THE_YARD) && (
                 <button onClick={() => onSectorChange(Sector.THE_YARD)} 
                   className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${activeSector === Sector.THE_YARD ? 'bg-brand-primary text-white shadow-lg' : 'hover:text-white'}`}>
                   <Utensils size={16} />
                   <span className="text-[7px] font-black uppercase md:opacity-0 md:group-hover:opacity-100 transition-opacity whitespace-nowrap">The Yard</span>
                 </button>
               )}
               {accessibleSectors.includes(Sector.SUNDAY_THEORY) && (
                 <button onClick={() => onSectorChange(Sector.SUNDAY_THEORY)} 
                   className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${activeSector === Sector.SUNDAY_THEORY ? 'bg-brand-primary text-white shadow-lg' : 'hover:text-white'}`}>
                   <Music4 size={16} />
                   <span className="text-[7px] font-black uppercase md:opacity-0 md:group-hover:opacity-100 transition-opacity whitespace-nowrap">Sunday Theory</span>
                 </button>
               )}
               {accessibleSectors.includes(Sector.HOTEL) && (
                 <button onClick={() => onSectorChange(Sector.HOTEL)} 
                   className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${activeSector === Sector.HOTEL ? 'bg-brand-primary text-white shadow-lg' : 'hover:text-white'}`}>
                   <Bed size={16} />
                   <span className="text-[7px] font-black uppercase md:opacity-0 md:group-hover:opacity-100 transition-opacity whitespace-nowrap">The THIRD Space</span>
                 </button>
               )}
            </div>
          )}

          {isManager && (
            <div className="flex bg-white/5 rounded-2xl mb-6 border border-white/10 p-1">
              <button 
                onClick={() => { setAppMode(AppMode.TRACKLY); setActiveTab('dashboard'); }} 
                className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all ${appMode === AppMode.TRACKLY ? 'bg-brand-primary text-white shadow-lg' : 'hover:text-white'}`}
              >
                <Zap size={14} />
                <span className="text-[7px] font-black uppercase mt-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity whitespace-nowrap">Ops Center</span>
              </button>
              <button 
                onClick={() => { setAppMode(AppMode.POS); setActiveTab('pos-terminal'); }} 
                className={`flex-1 flex flex-col items-center py-2 rounded-xl transition-all ${appMode === AppMode.POS ? 'bg-brand-primary text-white shadow-lg' : 'hover:text-white'}`}
              >
                <ShoppingCart size={14} />
                <span className="text-[7px] font-black uppercase mt-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity whitespace-nowrap">POS Terminal</span>
              </button>
            </div>
          )}
          
          <div className="h-px bg-white/5 mb-6" />
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
          {items.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${activeTab === item.id ? 'bg-brand-primary text-white shadow-xl' : 'hover:bg-white/5 hover:text-white'}`}>
              <item.icon size={18} strokeWidth={2.5} className="shrink-0" />
              <span className="font-bold text-[10px] md:text-xs uppercase tracking-widest md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
