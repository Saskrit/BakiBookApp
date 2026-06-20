# Run BakiBook in Android Studio

This app uses **Expo**. Android Studio runs the native Android project; Metro (Expo) serves the JavaScript.

## One-time setup

### 1. Android Studio

1. Open **Android Studio** → **More Actions** → **SDK Manager**
2. Install:
   - **Android SDK Platform** (API 34 or 35 recommended)
   - **Android SDK Build-Tools**
   - **Android SDK Platform-Tools**
3. **Device Manager** → **Create Virtual Device** → e.g. **Pixel 6** → **API 34** → Finish

### 2. Environment variables (Windows)

Add to your user environment variables (Settings → System → About → Advanced → Environment Variables):

| Variable | Value |
|----------|--------|
| `JAVA_HOME` | `C:\Program Files\Android\Android Studio\jbr` |
| `ANDROID_HOME` | `C:\Users\<YOU>\AppData\Local\Android\Sdk` |
| Path entry | `%JAVA_HOME%\bin` |
| Path entry | `%ANDROID_HOME%\platform-tools` |
| Path entry | `%ANDROID_HOME%\emulator` |

Restart Cursor/terminal after saving.

**Shortcut:** `npm run android` uses `scripts/run-android.ps1`, which sets `JAVA_HOME` and `ANDROID_HOME` automatically for that session (no permanent env vars required).

Verify:

```powershell
adb devices
```

### 3. Install mobile dependencies

```powershell
cd mobile
npm install
```

### 4. API URL for emulator

Your `mobile/.env` can stay on Railway:

```
EXPO_PUBLIC_API_URL=https://bakibookapp-production.up.railway.app/api
```

For a **local** backend instead, use:

```
EXPO_PUBLIC_API_URL=http://10.0.2.2:5001/api
```

(`10.0.2.2` is how the Android emulator reaches your PC’s `localhost`.)

---

## Option A — Easiest (recommended)

1. Start the emulator: **Android Studio → Device Manager → Play** on your AVD
2. From the project:

```powershell
cd mobile
npm run android
```

This generates `mobile/android`, builds the app, installs it on the emulator, and starts Metro.

---

## Option B — Open project in Android Studio

Generate the native project once:

```powershell
cd mobile
npm run prebuild:android
```

Then:

1. **Android Studio → File → Open**
2. Select folder: `BakiBookApp/mobile/android` (not the repo root)
3. Wait for Gradle sync to finish
4. In a terminal, start Metro:

```powershell
cd mobile
npm start
```

5. In Android Studio, click the green **Run** button (choose your emulator)

---

## Daily development

| Task | Command |
|------|---------|
| Run on emulator | `cd mobile` then `npm run android` |
| JS-only changes | Save file — app hot-reloads |
| After adding native packages | `npm run prebuild:android` then rebuild |
| Open native project | Open `mobile/android` in Android Studio |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `adb: command not found` | Set `ANDROID_HOME` and add platform-tools to Path |
| No devices | Start AVD from Device Manager |
| Gradle / JDK errors | Set `JAVA_HOME` to `C:\Program Files\Android\Android Studio\jbr`, or use `npm run android` (auto-configures) |
| `JAVA_HOME is not set` | Same as above — Android Studio bundles JDK 17 in its `jbr` folder |
| Build fails: path longer than 260 characters | OneDrive + long folder name. `npm run android` maps a short drive (`B:`) automatically; or move project to `C:\Projects\BakiBookApp` |
| `buildCMakeDebug` / ninja MAX_PATH error | Same as above — clear `android/app/.cxx` and rebuild from short path |
| `IBM_SEMERU` / Gradle build failed | Run `npm install` in `mobile/` (applies Gradle patch), then `npm run android` again |
| First Gradle build slow | Normal (5–15 min). Gradle zip download + daemon startup |
| Cannot reach API | Check `mobile/.env`; emulator + local server → use `10.0.2.2` |

---

## Expo Go vs native build

| Method | Command | Use when |
|--------|---------|----------|
| **Native (Android Studio)** | `npm run android` | Full app, camera/QR, real launcher icon |
| **Expo Go** | `npm run android:expo-go` | Quick JS testing without Gradle build |

For QR scanner and production-like behavior, use **Option A** (`npm run android`).
