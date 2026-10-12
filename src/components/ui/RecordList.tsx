import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, View, type ListRenderItem } from 'react-native';
import { useInfiniteQuery, type QueryKey } from '@tanstack/react-query';
import { useTheme } from '../../theme/ThemeProvider';
import { tr } from '../../i18n';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import LoadingState from './LoadingState';
import SearchBar from './SearchBar';

/** Backend list convention (technical_report §8): `{ data, pagination: { currentPage, hasNextPage, ... } }`. */
export interface Page<T> {
  items: T[];
  hasNextPage: boolean;
}

interface Props<T> {
  /** Include every server-side filter value in the key so changing a filter refetches from page 1. */
  queryKey: QueryKey;
  fetchPage: (page: number) => Promise<Page<T>>;
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T) => string;
  /** Filter controls rendered under the search bar (e.g. status chips). */
  filters?: React.ReactNode;
  /** Client-side search over loaded rows — only for endpoints that have no server search param. */
  search?: { placeholder: string; match: (item: T, query: string) => boolean };
  emptyTitle: string;
  emptyMessage?: string;
  /** Poll interval in ms (e.g. conversations — the stack has no socket). */
  refetchInterval?: number;
  /** Floating primary action (create on a list): rendered over the list. */
  fab?: React.ReactNode;
  /** Extra filters live in a BottomSheet owned by the screen: rendered next to the list (the screen opens it from `filters`). */
  filterSheet?: React.ReactNode;
  /** A server-side filter other than search is on: an empty result then offers "Clear filters". */
  filtersActive?: boolean;
  onClearFilters?: () => void;
}

/** The one list pattern: FlatList + pull-to-refresh + infinite scroll + filter/search bar + loading/empty/error states. */
export default function RecordList<T>({ queryKey, fetchPage, renderItem, keyExtractor, filters, search, emptyTitle, emptyMessage, refetchInterval, fab, filterSheet, filtersActive, onClearFilters }: Props<T>) {
  const { colors, spacing, radius, typography } = useTheme();
  const [query, setQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const { data, error, isPending, isFetchingNextPage, hasNextPage, fetchNextPage, refetch } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    initialPageParam: 1,
    getNextPageParam: (last, _all, lastPageParam) => (last.hasNextPage ? lastPageParam + 1 : undefined),
    refetchInterval,
  });

  const items = useMemo(() => {
    const all = data?.pages.flatMap((p) => p.items) ?? [];
    const q = query.trim().toLowerCase();
    return search && q ? all.filter((i) => search.match(i, q)) : all;
  }, [data, query, search]);

  // onEndReached never fires when the loaded rows don't fill the viewport: keep loading until they do (or pages run out)
  const [listHeight, setListHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  useEffect(() => {
    if (listHeight && contentHeight < listHeight && hasNextPage && !isFetchingNextPage && !error) fetchNextPage();
  }, [listHeight, contentHeight, hasNextPage, isFetchingNextPage, error, fetchNextPage]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const header = (
    <View style={{ padding: spacing.lg, gap: spacing.md, backgroundColor: colors.background }}>
      {search ? <SearchBar value={query} onChangeText={setQuery} placeholder={search.placeholder} /> : null}
      {filters}
    </View>
  );

  if (error && !data) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {header}
        <ErrorState message={tr('Could not load data.')} retryLabel={tr('Retry')} onRetry={() => refetch()} />
      </View>
    );
  }

  const filtered = !!query.trim() || !!filtersActive;
  return (
    <View style={{ flex: 1 }}>
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      data={items}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={header}
      stickyHeaderIndices={[0]}
      keyboardShouldPersistTaps="handled"
      ListEmptyComponent={isPending ? <LoadingState /> : filtered ? (
        <EmptyState title={emptyTitle} message={emptyMessage} actionLabel={tr('Clear filters')} onAction={() => (setQuery(''), onClearFilters?.())} />
      ) : (
        <EmptyState title={emptyTitle} message={emptyMessage} />
      )}
      ListFooterComponent={
        isFetchingNextPage ? (
          <ActivityIndicator style={{ padding: spacing.lg }} color={colors.primary} />
        ) : error ? (
          // a failed next page keeps the rows already loaded and offers a retry inline
          <ErrorState message={tr('Could not load more.')} retryLabel={tr('Retry')} onRetry={() => fetchNextPage()} />
        ) : null
      }
      onEndReached={() => hasNextPage && !isFetchingNextPage && !error && fetchNextPage()}
      onEndReachedThreshold={0.4}
      onLayout={(e) => setListHeight(e.nativeEvent.layout.height)}
      onContentSizeChange={(_w, h) => setContentHeight(h)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
    />
    {fab}
    {filterSheet}
    </View>
  );
}
