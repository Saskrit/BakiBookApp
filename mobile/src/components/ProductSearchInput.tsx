import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { createProduct, fetchProducts } from '../api/products';
import { colors } from '../theme/colors';
import { formatRs } from '../utils/format';
import type { ShopProduct } from '../types';

type Props = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  onSelectProduct: (product: ShopProduct) => void;
  /** When false, search uses the typed name locally (no server catalog add). Default true for backwards compat. */
  enableCatalogAdd?: boolean;
};

function SearchIcon({ color = colors.primary }: { color?: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx={11} cy={11} r={7} stroke={color} strokeWidth={2} />
      <Path d="M20 20 L16.5 16.5" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export default function ProductSearchInput({
  label,
  value,
  onChangeText,
  onSelectProduct,
  enableCatalogAdd = false,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [searched, setSearched] = useState(false);

  const loadProducts = useCallback(async (search: string) => {
    setLoading(true);
    setSearched(true);
    try {
      const data = await fetchProducts({
        search: search.trim() || undefined,
        limit: 20,
      });
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const timer = setTimeout(() => loadProducts(query), 300);
    return () => clearTimeout(timer);
  }, [query, modalOpen, loadProducts]);

  const openSearch = () => {
    setQuery(value);
    setSearched(false);
    setProducts([]);
    setAddError('');
    setModalOpen(true);
  };

  const handleUseTypedName = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    onChangeText(trimmed);
    setModalOpen(false);
  };

  const handleAddNew = async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    if (!enableCatalogAdd) {
      handleUseTypedName();
      return;
    }

    setAdding(true);
    setAddError('');
    try {
      const res = await createProduct({ name: trimmed });
      handleSelect(res.product);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not add product';
      if (msg.toLowerCase().includes('already exists')) {
        onChangeText(trimmed);
        setModalOpen(false);
        return;
      }
      setAddError(msg);
    } finally {
      setAdding(false);
    }
  };

  const handleSelect = (product: ShopProduct) => {
    onSelectProduct(product);
    onChangeText(product.name);
    setModalOpen(false);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Enter product name"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          autoCorrect={false}
        />
        <Pressable
          onPress={openSearch}
          style={styles.searchBtn}
          accessibilityLabel="Search products"
        >
          <SearchIcon color="#FFFFFF" />
        </Pressable>
      </View>
      <Text style={styles.hint}>Type a new product or tap search to pick an existing one</Text>

      <Modal
        visible={modalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Search Products</Text>
              <Pressable onPress={() => setModalOpen(false)} hitSlop={8}>
                <Text style={styles.modalClose}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.modalSearchRow}>
              <SearchIcon />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search by product name..."
                placeholderTextColor={colors.textMuted}
                style={styles.modalSearchInput}
                autoFocus
                autoCorrect={false}
              />
            </View>

            {loading ? (
              <View style={styles.centerRow}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.loadingText}>Searching…</Text>
              </View>
            ) : searched && products.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyTitle}>No products found</Text>
                <Text style={styles.emptyText}>
                  {query.trim()
                    ? `No match for "${query.trim()}". Tap below to use this name.`
                    : 'No saved products yet. Type a name in the search box.'}
                </Text>
                {query.trim() ? (
                  <>
                    {addError ? <Text style={styles.addError}>{addError}</Text> : null}
                    <Pressable
                      onPress={handleAddNew}
                      disabled={adding}
                      style={[styles.addNewBtn, adding && styles.addNewBtnDisabled]}
                    >
                      <Text style={styles.addNewBtnText}>
                        {adding
                          ? 'Adding…'
                          : enableCatalogAdd
                            ? `Add "${query.trim()}" to catalog`
                            : `Use "${query.trim()}"`}
                      </Text>
                    </Pressable>
                  </>
                ) : null}
              </View>
            ) : (
              <ScrollView keyboardShouldPersistTaps="handled" style={styles.results}>
                {products.map((product) => (
                  <Pressable
                    key={product.id}
                    onPress={() => handleSelect(product)}
                    style={styles.resultRow}
                  >
                    <View style={styles.resultBody}>
                      <Text style={styles.resultName}>{product.name}</Text>
                      <Text style={styles.resultMeta}>
                        Used {product.usageCount ?? 0} time
                        {(product.usageCount ?? 0) === 1 ? '' : 's'}
                      </Text>
                    </View>
                    <Text style={styles.resultPrice}>{formatRs(product.lastPrice ?? 0)}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  searchBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    marginTop: 6,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  modalClose: { fontSize: 20, color: colors.textMuted, padding: 4 },
  modalSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    padding: 0,
  },
  centerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 24,
  },
  loadingText: { fontSize: 14, color: colors.textMuted },
  emptyBox: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  addError: {
    fontSize: 13,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 10,
  },
  addNewBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  addNewBtnDisabled: { opacity: 0.7 },
  addNewBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  results: {
    paddingHorizontal: 20,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultBody: { flex: 1, paddingRight: 12 },
  resultName: { fontSize: 15, fontWeight: '600', color: colors.text },
  resultMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  resultPrice: { fontSize: 14, fontWeight: '700', color: colors.primary },
});
