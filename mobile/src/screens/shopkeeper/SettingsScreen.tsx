import type { ReactNode } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useAuth } from '../../contexts/AuthContext';
import EmailVerificationBanner from '../../components/EmailVerificationBanner';
import { colors } from '../../theme/colors';
import { typography as t } from '../../theme/typography';
import { getInitials } from '../../utils/format';
import type { RootStackParamList, ShopkeeperTabParamList } from '../../navigation/types';

type SettingsNav = CompositeNavigationProp<
  BottomTabNavigationProp<ShopkeeperTabParamList, 'Settings'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type MenuItem = {
  label: string;
  subtitle?: string;
  color: string;
  icon: ReactNode;
  onPress: () => void;
  danger?: boolean;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

function comingSoon(label: string) {
  Alert.alert('Coming soon', `${label} will be available in a future update.`);
}

function RowIcon({ children, bg }: { children: ReactNode; bg: string }) {
  return <View style={[styles.rowIcon, { backgroundColor: bg }]}>{children}</View>;
}

function MenuRow({ item }: { item: MenuItem }) {
  return (
    <Pressable
      onPress={item.onPress}
      style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
    >
      <RowIcon bg={`${item.color}14`}>{item.icon}</RowIcon>
      <View style={styles.menuRowBody}>
        <Text style={[styles.menuRowLabel, item.danger && styles.menuRowDanger]}>{item.label}</Text>
        {item.subtitle ? <Text style={styles.menuRowSub}>{item.subtitle}</Text> : null}
      </View>
      <Text style={styles.menuRowChevron}>›</Text>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const navigation = useNavigation<SettingsNav>();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const openShopProfile = () => navigation.getParent()?.navigate('ShopProfile');

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  const sections: MenuSection[] = [
    {
      title: 'Business',
      items: [
        {
          label: 'Reports & analytics',
          subtitle: 'Sales, credit and collections',
          color: colors.primary,
          icon: (
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M6 19 V11 M12 19 V5 M18 19 V14" stroke={colors.primary} strokeWidth={2} strokeLinecap="round" />
            </Svg>
          ),
          onPress: () => navigation.navigate('Reports'),
        },
        {
          label: 'Products',
          subtitle: 'Catalog & inventory',
          color: '#EA580C',
          icon: (
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Rect x={4} y={6} width={16} height={14} rx={2} stroke="#EA580C" strokeWidth={2} />
            </Svg>
          ),
          onPress: () => navigation.getParent()?.navigate('Products'),
        },
        {
          label: 'Expenses',
          color: '#2563EB',
          icon: (
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Rect x={5} y={4} width={14} height={16} rx={2} stroke="#2563EB" strokeWidth={2} />
              <Path d="M9 10 H15 M9 14 H13" stroke="#2563EB" strokeWidth={2} />
            </Svg>
          ),
          onPress: () => navigation.getParent()?.navigate('Expenses'),
        },
      ],
    },
    {
      title: 'Customers & credit',
      items: [
        {
          label: 'Customers',
          subtitle: 'Manage your customer list',
          color: colors.primary,
          icon: (
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Circle cx={12} cy={8} r={3} stroke={colors.primary} strokeWidth={2} />
              <Path d="M5 20 C5 16 8 14 12 14 C16 14 19 16 19 20" stroke={colors.primary} strokeWidth={2} />
            </Svg>
          ),
          onPress: () => navigation.navigate('Customers'),
        },
        {
          label: 'Add credit',
          color: '#EA580C',
          icon: (
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Circle cx={12} cy={12} r={8} stroke="#EA580C" strokeWidth={2} />
              <Path d="M12 8 V16 M8 12 H16" stroke="#EA580C" strokeWidth={2} />
            </Svg>
          ),
          onPress: () => navigation.getParent()?.navigate('AddCredit'),
        },
        {
          label: 'Scan QR',
          color: '#DB2777',
          icon: (
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Rect x={4} y={4} width={7} height={7} stroke="#DB2777" strokeWidth={2} />
              <Rect x={13} y={13} width={7} height={7} stroke="#DB2777" strokeWidth={2} />
            </Svg>
          ),
          onPress: () => navigation.navigate('Scan'),
        },
        {
          label: 'Due reminders',
          color: '#2563EB',
          icon: (
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Rect x={4} y={5} width={16} height={15} rx={2} stroke="#2563EB" strokeWidth={2} />
              <Path d="M4 10 H20" stroke="#2563EB" strokeWidth={2} />
            </Svg>
          ),
          onPress: () => comingSoon('Due Reminder Settings'),
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          label: 'Shop profile',
          subtitle: 'Name, location, photos',
          color: '#2563EB',
          icon: (
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M4 10 L12 4 L20 10 V19 C20 19.55 19.55 20 19 20 H5 C4.45 20 4 19.55 4 19 Z" stroke="#2563EB" strokeWidth={2} />
            </Svg>
          ),
          onPress: openShopProfile,
        },
        {
          label: 'Notifications',
          color: '#7C3AED',
          icon: (
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M12 4 C8 4 5 7 5 10 C5 16 3 17 3 17 H21 C21 17 19 16 19 10 C19 7 16 4 12 4 Z" stroke="#7C3AED" strokeWidth={2} />
            </Svg>
          ),
          onPress: () => comingSoon('Notifications'),
        },
        {
          label: 'Security',
          color: '#7C3AED',
          icon: (
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M12 3 L20 7 V12 C20 17 16.5 20.5 12 21 C7.5 20.5 4 17 4 12 V7 Z" stroke="#7C3AED" strokeWidth={2} />
            </Svg>
          ),
          onPress: () => navigation.getParent()?.navigate('Security'),
        },
        {
          label: 'Help & support',
          color: '#6B7280',
          icon: (
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Circle cx={12} cy={12} r={9} stroke="#6B7280" strokeWidth={2} />
              <Path d="M10 10 C10 8 14 8 14 10 C14 12 12 12 12 14" stroke="#6B7280" strokeWidth={2} />
            </Svg>
          ),
          onPress: () => navigation.getParent()?.navigate('HelpSupport'),
        },
      ],
    },
    {
      title: 'Other',
      items: [
        {
          label: 'Backup & restore',
          color: '#2563EB',
          icon: (
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M7 18 H17 C19 18 21 16 21 14 C21 11 18 9 15 9 C14 5 11 3 7 3 C4 3 2 5 2 8 C2 11 4 13 7 13" stroke="#2563EB" strokeWidth={2} />
            </Svg>
          ),
          onPress: () => comingSoon('Backup & Restore'),
        },
        {
          label: 'Sign out',
          color: colors.danger,
          danger: true,
          icon: (
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M10 5 H5 V19 H10 M15 12 H8 M18 8 L21 12 L18 16" stroke={colors.danger} strokeWidth={2} strokeLinecap="round" />
            </Svg>
          ),
          onPress: handleLogout,
        },
      ],
    },
  ];

  const shopName = user?.shopName?.trim() || 'Your Shop';
  const profileUri = user?.profileImage;
  const shopUri = user?.shopImage;
  const verified = user?.isShopVerified || user?.shopVerificationStatus === 'verified';

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[colors.primaryDark, colors.primary]}
        style={[styles.hero, { paddingTop: insets.top + 16 }]}
      >
        <Text style={styles.heroTitle}>Profile</Text>

        <Pressable style={styles.profileCard} onPress={openShopProfile}>
          <View style={styles.avatarWrap}>
            {profileUri ? (
              <Image source={{ uri: profileUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{getInitials(user?.fullName || shopName)}</Text>
              </View>
            )}
            {shopUri ? (
              <Image source={{ uri: shopUri }} style={styles.shopBadge} />
            ) : (
              <View style={styles.shopBadgePlaceholder}>
                <Text style={styles.shopBadgeText}>{getInitials(shopName).slice(0, 1)}</Text>
              </View>
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName} numberOfLines={1}>
              {user?.fullName || 'Shopkeeper'}
            </Text>
            <Text style={styles.profileShop} numberOfLines={1}>
              {shopName}
            </Text>
            <Text style={styles.profileEmail} numberOfLines={1}>
              {user?.email}
            </Text>
            <View style={styles.badgeRow}>
              <View style={[styles.badge, verified ? styles.badgeVerified : styles.badgePending]}>
                <Text style={[styles.badgeText, verified ? styles.badgeTextVerified : styles.badgeTextPending]}>
                  {verified ? 'Verified shop' : 'Shop profile'}
                </Text>
              </View>
              {user?.authProvider !== 'google' ? (
                <View
                  style={[
                    styles.badge,
                    user?.isEmailVerified ? styles.badgeVerified : styles.badgeEmailPending,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      user?.isEmailVerified ? styles.badgeTextVerified : styles.badgeTextEmailPending,
                    ]}
                  >
                    {user?.isEmailVerified ? 'Email verified' : 'Email not verified'}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <Text style={styles.editHint}>Edit ›</Text>
        </Pressable>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <EmailVerificationBanner compact />
        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, index) => (
                <View key={item.label}>
                  <MenuRow item={item} />
                  {index < section.items.length - 1 ? <View style={styles.divider} /> : null}
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.securityBanner}>
          <View style={styles.securityIcon}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Path
                d="M12 3 L20 7 V12 C20 17 16.5 20.5 12 21 C7.5 20.5 4 17 4 12 V7 Z"
                stroke={colors.primary}
                strokeWidth={2}
              />
              <Path d="M9 12 L11 14 L15 10" stroke={colors.primary} strokeWidth={2} />
            </Svg>
          </View>
          <Text style={styles.securityText}>
            Your shop data is encrypted and backed up regularly.
          </Text>
        </View>

        <Text style={styles.version}>BakiBook v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F5F7' },
  hero: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: t.h1,
    fontWeight: '800',
    marginBottom: 14,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarWrap: { position: 'relative' },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFF', fontWeight: '800', fontSize: t.lg },
  shopBadge: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  shopBadgePlaceholder: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: colors.primaryDark,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopBadgeText: { color: '#FFF', fontSize: t.xs, fontWeight: '800' },
  profileInfo: { flex: 1, minWidth: 0 },
  profileName: { fontSize: t.lg, fontWeight: '800', color: colors.text },
  profileShop: { fontSize: t.body, color: colors.primary, fontWeight: '600', marginTop: 2 },
  profileEmail: { fontSize: t.caption, color: colors.textMuted, marginTop: 3 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeVerified: { backgroundColor: '#DCFCE7' },
  badgePending: { backgroundColor: '#F3F4F6' },
  badgeEmailPending: { backgroundColor: '#FEF3C7' },
  badgeText: { fontSize: t.sm, fontWeight: '700' },
  badgeTextVerified: { color: colors.primary },
  badgeTextPending: { color: colors.textMuted },
  badgeTextEmailPending: { color: colors.warning },
  editHint: { fontSize: t.bodyLg, fontWeight: '700', color: colors.primary },
  scroll: { flex: 1, marginTop: -4 },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: t.caption,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ECEEF2',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  menuRowPressed: { backgroundColor: '#F9FAFB' },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuRowBody: { flex: 1 },
  menuRowLabel: { fontSize: t.bodyLg, fontWeight: '600', color: colors.text },
  menuRowSub: { fontSize: t.caption, color: colors.textMuted, marginTop: 2 },
  menuRowDanger: { color: colors.danger },
  menuRowChevron: { fontSize: t.xxl, color: '#C4C9D4', fontWeight: '300' },
  divider: { height: 1, backgroundColor: '#F0F2F5', marginLeft: 66 },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    padding: 12,
    gap: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  securityIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityText: {
    flex: 1,
    fontSize: t.body,
    color: colors.text,
    lineHeight: 17,
  },
  version: {
    textAlign: 'center',
    fontSize: t.caption,
    color: colors.textMuted,
    marginTop: 16,
  },
});
