import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { acceptShopLink, fetchPendingLinks, rejectShopLink } from '../../api/portal';
import { appAlert } from '../../contexts/DialogContext';
import { Button, Card, LoadingState, Subtitle, Title } from '../../components/ui';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../navigation/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'LinkShops'>;

export default function LinkShopsScreen({ navigation }: Props) {
  const [links, setLinks] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const data = await fetchPendingLinks();
    setLinks(data.invitations || []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load()
        .catch(() => setLinks([]))
        .finally(() => setLoading(false));
    }, [load])
  );

  const handleAccept = async (customerId: string) => {
    await acceptShopLink(customerId);
    appAlert('Linked', 'Shop linked successfully');
    await load();
    if (links.length <= 1) navigation.goBack();
  };

  const handleReject = async (customerId: string) => {
    await rejectShopLink(customerId);
    await load();
  };

  if (loading) return <LoadingState />;

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={links}
      keyExtractor={(item, index) => String(item.id || index)}
      ListHeaderComponent={
        <>
          <Title>Link Shops</Title>
          <Subtitle>Accept invitations from shopkeepers</Subtitle>
        </>
      }
      ListEmptyComponent={<Text style={styles.empty}>No pending link requests.</Text>}
      renderItem={({ item }) => (
        <Card>
          <Text style={styles.shop}>{String(item.shopName || 'Shop')}</Text>
          <Text style={styles.meta}>Invited as {String(item.email || item.name || '')}</Text>
          <Button
            title="Accept"
            onPress={() => handleAccept(String(item.id))}
          />
          <Button
            title="Reject"
            variant="outline"
            onPress={() => handleReject(String(item.id))}
          />
        </Card>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
  shop: { fontSize: 16, fontWeight: '700', color: colors.text },
  meta: { color: colors.textMuted, marginVertical: 8 },
});
