import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import LoginBackground from '../../components/auth/LoginBackground';
import {
  AuthFooter,
  AuthHeader,
  EmailIcon,
  EyeIcon,
  LockIcon,
  OrDivider,
  authStyles,
} from '../../components/auth/AuthUi';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login, googleSignIn } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState(__DEV__ ? 'shopkeeper@bakibook.demo' : '');
  const [password, setPassword] = useState(__DEV__ ? 'Demo@123' : '');
  const [showPassword, setShowPassword] = useState(false);
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

  const handleForgotPassword = () => {
    Alert.alert(
      'Forgot Password?',
      'Password reset is available on the BakiBook web portal. Enter your registered email there to receive a reset link.',
    );
  };

  const handleGoogleCredential = async (credential: string) => {
    setError('');
    setLoading(true);
    try {
      const user = await googleSignIn({ credential, mode: 'login' });
      navigation.replace(user.role === 'shopkeeper' ? 'Shopkeeper' : 'Customer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={authStyles.container}>
      <StatusBar style="dark" />
      <LoginBackground />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={authStyles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            authStyles.scroll,
            { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <AuthHeader />

          <View style={authStyles.card}>
            <Text style={authStyles.cardTitle}>Welcome Back!</Text>
            <Text style={authStyles.cardSubtitle}>Login to continue to your account</Text>

            {error ? <Text style={authStyles.error}>{error}</Text> : null}

            <Text style={authStyles.label}>Email Address</Text>
            <View style={authStyles.inputRow}>
              <EmailIcon />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email address"
                placeholderTextColor={colors.textMuted}
                style={authStyles.input}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
              />
            </View>

            <Text style={authStyles.label}>Password</Text>
            <View style={authStyles.inputRow}>
              <LockIcon />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={colors.textMuted}
                style={authStyles.input}
                secureTextEntry={!showPassword}
                textContentType="password"
                autoComplete="password"
              />
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={8}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon visible={showPassword} />
              </Pressable>
            </View>

            <Pressable onPress={handleForgotPassword} style={styles.forgotWrap}>
              <Text style={styles.forgotLink}>Forgot Password?</Text>
            </Pressable>

            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => [
                authStyles.primaryBtn,
                loading && authStyles.primaryBtnDisabled,
                pressed && authStyles.primaryBtnPressed,
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={authStyles.primaryBtnText}>Login</Text>
                  <Text style={authStyles.primaryBtnArrow}>→</Text>
                </>
              )}
            </Pressable>

            <OrDivider />

            <GoogleSignInButton
              disabled={loading}
              onCredential={handleGoogleCredential}
              onError={setError}
            />

            <View style={authStyles.altRow}>
              <Text style={authStyles.altText}>Don&apos;t have an account? </Text>
              <Pressable onPress={() => navigation.navigate('Register')}>
                <Text style={authStyles.altLink}>Register Now</Text>
              </Pressable>
            </View>
          </View>

          <AuthFooter />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = {
  forgotWrap: {
    alignSelf: 'flex-end' as const,
    marginBottom: 20,
    marginTop: -4,
  },
  forgotLink: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '600' as const,
  },
};
