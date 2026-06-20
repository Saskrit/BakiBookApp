import { useCallback, useEffect, useState } from 'react';
import { fetchProducts } from '../services/products';
import { formatRs } from '../utils/format';

export default function ProductSearchInput({
  value,
  onChange,
  onSelectProduct,
  placeholder = 'Search or enter a new product',
  required = false,
}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const loadProducts = useCallback(async (search) => {
    setLoading(true);
    try {
      const data = await fetchProducts({ search: search?.trim() || undefined, limit: 12 });
      setProducts(data.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const timer = setTimeout(() => loadProducts(value), 250);
    return () => clearTimeout(timer);
  }, [value, open, loadProducts]);

  const filtered = products.filter((p) =>
    !value.trim() ? true : p.name.toLowerCase().includes(value.trim().toLowerCase())
  );

  const exactMatch = filtered.some(
    (p) => p.name.toLowerCase() === value.trim().toLowerCase()
  );

  return (
    <div className="product-search" style={{ position: 'relative' }}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => {
          setOpen(true);
          loadProducts(value);
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
      />

      {open && (loading || filtered.length > 0 || value.trim()) ? (
        <div
          className="product-search__dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 20,
            background: '#fff',
            border: '1px solid #E8E0E0',
            borderRadius: 12,
            marginTop: 6,
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            overflow: 'hidden',
          }}
        >
          {loading ? <div style={{ padding: 12, color: '#6B7280' }}>Searching products…</div> : null}

          {!loading && filtered.length === 0 ? (
            <div style={{ padding: 12, color: '#6B7280', fontSize: 14 }}>
              {value.trim()
                ? `"${value.trim()}" will be saved as a new product`
                : 'No products yet — type a name to add one'}
            </div>
          ) : null}

          {!loading
            ? filtered.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onSelectProduct?.(product);
                    setOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    border: 'none',
                    borderTop: '1px solid #E8E0E0',
                    background: '#fff',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span>
                    <strong>{product.name}</strong>
                    <small style={{ display: 'block', color: '#6B7280' }}>
                      Used {product.usageCount} time{product.usageCount === 1 ? '' : 's'}
                    </small>
                  </span>
                  <span style={{ color: '#6A7E3F', fontWeight: 700 }}>{formatRs(product.lastPrice)}</span>
                </button>
              ))
            : null}

          {!loading && value.trim() && !exactMatch ? (
            <div style={{ padding: 12, background: '#F3F7EC', color: '#6A7E3F', fontWeight: 600 }}>
              + Add "{value.trim()}" as new product
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
