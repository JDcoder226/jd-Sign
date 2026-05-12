import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, Animated, StyleSheet, SafeAreaView,
  TouchableOpacity, Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import PinDots from '../components/PinDots';
import NumPad  from '../components/NumPad';
import { hashPin }      from '../utils/crypto';
import { getPin, clearAll } from '../utils/storage';
import { useApp }       from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { font, spacing, radius, colors as fallbackColors } from '../theme';

const PIN_LENGTH  = 6;
const MAX_TRIES   = 5;
const LOCKOUT_SEC = 30;

export default function PinLockScreen({ navigation }) {
  const { theme } = useTheme();
  const colors = theme?.colors ?? fallbackColors;
  const { unlock } = useApp();
  const [pin, setPin]           = useState('');
  const [error, setError]       = useState('');
  const [tries, setTries]       = useState(0);
  const [locked, setLocked]     = useState(false);
  const [lockSecs, setLockSecs] = useState(LOCKOUT_SEC);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const lockTimer = useRef(null);

  const shake = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue:  14, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -14, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:   9, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  -9, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:   0, duration: 55, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const startLockout = useCallback(() => {
    setLocked(true);
    let secs = LOCKOUT_SEC;
    setLockSecs(secs);
    lockTimer.current = setInterval(() => {
      secs -= 1;
      setLockSecs(secs);
      if (secs <= 0) {
        clearInterval(lockTimer.current);
        setLocked(false);
        setTries(0);
        setError('');
      }
    }, 1000);
  }, []);

  useEffect(() => () => { if (lockTimer.current) clearInterval(lockTimer.current); }, []);

  const handlePress = useCallback(async (digit) => {
    if (locked) return;
    const next = pin + digit;
    if (next.length > PIN_LENGTH) return;
    setPin(next);
    setError('');

    if (next.length === PIN_LENGTH) {
      const stored = await getPin();
      const typed  = hashPin(next);

      if (typed === stored) {
        unlock();
      } else {
        const newTries = tries + 1;
        setTries(newTries);
        shake();

        if (newTries >= MAX_TRIES) {
          setPin('');
          setError(`Trop de tentatives. Attente ${LOCKOUT_SEC}s…`);
          startLockout();
        } else {
          setError(`PIN incorrect — ${MAX_TRIES - newTries} essai(s) restant(s)`);
          setTimeout(() => setPin(''), 400);
        }
      }
    }
  }, [pin, locked, tries, shake, unlock, startLockout, navigation]);

  const handleDelete = useCallback(() => {
    setPin((p) => p.slice(0, -1));
    setError('');
  }, []);

  const handleReset = useCallback(async () => {
    await clearAll();
    navigation.replace('PinSetup');
  }, [navigation]);

  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        <View style={styles.header}>
          <Text style={styles.logo}>JD<Text style={styles.logoAccent}>SIGN</Text></Text>
          <Text style={styles.tagline}>Dérivation déterministe · Zéro stockage</Text>
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>
            {locked ? `🔒 Verrouillé ${lockSecs}s` : 'Déverrouiller'}
          </Text>
          <Text style={styles.subtitle}>
            {locked ? 'Trop de tentatives incorrectes.' : 'Entrez votre PIN à 6 chiffres.'}
          </Text>
        </View>

        <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
          <PinDots length={pin.length} total={PIN_LENGTH} error={!!error} />
        </Animated.View>

        {error
          ? <Text style={styles.error}>{error}</Text>
          : <View style={styles.errPlaceholder} />}

        <NumPad onPress={handlePress} onDelete={handleDelete} disabled={locked} />

        <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
          <Text style={styles.resetText}>PIN oublié ? Réinitialiser l'app</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const MONO = Platform.OS === 'ios' ? 'Courier New' : 'monospace';

const createStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    gap: spacing.xl,
    justifyContent: 'center',
  },
  header: { alignItems: 'center' },
  logo: { fontFamily: MONO, fontSize: font.size.xxl, color: colors.text, letterSpacing: 4, fontWeight: '700' },
  logoAccent: { color: colors.accent },
  tagline: { fontFamily: MONO, fontSize: font.size.xs, color: colors.textMuted, letterSpacing: 0.5, marginTop: 4 },
  titleBlock: { alignItems: 'center', gap: 6 },
  title: { fontFamily: MONO, fontSize: font.size.xl, color: colors.text, fontWeight: '600' },
  subtitle: { fontFamily: MONO, fontSize: font.size.sm, color: colors.textSub, textAlign: 'center' },
  error: { fontFamily: MONO, fontSize: font.size.sm, color: colors.red, textAlign: 'center' },
  errPlaceholder: { height: 20 },
  resetBtn: { alignItems: 'center', paddingVertical: 8 },
  resetText: { fontFamily: MONO, fontSize: font.size.xs, color: colors.textMuted, textDecorationLine: 'underline' },
});