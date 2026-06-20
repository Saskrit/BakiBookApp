import { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { updateProfile } from '../../api/auth';
import ProfileImagePicker from '../../components/ProfileImagePicker';
import EmailVerificationBanner from '../../components/EmailVerificationBanner';
import { useAuth } from '../../contexts/AuthContext';
import { Button, ErrorText, Input } from '../../components/ui';
import { colors } from '../../theme/colors';
import { typography as t } from '../../theme/typography';
import { getInitials } from '../../utils/format';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ShopProfile'>;

function statusLabel(status?: string, verified?: boolean) {
  if (status === 'verified' || verified) return { text: 'Verified', color: colors.primary, bg: '#DCFCE7' };
  if (status === 'pending') return { text: 'Pending review', color: colors.warning, bg: '#FEF3C7' };
  if (status === 'rejected') return { text: 'Needs update', color: colors.danger, bg: '#FEE2E2' };
  return { text: 'Not set up', color: colors.textMuted, bg: '#F3F4F6' };
}

export default function ShopProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(!user?.shopName?.trim());
  const [shopName, setShopName] = useState(user?.shopName || '');
  const [shopLocation, setShopLocation] = useState(user?.shopLocation || '');
  const [shopImage, setShopImage] = useState(user?.shopImage || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const badge = statusLabel(user?.shopVerificationStatus, user?.isShopVerified);
  const hasShop = Boolean(user?.shopName?.trim());

  useEffect(() => {
    setShopName(user?.shopName || '');
    setShopLocation(user?.shopLocation || '');
    setShopImage(user?.shopImage || '');
    setProfileImage(user?.profileImage || '');
    setFullName(user?.fullName || '');
  }, [user]);

  const resetForm = () => {
    setShopName(user?.shopName || '');
    setShopLocation(user?.shopLocation || '');
    setShopImage(user?.shopImage || '');
    setProfileImage(user?.profileImage || '');
    setFullName(user?.fullName || '');
    setError('');
    setMessage('');
  };

  const handleSave = async () => {
    if (!shopName.trim()) {
      setError('Shop name is required');
      return;
    }
    if (!shopLocation.trim()) {
      setError('Shop location is required');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    try {
      const data = await updateProfile({
        fullName: fullName.trim(),
        shopName: shopName.trim(),
        shopLocation: shopLocation.trim(),
        ...(profileImage.trim() ? { profileImage: profileImage.trim() } : {}),
        ...(shopImage.trim() ? { shopImage: shopImage.trim() } : {}),
      });
      await refreshUser();
      setMessage(data.message || 'Profile saved');
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  const displayShopImage = editing ? shopImage : user?.shopImage;
  const displayProfileImage = editing ? profileImage : user?.profileImage;

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[colors.primaryDark, colors.primary]}
          style={[styles.hero, { paddingTop: insets.top + 12 }]}
        >
          <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={8}>
            <Text style={styles.backBtnText}>‹ Back</Text>
          </Pressable>

          <View style={styles.heroImages}>
            <View style={styles.shopImageWrap}>
              {displayShopImage ? (
                <Image source={{ uri: displayShopImage }} style={styles.shopHeroImage} />
              ) : (
                <View style={styles.shopHeroPlaceholder}>
                  <Text style={styles.shopHeroInitial}>
                    {getInitials(shopName || user?.shopName || 'Shop')}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.profileImageWrap}>
              {displayProfileImage ? (
                <Image source={{ uri: displayProfileImage }} style={styles.profileHeroImage} />
              ) : (
                <View style={styles.profileHeroPlaceholder}>
                  <Text style={styles.profileHeroInitial}>
                    {getInitials(fullName || user?.fullName || 'U')}
                  </Text>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.heroTitle}>{hasShop ? user?.shopName : 'Set up your shop'}</Text>
          {user?.shopLocation ? (
            <View style={styles.locationRow}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 21 C12 21 19 14.5 19 10 C19 6.13 15.87 3 12 3 C8.13 3 5 6.13 5 10 C5 14.5 12 21 12 21 Z"
                  stroke="rgba(255,255,255,0.9)"
                  strokeWidth={2}
                />
                <Path d="M12 12 C13.1 12 14 11.1 14 10 C14 8.9 13.1 8 12 8 C10.9 8 10 8.9 10 10 C10 11.1 10.9 12 12 12 Z" fill="rgba(255,255,255,0.9)" />
              </Svg>
              <Text style={styles.heroLocation}>{user.shopLocation}</Text>
            </View>
          ) : null}
          <Text style={styles.heroOwner}>{user?.fullName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.statusBadgeText, { color: badge.color }]}>{badge.text}</Text>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <EmailVerificationBanner user={user} />
          {message ? <Text style={styles.success}>{message}</Text> : null}
          {error ? <ErrorText message={error} /> : null}

          {editing ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{hasShop ? 'Edit profile' : 'Set up shop'}</Text>
              <Text style={styles.cardSub}>Update your photo and shop details.</Text>

              <View style={styles.pickerRow}>
                <ProfileImagePicker
                  label="Your photo"
                  value={profileImage}
                  onChange={setProfileImage}
                  onError={setError}
                  uploadType="profile"
                  fallbackName={fullName}
                  shape="circle"
                  size={72}
                />
                <ProfileImagePicker
                  label="Shop photo"
                  value={shopImage}
                  onChange={setShopImage}
                  onError={setError}
                  uploadType="shop"
                  fallbackName={shopName}
                  shape="rounded"
                  size={72}
                />
              </View>

              <Input label="Your name" value={fullName} onChangeText={setFullName} />
              <Input label="Shop name *" value={shopName} onChangeText={setShopName} />
              <Input
                label="Shop location *"
                value={shopLocation}
                onChangeText={setShopLocation}
                placeholder="e.g. Kathmandu, Nepal"
              />

              <View style={styles.actions}>
                {hasShop ? (
                  <Button
                    title="Cancel"
                    variant="outline"
                    onPress={() => {
                      resetForm();
                      setEditing(false);
                    }}
                  />
                ) : null}
                <Button title="Save profile" onPress={handleSave} loading={loading} />
              </View>
            </View>
          ) : (
            <>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Shop details</Text>
                <InfoRow icon="shop" label="Shop name" value={user?.shopName || '—'} />
                <InfoRow icon="pin" label="Location" value={user?.shopLocation || '—'} />
                <InfoRow icon="user" label="Owner" value={user?.fullName || '—'} />
                <InfoRow icon="mail" label="Email" value={user?.email || '—'} last />
              </View>

              <Button title="Edit profile & photos" onPress={() => setEditing(true)} />
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
  last,
}: {
  icon: 'shop' | 'pin' | 'user' | 'mail';
  label: string;
  value: string;
  last?: boolean;
}) {
  const iconColor = colors.primary;
  return (
    <View style={[styles.infoRow, !last && styles.infoRowBorder]}>
      <View style={styles.infoIcon}>
        {icon === 'shop' ? (
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M4 10 L12 4 L20 10 V19 C20 19.55 19.55 20 19 20 H5 C4.45 20 4 19.55 4 19 Z" stroke={iconColor} strokeWidth={2} />
          </Svg>
        ) : icon === 'pin' ? (
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M12 21 C12 21 19 14.5 19 10 C19 6.13 15.87 3 12 3 C8.13 3 5 6.13 5 10 C5 14.5 12 21 12 21 Z" stroke={iconColor} strokeWidth={2} />
          </Svg>
        ) : icon === 'user' ? (
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M12 12 C14.21 12 16 10.21 16 8 C16 5.79 14.21 4 12 4 C9.79 4 8 5.79 8 8 C8 10.21 9.79 12 12 12 Z" stroke={iconColor} strokeWidth={2} />
            <Path d="M4 20 C4 16.5 7.5 14 12 14 C16.5 14 20 16.5 20 20" stroke={iconColor} strokeWidth={2} />
          </Svg>
        ) : (
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Path d="M4 6 H20 V18 H4 Z" stroke={iconColor} strokeWidth={2} />
            <Path d="M4 7 L12 13 L20 7" stroke={iconColor} strokeWidth={2} />
          </Svg>
        )}
      </View>
      <View style={styles.infoBody}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F5F7' },
  scroll: { flex: 1 },
  hero: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backBtn: { alignSelf: 'flex-start', marginBottom: 8 },
  backBtnText: { color: 'rgba(255,255,255,0.95)', fontSize: t.bodyLg, fontWeight: '600' },
  heroImages: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 14,
  },
  shopImageWrap: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  shopHeroImage: { width: 88, height: 88, borderRadius: 18, borderWidth: 3, borderColor: '#FFFFFF' },
  shopHeroPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shopHeroInitial: { color: '#FFF', fontWeight: '800', fontSize: t.xxl },
  profileImageWrap: { marginBottom: -8 },
  profileHeroImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileHeroPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryDark,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHeroInitial: { color: '#FFF', fontWeight: '800', fontSize: t.lg },
  heroTitle: {
    fontSize: t.h2,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  heroLocation: { fontSize: t.body, color: 'rgba(255,255,255,0.9)' },
  heroOwner: { fontSize: t.bodyLg, color: 'rgba(255,255,255,0.85)', fontWeight: '600', marginBottom: 10 },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusBadgeText: { fontSize: t.caption, fontWeight: '700' },
  body: { padding: 16, marginTop: -8 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ECEEF2',
  },
  cardTitle: { fontSize: t.lg, fontWeight: '800', color: colors.text, marginBottom: 4 },
  cardSub: { fontSize: t.body, color: colors.textMuted, marginBottom: 16 },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F7EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBody: { flex: 1 },
  infoLabel: { fontSize: t.caption, color: colors.textMuted, marginBottom: 2 },
  infoValue: { fontSize: t.bodyLg, fontWeight: '600', color: colors.text },
  success: { color: colors.primary, marginBottom: 10, fontWeight: '600', fontSize: t.bodyLg },
  actions: { gap: 8, marginTop: 8 },
});
