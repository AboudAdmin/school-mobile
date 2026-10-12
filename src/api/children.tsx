// A parent's children and the active one (mirrors the Web childContext: `activeChildId` is remembered, falls back to the first child).
//   GET /parents/children (parent/admin/secretary) → [{ id, classId, user: { name }, class: { name } }]
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import apiClient from './apiClient';
import { useAuth } from '../auth/AuthContext';
import { resolveActiveChild } from './childResolve';

export const ACTIVE_CHILD_KEY = 'activeChildId';

export interface Child {
  id: number;
  classId: number | null;
  user?: { name: string } | null;
  class?: { name: string } | null;
}

export const childKeys = { all: ['children'] as const };

interface ActiveChild {
  children: Child[];
  active: Child | null;
  select: (id: number) => void;
  isPending: boolean;
  isError: boolean;
  refetch: () => void;
}

const Ctx = createContext<ActiveChild | null>(null);

/** Null outside a parent session. */
export const useActiveChild = () => useContext(Ctx);

/** Mounted for parents only. */
export function ActiveChildProvider({ children: tree }: { children: React.ReactNode }) {
  const q = useQuery({
    queryKey: childKeys.all,
    queryFn: async () => {
      const d = (await apiClient.get('/parents/children')).data;
      return (Array.isArray(d) ? d : d.data ?? []) as Child[];
    },
  });
  const [storedId, setStoredId] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem(ACTIVE_CHILD_KEY)
      .then((v) => setStoredId(Number(v) || null))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const list = q.data ?? [];
  const active = loaded ? resolveActiveChild(list, storedId) : null;
  // a stale stored id (child unlinked) falls back to the first child and is replaced
  useEffect(() => {
    if (active && active.id !== storedId) {
      setStoredId(active.id);
      AsyncStorage.setItem(ACTIVE_CHILD_KEY, String(active.id)).catch(() => {});
    }
  }, [active, storedId]);

  const select = useCallback((id: number) => {
    setStoredId(id);
    AsyncStorage.setItem(ACTIVE_CHILD_KEY, String(id)).catch(() => {});
  }, []);

  return <Ctx.Provider value={{ children: list, active, select, isPending: q.isPending || !loaded, isError: q.isError, refetch: () => void q.refetch() }}>{tree}</Ctx.Provider>;
}

/** Wraps the app: only a signed-in parent gets the child context (others render untouched). */
export function ParentScope({ children: tree }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user?.role === 'parent' ? <ActiveChildProvider>{tree}</ActiveChildProvider> : <>{tree}</>;
}
