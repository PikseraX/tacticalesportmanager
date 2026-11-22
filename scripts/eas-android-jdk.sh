set -eu

# Capacitor's Android modules compile with Java 21.
case "$(uname -m)" in
  x86_64) architecture=x64 ;;
  aarch64) architecture=aarch64 ;;
  *) printf 'Unsupported build architecture: %s\n' "$(uname -m)" >&2; exit 1 ;;
esac

jdk_dir="$(mktemp -d)"
archive="amazon-corretto-21-${architecture}-linux-jdk.tar.gz"
curl --fail --silent --show-error --location --retry 3 \
  "https://corretto.aws/downloads/latest/$archive" -o "$jdk_dir/$archive"
checksum="$(curl --fail --silent --show-error --location --retry 3 \
  "https://corretto.aws/downloads/latest_sha256/$archive")"
(cd "$jdk_dir" && printf '%s  %s\n' "$checksum" "$archive" | sha256sum --check)
tar -xzf "$jdk_dir/$archive" -C "$jdk_dir" --strip-components=1
rm "$jdk_dir/$archive"
"$jdk_dir/bin/javac" -version

# Persist the daemon JDK across the hook and EAS's subsequent Gradle step.
printf '\norg.gradle.java.home=%s\n' "$jdk_dir" >> android/gradle.properties
