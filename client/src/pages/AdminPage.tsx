import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  ShieldCheck, 
  Users, 
  Database, 
  Sparkles, 
  Server, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Activity,
  Bell,
  UserCog,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  FileBarChart2,
  Send,
  Trash2,
  Plus
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [announcement, setAnnouncement] = useState({ title: '', message: '', type: 'ANNOUNCEMENT', targetUserIds: [] as string[] });
  const [notifications, setNotifications] = useState<any[]>([]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, notificationsRes] = await Promise.all([
        api.admin.getStats(),
        api.admin.getUsers(),
        api.admin.getNotifications()
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setNotifications(notificationsRes.data || []);
    } catch (err: any) {
      console.error('Failed to load admin telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await api.admin.updateUserStatus(userId, { status: nextStatus });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: nextStatus } : u));
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === 'ADMIN' ? 'STUDENT' : 'ADMIN';
    try {
      await api.admin.updateUserStatus(userId, { role: nextRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: nextRole } : u));
    } catch (err: any) {
      alert('Failed to update role: ' + err.message);
    }
  };

  const handleSendAnnouncement = async () => {
    if (!announcement.title || !announcement.message) {
      alert('Please provide both a title and a message.');
      return;
    }

    try {
      await api.admin.createAnnouncement({
        title: announcement.title,
        message: announcement.message,
        type: announcement.type,
        targetUserIds: announcement.targetUserIds.length ? announcement.targetUserIds : undefined
      });
      setAnnouncement({ title: '', message: '', type: 'ANNOUNCEMENT', targetUserIds: [] });
      await fetchAdminData();
      alert('Announcement sent successfully.');
    } catch (err: any) {
      alert('Failed to send announcement: ' + err.message);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>Admin Control Center</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            System Administration
          </span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage users, monitor platform health, and send announcements to students.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-400 uppercase">Students</span><Users size={16} className="text-brand-500" /></div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2 font-mono">{stats?.totalStudents || users.filter(u => u.role === 'STUDENT').length}</div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{stats?.activeStudents || 0} Active</span>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-400 uppercase">Subjects</span><BookOpen size={16} className="text-indigo-500" /></div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2 font-mono">{stats?.totalSubjects || 0}</div>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">tracked</span>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-400 uppercase">Assignments</span><ClipboardCheck size={16} className="text-amber-500" /></div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2 font-mono">{stats?.totalAssignments || 0}</div>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">{stats?.activeAssignments || 0} active</span>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-400 uppercase">Upcoming Exams</span><CalendarDays size={16} className="text-rose-500" /></div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2 font-mono">{stats?.upcomingExams || 0}</div>
          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold">scheduled</span>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-400 uppercase">Attendance</span><FileBarChart2 size={16} className="text-emerald-500" /></div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2 font-mono">{stats?.averageAttendance || 0}%</div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{stats?.attendanceWarnings || 0} warning(s)</span>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-400 uppercase">Firestore</span><Database size={16} className="text-amber-500" /></div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">{stats?.firebaseConnected ? 'Live' : 'Safe Mode'}</div>
          <span className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold">Academic data</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Student Management</h3>
              <p className="text-xs text-slate-400">View and manage role and account access</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search user or email..." className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">{u.student?.full_name || 'System User'}</td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>{u.role}</span></td>
                    <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1 w-fit ${u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400'}`}>{u.status === 'ACTIVE' ? <CheckCircle2 size={11} /> : <XCircle size={11} />}{u.status}</span></td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button onClick={() => handleToggleRole(u.id, u.role)} className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 text-[11px] font-semibold">{u.role === 'ADMIN' ? 'Demote' : 'Make Admin'}</button>
                      <button onClick={() => handleToggleStatus(u.id, u.status)} className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${u.status === 'ACTIVE' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 hover:bg-emerald-100'}`}>{u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100">
            <Bell size={16} className="text-brand-600" />
            <span>Send Announcement</span>
          </div>
          <div className="space-y-3">
            <input value={announcement.title} onChange={(e) => setAnnouncement(prev => ({ ...prev, title: e.target.value }))} placeholder="Announcement title" className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            <textarea value={announcement.message} onChange={(e) => setAnnouncement(prev => ({ ...prev, message: e.target.value }))} placeholder="Message to send" rows={4} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500" />
            <select value={announcement.type} onChange={(e) => setAnnouncement(prev => ({ ...prev, type: e.target.value }))} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500">
              <option value="ANNOUNCEMENT">Announcement</option>
              <option value="INFO">Info</option>
              <option value="WARNING">Warning</option>
              <option value="SUCCESS">Success</option>
            </select>
            <button onClick={handleSendAnnouncement} className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/25"><Send size={14} />Send Notification</button>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Recent Notifications</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notifications.length === 0 ? <p className="text-xs text-slate-500">No notifications yet.</p> : notifications.slice(0, 6).map((n) => (
                <div key={n.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-2 bg-slate-50 dark:bg-slate-800/60">
                  <div className="flex items-center justify-between gap-2"><span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{n.title}</span><span className="text-[10px] text-slate-400">{n.type}</span></div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
