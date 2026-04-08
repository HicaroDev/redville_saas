import { useState } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, RefreshCcw, Landmark, User, History, Plus, X, Save } from 'lucide-react';
import { useWallets, createWallet, useCashbook } from '../hooks/useData';

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

export default function CentrosCustoPage() {
  const { wallets, loading: loadingW, refetch } = useWallets();
  const { entries } = useCashbook('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newWallet, setNewWallet] = useState({ name: '', type: 'outros' });
  const [isSaving, setIsSaving] = useState(false);

  if (loadingW) {
    return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-red-700 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const getWalletBalance = (walletId) => {
    return entries
      .filter(e => e.wallet_id === walletId)
      .reduce((acc, current) => acc + (Number(current.income_amount) || 0) - (Number(current.expense_amount) || 0), 0);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const { error } = await createWallet(newWallet);
    if (!error) {
       setShowCreate(false);
       setNewWallet({ name: '', type: 'outros' });
       refetch();
    } else {
       alert('Erro ao criar carteira: ' + error.message);
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="rv-header">Carteiras Financeiras</h1>
          <p className="text-sm text-slate-500 font-medium italic mt-1">Gestão de fluxos entre Obra, Sócios e Construtora</p>
        </div>
        <button 
           onClick={() => setShowCreate(true)}
           className="btn-primary-gradient flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Nova Carteira
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {wallets.length === 0 && (
           <div className="col-span-3 py-16 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center">
              <p className="rv-label uppercase tracking-widest italic opacity-40">Nenhuma carteira cadastrada</p>
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
                  <span className="rv-label text-[9px]">{w.type}</span>
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

      {showCreate && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
               <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">Nova Carteira</h3>
                  <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-slate-50 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
               </div>
               <form onSubmit={handleCreate} className="p-6 space-y-4">
                  <div className="space-y-1">
                     <label className="rv-label px-1">Nome da Carteira</label>
                     <input 
                        type="text" 
                        required 
                        className="form-input" 
                        placeholder="Ex: Carteira do Dono" 
                        value={newWallet.name}
                        onChange={e => setNewWallet({...newWallet, name: e.target.value})}
                     />
                  </div>
                  <div className="space-y-1">
                     <label className="rv-label px-1">Categoria</label>
                     <select 
                        className="form-input"
                        value={newWallet.type}
                        onChange={e => setNewWallet({...newWallet, type: e.target.value})}
                     >
                        <option value="dono">Dono / Sócio</option>
                        <option value="empresa">Empresa / Sede</option>
                        <option value="obra">Obra / Local</option>
                        <option value="outros">Outros</option>
                     </select>
                  </div>
                  <div className="flex gap-4 pt-4 border-t border-slate-50">
                     <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-3 font-semibold text-slate-400 text-sm">Cancelar</button>
                     <button type="submit" disabled={isSaving} className="flex-1 btn-primary-gradient flex items-center justify-center gap-2">
                        {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        Criar Carteira
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}
