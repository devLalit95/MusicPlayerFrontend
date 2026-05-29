export function getStoredToken() {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    if (!user || typeof user !== 'object') return null;
    return user;
  } catch {
    return null;
  }
}

export function setAuthSession(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getAdminToken() {
  try {
    return sessionStorage.getItem('adminToken');
  } catch {
    return null;
  }
}

export function setAdminToken(token) {
  sessionStorage.setItem('adminToken', token);
}

export function clearAdminToken() {
  sessionStorage.removeItem('adminToken');
}
