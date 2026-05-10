# Grit Flutter Migration

This folder contains the complete Flutter rewrite of the Grit mobile app.

## Stack

| Layer | Technology |
|-------|------------|
| Language | Dart 3.3 |
| Framework | Flutter 3.x |
| State Management | Riverpod 2.5 |
| Navigation | GoRouter 14 |
| HTTP | Dio 5.4 + Auth Interceptor |
| Storage | flutter_secure_storage |
| Animations | flutter_animate 4.5 |
| Charts | Custom Canvas + fl_chart |
| Icons | Material Icons |

## Design System

- **Background**: `#000000` pure black
- **Surface**: `#0D0D0D` / `#141414`
- **Primary**: `#00FF87` neon green → `#00D4A0`
- **Accent**: `#7B2FFF` electric purple
- **Font**: Inter (800/700/600/500/400)
- **Animations**: flutter_animate with staggered delays
- **Cards**: Subtle border + glass-like surfaces

## Project Structure

```
lib/
  main.dart              # Entry point, system UI, portrait lock
  app.dart               # MaterialApp.router + ThemeData
  core/
    constants/           # AppColors, AppTypography, AppSpacing
    network/             # Dio client + auth interceptor + endpoints
    storage/             # SecureStorage wrapper
    router/              # GoRouter with auth redirect
    widgets/             # GritButton, GritTextField, GritCard
  models/                # Freezed data classes (User, Workout, Nutrition)
  features/
    auth/                # Login, Register + AuthNotifier (Riverpod)
    onboarding/          # 5-step flow (Profile, Goals, Level, Coach)
    shell/               # MainShell bottom nav
    home/                # HomeScreen: calorie ring, weekly charts
    workout/             # Dashboard, ActiveWorkout, RestTimer
    nutrition/           # Dashboard, FoodLog, FoodSearch
    progress/            # Charts: calories, streak, frequency grid
    settings/            # Profile, integrations, logout
```

## Getting Started

```bash
cd flutter_app
flutter pub get
flutter pub run build_runner build
flutter run
```

## Backend

Same FastAPI backend at `https://grit-backend.railway.app`.
All 23 API endpoints reused unchanged — only the frontend changes.

## Migration Status

- [x] Design system (colors, typography, spacing)
- [x] Authentication (login, register, JWT refresh)
- [x] Onboarding flow (5 screens)
- [x] Bottom navigation shell
- [x] Home screen (calorie ring, macros, weekly steps, training load)
- [x] Workout dashboard + active session
- [x] Nutrition dashboard (donut chart, weekly bars, meal list)
- [x] Food log + search + add sheet
- [x] Progress screen (stats, charts, streak, frequency grid)
- [x] Settings + profile
- [ ] Barcode scanner (mobile_scanner)
- [ ] Photo food log (image_picker + camera)
- [ ] Spotify integration
- [ ] AI Voice coach
- [ ] Apple HealthKit
- [ ] Push notifications
