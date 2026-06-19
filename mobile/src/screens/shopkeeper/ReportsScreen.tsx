import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { fetchReport } from '../../api/shop';
import { Button, Card, ErrorText, LoadingState, Subtitle, Title } from '../../components/ui';
import { colors } from '../../theme/colors';
import { formatRs } from '../../utils/format';

type Period = 'daily' | 'weekly' | 'monthly';

export default function ReportsScreen() {
  const [period, setPeriod] = useState<Period>('daily');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [report, setReport] = useState<Record<string, unknown> | null>(null);

  const loadReport = async (nextPeriod: Period) => {
    setPeriod(nextPeriod);
    setLoading(true);
    setError('');
    try {
      const data = await fetchReport(nextPeriod);
      setReport((data as { report?: Record<string, unknown> }).report || (data as Record<string, unknown>));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const exportPdf = async () => {
    if (!report) {
      Alert.alert('Generate report first');
      return;
    }
    const summary = report as Record<string, number>;
    const html = `
      <html><body style="font-family:sans-serif;padding:24px">
        <h1>BakiBook ${period} report</h1>
        <p>Credit given: ${formatRs(summary.creditGiven || summary.totalCredit || 0)}</p>
        <p>Payments received: ${formatRs(summary.paymentsReceived || summary.totalPayments || 0)}</p>
        <p>Outstanding: ${formatRs(summary.outstanding || summary.totalOutstanding || 0)}</p>
      </body></html>
    `;
    const file = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri);
    } else {
      Alert.alert('PDF saved', file.uri);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Title>Reports</Title>
      <Subtitle>Generate and export shop reports</Subtitle>

      <View style={styles.periodRow}>
        {(['daily', 'weekly', 'monthly'] as Period[]).map((p) => (
          <Text
            key={p}
            onPress={() => loadReport(p)}
            style={[styles.periodChip, period === p && styles.periodChipActive]}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </Text>
        ))}
      </View>

      {loading ? <LoadingState /> : null}
      {error ? <ErrorText message={error} /> : null}

      {report ? (
        <Card>
          <Text style={styles.reportTitle}>{period.toUpperCase()} SUMMARY</Text>
          {Object.entries(report)
            .filter(([, value]) => typeof value === 'number')
            .slice(0, 6)
            .map(([key, value]) => (
              <View key={key} style={styles.reportRow}>
                <Text style={styles.reportKey}>{key}</Text>
                <Text style={styles.reportValue}>
                  {String(key).toLowerCase().includes('count')
                    ? String(value)
                    : formatRs(Number(value))}
                </Text>
              </View>
            ))}
        </Card>
      ) : (
        <Card>
          <Text style={styles.muted}>Tap a period above to generate a report.</Text>
        </Card>
      )}

      <Button title="Export PDF" onPress={exportPdf} disabled={!report} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 32 },
  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  periodChip: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    color: colors.text,
  },
  periodChipActive: { backgroundColor: colors.primary, color: '#fff', fontWeight: '700' },
  reportTitle: { fontWeight: '700', marginBottom: 12, color: colors.primaryDark },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reportKey: { color: colors.textMuted, textTransform: 'capitalize' },
  reportValue: { fontWeight: '700', color: colors.text },
  muted: { color: colors.textMuted },
});
