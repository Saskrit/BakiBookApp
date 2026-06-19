import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import { Button, ErrorText, Input, Screen, Subtitle, Title } from '../../components/ui';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState(__DEV__ ? 'shopkeeper@bakibook.demo' : '');
  const [password, setPassword] = useState(__DEV__ ? 'Demo@123' : '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await login(trimmedEmail, password);
      navigation.replace(user.role === 'shopkeeper' ? 'Shopkeeper' : 'Customer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
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
          <Title>BakiBook</Title>
          <Subtitle>Sign in to manage your pasal or view your dues</Subtitle>
          {error ? <ErrorText message={error} /> : null}
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="password"
            autoComplete="password"
          />
          <Button title="Sign In" onPress={handleLogin} loading={loading} />
          <Pressable onPress={() => navigation.navigate('Register')} style={styles.linkWrap}>
            <Text style={styles.link}>New here? Create an account</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: 48, paddingBottom: 24 },
  linkWrap: { marginTop: 20, alignItems: 'center' },
  link: { color: '#6A7E3F', fontWeight: '600' },
});
