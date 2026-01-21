
import React, { useState, useMemo, useEffect } from 'react';
import { ProcurementOrder, Supplier, DeliveryCategory, ProjectContext, TeamMember, Event, OrderLineItem, MenuItem, SupplierItem } from '../types';
// Added missing Download icon to the imports list
import { Truck, ShoppingBag, PieChart, Star, Clock, CheckCircle, AlertTriangle, ChevronRight, Package, User, Calendar, Plus, ExternalLink, Zap, X, Save, Trash2, ArrowRight, Info, Edit3, DollarSign, List, History, BarChart3, Download } from 'lucide-react';

interface ProcurementModuleProps {
  orders: ProcurementOrder[];
  suppliers: Supplier[];
  team: TeamMember[];
  events: Event[];
  menu: MenuItem[];
  context: ProjectContext;
  onUpdateOrderStatus: (id: string, status: ProcurementOrder['status']) => void;
  onAddOrder: (order: Omit<ProcurementOrder, 'id' | 'status'>) => void;
  onAddSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  onUpdateSupplier: (id: string, updates: Partial<Supplier>) => void;
  onDeleteSupplier: (id: string) => void;
}

const ProcurementModule: React.FC<ProcurementModuleProps> = ({ 
  orders, suppliers, team, events, menu, context, 
  onUpdateOrderStatus, onAddOrder, onAddSupplier, onUpdateSupplier, onDeleteSupplier 
}) => {
  const [activeView, setActiveView] = useState<'daily' | 'procurement' | 'history' | 'suppliers'>('daily');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  
  // Manual Order Form State
  const [manualOrder, setManualOrder] = useState({
    supplierId: '',
    category: DeliveryCategory.KITCHEN,
    dispatchDate: '',
    expectedDate: '',
    expectedTime: '09:00',
    items: [] as OrderLineItem[],
    deliveryFee: 0
  });

  // Supplier Form State
  const [supplierFormData, setSupplierFormData] = useState<Omit<Supplier, 'id'>>({
    name: '',
    category: DeliveryCategory.KITCHEN,
    contact: '',
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

  const suggestedOrders = useMemo(() => {
    const suggestions: ProcurementOrder[] = [];
    const lowStockItems = menu.filter(i => i.context === context && i.stock < 10);
    const upcomingEvents = events.filter(e => e.context === context && new Date(e.date) >= new Date());
    
    const hasOrderForSupplierToday = (supId: string) => 
      orders.some(o => o.supplierId === supId && o.expectedDate === today && o.status !== 'suggested');

    const kitchenSupplier = suppliers.find(s => s.category === DeliveryCategory.KITCHEN);
    if (kitchenSupplier && lowStockItems.length > 0 && !hasOrderForSupplierToday(kitchenSupplier.id)) {
      suggestions.push({
        id: 'suggest-1',
        supplierId: kitchenSupplier.id,
        category: DeliveryCategory.KITCHEN,
        items: lowStockItems.map(i => {
          const catalogItem = kitchenSupplier.catalog.find(c => c.name.toLowerCase().includes(i.name.toLowerCase()));
          return {
            name: i.name,
            quantity: 20,
            unit: catalogItem?.unit || 'Units',
            currentStock: i.stock,
            suggestedQty: 25,
            priceAtOrder: catalogItem?.price || 450
          };
        }),
        status: 'suggested',
        expectedDate: today,
        expectedTime: '08:30',
        totalCost: 0,
        deliveryFee: 150,
        context,
        createdBy: 'System AI',
        suggestionReason: 'Critical BOH Stock Depletion detected via POS sync.'
      } as ProcurementOrder);
    }

    const barSupplier = suppliers.find(s => s.category === DeliveryCategory.BAR);
    if (barSupplier && upcomingEvents.length > 0 && !hasOrderForSupplierToday(barSupplier.id)) {
      const mainEvent = upcomingEvents[0];
      suggestions.push({
        id: 'suggest-2',
        supplierId: barSupplier.id,
        category: DeliveryCategory.BAR,
        items: [
          { name: 'Craft Gin Case', quantity: 5, unit: 'Cases', currentStock: 2, suggestedQty: 8, priceAtOrder: 1200 },
          { name: 'Tonic Water Pallet', quantity: 2, unit: 'Pallets', currentStock: 1, suggestedQty: 3, priceAtOrder: 3200 }
        ],
        status: 'suggested',
        expectedDate: mainEvent.date,
        expectedTime: '10:00',
        totalCost: 0,
        deliveryFee: 0,
        context,
        createdBy: 'System AI',
        suggestionReason: `Event Scaling for "${mainEvent.name}" (Exp: ${mainEvent.expectedAttendance} attendees).`
      } as ProcurementOrder);
    }

    return suggestions.map(s => ({
      ...s,
      totalCost: s.items.reduce((sum, i) => sum + (i.priceAtOrder || 0) * i.quantity, 0) + s.deliveryFee
    }));
  }, [menu, events, context, suppliers, today, orders]);

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
    setManualOrder(prev => ({
      ...prev,
      items: [...prev.items, {
        name: catItem.name,
        quantity: newItemQty,
        unit: catItem.unit,
        currentStock: 0,
        suggestedQty: newItemQty,
        priceAtOrder: catItem.price
      }]
    }));
    setNewItemCatalogId('');
    setNewItemQty(1);
  };

  const handleCommitManualOrder = () => {
    if (!manualOrder.supplierId || manualOrder.items.length === 0) return;
    onAddOrder({ ...manualOrder, totalCost: totalManualCost, context, createdBy: 'Manual Architect' });
    setIsManualModalOpen(false);
    setActiveView('daily');
  };

  const handleApproveSuggestion = (order: ProcurementOrder) => {
    const { id, status, ...orderData } = order;
    onAddOrder({ ...orderData, status: 'ordered', createdBy: 'System AI (Approved)' });
    setActiveView('daily');
  };

  const handleAuditSuggestion = (order: ProcurementOrder) => {
    setManualOrder({
      supplierId: order.supplierId,
      category: order.category,
      dispatchDate: order.dispatchDate || '',
      expectedDate: order.expectedDate,
      expectedTime: order.expectedTime || '09:00',
      items: [...order.items],
      deliveryFee: order.deliveryFee
    });
    setIsManualModalOpen(true);
  };

  const handleOpenSupplierEdit = (sup?: Supplier) => {
    if (sup) {
      setEditingSupplierId(sup.id);
      setSupplierFormData({
        name: sup.name,
        category: sup.category,
        contact: sup.contact,
        reliability: sup.reliability,
        avgLeadTime: sup.avgLeadTime,
        catalog: sup.catalog || []
      });
    } else {
      setEditingSupplierId(null);
      setSupplierFormData({
        name: '',
        category: DeliveryCategory.KITCHEN,
        contact: '',
        reliability: 95,
        avgLeadTime: '2 Days',
        catalog: []
      });
    }
    setIsSupplierModalOpen(true);
  };

  const addCatalogItem = () => {
    if (!catItemName) return;
    setSupplierFormData(prev => ({
      ...prev,
      catalog: [...prev.catalog, {
        id: `cat-${Date.now()}`,
        name: catItemName,
        price: catItemPrice,
        unit: catItemUnit
      }]
    }));
    setCatItemName('');
    setCatItemPrice(0);
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
          <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm w-fit">
            {[
              { id: 'daily', label: 'Daily Intake' },
              { id: 'procurement', label: 'Smart Replenishment' },
              { id: 'history', label: 'Cycle History' },
              { id: 'suppliers', label: 'Suppliers' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeView === tab.id ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
           <div className="bg-white px-8 py-6 rounded-[35px] border border-white/50 shadow-xl shadow-black/5 flex items-center gap-4">
              <div className="p-3 bg-emerald-500 text-white rounded-2xl"><Star size={20} fill="currentColor" /></div>
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accuracy Score</p>
                 <p className="text-2xl font-black text-slate-800 italic">94.8%</p>
              </div>
           </div>
           <button 
            onClick={() => { setManualOrder({ supplierId: '', category: DeliveryCategory.KITCHEN, dispatchDate: '', expectedDate: today, expectedTime: '09:00', items: [], deliveryFee: 0 }); setIsManualModalOpen(true); }}
            className="bg-brand-primary text-white px-10 py-6 rounded-[35px] text-xs font-black uppercase tracking-[0.3em] shadow-2xl shadow-brand-primary/20 hover:scale-[1.02] transition-transform flex items-center gap-3"
           >
             <Plus size={18} /> New Manual Order
           </button>
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
                          <button 
                            onClick={() => onUpdateOrderStatus(order.id, 'delivered')}
                            className="bg-emerald-500 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
                          >
                            Receive
                          </button>
                          {!isDelayed && (
                            <button 
                              onClick={() => onUpdateOrderStatus(order.id, 'delayed')}
                              className="bg-slate-50 text-slate-400 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all"
                            >
                              Delayed
                            </button>
                          )}
                       </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-8">
             <div className="bg-[#1A1A1A] p-10 rounded-[50px] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/20 rounded-full blur-3xl" />
                <h3 className="text-lg font-bold uppercase tracking-tighter mb-8 italic">Procurement Status</h3>
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <p className="text-xs font-black uppercase tracking-widest text-white/40">Delayed Alerts</p>
                      <span className="text-red-500 font-black italic">{todaysDeliveries.filter(o => o.status === 'delayed').length}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <p className="text-xs font-black uppercase tracking-widest text-white/40">Total Active</p>
                      <span className="text-white font-black italic">{todaysDeliveries.length}</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {activeView === 'history' && (
        <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-10 rounded-[50px] shadow-xl shadow-black/5 border border-white/50">
               <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 bg-brand-primary/5 text-brand-primary rounded-2xl"><BarChart3 size={24} /></div>
                  <div>
                     <h4 className="text-xl font-black text-slate-800 uppercase italic">Expenditure Archive</h4>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Historical Spend Summary</p>
                  </div>
               </div>
               <div className="flex items-baseline gap-2">
                  <p className="text-5xl font-black text-slate-800 italic tracking-tighter">R{totalExpenditure.toLocaleString()}</p>
                  <span className="text-xs font-black text-emerald-500 uppercase">Total Settled</span>
               </div>
            </div>
          </div>

          <div className="bg-white rounded-[60px] shadow-2xl border border-white/50 overflow-hidden">
            <div className="p-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
               <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-800">Historical Ledger</h3>
               <button className="text-brand-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                  <Download size={14} /> Export CSV
               </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Date Delivered</th>
                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Supplier</th>
                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Category</th>
                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Items</th>
                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Amount Settled</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50">
                  {orderHistory.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-all">
                       <td className="px-10 py-8 text-xs font-mono font-black text-slate-600">{order.expectedDate}</td>
                       <td className="px-10 py-8 text-sm font-black text-slate-800 uppercase italic">{getSupplier(order.supplierId)?.name}</td>
                       <td className="px-10 py-8 text-[10px] font-black uppercase tracking-widest text-slate-400">{order.category}</td>
                       <td className="px-10 py-8 text-xs font-bold text-slate-500">{order.items.length} units registered</td>
                       <td className="px-10 py-8 font-black text-slate-900 italic">R{order.totalCost.toLocaleString()}</td>
                    </tr>
                  ))}
                  {orderHistory.length === 0 && (
                    <tr><td colSpan={5} className="px-10 py-20 text-center opacity-30 font-black uppercase text-xs italic">No past orders in ledger</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Render rest of original module (Procurement recommendations, Suppliers tab, and Modals) */}
      
      {activeView === 'procurement' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4">
           {suggestedOrders.map(order => {
              const supplier = getSupplier(order.supplierId);
              const style = categoryStyles[order.category];
              return (
                <div key={order.id} className="bg-white rounded-[50px] border border-white/50 shadow-xl shadow-black/5 overflow-hidden group">
                  <div className={`p-8 border-b border-slate-50 flex items-center justify-between ${style.bg}`}>
                    <div className="flex items-center gap-4">
                       <div className={`w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center ${style.color}`}><style.icon size={24} /></div>
                       <div>
                          <h4 className="text-lg font-black text-slate-800 tracking-tight">{supplier?.name}</h4>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{style.label}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xl font-black text-slate-800 italic">R{order.totalCost.toLocaleString()}</p>
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Est. Cost</p>
                    </div>
                  </div>
                  <div className="p-8 space-y-6">
                     <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex items-start gap-3">
                        <Info size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                        <p className="text-xs font-bold text-indigo-900 leading-relaxed italic">{order.suggestionReason}</p>
                     </div>
                     <div className="space-y-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm py-2 border-b border-slate-50 last:border-0">
                             <div className="flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                <span className="font-bold text-slate-700">{item.name}</span>
                             </div>
                             <div className="flex items-center gap-6">
                                <div className="text-right">
                                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Qty</p>
                                   <p className="font-mono font-bold text-slate-800">x{item.quantity}</p>
                                </div>
                                <div className="text-right">
                                   <p className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Rate</p>
                                   <p className="font-mono font-black text-brand-primary">R{item.priceAtOrder}</p>
                                </div>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
                  <div className="p-8 bg-slate-50 flex gap-4">
                     <button onClick={() => handleApproveSuggestion(order)} className="flex-1 bg-brand-primary text-white py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/10 hover:scale-[1.02] transition-all flex items-center justify-center gap-3">Approve & Place Order <ArrowRight size={14} /></button>
                     <button onClick={() => handleAuditSuggestion(order)} className="bg-white border border-slate-200 px-6 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-all">Audit</button>
                  </div>
                </div>
              );
           })}
        </div>
      )}

      {activeView === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-right-4">
          {suppliers.map(supplier => (
            <div key={supplier.id} className="bg-white p-8 rounded-[40px] border border-white/50 shadow-xl shadow-black/5 hover:border-brand-primary/20 transition-all group relative">
               <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenSupplierEdit(supplier)} className="p-2 bg-slate-100 text-slate-400 hover:text-brand-primary rounded-xl"><Edit3 size={14} /></button>
                  <button onClick={() => onDeleteSupplier(supplier.id)} className="p-2 bg-slate-100 text-slate-400 hover:text-red-500 rounded-xl"><Trash2 size={14} /></button>
               </div>
               <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400"><User size={24} /></div>
                  <div className="flex items-center gap-1 text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">
                     <Star size={10} fill="currentColor" /><span className="text-[9px] font-black tracking-widest">{supplier.reliability}%</span>
                  </div>
               </div>
               <h4 className="text-lg font-black text-slate-800 tracking-tight leading-tight mb-1">{supplier.name}</h4>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{supplier.category}</p>
               <div className="pt-4 border-t border-slate-50 space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-bold"><span className="text-slate-400 uppercase">Catalog Items</span><span className="text-slate-800">{supplier.catalog?.length || 0} Products</span></div>
                  <a href={`mailto:${supplier.contact}`} className="block w-full py-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all text-center">Contact Partner</a>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Manual Order Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-5xl rounded-[60px] shadow-2xl border border-white/50 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                 <div>
                    <h3 className="text-3xl font-black italic tracking-tighter uppercase">Manual Order Architect</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Direct Procurement Intake</p>
                 </div>
                 <button onClick={() => setIsManualModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"><X size={20} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   <div className="space-y-8">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Select Supplier Source</label>
                         <select 
                           className="w-full px-8 py-5 bg-slate-50 rounded-[25px] font-black text-xs uppercase tracking-widest outline-none border-2 border-transparent focus:border-brand-primary"
                           value={manualOrder.supplierId}
                           onChange={e => setManualOrder({...manualOrder, supplierId: e.target.value})}
                         >
                            <option value="">-- Choose Authorized Source --</option>
                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.catalog.length} cataloged items)</option>)}
                         </select>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Dispatch Date</label>
                           <input type="date" className="w-full px-8 py-5 bg-slate-50 rounded-[25px] font-bold" value={manualOrder.dispatchDate} onChange={e => setManualOrder({...manualOrder, dispatchDate: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Expected Intake</label>
                           <input type="date" className="w-full px-8 py-5 bg-slate-50 rounded-[25px] font-bold" value={manualOrder.expectedDate} onChange={e => setManualOrder({...manualOrder, expectedDate: e.target.value})} />
                        </div>
                      </div>
                      <div className="p-8 bg-brand-primary/5 rounded-[40px] border border-brand-primary/10 space-y-6">
                         <h4 className="text-sm font-black uppercase italic">Add Item from Catalog</h4>
                         <select 
                            disabled={!manualOrder.supplierId}
                            className="w-full px-6 py-4 bg-white rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none border border-slate-100"
                            value={newItemCatalogId}
                            onChange={e => setNewItemCatalogId(e.target.value)}
                         >
                            <option value="">-- Select Product --</option>
                            {getSupplier(manualOrder.supplierId)?.catalog.map(i => <option key={i.id} value={i.id}>{i.name} (R{i.price}/{i.unit})</option>)}
                         </select>
                         <div className="flex gap-4">
                            <input type="number" min="1" className="flex-1 px-6 py-4 bg-white rounded-2xl font-black" value={newItemQty} onChange={e => setNewItemQty(parseInt(e.target.value))} />
                            <button onClick={handleAddItemToManual} className="bg-brand-primary text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase">Add Line</button>
                         </div>
                      </div>
                   </div>
                   <div className="space-y-8">
                      <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 min-h-[300px] flex flex-col">
                         <h4 className="text-sm font-black uppercase tracking-tighter italic text-slate-800 mb-6">Order Manifest</h4>
                         <div className="flex-1 space-y-4 mb-8 overflow-y-auto max-h-64 custom-scrollbar">
                            {manualOrder.items.map((item, idx) => (
                               <div key={idx} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100">
                                  <div>
                                     <p className="text-sm font-bold text-slate-800">{item.name}</p>
                                     <p className="text-[9px] font-black text-slate-400 uppercase">R{item.priceAtOrder} / {item.unit}</p>
                                  </div>
                                  <div className="flex items-center gap-4">
                                     <p className="text-xs font-black text-slate-800">R{((item.priceAtOrder || 0) * item.quantity).toFixed(2)}</p>
                                     <button onClick={() => setManualOrder(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }))} className="text-slate-200 hover:text-red-500"><Trash2 size={16} /></button>
                                  </div>
                               </div>
                            ))}
                         </div>
                         <div className="pt-6 border-t border-slate-200 space-y-4">
                            <div className="flex justify-between items-center bg-brand-primary text-white p-6 rounded-[30px] shadow-2xl">
                               <div><p className="text-[9px] font-black uppercase opacity-60">Total Projection</p><h4 className="text-xl font-black italic">GRAND TOTAL</h4></div>
                               <p className="text-3xl font-black italic">R{totalManualCost.toLocaleString()}</p>
                            </div>
                         </div>
                      </div>
                      <button onClick={handleCommitManualOrder} disabled={manualOrder.items.length === 0} className="w-full py-7 bg-emerald-500 text-white rounded-[30px] font-black uppercase tracking-[0.2em] shadow-xl disabled:opacity-50 flex items-center justify-center gap-3">Commit & Place Order <Save size={24} /></button>
                   </div>
                </div>
              </div>
           </div>
        </div>
      )}

      {/* Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-4xl rounded-[60px] shadow-2xl border border-white/50 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                 <h3 className="text-2xl font-black italic uppercase">{editingSupplierId ? 'Update Partner' : 'Onboard Partner'}</h3>
                 <button onClick={() => setIsSupplierModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"><X size={20} /></button>
              </div>
              <form onSubmit={handleSaveSupplier} className="flex-1 overflow-y-auto p-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
                 <div className="space-y-8">
                    <input type="text" required placeholder="Partner Identity" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-bold" value={supplierFormData.name} onChange={e => setSupplierFormData({...supplierFormData, name: e.target.value})} />
                    <select className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-black text-[10px] uppercase" value={supplierFormData.category} onChange={e => setSupplierFormData({...supplierFormData, category: e.target.value as DeliveryCategory})}>
                       {Object.values(DeliveryCategory).map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                    </select>
                    <input type="email" required placeholder="Contact Email" className="w-full px-6 py-4 bg-slate-50 rounded-2xl font-mono text-xs" value={supplierFormData.contact} onChange={e => setSupplierFormData({...supplierFormData, contact: e.target.value})} />
                    <button type="submit" className="w-full py-5 bg-brand-primary text-white rounded-3xl font-black uppercase">Save Partner Record <Save size={18} /></button>
                 </div>
                 <div className="bg-slate-50 rounded-[40px] p-8 border border-slate-200 flex flex-col h-full">
                    <h4 className="text-sm font-black uppercase italic mb-6">Inventory Catalog</h4>
                    <div className="flex-1 space-y-3 overflow-y-auto max-h-[350px] mb-8 pr-2 custom-scrollbar">
                       {supplierFormData.catalog.map((item, idx) => (
                          <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between group">
                             <div><p className="text-sm font-bold text-slate-800">{item.name}</p><p className="text-[9px] font-black text-slate-400">R{item.price} / {item.unit}</p></div>
                             <button type="button" onClick={() => setSupplierFormData(prev => ({ ...prev, catalog: prev.catalog.filter((_, i) => i !== idx) }))} className="p-2 text-slate-200 hover:text-red-500"><Trash2 size={16} /></button>
                          </div>
                       ))}
                    </div>
                    <div className="bg-white p-6 rounded-[30px] shadow-sm space-y-4">
                       <input placeholder="Item Name" className="w-full px-4 py-3 bg-slate-50 rounded-xl text-xs font-bold" value={catItemName} onChange={e => setCatItemName(e.target.value)} />
                       <div className="grid grid-cols-2 gap-4">
                          <input type="number" placeholder="Price" className="w-full pl-4 pr-4 py-3 bg-slate-50 rounded-xl text-xs font-bold" value={catItemPrice} onChange={e => setCatItemPrice(parseFloat(e.target.value))} />
                          <input placeholder="Unit" className="w-full px-4 py-3 bg-slate-50 rounded-xl text-xs font-bold" value={catItemUnit} onChange={e => setCatItemUnit(e.target.value)} />
                       </div>
                       <button type="button" onClick={addCatalogItem} className="w-full py-3 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase">Add to Catalog</button>
                    </div>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProcurementModule;
