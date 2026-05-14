import Constants from "expo-constants";
import { Download, X } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../constants/theme";

// URL app.json from my GitHub
const REMOTE_CONFIG_URL =
  "https://gist.githubusercontent.com/Akarti5/ff3bddef094fe074ae501ffebb9d80cc/raw/version.json";
const UPDATE_LINK = "https://apkpure.com/p/com.anonymous.rikodestinationalarm";

export default function UpdateChecker() {
  const [showUpdate, setShowUpdate] = useState(false);
  const [ignored, setIgnored] = useState(false);
  const currentVersion = Constants.expoConfig?.version;

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const response = await fetch(`${REMOTE_CONFIG_URL}?t=${Date.now()}`);
        const data = await response.json();
        const remoteVersion = data.version;

        if (remoteVersion && currentVersion && isNewerVersion(remoteVersion, currentVersion)) {
          setShowUpdate(true);
        }
      } catch (error) {
        console.warn("Failed to check for updates:", error);
      }
    };

    checkVersion();
  }, []);

  const isNewerVersion = (remote: string, local: string) => {
    const remoteParts = remote.split(".").map(Number);
    const localParts = local.split(".").map(Number);

    for (let i = 0; i < Math.max(remoteParts.length, localParts.length); i++) {
      const r = remoteParts[i] || 0;
      const l = localParts[i] || 0;
      if (r > l) return true;
      if (r < l) return false;
    }
    return false;
  };

  if (!showUpdate || ignored) return null;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Download size={20} color={Colors.dark.orange} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Mise à jour disponible</Text>
          <Text style={styles.message}>
            Une nouvelle version de Rikô est disponible.
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.ignoreButton}
            onPress={() => setIgnored(true)}
          >
            <Text style={styles.ignoreButtonText}>IGNORER</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => Linking.openURL(UPDATE_LINK)}
          >
            <Text style={styles.buttonText}>INSTALLER</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 110, // Just below the search header
    left: 20,
    right: 20,
    zIndex: 2000,
  },
  card: {
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(254, 102, 21, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(254, 102, 21, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: Colors.dark.orange,
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  message: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 11,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  ignoreButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  ignoreButtonText: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 9,
    fontWeight: "900",
  },
  button: {
    backgroundColor: Colors.dark.orange,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 4,
  },
  buttonText: {
    color: "#000",
    fontSize: 10,
    fontWeight: "900",
  },
});
