import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { GradeRecord, Subject } from '../types';
import { Modal } from '../components/common/Modal';
import { 
  GraduationCap, 
  Plus, 
  Trash2, 
  Calculator, 
  Award, 
  TrendingUp, 
  BookOpen, 
  AlertCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';

const GRADE_OPTIONS = [
  { grade: 'A+', points: 4.00 },
  { grade: 'A',  points: 4.00 },
  { grade: 'A-', points: 3.70 },
  { grade: 'B+', points: 3.30 },
  { grade: 'B',  points: 3.00 },
  { grade: 'B-', points: 2.70 },
  { grade: 'C+', points: 2.30 },
  { grade: 'C',  points: 2.00 },
  { grade: 'C-', points: 1.70 },
  { grade: 'D+', points: 1.30 },
  { grade: 'D',  points: 1.00 },
  { grade: 'E/F', points: 0.00 },
];

export const GpaCalculatorPage: React.FC = () => {
  const [data, setData] = useState<{
    overallGpa: number;
    currentSemesterGpa: number;
    cumulativeCredits: number;
    targetGpa: number;
    semesterHistory: any[];
    allGrades: GradeRecord[];
    subjects: Subject[];
  } | null>(null);

  const [loading, setLoading] = useState(true);

  // Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject_id: '',
    semester: 1,
    letter_grade: 'A',
    credits: 3
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Quick Simulation Row State (What-If Calculator)
  const [simRows, setSimRows] = useState<Array<{ id: string; subject: string; credits: number; grade: string }>>([
    { id: '1', subject: 'Advanced Database Systems', credits: 3, grade: 'A' },
    { id: '2', subject: 'Cloud Architecture & DevOps', credits: 3, grade: 'A-' },
    { id: '3', subject: 'Machine Learning Pipelines', credits: 3, grade: 'B+' },
    { id: '4', subject: 'Distributed Systems', credits: 4, grade: 'A' },
  ]);

  const fetchGpa = async () => {
    try {
      setLoading(true);
      const res = await api.gpa.getData();
      setData(res.data);
      if (res.data.subjects.length > 0 && !formData.subject_id) {
        setFormData(prev => ({ ...prev, subject_id: res.data.subjects[0].id }));
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGpa();
  }, []);

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      await api.gpa.saveGrade(formData);
      setIsModalOpen(false);
      fetchGpa();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (err: any) {
      setFormError(err.message || 'Failed to save grade record.');
    }
  };

  const handleDeleteGrade = async (id: string) => {
    if (!window.confirm('Remove this grade record?')) return;
    try {
      await api.gpa.deleteGrade(id);
      fetchGpa();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Compute What-If Simulation GPA
  const computeSimulatedGpa = () => {
    const pointMap: Record<string, number> = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'E/F': 0.0
    };
    let pts = 0;
    let creds = 0;
    simRows.forEach(r => {
      const p = pointMap[r.grade] ?? 3.0;
      pts += p * r.credits;
      creds += r.credits;
    });
    return creds > 0 ? (pts / creds).toFixed(2) : '0.00';
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>GPA Calculator & Academic Audit</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
              4.0 Scale Standard
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automatic calculation of Semester GPA and Cumulative Overall GPA with honors classification.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              subject_id: data?.subjects[0]?.id || '',
              semester: 1,
              letter_grade: 'A',
              credits: 3
            });
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/20 active:scale-95"
        >
          <Plus size={16} />
          <span>Record Module Grade</span>
        </button>
      </div>

      {/* GPA Score Hero Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Cumulative Overall GPA */}
        <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 text-white shadow-xl shadow-brand-500/20 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-brand-200 uppercase tracking-wider">
              Cumulative Overall GPA
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight">
                {data ? data.overallGpa.toFixed(2) : '3.42'}
              </span>
              <span className="text-sm font-medium text-brand-200">/ 4.00</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-brand-500/40 flex items-center justify-between text-xs text-brand-100">
            <span>Academic Standing:</span>
            <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-full">
              {data && data.overallGpa >= 3.70 ? 'First Class Honours 🏆' :
               data && data.overallGpa >= 3.30 ? 'Second Upper Class 🎖️' :
               data && data.overallGpa >= 3.00 ? 'Second Lower Class' : 'General Pass'}
            </span>
          </div>
        </div>

        {/* Current Semester GPA */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Current Semester GPA
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <TrendingUp size={16} />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">
                {data ? data.currentSemesterGpa.toFixed(2) : '3.50'}
              </span>
              <span className="text-xs text-slate-400">/ 4.00</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Target Goal:</span>
            <span className="font-bold text-brand-600 dark:text-brand-400">
              {data ? data.targetGpa.toFixed(2) : '3.85'} GPA
            </span>
          </div>
        </div>

        {/* Total Earned Credits */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Credits Accumulated
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Award size={16} />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-slate-100">
                {data ? data.cumulativeCredits : '12'}
              </span>
              <span className="text-xs text-slate-400">/ 120 credits</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Degree Completion:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {data ? Math.round((data.cumulativeCredits / 120) * 100) : 10}%
            </span>
          </div>
        </div>

      </div>

      {/* Main Content: Official Grade Records Table & Interactive Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Official Recorded Grades */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Official Module Results & Grades
              </h3>
              <p className="text-xs text-slate-400">Modules stored in student record</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Subject Module</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4">Credits</th>
                  <th className="py-3 px-4">Grade</th>
                  <th className="py-3 px-4">Grade Point</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data?.allGrades.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {g.subject_name || g.subject_code}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      Semester {g.semester}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold">
                      {g.credits}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        {g.letter_grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {g.grade_point.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteGrade(g.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Delete Grade"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: "What-If" GPA Projection Simulator */}
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calculator size={18} className="text-brand-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                What-If Simulator
              </h3>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
              GPA: {computeSimulatedGpa()}
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Simulate expected grades for upcoming modules to predict your target honors ranking:
          </p>

          <div className="space-y-2.5">
            {simRows.map((row, idx) => (
              <div key={row.id} className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-xs flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
                  {row.subject}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 font-mono">{row.credits} cr</span>
                  <select
                    value={row.grade}
                    onChange={(e) => {
                      const updated = [...simRows];
                      updated[idx].grade = e.target.value;
                      setSimRows(updated);
                    }}
                    className="px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-brand-600 dark:text-brand-400 text-xs focus:outline-none"
                  >
                    {GRADE_OPTIONS.map(g => (
                      <option key={g.grade} value={g.grade}>{g.grade}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs space-y-1">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Projected Semester GPA:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{computeSimulatedGpa()}</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>Target GPA Gap:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {Number(computeSimulatedGpa()) >= (data?.targetGpa || 3.8) ? 'Target Met! 🎉' : 'Needs higher grades'}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Record Grade Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Module Grade Result"
      >
        <form onSubmit={handleSaveGrade} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Module *
            </label>
            <select
              value={formData.subject_id}
              onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              required
            >
              {data?.subjects.map(s => (
                <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Semester *
              </label>
              <input
                type="number"
                min="1"
                max="8"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Credits
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Grade *
              </label>
              <select
                value={formData.letter_grade}
                onChange={(e) => setFormData({ ...formData, letter_grade: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none font-bold text-brand-600 dark:text-brand-400"
              >
                {GRADE_OPTIONS.map(g => (
                  <option key={g.grade} value={g.grade}>{g.grade} ({g.points.toFixed(2)})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20"
            >
              Save Grade
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
