import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Reports = () => {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => { 
    fetchReportData(); 
  }, [filterDate]);

  const fetchReportData = async () => {
    setLoading(true);
    let query = supabase
      .from('attendance')
      .select(`id, status, marked_at, students (name, roll_number, class, division)`)
      .order('marked_at', { ascending: false });

    if (filterDate) {
      query = query.eq('marked_at', filterDate);
    }

    const { data } = await query;
    setReportData(data || []);
    setLoading(false);
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'present' ? 'absent' : 'present';
    const { error } = await supabase.from('attendance').update({ status: newStatus }).eq('id', id);
    if (!error) {
      setReportData(reportData.map(r => r.id === id ? { ...r, status: newStatus } : r));
    }
  };

  // 📗 EXCEL
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(reportData.map(r => ({
      Date: r.marked_at,
      Roll_No: r.students.roll_number,
      Name: r.students.name,
      Class: `${r.students.class}-${r.students.division}`,
      Status: r.status.toUpperCase()
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `Attendance_${filterDate || 'Full_Report'}.xlsx`);
  };

  // 📕 PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Attendance Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Date Filter: ${filterDate || 'All Time'}`, 14, 22);
    
    doc.autoTable({
      head: [['Date', 'Roll No', 'Name', 'Status']],
      body: reportData.map(r => [r.marked_at, r.students.roll_number, r.students.name, r.status.toUpperCase()]),
      startY: 30,
      headStyles: { fillColor: [37, 99, 235] }
    });
    doc.save(`Attendance_${filterDate || 'Report'}.pdf`);
  };

  return (
    <div className="p-4 w-full max-w-full overflow-hidden animate-in fade-in duration-500">
      
      {/* 🖨️ PRINT-SPECIFIC STYLES */}
      <style>{`
        @media print {
          nav, .no-print, button, .fixed { display: none !important; }
          body { background: white; }
          .print-area { width: 100%; border: none; shadow: none; }
        }
      `}</style>

      {/* 🔝 HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 no-print">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter text-slate-800">Reports Hub</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Manage & Export Logs</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button onClick={exportExcel} className="flex-1 md:flex-none bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-emerald-100 active:scale-95 transition-all">Excel</button>
          <button onClick={exportPDF} className="flex-1 md:flex-none bg-red-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-red-100 active:scale-95 transition-all">PDF</button>
          <button onClick={() => window.print()} className="flex-1 md:flex-none bg-slate-800 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase active:scale-95 transition-all">Print</button>
        </div>
      </div>

      {/* 📅 FILTER & STATS BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 mb-6 flex flex-col md:flex-row items-center gap-4 shadow-sm no-print">
        <div className="w-full md:w-auto flex-1">
          <label className="block text-[9px] font-black text-slate-400 uppercase mb-1.5 ml-1">Filter Date</label>
          <div className="flex gap-2">
            <input 
              type="date" 
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="flex-1 bg-slate-50 border-none rounded-xl p-3 font-bold text-xs outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            {filterDate && (
              <button onClick={() => setFilterDate('')} className="bg-slate-100 text-slate-400 px-4 rounded-xl font-black text-[9px] uppercase hover:text-red-500 transition-colors">Clear</button>
            )}
          </div>
        </div>
        
        <div className="flex gap-6 px-4">
          <div className="text-center border-r border-slate-100 pr-6">
            <p className="text-[9px] font-black text-slate-300 uppercase">Records</p>
            <p className="text-sm font-black text-slate-700">{reportData.length}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-black text-slate-300 uppercase">Present</p>
            <p className="text-sm font-black text-green-500">{reportData.filter(r => r.status === 'present').length}</p>
          </div>
        </div>
      </div>

      {/* 📊 DATA TABLE */}
      <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 w-full overflow-hidden print-area">
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="p-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Roll No</th>
                <th className="p-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Name</th>
                <th className="p-3 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="p-10 text-center text-[10px] font-black uppercase text-slate-300 animate-pulse">Syncing...</td></tr>
              ) : reportData.length === 0 ? (
                <tr><td colSpan="4" className="p-10 text-center text-xs font-bold text-slate-400 uppercase">No Logs Found</td></tr>
              ) : (
                reportData.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="p-3 text-slate-400 font-bold text-[10px] whitespace-nowrap italic">{r.marked_at}</td>
                    <td className="p-3 font-bold text-blue-600 text-[11px] whitespace-nowrap">{r.students.roll_number}</td>
                    <td className="p-3 font-bold text-slate-700 text-[11px] leading-tight">{r.students.name}</td>
                    <td className="p-3 text-right">
                      <button 
                        onClick={() => toggleStatus(r.id, r.status)}
                        className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase transition-all active:scale-90 no-print ${r.status === 'present' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}
                      >
                        {r.status}
                      </button>
                      <span className="hidden print:inline text-[9px] font-black uppercase">{r.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="h-28 no-print"></div>
    </div>
  );
};

export default Reports;