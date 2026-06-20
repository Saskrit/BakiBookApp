import { useState } from 'react';
import { ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createCustomer } from '../../api/customers';
import { appAlert } from '../../contexts/DialogContext';
import { Button, ErrorText, Input, Screen, Subtitle, Title } from '../../components/ui';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddCustomer'>;

export default function AddCustomerScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Customer name is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await createCustomer({ name: name.trim(), phone, email, address });
      appAlert('Saved', 'Customer added successfully');
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
        <Title>Add Customer</Title>
        <Subtitle>Register a new customer for your pasal</Subtitle>
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
        <Button title="Save Customer" onPress={handleSave} loading={loading} />
      </ScrollView>
    </Screen>
  );
}
