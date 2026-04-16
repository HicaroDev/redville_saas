import { useState, useEffect } from 'react';
import { Plus, X, Phone, Mail, FileText, Search, User, Briefcase, Truck, Save, Trash2, Pencil, Calendar, DollarSign, CreditCard } from 'lucide-react';
import { useDirectory, createDirectoryItem, updateDirectoryItem, deleteDirectoryItem } from '../hooks/useData';

const CATEGORY_MAP = {
  fornecedores: { label: 'Fornecedores', icon: Truck, db: 'fornecedor' },
  prestadores: { label: 'Prestadores de Serviço', icon: Briefcase, db: 'prestador' },
  funcionarios: { label: 'Funcionários / Equipe', icon: User, db: 'funcionario' },
  materiais: { label: 'Materiais / Materiais', icon: FileText, db: 'material' },
};

function formatCurrency(value) {
  if (value == null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export default function CadastroGeral({ type = 'fornecedores' }) {
  const config = CATEGORY_MAP[type] || CATEGORY_MAP.fornecedores;
  const { items, loading, refetch } = useDirectory(config.db);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    document: '',
    phone: '',
    email: '',
    category: config.db,
    unit: '',
    pix_key: '',
    bank_name: '',
    bank_agency: '',
    bank_account: '',
    rg: '',
    birth_date: '',
    role: '',
    salary: '',
    hire_date: ''
  });

  useEffect(() => {
    setFormData({
      name: '',
      document: '',
      phone: '',
      email: '',
      category: config.db,
      unit: '',
      pix_key: '',
      bank_name: '',
      bank_agency: '',
      bank_account: '',
      rg: '',
      birth_date: '',
      role: '',
      salary: '',
      hire_date: ''
    });
  }, [type, config.db]);

  const handleEdit = (item) => {
    setFormData({
      ...item,
      pix_key: item.pix_key || '',
      bank_name: item.bank_name || '',
      bank_agency: item.bank_agency || '',
      bank_account: item.bank_account || '',
      rg: item.rg || '',
      birth_date: item.birth_date || '',
      role: item.role || '',
      salary: item.salary || '',
      hire_date: item.hire_date || '',
      unit: item.unit || ''
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const cleanData = { ...formData };
    if (!cleanData.birth_date) cleanData.birth_date = null;
    if (!cleanData.hire_date) cleanData.hire_date = null;
    if (!cleanData.salary || cleanData.salary === '') cleanData.salary = null;

    const { error } = formData.id 
      ? await updateDirectoryItem(formData.id, cleanData)
      : await createDirectoryItem(cleanData);

    if (!error) {
      setShowModal(false);
      refetch();
    } else {
      alert('Erro ao salvar: ' + error.message);
    }
    setIsSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Excluir este registro permanentemente?')) return;
    const { error } = await deleteDirectoryItem(id);
    if (!error) refetch();
    else alert('Erro ao excluir: ' + error.message);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 space-y-4">
      <div className="w-10 h-10 border-4 border-red-700 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Carregando {config.label}...</p>
    </div>
  );

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.document?.includes(searchTerm)
  );

  const IconHeader = config.icon;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100">
             <IconHeader className="w-5 h-5 text-slate-800" />
          </div>
          <div>
            <h1 className="rv-header border-none">{config.label}</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 italic text-left">Redville Directory</p>
          </div>
        </div>
        <button onClick={() => { setShowModal(true); }} className="btn-primary-gradient flex items-center gap-2">
           <Plus className="w-4 h-4" /> Novo Registro
        </button>
      </header>

      <div className="relative group max-w-lg">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-red-700 transition-colors" />
         <input 
            type="text" 
            placeholder={`Buscar na base de ${config.label.toLowerCase()}...`}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm font-medium text-slate-700 outline-none focus:border-red-600/30 transition-all text-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
         />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredItems.length === 0 && (
           <div className="col-span-full py-24 text-center bg-slate-50/50 rounded-[2.5rem] border border-dashed border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] italic mb-2">Nenhum registro encontrado</p>
              <p className="text-[10px] text-slate-300">Tente buscar por outro termo ou cadastre um novo registro.</p>
           </div>
        )}
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 group hover:border-red-600/20 transition-all duration-300 flex flex-col">
             <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-red-700 group-hover:text-white transition-all duration-300 shadow-inner">
                   <IconHeader className="w-6 h-6" />
                </div>
                <div className="flex gap-1">
                    <button onClick={() => handleEdit(item)} className="p-2 text-slate-200 hover:text-amber-500 transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-200 hover:text-red-700 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
             </div>
             
             <div className="flex-1 mb-6">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-1">{item.name}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {config.db === 'material' ? `Unidade: ${item.unit || '—'}` : (item.document || 'Sem Documento')}
                </p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                    {item.role && <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded uppercase">{item.role}</span>}
                    {item.pix_key && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded uppercase">PIX Ativo</span>}
                </div>
             </div>
             
             {config.db !== 'material' && (
                <div className="space-y-3 pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300"><Phone className="w-3.5 h-3.5" /></div>
                    <span className="text-xs font-semibold text-slate-500">{item.phone || '—'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300"><Mail className="w-3.5 h-3.5" /></div>
                    <span className="text-xs font-semibold text-slate-500 truncate max-w-[180px]">{item.email || '—'}</span>
                    </div>
                    {item.salary > 0 && (
                        <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300"><DollarSign className="w-3.5 h-3.5" /></div>
                        <span className="text-xs font-bold text-slate-900">{formatCurrency(item.salary)}</span>
                        </div>
                    )}
                </div>
             )}
          </div>
        ))}
      </div>

      {showModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl my-8 overflow-hidden animate-in zoom-in-95 duration-200">
               <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-red-700">
                        <IconHeader className="w-6 h-6" />
                     </div>
                     <div>
                        <h3 className="text-xl font-bold text-slate-800 tracking-tight">{formData.id ? 'Editar Cadastro' : 'Novo Cadastro'}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 italic">{config.label}</p>
                     </div>
                  </div>
                  <button onClick={() => setShowModal(false)} className="w-10 h-10 hover:bg-white hover:shadow-md rounded-2xl transition-all flex items-center justify-center"><X className="w-5 h-5 text-slate-400" /></button>
               </div>

               <form onSubmit={handleSave} className="p-10 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2 md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic px-1">Nome Completo / Material</label>
                        <input type="text" required placeholder="Ex: Cimento CP-II ou João da Silva" className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                     </div>

                     {config.db === 'material' ? (
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic px-1">Unidade de Medida</label>
                            <input type="text" required placeholder="Ex: m2, kg, un, m3..." className="form-input font-bold text-red-700 italic" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} />
                        </div>
                     ) : (
                        <>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic px-1">Documento (CPF / CNPJ)</label>
                                <input type="text" placeholder="000.000.000-00" className="form-input" value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic px-1">Telefone / WhatsApp</label>
                                <input type="text" placeholder="(00) 00000-0000" className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic px-1">Email Principal</label>
                                <input type="email" placeholder="email@exemplo.com" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                        </>
                     )}

                     {config.db === 'fornecedor' && (
                        <div className="col-span-full pt-6 space-y-6 border-t border-slate-100">
                           <div className="flex items-center gap-3">
                              <CreditCard className="w-4 h-4 text-emerald-600" />
                              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Dados Bancários & PIX</h4>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2 md:col-span-2">
                                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic px-1">Chave PIX</label>
                                 <input type="text" placeholder="CPF, Email, Celular ou Chave Aleatória" className="form-input font-medium text-emerald-600" value={formData.pix_key} onChange={e => setFormData({...formData, pix_key: e.target.value})} />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic px-1">Banco</label>
                                 <input type="text" placeholder="Ex: Nubank, Itaú..." className="form-input" value={formData.bank_name} onChange={e => setFormData({...formData, bank_name: e.target.value})} />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic px-1">Agência</label>
                                    <input type="text" placeholder="0001" className="form-input" value={formData.bank_agency} onChange={e => setFormData({...formData, bank_agency: e.target.value})} />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic px-1">Conta</label>
                                    <input type="text" placeholder="000000-0" className="form-input" value={formData.bank_account} onChange={e => setFormData({...formData, bank_account: e.target.value})} />
                                 </div>
                              </div>
                           </div>
                        </div>
                     )}

                     {config.db === 'funcionario' && (
                        <div className="col-span-full pt-6 space-y-6 border-t border-slate-100">
                           <div className="flex items-center gap-3">
                              <UserIcon className="w-4 h-4 text-indigo-600" />
                              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">Dados Profissionais & Pessoais</h4>
                           </div>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic px-1">RG</label>
                                 <input type="text" placeholder="0.000.000" className="form-input" value={formData.rg} onChange={e => setFormData({...formData, rg: e.target.value})} />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic px-1">Data de Nascimento</label>
                                 <input type="date" className="form-input" value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic px-1">Cargo / Função</label>
                                 <input type="text" placeholder="Ex: Mestre de Obras, Pintor..." className="form-input" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic px-1">Salário / Remuneração</label>
                                 <input type="number" step="0.01" placeholder="0,00" className="form-input font-bold" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic px-1">Data de Contratação</label>
                                 <input type="date" className="form-input" value={formData.hire_date} onChange={e => setFormData({...formData, hire_date: e.target.value})} />
                              </div>
                           </div>
                        </div>
                     )}
                  </div>

                  <div className="flex gap-4 pt-10 border-t border-slate-50">
                     <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 font-bold text-slate-400 text-xs uppercase tracking-widest">Cancelar</button>
                     <button type="submit" disabled={isSaving} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl shadow-slate-200 flex items-center justify-center gap-2 hover:bg-red-700 transition-all">
                        {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        {formData.id ? 'Salvar Alterações' : 'Finalizar Cadastro'}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}

function UserIcon({ className }) {
    return <User className={className} />;
}
