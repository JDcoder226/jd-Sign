import React, { useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { font, radius, spacing, colors as fallbackColors } from '../theme';

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', '⌫'],
];

export default function NumPad({ onPress, onDelete, disabled = false }) {
  const { theme } = useTheme();
  const colors = theme?.colors ?? fallbackColors;
  const scaleRefs = useRef({});
  const styles = useMemo(() => createStyles(colors), [colors]);

  const getScale = (key) => {
    if (!scaleRefs.current[key]) {
      scaleRefs.current[key] = new Animated.Value(1);
    }
    return scaleRefs.current[key];
  };

  const handlePress = (key) => {
    if (disabled) return;
    const scale = getScale(key);
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.88, duration: 60, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1,    duration: 80, useNativeDriver: true }),
    ]).start();

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (key === '⌫') onDelete?.();
    else if (key !== '') onPress?.(key);
  };

  return (
    <View style={styles.grid}>
      {KEYS.map((row, ri) => (
        <View key={ri} style={styles.row}>
          {row.map((key, ki) => {
            if (key === '') return <View key={ki} style={styles.empty} />;
            const isDelete = key === '⌫';
            return (
              <Animated.View
                key={ki}
                style={{ transform: [{ scale: getScale(key) }], flex: 1 }}
              >
                <TouchableOpacity
                  style={[styles.key, isDelete && styles.deleteKey]}
                  onPress={() => handlePress(key)}
                  activeOpacity={0.7}
                  disabled={disabled}
                >
                  {isDelete ? (
                    <MaterialCommunityIcons name="backspace-outline" size={22} color={colors.red} />
                  ) : (
                    <Text style={styles.keyText}>{key}</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  grid: {
    paddingHorizontal: spacing.md,
    paddingVertical :50,
    gap: 60,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  empty: {
    flex: 1,
  },
  key: {
    flex: 1,
    backgroundColor: colors.numpad,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 50,
  },
  deleteKey: {
    backgroundColor: colors.red + '50',
    borderColor: colors.red,
  },
  keyText: {
    fontSize: font.size.sm,
    fontWeight: font.weight.bold,
    color: colors.text,
    includeFontPadding: false,
  },
  deleteText: {
    color: colors.red,
  },
});
