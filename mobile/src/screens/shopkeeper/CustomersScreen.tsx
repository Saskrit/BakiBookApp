import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { CompositeNavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { appAlert } from '../../contexts/DialogContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { fetchCustomers, deleteCustomer } from '../../api/customers';
import { fetchDashboardStats } from '../../api/shop';
import { LoadingState } from '../../components/ui';
import { colors } from '../../theme/colors';
import { typography as t } from '../../theme/typography';
import {
  avatarColor,
  formatLastTransaction,
  formatRs,
  getInitials,
  getTransactionBadge,
  isOverdueCustomer,
  sumSlice,
  trendPercent,
} from '../../utils/format';
import type { Customer } from '../../types';
import type { RootStackParamList, ShopkeeperTabParamList } from '../../navigation/types';

type CustomersNav = CompositeNavigationProp<
  BottomTabNavigationProp<ShopkeeperTabParamList, 'Customers'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type TabKey = 'all' | 'outstanding' | 'clear';
type SortKey = 'name' | 'outstanding-desc' | 'outstanding-asc' | 'recent';

const SORT_LABELS: Record<SortKey, string> = {
  name: 'Name (A–Z)',
  'outstanding-desc': 'Outstanding (High–Low)',
  'outstanding-asc': 'Outstanding (Low–High)',
  recent: 'Recent Activity',
};

function StatCard({
  label,
  value,
  valueColor,
  footer,
  footerColor,
  icon,
  iconBg,
}: {
  label: string;
  value: string;
  valueColor: string;
  footer: string;
  footerColor?: string;
  icon: ReactNode;
  iconBg: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconWrap, { backgroundColor: iconBg }]}>{icon}</View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
      <Text style={[styles.statFooter, footerColor ? { color: footerColor } : null]}>{footer}</Text>
    </View>
  );
}

function CustomerRow({
  customer,
  onPress,
  onLongPress,
}: {
  customer: Customer;
  onPress: () => void;
  onLongPress?: () => void;
}) {
  const badge = getTransactionBadge(
    customer.balance,
    customer.lastCreditDate,
    customer.lastPaymentDate
  );

  return (
    <Pressable onPress={onPress} onLongPress={onLongPress} style={styles.customerRow}>
      <View style={[styles.avatar, { backgroundColor: `${avatarColor(customer.name)}22` }]}>
        <Text style={[styles.avatarText, { color: avatarColor(customer.name) }]}>
          {getInitials(customer.name)}
        </Text>
      </View>

      <View style={styles.customerMain}>
        <Text style={styles.customerName}>{customer.name}</Text>
        <Text style={styles.customerPhone}>{customer.phone || 'No phone'}</Text>
        <Text style={styles.lastTxLabel}>Last Transaction</Text>
        <Text style={styles.lastTxTime}>
          {formatLastTransaction(customer.lastCreditDate, customer.lastPaymentDate)}
        </Text>
        <View style={[styles.badge, badge.tone === 'paid' ? styles.badgePaid : styles.badgeCredit]}>
          <Text
            style={[styles.badgeText, badge.tone === 'paid' ? styles.badgeTextPaid : styles.badgeTextCredit]}
          >
            {badge.label}
          </Text>
        </View>
      </View>

      <View style={styles.customerDue}>
        <Text style={styles.dueLabel}>Outstanding</Text>
        <Text
          style={[
            styles.dueValue,
            customer.balance > 0 ? styles.dueValueRed : styles.dueValueGreen,
          ]}
        >
          {formatRs(customer.balance)}
        </Text>
        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  );
}

export default function CustomersScreen() {
  const navigation = useNavigation<CustomersNav>();
  const insets = useSafeAreaInsets();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tab, setTab] = useState<TabKey>('all');
  const [sort, setSort] = useState<SortKey>('recent');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [monthCollection, setMonthCollection] = useState(0);
  const [monthCredit, setMonthCredit] = useState(0);
  const [collectionTrend, setCollectionTrend] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    const [customerRes, dashboardRes] = await Promise.all([
      fetchCustomers({
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        all: 'true',
      }),
      fetchDashboardStats(),
    ]);
    setCustomers(Array.isArray(customerRes.customers) ? customerRes.customers : []);
    const pay = dashboardRes.chart?.payment ?? [];
    const credit = dashboardRes.chart?.credit ?? [];
    setMonthCollection(sumSlice(pay, -30, pay.length));
    setMonthCredit(sumSlice(credit, -30, credit.length));
    setCollectionTrend(trendPercent(sumSlice(pay, -7, pay.length), sumSlice(pay, -14, -7)));
  }, [debouncedSearch]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setError('');
      load()
        .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load customers'))
        .finally(() => setLoading(false));
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers');
    } finally {
      setRefreshing(false);
    }
  };

  const stats = useMemo(() => {
    const list = Array.isArray(customers) ? customers : [];
    const outstanding = list.filter((c) => c.balance > 0);
    const totalOutstanding = outstanding.reduce((sum, c) => sum + c.balance, 0);
    const overdue = list.filter((c) =>
      isOverdueCustomer(c.balance, c.lastCreditDate)
    );
    const overdueAmount = overdue.reduce((sum, c) => sum + c.balance, 0);
    return {
      total: list.length,
      outstandingCount: outstanding.length,
      clearCount: list.length - outstanding.length,
      totalOutstanding,
      needToCollect: totalOutstanding,
      overdueCount: overdue.length,
      overdueAmount,
    };
  }, [customers]);

  const filteredCustomers = useMemo(() => {
    let list = [...(Array.isArray(customers) ? customers : [])];
    if (tab === 'outstanding') list = list.filter((c) => c.balance > 0);
    if (tab === 'clear') list = list.filter((c) => c.balance <= 0);
    if (overdueOnly) {
      list = list.filter((c) => isOverdueCustomer(c.balance, c.lastCreditDate));
    }

    list.sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'outstanding-desc') return b.balance - a.balance;
      if (sort === 'outstanding-asc') return a.balance - b.balance;
      const aRecent = Math.max(
        a.lastCreditDate ? new Date(a.lastCreditDate).getTime() : 0,
        a.lastPaymentDate ? new Date(a.lastPaymentDate).getTime() : 0
      );
      const bRecent = Math.max(
        b.lastCreditDate ? new Date(b.lastCreditDate).getTime() : 0,
        b.lastPaymentDate ? new Date(b.lastPaymentDate).getTime() : 0
      );
      return bRecent - aRecent;
    });

    return list;
  }, [customers, tab, sort, overdueOnly]);

  const openSort = () => {
    appAlert('Sort By', undefined, [
      ...(Object.keys(SORT_LABELS) as SortKey[]).map((key) => ({
        text: SORT_LABELS[key],
        onPress: () => setSort(key),
      })),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  const openCustomer = (customer: Customer) => {
    navigation.navigate('CustomerProfile', { customerId: customer.id });
  };

  const openCustomerActions = (customer: Customer) => {
    appAlert(customer.name, 'Choose an action', [
      { text: 'View profile', onPress: () => openCustomer(customer) },
      { text: 'Edit', onPress: () => navigation.navigate('EditCustomer', { customerId: customer.id }) },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          appAlert('Delete customer', `Remove ${customer.name}?`, [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: async () => {
                try {
                  await deleteCustomer(customer.id);
                  await load();
                } catch (err) {
                  appAlert('Error', err instanceof Error ? err.message : 'Failed to delete');
                }
              },
            },
          ]);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  if (loading) return <LoadingState />;

  const listHeader = (
    <View>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTop}>
          <Pressable style={styles.headerIconBtn} onPress={() => navigation.navigate('Settings')}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path d="M4 7 H20 M4 12 H20 M4 17 H20" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" />
            </Svg>
          </Pressable>
          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle}>Customers</Text>
            <Text style={styles.headerSubtitle}>Manage all your customers</Text>
          </View>
          <View style={styles.headerActions}>
            <Pressable style={styles.headerIconBtn} onPress={openSort}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M4 6 H20 M7 12 H17 M10 18 H14" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" />
              </Svg>
            </Pressable>
            <Pressable
              style={styles.headerIconBtn}
              onPress={() => navigation.navigate('AddCustomer')}
            >
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Circle cx={12} cy={12} r={9} stroke="#FFFFFF" strokeWidth={2} />
                <Path d="M12 8 V16 M8 12 H16" stroke="#FFFFFF" strokeWidth={2} />
              </Svg>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.statsScroll}>
          <StatCard
            label="Total Customers"
            value={String(stats.total)}
            valueColor={colors.primary}
            footer="Active customer list"
            footerColor={colors.primary}
            iconBg="#DCFCE7"
            icon={
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Circle cx={9} cy={8} r={3} stroke={colors.primary} strokeWidth={2} />
                <Path d="M3 19 C3 15 6 13 9 13" stroke={colors.primary} strokeWidth={2} />
              </Svg>
            }
          />
          <StatCard
            label="Total Outstanding"
            value={formatRs(stats.totalOutstanding)}
            valueColor="#EA580C"
            footer="View all outstanding"
            footerColor="#EA580C"
            iconBg="#FFEDD5"
            icon={
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Rect x={4} y={6} width={16} height={12} rx={2} stroke="#EA580C" strokeWidth={2} />
              </Svg>
            }
          />
          <StatCard
            label="Total Paid (This Month)"
            value={formatRs(monthCollection)}
            valueColor={colors.primary}
            footer={`${Math.abs(collectionTrend)}% vs last week`}
            footerColor={colors.primary}
            iconBg="#DBEAFE"
            icon={
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Circle cx={12} cy={12} r={8} stroke="#2563EB" strokeWidth={2} />
              </Svg>
            }
          />
          <StatCard
            label="Total Credit"
            value={formatRs(monthCredit)}
            valueColor="#7C3AED"
            footer="This month"
            footerColor="#7C3AED"
            iconBg="#EDE9FE"
            icon={
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Rect x={5} y={4} width={14} height={16} rx={2} stroke="#7C3AED" strokeWidth={2} />
              </Svg>
            }
          />
        </ScrollView>

        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Circle cx={11} cy={11} r={7} stroke={colors.textMuted} strokeWidth={2} />
              <Path d="M20 20 L16.5 16.5" stroke={colors.textMuted} strokeWidth={2} strokeLinecap="round" />
            </Svg>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search customers by name or mobile number..."
              placeholderTextColor={colors.textMuted}
              style={styles.searchInput}
            />
          </View>
          <Pressable style={styles.sortBtn} onPress={openSort}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M7 4 V20 M7 4 L4 7 M7 4 L10 7 M17 20 V4 M17 20 L14 17 M17 20 L20 17" stroke={colors.text} strokeWidth={2} strokeLinecap="round" />
            </Svg>
            <Text style={styles.sortBtnText}>Sort By</Text>
            <Text style={styles.sortChevron}>▾</Text>
          </Pressable>
        </View>

        <View style={styles.tabs}>
          {(
            [
              ['all', `All Customers (${stats.total})`],
              ['outstanding', `Outstanding (${stats.outstandingCount})`],
              ['clear', `No Outstanding (${stats.clearCount})`],
            ] as const
          ).map(([key, label]) => (
            <Pressable
              key={key}
              onPress={() => {
                setTab(key);
                setOverdueOnly(false);
              }}
              style={styles.tabBtn}
            >
              <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{label}</Text>
              {tab === key ? <View style={styles.tabIndicator} /> : null}
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );

  const listFooter = (
    <View style={styles.footerCards}>
      <Pressable
        style={[styles.footerCard, styles.footerCardGreen]}
        onPress={() => {
          navigation.navigate('FilteredCustomers', {
            mode: 'collect',
            title: 'Need to collect',
            subtitle: 'Customers with outstanding balance',
          });
        }}
      >
        <View style={styles.footerCardIconGreen}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Circle cx={12} cy={12} r={8} stroke={colors.primary} strokeWidth={2} />
          </Svg>
        </View>
        <View style={styles.footerCardBody}>
          <Text style={styles.footerCardTitleGreen}>Need to collect</Text>
          <Text style={styles.footerCardValue}>{formatRs(stats.needToCollect)}</Text>
          <Text style={styles.footerCardMeta}>From {stats.outstandingCount} customers</Text>
        </View>
        <Text style={styles.footerChevron}>›</Text>
      </Pressable>

      <Pressable
        style={[styles.footerCard, styles.footerCardOrange]}
        onPress={() => {
          navigation.navigate('FilteredCustomers', {
            mode: 'overdue',
            title: 'Overdue',
            subtitle: 'Customers overdue 30+ days',
          });
        }}
      >
        <View style={styles.footerCardIconOrange}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Rect x={4} y={5} width={16} height={15} rx={2} stroke="#EA580C" strokeWidth={2} />
          </Svg>
        </View>
        <View style={styles.footerCardBody}>
          <Text style={styles.footerCardTitleOrange}>Overdue</Text>
          <Text style={styles.footerCardValue}>{formatRs(stats.overdueAmount)}</Text>
          <Text style={styles.footerCardMeta}>From {stats.overdueCount} customers</Text>
        </View>
        <Text style={styles.footerChevron}>›</Text>
      </Pressable>
    </View>
  );

  return (
    <View style={styles.screen}>
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CustomerRow
            customer={item}
            onPress={() => openCustomer(item)}
            onLongPress={() => openCustomerActions(item)}
          />
        )}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {overdueOnly ? 'No overdue customers found.' : 'No customers found.'}
          </Text>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  headerTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  headerTitles: { flex: 1 },
  headerTitle: { color: '#FFFFFF', fontSize: t.h1, fontWeight: '800' },
  headerSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: t.bodyLg, marginTop: 4 },
  headerActions: { flexDirection: 'row', gap: 2 },
  headerIconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { paddingHorizontal: 16, paddingTop: 16 },
  error: { color: colors.danger, marginBottom: 10, fontSize: t.bodyLg },
  statsScroll: { gap: 12, paddingBottom: 16, paddingRight: 8 },
  statCard: {
    width: 168,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statLabel: { fontSize: t.sm, color: colors.textMuted, marginBottom: 4, fontWeight: '500' },
  statValue: { fontSize: t.xl, fontWeight: '800', marginBottom: 6 },
  statFooter: { fontSize: t.xs, fontWeight: '600', color: colors.textMuted },
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: t.bodyLg, color: colors.text, padding: 0 },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  sortBtnText: { fontSize: t.body, fontWeight: '600', color: colors.text },
  sortChevron: { fontSize: t.sm, color: colors.textMuted },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 8,
  },
  tabBtn: { flex: 1, alignItems: 'center', paddingBottom: 10 },
  tabText: { fontSize: t.sm, fontWeight: '600', color: colors.textMuted, textAlign: 'center' },
  tabTextActive: { color: colors.primary },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '10%',
    right: '10%',
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: { fontWeight: '800', fontSize: t.md },
  customerMain: { flex: 1, paddingRight: 8 },
  customerName: { fontSize: t.md, fontWeight: '700', color: colors.text },
  customerPhone: { fontSize: t.body, color: colors.textMuted, marginTop: 2, marginBottom: 8 },
  lastTxLabel: { fontSize: t.sm, color: colors.textMuted },
  lastTxTime: { fontSize: t.caption, color: colors.text, fontWeight: '500', marginTop: 2 },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgePaid: { backgroundColor: '#DCFCE7' },
  badgeCredit: { backgroundColor: '#DBEAFE' },
  badgeText: { fontSize: t.sm, fontWeight: '700' },
  badgeTextPaid: { color: colors.primary },
  badgeTextCredit: { color: '#2563EB' },
  customerDue: { alignItems: 'flex-end', minWidth: 88 },
  dueLabel: { fontSize: t.sm, color: colors.textMuted },
  dueValue: { fontSize: t.bodyLg, fontWeight: '800', marginTop: 4 },
  dueValueRed: { color: colors.danger },
  dueValueGreen: { color: colors.primary },
  chevron: { color: colors.textMuted, fontSize: t.xl, marginTop: 8 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 32, marginHorizontal: 16 },
  footerCards: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, gap: 10 },
  footerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  footerCardGreen: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#BBF7D0' },
  footerCardOrange: { backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FED7AA' },
  footerCardIconGreen: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerCardIconOrange: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerCardBody: { flex: 1 },
  footerCardTitleGreen: { fontSize: t.bodyLg, fontWeight: '700', color: colors.primary },
  footerCardTitleOrange: { fontSize: t.bodyLg, fontWeight: '700', color: '#EA580C' },
  footerCardValue: { fontSize: t.lg, fontWeight: '800', color: colors.text, marginTop: 2 },
  footerCardMeta: { fontSize: t.caption, color: colors.textMuted, marginTop: 2 },
  footerChevron: { fontSize: t.xxl, color: colors.textMuted },
});
