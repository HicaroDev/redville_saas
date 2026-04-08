import { useState } from 'react';
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

function App() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState('all');
  const [openProjectCode, setOpenProjectCode] = useState(null);

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
        // Se clicar no pai 'cadastros', abre fornecedores por padrão
        const targetType = activeMenu === 'cadastros' ? 'fornecedores' : activeMenu;
        return <CadastroGeral type={targetType} />;
      case 'configuracoes':
      case 'configurações':
        return <SettingsPage />;
      default:
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-700">Página em Construção</p>
              <p className="text-sm text-slate-400 mt-1">A opção "{activeMenu}" está sendo preparada para você.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50/30">
      <Sidebar activePage={activeMenu} onMenuChange={(id) => { setActiveMenu(id); setOpenProjectCode(null); }} />
      <div className="flex-1 lg:ml-64 transition-all duration-300">
        <Topbar
          selectedProject={selectedProject}
          onProjectChange={setSelectedProject}
        />
        <main className="p-6 max-w-[1440px] mx-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default App;
