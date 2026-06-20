import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchLegalDocument, type LegalSection } from '../../api/legal';
import { LoadingState } from '../../components/ui';
import { colors } from '../../theme/colors';
import { typography as t } from '../../theme/typography';
import { formatDate } from '../../utils/format';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'LegalDocument'>;

function SectionBlock({ section }: { section: LegalSection }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.paragraphs?.map((p, i) => (
        <Text key={`p-${i}`} style={styles.paragraph}>
          {p}
        </Text>
      ))}
      {section.bullets?.map((b, i) => (
        <View key={`b-${i}`} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{b}</Text>
        </View>
      ))}
      {section.contactEmail ? (
        <Pressable onPress={() => Linking.openURL(`mailto:${section.contactEmail}`)}>
          <Text style={styles.link}>{section.contactEmail}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export default function LegalDocumentScreen({ route, navigation }: Props) {
  const { slug, title } = route.params;
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [docTitle, setDocTitle] = useState(title);
  const [sections, setSections] = useState<LegalSection[]>([]);
  const [updated, setUpdated] = useState('');

  useEffect(() => {
    fetchLegalDocument(slug)
      .then((res) => {
        setDocTitle(res.document.title);
        setSections(res.document.sections || []);
        if (res.document.lastUpdated) {
          setUpdated(formatDate(res.document.lastUpdated));
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load document');
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingState />;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{docTitle}</Text>
        {updated ? <Text style={styles.updated}>Last updated {updated}</Text> : null}
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {sections.map((section, index) => (
          <SectionBlock key={`${section.title}-${index}`} section={section} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F5F7' },
  header: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  back: { color: 'rgba(255,255,255,0.95)', fontSize: t.bodyLg, fontWeight: '600', marginBottom: 6 },
  headerTitle: { color: '#FFF', fontSize: t.h2, fontWeight: '800' },
  updated: { color: 'rgba(255,255,255,0.85)', fontSize: t.caption, marginTop: 6 },
  content: { padding: 16 },
  error: { color: colors.danger, marginBottom: 12, fontSize: t.body },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ECEEF2',
  },
  sectionTitle: { fontSize: t.bodyLg, fontWeight: '800', color: colors.text, marginBottom: 8 },
  paragraph: { fontSize: t.body, color: colors.textMuted, lineHeight: 20, marginBottom: 8 },
  bulletRow: { flexDirection: 'row', gap: 8, marginBottom: 6, paddingLeft: 4 },
  bulletDot: { color: colors.primary, fontWeight: '800', lineHeight: 20 },
  bulletText: { flex: 1, fontSize: t.body, color: colors.textMuted, lineHeight: 20 },
  link: { fontSize: t.body, color: colors.primary, fontWeight: '700', marginTop: 4 },
});
