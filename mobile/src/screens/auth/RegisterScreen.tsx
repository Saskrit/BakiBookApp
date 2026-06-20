import { useState } from 'react';
import {
  ActivityIndicator,
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
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../../contexts/AuthContext';
import LoginBackground from '../../components/auth/LoginBackground';
import {
  AuthFooter,
  AuthHeader,
  EmailIcon,
  EyeIcon,
  LockIcon,
  OrDivider,
  UserIcon,
  authStyles,
} from '../../components/auth/AuthUi';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

function BackIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 6 L9 12 L15 18"
        stroke={colors.primary}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function RegisterScreen({ navigation }: Props) {
  const { register, googleSignIn } = useAuth();
  const insets = useSafeAreaInsets();
  const [role, setRole] = useState<'shopkeeper' | 'customer'>('shopkeeper');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError('Please enter your full name');
      return;
    }
    if (!trimmedEmail) {
      setError('Please enter your email address');
      return;
    }
    if (!password) {
      setError('Please enter a password');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const user = await register({
        role,
        fullName: trimmedName,
        email: trimmedEmail,
        password,
      });
      navigation.replace(user.role === 'shopkeeper' ? 'Shopkeeper' : 'Customer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = async (credential: string) => {
    setError('');
    setLoading(true);
    try {
      const user = await googleSignIn({ credential, mode: 'register', role });
      navigation.replace(user.role === 'shopkeeper' ? 'Shopkeeper' : 'Customer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-up failed');
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
          <Pressable
            onPress={() => navigation.goBack()}
            style={authStyles.backBtn}
            accessibilityLabel="Go back to login"
          >
            <BackIcon />
          </Pressable>

          <AuthHeader />

          <View style={authStyles.card}>
            <Text style={authStyles.cardTitle}>Create Account!</Text>
            <Text style={authStyles.cardSubtitle}>Register to start managing your credit</Text>
            <Text style={styles.roleHint}>
              One email can only be used for one account type — shopkeeper or customer, not both.
            </Text>

            {error ? <Text style={authStyles.error}>{error}</Text> : null}

            <Text style={authStyles.label}>I am a</Text>
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

            <Text style={authStyles.label}>Full Name</Text>
            <View style={authStyles.inputRow}>
              <UserIcon />
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textMuted}
                style={authStyles.input}
                autoCapitalize="words"
                textContentType="name"
                autoComplete="name"
              />
            </View>

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
                placeholder="Create a password"
                placeholderTextColor={colors.textMuted}
                style={authStyles.input}
                secureTextEntry={!showPassword}
                textContentType="newPassword"
                autoComplete="password-new"
              />
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={8}
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              >
                <EyeIcon visible={showPassword} />
              </Pressable>
            </View>

            <Pressable
              onPress={handleRegister}
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
                  <Text style={authStyles.primaryBtnText}>Register</Text>
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
              <Text style={authStyles.altText}>Already have an account? </Text>
              <Pressable onPress={() => navigation.goBack()}>
                <Text style={authStyles.altLink}>Login Now</Text>
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
  roleHint: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 14,
    marginTop: -4,
  },
  roleRow: {
    flexDirection: 'row' as const,
    gap: 10,
    marginBottom: 16,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center' as const,
    backgroundColor: '#FAFAFA',
  },
  roleBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleText: {
    fontWeight: '600' as const,
    fontSize: 14,
    color: colors.primaryDark,
  },
  roleTextActive: {
    color: '#FFFFFF',
  },
};
