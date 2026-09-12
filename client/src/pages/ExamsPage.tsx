import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Exam, Subject } from '../types';
import { CountdownTimer } from '../components/common/CountdownTimer';
import { Modal } from '../components/common/Modal';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  MapPin, 
  Calendar, 
  AlertCircle, 
  Flame, 
  CheckCircle2, 
  FileText 
} from 'lucide-react';

export const ExamsPage: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Exam | null>(null);
  const [formData, setFormData] = useState({
    subject_id: '',
    exam_type: 'Midterm Examination',
    exam_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    exam_time: '09:00',
    location: 'Main Examination Hall A',
    weightage: 30,
    status: 'Upcoming',
    notes: ''
  });
  const [formError, setFormError] = useState<string | null>(null);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await api.exams.getAll();
      setExams(res.data.exams);
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
    fetchExams();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      subject_id: subjects[0]?.id || '',
      exam_type: 'Midterm Examination',
      exam_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      exam_time: '09:00',
      location: 'Main Examination Hall A',
      weightage: 30,
      status: 'Upcoming',
      notes: ''
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (exam: Exam) => {
    setEditingItem(exam);
    const d = new Date(exam.exam_date);
    setFormData({
      subject_id: exam.subject_id,
      exam_type: exam.exam_type,
      exam_date: d.toISOString().split('T')[0],
      exam_time: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
      location: exam.location,
      weightage: exam.weightage,
      status: exam.status,
      notes: exam.notes || ''
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      const combinedDateTime = new Date(`${formData.exam_date}T${formData.exam_time}:00`).toISOString();
      const payload = {
        ...formData,
        exam_date: combinedDateTime
      };

      if (editingItem) {
        await api.exams.update(editingItem.id, payload);
      } else {
        await api.exams.create(payload);
      }
      setIsModalOpen(false);
      fetchExams();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save examination schedule.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this scheduled exam?')) return;
    try {
      await api.exams.delete(id);
      setIsModalOpen(false);
      fetchExams();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <span>Examinations & Deadlines</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
              Live Countdowns
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Stay ahead of midterms, lab practicals, finals, and viva presentations with real-time countdown alerts.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/20 active:scale-95"
        >
          <Plus size={16} />
          <span>Add Exam</span>
        </button>
      </div>

      {/* Exams Grid */}
      {exams.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <Clock size={40} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No exams currently scheduled</h3>
          <p className="text-xs text-slate-400 mt-1">Add your midterms or finals to see live countdown clocks.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => {
            const isUrgent = (exam.daysRemaining !== undefined && exam.daysRemaining <= 3 && !exam.isPassed);

            return (
              <div
                key={exam.id}
                className={`relative flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-slate-900 border transition-all shadow-xs hover:shadow-lg ${
                  isUrgent
                    ? 'border-rose-300 dark:border-rose-900/80 ring-1 ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  {/* Top Subject Tag & Weightage */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-lg text-white shadow-xs"
                      style={{ backgroundColor: exam.color_hex || '#6366f1' }}
                    >
                      {exam.subject_code} • {exam.subject_name}
                    </span>

                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {exam.weightage}% Final
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {exam.exam_type}
                  </h3>

                  {/* Location & DateTime */}
                  <div className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-brand-500" />
                      <span>{new Date(exam.exam_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>at {new Date(exam.exam_date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-rose-500" />
                      <span>{exam.location}</span>
                    </div>
                  </div>

                  {exam.notes && (
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Key topics: </span>
                      {exam.notes}
                    </div>
                  )}
                </div>

                {/* Countdown Timer Block */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <CountdownTimer targetDate={exam.exam_date} />

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[11px] font-semibold text-slate-400">
                      Status: <span className="text-slate-700 dark:text-slate-300">{exam.status}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(exam)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Edit Exam"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(exam.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Delete Exam"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Exam Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Examination' : 'Schedule New Examination'}
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
              Exam Title / Type *
            </label>
            <select
              value={formData.exam_type}
              onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            >
              <option value="Midterm Examination">Midterm Examination</option>
              <option value="Final Theory Exam">Final Theory Exam</option>
              <option value="Practical Lab Exam">Practical Lab Exam</option>
              <option value="Viva / Oral Defense">Viva / Oral Defense</option>
              <option value="Continuous Assessment Quiz">Continuous Assessment Quiz</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Exam Date *
              </label>
              <input
                type="date"
                value={formData.exam_date}
                onChange={(e) => setFormData({ ...formData, exam_date: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Time *
              </label>
              <input
                type="time"
                value={formData.exam_time}
                onChange={(e) => setFormData({ ...formData, exam_time: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Location / Hall
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Main Examination Hall A"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
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
              Revision Focus / Notes
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Important formulas, chapters, past paper questions..."
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
                {editingItem ? 'Save Changes' : 'Add Exam'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

    </div>
  );
};
