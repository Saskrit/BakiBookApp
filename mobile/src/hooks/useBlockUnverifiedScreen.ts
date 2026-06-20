import { useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { appAlert } from '../contexts/DialogContext';
import { needsEmailVerification } from '../utils/authHelpers';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/** Redirects away from protected write screens when email is not verified. */
export function useBlockUnverifiedScreen(screenLabel: string) {
  const { user } = useAuth();
  const navigation = useNavigation<Nav>();

  useFocusEffect(
    useCallback(() => {
      if (!needsEmailVerification(user)) return;

      appAlert(
        'Verify your email first',
        `Please verify ${user?.email || 'your email'} before using ${screenLabel}.`,
        [
          {
            text: 'Go back',
            style: 'cancel',
            onPress: () => {
              if (navigation.canGoBack()) navigation.goBack();
              else navigation.navigate('VerifyEmail');
            },
          },
          { text: 'Verify email', onPress: () => navigation.navigate('VerifyEmail') },
        ],
      );
    }, [navigation, screenLabel, user]),
  );

  return needsEmailVerification(user);
}
