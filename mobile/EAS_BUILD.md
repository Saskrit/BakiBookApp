# EAS Build troubleshooting

## `tar: Permission denied` / missing `src/` files

### Cause 1 — Mobile code not in git (most common)

`mobile/` was created with `create-expo-app`, which adds its own `.git`. EAS then built commit `eb87c9f` (empty template) **without** your `src/` screens and API code.

**Fix:** Mobile is now part of the main repo. Commit and push:

```bash
cd "path/to/BakiBookApp"
git add mobile/
git commit -m "Add BakiBook mobile app source for EAS builds"
git push
```

Then rebuild:

```bash
cd mobile
npm run build:android
```

### Cause 2 — OneDrive blocks file reads

Projects under **OneDrive** (`OneDrive - London Metropolitan University\...`) often cause `Permission denied` when EAS packages files.

**Fix (pick one):**

1. In File Explorer → right-click project folder → **Always keep on this device**
2. Move the project to a local path, e.g. `C:\Projects\BakiBookApp`, and build from there
3. Close Cursor/terminals locking files, then rebuild

### Cause 3 — `.claude/` folder

Excluded via `mobile/.easignore` and `mobile/.gitignore`. If errors persist, delete `mobile/.claude/` locally.

---

## Before every EAS build

```bash
cd mobile
git status          # ensure src/ is committed
npm run build:android
```

Build from the `mobile` folder, not the repo root.
