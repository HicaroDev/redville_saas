import { useState } from 'react';
import { Filter, Download, ArrowUpRight, ArrowDownRight, Wallet as WalletIcon } from 'lucide-react';
import { useCashbook, useProjects, useWallets } from '../hooks/useData';

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
  const [filterProject, setFilterProject] = useState('all');
  const [filterWallet, setFilterWallet] = useState('all');
  const { entries, loading } = useCashbook(filterProject);
  const { projects } = useProjects();
  const { wallets } = useWallets();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const filteredEntries = filterWallet === 'all' 
    ? entries 
    : entries.filter(e => e.wallet_id === filterWallet);

  const totalEntradas = filteredEntries.reduce((s, e) => s + (e.total_in || 0), 0);
  const totalSaidas = filteredEntries.reduce((s, e) => s + (e.total_out || 0), 0);
  const saldo = totalEntradas - totalSaidas;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="rv-header border-none">Livro Caixa</h1>
          <p className="text-sm text-slate-500 font-medium italic mt-1">Consolidação de fluxos financeiros</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
             <Filter className="w-3.5 h-3.5 text-slate-400" />
             <select 
               className="text-xs font-bold text-slate-700 outline-none bg-transparent"
               value={filterProject}
               onChange={(e) => setFilterProject(e.target.value)}
             >
               <option value="all">Todas Obras</option>
               {projects.map(p => (
                 <option key={p.id} value={p.code}>{p.code}</option>
               ))}
             </select>
          </div>

          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-sm">
             <WalletIcon className="w-3.5 h-3.5 text-slate-400" />
             <select 
               className="text-xs font-bold text-slate-700 outline-none bg-transparent"
               value={filterWallet}
               onChange={(e) => setFilterWallet(e.target.value)}
             >
               <option value="all">Todos Centros</option>
               {wallets.map(w => (
                 <option key={w.id} value={w.id}>{w.name}</option>
               ))}
             </select>
          </div>

          <button className="btn-primary-gradient flex items-center gap-2 px-4 py-2 shadow-lg shadow-red-100">
            <Download className="w-4 h-4" /> Exportar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rv-card border-l-4 border-l-emerald-500 flex items-center justify-between p-6">
          <div>
            <p className="rv-label text-[10px] mb-1">Total Entradas</p>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalEntradas)}</p>
          </div>
          <ArrowDownRight className="w-8 h-8 text-emerald-100" />
        </div>
        <div className="rv-card border-l-4 border-l-red-500 flex items-center justify-between p-6">
          <div>
            <p className="rv-label text-[10px] mb-1">Total Saídas</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalSaidas)}</p>
          </div>
          <ArrowUpRight className="w-8 h-8 text-red-100" />
        </div>
        <div className="rv-card border-l-4 border-l-slate-900 flex items-center justify-between p-6">
          <div>
            <p className="rv-label text-[10px] mb-1">Saldo Atual</p>
            <p className={`text-2xl font-bold ${saldo < 0 ? 'text-red-700' : 'text-slate-900'}`}>{formatCurrency(saldo)}</p>
          </div>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${saldo < 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Registros Detalhados</h3>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase italic">{filteredEntries.length} itens</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="rv-label py-4 px-6 text-[10px]">ID</th>
                <th className="rv-label py-4 px-4 text-[10px]">Data</th>
                <th className="rv-label py-4 px-4 text-[10px]">Obra</th>
                <th className="rv-label py-4 px-4 text-[10px]">Centro de Custo</th>
                <th className="rv-label py-4 px-4 text-[10px]">Histórico</th>
                <th className="rv-label py-4 px-4 text-[10px]">Origem</th>
                <th className="rv-label py-4 px-4 text-right text-[10px]">Valor UN</th>
                <th className="rv-label py-4 px-6 text-right text-[10px]">Lançamento</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="py-4 px-6 text-xs text-slate-400 font-mono tracking-tighter opacity-50 group-hover:opacity-100">{entry.sequence_id}</td>
                  <td className="py-4 px-4 text-xs font-semibold text-slate-500">{formatDate(entry.date)}</td>
                  <td className="py-4 px-4">
                     <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-bold text-slate-900 rounded-md border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-all">{entry.projects?.code || '—'}</span>
                  </td>
                  <td className="py-4 px-4 text-xs font-bold text-red-700/70">{entry.wallets?.name || '—'}</td>
                  <td className="py-4 px-4">
                    <p className="text-xs font-bold text-slate-800 leading-tight">{entry.description}</p>
                    <p className="text-[9px] text-slate-400 italic font-medium">{entry.payer_name ? `Pago por: ${entry.payer_name}` : ''}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md tracking-tighter shadow-sm ${getPaymentMethodColor(entry.origin)}`}>
                      {entry.origin}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right text-xs text-slate-500 font-medium">{formatCurrency(entry.unit_value)}</td>
                  <td className={`py-4 px-6 text-right text-sm font-bold ${entry.total_out > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {entry.total_out > 0 ? `- ${formatCurrency(entry.total_out)}` : `+ ${formatCurrency(entry.total_in)}`}
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

const DollarSign = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="2" y2="22"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
);
