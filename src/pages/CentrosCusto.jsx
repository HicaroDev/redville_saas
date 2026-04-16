import { useState } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, RefreshCcw, Landmark, User, History, Plus, X, Save, Edit3 } from 'lucide-react';
import { useWallets, createWallet, updateWallet, useCashbook } from '../hooks/useData';

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

export default function CentrosCustoPage() {
  const { wallets, loading: loadingW, refetch } = useWallets();
  const { entries } = useCashbook('all');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', type: 'outros' });
  const [isSaving, setIsSaving] = useState(false);

  if (loadingW) {
    return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-red-700 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const getWalletBalance = (walletId) => {
    return entries
      .filter(e => e.wallet_id === walletId)
      .reduce((acc, current) => acc + (Number(current.income_amount) || 0) - (Number(current.expense_amount) || 0), 0);
  };

  const handleOpenEdit = (wallet) => {
    setEditingId(wallet.id);
    setFormData({ name: wallet.name, type: wallet.type });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ name: '', type: 'outros' });
    setIsEditing(false);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const { error } = isEditing 
      ? await updateWallet(editingId, formData)
      : await createWallet(formData);

    if (!error) {
       setShowForm(false);
       setFormData({ name: '', type: 'outros' });
       refetch();
    } else {
       alert('Erro ao salvar centro de custo: ' + error.message);
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="rv-header">Centros de Custo</h1>
          <p className="text-sm text-slate-500 font-medium italic mt-1">Gestão de fluxos entre Obra, Sócios e Construtora</p>
        </div>
        <button 
           onClick={handleOpenCreate}
           className="btn-primary-gradient flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Centro
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {wallets.length === 0 && (
           <div className="col-span-3 py-16 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center">
              <p className="rv-label uppercase tracking-widest italic opacity-40">Nenhum centro de custo cadastrado</p>
           </div>
        )}
        {wallets.map((w) => {
          const balance = getWalletBalance(w.id);
          const isNegative = balance < 0;
          return (
            <div key={w.id} className="rv-card group hover:border-red-600/30 transition-all duration-300">
               <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-red-700 group-hover:text-white transition-colors`}>
                    <Landmark className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rv-label text-[9px]">{w.type}</span>
                    <button 
                      onClick={() => handleOpenEdit(w)}
                      className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-700 transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
               </div>
               <div>
                  <p className="text-sm font-medium text-slate-600">{w.name}</p>
                  <p className={`text-xl font-bold mt-1 ${isNegative ? 'text-red-600' : 'text-slate-900'}`}>
                    {formatCurrency(balance)}
                  </p>
               </div>
               <div className="pt-4 mt-4 border-t border-slate-50 flex items-center gap-2">
                  {isNegative ? (
                    <span className="text-[9px] text-red-600 font-bold uppercase tracking-wider opacity-70">Dívida / Saída</span>
                  ) : (
                    <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider opacity-70">Saldo Positivo</span>
                  )}
               </div>
            </div>
          );
        })}
      </div>

      {showForm && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
               <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">{isEditing ? 'Editar Centro de Custo' : 'Novo Centro de Custo'}</h3>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-50 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
               </div>
               <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="space-y-1">
                     <label className="rv-label px-1">Nome</label>
                     <input 
                        type="text" 
                        required 
                        className="form-input" 
                        placeholder="Ex: Administração Central" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                     />
                  </div>
                  <div className="space-y-1">
                     <label className="rv-label px-1">Categoria</label>
                     <select 
                        className="form-input"
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value})}
                     >
                        <option value="dono">Dono / Sócio</option>
                        <option value="empresa">Empresa / Sede</option>
                        <option value="obra">Obra / Local</option>
                        <option value="outros">Outros</option>
                     </select>
                  </div>
                  <div className="flex gap-4 pt-4 border-t border-slate-50">
                     <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 font-semibold text-slate-400 text-sm">Cancelar</button>
                     <button type="submit" disabled={isSaving} className="flex-1 btn-primary-gradient flex items-center justify-center gap-2">
                        {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        {isEditing ? 'Salvar Edição' : 'Criar Centro'}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}
