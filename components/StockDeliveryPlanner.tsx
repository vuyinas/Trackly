
import React, { useState } from 'react';
import { StockDelivery, TeamMember, DeliveryCategory, ProjectContext } from '../types';
import { Truck, Clock, User, Package, CheckCircle2, AlertCircle, Calendar, Plus, Filter, MoreVertical, X } from 'lucide-react';

interface StockDeliveryPlannerProps {
  deliveries: StockDelivery[];
  team: TeamMember[];
  context: ProjectContext;
  onUpdateStatus: (id: string, status: StockDelivery['status']) => void;
  onAddDelivery: (delivery: Omit<StockDelivery, 'id' | 'createdBy' | 'status' | 'context'>) => void;
}

const StockDeliveryPlanner: React.FC<StockDeliveryPlannerProps> = ({ deliveries, team, context, onUpdateStatus, onAddDelivery }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    item: '',
    supplier: '',
    expectedAt: '',
    category: DeliveryCategory.KITCHEN
  });

  const getMember = (id: string) => team.find(m => m.id === id);

  const categoryConfig = {
    [DeliveryCategory.KITCHEN]: { label: 'Kitchen Stock', icon: Package, color: 'text-emerald-500', bg: 'bg-emerald-500/10', helper: 'Managed by Chef / Kitchen Staff' },
    [DeliveryCategory.BAR]: { label: 'Bar & Beverage', icon: Truck, color: 'text-amber-500', bg: 'bg-amber-500/10', helper: 'Managed by Bartender / Bar Lead' },
    [DeliveryCategory.OFFICE]: { label: 'Ops & Machinery', icon: Clock, color: 'text-indigo-500', bg: 'bg-indigo-500/10', helper: 'Machinery, Uniforms, Stationery, Maintenance' }
  };

  const statusStyles = {
    pending: 'bg-slate-100 text-slate-500',
    received: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20',
    delayed: 'bg-red-500 text-white shadow-lg shadow-red-500/20',
    cancelled: 'bg-slate-800 text-white opacity-50'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.item || !formData.supplier || !formData.expectedAt) return;
    onAddDelivery(formData);
    setFormData({ item: '', supplier: '', expectedAt: '', category: DeliveryCategory.KITCHEN });
    setIsModalOpen(false);
  };

  const sortedDeliveries = [...deliveries]
    .filter(d => d.context === context)
    .sort((a, b) => new Date(a.expectedAt).getTime() - new Date(b.expectedAt).getTime());

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-500 relative">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-6">Logistics & Intake</h2>
          <div className="flex items-center gap-3">
             <div className="h-1 w-20 bg-brand-primary rounded-full" />
             <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px]">Scheduling stock, machinery, and uniform arrivals.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-brand-primary text-white px-10 py-4 rounded-3xl text-xs font-black uppercase tracking-[0.3em] shadow-xl shadow-brand-primary/30 hover:scale-105 transition-transform flex items-center gap-2"
          >
            <Plus size={16} strokeWidth={3} /> Schedule Intake
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.entries(categoryConfig).map(([cat, config]) => (
          <div key={cat} className="bg-white p-10 rounded-[50px] border border-white/50 shadow-xl shadow-black/5 group hover:shadow-2xl transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className={`p-4 rounded-2xl ${config.bg} ${config.color}`}>
                <config.icon size={24} />
              </div>
              <div>
                <h4 className="font-black text-slate-800 uppercase tracking-tighter italic text-xl">{config.label}</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Schedule</p>
              </div>
            </div>
            <p className="text-5xl font-black text-slate-800 italic tracking-tighter leading-none">
              {sortedDeliveries.filter(d => d.category === cat && d.status === 'pending').length}
            </p>
            <p className="text-[10px] text-slate-400 font-bold mt-4 uppercase tracking-widest opacity-60">{config.helper}</p>
          </div>
        ))}
      </div>

      {/* Manifest Table */}
      <div className="bg-white rounded-[60px] shadow-2xl shadow-black/5 border border-white/50 overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
           <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-800">Arrival Manifest</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Expected shipments and procurement logs.</p>
           </div>
           <div className="flex items-center gap-3">
              <button className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-brand-primary transition-all shadow-sm"><Filter size={20} /></button>
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Expected Item</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Source / Supplier</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Estimated Arrival</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Logged By</th>
                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Status & Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {sortedDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center opacity-30 font-black uppercase tracking-widest text-xs italic">
                    No arrivals scheduled for this context
                  </td>
                </tr>
              ) : sortedDeliveries.map(delivery => {
                const creator = getMember(delivery.createdBy);
                const config = categoryConfig[delivery.category];
                return (
                  <tr key={delivery.id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-2xl ${config.bg} ${config.color} flex items-center justify-center`}>
                           <config.icon size={20} />
                        </div>
                        <div>
                          <p className="text-base font-black text-slate-800 tracking-tight leading-tight">{delivery.item}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{config.label}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                       <p className="text-sm font-black text-slate-700 uppercase tracking-widest italic">{delivery.supplier}</p>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3 text-xs font-mono font-black text-slate-600">
                        <Calendar size={16} className="text-brand-primary" />
                        {new Date(delivery.expectedAt).toLocaleDateString()} @ {new Date(delivery.expectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-3">
                        <img src={creator?.avatar} className="w-8 h-8 rounded-lg object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                        <p className="text-xs font-bold text-slate-500">{creator?.name}</p>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-2">
                        {delivery.status === 'pending' ? (
                          <>
                            <button 
                              onClick={() => onUpdateStatus(delivery.id, 'received')}
                              className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
                            >
                              Receive
                            </button>
                            <button 
                              onClick={() => onUpdateStatus(delivery.id, 'delayed')}
                              className="p-2 text-slate-300 hover:text-red-500"
                            >
                              <AlertCircle size={18} />
                            </button>
                          </>
                        ) : (
                          <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${statusStyles[delivery.status]}`}>
                            {delivery.status}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Delivery Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl border border-white/50 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter italic">Schedule Delivery</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Log expected intake for logistics.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Intake Item / Machinery</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. New Uniform Batch #4"
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-brand-primary outline-none font-bold"
                  value={formData.item}
                  onChange={e => setFormData({...formData, item: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Source / Supplier</label>
                <input 
                  type="text" 
                  required
                  placeholder="Supplier Name"
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-brand-primary outline-none font-bold"
                  value={formData.supplier}
                  onChange={e => setFormData({...formData, supplier: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Category</label>
                  <select 
                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-brand-primary outline-none font-black text-xs uppercase tracking-widest"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value as DeliveryCategory})}
                  >
                    <option value={DeliveryCategory.KITCHEN}>Kitchen Stock</option>
                    <option value={DeliveryCategory.BAR}>Bar Stock</option>
                    <option value={DeliveryCategory.OFFICE}>Ops / Office</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Expected At</label>
                  <input 
                    type="datetime-local" 
                    required
                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-brand-primary outline-none font-bold"
                    value={formData.expectedAt}
                    onChange={e => setFormData({...formData, expectedAt: e.target.value})}
                  />
                </div>
              </div>

              <div className="p-4 bg-brand-primary/5 rounded-2xl border border-brand-primary/10">
                <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em] mb-1">Visibility Alert</p>
                <p className="text-[11px] font-bold text-slate-600 leading-snug">
                  {categoryConfig[formData.category].helper}. Entry will be logged under your personnel ID.
                </p>
              </div>

              <button 
                type="submit"
                className="w-full py-5 bg-brand-primary text-white rounded-3xl font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
              >
                Fire Arrival Log
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockDeliveryPlanner;
