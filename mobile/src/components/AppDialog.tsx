import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme/colors';
import type { DialogButton } from '../contexts/DialogContext';

type Props = {
  visible: boolean;
  title: string;
  message?: string;
  buttons: DialogButton[];
  onDismiss: () => void;
  onPress: (button: DialogButton) => void;
};

function DialogIcon({ tone }: { tone: 'default' | 'danger' | 'success' | 'info' }) {
  const stroke =
    tone === 'danger'
      ? colors.danger
      : tone === 'success'
        ? colors.primary
        : tone === 'info'
          ? colors.warning
          : colors.primary;

  const bg =
    tone === 'danger'
      ? '#FEE2E2'
      : tone === 'success'
        ? '#DCFCE7'
        : tone === 'info'
          ? '#FEF3C7'
          : '#EEF2E6';

  return (
    <View style={[styles.iconWrap, { backgroundColor: bg }]}>
      {tone === 'danger' ? (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path d="M6 7 H18 L17 19 H7 Z" stroke={stroke} strokeWidth={2} strokeLinejoin="round" />
          <Path d="M10 7 V5 C10 4.45 10.45 4 11 4 H13 C13.55 4 14 4.45 14 5 V7" stroke={stroke} strokeWidth={2} />
          <Path d="M10 11 V16 M14 11 V16" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
        </Svg>
      ) : tone === 'success' ? (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={12} r={9} stroke={stroke} strokeWidth={2} />
          <Path d="M8 12 L11 15 L16 9" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      ) : (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={12} r={9} stroke={stroke} strokeWidth={2} />
          <Path d="M12 8 V13 M12 16 H12.01" stroke={stroke} strokeWidth={2} strokeLinecap="round" />
        </Svg>
      )}
    </View>
  );
}

function detectTone(title: string, buttons: DialogButton[]): 'default' | 'danger' | 'success' | 'info' {
  if (buttons.some((b) => b.style === 'destructive')) return 'danger';
  const lower = `${title} ${buttons.map((b) => b.text).join(' ')}`.toLowerCase();
  if (lower.includes('saved') || lower.includes('success') || lower.includes('sent') || lower.includes('linked')) {
    return 'success';
  }
  if (lower.includes('error') || lower.includes('failed')) return 'danger';
  if (lower.includes('coming soon') || lower.includes('verify')) return 'info';
  return 'default';
}

function useLayout(buttons: DialogButton[]): 'row' | 'stack' {
  if (buttons.length <= 2 && buttons.some((b) => b.style === 'cancel')) {
    return 'row';
  }
  return 'stack';
}

export default function AppDialog({ visible, title, message, buttons, onDismiss, onPress }: Props) {
  const tone = detectTone(title, buttons);
  const layout = buttons.length === 1 ? 'single' : useLayout(buttons);
  const ordered =
    layout === 'row'
      ? [...buttons].sort((a, b) => {
          if (a.style === 'cancel') return -1;
          if (b.style === 'cancel') return 1;
          return 0;
        })
      : buttons.filter((b) => b.style !== 'cancel').concat(buttons.filter((b) => b.style === 'cancel'));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <DialogIcon tone={tone} />
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          {layout === 'single' ? (
            <Pressable
              onPress={() => onPress(buttons[0])}
              style={({ pressed }) => [styles.singleBtn, pressed && styles.btnPressed]}
            >
              <Text style={styles.singleBtnText}>{buttons[0].text}</Text>
            </Pressable>
          ) : layout === 'row' ? (
            <View style={styles.rowActions}>
              {ordered.map((button) => (
                <Pressable
                  key={button.text}
                  onPress={() => onPress(button)}
                  style={({ pressed }) => [
                    styles.rowBtn,
                    button.style === 'cancel' && styles.rowBtnCancel,
                    button.style === 'destructive' && styles.rowBtnDanger,
                    !button.style || button.style === 'default' ? styles.rowBtnPrimary : null,
                    pressed && styles.btnPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.rowBtnText,
                      button.style === 'cancel' && styles.rowBtnTextCancel,
                      button.style === 'destructive' && styles.rowBtnTextDanger,
                      (!button.style || button.style === 'default') && styles.rowBtnTextPrimary,
                    ]}
                  >
                    {button.text}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.stackActions}>
              {ordered.map((button, index) => (
                <Pressable
                  key={`${button.text}-${index}`}
                  onPress={() => onPress(button)}
                  style={({ pressed }) => [
                    styles.stackBtn,
                    index > 0 && styles.stackBtnBorder,
                    button.style === 'cancel' && styles.stackBtnCancel,
                    button.style === 'destructive' && styles.stackBtnDanger,
                    pressed && styles.btnPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.stackBtnText,
                      button.style === 'cancel' && styles.stackBtnTextCancel,
                      button.style === 'destructive' && styles.stackBtnTextDanger,
                    ]}
                  >
                    {button.text}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(45, 51, 25, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 18,
    alignItems: 'center',
    shadowColor: '#2D3319',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryDark,
    textAlign: 'center',
    marginBottom: 6,
  },
  message: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 18,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
    marginTop: 4,
  },
  rowBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBtnCancel: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowBtnPrimary: {
    backgroundColor: colors.primary,
  },
  rowBtnDanger: {
    backgroundColor: colors.danger,
  },
  rowBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  rowBtnTextCancel: {
    color: colors.textMuted,
  },
  rowBtnTextPrimary: {
    color: '#FFFFFF',
  },
  rowBtnTextDanger: {
    color: '#FFFFFF',
  },
  stackActions: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
  },
  stackBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  stackBtnBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stackBtnCancel: {
    backgroundColor: '#FFFFFF',
  },
  stackBtnDanger: {},
  stackBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  stackBtnTextCancel: {
    color: colors.textMuted,
    fontWeight: '700',
  },
  stackBtnTextDanger: {
    color: colors.danger,
    fontWeight: '700',
  },
  btnPressed: {
    opacity: 0.82,
  },
  singleBtn: {
    width: '100%',
    marginTop: 4,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: colors.primary,
  },
  singleBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
