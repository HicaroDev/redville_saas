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
    <div className="min-h-screen relative flex items-center justify-center p-4 animate-in fade-in duration-500 overflow-hidden">
      {/* BACKGROUND WALLPAPER */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-[10s] hover:scale-110"
        style={{ backgroundImage: 'url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZP25zdEQgwU0qE5AIrgvU8KN-EIyfaUF4tw&s")' }}
      />
      {/* OVERLAY */}
      <div className="absolute inset-0 z-0 bg-slate-900/60 backdrop-blur-[2px]" />

      <div className="w-full max-w-[420px] space-y-8 relative z-10 transition-all">
        {/* LOGO AREA */}
        <div className="text-center flex flex-col items-center mb-10">
          <img 
            src="/logo.png" 
            alt="Redville Obras" 
            className="h-48 w-auto animate-in zoom-in duration-700 drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)]" 
          />
          <div className="h-1.5 w-16 bg-red-700 rounded-full mt-6 shadow-lg shadow-red-700/50" />
          <p className="text-[12px] text-white font-semibold uppercase tracking-[0.4em] mt-4 opacity-90 drop-shadow-md">Engenharia & Gestão Profissional</p>
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
