# EAS Build troubleshooting

## `tar: Permission denied` (OneDrive + monorepo)

### What went wrong

Your project lives under **OneDrive**:

`OneDrive - London Metropolitan University\Document\BakiBookApp`

When EAS packages files, Windows/OneDrive often blocks reads → Linux on EAS cannot extract the archive:

```
tar: mobile/app.config.ts: Cannot open: Permission denied
package.json does not exist in /home/expo/workingdir/build/mobile
```

EAS was also uploading the **whole monorepo** (`client/`, `server/`, `mobile/`) instead of only the app.

### Fix — use the build script (recommended)

From `mobile/`:

```powershell
npm run build:android
```

This script:

1. Copies `mobile/` to `%LOCALAPPDATA%\bakibook-eas-build` (local disk, not OneDrive)
2. Skips `node_modules`, `.expo`, `.claude`
3. Runs `eas build` from that clean folder

Preview APK:

```powershell
npm run build:android:preview
```

### Fix — move project off OneDrive (permanent)

1. Copy `BakiBookApp` to e.g. `C:\Projects\BakiBookApp`
2. Open that folder in Cursor
3. Run `npm run build:android` from `mobile/`

Or in File Explorer: right-click `BakiBookApp` → **Always keep on this device**, then retry.

### Fix — build from GitHub (no local upload)

1. Push all code to GitHub (including `mobile/src/`)
2. On [expo.dev](https://expo.dev) → your project → **Build from GitHub**
3. EAS clones on their servers (no OneDrive involved)

---

## Mobile code not in git

If the build used commit `eb87c9f` (empty `create-expo-app` template only):

```powershell
cd "path\to\BakiBookApp"
git add mobile/
git commit -m "Add BakiBook mobile app source"
git push
```

---

## Before every EAS build

```powershell
cd mobile
npm run build:android
```

Do **not** run `eas build` from the repo root — only from `mobile/` or use the script above.

---

## Delete `.claude` if it causes issues

```powershell
Remove-Item -Recurse -Force mobile\.claude -ErrorAction SilentlyContinue
```

It is gitignored and excluded from EAS uploads.
