import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchPortalPayments } from '../../api/portal';
import { Card, LoadingState, Subtitle, Title } from '../../components/ui';
import { colors } from '../../theme/colors';
import { formatRs } from '../../utils/format';

export default function PaymentsScreen() {
  const [payments, setPayments] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await fetchPortalPayments();
    setPayments(data.payments || []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load()
        .catch(() => setPayments([]))
        .finally(() => setLoading(false));
    }, [load])
  );

  if (loading) return <LoadingState />;

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={payments}
      keyExtractor={(item, index) => String(item.id || index)}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await load();
            setRefreshing(false);
          }}
        />
      }
      ListHeaderComponent={
        <>
          <Title>My Payments</Title>
          <Subtitle>Payment history from linked shops</Subtitle>
        </>
      }
      ListEmptyComponent={<Text style={styles.empty}>No payments recorded yet.</Text>}
      renderItem={({ item }) => (
        <Card>
          <Text style={styles.amount}>{formatRs(Number(item.amount || 0))}</Text>
          <Text style={styles.meta}>
            {String(item.shopName || item.method || 'Payment')} · {String(item.date || '')}
          </Text>
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
  amount: { fontSize: 18, fontWeight: '700', color: colors.success },
  meta: { marginTop: 4, color: colors.textMuted },
});
