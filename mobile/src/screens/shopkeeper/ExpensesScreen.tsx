import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';
import { appAlert } from '../../contexts/DialogContext';
import {
  createExpense,
  deleteExpense,
  fetchExpenses,
  updateExpense,
} from '../../api/expenses';
import { Button, ErrorText, LoadingState } from '../../components/ui';
import { colors } from '../../theme/colors';
import { typography as t } from '../../theme/typography';
import { formatDate, formatRs } from '../../utils/format';
import { EXPENSE_CATEGORIES, type ShopExpense } from '../../types';
import type { RootStackParamList } from '../../navigation/types';

const CATEGORY_COLORS: Record<string, string> = {
  Stock: '#EA580C',
  Rent: '#2563EB',
  Utilities: '#0891B2',
  Transport: '#7C3AED',
  Salary: '#059669',
  Marketing: '#DB2777',
  Maintenance: '#CA8A04',
  Other: '#64748B',
};

function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key: string) {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('en-NP', {
    month: 'long',
    year: 'numeric',
  });
}

function toDateInput(value?: string) {
  const date = value ? new Date(value) : new Date();
  return date.toISOString().slice(0, 10);
}

export default function ExpensesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const [expenses, setExpenses] = useState<ShopExpense[]>([]);
  const [monthTotal, setMonthTotal] = useState(0);
  const [categories, setCategories] = useState<string[]>([...EXPENSE_CATEGORIES]);
  const [month, setMonth] = useState(currentMonthKey());
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ShopExpense | null>(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [note, setNote] = useState('');
  const [expenseDate, setExpenseDate] = useState(toDateInput());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const load = useCallback(async () => {
    const res = await fetchExpenses({
      month,
      ...(categoryFilter !== 'all' ? { category: categoryFilter } : {}),
    });
    setExpenses(Array.isArray(res.expenses) ? res.expenses : []);
    setMonthTotal(Number(res.total) || 0);
    if (res.categories?.length) setCategories(res.categories);
  }, [month, categoryFilter]);

  useEffect(() => {
    setLoading(true);
    load()
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load expenses'))
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

  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    for (const expense of expenses) {
      map.set(expense.category, (map.get(expense.category) || 0) + expense.amount);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  const shiftMonth = (delta: number) => {
    const [year, monthNum] = month.split('-').map(Number);
    const date = new Date(year, monthNum - 1 + delta, 1);
    setMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const openAdd = () => {
    setEditing(null);
    setTitle('');
    setAmount('');
    setCategory(EXPENSE_CATEGORIES[0]);
    setNote('');
    setExpenseDate(toDateInput());
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (expense: ShopExpense) => {
    setEditing(expense);
    setTitle(expense.title);
    setAmount(String(expense.amount));
    setCategory(expense.category || EXPENSE_CATEGORIES[0]);
    setNote(expense.note || '');
    setExpenseDate(toDateInput(expense.expenseDate));
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setFormError('Title is required');
      return;
    }
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      setFormError('Enter a valid amount');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        title: title.trim(),
        amount: parsedAmount,
        category,
        note: note.trim(),
        expenseDate: new Date(expenseDate).toISOString(),
      };
      if (editing) {
        await updateExpense(editing.id, payload);
      } else {
        await createExpense(payload);
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (expense: ShopExpense) => {
    appAlert('Delete expense', `Remove "${expense.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteExpense(expense.id);
            await load();
          } catch (err) {
            appAlert('Error', err instanceof Error ? err.message : 'Failed to delete');
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingState />;

  const listHeader = (
    <View style={styles.listHeader}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        <Pressable
          style={[styles.filterChip, categoryFilter === 'all' && styles.filterChipActive]}
          onPress={() => setCategoryFilter('all')}
        >
          <Text style={[styles.filterText, categoryFilter === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </Pressable>
        {categories.map((cat) => (
          <Pressable
            key={cat}
            style={[styles.filterChip, categoryFilter === cat && styles.filterChipActive]}
            onPress={() => setCategoryFilter(cat)}
          >
            <Text style={[styles.filterText, categoryFilter === cat && styles.filterTextActive]}>
              {cat}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {categoryBreakdown.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.breakdownRow}
        >
          {categoryBreakdown.map(([cat, total]) => (
            <View key={cat} style={styles.breakdownPill}>
              <View
                style={[styles.breakdownDot, { backgroundColor: CATEGORY_COLORS[cat] || '#64748B' }]}
              />
              <Text style={styles.breakdownCat}>{cat}</Text>
              <Text style={styles.breakdownAmt}>{formatRs(total)}</Text>
            </View>
          ))}
        </ScrollView>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );

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
        <Text style={styles.headerTitle}>Expenses</Text>
        <Text style={styles.headerSubtitle}>Track shop spending</Text>

        <View style={styles.monthRow}>
          <Pressable onPress={() => shiftMonth(-1)} hitSlop={8} style={styles.monthBtn}>
            <Text style={styles.monthArrow}>‹</Text>
          </Pressable>
          <Text style={styles.monthLabel}>{monthLabel(month)}</Text>
          <Pressable onPress={() => shiftMonth(1)} hitSlop={8} style={styles.monthBtn}>
            <Text style={styles.monthArrow}>›</Text>
          </Pressable>
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total this month</Text>
          <Text style={styles.totalValue}>{formatRs(monthTotal)}</Text>
        </View>
      </View>

      <FlatList
        style={styles.list}
        data={expenses}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={listHeader}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={[
          styles.listContent,
          expenses.length === 0 && styles.listContentEmpty,
          { paddingBottom: insets.bottom + 16 },
        ]}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No expenses yet</Text>
            <Text style={styles.empty}>
              No expenses for {monthLabel(month).toLowerCase()}. Tap + Add to record one.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => openEdit(item)}
            onLongPress={() => handleDelete(item)}
          >
            <View
              style={[
                styles.rowIcon,
                { backgroundColor: `${CATEGORY_COLORS[item.category] || '#64748B'}18` },
              ]}
            >
              <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                <Rect
                  x={5}
                  y={4}
                  width={14}
                  height={16}
                  rx={2}
                  stroke={CATEGORY_COLORS[item.category] || '#64748B'}
                  strokeWidth={2}
                />
                <Path
                  d="M9 10 H15 M9 14 H13"
                  stroke={CATEGORY_COLORS[item.category] || '#64748B'}
                  strokeWidth={2}
                />
              </Svg>
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowName} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.rowMeta} numberOfLines={1}>
                {item.category}
                {item.expenseDate ? ` · ${formatDate(item.expenseDate)}` : ''}
              </Text>
              {item.note ? (
                <Text style={styles.rowNote} numberOfLines={2}>
                  {item.note}
                </Text>
              ) : null}
            </View>
            <Text style={styles.rowAmount}>{formatRs(item.amount)}</Text>
          </Pressable>
        )}
      />

      <Modal visible={modalOpen} animationType="slide" transparent onRequestClose={() => setModalOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <Pressable style={styles.modalDismiss} onPress={() => setModalOpen(false)} />
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.modalScroll, { paddingBottom: insets.bottom + 16 }]}
          >
            <View style={styles.modalCard}>
              <View style={styles.modalHandle} />
              <Text style={styles.modalTitle}>{editing ? 'Edit expense' : 'Add expense'}</Text>
              {formError ? <ErrorText message={formError} /> : null}

              <Text style={styles.fieldLabel}>Title *</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Shop rent"
                placeholderTextColor={colors.textMuted}
                style={styles.fieldInput}
                autoFocus
              />

              <Text style={styles.fieldLabel}>Amount (Rs) *</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor={colors.textMuted}
                style={styles.fieldInput}
              />

              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.categoryGrid}>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat}
                    style={[styles.categoryChip, category === cat && styles.categoryChipActive]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        category === cat && styles.categoryChipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.fieldLabel}>Date</Text>
              <TextInput
                value={expenseDate}
                onChangeText={setExpenseDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.textMuted}
                style={styles.fieldInput}
              />

              <Text style={styles.fieldLabel}>Note (optional)</Text>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="Additional details"
                placeholderTextColor={colors.textMuted}
                style={[styles.fieldInput, styles.noteInput]}
                multiline
              />

              <View style={styles.modalActions}>
                <Button title="Cancel" variant="outline" onPress={() => setModalOpen(false)} />
                <Button title={editing ? 'Save' : 'Add expense'} onPress={handleSave} loading={saving} />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 14,
  },
  monthBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthArrow: { color: '#FFF', fontSize: 22, fontWeight: '400', lineHeight: 24 },
  monthLabel: { color: '#FFF', fontSize: t.bodyLg, fontWeight: '700', minWidth: 140, textAlign: 'center' },
  totalCard: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  totalLabel: { color: 'rgba(255,255,255,0.85)', fontSize: t.caption },
  totalValue: { color: '#FFF', fontSize: t.xxl, fontWeight: '800', marginTop: 4 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 4 },
  listContentEmpty: { flexGrow: 1 },
  listHeader: { paddingBottom: 8 },
  filterRow: { paddingVertical: 12, gap: 8, paddingRight: 16 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  filterText: { fontSize: t.caption, fontWeight: '600', color: colors.textMuted },
  filterTextActive: { color: '#FFF' },
  breakdownRow: { gap: 8, paddingBottom: 8, paddingRight: 16 },
  breakdownPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ECEEF2',
  },
  breakdownDot: { width: 8, height: 8, borderRadius: 4 },
  breakdownCat: { fontSize: t.sm, color: colors.textMuted, fontWeight: '600' },
  breakdownAmt: { fontSize: t.sm, color: colors.text, fontWeight: '700' },
  error: { color: colors.danger, marginBottom: 8, fontSize: t.body },
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1, minWidth: 0 },
  rowName: { fontSize: t.md, fontWeight: '700', color: colors.text },
  rowMeta: { fontSize: t.caption, color: colors.textMuted, marginTop: 4 },
  rowNote: { fontSize: t.sm, color: colors.textMuted, marginTop: 4, lineHeight: 16 },
  rowAmount: {
    fontSize: t.bodyLg,
    fontWeight: '800',
    color: '#2563EB',
    marginLeft: 8,
    flexShrink: 0,
  },
  emptyBox: { alignItems: 'center', paddingTop: 32, paddingHorizontal: 24 },
  emptyTitle: { fontSize: t.md, fontWeight: '700', color: colors.text, marginBottom: 8 },
  empty: { textAlign: 'center', color: colors.textMuted, lineHeight: 20, fontSize: t.body },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalDismiss: { flex: 1 },
  modalScroll: { flexGrow: 0 },
  modalCard: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingTop: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 14,
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
  noteInput: { minHeight: 72, textAlignVertical: 'top' },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: { backgroundColor: colors.primaryDark, borderColor: colors.primaryDark },
  categoryChipText: { fontSize: t.caption, fontWeight: '600', color: colors.textMuted },
  categoryChipTextActive: { color: '#FFF' },
  modalActions: { gap: 8, marginTop: 16 },
});
