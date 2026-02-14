
import React, { useState } from 'react';
import { TeamMember, PresenceStatus, UserRole, Responsibility, Sector, Business } from '../types';
import { Coffee, Briefcase, Clock, UserPlus, Trash2, Edit3, X, Save, ShieldCheck, Zap, Target, KeyRound, User, RefreshCw, Link as LinkIcon, Building2, Globe, CheckCircle2, Shield, Lock, Mail, UserCheck, BarChart3, Landmark, FileText, ClipboardList, Hammer, Star, Box, BookOpen, Video, DollarSign, Wallet, ArrowRight, Tag, ShieldAlert } from 'lucide-react';

interface PresenceHubProps {
  team: TeamMember[];
  user: TeamMember;
  businesses: Business[];
  activeBusiness: Business;
  onAddMember: (member: Omit<TeamMember, 'id' | 'status'>) => void;
  onUpdateMember: (id: string, member: Partial<TeamMember>) => void;
  onDeleteMember: (id: string) => void;
}

const HOSPITALITY_MODULES = [
  { id: Responsibility.DASHBOARD, label: 'Pulse Dashboard', icon: Globe },
  { id: Responsibility.TASKS, label: 'Ops Board', icon: CheckCircle2 },
  { id: Responsibility.EXECUTION, label: 'Execution Hub', icon: ClipboardList },
  { id: Responsibility.CALENDAR, label: 'Space Calendar', icon: Clock },
  { id: Responsibility.MEETINGS, label: 'Meeting Hub', icon: Video },
  { id: Responsibility.DELIVERIES, label: 'Supply Chain', icon: LinkIcon },
  { id: Responsibility.TICKETING, label: 'Ticketing Lab', icon: ShieldCheck },
  { id: Responsibility.EVENTS, label: 'Events Registry', icon: UserCheck },
  { id: Responsibility.INSIGHTS, label: 'Insights', icon: BarChart3 },
  { id: Responsibility.SOCIAL, label: 'Social Pulse', icon: Globe },
  { id: Responsibility.PAYROLL, label: 'Payroll', icon: Landmark },
  { id: Responsibility.REPORTS, label: 'Reports', icon: FileText },
  { id: Responsibility.SHIFTS, label: 'Scheduling', icon: Clock },
];

const HOTEL_MODULES = [
  { id: Responsibility.DASHBOARD, label: 'T3S Pulse', icon: Globe },
  { id: Responsibility.TASKS, label: 'Ops Board', icon: CheckCircle2 },
  { id: Responsibility.MEETINGS, label: 'Meeting Hub', icon: Video },
  { id: Responsibility.INVENTORY, label: 'Room Matrix', icon: Box },
  { id: Responsibility.GUEST_LEDGER, label: 'Guest Ledger', icon: BookOpen },
  { id: Responsibility.HOUSEKEEPING, label: 'Housekeeping', icon: RefreshCw },
  { id: Responsibility.VIP, label: 'Talent Stay', icon: Star },
  { id: Responsibility.DINING, label: 'Dining Hub', icon: Coffee },
  { id: Responsibility.DELIVERIES, label: 'Supply Chain', icon: LinkIcon },
  { id: Responsibility.FACILITIES, label: 'Maintenance', icon: Hammer },
  { id: Responsibility.PAYROLL, label: 'Payroll', icon: Landmark },
  { id: Responsibility.REPORTS, label: 'Reports', icon: FileText },
  { id: Responsibility.INSIGHTS, label: 'Insights', icon: BarChart3 },
  { id: Responsibility.SHIFTS, label: 'Scheduling', icon: Clock },
];

const PresenceHub: React.FC<PresenceHubProps> = ({ team, user, businesses, activeBusiness, onAddMember, onUpdateMember, onDeleteMember }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<1 | 2>(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  
  const [formData, setFormData] = useState<Partial<TeamMember>>({
    name: '',
    email: '',
    role: UserRole.SERVER,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
    pin: '',
    responsibilities: [],
    baseHourlyRate: 150,
    payType: 'hourly',
    hoursPerWeek: 40,
    keyRoles: '',
    overtimeMultiplier: 1.5,
    overtimeThreshold: 40,
    birthday: '01-01',
  });

  const isOwner = user?.role === UserRole.OWNER;
  // FINAL HARD-CODED FILTER: HOUSEKEEPING is physically blocked for non-HOTEL sectors
  const activeModules = activeBusiness.sector === Sector.HOTEL ? HOTEL_MODULES : HOSPITALITY_MODULES;

  const handleOpenAdd = () => {
    setEditingId(null);
    setOnboardingStep(1);
    setFirstName('');
    setSurname('');
    setFormData({
      name: '',
      email: '',
      role: UserRole.SERVER,
      avatar: `https://i.pravatar.cc/150?u=${Math.random()}`,
      pin: '',
      responsibilities: [Responsibility.DASHBOARD, Responsibility.TASKS],
      baseHourlyRate: 150,
      payType: 'hourly',
      hoursPerWeek: 40,
      keyRoles: '',
      overtimeMultiplier: 1.5,
      overtimeThreshold: 40,
      birthday: '01-01',
    });
    setIsModalOpen(true);
  };

  const finalizeCommit = () => {
    const isNewOwner = formData.role === UserRole.OWNER;
    const assignedSector = activeBusiness.sector;
    const assignedBusinesses = isNewOwner ? businesses.map(b => b.id) : [activeBusiness.id];
    
    let responsibilities = formData.responsibilities || [];
    if (isNewOwner) {
      responsibilities = Object.values(Responsibility);
      // Even if Owner, if not in Hotel context, we strip housekeeping for cleanliness
      if (assignedSector !== Sector.HOTEL) {
        responsibilities = responsibilities.filter(r => r !== Responsibility.HOUSEKEEPING);
      }
    }

    const finalMember = {
      ...formData,
      name: `${firstName} ${surname}`.trim(),
      responsibilities,
      assignedSector,
      assignedBusinesses,
      defaultContext: activeBusiness.id,
      context: activeBusiness.id,
    };

    if (editingId) {
      onUpdateMember(editingId, finalMember);
    } else {
      onAddMember(finalMember as Omit<TeamMember, 'id' | 'status'>);
    }
    setIsModalOpen(false);
  };

  const toggleResponsibility = (res: Responsibility) => {
    const current = formData.responsibilities || [];
    setFormData({
      ...formData,
      responsibilities: current.includes(res)
        ? current.filter(r => r !== res)
        : [...current, res]
    });
  };

  const getStatusInfo = (member: TeamMember) => {
    const { status } = member;
    switch (status) {
      case PresenceStatus.AT_DESK: return { label: 'At Desk', color: 'text-green-600 bg-green-50', icon: Briefcase };
      case PresenceStatus.LUNCH: return { label: 'On Lunch', color: 'text-amber-600 bg-amber-50', icon: Coffee };
      case PresenceStatus.FOCUS: return { label: 'Deep Focus', color: 'text-brand-primary bg-brand-primary/5', icon: Target };
      case PresenceStatus.ON_SHIFT: return { label: 'On Shift', color: 'text-emerald-600 bg-emerald-50', icon: Zap };
      default: return { label: 'Offline', color: 'text-slate-400 bg-slate-50', icon: Clock };
    }
  };

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-4">Staff Hub</h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Registry synchronized to 2026. Sector Identity: {activeBusiness.name}</p>
        </div>
        {isOwner && (
          <button onClick={handleOpenAdd} className="bg-brand-primary text-white px-10 py-5 rounded-[25px] text-xs font-black uppercase tracking-[0.3em] shadow-xl shadow-brand-primary/30 hover:scale-105 transition-transform flex items-center gap-3">
            <UserPlus size={18} /> Add New Personnel
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {team.map((member) => {
          const info = getStatusInfo(member);
          return (
            <div key={member.id} className={`bg-white rounded-[50px] shadow-xl shadow-black/5 border-2 transition-all flex flex-col overflow-hidden ${member.id === user.id ? 'border-brand-primary/40' : 'border-white/50 hover:border-brand-primary/20'}`}>
              <div className="p-10 flex-1">
                <div className="flex items-start gap-6 mb-8">
                  <img src={member.avatar} className="w-24 h-24 rounded-[35px] object-cover border-4 border-slate-50 shadow-lg" alt="" />
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                       <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">{member.name}</h3>
                       {member.role === UserRole.OWNER && <ShieldCheck size={16} className="text-brand-primary" fill="currentColor" />}
                    </div>
                    <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-2">{member.role}</p>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${info.color}`}>
                       <info.icon size={10} /> {info.label}
                    </div>
                  </div>
                </div>
                <div className="space-y-4 pt-6 border-t border-slate-50">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Active Modules</p>
                  <div className="flex flex-wrap gap-1.5">
                    {member.responsibilities.slice(0, 5).map(r => (
                      <span key={r} className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded text-[7px] font-black uppercase border border-slate-100">{r.replace('-', ' ')}</span>
                    ))}
                    {member.responsibilities.length > 5 && <span className="text-[7px] font-bold text-slate-300">+{member.responsibilities.length - 5} More</span>}
                  </div>
                </div>
              </div>
              {isOwner && (
                <div className="bg-slate-50 p-4 grid grid-cols-2 gap-3 border-t border-slate-100">
                  <button onClick={() => onDeleteMember(member.id)} className="flex items-center justify-center gap-2 py-3 bg-white border border-red-100 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest col-span-2"><Trash2 size={14} /> Delete</button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-6xl rounded-[60px] shadow-2xl border-4 border-white overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className={`p-4 ${onboardingStep === 1 ? 'bg-slate-900' : 'bg-emerald-500'} text-brand-accent rounded-3xl shadow-xl transition-colors`}>
                  {onboardingStep === 1 ? <Shield size={32} /> : <Landmark size={32} className="text-white" />}
                </div>
                <div>
                  <h3 className="text-4xl font-black uppercase tracking-tighter italic text-slate-900">
                    Add New Personnel
                  </h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">2026 Registry Authorization Profile</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors"><X size={28} /></button>
            </div>

            <form onSubmit={finalizeCommit} className="flex-1 overflow-y-auto custom-scrollbar p-12 grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4">First Name</label>
                        <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:border-brand-primary" placeholder="Alex" value={firstName} onChange={e => setFirstName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Surname</label>
                        <input required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:border-brand-primary" placeholder="Herschel" value={surname} onChange={e => setSurname(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-4">System Identity (Email)</label>
                      <input type="email" required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:border-brand-primary" placeholder="email@domain.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4">PIN</label>
                        <input type="password" maxLength={4} required className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xl tracking-[0.5em] outline-none" placeholder="0000" value={formData.pin} onChange={e => setFormData({...formData, pin: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Operational Role</label>
                        <select className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[10px] uppercase outline-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
                            {Object.values(UserRole).map(role => (
                              <option key={role} value={role}>{role.replace('-', ' ')}</option>
                            ))}
                        </select>
                      </div>
                    </div>
                </div>
                <div className="space-y-10">
                    <div className="p-8 bg-slate-50 rounded-[50px] border border-slate-100 flex flex-col h-full min-h-[400px]">
                      <h4 className="text-sm font-black uppercase italic text-slate-800 mb-6 flex items-center gap-3">
                          <KeyRound size={18} className="text-brand-primary" /> Module Authorizations
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                          {activeModules.map(mod => {
                            const isActive = formData.responsibilities?.includes(mod.id) || formData.role === UserRole.OWNER;
                            return (
                                <button 
                                  key={mod.id} type="button"
                                  disabled={formData.role === UserRole.OWNER}
                                  onClick={() => toggleResponsibility(mod.id)}
                                  className={`p-4 rounded-2xl border-2 transition-all text-left flex items-center gap-4 group ${isActive ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500 hover:border-brand-primary/20'}`}
                                >
                                  <div className={`p-2 rounded-lg ${isActive ? 'bg-brand-primary text-white' : 'bg-slate-50 text-slate-300'}`}>
                                      <mod.icon size={16} />
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-tight italic">{mod.label}</span>
                                  {isActive && <CheckCircle2 size={14} className="ml-auto text-brand-primary" />}
                                </button>
                            );
                          })}
                      </div>
                    </div>
                    <button type="submit" className="w-full py-8 bg-brand-primary text-white rounded-[35px] font-black text-xl uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-4 hover:scale-[1.01] transition-all">
                      Add New Personnel <ArrowRight size={24} />
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresenceHub;
