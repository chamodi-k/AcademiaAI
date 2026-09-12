import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DashboardSummaryData } from '../types';
import { CountdownTimer } from '../components/common/CountdownTimer';
import { ProgressBar } from '../components/common/ProgressBar';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  AlertTriangle, 
  GraduationCap, 
  CheckCircle2, 
  CheckSquare, 
  Square, 
  Sparkles, 
  ArrowUpRight, 
  Flame, 
  Layers, 
  Plus, 
  ExternalLink 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { student, user } = useAuth();
  const [data, setData] = useState<DashboardSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.dashboard.getSummary();
      setData(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleToggleTask = async (planId: string, taskId: string) => {
    if (!data) return;
    try {
      await api.ai.toggleTask(planId, taskId);
      // Optimistic update
      setData(prev => {
        if (!prev) return prev;
        const updatedTasks = prev.aiStudyPlan.todayTasks.map(t => 
          t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        return {
          ...prev,
          aiStudyPlan: {
            ...prev.aiStudyPlan,
            todayTasks: updatedTasks
          }
        };
      });
    } catch (err: any) {
      alert('Could not update task: ' + err.message);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-900">
        <AlertTriangle className="mx-auto text-rose-500 mb-3" size={36} />
        <h3 className="text-lg font-bold text-rose-800 dark:text-rose-200">Unable to load dashboard</h3>
        <p className="text-sm text-rose-600 dark:text-rose-400 mb-4">{error}</p>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-700 p-6 sm:p-8 text-white shadow-xl shadow-brand-500/15">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-brand-200 text-xs font-semibold uppercase tracking-wider mb-1">
              <span>{data.student.university}</span>
              <span>•</span>
              <span>Year {data.student.academic_year}, Semester {data.student.current_semester}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {getGreeting()}, {data.student.full_name?.split(' ')[0] || 'Student'} 👋
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-brand-100 max-w-xl">
              You have <span className="font-bold underline">{data.todaysClasses.length} classes</span> today and{' '}
              <span className="font-bold underline">{data.upcomingAssignments.length} upcoming assignments</span>. Stay on track!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/ai-planner"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-brand-700 hover:bg-brand-50 text-xs font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <Sparkles size={16} className="text-brand-600" />
              <span>AI Study Planner</span>
            </Link>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* GPA Widget */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current GPA</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <GraduationCap size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {data.gpa.overallGPA.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 font-medium">/ 4.00</span>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              Target: {data.gpa.targetGPA.toFixed(2)} GPA
            </p>
          </div>
        </div>

        {/* Attendance Widget */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Attendance %</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              data.attendance.status === 'Safe' 
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' 
                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
            }`}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {data.attendance.overallPercentage}%
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                data.attendance.status === 'Safe'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
              }`}>
                {data.attendance.status}
              </span>
            </div>
            <div className="mt-2">
              <ProgressBar value={data.attendance.overallPercentage} threshold={80} showValueText={false} size="sm" />
            </div>
          </div>
        </div>

        {/* Urgent Assignments Widget */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pending Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <BookOpen size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                {data.upcomingAssignments.length}
              </span>
              <span className="text-xs text-slate-400">assignments</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Next due: {data.upcomingAssignments[0] ? `${data.upcomingAssignments[0].daysRemaining}d` : 'None'}
            </p>
          </div>
        </div>

        {/* Next Exam Widget */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Next Exam</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Flame size={16} />
            </div>
          </div>
          <div className="mt-3">
            {data.upcomingExams[0] ? (
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  {data.upcomingExams[0].subject_name || data.upcomingExams[0].subject_code}
                </div>
                <div className="mt-1">
                  <CountdownTimer targetDate={data.upcomingExams[0].exam_date} badgeOnly />
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-2">No upcoming exams scheduled.</p>
            )}
          </div>
        </div>

      </div>

      {/* Main Grid: Today's Classes + Upcoming Assignments & Exams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols wide): Today's Classes & AI Plan Checklist */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Today's Classes */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Today's Classes ({data.todayDayName})
                </h2>
              </div>
              <Link
                to="/timetable"
                className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
              >
                View Full Timetable <ArrowUpRight size={13} />
              </Link>
            </div>

            {data.todaysClasses.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Calendar className="mx-auto mb-2 opacity-50" size={32} />
                <p className="text-xs">No lectures or lab sessions scheduled for today. Enjoy your self-study time!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.todaysClasses.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-10 rounded-full"
                        style={{ backgroundColor: item.color_hex || '#6366f1' }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                            {item.start_time} - {item.end_time}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                            {item.class_type}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {item.subject_name} ({item.subject_code})
                        </h4>
                        <p className="text-xs text-slate-400">
                          📍 {item.location} • 👨‍🏫 {item.lecturer}
                        </p>
                      </div>
                    </div>

                    <div className="hidden sm:block text-right">
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                        Scheduled
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Study Plan Task Checklist */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-purple-500" />
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  AI Study Plan for Today
                </h2>
              </div>
              <Link
                to="/ai-planner"
                className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                Open AI Planner <ArrowUpRight size={13} />
              </Link>
            </div>

            {data.aiStudyPlan.todayTasks.length === 0 ? (
              <div className="p-6 text-center bg-purple-50/50 dark:bg-purple-950/20 rounded-xl border border-purple-100 dark:border-purple-900/40">
                <Sparkles size={28} className="mx-auto text-purple-400 mb-2" />
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  No active study plan generated yet.
                </p>
                <Link
                  to="/ai-planner"
                  className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold"
                >
                  Generate Plan with Gemini
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Sprint: <span className="font-semibold text-slate-700 dark:text-slate-300">{data.aiStudyPlan.planTitle}</span>
                </div>
                {data.aiStudyPlan.todayTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => data.aiStudyPlan.planId && handleToggleTask(data.aiStudyPlan.planId, task.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      task.completed
                        ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 line-through'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-800'
                    }`}
                  >
                    <button className="mt-0.5 text-purple-600 dark:text-purple-400">
                      {task.completed ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${task.completed ? 'text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                          {task.subject}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold">
                          {task.duration_minutes} mins
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {task.topic}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Study Hours Analytics Chart */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Study Hours This Week</h3>
                <p className="text-xs text-slate-400">Logged hours vs. Daily Target (3h)</p>
              </div>
              <Link to="/analytics" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                Full Analytics
              </Link>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.weeklyStudyHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      borderColor: '#334155', 
                      borderRadius: '8px', 
                      color: '#f8fafc',
                      fontSize: '12px'
                    }} 
                  />
                  <Bar dataKey="hours" fill="#6366f1" radius={[4, 4, 0, 0]} name="Actual Hours" />
                  <Bar dataKey="target" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column: Upcoming Deadlines & Countdown Clocks */}
        <div className="space-y-6">
          
          {/* Upcoming Exams with Countdown */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock size={16} className="text-rose-500" />
                <span>Upcoming Exams</span>
              </h3>
              <Link to="/exams" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                All Exams
              </Link>
            </div>

            {data.upcomingExams.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No upcoming examinations.</p>
            ) : (
              <div className="space-y-3">
                {data.upcomingExams.map((exam) => (
                  <div 
                    key={exam.id} 
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {exam.subject_name}
                        </h4>
                        <p className="text-[11px] text-slate-400">{exam.exam_type}</p>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold border border-rose-200 dark:border-rose-900/60">
                        {exam.weightage}% weight
                      </span>
                    </div>

                    <CountdownTimer targetDate={exam.exam_date} />
                    <p className="text-[11px] text-slate-400">📍 {exam.location}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Assignments */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BookOpen size={16} className="text-amber-500" />
                <span>Assignments</span>
              </h3>
              <Link to="/assignments" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                Kanban
              </Link>
            </div>

            {data.upcomingAssignments.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No assignments pending! 🎉</p>
            ) : (
              <div className="space-y-3">
                {data.upcomingAssignments.map((asg) => (
                  <div
                    key={asg.id}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400">
                        {asg.subject_code || asg.subject_name}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        asg.priority === 'High' 
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' 
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {asg.priority}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {asg.title}
                    </h4>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-slate-400">
                      <span>Due in {asg.daysRemaining} days</span>
                      <span className="font-semibold text-brand-600 dark:text-brand-400">{asg.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Academic Actions */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800/60 dark:to-purple-950/20 border border-indigo-100 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              Quick Academic Tools
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/summarizer"
                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 text-xs font-semibold hover:shadow-xs transition-all text-slate-800 dark:text-slate-200 flex flex-col items-center text-center gap-1.5"
              >
                <span className="text-lg">📚</span>
                <span>Summarize Notes</span>
              </Link>
              <Link
                to="/quiz"
                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 text-xs font-semibold hover:shadow-xs transition-all text-slate-800 dark:text-slate-200 flex flex-col items-center text-center gap-1.5"
              >
                <span className="text-lg">🧠</span>
                <span>Generate Quiz</span>
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
