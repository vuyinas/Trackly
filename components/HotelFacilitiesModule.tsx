
import React, { useState } from 'react';
import { MaintenanceTicket } from '../types';
import { Hammer, Zap, Droplets, Wind, Flower2, AlertCircle, Clock, Plus, X, Save, ShieldAlert, ChevronRight, CheckCircle2 } from 'lucide-react';
import { DatePicker } from './CustomInputs';

interface HotelFacilitiesModuleProps {
  tickets: MaintenanceTicket[];
  onAddTicket: (ticket: Partial<MaintenanceTicket>) => void;
  onUpdateStatus: (id: string, status: MaintenanceTicket['status']) => void;
}

const HotelFacilitiesModule: React.FC<HotelFacilitiesModuleProps> = ({ tickets, onAddTicket, onUpdateStatus }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<MaintenanceTicket>>({
    title: '', category: 'general', priority: 'medium', dueDate: new Date().toISOString().split('T')[0], isRecurring: false
  });

  const categories = [
    { id: 'plumbing', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 'electrical', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
    { id: 'hvac', icon: Wind, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { id: 'pool', icon: Droplets, color: 'text-cyan-500', bg: 'bg-cyan-50' },
    { id: 'garden', icon: Flower2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTicket({ ...formData, status: 'todo' });
    setIsModalOpen(false);
  };

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-6">Facilities Integrity</h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Strategic infrastructure & maintenance lifecycle.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-brand-primary text-white px-10 py-5 rounded-[25px] font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl hover:scale-105 transition-all">
          <Plus size={18} /> New Ticket
        </button>
      </div>

      {/* Grid and tickets logic omitted for brevity */}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-2xl rounded-[60px] shadow-2xl border-4 border-white overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                 <h3 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900">Establish Repair Order</h3>
                 <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors"><X size={28} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-10 space-y-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Issue Description</label>
                    <input required className="w-full px-8 py-5 bg-slate-50 rounded-[25px] font-bold text-xl outline-none" placeholder="e.g. Broken faucet in Room 201" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Category</label>
                       <select className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-black text-[10px] uppercase outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Priority</label>
                       <select className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-black text-[10px] uppercase outline-none" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})}>
                          <option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
                       </select>
                    </div>
                 </div>
                 <div className="grid grid-cols-1">
                    <DatePicker label="Due Date" value={formData.dueDate || ''} onChange={val => setFormData({...formData, dueDate: val})} />
                 </div>
                 <button type="submit" className="w-full py-8 bg-brand-primary text-white rounded-[35px] font-black text-xl uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-4 hover:scale-[1.01] transition-all">Authorize Order <Save size={24} /></button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default HotelFacilitiesModule;
