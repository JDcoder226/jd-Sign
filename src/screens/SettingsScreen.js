import React, { useMemo, useState } from 'react';
import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, Alert, StatusBar, Switch,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { clearAll, savePin } from '../utils/storage';
import { hashPin } from '../utils/crypto';
import { useTheme } from '../context/ThemeContext';
import { font, spacing, radius, colors as fallbackColors } from '../theme';

export default function SettingsScreen({ navigation }) {
  const { theme, mode, setMode, availableModes } = useTheme();
  const colors = theme?.colors ?? fallbackColors;
  const { lock, persistMaster, setPersistMaster } = useApp();
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPinForm, setShowPinForm] = useState(false);

  const styles = useMemo(() => createStyles(colors), [colors]);

  const handleChangePinSubmit = async () => {
    if (!currentPin || currentPin.length !== 6) {
      Alert.alert('Erreur', 'PIN actuel invalide');
      return;
    }
    if (!newPin || newPin.length !== 6) {
      Alert.alert('Erreur', 'Nouveau PIN invalide');
      return;
    }
    if (newPin !== confirmPin) {
      Alert.alert('Erreur', 'Les PINs ne correspondent pas');
      return;
    }

    const hash = await hashPin(newPin);
    await savePin(hash);
    Alert.alert('Succès', 'PIN changé avec succès', [
      { text: 'OK', onPress: () => setShowPinForm(false) }
    ]);
    setCurrentPin('');
    setNewPin('');
    setConfirmPin('');
  };

  const handleClearAll = () => {
    Alert.alert(
      'Confirmation',
      'Supprimer TOUS les services et réinitialiser ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer tout',
          style: 'destructive',
          onPress: async () => {
            await clearAll();
            lock();
            Alert.alert('Réinitialisé', 'Tous les services ont été supprimés');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={colors.bg} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sécurité</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowPinForm(!showPinForm)}
          >
            <Text style={styles.buttonText}>Changer le PIN</Text>
            <Text style={styles.buttonIcon}>›</Text>
          </TouchableOpacity>

          <View style={[styles.button, { marginTop: 12, alignItems: 'center' }]}> 
            <View style={{ flex: 1 }}>
              <Text style={styles.buttonText}>Conserver le mot de passe maître</Text>
              <Text style={[styles.buttonIcon, { color: colors.textSub, fontSize: 12 }]}>Permet de réutiliser le master entre sessions</Text>
            </View>
            <Switch
              value={!!persistMaster}
              onValueChange={(v) => setPersistMaster(!!v)}
              trackColor={{ true: colors.accent, false: colors.border }}
              thumbColor={persistMaster ? colors.bg : colors.bgCard}
            />
          </View>
        </View>

        {showPinForm && (
          <View style={styles.section}>
            <Text style={styles.label}>PIN actuel</Text>
            <TextInput
              style={styles.input}
              placeholder="6 chiffres"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              maxLength={6}
              secureTextEntry
              value={currentPin}
              onChangeText={setCurrentPin}
            />

            <Text style={styles.label}>Nouveau PIN</Text>
            <TextInput
              style={styles.input}
              placeholder="6 chiffres"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              maxLength={6}
              secureTextEntry
              value={newPin}
              onChangeText={setNewPin}
            />

            <Text style={styles.label}>Confirmer le PIN</Text>
            <TextInput
              style={styles.input}
              placeholder="6 chiffres"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              maxLength={6}
              secureTextEntry
              value={confirmPin}
              onChangeText={setConfirmPin}
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleChangePinSubmit}>
              <Text style={styles.submitBtnText}>Valider le changement</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Apparence</Text>
          <View style={styles.modeRow}>
            {availableModes.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.modeBtn, mode === item && styles.modeBtnActive]}
                onPress={() => setMode(item)}
              >
                <Text style={[styles.modeBtnText, mode === item && styles.modeBtnTextActive]}>
                  {item === 'cyber' ? 'Cyber sombre' : 'Clair'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Données</Text>
          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={handleClearAll}
          >
            <Text style={[styles.buttonText, styles.dangerButtonText]}>Supprimer tous les services</Text>
            <Text style={[styles.buttonIcon, styles.dangerButtonText]}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Chiffrement</Text>
            <Text style={styles.infoValue}>PBKDF2-HMAC-SHA256</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Itérations</Text>
            <Text style={styles.infoValue}>100 000</Text>
          </View>
        </View>

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
  sectionTitle: {
    fontSize: font.size.sm,
    fontWeight: font.weight.bold,
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
  },
  button: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dangerButton: {
    borderColor: colors.red,
    backgroundColor: colors.red + '10',
  },
  buttonText: {
    fontSize: font.size.md,
    fontWeight: font.weight.semibold,
    color: colors.text,
  },
  dangerButtonText: {
    color: colors.red,
  },
  buttonIcon: {
    fontSize: font.size.lg,
    color: colors.textSub,
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
    marginBottom: spacing.md,
  },
  submitBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: font.size.md,
    fontWeight: font.weight.bold,
    color: colors.bg,
  },
  infoBox: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  infoLabel: {
    fontSize: font.size.sm,
    fontWeight: font.weight.semibold,
    color: colors.textSub,
  },
  infoValue: {
    fontSize: font.size.sm,
    fontWeight: font.weight.bold,
    color: colors.accent,
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  modeBtn: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  modeBtnText: {
    color: colors.text,
    fontSize: font.size.sm,
    fontWeight: font.weight.semibold,
  },
  modeBtnTextActive: {
    color: colors.bg,
  },
});
