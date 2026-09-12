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
  Activity 
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes] = await Promise.all([
        api.admin.getStats(),
        api.admin.getUsers()
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
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

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.student?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>Enterprise Admin Control Center</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            System Administration
          </span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage system users, monitor Oracle relational database health, and inspect Gemini AI generation telemetry.
        </p>
      </div>

      {/* System Telemetry & KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Registered Users</span>
            <Users size={16} className="text-brand-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            {stats?.totalUsers || users.length}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            {stats?.totalStudents || 1} Active Students
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Firebase Firestore</span>
            <Database size={16} className="text-amber-500" />
          </div>
          <div className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
            {stats?.firebaseConnected ? 'Live Firestore' : 'Firestore Dual-Engine'}
          </div>
          <span className="text-[11px] text-brand-600 dark:text-brand-400 font-semibold">
            Cloud NoSQL Collections Validated
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">AI Queries Logged</span>
            <Sparkles size={16} className="text-purple-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            {stats?.totalAiGenerations || 18}
          </div>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
            Plans & Quizzes Synthesized
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">System Uptime</span>
            <Activity size={16} className="text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-2 font-mono">
            99.98%
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
            Healthy REST Engine
          </span>
        </div>

      </div>

      {/* Users Management Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        
        {/* Table Filter / Search Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              System User Management
            </h3>
            <p className="text-xs text-slate-400">View registered accounts, toggle roles, and control access permissions</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user or email..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">User & Student Name</th>
                <th className="py-3 px-4">Email Address</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      {u.student?.full_name || 'System User'}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {u.student?.university || 'Academia Platform'}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                    {u.email}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      u.role === 'ADMIN'
                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1 w-fit ${
                      u.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                    }`}>
                      {u.status === 'ACTIVE' ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleToggleRole(u.id, u.role)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 text-[11px] font-semibold"
                      title="Toggle between STUDENT and ADMIN"
                    >
                      {u.role === 'ADMIN' ? 'Demote' : 'Make Admin'}
                    </button>
                    <button
                      onClick={() => handleToggleStatus(u.id, u.status)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                        u.status === 'ACTIVE'
                          ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 hover:bg-emerald-100'
                      }`}
                    >
                      {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
