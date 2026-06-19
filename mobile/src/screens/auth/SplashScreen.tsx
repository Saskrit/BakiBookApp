import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../contexts/AuthContext';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      if (!user) {
        navigation.replace('Login');
        return;
      }
      if (user.role === 'shopkeeper') {
        navigation.replace('Shopkeeper');
      } else {
        navigation.replace('Customer');
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [loading, user, navigation]);

  return (
    <LinearGradient colors={['#4C5C2D', '#6A7E3F']} style={styles.container}>
      <Text style={styles.logo}>BakiBook</Text>
      <Text style={styles.tagline}>Digital Baki, Smart Pasal</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 42,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1,
  },
  tagline: {
    marginTop: 8,
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
});
