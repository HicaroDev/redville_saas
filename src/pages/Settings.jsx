import React, { useState } from 'react';
import UsuariosPage from './Usuarios';
import { User, Shield, Server, Bell, ChevronRight, Save } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

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
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Configurações</h1>
            <p className="text-sm text-slate-500 font-medium">Gerencie sua conta, permissões e diretrizes do sistema.</p>
         </div>
      </header>

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
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex items-center gap-8">
                   <div className="w-24 h-24 bg-gradient-to-br from-red-700 to-red-500 rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-xl">
                      E
                   </div>
                   <div className="flex-1">
                      <h2 className="text-2xl font-black text-slate-800">Elton Redville</h2>
                      <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Diretor Comercial</p>
                      <div className="flex gap-2 mt-4">
                         <span className="px-3 py-1 bg-red-50 text-red-700 text-[10px] font-black rounded-full border border-red-100 uppercase">Administrador</span>
                         <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full border border-emerald-100 uppercase">Online</span>
                      </div>
                   </div>
                   <button className="px-6 py-3 bg-slate-900 text-white text-xs font-bold rounded-2xl hover:bg-slate-800 transition-all flex items-center gap-2">
                      <Save className="w-4 h-4" /> Salvar Alterações
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <Card label="E-mail" value="elton@redville.com.br" />
                   <Card label="Telefone" value="(11) 98765-4321" />
                   <Card label="Empresa" value="Redville Obras & Engenharia" />
                   <Card label="CNPJ" value="12.345.678/0001-90" />
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
                   <h3 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-tight">Infraestrutura Cloud</h3>
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
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Em breve</p>
                <p className="text-xs text-slate-300 mt-2 italic">Módulos de integração com WhatsApp e alertas PUSH.</p>
             </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Card({ label, value }) {
   return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
         <p className="text-sm font-bold text-slate-800">{value}</p>
      </div>
   );
}

function StatusItem({ label, status, color }) {
   const colors = {
      emerald: 'bg-emerald-500 text-emerald-700',
      blue: 'bg-blue-500 text-blue-700',
   };
   return (
      <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
         <span className="text-sm font-bold text-slate-700">{label}</span>
         <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase">{status}</span>
            <div className={`w-2 h-2 rounded-full ${colors[color].split(' ')[0]} shadow-lg`} />
         </div>
      </div>
   );
}
