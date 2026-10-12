import axios from 'axios';

// Screens never read `err.response`: they ask this module what happened.
export type ApiErrorKind = 'forbidden' | 'rate_limited' | 'network' | 'server' | 'other';
export interface ApiErrorInfo {
  kind: ApiErrorKind;
  status?: number;
  /** Seconds, from the Retry-After header (429 only). */
  retryAfter?: number;
  /** The backend's own message, when it sent one. */
  message?: string;
}

export const classifyError = (err: unknown): ApiErrorInfo => {
  if (!axios.isAxiosError(err)) return { kind: 'other' };
  const status = err.response?.status;
  if (!err.response) return { kind: 'network' };
  const message = (err.response.data as { message?: string } | undefined)?.message;
  if (status === 403) return { kind: 'forbidden', status, message };
  if (status === 429) {
    const retryAfter = Number(err.response.headers?.['retry-after']);
    return { kind: 'rate_limited', status, message, retryAfter: retryAfter > 0 ? retryAfter : undefined };
  }
  if (status && status >= 500) return { kind: 'server', status, message };
  return { kind: 'other', status, message };
};

/** Backend message for form-style errors (400/409/422), else the fallback. */
export const errorMessage = (err: unknown, fallback: string) => classifyError(err).message || fallback;

// Query/mutation failures that deserve a global toast reach the UI through this bus (see GlobalErrorHandler).
const listeners = new Set<(e: ApiErrorInfo) => void>();
export const apiErrors = {
  on: (fn: (e: ApiErrorInfo) => void) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  emit: (e: ApiErrorInfo) => listeners.forEach((fn) => fn(e)),
};
