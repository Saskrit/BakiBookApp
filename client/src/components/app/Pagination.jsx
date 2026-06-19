import { ChevronLeft, ChevronRight } from 'lucide-react';

import { PAGE_SIZE } from '../../constants/pagination';

function Pagination({ page = 1, totalPages = 1, total = 0, pageSize = PAGE_SIZE, onPageChange, className = '' }) {
  if (totalPages <= 1 && total <= 0) return null;

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className={`app-pagination ${className}`.trim()}>
      <span className="app-pagination__info">
        {total > 0 ? `Showing ${from}–${to} of ${total}` : 'No records'}
      </span>
      <div className="app-pagination__controls">
        <button
          type="button"
          className="app-btn app-btn--outline app-btn--sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft size={16} /> Previous
        </button>
        <span className="app-pagination__page">
          Page {page} of {Math.max(1, totalPages)}
        </span>
        <button
          type="button"
          className="app-btn app-btn--outline app-btn--sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
