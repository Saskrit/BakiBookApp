import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { appAlert } from '../../contexts/DialogContext';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
} from '../../api/products';
import { Button, ErrorText, LoadingState } from '../../components/ui';
import { colors } from '../../theme/colors';
import { typography as t } from '../../theme/typography';
import { formatRelativeTime, formatRs } from '../../utils/format';
import type { ShopProduct } from '../../types';
import type { RootStackParamList } from '../../navigation/types';

export default function ProductsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ShopProduct | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    const res = await fetchProducts({
      all: true,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
    });
    setProducts(Array.isArray(res.products) ? res.products : []);
  }, [debouncedSearch]);

  useEffect(() => {
    setLoading(true);
    load()
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load products'))
      .finally(() => setLoading(false));
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh');
    } finally {
      setRefreshing(false);
    }
  };

  const stats = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    const totalUsage = list.reduce((sum, p) => sum + (p.usageCount || 0), 0);
    const top = [...list].sort((a, b) => b.usageCount - a.usageCount)[0];
    return { count: list.length, totalUsage, topName: top?.name };
  }, [products]);

  const openAdd = () => {
    setEditing(null);
    setName('');
    setPrice('');
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (product: ShopProduct) => {
    setEditing(product);
    setName(product.name);
    setPrice(String(product.lastPrice ?? ''));
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setFormError('Product name is required');
      return;
    }

    const payload: { name: string; lastPrice?: number } = { name: trimmedName };
    const trimmedPrice = price.trim();
    if (trimmedPrice) {
      const parsedPrice = Number(trimmedPrice);
      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        setFormError('Enter a valid price or leave price empty');
        return;
      }
      payload.lastPrice = parsedPrice;
    }

    setSaving(true);
    setFormError('');
    try {
      if (editing) {
        await updateProduct(editing.id, payload);
      } else {
        try {
          await createProduct(payload);
        } catch (err) {
          const msg = err instanceof Error ? err.message : '';
          if (msg.toLowerCase().includes('already exists')) {
            setModalOpen(false);
            await load();
            return;
          }
          throw err;
        }
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (product: ShopProduct) => {
    appAlert('Delete product', `Remove "${product.name}" from catalog?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProduct(product.id);
            await load();
          } catch (err) {
            appAlert('Error', err instanceof Error ? err.message : 'Failed to delete');
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingState />;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Text style={styles.back}>‹ Back</Text>
          </Pressable>
          <Pressable style={styles.addBtn} onPress={openAdd}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </Pressable>
        </View>
        <Text style={styles.headerTitle}>Products</Text>
        <Text style={styles.headerSubtitle}>Your shop product catalog</Text>

        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>{stats.count}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>{stats.totalUsage}</Text>
            <Text style={styles.statLabel}>Times used</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Circle cx={11} cy={11} r={7} stroke={colors.textMuted} strokeWidth={2} />
          <Path d="M20 20 L16.5 16.5" stroke={colors.textMuted} strokeWidth={2} strokeLinecap="round" />
        </Svg>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search products..."
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16 }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            No products yet. Add credit or tap + Add to build your catalog.
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => openEdit(item)}
            onLongPress={() => handleDelete(item)}
          >
            <View style={styles.rowIcon}>
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Rect x={4} y={6} width={16} height={14} rx={2} stroke="#EA580C" strokeWidth={2} />
              </Svg>
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowName}>{item.name}</Text>
              <Text style={styles.rowMeta}>
                Used {item.usageCount ?? 0} time{(item.usageCount ?? 0) === 1 ? '' : 's'}
                {item.lastUsedAt ? ` · ${formatRelativeTime(item.lastUsedAt)}` : ''}
              </Text>
            </View>
            <View style={styles.rowPriceCol}>
              <Text style={styles.rowPrice}>
                {item.lastPrice ? formatRs(item.lastPrice) : '—'}
              </Text>
              <Text style={styles.rowHint}>
                {item.lastPrice ? 'last price' : 'name only'}
              </Text>
            </View>
          </Pressable>
        )}
      />

      <Modal visible={modalOpen} animationType="slide" transparent onRequestClose={() => setModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { paddingBottom: insets.bottom + 16 }]}>
            <Text style={styles.modalTitle}>{editing ? 'Edit product' : 'Add product'}</Text>
            {formError ? <ErrorText message={formError} /> : null}
            <Text style={styles.fieldLabel}>Product name *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Rice 1kg"
              style={styles.fieldInput}
              autoFocus
            />
            <Text style={styles.fieldLabel}>Default price (optional)</Text>
            <TextInput
              value={price}
              onChangeText={setPrice}
              placeholder="Leave blank if price varies"
              keyboardType="numeric"
              style={styles.fieldInput}
            />
            <View style={styles.modalActions}>
              <Button title="Cancel" variant="outline" onPress={() => setModalOpen(false)} />
              <Button title={editing ? 'Save' : 'Add product'} onPress={handleSave} loading={saving} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F5F7' },
  header: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  back: { color: 'rgba(255,255,255,0.95)', fontSize: t.bodyLg, fontWeight: '600' },
  addBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: { color: '#FFF', fontWeight: '700', fontSize: t.body },
  headerTitle: { color: '#FFF', fontSize: t.h1, fontWeight: '800' },
  headerSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: t.body, marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  statPill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  statValue: { color: '#FFF', fontSize: t.lg, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.85)', fontSize: t.caption, marginTop: 2 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    margin: 16,
    marginBottom: 0,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: t.bodyLg, color: colors.text, padding: 0 },
  error: { color: colors.danger, marginHorizontal: 16, marginTop: 8, fontSize: t.body },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    gap: 12,
  },
  rowIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1 },
  rowName: { fontSize: t.md, fontWeight: '700', color: colors.text },
  rowMeta: { fontSize: t.caption, color: colors.textMuted, marginTop: 4 },
  rowPriceCol: { alignItems: 'flex-end' },
  rowPrice: { fontSize: t.bodyLg, fontWeight: '800', color: colors.primary },
  rowHint: { fontSize: t.sm, color: colors.textMuted, marginTop: 2 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40, lineHeight: 20, fontSize: t.body },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: { fontSize: t.lg, fontWeight: '800', color: colors.text, marginBottom: 12 },
  fieldLabel: { fontSize: t.body, fontWeight: '600', color: colors.text, marginBottom: 6, marginTop: 8 },
  fieldInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: t.md,
    color: colors.text,
  },
  modalActions: { gap: 8, marginTop: 16 },
});
