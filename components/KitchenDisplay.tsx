
import React from 'react';
import { Order } from '../types';
import { Clock, CheckCircle2, ChevronRight, MapPin, BellRing, Utensils, PackageCheck } from 'lucide-react';

interface KDSProps {
  orders: Order[];
  onCompleteOrder: (id: string) => void;
  onCollectOrder: (id: string) => void;
}

const KitchenDisplay: React.FC<KDSProps> = ({ orders, onCompleteOrder, onCollectOrder }) => {
  const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing');
  const readyOrders = orders.filter(o => o.status === 'ready');

  return (
    <div className="p-8 h-[calc(100vh-73px)] overflow-hidden flex flex-col bg-slate-900 text-white">
      <div className="flex items-center justify-between mb-8">
        <div>
           <h2 className="text-3xl font-black tracking-tighter uppercase italic text-emerald-400">Live Kitchen Queue</h2>
           <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Managing {activeOrders.length} Active Tickets</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
             <span className="text-xs font-black uppercase tracking-widest">KDS Sync Online</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-8 overflow-hidden">
        {/* Main Queue */}
        <div className="flex-1 flex gap-6 overflow-x-auto pb-6 custom-scrollbar">
          {activeOrders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-700 gap-6 border-2 border-dashed border-slate-800 rounded-[50px]">
               <CheckCircle2 size={120} strokeWidth={1} />
               <p className="text-2xl font-black uppercase tracking-widest">Kitchen is Clear</p>
            </div>
          ) : (
            activeOrders.map(order => (
              <div key={order.id} className="w-96 flex-shrink-0 bg-slate-800 rounded-3xl border-2 border-slate-700 overflow-hidden flex flex-col shadow-2xl">
                <div className="p-6 bg-slate-700 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg">
                         {order.tableNumber}
                      </div>
                      <div>
                         <h4 className="font-black text-lg uppercase leading-none mb-1">Table {order.tableNumber}</h4>
                         <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <MapPin size={12} /> {order.context === 'the-yard' ? 'The Yard' : 'Sunday Theory'}
                         </div>
                      </div>
                   </div>
                   <div className="text-right">
                      <div className="flex items-center gap-1 justify-end text-emerald-400 font-black mb-1">
                         <Clock size={16} />
                         <span className="tabular-nums">04:22</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Elapsed</p>
                   </div>
                </div>

                <div className="flex-1 p-6 space-y-4 overflow-y-auto custom-scrollbar">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-3 bg-slate-900/50 rounded-2xl border border-slate-700/50">
                       <div className="w-8 h-8 flex-shrink-0 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center font-black text-indigo-400">
                          {item.quantity}
                       </div>
                       <div className="flex-1">
                          <h5 className="font-bold text-slate-100 uppercase tracking-wide">{item.name}</h5>
                          {item.modifiers && item.modifiers.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                               {item.modifiers.map((m, i) => (
                                 <span key={i} className="text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded">
                                    {m}
                                 </span>
                               ))}
                            </div>
                          )}
                       </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 bg-slate-900">
                   <button 
                    onClick={() => onCompleteOrder(order.id)}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                     Ready for Pickup <ChevronRight size={20} />
                   </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Finished / Ready for Collection Hub on the Right */}
        <div className="w-96 bg-slate-800/50 rounded-[40px] border border-slate-700/50 flex flex-col overflow-hidden">
          <div className="p-8 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PackageCheck className="text-brand-accent" size={20} />
              <h3 className="text-lg font-black uppercase tracking-tighter italic">Finished Lines</h3>
            </div>
            <span className="bg-brand-accent/20 text-brand-accent px-3 py-1 rounded-lg text-[10px] font-black uppercase">
              {readyOrders.length} Done
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {readyOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-10 gap-4 text-center">
                <Utensils size={64} />
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Meals Waiting</p>
              </div>
            ) : (
              readyOrders.map(order => (
                <div key={order.id} className="bg-slate-700 p-6 rounded-3xl border-l-4 border-emerald-500 animate-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center font-black text-lg">
                        {order.tableNumber}
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase italic leading-none">Table {order.tableNumber}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ready for Collection</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-6">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs font-bold text-slate-300 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-white/5">
                        <span>{item.quantity}x {item.name}</span>
                        <CheckCircle2 size={12} className="text-emerald-400" />
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => onCollectOrder(order.id)}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2"
                  >
                    Clear from Collection <BellRing size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KitchenDisplay;
