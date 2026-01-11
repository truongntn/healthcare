import { useState, useEffect } from 'react';
import { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('intellihealth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string, role?: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock user data based on email
    const mockUser: User = {
      id: email === 'doc1@example.com' ? 'doc1' : 'pat1',
      email,
      name: email === 'doc1@example.com' ? 'Dr. Sarah Johnson' : 'Jane Doe',
      role: email === 'doc1@example.com' ? 'clinician' : 'patient',
    };

    setUser(mockUser);
    setIsAuthenticated(true);
    localStorage.setItem('intellihealth_user', JSON.stringify(mockUser));
    
    return mockUser;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('intellihealth_user');
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
  };
}