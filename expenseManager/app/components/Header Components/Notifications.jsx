import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const Notifications = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [messages, setMessages] = useState([]); // Placeholder for SMS messages

  return (
    <>
      {/* Bell Icon to Open Notifications */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={{ marginRight: 15 }}
      >
        <MaterialCommunityIcons
          name="message-flash-outline"
          size={24}
          color="#888"
        />
      </TouchableOpacity>

      {/* Full-Screen Modal for Notifications */}
      <Modal
        transparent={false} // Makes it full screen
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContent}>
          {/* Header with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Notifications</Text>
          </View>

          {/* List of Messages */}
          {messages.length === 0 ? (
            <Text style={styles.emptyText}>No transactions yet.</Text>
          ) : (
            <FlatList
              data={messages}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <Text style={styles.message}>{item}</Text>
              )}
            />
          )}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    flex: 1,
    backgroundColor: "#000", // Dark theme
    paddingTop: 20,
    paddingHorizontal: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10,
  },
  emptyText: {
    color: "#888",
    textAlign: "center",
    fontSize: 16,
    marginTop: 20,
  },
  message: {
    color: "#fff",
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#333",
  },
});

export default Notifications;
