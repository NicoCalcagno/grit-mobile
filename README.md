# GRIT — AI Personal Trainer Mobile App

GRIT è un'app iOS di personal training alimentata da AI. Genera piani di allenamento settimanali personalizzati, ti allena in tempo reale con un coach vocale, traccia la nutrizione e integra HealthKit e Spotify.

---

## Stack tecnico

| Layer | Tecnologia |
|---|---|
| Framework | React Native 0.76.3 + Expo SDK 52 (bare workflow) |
| Language | TypeScript (strict) |
| Navigation | React Navigation v7 (native stack + bottom tabs) |
| State | Zustand v5 (5 store) |
| HTTP | axios + interceptor JWT / refresh token |
| Animations | react-native-reanimated 3.16 + react-native-svg |
| TTS / STT | expo-speech + @react-native-voice/voice |
| Fitness | react-native-health (HealthKit) |
| Camera | expo-camera + expo-image-manipulator |
| Music | react-native-spotify-remote |
| Storage | @react-native-async-storage/async-storage |

---

## Prerequisiti

- **macOS** con Xcode 16+
- **Node.js** 20+
- **CocoaPods** (`brew install cocoapods`)
- Account Apple Developer (per HealthKit su device fisico)
- Account Spotify Developer (per integrazione musicale)

---

## Setup

```bash
# 1. Clona e installa le dipendenze JS
git clone https://github.com/NicoCalcagno/grit-mobile.git
cd grit-mobile
npm install

# 2. Configura le variabili d'ambiente
cp .env.example .env
# Edita .env con i tuoi valori

# 3. Genera il progetto Xcode nativo
npx expo prebuild --platform ios

# 4. Installa le dipendenze native iOS
cd ios && pod install && cd ..

# 5. Avvia l'app sul simulatore
npx expo run:ios

# oppure su device fisico
npx expo run:ios --device
```

### Variabili d'ambiente (`.env`)

```env
GRIT_API_URL=https://api.grit.app          # URL del backend
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_REDIRECT_URI=grit://spotify-callback
```

---

## Struttura del progetto

```
grit-mobile/
├── App.tsx                        # Entry point (SafeAreaProvider)
├── index.js                       # registerRootComponent
├── app.json                       # Config Expo (scheme, permissions, HealthKit)
├── ios/
│   └── Grit/
│       └── Info.plist             # Permessi iOS (HealthKit, mic, camera, speech)
└── src/
    ├── api/
    │   └── client.ts              # axios: JWT interceptor + refresh token queue
    ├── constants/
    │   └── theme.ts               # Design system (colori, tipografia, spacing, radii)
    ├── types/
    │   └── index.ts               # Tutti i tipi TypeScript allineati con il backend
    ├── stores/                    # Zustand stores
    │   ├── authStore.ts           # Auth: login, register, logout, initialize
    │   ├── userStore.ts           # Profilo utente: fetch, update
    │   ├── workoutStore.ts        # Piano settimanale, sessioni, esercizi
    │   ├── nutritionStore.ts      # Diario alimentare, piano dieta, insights
    │   └── musicStore.ts          # Spotify OAuth, raccomandazioni, playback
    ├── hooks/
    │   ├── useWorkoutTimer.ts     # Timer elapsed + countdown rest
    │   ├── useHealthKit.ts        # Permessi HealthKit, HR polling (5s), calorie
    │   ├── useCoach.ts            # Coach AI: rate limit 20s + backoff 60s su 429
    │   ├── useVoiceInput.ts       # STT → POST /coach/voice-response → modifiche
    │   └── useSpotifyPlayer.ts    # Playback SDK con fallback simulatore
    ├── navigation/
    │   ├── AppNavigator.tsx       # Root: Auth / Onboarding / Main + deep link Spotify
    │   ├── AuthNavigator.tsx      # Login, Register
    │   ├── OnboardingNavigator.tsx# Welcome → Profilo → Obiettivi → Fitness → Coach
    │   ├── MainTabNavigator.tsx   # Bottom tabs: Home, Nutrizione, Progresso, Settings
    │   └── WorkoutNavigator.tsx   # Setup → Sessione → Riposo → Post-workout
    ├── screens/
    │   ├── auth/
    │   │   ├── LoginScreen.tsx
    │   │   └── RegisterScreen.tsx
    │   ├── onboarding/
    │   │   ├── WelcomeScreen.tsx
    │   │   ├── ProfileSetupScreen.tsx
    │   │   ├── GoalsScreen.tsx
    │   │   ├── FitnessLevelScreen.tsx
    │   │   └── CoachPrefsScreen.tsx
    │   ├── home/
    │   │   └── HomeScreen.tsx
    │   ├── workout/
    │   │   ├── WorkoutSetupScreen.tsx
    │   │   ├── ActiveWorkoutScreen.tsx
    │   │   └── RestTimerScreen.tsx
    │   │   └── PostWorkoutScreen.tsx
    │   ├── nutrition/
    │   │   ├── NutritionDashboardScreen.tsx
    │   │   ├── FoodLogScreen.tsx
    │   │   ├── FoodSearchScreen.tsx
    │   │   ├── BarcodeScannerScreen.tsx
    │   │   ├── PhotoFoodScreen.tsx
    │   │   └── DietPlanScreen.tsx
    │   ├── progress/
    │   │   └── ProgressScreen.tsx
    │   └── settings/
    │       └── SettingsScreen.tsx
    └── components/
        ├── ui/
        │   ├── GritButton.tsx     # variants: primary/secondary/ghost/danger, sm/md/lg
        │   └── GritCard.tsx       # Card con shadow elevata
        ├── workout/
        │   ├── ProgressRing.tsx   # Anello SVG animato (reanimated)
        │   ├── ExerciseCard.tsx   # Nome, muscoli, set/reps/rest
        │   └── HeartRateWidget.tsx# BPM pulsante con zone colore
        ├── nutrition/
        │   ├── CalorieRing.tsx    # Ring calorie consumate/target
        │   ├── MacroBar.tsx       # Barra progress proteine/carbo/grassi
        │   ├── FoodLogItem.tsx    # Voce diario con macro
        │   └── InsightCard.tsx    # Card insight AI nutrizionale
        ├── coach/
        │   ├── CoachBubble.tsx    # Bubble testo coach con fade-in/out
        │   └── VoiceInputButton.tsx# Tasto press-hold STT con pulse animation
        └── music/
            └── MiniPlayer.tsx     # Player Spotify compatto con controlli
```

---

## Funzionalità principali

### Autenticazione
JWT con refresh token automatico. Il client axios intercetta gli errori 401, accoda le richieste in sospeso, rinnova il token e le riescegue. I token sono persistiti su AsyncStorage.

### Onboarding (4 step)
1. **Profilo** — nome, età, peso (kg), altezza (cm), sesso
2. **Obiettivi** — multi-select: dimagrire, massa, resistenza, benessere, flessibilità
3. **Livello & preferenze** — livello fitness, giorni disponibili, tipi di allenamento
4. **Coach AI** — lingua (IT/EN), tono (motivante / aggressivo / zen)

Al termine dell'onboarding viene generato automaticamente il primo piano settimanale via AI.

### Piano allenamento & sessione attiva
- Il piano settimanale viene generato dall'AI in base al profilo e agli obiettivi
- La sessione attiva mostra esercizio corrente, set, timer di riposo e frequenza cardiaca in tempo reale (HealthKit, polling 5s)
- I dati HealthKit vengono sincronizzati al backend ogni 30 secondi
- Al completamento di ogni serie → `RestTimerScreen` con countdown animato
- A fine workout → riepilogo AI letto via TTS, rating percepito, condivisione

### Coach AI vocale
- Messaggi automatici su eventi chiave (inizio esercizio, fine serie, alto battito, metà workout, ecc.)
- Rate limiting client-side: minimo 20s tra un messaggio e il successivo
- Backoff automatico di 60s in caso di risposta HTTP 429 (limite 3 req/min backend)
- Timeout 3s con fallback a messaggi locali
- Comandi vocali via STT: l'utente può chiedere modifiche in tempo reale (es. "riduci il peso", "salta questo esercizio")

### Nutrizione
| Modalità | Descrizione |
|---|---|
| Foto | Scatta una foto → AI riconosce gli alimenti → l'utente conferma |
| Barcode | Scansione codice a barre → dettagli prodotto → log immediato |
| Ricerca | Ricerca testuale con debounce 500ms → selezione → log con grammi |

Il diario è suddiviso per pasto (colazione, pranzo, cena, snack). Il piano dietetico viene generato dall'AI e può essere rigenerato giorno per giorno.

### Spotify
- OAuth via deep link `grit://spotify-callback`
- Raccomandazioni musicali in base al tipo di allenamento e `perceived_exertion`
- Controlli play/pause/skip con MiniPlayer sovrapposto alla sessione

### Progresso & Analytics
- Grafico sessioni settimanali, calorie bruciate, distribuzione muscolare
- Streak e achievement sbloccati automaticamente
- Riepilogo settimanale generato dall'AI

---

## Design system

Tema dark con palette:

| Token | Valore | Uso |
|---|---|---|
| `colors.background` | `#0D0D0D` | Sfondo principale |
| `colors.surface` | `#1A1A1A` | Card, input |
| `colors.primary` | `#FF4D00` | CTA, accenti, progresso |
| `colors.accent` | `#FFD700` | Achievement, highlight |
| `colors.text` | `#FFFFFF` | Testo primario |
| `colors.textSecondary` | `#A0A0A0` | Label, sottotitoli |

Tutti i componenti usano i token da `src/constants/theme.ts`. Non sono presenti valori hardcoded.

---

## API Backend

Il backend espone REST API con autenticazione JWT. Tutti i campi sono in `snake_case`.

Base URL configurabile via `GRIT_API_URL` nel file `.env`.

Endpoint principali:

```
POST   /auth/login
POST   /auth/register
POST   /auth/logout
POST   /auth/refresh

GET    /users/me
PUT    /users/me

GET    /workouts/weekly-plan/current
POST   /workouts/weekly-plan/generate
POST   /workouts/sessions/start
PUT    /workouts/sessions/:id
POST   /workouts/sessions/:id/complete

POST   /coach/message
POST   /coach/voice-response

GET    /nutrition/summary
POST   /nutrition/logs
POST   /nutrition/logs/photo
GET    /food/search
GET    /nutrition/diet-plan/current
POST   /nutrition/diet-plan/generate
POST   /nutrition/diet-plan/regenerate-day

GET    /progress/workouts
GET    /progress/nutrition
GET    /progress/weekly-summary

GET    /music/auth-url
POST   /music/callback
GET    /music/recommendations
```

---

## Note per lo sviluppo

- **HealthKit** funziona solo su device fisico. Il simulatore restituisce dati vuoti/mock.
- **Spotify SDK** (`react-native-spotify-remote`) richiede device fisico con l'app Spotify installata. In simulatore le chiamate al player sono avvolte in try/catch con fallback silenzioso.
- **STT** (`@react-native-voice/voice`) richiede permesso microfono e funziona solo su device fisico.
- Dopo `expo prebuild`, il progetto Xcode si trova in `ios/`. Aprire `ios/Grit.xcworkspace` (non `.xcodeproj`).
- Per aggiornare i permessi iOS, modificare `app.json` e ri-eseguire `expo prebuild`.
