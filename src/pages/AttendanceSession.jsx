import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AttendanceSession = ({ config, onFinish }) => {
  const [students, setStudents] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      const { data } = await supabase.from('students')
        .select('*').eq('class', config.class).eq('division', config.div).order('roll_number');
      setStudents(data || []);
      setLoading(false);
    };
    fetchStudents();
  }, [config]);

  const markAttendance = async (status) => {
    const student = students[currentIndex];
    await supabase.from('attendance').insert([{ 
      student_id: student.id, 
      status, 
      marked_at: new Date().toISOString().split('T')[0] 
    }]);

    if (currentIndex < students.length - 1) setCurrentIndex(prev => prev + 1);
    else onFinish();
  };

  // ⏪ FIXED PREVIOUS: Deletes the last mark to allow re-entry
  const handlePrevious = async () => {
    if (currentIndex > 0) {
      const prevStudent = students[currentIndex - 1];
      await supabase.from('attendance')
        .delete()
        .eq('student_id', prevStudent.id)
        .eq('marked_at', new Date().toISOString().split('T')[0]);
      
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (loading) return <div className="p-20 text-center font-black">Loading...</div>;

  const currentStudent = students[currentIndex];
  const progress = ((currentIndex + 1) / students.length) * 100;

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4">
      {/* Progress Bar - Thinner for Mobile */}
      <div className="w-full max-w-sm mb-8">
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Student Card - Scaled for Mobile */}
      <div className="bg-white w-full max-w-sm p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-slate-50 text-center">
        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-1 rounded-lg">ROLL: {currentStudent.roll_number}</span>
        <h2 className="text-3xl md:text-5xl font-black text-slate-800 mt-4 leading-tight uppercase tracking-tighter">
          {currentStudent.name}
        </h2>
      </div>

      {/* Action Buttons - Stacked on tiny screens, side-by-side on mobile/tablet */}
      <div className="grid grid-cols-2 gap-4 mt-8 w-full max-w-sm">
        <button onClick={() => markAttendance('absent')} className="bg-white border-2 border-red-500 text-red-500 p-6 rounded-[2rem] font-black uppercase text-sm active:bg-red-500 active:text-white transition-all">
          ❌ Absent
        </button>
        <button onClick={() => markAttendance('present')} className="bg-green-500 text-white p-6 rounded-[2rem] font-black uppercase text-sm shadow-lg shadow-green-200 active:scale-95 transition-all">
          ✅ Present
        </button>
      </div>

      {/* Nav Buttons - Slimmer for Mobile */}
      <div className="grid grid-cols-2 gap-3 mt-6 w-full max-w-sm">
        <button onClick={handlePrevious} className="bg-slate-100 text-slate-500 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest">
          ← Previous
        </button>
        <button onClick={() => setCurrentIndex(Math.min(students.length - 1, currentIndex + 1))} className="bg-slate-800 text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest">
          Skip Student →
        </button>
      </div>
    </div>
  );
};

export default AttendanceSession;