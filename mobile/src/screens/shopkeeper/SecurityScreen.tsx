import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import {
  changePassword,
  forgotPassword,
  resendVerificationEmail,
} from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';
import { appAlert } from '../../contexts/DialogContext';
import { Button, ErrorText } from '../../components/ui';
import { colors } from '../../theme/colors';
import { typography as t } from '../../theme/typography';
import type { RootStackParamList } from '../../navigation/types';

function SecureField({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.secureRow}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={!visible}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.secureInput}
        />
        <Pressable onPress={() => setVisible((v) => !v)} hitSlop={8} style={styles.eyeBtn}>
          <Text style={styles.eyeText}>{visible ? 'Hide' : 'Show'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function StatusRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'ok' | 'warn' | 'muted';
}) {
  const valueColor =
    tone === 'ok' ? colors.primary : tone === 'warn' ? colors.warning : colors.textMuted;
  return (
    <View style={styles.statusRow}>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={[styles.statusValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

export default function SecurityScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { user, logout, refreshUser } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [resendingVerify, setResendingVerify] = useState(false);

  const isGoogleOnly = user?.authProvider === 'google';

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');

    if (!currentPassword.trim()) {
      setError('Enter your current password');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(res.message || 'Password changed successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleForgotPassword = () => {
    if (!user?.email) return;
    appAlert(
      'Send reset email',
      `Send a password reset link to ${user.email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            setSendingReset(true);
            setError('');
            try {
              const res = await forgotPassword(user.email);
              appAlert('Email sent', res.message);
            } catch (err) {
              appAlert('Error', err instanceof Error ? err.message : 'Failed to send email');
            } finally {
              setSendingReset(false);
            }
          },
        },
      ]
    );
  };

  const handleResendVerification = async () => {
    setResendingVerify(true);
    setError('');
    try {
      const res = await resendVerificationEmail();
      appAlert('Verification email', res.message);
      await refreshUser();
    } catch (err) {
      appAlert('Error', err instanceof Error ? err.message : 'Failed to resend email');
    } finally {
      setResendingVerify(false);
    }
  };

  const handleSignOut = () => {
    appAlert('Sign out', 'Sign out of BakiBook on this device?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[colors.primaryDark, colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Security</Text>
        <Text style={styles.headerSubtitle}>Password, email and account access</Text>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Account</Text>
            <StatusRow label="Email" value={user?.email || '—'} />
            <StatusRow
              label="Email verified"
              value={user?.isEmailVerified ? 'Verified' : 'Not verified'}
              tone={user?.isEmailVerified ? 'ok' : 'warn'}
            />
            <StatusRow
              label="Sign-in method"
              value={isGoogleOnly ? 'Google' : 'Email & password'}
              tone="muted"
            />
            {!user?.isEmailVerified ? (
              <Button
                title={resendingVerify ? 'Sending…' : 'Resend verification email'}
                variant="outline"
                onPress={handleResendVerification}
                loading={resendingVerify}
              />
            ) : null}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Change password</Text>
            {isGoogleOnly ? (
              <Text style={styles.hint}>
                This account uses Google sign-in. Use “Send reset email” below to set a password,
                or change it from your Google account settings.
              </Text>
            ) : (
              <>
                {error ? <ErrorText message={error} /> : null}
                {success ? <Text style={styles.success}>{success}</Text> : null}
                <SecureField
                  label="Current password"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                />
                <SecureField
                  label="New password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="At least 6 characters"
                />
                <SecureField
                  label="Confirm new password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Re-enter new password"
                />
                <Button
                  title={saving ? 'Updating…' : 'Update password'}
                  onPress={handleChangePassword}
                  loading={saving}
                />
              </>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Password reset</Text>
            <Text style={styles.hint}>
              Forgot your password? We will email you a secure link to reset it.
            </Text>
            <Button
              title={sendingReset ? 'Sending…' : 'Send reset email'}
              variant="outline"
              onPress={handleForgotPassword}
              loading={sendingReset}
            />
          </View>

          <View style={styles.card}>
            <View style={styles.tipRow}>
              <View style={styles.tipIcon}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 3 L20 7 V12 C20 17 16.5 20.5 12 21 C7.5 20.5 4 17 4 12 V7 Z"
                    stroke={colors.primary}
                    strokeWidth={2}
                  />
                </Svg>
              </View>
              <Text style={styles.tipText}>
                Use a strong password you do not share. Sign out if you use a shared device.
              </Text>
            </View>
            <Button title="Sign out of this device" variant="danger" onPress={handleSignOut} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F5F7' },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 18,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  back: { color: 'rgba(255,255,255,0.95)', fontSize: t.bodyLg, fontWeight: '600', marginBottom: 6 },
  headerTitle: { color: '#FFF', fontSize: t.h1, fontWeight: '800' },
  headerSubtitle: { color: 'rgba(255,255,255,0.88)', fontSize: t.body, marginTop: 4 },
  content: { padding: 16, paddingTop: 14, gap: 12 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    gap: 10,
  },
  cardTitle: { fontSize: t.md, fontWeight: '800', color: colors.text, marginBottom: 4 },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  statusLabel: { fontSize: t.body, color: colors.textMuted, fontWeight: '600' },
  statusValue: { fontSize: t.body, fontWeight: '700', flex: 1, textAlign: 'right', marginLeft: 12 },
  fieldWrap: { marginTop: 4 },
  fieldLabel: { fontSize: t.body, fontWeight: '600', color: colors.text, marginBottom: 6 },
  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  secureInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: t.md,
    color: colors.text,
  },
  eyeBtn: { paddingLeft: 8, paddingVertical: 8 },
  eyeText: { fontSize: t.caption, fontWeight: '700', color: colors.primary },
  hint: { fontSize: t.body, color: colors.textMuted, lineHeight: 18 },
  success: { fontSize: t.body, color: colors.primary, fontWeight: '600' },
  tipRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 4 },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: { flex: 1, fontSize: t.body, color: colors.textMuted, lineHeight: 18 },
});
