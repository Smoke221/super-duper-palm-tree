import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import colors from "../../../assets/colors";

const Settings = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [modalPosition, setModalPosition] = useState({ top: 0, right: 0 });
  const iconRef = useRef();

  const measureIconPosition = () => {
    iconRef.current.measure((x, y, width, height, pageX, pageY) => {
      setModalPosition({
        top: pageY + height,
        right: Dimensions.get("window").width - pageX - width,
      });
    });
  };

  return (
    <>
      {/* Settings Icon */}
      <TouchableOpacity
        ref={iconRef}
        onPress={() => {
          measureIconPosition();
          setModalVisible(true);
        }}
      >
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
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={styles.modalOverlay}
          onTouchEnd={() => setModalVisible(false)}
        >
          <View
            style={[
              styles.modalContent,
              {
                position: "absolute",
                top: modalPosition.top,
                right: modalPosition.right,
              },
            ]}
          >
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.option}>Account</Text>
            <Text style={styles.option}>Notifications</Text>
            <Text style={styles.option}>Privacy</Text>
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
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: 250,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  option: { fontSize: 16, paddingVertical: 5 },
});

export default Settings;
