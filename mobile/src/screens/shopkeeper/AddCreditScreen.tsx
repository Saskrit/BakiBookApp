import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { createCustomer, fetchCustomers } from '../../api/customers';
import { createTransaction } from '../../api/transactions';
import ProductSearchInput from '../../components/ProductSearchInput';
import { Button, ErrorText, Input } from '../../components/ui';
import { colors } from '../../theme/colors';
import { typography as t } from '../../theme/typography';
import { avatarColor, formatRs, getInitials } from '../../utils/format';
import type { Customer, LineItem } from '../../types';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddCredit'>;
type CustomerMode = 'existing' | 'new';

type CreditLine = LineItem & { id: string };

const newLineId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function lineTotal(item: Pick<LineItem, 'qty' | 'price'>) {
  return (Number(item.qty) || 0) * (Number(item.price) || 0);
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
      {children}
    </View>
  );
}

function ProductFormFields({
  draftName,
  setDraftName,
  draftQty,
  setDraftQty,
  draftPrice,
  setDraftPrice,
  draftTotal,
}: {
  draftName: string;
  setDraftName: (v: string) => void;
  draftQty: string;
  setDraftQty: (v: string) => void;
  draftPrice: string;
  setDraftPrice: (v: string) => void;
  draftTotal: number;
}) {
  return (
    <>
      <ProductSearchInput
        label="Product name *"
        value={draftName}
        onChangeText={setDraftName}
        onSelectProduct={(product) => setDraftName(product.name)}
      />
      <View style={styles.qtyPriceRow}>
        <View style={styles.qtyCol}>
          <Text style={styles.fieldLabel}>Qty</Text>
          <TextInput
            value={draftQty}
            onChangeText={setDraftQty}
            keyboardType="numeric"
            style={styles.fieldInput}
            placeholder="1"
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={styles.priceCol}>
          <Text style={styles.fieldLabel}>Price (Rs) *</Text>
          <TextInput
            value={draftPrice}
            onChangeText={setDraftPrice}
            keyboardType="numeric"
            style={styles.fieldInput}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
          />
        </View>
      </View>
      {draftName.trim() && draftPrice.trim() ? (
        <Text style={styles.draftLineTotal}>Line total: {formatRs(draftTotal)}</Text>
      ) : null}
    </>
  );
}

function LineItemRow({
  item,
  onRemove,
  onEdit,
}: {
  item: CreditLine;
  onRemove: () => void;
  onEdit: () => void;
}) {
  const total = lineTotal(item);
  return (
    <Pressable onPress={onEdit} style={styles.lineRow}>
      <View style={styles.lineIcon}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Rect x={4} y={6} width={16} height={14} rx={2} stroke="#EA580C" strokeWidth={2} />
        </Svg>
      </View>
      <View style={styles.lineBody}>
        <Text style={styles.lineName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.lineMeta}>
          Qty {item.qty} × {formatRs(item.price)}
        </Text>
      </View>
      <View style={styles.lineRight}>
        <Text style={styles.lineAmount}>{formatRs(total)}</Text>
        <Pressable
          onPress={(e) => {
            e.stopPropagation?.();
            onRemove();
          }}
          hitSlop={8}
          style={styles.removeBtn}
        >
          <Text style={styles.removeBtnText}>Remove</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

export default function AddCreditScreen({ route, navigation }: Props) {
  const presetCustomerId = route.params?.customerId;
  const presetCustomerName = route.params?.customerName;
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState<CustomerMode>('existing');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(!presetCustomerId);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    presetCustomerId
      ? { id: presetCustomerId, name: presetCustomerName || 'Customer', balance: 0 }
      : null
  );

  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const [lines, setLines] = useState<CreditLine[]>([]);
  const [draftName, setDraftName] = useState('');
  const [draftQty, setDraftQty] = useState('1');
  const [draftPrice, setDraftPrice] = useState('');
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lockedCustomer = Boolean(presetCustomerId);

  const loadCustomers = useCallback(async () => {
    setCustomersLoading(true);
    try {
      const data = await fetchCustomers({ page: 1, limit: 100 });
      setCustomers(Array.isArray(data.customers) ? data.customers : []);
      if (presetCustomerId) {
        const match = data.customers?.find((c) => c.id === presetCustomerId);
        if (match) setSelectedCustomer(match);
      }
    } catch {
      setError('Failed to load customers');
    } finally {
      setCustomersLoading(false);
    }
  }, [presetCustomerId]);

  useEffect(() => {
    if (!lockedCustomer) loadCustomers();
  }, [loadCustomers, lockedCustomer]);

  const filteredCustomers = useMemo(() => {
    const list = Array.isArray(customers) ? customers : [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const draftTotal = lineTotal({ qty: Number(draftQty) || 0, price: Number(draftPrice) || 0 });
  const linesTotal = useMemo(
    () => lines.reduce((sum, line) => sum + lineTotal(line), 0),
    [lines]
  );
  const grandTotal = useMemo(() => {
    if (lines.length === 0) {
      return draftTotal;
    }
    return linesTotal;
  }, [lines.length, draftTotal, linesTotal]);

  const openProductModal = (mode: 'add' | 'edit', line?: CreditLine) => {
    setError('');
    if (mode === 'edit' && line) {
      setDraftName(line.name);
      setDraftQty(String(line.qty));
      setDraftPrice(String(line.price));
      setEditingLineId(line.id);
    } else {
      clearDraft();
    }
    setProductModalOpen(true);
  };

  const closeProductModal = () => {
    setProductModalOpen(false);
    clearDraft();
  };

  const resolveCustomerId = async (): Promise<string> => {
    if (mode === 'existing') {
      if (!selectedCustomer?.id) {
        throw new Error('Please select a customer');
      }
      return selectedCustomer.id;
    }

    const trimmedName = newName.trim();
    if (!trimmedName) {
      throw new Error('Customer name is required for a new customer');
    }

    const list = Array.isArray(customers) ? customers : [];
    const existingByName = list.find(
      (c) => c.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );
    if (existingByName) return existingByName.id;

    if (newPhone.trim()) {
      const existingByPhone = list.find(
        (c) => c.phone?.trim() && c.phone.trim() === newPhone.trim()
      );
      if (existingByPhone) return existingByPhone.id;
    }

    const created = await createCustomer({
      name: trimmedName,
      phone: newPhone.trim() || undefined,
    });
    return created.customer.id;
  };

  const parseDraft = (silent = false): LineItem | null => {
    if (!draftName.trim()) {
      if (!silent) setError('Enter a product name');
      return null;
    }
    if (!draftPrice.trim() || Number(draftPrice) <= 0) {
      if (!silent) setError('Enter a valid price for this product');
      return null;
    }
    const qty = Number(draftQty) || 1;
    if (qty <= 0) {
      if (!silent) setError('Quantity must be at least 1');
      return null;
    }
    return {
      name: draftName.trim(),
      qty,
      price: Number(draftPrice),
    };
  };

  const validateDraft = () => parseDraft(false);

  const clearDraft = () => {
    setDraftName('');
    setDraftQty('1');
    setDraftPrice('');
    setEditingLineId(null);
  };

  const handleAddFirstToList = () => {
    setError('');
    const item = validateDraft();
    if (!item) return;
    setLines([{ id: newLineId(), ...item }]);
    clearDraft();
  };

  const handleAddLine = () => {
    setError('');
    const item = validateDraft();
    if (!item) return;

    if (editingLineId) {
      setLines((prev) =>
        prev.map((line) => (line.id === editingLineId ? { ...line, ...item } : line))
      );
    } else {
      setLines((prev) => [...prev, { id: newLineId(), ...item }]);
    }
    closeProductModal();
  };

  const handleEditLine = (line: CreditLine) => {
    openProductModal('edit', line);
  };

  const handleRemoveLine = (id: string) => {
    setLines((prev) => prev.filter((line) => line.id !== id));
    if (editingLineId === id) clearDraft();
  };

  const buildItemsForSave = (): LineItem[] => {
    if (lines.length === 0) {
      const draft = parseDraft(true);
      return draft ? [draft] : [];
    }
    return lines.map(({ name, qty, price }) => ({ name, qty, price }));
  };

  const handleSave = async () => {
    setError('');
    const items = buildItemsForSave();
    if (!items.length) {
      setError('Add at least one product to this credit');
      return;
    }

    const total = items.reduce((sum, item) => sum + lineTotal(item), 0);
    if (total <= 0) {
      setError('Total must be greater than zero');
      return;
    }

    setLoading(true);
    try {
      const customerId = await resolveCustomerId();
      await createTransaction({
        customerId,
        items,
        note: note.trim() || undefined,
      });
      Alert.alert('Saved', `Credit of ${formatRs(total)} recorded successfully`);
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save credit');
    } finally {
      setLoading(false);
    }
  };

  const customerLabel =
    lockedCustomer || mode === 'existing'
      ? selectedCustomer?.name || presetCustomerName || 'Select customer'
      : newName.trim() || 'New customer';

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[colors.primaryDark, colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={styles.backBtn}>
          <Text style={styles.backText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Add Credit</Text>
        <Text style={styles.headerSubtitle}>Record credit with one or more products</Text>
        <View style={styles.headerCustomer}>
          <View style={[styles.headerAvatar, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
            <Text style={styles.headerAvatarText}>{getInitials(customerLabel)}</Text>
          </View>
          <View style={styles.headerCustomerBody}>
            <Text style={styles.headerCustomerLabel}>Customer</Text>
            <Text style={styles.headerCustomerName} numberOfLines={1}>
              {customerLabel}
            </Text>
          </View>
          {lines.length > 0 ? (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>
                {lines.length} item{lines.length === 1 ? '' : 's'}
              </Text>
            </View>
          ) : null}
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
          showsVerticalScrollIndicator={false}
        >
          {error ? <ErrorText message={error} /> : null}

          {!lockedCustomer ? (
            <SectionCard title="Customer" subtitle="Who is this credit for?">
              <View style={styles.modeRow}>
                <Pressable
                  onPress={() => setMode('existing')}
                  style={[styles.modeChip, mode === 'existing' && styles.modeChipActive]}
                >
                  <Text style={[styles.modeChipText, mode === 'existing' && styles.modeChipTextActive]}>
                    Existing
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setMode('new')}
                  style={[styles.modeChip, mode === 'new' && styles.modeChipActive]}
                >
                  <Text style={[styles.modeChipText, mode === 'new' && styles.modeChipTextActive]}>
                    New customer
                  </Text>
                </Pressable>
              </View>

              {mode === 'existing' ? (
                <>
                  <View style={styles.searchBox}>
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                      <Circle cx={11} cy={11} r={7} stroke={colors.textMuted} strokeWidth={2} />
                      <Path
                        d="M20 20 L16.5 16.5"
                        stroke={colors.textMuted}
                        strokeWidth={2}
                        strokeLinecap="round"
                      />
                    </Svg>
                    <TextInput
                      value={search}
                      onChangeText={setSearch}
                      placeholder="Search name or phone"
                      placeholderTextColor={colors.textMuted}
                      style={styles.searchInput}
                    />
                  </View>
                  {customersLoading ? (
                    <Text style={styles.hint}>Loading customers…</Text>
                  ) : filteredCustomers.length === 0 ? (
                    <Text style={styles.hint}>
                      No customers found. Switch to New customer to create one on save.
                    </Text>
                  ) : (
                    <View style={styles.customerList}>
                      {filteredCustomers.slice(0, 8).map((item) => {
                        const selected = selectedCustomer?.id === item.id;
                        return (
                          <Pressable
                            key={item.id}
                            onPress={() => setSelectedCustomer(item)}
                            style={[styles.customerRow, selected && styles.customerRowSelected]}
                          >
                            <View
                              style={[styles.avatar, { backgroundColor: avatarColor(item.name) }]}
                            >
                              <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
                            </View>
                            <View style={styles.customerInfo}>
                              <Text style={styles.customerName}>{item.name}</Text>
                              {item.phone ? (
                                <Text style={styles.customerMeta}>{item.phone}</Text>
                              ) : null}
                            </View>
                            {selected ? <Text style={styles.checkMark}>✓</Text> : null}
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                </>
              ) : (
                <>
                  <Text style={styles.hint}>
                    Customer will be created automatically when you save this credit.
                  </Text>
                  <Input label="Customer name *" value={newName} onChangeText={setNewName} />
                  <Input
                    label="Phone (optional)"
                    value={newPhone}
                    onChangeText={setNewPhone}
                    keyboardType="phone-pad"
                  />
                </>
              )}
            </SectionCard>
          ) : null}

          {lines.length > 0 ? (
            <SectionCard
              title="Products"
              subtitle={`${lines.length} product${lines.length === 1 ? '' : 's'} in this credit`}
            >
              {lines.map((line) => (
                <LineItemRow
                  key={line.id}
                  item={line}
                  onRemove={() => handleRemoveLine(line.id)}
                  onEdit={() => handleEditLine(line)}
                />
              ))}
              <View style={styles.subtotalRow}>
                <Text style={styles.subtotalLabel}>Subtotal</Text>
                <Text style={styles.subtotalValue}>{formatRs(linesTotal)}</Text>
              </View>
              <Pressable
                onPress={() => openProductModal('add')}
                style={styles.plusOnlyBtn}
                accessibilityLabel="Add another product"
              >
                <Text style={styles.plusOnlyText}>+</Text>
              </Pressable>
            </SectionCard>
          ) : (
            <SectionCard title="Product" subtitle="One product? Fill and save. Multiple? Tap + after filling.">
              <ProductFormFields
                draftName={draftName}
                setDraftName={setDraftName}
                draftQty={draftQty}
                setDraftQty={setDraftQty}
                draftPrice={draftPrice}
                setDraftPrice={setDraftPrice}
                draftTotal={draftTotal}
              />
              {draftName.trim() && draftPrice.trim() && Number(draftPrice) > 0 ? (
                <Pressable
                  onPress={handleAddFirstToList}
                  style={styles.plusOnlyBtn}
                  accessibilityLabel="Add product and add more"
                >
                  <Text style={styles.plusOnlyText}>+</Text>
                </Pressable>
              ) : null}
            </SectionCard>
          )}

          <SectionCard title="Notes" subtitle="Optional note for this credit">
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="e.g. Delivered tomorrow"
              placeholderTextColor={colors.textMuted}
              style={[styles.fieldInput, styles.noteInput]}
              multiline
            />
          </SectionCard>
        </ScrollView>

        <Modal
          visible={productModalOpen}
          animationType="slide"
          transparent
          onRequestClose={closeProductModal}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalBackdrop}
          >
            <View style={[styles.modalSheet, { paddingBottom: insets.bottom + 16 }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingLineId ? 'Edit product' : 'Add product'}
                </Text>
                <Pressable onPress={closeProductModal} hitSlop={8}>
                  <Text style={styles.modalClose}>✕</Text>
                </Pressable>
              </View>
              <ScrollView keyboardShouldPersistTaps="handled">
                <ProductFormFields
                  draftName={draftName}
                  setDraftName={setDraftName}
                  draftQty={draftQty}
                  setDraftQty={setDraftQty}
                  draftPrice={draftPrice}
                  setDraftPrice={setDraftPrice}
                  draftTotal={draftTotal}
                />
                <Pressable onPress={handleAddLine} style={styles.addLineBtn}>
                  <Text style={styles.addLineBtnText}>
                    {editingLineId ? 'Update product' : 'Add product'}
                  </Text>
                </Pressable>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.footerTotal}>
            <Text style={styles.footerTotalLabel}>Credit total</Text>
            <Text style={styles.footerTotalValue}>{formatRs(grandTotal)}</Text>
            <Text style={styles.footerHint}>
              {lines.length === 0
                ? 'Fill product above, then save'
                : `${lines.length} product${lines.length === 1 ? '' : 's'}`}
            </Text>
          </View>
          <Button
            title={loading ? 'Saving…' : 'Save credit'}
            onPress={handleSave}
            loading={loading}
            disabled={grandTotal <= 0}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F5F7' },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  backBtn: { alignSelf: 'flex-start', marginBottom: 4 },
  backText: { color: 'rgba(255,255,255,0.95)', fontSize: t.bodyLg, fontWeight: '600' },
  headerTitle: { color: '#FFF', fontSize: t.h1, fontWeight: '800' },
  headerSubtitle: { color: 'rgba(255,255,255,0.88)', fontSize: t.body, marginTop: 4 },
  headerCustomer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    padding: 12,
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: { color: '#FFF', fontWeight: '800', fontSize: t.caption },
  headerCustomerBody: { flex: 1 },
  headerCustomerLabel: { color: 'rgba(255,255,255,0.8)', fontSize: t.sm },
  headerCustomerName: { color: '#FFF', fontSize: t.md, fontWeight: '700', marginTop: 2 },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  headerBadgeText: { color: '#FFF', fontSize: t.sm, fontWeight: '700' },
  content: { padding: 16, paddingTop: 14 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ECEEF2',
  },
  cardTitle: { fontSize: t.md, fontWeight: '800', color: colors.text },
  cardSubtitle: { fontSize: t.caption, color: colors.textMuted, marginTop: 2, marginBottom: 12 },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 4,
  },
  modeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeChipActive: { backgroundColor: '#FFF' },
  modeChipText: { fontSize: t.caption, fontWeight: '700', color: colors.textMuted },
  modeChipTextActive: { color: colors.primaryDark },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  searchInput: { flex: 1, fontSize: t.md, color: colors.text, padding: 0 },
  customerList: { maxHeight: 240 },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
  },
  customerRowSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F3F7EC',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: { color: '#FFF', fontWeight: '700', fontSize: t.caption },
  customerInfo: { flex: 1 },
  customerName: { fontSize: t.bodyLg, fontWeight: '600', color: colors.text },
  customerMeta: { fontSize: t.caption, color: colors.textMuted, marginTop: 2 },
  checkMark: { color: colors.primary, fontWeight: '800', fontSize: t.lg },
  hint: { fontSize: t.body, color: colors.textMuted, marginBottom: 10, lineHeight: 18 },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F3',
  },
  lineIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lineBody: { flex: 1 },
  lineName: { fontSize: t.bodyLg, fontWeight: '700', color: colors.text },
  lineMeta: { fontSize: t.caption, color: colors.textMuted, marginTop: 2 },
  lineRight: { alignItems: 'flex-end' },
  lineAmount: { fontSize: t.bodyLg, fontWeight: '800', color: colors.danger },
  removeBtn: { marginTop: 4 },
  removeBtnText: { fontSize: t.sm, color: colors.danger, fontWeight: '600' },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    marginTop: 4,
  },
  subtotalLabel: { fontSize: t.body, fontWeight: '600', color: colors.textMuted },
  subtotalValue: { fontSize: t.lg, fontWeight: '800', color: colors.text },
  fieldLabel: { fontSize: t.body, fontWeight: '600', color: colors.text, marginBottom: 6 },
  qtyPriceRow: { flexDirection: 'row', gap: 10 },
  qtyCol: { width: 88 },
  priceCol: { flex: 1 },
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
  draftLineTotal: {
    fontSize: t.body,
    fontWeight: '700',
    color: colors.primaryDark,
    marginTop: 10,
  },
  plusOnlyBtn: {
    alignSelf: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  plusOnlyText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 30,
    marginTop: -2,
  },
  addLineBtn: {
    backgroundColor: colors.primaryDark,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  addLineBtnText: { color: '#FFF', fontWeight: '700', fontSize: t.bodyLg },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 16,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: { fontSize: t.lg, fontWeight: '800', color: colors.text },
  modalClose: { fontSize: 20, color: colors.textMuted, padding: 4 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  footerTotal: { marginBottom: 10 },
  footerTotalLabel: { fontSize: t.caption, color: colors.textMuted, fontWeight: '600' },
  footerTotalValue: { fontSize: t.xxl, fontWeight: '800', color: colors.danger, marginTop: 2 },
  footerHint: { fontSize: t.sm, color: colors.textMuted, marginTop: 2 },
});
