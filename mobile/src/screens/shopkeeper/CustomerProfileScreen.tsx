import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import QRCode from 'react-native-qrcode-svg';
import { fetchCustomer } from '../../api/customers';
import { fetchPayments, fetchTransactions } from '../../api/transactions';
import { Button, Card, LoadingState } from '../../components/ui';
import { colors } from '../../theme/colors';
import { formatRs } from '../../utils/format';
import type { Customer } from '../../types';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerProfile'>;

type Tab = 'transactions' | 'payments' | 'notes';

export default function CustomerProfileScreen({ route }: Props) {
  const { customerId } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [tab, setTab] = useState<Tab>('transactions');
  const [transactions, setTransactions] = useState<Array<Record<string, unknown>>>([]);
  const [payments, setPayments] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [customerRes, txRes, payRes] = await Promise.all([
      fetchCustomer(customerId),
      fetchTransactions(customerId),
      fetchPayments(customerId),
    ]);
    setCustomer(customerRes.customer);
    setTransactions(txRes.transactions as unknown as Array<Record<string, unknown>>);
    setPayments(payRes.payments as unknown as Array<Record<string, unknown>>);
  }, [customerId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load()
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [load])
  );

  if (loading || !customer) return <LoadingState />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.name}>{customer.name}</Text>
        {customer.phone ? <Text style={styles.meta}>Phone: {customer.phone}</Text> : null}
        {customer.address ? <Text style={styles.meta}>Address: {customer.address}</Text> : null}
        <Text style={styles.due}>Outstanding: {formatRs(customer.balance)}</Text>
      </Card>

      {customer.qrCode ? (
        <Card style={styles.qrCard}>
          <Text style={styles.qrTitle}>Customer QR</Text>
          <View style={styles.qrWrap}>
            <QRCode value={customer.qrCode} size={160} />
          </View>
        </Card>
      ) : null}

      <View style={styles.tabRow}>
        {(['transactions', 'payments', 'notes'] as Tab[]).map((t) => (
          <Text
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && styles.tabActive]}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Text>
        ))}
      </View>

      {tab === 'transactions' &&
        transactions.map((tx) => (
          <Card key={String(tx.id)}>
            <Text style={styles.rowTitle}>{String(tx.date || '')}</Text>
            <Text style={styles.rowAmount}>+ {formatRs(Number(tx.total || 0))}</Text>
          </Card>
        ))}

      {tab === 'payments' &&
        payments.map((p) => (
          <Card key={String(p.id)}>
            <Text style={styles.rowTitle}>{String(p.date || '')}</Text>
            <Text style={[styles.rowAmount, { color: colors.success }]}>
              - {formatRs(Number(p.amount || 0))}
            </Text>
          </Card>
        ))}

      {tab === 'notes' && (
        <Card>
          <Text style={styles.meta}>{customer.notes || 'No notes yet.'}</Text>
        </Card>
      )}

      <View style={styles.actions}>
        <Button
          title="Add Credit"
          onPress={() =>
            navigation.navigate('AddCredit', { customerId, customerName: customer.name })
          }
        />
        <Button
          title="Record Payment"
          variant="outline"
          onPress={() =>
            navigation.navigate('RecordPayment', { customerId, customerName: customer.name })
          }
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  name: { fontSize: 22, fontWeight: '700', color: colors.text },
  meta: { color: colors.textMuted, marginTop: 4 },
  due: { marginTop: 12, fontSize: 18, fontWeight: '700', color: colors.danger },
  qrCard: { alignItems: 'center' },
  qrTitle: { fontWeight: '600', marginBottom: 12, color: colors.text },
  qrWrap: { padding: 12, backgroundColor: '#fff', borderRadius: 12 },
  tabRow: { flexDirection: 'row', gap: 8, marginVertical: 12 },
  tab: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.surface,
    color: colors.textMuted,
    overflow: 'hidden',
  },
  tabActive: { backgroundColor: colors.primary, color: '#fff', fontWeight: '700' },
  rowTitle: { color: colors.text },
  rowAmount: { marginTop: 4, fontWeight: '700', color: colors.danger },
  actions: { marginTop: 16, gap: 8 },
});
