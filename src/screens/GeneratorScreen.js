import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, Alert, StatusBar,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { saveService } from '../utils/storage';
import { derivePassword } from '../utils/crypto';
import PasswordDisplay from '../components/PasswordDisplay';
import { useTheme } from '../context/ThemeContext';
import { font, spacing, radius, colors as fallbackColors } from '../theme';

export default function GeneratorScreen({ route, navigation }) {
  const { theme, mode } = useTheme();
  const colors = theme?.colors ?? fallbackColors;
  const { masterPassword } = useApp();
  const item = route?.params?.service ?? route?.params?.item;
  const [form, setForm] = useState(item || {
    id: `svc_${Date.now()}`,
    name: '',
    length: 16,
    counter: 1,
    type: 'full',
  });
  const [password, setPassword] = useState('');
  const [entropy, setEntropy] = useState(0);

  useEffect(() => {
    if (item?.generatedPassword) {
      setPassword(item.generatedPassword);
      const bits = item.type === 'numeric' ? 3.3 : item.type === 'alpha' ? 5.7 : 6.5;
      setEntropy(Math.round(item.generatedPassword.length * bits));
    }
  }, [item]);

  const persistService = useCallback(async (nextPassword) => {
    await saveService({
      ...form,
      generatedPassword: nextPassword,
      updatedAt: Date.now(),
    });
  }, [form]);

  const generatePassword = useCallback(() => {
    if (!form.name.trim()) {
      Alert.alert('Erreur', 'Entrez un nom de service');
      return;
    }
    if (!masterPassword.trim()) {
      Alert.alert('Erreur', 'Mot de passe maître requis');
      return;
    }
    const pwd = derivePassword(masterPassword, form.name, form.counter, form.length, form.type);
    setPassword(pwd);

    const bits = form.type === 'numeric' ? 3.3 : form.type === 'alpha' ? 5.7 : 6.5;
    setEntropy(Math.round(pwd.length * bits));
    persistService(pwd).catch(() => {});
  }, [form, masterPassword, persistService]);

  const entropyColor = entropy < 50 ? colors.red : entropy < 100 ? colors.amber : colors.accent;
  const entropyLabel = entropy < 50 ? 'Faible' : entropy < 100 ? 'Bon' : 'Excellent';

  const handleSave = useCallback(async () => {
    if (!form.name.trim()) {
      Alert.alert('Erreur', 'Entrez un nom de service');
      return;
    }
    await saveService({
      ...form,
      generatedPassword: password || form.generatedPassword || '',
    });
    Alert.alert('Succès', 'Service sauvegardé', [
      { text: 'OK', onPress: () => navigation.navigate('Home') }
    ]);
  }, [form, navigation, password]);

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={colors.bg} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        
        <View style={styles.section}>
          <Text style={styles.label}>Nom du service</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Gmail, GitHub..."
            placeholderTextColor={colors.textMuted}
            value={form.name}
            onChangeText={(name) => setForm({ ...form, name })}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Longueur : {form.length}</Text>
          <View style={styles.slider}>
            {[8, 12, 16, 20, 24, 32].map((len) => (
              <TouchableOpacity
                key={len}
                style={[styles.sliderBtn, form.length === len && styles.sliderBtnActive]}
                onPress={() => setForm({ ...form, length: len })}
              >
                <Text style={[styles.sliderBtnText, form.length === len && styles.sliderBtnTextActive]}>
                  {len}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Type</Text>
          <View style={styles.typeGrid}>
            {[
              { key: 'full', label: 'Complet', icon: '[+]' },
              { key: 'alpha', label: 'Alphanum', icon: 'Aa' },
              { key: 'numeric', label: 'Chiffres', icon: '#' },
            ].map(({ key, label, icon }) => (
              <TouchableOpacity
                key={key}
                style={[styles.typeBtn, form.type === key && styles.typeBtnActive]}
                onPress={() => setForm({ ...form, type: key })}
              >
                <Text style={styles.typeIcon}>{icon}</Text>
                <Text style={[styles.typeLabel, form.type === key && styles.typeLabelActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Compteur (version)</Text>
          <View style={styles.counterRow}>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() => setForm({ ...form, counter: Math.max(1, form.counter - 1) })}
            >
              <Text style={styles.counterBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.counterVal}>{form.counter}</Text>
            <TouchableOpacity
              style={styles.counterBtn}
              onPress={() => setForm({ ...form, counter: form.counter + 1 })}
            >
              <Text style={styles.counterBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.generateBtn} onPress={generatePassword}>
            <Text style={styles.generateBtnText}>Générer</Text>
          </TouchableOpacity>
        </View>

        {password && (
          <>
            <PasswordDisplay
              password={password}
              entropy={entropy}
              entropyColor={entropyColor}
              entropyLabel={entropyLabel}
            />
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Sauvegarder le service</Text>
            </TouchableOpacity>
          </>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: font.size.sm,
    fontWeight: font.weight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.bgInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: font.size.md,
    color: colors.text,
  },
  slider: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sliderBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderBtnActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  sliderBtnText: {
    fontSize: font.size.sm,
    fontWeight: font.weight.bold,
    color: colors.textSub,
  },
  sliderBtnTextActive: {
    color: colors.bg,
  },
  typeGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  typeBtnActive: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  typeIcon: {
    fontSize: font.size.lg,
    fontWeight: font.weight.bold,
  },
  typeLabel: {
    fontSize: font.size.xs,
    fontWeight: font.weight.semibold,
    color: colors.textSub,
  },
  typeLabelActive: {
    color: colors.white,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  counterBtn: {
    width: 44,
    height: 44,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterBtnText: {
    fontSize: font.size.lg,
    fontWeight: font.weight.bold,
    color: colors.accent,
  },
  counterVal: {
    flex: 1,
    fontSize: font.size.lg,
    fontWeight: font.weight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  generateBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generateBtnText: {
    fontSize: font.size.md,
    fontWeight: font.weight.bold,
    color: colors.bg,
  },
  saveBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.purple,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: font.size.md,
    fontWeight: font.weight.bold,
    color: colors.white,
  },
});
