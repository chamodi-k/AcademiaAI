import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  CalendarDays, 
  ClipboardList, 
  ClockAlert, 
  GraduationCap, 
  CheckCheck, 
  Sparkles, 
  FileText, 
  HelpCircle, 
  BarChart3, 
  User, 
  ShieldCheck,
  Zap
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
  const { isAdmin, student } = useAuth();

  const navItems = [
    { to: '/', label: 'Main Dashboard', icon: LayoutDashboard, exact: true },
    { to: '/timetable', label: 'Timetable', icon: CalendarDays },
    { to: '/assignments', label: 'Assignments', icon: ClipboardList },
    { to: '/exams', label: 'Exams & Deadlines', icon: ClockAlert },
    { to: '/gpa', label: 'GPA Calculator', icon: GraduationCap },
    { to: '/attendance', label: 'Attendance Tracker', icon: CheckCheck },
    { 
      to: '/ai-planner', 
      label: 'AI Study Planner', 
      icon: Sparkles,
      highlight: true
    },
    { to: '/summarizer', label: 'AI Notes Summarizer', icon: FileText },
    { to: '/quiz', label: 'AI Quiz Generator', icon: HelpCircle },
    { to: '/analytics', label: 'Academic Analytics', icon: BarChart3 },
    { to: '/profile', label: 'Student Profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          
          {/* Navigation Section */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
              Academic Hub
            </div>
            <nav className="space-y-1">
              {navItems.slice(0, 6).map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.exact}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 dark:bg-brand-600'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`
                    }
                  >
                    <Icon size={17} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* AI Capabilities Section */}
          <div>
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Gemini AI Power
              </span>
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/60">
                <Zap size={10} /> Smart
              </span>
            </div>
            <nav className="space-y-1">
              {navItems.slice(6, 9).map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 group'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={17} className={item.highlight ? 'text-purple-500 group-hover:scale-110 transition-transform' : ''} />
                      <span>{item.label}</span>
                    </div>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Insights & Admin Section */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
              Analytics & Account
            </div>
            <nav className="space-y-1">
              {navItems.slice(9).map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-brand-500 text-white shadow-md shadow-brand-500/25 dark:bg-brand-600'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`
                    }
                  >
                    <Icon size={17} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}

              {isAdmin && (
                <NavLink
                  to="/admin"
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                        : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                    }`
                  }
                >
                  <ShieldCheck size={17} />
                  <span>Admin Dashboard</span>
                </NavLink>
              )}
            </nav>
          </div>

        </div>

        {/* Bottom Student Mini Card */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-950 flex items-center justify-center text-brand-600 dark:text-brand-400 text-xs font-bold">
              {student?.full_name ? student.full_name[0] : 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {student?.full_name || 'Academic Student'}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                Year {student?.academic_year || 3} • Sem {student?.current_semester || 1}
              </p>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
};
