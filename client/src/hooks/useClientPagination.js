import { useMemo, useState } from 'react';
import { PAGE_SIZE } from '../constants/pagination';

export function useClientPagination(items = [], pageSize = PAGE_SIZE) {
  const [page, setPage] = useState(1);

  const pagination = useMemo(() => {
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * pageSize;
    return {
      page: safePage,
      totalPages,
      total,
      items: items.slice(start, start + pageSize),
    };
  }, [items, page, pageSize]);

  const setPageSafe = (next) => {
    setPage(Math.max(1, next));
  };

  const resetPage = () => setPage(1);

  return { ...pagination, setPage: setPageSafe, resetPage };
}
