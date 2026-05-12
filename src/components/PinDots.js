import React, { useEffect, useMemo, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { colors as fallbackColors } from '../theme';

export default function PinDots({ length, total = 6, error = false }) {
  const { theme } = useTheme();
  const colors = theme?.colors ?? fallbackColors;
  const scaleAnims = useRef(Array.from({ length: total }, () => new Animated.Value(1))).current;
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    if (length > 0 && length <= total) {
      const idx = length - 1;
      Animated.sequence([
        Animated.timing(scaleAnims[idx], { toValue: 1.35, duration: 80, useNativeDriver: true }),
        Animated.timing(scaleAnims[idx], { toValue: 1,    duration: 80, useNativeDriver: true }),
      ]).start();
    }
  }, [length]);

  const dotColor = error ? colors.pinError : colors.pinFilled;

  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => {
        const filled = i < length;
        return (
          <Animated.View
            key={i}
            style={[
              styles.dot,
              { transform: [{ scale: scaleAnims[i] }] },
              filled
                ? { backgroundColor: dotColor, borderColor: dotColor, shadowColor: dotColor, shadowOpacity: 0.7, shadowRadius: 8, elevation: 4 }
                : { backgroundColor: 'transparent', borderColor: error ? colors.pinError : colors.border },
            ]}
          />
        );
      })}
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 18,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
});
