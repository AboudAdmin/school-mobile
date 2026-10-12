import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
import { MutationCache, QueryClient, focusManager, onlineManager } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { addNetworkStateListener } from 'expo-network';
import { apiErrors, classifyError } from './errors';

const DAY = 24 * 60 * 60 * 1000;

// Global failure mapping: the axios interceptor emits 403 (auth_forbidden), 429 and 5xx for every request, query or not.
// A write that dies on the network is reported here; offline reads are covered by the banner and the screens' inline retry.
const reportNetworkLoss = (err: unknown) => {
  const info = classifyError(err);
  if (info.kind === 'network') apiErrors.emit(info);
};

// Cache-then-refresh: persisted data renders instantly on launch, then refetches in the background.
export const queryClient = new QueryClient({
  mutationCache: new MutationCache({ onError: reportNetworkLoss }),
  defaultOptions: {
    queries: {
      gcTime: DAY,
      staleTime: 30 * 1000,
      // 4xx will not change on retry (403/429 would only hammer the API); transient failures retry twice
      retry: (count, err) => {
        const { kind, status } = classifyError(err);
        return count < 2 && kind !== 'forbidden' && kind !== 'rate_limited' && !(status && status < 500);
      },
    },
    // Writes never wait for a connection and fire later: they fail fast and the screens disable submit while offline
    mutations: { networkMode: 'always', retry: false },
  },
});

// RN has no window focus: map app foreground/background to focusManager so stale queries refetch on foreground
// and refetchInterval polling (messages) pauses in the background.
focusManager.setEventListener((setFocused) => {
  const sub = AppState.addEventListener('change', (s) => setFocused(s === 'active'));
  return () => sub.remove();
});

export const persister = createAsyncStoragePersister({ storage: AsyncStorage, key: 'queryCache' });
export const persistOptions = { persister, maxAge: DAY };

// React Query pauses fetches while offline and refetches on reconnect
onlineManager.setEventListener((setOnline) => {
  const sub = addNetworkStateListener((s) => setOnline(!!s.isConnected && s.isInternetReachable !== false));
  return () => sub.remove();
});

/** The persisted cache holds school records: wipe it whenever the session ends so the next user never sees it. */
export const clearQueryCache = async () => {
  queryClient.clear();
  await AsyncStorage.removeItem('activeChildId').catch(() => {}); // the parent's remembered child
  await persister.removeClient();
};
