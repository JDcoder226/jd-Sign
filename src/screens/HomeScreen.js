import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, Alert,
  Platform, StatusBar,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useApp }           from '../context/AppContext';
import { getServices, deleteService } from '../utils/storage';
import { useTheme } from '../context/ThemeContext';
import { font, spacing, radius, colors as fallbackColors } from '../theme';
import ServiceCard from '../components/ServiceCard';

const MONO = Platform.OS === 'ios' ? 'Courier New' : 'monospace';

export default function HomeScreen({ navigation }) {
  const { theme, mode } = useTheme();
  const colors = theme?.colors ?? fallbackColors;
  const { masterPassword, setMasterPassword, lock } = useApp();
  const [services, setServices]   = useState([]);
  const [masterVisible, setMasterVisible] = useState(false);
  const [search, setSearch]       = useState('');
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const loadServices = useCallback(async () => {
    const list = await getServices();
    setServices(list);
  }, []);

  useFocusEffect(useCallback(() => { loadServices(); }, [loadServices]));

  const handleDelete = useCallback(async (id) => {
    await deleteService(id);
    loadServices();
  }, [loadServices]);

  const handleCopyPassword = useCallback(async (service) => {
    const pwd = service?.generatedPassword;
    if (!pwd) {
      Alert.alert('Info', 'Aucun mot de passe généré pour ce service.');
      return;
    }

    await Clipboard.setStringAsync(pwd);
    Alert.alert('Copié', `Mot de passe de ${service.name} copié.`);
  }, []);

  const filtered = services.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const hasMaster = masterPassword.trim().length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={mode === 'light' ? 'dark-content' : 'light-content'} backgroundColor={colors.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>JD<Text style={styles.logoAccent}>SIGN</Text></Text>
          <Text style={styles.tagline}>{services.length} service(s) sauvegardé(s)</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.lockBtn} onPress={lock}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Master Password Card */}
        <View style={[styles.masterCard, hasMaster && styles.masterCardActive]}>
          <Text style={styles.masterLabel}>KEY  MOT DE PASSE MAÎTRE</Text>
          <Text style={styles.masterHint}>
            Saisi une seule fois · jamais stocké · efface à la fermeture
          </Text>
          <View style={styles.masterInputRow}>
            <TextInput
              style={styles.masterInput}
              value={masterPassword}
              onChangeText={setMasterPassword}
              placeholder="Entrez votre secret maître…"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!masterVisible}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => setMasterVisible((v) => !v)} style={styles.eyeBtn}>
              <Ionicons
                name={masterVisible ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>
          {hasMaster && (
            <View style={styles.masterOk}>
              <View style={styles.dot} />
              <Text style={styles.masterOkText}>Session active</Text>
            </View>
          )}
        </View>

        {/* Search */}
        {services.length > 0 && (
          <View style={styles.searchBox}>
            <Text style={styles.searchIcon}>@</Text>
            <TextInput
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Rechercher un service…"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={styles.clearSearch}>X</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Services list */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>SERVICES</Text>
            <TouchableOpacity
              style={[styles.addBtn, !hasMaster && styles.addBtnDisabled]}
              onPress={() => hasMaster ? navigation.navigate('Generator', { service: null }) : null}
            >
              <Text style={styles.addBtnText}>+ Nouveau</Text>
            </TouchableOpacity>
          </View>

          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>○</Text>
              <Text style={styles.emptyTitle}>
                {services.length === 0 ? 'Aucun service' : 'Aucun résultat'}
              </Text>
              <Text style={styles.emptyText}>
                {services.length === 0
                  ? hasMaster
                    ? 'Ajoutez un service pour générer son mot de passe.'
                    : "Entrez d'abord votre mot de passe maître."
                  : 'Modifiez votre recherche.'}
              </Text>
            </View>
          ) : (
            <View style={styles.list}>
              {filtered.map((item) => (
                <ServiceCard
                  key={item.id}
                  item={item}
                  onPress={(s) => navigation.navigate('Generator', { service: s })}
                  onDelete={handleDelete}
                  onCopy={handleCopyPassword}
                />
              ))}
            </View>
          )}
        </View>

        {/* Security notice */}
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            ★  Zéro stockage de mot de passe · Calcul 100% local · PBKDF2-HMAC-SHA256
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  logo: { fontFamily: MONO, fontSize: font.size.lg, color: colors.text, fontWeight: '700', letterSpacing: 3 },
  logoAccent: { color: colors.accent },
  tagline: { fontFamily: MONO, fontSize: 10, color: colors.textMuted, letterSpacing: 0.5, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: { padding: 8, borderRadius: radius.sm, backgroundColor: colors.bgCard },
  lockBtn: { padding: 8, borderRadius: radius.sm, backgroundColor: colors.bgCard },

  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 40 },

  masterCard: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 10,
  },
  masterCardActive: {
    borderColor: colors.accent + '60',
    shadowColor: colors.accent,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  masterLabel: { fontFamily: MONO, fontSize: font.size.xs, color: colors.textSub, letterSpacing: 1 },
  masterHint: { fontFamily: MONO, fontSize: 10, color: colors.textMuted, lineHeight: 16 },
  masterInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgInput,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.border,
    paddingRight: 8,
  },
  masterInput: {
    flex: 1,
    fontFamily: MONO,
    fontSize: font.size.md,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  eyeBtn: { padding: 8 },
  masterOk: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
  masterOkText: { fontFamily: MONO, fontSize: 10, color: colors.accent },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.border,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchIcon: { fontSize: 16, color: colors.textMuted },
  searchInput: {
    flex: 1,
    fontFamily: MONO,
    fontSize: font.size.sm,
    color: colors.text,
    paddingVertical: 11,
  },
  clearSearch: { fontSize: 12, color: colors.textMuted, padding: 4 },

  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontFamily: MONO, fontSize: font.size.xs, color: colors.textMuted, letterSpacing: 2 },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: colors.accentDim,
    borderRadius: radius.full,
    borderWidth: 0.5,
    borderColor: colors.accent + '60',
  },
  addBtnDisabled: { opacity: 0.35 },
  addBtnText: { fontFamily: MONO, fontSize: font.size.xs, color: colors.accent, letterSpacing: 0.5 },

  list: { gap: 8 },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconBox: {
    width: 40, height: 40,
    borderRadius: radius.md,
    borderWidth: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: { fontFamily: MONO, fontSize: 14, fontWeight: '700' },
  cardInfo: { flex: 1 },
  cardName: { fontFamily: MONO, fontSize: font.size.md, color: colors.text, fontWeight: '600' },
  cardMeta: { fontFamily: MONO, fontSize: 10, color: colors.textMuted, marginTop: 2 },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  deleteIcon: { fontSize: 12, color: colors.textMuted },
  chevron: { fontSize: 20, color: colors.textMuted },

  empty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyIcon: { fontSize: 32, color: colors.textMuted },
  emptyTitle: { fontFamily: MONO, fontSize: font.size.md, color: colors.textSub },
  emptyText: { fontFamily: MONO, fontSize: font.size.sm, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },

  notice: {
    padding: spacing.md,
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 0.5,
    borderColor: colors.border,
  },
  noticeText: { fontFamily: MONO, fontSize: 10, color: colors.textMuted, textAlign: 'center', lineHeight: 16 },
});