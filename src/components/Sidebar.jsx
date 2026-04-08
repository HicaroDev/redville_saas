import { useState } from 'react';
import { 
  BarChart3, 
  Building2, 
  Wallet, 
  History, 
  Calculator, 
  Settings, 
  ChevronDown, 
  Menu, 
  X,
  Plus,
  Truck,
  Briefcase,
  User,
  FileText,
  Users
} from 'lucide-react';

export default function Sidebar({ activePage, onMenuChange }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showCadastros, setShowCadastros] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const SidebarItem = ({ icon: Icon, label, active, onClick, isChild = false, future = false }) => (
    <button
      onClick={onClick}
      disabled={future}
      className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-all
        ${active 
          ? 'text-red-800 bg-red-50 border-r-2 border-red-700' 
          : future 
            ? 'text-gray-400 cursor-not-allowed' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }
        ${isChild ? 'pl-12 text-xs' : ''}
      `}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-red-700' : ''}`} />
      {!collapsed && <span>{label}</span>}
      {future && !collapsed && <span className="ml-auto text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400">Breve</span>}
    </button>
  );

  return (
    <>
      <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden fixed bottom-4 right-4 z-50 p-4 bg-red-700 text-white rounded-full shadow-lg">
        {isSidebarOpen ? <X /> : <Menu />}
      </button>

      <aside className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200 transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-64'}
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Redville" className="h-8 w-auto" onError={(e) => e.target.style.display='none'} />
                <span className="font-bold text-slate-800 tracking-tight">REDVILLE</span>
              </div>
            )}
            <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400">
              <Menu className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 space-y-1">
            <SidebarItem icon={BarChart3} label="Dashboard" active={activePage === 'dashboard'} onClick={() => onMenuChange('dashboard')} />
            <SidebarItem icon={Building2} label="Obras" active={activePage === 'obras'} onClick={() => onMenuChange('obras')} />
            <SidebarItem icon={Wallet} label="Centros de Custo" active={activePage === 'centros-custo'} onClick={() => onMenuChange('centros-custo')} />
            <SidebarItem icon={History} label="Lançamentos" active={activePage === 'lancamentos'} onClick={() => onMenuChange('lancamentos')} />
            <SidebarItem icon={Calculator} label="Livro Caixa" active={activePage === 'livro-caixa'} onClick={() => onMenuChange('livro-caixa')} />
            
            <div className="space-y-1">
              <button 
                onClick={() => setShowCadastros(!showCadastros)}
                className={`w-full flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all`}
              >
                <Settings className="w-4 h-4" />
                {!collapsed && (
                  <>
                    <span>Cadastro Geral</span>
                    <ChevronDown className={`ml-auto w-4 h-4 transition-transform ${showCadastros ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>

              {showCadastros && !collapsed && (
                <div className="bg-slate-50/50 py-1 transition-all animate-in fade-in slide-in-from-top-2 duration-300">
                  <SidebarItem icon={Truck} label="Fornecedores" isChild active={activePage === 'fornecedores'} onClick={() => onMenuChange('fornecedores')} />
                  <SidebarItem icon={Briefcase} label="Prestadores" isChild active={activePage === 'prestadores'} onClick={() => onMenuChange('prestadores')} />
                  <SidebarItem icon={User} label="Funcionários" isChild active={activePage === 'funcionarios'} onClick={() => onMenuChange('funcionarios')} />
                  <SidebarItem icon={FileText} label="Materiais" isChild active={activePage === 'materiais'} onClick={() => onMenuChange('materiais')} />
                  <SidebarItem icon={Building2} label="Clientes" isChild active={activePage === 'clientes'} onClick={() => onMenuChange('clientes')} />
                </div>
              )}
            </div>

            <SidebarItem icon={Settings} label="Configurações" active={activePage === 'configurações'} onClick={() => onMenuChange('configurações')} />
          </nav>
        </div>
      </aside>
    </>
  );
}
