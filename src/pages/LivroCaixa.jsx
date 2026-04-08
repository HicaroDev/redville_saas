import { Filter, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useCashbook } from '../hooks/useData';

function formatCurrency(value) {
  if (value == null) return '—';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(value);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getPaymentMethodColor(source) {
  if (!source) return 'bg-slate-100 text-slate-500';
  if (source.includes('PIX')) return 'bg-emerald-50 text-emerald-700';
  if (source.includes('DINHEIRO')) return 'bg-amber-50 text-amber-700';
  if (source.includes('DEBITO') || source.includes('DÉBITO')) return 'bg-blue-50 text-blue-700';
  return 'bg-slate-100 text-slate-500';
}

export default function LivroCaixaPage() {
  const { entries, loading } = useCashbook('all');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalEntradas = entries.reduce((s, e) => s + (e.total_in || 0), 0);
  const totalSaidas = entries.reduce((s, e) => s + (e.total_out || 0), 0);
  const saldo = totalEntradas - totalSaidas;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Livro Caixa</h1>
          <p className="text-sm text-slate-500 mt-1">Controle consolidado — Supabase 🟢</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">
            <Filter className="w-4 h-4" /> Filtrar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">
            <Download className="w-4 h-4" /> Exportar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-2 border-l-emerald-500">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Entradas</p>
          <div className="flex items-center gap-2 mt-1">
            <ArrowDownRight className="w-5 h-5 text-emerald-500" />
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalEntradas)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-2 border-l-red-500">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Saídas</p>
          <div className="flex items-center gap-2 mt-1">
            <ArrowUpRight className="w-5 h-5 text-red-500" />
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalSaidas)}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-2 border-l-blue-600">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Saldo</p>
          <p className={`text-2xl font-bold mt-1 ${saldo < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {formatCurrency(saldo)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Lançamentos</h3>
          <span className="text-xs text-slate-400">{entries.length} registros</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider py-3.5 px-6">ID</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider py-3.5 px-4">Data</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider py-3.5 px-4">Descrição</th>
                <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider py-3.5 px-4">Origem</th>
                <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider py-3.5 px-4">QTD</th>
                <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider py-3.5 px-4">Valor UN</th>
                <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider py-3.5 px-6">Total Saída</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-6 text-sm text-slate-400 font-mono">{entry.sequence_id}</td>
                  <td className="py-3.5 px-4 text-sm text-slate-600">{formatDate(entry.date)}</td>
                  <td className="py-3.5 px-4">
                    <p className="text-sm font-medium text-slate-800">{entry.description}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded ${getPaymentMethodColor(entry.origin)}`}>
                      {entry.origin}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-sm text-slate-600">{entry.qty}</td>
                  <td className="py-3.5 px-4 text-right text-sm text-slate-600">{formatCurrency(entry.unit_value)}</td>
                  <td className="py-3.5 px-6 text-right text-sm font-semibold text-red-600">
                    {formatCurrency(entry.total_out)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
