import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { deleteCustomer } from '../../api/customers';
import { fetchSharedAccount, type LedgerEntry } from '../../api/shared';
import { useAuth } from '../../contexts/AuthContext';
import { appAlert } from '../../contexts/DialogContext';
import { Button, LoadingState } from '../../components/ui';
import { colors } from '../../theme/colors';
import { typography as t } from '../../theme/typography';
import { exportCustomerReportPdf } from '../../utils/customerReportPdf';
import { avatarColor, formatRs, getInitials } from '../../utils/format';
import type { Customer } from '../../types';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CustomerProfile'>;

function StatBox({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, accent ? { color: accent } : null]}>{value}</Text>
    </View>
  );
}

function LedgerRow({ entry }: { entry: LedgerEntry }) {
  const isCredit = entry.type === 'Credit';
  return (
    <View style={styles.ledgerRow}>
      <View style={[styles.ledgerDot, { backgroundColor: isCredit ? '#FEE2E2' : '#DCFCE7' }]}>
        <Text style={{ color: isCredit ? colors.danger : colors.primary, fontWeight: '800', fontSize: t.sm }}>
          {isCredit ? '+' : '−'}
        </Text>
      </View>
      <View style={styles.ledgerBody}>
        <View style={styles.ledgerTop}>
          <Text style={styles.ledgerType}>{entry.type || entry.label}</Text>
          <Text style={[styles.ledgerAmount, { color: isCredit ? colors.danger : colors.primary }]}>
            {entry.amount}
          </Text>
        </View>
        <Text style={styles.ledgerDesc} numberOfLines={2}>
          {entry.desc || entry.products || entry.items || '—'}
        </Text>
        <View style={styles.ledgerMeta}>
          <Text style={styles.ledgerDate}>
            {entry.date}
            {entry.time ? ` · ${entry.time}` : ''}
          </Text>
          {entry.balance ? <Text style={styles.ledgerBalance}>Bal: {entry.balance}</Text> : null}
        </View>
        {entry.method ? <Text style={styles.ledgerExtra}>Method: {entry.method}</Text> : null}
      </View>
    </View>
  );
}

export default function CustomerProfileScreen({ route }: Props) {
  const { customerId } = route.params;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [summary, setSummary] = useState({
    balance: 0,
    totalCredit: 0,
    totalPaid: 0,
    transactionCount: 0,
    paymentCount: 0,
  });
  const [credits, setCredits] = useState<Array<Record<string, unknown>>>([]);
  const [payments, setPayments] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    const data = await fetchSharedAccount(customerId);
    setCustomer(data.customer);
    setLedger(data.ledger);
    setSummary(data.summary);
    setCredits(data.transactions as unknown as Array<Record<string, unknown>>);
    setPayments(data.payments as unknown as Array<Record<string, unknown>>);
  }, [customerId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load()
        .catch(() => appAlert('Error', 'Failed to load customer profile'))
        .finally(() => setLoading(false));
    }, [load])
  );

  const handleDelete = () => {
    if (!customer) return;
    appAlert(
      'Delete customer',
      `Remove ${customer.name} and all related records? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomer(customerId);
              navigation.goBack();
            } catch (err) {
              appAlert('Error', err instanceof Error ? err.message : 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const handleExport = async () => {
    if (!customer) return;
    setExporting(true);
    try {
      const creditRows = credits.map((tx) => ({
        ...tx,
        products:
          tx.products ||
          ((tx.items as Array<{ name: string; qty: number }>) || [])
            .map((i) => `${i.name} ×${i.qty}`)
            .join(', '),
      }));
      await exportCustomerReportPdf({
        shopName: user?.shopName,
        shopOwner: user?.fullName,
        customer,
        summary,
        ledger: ledger as unknown as Array<Record<string, unknown>>,
        credits: creditRows,
        payments,
      });
    } catch (err) {
      appAlert('Export failed', err instanceof Error ? err.message : 'Could not export PDF');
    } finally {
      setExporting(false);
    }
  };

  if (loading || !customer) return <LoadingState />;

  const initials = getInitials(customer.name);
  const avatarBg = avatarColor(customer.name);

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        <LinearGradient
          colors={[colors.primaryDark, colors.primary]}
          style={[styles.hero, { paddingTop: insets.top + 12 }]}
        >
          <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
            <Text style={styles.back}>‹ Back</Text>
          </Pressable>

          <View style={[styles.avatar, { backgroundColor: `${avatarBg}33` }]}>
            <Text style={[styles.avatarText, { color: '#FFFFFF' }]}>{initials}</Text>
          </View>
          <Text style={styles.heroName}>{customer.name}</Text>
          {customer.phone ? <Text style={styles.heroMeta}>{customer.phone}</Text> : null}
          {customer.email ? <Text style={styles.heroMeta}>{customer.email}</Text> : null}
          {customer.address ? <Text style={styles.heroMeta}>{customer.address}</Text> : null}

          <View style={styles.chipRow}>
            {customer.creditScore ? (
              <View style={styles.chip}>
                <Text style={styles.chipText}>Score: {customer.creditScore}</Text>
              </View>
            ) : null}
            <View style={styles.chip}>
              <Text style={styles.chipText}>
                {customer.linkStatus === 'linked' ? 'Linked account' : 'Shop customer'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <View style={styles.statsRow}>
            <StatBox
              label="Outstanding"
              value={formatRs(summary.balance ?? customer.balance)}
              accent={customer.balance > 0 ? colors.danger : colors.primary}
            />
            <StatBox label="Total credit" value={formatRs(summary.totalCredit)} />
            <StatBox label="Total paid" value={formatRs(summary.totalPaid)} accent={colors.primary} />
          </View>

          {customer.notes?.trim() ? (
            <View style={styles.notesCard}>
              <Text style={styles.notesTitle}>Notes</Text>
              <Text style={styles.notesText}>{customer.notes}</Text>
            </View>
          ) : null}

          <View style={styles.actionRow}>
            <Pressable
              style={styles.actionBtn}
              onPress={() => navigation.navigate('EditCustomer', { customerId })}
            >
              <Text style={styles.actionBtnText}>Edit</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={handleExport} disabled={exporting}>
              <Text style={styles.actionBtnText}>{exporting ? 'Exporting…' : 'Download report'}</Text>
            </Pressable>
            <Pressable style={[styles.actionBtn, styles.actionBtnDanger]} onPress={handleDelete}>
              <Text style={[styles.actionBtnText, styles.actionBtnDangerText]}>Delete</Text>
            </Pressable>
          </View>

          <View style={styles.quickActions}>
            <Button
              title="Add credit"
              onPress={() =>
                navigation.navigate('AddCredit', { customerId, customerName: customer.name })
              }
            />
            <Button
              title="Record payment"
              variant="outline"
              onPress={() =>
                navigation.navigate('RecordPayment', { customerId, customerName: customer.name })
              }
            />
          </View>

          <Text style={styles.sectionTitle}>Account ledger</Text>
          <Text style={styles.sectionSub}>
            {summary.transactionCount} credits · {summary.paymentCount} payments
          </Text>

          <View style={styles.ledgerCard}>
            {ledger.length === 0 ? (
              <Text style={styles.emptyLedger}>No transactions yet.</Text>
            ) : (
              ledger.map((entry) => <LedgerRow key={entry.id} entry={entry} />)
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F5F7' },
  hero: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  back: {
    alignSelf: 'flex-start',
    color: 'rgba(255,255,255,0.95)',
    fontSize: t.bodyLg,
    fontWeight: '600',
    marginBottom: 12,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
    marginBottom: 10,
  },
  avatarText: { fontSize: t.h2, fontWeight: '800' },
  heroName: { color: '#FFF', fontSize: t.h2, fontWeight: '800', textAlign: 'center' },
  heroMeta: { color: 'rgba(255,255,255,0.9)', fontSize: t.body, marginTop: 4, textAlign: 'center' },
  chipRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap', justifyContent: 'center' },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  chipText: { color: '#FFF', fontSize: t.caption, fontWeight: '600' },
  body: { padding: 16, marginTop: -8 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  statBox: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECEEF2',
  },
  statLabel: { fontSize: t.sm, color: colors.textMuted, marginBottom: 4 },
  statValue: { fontSize: t.bodyLg, fontWeight: '800', color: colors.text },
  notesCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ECEEF2',
  },
  notesTitle: { fontSize: t.bodyLg, fontWeight: '700', color: colors.text, marginBottom: 6 },
  notesText: { fontSize: t.body, color: colors.textMuted, lineHeight: 18 },
  actionRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  actionBtn: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEEF2',
  },
  actionBtnDanger: { borderColor: '#FECACA', backgroundColor: '#FEF2F2' },
  actionBtnText: { fontSize: t.caption, fontWeight: '700', color: colors.primary },
  actionBtnDangerText: { color: colors.danger },
  quickActions: { gap: 8, marginBottom: 18 },
  sectionTitle: { fontSize: t.lg, fontWeight: '800', color: colors.text },
  sectionSub: { fontSize: t.caption, color: colors.textMuted, marginBottom: 10, marginTop: 2 },
  ledgerCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: '#ECEEF2',
  },
  ledgerRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
    gap: 10,
  },
  ledgerDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  ledgerBody: { flex: 1 },
  ledgerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  ledgerType: { fontSize: t.bodyLg, fontWeight: '700', color: colors.text },
  ledgerAmount: { fontSize: t.bodyLg, fontWeight: '800' },
  ledgerDesc: { fontSize: t.body, color: colors.textMuted, marginTop: 4, lineHeight: 17 },
  ledgerMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    gap: 8,
  },
  ledgerDate: { fontSize: t.caption, color: colors.textMuted },
  ledgerBalance: { fontSize: t.caption, fontWeight: '700', color: colors.primary },
  ledgerExtra: { fontSize: t.caption, color: colors.textMuted, marginTop: 2 },
  emptyLedger: { textAlign: 'center', color: colors.textMuted, padding: 24, fontSize: t.body },
});
