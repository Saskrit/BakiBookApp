export const DEFAULT_PAGE_SIZE = 10;

export const parsePagination = (query, defaultLimit = DEFAULT_PAGE_SIZE) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, skip: (page - 1) * limit };
};

export const buildPagination = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});

export const paginateArray = (items, page, limit) => {
  const total = items.length;
  const skip = (page - 1) * limit;
  return {
    items: items.slice(skip, skip + limit),
    pagination: buildPagination(page, limit, total),
  };
};
