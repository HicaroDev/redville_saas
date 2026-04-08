import { useState, useMemo } from 'react';
import { Plus, Trash2, Edit3, Package, Users, Wrench, Search, Check, X, UserCheck, ClipboardList } from 'lucide-react';
import { useResourceTypes, createResourceType, updateResourceType, deleteResourceType } from '../hooks/useData';

const CONFIG = {
  cadastros: { title: 'Categorias de Recursos', icon: Package, label: 'Categoria', desc: 'Tipos de Recursos (MAT, MO, LOC, TAR)' },
  fornecedores: { title: 'Cadastro de Fornecedores', icon: Users, label: 'Fornecedor', desc: 'Empresas e lojas de suprimentos' },
  prestadores: { title: 'Prestadores de Serviço', icon: Wrench, label: 'Prestador', desc: 'Terceirizados e empreiteiras' },
  funcionarios: { title: 'Quadro de Funcionários', icon: UserCheck, label: 'Funcionário', desc: 'Equipe interna Redville' },
  materiais: { title: 'Catálogo de Materiais', icon: ClipboardList, label: 'Material', desc: 'Padronização de itens e insumos' }
};

export default function CadastrosPage({ type = 'cadastros' }) {
  const { resourceTypes, loading, refetch } = useResourceTypes();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ code: '', name: '' });
  const [editData, setEditData] = useState({ code: '', name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeConfig = CONFIG[type] || CONFIG.cadastros;
  const Icon = activeConfig.icon;

  const handleAdd = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createResourceType(formData);
      setFormData({ code: '', name: '' });
      setShowAddForm(false);
      refetch();
    } finally { setIsSubmitting(false); }
  };

  const handleUpdate = async (id) => {
    setIsSubmitting(true);
    try {
      await updateResourceType(id, editData);
      setEditingId(null);
      refetch();
    } finally { setIsSubmitting(false); }
  };

  const filtered = useMemo(() => 
    resourceTypes.filter(rt => rt.name.toLowerCase().includes(searchTerm.toLowerCase())),
    [resourceTypes, searchTerm]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-50 text-red-700 rounded-2xl shadow-sm">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{activeConfig.title}</h1>
            <p className="text-sm text-slate-500">{activeConfig.desc}</p>
          </div>
        </div>
        <button onClick={() => setShowAddForm(true)} className="btn-primary-gradient flex items-center gap-2">
          <Plus className="w-4 h-4" /> Novo {activeConfig.label}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-2xl p-6 shadow-md border border-red-100 animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleAdd} className="flex gap-4 items-end">
             <div className="flex-1 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nome / Razão Social</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="form-input" required placeholder={`Nome do ${activeConfig.label}`} />
             </div>
             <div className="w-32 space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Documento/Cód</label>
                <input type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} className="form-input" placeholder="Opcional" />
             </div>
             <button type="submit" disabled={isSubmitting} className="btn-primary-gradient h-10 px-6">
               {isSubmitting ? '...' : 'Salvar'}
             </button>
             <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary h-10 px-4">
               <X className="w-4 h-4" />
             </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 bg-slate-50/50 border-b border-slate-100">
           <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl w-full" placeholder={`Pesquisar ${activeConfig.label}...`} />
           </div>
        </div>
        <table className="w-full">
           <thead>
              <tr className="border-b border-slate-50">
                 <th className="text-left text-[11px] font-bold text-slate-400 uppercase py-4 px-6">Descrição</th>
                 <th className="text-left text-[11px] font-bold text-slate-400 uppercase py-4 px-6">Status</th>
                 <th className="text-right text-[11px] font-bold text-slate-400 uppercase py-4 px-6">Ações</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-50">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                   <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">{item.code || 'SEM DOCUMENTO'}</div>
                   </td>
                   <td className="py-4 px-6">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded shadow-sm border border-emerald-100">ATIVO</span>
                   </td>
                   <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                           <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={async () => { if(confirm("Remover?")) { await deleteResourceType(item.id); refetch(); } }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                           <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                   </td>
                </tr>
              ))}
           </tbody>
        </table>
      </div>
    </div>
  );
}
