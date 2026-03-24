import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Login from './pages/Login';
import StudentManager from './pages/StudentManager';
import AttendanceSession from './pages/AttendanceSession';
import Reports from './pages/Reports';

function App() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sessionConfig, setSessionConfig] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  if (!session) return <Login />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 w-full overflow-x-hidden">
      
      {/* 🧭 RESPONSIVE NAV */}
      <nav className="bg-white border-b px-3 py-3 md:px-6 md:py-4 flex justify-between items-center shadow-sm sticky top-0 z-50 w-full">
        <div className="flex items-center gap-1 cursor-pointer" onClick={() => {setSessionConfig(null); setActiveTab('dashboard');}}>
          <div className="bg-blue-600 p-1 rounded-lg text-white font-black text-sm">A</div>
          <h1 className="text-base md:text-xl font-black tracking-tighter hidden sm:block">ATTENDLY<span className="text-blue-600">PRO</span></h1>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-xl gap-0.5 md:gap-1">
          {['dashboard', 'students', 'reports'].map((tab) => (
            <button 
              key={tab}
              onClick={() => {setSessionConfig(null); setActiveTab(tab);}}
              className={`px-3 py-2 rounded-lg text-[10px] md:text-xs font-black uppercase transition-all ${activeTab === tab ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
            >
              {tab === 'dashboard' ? 'Home' : tab === 'reports' ? 'Logs' : tab}
            </button>
          ))}
          <button onClick={() => supabase.auth.signOut()} className="px-2 py-2 text-[10px] font-black text-red-500 uppercase">Exit</button>
        </div>
      </nav>

      {/* 📱 MAIN CONTENT CONTAINER */}
      <div className="w-full max-w-full overflow-hidden">
        {activeTab === 'dashboard' && (
          <main className="p-4 md:p-8 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black tracking-tight mb-6">Home</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div onClick={() => setActiveTab('session')} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm active:scale-95 transition-all">
                <div className="text-3xl mb-3">📝</div>
                <h3 className="text-xl font-black uppercase tracking-tighter">Start Session</h3>
              </div>
              <div onClick={() => setActiveTab('reports')} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm active:scale-95 transition-all">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="text-xl font-black uppercase tracking-tighter">View Logs</h3>
              </div>
            </div>
          </main>
        )}

        {activeTab === 'session' && (
          <main className="w-full">
            {!sessionConfig ? (
              <div className="p-4 flex justify-center mt-10">
                <div className="bg-white p-6 rounded-[2.5rem] shadow-xl w-full max-w-xs border border-slate-100">
                  <h2 className="text-xl font-black mb-6 uppercase tracking-widest text-center">Setup</h2>
                  <input id="clsI" placeholder="Class (e.g. 4th Sem)" className="w-full bg-slate-100 rounded-xl p-4 mb-4 font-bold text-sm outline-none" />
                  <input id="divI" placeholder="Div (e.g. A)" className="w-full bg-slate-100 rounded-xl p-4 mb-6 font-bold text-sm outline-none" />
                  <button onClick={() => {
                    const c = document.getElementById('clsI').value;
                    const d = document.getElementById('divI').value;
                    if(c && d) setSessionConfig({ class: c, div: d });
                  }} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase tracking-widest">Start</button>
                </div>
              </div>
            ) : (
              <AttendanceSession config={sessionConfig} onFinish={() => {setSessionConfig(null); setActiveTab('dashboard');}} />
            )}
          </main>
        )}

        {activeTab === 'students' && <StudentManager />}
        {activeTab === 'reports' && <Reports />}
      </div>

      {/* 🔙 MOBILE BACK BUTTON (RESPONSIVE) */}
      {activeTab !== 'dashboard' && (
        <button 
          onClick={() => {setSessionConfig(null); setActiveTab('dashboard');}} 
          className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-10 md:translate-x-0 bg-slate-900 text-white px-6 py-4 rounded-full font-black shadow-2xl z-50 text-[10px] uppercase tracking-widest border-2 border-white whitespace-nowrap flex items-center gap-2"
        >
          <span>←</span> <span className="hidden md:inline">Back to Dashboard</span> <span className="md:hidden">Home</span>
        </button>
      )}
    </div>
  );
}

export default App;