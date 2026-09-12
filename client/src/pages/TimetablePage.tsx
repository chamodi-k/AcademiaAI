import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { TimetableItem, Subject, DayOfWeek } from '../types';
import { Modal } from '../components/common/Modal';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  MapPin, 
  User, 
  Calendar, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  Download
} from 'lucide-react';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

export const TimetablePage: React.FC = () => {
  const [timetable, setTimetable] = useState<TimetableItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [viewMode, setViewMode] = useState<'weekly' | 'daily'>('weekly');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TimetableItem | null>(null);
  const [formData, setFormData] = useState({
    subject_id: '',
    day_of_week: 'Monday' as DayOfWeek,
    start_time: '09:00',
    end_time: '11:00',
    location: '',
    class_type: 'Lecture'
  });
  const [formError, setFormError] = useState<string | null>(null);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const res = await api.timetable.getAll();
      setTimetable(res.data.timetable);
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
    fetchTimetable();
  }, []);

  const openAddModal = (day?: DayOfWeek, startTime?: string) => {
    setEditingItem(null);
    setFormData({
      subject_id: subjects[0]?.id || '',
      day_of_week: day || selectedDay,
      start_time: startTime || '09:00',
      end_time: startTime ? `${String(Number(startTime.split(':')[0]) + 2).padStart(2, '0')}:00` : '11:00',
      location: 'Lab 02 / Hall A',
      class_type: 'Lecture'
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: TimetableItem) => {
    setEditingItem(item);
    setFormData({
      subject_id: item.subject_id,
      day_of_week: item.day_of_week,
      start_time: item.start_time,
      end_time: item.end_time,
      location: item.location,
      class_type: item.class_type
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (formData.start_time >= formData.end_time) {
      setFormError('End time must be after start time.');
      return;
    }

    try {
      if (editingItem) {
        await api.timetable.update(editingItem.id, formData);
      } else {
        await api.timetable.create(formData);
      }
      setIsModalOpen(false);
      fetchTimetable();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save class schedule.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this class from your timetable?')) return;
    try {
      await api.timetable.delete(id);
      setIsModalOpen(false);
      fetchTimetable();
    } catch (err: any) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Timetable & Schedule
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your recurring weekly university lectures, lab practicals, and tutorial sessions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle: Weekly / Daily */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold">
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'weekly'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Weekly Grid
            </button>
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'daily'
                  ? 'bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Daily View
            </button>
          </div>

          <button
            onClick={() => openAddModal()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-md shadow-brand-500/20 active:scale-95"
          >
            <Plus size={16} />
            <span>Add Class</span>
          </button>
        </div>
      </div>

      {/* Daily View Day Selector Tabs */}
      {viewMode === 'daily' && (
        <div className="flex overflow-x-auto gap-2 py-1 scrollbar-none">
          {DAYS.map((day) => {
            const count = timetable.filter(t => t.day_of_week === day).length;
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  isSelected
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                <span>{day}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Weekly View Grid */}
      {viewMode === 'weekly' ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Table Header: Days of the week */}
              <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-center font-bold text-xs text-slate-700 dark:text-slate-300">
                {DAYS.map((day) => (
                  <div key={day} className="py-3 px-2 border-r last:border-r-0 border-slate-200 dark:border-slate-800">
                    <div>{day}</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {timetable.filter(t => t.day_of_week === day).length} classes
                    </div>
                  </div>
                ))}
              </div>

              {/* Table Body: Day columns */}
              <div className="grid grid-cols-7 min-h-[460px] divide-x divide-slate-100 dark:divide-slate-800">
                {DAYS.map((day) => {
                  const dayClasses = timetable
                    .filter(t => t.day_of_week === day)
                    .sort((a, b) => a.start_time.localeCompare(b.start_time));

                  return (
                    <div key={day} className="p-2 space-y-2 bg-transparent hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors">
                      {dayClasses.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => openEditModal(item)}
                          style={{ borderLeftColor: item.color_hex || '#6366f1' }}
                          className="group relative p-2.5 rounded-xl border-l-4 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xs hover:shadow-md cursor-pointer transition-all hover:scale-[1.02]"
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                            <span className="font-bold text-brand-600 dark:text-brand-400">{item.start_time} - {item.end_time}</span>
                            <span className="px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-700 font-medium">{item.class_type}</span>
                          </div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                            {item.subject_name}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 truncate">
                            <MapPin size={10} /> {item.location}
                          </div>
                        </div>
                      ))}

                      {dayClasses.length === 0 && (
                        <div 
                          onClick={() => openAddModal(day)}
                          className="h-24 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-700 hover:border-brand-400 hover:text-brand-500 cursor-pointer transition-all text-xs"
                        >
                          + Add
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Daily View List */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-brand-500" />
            <span>Schedule for {selectedDay}</span>
          </h3>

          {timetable.filter(t => t.day_of_week === selectedDay).length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Calendar size={40} className="mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">No classes scheduled on {selectedDay}.</p>
              <button
                onClick={() => openAddModal(selectedDay)}
                className="mt-3 px-4 py-2 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 rounded-xl text-xs font-bold hover:bg-brand-100"
              >
                + Add class for {selectedDay}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {timetable
                .filter(t => t.day_of_week === selectedDay)
                .sort((a, b) => a.start_time.localeCompare(b.start_time))
                .map((item) => (
                  <div
                    key={item.id}
                    onClick={() => openEditModal(item)}
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-2.5 h-12 rounded-full"
                        style={{ backgroundColor: item.color_hex || '#6366f1' }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                            {item.start_time} - {item.end_time}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold">
                            {item.class_type}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                          {item.subject_name} ({item.subject_code})
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin size={12} /> {item.location}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <User size={12} /> {item.lecturer}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditModal(item); }}
                        className="p-2 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-white dark:hover:bg-slate-800"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Class Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Scheduled Class' : 'Add Class to Timetable'}
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
              Select Subject Module *
            </label>
            <select
              value={formData.subject_id}
              onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              required
            >
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} - {sub.name} ({sub.lecturer})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Day of Week *
              </label>
              <select
                value={formData.day_of_week}
                onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value as DayOfWeek })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                {DAYS.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Class Type
              </label>
              <select
                value={formData.class_type}
                onChange={(e) => setFormData({ ...formData, class_type: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="Lecture">Lecture</option>
                <option value="Practical">Practical Lab</option>
                <option value="Tutorial">Tutorial Session</option>
                <option value="Discussion">Discussion Seminar</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                End Time *
              </label>
              <input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Room / Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Lab 04 (Level 2), Auditorium A"
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
                {editingItem ? 'Save Changes' : 'Add Class'}
              </button>
            </div>
          </div>
        </form>
      </Modal>

    </div>
  );
};
