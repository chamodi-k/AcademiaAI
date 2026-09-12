import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Assignment, Subject, AssignmentStatus, AssignmentPriority } from '../types';
import { Modal } from '../components/common/Modal';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Filter, 
  LayoutGrid, 
  List, 
  Check, 
  Clock3 
} from 'lucide-react';

export const AssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Assignment | null>(null);
  const [formData, setFormData] = useState({
    subject_id: '',
    title: '',
    description: '',
    due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    priority: 'Medium' as AssignmentPriority,
    status: 'Pending' as AssignmentStatus,
    weightage: 15
  });
  const [formError, setFormError] = useState<string | null>(null);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await api.assignments.getAll();
      setAssignments(res.data.assignments);
      setSubjects(res.data.subjects);
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
    fetchAssignments();
  }, []);

  const openCreateModal = (defaultStatus: AssignmentStatus = 'Pending') => {
    setEditingItem(null);
    setFormData({
      subject_id: subjects[0]?.id || '',
      title: '',
      description: '',
      due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      priority: 'Medium',
      status: defaultStatus,
      weightage: 15
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Assignment) => {
    setEditingItem(item);
    setFormData({
      subject_id: item.subject_id,
      title: item.title,
      description: item.description || '',
      due_date: new Date(item.due_date).toISOString().split('T')[0],
      priority: item.priority,
      status: item.status,
      weightage: item.weightage || 15
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError('Assignment title is required.');
      return;
    }

    try {
      if (editingItem) {
        await api.assignments.update(editingItem.id, formData);
      } else {
        await api.assignments.create(formData);
      }
      setIsModalOpen(false);
      fetchAssignments();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save assignment.');
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: AssignmentStatus) => {
    try {
      await api.assignments.update(id, { status: newStatus });
      setAssignments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    } catch (err: any) {
      alert('Status update failed: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await api.assignments.delete(id);
      setIsModalOpen(false);
      fetchAssignments();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  const filteredAssignments = assignments.filter(a => {
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && a.priority !== priorityFilter) return false;
    return true;
  });

  const columns: AssignmentStatus[] = ['Pending', 'In Progress', 'Completed'];

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Assignment Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track coursework deadlines, project milestones, and assignment progress.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>

          <button
            onClick={() => openCreateModal()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/20 active:scale-95"
          >
            <Plus size={16} />
            <span>New Assignment</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-500 dark:text-slate-400">
          <Filter size={14} /> Filter:
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="ALL">All Statuses ({assignments.length})</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="ALL">All Priorities</option>
          <option value="High">High Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="Low">Low Priority</option>
        </select>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((colStatus) => {
            const colItems = filteredAssignments.filter(a => a.status === colStatus);
            const colColor = {
              'Pending': 'border-amber-400 text-amber-600 dark:text-amber-400 bg-amber-500/10',
              'In Progress': 'border-brand-500 text-brand-600 dark:text-brand-400 bg-brand-500/10',
              'Completed': 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
            }[colStatus];

            return (
              <div
                key={colStatus}
                className="flex flex-col rounded-2xl bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-4 min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${colColor}`} />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      {colStatus}
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-500">
                      {colItems.length}
                    </span>
                  </div>

                  <button
                    onClick={() => openCreateModal(colStatus)}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    title={`Add assignment to ${colStatus}`}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Column Cards */}
                <div className="flex-1 space-y-3">
                  {colItems.map((item) => {
                    const diffDays = Math.ceil((new Date(item.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    const isUrgent = diffDays <= 2 && item.status !== 'Completed';

                    return (
                      <div
                        key={item.id}
                        onClick={() => openEditModal(item)}
                        className="group p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/70 shadow-xs hover:shadow-md cursor-pointer transition-all hover:scale-[1.01] space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded text-white"
                            style={{ backgroundColor: item.color_hex || '#6366f1' }}
                          >
                            {item.subject_code || item.subject_name}
                          </span>
                          
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            item.priority === 'High'
                              ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                              : item.priority === 'Medium'
                              ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                          }`}>
                            {item.priority}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                            {item.title}
                          </h4>
                          {item.description && (
                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/50 text-[11px]">
                          <span className={`flex items-center gap-1 font-medium ${
                            isUrgent ? 'text-rose-600 dark:text-rose-400 font-bold animate-pulse' : 'text-slate-400'
                          }`}>
                            <Clock3 size={12} />
                            {item.status === 'Completed'
                              ? 'Finished'
                              : diffDays < 0
                              ? 'Overdue'
                              : diffDays === 0
                              ? 'Due Today'
                              : `Due in ${diffDays}d`}
                          </span>

                          <div className="flex items-center gap-1">
                            {/* Quick status change buttons */}
                            {item.status !== 'Pending' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleUpdateStatus(item.id, 'Pending'); }}
                                className="p-1 rounded text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                                title="Move to Pending"
                              >
                                ⏳
                              </button>
                            )}
                            {item.status !== 'In Progress' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleUpdateStatus(item.id, 'In Progress'); }}
                                className="p-1 rounded text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                                title="Move to In Progress"
                              >
                                🚀
                              </button>
                            )}
                            {item.status !== 'Completed' && (
                              <button
                                onClick={(e) => { e.stopPropagation(); handleUpdateStatus(item.id, 'Completed'); }}
                                className="p-1 rounded text-slate-400 hover:text-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                                title="Mark Completed"
                              >
                                ✅
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {colItems.length === 0 && (
                    <div className="h-32 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 flex items-center justify-center text-xs text-slate-400">
                      No assignments in {colStatus}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Title & Subject</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Weightage</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAssignments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{item.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.subject_name} ({item.subject_code})</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {new Date(item.due_date).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        item.priority === 'High' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400' :
                        item.priority === 'Medium' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-800'
                      }`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={item.status}
                        onChange={(e) => handleUpdateStatus(item.id, e.target.value as AssignmentStatus)}
                        className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      {item.weightage || 15}%
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Assignment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Course Assignment' : 'Create New Assignment'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Assignment Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Database Normalization & SQL Queries"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Subject Module *
              </label>
              <select
                value={formData.subject_id}
                onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as AssignmentPriority })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as AssignmentStatus })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Weightage %
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.weightage}
                onChange={(e) => setFormData({ ...formData, weightage: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Instructions / Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Key deliverables, GitHub repository link, guidelines..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            {editingItem ? (
              <button
                type="button"
                onClick={() => handleDelete(editingItem.id)}
                className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-bold flex items-center gap-1.5"
              >
                <Trash2 size={14} /> Delete
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
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
                {editingItem ? 'Save Changes' : 'Create Assignment'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

    </div>
  );
};
