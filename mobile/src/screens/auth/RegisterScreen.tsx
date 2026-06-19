import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { Button, ErrorText, Input, Screen, Subtitle, Title } from '../../components/ui';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [role, setRole] = useState<'shopkeeper' | 'customer'>('shopkeeper');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await register({
        role,
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });
      navigation.replace(user.role === 'shopkeeper' ? 'Shopkeeper' : 'Customer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Title>Create account</Title>
          <Subtitle>One app for shopkeepers and customers</Subtitle>
          {error ? <ErrorText message={error} /> : null}

          <View style={styles.roleRow}>
            {(['shopkeeper', 'customer'] as const).map((r) => (
              <Pressable
                key={r}
                onPress={() => setRole(r)}
                style={[styles.roleBtn, role === r && styles.roleBtnActive]}
              >
                <Text style={[styles.roleText, role === r && styles.roleTextActive]}>
                  {r === 'shopkeeper' ? 'Shopkeeper' : 'Customer'}
                </Text>
              </Pressable>
            ))}
          </View>

          <Input label="Full name" value={fullName} onChangeText={setFullName} />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Button title="Register" onPress={handleRegister} loading={loading} />
          <Pressable onPress={() => navigation.goBack()} style={styles.linkWrap}>
            <Text style={styles.link}>Already have an account? Sign in</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 24, paddingBottom: 24 },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  roleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E0E0',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  roleBtnActive: { backgroundColor: '#6A7E3F', borderColor: '#6A7E3F' },
  roleText: { fontWeight: '600', color: '#4C5C2D' },
  roleTextActive: { color: '#fff' },
  linkWrap: { marginTop: 20, alignItems: 'center' },
  link: { color: '#6A7E3F', fontWeight: '600' },
});
