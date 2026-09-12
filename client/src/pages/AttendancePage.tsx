import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AttendanceRecord } from '../types';
import { ProgressBar } from '../components/common/ProgressBar';
import { Modal } from '../components/common/Modal';
import { 
  CheckCircle2, 
  XCircle, 
  Sliders, 
  AlertTriangle, 
  CheckCheck, 
  Plus, 
  Minus, 
  ShieldAlert, 
  ShieldCheck, 
  Info 
} from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit rule modal
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [rulePercent, setRulePercent] = useState<number>(80);
  const [editTotal, setEditTotal] = useState<number>(0);
  const [editAttended, setEditAttended] = useState<number>(0);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.attendance.getAll();
      setRecords(res.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleMark = async (id: string, type: 'present' | 'absent') => {
    try {
      await api.attendance.mark(id, type);
      fetchAttendance();
    } catch (err: any) {
      alert('Failed to update attendance: ' + err.message);
    }
  };

  const openRuleModal = (rec: AttendanceRecord) => {
    setSelectedRecord(rec);
    setRulePercent(rec.minimum_required_pct);
    setEditTotal(rec.total_classes);
    setEditAttended(rec.attended_classes);
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;

    try {
      await api.attendance.updateRule(selectedRecord.id, {
        minimum_required_pct: rulePercent,
        total_classes: editTotal,
        attended_classes: editAttended
      });
      setSelectedRecord(null);
      fetchAttendance();
    } catch (err: any) {
      alert('Failed to update rule: ' + err.message);
    }
  };

  // Overall statistics
  let grandTotal = 0;
  let grandAttended = 0;
  records.forEach(r => {
    grandTotal += r.total_classes;
    grandAttended += r.attended_classes;
  });
  const overallPct = grandTotal > 0 ? Math.round((grandAttended / grandTotal) * 100 * 10) / 10 : 100;
  const overallStatus = overallPct >= 80 ? 'Safe' : overallPct >= 75 ? 'Warning' : 'Critical';

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Attendance Tracker</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
              Configurable Rules
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log lectures and lab attendance with university policy threshold rules (e.g. 80% mandatory attendance).
          </p>
        </div>
      </div>

      {/* Hero Overview Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-md ${
            overallStatus === 'Safe' 
              ? 'bg-emerald-500 text-white shadow-emerald-500/25'
              : overallStatus === 'Warning'
              ? 'bg-amber-500 text-white shadow-amber-500/25'
              : 'bg-rose-500 text-white shadow-rose-500/25'
          }`}>
            {overallPct}%
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Overall Semester Attendance
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                overallStatus === 'Safe'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
              }`}>
                {overallStatus === 'Safe' ? 'Exam Eligible' : 'At Risk'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Attended <span className="font-bold text-slate-800 dark:text-slate-200">{grandAttended}</span> out of{' '}
              <span className="font-bold text-slate-800 dark:text-slate-200">{grandTotal}</span> recorded lecture & lab sessions across all modules.
            </p>
          </div>
        </div>

        <div className="w-full md:w-72">
          <ProgressBar value={overallPct} threshold={80} label="Minimum 80% Standard Rule" />
        </div>
      </div>

      {/* Subject Attendance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {records.map((rec) => {
          const absentCount = Math.max(0, rec.total_classes - rec.attended_classes);
          const isSafe = rec.percentage !== undefined && rec.percentage >= rec.minimum_required_pct;

          return (
            <div
              key={rec.id}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: rec.color_hex || '#6366f1' }}
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {rec.subject_name}
                      </h3>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {rec.subject_code}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => openRuleModal(rec)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Configure Attendance Rule"
                  >
                    <Sliders size={16} />
                  </button>
                </div>

                {/* Metrics Breakdown */}
                <div className="grid grid-cols-3 gap-2 my-4 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    <div className="text-xs text-slate-400">Total</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono">
                      {rec.total_classes}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                    <div className="text-xs text-emerald-600 dark:text-emerald-400">Present</div>
                    <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300 font-mono">
                      {rec.attended_classes}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
                    <div className="text-xs text-rose-600 dark:text-rose-400">Absent</div>
                    <div className="text-lg font-bold text-rose-700 dark:text-rose-300 font-mono">
                      {absentCount}
                    </div>
                  </div>
                </div>

                {/* Visual Progress Bar with Threshold */}
                <ProgressBar
                  value={rec.percentage || 0}
                  threshold={rec.minimum_required_pct}
                  label="Class Attendance Rate"
                />

                {/* Safe / Margin Info */}
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    {isSafe ? (
                      <ShieldCheck size={14} className="text-emerald-500" />
                    ) : (
                      <ShieldAlert size={14} className="text-rose-500" />
                    )}
                    <span>Rule: {rec.minimum_required_pct}% min required</span>
                  </span>

                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {rec.canMissMoreClasses !== undefined && rec.canMissMoreClasses > 0
                      ? `Can skip up to ${rec.canMissMoreClasses} classes`
                      : 'Attendance critical!'}
                  </span>
                </div>
              </div>

              {/* Quick Log Buttons: Mark Present / Mark Absent */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <button
                  onClick={() => handleMark(rec.id, 'present')}
                  className="flex-1 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-emerald-200 dark:border-emerald-800"
                >
                  <CheckCircle2 size={15} />
                  <span>+1 Present</span>
                </button>

                <button
                  onClick={() => handleMark(rec.id, 'absent')}
                  className="flex-1 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900/80 text-rose-700 dark:text-rose-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-rose-200 dark:border-rose-800"
                >
                  <XCircle size={15} />
                  <span>+1 Absent</span>
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Configurable Rule Modal */}
      <Modal
        isOpen={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        title={`Configure Rule: ${selectedRecord?.subject_name}`}
      >
        <form onSubmit={handleSaveRule} className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
            <Info size={16} className="text-brand-500 shrink-0 mt-0.5" />
            <span>
              Adjust the minimum attendance percentage mandated by your university department or edit historical class counts.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Minimum Required Attendance Threshold ({rulePercent}%)
            </label>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={rulePercent}
              onChange={(e) => setRulePercent(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>50%</span>
              <span className="font-bold text-brand-600">75% (Standard)</span>
              <span className="font-bold text-brand-600">80% (Strict)</span>
              <span>95%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Total Classes
              </label>
              <input
                type="number"
                min="0"
                value={editTotal}
                onChange={(e) => setEditTotal(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Attended Classes
              </label>
              <input
                type="number"
                min="0"
                max={editTotal}
                value={editAttended}
                onChange={(e) => setEditAttended(Math.min(editTotal, Math.max(0, Number(e.target.value))))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setSelectedRecord(null)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20"
            >
              Save Rule & Counts
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
