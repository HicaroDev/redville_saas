import { useState, useEffect } from 'react';
import { 
  Plus, UserCheck, Shield, Mail, Trash2, Edit3, Key, CheckSquare, Loader2, CheckCircle2, Lock, Eye, EyeOff,
  Building2, Wallet, Settings, History, BookOpen, Users, Database, Layout, HardHat, FileText, Calculator
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const ROLES = {
  admin: { label: 'Administrador', color: 'text-red-600 bg-red-50' },
  manager: { label: 'Gestor', color: 'text-blue-600 bg-blue-50' },
  viewer: { label: 'Visualizador', color: 'text-slate-600 bg-slate-50' }
};

const PERMISSION_METADATA = {
  'Visualizar': { icon: Eye },
  'Criar': { icon: Plus },
  'Editar Orçamento': { icon: Calculator },
  'Lançamentos': { icon: History },
  'Livro Caixa': { icon: BookOpen },
  'Pagamentos': { icon: Wallet },
  'Usuários': { icon: Users },
  'Cadastros': { icon: Database },
  'Configurações': { icon: Settings }
};

const DEFAULT_PERMISSIONS = {
  obras: ['Visualizar', 'Criar', 'Editar Orçamento'],
  financeiro: ['Lançamentos', 'Livro Caixa', 'Pagamentos'],
  config: ['Usuários', 'Cadastros', 'Configurações']
};

function PermissionBox({ label, category, modules, selectedPermissions, togglePermission }) {
  const categoryIcons = {
    obras: <HardHat className="w-4 h-4 text-red-600" />,
    financeiro: <Wallet className="w-4 h-4 text-blue-600" />,
    config: <Settings className="w-4 h-4 text-slate-600" />
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
       <div className="bg-slate-50/50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          {categoryIcons[category]}
          <p className="text-[10px] font-semibold text-slate-800 uppercase tracking-widest">{label}</p>
       </div>
       <div className="p-3 space-y-1">
          {modules.map(m => {
            const isChecked = selectedPermissions[category]?.includes(m);
            const Icon = PERMISSION_METADATA[m]?.icon || CheckSquare;
            return (
              <label key={m} className="flex items-center justify-between p-2 rounded-xl cursor-pointer group hover:bg-slate-50 transition-all">
                 <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg transition-colors ${isChecked ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                       <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className={`text-[11px] font-medium transition-colors ${isChecked ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>{m}</span>
                 </div>
                 <input 
                   type="checkbox"
                   className="hidden"
                   checked={isChecked}
                   onChange={() => togglePermission(category, m)}
                 />
                 <div className={`w-8 h-4.5 rounded-full p-0.5 transition-all flex items-center ${isChecked ? 'bg-red-600 justify-end' : 'bg-slate-200 justify-start'}`}>
                    <div className="w-3.5 h-3.5 bg-white rounded-full shadow-sm" />
                 </div>
              </label>
            );
          })}
       </div>
    </div>
  );
}

export default function UsuariosPage() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [users, setUsers] = useState([]);
  const [editingUserId, setEditingUserId] = useState(null);
  const [showPwd, setShowPwd] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'viewer',
    permissions: {
      obras: ['Visualizar'],
      financeiro: [],
      config: []
    }
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) setUsers(data);
    setLoading(false);
  };

  const togglePermission = (category, module) => {
    const current = formData.permissions[category] || [];
    const updated = current.includes(module) 
      ? current.filter(m => m !== module)
      : [...current, module];
    
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [category]: updated
      }
    });
  };

  const handleEdit = (user) => {
    setEditingUserId(user.id);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      password: user.password || '',
      role: user.role,
      permissions: user.permissions || { obras: ['Visualizar'], financeiro: [], config: [] }
    });
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const { error } = await supabase
      .from('profiles')
      .upsert({
        ...(editingUserId ? { id: editingUserId } : {}),
        ...formData
      }, { onConflict: 'email' });

    if (!error) {
      setSuccessMsg(true);
      resetForm();
      fetchUsers();
      setTimeout(() => {
        setSuccessMsg(false);
        setShowForm(false);
      }, 2000);
    } else {
      alert('Erro ao salvar usuário: ' + error.message);
    }
    setSaving(false);
  };

  const resetForm = () => {
    setFormData({ full_name: '', email: '', password: '', role: 'viewer', permissions: { obras: ['Visualizar'], financeiro: [], config: [] } });
    setEditingUserId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja remover este usuário?')) {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (!error) fetchUsers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Gestão de Equipe</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium italic opacity-70">Controle de acessos e segurança da plataforma</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => { resetForm(); setShowForm(true); }} 
            className="btn-primary-gradient px-6 py-2.5 flex items-center gap-2 shadow-lg shadow-red-100 font-semibold rounded-2xl"
          >
            <Plus className="w-4 h-4" /> Novo Membro
          </button>
        )}
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-3xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2 shadow-sm">
           <div className="w-10 h-10 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
           </div>
           <div>
              <p className="text-sm font-semibold text-emerald-900 uppercase tracking-tight">Base de Dados Atualizada!</p>
              <p className="text-xs text-emerald-600 font-medium">As novas chaves de acesso já estão ativas no sistema.</p>
           </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-red-50 animate-in fade-in slide-in-from-top-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-50 rounded-full -mr-32 -mt-32 opacity-20 blur-3xl pointer-events-none" />
          
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-red-700 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-red-100 ring-4 ring-red-50">
              {editingUserId ? <Edit3 className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            </div>
            <div>
               <h3 className="text-xl font-semibold text-slate-800 tracking-tight leading-none">
                 {editingUserId ? 'Editar Acesso do Membro' : 'Novo Membro na Equipe'}
               </h3>
               <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-1">Configuração de Credenciais</p>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-1">Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    className="form-input bg-slate-50/50 border-slate-100 focus:bg-white p-3.5 rounded-2xl font-medium" 
                    placeholder="Nome do usuário" 
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-1">E-mail Corporativo</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="email" 
                      required
                      className="form-input bg-slate-50/50 border-slate-100 focus:bg-white pl-12 p-3.5 rounded-2xl font-medium" 
                      placeholder="contato@redville.com.br" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-1 flex items-center justify-between">
                     <span>Senha de Acesso</span>
                     <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-red-700 hover:opacity-70 transition-opacity">
                        {showPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                     </button>
                  </label>
                  <div className="relative">
                    <input 
                      type={showPwd ? "text" : "password"} 
                      required
                      className="form-input bg-slate-50/50 border-slate-100 focus:bg-white p-3.5 rounded-2xl font-medium tracking-widest" 
                      placeholder="Senha provisória" 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                    <Key className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-1">Nível de Hierarquia</label>
                  <select 
                    className="form-input bg-slate-50/50 border-slate-100 focus:bg-white p-3.5 rounded-2xl font-semibold text-slate-800"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="viewer">Visualizador</option>
                    <option value="manager">Gestor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>

              <div className="lg:col-span-2 bg-slate-50/30 rounded-3xl p-8 border border-slate-100 ring-8 ring-slate-50/50">
                 <div className="flex items-center gap-2 mb-6">
                    <Layout className="w-4 h-4 text-slate-400" />
                    <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Painel de Acessos Granulares</h4>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <PermissionBox 
                      label="Obras" 
                      category="obras"
                      modules={DEFAULT_PERMISSIONS.obras} 
                      selectedPermissions={formData.permissions}
                      togglePermission={togglePermission}
                    />
                    <PermissionBox 
                      label="Financeiro" 
                      category="financeiro"
                      modules={DEFAULT_PERMISSIONS.financeiro} 
                      selectedPermissions={formData.permissions}
                      togglePermission={togglePermission}
                    />
                    <PermissionBox 
                      label="Configurações" 
                      category="config"
                      modules={DEFAULT_PERMISSIONS.config} 
                      selectedPermissions={formData.permissions}
                      togglePermission={togglePermission}
                    />
                 </div>
                 <p className="text-[10px] text-slate-400 mt-6 italic font-medium">Os acessos marcados definem quais menus o usuário poderá visualizar no dashboard.</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-12 pt-8 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => { setShowForm(false); resetForm(); }} 
                className="px-8 py-3 text-sm font-semibold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Descartar
              </button>
              <button 
                type="submit" 
                disabled={saving}
                className="btn-primary-gradient px-10 py-3 flex items-center gap-2 rounded-2xl shadow-xl shadow-red-100 font-semibold"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingUserId ? 'Confirmar Edição' : 'Salvar e Ativar Membro')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-32 flex flex-col items-center justify-center gap-4">
             <div className="w-16 h-16 border-4 border-red-700 border-t-transparent rounded-full animate-spin shadow-lg shadow-red-50"></div>
             <p className="text-sm font-semibold text-slate-900 uppercase tracking-widest mt-2">Sincronizando equipe...</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="text-left text-[11px] font-semibold text-slate-400 uppercase py-6 px-10 tracking-widest">Membro / E-mail</th>
                <th className="text-left text-[11px] font-semibold text-slate-400 uppercase py-6 px-10 tracking-widest">Nível</th>
                <th className="text-left text-[11px] font-semibold text-slate-400 uppercase py-6 px-10 tracking-widest">Acessos</th>
                <th className="text-right text-[11px] font-semibold text-slate-400 uppercase py-6 px-10 tracking-widest">Gerenciar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="py-5 px-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-semibold shadow-inner group-hover:from-red-600 group-hover:to-red-700 group-hover:text-white transition-all duration-500">
                         {user.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-base font-semibold text-slate-800 leading-tight">{user.full_name}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-wider">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5 px-10">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-semibold uppercase tracking-widest shadow-sm ${ROLES[user.role]?.color || 'bg-slate-50 text-slate-400'}`}>
                      {ROLES[user.role]?.label || 'Visualizador'}
                    </span>
                  </td>
                  <td className="py-5 px-10">
                    <div className="flex items-center gap-1.5 flex-wrap">
                       {Object.keys(user.permissions || {}).map(cat => (
                         user.permissions[cat]?.length > 0 && (
                           <span key={cat} className="text-[10px] font-medium text-slate-400 bg-slate-100/50 px-2 py-1 rounded-lg uppercase tracking-tight group-hover:bg-white group-hover:text-red-700 group-hover:border group-hover:border-red-100 transition-all duration-300">
                             {cat}
                           </span>
                         )
                       ))}
                    </div>
                  </td>
                  <td className="py-5 px-10 text-right">
                     <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(user)}
                          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-700 hover:bg-white hover:shadow-xl hover:shadow-red-700/5 rounded-2xl transition-all"
                        >
                          <Edit3 className="w-4.5 h-4.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-white hover:shadow-xl hover:shadow-red-700/5 rounded-2xl transition-all"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
