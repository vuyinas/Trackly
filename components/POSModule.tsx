
import React, { useState, useMemo } from 'react';
import { MenuItem, OrderItem, ProjectContext, Order, Business } from '../types';
import { Search, Plus, Minus, ShoppingBag, Utensils, ChevronRight, X, Layers, UserCheck, Zap, Bed, Store } from 'lucide-react';

interface POSModuleProps {
  menu: MenuItem[];
  context: ProjectContext;
  activeBusiness: Business;
  onPlaceOrder: (order: Partial<Order>) => void;
  orders?: Order[];
}

const POSModule: React.FC<POSModuleProps> = ({ menu, context, activeBusiness, onPlaceOrder, orders = [] }) => {
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [tableNumber, setTableNumber] = useState('');
  const [orderType, setOrderType] = useState<'restaurant' | 'room-service'>('restaurant');
  const [isStaffMode, setIsStaffMode] = useState(false);
  
  const [activeConfigItem, setActiveConfigItem] = useState<MenuItem | null>(null);
  const [configVariant, setConfigVariant] = useState<string>('');
  const [configModifiers, setConfigModifiers] = useState<string>('');

  const prefix = activeBusiness?.prefix || 'XX';
  // Updated prefix logic: RS for Room Service, otherwise the business prefix (TY, ST, T3S)
  const displayPrefix = orderType === 'room-service' ? 'RS' : prefix;
  const fullTableId = isStaffMode ? 'STAFF' : `${displayPrefix}-${tableNumber}`;

  const hasOpenBill = useMemo(() => {
    return orders.some(o => o.tableNumber === fullTableId && o.context === context && o.status !== 'paid');
  }, [orders, fullTableId, context]);

  const filteredMenu = useMemo(() => {
    return menu.filter(item => {
      const matchContext = item.context === context;
      const matchCategory = category === 'All' || item.category === category;
      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStaff = isStaffMode ? item.availableToStaff : true;
      return matchContext && matchCategory && matchSearch && matchStaff;
    });
  }, [menu, context, category, searchTerm, isStaffMode]);

  const categories = useMemo(() => {
    const base = ['All', 'Starters', 'Main', 'Desserts', 'Sides', 'Drinks', 'Family Sharing', 'Kids Meals', 'Hubbly'];
    const presentCats = new Set(menu.filter(i => i.context === context).map(i => i.category));
    return base.filter(cat => cat === 'All' || presentCats.has(cat));
  }, [menu, context]);

  const addToCart = (item: MenuItem, variant?: string, modifiersStr?: string) => {
    const modifiers = modifiersStr ? modifiersStr.split(',').map(m => m.trim()).filter(m => m !== '') : [];
    setCart(prev => {
      const existing = prev.find(i => 
        i.id === item.id && i.selectedVariant === variant && JSON.stringify(i.modifiers) === JSON.stringify(modifiers)
      );
      if (existing) {
        return prev.map(i => (i.id === item.id && i.selectedVariant === variant && JSON.stringify(i.modifiers) === JSON.stringify(modifiers)) 
          ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1, isStaffMeal: isStaffMode, selectedVariant: variant, modifiers }];
    });
    setActiveConfigItem(null);
    setConfigVariant('');
    setConfigModifiers('');
  };

  const handleFireOrder = () => {
    if (cart.length === 0 || (!tableNumber && !isStaffMode)) return;
    onPlaceOrder({
      tableNumber: fullTableId,
      items: cart,
      total: isStaffMode ? 0 : cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      status: 'pending',
      timestamp: new Date().toISOString(),
      context,
      isStaffOrder: isStaffMode
    });
    setCart([]);
    setTableNumber('');
    setIsStaffMode(false);
  };

  return (
    <div className="flex h-[calc(100vh-73px)] overflow-hidden bg-slate-100">
      <div className="flex-1 flex flex-col border-r border-slate-200">
        <div className="p-4 bg-white border-b border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button 
                onClick={() => { setIsStaffMode(false); setOrderType('restaurant'); }}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isStaffMode && orderType === 'restaurant' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400'}`}
              >
                Restaurant
              </button>
              {activeBusiness.sector === 'hotel' && (
                <button 
                  onClick={() => { setIsStaffMode(false); setOrderType('room-service'); }}
                  className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isStaffMode && orderType === 'room-service' ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400'}`}
                >
                  Room Service
                </button>
              )}
              <button 
                onClick={() => setIsStaffMode(true)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isStaffMode ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400'}`}
              >
                <UserCheck size={14} /> Staff
              </button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
              <input 
                type="text" placeholder="Search menu..."
                className="pl-9 pr-4 py-2.5 bg-slate-100 rounded-xl text-xs outline-none w-64 focus:ring-2 focus:ring-brand-primary/20 font-bold"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${category === cat ? 'bg-brand-primary text-white shadow-lg' : 'bg-slate-100 text-slate-500'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 content-start">
          {filteredMenu.map(item => (
            <button key={item.id} onClick={() => setActiveConfigItem(item)}
              className="bg-white p-6 rounded-[35px] shadow-sm border-2 border-slate-50 hover:border-brand-primary transition-all active:scale-95 flex flex-col justify-between h-48 relative group"
            >
              <div className="absolute top-4 right-4 p-2 bg-brand-primary/5 text-brand-primary rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                 <Plus size={14} />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.category}</p>
                <h4 className="font-black text-slate-800 leading-tight text-base tracking-tight">{item.name}</h4>
              </div>
              <p className="text-lg font-black italic text-slate-900">R{item.price.toFixed(2)}</p>
            </button>
          ))}
        </div>
      </div>

      <div className={`w-[450px] flex flex-col shadow-2xl ${isStaffMode ? 'bg-[#28374a] text-white' : 'bg-white'}`}>
        <div className={`p-8 border-b ${isStaffMode ? 'border-white/5' : 'border-slate-100'}`}>
           <h3 className="text-3xl font-black tracking-tighter uppercase italic mb-8">
              {isStaffMode ? 'Staff Allocation' : orderType === 'room-service' ? 'Room Account' : 'Guest Bill'}
           </h3>
           <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 text-slate-400 group-focus-within:text-brand-primary">
                {orderType === 'room-service' ? <Bed size={20} /> : <Utensils size={20} />}
                <span className="font-black text-xl italic">{displayPrefix}-</span>
              </div>
              <input 
                type="number" placeholder="00"
                className="w-full pl-24 pr-6 py-5 bg-slate-100 rounded-[25px] font-black text-3xl border-2 border-transparent focus:border-brand-primary outline-none text-slate-900"
                value={tableNumber} onChange={e => setTableNumber(e.target.value)}
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-4">
          {cart.map((item, idx) => (
            <div key={idx} className={`flex items-center gap-5 p-5 rounded-[30px] border ${isStaffMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 shadow-sm border-slate-200'}`}>
              <div className="flex-1 min-w-0">
                <h5 className="text-base font-black tracking-tight truncate">{item.name}</h5>
                {item.selectedVariant && <p className="text-[9px] font-black uppercase text-brand-primary italic">{item.selectedVariant}</p>}
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => setCart(prev => prev.map((it, i) => i === idx ? { ...it, quantity: Math.max(0, it.quantity - 1) } : it).filter(it => it.quantity > 0))} className="p-2 bg-white rounded-xl shadow-sm"><Minus size={14} /></button>
                <span className="text-lg font-black">{item.quantity}</span>
                <button onClick={() => setCart(prev => prev.map((it, i) => i === idx ? { ...it, quantity: it.quantity + 1 } : it))} className="p-2 bg-white rounded-xl shadow-sm"><Plus size={14} /></button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-8 space-y-6 border-t border-slate-100 bg-slate-50/50">
          <div className="flex justify-between items-center text-3xl font-black text-slate-900 tracking-tighter italic">
            <span>TOTAL</span><span>R{cart.reduce((s, i) => s + (i.price * i.quantity), 0).toFixed(2)}</span>
          </div>
          <button 
            onClick={handleFireOrder}
            disabled={cart.length === 0 || !tableNumber}
            className="w-full py-7 bg-brand-primary text-white rounded-[30px] font-black text-xl uppercase tracking-[0.2em] shadow-2xl disabled:opacity-50 transition-all flex items-center justify-center gap-3"
          >
            <Zap fill="currentColor" size={24} /> Dispatch Order
          </button>
        </div>
      </div>

      {activeConfigItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-lg rounded-[60px] shadow-2xl border border-white/50 overflow-hidden animate-in zoom-in-95">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                 <h3 className="text-2xl font-black italic tracking-tighter uppercase">{activeConfigItem.name}</h3>
                 <button onClick={() => setActiveConfigItem(null)} className="p-3 hover:bg-slate-100 rounded-full"><X size={24} /></button>
              </div>
              <div className="p-10 space-y-8">
                 {activeConfigItem.variants && activeConfigItem.variants.length > 0 && (
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Variant</label>
                      <div className="grid grid-cols-2 gap-3">
                         {activeConfigItem.variants.map((v, idx) => (
                           <button key={idx} onClick={() => setConfigVariant(v)}
                            className={`p-4 rounded-2xl font-black text-xs uppercase border-2 transition-all ${configVariant === v ? 'bg-brand-primary border-brand-primary text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-500'}`}
                           >
                             {v}
                           </button>
                         ))}
                      </div>
                   </div>
                 )}
                 <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Notes / Exclusions</label>
                    <input className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-brand-primary outline-none font-bold shadow-inner" value={configModifiers} onChange={e => setConfigModifiers(e.target.value)} placeholder="e.g. No onions" />
                 </div>
                 <button onClick={() => addToCart(activeConfigItem, configVariant, configModifiers)}
                  className="w-full py-5 bg-brand-primary text-white rounded-[30px] font-black uppercase tracking-[0.2em] shadow-xl"
                 >
                  Add To Order
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default POSModule;
