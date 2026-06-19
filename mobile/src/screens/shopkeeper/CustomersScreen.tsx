import { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { CompositeNavigationProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchCustomers } from '../../api/customers';
import { CustomerCard } from '../../components/CustomerCard';
import { Button, ErrorText, Input, LoadingState } from '../../components/ui';
import { colors } from '../../theme/colors';
import type { Customer } from '../../types';
import type { RootStackParamList, ShopkeeperTabParamList } from '../../navigation/types';

type CustomersNav = CompositeNavigationProp<
  BottomTabNavigationProp<ShopkeeperTabParamList, 'Customers'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function CustomersScreen() {
  const navigation = useNavigation<CustomersNav>();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const data = await fetchCustomers({ search, page: 1, limit: 50 });
    setCustomers(data.customers);
  }, [search]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      setError('');
      load()
        .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
        .finally(() => setLoading(false));
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Customers</Text>
        <Pressable onPress={() => navigation.navigate('AddCustomer')}>
          <Text style={styles.add}>+ Add</Text>
        </Pressable>
      </View>
      <View style={styles.searchWrap}>
        <Input
          label="Search"
          value={search}
          onChangeText={setSearch}
          placeholder="Name, phone, or email"
          onSubmitEditing={onRefresh}
        />
      </View>
      {error ? <ErrorText message={error} /> : null}
      <FlatList
        data={customers}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No customers found.</Text>}
        renderItem={({ item }) => (
          <CustomerCard
            customer={item}
            onView={() => navigation.navigate('CustomerProfile', { customerId: item.id })}
            onCredit={() =>
              navigation.navigate('AddCredit', {
                customerId: item.id,
                customerName: item.name,
              })
            }
            onPayment={() =>
              navigation.navigate('RecordPayment', {
                customerId: item.id,
                customerName: item.name,
              })
            }
          />
        )}
      />
      <View style={styles.footer}>
        <Button title="+ New Customer" onPress={() => navigation.navigate('AddCustomer')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: { fontSize: 24, fontWeight: '700', color: colors.primaryDark },
  add: { color: colors.primary, fontWeight: '700', fontSize: 16 },
  searchWrap: { paddingHorizontal: 16 },
  list: { padding: 16, paddingBottom: 100 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 40 },
  footer: { position: 'absolute', bottom: 16, left: 16, right: 16 },
});
