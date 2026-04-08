import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Building2, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // MASTER BYPASS FOR INITIAL SETUP
    if (email === 'admin@redville.com' && password === 'AdminMaster2026') {
      onLoginSuccess({ email: 'admin@redville.com', user_metadata: { name: 'Admin Master' } });
      setLoading(false);
      return;
    }

    // 2. CHECK DATABASE (ADMIN CREATED USERS)
    const { data: dbUser, error: dbError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();
    
    if (dbUser && !dbError) {
      onLoginSuccess(dbUser);
      setLoading(false);
      return;
    }

    // 3. SUPABASE AUTH
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('Acesso negado. Verifique suas credenciais.');
      setLoading(false);
    } else {
      onLoginSuccess(data.user);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white overflow-hidden animate-in fade-in duration-500">
      {/* LEFT SIDE: THE IMAGE BOX */}
      <div className="hidden lg:block lg:w-[45%] relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] hover:scale-110"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1503387762-592dea58ef46?auto=format&fit=crop&q=80&w=1600")' }}
        />
        {/* RED OVERLAY SUTTLE */}
        <div className="absolute inset-0 bg-red-900/10 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/10" />
      </div>

      {/* RIGHT SIDE: THE LOGIN CONTENT */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50/50">
        <div className="w-full max-w-[420px] space-y-8 relative z-10">
          
          {/* LOGO AREA */}
          <div className="text-center flex flex-col items-center mb-6">
            <img 
              src="/logo.png" 
              alt="Redville Obras" 
              className="h-40 w-auto drop-shadow-xl animate-in slide-in-from-top-4 duration-700 font-inter" 
            />
            <div className="h-1.5 w-12 bg-red-700 rounded-full mt-4 shadow-lg shadow-red-700/20" />
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-[0.4em] mt-3 opacity-80">Engenharia & Gestão Profissional</p>
          </div>

          {/* LOGIN CARD */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 opacity-40 blur-3xl" />
            
            <form onSubmit={handleLogin} className="space-y-6 relative z-10">
              <div className="space-y-2">
                 <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-1">E-mail de Acesso</label>
                 <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="email" 
                      required 
                      className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-red-600/20 focus:bg-white transition-all outline-none text-slate-800 font-medium"
                      placeholder="admin@redville.com.br"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-1">Sua Senha</label>
                 <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input 
                      type="password" 
                      required 
                      className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-red-600/20 focus:bg-white transition-all outline-none text-slate-800 font-medium"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                 </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-[11px] font-bold rounded-xl text-center border border-red-100 animate-pulse">
                  {error}
                </div>
              )}

              <button 
                disabled={loading}
                type="submit" 
                className="w-full btn-primary-gradient py-4 flex items-center justify-center gap-3 group shadow-xl shadow-red-100 font-semibold"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span className="uppercase tracking-widest text-xs">Entrar no Painel</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-slate-300 text-[10px] font-semibold uppercase tracking-widest opacity-60">
            Redville Obras SaaS • 2026 
          </p>
        </div>
      </div>
    </div>
  );
}
