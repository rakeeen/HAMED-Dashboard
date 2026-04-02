import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Retrieve correct credentials from localStorage or use defaults
    const adminEmail = localStorage.getItem('hamed_admin_email') || 'admin@admin.com';
    const adminPass = localStorage.getItem('hamed_admin_pass') || 'admin';

    if (email === adminEmail && password === adminPass) {
      if (rememberMe) {
        localStorage.setItem('hamed_admin_auth', 'true');
      } else {
        sessionStorage.setItem('hamed_admin_auth', 'true');
      }
      navigate('/');
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6 relative">
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }} 
      />
      
      <div className="w-full max-w-md bg-surface-container rounded-3xl p-10 md:p-12 border border-white/10 relative z-10">
        <div className="flex justify-center mb-8 text-primary">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <Lock size={28} />
          </div>
        </div>
        
        <div className="text-center mb-10">
          <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Dashboard Access</h1>
          <p className="text-xs text-secondary/60 font-bold uppercase tracking-widest">Verify Identity</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm px-4 py-3 rounded-xl mb-6 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-secondary font-bold">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-primary focus:bg-white/10 outline-none transition-all placeholder:text-white/20"
              placeholder="admin@admin.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-secondary font-bold">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:border-primary focus:bg-white/10 outline-none transition-all placeholder:text-white/20"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer mt-4">
            <input 
              type="checkbox" 
              checked={rememberMe} 
              onChange={(e) => setRememberMe(e.target.checked)} 
              className="w-5 h-5 accent-primary rounded bg-white/10 border-white/20" 
            />
            <span className="text-sm text-secondary font-medium">Remember me for future visits</span>
          </label>

          <button 
            type="submit" 
            className="w-full bg-white text-black py-4 rounded-full font-bold uppercase tracking-widest mt-4 hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            Authenticate
          </button>
        </form>
      </div>
    </div>
  );
};
