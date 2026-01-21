
import React, { useState, useMemo } from 'react';
import { Order, ProjectContext } from '../types';
import { Printer, Receipt, Clock, MapPin, ChevronRight, X, CreditCard, Banknote, ShieldCheck, TrendingUp, ShoppingBag, CheckCircle2, DollarSign } from 'lucide-react';

interface BillModuleProps {
  orders: Order[];
  context: ProjectContext;
  onUpdateStatus: (id: string, status: Order['status']) => void;
}

const BillModule: React.FC<BillModuleProps> = ({ orders, context, onUpdateStatus }) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Logic for daily stats
  const stats = useMemo(() => {
    const todayOrders = orders.filter(o => 
      o.context === context && 
      o.timestamp.startsWith(todayStr)
    );

    const total = todayOrders.length;
    const pending = todayOrders.filter(o => o.status === 'pending' || o.status === 'preparing').length;
    const received = todayOrders.filter(o => o.status === 'ready' || o.status === 'delivered').length;
    const paid = todayOrders.filter(o => o.status === 'paid');
    const revenue = paid.reduce((sum, o) => sum + o.total, 0);

    return { total, pending, received, paidCount: paid.length, revenue };
  }, [orders, context, todayStr]);

  const activeBills = useMemo(() => {
    return orders.filter(o => o.context === context && o.status !== 'paid');
  }, [orders, context]);

  const selectedOrder = useMemo(() => {
    return orders.find(o => o.id === selectedOrderId);
  }, [orders, selectedOrderId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-4">Billing Hub</h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Consolidated table accounts and guest checks.</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200">
          Real-time Audit Active
        </div>
      </div>

      {/* Shift Performance Registry */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-black/5 border border-white/50 flex flex-col justify-between hover:scale-[1.02] transition-transform">
          <div>
            <div className="p-3 bg-slate-100 w-fit rounded-2xl mb-4 text-slate-400">
              <ShoppingBag size={20} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Daily Volume</p>
            <h3 className="text-4xl font-black text-slate-800 italic tracking-tighter">{stats.total}</h3>
          </div>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-4">Total orders captured</p>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-black/5 border border-white/50 flex flex-col justify-between hover:scale-[1.02] transition-transform">
          <div>
            <div className="p-3 bg-amber-50 w-fit rounded-2xl mb-4 text-amber-500">
              <Clock size={20} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Kitchen</p>
            <h3 className="text-4xl font-black text-slate-800 italic tracking-tighter">{stats.pending}</h3>
          </div>
          <p className="text-[9px] font-bold text-amber-600 uppercase tracking-widest mt-4">Active prep queue</p>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-black/5 border border-white/50 flex flex-col justify-between hover:scale-[1.02] transition-transform">
          <div>
            <div className="p-3 bg-indigo-50 w-fit rounded-2xl mb-4 text-indigo-500">
              <MapPin size={20} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Received / Active</p>
            <h3 className="text-4xl font-black text-slate-800 italic tracking-tighter">{stats.received}</h3>
          </div>
          <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mt-4">On floor / waiting settlement</p>
        </div>

        <div className="bg-[#1A1A1A] p-8 rounded-[40px] shadow-2xl text-white flex flex-col justify-between hover:scale-[1.02] transition-transform relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 text-brand-primary/10 group-hover:scale-110 transition-transform">
            <DollarSign size={64} />
          </div>
          <div className="relative z-10">
            <div className="p-3 bg-brand-primary/20 w-fit rounded-2xl mb-4 text-brand-primary">
              <CheckCircle2 size={20} />
            </div>
            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Settled Accounts</p>
            <h3 className="text-4xl font-black text-brand-primary italic tracking-tighter">R{stats.revenue.toLocaleString()}</h3>
          </div>
          <p className="text-[9px] font-bold text-brand-primary uppercase tracking-widest mt-4 relative z-10">{stats.paidCount} tickets paid</p>
        </div>
      </div>

      {/* Main Billing Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-800">Unsettled Accounts</h3>
            <div className="flex items-center gap-2 bg-brand-primary/5 px-3 py-1.5 rounded-xl">
               <TrendingUp size={14} className="text-brand-primary" />
               <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">Live Liability: R{activeBills.reduce((s,o) => s + o.total, 0).toLocaleString()}</span>
            </div>
          </div>

          {activeBills.length === 0 ? (
            <div className="p-20 text-center bg-white rounded-[50px] border border-dashed border-slate-200 opacity-40">
               <Receipt size={64} className="mx-auto mb-4" />
               <p className="font-black uppercase tracking-widest italic">No active accounts</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeBills.map(order => (
                <div 
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`p-8 bg-white rounded-[40px] border-2 transition-all cursor-pointer group shadow-xl shadow-black/5 hover:shadow-2xl ${selectedOrderId === order.id ? 'border-brand-primary' : 'border-white/50 hover:border-brand-primary/20'}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center font-black text-xl text-slate-800">
                         {order.tableNumber}
                       </div>
                       <div>
                         <h4 className="font-black text-slate-800 uppercase italic">Table {order.tableNumber}</h4>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.serverName}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xl font-black text-brand-primary italic">R{order.total.toFixed(2)}</p>
                       <p className="text-[9px] font-bold text-slate-300 uppercase">Subtotal</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                     <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${
                       order.status === 'delivered' || order.status === 'ready' ? 'bg-indigo-500 text-white' : 
                       order.status === 'pending' || order.status === 'preparing' ? 'bg-amber-500 text-white' : 
                       'bg-slate-100 text-slate-500'
                     }`}>
                        {order.status}
                     </span>
                     <ChevronRight size={18} className="text-slate-200 group-hover:text-brand-primary transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Bill Detail */}
        <div className="relative">
          {selectedOrder ? (
            <div className="bg-white rounded-[50px] shadow-2xl overflow-hidden border border-slate-100 flex flex-col sticky top-8 max-h-[calc(100vh-160px)] animate-in zoom-in-95 duration-300 print:shadow-none print:border-0 print:m-0 print:p-0">
               <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center justify-between print:bg-white">
                  <div>
                    <h3 className="text-xl font-black italic tracking-tighter uppercase text-slate-800">Guest Check</h3>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Reference: {selectedOrder.id}</p>
                  </div>
                  <button onClick={() => setSelectedOrderId(null)} className="p-2 text-slate-300 hover:text-slate-600 print:hidden">
                    <X size={20} />
                  </button>
               </div>

               <div className="flex-1 overflow-y-auto p-8 font-mono text-xs space-y-6">
                  <div className="text-center space-y-1 mb-8">
                     <h2 className="text-lg font-black tracking-tighter uppercase italic">{context === ProjectContext.THE_YARD ? 'The Yard on Herschel' : 'Sunday Theory'}</h2>
                     <p className="text-slate-400">VAT REG: 4920192384</p>
                     <p className="text-slate-400">{new Date(selectedOrder.timestamp).toLocaleString()}</p>
                  </div>

                  <div className="flex justify-between border-b border-slate-100 pb-2 mb-4">
                     <span className="font-black uppercase">Itemized List</span>
                     <span className="font-black">Qty / Price</span>
                  </div>

                  <div className="space-y-4">
                     {selectedOrder.items.map((item, idx) => (
                       <div key={idx} className="flex justify-between items-start">
                          <div className="flex-1 pr-4">
                             <p className="font-bold uppercase">{item.name}</p>
                             {item.modifiers?.map((m, i) => <p key={i} className="text-[10px] text-slate-400 ml-2">-{m}</p>)}
                          </div>
                          <div className="text-right min-w-[80px]">
                             <p>{item.quantity} x {item.price.toFixed(2)}</p>
                             <p className="font-black">R{(item.quantity * item.price).toFixed(2)}</p>
                          </div>
                       </div>
                     ))}
                  </div>

                  <div className="pt-8 border-t-2 border-dashed border-slate-200 space-y-2">
                     <div className="flex justify-between font-bold">
                        <span>SUBTOTAL</span>
                        <span>R{selectedOrder.total.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between text-slate-400">
                        <span>VAT (15%)</span>
                        <span>R{(selectedOrder.total * 0.15).toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between text-xl font-black pt-4 border-t border-slate-100">
                        <span>GRAND TOTAL</span>
                        <span>R{(selectedOrder.total * 1.15).toFixed(2)}</span>
                     </div>
                  </div>

                  <div className="text-center pt-8 opacity-40 italic">
                     <p>Service charge not included.</p>
                     <p>Thank you for visiting {context === ProjectContext.THE_YARD ? 'The Yard' : 'Sunday Theory'}!</p>
                  </div>
               </div>

               <div className="p-8 bg-slate-50 border-t border-slate-100 space-y-4 print:hidden">
                  <button 
                    onClick={handlePrint}
                    className="w-full py-4 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all"
                  >
                    <Printer size={18} /> Print Guest Copy
                  </button>
                  <div className="grid grid-cols-2 gap-4">
                     <button 
                      onClick={() => {
                        onUpdateStatus(selectedOrder.id, 'paid');
                        setSelectedOrderId(null);
                      }}
                      className="py-3 bg-emerald-500 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                     >
                       <ShieldCheck size={14} /> Close & Pay
                     </button>
                     <div className="flex gap-2">
                        <div className="flex-1 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400"><CreditCard size={14} /></div>
                        <div className="flex-1 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-slate-400"><Banknote size={14} /></div>
                     </div>
                  </div>
               </div>
            </div>
          ) : (
            <div className="h-[400px] flex flex-col items-center justify-center text-slate-300 gap-4 bg-slate-50 rounded-[50px] border-2 border-dashed border-slate-100">
               <Receipt size={48} strokeWidth={1} />
               <p className="text-[10px] font-black uppercase tracking-widest text-center">Select an account<br/>to generate bill</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillModule;
