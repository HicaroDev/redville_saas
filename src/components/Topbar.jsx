import { Search, Bell, ChevronDown, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Topbar({ user, onLogout }) {
  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      await supabase.auth.signOut();
    }
  };

  const userEmail = user?.email || 'Usuário';
  const userInitial = userEmail.charAt(0).toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar obra, etapa, lançamento..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-700 transition-all font-medium"
          />
        </div>
      </div>

      <div className="flex-1"></div>

      <div className="flex items-center gap-4 flex-1 justify-end">
        <button className="relative p-2 text-slate-400 hover:text-red-700 hover:bg-slate-50 rounded-lg transition-all" title="Notificações">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-600 rounded-full"></span>
        </button>

        <div className="flex items-center gap-2 pl-4 border-l border-slate-200 group relative cursor-pointer">
          <div className="w-9 h-9 bg-red-700 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-red-700/20">
            {userInitial}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-bold text-slate-800 leading-tight">{userEmail.split('@')[0]}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Admin</p>
          </div>
          
          {/* LOGOUT TOOLTIP/MENU */}
          <button 
            onClick={handleLogout}
            className="ml-2 p-2 text-slate-300 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
            title="Sair do Sistema"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
