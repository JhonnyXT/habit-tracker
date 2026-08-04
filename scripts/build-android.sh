#!/usr/bin/env bash
set -euo pipefail

VARIANT="${1:-}"

case "$VARIANT" in
  dev)
    GRADLE_TASK="assembleDebug"
    APK="android/app/build/outputs/apk/debug/app-debug.apk"
    ;;
  test)
    GRADLE_TASK="assembleRelease"
    APK="android/app/build/outputs/apk/release/app-release.apk"
    ;;
  prod)
    echo "El variant prod se construye con EAS, no en local:" >&2
    echo "  npm run eas:prod" >&2
    echo "Un assembleRelease local se firmaría con la debug keystore y Play lo rechazaría." >&2
    exit 1
    ;;
  *)
    echo "Uso: $0 <dev|test>" >&2
    exit 1
    ;;
esac

export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
export JAVA_HOME="${JAVA_HOME:-$HOME/.local/jdk-17}"
export APP_VARIANT="$VARIANT"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> prebuild ($VARIANT)"
npx expo prebuild --platform android --clean

echo "sdk.dir=$ANDROID_HOME" > android/local.properties

echo "==> gradle $GRADLE_TASK"
(cd android && ./gradlew "$GRADLE_TASK")

if adb get-state >/dev/null 2>&1; then
  echo "==> adb install"
  adb install -r "$APK"
  adb reverse tcp:8081 tcp:8081 || true
else
  echo "==> sin dispositivo conectado; APK en $APK"
fi
