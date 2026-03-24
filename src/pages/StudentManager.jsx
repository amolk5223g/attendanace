import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { supabase } from '../lib/supabase';

const StudentManager = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedDiv, setSelectedDiv] = useState('All');

  const fetchStudents = async () => {
    setLoading(true);
    const { data } = await supabase.from('students').select('*').order('roll_number');
    setStudents(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const formatted = results.data.map(row => ({
          name: row.name,
          roll_number: row.roll_number,
          class: row.class,
          division: row.division,
          department: row.department
        }));

        const { error } = await supabase.from('students').insert(formatted);
        
        if (error) {
          alert("Error uploading: " + error.message);
        } else {
          await fetchStudents(); // Refresh list
        }
        
        // ✅ CRITICAL FIX: Reset the input so you can upload the same file again
        e.target.value = null; 
        setUploading(false);
      }
    });
  };

  const filteredStudents = students.filter(s => {
    const classMatch = selectedClass === 'All' || s.class === selectedClass;
    const divMatch = selectedDiv === 'All' || s.division === selectedDiv;
    return classMatch && divMatch;
  });

  const classes = ['All', ...new Set(students.map(s => s.class))];
  const divisions = ['All', ...new Set(students.map(s => s.division))];

  return (
    <div className="p-4 md:p-8 w-full max-w-6xl mx-auto overflow-x-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Student Roster</h2>
        
        <label className={`px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest cursor-pointer transition-all shadow-lg ${uploading ? 'bg-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-blue-200'}`}>
          {uploading ? "Importing..." : "Bulk Import (CSV)"}
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            onChange={handleFileUpload} 
            disabled={uploading}
          />
        </label>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6 bg-white p-4 rounded-2xl border border-slate-100">
        <div className="flex-1">
          <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Class</label>
          <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl p-3 font-bold text-sm">
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Division</label>
          <select value={selectedDiv} onChange={(e) => setSelectedDiv(e.target.value)} className="w-full bg-slate-50 border-none rounded-xl p-3 font-bold text-sm">
            {divisions.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto min-w-[400px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase">Roll No</th>
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase">Name</th>
                <th className="p-4 text-[9px] font-black text-slate-400 uppercase">Class</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 last:border-0">
                  <td className="p-4 font-bold text-blue-600 text-xs">{s.roll_number}</td>
                  <td className="p-4 font-black text-slate-700 text-xs">{s.name}</td>
                  <td className="p-4 text-slate-400 text-[10px] font-bold uppercase">{s.class} — {s.division}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentManager;