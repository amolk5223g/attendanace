import { useState } from 'react';
import { supabase } from '../lib/supabase';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Access Denied: " + error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
      <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl w-full max-w-md animate-in zoom-in duration-500">
        <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mb-8 mx-auto shadow-xl shadow-blue-500/20 font-black text-2xl">A</div>
        <h2 className="text-4xl font-black text-slate-800 text-center tracking-tighter uppercase mb-2">Teacher Login</h2>
        <p className="text-slate-400 text-center font-bold text-sm mb-10 uppercase tracking-widest">Secure Admin Access</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="email" 
            placeholder="Official Email" 
            className="w-full bg-slate-100 rounded-2xl p-5 font-bold border-none focus:ring-4 focus:ring-blue-500/20 transition-all outline-none"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full bg-slate-100 rounded-2xl p-5 font-bold border-none focus:ring-4 focus:ring-blue-500/20 transition-all outline-none"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all mt-4"
          >
            {loading ? 'Verifying...' : 'Authorize →'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;