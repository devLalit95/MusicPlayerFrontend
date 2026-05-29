import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuthSession, getStoredToken, getStoredUser } from '../utils/storage';

export function useUser() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileDropdownRef = useRef(null);

  const redirectToLogin = useCallback(() => {
    clearAuthSession();
    navigate('/login', { replace: true });
  }, [navigate]);

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      setLoading(false);
      redirectToLogin();
      return;
    }

    const userData = getStoredUser();

    if (!userData) {
      setError('Failed to load user data');
      setLoading(false);
      redirectToLogin();
      return;
    }

    setUser({
      username: userData.username ?? '',
      name: userData.name ?? userData.username ?? '',
      email: userData.email ?? '',
      role: userData.role ?? 'user',
    });
    setLoading(false);
  }, [redirectToLogin]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleProfileDropdown = () => {
    setShowProfileDropdown((prev) => !prev);
  };

  const handleLogout = () => {
    clearAuthSession();
    navigate('/login', { replace: true });
  };

  return {
    user,
    loading,
    error,
    showProfileDropdown,
    profileDropdownRef,
    toggleProfileDropdown,
    handleLogout,
  };
}
