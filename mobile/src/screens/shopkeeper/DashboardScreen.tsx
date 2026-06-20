import { useCallback, useRef, useState, type ReactNode } from 'react';
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CompositeNavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../contexts/AuthContext';
import Sparkline from '../../components/dashboard/Sparkline';
import { LoadingState } from '../../components/ui';
import {
  fetchDashboardStats,
  type DashboardDueReminder,
  type DashboardRecentTransaction,
  type DashboardTopDueCustomer,
} from '../../api/shop';
import { colors } from '../../theme/colors';
import { typography as t } from '../../theme/typography';
import {
  avatarColor,
  formatRelativeTime,
  formatRs,
  getInitials,
  isNewAccount,
  parseMoneyAmount,
  sumSlice,
  trendPercent,
} from '../../utils/format';
import type { RootStackParamList, ShopkeeperTabParamList } from '../../navigation/types';

type DashboardNav = CompositeNavigationProp<
  BottomTabNavigationProp<ShopkeeperTabParamList, 'Dashboard'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const parseCustomerName = (text: string) => {
  const match = text.match(/(?:to|from)\s+(.+)$/i);
  return match?.[1]?.trim() || 'Customer';
};

function SectionHeader({
  title,
  onViewAll,
}: {
  title: string;
  onViewAll?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onViewAll ? (
        <Pressable onPress={onViewAll}>
          <Text style={styles.viewAll}>View All ›</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function StatCard({
  label,
  value,
  valueColor,
  trend,
  trendUp,
  icon,
  iconBg,
}: {
  label: string;
  value: string;
  valueColor: string;
  trend: string;
  trendUp: boolean;
  icon: ReactNode;
  iconBg: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconWrap, { backgroundColor: iconBg }]}>{icon}</View>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
      <Text style={[styles.statTrend, trendUp ? styles.trendUp : styles.trendDown]}>
        {trendUp ? '▲' : '▼'} {trend}
      </Text>
    </View>
  );
}

function QuickAction({
  label,
  onPress,
  icon,
}: {
  label: string;
  onPress: () => void;
  icon: ReactNode;
}) {
  return (
    <Pressable onPress={onPress} style={styles.quickAction}>
      <View style={styles.quickActionIcon}>{icon}</View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </Pressable>
  );
}

function TransactionRow({ item }: { item: DashboardRecentTransaction }) {
  const name = parseCustomerName(item.text);
  const isPayment = item.type === 'payment';
  const amount = parseMoneyAmount(item.amount);

  return (
    <View style={styles.txRow}>
      <View style={[styles.avatar, { backgroundColor: avatarColor(name) }]}>
        <Text style={styles.avatarText}>{getInitials(name)}</Text>
      </View>
      <View style={styles.txBody}>
        <Text style={styles.txName}>{name}</Text>
        <Text style={styles.txType}>{isPayment ? 'Payment Received' : 'Credit Added'}</Text>
      </View>
      <View style={styles.txMeta}>
        <Text style={[styles.txAmount, isPayment ? styles.amountGreen : styles.amountOrange]}>
          {isPayment ? '+' : ''}
          {formatRs(amount)}
        </Text>
        <Text style={styles.txTime}>{formatRelativeTime(item.time)}</Text>
      </View>
    </View>
  );
}

function OutstandingRow({
  rank,
  item,
  onPress,
}: {
  rank: number;
  item: DashboardTopDueCustomer;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.outRow}>
      <Text style={styles.outRank}>{rank}</Text>
      <Text style={styles.outName} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={styles.outAmount}>{formatRs(item.amount)}</Text>
    </Pressable>
  );
}

function ReminderRow({ item }: { item: DashboardDueReminder }) {
  const dueLabel =
    item.daysOverdue === 0
      ? 'Today'
      : item.daysOverdue === 1
        ? 'Yesterday'
        : item.daysLabel || `${item.daysOverdue} days ago`;

  return (
    <View style={styles.reminderRow}>
      <View style={styles.reminderIcon}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
          <Rect x={3} y={5} width={18} height={16} rx={2} stroke={colors.primary} strokeWidth={2} />
          <Path d="M3 10 H21" stroke={colors.primary} strokeWidth={2} />
        </Svg>
      </View>
      <View style={styles.reminderBody}>
        <Text style={styles.reminderName}>{item.name}</Text>
        <Text style={styles.reminderAmount}>
          {formatRs(item.amount)} due · {dueLabel}
        </Text>
      </View>
      <Text style={styles.reminderWhen}>{dueLabel}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const navigation = useNavigation<DashboardNav>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalOutstanding: 0,
    totalCustomers: 0,
    totalPayments: 0,
    weekCredit: 0,
    weekPayment: 0,
  });
  const [chart, setChart] = useState({ credit: [] as number[], payment: [] as number[] });
  const [recent, setRecent] = useState<DashboardRecentTransaction[]>([]);
  const [topDue, setTopDue] = useState<DashboardTopDueCustomer[]>([]);
  const [reminders, setReminders] = useState<DashboardDueReminder[]>([]);

  const load = useCallback(async () => {
    const data = await fetchDashboardStats();
    setStats({
      totalOutstanding: data.stats.totalOutstanding,
      totalCustomers: data.stats.totalCustomers,
      totalPayments: data.stats.totalPayments,
      weekCredit: data.stats.weekCredit,
      weekPayment: data.stats.weekPayment,
    });
    setChart({
      credit: data.chart?.credit ?? [],
      payment: data.chart?.payment ?? [],
    });
    setRecent(data.recentTransactions || []);
    setTopDue(data.topDueCustomers || []);
    setReminders(data.dueReminders || []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setError('');
      load()
        .catch((err) =>
          setError(err instanceof Error ? err.message : 'Failed to load dashboard')
        )
        .finally(() => setLoading(false));
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  const todayCollection = chart.payment.at(-1) || 0;
  const todayCredit = chart.credit.at(-1) || 0;
  const last7Pay = sumSlice(chart.payment, -7, chart.payment.length);
  const prev7Pay = sumSlice(chart.payment, -14, -7);
  const last7Credit = sumSlice(chart.credit, -7, chart.credit.length);
  const prev7Credit = sumSlice(chart.credit, -14, -7);
  const monthCollection = sumSlice(chart.payment, -30, chart.payment.length);
  const monthCredit = sumSlice(chart.credit, -30, chart.credit.length);
  const monthNet = monthCollection - monthCredit;

  const firstName = user?.fullName?.split(' ')[0] || 'Shopkeeper';
  const hasShop = Boolean(user?.shopName?.trim());
  const isNewUser = isNewAccount(user?.createdAt);
  const greetingLine = isNewUser ? `Welcome, ${firstName}` : `Welcome back, ${firstName}`;
  const openShopProfile = () => navigation.getParent()?.navigate('ShopProfile');
  const avatarLabel = hasShop ? user!.shopName! : user?.fullName || 'Shopkeeper';

  if (loading) return <LoadingState />;

  return (
    <View style={styles.screen}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.primaryDark, colors.primary, '#7A9249']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 10 }]}
        >
          <View style={styles.headerOrbLarge} />
          <View style={styles.headerOrbSmall} />

          <View style={styles.headerTop}>
            <Pressable style={styles.headerGlassBtn} onPress={() => navigation.navigate('Settings')}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M4 7 H20 M4 12 H20 M4 17 H20" stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" />
              </Svg>
            </Pressable>
            <Text style={styles.headerBrand}>BakiBook</Text>
            <View style={styles.headerActions}>
              <Pressable style={styles.headerGlassBtn}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 4 C8 4 5 7 5 10 C5 16 3 17 3 17 H21 C21 17 19 16 19 10 C19 7 16 4 12 4 Z"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                </Svg>
                {reminders.length > 0 ? (
                  <View style={styles.notifBadge}>
                    <Text style={styles.notifBadgeText}>{Math.min(reminders.length, 9)}</Text>
                  </View>
                ) : null}
              </Pressable>
            </View>
          </View>

          <View style={styles.headerHero}>
            <Pressable onPress={openShopProfile} style={styles.headerAvatarWrap}>
              {user?.shopImage ? (
                <Image source={{ uri: user.shopImage }} style={styles.headerAvatar} />
              ) : (
                <View style={styles.headerAvatarPlaceholder}>
                  <Text style={styles.headerAvatarInitial}>{getInitials(avatarLabel)}</Text>
                </View>
              )}
              {!hasShop ? <View style={styles.headerAvatarDot} /> : null}
            </Pressable>

            <View style={styles.headerGreeting}>
              <Text style={styles.welcomeText}>
                {greetingLine} {isNewUser ? '✨' : '👋'}
              </Text>
              {hasShop ? (
                <Pressable onPress={openShopProfile} style={styles.shopRow}>
                  <Text style={styles.shopName} numberOfLines={1}>
                    {user!.shopName}
                  </Text>
                  <Text style={styles.shopChevron}>▾</Text>
                </Pressable>
              ) : (
                <Pressable onPress={openShopProfile} style={styles.registerShopBtn}>
                  <Text style={styles.registerShopText}>Register your shop</Text>
                  <Text style={styles.registerShopArrow}>›</Text>
                </Pressable>
              )}
              {!hasShop ? (
                <Text style={styles.shopHint}>Add shop name, location & photo to get started</Text>
              ) : null}
            </View>
          </View>

          <View style={styles.headerFooter}>
            <Pressable style={styles.overviewBtn} onPress={() => navigation.navigate('Reports')}>
              <Text style={styles.overviewBtnText}>Business Overview</Text>
              <Text style={styles.overviewBtnArrow}>›</Text>
            </Pressable>
            <View style={styles.headerStatPill}>
              <Text style={styles.headerStatLabel}>Outstanding</Text>
              <Text style={styles.headerStatValue}>{formatRs(stats.totalOutstanding)}</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsScroll}
          >
            <StatCard
              label="Total Outstanding"
              value={formatRs(stats.totalOutstanding)}
              valueColor={colors.danger}
              trend={`${Math.abs(trendPercent(last7Credit, prev7Credit))}% vs last week`}
              trendUp={stats.totalOutstanding <= 0}
              iconBg="#FEE2E2"
              icon={
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Rect x={3} y={7} width={18} height={12} rx={2} stroke={colors.danger} strokeWidth={2} />
                  <Path d="M3 11 H21" stroke={colors.danger} strokeWidth={2} />
                </Svg>
              }
            />
            <StatCard
              label="Today's Collection"
              value={formatRs(todayCollection)}
              valueColor={colors.primary}
              trend={`${Math.abs(trendPercent(last7Pay, prev7Pay))}% vs last week`}
              trendUp={trendPercent(last7Pay, prev7Pay) >= 0}
              iconBg="#DCFCE7"
              icon={
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Circle cx={12} cy={12} r={8} stroke={colors.primary} strokeWidth={2} />
                  <Path d="M12 8 V16 M9 11 H15" stroke={colors.primary} strokeWidth={2} />
                </Svg>
              }
            />
            <StatCard
              label="Today's New Credit"
              value={formatRs(todayCredit)}
              valueColor={colors.warning}
              trend={`${Math.abs(trendPercent(last7Credit, prev7Credit))}% vs last week`}
              trendUp={trendPercent(last7Credit, prev7Credit) <= 0}
              iconBg="#FEF3C7"
              icon={
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Rect x={5} y={4} width={14} height={16} rx={2} stroke={colors.warning} strokeWidth={2} />
                  <Path d="M12 8 V14 M9 11 H15" stroke={colors.warning} strokeWidth={2} />
                </Svg>
              }
            />
            <StatCard
              label="Total Customers"
              value={String(stats.totalCustomers)}
              valueColor="#2563EB"
              trend={`${stats.weekPayment > 0 ? 'Active' : 'Growing'} this week`}
              trendUp
              iconBg="#DBEAFE"
              icon={
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Circle cx={9} cy={8} r={3} stroke="#2563EB" strokeWidth={2} />
                  <Circle cx={17} cy={9} r={2.5} stroke="#2563EB" strokeWidth={2} />
                  <Path d="M3 19 C3 15 6 13 9 13 C12 13 15 15 15 19" stroke="#2563EB" strokeWidth={2} />
                </Svg>
              }
            />
          </ScrollView>

          <SectionHeader title="Quick Actions" onViewAll={() => navigation.navigate('Customers')} />
          <View style={styles.quickGrid}>
            <QuickAction
              label="Add Customer"
              onPress={() => navigation.navigate('AddCustomer')}
              icon={
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Circle cx={10} cy={8} r={3} stroke={colors.primary} strokeWidth={2} />
                  <Path d="M4 19 C4 15 7 13 10 13" stroke={colors.primary} strokeWidth={2} />
                  <Path d="M17 8 V14 M14 11 H20" stroke={colors.primary} strokeWidth={2} />
                </Svg>
              }
            />
            <QuickAction
              label="Add Credit"
              onPress={() => navigation.navigate('AddCredit')}
              icon={
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Rect x={4} y={4} width={16} height={16} rx={2} stroke={colors.primary} strokeWidth={2} />
                  <Path d="M12 8 V16 M8 12 H16" stroke={colors.primary} strokeWidth={2} />
                </Svg>
              }
            />
            <QuickAction
              label="Receive Payment"
              onPress={() => navigation.navigate('Customers')}
              icon={
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Circle cx={12} cy={12} r={8} stroke={colors.primary} strokeWidth={2} />
                  <Path d="M12 8 V16 M8 12 H14" stroke={colors.primary} strokeWidth={2} />
                </Svg>
              }
            />
            <QuickAction
              label="Customers"
              onPress={() => navigation.navigate('Customers')}
              icon={
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Circle cx={9} cy={8} r={3} stroke={colors.primary} strokeWidth={2} />
                  <Path d="M3 19 C3 15 6 13 9 13" stroke={colors.primary} strokeWidth={2} />
                </Svg>
              }
            />
            <QuickAction
              label="Reminders"
              onPress={() => scrollRef.current?.scrollToEnd({ animated: true })}
              icon={
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Rect x={4} y={5} width={16} height={15} rx={2} stroke={colors.primary} strokeWidth={2} />
                  <Path d="M4 10 H20" stroke={colors.primary} strokeWidth={2} />
                </Svg>
              }
            />
            <QuickAction
              label="Scan QR"
              onPress={() => navigation.navigate('Scan')}
              icon={
                <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                  <Rect x={4} y={4} width={7} height={7} stroke={colors.primary} strokeWidth={2} />
                  <Rect x={13} y={4} width={7} height={7} stroke={colors.primary} strokeWidth={2} />
                  <Rect x={4} y={13} width={7} height={7} stroke={colors.primary} strokeWidth={2} />
                  <Path d="M14 14 H17 V17" stroke={colors.primary} strokeWidth={2} />
                </Svg>
              }
            />
          </View>

          <View style={styles.twoCol}>
            <View style={styles.colCard}>
              <SectionHeader title="Recent Transactions" />
              {recent.length === 0 ? (
                <Text style={styles.emptyText}>No recent transactions.</Text>
              ) : (
                recent.slice(0, 4).map((item) => <TransactionRow key={item.id} item={item} />)
              )}
            </View>

            <View style={styles.colCard}>
              <SectionHeader
                title="Top Outstanding"
                onViewAll={() => navigation.navigate('Customers')}
              />
              {topDue.length === 0 ? (
                <Text style={styles.emptyText}>No outstanding dues.</Text>
              ) : (
                topDue.map((item, index) => (
                  <OutstandingRow
                    key={item.id}
                    rank={index + 1}
                    item={item}
                    onPress={() => navigation.navigate('CustomerProfile', { customerId: item.id })}
                  />
                ))
              )}
              <Pressable
                style={styles.viewAllBtn}
                onPress={() => navigation.navigate('Customers')}
              >
                <Text style={styles.viewAllBtnText}>View All Outstanding ›</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.card}>
            <SectionHeader title="Business Overview (This Month)" onViewAll={() => navigation.navigate('Reports')} />
            <View style={styles.overviewGrid}>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Total Collection</Text>
                <Text style={[styles.overviewValue, { color: colors.primary }]}>
                  {formatRs(monthCollection)}
                </Text>
                <Sparkline data={chart.payment.slice(-14)} color={colors.primary} />
              </View>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>New Credit</Text>
                <Text style={[styles.overviewValue, { color: colors.warning }]}>
                  {formatRs(monthCredit)}
                </Text>
                <Sparkline data={chart.credit.slice(-14)} color={colors.warning} />
              </View>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Net Balance</Text>
                <Text
                  style={[
                    styles.overviewValue,
                    { color: monthNet >= 0 ? colors.primary : colors.danger },
                  ]}
                >
                  {formatRs(monthNet)}
                </Text>
                <Sparkline
                  data={chart.payment.slice(-14).map((v, i) => v - (chart.credit.slice(-14)[i] || 0))}
                  color={monthNet >= 0 ? colors.primary : colors.danger}
                />
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <SectionHeader title="Upcoming Reminders" onViewAll={() => navigation.navigate('Customers')} />
            {reminders.length === 0 ? (
              <Text style={styles.emptyText}>No payment reminders right now.</Text>
            ) : (
              reminders.slice(0, 4).map((item) => (
                <ReminderRow key={item.customerId} item={item} />
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F3F4F6' },
  scroll: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  headerOrbLarge: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -40,
    right: -30,
  },
  headerOrbSmall: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: 20,
    left: -20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  headerBrand: {
    color: '#FFFFFF',
    fontSize: t.lg,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    opacity: 0.95,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerGlassBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  notifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notifBadgeText: { color: '#FFF', fontSize: t.sm, fontWeight: '700' },
  headerHero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  headerAvatarWrap: { position: 'relative' },
  headerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  headerAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  headerAvatarInitial: { color: '#FFF', fontWeight: '800', fontSize: t.lg },
  headerAvatarDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.warning,
    borderWidth: 2,
    borderColor: colors.primaryDark,
  },
  headerGreeting: { flex: 1 },
  welcomeText: { color: '#FFFFFF', fontSize: t.xl, fontWeight: '800', marginBottom: 6 },
  shopRow: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  shopName: { color: 'rgba(255,255,255,0.92)', fontSize: t.md, fontWeight: '600', flexShrink: 1 },
  shopChevron: { color: 'rgba(255,255,255,0.75)', fontSize: t.body },
  registerShopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    gap: 4,
  },
  registerShopText: { color: '#FFFFFF', fontSize: t.body, fontWeight: '700' },
  registerShopArrow: { color: '#FFFFFF', fontSize: t.lg, fontWeight: '600' },
  shopHint: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: t.sm,
    marginTop: 6,
    lineHeight: 18,
  },
  headerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  overviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  overviewBtnText: { color: '#FFFFFF', fontSize: t.body, fontWeight: '700' },
  overviewBtnArrow: { color: 'rgba(255,255,255,0.85)', fontSize: t.lg, fontWeight: '600' },
  headerStatPill: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.12)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  headerStatLabel: { color: 'rgba(255,255,255,0.75)', fontSize: t.xs, fontWeight: '600' },
  headerStatValue: { color: '#FFFFFF', fontSize: t.md, fontWeight: '800', marginTop: 2 },
  body: { paddingHorizontal: 16, paddingTop: 16 },
  error: { color: colors.danger, marginBottom: 12, fontSize: t.bodyLg },
  statsScroll: { gap: 12, paddingBottom: 4, paddingRight: 4 },
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
  statTrend: { fontSize: t.xs, fontWeight: '600' },
  trendUp: { color: colors.primary },
  trendDown: { color: colors.danger },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: { fontSize: t.lg, fontWeight: '700', color: colors.text },
  viewAll: { fontSize: t.body, color: colors.primary, fontWeight: '600' },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  quickAction: {
    width: '31%',
    minWidth: 100,
    flexGrow: 1,
    alignItems: 'center',
    marginBottom: 4,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickActionLabel: {
    fontSize: t.sm,
    color: colors.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  twoCol: { gap: 12, marginTop: 8 },
  colCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyText: { color: colors.textMuted, fontSize: t.bodyLg, paddingVertical: 8 },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: { color: '#FFF', fontWeight: '700', fontSize: t.body },
  txBody: { flex: 1 },
  txName: { fontSize: t.bodyLg, fontWeight: '600', color: colors.text },
  txType: { fontSize: t.caption, color: colors.textMuted, marginTop: 2 },
  txMeta: { alignItems: 'flex-end' },
  txAmount: { fontSize: t.bodyLg, fontWeight: '700' },
  amountGreen: { color: colors.primary },
  amountOrange: { color: colors.warning },
  txTime: { fontSize: t.sm, color: colors.textMuted, marginTop: 2 },
  outRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  outRank: { width: 22, fontSize: t.bodyLg, fontWeight: '700', color: colors.textMuted },
  outName: { flex: 1, fontSize: t.bodyLg, fontWeight: '600', color: colors.text, marginRight: 8 },
  outAmount: { fontSize: t.bodyLg, fontWeight: '700', color: colors.danger },
  viewAllBtn: {
    marginTop: 10,
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewAllBtnText: { color: colors.primary, fontWeight: '700', fontSize: t.bodyLg },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  overviewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  overviewItem: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  overviewLabel: { fontSize: t.caption, color: colors.textMuted, marginBottom: 4 },
  overviewValue: { fontSize: t.lg, fontWeight: '800', marginBottom: 6 },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reminderIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  reminderBody: { flex: 1 },
  reminderName: { fontSize: t.bodyLg, fontWeight: '600', color: colors.text },
  reminderAmount: { fontSize: t.caption, color: colors.textMuted, marginTop: 2 },
  reminderWhen: { fontSize: t.caption, color: colors.primary, fontWeight: '600' },
});
