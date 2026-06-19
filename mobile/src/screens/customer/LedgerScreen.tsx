import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { fetchPortalLedger } from '../../api/portal';
import { Card, LoadingState, Subtitle, Title } from '../../components/ui';
import { colors } from '../../theme/colors';
import { formatRs } from '../../utils/format';

export default function LedgerScreen() {
  const [entries, setEntries] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const data = await fetchPortalLedger();
    setEntries(data.ledger || []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load()
        .catch(() => setEntries([]))
        .finally(() => setLoading(false));
    }, [load])
  );

  if (loading) return <LoadingState />;

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={entries}
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
          <Title>My Ledger</Title>
          <Subtitle>Purchases and payments across shops</Subtitle>
        </>
      }
      ListEmptyComponent={<Text style={styles.empty}>No ledger entries yet.</Text>}
      renderItem={({ item }) => {
        const title = String(item.label || item.type || item.desc || item.title || 'Entry');
        const amountText =
          typeof item.amount === 'string'
            ? item.amount
            : item.creditAmount != null
              ? `+ ${formatRs(Number(item.creditAmount))}`
              : item.paymentAmount != null
                ? `- ${formatRs(Number(item.paymentAmount))}`
                : null;

        return (
          <Card>
            <Text style={styles.rowTitle}>{title}</Text>
            <Text style={styles.rowMeta}>
              {[item.date, item.shopName].filter(Boolean).join(' · ')}
            </Text>
            {amountText ? <Text style={styles.amount}>{amountText}</Text> : null}
          </Card>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
  rowTitle: { fontWeight: '700', color: colors.text },
  rowMeta: { color: colors.textMuted, marginTop: 4 },
  amount: { marginTop: 6, fontWeight: '700', color: colors.primaryDark },
});
