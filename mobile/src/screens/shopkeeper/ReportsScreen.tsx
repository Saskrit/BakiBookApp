import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { fetchCompleteReport } from '../../api/shop';
import { useAuth } from '../../contexts/AuthContext';
import { appAlert } from '../../contexts/DialogContext';
import { Button, ErrorText, LoadingState } from '../../components/ui';
import { colors } from '../../theme/colors';
import { typography as t } from '../../theme/typography';
import { formatReportDate } from '../../utils/pdfHtml';
import { exportCompleteShopReportPdf } from '../../utils/shopReportPdf';
import { avatarColor, formatRs, getInitials } from '../../utils/format';

type Period = 'daily' | 'weekly' | 'monthly';

type CompleteReport = {
  report: Record<string, unknown>;
  credits?: Array<Record<string, unknown>>;
  payments?: Array<Record<string, unknown>>;
  products?: Array<Record<string, unknown>>;
  activity?: Array<Record<string, unknown>>;
  customers?: Array<Record<string, unknown>>;
  outstanding?: Array<Record<string, unknown>>;
};

const PERIOD_LABELS: Record<Period, string> = {
  daily: 'Today',
  weekly: 'This week',
  monthly: 'This month',
};

function SummaryStat({
  label,
  value,
  color,
  icon,
  iconBg,
}: {
  label: string;
  value: string;
  color: string;
  icon: ReactNode;
  iconBg: string;
}) {
  return (
    <View style={styles.summaryStat}>
      <View style={[styles.summaryStatIcon, { backgroundColor: iconBg }]}>{icon}</View>
      <Text style={styles.summaryStatLabel}>{label}</Text>
      <Text style={[styles.summaryStatValue, { color }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function CountChip({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.countChip}>
      <Text style={styles.countChipValue}>{value}</Text>
      <Text style={styles.countChipLabel}>{label}</Text>
    </View>
  );
}

function CollapsibleSection({
  title,
  count,
  icon,
  iconBg,
  defaultOpen = false,
  children,
}: {
  title: string;
  count?: number;
  icon: ReactNode;
  iconBg: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View style={styles.sectionCard}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={({ pressed }) => [styles.sectionHeader, pressed && styles.sectionHeaderPressed]}
      >
        <View style={[styles.sectionIcon, { backgroundColor: iconBg }]}>{icon}</View>
        <View style={styles.sectionHeaderBody}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {count != null ? (
            <Text style={styles.sectionCount}>
              {count} record{count === 1 ? '' : 's'}
            </Text>
          ) : null}
        </View>
        <Text style={styles.sectionChevron}>{open ? '▾' : '›'}</Text>
      </Pressable>
      {open ? <View style={styles.sectionBody}>{children}</View> : null}
    </View>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <View style={styles.emptyHint}>
      <Text style={styles.emptyHintText}>{text}</Text>
    </View>
  );
}

function CreditRow({ item }: { item: Record<string, unknown> }) {
  const customer = String(item.customer || 'Customer');
  return (
    <View style={styles.recordRow}>
      <View style={[styles.recordAvatar, { backgroundColor: avatarColor(customer) }]}>
        <Text style={styles.recordAvatarText}>{getInitials(customer)}</Text>
      </View>
      <View style={styles.recordBody}>
        <Text style={styles.recordTitle} numberOfLines={1}>
          {customer}
        </Text>
        <Text style={styles.recordSub} numberOfLines={2}>
          {String(item.products || 'Credit')}
          {item.note ? ` · ${item.note}` : ''}
        </Text>
        <Text style={styles.recordDate}>{String(item.date || '')}</Text>
      </View>
      <Text style={[styles.recordAmount, styles.amountCredit]}>
        {formatRs(Number(item.total || 0))}
      </Text>
    </View>
  );
}

function PaymentRow({ item }: { item: Record<string, unknown> }) {
  const customer = String(item.customer || 'Customer');
  return (
    <View style={styles.recordRow}>
      <View style={[styles.recordAvatar, { backgroundColor: avatarColor(customer) }]}>
        <Text style={styles.recordAvatarText}>{getInitials(customer)}</Text>
      </View>
      <View style={styles.recordBody}>
        <Text style={styles.recordTitle} numberOfLines={1}>
          {customer}
        </Text>
        <Text style={styles.recordSub} numberOfLines={1}>
          {String(item.paidFor || 'Payment')}
          {item.method ? ` · ${item.method}` : ''}
        </Text>
        <Text style={styles.recordDate}>{String(item.date || '')}</Text>
      </View>
      <Text style={[styles.recordAmount, styles.amountPayment]}>
        +{formatRs(Number(item.amount || 0))}
      </Text>
    </View>
  );
}

function ProductRow({ item }: { item: Record<string, unknown> }) {
  return (
    <View style={styles.recordRow}>
      <View style={[styles.recordAvatar, { backgroundColor: '#FFF7ED' }]}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Rect x={4} y={6} width={16} height={14} rx={2} stroke="#EA580C" strokeWidth={2} />
        </Svg>
      </View>
      <View style={styles.recordBody}>
        <Text style={styles.recordTitle} numberOfLines={1}>
          {String(item.product || 'Product')}
        </Text>
        <Text style={styles.recordSub} numberOfLines={1}>
          {String(item.customer || '')} · ×{String(item.qty || 1)} @ {formatRs(Number(item.price || 0))}
        </Text>
        <Text style={styles.recordDate}>{String(item.date || '')}</Text>
      </View>
      <Text style={styles.recordAmount}>{formatRs(Number(item.total || 0))}</Text>
    </View>
  );
}

function ActivityRow({ item }: { item: Record<string, unknown> }) {
  const type = String(item.type || 'Activity');
  const isPayment = type.toLowerCase().includes('payment');
  return (
    <View style={styles.recordRow}>
      <View
        style={[
          styles.recordBadge,
          { backgroundColor: isPayment ? '#DCFCE7' : '#FEE2E2' },
        ]}
      >
        <Text
          style={[
            styles.recordBadgeText,
            { color: isPayment ? colors.primary : colors.danger },
          ]}
        >
          {type.slice(0, 1)}
        </Text>
      </View>
      <View style={styles.recordBody}>
        <Text style={styles.recordTitle} numberOfLines={1}>
          {String(item.customer || '—')}
        </Text>
        <Text style={styles.recordSub} numberOfLines={2}>
          {String(item.details || type)}
        </Text>
        <Text style={styles.recordDate}>{String(item.date || '')}</Text>
      </View>
      <Text
        style={[
          styles.recordAmount,
          isPayment ? styles.amountPayment : styles.amountCredit,
        ]}
      >
        {formatRs(Number(item.amount || 0))}
      </Text>
    </View>
  );
}

function OutstandingRow({ item }: { item: Record<string, unknown> }) {
  const name = String(item.name || 'Customer');
  return (
    <View style={styles.recordRow}>
      <View style={[styles.recordAvatar, { backgroundColor: avatarColor(name) }]}>
        <Text style={styles.recordAvatarText}>{getInitials(name)}</Text>
      </View>
      <View style={styles.recordBody}>
        <Text style={styles.recordTitle} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.recordSub} numberOfLines={1}>
          {item.phone ? String(item.phone) : 'No phone'}
          {item.creditScore ? ` · ${item.creditScore}` : ''}
        </Text>
      </View>
      <Text style={[styles.recordAmount, styles.amountCredit]}>
        {formatRs(Number(item.balance || 0))}
      </Text>
    </View>
  );
}

function RecordBlock({
  items,
  empty,
  renderItem,
  preview = 8,
}: {
  items: Array<Record<string, unknown>> | undefined;
  empty: string;
  renderItem: (item: Record<string, unknown>, index: number) => ReactNode;
  preview?: number;
}) {
  if (!items?.length) return <EmptyHint text={empty} />;
  const shown = items.slice(0, preview);
  return (
    <View style={styles.recordList}>
      {shown.map((item, index) => (
        <View key={String(item.id || index)}>{renderItem(item, index)}</View>
      ))}
      {items.length > preview ? (
        <Text style={styles.moreHint}>
          + {items.length - preview} more in exported PDF
        </Text>
      ) : null}
    </View>
  );
}

export default function ReportsScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<Period>('daily');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<CompleteReport | null>(null);

  const loadReport = useCallback(async (nextPeriod: Period, silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const res = (await fetchCompleteReport(nextPeriod)) as CompleteReport & { success?: boolean };
      setData({
        report: res.report || {},
        credits: Array.isArray(res.credits) ? res.credits : [],
        payments: Array.isArray(res.payments) ? res.payments : [],
        products: Array.isArray(res.products) ? res.products : [],
        activity: Array.isArray(res.activity) ? res.activity : [],
        customers: Array.isArray(res.customers) ? res.customers : [],
        outstanding: Array.isArray(res.outstanding) ? res.outstanding : [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReport('daily');
  }, [loadReport]);

  const onPeriodChange = (next: Period) => {
    setPeriod(next);
    loadReport(next);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReport(period, true);
    setRefreshing(false);
  };

  const exportPdf = async () => {
    if (!data) {
      appAlert('No report', 'Generate a report first, then export.');
      return;
    }
    setExporting(true);
    try {
      await exportCompleteShopReportPdf({
        period,
        shopName: user?.shopName,
        shopOwner: user?.fullName,
        ...data,
      });
    } catch (err) {
      appAlert('Export failed', err instanceof Error ? err.message : 'Could not export PDF');
    } finally {
      setExporting(false);
    }
  };

  const report = data?.report || {};
  const periodStart = formatReportDate(String(report.periodStart || ''));
  const periodEnd = formatReportDate(String(report.periodEnd || ''));

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[colors.primaryDark, colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <Text style={styles.headerTitle}>Reports</Text>
        <Text style={styles.headerSubtitle}>
          {user?.shopName || 'Your shop'} · sales & collections
        </Text>

        <View style={styles.periodRow}>
          {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
            <Pressable
              key={p}
              onPress={() => onPeriodChange(p)}
              style={[styles.periodChip, period === p && styles.periodChipActive]}
            >
              <Text style={[styles.periodChipText, period === p && styles.periodChipTextActive]}>
                {PERIOD_LABELS[p]}
              </Text>
            </Pressable>
          ))}
        </View>

        {data && !loading ? (
          <View style={styles.dateRange}>
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
              <Rect x={3} y={5} width={18} height={16} rx={2} stroke="rgba(255,255,255,0.8)" strokeWidth={2} />
              <Path d="M3 10 H21" stroke="rgba(255,255,255,0.8)" strokeWidth={2} />
            </Svg>
            <Text style={styles.dateRangeText}>
              {periodStart}
              {periodEnd && periodEnd !== periodStart ? ` – ${periodEnd}` : ''}
            </Text>
          </View>
        ) : null}
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {loading && !data ? <LoadingState /> : null}
        {error ? <ErrorText message={error} /> : null}

        {data && !loading ? (
          <>
            <View style={styles.summaryGrid}>
              <SummaryStat
                label="Credit given"
                value={formatRs(Number(report.creditGiven || 0))}
                color="#EA580C"
                iconBg="#FFF7ED"
                icon={
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Path d="M12 5 V19 M5 12 H19" stroke="#EA580C" strokeWidth={2.5} strokeLinecap="round" />
                  </Svg>
                }
              />
              <SummaryStat
                label="Collected"
                value={formatRs(Number(report.paymentsReceived || 0))}
                color={colors.primary}
                iconBg="#ECFDF5"
                icon={
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Path d="M5 12 L10 17 L19 7" stroke={colors.primary} strokeWidth={2.5} strokeLinecap="round" />
                  </Svg>
                }
              />
              <SummaryStat
                label="Outstanding"
                value={formatRs(Number(report.totalOutstanding || 0))}
                color={colors.danger}
                iconBg="#FEE2E2"
                icon={
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                    <Circle cx={12} cy={12} r={8} stroke={colors.danger} strokeWidth={2} />
                    <Path d="M12 8 V13" stroke={colors.danger} strokeWidth={2} strokeLinecap="round" />
                  </Svg>
                }
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.countRow}
            >
              <CountChip label="Credits" value={Number(report.transactionCount ?? 0)} />
              <CountChip label="Payments" value={Number(report.paymentCount ?? 0)} />
              <CountChip label="Products" value={Number(report.productCount ?? 0)} />
              <CountChip label="Customers" value={Number(report.customerCount ?? 0)} />
              <CountChip label="With dues" value={Number(report.customersWithDues ?? 0)} />
            </ScrollView>

            <CollapsibleSection
              title="Credit transactions"
              count={data.credits?.length}
              iconBg="#FFF7ED"
              defaultOpen
              icon={
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 5 V19 M5 12 H19" stroke="#EA580C" strokeWidth={2.5} strokeLinecap="round" />
                </Svg>
              }
            >
              <RecordBlock
                items={data.credits}
                empty="No credit given in this period."
                renderItem={(item) => <CreditRow item={item} />}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Payments received"
              count={data.payments?.length}
              iconBg="#ECFDF5"
              icon={
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path d="M5 12 L10 17 L19 7" stroke={colors.primary} strokeWidth={2.5} strokeLinecap="round" />
                </Svg>
              }
            >
              <RecordBlock
                items={data.payments}
                empty="No payments in this period."
                renderItem={(item) => <PaymentRow item={item} />}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Product sales"
              count={data.products?.length}
              iconBg="#FFF7ED"
              icon={
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Rect x={4} y={6} width={16} height={14} rx={2} stroke="#EA580C" strokeWidth={2} />
                </Svg>
              }
            >
              <RecordBlock
                items={data.products}
                empty="No product lines in this period."
                renderItem={(item) => <ProductRow item={item} />}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="All activity"
              count={data.activity?.length}
              iconBg="#EFF6FF"
              icon={
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path d="M6 19 V11 M12 19 V5 M18 19 V14" stroke="#2563EB" strokeWidth={2} strokeLinecap="round" />
                </Svg>
              }
            >
              <RecordBlock
                items={data.activity}
                empty="No activity in this period."
                renderItem={(item) => <ActivityRow item={item} />}
              />
            </CollapsibleSection>

            <CollapsibleSection
              title="Outstanding customers"
              count={data.outstanding?.length}
              iconBg="#FEE2E2"
              icon={
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Circle cx={12} cy={8} r={4} stroke={colors.danger} strokeWidth={2} />
                  <Path d="M4 20 C4 16 7 14 12 14 C17 14 20 16 20 20" stroke={colors.danger} strokeWidth={2} />
                </Svg>
              }
            >
              <RecordBlock
                items={data.outstanding}
                empty="No outstanding balances — all clear!"
                renderItem={(item) => <OutstandingRow item={item} />}
              />
            </CollapsibleSection>
          </>
        ) : loading && data ? (
          <View style={styles.loadingOverlay}>
            <LoadingState />
          </View>
        ) : null}
      </ScrollView>

      <View style={[styles.exportBar, { paddingBottom: insets.bottom + 12 }]}>
        <Button
          title={exporting ? 'Exporting…' : 'Export full PDF report'}
          onPress={exportPdf}
          disabled={!data || exporting || loading}
        />
        <Text style={styles.exportHint}>Includes every transaction detail for sharing or printing</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F5F7' },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 18,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  headerTitle: { color: '#FFF', fontSize: t.h1, fontWeight: '800' },
  headerSubtitle: { color: 'rgba(255,255,255,0.88)', fontSize: t.body, marginTop: 4 },
  periodRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 12,
    padding: 4,
  },
  periodChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  periodChipActive: { backgroundColor: '#FFF' },
  periodChipText: { color: 'rgba(255,255,255,0.85)', fontSize: t.caption, fontWeight: '700' },
  periodChipTextActive: { color: colors.primaryDark },
  dateRange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    alignSelf: 'center',
  },
  dateRangeText: { color: 'rgba(255,255,255,0.9)', fontSize: t.caption, fontWeight: '600' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingTop: 14 },
  loadingOverlay: { paddingVertical: 24 },
  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  summaryStat: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    minWidth: 0,
  },
  summaryStatIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  summaryStatLabel: { fontSize: t.sm, color: colors.textMuted, fontWeight: '600' },
  summaryStatValue: { fontSize: t.bodyLg, fontWeight: '800', marginTop: 4 },
  countRow: { gap: 8, paddingBottom: 14 },
  countChip: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ECEEF2',
    minWidth: 72,
  },
  countChipValue: { fontSize: t.lg, fontWeight: '800', color: colors.text },
  countChipLabel: { fontSize: t.sm, color: colors.textMuted, marginTop: 2, fontWeight: '600' },
  sectionCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  sectionHeaderPressed: { backgroundColor: '#FAFAFA' },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderBody: { flex: 1 },
  sectionTitle: { fontSize: t.md, fontWeight: '700', color: colors.text },
  sectionCount: { fontSize: t.caption, color: colors.textMuted, marginTop: 2 },
  sectionChevron: { fontSize: 20, color: colors.textMuted, fontWeight: '300' },
  sectionBody: {
    borderTopWidth: 1,
    borderTopColor: '#F0F1F3',
    paddingHorizontal: 14,
    paddingBottom: 12,
    paddingTop: 4,
  },
  recordList: { gap: 0 },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  recordAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordAvatarText: { color: '#FFF', fontWeight: '800', fontSize: t.caption },
  recordBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordBadgeText: { fontWeight: '800', fontSize: t.bodyLg },
  recordBody: { flex: 1, minWidth: 0 },
  recordTitle: { fontSize: t.bodyLg, fontWeight: '700', color: colors.text },
  recordSub: { fontSize: t.caption, color: colors.textMuted, marginTop: 2, lineHeight: 16 },
  recordDate: { fontSize: t.sm, color: colors.textMuted, marginTop: 3 },
  recordAmount: { fontSize: t.bodyLg, fontWeight: '800', color: colors.text },
  amountCredit: { color: colors.danger },
  amountPayment: { color: colors.primary },
  moreHint: {
    fontSize: t.caption,
    color: colors.primary,
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: 10,
  },
  emptyHint: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptyHintText: { fontSize: t.body, color: colors.textMuted, textAlign: 'center' },
  exportBar: {
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
  exportHint: {
    fontSize: t.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
  },
});
