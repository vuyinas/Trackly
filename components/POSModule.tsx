
import React, { useState, useMemo } from 'react';
import { MenuItem, OrderItem, ProjectContext, Order } from '../types';
import { Search, Plus, Minus, CreditCard, Banknote, Trash2, Zap, ShoppingCart, Coffee, Utensils, ChevronRight, X, Layers, UserCheck } from 'lucide-react';

interface POSModuleProps {
  menu: MenuItem[];
  context: ProjectContext;
  onPlaceOrder: (order: Partial<Order>) => void;
}

const POSModule: React.FC<POSModuleProps> = ({ menu, context, onPlaceOrder }) => {
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('All');
  const [tableNumber, setTableNumber] = useState('');
  const [isStaffMode, setIsStaffMode] = useState(false);
  
  // Variant Selection State
  const [activeVariantItem, setActiveVariantItem] = useState<MenuItem | null>(null);

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
    const presentCats = new Set(menu.filter(i => {
      const matchContext = i.context === context;
      const matchStaff = isStaffMode ? i.availableToStaff : true;
      return matchContext && matchStaff;
    }).map(i => i.category));
    return base.filter(cat => cat === 'All' || presentCats.has(cat));
  }, [menu, context, isStaffMode]);

  const addToCart = (item: MenuItem, selectedVariant?: string) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id && i.selectedVariant === selectedVariant);
      if (existing) {
        return prev.map(i => (i.id === item.id && i.selectedVariant === selectedVariant) ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1, isStaffMeal: isStaffMode, selectedVariant }];
    });
    setActiveVariantItem(null);
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.variants && item.variants.length > 0) {
      setActiveVariantItem(item);
    } else {
      addToCart(item);
    }
  };

  const updateQty = (id: string, delta: number, variant?: string) => {
    setCart(prev => prev.map(i => {
      if (i.id === id && i.selectedVariant === variant) {
        const newQty = Math.max(0, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const total = useMemo(() => isStaffMode ? 0 : cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart, isStaffMode]);

  const handleFireOrder = () => {
    if (cart.length === 0 || (!tableNumber && !isStaffMode)) return;
    onPlaceOrder({
      tableNumber: isStaffMode ? 'STAFF' : tableNumber,
      items: cart,
      total,
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
    <div className="flex h-[calc(100vh-73px)] overflow-hidden bg-slate-100 relative">
      <div className="flex-1 flex flex-col border-r border-slate-200">
        <div className="p-4 bg-white border-b border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex bg-slate-100 p-1 rounded-2xl">
              <button 
                onClick={() => { setIsStaffMode(false); setCategory('All'); }}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isStaffMode ? 'bg-white shadow-sm text-brand-primary' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Standard Bill
              </button>
              <button 
                onClick={() => { setIsStaffMode(true); setCategory('All'); }}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isStaffMode ? 'bg-brand-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <UserCheck size={14} /> Staff Allocation
              </button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search active menu..."
                className="pl-9 pr-4 py-2.5 bg-slate-100 rounded-xl text-xs outline-none w-64 focus:ring-2 focus:ring-brand-primary/20 font-bold"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${category === cat ? 'bg-brand-primary text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto grid grid-cols-2 xl:grid-cols-4 gap-6 content-start">
          {filteredMenu.map(item => (
            <button 
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="bg-white p-6 rounded-[35px] shadow-sm border-2 border-slate-50 hover:border-brand-primary/20 transition-all active:scale-95 flex flex-col justify-between h-48 relative group"
            >
              {item.variants && item.variants.length > 0 && (
                <div className="absolute top-4 right-4 p-2 bg-brand-primary/5 text-brand-primary rounded-xl opacity-50 group-hover:opacity-100 transition-opacity">
                   <Layers size={14} />
                </div>
              )}
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.category}</p>
                <h4 className="font-black text-slate-800 leading-tight text-base tracking-tight">{item.name}</h4>
              </div>
              <div className="flex items-end justify-between">
                <p className="text-lg font-black italic text-slate-900">R{item.price.toFixed(2)}</p>
                <span className="text-[10px] font-bold text-slate-400">{item.stock} BOH</span>
              </div>
            </button>
          ))}
          {filteredMenu.length === 0 && (
            <div className="col-span-full py-20 text-center opacity-30 flex flex-col items-center justify-center gap-4">
              <Zap size={48} />
              <p className="font-black uppercase tracking-[0.2em] text-xs">No items found for this selection</p>
            </div>
          )}
        </div>
      </div>

      <div className={`w-[450px] flex flex-col shadow-2xl transition-all ${isStaffMode ? 'bg-[#0F172A] text-white' : 'bg-white'}`}>
        <div className={`p-8 border-b ${isStaffMode ? 'border-white/5' : 'border-slate-100'}`}>
           <h3 className={`text-3xl font-black tracking-tighter uppercase italic mb-8 ${isStaffMode ? 'text-brand-primary' : 'text-slate-800'}`}>
              {isStaffMode ? 'Staff Allocation' : 'Guest Bill'}
           </h3>
           {!isStaffMode ? (
             <div className="relative">
                <Utensils className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input 
                  type="text" placeholder="Table No."
                  className="w-full pl-14 pr-6 py-5 bg-slate-100 rounded-[25px] font-black text-2xl border-2 border-transparent focus:border-brand-accent outline-none text-slate-900"
                  value={tableNumber} onChange={e => setTableNumber(e.target.value)}
                />
             </div>
           ) : (
             <div className="flex items-center gap-5 bg-white/5 p-6 rounded-[30px] border border-white/50">
                <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center text-white"><Coffee size={32} /></div>
                <p className="text-xl font-black text-white italic tracking-tight">Personnel Consumption Log</p>
             </div>
           )}
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {cart.map((item, idx) => (
            <div key={`${item.id}-${item.selectedVariant || 'none'}`} className={`flex items-center gap-5 p-5 rounded-[30px] border ${isStaffMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200/50'}`}>
              <div className="flex-1 min-w-0">
                <h5 className="text-base font-black tracking-tight truncate">{item.name}</h5>
                {item.selectedVariant && (
                  <p className="text-[10px] font-black uppercase text-brand-primary mt-1 flex items-center gap-1 italic">
                    <ChevronRight size={10} /> {item.selectedVariant}
                  </p>
                )}
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">R{item.price.toFixed(2)} ea.</p>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => updateQty(item.id, -1, item.selectedVariant)} className="p-1.5 hover:text-brand-primary"><Minus size={18} /></button>
                <span className="text-lg font-black">{item.quantity}</span>
                <button onClick={() => updateQty(item.id, 1, item.selectedVariant)} className="p-1.5 hover:text-brand-primary"><Plus size={18} /></button>
              </div>
            </div>
          ))}
          {cart.length === 0 && <div className="h-full flex flex-col items-center justify-center opacity-10"><ShoppingCart size={80} /><p className="font-black uppercase tracking-widest text-xs mt-4">Empty Cart</p></div>}
        </div>

        <div className={`p-8 space-y-6 border-t ${isStaffMode ? 'bg-black/40 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
          {!isStaffMode && (
            <div className="flex justify-between items-center text-3xl font-black text-slate-900 tracking-tighter italic">
              <span>TOTAL DUE</span><span>R{(total * 1.15).toFixed(2)}</span>
            </div>
          )}
          <button 
            onClick={handleFireOrder}
            disabled={cart.length === 0 || (!tableNumber && !isStaffMode)}
            className={`w-full py-7 rounded-[30px] font-black text-xl uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl transition-all disabled:opacity-50 ${isStaffMode ? 'bg-brand-primary text-white' : 'bg-brand-accent text-[#1A1A1A]'}`}
          >
            <Zap fill="currentColor" size={28} /> {isStaffMode ? 'Log To Personnel' : 'Fire Kitchen'}
          </button>
        </div>
      </div>

      {/* Variant Selection Modal */}
      {activeVariantItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-lg rounded-[60px] shadow-2xl border border-white/50 overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                 <div>
                    <h3 className="text-2xl font-black italic tracking-tighter uppercase">{activeVariantItem.name}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Select Specific Option</p>
                 </div>
                 <button onClick={() => setActiveVariantItem(null)} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors"><X size={24} /></button>
              </div>
              <div className="p-10 grid grid-cols-1 gap-4">
                 {activeVariantItem.variants?.map((v, idx) => (
                   <button 
                    key={idx}
                    onClick={() => addToCart(activeVariantItem, v)}
                    className="w-full p-6 bg-slate-50 hover:bg-brand-primary hover:text-white rounded-[30px] border-2 border-transparent transition-all text-left flex items-center justify-between group"
                   >
                     <span className="text-lg font-black uppercase italic tracking-tight">{v}</span>
                     <ChevronRight size={20} className="text-slate-200 group-hover:text-white transition-all" />
                   </button>
                 ))}
              </div>
              <div className="p-8 bg-slate-50 border-t border-slate-100">
                <button 
                  onClick={() => addToCart(activeVariantItem)}
                  className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600"
                >
                  Skip / Default Option
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default POSModule;
