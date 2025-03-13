import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import colors from "../../assets/colors";
import LocalStorageService from "../utils/LocalStorageVariables";

const Settings = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [username, setUsername] = useState("");

  // Fetch username from AsyncStorage
  useEffect(() => {
    const fetchUsername = async () => {
      const storedUsername = await LocalStorageService.getUserName();
      if (storedUsername) {
        setUsername(storedUsername);
      }
    };
    fetchUsername();
  }, []);

  return (
    <>
      {/* Settings Icon */}
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Ionicons
          name="settings-outline"
          size={24}
          color={colors.common.white}
        />
      </TouchableOpacity>

      {/* Modal for Settings */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={styles.modalOverlay}
          onTouchEnd={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.username}>hey, {username}</Text>
            <Text
              style={styles.option}
              onPress={() => setPrivacyModalVisible(true)}
            >
              Privacy Policy
            </Text>
            <TouchableOpacity style={styles.syncButton}>
              <Text style={styles.syncButtonText}>Sync</Text>
              <Text style={styles.comingSoonText}>Coming Soon</Text>
            </TouchableOpacity>
            <Text style={styles.madeBy}>
              Made with ❤️ by{" "}
              <TouchableOpacity
                onPress={() => Linking.openURL("https://smoke221.github.io/")}
              >
                <Text
                  style={{
                    color: colors.primary.main,
                    top: 3.5,
                    fontWeight: 500,
                    fontSize: 10,
                  }}
                >
                  anil
                </Text>
              </TouchableOpacity>
            </Text>
          </View>
        </View>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        transparent
        visible={privacyModalVisible}
        animationType="slide"
        onRequestClose={() => setPrivacyModalVisible(false)}
      >
        <View style={styles.privacyModalOverlay}>
          <View style={styles.privacyModalContent}>
            <Text style={styles.privacyTitle}>Privacy Policy</Text>
            <Text style={styles.privacyText}>
              We don't collect or store any of your data. Seriously, we don't
              even know your favorite color.
              {"\n\n"}
              Your secrets are safe with us... because we don't have them!
              {"\n\n"}
              If you're still worried, just remember: we're too lazy to spy on
              you. 😴
            </Text>
            <TouchableOpacity
              style={styles.privacyCloseButton}
              onPress={() => setPrivacyModalVisible(false)}
            >
              <Text style={styles.privacyCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end", // Align modal to the bottom
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20, // Rounded corners at the top
    borderTopRightRadius: 20,
    width: Dimensions.get("window").width, // Full width of the screen
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2, // Shadow at the top
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  username: { fontSize: 16, marginBottom: 10, color: colors.primary.main },
  option: { fontSize: 16, paddingVertical: 5 },
  syncButton: {
    marginTop: 20,
    backgroundColor: colors.primary.main,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  syncButtonText: {
    color: colors.common.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  comingSoonText: {
    color: colors.text.secondary,
    fontSize: 12,
    marginTop: 5,
  },
  privacyModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  privacyModalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  privacyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  privacyText: {
    fontSize: 16,
    marginBottom: 20,
  },
  privacyCloseButton: {
    backgroundColor: colors.primary.main,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  privacyCloseButtonText: {
    color: colors.common.white,
    fontSize: 16,
    fontWeight: "bold",
  },
  madeBy: {
    fontSize: 8,
    marginTop: 10,
    textAlign: "center",
  },
});

export default Settings;
