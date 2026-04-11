import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LogIn } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const whitelistedEmail = 'hamed.rakeeen@gmail.com';
      const userEmail = user.email?.toLowerCase();

      // Case-Insensitive Whitelist Check
      if (userEmail === whitelistedEmail) {
        localStorage.setItem('hamed_admin_auth', 'true');
        navigate('/');
      } else {
        await auth.signOut();
        setError(`Unauthorized Access: ${user.email} is not in the whitelist.`);
      }
    } catch (err: any) {
      console.error(err);
      setError('Login Failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper p-6 relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(var(--ink) 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
      />
      
      <div className="w-full max-w-md bg-[#0e0d0c] sketchy-border p-10 md:p-12 relative z-10 text-center">
        <div className="flex justify-center mb-8">
          <div className="p-4 sketchy-border bg-white/5 border-white/20 text-primary">
            <Lock size={28} />
          </div>
        </div>
        
        <div className="mb-10">
          <h1 className="text-3xl font-black uppercase tracking-tight sketch-font mb-2">Portfolio Gatekeeper</h1>
          <p className="text-[10px] text-secondary/40 font-bold uppercase tracking-widest leading-relaxed">
            Secure entry restricted to <br/> <span className="text-sepia">Hamed.rakeeen@gmail.com</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs px-4 py-3 mb-8 sketchy-border rounded-none">
             {error}
          </div>
        )}

        <button 
          onClick={handleGoogleLogin} 
          disabled={loading}
          className="sketchy-btn filled w-full flex items-center justify-center gap-3 py-4 text-lg hover:scale-[1.02] active:scale-95 transition-all"
        >
          {loading ? (
             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <LogIn size={20} />
              Continue with Google
            </>
          )}
        </button>

        <p className="mt-10 text-[9px] uppercase tracking-widest text-secondary opacity-30">
           Admin Clearance Required • AI Assisted Entry
        </p>
      </div>
    </div>
  );
};
