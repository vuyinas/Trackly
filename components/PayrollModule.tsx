
import React, { useState, useMemo } from 'react';
import { TeamMember, Shift, ProjectContext, UserRole, PayrollRecord, Sector, Business } from '../types';
import { Landmark, TrendingUp, Users, Clock, DollarSign, ChevronRight, FileText, Printer, ShieldCheck, Zap, X, Save, Edit3, ArrowRight, CheckCircle2, History, Download } from 'lucide-react';

interface PayrollModuleProps {
  team: TeamMember[];
  shifts: Shift[];
  payrollRecords: PayrollRecord[];
  context: ProjectContext;
  activeSector: Sector;
  businesses: Business[];
  onUpdateMemberPay: (id: string, updates: Partial<TeamMember>) => void;
  onProcessCycle: (records: PayrollRecord[]) => void;
}

const PayrollModule: React.FC<PayrollModuleProps> = ({ team, shifts, payrollRecords, context, activeSector, businesses, onUpdateMemberPay, onProcessCycle }) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isEditingAgreement, setIsEditingAgreement] = useState(false);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editData, setEditData] = useState<Partial<TeamMember>>({});

  const calculateShiftHours = (start: string, end: string) => {
    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);
    let diff = (eH * 60 + eM) - (sH * 60 + sM);
    if (diff < 0) diff += 24 * 60;
    return diff / 60;
  };

  const payrollRoster = useMemo(() => {
    return team.map(member => {
      const memberShifts = shifts.filter(s => s.memberId === member.id);
      const totalHours = memberShifts.reduce((acc, s) => acc + calculateShiftHours(s.startTime, s.endTime), 0);
      
      const standardHours = Math.min(totalHours, member.overtimeThreshold);
      const overtimeHours = Math.max(0, totalHours - member.overtimeThreshold);
      
      const standardPay = standardHours * member.baseHourlyRate;
      const overtimePay = overtimeHours * (member.baseHourlyRate * member.overtimeMultiplier);
      const grossPay = standardPay + overtimePay;
      const deductions = grossPay * 0.15;
      const netPay = grossPay - deductions;

      return {
        ...member,
        standardHours,
        overtimeHours,
        totalHours,
        grossPay,
        deductions,
        netPay
      };
    });
  }, [team, shifts]);

  const stats = useMemo(() => {
    const totalGross = payrollRoster.reduce((s, m) => s + m.grossPay, 0);
    const totalHours = payrollRoster.reduce((s, m) => s + m.totalHours, 0);
    return { totalGross, totalHours, avgRate: totalGross / (totalHours || 1) };
  }, [payrollRoster]);

  const selectedMember = payrollRoster.find(m => m.id === selectedMemberId);

  const handleStartEdit = (member: TeamMember) => {
    setEditData({
      baseHourlyRate: member.baseHourlyRate,
      overtimeMultiplier: member.overtimeMultiplier,
      overtimeThreshold: member.overtimeThreshold
    });
    setIsEditingAgreement(true);
  };

  const handleSaveAgreement = () => {
    if (selectedMemberId) {
      onUpdateMemberPay(selectedMemberId, editData);
      setIsEditingAgreement(false);
    }
  };

  const handleCommitProcess = () => {
    const newRecords: PayrollRecord[] = payrollRoster.map(m => ({
      id: `pay-${Date.now()}-${m.id}`,
      memberId: m.id,
      periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
      periodEnd: new Date().toISOString(),
      standardHours: m.standardHours,
      overtimeHours: m.overtimeHours,
      grossPay: m.grossPay,
      deductions: m.deductions,
      netPay: m.netPay,
      status: 'paid'
    }));
    onProcessCycle(newRecords);
    setIsProcessModalOpen(false);
  };

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-6">Payroll</h2>
          <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-fit">
            <button onClick={() => setShowHistory(false)} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!showHistory ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Live Roster</button>
            <button onClick={() => setShowHistory(true)} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${showHistory ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>Cycle Archive</button>
          </div>
        </div>
        <div className="flex gap-4">
           {!showHistory && (
             <button onClick={() => setIsProcessModalOpen(true)} className="bg-brand-primary text-white px-10 py-4 rounded-3xl text-xs font-black uppercase tracking-[0.3em] shadow-xl shadow-brand-primary/30 hover:scale-105 transition-transform flex items-center gap-3">
               <Zap size={18} fill="currentColor" /> Process Cycle
             </button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[50px] shadow-xl shadow-black/5 border border-white/50 flex flex-col justify-between">
           <div><div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-6"><Landmark size={28} /></div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Liability</p><h3 className="text-4xl font-black text-slate-800 italic tracking-tighter">R{stats.totalGross.toLocaleString()}</h3></div>
        </div>
        <div className="bg-white p-10 rounded-[50px] shadow-xl shadow-black/5 border border-white/50 flex flex-col justify-between">
           <div><div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 mb-6"><Users size={28} /></div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Personnel</p><h3 className="text-4xl font-black text-slate-800 italic tracking-tighter">{team.length}</h3></div>
        </div>
        <div className="bg-white p-10 rounded-[50px] shadow-xl shadow-black/5 border border-white/50 flex flex-col justify-between">
           <div><div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-6"><Clock size={28} /></div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Duration</p><h3 className="text-4xl font-black text-slate-800 italic tracking-tighter">{Math.round(stats.totalHours)}h</h3></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 bg-white rounded-[60px] shadow-2xl shadow-black/5 border border-white/50 overflow-hidden">
           <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-800">{showHistory ? 'Cycle History' : 'Payment Roster'}</h3>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Personnel</th>
                       <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Hours</th>
                       <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Net Pay</th>
                       <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100/50">
                    {(showHistory ? payrollRecords : payrollRoster).map(m => {
                       const member = team.find(t => t.id === m.memberId) || m;
                       return (
                       <tr key={m.id} className={`group hover:bg-slate-50/50 transition-all cursor-pointer ${selectedMemberId === m.memberId ? 'bg-emerald-50/30' : ''}`} onClick={() => setSelectedMemberId(m.memberId)}>
                          <td className="px-10 py-8">
                             <div className="flex items-center gap-5">
                                <img src={(member as any).avatar} className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md" alt="" />
                                <div><p className="text-base font-black text-slate-800 tracking-tight">{(member as any).name}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{(member as any).role}</p></div>
                             </div>
                          </td>
                          <td className="px-10 py-8"><p className="text-sm font-mono font-black text-slate-600">{m.standardHours}h / <span className="text-brand-primary">{m.overtimeHours}h</span></p></td>
                          <td className="px-10 py-8"><p className="text-lg font-black italic text-emerald-600">R{m.netPay.toFixed(2)}</p></td>
                          <td className="px-10 py-8">{showHistory ? <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl text-emerald-600"><CheckCircle2 size={12} /><span className="text-[8px] font-black uppercase tracking-widest">Disbursed</span></div> : <ArrowRight size={20} className={`transition-all ${selectedMemberId === m.memberId ? 'text-emerald-500 translate-x-2' : 'text-slate-200'}`} />}</td>
                       </tr>
                    )})}
                 </tbody>
              </table>
           </div>
        </div>

        <div className="space-y-8">
           {selectedMember ? (
             <div className="bg-white rounded-[50px] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-10 bg-slate-900 text-white relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 text-white/5"><FileText size={100} /></div>
                   <div className="relative z-10 flex items-center gap-6 mb-8">
                      <img src={selectedMember.avatar} className="w-20 h-20 rounded-[30px] border-4 border-white/10 shadow-2xl" alt="" />
                      <div><h3 className="text-2xl font-black italic tracking-tighter uppercase">{selectedMember.name}</h3><p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Personnel Payslip Snapshot</p></div>
                   </div>
                </div>
                <div className="p-10 space-y-8">
                   <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm"><span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Standard Pay</span><span className="font-black text-slate-800 italic">R{(selectedMember.standardHours * selectedMember.baseHourlyRate).toFixed(2)}</span></div>
                      <div className="flex justify-between items-center text-sm"><span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Overtime</span><span className="font-black text-brand-primary italic">R{(selectedMember.overtimeHours * selectedMember.baseHourlyRate * selectedMember.overtimeMultiplier).toFixed(2)}</span></div>
                   </div>
                   <button onClick={() => window.print()} className="w-full py-5 bg-emerald-500 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3"><Printer size={18} /> Print Record</button>
                </div>
             </div>
           ) : <div className="h-64 flex items-center justify-center text-slate-300 italic uppercase text-[10px] font-black border-2 border-dashed border-slate-100 rounded-[40px]">Select personnel to audit</div>}
        </div>
      </div>
    </div>
  );
};

export default PayrollModule;
