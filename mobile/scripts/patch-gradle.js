/**
 * Gradle 9 + React Native: bump foojay-resolver-convention (0.5.0 breaks with IBM_SEMERU removed).
 * Also applies BakiBook Android tweaks (APK filename, Windows long paths).
 * Cross-platform replacement for patch-gradle.ps1 (EAS builds run on Linux).
 */
const fs = require('fs');
const path = require('path');

const mobileRoot = path.join(__dirname, '..');

function patchFoojay() {
  const file = path.join(
    mobileRoot,
    'node_modules',
    '@react-native',
    'gradle-plugin',
    'settings.gradle.kts'
  );

  if (!fs.existsSync(file)) {
    return;
  }

  const content = fs.readFileSync(file, 'utf8');
  const broken = 'foojay-resolver-convention").version("0.5.0")';
  const fixed = 'foojay-resolver-convention").version("1.0.0")';

  if (content.includes(broken)) {
    fs.writeFileSync(file, content.replace(broken, fixed), 'utf8');
  }
}

function patchGradleProperties() {
  const file = path.join(mobileRoot, 'android', 'gradle.properties');
  if (!fs.existsSync(file)) {
    return;
  }

  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('android.enableLongPaths')) {
    content = `${content.trim()}\n\n# Windows: allow Gradle/CMake paths longer than 260 characters\nandroid.enableLongPaths=true\n`;
    fs.writeFileSync(file, content, 'utf8');
  }
}

function patchApkFilename() {
  const marker = 'BakiBook: friendly APK filename';
  const file = path.join(mobileRoot, 'android', 'app', 'build.gradle');
  if (!fs.existsSync(file)) {
    return;
  }

  let content = fs.readFileSync(file, 'utf8');
  if (content.includes(marker)) {
    return;
  }

  const snippet = `
// ${marker} (release -> BakiBook.apk, debug -> BakiBook-debug.apk)
android.applicationVariants.configureEach { variant ->
    variant.outputs.configureEach { output ->
        def suffix = variant.buildType.name == "release" ? "" : "-\${variant.buildType.name}"
        output.outputFileName = "BakiBook\${suffix}.apk"
    }
}
`;

  if (!/^dependencies \{/m.test(content)) {
    return;
  }

  content = content.replace(/^dependencies \{/m, `${snippet}\ndependencies {`);
  fs.writeFileSync(file, content, 'utf8');
}

function patchGradlewBat() {
  const marker = 'BakiBook: short Gradle cache path';
  const file = path.join(mobileRoot, 'android', 'gradlew.bat');
  if (!fs.existsSync(file)) {
    return;
  }

  let content = fs.readFileSync(file, 'utf8');
  if (content.includes(marker)) {
    return;
  }

  const snippet = `@rem ${marker} (Windows 260-char / ninja limit)
if "%OS%"=="Windows_NT" (
  if not exist "C:\\bk-gradle" mkdir "C:\\bk-gradle" 2>nul
  set "GRADLE_USER_HOME=C:\\bk-gradle"
)

`;

  content = content.replace(
    /if "%OS%"=="Windows_NT" setlocal\r?\n\r?\n/,
    `if "%OS%"=="Windows_NT" setlocal\n\n${snippet}`
  );
  fs.writeFileSync(file, content, 'utf8');
}

function patchGradlewJavaHome() {
  const marker = 'BakiBook: use Android Studio bundled JDK';
  const file = path.join(mobileRoot, 'android', 'gradlew.bat');
  if (!fs.existsSync(file)) {
    return;
  }

  let content = fs.readFileSync(file, 'utf8');
  if (content.includes(marker)) {
    return;
  }

  const snippet = `@rem ${marker} when JAVA_HOME is unset
if exist "C:\\Program Files\\Android\\Android Studio\\jbr\\bin\\java.exe" (
  set "JAVA_HOME=C:\\Program Files\\Android\\Android Studio\\jbr"
  goto findJavaFromJavaHome
)
if exist "%LOCALAPPDATA%\\Programs\\Android Studio\\jbr\\bin\\java.exe" (
  set "JAVA_HOME=%LOCALAPPDATA%\\Programs\\Android Studio\\jbr"
  goto findJavaFromJavaHome
)

`;

  content = content.replace(
    /@rem Find java\.exe\r?\nif defined JAVA_HOME goto findJavaFromJavaHome\r?\n\r?\nset JAVA_EXE=java\.exe/,
    `@rem Find java.exe\nif defined JAVA_HOME goto findJavaFromJavaHome\n\n${snippet}set JAVA_EXE=java.exe`
  );
  fs.writeFileSync(file, content, 'utf8');
}

patchFoojay();
patchGradleProperties();
patchApkFilename();
patchGradlewBat();
patchGradlewJavaHome();
