import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Subject, StudyPlan } from '../types';
import { 
  Sparkles, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Square, 
  CheckSquare, 
  AlertCircle, 
  Lightbulb, 
  RefreshCw, 
  BookOpen, 
  History, 
  Flame 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AiStudyPlannerPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>([]);
  const [activePlan, setActivePlan] = useState<StudyPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [examDate, setExamDate] = useState(
    new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  );
  const [availableHours, setAvailableHours] = useState<number>(3.0);
  const [weakSubject, setWeakSubject] = useState<string>('Database Management Systems');
  const [error, setError] = useState<string | null>(null);

  const fetchInitialData = async () => {
    try {
      setFetchingHistory(true);
      const [subRes, plansRes] = await Promise.all([
        api.subjects.getAll(),
        api.ai.getStudyPlans()
      ]);
      setSubjects(subRes.data);
      setSelectedSubjectIds(subRes.data.map((s: Subject) => s.id));
      setStudyPlans(plansRes.data);
      if (plansRes.data.length > 0) {
        setActivePlan(plansRes.data[0]);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setFetchingHistory(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.ai.generateStudyPlan({
        title: title || `AI Revision Sprint (${examDate})`,
        subjectIds: selectedSubjectIds,
        examDate,
        availableHoursPerDay: availableHours,
        weakSubjects: weakSubject ? [weakSubject] : []
      });

      const newPlan = res.data;
      setStudyPlans(prev => [newPlan, ...prev]);
      setActivePlan(newPlan);
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
    } catch (err: any) {
      setError(err.message || 'Failed to generate study plan.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (planId: string, taskId: string) => {
    try {
      await api.ai.toggleTask(planId, taskId);

      setActivePlan(prev => {
        if (!prev) return prev;
        const updatedSchedule = prev.plan_data.weekly_schedule.map(day => ({
          ...day,
          tasks: day.tasks.map(task => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
          )
        }));
        return {
          ...prev,
          plan_data: {
            ...prev.plan_data,
            weekly_schedule: updatedSchedule
          }
        };
      });
    } catch (err: any) {
      alert('Could not update task: ' + err.message);
    }
  };

  const toggleSubjectSelect = (subId: string) => {
    setSelectedSubjectIds(prev => 
      prev.includes(subId) ? prev.filter(id => id !== subId) : [...prev, subId]
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Gemini AI Study Planner</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
              <Sparkles size={12} className="text-purple-500" /> AI Powered
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Generates personalized, balanced daily study blocks with extra weighting on your difficult modules.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (1 col): Parameters Form */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Sparkles size={18} className="text-purple-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Configure Revision Goal
            </h3>
          </div>

          <form onSubmit={handleGeneratePlan} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Plan Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Midterm 2-Week Exam Sprint"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Modules to Include in Plan
              </label>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {subjects.map(sub => {
                  const isChecked = selectedSubjectIds.includes(sub.id);
                  return (
                    <div
                      key={sub.id}
                      onClick={() => toggleSubjectSelect(sub.id)}
                      className={`flex items-center justify-between p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-200 font-semibold'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="truncate">{sub.name}</span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 shadow-xs">
                        {sub.code}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Target Upcoming Exam Date
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Available Study Time: {availableHours} hours / day
              </label>
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={availableHours}
                onChange={(e) => setAvailableHours(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>1h</span>
                <span>3h (Recommended)</span>
                <span>8h (Intense)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Weakest Module (Requires Extra Weight)
              </label>
              <select
                value={weakSubject}
                onChange={(e) => setWeakSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 focus:outline-none font-semibold text-purple-600 dark:text-purple-400"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.name}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-purple-500/20 active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Gemini is generating schedule...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} />
                  <span>Generate Personalized Plan</span>
                </>
              )}
            </button>
          </form>

          {/* Past Generated Plans History */}
          {studyPlans.length > 1 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Saved Study Plans
              </span>
              <div className="space-y-1.5">
                {studyPlans.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setActivePlan(p)}
                    className={`w-full text-left p-2 rounded-xl text-xs transition-all ${
                      activePlan?.id === p.id
                        ? 'bg-purple-50 dark:bg-purple-950/60 font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="truncate">{p.title}</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {new Date(p.created_at).toLocaleDateString()} • {p.available_hours_per_day}h/day
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (2 cols): Generated Schedule & Study Blocks */}
        <div className="lg:col-span-2 space-y-6">
          {activePlan ? (
            <>
              {/* Strategic Plan Header */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-xl shadow-purple-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-500/20 border border-purple-400/30 text-purple-300 uppercase tracking-wider">
                    Active Study Plan
                  </span>
                  <span className="text-xs text-purple-200">
                    {activePlan.available_hours_per_day} Hours / Day
                  </span>
                </div>

                <h2 className="text-xl font-extrabold tracking-tight">
                  {activePlan.title}
                </h2>

                <p className="text-xs text-purple-100/90 leading-relaxed">
                  {activePlan.plan_data.overview}
                </p>
              </div>

              {/* Day-by-Day Schedule Grid */}
              <div className="space-y-4">
                {activePlan.plan_data.weekly_schedule.map((day) => (
                  <div
                    key={day.day_name}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {day.day_name}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          • {day.focus}
                        </span>
                      </div>
                      <span className="text-xs font-mono font-semibold text-purple-600 dark:text-purple-400">
                        {day.tasks.reduce((sum, t) => sum + t.duration_minutes, 0)} mins total
                      </span>
                    </div>

                    <div className="space-y-2">
                      {day.tasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => handleToggleTask(activePlan.id, task.id)}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                            task.completed
                              ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 line-through'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800'
                          }`}
                        >
                          <button className="mt-0.5 text-purple-600 dark:text-purple-400 shrink-0">
                            {task.completed ? <CheckSquare size={17} /> : <Square size={17} />}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-bold ${task.completed ? 'text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                {task.subject}
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold">
                                {task.duration_minutes >= 60 
                                  ? `${Math.floor(task.duration_minutes / 60)}h ${task.duration_minutes % 60 > 0 ? `${task.duration_minutes % 60}m` : ''}`
                                  : `${task.duration_minutes}m`}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {task.topic}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Study Recommendations */}
              {activePlan.plan_data.tips && activePlan.plan_data.tips.length > 0 && (
                <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
                    <Lightbulb size={16} />
                    <span>Gemini AI Academic Tips</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-amber-900 dark:text-amber-200 pl-4 list-disc">
                    {activePlan.plan_data.tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="py-20 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <Sparkles size={48} className="mx-auto text-purple-400 mb-3 animate-pulse" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Ready to Generate Your Personalized Study Schedule
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Fill in your exam date, daily hours, and weak subjects on the left to let Gemini AI formulate your timetable.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
