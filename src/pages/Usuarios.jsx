import { useState } from 'react';
import { Plus, UserCheck, Shield, Mail, Trash2, Edit3, Key, CheckSquare } from 'lucide-react';

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
  const [users] = useState([
    { id: 1, name: 'Elton Redville', email: 'elton@redville.com.br', role: 'admin', active: true },
    { id: 2, name: 'Gestor de Obra', email: 'obras@redville.com.br', role: 'manager', active: true }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestão de Usuários</h1>
          <p className="text-sm text-slate-500 mt-1">Níveis de acesso e permissões granulares</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary-gradient flex items-center gap-2 shadow-lg shadow-red-100">
          <Plus className="w-4 h-4" /> Novo Usuário
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-red-50 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Convidar Novo Usuário</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nome Completo</label>
                <input type="text" className="form-input" placeholder="Nome do usuário" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">E-mail Corporativo</label>
                <input type="email" className="form-input" placeholder="contato@redville.com.br" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Perfil de Acesso</label>
                <select className="form-input">
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
            <button onClick={() => setShowForm(false)} className="px-6 py-2 text-sm font-bold text-slate-400 hover:text-slate-600">Cancelar</button>
            <button className="btn-primary-gradient px-8">Salvar e Notificar</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
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
                       {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{user.name}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-8">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${ROLES[user.role].color}`}>
                    {ROLES[user.role].label}
                  </span>
                </td>
                <td className="py-4 px-8">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Ativo</span>
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
