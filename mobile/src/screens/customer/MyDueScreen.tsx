import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CompositeNavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchPortalDashboard, fetchPendingLinks } from '../../api/portal';
import { Button, Card, LoadingState, StatCard, Subtitle, Title } from '../../components/ui';
import { colors } from '../../theme/colors';
import { formatRs } from '../../utils/format';
import type { RootStackParamList, CustomerTabParamList } from '../../navigation/types';

type MyDueNav = CompositeNavigationProp<
  BottomTabNavigationProp<CustomerTabParamList, 'MyDue'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function MyDueScreen() {
  const navigation = useNavigation<MyDueNav>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState({
    currentDue: 0,
    totalPurchases: 0,
    totalPaid: 0,
    lastPayment: null as string | null,
  });
  const [shops, setShops] = useState<Array<{ shopName: string; balance: number }>>([]);
  const [pendingCount, setPendingCount] = useState(0);

  const load = useCallback(async () => {
    const [dashboard, pending] = await Promise.all([
      fetchPortalDashboard(),
      fetchPendingLinks(),
    ]);
    setSummary(dashboard.summary);
    setShops(dashboard.shops || []);
    setPendingCount(pending.count || 0);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load()
        .catch(() => {})
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
      <Title>My Due</Title>
      <Subtitle>Your outstanding balance across linked shops</Subtitle>

      {pendingCount > 0 ? (
        <Card>
          <Text style={styles.pending}>
            You have {pendingCount} shop link request{pendingCount > 1 ? 's' : ''} pending.
          </Text>
          <Button title="Review Links" onPress={() => navigation.navigate('LinkShops')} />
        </Card>
      ) : null}

      <View style={styles.statsRow}>
        <StatCard label="Current Due" value={formatRs(summary.currentDue)} accent />
        <View style={{ width: 10 }} />
        <StatCard label="Total Paid" value={formatRs(summary.totalPaid)} />
      </View>

      <Text style={styles.section}>Linked Shops</Text>
      {shops.length === 0 ? (
        <Card>
          <Text style={styles.muted}>No linked shops yet. Ask your shopkeeper to add your email.</Text>
        </Card>
      ) : (
        shops.map((shop) => (
          <Card key={shop.shopName}>
            <Text style={styles.shopName}>{shop.shopName}</Text>
            <Text style={styles.shopDue}>Due: {formatRs(shop.balance)}</Text>
          </Card>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  statsRow: { flexDirection: 'row', marginTop: 8 },
  section: { marginTop: 20, marginBottom: 10, fontWeight: '700', color: colors.primaryDark },
  shopName: { fontSize: 16, fontWeight: '700', color: colors.text },
  shopDue: { marginTop: 4, color: colors.danger, fontWeight: '600' },
  muted: { color: colors.textMuted },
  pending: { marginBottom: 12, color: colors.warning },
});
