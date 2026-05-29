import { SESSION_EXPIRED } from '../config/api';

export { SESSION_EXPIRED };

export function isSessionExpiredError(error) {
  return error?.message === SESSION_EXPIRED;
}

export function getApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;

  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please check your connection and try again.';
  }

  if (!error.response) {
    if (error.request) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    return error.message || fallback;
  }

  const { status, data } = error.response;
  const serverMessage = data?.message;

  switch (status) {
    case 400:
      return serverMessage || 'Invalid request. Please check your input.';
    case 401:
      return serverMessage || 'Invalid credentials. Please sign in again.';
    case 403:
      return serverMessage || 'You do not have permission to perform this action.';
    case 404:
      return serverMessage || 'The requested resource was not found.';
    case 409:
      return serverMessage || 'This resource already exists.';
    case 422:
      return serverMessage || 'Validation failed. Please check your input.';
    case 500:
      return 'Server error. Please try again later.';
    default:
      return serverMessage || `${fallback} (${status})`;
  }
}

export function createSessionExpiredError() {
  const error = new Error(SESSION_EXPIRED);
  error.name = 'SessionExpiredError';
  return error;
}
