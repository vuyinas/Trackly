
import React, { useState } from 'react';
import { Order, OrderItem } from '../types';
import { Clock, CheckCircle2, ChevronRight, MapPin, BellRing, Utensils, PackageCheck, Wine, ChefHat, Zap, Info, ArrowRight, MousePointer2, CheckCircle, Circle, AlertCircle } from 'lucide-react';

interface KDSProps {
  orders: Order[];
  onCompleteOrder: (id: string, station: 'kitchen' | 'bar') => void;
  onCollectOrder: (id: string, station: 'kitchen' | 'bar') => void;
}

const KitchenDisplay: React.FC<KDSProps> = ({ orders, onCompleteOrder, onCollectOrder }) => {
  // Helper to determine if an item belongs to the bar
  const isBarItem = (item: OrderItem) => item.category === 'Drinks' || item.category === 'Hubbly';
  const isFoodItem = (item: OrderItem) => !isBarItem(item);

  // Individual item checklist for the expeditor (remains local for session-based ticking)
  const [itemChecks, setItemChecks] = useState<Record<string, Record<number, boolean>>>({});

  const activeOrders = orders.filter(o => o.status !== 'paid' && o.status !== 'delivered');

  const toggleItemCheck = (orderId: string, itemIdx: number) => {
    setItemChecks(prev => {
      const orderChecks = prev[orderId] || {};
      return {
        ...prev,
        [orderId]: {
          ...orderChecks,
          [itemIdx]: !orderChecks[itemIdx]
        }
      };
    });
  };

  const handleStationComplete = (orderId: string, station: 'kitchen' | 'bar') => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Verify all items for this station are ticked
    const stationItems = order.items.map((it, idx) => ({ it, idx }))
      .filter(({ it }) => (station === 'kitchen' ? isFoodItem(it) : isBarItem(it)));
    
    const allTicked = stationItems.every(({ idx }) => itemChecks[orderId]?.[idx]);
    
    if (!allTicked) return;

    onCompleteOrder(orderId, station);
  };

  // Dispatch Hub Buffer: Shows items that are 'ready' at a station but not yet 'collected'
  const collectionBuffer = activeOrders.filter(o => 
    (o.kitchenStatus === 'ready' && !o.kitchenCollected) || 
    (o.barStatus === 'ready' && !o.barCollected)
  );

  return (
    <div className="p-8 h-[calc(100vh-73px)] overflow-hidden flex flex-col bg-slate-950 text-white">
      <div className="flex items-center justify-between mb-8">
        <div>
           <div className="flex items-center gap-3 mb-1">
              <Zap className="text-brand-primary animate-pulse" size={16} fill="currentColor" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary">Live Dispatch Protocol</p>
           </div>
           <h2 className="text-4xl font-black tracking-tighter uppercase italic leading-none">Command Center</h2>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex bg-slate-900 p-1 rounded-2xl border border-white/5">
             <div className="px-6 py-2 flex items-center gap-2 border-r border-white/5">
                <div className="w-2 h-2 bg-orange-500 rounded-full shadow-[0_0_8px_#f97316]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Kitchen Active</span>
             </div>
             <div className="px-6 py-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_8px_#6366f1]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Bar Active</span>
             </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-8 overflow-hidden">
        {/* PREPARATION ZONE */}
        <div className="flex-[3] flex flex-col gap-8 overflow-hidden">
           <div className="flex-1 grid grid-cols-2 gap-8 overflow-hidden">
              
              {/* KITCHEN STATION (FOOD) */}
              <div className="flex flex-col gap-6 overflow-hidden">
                 <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl"><ChefHat size={24} /></div>
                       <h3 className="text-xl font-black italic uppercase tracking-tighter">Kitchen Pass</h3>
                    </div>
                    <span className="bg-orange-500/10 text-orange-500 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em]">
                       {activeOrders.filter(o => o.items.some(isFoodItem) && o.kitchenStatus === 'pending').length} Active Orders
                    </span>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                    {activeOrders.filter(o => o.items.some(isFoodItem) && o.kitchenStatus === 'pending').map(order => {
                       const stationItems = order.items.map((it, idx) => ({ it, idx })).filter(({ it }) => isFoodItem(it));
                       const allTicked = stationItems.every(({ idx }) => itemChecks[order.id]?.[idx]);
                       
                       return (
                       <div key={order.id} className="bg-slate-900 rounded-[40px] border border-white/5 overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-left-4">
                          <div className="p-6 bg-slate-800/40 flex items-center justify-between border-b border-white/5">
                             <div className="flex items-center gap-4">
                                <div className="px-3 py-1.5 bg-white text-slate-900 rounded-xl font-black text-xs shadow-lg tracking-tighter">
                                   {order.tableNumber}
                                </div>
                                <div>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Table {order.tableNumber}</p>
                                   <p className="text-[8px] font-bold text-slate-500 uppercase mt-1 italic">Server: {order.serverName}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <div className="flex items-center gap-1 justify-end text-orange-400 font-black mb-0.5"><Clock size={12} /><span className="text-xs tabular-nums">LIVE</span></div>
                             </div>
                          </div>
                          <div className="p-6 space-y-3">
                             {order.items.map((item, idx) => {
                                if (!isFoodItem(item)) return null;
                                const isChecked = itemChecks[order.id]?.[idx];
                                return (
                                  <div 
                                    key={idx} 
                                    onClick={() => toggleItemCheck(order.id, idx)}
                                    className={`flex items-start gap-4 p-3 rounded-2xl border transition-all cursor-pointer group/item ${isChecked ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-black/20 border-white/5 hover:border-orange-500/20'}`}
                                  >
                                    <div className={`w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center font-black text-sm transition-colors ${isChecked ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-800 text-orange-500 border border-white/5'}`}>
                                       {isChecked ? <CheckCircle size={16} /> : item.quantity}
                                    </div>
                                    <div className="flex-1">
                                      <h5 className={`font-bold uppercase text-xs tracking-tight transition-colors ${isChecked ? 'text-emerald-200' : 'text-slate-200'}`}>{item.name}</h5>
                                      <div className="flex flex-wrap gap-2 mt-1">
                                        {item.selectedVariant && <p className="text-[8px] font-black uppercase text-orange-600/60 italic">&rarr; {item.selectedVariant}</p>}
                                        {item.modifiers?.map((m, mIdx) => (
                                          <p key={mIdx} className="text-[8px] font-black uppercase text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded italic border border-red-500/20">
                                            NO {m}
                                          </p>
                                        ))}
                                      </div>
                                    </div>
                                    {!isChecked && <div className="opacity-0 group-hover/item:opacity-100 transition-opacity"><Circle size={14} className="text-slate-600" /></div>}
                                  </div>
                                );
                             })}
                          </div>
                          <button 
                             onClick={() => handleStationComplete(order.id, 'kitchen')}
                             disabled={!allTicked}
                             className={`p-5 transition-all font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 active:scale-95 disabled:opacity-30 disabled:grayscale ${allTicked ? 'bg-emerald-600 hover:bg-emerald-700 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-orange-600 cursor-not-allowed'}`}
                          >
                             {allTicked ? <><CheckCircle size={14} /> Commit to Dispatch</> : <><AlertCircle size={14} /> Tick all items to Commit</>}
                          </button>
                       </div>
                    )})}
                 </div>
              </div>

              {/* BAR STATION (DRINKS) */}
              <div className="flex flex-col gap-6 overflow-hidden">
                 <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl"><Wine size={24} /></div>
                       <h3 className="text-xl font-black italic uppercase tracking-tighter">Bar Well</h3>
                    </div>
                    <span className="bg-indigo-500/10 text-indigo-500 px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-[0.2em]">
                       {activeOrders.filter(o => o.items.some(isBarItem) && o.barStatus === 'pending').length} Active Orders
                    </span>
                 </div>

                 <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
                    {activeOrders.filter(o => o.items.some(isBarItem) && o.barStatus === 'pending').map(order => {
                       const stationItems = order.items.map((it, idx) => ({ it, idx })).filter(({ it }) => isBarItem(it));
                       const allTicked = stationItems.every(({ idx }) => itemChecks[order.id]?.[idx]);

                       return (
                       <div key={order.id} className="bg-slate-900 rounded-[40px] border border-white/5 overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-left-4">
                          <div className="p-6 bg-slate-800/40 flex items-center justify-between border-b border-white/5">
                             <div className="flex items-center gap-4">
                                <div className="px-3 py-1.5 bg-brand-primary text-white rounded-xl font-black text-xs shadow-lg tracking-tighter">
                                   {order.tableNumber}
                                </div>
                                <div>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Table {order.tableNumber}</p>
                                   <p className="text-[8px] font-bold text-slate-500 uppercase mt-1 italic">Server: {order.serverName}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <div className="flex items-center gap-1 justify-end text-indigo-400 font-black mb-0.5"><Clock size={12} /><span className="text-xs tabular-nums">LIVE</span></div>
                             </div>
                          </div>
                          <div className="p-6 space-y-3">
                             {order.items.map((item, idx) => {
                                if (!isBarItem(item)) return null;
                                const isChecked = itemChecks[order.id]?.[idx];
                                return (
                                  <div 
                                    key={idx} 
                                    onClick={() => toggleItemCheck(order.id, idx)}
                                    className={`flex items-start gap-4 p-3 rounded-2xl border transition-all cursor-pointer group/item ${isChecked ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-black/20 border-white/5 hover:border-indigo-500/20'}`}
                                  >
                                    <div className={`w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center font-black text-sm transition-colors ${isChecked ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-slate-800 text-indigo-400 border border-white/5'}`}>
                                       {isChecked ? <CheckCircle size={16} /> : item.quantity}
                                    </div>
                                    <div className="flex-1">
                                      <h5 className={`font-bold uppercase text-xs tracking-tight transition-colors ${isChecked ? 'text-emerald-200' : 'text-slate-200'}`}>{item.name}</h5>
                                      {item.selectedVariant && <p className="text-[8px] font-black uppercase text-indigo-600/60 mt-0.5 italic">&rarr; {item.selectedVariant}</p>}
                                    </div>
                                    {!isChecked && <div className="opacity-0 group-hover/item:opacity-100 transition-opacity"><Circle size={14} className="text-slate-600" /></div>}
                                  </div>
                                );
                             })}
                          </div>
                          <button 
                             onClick={() => handleStationComplete(order.id, 'bar')}
                             disabled={!allTicked}
                             className={`p-5 transition-all font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-2 active:scale-95 disabled:opacity-30 disabled:grayscale ${allTicked ? 'bg-emerald-600 hover:bg-emerald-700 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-indigo-600 cursor-not-allowed'}`}
                          >
                             {allTicked ? <><CheckCircle size={14} /> Commit to Dispatch</> : <><AlertCircle size={14} /> Tick all items to Commit</>}
                          </button>
                       </div>
                    )})}
                 </div>
              </div>
           </div>
        </div>

        {/* DISPATCH HUB - INDEPENDENT DISPATCH */}
        <div className="w-[480px] bg-slate-900 rounded-[50px] border border-white/5 flex flex-col overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 bg-brand-primary/5 pointer-events-none" />
          
          <div className="p-10 border-b border-white/5 flex items-center justify-between bg-slate-800/30 relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl"><PackageCheck size={28} /></div>
              <div>
                 <h3 className="text-xl font-black uppercase tracking-tighter italic">Dispatch Hub</h3>
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Independent station clearing</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar relative z-10">
            {collectionBuffer.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-10 gap-6 text-center">
                <MousePointer2 size={100} strokeWidth={1} className="animate-bounce" />
                <p className="text-xs font-black uppercase tracking-[0.4em]">Hub Synchronized</p>
              </div>
            ) : (
              collectionBuffer.map(order => (
                <div key={order.id} className="space-y-4">
                   {/* DRINKS TICKET (Appear immediately when bar is done) */}
                   {order.barStatus === 'ready' && !order.barCollected && (
                      <div className="bg-slate-800 p-8 rounded-[40px] border-l-8 border-indigo-500 shadow-2xl animate-in slide-in-from-right-4">
                         <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                               <div className="px-4 py-2 bg-indigo-500 text-white rounded-xl font-black text-sm shadow-lg tracking-tighter">
                                  {order.tableNumber}
                                </div>
                               <div>
                                  <h5 className="text-lg font-black uppercase italic leading-none flex items-center gap-2">Drinks Ready <Wine size={16} /></h5>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Table {order.tableNumber}</p>
                               </div>
                            </div>
                         </div>
                         <div className="space-y-3 mb-8">
                            {order.items.filter(isBarItem).map((item, idx) => (
                               <div key={idx} className="flex justify-between items-center p-3 bg-black/20 rounded-2xl border border-white/5">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-200">{item.quantity}x {item.name}</span>
                                  </div>
                                  <CheckCircle2 size={14} className="text-indigo-400 opacity-40" />
                               </div>
                            ))}
                         </div>
                         <button 
                           onClick={() => onCollectOrder(order.id, 'bar')}
                           className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
                         >
                           Clear Bar Tray <BellRing size={16} />
                         </button>
                      </div>
                   )}

                   {/* FOOD TICKET (Appear immediately when kitchen is done) */}
                   {order.kitchenStatus === 'ready' && !order.kitchenCollected && (
                      <div className="bg-slate-800 p-8 rounded-[40px] border-l-8 border-orange-500 shadow-2xl animate-in slide-in-from-right-4">
                         <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                               <div className="px-4 py-2 bg-orange-500 text-white rounded-xl font-black text-sm shadow-lg tracking-tighter">
                                  {order.tableNumber}
                               </div>
                               <div>
                                  <h5 className="text-lg font-black uppercase italic leading-none flex items-center gap-2">Food Ready <ChefHat size={16} /></h5>
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Table {order.tableNumber}</p>
                               </div>
                            </div>
                         </div>
                         <div className="space-y-3 mb-8">
                            {order.items.filter(isFoodItem).map((item, idx) => (
                               <div key={idx} className="flex justify-between items-center p-3 bg-black/20 rounded-2xl border border-white/5">
                                  <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-200">{item.quantity}x {item.name}</span>
                                    {item.modifiers?.map((m, mIdx) => (
                                      <span key={mIdx} className="text-[8px] font-black text-red-400 uppercase italic">NO {m}</span>
                                    ))}
                                  </div>
                                  <CheckCircle2 size={14} className="text-orange-400 opacity-40" />
                               </div>
                            ))}
                         </div>
                         <button 
                           onClick={() => onCollectOrder(order.id, 'kitchen')}
                           className="w-full py-5 bg-orange-600 hover:bg-orange-700 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
                         >
                           Clear Kitchen Pass <BellRing size={16} />
                         </button>
                      </div>
                   )}
                </div>
              ))
            )}
          </div>

          <div className="p-8 bg-black/40 border-t border-white/5 relative z-10">
             <div className="flex items-center gap-3 text-[8px] font-black uppercase text-slate-500 tracking-[0.2em]">
                <Info size={14} className="text-brand-primary" />
                <span>Station readiness is asynchronous. Runner protocol: Clear Bar immediately.</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenDisplay;
