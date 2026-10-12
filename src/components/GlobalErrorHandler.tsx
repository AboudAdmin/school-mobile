import { useEffect } from 'react';
import { authEvents } from '../api/apiClient';
import { apiErrors } from '../api/errors';
import { tr } from '../i18n';
import { useToast } from './ui/Toast';

/** The one place API failures become toasts (403 via authEvents; 429 / 5xx / network from the query client defaults). */
export default function GlobalErrorHandler() {
  const toast = useToast();
  useEffect(() => {
    let last = { message: '', at: 0 };
    // a screen that fires several requests would stack identical toasts
    const show = (message: string) => {
      const now = Date.now();
      if (message === last.message && now - last.at < 5000) return;
      last = { message, at: now };
      toast({ message, tone: 'danger' });
    };
    const offForbidden = authEvents.on((e) => {
      if (e === 'auth_forbidden') show(tr("You don't have permission to do this."));
    });
    const offErrors = apiErrors.on((e) => {
      if (e.kind === 'rate_limited')
        show(e.retryAfter ? tr('Too many requests. Try again in {{seconds}} s.', { seconds: e.retryAfter }) : tr('Too many requests. Please try again shortly.'));
      else if (e.kind === 'server') show(tr('Something went wrong on our side. Please try again later.'));
      else if (e.kind === 'network') show(tr('No connection. Check your network and try again.'));
    });
    return () => {
      offForbidden();
      offErrors();
    };
  }, [toast]);
  return null;
}
