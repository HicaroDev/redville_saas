import { useState } from 'react';
import { Plus, Eye, Building2, Pencil, X, Save, Trash2 } from 'lucide-react';
import { useProjects, useAllStages, updateProject, createProject, useClients, deleteProject } from '../hooks/useData';

const STATUS_MAP = {
  active: { label: 'Em andamento' },
  completed: { label: 'Concluída' },
  paused: { label: 'Pausada' },
};

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value || 0);
}

export default function ObrasPage({ onOpenProject }) {
  const { projects, loading: loadingP, refetch } = useProjects();
  const { stages, loading: loadingS } = useAllStages();
  const { clients } = useClients();
  const [editingProject, setEditingProject] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newProject, setNewProject] = useState({ 
    name: '', code: '', lote: '', quadra: '', street: '', cep: '', 
    area_m2: '', budget_total: '', observations: '', client_id: '' 
  });

  if (loadingP || loadingS) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-4 border-red-700 border-t-transparent rounded-full animate-spin"></div></div>;

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const { error } = await updateProject(editingProject.id, {
      name: editingProject.name,
      lote: editingProject.lote,
      area_m2: Number(editingProject.area_m2),
      budget_total: Number(editingProject.budget_total),
      status: editingProject.status
    });
    if (!error) { setEditingProject(null); refetch(); }
    else { alert('Erro ao salvar: ' + error.message); }
    setIsSaving(false);
  };

  const totalBudget = projects.reduce((s, p) => s + Number(p.budget_total), 0);
  const progressoMedio = stages.length > 0 ? Math.round(stages.reduce((s, st) => s + Number(st.progress_pct), 0) / stages.length) : 0;
  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta obra? Todos os dados vinculados serão perdidos.')) return;
    const { error } = await deleteProject(id);
    if (!error) refetch();
    else alert('Erro ao excluir: ' + error.message);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="rv-header">Obras e Projetos</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Gestão centralizada de canteiros</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary-gradient flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nova Obra
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Projetos" value={projects.length} sub="Ativos" />
        <StatCard label="Budget Total" value={formatCurrency(totalBudget)} sub="Comprometido" />
        <StatCard label="Progresso Médio" value={`${progressoMedio}%`} sub="Geral" />
      </div>

      <div className="rv-card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="text-left rv-label py-4 px-6">Nome da Obra</th>
              <th className="text-left rv-label py-4 px-4">Status</th>
              <th className="text-left rv-label py-4 px-4">Área / Orçamento</th>
              <th className="text-right rv-label py-4 px-6">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {projects.map((project) => {
              const projectStages = stages.filter(s => s.projects?.code === project.code);
              const avgProgress = projectStages.length > 0 ? Math.round(projectStages.reduce((s, st) => s + Number(st.progress_pct), 0) / projectStages.length) : 0;
              return (
                <tr key={project.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{project.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-tighter">{project.code} • {project.street || 'Endereço Pendente'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                     <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${project.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {STATUS_MAP[project.status]?.label || project.status}
                     </span>
                  </td>
                  <td className="py-4 px-4">
                     <p className="text-slate-700 font-semibold">{formatCurrency(project.budget_total)}</p>
                     <p className="text-[10px] text-slate-400 font-bold">{project.area_m2 || 0} m²</p>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => onOpenProject(project.code)} className="p-2 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all" title="Ver Detalhes"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => setEditingProject(project)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Editar Obra"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(project.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Excluir Obra"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showCreate && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
               <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">Novo Cadastro de Obra</h3>
                  <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-slate-50 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
               </div>
               <form onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSaving(true);
                  const projectToSave = {
                    ...newProject,
                    status: 'active',
                    client_id: newProject.client_id === "" ? null : newProject.client_id,
                    area_m2: Number(newProject.area_m2) || 0,
                    budget_total: Number(newProject.budget_total) || 0
                  };
                  const { error } = await createProject(projectToSave);
                  if (!error) { setShowCreate(false); setNewProject({ name: '', code: '' }); refetch(); } 
                  else { alert('Erro: ' + error.message); }
                  setIsSaving(false);
               }} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                  <div className="space-y-1"><label className="rv-label px-1">Nome Fantasia da Obra</label><input type="text" className="form-input font-semibold" required value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} placeholder="Ex: Galpão Logístico" /></div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1"><label className="rv-label px-1">Código (Sigla)</label><input type="text" className="form-input font-semibold" required value={newProject.code} onChange={e => setNewProject({...newProject, code: e.target.value.toUpperCase()})} placeholder="EX: GLP1" /></div>
                     <div className="space-y-1"><label className="rv-label px-1">Vincular Cliente</label><select className="form-input font-semibold" value={newProject.client_id} onChange={e => setNewProject({...newProject, client_id: e.target.value})}><option value="">Nenhum (Opcional)</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                  </div>
                  <div className="space-y-1"><label className="rv-label px-1">Rua / Logradouro</label><input type="text" className="form-input" value={newProject.street} onChange={e => setNewProject({...newProject, street: e.target.value})} placeholder="Ex: Av. Principal, 123" /></div>
                  <div className="grid grid-cols-3 gap-4">
                     <div className="space-y-1"><label className="rv-label px-1">Quadra</label><input className="form-input" value={newProject.quadra} onChange={e => setNewProject({...newProject, quadra: e.target.value})} placeholder="00" /></div>
                     <div className="space-y-1"><label className="rv-label px-1">Lote</label><input className="form-input" value={newProject.lote} onChange={e => setNewProject({...newProject, lote: e.target.value})} placeholder="00" /></div>
                     <div className="space-y-1"><label className="rv-label px-1">CEP</label><input className="form-input" value={newProject.cep} onChange={e => setNewProject({...newProject, cep: e.target.value})} placeholder="00000-000" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1"><label className="rv-label px-1">Área Estimada (m²)</label><input type="number" className="form-input" value={newProject.area_m2} onChange={e => setNewProject({...newProject, area_m2: e.target.value})} placeholder="0" /></div>
                     <div className="space-y-1"><label className="rv-label px-1">Orçamento Previsto (R$)</label><input type="number" className="form-input" value={newProject.budget_total} onChange={e => setNewProject({...newProject, budget_total: e.target.value})} placeholder="0,00" /></div>
                  </div>
                  <div className="space-y-1"><label className="rv-label px-1">Observações</label><textarea className="form-input h-20 resize-none" value={newProject.observations} onChange={e => setNewProject({...newProject, observations: e.target.value})} /></div>
                  <div className="flex gap-4 pt-4 border-t border-slate-50">
                     <button type="button" onClick={() => setShowCreate(false)} className="flex-1 py-3 font-semibold text-slate-400 text-sm">Descartar</button>
                     <button type="submit" disabled={isSaving} className="btn-primary-gradient flex items-center justify-center gap-2">{isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}Criar Obra</button>
                  </div>
               </form>
            </div>
         </div>
      )}

      {editingProject && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
               <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">Editar Obra: {editingProject.code}</h3>
                  <button onClick={() => setEditingProject(null)} className="p-2 hover:bg-slate-50 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
               </div>
               <form onSubmit={handleUpdate} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                  <div className="space-y-1"><label className="rv-label px-1">Nome Fantasia da Obra</label><input type="text" className="form-input font-semibold" required value={editingProject.name} onChange={e => setEditingProject({...editingProject, name: e.target.value})} /></div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1"><label className="rv-label px-1">Código (Sigla)</label><input type="text" className="form-input font-semibold bg-slate-50" readOnly value={editingProject.code} /></div>
                     <div className="space-y-1"><label className="rv-label px-1">Status</label><select className="form-input font-bold text-red-700 bg-red-50/50" value={editingProject.status} onChange={e => setEditingProject({...editingProject, status: e.target.value})}>{Object.entries(STATUS_MAP).map(([val, {label}]) => <option key={val} value={val}>{label}</option>)}</select></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1"><label className="rv-label px-1">Área (m²)</label><input type="number" className="form-input" value={editingProject.area_m2} onChange={e => setEditingProject({...editingProject, area_m2: e.target.value})} /></div>
                     <div className="space-y-1"><label className="rv-label px-1">Orçamento Previsto (R$)</label><input type="number" className="form-input" value={editingProject.budget_total} onChange={e => setEditingProject({...editingProject, budget_total: e.target.value})} /></div>
                  </div>
                  <div className="flex gap-4 pt-4 border-t border-slate-50">
                     <button type="button" onClick={() => setEditingProject(null)} className="flex-1 py-3 font-semibold text-slate-400 text-sm">Cancelar</button>
                     <button type="submit" disabled={isSaving} className="btn-primary-gradient flex items-center justify-center gap-2">{isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}Salvar Alterações</button>
                  </div>
               </form>
            </div>
         </div>
      )}
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="rv-card">
      <p className="rv-label">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      <p className="text-[10px] text-slate-400 mt-0.5 font-bold italic tracking-wider">{sub}</p>
    </div>
  );
}
