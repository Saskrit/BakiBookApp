import { useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createTransaction } from '../../api/transactions';
import { Button, ErrorText, Input, Screen, Subtitle, Title } from '../../components/ui';
import { formatRs } from '../../utils/format';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddCredit'>;

export default function AddCreditScreen({ route, navigation }: Props) {
  const { customerId, customerName } = route.params;
  const [itemName, setItemName] = useState('');
  const [qty, setQty] = useState('1');
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const total = Number(qty || 0) * Number(price || 0);

  const handleSave = async () => {
    if (!itemName.trim() || !price) {
      setError('Item name and price are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createTransaction({
        customerId,
        items: [{ name: itemName.trim(), qty: Number(qty) || 1, price: Number(price) }],
        note: note.trim() || undefined,
      });
      Alert.alert('Saved', 'Credit recorded successfully');
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Title>Add Credit</Title>
        <Subtitle>{customerName || 'Customer'}</Subtitle>
        {error ? <ErrorText message={error} /> : null}
        <Input label="Item Name" value={itemName} onChangeText={setItemName} />
        <Input label="Quantity" value={qty} onChangeText={setQty} keyboardType="numeric" />
        <Input label="Price" value={price} onChangeText={setPrice} keyboardType="numeric" />
        <Input label="Notes" value={note} onChangeText={setNote} />
        <Subtitle>Total: {formatRs(total)}</Subtitle>
        <Button title="Save Credit" onPress={handleSave} loading={loading} />
      </ScrollView>
    </Screen>
  );
}
