import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { useAllStages, useBudgetItems } from '../hooks/useData';

const STATUS_MAP = {
  em_andamento: { label: 'Em andamento' },
  concluida: { label: 'Concluída' },
  pausada: { label: 'Pausada' },
  nao_iniciada: { label: 'Não iniciada' },
  atrasada: { label: 'Atrasada' },
};

const COLORS = {
  concluida: '#10B981',
  em_andamento: '#2563EB',
  atrasada: '#EF4444',
  nao_iniciada: '#CBD5E1',
};

export default function EvolucaoPage() {
  const { stages, loading: loadingS } = useAllStages();
  const { items: budgetItems, loading: loadingB } = useBudgetItems('all');

  if (loadingS || loadingB) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stagesGLP1 = stages.filter(s => s.project_code === 'GLP1');

  // Progress chart data
  const chartData = stagesGLP1.map(s => ({
    name: s.name.length > 12 ? s.name.substring(0, 12) + '…' : s.name,
    progresso: Number(s.progress_pct),
    fullName: s.name,
  }));

  // Status distribution for pie chart
  const statusCounts = {};
  stagesGLP1.forEach(s => {
    statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
  });
  const pieData = Object.entries(statusCounts).map(([status, count]) => ({
    name: STATUS_MAP[status]?.label || status,
    value: count,
    color: COLORS[status] || '#CBD5E1',
  }));

  const totalStages = stagesGLP1.length;
  const completedStages = stagesGLP1.filter(s => s.status === 'concluida').length;
  const delayedStages = stagesGLP1.filter(s => s.status === 'atrasada').length;
  const avgProgress = totalStages > 0 ? Math.round(stagesGLP1.reduce((s, st) => s + Number(st.progress_pct), 0) / totalStages) : 0;

  // Compute financial progress from real budget data
  const totalOrcado = budgetItems.reduce((s, i) => s + (i.subtotal || 0), 0);
  const totalRealizado = budgetItems.reduce((s, i) => s + (i.actual || 0), 0);
  const financialProgress = totalOrcado > 0 ? Math.round((totalRealizado / totalOrcado) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Evolução da Obra</h1>
        <p className="text-sm text-slate-500 mt-1">Acompanhamento físico e financeiro — GLP1</p>
      </div>

      {/* Dual Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ProgressCard
          title="Progresso Físico"
          value={avgProgress}
          subtitle={`${completedStages} de ${totalStages} etapas concluídas`}
          color="#2563EB"
        />
        <ProgressCard
          title="Progresso Financeiro"
          value={financialProgress}
          subtitle="Baseado no orçado vs realizado"
          color="#10B981"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Bar Chart: Progress per stage */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Progresso por Etapa (%)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `${v}%`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={120} />
              <Tooltip
                formatter={(value) => [`${value}%`, 'Progresso']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
              />
              <Bar dataKey="progresso" fill="#2563EB" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart: Status distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Distribuição de Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '13px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <span className="font-medium text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">Cronograma Detalhado</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider py-3.5 px-6">Etapa</th>
                <th className="text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider py-3.5 px-4">Duração</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider py-3.5 px-4">Início Plan.</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider py-3.5 px-4">Fim Plan.</th>
                <th className="text-center text-[11px] font-semibold text-slate-500 uppercase tracking-wider py-3.5 px-4">% Concluído</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider py-3.5 px-4">Status</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider py-3.5 px-4">Responsável</th>
              </tr>
            </thead>
            <tbody>
              {stagesGLP1.map(stage => {
                const statusInfo = STATUS_MAP[stage.status];
                return (
                  <tr key={stage.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2">
                        {stage.is_critical && <span className="w-1.5 h-1.5 bg-red-500 rounded-full" title="Caminho Crítico" />}
                        <span className="text-sm font-medium text-slate-800">{stage.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center text-sm text-slate-600">{stage.duration_days}d</td>
                    <td className="py-3.5 px-4 text-sm text-slate-500">{stage.planned_start}</td>
                    <td className="py-3.5 px-4 text-sm text-slate-500">{stage.planned_end}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${stage.progress_pct}%`,
                              backgroundColor: COLORS[stage.status] || '#2563EB'
                            }}
                          />
                        </div>
                        <span className="text-xs text-slate-500 w-8">{stage.progress_pct}%</span>
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

function ProgressCard({ title, value, subtitle, color }) {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm flex items-center gap-6">
      <div className="relative w-32 h-32 flex-shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r={radius} fill="none" stroke="#F1F5F9" strokeWidth="8" />
          <circle
            cx="64" cy="64" r={radius} fill="none"
            stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-slate-900">{value}%</span>
        </div>
      </div>
      <div>
        <p className="text-lg font-semibold text-slate-800">{title}</p>
        <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}
