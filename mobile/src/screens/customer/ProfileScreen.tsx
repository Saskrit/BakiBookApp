import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import EmailVerificationBanner from '../../components/EmailVerificationBanner';
import { Button, Card, Subtitle, Title } from '../../components/ui';
import { colors } from '../../theme/colors';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const emailVerified = user?.isEmailVerified || user?.authProvider === 'google';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Title>Profile</Title>
      <Subtitle>Your customer account</Subtitle>

      <EmailVerificationBanner user={user} />

      <Card>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{user?.fullName}</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email}</Text>
        <Text style={styles.label}>Email status</Text>
        <View style={[styles.statusBadge, emailVerified ? styles.statusOk : styles.statusWarn]}>
          <Text style={[styles.statusText, emailVerified ? styles.statusTextOk : styles.statusTextWarn]}>
            {emailVerified ? 'Verified' : 'Not verified'}
          </Text>
        </View>
        <Text style={styles.label}>Role</Text>
        <Text style={styles.value}>Customer</Text>
      </Card>

      <Button title="Sign Out" variant="danger" onPress={handleLogout} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  label: { fontSize: 12, color: colors.textMuted, marginTop: 10 },
  value: { fontSize: 16, fontWeight: '600', color: colors.text },
  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusOk: { backgroundColor: '#DCFCE7' },
  statusWarn: { backgroundColor: '#FEF3C7' },
  statusText: { fontSize: 12, fontWeight: '700' },
  statusTextOk: { color: colors.primary },
  statusTextWarn: { color: colors.warning },
});
