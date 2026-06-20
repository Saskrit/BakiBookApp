import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchCustomers } from '../../api/customers';
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
} from '../../utils/format';
import type { Customer } from '../../types';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'FilteredCustomers'>;

function CustomerRow({
  customer,
  onPress,
  showOverdueDays,
}: {
  customer: Customer;
  onPress: () => void;
  showOverdueDays?: boolean;
}) {
  const badge = getTransactionBadge(
    customer.balance,
    customer.lastCreditDate,
    customer.lastPaymentDate
  );
  const daysOverdue =
    customer.lastCreditDate && customer.balance > 0
      ? Math.floor(
          (Date.now() - new Date(customer.lastCreditDate).getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;

  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: `${avatarColor(customer.name)}22` }]}>
        <Text style={[styles.avatarText, { color: avatarColor(customer.name) }]}>
          {getInitials(customer.name)}
        </Text>
      </View>
      <View style={styles.body}>
        <Text style={styles.name}>{customer.name}</Text>
        <Text style={styles.phone}>{customer.phone || 'No phone'}</Text>
        {customer.address ? <Text style={styles.meta}>{customer.address}</Text> : null}
        <Text style={styles.meta}>
          Last activity: {formatLastTransaction(customer.lastCreditDate, customer.lastPaymentDate)}
        </Text>
        {showOverdueDays && daysOverdue > 0 ? (
          <Text style={styles.overdueTag}>{daysOverdue} days overdue</Text>
        ) : null}
        <View style={[styles.badge, badge.tone === 'paid' ? styles.badgePaid : styles.badgeCredit]}>
          <Text style={styles.badgeText}>{badge.label}</Text>
        </View>
      </View>
      <View style={styles.dueCol}>
        <Text style={styles.dueLabel}>Due</Text>
        <Text style={styles.dueValue}>{formatRs(customer.balance)}</Text>
        <Text style={styles.chevron}>›</Text>
      </View>
    </Pressable>
  );
}

export default function FilteredCustomersScreen({ route, navigation }: Props) {
  const { mode, title, subtitle } = route.params;
  const insets = useSafeAreaInsets();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const res = await fetchCustomers({ all: 'true' });
    setCustomers(Array.isArray(res.customers) ? res.customers : []);
  }, []);

  const filtered = useMemo(() => {
    if (mode === 'collect') {
      return customers.filter((c) => c.balance > 0).sort((a, b) => b.balance - a.balance);
    }
    return customers
      .filter((c) => isOverdueCustomer(c.balance, c.lastCreditDate))
      .sort((a, b) => b.balance - a.balance);
  }, [customers, mode]);

  const totalDue = filtered.reduce((sum, c) => sum + c.balance, 0);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  if (loading) return <LoadingState />;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>
            {filtered.length} customer{filtered.length === 1 ? '' : 's'} · {formatRs(totalDue)} total
          </Text>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CustomerRow
            customer={item}
            showOverdueDays={mode === 'overdue'}
            onPress={() => navigation.navigate('CustomerProfile', { customerId: item.id })}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {mode === 'overdue' ? 'No overdue customers.' : 'No outstanding balances.'}
          </Text>
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16 }}
      />
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
  back: { color: 'rgba(255,255,255,0.95)', fontSize: t.bodyLg, fontWeight: '600', marginBottom: 8 },
  title: { color: '#FFF', fontSize: t.h1, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.85)', fontSize: t.body, marginTop: 4 },
  summaryBar: {
    marginTop: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  summaryText: { color: '#FFF', fontSize: t.body, fontWeight: '600' },
  row: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ECEEF2',
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
  body: { flex: 1, paddingRight: 8 },
  name: { fontSize: t.md, fontWeight: '700', color: colors.text },
  phone: { fontSize: t.body, color: colors.textMuted, marginTop: 2 },
  meta: { fontSize: t.caption, color: colors.textMuted, marginTop: 4 },
  overdueTag: { fontSize: t.caption, color: '#EA580C', fontWeight: '700', marginTop: 4 },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#DBEAFE',
  },
  badgePaid: { backgroundColor: '#DCFCE7' },
  badgeCredit: { backgroundColor: '#DBEAFE' },
  badgeText: { fontSize: t.sm, fontWeight: '700', color: colors.primary },
  dueCol: { alignItems: 'flex-end', minWidth: 80 },
  dueLabel: { fontSize: t.sm, color: colors.textMuted },
  dueValue: { fontSize: t.bodyLg, fontWeight: '800', color: colors.danger, marginTop: 2 },
  chevron: { color: colors.textMuted, fontSize: t.xl, marginTop: 6 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
});
