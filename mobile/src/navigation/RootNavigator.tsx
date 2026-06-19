import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ShopkeeperNavigator from './ShopkeeperNavigator';
import CustomerNavigator from './CustomerNavigator';
import AddCustomerScreen from '../screens/shopkeeper/AddCustomerScreen';
import CustomerProfileScreen from '../screens/shopkeeper/CustomerProfileScreen';
import AddCreditScreen from '../screens/shopkeeper/AddCreditScreen';
import RecordPaymentScreen from '../screens/shopkeeper/RecordPaymentScreen';
import LinkShopsScreen from '../screens/customer/LinkShopsScreen';
import { colors } from '../theme/colors';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function getInitialRoute(loading: boolean, user: ReturnType<typeof useAuth>['user']) {
  if (loading) return 'Splash';
  if (!user) return 'Login';
  return user.role === 'shopkeeper' ? 'Shopkeeper' : 'Customer';
}

export default function RootNavigator() {
  const { user, loading } = useAuth();
  const navKey = loading ? 'boot' : user ? `${user.id}-${user.role}` : 'guest';

  return (
    <NavigationContainer key={navKey}>
      <Stack.Navigator
        initialRouteName={getInitialRoute(loading, user)}
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primaryDark,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register' }} />
        <Stack.Screen
          name="Shopkeeper"
          component={ShopkeeperNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Customer"
          component={CustomerNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="AddCustomer" component={AddCustomerScreen} options={{ title: 'Add Customer' }} />
        <Stack.Screen
          name="CustomerProfile"
          component={CustomerProfileScreen}
          options={{ title: 'Customer Profile' }}
        />
        <Stack.Screen name="AddCredit" component={AddCreditScreen} options={{ title: 'Add Credit' }} />
        <Stack.Screen
          name="RecordPayment"
          component={RecordPaymentScreen}
          options={{ title: 'Record Payment' }}
        />
        <Stack.Screen name="LinkShops" component={LinkShopsScreen} options={{ title: 'Link Shops' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
