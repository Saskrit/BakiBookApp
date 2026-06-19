import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createPayment } from '../../api/transactions';
import { Button, ErrorText, Input, Screen, Subtitle, Title } from '../../components/ui';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../navigation/types';

const METHODS = ['Cash', 'eSewa', 'Khalti', 'Bank Transfer', 'Other'];

type Props = NativeStackScreenProps<RootStackParamList, 'RecordPayment'>;

export default function RecordPaymentScreen({ route, navigation }: Props) {
  const { customerId, customerName } = route.params;
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!amount || Number(amount) <= 0) {
      setError('Enter a valid amount');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createPayment({
        customerId,
        amount: Number(amount),
        method,
        note: note.trim() || undefined,
      });
      Alert.alert('Saved', 'Payment recorded successfully');
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
        <Title>Record Payment</Title>
        <Subtitle>{customerName || 'Customer'}</Subtitle>
        {error ? <ErrorText message={error} /> : null}
        <Input label="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" />
        <Text style={styles.label}>Method</Text>
        <View style={styles.methodRow}>
          {METHODS.map((m) => (
            <Text
              key={m}
              onPress={() => setMethod(m)}
              style={[styles.methodChip, method === m && styles.methodChipActive]}
            >
              {m}
            </Text>
          ))}
        </View>
        <Input label="Notes" value={note} onChangeText={setNote} />
        <Button title="Save Payment" onPress={handleSave} loading={loading} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginBottom: 8 },
  methodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  methodChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    overflow: 'hidden',
  },
  methodChipActive: { backgroundColor: colors.primary, borderColor: colors.primary, color: '#fff' },
});
