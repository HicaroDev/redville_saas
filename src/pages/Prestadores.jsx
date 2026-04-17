import { useState, useEffect } from 'react';
import { 
  Plus, X, Phone, Mail, FileText, Search, User, Briefcase, Save, Trash2, 
  ChevronRight, Calendar, DollarSign, Users, ExternalLink, Activity,
  ArrowRight, CheckCircle2, AlertCircle, Loader2, Pencil, History
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useProjects } from '../hooks/useData';

function formatCurrency(v) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v || 0);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  // Adiciona T00:00:00 para garantir que o navegador interprete como horário local e não UTC
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR');
}

function getLocalDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function PrestadoresPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedHistory, setExpandedHistory] = useState({});
  const { projects } = useProjects();

  const toggleHistory = (id) => {
    setExpandedHistory(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const [formData, setFormData] = useState({
    name: '',
    document: '',
    phone: '',
    email: '',
    employees: []
  });

  const [contractData, setContractData] = useState({
    id: null,
    provider_id: '',
    project_id: '',
    service_type: 'Empreita',
    description: '',
    total_agreed_value: '',
    start_date: getLocalDate(),
    status: 'ativo',
    contract_url: ''
  });

  const [newEmployee, setNewEmployee] = useState('');

  useEffect(() => {
    fetchProviders();
  }, []);

  async function fetchProviders() {
    setLoading(true);
    const { data: providersData, error: pError } = await supabase
      .from('service_providers')
      .select('*, service_contracts(*, projects(name, code))')
      .order('name');
    
    if (!pError && providersData) {
      // Get all cashbook payments linked to providers
      const { data: payments } = await supabase
        .from('cashbook_entries')
        .select('*, projects(code, name)')
        .not('provider_id', 'is', null) // Only payments to providers
        .order('entry_date', { ascending: false });
      
      const paymentsMap = (payments || []).reduce((acc, p) => {
        // Group totals
        if (p.provider_id) {
          acc.totals.providers[p.provider_id] = (acc.totals.providers[p.provider_id] || 0) + Number(p.expense_amount);
          // Store history
          if (!acc.history[p.provider_id]) acc.history[p.provider_id] = [];
          acc.history[p.provider_id].push(p);
        }
        if (p.contract_id) {
          acc.totals.contracts[p.contract_id] = (acc.totals.contracts[p.contract_id] || 0) + Number(p.expense_amount);
        }
        return acc;
      }, { totals: { providers: {}, contracts: {} }, history: {} });

      setProviders(providersData.map(p => ({
        ...p,
        total_received: paymentsMap.totals.providers[p.id] || 0,
        payments_history: paymentsMap.history[p.id] || [],
        service_contracts: (p.service_contracts || []).map(c => ({
          ...c,
          total_paid: paymentsMap.totals.contracts[c.id] || 0,
          balance: Number(c.total_agreed_value) - (paymentsMap.totals.contracts[c.id] || 0)
        }))
      })));
    }
    setLoading(false);
  }

  const handleSaveProvider = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Sanitize data: pick only table columns
    const { id, name, document, phone, email, employees, status } = formData;
    const cleanData = { name, document, phone, email, employees, status };
    if (id) cleanData.id = id;

    const { error } = await supabase
      .from('service_providers')
      .upsert(cleanData);

    if (!error) {
      setShowModal(false);
      fetchProviders();
      setFormData({ name: '', document: '', phone: '', email: '', employees: [] });
    } else {
      alert('Erro ao salvar prestador: ' + error.message);
    }
    setIsSaving(false);
  };

  const handleSaveContract = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const payload = {
        ...contractData,
        total_agreed_value: parseFloat(contractData.total_agreed_value)
    };
    
    let error;
    if (contractData.id) {
        const { error: err } = await supabase.from('service_contracts').update(payload).eq('id', contractData.id);
        error = err;
    } else {
        const { id, ...newPayload } = payload;
        const { error: err } = await supabase.from('service_contracts').insert(newPayload);
        error = err;
    }

    if (!error) {
      setShowContractModal(false);
      fetchProviders();
      setContractData({ id: null, provider_id: '', project_id: '', service_type: 'Empreita', description: '', total_agreed_value: '', start_date: getLocalDate(), status: 'ativo', contract_url: '' });
    } else {
      alert('Erro: ' + error.message);
    }
    setIsSaving(false);
  };

  const handleDeleteContract = async (id) => {
    if (!confirm('Excluir este contrato permanentemente?')) return;
    const { error } = await supabase.from('service_contracts').delete().eq('id', id);
    if (!error) fetchProviders();
    else alert('Erro ao excluir: ' + error.message);
  };

  const handleUpdateContractStatus = async (id, status) => {
    const { error } = await supabase.from('service_contracts').update({ status }).eq('id', id);
    if (!error) fetchProviders();
  };

  const handleDeleteProvider = async (id) => {
    if (!confirm('Excluir este prestador e todos os seus contratos permanentemente?')) return;
    const { error } = await supabase.from('service_providers').delete().eq('id', id);
    if (!error) fetchProviders();
    else alert('Erro ao excluir prestador: ' + error.message);
  };

  const addEmployee = () => {
    if (newEmployee.trim()) {
      setFormData({ ...formData, employees: [...(formData.employees || []), newEmployee.trim()] });
      setNewEmployee('');
    }
  };

  const removeEmployee = (idx) => {
    const updated = [...formData.employees];
    updated.splice(idx, 1);
    setFormData({ ...formData, employees: updated });
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 space-y-4">
      <div className="w-10 h-10 border-4 border-red-700 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Carregando Prestadores...</p>
    </div>
  );

  const filtered = providers.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100">
             <Briefcase className="w-5 h-5 text-slate-800" />
          </div>
          <div>
            <h1 className="rv-header border-none">Gestão de Prestadores</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 italic">Contratos e Equipes de Campo</p>
          </div>
        </div>
        <button onClick={() => { setFormData({ name: '', document: '', phone: '', email: '', employees: [] }); setShowModal(true); }} className="btn-primary-gradient flex items-center gap-2">
           <Plus className="w-4 h-4" /> Novo Prestador
        </button>
      </header>

      <div className="relative max-w-lg">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
         <input 
            type="text" 
            placeholder="Buscar por nome ou documento..."
            className="form-input pl-11"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
         />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.map(p => (
          <div key={p.id} className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 group hover:border-red-600/20 transition-all">
             <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-red-700 group-hover:text-white transition-all shadow-inner">
                      <User className="w-8 h-8" />
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight">{p.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">{p.document || 'CPF/CNPJ Pendente'}</span>
                         {p.total_received > 0 && <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">Ativo</span>}
                      </div>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Pago</p>
                   <p className="text-xl font-black text-slate-900 leading-none">{formatCurrency(p.total_received)}</p>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:shadow-lg group-hover:shadow-slate-100/50 transition-all">
                   <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-red-700" />
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Colaboradores</span>
                   </div>
                   <p className="text-lg font-bold text-slate-800">{p.employees?.length || 0} <span className="text-xs font-medium text-slate-400">nomes</span></p>
                </div>
                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:shadow-lg group-hover:shadow-slate-100/50 transition-all">
                   <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-amber-500" />
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Contratos</span>
                   </div>
                   <p className="text-lg font-bold text-slate-800">{p.service_contracts?.length || 0} <span className="text-xs font-medium text-slate-400">ativos</span></p>
                </div>
             </div>

             <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] italic">Dossiê de Contratos</h4>
                   <button 
                    onClick={() => {
                        setContractData({ id: null, provider_id: p.id, project_id: '', service_type: 'Empreita', description: '', total_agreed_value: '', start_date: getLocalDate(), status: 'ativo', contract_url: '' });
                        setShowContractModal(true);
                    }}
                    className="flex items-center gap-1.5 text-[10px] text-red-700 font-bold uppercase hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all"
                   >
                       <Plus className="w-3.5 h-3.5" /> Adicionar Contrato
                   </button>
                </div>
                
                {p.service_contracts?.length === 0 ? (
                   <div className="py-8 text-center bg-slate-50/30 rounded-[1.5rem] border border-dashed border-slate-100">
                      <p className="text-xs text-slate-400 font-medium italic">Nenhum contrato ativo para este prestador.</p>
                   </div>
                ) : (
                  <div className="space-y-3">
                    {p.service_contracts.map(c => (
                      <div key={c.id} className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-red-600/10 transition-all group/card">
                         <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                               <div className="flex items-center gap-2 mb-1">
                                  <p className="text-sm font-bold text-slate-800">
                                     {c.description || 'Contrato de Serviço'}
                                  </p>
                                  <span className={`px-2 py-0.5 text-[8px] font-bold rounded uppercase tracking-tighter ${
                                      c.status === 'concluído' ? 'bg-emerald-100 text-emerald-700' :
                                      c.status === 'cancelado' ? 'bg-red-100 text-red-700' :
                                      'bg-amber-100 text-amber-700'
                                  }`}>
                                      {c.status || 'ativo'}
                                  </span>
                               </div>
                               <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 grayscale group-hover/card:grayscale-0 transition-all">
                                  <Briefcase className="w-2.5 h-2.5" />
                                  {c.projects?.name} ({c.projects?.code}) • <span className="uppercase">{c.service_type}</span>
                               </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                               <span className="text-xs font-black text-slate-900">{formatCurrency(c.total_agreed_value)}</span>
                               <div className="flex gap-1">
                                  {c.contract_url && (
                                      <a href={c.contract_url} target="_blank" rel="noreferrer" className="p-1 text-slate-400 hover:text-indigo-600 transition-colors">
                                         <ExternalLink className="w-3 h-3" />
                                      </a>
                                  )}
                                  <button onClick={() => {
                                      setContractData({
                                          id: c.id,
                                          provider_id: c.provider_id,
                                          project_id: c.project_id,
                                          service_type: c.service_type,
                                          description: c.description,
                                          total_agreed_value: c.total_agreed_value,
                                          start_date: c.start_date,
                                          status: c.status || 'ativo',
                                          contract_url: c.contract_url || ''
                                      });
                                      setShowContractModal(true);
                                  }} className="p-1 text-slate-400 hover:text-amber-600 transition-colors"><Pencil className="w-3 h-3" /></button>
                                  <button onClick={() => handleDeleteContract(c.id)} className="p-1 text-slate-400 hover:text-red-700 transition-colors"><Trash2 className="w-3 h-3" /></button>
                               </div>
                            </div>
                         </div>
                         
                         <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex-1">
                               <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Pago</span>
                                  {c.service_type === 'Empreita' && (
                                     <span className="text-[9px] font-bold text-slate-800">{Math.round((c.total_paid / c.total_agreed_value) * 100)}% concluído</span>
                                  )}
                               </div>
                               {c.service_type === 'Empreita' ? (
                                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                                     <div className={`h-full rounded-full transition-all duration-1000 ${c.status === 'cancelado' ? 'bg-slate-300' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, (c.total_paid / c.total_agreed_value) * 100)}%` }} />
                                  </div>
                               ) : (
                                  <p className="text-sm font-bold text-emerald-600">{formatCurrency(c.total_paid)}</p>
                               )}
                            </div>
                            <div className="pl-6 text-right">
                               <p className={`text-[11px] font-bold ${c.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{formatCurrency(c.balance)}</p>
                               <p className="text-[8px] font-bold text-slate-300 uppercase">A Pagar</p>
                            </div>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>

             {/* Payment History Section */}
             <div className="mt-8 border-t border-slate-50 pt-6">
                <button 
                  onClick={() => toggleHistory(p.id)}
                  className="flex items-center justify-between w-full group/hist transition-all"
                >
                   <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] italic flex items-center gap-2">
                       <History className="w-3.5 h-3.5" /> Histórico Financeiro
                   </h4>
                   <ChevronRight className={`w-4 h-4 text-slate-300 transition-transform ${expandedHistory[p.id] ? 'rotate-90 text-red-700' : ''}`} />
                </button>

                {expandedHistory[p.id] && (
                   <div className="mt-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
                      {p.payments_history?.length === 0 ? (
                         <p className="text-[10px] text-slate-400 italic py-2">Sem histórico de pagamentos.</p>
                      ) : (
                         <div className="bg-slate-50/50 rounded-2xl overflow-hidden border border-slate-100">
                            <table className="w-full text-[10px]">
                               <thead className="bg-slate-100/50 text-slate-400 uppercase font-black tracking-tighter">
                                  <tr>
                                     <th className="py-2 px-3 text-left">Data</th>
                                     <th className="py-2 px-3 text-left">Referência / Obra</th>
                                     <th className="py-2 px-3 text-right">Valor</th>
                                  </tr>
                               </thead>
                               <tbody className="divide-y divide-slate-100">
                                  {p.payments_history.map(pay => (
                                     <tr key={pay.id} className="hover:bg-white transition-colors">
                                        <td className="py-2.5 px-3 font-medium text-slate-500">{formatDate(pay.entry_date)}</td>
                                        <td className="py-2.5 px-3">
                                           <p className="font-bold text-slate-700 truncate max-w-[120px]">{pay.description}</p>
                                           <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">{pay.projects?.code}</p>
                                        </td>
                                        <td className="py-2.5 px-3 text-right font-black text-red-600">{formatCurrency(pay.expense_amount)}</td>
                                     </tr>
                                  ))}
                               </tbody>
                            </table>
                         </div>
                      )}
                   </div>
                )}
             </div>

             <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all" title="Ligar"><Phone className="w-4 h-4" /></button>
                   <button className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all" title="Email"><Mail className="w-4 h-4" /></button>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => handleDeleteProvider(p.id)} className="p-2.5 text-slate-300 hover:text-red-700 transition-all" title="Excluir Prestador"><Trash2 className="w-4 h-4" /></button>
                    <button onClick={() => { setFormData(p); setShowModal(true); }} className="px-6 py-2.5 bg-slate-900 hover:bg-red-700 text-white text-[10px] font-bold rounded-xl transition-all uppercase tracking-[0.2em] shadow-lg shadow-slate-100">Configurar</button>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Modal Prestador */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8">
                 <button onClick={() => setShowModal(false)} className="p-3 hover:bg-slate-100 rounded-full transition-all group">
                    <X className="w-6 h-6 text-slate-400 group-hover:text-slate-900" />
                 </button>
              </div>
              
              <div className="p-12">
                 <div className="flex items-center gap-4 mb-10">
                    <div className="w-14 h-14 bg-red-700 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-red-100">
                       <User className="w-7 h-7" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Ficha do Prestador</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 italic">Dados Cadastrais e Equipe Direta</p>
                    </div>
                 </div>

                 <form onSubmit={handleSaveProvider} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2 md:col-span-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 italic">Nome / Razão Social</label>
                          <input type="text" required className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 italic">Documento (CPF/CNPJ)</label>
                          <input type="text" className="form-input" value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 italic">Telefone Celular</label>
                          <input type="text" className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                       </div>
                    </div>

                    <div className="space-y-4 pt-8 border-t border-slate-50">
                       <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                           <Users className="w-3.5 h-3.5" /> Equipe de Campo
                       </h4>
                       <div className="flex gap-2">
                          <input 
                            type="text" 
                            className="form-input flex-1" 
                            placeholder="Adicionar nome do funcionário..." 
                            value={newEmployee}
                            onChange={e => setNewEmployee(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addEmployee())}
                          />
                          <button type="button" onClick={addEmployee} className="px-6 bg-slate-900 hover:bg-red-700 text-white font-bold text-[10px] rounded-xl uppercase tracking-widest transition-all">Add</button>
                       </div>
                       <div className="flex flex-wrap gap-2 pt-2">
                          {formData.employees?.map((emp, i) => (
                             <span key={i} className="px-4 py-2 bg-slate-50 text-slate-700 text-[10px] font-bold rounded-xl flex items-center gap-2 group hover:bg-red-50 hover:text-red-700 transition-all border border-slate-100">
                                {emp}
                                <button type="button" onClick={() => removeEmployee(i)} className="text-slate-300 group-hover:text-red-700"><X className="w-3 h-3" /></button>
                             </span>
                          ))}
                          {formData.employees?.length === 0 && <p className="text-[10px] text-slate-300 font-bold italic">Nenhum funcionário vinculado.</p>}
                       </div>
                    </div>

                    <div className="flex gap-4 pt-10">
                       <button type="button" onClick={() => setShowModal(false)} className="px-8 py-4 font-bold text-slate-400 text-xs uppercase tracking-widest">Fechar</button>
                       <button type="submit" disabled={isSaving} className="flex-1 btn-primary-gradient py-4 flex items-center justify-center gap-3 rounded-2xl shadow-xl shadow-red-100 text-xs font-bold uppercase tracking-[0.2em]">
                          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                          Salvar Registro
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}

      {/* Modal Contrato */}
      {showContractModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl overflow-hidden relative">
              <div className="p-10">
                 <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                       <FileText className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="text-xl font-bold text-slate-800 tracking-tight">{contractData.id ? 'Editar Contrato' : 'Vincular Novo Contrato'}</h3>
                       <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Gerar Compromisso Financeiro</p>
                    </div>
                 </div>

                 <form onSubmit={handleSaveContract} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic">Obra de Destino</label>
                          <select required className="form-input" value={contractData.project_id} onChange={e => setContractData({...contractData, project_id: e.target.value})}>
                             <option value="">Selecione a Obra...</option>
                             {projects.map(p => <option key={p.id} value={p.id}>{p.code} - {p.name}</option>)}
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic">Status Atual</label>
                          <select className="form-input font-bold" value={contractData.status} onChange={e => setContractData({...contractData, status: e.target.value})}>
                             <option value="ativo">🟡 Ativo / Em Andamento</option>
                             <option value="concluído">🟢 Concluído / Finalizado</option>
                             <option value="cancelado">🔴 Cancelado / Suspenso</option>
                          </select>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic">Tipo de Serviço</label>
                          <select className="form-input" value={contractData.service_type} onChange={e => setContractData({...contractData, service_type: e.target.value})}>
                             <option value="Empreita">Empreita Global</option>
                             <option value="Serviço">Mão de Obra / Dia</option>
                             <option value="M2">Metragem (M²)</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic">Valor Acordado (R$)</label>
                          <input type="number" step="0.01" required className="form-input font-bold" value={contractData.total_agreed_value} onChange={e => setContractData({...contractData, total_agreed_value: e.target.value})} placeholder="0,00" />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic">Descrição do Escopo</label>
                       <input type="text" required className="form-input" value={contractData.description} onChange={e => setContractData({...contractData, description: e.target.value})} placeholder="Ex: Pintura externa galpão..." />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic">Link do Documento / Anexo (URL)</label>
                       <input type="url" className="form-input" value={contractData.contract_url} onChange={e => setContractData({...contractData, contract_url: e.target.value})} placeholder="https://exemplo.com/contrato.pdf" />
                    </div>

                    <div className="flex gap-4 pt-6">
                       <button type="button" onClick={() => setShowContractModal(false)} className="flex-1 py-4 font-bold text-slate-400 text-xs uppercase tracking-widest">Cancelar</button>
                       <button type="submit" disabled={isSaving} className="flex-1 bg-slate-900 text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-slate-100">
                          {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirmar Vínculo'}
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
