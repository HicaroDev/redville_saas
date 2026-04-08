import { Search, Bell, ChevronDown } from 'lucide-react';
import { PROJECTS } from '../data/mockData';

export default function Topbar({ selectedProject, onProjectChange }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
      {/* Left: Search */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar obra, etapa, lançamento..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Center section removed as requested */}
      <div className="flex-1"></div>

      {/* Right: Notifications + Avatar */}
      <div className="flex items-center gap-4 flex-1 justify-end">
        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-2 pl-4 border-l border-slate-200">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            E
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-700">Elton</p>
            <p className="text-xs text-slate-400">Admin</p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </header>
  );
}
