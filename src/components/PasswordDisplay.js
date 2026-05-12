import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, Animated,
  StyleSheet, Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { font, radius, spacing, colors as fallbackColors } from '../theme';

function charColor(ch, colors) {
  if (/[A-Z]/.test(ch))        return colors.purple ?? '#8b7cf8';
  if (/[0-9]/.test(ch))        return colors.green ?? '#00e87a';
  if (/[^a-zA-Z0-9]/.test(ch)) return colors.amber ?? '#f59e0b';
  return colors.text;
}

export default function PasswordDisplay({ password, entropy, entropyColor, entropyLabel }) {
  const { theme } = useTheme();
  const colors = theme?.colors ?? fallbackColors;
  const [visible, setVisible]     = useState(false);
  const [copied, setCopied]       = useState(false);
  const [countdown, setCountdown] = useState(30);
  const timerRef                  = useRef(null);
  const styles = useMemo(() => createStyles(colors), [colors]);

  const startClearTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    let secs = 30;
    setCountdown(secs);
    timerRef.current = setInterval(() => {
      secs -= 1;
      setCountdown(secs);
      if (secs <= 0) {
        clearInterval(timerRef.current);
        Clipboard.setStringAsync('').catch(() => {});
        setCopied(false);
      }
    }, 1000);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!password) return;
    await Clipboard.setStringAsync(password);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setCopied(true);
    startClearTimer();
  }, [password, startClearTimer]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>MOT DE PASSE DÉRIVÉ</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setVisible((v) => !v)}
          >
            <Ionicons
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.copyBtn, copied && styles.copyBtnActive]}
            onPress={handleCopy}
          >
            <Text style={[styles.copyText, copied && styles.copyTextActive]}>
              {copied ? `copié ${countdown}s` : ' Copier'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.pwdBox}>
        <Text style={styles.pwdText} selectable={visible}>
          {password.split('').map((ch, i) =>
            visible
              ? <Text key={i} style={{ color: charColor(ch, colors) }}>{ch}</Text>
              : <Text key={i} style={{ color: colors.textMuted }}>{'•'}</Text>
          )}
        </Text>
      </View>

      <View style={styles.entropyRow}>
        <Text style={styles.entropyBits}>{entropy} bits</Text>
        <View style={styles.barTrack}>
          <View style={[styles.barFill, { width: `${Math.min(100, (entropy / 128) * 100)}%`, backgroundColor: entropyColor }]} />
        </View>
        <Text style={[styles.entropyLabel, { color: entropyColor }]}>{entropyLabel}</Text>
      </View>

      <View style={styles.badges}>
        {[['Algo', 'PBKDF2'], ['Hash', 'SHA-256'], ['Rounds', '100 000']].map(([k, v]) => (
          <View key={k} style={styles.badge}>
            <Text style={styles.badgeKey}>{k} </Text>
            <Text style={styles.badgeVal}>{v}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: font.size.xs,
    fontWeight: font.weight.bold,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconBtn: {
    padding: spacing.sm,
  },
  iconText: {
    fontSize: font.size.lg,
  },
  copyBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyBtnActive: {
    backgroundColor: colors.accentPress,
  },
  copyText: {
    fontSize: font.size.sm,
    fontWeight: font.weight.semibold,
    color: colors.bg,
  },
  copyTextActive: {
    color: colors.text,
  },
  pwdBox: {
    backgroundColor: colors.bgInput,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    justifyContent: 'center',
    minHeight: 50,
  },
  pwdText: {
    fontSize: font.size.md,
    fontFamily: font.mono,
    letterSpacing: 1,
    color: colors.text,
  },
  entropyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  entropyBits: {
    fontSize: font.size.xs,
    fontWeight: font.weight.semibold,
    color: colors.textSub,
    minWidth: 40,
  },
  barTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 2,
  },
  entropyLabel: {
    fontSize: font.size.xs,
    fontWeight: font.weight.semibold,
    minWidth: 50,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  badge: {
    flex: 1,
    backgroundColor: colors.bgInput,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeKey: {
    fontSize: font.size.xs,
    fontWeight: font.weight.medium,
    color: colors.textMuted,
  },
  badgeVal: {
    fontSize: font.size.xs,
    fontWeight: font.weight.bold,
    color: colors.accent,
  },
});
