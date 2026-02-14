
import React, { useState, useMemo } from 'react';
import { ProcurementOrder, Supplier, DeliveryCategory, ProjectContext, TeamMember, Event, OrderLineItem, MenuItem, UserRole } from '../types';
import { Truck, ShoppingBag, PieChart, Star, Clock, CheckCircle, AlertTriangle, ChevronRight, Package, User, Calendar, Plus, ExternalLink, Zap, X, Save, Trash2, ArrowRight, Info, Edit3, DollarSign, List, History, BarChart3, Download, UserPlus, Phone, Mail, Lock, ShieldCheck, StarHalf } from 'lucide-react';
import { DatePicker, TimePicker } from './CustomInputs';

interface ProcurementModuleProps {
  orders: ProcurementOrder[];
  suppliers: Supplier[];
  team: TeamMember[];
  events: Event[];
  menu: MenuItem[];
  context: ProjectContext;
  currentUser: TeamMember;
  onUpdateOrderStatus: (id: string, status: ProcurementOrder['status']) => void;
  onAddOrder: (order: Omit<ProcurementOrder, 'id' | 'status'>) => void;
  onAddSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  onUpdateSupplier: (id: string, updates: Partial<Supplier>) => void;
  onDeleteSupplier: (id: string) => void;
}

const ProcurementModule: React.FC<ProcurementModuleProps> = ({ 
  orders, suppliers, team, events, menu, context, currentUser,
  onUpdateOrderStatus, onAddOrder, onAddSupplier, onUpdateSupplier, onDeleteSupplier 
}) => {
  const [activeView, setActiveView] = useState<'daily' | 'procurement' | 'history' | 'suppliers'>('daily');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  
  const isAuthorized = currentUser.role === UserRole.OWNER || currentUser.role === UserRole.MANAGER;

  const [manualOrder, setManualOrder] = useState({
    supplierId: '',
    category: DeliveryCategory.KITCHEN,
    dispatchDate: '',
    expectedDate: '',
    expectedTime: '09:00',
    items: [] as OrderLineItem[],
    deliveryFee: 0
  });

  const [supplierFormData, setSupplierFormData] = useState<Omit<Supplier, 'id'>>({
    name: '',
    category: DeliveryCategory.KITCHEN,
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    reliability: 95,
    avgLeadTime: '2 Days',
    catalog: []
  });

  const [catItemName, setCatItemName] = useState('');
  const [catItemPrice, setCatItemPrice] = useState(0);
  const [catItemUnit, setCatItemUnit] = useState('Units');
  const [newItemCatalogId, setNewItemCatalogId] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);

  const today = new Date().toISOString().split('T')[0];
  const filteredOrders = useMemo(() => orders.filter(o => o.context === context), [orders, context]);
  
  const todaysDeliveries = useMemo(() => 
    filteredOrders.filter(o => (o.expectedDate === today || o.status === 'delayed') && o.status !== 'delivered'), 
    [filteredOrders, today]
  );

  const orderHistory = useMemo(() => 
    filteredOrders.filter(o => o.status === 'delivered').sort((a,b) => b.expectedDate.localeCompare(a.expectedDate)),
    [filteredOrders]
  );

  const totalExpenditure = useMemo(() => 
    orderHistory.reduce((sum, o) => sum + o.totalCost, 0),
    [orderHistory]
  );

  const getSupplier = (id: string) => suppliers.find(s => s.id === id);

  const totalManualCost = useMemo(() => {
    const itemsCost = manualOrder.items.reduce((sum, item) => sum + ((item.priceAtOrder || 0) * item.quantity), 0);
    return itemsCost + manualOrder.deliveryFee;
  }, [manualOrder.items, manualOrder.deliveryFee]);

  const categoryStyles = {
    [DeliveryCategory.KITCHEN]: { color: 'text-orange-500', bg: 'bg-orange-50', icon: Package, label: 'Kitchen Intake' },
    [DeliveryCategory.BAR]: { color: 'text-brand-primary', bg: 'bg-brand-primary/5', icon: Truck, label: 'Bar & Bev' },
    [DeliveryCategory.OFFICE]: { color: 'text-indigo-500', bg: 'bg-indigo-50', icon: Clock, label: 'Ops & Maintenance' }
  };

  const handleAddItemToManual = () => {
    const supplier = getSupplier(manualOrder.supplierId);
    if (!supplier || !newItemCatalogId) return;
    const catItem = supplier.catalog.find(i => i.id === newItemCatalogId);
    if (!catItem) return;
    setManualOrder(prev => ({ ...prev, items: [...prev.items, { name: catItem.name, quantity: newItemQty, unit: catItem.unit, currentStock: 0, suggestedQty: newItemQty, priceAtOrder: catItem.price }] }));
    setNewItemCatalogId('');
    setNewItemQty(1);
  };

  const handleCommitManualOrder = () => {
    if (!manualOrder.supplierId || manualOrder.items.length === 0) return;
    onAddOrder({ ...manualOrder, totalCost: totalManualCost, context, createdBy: currentUser.name });
    setIsManualModalOpen(false);
    setActiveView('daily');
  };

  const handleOpenSupplierEdit = (sup?: Supplier) => {
    if (sup) {
      setEditingSupplierId(sup.id);
      setSupplierFormData({ ...sup });
    } else {
      setEditingSupplierId(null);
      setSupplierFormData({ name: '', category: DeliveryCategory.KITCHEN, contactPerson: '', contactEmail: '', contactPhone: '', reliability: 95, avgLeadTime: '2 Days', catalog: [] });
    }
    setIsSupplierModalOpen(true);
  };

  const addCatalogItem = () => {
    if (!catItemName) return;
    setSupplierFormData(prev => ({ ...prev, catalog: [...prev.catalog, { id: `cat-${Date.now()}`, name: catItemName, price: catItemPrice, unit: catItemUnit }] }));
    setCatItemName('');
    setCatItemPrice(0);
    setCatItemUnit('Units');
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierFormData.name) return;
    if (editingSupplierId) onUpdateSupplier(editingSupplierId, supplierFormData);
    else onAddSupplier(supplierFormData);
    setIsSupplierModalOpen(false);
  };

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-6">Supply Chain Hub</h2>
          <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-fit overflow-x-auto">
            {[{ id: 'daily', label: 'Daily Intake' }, { id: 'history', label: 'Cycle History' }, { id: 'suppliers', label: 'Authorized Suppliers' }].map(tab => (
              <button key={tab.id} onClick={() => setActiveView(tab.id as any)} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeView === tab.id ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-4">
           {isAuthorized && activeView === 'suppliers' && (
             <button onClick={() => handleOpenSupplierEdit()} className="bg-brand-primary text-white px-10 py-6 rounded-[35px] text-xs font-black uppercase tracking-[0.3em] shadow-2xl shadow-brand-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-3">
                <UserPlus size={18} /> Establish Source
             </button>
           )}
           {isAuthorized && activeView !== 'suppliers' && (
             <button onClick={() => { setManualOrder({ supplierId: '', category: DeliveryCategory.KITCHEN, dispatchDate: '', expectedDate: today, expectedTime: '09:00', items: [], deliveryFee: 0 }); setIsManualModalOpen(true); }} className="bg-brand-primary text-white px-10 py-6 rounded-[35px] text-xs font-black uppercase tracking-[0.3em] shadow-2xl shadow-brand-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-3">
               <Plus size={18} /> New Manual Order
             </button>
           )}
        </div>
      </div>

      {activeView === 'daily' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-800">Arrival Timeline</h3>
            {todaysDeliveries.length === 0 ? (
              <div className="p-20 bg-white rounded-[50px] border border-dashed border-slate-200 flex flex-col items-center justify-center opacity-40">
                <CheckCircle size={64} strokeWidth={1} />
                <p className="text-sm font-black uppercase tracking-widest mt-4 italic">No more arrivals expected today</p>
              </div>
            ) : (
              <div className="space-y-6">
                {todaysDeliveries.map(order => {
                  const supplier = getSupplier(order.supplierId);
                  const style = categoryStyles[order.category];
                  const isDelayed = order.status === 'delayed';
                  return (
                    <div key={order.id} className={`bg-white p-8 rounded-[40px] border-2 transition-all flex items-center gap-8 shadow-xl ${isDelayed ? 'border-red-400 ring-4 ring-red-500/5' : 'border-white/50'}`}>
                       <div className="text-center min-w-[80px]">
                          <p className={`text-2xl font-black tracking-tighter italic ${isDelayed ? 'text-red-500 animate-pulse' : 'text-slate-800'}`}>{order.expectedTime || '09:00'}</p>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{isDelayed ? 'DELAYED' : 'Expected'}</p>
                       </div>
                       <div className="h-12 w-px bg-slate-100" />
                       <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                             <style.icon size={16} className={style.color} />
                             <span className={`text-[10px] font-black uppercase tracking-widest ${style.color}`}>{style.label}</span>
                          </div>
                          <h4 className="text-xl font-black text-slate-800 tracking-tight">{supplier?.name}</h4>
                          <p className="text-xs text-slate-400 font-bold mt-2">{order.items.length} Items • R{order.totalCost.toLocaleString()}</p>
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => onUpdateOrderStatus(order.id, 'delivered')} className="bg-emerald-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all">Receive</button>
                          {!isDelayed && <button onClick={() => onUpdateOrderStatus(order.id, 'delayed')} className="bg-slate-50 text-slate-400 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all">Delayed</button>}
                       </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="space-y-8"><div className="bg-[#1A1A1A] p-10 rounded-[50px] text-white relative overflow-hidden"><div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/20 rounded-full blur-3xl" /><h3 className="text-lg font-bold uppercase tracking-tighter mb-8 italic">Procurement Status</h3><div className="space-y-6"><div className="flex items-center justify-between"><p className="text-xs font-black uppercase tracking-widest text-white/40">Delayed Alerts</p><span className="text-red-500 font-black italic">{todaysDeliveries.filter(o => o.status === 'delayed').length}</span></div><div className="flex items-center justify-between"><p className="text-xs font-black uppercase tracking-widest text-white/40">Total Active</p><span className="text-white font-black italic">{todaysDeliveries.length}</span></div></div></div></div>
        </div>
      )}

      {activeView === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-4 duration-500">
           {suppliers.map(sup => {
             const style = categoryStyles[sup.category];
             return (
               <div key={sup.id} className="bg-white p-8 rounded-[50px] border border-slate-50 shadow-xl flex flex-col justify-between group hover:border-brand-primary transition-all relative overflow-hidden">
                  <div className={`absolute top-0 right-0 p-8 ${style.color} opacity-[0.03] group-hover:scale-110 transition-transform`}><ShieldCheck size={120} /></div>
                  <div className="relative z-10">
                     <div className="flex justify-between items-start mb-6">
                        <div className={`p-4 rounded-2xl ${style.bg} ${style.color}`}><style.icon size={28} /></div>
                        <div className="flex gap-2">
                           <button onClick={() => handleOpenSupplierEdit(sup)} className="p-3 bg-slate-50 text-slate-400 hover:text-brand-primary rounded-xl transition-all shadow-sm"><Edit3 size={18} /></button>
                           <button onClick={() => onDeleteSupplier(sup.id)} className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl transition-all shadow-sm"><Trash2 size={18} /></button>
                        </div>
                     </div>
                     <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${style.color}`}>{style.label}</p>
                     <h4 className="text-2xl font-black text-slate-800 uppercase italic tracking-tighter mb-6">{sup.name}</h4>
                     
                     <div className="space-y-4 mb-8">
                        <div className="flex items-center gap-3 text-slate-500"><User size={14} /><span className="text-xs font-bold">{sup.contactPerson}</span></div>
                        <div className="flex items-center gap-3 text-slate-500"><Mail size={14} /><span className="text-xs font-bold">{sup.contactEmail}</span></div>
                        <div className="flex items-center gap-3 text-slate-500"><Phone size={14} /><span className="text-xs font-bold">{sup.contactPhone}</span></div>
                     </div>
                  </div>
                  <div className="pt-6 border-t border-slate-50 flex items-center justify-between relative z-10">
                     <div>
                        <p className="text-xl font-black text-slate-800 italic leading-none">{sup.reliability}%</p>
                        <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">Reliability</p>
                     </div>
                     <div className="text-right">
                        <p className="text-xl font-black text-slate-800 italic leading-none">{sup.catalog.length}</p>
                        <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">Catalog Items</p>
                     </div>
                  </div>
               </div>
             );
           })}
           {suppliers.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white rounded-[60px] border-4 border-dashed border-slate-100 opacity-20">
                 <Truck size={80} className="mx-auto mb-6" />
                 <p className="text-sm font-black uppercase tracking-[0.4em]">Supplier Registry Empty</p>
              </div>
           )}
        </div>
      )}

      {/* Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-5xl rounded-[60px] shadow-2xl border-4 border-white overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                 <div>
                    <h3 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900">{editingSupplierId ? 'Modify Source' : 'Establish Source'}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Authorized Supply Chain Entity</p>
                 </div>
                 <button onClick={() => setIsSupplierModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors"><X size={28} /></button>
              </div>
              <form onSubmit={handleSaveSupplier} className="flex-1 overflow-y-auto p-12 grid grid-cols-1 lg:grid-cols-2 gap-12 custom-scrollbar">
                 <div className="space-y-10">
                    <div className="space-y-4">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Entity Identity</label>
                       <input required className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-[25px] font-black text-2xl outline-none focus:border-brand-primary" placeholder="Supplier Company Name" value={supplierFormData.name} onChange={e => setSupplierFormData({...supplierFormData, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Primary Category</label>
                          <select className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-black text-[10px] uppercase outline-none" value={supplierFormData.category} onChange={e => setSupplierFormData({...supplierFormData, category: e.target.value as any})}>
                             <option value={DeliveryCategory.KITCHEN}>Kitchen Stock</option>
                             <option value={DeliveryCategory.BAR}>Bar Stock</option>
                             <option value={DeliveryCategory.OFFICE}>Ops / Office</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Lead Time Window</label>
                          <input className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none" value={supplierFormData.avgLeadTime} onChange={e => setSupplierFormData({...supplierFormData, avgLeadTime: e.target.value})} placeholder="e.g. 24-48 Hours" />
                       </div>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-slate-50">
                       <p className="text-[10px] font-black uppercase text-slate-400">Tactical Contact</p>
                       <input className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-sm mb-4" placeholder="Contact Person" value={supplierFormData.contactPerson} onChange={e => setSupplierFormData({...supplierFormData, contactPerson: e.target.value})} />
                       <div className="grid grid-cols-2 gap-4">
                          <input className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-sm" placeholder="Email" value={supplierFormData.contactEmail} onChange={e => setSupplierFormData({...supplierFormData, contactEmail: e.target.value})} />
                          <input className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold text-sm" placeholder="Phone" value={supplierFormData.contactPhone} onChange={e => setSupplierFormData({...supplierFormData, contactPhone: e.target.value})} />
                       </div>
                    </div>
                 </div>
                 <div className="space-y-10">
                    <div className="p-8 bg-slate-50 rounded-[50px] border border-slate-100 flex flex-col min-h-[400px]">
                       <h4 className="text-sm font-black uppercase italic text-slate-800 mb-6 flex items-center gap-2"><List size={18} className="text-brand-primary" /> Product Catalog ({supplierFormData.catalog.length})</h4>
                       <div className="flex-1 space-y-4 mb-8 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
                          {supplierFormData.catalog.map((item, idx) => (
                             <div key={item.id} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 group">
                                <div>
                                   <p className="text-sm font-bold text-slate-800">{item.name}</p>
                                   <p className="text-[9px] font-black text-slate-400 uppercase">R{item.price} / {item.unit}</p>
                                </div>
                                <button type="button" onClick={() => setSupplierFormData({...supplierFormData, catalog: supplierFormData.catalog.filter(i => i.id !== item.id)})} className="p-2 text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                             </div>
                          ))}
                          {supplierFormData.catalog.length === 0 && <p className="text-center py-10 text-[10px] font-bold text-slate-300 italic uppercase">No cataloged items</p>}
                       </div>
                       <div className="pt-6 border-t border-slate-200 space-y-4">
                          <div className="grid grid-cols-2 gap-2">
                             <input className="col-span-2 px-6 py-4 bg-white border border-slate-100 rounded-xl text-xs font-bold" placeholder="Product Name" value={catItemName} onChange={e => setCatItemName(e.target.value)} />
                             <input type="number" className="px-6 py-4 bg-white border border-slate-100 rounded-xl text-xs font-bold" placeholder="Price (R)" value={catItemPrice} onChange={e => setCatItemPrice(Number(e.target.value))} />
                             <input className="px-6 py-4 bg-white border border-slate-100 rounded-xl text-xs font-bold" placeholder="Unit (e.g kg)" value={catItemUnit} onChange={e => setCatItemUnit(e.target.value)} />
                          </div>
                          <button type="button" onClick={addCatalogItem} className="w-full py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                             <Plus size={14} /> Catalog Product
                          </button>
                       </div>
                    </div>
                    <button type="submit" className="w-full py-8 bg-brand-primary text-white rounded-[35px] font-black text-xl uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-4 hover:scale-[1.01] transition-all mt-4">
                       Commit Source Profile <Save size={24} />
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {isManualModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-5xl rounded-[60px] shadow-2xl border border-white/50 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50"><div><h3 className="text-3xl font-black italic tracking-tighter uppercase">Manual Order Architect</h3><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Direct Procurement Intake</p></div><button onClick={() => setIsManualModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"><X size={20} /></button></div>
              <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   <div className="space-y-8">
                      <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Select Supplier Source</label><select className="w-full px-8 py-5 bg-slate-50 rounded-[25px] font-black text-xs uppercase tracking-widest outline-none border-2 border-transparent focus:border-brand-primary" value={manualOrder.supplierId} onChange={e => setManualOrder({...manualOrder, supplierId: e.target.value})}><option value="">-- Choose Authorized Source --</option>{suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.catalog.length} items)</option>)}</select></div>
                      <div className="grid grid-cols-2 gap-6">
                        <DatePicker label="Dispatch Date" value={manualOrder.dispatchDate} onChange={val => setManualOrder({...manualOrder, dispatchDate: val})} />
                        <DatePicker label="Expected Intake" value={manualOrder.expectedDate} onChange={val => setManualOrder({...manualOrder, expectedDate: val})} />
                      </div>
                      <TimePicker label="Expected Time" value={manualOrder.expectedTime} onChange={val => setManualOrder({...manualOrder, expectedTime: val})} />
                      <div className="p-8 bg-brand-primary/5 rounded-[40px] border border-brand-primary/10 space-y-6"><h4 className="text-sm font-black uppercase italic">Add Item from Catalog</h4><select disabled={!manualOrder.supplierId} className="w-full px-6 py-4 bg-white rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none border border-slate-100" value={newItemCatalogId} onChange={e => setNewItemCatalogId(e.target.value)}><option value="">-- Select Product --</option>{getSupplier(manualOrder.supplierId)?.catalog.map(i => <option key={i.id} value={i.id}>{i.name} (R{i.price}/{i.unit})</option>)}</select><div className="flex gap-4"><input type="number" min="1" className="flex-1 px-6 py-4 bg-white rounded-2xl font-black" value={newItemQty} onChange={e => setNewItemQty(parseInt(e.target.value))} /><button onClick={handleAddItemToManual} className="bg-brand-primary text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase">Add Line</button></div></div>
                   </div>
                   <div className="space-y-8"><div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 min-h-[300px] flex flex-col"><h4 className="text-sm font-black uppercase tracking-tighter italic text-slate-800 mb-6">Order Manifest</h4><div className="flex-1 space-y-4 mb-8 overflow-y-auto max-h-64 custom-scrollbar">{manualOrder.items.map((item, idx) => (<div key={idx} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100"><div><p className="text-sm font-bold text-slate-800">{item.name}</p><p className="text-[9px] font-black text-slate-400 uppercase">R{item.priceAtOrder} / {item.unit}</p></div><div className="flex items-center gap-4"><p className="text-xs font-black text-slate-800">R{((item.priceAtOrder || 0) * item.quantity).toFixed(2)}</p><button onClick={() => setManualOrder(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }))} className="text-slate-200 hover:text-red-500"><Trash2 size={16} /></button></div></div>))}</div><div className="pt-6 border-t border-slate-200 space-y-4"><div className="flex justify-between items-center bg-brand-primary text-white p-6 rounded-[30px] shadow-2xl"><div><p className="text-[9px] font-black uppercase opacity-60">Total Projection</p><h4 className="text-xl font-black italic">GRAND TOTAL</h4></div><p className="text-3xl font-black italic">R{totalManualCost.toLocaleString()}</p></div></div></div><button onClick={handleCommitManualOrder} disabled={manualOrder.items.length === 0} className="w-full py-7 bg-emerald-500 text-white rounded-[30px] font-black uppercase tracking-[0.2em] shadow-xl disabled:opacity-50 flex items-center justify-center gap-3">Commit & Place Order <Save size={24} /></button></div>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementModule;
