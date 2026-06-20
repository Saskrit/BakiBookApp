import { useEffect, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { fetchLegalDocuments } from '../../api/legal';
import { colors } from '../../theme/colors';
import { typography as t } from '../../theme/typography';
import type { RootStackParamList } from '../../navigation/types';

const SUPPORT_EMAIL = 'support@bakibook.com';

const FAQS = [
  {
    q: 'How do I add credit for a customer?',
    a: 'Tap the + tab at the bottom, choose a customer (or create a new one), enter product name, quantity and price, then Save credit. Use + to add multiple products in one credit.',
  },
  {
    q: 'How do I record a payment?',
    a: 'Open a customer from Customers, tap their profile, then use Record payment. Enter the amount received and optional note.',
  },
  {
    q: 'How do I export reports?',
    a: 'Go to Reports tab, pick Today / This week / This month, then tap Export full PDF report at the bottom.',
  },
  {
    q: 'How do I track shop expenses?',
    a: 'Open More → Expenses. Add rent, stock, utilities and other costs. Filter by month and category.',
  },
  {
    q: 'How do I manage my product catalog?',
    a: 'Open More → Products to add, edit or search products. Products also save automatically when you add credit.',
  },
  {
    q: 'How do I change my password?',
    a: 'Go to More → Security. Enter your current password and a new one, or use Send reset email.',
  },
  {
    q: 'The app says it cannot reach the server',
    a: 'Check your internet connection. If the problem continues, contact support — the server may be updating.',
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Pressable
      onPress={() => setOpen((v) => !v)}
      style={({ pressed }) => [styles.faqItem, pressed && styles.faqItemPressed]}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <Text style={styles.faqChevron}>{open ? '▾' : '›'}</Text>
      </View>
      {open ? <Text style={styles.faqAnswer}>{answer}</Text> : null}
    </Pressable>
  );
}

function ActionRow({
  label,
  subtitle,
  onPress,
  icon,
}: {
  label: string;
  subtitle?: string;
  onPress: () => void;
  icon: ReactNode;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.actionRow, pressed && styles.actionRowPressed]}>
      <View style={styles.actionIcon}>{icon}</View>
      <View style={styles.actionBody}>
        <Text style={styles.actionLabel}>{label}</Text>
        {subtitle ? <Text style={styles.actionSub}>{subtitle}</Text> : null}
      </View>
      <Text style={styles.actionChevron}>›</Text>
    </Pressable>
  );
}

export default function HelpSupportScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const [legalDocs, setLegalDocs] = useState<Array<{ slug: string; title: string }>>([]);
  const [loadingLegal, setLoadingLegal] = useState(true);

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  useEffect(() => {
    fetchLegalDocuments()
      .then((res) => setLegalDocs(res.documents || []))
      .catch(() => {
        setLegalDocs([
          { slug: 'terms', title: 'Terms & Conditions' },
          { slug: 'privacy', title: 'Privacy Policy' },
        ]);
      })
      .finally(() => setLoadingLegal(false));
  }, []);

  const openEmail = () => {
    Linking.openURL(
      `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('BakiBook Support Request')}`
    ).catch(() => {
      Linking.openURL(`mailto:${SUPPORT_EMAIL}`).catch(() => {});
    });
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[colors.primaryDark, colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Help & support</Text>
        <Text style={styles.headerSubtitle}>Answers, contact and legal info</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact us</Text>
          <Text style={styles.cardHint}>We typically reply within 1–2 business days.</Text>
          <ActionRow
            label="Email support"
            subtitle={SUPPORT_EMAIL}
            onPress={openEmail}
            icon={
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Rect x={3} y={5} width={18} height={14} rx={2} stroke={colors.primary} strokeWidth={2} />
                <Path d="M3 7 L12 13 L21 7" stroke={colors.primary} strokeWidth={2} />
              </Svg>
            }
          />
          <ActionRow
            label="Account & security"
            subtitle="Password, email verification"
            onPress={() => navigation.navigate('Security')}
            icon={
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                <Path d="M12 3 L20 7 V12 C20 17 16.5 20.5 12 21 C7.5 20.5 4 17 4 12 V7 Z" stroke={colors.primary} strokeWidth={2} />
              </Svg>
            }
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Frequently asked questions</Text>
          {FAQS.map((item) => (
            <FaqItem key={item.q} question={item.q} answer={item.a} />
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Legal</Text>
          {loadingLegal ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 12 }} />
          ) : (
            legalDocs.map((doc) => (
              <ActionRow
                key={doc.slug}
                label={doc.title}
                onPress={() =>
                  navigation.navigate('LegalDocument', { slug: doc.slug, title: doc.title })
                }
                icon={
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path d="M8 4 H16 C17 4 18 5 18 6 V20 C18 21 17 22 16 22 H8 C7 22 6 21 6 20 V6 C6 5 7 4 8 4 Z" stroke="#6B7280" strokeWidth={2} />
                    <Path d="M9 9 H15 M9 13 H15 M9 17 H12" stroke="#6B7280" strokeWidth={2} />
                  </Svg>
                }
              />
            ))
          )}
        </View>

        <View style={styles.aboutCard}>
          <View style={styles.aboutIcon}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
              <Circle cx={12} cy={12} r={9} stroke={colors.primary} strokeWidth={2} />
              <Path d="M10 10 C10 8 14 8 14 10 C14 12 12 12 12 14" stroke={colors.primary} strokeWidth={2} />
            </Svg>
          </View>
          <Text style={styles.aboutTitle}>BakiBook</Text>
          <Text style={styles.aboutText}>Digital credit management for shopkeepers</Text>
          <Text style={styles.aboutVersion}>App version {appVersion}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F5F7' },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 18,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  back: { color: 'rgba(255,255,255,0.95)', fontSize: t.bodyLg, fontWeight: '600', marginBottom: 6 },
  headerTitle: { color: '#FFF', fontSize: t.h1, fontWeight: '800' },
  headerSubtitle: { color: 'rgba(255,255,255,0.88)', fontSize: t.body, marginTop: 4 },
  content: { padding: 16, paddingTop: 14, gap: 12 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEEF2',
  },
  cardTitle: { fontSize: t.md, fontWeight: '800', color: colors.text, marginBottom: 4 },
  cardHint: { fontSize: t.caption, color: colors.textMuted, marginBottom: 12 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F3',
  },
  actionRowPressed: { opacity: 0.85 },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBody: { flex: 1 },
  actionLabel: { fontSize: t.bodyLg, fontWeight: '700', color: colors.text },
  actionSub: { fontSize: t.caption, color: colors.textMuted, marginTop: 2 },
  actionChevron: { fontSize: 20, color: colors.textMuted, fontWeight: '300' },
  faqItem: {
    borderTopWidth: 1,
    borderTopColor: '#F0F1F3',
    paddingVertical: 12,
  },
  faqItemPressed: { backgroundColor: '#FAFAFA' },
  faqHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  faqQuestion: { flex: 1, fontSize: t.bodyLg, fontWeight: '700', color: colors.text, lineHeight: 18 },
  faqChevron: { fontSize: 18, color: colors.textMuted, marginTop: 1 },
  faqAnswer: {
    marginTop: 8,
    fontSize: t.body,
    color: colors.textMuted,
    lineHeight: 18,
  },
  aboutCard: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECEEF2',
  },
  aboutIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  aboutTitle: { fontSize: t.lg, fontWeight: '800', color: colors.text },
  aboutText: { fontSize: t.body, color: colors.textMuted, marginTop: 4 },
  aboutVersion: { fontSize: t.caption, color: colors.textMuted, marginTop: 8 },
});
