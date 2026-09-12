import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  Award, 
  Clock, 
  GraduationCap 
} from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'];

export const AnalyticsPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [gpaData, setGpaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const [dashRes, gpaRes] = await Promise.all([
          api.dashboard.getSummary(),
          api.gpa.getData()
        ]);
        setDashboardData(dashRes.data);
        setGpaData(gpaRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading portfolio analytics...</div>;
  }

  // 1. Study Hours Data
  const studyHoursData = dashboardData?.weeklyStudyHours || [
    { day: 'Mon', hours: 3.5, target: 3 },
    { day: 'Tue', hours: 2.5, target: 3 },
    { day: 'Wed', hours: 4.0, target: 3 },
    { day: 'Thu', hours: 2.0, target: 3 },
    { day: 'Fri', hours: 3.0, target: 3 },
    { day: 'Sat', hours: 5.0, target: 4 },
    { day: 'Sun', hours: 4.5, target: 4 }
  ];

  // 2. Assignment Completion Breakdown
  const assignmentStatusData = [
    { name: 'Completed', value: 4, color: '#10b981' },
    { name: 'In Progress', value: 3, color: '#6366f1' },
    { name: 'Pending', value: 2, color: '#f59e0b' }
  ];

  // 3. GPA Progression over Semesters
  const gpaProgressionData = [
    { semester: 'Sem 1', gpa: 3.42, target: 3.80 },
    { semester: 'Sem 2', gpa: 3.55, target: 3.80 },
    { semester: 'Sem 3', gpa: 3.68, target: 3.80 },
    { semester: 'Sem 4', gpa: 3.75, target: 3.80 },
    { semester: 'Sem 5 (Current)', gpa: 3.82, target: 3.80 }
  ];

  // 4. Attendance Breakdown
  const attendanceBreakdown = dashboardData?.attendance?.subjectBreakdown?.map((a: any) => ({
    subject: a.subject_code || a.subject_name?.substring(0, 10),
    percentage: a.percentage,
    required: a.minimum_required_pct
  })) || [];

  // 5. Quiz Performance
  const quizScoresData = [
    { test: 'Test 1', score: 70 },
    { test: 'Test 2', score: 80 },
    { test: 'Test 3', score: 75 },
    { test: 'Test 4', score: 90 },
    { test: 'Test 5', score: 100 }
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>Academic Analytics & Insights</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900">
            Portfolio Showcase
          </span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Comprehensive performance metrics, study habit distribution, and academic trajectory visualization.
        </p>
      </div>

      {/* Top Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Weekly Study Time</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            24.5 hrs
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">+3.5h vs last week</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Overall Attendance</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            {dashboardData?.attendance?.overallPercentage}%
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Exceeds 80% rule</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Cumulative GPA</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            {dashboardData?.gpa?.overallGPA.toFixed(2)}
          </div>
          <span className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold">First Class Track</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Quiz Mastery</span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            83% Avg
          </div>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">AI Evaluations</span>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Study Hours per Week */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Clock size={16} className="text-brand-500" />
              <span>Study Hours Per Day vs Target</span>
            </h3>
            <span className="text-xs text-slate-400">Hours</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studyHoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="hours" name="Logged Hours" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" name="Daily Target" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: GPA Progression Over Semesters */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-500" />
              <span>GPA Progression Over Semesters</span>
            </h3>
            <span className="text-xs text-slate-400">4.0 Scale</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gpaProgressionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis dataKey="semester" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[2.5, 4.0]} stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="gpa" name="Actual GPA" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="target" name="Target Honor" stroke="#f59e0b" strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Subject Attendance vs 80% Rule */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-brand-500" />
              <span>Subject Attendance Compliance</span>
            </h3>
            <span className="text-xs text-slate-400">Percentage %</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.3} />
                <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                <YAxis type="category" dataKey="subject" stroke="#94a3b8" fontSize={11} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="percentage" name="Attended %" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Assignment Status Distribution (Donut) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Award size={16} className="text-purple-500" />
              <span>Assignment Completion Distribution</span>
            </h3>
            <span className="text-xs text-slate-400">Status Ratio</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assignmentStatusData}
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {assignmentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
