import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudentProfile } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  student: StudentProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  updateProfile: (data: Partial<StudentProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('academia_token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('academia_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [student, setStudent] = useState<StudentProfile | null>(() => {
    const saved = localStorage.getItem('academia_student');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.auth.getProfile();
          setUser(res.data.user);
          setStudent(res.data.student);
          localStorage.setItem('academia_user', JSON.stringify(res.data.user));
          if (res.data.student) {
            localStorage.setItem('academia_student', JSON.stringify(res.data.student));
          }
        } catch (err) {
          console.error('Session validation failed:', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (credentials: any) => {
    const res = await api.auth.login(credentials);
    const loginData = res?.data;
    if (!loginData || typeof loginData.token !== 'string' || !loginData.user) {
      throw new Error('The server returned an incomplete login response. Please try again.');
    }

    const { token: newToken, user: newUser, student: newStudent } = loginData;
    
    setToken(newToken);
    setUser(newUser);
    setStudent(newStudent ?? null);
    
    localStorage.setItem('academia_token', newToken);
    localStorage.setItem('academia_user', JSON.stringify(newUser));
    if (newStudent) {
      localStorage.setItem('academia_student', JSON.stringify(newStudent));
    } else {
      localStorage.removeItem('academia_student');
    }
  };

  const register = async (userData: any) => {
    const res = await api.auth.register(userData);
    const { token: newToken, user: newUser, student: newStudent } = res.data;
    
    setToken(newToken);
    setUser(newUser);
    setStudent(newStudent);
    
    localStorage.setItem('academia_token', newToken);
    localStorage.setItem('academia_user', JSON.stringify(newUser));
    if (newStudent) {
      localStorage.setItem('academia_student', JSON.stringify(newStudent));
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setStudent(null);
    localStorage.removeItem('academia_token');
    localStorage.removeItem('academia_user');
    localStorage.removeItem('academia_student');
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await api.auth.getProfile();
      setUser(res.data.user);
      setStudent(res.data.student);
      localStorage.setItem('academia_user', JSON.stringify(res.data.user));
      if (res.data.student) {
        localStorage.setItem('academia_student', JSON.stringify(res.data.student));
      }
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const updateProfile = async (data: Partial<StudentProfile>) => {
    const res = await api.auth.updateProfile(data);
    setStudent(res.data);
    localStorage.setItem('academia_student', JSON.stringify(res.data));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        student,
        token,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'ADMIN',
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
