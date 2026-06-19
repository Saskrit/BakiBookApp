import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { fetchCustomerByQr } from '../../api/customers';
import { Button, Card } from '../../components/ui';
import { colors } from '../../theme/colors';
import type { RootStackParamList, ShopkeeperTabParamList } from '../../navigation/types';

type ScanNav = CompositeNavigationProp<
  BottomTabNavigationProp<ShopkeeperTabParamList, 'Scan'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export default function QRScannerScreen() {
  const navigation = useNavigation<ScanNav>();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleScan = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    setError('');
    try {
      const qrCode = data.includes('/') ? data.split('/').pop() || data : data;
      const result = await fetchCustomerByQr(qrCode);
      navigation.navigate('CustomerProfile', { customerId: result.customer.id });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Customer not found');
      setScanned(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Card>
          <Text style={styles.help}>Camera access is required to scan customer QR codes.</Text>
          <Button title="Allow Camera" onPress={requestPermission} />
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleScan}
      />
      <View style={styles.overlay}>
        <Text style={styles.instruction}>Scan Customer QR</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {scanned ? (
          <Button title="Scan Again" onPress={() => setScanned(false)} variant="outline" />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: {
    position: 'absolute',
    bottom: 40,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 16,
  },
  instruction: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  error: { color: colors.danger, textAlign: 'center', marginBottom: 8 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: colors.background,
  },
  help: { marginBottom: 12, color: colors.text, textAlign: 'center' },
});
