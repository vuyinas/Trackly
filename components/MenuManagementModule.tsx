
import React, { useState, useMemo } from 'react';
import { MenuItem, ProjectContext } from '../types';
import { Plus, Trash2, Search, Utensils, Zap, Filter, X, Save, Edit3, ChevronRight, Layers, ListFilter, UserCheck } from 'lucide-react';

interface MenuManagementModuleProps {
  menu: MenuItem[];
  context: ProjectContext;
  onAdd: (item: Omit<MenuItem, 'id'>) => void;
  onUpdate: (id: string, updates: Partial<MenuItem>) => void;
  onDelete: (id: string) => void;
}

const MenuManagementModule: React.FC<MenuManagementModuleProps> = ({ menu, context, onAdd, onUpdate, onDelete }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    category: 'Main',
    stock: 100,
    isHubbly: false,
    availableToStaff: true,
    variants: [] as string[]
  });

  const [newVariant, setNewVariant] = useState('');

  const categories = [
    'Starters', 
    'Main', 
    'Desserts', 
    'Sides', 
    'Drinks', 
    'Family Sharing', 
    'Kids Meals', 
    'Hubbly'
  ];

  const filteredMenu = useMemo(() => {
    return menu.filter(item => 
      item.context === context && 
      (selectedCategory === 'All' || item.category === selectedCategory) &&
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [menu, context, selectedCategory, searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price < 0) return;
    
    if (editingId) {
      onUpdate(editingId, { ...formData });
    } else {
      onAdd({ ...formData, context });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({ name: '', price: 0, category: 'Main', stock: 100, isHubbly: false, availableToStaff: true, variants: [] });
    setEditingId(null);
    setIsAdding(false);
  };

  const startEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      price: item.price,
      category: item.category,
      stock: item.stock,
      isHubbly: !!item.isHubbly,
      availableToStaff: item.availableToStaff ?? true,
      variants: item.variants || []
    });
    setIsAdding(true);
  };

  const addVariant = () => {
    if (!newVariant.trim()) return;
    setFormData({ ...formData, variants: [...formData.variants, newVariant.trim()] });
    setNewVariant('');
  };

  const removeVariant = (idx: number) => {
    setFormData({ ...formData, variants: formData.variants.filter((_, i) => i !== idx) });
  };

  return (
    <div className="p-12 space-y-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-4">Menu Lab</h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Architecting the catalog for {context === ProjectContext.THE_YARD ? 'The Yard' : 'Sunday Theory'}.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsAdding(true); }}
          className="bg-brand-primary text-white px-10 py-5 rounded-[25px] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-primary/20 hover:scale-[1.02] transition-all flex items-center gap-3"
        >
          <Plus size={18} /> Add New Entry
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-8">
          <div className="flex items-center gap-4 bg-white p-4 rounded-[30px] shadow-sm border border-slate-100">
            <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                type="text" 
                placeholder="Search catalog..." 
                className="w-full pl-16 pr-6 py-4 bg-slate-50 rounded-2xl text-sm font-bold border-2 border-transparent focus:border-brand-primary/20 outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="h-10 w-px bg-slate-100" />
            <select 
              className="px-6 py-4 bg-white font-black text-[10px] uppercase tracking-widest outline-none"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMenu.map(item => (
              <div key={item.id} className="bg-white p-8 rounded-[40px] border border-white/50 shadow-xl shadow-black/5 hover:border-brand-primary/20 transition-all flex flex-col justify-between group relative overflow-hidden">
                 <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-2">
                      <div className={`p-3 rounded-2xl ${item.isHubbly ? 'bg-indigo-50 text-indigo-500' : 'bg-brand-primary/5 text-brand-primary'}`}>
                        {item.variants && item.variants.length > 0 ? <Layers size={20} /> : <Utensils size={20} />}
                      </div>
                      {item.availableToStaff && (
                        <div className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl" title="Available for Staff Allocation">
                          <UserCheck size={20} />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => startEdit(item)}
                        className="p-3 text-slate-400 hover:text-brand-primary hover:bg-brand-primary/5 rounded-2xl transition-all"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => onDelete(item.id)}
                        className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                 </div>
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.category}</p>
                    <h4 className="text-xl font-black text-slate-800 tracking-tight mb-2">{item.name}</h4>
                    {item.variants && item.variants.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.variants.map((v, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[8px] font-black uppercase tracking-widest rounded border border-slate-100">{v}</span>
                        ))}
                      </div>
                    )}
                 </div>
                 <div className="flex items-end justify-between pt-6 border-t border-slate-50 mt-6">
                    <p className="text-2xl font-black italic text-slate-900">R{item.price.toFixed(2)}</p>
                    <div className="text-right">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Stock</p>
                       <p className="font-mono font-black text-slate-800">{item.stock}</p>
                    </div>
                 </div>
              </div>
            ))}
          </div>
        </div>

        {isAdding && (
          <div className="w-full lg:w-[450px] animate-in slide-in-from-right-8 duration-300">
             <div className="bg-[#1A1A1A] text-white p-10 rounded-[60px] shadow-2xl sticky top-8">
                <div className="flex justify-between items-center mb-10">
                   <div>
                      <h3 className="text-2xl font-black italic uppercase tracking-tighter text-brand-accent">{editingId ? 'Modify Entry' : 'Add Entry'}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mt-1">Refining the menu architect</p>
                   </div>
                   <button onClick={resetForm} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all">
                      <X size={24} />
                   </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Display Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Assorted Juices"
                        className="w-full bg-white/5 border border-white/10 rounded-[25px] px-8 py-5 text-lg font-bold outline-none focus:border-brand-accent transition-all"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Base Price (R)</label>
                         <input 
                           type="number" 
                           required
                           className="w-full bg-white/5 border border-white/10 rounded-[25px] px-8 py-5 font-bold outline-none focus:border-brand-accent"
                           value={formData.price}
                           onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">BOH Stock</label>
                         <input 
                           type="number" 
                           required
                           className="w-full bg-white/5 border border-white/10 rounded-[25px] px-8 py-5 font-bold outline-none focus:border-brand-accent"
                           value={formData.stock}
                           onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
                         />
                      </div>
                   </div>

                   <div className="flex items-center gap-6 p-6 bg-white/5 rounded-[30px] border border-white/10">
                      <div className={`w-14 h-8 rounded-full p-1 transition-all flex items-center cursor-pointer ${formData.availableToStaff ? 'bg-emerald-500' : 'bg-slate-700'}`} onClick={() => setFormData({...formData, availableToStaff: !formData.availableToStaff})}>
                         <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${formData.availableToStaff ? 'translate-x-6' : ''}`} />
                      </div>
                      <div>
                         <h4 className="font-black text-white uppercase text-xs italic">Available to Staff</h4>
                         <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Show item in staff allocation mode.</p>
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">Classification</label>
                      <select 
                        className="w-full bg-white/5 border border-white/10 rounded-[25px] px-8 py-5 font-black text-[10px] uppercase tracking-widest outline-none focus:border-brand-accent"
                        value={formData.category}
                        onChange={e => setFormData({...formData, category: e.target.value, isHubbly: e.target.value === 'Hubbly'})}
                      >
                        {categories.map(c => <option key={c} value={c} className="bg-slate-900">{c}</option>)}
                      </select>
                   </div>

                   <div className="space-y-4 pt-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2 flex items-center gap-2">
                        <ListFilter size={12} /> Selection Variants (e.g. orange, still)
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="e.g. Sparkling"
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-brand-accent"
                          value={newVariant}
                          onChange={e => setNewVariant(e.target.value)}
                          onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addVariant())}
                        />
                        <button 
                          type="button" 
                          onClick={addVariant}
                          className="bg-white/10 p-3 rounded-xl hover:bg-brand-accent hover:text-slate-900 transition-all"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.variants.map((v, idx) => (
                          <div key={idx} className="bg-brand-accent/10 border border-brand-accent/20 px-3 py-1.5 rounded-lg flex items-center gap-2">
                            <span className="text-[10px] font-black text-brand-accent uppercase tracking-widest">{v}</span>
                            <button type="button" onClick={() => removeVariant(idx)} className="text-brand-accent/50 hover:text-brand-accent"><X size={12} /></button>
                          </div>
                        ))}
                      </div>
                   </div>

                   <button 
                    type="submit"
                    className="w-full py-7 bg-brand-accent text-slate-900 rounded-[30px] font-black text-xl uppercase tracking-[0.2em] shadow-2xl shadow-brand-accent/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                   >
                     {editingId ? 'Update Record' : 'Commit to Menu'} <Save size={24} />
                   </button>
                </form>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuManagementModule;
