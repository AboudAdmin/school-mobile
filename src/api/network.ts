import { useSyncExternalStore } from 'react';
import { onlineManager } from '@tanstack/react-query';

/** Same online signal React Query uses (wired to expo-network in queryClient.ts). */
export const useOnline = () => useSyncExternalStore(onlineManager.subscribe.bind(onlineManager), () => onlineManager.isOnline());
