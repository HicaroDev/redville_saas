import { useState } from 'react';
import { Plus, X, Calendar, DollarSign, Wallet, User as UserIcon, Save, History, Pencil, Trash2 } from 'lucide-react';
import { useProjects, useWallets, useDirectory, createCashbookEntry, updateCashbookEntry, deleteCashbookEntry, useCashbook } from '../hooks/useData';

const PAYMENT_METHODS = ['PIX', 'Boleto', 'Cartão', 'Transferência', 'Dinheiro'];

function formatCurrency(value) {
  if (value == null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export default function LancamentosPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterProject, setFilterProject] = useState('all');

  const { projects } = useProjects();
  const { wallets } = useWallets();
  const { items: suppliers } = useDirectory('fornecedor');
  const { items: providers } = useDirectory('prestador');
  const { entries, refetch } = useCashbook(filterProject);

  const allPayees = [...suppliers, ...providers];

  const [formData, setFormData] = useState({
    project_id: '',
    description: '',
    entry_date: new Date().toISOString().split('T')[0],
    amount: '',
    payment_method: 'PIX',
    wallet_id: '',
    payee_name: '',
    category: 'despesa',
  });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.project_id || !formData.description || !formData.amount) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    setIsSubmitting(true);
    const entryData = {
      project_id: formData.project_id,
      description: formData.description,
      entry_date: formData.entry_date,
      expense_amount: formData.category === 'despesa' ? parseFloat(formData.amount) : 0,
      income_amount: formData.category === 'receita' ? parseFloat(formData.amount) : 0,
      payment_method: formData.payment_method,
      wallet_id: formData.wallet_id || null,
      expense_source: formData.category === 'despesa' ? formData.payee_name : null,
      income_source: formData.category === 'receita' ? formData.payee_name : null,
    };

    const { error } = editingEntry 
      ? await updateCashbookEntry(editingEntry.id, entryData)
      : await createCashbookEntry(entryData);

    if (!error) {
       setShowForm(false);
       setEditingEntry(null);
       setFormData({ project_id: '', description: '', entry_date: new Date().toISOString().split('T')[0], amount: '', payment_method: 'PIX', wallet_id: '', payee_name: '', category: 'despesa' });
       refetch();
    } else {
       alert("Erro ao salvar: " + error.message);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este lançamento?')) return;
    const { error } = await deleteCashbookEntry(id);
    if (!error) refetch();
    else alert('Erro ao excluir: ' + error.message);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="rv-header border-none">Fluxo de Caixa</h1>
          <p className="text-sm text-slate-500 font-medium italic">Gestão profissional de entradas e saídas</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingEntry(null); }} className="btn-primary-gradient flex items-center gap-2">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          Novo Lançamento
        </button>
      </header>

      {(showForm || editingEntry) && (
        <form onSubmit={handleSave} className="rv-card space-y-6 animate-in slide-in-from-top duration-300">
           <div className="flex items-center justify-between border-b border-slate-50 pb-4">
              <h3 className="font-bold text-slate-800">{editingEntry ? 'Editar Lançamento' : 'Novo Lançamento'}</h3>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button type="button" onClick={() => setFormData({...formData, category: 'despesa'})} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${formData.category === 'despesa' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-400'}`}>Despesa</button>
                <button type="button" onClick={() => setFormData({...formData, category: 'receita'})} className={`px-4 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all ${formData.category === 'receita' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>Receita</button>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FormField label="Obra Destino">
                 <select className="form-input" value={formData.project_id} onChange={e => setFormData({...formData, project_id: e.target.value})} required>
                    <option value="">Selecione...</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.code} – {p.name}</option>)}
                 </select>
              </FormField>
              <FormField label="O que está pagando?">
                 <input type="text" className="form-input" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required placeholder="Ex: Cimento, Cal, Mão de obra..." />
              </FormField>
              <FormField label="Favorecido">
                 <select className="form-input" value={formData.payee_name} onChange={e => setFormData({...formData, payee_name: e.target.value})}>
                    <option value="">Selecione da Base...</option>
                    {allPayees.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
                 </select>
              </FormField>
              <FormField label="Valor Total (R$)">
                 <input type="number" step="0.01" className="form-input" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} required />
              </FormField>
              <FormField label="Pago Por (Carteira)">
                 <select className="form-input" value={formData.wallet_id} onChange={e => setFormData({...formData, wallet_id: e.target.value})} required>
                    <option value="">Escolha a Carteira...</option>
                    {wallets.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                 </select>
              </FormField>
              <FormField label="Forma">
                 <select className="form-input" value={formData.payment_method} onChange={e => setFormData({...formData, payment_method: e.target.value})}>
                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                 </select>
              </FormField>
              <FormField label="Data do Lançamento">
                 <input type="date" className="form-input" value={formData.entry_date} onChange={e => setFormData({...formData, entry_date: e.target.value})} />
              </FormField>
           </div>

           <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => { setShowForm(false); setEditingEntry(null); }} className="px-5 py-2 font-semibold text-slate-400 text-sm">Cancelar</button>
              <button type="submit" disabled={isSubmitting} className="btn-primary-gradient flex items-center gap-2">
                 {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                 Confirmar {editingEntry ? 'Alteração' : 'Lançamento'}
              </button>
           </div>
        </form>
      )}

      <div className="rv-card p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/10">
           <h3 className="rv-label flex items-center gap-2 italic">
              <History className="w-4 h-4 text-slate-300" /> Fluxo Detalhado
           </h3>
           <select className="text-[10px] font-bold bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none" value={filterProject} onChange={e => setFilterProject(e.target.value)}>
              <option value="all">Filtro: Todas Obras</option>
              {projects.map(p => <option key={p.id} value={p.code}>{p.code}</option>)}
           </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50/30">
                <th className="text-left rv-label py-3 px-6">Data</th>
                <th className="text-left rv-label py-3 px-4">Obra</th>
                <th className="text-left rv-label py-3 px-4">Histórico / Carteira</th>
                <th className="text-left rv-label py-3 px-4">Forma</th>
                <th className="text-right rv-label py-3 px-6">Valor</th>
                <th className="text-right rv-label py-3 px-6">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {entries.map(entry => {
                const isExpense = entry.expense_amount > 0;
                return (
                  <tr key={entry.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-3 px-6 text-slate-400 font-medium">{new Date(entry.entry_date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-bold text-slate-700">{entry.projects?.code || '—'}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{entry.description}</p>
                      <p className="text-[9px] text-slate-400 uppercase tracking-tighter">
                        {entry.expense_source || entry.income_source || '—'} • {entry.wallets?.name || 'Sem Carteira'}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{entry.payment_method}</td>
                    <td className={`py-3 px-6 text-right font-bold ${isExpense ? 'text-red-600' : 'text-emerald-600'}`}>
                      {isExpense ? `- ${formatCurrency(entry.expense_amount)}` : `+ ${formatCurrency(entry.income_amount)}`}
                    </td>
                    <td className="py-3 px-6 text-right">
                       <div className="flex items-center justify-end gap-1">
                          <button onClick={() => {
                            setEditingEntry(entry);
                            setFormData({
                              project_id: entry.project_id,
                              description: entry.description,
                              entry_date: entry.entry_date,
                              amount: isExpense ? entry.expense_amount : entry.income_amount,
                              payment_method: entry.payment_method,
                              wallet_id: entry.wallet_id || '',
                              payee_name: isExpense ? entry.expense_source : entry.income_source,
                              category: isExpense ? 'despesa' : 'receita'
                            });
                          }} className="p-1.5 text-slate-300 hover:text-amber-600 rounded-lg transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => handleDelete(entry.id)} className="p-1.5 text-slate-300 hover:text-red-700 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="rv-label px-1">{label}</label>
      {children}
    </div>
  );
}
