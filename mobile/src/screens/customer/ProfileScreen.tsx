import { Alert, ScrollView, StyleSheet, Text } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Title>Profile</Title>
      <Subtitle>Your customer account</Subtitle>

      <Card>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{user?.fullName}</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email}</Text>
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
});
