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
import UsuariosPage from './pages/Usuarios';
import ClientesPage from './pages/Clientes';
import PrestadoresPage from './pages/Prestadores';
import EstoquePage from './pages/Estoque';

function App() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState('all');
  const [openProjectCode, setOpenProjectCode] = useState(null);
  const [session, setSession] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    async function recoverSession() {
      const savedSession = localStorage.getItem('redville_session');
      if (savedSession) {
        setSession(JSON.parse(savedSession));
        setInitializing(false);
        return;
      }

      const { data: { session: authSession } } = await supabase.auth.getSession();
      if (authSession) {
        setSession(authSession);
      }
      setInitializing(false);
    }

    recoverSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLoginSuccess = (user) => {
    const newSession = { user };
    setSession(newSession);
    localStorage.setItem('redville_session', JSON.stringify(newSession));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    localStorage.removeItem('redville_session');
    setActiveMenu('dashboard');
  };

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
      case 'clientes':
        return <ClientesPage />;
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
      case 'usuarios':
        return <UsuariosPage />;
      case 'evolucao':
        return <EvolucaoPage />;
      case 'cadastros':
      case 'fornecedores':
      case 'funcionarios':
      case 'materiais':
        const targetType = activeMenu === 'cadastros' ? 'fornecedores' : activeMenu;
        return <CadastroGeral type={targetType} />;
      case 'prestadores':
        return <PrestadoresPage />;
      case 'estoque':
        return <EstoquePage />;
      case 'configuracoes':
      case 'configurações':
        return <SettingsPage user={session?.user} />;
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
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50/30 font-inter">
      <Sidebar activePage={activeMenu} onMenuChange={(id) => { setActiveMenu(id); setOpenProjectCode(null); }} />
      <div className="flex-1 lg:ml-64 transition-all duration-300">
        <Topbar
          user={session.user}
          onLogout={handleLogout}
          onOpenPage={setActiveMenu}
        />
        <main className="p-6 max-w-[1440px] mx-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
