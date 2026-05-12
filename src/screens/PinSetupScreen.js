import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, Animated, StyleSheet, SafeAreaView, Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import PinDots from '../components/PinDots';
import NumPad  from '../components/NumPad';
import { hashPin }  from '../utils/crypto';
import { savePin }  from '../utils/storage';
import { useApp }   from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { font, spacing, radius, colors as fallbackColors } from '../theme';

const PIN_LENGTH = 6;

const STEPS = {
  CREATE:  'create',
  CONFIRM: 'confirm',
};

export default function PinSetupScreen({ navigation }) {
  const { theme } = useTheme();
  const colors = theme?.colors ?? fallbackColors;
  const { unlock } = useApp();
  const [step, setStep]     = useState(STEPS.CREATE);
  const [pin, setPin]       = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError]   = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue:  12, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:   8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:  -8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue:   0, duration: 55, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  const handlePress = useCallback(async (digit) => {
    const next = pin + digit;
    if (next.length > PIN_LENGTH) return;
    setPin(next);
    setError('');

    if (next.length === PIN_LENGTH) {
      if (step === STEPS.CREATE) {
        // Passe à la confirmation
        setFirstPin(next);
        setTimeout(() => {
          setStep(STEPS.CONFIRM);
          setPin('');
        }, 200);
      } else {
        // Vérifie la confirmation
        if (next === firstPin) {
          const h = hashPin(next);
          await savePin(h);
          unlock();
        } else {
          shake();
          setError('Les deux PINs ne correspondent pas.');
          setTimeout(() => {
            setStep(STEPS.CREATE);
            setFirstPin('');
            setPin('');
          }, 800);
        }
      }
    }
  }, [pin, step, firstPin, shake, unlock, navigation]);

  const handleDelete = useCallback(() => {
    setPin((p) => p.slice(0, -1));
    setError('');
  }, []);

  const title    = step === STEPS.CREATE  ? 'Créer votre PIN' : 'Confirmer le PIN';
  const subtitle = step === STEPS.CREATE
    ? "Ce PIN verrouille l'accès à VaultGen."
    : 'Répétez votre PIN pour confirmer.';

  const styles = React.useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Logo / Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>JD<Text style={styles.logoAccent}>SIGN</Text></Text>
          <Text style={styles.version}>v1.0 · PBKDF2 · SHA-256</Text>
        </View>

        {/* Step indicator */}
        <View style={styles.stepRow}>
          <View style={[styles.stepDot, step === STEPS.CREATE  && styles.stepDotActive]} />
          <View style={styles.stepLine} />
          <View style={[styles.stepDot, step === STEPS.CONFIRM && styles.stepDotActive]} />
        </View>

        {/* Title */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        {/* Dots */}
        <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
          <PinDots length={pin.length} total={PIN_LENGTH} error={!!error} />
        </Animated.View>

        {error ? <Text style={styles.error}>{error}</Text> : <View style={styles.errorPlaceholder} />}

        {/* NumPad */}
        <NumPad onPress={handlePress} onDelete={handleDelete} />

        
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
  logo: {
    fontFamily: MONO,
    fontSize: font.size.xxl,
    color: colors.text,
    letterSpacing: 4,
    fontWeight: '700',
  },
  logoAccent: { color: colors.accent },
  version: {
    fontFamily: MONO,
    fontSize: font.size.xs,
    color: colors.textMuted,
    letterSpacing: 1,
    marginTop: 4,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  stepDotActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 3,
  },
  stepLine: {
    width: 40,
    height: 1,
    backgroundColor: colors.border,
  },
  titleBlock: { alignItems: 'center', gap: 6 },
  title: {
    fontFamily: MONO,
    fontSize: font.size.xl,
    color: colors.text,
    fontWeight: '600',
  },
  subtitle: {
    fontFamily: MONO,
    fontSize: font.size.sm,
    color: colors.textSub,
    textAlign: 'center',
  },
  error: {
    fontFamily: MONO,
    fontSize: font.size.sm,
    color: colors.red,
    textAlign: 'center',
  },
  errorPlaceholder: { height: 20 },
  hint: {
    fontFamily: MONO,
    fontSize: font.size.xs,
    color: colors.textMuted,
    textAlign: 'center',
    letterSpacing: 0.5,
    
  },
});