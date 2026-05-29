import axios from 'axios';
import { API_BASE_URL, API_TIMEOUT_MS } from '../config/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: API_TIMEOUT_MS,
});

export function createAuthorizedClient(token) {
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT_MS,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
}

export function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}
