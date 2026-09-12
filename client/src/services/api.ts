const configuredApiBase = import.meta.env.VITE_API_URL?.trim();
const API_BASE = (configuredApiBase || '/api').replace(/\/+$/, '');

function getToken(): string | null {
  return localStorage.getItem('academia_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error('Unable to connect to the AcademiaAI server. Make sure the backend is running.');
  }

  const responseText = await response.text();
  let data: unknown = null;

  if (responseText.trim()) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      localStorage.removeItem('academia_token');
      localStorage.removeItem('academia_user');
      window.location.href = '/login';
    }
    const message = isApiPayload(data) && typeof data.message === 'string'
      ? data.message
      : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  if (responseText.trim() && data === null) {
    throw new Error(`The server returned a non-JSON response (status ${response.status}).`);
  }

  return (data ?? {}) as T;
}

function isApiPayload(value: unknown): value is { message?: unknown } {
  return typeof value === 'object' && value !== null;
}

export const api = {
  // Auth
  auth: {
    login: (credentials: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getProfile: () => request<any>('/auth/me'),
    updateProfile: (profileData: any) => request<any>('/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) }),
    changePassword: (passwords: any) => request<any>('/auth/change-password', { method: 'POST', body: JSON.stringify(passwords) }),
  },

  // Dashboard
  dashboard: {
    getSummary: () => request<any>('/dashboard/summary'),
  },

  // Subjects
  subjects: {
    getAll: () => request<any>('/subjects'),
    create: (data: any) => request<any>('/subjects', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/subjects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/subjects/${id}`, { method: 'DELETE' }),
  },

  // Timetable
  timetable: {
    getAll: () => request<any>('/timetable'),
    create: (data: any) => request<any>('/timetable', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/timetable/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/timetable/${id}`, { method: 'DELETE' }),
  },

  // Assignments
  assignments: {
    getAll: () => request<any>('/assignments'),
    create: (data: any) => request<any>('/assignments', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/assignments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/assignments/${id}`, { method: 'DELETE' }),
  },

  // Exams
  exams: {
    getAll: () => request<any>('/exams'),
    create: (data: any) => request<any>('/exams', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => request<any>(`/exams/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/exams/${id}`, { method: 'DELETE' }),
  },

  // GPA
  gpa: {
    getData: () => request<any>('/gpa'),
    saveGrade: (data: any) => request<any>('/gpa/grades', { method: 'POST', body: JSON.stringify(data) }),
    deleteGrade: (id: string) => request<any>(`/gpa/grades/${id}`, { method: 'DELETE' }),
  },

  // Attendance
  attendance: {
    getAll: () => request<any>('/attendance'),
    mark: (id: string, type: 'present' | 'absent') => request<any>(`/attendance/${id}/mark`, { method: 'POST', body: JSON.stringify({ type }) }),
    updateRule: (id: string, data: any) => request<any>(`/attendance/${id}/rule`, { method: 'PUT', body: JSON.stringify(data) }),
  },

  // AI
  ai: {
    generateStudyPlan: (data: any) => request<any>('/ai/study-plan', { method: 'POST', body: JSON.stringify(data) }),
    getStudyPlans: () => request<any>('/ai/study-plans'),
    toggleTask: (planId: string, taskId: string) => request<any>(`/ai/study-plan/${planId}/task/${taskId}`, { method: 'PATCH' }),
    summarizeNotes: (data: any) => request<any>('/ai/summarize-notes', { method: 'POST', body: JSON.stringify(data) }),
    generateQuiz: (data: any) => request<any>('/ai/quiz/generate', { method: 'POST', body: JSON.stringify(data) }),
    submitQuiz: (id: string, answers: Record<string, string>) => request<any>(`/ai/quiz/${id}/submit`, { method: 'POST', body: JSON.stringify({ answers }) }),
    getQuizzes: () => request<any>('/ai/quizzes'),
  },

  // Calendar
  calendar: {
    downloadIcs: async () => {
      const token = getToken();
      const response = await fetch(`${API_BASE}/calendar/export.ics`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('Failed to export calendar');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'AcademiaAI_Academic_Calendar.ics';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    }
  },

  // Notes
  notes: {
    getAll: () => request<any>('/notes'),
    create: (data: any) => request<any>('/notes', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) => request<any>(`/notes/${id}`, { method: 'DELETE' }),
  },

  // Admin
  admin: {
    getStats: () => request<any>('/admin/stats'),
    getUsers: () => request<any>('/admin/users'),
    updateUserStatus: (id: string, data: any) => request<any>(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  }
};
