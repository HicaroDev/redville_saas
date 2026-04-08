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

    if (error) {
      setError('Acesso negado. Verifique suas credenciais.');
      setLoading(false);
    } else {
      onLoginSuccess(data.user);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="w-full max-w-[420px] space-y-8">
        {/* LOGO AREA */}
        <div className="text-center flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-red-700 rounded-2xl flex items-center justify-center shadow-2xl shadow-red-700/30 rotate-3 mb-6 animate-in zoom-in duration-700">
            <Building2 className="w-9 h-9 text-white -rotate-3" />
          </div>
          <h1 className="text-4xl tracking-tighter text-slate-900 flex items-center gap-0.5">
            <span className="font-semibold">RED</span>
            <span className="font-light text-slate-400">VILLE</span>
          </h1>
          <div className="h-1 w-10 bg-red-700 rounded-full mt-1.5 opacity-80" />
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-[0.3em] mt-4 opacity-60">SaaS Engenharia & Gestão</p>
        </div>

        {/* LOGIN CARD */}
        <div className="bg-white p-8 rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-50 rounded-full -mr-16 -mt-16 opacity-50 blur-2xl" />
          
          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Seu E-mail</label>
               <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="email" 
                    required 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-red-600/20 focus:bg-white transition-all outline-none text-slate-800 font-medium"
                    placeholder="email@redville.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Sua Senha</label>
               <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="password" 
                    required 
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-red-600/20 focus:bg-white transition-all outline-none text-slate-800 font-medium"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
               </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl text-center animate-in slide-in-from-top-1">
                {error}
              </div>
            )}

            <button 
              disabled={loading}
              type="submit" 
              className="w-full btn-primary-gradient py-4 flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span className="font-bold">Acessar Sistema</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 text-xs font-medium">
          Redville Obras SaaS © 2026 • Todos os direitos reservados
        </p>
      </div>
    </div>
  );
}
