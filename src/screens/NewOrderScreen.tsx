import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useTheme } from "../context/ThemeContext";
import { newOrderCustomerSchema } from "../validation/newOrderSchema";
import type { OrderWithJoins } from "../services/orderService";
import { KeyboardDismissBackdrop } from "../components/DismissKeyboardScrollView";

type NewOrderScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "NewOrder"
>;

interface Props {
  navigation: NewOrderScreenNavigationProp;
}

const NewOrderScreen: React.FC<Props> = ({ navigation }) => {
  const { isDarkMode, theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const handleCancel = () => {
    setModalVisible(false);
    navigation.goBack();
  };
  const handleCreateOrder = () => {
    const parsed = newOrderCustomerSchema.safeParse({
      customerName,
      customerPhone,
    });
    if (!parsed.success) {
      Alert.alert("Ошибка", parsed.error.issues[0]?.message ?? "Проверьте поля");
      return;
    }

    handleCancel();
    const { customerName: name, customerPhone: phone } = parsed.data;

    const orderData = {
      created_at: new Date().toISOString(),
      creator: "",
      customer_name: name,
      id: 0,
      phone_number: phone,
      price: null,
      status: "Новый",
      wnd: null,
      config: 1,
      created_by: null,
      wnd_constructions: {
        created_at: new Date().toISOString(),
        id: 0,
        created_by: null,
        furniture: 0,
        opening_sashes: "1",
        profileSystem: 0,
        sh_template: "single_sash",
        size: { width: 1200, height: 1400 },
        width_mm: 1200,
        height_mm: 1400,
        th_glass: "24",
        color: "white",
        profiles: {
          id: 0,
          name: "",
          created_at: new Date().toISOString(),
          price: 0,
          depth: null,
          code: null,
          frame_price: 0,
          sash_price: 0,
          impost_price: 0,
          shtulp_price: null,
          door_frame_price: null,
          door_sash_price: null,
          threshold_price: null,
          system_name: null,
        },
        furnitures: {
          id: 0,
          name: "",
          created_at: new Date().toISOString(),
          price: 0,
          code: null,
          system_code: null,
        },
      },
    } as OrderWithJoins;

    navigation.navigate("Workflow", {
      orderData,
      isNewOrder: true,
    });
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancel}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.centeredView}
        >
          <KeyboardDismissBackdrop />
          <View
            style={[
              styles.modalView,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Новый заказ
            </Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                Имя клиента
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="Введите имя"
                placeholderTextColor={theme.colors.textSecondary}
                value={customerName}
                onChangeText={setCustomerName}
                autoFocus
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.inputLabel, { color: theme.colors.text }]}>
                Телефон клиента
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.border,
                  },
                ]}
                placeholder="Введите телефон"
                placeholderTextColor={theme.colors.textSecondary}
                value={
                  customerPhone.startsWith("+7")
                    ? customerPhone
                    : "+7" + customerPhone
                }
                onChangeText={(text) => {
                  if (text.startsWith("+7")) {
                    setCustomerPhone(text);
                  } else {
                    setCustomerPhone("+7" + text);
                  }
                }}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.createButton,
                  {
                    backgroundColor:
                      customerName.trim() && customerPhone.trim()
                        ? "#4CAF50"
                        : "#ccc",
                  },
                ]}
                onPress={handleCreateOrder}
                disabled={!customerName.trim() || !customerPhone.trim()}
              >
                <Text style={styles.createButtonText}>Создать</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  textInput: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#f44336",
  },
  createButton: {
    backgroundColor: "#4CAF50",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default NewOrderScreen;
