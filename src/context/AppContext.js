import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { getMasterPassword, saveMasterPassword, deleteMasterPassword, getPersistMasterFlag, savePersistMasterFlag } from '../utils/storage';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [masterPassword, setMasterPasswordState] = useState('');
  const [persistMaster, setPersistMasterState] = useState(true);
  const [isUnlocked, setIsUnlocked]         = useState(false);
  const [activeServicePassword, setActiveServicePassword] = useState('');

  // load persisted master password once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [stored, flag] = await Promise.all([getMasterPassword(), getPersistMasterFlag()]);
        if (mounted) {
          setPersistMasterState(flag === true);
          if (flag === true && stored) setMasterPasswordState(stored);
        }
      } catch (e) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  const unlock = useCallback(() => setIsUnlocked(true), []);

  // keep master password persisted; do not remove persisted master on lock
  const lock = useCallback(() => {
    setIsUnlocked(false);
    setActiveServicePassword('');
  }, []);

  const setMasterPassword = useCallback((value) => {
    setMasterPasswordState(value);
    // persist securely only if user enabled persistence
    if (value && value.length > 0 && persistMaster) {
      saveMasterPassword(value).catch(() => {});
    } else if (!persistMaster) {
      // ensure no persisted master remains
      deleteMasterPassword().catch(() => {});
    }
  }, [persistMaster]);

  const setPersistMaster = useCallback((enabled) => {
    setPersistMasterState(enabled);
    savePersistMasterFlag(enabled).catch(() => {});
    if (!enabled) {
      // remove any stored master when disabling
      deleteMasterPassword().catch(() => {});
    } else {
      // if enabling and we have a master in state, persist it
      if (masterPassword && masterPassword.length > 0) saveMasterPassword(masterPassword).catch(() => {});
    }
  }, [masterPassword]);

  return (
    <AppContext.Provider value={{
      masterPassword,
      setMasterPassword,
      persistMaster,
      setPersistMaster,
      isUnlocked,
      unlock,
      lock,
      activeServicePassword,
      setActiveServicePassword,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}