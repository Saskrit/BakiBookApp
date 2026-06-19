import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CompositeNavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchDashboardStats } from '../../api/shop';
import { Button, Card, ErrorText, LoadingState, StatCard, Subtitle, Title } from '../../components/ui';
import { colors } from '../../theme/colors';
import { formatRs } from '../../utils/format';
import type { RootStackParamList, ShopkeeperTabParamList } from '../../navigation/types';

type DashboardNav = CompositeNavigationProp<
  BottomTabNavigationProp<ShopkeeperTabParamList, 'Dashboard'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function DashboardScreen() {
  const navigation = useNavigation<DashboardNav>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalOutstanding: 0,
    totalCustomers: 0,
    totalPayments: 0,
  });
  const [recent, setRecent] = useState<
    Array<{ id: string; text: string; amount: string }>
  >([]);

  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const data = await fetchDashboardStats();
    setStats({
      totalOutstanding: data.stats.totalOutstanding,
      totalCustomers: data.stats.totalCustomers,
      totalPayments: data.stats.totalPayments,
    });
    setRecent(data.recentTransactions || []);
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

  if (loading) return <LoadingState />;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Title>Dashboard</Title>
      <Subtitle>Your shop at a glance</Subtitle>
      {error ? <ErrorText message={error} /> : null}

      <View style={styles.statsRow}>
        <StatCard label="Outstanding Due" value={formatRs(stats.totalOutstanding)} accent />
        <View style={{ width: 10 }} />
        <StatCard label="Customers" value={String(stats.totalCustomers)} />
      </View>

      <View style={[styles.statsRow, { marginTop: 10 }]}>
        <StatCard label="Payments Received" value={formatRs(stats.totalPayments)} />
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actions}>
        <Button title="+ Customer" onPress={() => navigation.navigate('AddCustomer')} />
        <Button
          title="Scan QR"
          variant="outline"
          onPress={() => navigation.navigate('Scan')}
        />
      </View>

      <Text style={styles.sectionTitle}>Recent Activity</Text>
      {recent.length === 0 ? (
        <Card>
          <Text style={styles.muted}>No recent activity yet.</Text>
        </Card>
      ) : (
        recent.map((item) => (
          <Card key={item.id}>
            <Text style={styles.activityText}>{item.text}</Text>
            <Text style={styles.activityAmount}>{item.amount}</Text>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  statsRow: { flexDirection: 'row' },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  actions: { gap: 8 },
  muted: { color: colors.textMuted },
  activityText: { fontSize: 14, color: colors.text, marginBottom: 4 },
  activityAmount: { fontSize: 14, fontWeight: '700', color: colors.primary },
});
