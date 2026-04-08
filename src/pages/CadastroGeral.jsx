import { useState, useEffect } from 'react';
import { Plus, X, Phone, Mail, FileText, Search, User, Briefcase, Truck, Save, Trash2 } from 'lucide-react';
import { useDirectory, createDirectoryItem } from '../hooks/useData';

const CATEGORY_MAP = {
  fornecedores: { label: 'Fornecedores', icon: Truck, db: 'fornecedor' },
  prestadores: { label: 'Prestadores de Serviço', icon: Briefcase, db: 'prestador' },
  funcionarios: { label: 'Funcionários / Equipe', icon: User, db: 'funcionario' },
  materiais: { label: 'Materiais / Materiais', icon: FileText, db: 'material' },
};

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
    category: config.db
  });

  // Reset form when type changes
  useEffect(() => {
    setFormData({
      name: '',
      document: '',
      phone: '',
      email: '',
      category: config.db
    });
  }, [type, config.db]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const { error } = await createDirectoryItem(formData);
    if (!error) {
      setShowModal(false);
      setFormData({ name: '', document: '', phone: '', email: '', category: config.db });
      refetch();
    } else {
      alert('Erro ao salvar: ' + error.message);
    }
    setIsSaving(false);
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-red-700 border-t-transparent rounded-full animate-spin"></div></div>;

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.document?.includes(searchTerm)
  );

  const IconHeader = config.icon;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100">
             <IconHeader className="w-5 h-5 text-slate-800" />
          </div>
          <div>
            <h1 className="rv-header">{config.label}</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 italic">Redville Directory</p>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary-gradient flex items-center gap-2">
           <Plus className="w-4 h-4" /> Novo Registro
        </button>
      </header>

      <div className="relative group max-w-lg">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
         <input 
            type="text" 
            placeholder={`Buscar na base de ${config.label.toLowerCase()}...`}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-100 shadow-sm font-medium text-slate-700 outline-none focus:border-red-600/30 transition-all text-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
         />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length === 0 && (
           <div className="col-span-3 py-16 text-center">
              <p className="rv-label uppercase tracking-widest italic opacity-40">Nenhum registro encontrado</p>
           </div>
        )}
        {filteredItems.map(item => (
          <div key={item.id} className="rv-card group hover:border-red-600/30 transition-all duration-300">
             <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-red-700 group-hover:text-white transition-all duration-300">
                   <User className="w-5 h-5" />
                </div>
                <button className="p-1.5 text-slate-200 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
             </div>
             
             <h3 className="text-lg font-bold text-slate-900 mb-0.5">{item.name}</h3>
             <p className="rv-label opacity-60 mb-4">{item.document || 'Sem Documento'}</p>
             
             <div className="space-y-2 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-3">
                   <Phone className="w-3.5 h-3.5 text-slate-300" />
                   <span className="text-sm font-medium text-slate-500">{item.phone || '—'}</span>
                </div>
                <div className="flex items-center gap-3">
                   <Mail className="w-3.5 h-3.5 text-slate-300" />
                   <span className="text-sm font-medium text-slate-500 truncate">{item.email || '—'}</span>
                </div>
             </div>
          </div>
        ))}
      </div>

      {showModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
               <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">Novo Cadastro</h3>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 rounded-full transition-all"><X className="w-5 h-5 text-slate-400" /></button>
               </div>
               <form onSubmit={handleSave} className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-1 md:col-span-2">
                        <label className="rv-label px-1">Nome Completo / Razão Social</label>
                        <input type="text" required placeholder="Nome..." className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                     </div>
                     <div className="space-y-1">
                        <label className="rv-label px-1">Documento (CPF / CNPJ)</label>
                        <input type="text" placeholder="000.000.000-00" className="form-input" value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} />
                     </div>
                     <div className="space-y-1">
                        <label className="rv-label px-1">Telefone</label>
                        <input type="text" placeholder="(00) 00000-0000" className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                     </div>
                  </div>
                  <div className="flex gap-4 pt-4 border-t border-slate-50">
                     <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 font-semibold text-slate-400 text-sm">Cancelar</button>
                     <button type="submit" disabled={isSaving} className="flex-1 btn-primary-gradient flex items-center justify-center gap-2">
                        {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        Salvar
                     </button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}
