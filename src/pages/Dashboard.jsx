import {
  Building2, Wallet, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useProjects, useAllStages, useBudgetItems, useCashbook } from '../hooks/useData';

const STATUS_MAP = {
  em_andamento: { label: 'Em andamento', color: 'blue' },
  concluida: { label: 'Concluída', color: 'emerald' },
  pausada: { label: 'Pausada', color: 'amber' },
  nao_iniciada: { label: 'Não iniciada', color: 'slate' },
  atrasada: { label: 'Atrasada', color: 'red' },
};

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(value);
}

export default function DashboardPage() {
  const { projects, loading: loadingP } = useProjects();
  const { stages, loading: loadingS } = useAllStages();
  const { items: budgetItems, loading: loadingB } = useBudgetItems('all');
  const { entries: cashEntries, loading: loadingC } = useCashbook('all');

  if (loadingP || loadingS || loadingB) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-slate-500">Carregando dados...</p>
        </div>
      </div>
    );
  }

  // Agrupar orçamento por etapa
  const grouped = {};
  budgetItems.forEach((item) => {
    if (!grouped[item.stage]) grouped[item.stage] = { stage: item.stage, orcado: 0, realizado: 0 };
    grouped[item.stage].orcado += item.subtotal || 0;
    grouped[item.stage].realizado += item.actual || 0;
  });
  const chartData = Object.values(grouped).filter(g => g.orcado > 0 || g.realizado > 0);

  const totalOrcado = budgetItems.reduce((s, i) => s + (i.subtotal || 0), 0);
  const totalRealizado = budgetItems.reduce((s, i) => s + (i.actual || 0), 0);

  const totalSaidas = cashEntries.reduce((s, e) => s + (e.total_out || 0), 0);
  const totalEntradas = cashEntries.reduce((s, e) => s + (e.total_in || 0), 0);
  const saldoCaixa = totalEntradas - totalSaidas;

  const stagesGLP1 = stages.filter(s => s.project_code === 'GLP1');
  const concluidas = stagesGLP1.filter(s => s.status === 'concluida').length;
  const atrasadas = stagesGLP1.filter(s => s.status === 'atrasada').length;
  const progressoMedio = stagesGLP1.length > 0
    ? Math.round(stagesGLP1.reduce((s, st) => s + Number(st.progress_pct), 0) / stagesGLP1.length)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Visão geral de todas as obras — dados em tempo real do Supabase</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard
          title="Obras Ativas"
          value={projects.length}
          subtitle={`${concluidas} etapas concluídas`}
          icon={<Building2 className="w-5 h-5" />}
          iconBg="bg-blue-50" iconColor="text-blue-600"
        />
        <KPICard
          title="Orçamento Total"
          value={formatCurrency(projects.reduce((s, p) => s + Number(p.budget_total), 0))}
          subtitle={`${formatCurrency(totalRealizado)} gasto`}
          icon={<Wallet className="w-5 h-5" />}
          iconBg="bg-emerald-50" iconColor="text-emerald-600"
          trend={totalOrcado > 0 ? (totalRealizado < totalOrcado ? 'down' : 'up') : undefined}
          trendLabel={totalOrcado > 0 ? `${Math.round((totalRealizado / totalOrcado) * 100)}% do orçado` : ''}
        />
        <KPICard
          title="Saídas Caixa"
          value={formatCurrency(totalSaidas)}
          subtitle={`Saldo: ${formatCurrency(saldoCaixa)}`}
          icon={<TrendingUp className="w-5 h-5" />}
          iconBg="bg-red-50" iconColor="text-red-600"
          negative
        />
        <KPICard
          title="Progresso Médio"
          value={`${progressoMedio}%`}
          subtitle={`${atrasadas} etapa(s) atrasada(s)`}
          icon={<AlertTriangle className="w-5 h-5" />}
          iconBg={atrasadas > 0 ? "bg-amber-50" : "bg-emerald-50"}
          iconColor={atrasadas > 0 ? "text-amber-600" : "text-emerald-600"}
        />
      </div>

      {/* Charts + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Orçado vs Realizado por Etapa</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="stage" tick={{ fontSize: 11, fill: '#94a3b8' }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(value) => formatCurrency(value)} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="orcado" name="Orçado" fill="#93c5fd" radius={[4, 4, 0, 0]} />
              <Bar dataKey="realizado" name="Realizado" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Alertas</h3>
          <div className="space-y-3">
            {stages.filter(s => s.status === 'atrasada').map(s => (
              <div key={s.id} className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-800">{s.name}</p>
                  <p className="text-xs text-red-600">{s.project_code} • {s.progress_pct}% concluído</p>
                </div>
              </div>
            ))}
            {budgetItems.filter(i => i.actual && i.actual > i.subtotal).map((i, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                <ArrowUpRight className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-800">{i.sub_stage}</p>
                  <p className="text-xs text-amber-600">Orçado: {formatCurrency(i.subtotal)} → Real: {formatCurrency(i.actual)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabela Etapas */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Etapas – GLP1</h3>
          <span className="text-xs text-slate-400">{stagesGLP1.length} etapas • Supabase 🟢</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-6">Etapa</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">Duração</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">Início</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">Fim</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">Progresso</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">Status</th>
                <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider py-3 px-4">Responsável</th>
              </tr>
            </thead>
            <tbody>
              {stagesGLP1.map((stage) => {
                const statusInfo = STATUS_MAP[stage.status];
                return (
                  <tr key={stage.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2">
                        {stage.is_critical && <span className="w-1.5 h-1.5 bg-red-500 rounded-full flex-shrink-0" title="Caminho Crítico"></span>}
                        <span className="text-sm font-medium text-slate-800">{stage.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-slate-600">{stage.duration_days}d</td>
                    <td className="py-3.5 px-4 text-sm text-slate-500">{stage.planned_start}</td>
                    <td className="py-3.5 px-4 text-sm text-slate-500">{stage.planned_end}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${stage.progress_pct >= 100 ? 'bg-emerald-500' : stage.status === 'atrasada' ? 'bg-red-500' : 'bg-blue-500'}`}
                            style={{ width: `${stage.progress_pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-slate-500">{stage.progress_pct}%</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full
                        ${stage.status === 'concluida' ? 'bg-emerald-50 text-emerald-700' : ''}
                        ${stage.status === 'em_andamento' ? 'bg-blue-50 text-blue-700' : ''}
                        ${stage.status === 'atrasada' ? 'bg-red-50 text-red-700' : ''}
                        ${stage.status === 'nao_iniciada' ? 'bg-slate-100 text-slate-500' : ''}
                      `}>
                        {statusInfo?.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-slate-500">{stage.responsible || '—'}</td>
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

function KPICard({ title, value, subtitle, icon, iconBg, iconColor, negative, trend, trendLabel }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center ${iconColor}`}>{icon}</div>
        {trend && (
          <span className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-red-500' : 'text-emerald-500'}`}>
            {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trendLabel}
          </span>
        )}
      </div>
      <p className={`text-2xl font-bold tracking-tight ${negative ? 'text-red-600' : 'text-slate-900'}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-3">{title}</p>
    </div>
  );
}
