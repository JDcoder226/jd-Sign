# Vault-Gen (jd-Sign)

Un générateur de mots de passe local et gestionnaire de services (React Native + Expo).

Ce dépôt contient l'application mobile "JD-SIGN" (nom de code `jd-Sign`) : un coffre local qui génère des mots de passe dérivés par PBKDF2-HMAC-SHA256 à partir d'un mot de passe maître, permet de sauvegarder des services, copier des mots de passe et gérer un PIN d'accès.

**Principales fonctionnalités**

- **PIN 6 chiffres** : écran de verrouillage/déverrouillage sécurisé.
- **Mot de passe maître** : utilisé pour dériver les mots de passe; option pour le persister en SecureStore.
- **Générateur de mot de passe** : PBKDF2-HMAC-SHA256, paramètres configurables (longueur, alphabet, counter).
- **Services** : ajouter/éditer/supprimer des services, stockage persistant via AsyncStorage.
- **Copie & auto-clear** : copier le mot de passe dans le presse-papiers avec effacement automatique.
- **Thèmes** : thème cyber/dark et thème clair avec bascule depuis les paramètres.
- **Hermes-friendly** : icônes vectorielles et pattern défensif des thèmes pour éviter les crashes Hermes.

---

**Table des matières**

- [Prérequis](#prérequis)
- [Installation (dev)](#installation-dev)
- [Exécuter sur un téléphone (Expo Go)](#exécuter-sur-un-téléphone-expo-go)
- [Build de production (APK / TestFlight) avec EAS](#build-de-production-apk--testflight-avec-eas)
- [Configuration importante](#configuration-importante)
- [Architecture du projet](#architecture-du-projet)
- [Scripts utiles](#scripts-utiles)
- [Données sensibles & sécurité](#données-sensibles--sécurité)
- [Contribuer](#contribuer)
- [Licence](#licence)

---

## Prérequis

- Node.js (>= 18 recommandé)
- npm ou yarn
- Expo CLI (facultatif pour dev) : `npm install -g expo-cli`
- Pour builds natives/production : `eas-cli` (npm i -g eas-cli) et un compte Expo/Apple/Google

## Installation (dev)

1. Clone le dépôt et installe les dépendances :

```bash
cd /Users/apple/Desktop/INP24-25/ING2/s8/React\ Native/jd-sign
npm install
```

2. Démarrer Metro / Expo :

```bash
npm start
# ou
expo start
```

3. Ouvre l'interface dev dans ton navigateur ou scanne le QR code avec Expo Go.

## Exécuter sur un téléphone (Expo Go)

- Installe `Expo Go` depuis l'App Store / Play Store.
- Connecte ton téléphone et ton ordinateur au même réseau Wi‑Fi (ou choisis le tunnel dans Expo).
- Lance `npm start` puis scanne le QR code dans Expo Go — l'app s'ouvrira dans Expo Go.

Note : l'expérience dans Expo Go est utile pour le développement rapide, mais certaines fonctionnalités natives (et le runtime Hermes) doivent être testées via un build natif ou un `dev client`.

## Build de production (APK / TestFlight) avec EAS

1. Installer et configurer EAS :

```bash
npm install -g eas-cli
eas login
cd /Users/apple/Desktop/INP24-25/ING2/s8/React\ Native/jd-sign
eas build:configure
```

2. Lancer une build :

```bash
# Android
eas build -p android

# iOS (nécessite compte Apple)
eas build -p ios
```

3. Télécharger l'artifact depuis la page de build Expo et installer sur l'appareil :

- Android: installe l'APK directement ou via `adb install /chemin/vers/app.apk`.
- iOS: distribue via TestFlight ou installe via Xcode sur un appareil connecté.

## Configuration importante

- Le PIN est stocké dans `SecureStore`.
- Les services sont sauvegardés localement via `AsyncStorage` (clé: `vaultgen_services`).
- Le mot de passe maître peut être persisté en `SecureStore` (clé: `vaultgen_master_password`) — l'utilisateur peut activer/désactiver cette persistance depuis les `Paramètres`.
- Pour nettoyer l'app : `clearAll()` supprime PIN, services et master stocké.

## Architecture du projet

- `App.js` — point d'entrée, providers (ThemeProvider, AppProvider) et navigation.
- `src/context` — `AppContext`, `ThemeContext`.
- `src/screens` — écrans : `HomeScreen`, `GeneratorScreen`, `PinSetupScreen`, `PinLockScreen`, `SettingsScreen`, etc.
- `src/components` — composants réutilisables : `NumPad`, `PasswordDisplay`, `ServiceCard`, `PinDots`.
- `src/utils` — `storage.js` (SecureStore/AsyncStorage wrappers), `crypto.js` (PBKDF2 derivation), helpers.
- `src/theme` — thèmes et variables (cyber, light).

## Scripts utiles

- `npm start` — démarre Metro / Expo
- `npm run android` — lance sur émulateur Android (si configuré)
- `npm run ios` — lance sur simulateur iOS (macOS + Xcode)
- `eas build -p android|ios` — lancer build de production via EAS

## Données sensibles & sécurité

- L'application dérive des mots de passe via PBKDF2-HMAC-SHA256. Les valeurs maîtres ne quittent jamais l'app (sauf si tu les exportes explicitement).
- Persister le mot de passe maître augmente le confort mais réduit la sécurité en cas de compromission de l'appareil : utilise le toggle dans `Paramètres` pour contrôler ce comportement.
- Ne partage pas ton mot de passe maître ni les backups d'AsyncStorage.

## Tests rapides (conseils)

- Démarre l'app en local, crée un PIN, entre un mot de passe maître, génère un service et vérifie que :
	- le service apparaît dans l'écran d'accueil
	- le bouton copier place le mot dans le presse-papiers et s'efface après le délai
	- redémarre l'app (ou ferme/réouvre) et vérifie que la persistance du master se comporte selon la préférence dans `Paramètres`.

## Contribuer

- Fork et crée une branche pour ta fonctionnalité : `git checkout -b feat/ma-fonction`
- Ouvre une PR décrivant les changements et les tests effectués.

## Licence

Ce dépôt est fourni sans licence explicite; ajoute un fichier `LICENSE` si tu veux appliquer une licence.


