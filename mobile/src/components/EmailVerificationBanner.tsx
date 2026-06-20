import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { resendVerificationEmail } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import type { User } from '../types';

type Props = {
  user?: User | null;
  compact?: boolean;
};

export default function EmailVerificationBanner({ user: userProp, compact }: Props) {
  const { user: authUser, refreshUser } = useAuth();
  const user = userProp ?? authUser;
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!user || user.isEmailVerified || user.authProvider === 'google') {
    return null;
  }

  const handleResend = async () => {
    setSending(true);
    try {
      const data = await resendVerificationEmail();
      setSent(true);
      Alert.alert('Verification email sent', data.message || 'Check your inbox for the verification link.');
      await refreshUser();
    } catch (err) {
      Alert.alert(
        'Could not send email',
        err instanceof Error ? err.message : 'Please try again in a few minutes.',
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={[styles.banner, compact && styles.bannerCompact]}>
      <View style={styles.iconWrap}>
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 3 L20 7 V12 C20 17 16.5 20.5 12 21 C7.5 20.5 4 17 4 12 V7 Z"
            stroke={colors.warning}
            strokeWidth={2}
          />
          <Path d="M12 8 V13 M12 16 H12.01" stroke={colors.warning} strokeWidth={2} strokeLinecap="round" />
        </Svg>
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.text}>
          We sent a link to <Text style={styles.email}>{user.email}</Text>. Open it on your phone or
          computer, then return here.
        </Text>
        <Pressable
          onPress={handleResend}
          disabled={sending}
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
        >
          <Text style={styles.btnText}>
            {sending ? 'Sending…' : sent ? 'Resend again' : 'Resend verification email'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  bannerCompact: {
    marginBottom: 12,
  },
  iconWrap: {
    marginTop: 2,
  },
  body: {
    flex: 1,
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  text: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },
  email: {
    fontWeight: '600',
    color: colors.text,
  },
  btn: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingVertical: 6,
    paddingHorizontal: 2,
  },
  btnPressed: {
    opacity: 0.7,
  },
  btnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
});
