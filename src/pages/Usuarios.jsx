import { useState, useEffect } from 'react';
import { Plus, UserCheck, Shield, Mail, Trash2, Edit3, Key, CheckSquare, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ROLES = {
  admin: { label: 'Administrador', color: 'text-red-600 bg-red-50' },
  manager: { label: 'Gestor', color: 'text-blue-600 bg-blue-50' },
  viewer: { label: 'Visualizador', color: 'text-slate-600 bg-slate-50' }
};

function PermissionBox({ label, modules }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
       <p className="text-[10px] font-bold text-slate-800 uppercase mb-3 border-b border-slate-50 pb-2">{label}</p>
       <div className="space-y-2">
          {modules.map(m => (
            <label key={m} className="flex items-center gap-2 cursor-pointer group">
               <div className="w-4 h-4 rounded border border-slate-300 flex items-center justify-center group-hover:border-red-500 transition-colors">
                  <CheckSquare className="w-3 h-3 text-red-500 opacity-0 group-hover:opacity-10" />
               </div>
               <span className="text-xs text-slate-500 group-hover:text-slate-700 transition-colors">{m}</span>
            </label>
          ))}
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
  
  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'viewer'
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

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const { error } = await supabase
      .from('profiles')
      .insert([formData]);

    if (!error) {
      setSuccessMsg(true);
      setFormData({ full_name: '', email: '', role: 'viewer' });
      fetchUsers();
      setTimeout(() => {
        setSuccessMsg(false);
        setShowForm(false);
      }, 2000);
    } else {
      alert('Erro ao criar usuário: ' + error.message);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestão de Usuários</h1>
          <p className="text-sm text-slate-500 mt-1">Níveis de acesso e permissões granulares</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary-gradient flex items-center gap-2 shadow-lg shadow-red-100">
            <Plus className="w-4 h-4" /> Novo Usuário
          </button>
        )}
      </div>

      {/* FEEDBACK SUCCESS MESSAGE */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
           <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
           </div>
           <div>
              <p className="text-sm font-bold text-emerald-900">Usuário Criado com Sucesso!</p>
              <p className="text-xs text-emerald-600">O novo membro já aparece na lista abaixo.</p>
           </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-red-50 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Convidar Novo Usuário</h3>
          </div>

          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nome Completo</label>
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase">E-mail Corporativo</label>
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
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Perfil de Acesso</label>
                  <select 
                    className="form-input"
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
                 <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-widest">Acessos por Módulo</h4>
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-600">
                    <PermissionBox label="Obras" modules={['Visualizar', 'Criar', 'Editar Orçamento']} />
                    <PermissionBox label="Financeiro" modules={['Lançamentos', 'Livro Caixa', 'Pagamentos']} />
                    <PermissionBox label="Config" modules={['Usuários', 'Cadastros', 'Configurações']} />
                 </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
              <button 
                type="button" 
                onClick={() => setShowForm(false)} 
                className="px-6 py-2 text-sm font-bold text-slate-400 hover:text-slate-600"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={saving}
                className="btn-primary-gradient px-8 flex items-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar e Notificar'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center gap-4">
             <Loader2 className="w-10 h-10 text-red-700 animate-spin" />
             <p className="text-sm font-medium text-slate-400">Carregando membros da equipe...</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="text-left text-[11px] font-bold text-slate-400 uppercase py-4 px-8">Membro</th>
                <th className="text-left text-[11px] font-bold text-slate-400 uppercase py-4 px-8">Perfil</th>
                <th className="text-left text-[11px] font-bold text-slate-400 uppercase py-4 px-8">Status</th>
                <th className="text-right text-[11px] font-bold text-slate-400 uppercase py-4 px-8">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="py-4 px-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-500 font-bold">
                         {user.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{user.full_name}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-8">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${ROLES[user.role]?.color || 'bg-slate-50 text-slate-400'}`}>
                      {ROLES[user.role]?.label || 'Visualizador'}
                    </span>
                  </td>
                  <td className="py-4 px-8">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">{user.active ? 'Ativo' : 'Inativo'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-8 text-right">
                     <div className="flex justify-end gap-1">
                        <button className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit3 className="w-4 h-4" /></button>
                        <button className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                     </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-20 text-center text-slate-400 text-sm font-medium italic">Nenhum membro cadastrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
