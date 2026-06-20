import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import SplashBackground from '../../components/splash/SplashBackground';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const LOGO = require('../../../assets/android-icon-foreground.png');

/** How long the progress bar takes to fill 0 → 100% */
const SPLASH_PROGRESS_MS = 5200;
const SPLASH_HOLD_AT_100_MS = 400;

export default function SplashScreen({ navigation }: Props) {
  const { user, loading } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const progress = useRef(new Animated.Value(0)).current;
  const hasNavigated = useRef(false);
  const [progressDone, setProgressDone] = useState(false);
  const [percentLabel, setPercentLabel] = useState(0);

  useEffect(() => {
    progress.setValue(0);
    setPercentLabel(0);

    const listenerId = progress.addListener(({ value }) => {
      setPercentLabel(Math.min(100, Math.round(value * 100)));
    });

    Animated.timing(progress, {
      toValue: 1,
      duration: SPLASH_PROGRESS_MS,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        setPercentLabel(100);
        setProgressDone(true);
      }
    });

    return () => {
      progress.removeListener(listenerId);
    };
  }, [progress]);

  useEffect(() => {
    if (loading || !progressDone || hasNavigated.current) return;

    const timer = setTimeout(() => {
      if (hasNavigated.current) return;
      hasNavigated.current = true;
      if (!user) {
        navigation.replace('Login');
        return;
      }
      navigation.replace(user.role === 'shopkeeper' ? 'Shopkeeper' : 'Customer');
    }, SPLASH_HOLD_AT_100_MS);

    return () => clearTimeout(timer);
  }, [loading, progressDone, user, navigation]);

  const barFillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const progressBarWidth = Math.min(width - 64, 320);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SplashBackground />

      <View style={[styles.content, { paddingTop: insets.top + 48 }]}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" accessibilityLabel="BakiBook logo" />
        <Text style={styles.brandName}>
          <Text style={styles.brandBaki}>Baki</Text>
          <Text style={styles.brandBook}>Book</Text>
        </Text>

        <View style={styles.separator}>
          <View style={styles.separatorDot} />
          <View style={styles.separatorLine} />
          <View style={[styles.separatorDot, styles.separatorDotCenter]} />
          <View style={styles.separatorLine} />
          <View style={styles.separatorDot} />
        </View>

        <Text style={styles.tagline}>Digital Credit Management Made Simple</Text>
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 28 }]}>
        <Text style={styles.bottomTagline}>Manage Credit. Build Trust. Grow Together.</Text>
        <View style={[styles.progressTrack, { width: progressBarWidth }]}>
          <Animated.View style={[styles.progressFill, { width: barFillWidth }]} />
        </View>
        <Text style={styles.progressPercent}>{percentLabel}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  logo: {
    width: 108,
    height: 108,
    marginBottom: 16,
  },
  brandName: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  brandBaki: {
    color: colors.text,
  },
  brandBook: {
    color: colors.primary,
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 12,
    gap: 0,
  },
  separatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  separatorLine: {
    width: 32,
    height: 2,
    backgroundColor: colors.primary,
  },
  separatorDotCenter: {
    marginHorizontal: 4,
  },
  tagline: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  bottom: {
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 1,
  },
  bottomTagline: {
    fontSize: 13,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.35)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  progressPercent: {
    marginTop: 8,
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
});
