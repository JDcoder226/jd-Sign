import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PIN:      'vaultgen_pin_hash',
  SERVICES: 'vaultgen_services',
  THEME:    'vaultgen_theme_mode',
  MASTER:   'vaultgen_master_password',
  PERSIST_MASTER: 'vaultgen_persist_master',
};

// ─── PIN ──────────────────────────────────────────────────────────────────────

export const savePin = (hash) =>
  SecureStore.setItemAsync(KEYS.PIN, hash);

export const getPin = () =>
  SecureStore.getItemAsync(KEYS.PIN);

export const deletePin = () =>
  SecureStore.deleteItemAsync(KEYS.PIN);

export const pinExists = async () => {
  const h = await getPin();
  return h !== null && h !== undefined && h.length > 0;
};

// ─── Services ─────────────────────────────────────────────────────────────────

export const getServices = async () => {
  const raw = await AsyncStorage.getItem(KEYS.SERVICES);
  return raw ? JSON.parse(raw) : [];
};

export const saveService = async (service) => {
  const services = await getServices();
  const idx = services.findIndex((s) => s.id === service.id);
  const next = { ...service, updatedAt: Date.now() };
  if (idx >= 0) services[idx] = next;
  else services.unshift(next);
  await AsyncStorage.setItem(KEYS.SERVICES, JSON.stringify(services));
};

export const deleteService = async (id) => {
  const services = await getServices();
  await AsyncStorage.setItem(
    KEYS.SERVICES,
    JSON.stringify(services.filter((s) => s.id !== id))
  );
};

// ─── Reset ────────────────────────────────────────────────────────────────────

export const clearAll = async () => {
  await deletePin();
  await AsyncStorage.removeItem(KEYS.SERVICES);
  await deleteMasterPassword();
};
// ─── Helpers ──────────────────────────────────────────────────────────────────

export const checkPinExists = async () => {
  return await pinExists();
};

export const getThemeMode = async () => AsyncStorage.getItem(KEYS.THEME);

export const saveThemeMode = async (mode) => {
  await AsyncStorage.setItem(KEYS.THEME, mode);
};

// ─── Master password (secure) ───────────────────────────────────────────────
export const saveMasterPassword = async (value) => {
  if (value === null || value === undefined) return;
  return SecureStore.setItemAsync(KEYS.MASTER, value);
};

export const getMasterPassword = async () => {
  return SecureStore.getItemAsync(KEYS.MASTER);
};

export const deleteMasterPassword = async () => {
  return SecureStore.deleteItemAsync(KEYS.MASTER);
};

// persist master preference (AsyncStorage)
export const savePersistMasterFlag = async (enabled) => {
  if (enabled === null || enabled === undefined) return;
  return AsyncStorage.setItem(KEYS.PERSIST_MASTER, enabled ? '1' : '0');
};

export const getPersistMasterFlag = async () => {
  const v = await AsyncStorage.getItem(KEYS.PERSIST_MASTER);
  return v === '1';
};
