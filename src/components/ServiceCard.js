import React, { useEffect, useMemo, useRef } from 'react';
import {
  View, Text, TouchableOpacity, Animated,
  StyleSheet, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { font, radius, spacing, colors as fallbackColors } from '../theme';

export default function ServiceCard({ item, onPress, onDelete, onCopy }) {
  const { theme } = useTheme();
  const colors = theme?.colors ?? fallbackColors;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, []);

  const typeIcon = { full: '[+]', alpha: 'Aa', numeric: '#' }[item.type] ?? '[+]';
  const typeColor = { full: colors.purple, alpha: colors.accent, numeric: colors.amber }[item.type];

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.75}>
        <View style={styles.cardLeft}>
          <View style={[styles.iconBox, { backgroundColor: typeColor + '18', borderColor: typeColor + '40' }]}>
            <Text style={[styles.iconText, { color: typeColor }]}>{typeIcon}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{item.name}</Text>
            <Text style={styles.cardMeta}>
              {item.length} chars · v{item.counter} · {
                item.type === 'full' ? 'Alphanum+Sym' :
                item.type === 'alpha' ? 'Alphanum' : 'PIN'
              }
            </Text>
          </View>
        </View>
        <View style={styles.cardRight}>
          <TouchableOpacity
            onPress={() => onCopy?.(item)}
            hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
          >
            <Ionicons name="copy-outline" size={18} color={colors.accent} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Alert.alert('Supprimer', `Supprimer "${item.name}" ?`, [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Supprimer', style: 'destructive', onPress: () => onDelete(item.id) },
              ]);
            }}
            hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
          >
            <Text style={styles.deleteIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.chevron}>›</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: font.size.lg,
    fontWeight: font.weight.bold,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: font.size.md,
    fontWeight: font.weight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardMeta: {
    fontSize: font.size.xs,
    color: colors.textSub,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  deleteIcon: {
    fontSize: font.size.md,
    color: colors.red,
    fontWeight: font.weight.bold,
  },
  chevron: {
    fontSize: font.size.lg,
    color: colors.textSub,
    fontWeight: font.weight.light,
  },
});
