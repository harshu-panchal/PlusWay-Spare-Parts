import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useInfiniteScroll — chunked "load more on scroll" pager.
 *
 * The caller passes a `fetchPage(page)` function that resolves to:
 *   { items: T[], hasMore: boolean, total?: number }
 *
 * The hook owns:
 *   - the current page counter,
 *   - the accumulated `items` list (page 1 replaces, subsequent pages append),
 *   - loading / error / total state,
 *   - an IntersectionObserver attached to the returned `sentinelRef` that
 *     bumps the page when the sentinel enters the viewport.
 *
 * When `resetKey` changes (e.g. filter or sort changes), the list resets and
 * page 1 is fetched again. `fetchPage` is held in a ref so callers don't need
 * to memoize it with useCallback to avoid extra fetches.
 *
 * Two effects deliberately separate concerns:
 *   1. Reset + load page 1, triggered by `resetKey`.
 *   2. Append subsequent pages, triggered by `page > 1`.
 * This avoids the "double fetch when resetKey changes while page > 1" issue
 * a single combined effect would have.
 */
const useInfiniteScroll = ({ fetchPage, resetKey }) => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const sentinelRef = useRef(null);

  // Latest fetchPage held in a ref so identity changes between renders don't
  // re-trigger the fetch effects.
  const fetchPageRef = useRef(fetchPage);
  useEffect(() => {
    fetchPageRef.current = fetchPage;
  }, [fetchPage]);

  // (1) Reset + fetch first page when resetKey changes (also runs on mount).
  useEffect(() => {
    let cancelled = false;
    setItems([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    setTotal(0);
    setLoading(true);

    Promise.resolve(fetchPageRef.current(1))
      .then((result) => {
        if (cancelled) return;
        const newItems = Array.isArray(result?.items) ? result.items : [];
        setItems(newItems);
        setHasMore(Boolean(result?.hasMore));
        if (Number.isFinite(result?.total)) setTotal(result.total);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
        setHasMore(false);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [resetKey]);

  // (2) Append subsequent pages.
  useEffect(() => {
    if (page <= 1) return;
    let cancelled = false;
    setLoading(true);

    Promise.resolve(fetchPageRef.current(page))
      .then((result) => {
        if (cancelled) return;
        const newItems = Array.isArray(result?.items) ? result.items : [];
        setItems((prev) => [...prev, ...newItems]);
        setHasMore(Boolean(result?.hasMore));
        if (Number.isFinite(result?.total)) setTotal(result.total);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
        setHasMore(false);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  // (3) IntersectionObserver on the sentinel bumps the page when visible.
  // `rootMargin: 300px` triggers the next fetch slightly before the user
  // actually reaches the bottom so the next chunk lands without a visible gap.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  // Manual reload (e.g. after an external mutation). Re-runs page 1 fetch
  // without changing resetKey.
  const reload = useCallback(() => {
    let cancelled = false;
    setItems([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    setLoading(true);
    Promise.resolve(fetchPageRef.current(1))
      .then((result) => {
        if (cancelled) return;
        setItems(Array.isArray(result?.items) ? result.items : []);
        setHasMore(Boolean(result?.hasMore));
        if (Number.isFinite(result?.total)) setTotal(result.total);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
        setHasMore(false);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    items,
    setItems,
    page,
    total,
    loading,
    hasMore,
    error,
    sentinelRef,
    reload,
  };
};

export default useInfiniteScroll;
