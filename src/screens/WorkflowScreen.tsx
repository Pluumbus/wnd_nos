import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useTheme } from "../context/ThemeContext";

type WorkflowScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Workflow"
>;
type WorkflowScreenRouteProp = RouteProp<RootStackParamList, "Workflow">;

interface Props {
  navigation: WorkflowScreenNavigationProp;
  route: WorkflowScreenRouteProp;
}

const WorkflowScreen: React.FC<Props> = ({ navigation, route }) => {
  const { isDarkMode, theme } = useTheme();
  const { customerName, customerPhone } = route.params;
  const [orderStatus, setOrderStatus] = useState("В работе");
  const [orderItems, setOrderItems] = useState<string[]>([]);

  const handleAddItem = () => {
    Alert.prompt(
      "Добавить товар",
      "Введите название товара:",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Добавить",
          onPress: (text) => {
            if (text && text.trim()) {
              setOrderItems([...orderItems, text.trim()]);
            }
          },
        },
      ],
      "plain-text"
    );
  };

  const handleCompleteOrder = () => {
    Alert.alert("Завершить заказ", "Вы уверены, что хотите завершить заказ?", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Завершить",
        style: "destructive",
        onPress: () => {
          setOrderStatus("Завершен");
          Alert.alert("Успех", "Заказ успешно завершен!");
        },
      },
    ]);
  };

  const handleGoBack = () => {
    navigation.navigate("Home");
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: theme.colors.text }]}>
            ← Назад
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Работа с заказом
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Customer Info */}
        <View
          style={[styles.section, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Информация о клиенте
          </Text>
          <View style={styles.customerInfo}>
            <Text
              style={[
                styles.customerLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              Имя:
            </Text>
            <Text style={[styles.customerValue, { color: theme.colors.text }]}>
              {customerName}
            </Text>
          </View>
          <View style={styles.customerInfo}>
            <Text
              style={[
                styles.customerLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              Телефон:
            </Text>
            <Text style={[styles.customerValue, { color: theme.colors.text }]}>
              {customerPhone}
            </Text>
          </View>
        </View>

        {/* Order Status */}
        <View
          style={[styles.section, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Статус заказа
          </Text>
          <View style={styles.statusContainer}>
            <Text style={[styles.statusText, { color: theme.colors.text }]}>
              {orderStatus}
            </Text>
            <View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor:
                    orderStatus === "В работе" ? "#FFA726" : "#4CAF50",
                },
              ]}
            />
          </View>
        </View>

        {/* Order Items */}
        <View
          style={[styles.section, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Товары в заказе
            </Text>
            <TouchableOpacity onPress={handleAddItem} style={styles.addButton}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          {orderItems.length === 0 ? (
            <Text
              style={[styles.emptyText, { color: theme.colors.textSecondary }]}
            >
              Товары не добавлены
            </Text>
          ) : (
            orderItems.map((item, index) => (
              <View key={index} style={styles.orderItem}>
                <Text style={[styles.itemText, { color: theme.colors.text }]}>
                  {index + 1}. {item}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor:
                  orderStatus === "Завершен" ? "#ccc" : "#4CAF50",
              },
            ]}
            onPress={handleCompleteOrder}
            disabled={orderStatus === "Завершен"}
          >
            <Text style={styles.actionButtonText}>
              {orderStatus === "Завершен"
                ? "Заказ завершен"
                : "Завершить заказ"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  placeholder: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  customerInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  customerLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  customerValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: "#2196F3",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  emptyText: {
    fontSize: 16,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 20,
  },
  orderItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  itemText: {
    fontSize: 16,
  },
  actionsContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  actionButton: {
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default WorkflowScreen;
