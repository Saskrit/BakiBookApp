import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import DashboardScreen from '../screens/shopkeeper/DashboardScreen';
import CustomersScreen from '../screens/shopkeeper/CustomersScreen';
import QRScannerScreen from '../screens/shopkeeper/QRScannerScreen';
import ReportsScreen from '../screens/shopkeeper/ReportsScreen';
import SettingsScreen from '../screens/shopkeeper/SettingsScreen';
import { colors } from '../theme/colors';
import type { ShopkeeperTabParamList } from './types';

const Tab = createBottomTabNavigator<ShopkeeperTabParamList>();

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Dashboard: '⌂',
    Customers: '👥',
    Scan: '▣',
    Reports: '▤',
    Settings: '⚙',
  };
  return (
    <Text style={{ fontSize: 18, color: focused ? colors.primary : colors.textMuted }}>
      {icons[label] || '•'}
    </Text>
  );
}

export default function ShopkeeperNavigator() {
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
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Customers" component={CustomersScreen} />
      <Tab.Screen name="Scan" component={QRScannerScreen} options={{ title: 'Scan QR' }} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
