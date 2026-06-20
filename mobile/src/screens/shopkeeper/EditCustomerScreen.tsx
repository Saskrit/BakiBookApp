import { useEffect, useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fetchCustomer, updateCustomer } from '../../api/customers';
import { Button, ErrorText, Input, LoadingState, Screen, Subtitle, Title } from '../../components/ui';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'EditCustomer'>;

export default function EditCustomerScreen({ route, navigation }: Props) {
  const { customerId } = route.params;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCustomer(customerId)
      .then((res) => {
        setName(res.customer.name || '');
        setPhone(res.customer.phone || '');
        setEmail(res.customer.email || '');
        setAddress(res.customer.address || '');
        setNotes(res.customer.notes || '');
      })
      .catch(() => setError('Failed to load customer'))
      .finally(() => setLoading(false));
  }, [customerId]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Customer name is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await updateCustomer(customerId, {
        name: name.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      Alert.alert('Saved', 'Customer updated successfully');
      navigation.goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState />;

  return (
    <Screen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Title>Edit Customer</Title>
        <Subtitle>Update customer contact and notes</Subtitle>
        {error ? <ErrorText message={error} /> : null}
        <Input label="Name *" value={name} onChangeText={setName} />
        <Input label="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Input label="Address" value={address} onChangeText={setAddress} />
        <Input label="Notes" value={notes} onChangeText={setNotes} multiline />
        <Button title="Save Changes" onPress={handleSave} loading={saving} />
      </ScrollView>
    </Screen>
  );
}
