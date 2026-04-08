import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardPage from './pages/Dashboard';
import ObrasPage from './pages/Obras';
import ObraDetalhe from './pages/ObraDetalhe';
import CentrosCustoPage from './pages/CentrosCusto';
import LivroCaixaPage from './pages/LivroCaixa';
import EvolucaoPage from './pages/Evolucao';
import LancamentosPage from './pages/Lancamentos';
import CadastroGeral from './pages/CadastroGeral';
import SettingsPage from './pages/Settings';
import LoginPage from './pages/Login';

function App() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState('all');
  const [openProjectCode, setOpenProjectCode] = useState(null);
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setInitializing(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleOpenProject = (code) => {
    setOpenProjectCode(code);
    setActiveMenu('obra-detalhe');
  };

  const handleBackToObras = () => {
    setOpenProjectCode(null);
    setActiveMenu('obras');
  };

  const renderPage = () => {
    if (activeMenu === 'obra-detalhe' && openProjectCode) {
      return <ObraDetalhe projectCode={openProjectCode} onBack={handleBackToObras} />;
    }

    switch (activeMenu) {
      case 'dashboard':
        return <DashboardPage />;
      case 'obras':
        return <ObrasPage onOpenProject={handleOpenProject} />;
      case 'centros-custo':
      case 'centros':
        return <CentrosCustoPage />;
      case 'livro-caixa':
      case 'caixa':
        return <LivroCaixaPage />;
      case 'lancamentos':
        return <LancamentosPage />;
      case 'evolucao':
        return <EvolucaoPage />;
      case 'cadastros':
      case 'fornecedores':
      case 'prestadores':
      case 'funcionarios':
      case 'materiais':
      case 'clientes':
        const targetType = activeMenu === 'cadastros' ? 'fornecedores' : activeMenu;
        return <CadastroGeral type={targetType} />;
      case 'configuracoes':
      case 'configurações':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-red-700 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return <LoginPage onLoginSuccess={(user) => setSession({ user })} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50/30">
      <Sidebar activePage={activeMenu} onMenuChange={(id) => { setActiveMenu(id); setOpenProjectCode(null); }} />
      <div className="flex-1 lg:ml-64 transition-all duration-300">
        <Topbar
          selectedProject={selectedProject}
          onProjectChange={setSelectedProject}
          user={session.user}
        />
        <main className="p-6 max-w-[1440px] mx-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
