import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import {
  configureGoogleSignIn,
  getGoogleIdToken,
  getGoogleSignInErrorMessage,
  isGoogleSignInConfigured,
} from '../../utils/googleSignIn';
import { colors } from '../../theme/colors';

type Props = {
  disabled?: boolean;
  onCredential: (credential: string) => void | Promise<void>;
  onError?: (message: string) => void;
};

export default function GoogleSignInButton({ disabled, onCredential, onError }: Props) {
  const [loading, setLoading] = useState(false);
  const available = isGoogleSignInConfigured();

  useEffect(() => {
    if (available) configureGoogleSignIn();
  }, [available]);

  const handlePress = useCallback(async () => {
    if (disabled || loading) return;
    setLoading(true);
    try {
      const credential = await getGoogleIdToken();
      await onCredential(credential);
    } catch (err) {
      onError?.(getGoogleSignInErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [disabled, loading, onCredential, onError]);

  if (!available) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>Signing in with Google…</Text>
        </View>
      ) : (
        <GoogleSigninButton
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Light}
          onPress={handlePress}
          disabled={disabled}
          style={styles.btn}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 4,
  },
  btn: {
    width: '100%',
    height: 48,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
