import { useState, useEffect } from 'react';
import { Plus, UserCheck, Shield, Mail, Trash2, Edit3, Key, CheckSquare, Loader2, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ROLES = {
  admin: { label: 'Administrador', color: 'text-red-600 bg-red-50' },
  manager: { label: 'Gestor', color: 'text-blue-600 bg-blue-50' },
  viewer: { label: 'Visualizador', color: 'text-slate-600 bg-slate-50' }
};

const DEFAULT_PERMISSIONS = {
  obras: ['Visualizar', 'Criar', 'Editar Orçamento'],
  financeiro: ['Lançamentos', 'Livro Caixa', 'Pagamentos'],
  config: ['Usuários', 'Cadastros', 'Configurações']
};

function PermissionBox({ label, category, modules, selectedPermissions, togglePermission }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
       <p className="text-[10px] font-bold text-slate-800 uppercase mb-3 border-b border-slate-50 pb-2">{label}</p>
       <div className="space-y-2">
          {modules.map(m => {
            const isChecked = selectedPermissions[category]?.includes(m);
            return (
              <label key={m} className="flex items-center gap-2 cursor-pointer group">
                 <input 
                   type="checkbox"
                   className="hidden"
                   checked={isChecked}
                   onChange={() => togglePermission(category, m)}
                 />
                 <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center 
                   ${isChecked ? 'bg-red-600 border-red-600 shadow-sm shadow-red-200' : 'border-slate-300 bg-white group-hover:border-red-400'}`}>
                    {isChecked && <CheckSquare className="w-3 h-3 text-white" />}
                 </div>
                 <span className={`text-xs transition-colors ${isChecked ? 'text-slate-900 font-bold' : 'text-slate-500 group-hover:text-slate-700'}`}>{m}</span>
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Gestão de Usuários</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Níveis de acesso e senhas configuradas pelo administrador</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => { resetForm(); setShowForm(true); }} 
            className="btn-primary-gradient flex items-center gap-2 shadow-lg shadow-red-100 font-bold"
          >
            <Plus className="w-4 h-4" /> Novo Usuário
          </button>
        )}
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 shadow-sm">
           <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
           </div>
           <div>
              <p className="text-sm font-bold text-emerald-900">Configurações Salvas!</p>
              <p className="text-xs text-emerald-600">O usuário já pode logar com estas credenciais.</p>
           </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-red-50 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-red-50 text-red-700 rounded-xl flex items-center justify-center shadow-sm">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">
              {editingUserId ? 'Editar Acesso do Usuário' : 'Configurar Novo Acesso'}
            </h3>
          </div>

          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    className="form-input" 
                    placeholder="Nome do usuário" 
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">E-mail Corporativo</label>
                  <input 
                    type="email" 
                    required
                    className="form-input" 
                    placeholder="contato@redville.com.br" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center justify-between">
                     <span>Senha de Acesso</span>
                     <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-red-600 hover:text-red-700 underline capitalize">
                        {showPwd ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                     </button>
                  </label>
                  <div className="relative">
                    <input 
                      type={showPwd ? "text" : "password"} 
                      required
                      className="form-input pr-10" 
                      placeholder="Defina a senha do funcionário" 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                    <Key className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Perfil de Acesso</label>
                  <select 
                    className="form-input font-bold"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="viewer">Visualizador</option>
                    <option value="manager">Gestor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2 bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
                 <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest">Acessos Granulares (Menu)</h4>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-600">
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
                      label="Config" 
                      category="config"
                      modules={DEFAULT_PERMISSIONS.config} 
                      selectedPermissions={formData.permissions}
                      togglePermission={togglePermission}
                    />
                 </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => { setShowForm(false); resetForm(); }} 
                className="px-6 py-2 text-sm font-bold text-slate-400 hover:text-slate-600"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={saving}
                className="btn-primary-gradient px-8 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingUserId ? 'Atualizar Usuário' : 'Salvar e Ativar Acesso')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
             <Loader2 className="w-10 h-10 text-red-700 animate-spin" />
             <p className="text-sm font-medium text-slate-400 uppercase tracking-widest">Sincronizando equipe...</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="text-left text-[11px] font-bold text-slate-400 uppercase py-4 px-8 tracking-widest">Membro / E-mail</th>
                <th className="text-left text-[11px] font-bold text-slate-400 uppercase py-4 px-8 tracking-widest">Perfil</th>
                <th className="text-left text-[11px] font-bold text-slate-400 uppercase py-4 px-8 tracking-widest">Acessos</th>
                <th className="text-right text-[11px] font-bold text-slate-400 uppercase py-4 px-8 tracking-widest">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="py-4 px-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-bold shadow-inner group-hover:from-red-50 group-hover:to-red-100 group-hover:text-red-700 transition-all duration-300">
                         {user.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 leading-none">{user.full_name}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-8">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${ROLES[user.role]?.color || 'bg-slate-50 text-slate-400'}`}>
                      {ROLES[user.role]?.label || 'Visualizador'}
                    </span>
                  </td>
                  <td className="py-4 px-8">
                    <div className="flex items-center gap-1 flex-wrap">
                       {Object.keys(user.permissions || {}).map(cat => (
                         user.permissions[cat]?.length > 0 && (
                           <span key={cat} className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded uppercase tracking-tighter group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                             {cat}
                           </span>
                         )
                       ))}
                    </div>
                  </td>
                  <td className="py-4 px-8 text-right">
                     <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => handleEdit(user)}
                          className="p-2 text-slate-300 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all shadow-sm"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-20 text-center text-slate-300 text-sm font-bold uppercase tracking-widest italic opacity-50">Nenhum membro na base de dados</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
