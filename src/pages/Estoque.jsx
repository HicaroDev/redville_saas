import { useState } from 'react';
import { Package, Plus, Search, History, ArrowUpRight, ArrowDownRight, ArrowRightLeft, Building2, Filter, Save, X, Layers, Pencil, Trash2, Link as LinkIcon, DollarSign as DollarIcon } from 'lucide-react';
import { useStock, useStockMovements, createStockMovement, useDirectory, useProjects, updateDirectoryItem, deleteDirectoryItem, useCashbook } from '../hooks/useData';

export default function EstoquePage() {
  const [activeTab, setActiveTab] = useState('saldo'); // 'saldo' ou 'movimentacoes'
  const [showModal, setShowModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { stock, loading: loadingStock, refetch: refetchStock } = useStock();
  const { movements, loading: loadingMovements, refetch: refetchMovements } = useStockMovements();
  const { items: materials, refetch: refetchMaterials } = useDirectory('material');
  const { entries: purchases } = useCashbook('all'); // Puxa compras para vínculo
  const { projects } = useProjects();

  const [formData, setFormData] = useState({
    material_id: '',
    from_project_id: '',
    to_project_id: '',
    quantity: '',
    type: 'entrada',
    description: '',
    entry_date: new Date().toISOString().split('T')[0],
    cashbook_entry_id: ''
  });

  const [materialForm, setMaterialForm] = useState({
    name: '',
    unit: '',
    category: 'material',
    addInitialStock: false,
    initialQuantity: '',
    project_id: '',
    cashbook_entry_id: ''
  });

  const handleSaveMaterial = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const { data: newItem, error } = await createDirectoryItem({
        name: materialForm.name,
        unit: materialForm.unit,
        category: materialForm.category
    });

    if (!error && newItem) {
       // Se o usuário optou por adicionar saldo inicial
       if (materialForm.addInitialStock && materialForm.project_id && materialForm.initialQuantity) {
           await createStockMovement({
               material_id: newItem.id,
               project_id: materialForm.project_id,
               quantity: materialForm.initialQuantity,
               type: 'entrada',
               description: 'Entrada Inicial no Cadastro',
               cashbook_entry_id: materialForm.cashbook_entry_id || null,
               entry_date: new Date().toISOString().split('T')[0]
           });
       }

       setShowMaterialModal(false);
       setMaterialForm({ name: '', unit: '', category: 'material', addInitialStock: false, initialQuantity: '', project_id: '', cashbook_entry_id: '' });
       refetchMaterials();
       refetchStock();
    } else {
       alert('Erro ao cadastrar material: ' + (error?.message || 'Erro desconhecido'));
    }
    setIsSubmitting(false);
  };

  const handleEditMaterial = (item) => {
      setMaterialForm({ ...item });
      setShowMaterialModal(true);
  };

  const handleDeleteMaterial = async (id) => {
      if (!confirm('Excluir este item de estoque permanentemente?')) return;
      const { error } = await deleteDirectoryItem(id);
      if (!error) {
          refetchStock();
          refetchMaterials();
      } else {
          alert('Erro ao excluir: ' + error.message);
      }
  };

  const handleSaveMovement = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const data = { ...formData };
    if (data.type === 'entrada') data.from_project_id = null;
    if (data.type === 'saída') data.to_project_id = null;
    if (data.cashbook_entry_id === '') data.cashbook_entry_id = null;
    
    const { error } = await createStockMovement(data);
    
    if (!error) {
      setShowModal(false);
      setFormData({
        material_id: '',
        from_project_id: '',
        to_project_id: '',
        quantity: '',
        type: 'entrada',
        description: '',
        entry_date: new Date().toISOString().split('T')[0]
      });
      refetchStock();
      refetchMovements();
    } else {
      alert('Erro ao registrar movimentação: ' + error.message);
    }
    setIsSubmitting(false);
  };

  const filteredStock = stock.filter(item => 
    item.directory?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.projects?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEstoqueValor = stock.reduce((acc, curr) => acc + (Number(curr.quantity) * 0), 0); // Placeholder para lógica de valor futuro

  // Cálculo de estatísticas rápidas
  const totalItens = stock.length;
  const obrasAtivas = [...new Set(stock.map(s => s.projects?.id))].length;
  const itensBaixoEstoque = stock.filter(s => s.quantity <= 5).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100">
             <Package className="w-5 h-5 text-slate-800" />
          </div>
          <div>
            <h1 className="rv-header border-none">Gestão de Estoque</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 italic text-left">Controle de Materiais e Custo de Obra</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setActiveTab('saldo')} 
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'saldo' ? 'bg-red-700 text-white shadow-lg shadow-red-700/20' : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-100'}`}
            >
                Saldo Atual
            </button>
            <button 
                onClick={() => setActiveTab('movimentacoes')} 
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${activeTab === 'movimentacoes' ? 'bg-red-700 text-white shadow-lg shadow-red-700/20' : 'bg-white text-slate-400 hover:text-slate-600 border border-slate-100'}`}
            >
                Movimentações
            </button>
            <button onClick={() => setShowMaterialModal(true)} className="ml-2 bg-white text-slate-700 border border-slate-100 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm shadow-red-100">
               <Layers className="w-4 h-4 text-red-700" /> Cadastrar Material
            </button>
            <button onClick={() => setShowModal(true)} className="ml-2 btn-primary-gradient flex items-center gap-2">
               <Plus className="w-4 h-4" /> Nova Movimentação
            </button>
        </div>
      </header>

      {/* PAINEL DE INDICADORES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-700">
               <Package className="w-6 h-6" />
            </div>
            <div>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Total de Itens</p>
               <h4 className="text-2xl font-black text-slate-900 tracking-tighter">{totalItens} <span className="text-xs font-bold text-slate-300">Insumos</span></h4>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-700">
               <Building2 className="w-6 h-6" />
            </div>
            <div>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Obras Ativas</p>
               <h4 className="text-2xl font-black text-slate-900 tracking-tighter">{obrasAtivas} <span className="text-xs font-bold text-slate-300">Canteiros</span></h4>
            </div>
         </div>
         <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-700">
               <History className="w-6 h-6" />
            </div>
            <div>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Alertas de Estoque</p>
               <h4 className="text-2xl font-black text-slate-900 tracking-tighter">{itensBaixoEstoque} <span className="text-xs font-bold text-slate-300">Reposições</span></h4>
            </div>
         </div>
      </div>

      {/* FILTROS E BUSCA */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-white p-4 rounded-3xl border border-slate-50 shadow-sm">
        <div className="relative group flex-1">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-red-700 transition-colors" />
           <input 
              type="text" 
              placeholder="Buscar material ou obra..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50/50 border border-transparent focus:bg-white focus:border-red-600/30 transition-all text-sm outline-none"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
           />
        </div>
      </div>

      {activeTab === 'saldo' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loadingStock ? (
             <div className="col-span-full py-20 text-center flex flex-col items-center gap-4">
               <div className="w-10 h-10 border-4 border-red-700 border-t-transparent rounded-full animate-spin"></div>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Carregando estoque...</p>
             </div>
          ) : filteredStock.length === 0 ? (
            <div className="col-span-full py-24 text-center bg-white rounded-[2.5rem] border border-dashed border-slate-200">
               <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
               <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] italic">Estoque vazio</p>
               <p className="text-[10px] text-slate-300 mt-2">Registre entradas de materiais para começar o controle.</p>
            </div>
          ) : filteredStock.map(item => (
            <div key={item.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 group hover:border-red-600/20 transition-all duration-300 flex flex-col">
               <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-red-700 group-hover:text-white transition-all duration-300 shadow-inner">
                     <Layers className="w-6 h-6" />
                  </div>
                  <div className="flex gap-1">
                      <button onClick={() => handleEditMaterial(item.directory)} className="p-2 text-slate-100 hover:text-amber-500 transition-colors"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteMaterial(item.material_id)} className="p-2 text-slate-100 hover:text-red-700 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
               </div>
               
               <div className="flex-1">
                 <h3 className="text-lg font-bold text-slate-800 tracking-tight mb-1">{item.directory?.name}</h3>
                 <div className="flex items-center gap-2 mb-4">
                    <Building2 className="w-3.5 h-3.5 text-red-600/40" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.projects?.name}</span>
                 </div>
                 
                 {/* Metadata do Material */}
                 <div className="bg-slate-50 rounded-2xl p-3 space-y-2 mb-6">
                    <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-tight">
                        <span className="text-slate-400">Última Ref.</span>
                        <span className="text-slate-600 truncate max-w-[120px]">{item.unit || 'Entrada via Livro Caixa'}</span>
                    </div>
                 </div>
               </div>

               <div className="pt-6 border-t border-slate-50 flex items-end justify-between">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic">Quantidade</p>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">
                        {item.quantity} <span className="text-sm font-bold text-slate-300">un</span>
                    </p>
                  </div>
                  {item.quantity <= 5 && (
                      <div className="px-2 py-1 bg-amber-50 rounded-lg">
                         <span className="text-[9px] font-black text-amber-600 uppercase">Estoque Baixo</span>
                      </div>
                  )}
               </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Data</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Material</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Tipo</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Origem / Destino</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Qtd.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loadingMovements ? (
                  <tr><td colSpan="5" className="py-20 text-center"><div className="w-8 h-8 border-4 border-red-700 border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
                ) : movements.map(mov => (
                  <tr key={mov.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <p className="text-xs font-bold text-slate-700">{new Date(mov.entry_date).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-bold text-slate-900 leading-tight">{mov.directory?.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">{mov.description || 'Nenhuma observação'}</p>
                    </td>
                    <td className="px-8 py-5">
                       <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${
                         mov.type === 'entrada' ? 'bg-emerald-50 text-emerald-600' :
                         mov.type === 'saída' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                       }`}>
                         {mov.type === 'entrada' ? <ArrowUpRight className="w-3 h-3" /> : 
                          mov.type === 'saída' ? <ArrowDownRight className="w-3 h-3" /> : <ArrowRightLeft className="w-3 h-3" />}
                         {mov.type}
                       </span>
                    </td>
                    <td className="px-8 py-5">
                        <div className="flex flex-col gap-1">
                            {mov.from_project && <span className="text-[10px] font-bold text-slate-400 uppercase"><span className="text-red-700/50 mr-1">DE:</span> {mov.from_project.name}</span>}
                            {mov.to_project && <span className="text-[10px] font-bold text-slate-900 uppercase"><span className="text-emerald-700/50 mr-1">PARA:</span> {mov.to_project.name}</span>}
                        </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <p className="text-sm font-black text-slate-900">{mov.quantity}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl my-8 overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-red-700">
                      <Plus className="w-6 h-6" />
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-slate-800 tracking-tight">Nova Movimentação</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 italic text-left">Controle de Materiais</p>
                   </div>
                </div>
                <button onClick={() => setShowModal(false)} className="w-10 h-10 hover:bg-white hover:shadow-md rounded-2xl transition-all flex items-center justify-center"><X className="w-5 h-5 text-slate-400" /></button>
             </div>

             <form onSubmit={handleSaveMovement} className="p-10 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        type="button"
                        onClick={() => setFormData({...formData, type: 'entrada'})}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.type === 'entrada' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-50 text-slate-400 hover:border-slate-100'}`}
                    >
                        <ArrowUpRight className="w-6 h-6" />
                        <span className="text-[10px] font-bold uppercase">Entrada</span>
                    </button>
                    <button 
                        type="button"
                        onClick={() => setFormData({...formData, type: 'saída'})}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.type === 'saída' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-50 text-slate-400 hover:border-slate-100'}`}
                    >
                        <ArrowDownRight className="w-6 h-6" />
                        <span className="text-[10px] font-bold uppercase">Saída / Uso</span>
                    </button>
                    <button 
                        type="button"
                        onClick={() => setFormData({...formData, type: 'transferência'})}
                        className={`col-span-2 p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 ${formData.type === 'transferência' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-50 text-slate-400 hover:border-slate-100'}`}
                    >
                        <ArrowRightLeft className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase">Transferência entre Obras</span>
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1 relative">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Material (Busca no Cadastro Geral)</label>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                            <input 
                                type="text"
                                placeholder="Digite para buscar material..."
                                className="form-input pl-11 !bg-white focus:!border-red-600/30"
                                value={materials.find(m => m.id === formData.material_id)?.name || ''}
                                onChange={(e) => {
                                    const term = e.target.value;
                                    const match = materials.find(m => m.name.toLowerCase() === term.toLowerCase());
                                    if (match) setFormData({...formData, material_id: match.id});
                                    else setFormData({...formData, material_id: ''});
                                }}
                                list="materials-list"
                            />
                            <datalist id="materials-list">
                                {materials.map(m => (
                                    <option key={m.id} value={m.name}>{m.unit ? `(Unidade: ${m.unit})` : ''}</option>
                                ))}
                            </datalist>
                        </div>
                        {formData.material_id && (
                            <div className="absolute right-3 top-9 flex items-center gap-1.5 px-2 py-1 bg-red-50 rounded-lg border border-red-100 animate-in fade-in zoom-in-95">
                                <span className="text-[9px] font-bold text-red-700 uppercase">Selecionado</span>
                            </div>
                        )}
                        <p className="text-[9px] text-slate-300 mt-1 px-1 italic">Dica: Se o material não aparecer, use o botão "Cadastrar Material" no topo da página.</p>
                    </div>

                    {/* VINCUL AR COMPRA - APENAS EM ENTRADA */}
                    {formData.type === 'entrada' && (
                        <div className="space-y-1 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                            <label className="flex items-center gap-2 text-[10px] font-bold text-emerald-700 uppercase tracking-widest px-1 mb-2">
                                <LinkIcon className="w-3 h-3" /> Vincular à uma Compra (Financeiro)
                            </label>
                            <select 
                                className="form-input bg-white border-emerald-100" 
                                value={formData.cashbook_entry_id} 
                                onChange={e => {
                                    const purchase = purchases.find(p => p.id === e.target.value);
                                    setFormData({
                                        ...formData, 
                                        cashbook_entry_id: e.target.value,
                                        description: purchase ? `Referente a: ${purchase.description} (${purchase.payee_name})` : formData.description
                                    });
                                }}
                            >
                                <option value="">Nenhuma compra vinculada (Opcional)</option>
                                {purchases.filter(p => p.category === 'despesa').slice(0, 30).map(p => (
                                    <option key={p.id} value={p.id}>
                                        {new Date(p.date).toLocaleDateString()} - {p.payee_name}: R$ {p.total_out} ({p.description})
                                    </option>
                                ))}
                            </select>
                            <p className="text-[9px] text-emerald-600 mt-2 px-1">Selecione para puxar automaticamente o custo e fornecedor do Livro Caixa.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Quantidade</label>
                            <input 
                                type="number" 
                                required 
                                step="0.01" 
                                className="form-input" 
                                placeholder="0.00"
                                value={formData.quantity}
                                onChange={e => setFormData({...formData, quantity: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Data</label>
                            <input 
                                type="date" 
                                required 
                                className="form-input" 
                                value={formData.entry_date}
                                onChange={e => setFormData({...formData, entry_date: e.target.value})}
                            />
                        </div>
                    </div>

                    {(formData.type === 'saída' || formData.type === 'transferência') && (
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Origem (Saindo de onde?)</label>
                            <select 
                                required 
                                className="form-input" 
                                value={formData.from_project_id} 
                                onChange={e => setFormData({...formData, from_project_id: e.target.value})}
                            >
                                <option value="">Selecione a Localização de Origem</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {(formData.type === 'entrada' || formData.type === 'transferência') && (
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Destino (Entrando para onde?)</label>
                            <select 
                                required 
                                className="form-input" 
                                value={formData.to_project_id} 
                                onChange={e => setFormData({...formData, to_project_id: e.target.value})}
                            >
                                <option value="">Selecione a Obra de Destino</option>
                                {projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Observações</label>
                        <textarea 
                            rows="2" 
                            className="form-input resize-none py-3" 
                            placeholder="Motivo do uso, número da nota, etc..."
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        ></textarea>
                    </div>
                </div>

                <div className="flex gap-4 pt-6">
                    <button 
                        type="button" 
                        onClick={() => setShowModal(false)}
                        className="flex-1 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-1 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        Confirmar Movimentação
                    </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* MODAL CADASTRAR MATERIAL */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg my-8 overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-red-700">
                      <Layers className="w-6 h-6" />
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-slate-800 tracking-tight">Cadastrar Novo Material</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 italic text-left">Base de Dados Geral</p>
                   </div>
                </div>
                <button onClick={() => setShowMaterialModal(false)} className="w-10 h-10 hover:bg-white hover:shadow-md rounded-2xl transition-all flex items-center justify-center"><X className="w-5 h-5 text-slate-400" /></button>
             </div>

             <form onSubmit={handleSaveMaterial} className="p-10 space-y-6">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Nome do Material / Insumo</label>
                        <input 
                            type="text" 
                            required 
                            placeholder="Ex: Cimento CP-II, Tijolo 8 Furos, Areia..." 
                            className="form-input" 
                            value={materialForm.name} 
                            onChange={e => setMaterialForm({...materialForm, name: e.target.value})} 
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Unidade de Medida</label>
                            <input 
                                type="text" 
                                required
                                placeholder="Ex: m2, kg, un, m3..." 
                                className="form-input font-medium" 
                                value={materialForm.unit} 
                                onChange={e => setMaterialForm({...materialForm, unit: e.target.value})} 
                            />
                        </div>
                    </div>

                    {/* VINCULO INICIAL OPCIONAL */}
                    <div className="pt-4 border-t border-slate-100">
                        <label className="flex items-center gap-2 cursor-pointer group">
                             <input 
                                type="checkbox" 
                                className="w-5 h-5 rounded-lg border-slate-200 text-red-700 focus:ring-red-600 transition-all cursor-pointer"
                                checked={materialForm.addInitialStock}
                                onChange={e => setMaterialForm({...materialForm, addInitialStock: e.target.checked})}
                             />
                             <span className="text-xs font-bold text-slate-500 uppercase tracking-widest group-hover:text-red-700 transition-colors">Vincular Compra e Saldo Inicial?</span>
                        </label>

                        {materialForm.addInitialStock && (
                            <div className="mt-6 space-y-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 animate-in slide-in-from-top-4 duration-300">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Obra de Destino</label>
                                    <select 
                                        required={materialForm.addInitialStock}
                                        className="form-input bg-white" 
                                        value={materialForm.project_id} 
                                        onChange={e => setFormData({...materialForm, project_id: e.target.value})}
                                    >
                                        <option value="">Selecione a Obra</option>
                                        {projects.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Qtd Inicial</label>
                                        <input 
                                            type="number" 
                                            required={materialForm.addInitialStock}
                                            placeholder="0" 
                                            className="form-input bg-white" 
                                            value={materialForm.initialQuantity} 
                                            onChange={e => setMaterialForm({...materialForm, initialQuantity: e.target.value})} 
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 italic">Vincular à uma Compra</label>
                                        <select 
                                            className="form-input bg-white text-[10px]" 
                                            value={materialForm.cashbook_entry_id} 
                                            onChange={e => setMaterialForm({...materialForm, cashbook_entry_id: e.target.value})}
                                        >
                                            <option value="">Nenhuma vínculo (Opcional)</option>
                                            {purchases.filter(p => p.category === 'despesa').slice(0, 10).map(p => (
                                                <option key={p.id} value={p.id}>{p.payee_name} - R$ {p.total_out}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <p className="text-[9px] text-red-600 font-medium px-1 underline uppercase">Isso criará uma entrada automática no estoque após o cadastro.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-4 pt-6">
                    <button 
                        type="button" 
                        onClick={() => setShowMaterialModal(false)}
                        className="flex-1 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest"
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="flex-1 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                        Salvar Material
                    </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
