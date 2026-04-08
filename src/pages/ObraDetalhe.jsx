import React, { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, DollarSign, Plus, Trash2, Edit3, Loader2, Save, X, ChevronDown, ChevronRight, BarChart2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { 
  useProjects, useStages, useBudgetItems, 
  createProjectStage, updateProjectStage, deleteProjectStage, 
  createBudgetItem, updateBudgetItem, deleteBudgetItem,
  useResourceTypes 
} from '../hooks/useData';

const STATUS_MAP = {
  em_andamento: { label: 'Em andamento', color: 'blue' },
  concluida: { label: 'Concluída', color: 'emerald' },
  pausada: { label: 'Pausada', color: 'amber' },
  nao_iniciada: { label: 'Não iniciada', color: 'slate' },
  atrasada: { label: 'Atrasada', color: 'red' },
};

const RESOURCE_TYPE_MAP = {
  MAT: { label: 'Material' },
  MO: { label: 'Mão de Obra' },
  LOC: { label: 'Locação' },
  TAR: { label: 'Tarefa' },
};

function formatCurrency(value) {
  if (value == null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(value);
}

const TABS = [
  { id: 'overview', label: 'Visão Geral' },
  { id: 'orcamento', label: 'Suprimentos / Orçamento' },
  { id: 'etapas', label: 'Etapas de Obra' },
  { id: 'compras', label: 'Lista de Compras' },
  { id: 'gantt', label: 'Cronograma / Gantt' },
];

export default function ObraDetalhe({ projectCode, onBack }) {
  const [activeTab, setActiveTab] = useState('overview');
  const { projects } = useProjects();
  const { stages, loading: loadingS, refetch: refetchStages } = useStages(projectCode);
  const { items: budgetItems, loading: loadingB, refetch: refetchItems } = useBudgetItems(projectCode);

  const project = projects.find(p => p.code === projectCode) || {};

  if (loadingS || loadingB) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  const jsonSort = (a, b) => (a.wbs || '').localeCompare((b.wbs || ''), undefined, { numeric: true, sensitivity: 'base' });
  const sortedStages = [...stages].sort(jsonSort);
  const totalOrcado = budgetItems.reduce((s, i) => s + (i.subtotal || 0), 0);
  const totalRealizado = budgetItems.reduce((s, i) => s + (i.actual || 0), 0);
  const concluidas = stages.filter(s => s.status === 'concluida').length;
  const avgProgress = stages.length > 0
    ? Math.round(stages.reduce((s, st) => s + Number(st.progress_pct), 0) / stages.length)
    : 0;

  // Lógica sugerida pelo usuário: Orçamento alimenta a Etapa
  // Calculando duração total prevista de cada etapa com base nos itens
  const stageStats = sortedStages.map(s => {
    const items = budgetItems.filter(i => i.stage_id === s.id);
    const totalDays = items.reduce((sum, i) => sum + (Number(i.execution_days) || 0), 0);
    const totalCost = items.reduce((sum, i) => sum + (Number(i.subtotal) || 0), 0);
    const actualCost = items.reduce((sum, i) => sum + (Number(i.actual) || 0), 0);
    
    // Alert logic: 30 days and 15 days
    const today = new Date();
    const plannedStart = new Date(s.planned_start);
    const diffTime = plannedStart - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const purchaseAlert = diffDays <= 15 && diffDays > 0 ? 'CRITICO' : diffDays <= 30 && diffDays > 15 ? 'AVISO' : null;
    const isOverrun = s.actual_end && new Date(s.actual_end) > new Date(s.planned_end);

    return { ...s, totalDays, totalCost, actualCost, purchaseAlert, isOverrun, diffDays };
  });

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-3 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar para Obras
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Lote {project.lote}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {project.start_date} → {project.end_date}</span>
              <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> {formatCurrency(project.budget_total)}</span>
            </div>
          </div>
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700">
            {STATUS_MAP[project.status]?.label}
          </span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniKPI label="Área" value={`${project.area_m2} m²`} />
        <MiniKPI label="Progresso" value={`${avgProgress}%`} />
        <MiniKPI label="Etapas Concluídas" value={`${concluidas}/${stages.length}`} />
        <MiniKPI label="R$/m²" value={formatCurrency(project.cost_per_m2)} />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-red-700 text-red-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab project={project} stages={stageStats} budgetItems={budgetItems} totalOrcado={totalOrcado} totalRealizado={totalRealizado} avgProgress={avgProgress} />}
      {activeTab === 'orcamento' && <OrcamentoTab budgetItems={budgetItems} stages={stageStats} projectId={project.id} onRefresh={refetchItems} />}
      {activeTab === 'etapas' && <EtapasTab stages={stageStats} projectId={project.id} budgetItems={budgetItems} onRefresh={refetchStages} />}
      {activeTab === 'compras' && <ComprasTab budgetItems={budgetItems} stages={stageStats} />}
      {activeTab === 'gantt' && <GanttTab stages={stageStats} />}
    </div>
  );
}

/* ===================== TAB: VISÃO GERAL ===================== */
function OverviewTab({ project, stages, budgetItems, totalOrcado, totalRealizado, avgProgress }) {
  const chartData = [];
  const grouped = {};
  budgetItems.forEach(i => {
    if (!grouped[i.stage]) grouped[i.stage] = { stage: i.stage, orcado: 0, realizado: 0 };
    grouped[i.stage].orcado += (i.subtotal || 0);
    grouped[i.stage].realizado += (i.actual || 0);
  });
  const alerts = stages.filter(s => s.purchaseAlert).sort((a, b) => a.diffDays - b.diffDays);
  
  Object.values(grouped).forEach(g => { if (g.orcado > 0 || g.realizado > 0) chartData.push(g); });

  return (
    <div className="space-y-6">
      {/* Smart Alerts */}
      {alerts.length > 0 && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map(a => (
               <div key={a.id} className={`p-4 rounded-2xl border flex items-center justify-between ${
                  a.purchaseAlert === 'CRITICO' ? 'bg-red-50 border-red-100 text-red-900' : 'bg-amber-50 border-amber-100 text-amber-900'
               }`}>
                  <div className="flex items-center gap-3">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold bg-white shadow-sm`}>
                        {a.diffDays}
                     </div>
                     <div>
                        <p className="text-xs font-bold uppercase tracking-wider opacity-60">Alerta de Insumos</p>
                        <p className="text-sm font-bold">Comprar materiais para: {a.name}</p>
                     </div>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-1 bg-white rounded shadow-sm">
                     {a.purchaseAlert}
                  </span>
               </div>
            ))}
         </div>
      )}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Progresso Geral</span>
          <span className="text-sm font-bold text-slate-900">{avgProgress}%</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-red-700 to-red-500 rounded-full transition-all duration-1000" style={{ width: `${avgProgress}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FinancialMiniCard label="Total Orçado" value={totalOrcado} color="blue" />
        <FinancialMiniCard label="Total Realizado" value={totalRealizado} color="emerald" />
        <FinancialMiniCard label="Desvio Atual" value={totalOrcado - totalRealizado} color={totalRealizado > totalOrcado ? 'red' : 'emerald'} />
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm h-80">
        <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase">Comparativo por Etapa</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="stage" tick={{fontSize: 10}} height={50} angle={-15} textAnchor="end" />
            <YAxis tick={{fontSize: 10}} tickFormatter={v => `R$ ${v/1000}k`} />
            <Tooltip formatter={v => formatCurrency(v)} />
            <Legend />
            <Bar dataKey="orcado" name="Orçado" fill="#93c5fd" radius={[2,2,0,0]} />
            <Bar dataKey="realizado" name="Realizado" fill="#2563eb" radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ===================== TAB: ETAPAS ===================== */
function EtapasTab({ stages, projectId, onRefresh }) {
  const [editingId, setEditingId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const [form, setForm] = useState({ sequence_id: '', wbs: '', level: 1, name: '', duration_days: '', planned_start: '', planned_end: '', status: 'nao_iniciada', progress_pct: 0 });

  const handleSave = async (e) => {
    e.preventDefault();
    setIsBusy(true);
    try {
      const data = { ...form, project_id: projectId };
      if (editingId) {
        await updateProjectStage(editingId, data);
      } else {
        await createProjectStage(data);
      }
      setEditingId(null);
      setShowAdd(false);
      onRefresh();
    } catch (err) { alert(err.message); }
    finally { setIsBusy(false); }
  };

  const handleEdit = (s) => {
    setForm({ sequence_id: s.sequence_id || '', wbs: s.wbs || '', level: s.level || 1, name: s.name, duration_days: s.duration_days || '', planned_start: s.planned_start || '', planned_end: s.planned_end || '', status: s.status, progress_pct: s.progress_pct });
    setEditingId(s.id);
    setShowAdd(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Excluir esta etapa?")) return;
    await deleteProjectStage(id);
    onRefresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setShowAdd(true); setEditingId(null); setForm({sequence_id: '', wbs: '', level: 1, name: '', status: 'nao_iniciada', progress_pct: 0}); }} className="btn-primary-gradient flex items-center gap-2 text-xs">
          <Plus className="w-4 h-4" /> Nova Etapa/Sub-etapa
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSave} className="bg-white p-5 rounded-xl border border-blue-100 grid grid-cols-1 md:grid-cols-6 gap-4">
          <div><label className="text-[10px] font-bold text-slate-500 uppercase">WBS (ex: 1.1)</label><input type="text" value={form.wbs} onChange={e => setForm({...form, wbs: e.target.value})} className="form-input" /></div>
          <div><label className="text-[10px] font-bold text-slate-500 uppercase">Nível</label><input type="number" value={form.level} onChange={e => setForm({...form, level: e.target.value})} className="form-input" /></div>
          <div className="md:col-span-4"><label className="text-[10px] font-bold text-slate-500 uppercase">Nome da Etapa</label><input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="form-input" required /></div>
          <div><label className="text-[10px] font-bold text-slate-500 uppercase">Início</label><input type="date" value={form.planned_start} onChange={e => setForm({...form, planned_start: e.target.value})} className="form-input" /></div>
          <div><label className="text-[10px] font-bold text-slate-500 uppercase">Fim</label><input type="date" value={form.planned_end} onChange={e => setForm({...form, planned_end: e.target.value})} className="form-input" /></div>
          <div><label className="text-[10px] font-bold text-slate-500 uppercase">Status</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="form-input">
              {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="flex items-end gap-2 md:col-span-2">
            <button type="submit" disabled={isBusy} className="btn-primary-gradient flex-1 py-2 text-sm">{isBusy ? '...' : editingId ? 'Salvar' : 'Criar'}</button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border rounded-lg text-sm bg-slate-50 hover:bg-slate-100"><X className="w-4 h-4" /></button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/80">
              <th className="text-center text-[11px] font-bold text-slate-500 uppercase py-3 px-4 w-12">ID</th>
              <th className="text-center text-[11px] font-bold text-slate-500 uppercase py-3 px-4 w-16 border-l border-white">WBS</th>
              <th className="text-left text-[11px] font-bold text-slate-500 uppercase py-3 px-4 border-l border-white">Etapa / Sub-etapa</th>
              <th className="text-center text-[11px] font-bold text-slate-500 uppercase py-3 px-4">Progresso</th>
              <th className="text-left text-[11px] font-bold text-slate-500 uppercase py-3 px-4">Status</th>
              <th className="text-right text-[11px] font-bold text-slate-500 uppercase py-3 px-6">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stages.map(s => {
              const paddingLeft = (s.level > 1) ? (s.level - 1) * 32 : 0;
              const isParent = s.level === 1 || !s.wbs?.includes('.');
              
              // Alertas de Gestão (Regra: 30 dias e 15 dias antes)
              const today = new Date();
              const startDate = s.planned_start ? new Date(s.planned_start) : null;
              const diffDays = startDate ? Math.ceil((startDate - today) / (1000 * 60 * 60 * 24)) : null;
              
              let alert = null;
              if (diffDays !== null && s.status === 'nao_iniciada') {
                if (diffDays <= 15) alert = { color: 'red', text: 'URGENTE: Comprar materiais' };
                else if (diffDays <= 30) alert = { color: 'amber', text: 'ATENÇÃO: Iniciar cotações' };
              }

              const handleAddSub = () => {
                const prefix = s.wbs || s.sequence_id || '1';
                const children = stages.filter(st => st.wbs?.startsWith(prefix + '.'));
                const nextSuffix = children.length + 1;
                const nextWBS = `${prefix}.${nextSuffix}`;
                
                setForm({ sequence_id: (stages.length + 1), wbs: nextWBS, level: (s.level || 1) + 1, status: 'nao_iniciada', progress_pct: 0, name: '' });
                setEditingId(null);
                setShowAdd(true);
              };
              
              return (
              <tr key={s.id} className={`hover:bg-slate-50 transition-colors group ${isParent ? 'bg-slate-50/50' : 'bg-white'}`}>
                <td className="py-3 px-4 text-[10px] font-bold text-slate-400 text-center">{s.sequence_id}</td>
                <td className="py-3 px-4 text-xs font-bold text-blue-500 text-center border-l border-white bg-slate-50/30">{s.wbs}</td>
                <td className="py-3 px-4" style={{ paddingLeft: `${paddingLeft + 16}px` }}>
                  <div className="flex items-center gap-3">
                    {s.level > 1 && (
                      <div className="w-4 h-4 border-l-2 border-b-2 border-slate-200 -mt-3 -ml-4 rounded-bl-lg" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                         <p className={`text-sm tracking-tight ${isParent ? 'font-bold text-slate-900' : 'font-medium text-slate-600'}`}>{s.name}</p>
                         {alert && (
                           <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold bg-${alert.color}-100 text-${alert.color}-700 border border-${alert.color}-200 animate-pulse`}>
                             {alert.text}
                           </span>
                         )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-[10px] text-slate-400 font-normal tabular-nums">
                           {s.planned_start ? new Date(s.planned_start).toLocaleDateString() : '—'} a {s.planned_end ? new Date(s.planned_end).toLocaleDateString() : '—'}
                        </p>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 rounded">{s.totalDays}d (Calc. Orçamento)</span>
                        {s.responsible && <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase font-bold">{s.responsible}</span>}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${s.progress_pct}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{s.progress_pct}%</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                   <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full bg-${STATUS_MAP[s.status]?.color}-50 text-${STATUS_MAP[s.status]?.color}-700 border border-${STATUS_MAP[s.status]?.color}-200`}>
                    {STATUS_MAP[s.status]?.label}
                  </span>
                </td>
                <td className="py-3 px-6 text-right border-l border-slate-50">
                  <div className="flex justify-end gap-1 opacity-10 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={handleAddSub} 
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                      title="Adicionar Sub-etapa"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleEdit(s)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(s.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===================== TAB: ORÇAMENTO ===================== */
function OrcamentoTab({ budgetItems, stages, projectId, onRefresh }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());
  const [initialized, setInitialized] = useState(false);
  
  // Auto-collapse all on first load
  if (!initialized && Object.keys(grouped).length > 0) {
    setCollapsedGroups(new Set(Object.keys(grouped)));
    setInitialized(true);
  }
  
  const toggleGroup = (key) => {
    const next = new Set(collapsedGroups);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setCollapsedGroups(next);
  };

  const [form, setForm] = useState({ 
    sequence_id: '', 
    stage_id: '',
    stage_name: '', 
    sub_stage: '', 
    description: '', 
    resource_type: 'MAT', 
    unit: '', 
    qty: '', 
    unit_cost: '' 
  });

  const handleSave = async (e) => {
    e.preventDefault();
    // Encontrar o nome da etapa pelo ID se selecionado
    const selectedStage = stages.find(s => s.id === form.stage_id);
    const data = { 
      ...form, 
      project_id: projectId,
      resource_type: form.resource_type || 'MAT',
      stage_name: selectedStage ? selectedStage.name : form.stage_name, 
      subtotal: (Number(form.qty) * Number(form.unit_cost)) 
    };
    if (editingId) await updateBudgetItem(editingId, data);
    else await createBudgetItem(data);
    setShowAdd(false); setEditingId(null); onRefresh();
  };

  const grouped = {};
  budgetItems.forEach(i => {
    // Tenta agrupar pela etapa vinculada (stage_id)
    const stage = stages.find(s => s.id === i.stage_id);
    const groupKey = stage ? (stage.wbs ? `${stage.wbs} ${stage.name}` : stage.name) : i.stage;
    if (!grouped[groupKey]) grouped[groupKey] = [];
    grouped[groupKey].push(i);
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setShowAdd(true); setEditingId(null); }} className="btn-primary-gradient flex items-center gap-2 text-xs">
          <Plus className="w-4 h-4" /> Novo Item
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSave} className="bg-white p-5 rounded-xl border border-blue-100 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1"><label className="text-[10px] font-bold text-slate-500 uppercase">ID Ordem</label><input type="number" value={form.sequence_id} onChange={e => setForm({...form, sequence_id: e.target.value})} className="form-input" placeholder="0" /></div>
          <div className="md:col-span-1"><label className="text-[10px] font-bold text-slate-500 uppercase">Etapa (Vinculada)</label>
             <select value={form.stage_id} onChange={e => setForm({...form, stage_id: e.target.value})} className="form-input" required>
               <option value="">Selecione a Etapa...</option>
               {stages.map(s => (
                 <option key={s.id} value={s.id}>{s.wbs} {s.name}</option>
               ))}
             </select>
          </div>
          <div className="md:col-span-1"><label className="text-[10px] font-bold text-slate-500 uppercase">Tempo Exec. (Dias)</label>
             <input type="number" value={form.execution_days} onChange={e => setForm({...form, execution_days: e.target.value})} className="form-input" placeholder="Ex: 5" />
          </div>
          <div className="md:col-span-1"><label className="text-[10px] font-bold text-slate-500 uppercase">Descrição do Insumo</label>
             <input type="text" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="form-input" required />
          </div>
          <div><label className="text-[10px] font-bold text-slate-500 uppercase">Tipo</label>
            <select value={form.resource_type} onChange={e => setForm({...form, resource_type: e.target.value})} className="form-input">
                {Object.entries(RESOURCE_TYPE_MAP).map(([code, info]) => <option key={code} value={code}>{info.label}</option>)}
            </select>
          </div>
          <div><label className="text-[10px] font-bold text-slate-500 uppercase">Qtd</label><input type="number" value={form.qty} onChange={e => setForm({...form, qty: e.target.value})} className="form-input" /></div>
          <div><label className="text-[10px] font-bold text-slate-500 uppercase">Vlr Unit</label><input type="number" step="0.01" value={form.unit_cost} onChange={e => setForm({...form, unit_cost: e.target.value})} className="form-input" /></div>
          <div className="flex items-end gap-2">
            <button type="submit" className="btn-primary-gradient flex-1 py-2 text-sm">{editingId ? 'Salvar' : 'Criar'}</button>
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border rounded-lg text-sm">X</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50/80">
            <tr>
              <th className="text-center text-[11px] font-bold text-slate-500 uppercase py-3 px-4 w-12">ID</th>
              <th className="text-left text-[11px] font-bold text-slate-500 uppercase py-3 px-6">Item</th>
              <th className="text-center text-[11px] font-bold text-slate-500 uppercase py-3 px-4">Qtd</th>
              <th className="text-right text-[11px] font-bold text-slate-500 uppercase py-3 px-4">Vlr Unit</th>
              <th className="text-right text-[11px] font-bold text-slate-500 uppercase py-3 px-6">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {Object.entries(grouped)
              .sort(([keyA, itemsA], [keyB, itemsB]) => {
                const stageA = stages.find(s => s.id === itemsA[0]?.stage_id);
                const stageB = stages.find(s => s.id === itemsB[0]?.stage_id);
                if (stageA && stageB) {
                  return (stageA.wbs || '').localeCompare(stageB.wbs || '', undefined, { numeric: true });
                }
                return keyA.localeCompare(keyB);
              })
              .map(([stageKey, items]) => {
                const stageData = stages.find(s => s.id === items[0]?.stage_id);
                const isCollapsed = collapsedGroups.has(stageKey);
              
              return (
              <React.Fragment key={stageKey}>
                <tr className="bg-slate-50/50 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => toggleGroup(stageKey)}>
                  <td colSpan={5} className="py-2.5 px-6">
                    <div className="flex items-center gap-2">
                       {isCollapsed ? <ChevronRight className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                       <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                         {stageData?.wbs && <span className="bg-blue-100 text-blue-600 px-1 rounded">{stageData.wbs}</span>}
                         {stageKey}
                       </span>
                       <span className="ml-auto text-[10px] text-slate-400 font-medium">{items.length} itens</span>
                    </div>
                  </td>
                </tr>
                {!isCollapsed && items.map(item => {
                  const itemStage = stages.find(s => s.id === item.stage_id);
                  return (
                  <tr key={item.id} className="hover:bg-slate-50/50 group transition-colors border-b border-slate-50 last:border-0 text-[13px]">
                    <td className="py-2.5 px-4 text-center tabular-nums">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-blue-500/60">{itemStage?.wbs || '-'}</span>
                        <span className="text-[9px] font-medium text-slate-300">Seq: {item.sequence_id || '0'}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-6">
                      <div className="flex items-center gap-3">
                         {item.sub_stage && <span className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-400 border border-slate-200">SUB: {item.sub_stage}</span>}
                         <div>
                           <p className="font-medium text-slate-700 leading-tight">{item.description}</p>
                           <span className="text-[9px] px-1 bg-slate-100 rounded text-slate-500 uppercase">{RESOURCE_TYPE_MAP[item.type]?.label}</span>
                         </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-slate-600">{item.qty} {item.unit}</td>
                    <td className="py-3 px-4 text-right text-sm text-slate-500">{formatCurrency(item.unit_cost)}</td>
                    <td className="py-3 px-6 text-right text-sm font-bold text-slate-800">
                      <div className="flex items-center justify-end gap-2">
                         {formatCurrency(item.subtotal)}
                         <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                           <button onClick={() => { setForm({sequence_id: item.sequence_id || '', stage_id: item.stage_id || '', stage_name: item.stage, sub_stage: item.sub_stage || '', description: item.description, resource_type: item.type, unit: item.unit, qty: item.qty, unit_cost: item.unit_cost}); setEditingId(item.id); setShowAdd(true); }} className="p-1 hover:text-blue-600"><Edit3 className="w-3.5 h-3.5" /></button>
                           <button onClick={() => { if(confirm("Deseja excluir?")){ deleteBudgetItem(item.id); onRefresh(); }}} className="p-1 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                         </div>
                      </div>
                    </td>
                  </tr>
                )})}
              </React.Fragment>
            )})}
            {Object.keys(grouped).length === 0 && (
              <tr>
                <td colSpan={5} className="py-20 text-center text-slate-400 italic text-sm">
                  O orçamento está vazio. Adicione itens para começar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===================== TAB: COMPRAS OBRAS ===================== */
function ComprasTab({ budgetItems, stages }) {
  const grouped = {};
  
  // Categorizar por alertas de compra (30d, 15d) ou Realizado
  const today = new Date();
  
  const itemsWithAlerts = budgetItems.map(i => {
    const stage = stages.find(s => s.id === i.stage_id);
    if (!stage) return { ...i, alert: null };
    
    const startDate = stage.planned_start ? new Date(stage.planned_start) : null;
    const diffDays = startDate ? Math.ceil((startDate - today) / (1000 * 60 * 60 * 24)) : null;
    
    let alert = null;
    if (diffDays !== null && !i.actual && i.type === 'MAT') {
       if (diffDays <= 15) alert = { color: 'red', text: 'CRÍTICO' };
       else if (diffDays <= 30) alert = { color: 'amber', text: 'ATENÇÃO' };
    }
    return { ...i, alert, stage_wbs: stage.wbs, stage_display: stage.name };
  });

  const purchasedItems = itemsWithAlerts.filter(i => (i.actual && i.actual > 0) || i.alert);
  
  purchasedItems.forEach(i => {
    const key = i.stage_display || i.stage;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(i);
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
         <h3 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-2">
           <DollarSign className="w-4 h-4 text-emerald-600" /> 
           Gestão de Compras e Alertas de Provisão
         </h3>
         <div className="flex gap-4">
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">Pago: {formatCurrency(budgetItems.reduce((s,i) => s + (i.actual || 0), 0))}</span>
            <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-1 rounded">Pendente: {formatCurrency(budgetItems.reduce((s,i) => s + (i.actual ? 0 : i.subtotal), 0))}</span>
         </div>
      </div>
      <table className="w-full">
        <thead className="bg-slate-50/80">
          <tr>
            <th className="text-left text-[11px] font-bold text-slate-500 uppercase py-3 px-6">Item / Etapa</th>
            <th className="text-center text-[11px] font-bold text-slate-500 uppercase py-3 px-4">Status / Alerta</th>
            <th className="text-right text-[11px] font-bold text-slate-500 uppercase py-3 px-6">Valor</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {Object.entries(grouped).map(([stage, items]) => (
            <React.Fragment key={stage}>
               <tr className="bg-slate-50/20">
                 <td colSpan={3} className="py-2 px-6 text-[10px] font-bold text-slate-400 uppercase">
                    {items[0].stage_wbs && <span className="mr-2 text-blue-500">{items[0].stage_wbs}</span>}
                    {stage}
                 </td>
               </tr>
               {items.map(item => (
                 <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-6">
                      <p className="text-sm font-medium text-slate-700">{item.description}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        {item.resource_type === 'MAT' ? '📦 Material' : '👷 Mão de Obra'} 
                        {item.supplier && ` • ${item.supplier}`}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-center">
                       {item.actual ? (
                         <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">PAGO</span>
                       ) : item.alert ? (
                         <span className={`text-[9px] font-bold text-${item.alert.color}-600 bg-${item.alert.color}-50 px-2 py-1 rounded-full border border-${item.alert.color}-100 animate-pulse`}>
                           COMPRAR EM {item.alert.text}
                         </span>
                       ) : (
                         <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full border border-slate-100">PROGRAMADO</span>
                       )}
                    </td>
                    <td className="py-3 px-6 text-right">
                       <p className={`text-sm font-bold ${item.actual ? 'text-emerald-700' : 'text-slate-700'}`}>
                         {formatCurrency(item.actual || item.subtotal)}
                       </p>
                       <p className="text-[9px] text-slate-400">{item.qty} {item.unit} x {formatCurrency(item.unit_cost)}</p>
                    </td>
                 </tr>
               ))}
            </React.Fragment>
          ))}
          {purchasedItems.length === 0 && <tr><td colSpan={3} className="py-20 text-center text-slate-400 italic">Nenhum item relevante no momento.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

/* ===================== TAB: GANTT ===================== */
function GanttTab({ stages }) {
  const allDates = stages.flatMap(s => [new Date(s.planned_start), new Date(s.planned_end)]).filter(d => !isNaN(d));
  if (allDates.length === 0) return <div className="p-20 text-center text-slate-400">Datas não definidas para gerar o Gantt.</div>;
  
  const minDate = new Date(Math.min(...allDates));
  const maxDate = new Date(Math.max(...allDates));
  const totalDays = Math.max(1, Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24)) + 1);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in duration-700">
      <div className="p-6 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
         <div>
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest">Cronograma de Execução</h3>
            <p className="text-[10px] text-slate-400 mt-1 font-bold">Baseado no planejamento de suprimentos</p>
         </div>
         <div className="flex gap-4 text-[10px] font-black uppercase text-slate-400">
            <span className="flex items-center gap-2"><div className="w-2 h-2 bg-red-600 rounded-sm shadow-sm shadow-red-200"/> Em Andamento</span>
            <span className="flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-sm shadow-sm shadow-emerald-200"/> Concluído</span>
         </div>
      </div>

      <div className="overflow-x-auto p-8">
        <div className="min-w-[900px] space-y-5">
          {stages.map((s, idx) => {
             const start = new Date(s.planned_start);
             const end = new Date(s.planned_end);
             const offset = Math.max(0, Math.ceil((start - minDate) / (1000 * 60 * 60 * 24)));
             const duration = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
             const left = (offset / totalDays) * 100;
             const width = (duration / totalDays) * 100;
             const progress = Number(s.progress_pct) || 0;

             return (
               <div key={s.id} className="relative group flex items-center h-12">
                 <div className="w-48 pr-4">
                    <p className="text-[10px] font-black text-slate-300 mb-0.5 uppercase">Etapa 0{idx + 1}</p>
                    <p className="text-sm font-bold text-slate-700 truncate" title={s.name}>{s.name}</p>
                 </div>
                 
                 <div className="flex-1 bg-slate-50/50 h-6 rounded-full relative overflow-hidden group-hover:bg-slate-100/50 transition-colors">
                    {/* Visual Bar */}
                    <div 
                      className={`absolute h-full rounded-full shadow-lg transition-all duration-1000 origin-left border border-white/20 ${
                        s.status === 'concluida' ? 'bg-emerald-500' : 'bg-red-700'
                      }`} 
                      style={{ left: `${left}%`, width: `${width}%` }}
                    >
                      {/* Inner Progress Shimmer */}
                      <div className="h-full bg-white/20 relative" style={{ width: `${progress}%` }}>
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
                      </div>
                      
                      {/* Tooltip on Hover */}
                      <div className="absolute opacity-0 group-hover:opacity-100 -top-12 bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-xl z-20 whitespace-nowrap shadow-2xl transition-all duration-300 pointer-events-none" 
                           style={{ left: '50%', transform: 'translateX(-50%)' }}>
                        <p className="font-black text-white">{s.name}</p>
                        <p className="opacity-70">{s.planned_start} ➔ {s.planned_end}</p>
                        <p className="text-red-400 font-bold mt-1">Progresso: {progress}%</p>
                      </div>
                    </div>
                 </div>

                 {/* Progress Label */}
                 <div className="w-16 pl-4 text-right">
                    <span className={`text-[10px] font-black ${s.status === 'concluida' ? 'text-emerald-600' : 'text-slate-400'}`}>
                       {progress}%
                    </span>
                 </div>
               </div>
             );
          })}
        </div>
      </div>
      
      {/* Timeline Footer Axis */}
      <div className="px-8 pb-8 flex justify-between text-[10px] font-black text-slate-300 uppercase tracking-widest border-t border-slate-50 pt-4">
         <span>Início: {minDate.toLocaleDateString('pt-BR')}</span>
         <span>Redville Obras - Cronograma Automático</span>
         <span>Fim: {maxDate.toLocaleDateString('pt-BR')}</span>
      </div>
    </div>
  );
}

/* ===================== COMPONENTS ===================== */
function MiniKPI({ label, value }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-50">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-lg font-bold text-slate-800 mt-1">{value}</p>
    </div>
  );
}

function FinancialMiniCard({ label, value, color }) {
  const colors = {
    blue: 'border-l-blue-500',
    emerald: 'border-l-emerald-500',
    red: 'border-l-red-500',
    amber: 'border-l-amber-500',
  };
  return (
    <div className={`bg-white p-4 rounded-xl shadow-sm border-l-4 ${colors[color]}`}>
      <p className="text-[10px] font-bold text-slate-400 uppercase">{label}</p>
      <p className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(value)}</p>
    </div>
  );
}
