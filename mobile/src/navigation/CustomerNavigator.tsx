import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import MyDueScreen from '../screens/customer/MyDueScreen';
import LedgerScreen from '../screens/customer/LedgerScreen';
import PaymentsScreen from '../screens/customer/PaymentsScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import { colors } from '../theme/colors';
import type { CustomerTabParamList } from './types';

const Tab = createBottomTabNavigator<CustomerTabParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    MyDue: '₨',
    Ledger: '☰',
    Payments: '✓',
    Profile: '👤',
  };
  return (
    <Text style={{ fontSize: 18, color: focused ? colors.primary : colors.textMuted }}>
      {icons[label] || '•'}
    </Text>
  );
}

export default function CustomerNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.background },
        headerTitleStyle: { color: colors.primaryDark, fontWeight: '700' },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
      })}
    >
      <Tab.Screen name="MyDue" component={MyDueScreen} options={{ title: 'My Due' }} />
      <Tab.Screen name="Ledger" component={LedgerScreen} />
      <Tab.Screen name="Payments" component={PaymentsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
