
import React, { useState, useMemo } from 'react';
import { TeamMember, Shift, ProjectContext, UserRole, PayrollRecord } from '../types';
import { Landmark, TrendingUp, Users, Clock, DollarSign, ChevronRight, FileText, Printer, ShieldCheck, Zap, X, Save, Edit3, ArrowRight, CheckCircle2, History, Download } from 'lucide-react';

interface PayrollModuleProps {
  team: TeamMember[];
  shifts: Shift[];
  payrollRecords: PayrollRecord[];
  context: ProjectContext;
  onUpdateMemberPay: (id: string, updates: Partial<TeamMember>) => void;
  onProcessCycle: (records: PayrollRecord[]) => void;
}

const PayrollModule: React.FC<PayrollModuleProps> = ({ team, shifts, payrollRecords, context, onUpdateMemberPay, onProcessCycle }) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isEditingAgreement, setIsEditingAgreement] = useState(false);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editData, setEditData] = useState<Partial<TeamMember>>({});

  // Helper to calculate hours between two time strings (HH:MM)
  const calculateShiftHours = (start: string, end: string) => {
    const [sH, sM] = start.split(':').map(Number);
    const [eH, eM] = end.split(':').map(Number);
    let diff = (eH * 60 + eM) - (sH * 60 + sM);
    if (diff < 0) diff += 24 * 60; // Handle overnight shifts
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
      const deductions = grossPay * 0.15; // Placeholder 15% tax
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
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-6">Compensation Engine</h2>
          <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-fit">
            <button 
              onClick={() => setShowHistory(false)}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!showHistory ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Live Roster
            </button>
            <button 
              onClick={() => setShowHistory(true)}
              className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${showHistory ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Cycle Archive
            </button>
          </div>
        </div>
        <div className="flex gap-4">
           <button className="bg-white border-2 border-slate-100 px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:bg-slate-50 transition-all shadow-sm">
             Audit Context
           </button>
           {!showHistory && (
             <button 
              onClick={() => setIsProcessModalOpen(true)}
              className="bg-brand-primary text-white px-10 py-4 rounded-3xl text-xs font-black uppercase tracking-[0.3em] shadow-xl shadow-brand-primary/30 hover:scale-105 transition-transform flex items-center gap-3"
             >
               <Zap size={18} fill="currentColor" /> Process Payroll Cycle
             </button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[50px] shadow-xl shadow-black/5 border border-white/50 flex flex-col justify-between">
           <div>
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-6">
                 <Landmark size={28} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Liability (Gross)</p>
              <h3 className="text-4xl font-black text-slate-800 italic tracking-tighter">R{stats.totalGross.toLocaleString()}</h3>
           </div>
           <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-6">Projected cycle spend</p>
        </div>
        <div className="bg-white p-10 rounded-[50px] shadow-xl shadow-black/5 border border-white/50 flex flex-col justify-between">
           <div>
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 mb-6">
                 <Users size={28} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Personnel</p>
              <h3 className="text-4xl font-black text-slate-800 italic tracking-tighter">{team.length}</h3>
           </div>
           <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mt-6">Tracked earners in registry</p>
        </div>
        <div className="bg-white p-10 rounded-[50px] shadow-xl shadow-black/5 border border-white/50 flex flex-col justify-between">
           <div>
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-6">
                 <Clock size={28} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Shift Hours</p>
              <h3 className="text-4xl font-black text-slate-800 italic tracking-tighter">{Math.round(stats.totalHours)}h</h3>
           </div>
           <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest mt-6">Aggregated workforce duration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 bg-white rounded-[60px] shadow-2xl shadow-black/5 border border-white/50 overflow-hidden">
           <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
              <div>
                 <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-800">
                    {showHistory ? 'Cycle History' : 'Payment Roster'}
                 </h3>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    {showHistory ? 'Archives of processed and paid manifests.' : 'Calculated from Live Shift Registry & Personnel Agreements.'}
                 </p>
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-slate-50/50">
                       <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Personnel</th>
                       <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Hours (Std/OT)</th>
                       <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Base Rate</th>
                       <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Net Pay</th>
                       <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Status</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100/50">
                    {(showHistory ? payrollRecords : payrollRoster).map(m => {
                       const member = team.find(t => t.id === m.memberId) || m;
                       return (
                       <tr 
                        key={m.id} 
                        className={`group hover:bg-slate-50/50 transition-all cursor-pointer ${selectedMemberId === m.memberId ? 'bg-emerald-50/30' : ''}`}
                        onClick={() => setSelectedMemberId(m.memberId)}
                       >
                          <td className="px-10 py-8">
                             <div className="flex items-center gap-5">
                                <img src={(member as any).avatar} className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md" alt="" />
                                <div>
                                   <p className="text-base font-black text-slate-800 tracking-tight leading-tight">{(member as any).name}</p>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{(member as any).role}</p>
                                </div>
                             </div>
                          </td>
                          <td className="px-10 py-8">
                             <div className="text-sm font-mono font-black text-slate-600">
                                {m.standardHours}h / <span className="text-brand-primary">{m.overtimeHours}h</span>
                             </div>
                          </td>
                          <td className="px-10 py-8">
                             <p className="text-sm font-black text-slate-800">R{(member as any).baseHourlyRate || '...'}</p>
                          </td>
                          <td className="px-10 py-8">
                             <p className="text-lg font-black italic text-emerald-600">R{m.netPay.toFixed(2)}</p>
                          </td>
                          <td className="px-10 py-8">
                             <div className="flex items-center gap-3">
                                {showHistory ? (
                                   <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl text-emerald-600">
                                      <CheckCircle2 size={12} />
                                      <span className="text-[8px] font-black uppercase tracking-widest">Disbursed</span>
                                   </div>
                                ) : (
                                   <ArrowRight size={20} className={`transition-all ${selectedMemberId === m.memberId ? 'text-emerald-500 translate-x-2' : 'text-slate-200'}`} />
                                )}
                             </div>
                          </td>
                       </tr>
                    )})}
                    {(showHistory ? payrollRecords : payrollRoster).length === 0 && (
                       <tr>
                          <td colSpan={5} className="px-10 py-20 text-center opacity-30 italic font-black uppercase tracking-widest text-xs">
                             No records available for the current context.
                          </td>
                       </tr>
                    )}
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
                      <div>
                         <h3 className="text-2xl font-black italic tracking-tighter uppercase">{selectedMember.name}</h3>
                         <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Personnel Payslip Snapshot</p>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-4 relative z-10">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                         <p className="text-xl font-black italic">R{selectedMember.netPay.toFixed(2)}</p>
                         <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Net Earnings</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                         <p className="text-xl font-black italic">{selectedMember.totalHours}h</p>
                         <p className="text-[9px] font-black uppercase tracking-widest opacity-40">Shift Duration</p>
                      </div>
                   </div>
                </div>

                <div className="p-10 space-y-8">
                   <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                         <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Standard Pay ({selectedMember.standardHours}h)</span>
                         <span className="font-black text-slate-800 italic">R{(selectedMember.standardHours * selectedMember.baseHourlyRate).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                         <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Overtime Premium ({selectedMember.overtimeHours}h)</span>
                         <span className="font-black text-brand-primary italic">R{(selectedMember.overtimeHours * selectedMember.baseHourlyRate * selectedMember.overtimeMultiplier).toFixed(2)}</span>
                      </div>
                      <div className="h-px bg-slate-100" />
                      <div className="flex justify-between items-center text-sm">
                         <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Deductions (Est. Tax)</span>
                         <span className="font-black text-red-500 italic">-R{selectedMember.deductions.toFixed(2)}</span>
                      </div>
                   </div>

                   <div className="bg-slate-50 p-6 rounded-[30px] border border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                         <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pay Agreement</h4>
                         {!showHistory && (
                            <button 
                             onClick={() => handleStartEdit(selectedMember as any)}
                             className="text-emerald-500 hover:text-emerald-600 transition-colors"
                            >
                              <Edit3 size={16} />
                            </button>
                         )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div>
                            <p className="text-lg font-black text-slate-800 italic">R{selectedMember.baseHourlyRate}/h</p>
                            <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Base Rate</p>
                         </div>
                         <div>
                            <p className="text-lg font-black text-slate-800 italic">{selectedMember.overtimeMultiplier}x</p>
                            <p className="text-[8px] font-black uppercase tracking-widest opacity-40">OT Multiplier</p>
                         </div>
                      </div>
                   </div>

                   <button 
                    onClick={() => window.print()}
                    className="w-full py-5 bg-emerald-500 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                   >
                      <Printer size={18} /> Print Record
                   </button>
                </div>
             </div>
           ) : (
             <div className="h-[500px] flex flex-col items-center justify-center text-slate-300 gap-6 bg-slate-50 rounded-[50px] border-2 border-dashed border-slate-100 opacity-40">
                <Landmark size={80} strokeWidth={1} />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-center italic">Select personnel from roster<br/>to audit compensation</p>
             </div>
           )}

           <div className="bg-[#1A1A1A] p-10 rounded-[50px] text-white relative overflow-hidden flex flex-col justify-between h-48">
              <div className="absolute top-0 right-0 p-8 text-white/5"><ShieldCheck size={100} /></div>
              <div className="relative z-10">
                 <h4 className="text-lg font-bold uppercase tracking-tighter mb-4 italic">Security Sync</h4>
                 <p className="text-xs font-medium text-white/50 leading-relaxed italic">
                    Payroll access is restricted to Top-Tier clearance. All payout calculations are cross-referenced with the Shift Presence manifest for integrity.
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* Cycle Processing Modal */}
      {isProcessModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-4xl rounded-[60px] shadow-2xl border border-white/50 overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                 <div>
                    <h3 className="text-3xl font-black italic tracking-tighter uppercase">Process Cycle Manifest</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Batch Payment Authorization Engine</p>
                 </div>
                 <button onClick={() => setIsProcessModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-12 space-y-10 custom-scrollbar">
                 <div className="bg-emerald-50 p-8 rounded-[40px] border border-emerald-100 flex items-center gap-8">
                    <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center text-white shadow-lg">
                       <Landmark size={40} />
                    </div>
                    <div>
                       <h4 className="text-2xl font-black text-emerald-900 tracking-tight uppercase italic mb-2">Cycle Summary</h4>
                       <div className="flex items-center gap-6">
                          <div>
                             <p className="text-[10px] font-black text-emerald-700/60 uppercase tracking-widest">Total Liability</p>
                             <p className="text-2xl font-black text-emerald-900">R{stats.totalGross.toLocaleString()}</p>
                          </div>
                          <div className="w-px h-10 bg-emerald-200" />
                          <div>
                             <p className="text-[10px] font-black text-emerald-700/60 uppercase tracking-widest">Total Hours</p>
                             <p className="text-2xl font-black text-emerald-900">{Math.round(stats.totalHours)}h</p>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Disbursement Manifest Preview</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {payrollRoster.map(m => (
                          <div key={m.id} className="p-6 bg-slate-50 rounded-[35px] border border-slate-100 flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <img src={m.avatar} className="w-10 h-10 rounded-xl object-cover" alt="" />
                                <div>
                                   <p className="text-xs font-black uppercase tracking-tight">{m.name}</p>
                                   <p className="text-[8px] font-bold text-slate-400 uppercase">Gross: R{m.grossPay.toFixed(2)}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-sm font-black text-emerald-600 italic">R{m.netPay.toFixed(2)}</p>
                                <p className="text-[8px] font-black uppercase text-slate-300">Net Disbursement</p>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="bg-amber-50 p-6 rounded-[30px] border border-amber-100 flex items-start gap-4">
                    <Zap className="text-amber-500 shrink-0 mt-1" size={20} fill="currentColor" />
                    <p className="text-xs font-bold text-amber-900 leading-relaxed italic">
                       Authorizing this cycle will generate permanent payslips for the current period and archive all shift logs associated with these payments.
                    </p>
                 </div>
              </div>

              <div className="p-10 bg-slate-50 border-t border-slate-100 flex gap-4">
                 <button 
                  onClick={() => setIsProcessModalOpen(false)}
                  className="flex-1 py-5 bg-white border-2 border-slate-200 text-slate-400 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
                 >
                    Cancel Disbursement
                 </button>
                 <button 
                  onClick={handleCommitProcess}
                  className="flex-[2] py-5 bg-emerald-500 text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                 >
                    Authorize Batch Payment <Landmark size={18} />
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Agreement Editor Modal */}
      {isEditingAgreement && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-lg rounded-[50px] shadow-2xl border border-white/50 overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                 <div>
                    <h3 className="text-2xl font-black italic tracking-tighter uppercase">Agreement Lab</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Configuring Compensation Rules</p>
                 </div>
                 <button onClick={() => setIsEditingAgreement(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"><X size={20} /></button>
              </div>
              <div className="p-10 space-y-8">
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Base Hourly Rate (R)</label>
                       <input 
                        type="number" 
                        className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none"
                        value={editData.baseHourlyRate}
                        onChange={e => setEditData({...editData, baseHourlyRate: parseFloat(e.target.value)})}
                       />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">OT Multiplier</label>
                          <input 
                            type="number" 
                            step="0.1"
                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none"
                            value={editData.overtimeMultiplier}
                            onChange={e => setEditData({...editData, overtimeMultiplier: parseFloat(e.target.value)})}
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">OT Threshold (h)</label>
                          <input 
                            type="number" 
                            className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold border-2 border-transparent focus:border-emerald-500 outline-none"
                            value={editData.overtimeThreshold}
                            onChange={e => setEditData({...editData, overtimeThreshold: parseFloat(e.target.value)})}
                          />
                       </div>
                    </div>
                 </div>

                 <div className="bg-emerald-50 p-6 rounded-[30px] border border-emerald-100 flex items-center gap-4">
                    <ShieldCheck className="text-emerald-500" size={24} />
                    <p className="text-xs font-bold text-emerald-800 leading-relaxed italic">Changes to compensation agreements will be applied to all current and future shift calculations for this personnel.</p>
                 </div>

                 <button 
                  onClick={handleSaveAgreement}
                  className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                 >
                   Commit Agreement <Save size={18} />
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PayrollModule;
