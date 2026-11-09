#!/usr/bin/env bash
set -euo pipefail

test -n "$IOS_CERTIFICATE_BASE64"
test -n "$IOS_CERTIFICATE_PASSWORD"
test -n "$IOS_PROVISIONING_PROFILE_BASE64"
test -n "$APPLE_TEAM_ID"

KEYCHAIN_PASSWORD="$(openssl rand -hex 24)"
KEYCHAIN_PATH="$RUNNER_TEMP/taskflow-signing.keychain-db"
CERTIFICATE_PATH="$RUNNER_TEMP/taskflow-distribution.p12"
PROFILE_PATH="$RUNNER_TEMP/taskflow.mobileprovision"
PROFILE_PLIST="$RUNNER_TEMP/taskflow-profile.plist"

printf '%s' "$IOS_CERTIFICATE_BASE64" | base64 --decode > "$CERTIFICATE_PATH"
printf '%s' "$IOS_PROVISIONING_PROFILE_BASE64" | base64 --decode > "$PROFILE_PATH"
security create-keychain -p "$KEYCHAIN_PASSWORD" "$KEYCHAIN_PATH"
security set-keychain-settings -lut 21600 "$KEYCHAIN_PATH"
security unlock-keychain -p "$KEYCHAIN_PASSWORD" "$KEYCHAIN_PATH"
security list-keychains -d user -s "$KEYCHAIN_PATH"
security default-keychain -s "$KEYCHAIN_PATH"
security import "$CERTIFICATE_PATH" -P "$IOS_CERTIFICATE_PASSWORD" -A -t cert -f pkcs12 -k "$KEYCHAIN_PATH"
security set-key-partition-list -S apple-tool:,apple: -s -k "$KEYCHAIN_PASSWORD" "$KEYCHAIN_PATH"

security cms -D -i "$PROFILE_PATH" > "$PROFILE_PLIST"
PROFILE_UUID=$(/usr/libexec/PlistBuddy -c "Print :UUID" "$PROFILE_PLIST")
PROFILE_NAME=$(/usr/libexec/PlistBuddy -c "Print :Name" "$PROFILE_PLIST")
mkdir -p "$HOME/Library/MobileDevice/Provisioning Profiles"
cp "$PROFILE_PATH" "$HOME/Library/MobileDevice/Provisioning Profiles/$PROFILE_UUID.mobileprovision"

xcodebuild \
  -project ios/App/App.xcodeproj \
  -scheme App \
  -configuration Release \
  -archivePath "$RUNNER_TEMP/Taskflow.xcarchive" \
  -destination 'generic/platform=iOS' \
  CODE_SIGN_STYLE=Manual \
  DEVELOPMENT_TEAM="$APPLE_TEAM_ID" \
  PROVISIONING_PROFILE_SPECIFIER="$PROFILE_NAME" \
  CODE_SIGN_IDENTITY="Apple Distribution" \
  archive

python3 - <<'PY'
import os, plistlib
temp = os.environ["RUNNER_TEMP"]
with open(os.path.join(temp, "taskflow-profile.plist"), "rb") as source:
    name = plistlib.load(source)["Name"]
options = {
    "method": os.environ.get("IOS_EXPORT_METHOD", "ad-hoc"),
    "teamID": os.environ["APPLE_TEAM_ID"],
    "signingStyle": "manual",
    "provisioningProfiles": {"com.codewithroni.taskflow": name}
}
with open(os.path.join(temp, "ExportOptions.plist"), "wb") as destination:
    plistlib.dump(options, destination)
PY

mkdir -p release-output
xcodebuild -exportArchive \
  -archivePath "$RUNNER_TEMP/Taskflow.xcarchive" \
  -exportOptionsPlist "$RUNNER_TEMP/ExportOptions.plist" \
  -exportPath release-output
for file in release-output/*.ipa; do
  [ -f "$file" ] || continue
  mv "$file" "release-output/Taskflow-iOS-$(node -p "require('./package.json').version").ipa"
done
ls -lah release-output/*.ipa
