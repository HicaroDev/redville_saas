import React, { useState, useEffect } from 'react';
import UsuariosPage from './Usuarios';
import { supabase } from '../lib/supabase';
import { User, Shield, Server, Bell, ChevronRight, Save, Loader2, CheckCircle2, Lock } from 'lucide-react';

export default function SettingsPage({ user }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Profile State
  const [profile, setProfile] = useState({
    full_name: '',
    email: user?.email || '',
    phone: '',
    company: 'Redville Obras & Engenharia',
    document: ''
  });

  // Password State
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', user.email)
      .single();
    
    if (data && !error) {
      setProfile({
        ...profile,
        full_name: data.full_name || '',
        email: data.email || user.email,
        phone: data.phone || '',
        company: data.company || 'Redville Obras & Engenharia',
        document: data.document || ''
      });
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    // 1. Update Profile in DB (using email matching if no ID present in bypass mode)
    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        email: profile.email,
        full_name: profile.full_name,
        // Using extra columns if added to DB, or just matching profile info
      }, { onConflict: 'email' });

    // 2. Update Password if provided
    if (newPassword) {
      const { error: pwdError } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (pwdError) alert('Erro ao mudar senha: ' + pwdError.message);
    }

    if (!error) {
      setSuccessMsg('Perfil atualizado com sucesso!');
      setNewPassword('');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
    setSaving(false);
  };

  const TABS = [
    { id: 'profile', label: 'Meu Perfil', icon: User },
    { id: 'users', label: 'Gestão de Usuários', icon: Shield },
    { id: 'system', label: 'Sistema e Backup', icon: Server },
    { id: 'notifications', label: 'Notificações', icon: Bell },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
         <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Configurações</h1>
            <p className="text-sm text-slate-500 font-medium">Gerencie sua conta, permissões e diretrizes do sistema.</p>
         </div>
      </header>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 shadow-sm">
           <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
           </div>
           <p className="text-sm font-bold text-emerald-900">{successMsg}</p>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Mini */}
        <aside className="w-full md:w-64 space-y-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-red-700 text-white shadow-lg shadow-red-200' 
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-bold">{tab.label}</span>
                </div>
                {activeTab === tab.id && <ChevronRight className="w-4 h-4 opacity-50" />}
              </button>
            )
          })}
        </aside>

        {/* Content Area */}
        <main className="flex-1">
          {activeTab === 'profile' && (
             <div className="space-y-6">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8">
                   <div className="w-24 h-24 bg-gradient-to-br from-red-700 to-red-500 rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-xl">
                      {profile.full_name?.charAt(0) || profile.email?.charAt(0).toUpperCase()}
                   </div>
                   <div className="flex-1 text-center md:text-left">
                      <h2 className="text-2xl font-bold text-slate-800 tracking-tight">{profile.full_name || 'Usuário Master'}</h2>
                      <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">{profile.email}</p>
                      <div className="flex justify-center md:justify-start gap-2 mt-4">
                         <span className="px-3 py-1 bg-red-50 text-red-700 text-[10px] font-bold rounded-full border border-red-100 uppercase">Administrador</span>
                         <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-100 uppercase">Online</span>
                      </div>
                   </div>
                   <button 
                     onClick={handleSaveProfile}
                     disabled={saving}
                     className="px-6 py-3 bg-red-700 text-white text-xs font-bold rounded-2xl hover:bg-red-800 transition-all flex items-center gap-2 shadow-lg shadow-red-100"
                   >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                      Salvar Alterações
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <InputCard label="Seu Nome Completo" value={profile.full_name} onChange={(val) => setProfile({...profile, full_name: val})} />
                   <InputCard label="E-mail (Login)" value={profile.email} disabled />
                   <InputCard label="Telefone / WhatsApp" value={profile.phone} onChange={(val) => setProfile({...profile, phone: val})} />
                   <InputCard label="Empresa" value={profile.company} onChange={(val) => setProfile({...profile, company: val})} />
                </div>

                {/* SECURITY SECTION */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                   <div className="flex items-center gap-3 mb-6">
                      <Lock className="w-5 h-5 text-red-700" />
                      <h3 className="text-lg font-bold text-slate-800 tracking-tight">Segurança e Senha</h3>
                   </div>
                   <div className="max-w-md space-y-4">
                      <div className="space-y-1">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Nova Senha de Acesso</label>
                         <input 
                           type="password" 
                           className="form-input" 
                           placeholder="Mudar sua senha master" 
                           value={newPassword}
                           onChange={(e) => setNewPassword(e.target.value)}
                         />
                      </div>
                      <p className="text-xs text-slate-400 italic px-1">
                        Dica: Use uma combinação de letras, números e símbolos.
                      </p>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'users' && (
             <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <UsuariosPage isEmbedded={true} />
             </div>
          )}

          {activeTab === 'system' && (
             <div className="space-y-6">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                   <h3 className="text-lg font-bold text-slate-800 mb-6 uppercase tracking-tight">Infraestrutura Cloud</h3>
                   <div className="space-y-4">
                      <StatusItem label="Supabase Sync" status="Ativo" color="emerald" />
                      <StatusItem label="Banco de Dados" status="Conectado" color="emerald" />
                      <StatusItem label="Storage de Contratos" status="Otimizado" color="blue" />
                      <StatusItem label="SSL / Segurança" status="Certificado" color="emerald" />
                   </div>
                </div>
             </div>
          )}
          
          {(activeTab === 'notifications' || !['profile','users','system'].includes(activeTab)) && (
             <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-20 text-center">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none">Em breve</p>
                <p className="text-xs text-slate-300 mt-2 italic font-medium">Módulos de integração com WhatsApp e alertas PUSH.</p>
             </div>
          )}
        </main>
      </div>
    </div>
  );
}

function InputCard({ label, value, onChange, disabled = false }) {
   return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">{label}</p>
         <input 
            type="text"
            disabled={disabled}
            className={`w-full text-sm font-bold text-slate-800 bg-slate-50/50 p-3 rounded-xl border-none focus:ring-2 focus:ring-red-600/20 transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`}
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
         />
      </div>
   );
}

function StatusItem({ label, status, color }) {
   const colors = {
      emerald: 'bg-emerald-500 text-emerald-700',
      blue: 'bg-blue-500 text-blue-700',
   };
   return (
      <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-sm">
         <span className="text-sm font-bold text-slate-700">{label}</span>
         <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{status}</span>
            <div className={`w-2 h-2 rounded-full ${colors[color].split(' ')[0]} shadow-lg`} />
         </div>
      </div>
   );
}
