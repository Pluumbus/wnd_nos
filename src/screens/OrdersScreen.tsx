import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useTheme } from "../context/ThemeContext";
import { useOrders } from "../hooks/useOrders";
import { Database } from "../lib/supabase.types";
import { Order, OrderJoin } from "../services/orderService";

type OrdersScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Orders"
>;

interface Props {
  navigation: OrdersScreenNavigationProp;
}

const OrdersScreen: React.FC<Props> = ({ navigation }) => {
  const { isDarkMode, theme } = useTheme();
  const { orders, loading, error, deleteOrder, loadOrders } = useOrders();
  const [refreshing, setRefreshing] = useState(false);

  const handleOrderPress = (order: OrderJoin[number]) => {
    navigation.navigate("Workflow", {
      orderData: order,
      isNewOrder: false,
    });
  };

  const handleDeleteOrder = (order: Order) => {
    Alert.alert(
      "Удалить заказ",
      `Вы уверены, что хотите удалить заказ ${order.id}?`,
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: () => deleteOrder(order.id),
        },
      ]
    );
  };

  const handleBackPress = () => {
    navigation.navigate("Home");
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadOrders();
    } catch (error) {
      console.error("Error refreshing orders:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Новый":
        return "#27ae60";
      case "В обработке":
        return "#f39c12";
      case "Готов":
        return "#27ae60";
      case "Отправлен":
        return "#3498db";

      default:
        return "#95a5a6";
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.colors.surface,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={[styles.backButtonText, { color: theme.colors.text }]}>
            ←
          </Text>
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            {
              color: theme.colors.text,
              textAlign: "right",
              flex: 1,
            },
          ]}
        >
          Заказы
        </Text>
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.ordersContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            {/* <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              Загрузка заказов...
            </Text> */}
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.colors.primary }]}>
              {error}
            </Text>
          </View>
        ) : orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text
              style={[styles.emptyText, { color: theme.colors.textSecondary }]}
            >
              Заказов пока нет
            </Text>
          </View>
        ) : (
          orders.map((order) => (
            <TouchableOpacity
              key={order.id}
              style={[
                styles.orderCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => handleOrderPress(order)}
            >
              <View style={styles.orderHeader}>
                <Text
                  style={[styles.orderNumber, { color: theme.colors.text }]}
                >
                  Номер заказа: {order.id}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(order.status || "") },
                  ]}
                >
                  <Text style={styles.statusText}>{order.status}</Text>
                </View>
              </View>

              <View style={styles.orderDetails}>
                <Text
                  style={[styles.customerName, { color: theme.colors.text }]}
                >
                  {order.customer_name}
                </Text>
                <Text
                  style={[
                    styles.orderDate,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {new Date(order.created_at).toLocaleDateString("ru-RU")}
                </Text>
                <Text
                  style={[
                    styles.orderDate,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Источник: {order.creator}
                </Text>
              </View>

              <View style={styles.orderFooter}>
                <Text style={[styles.orderTotal, { color: theme.colors.text }]}>
                  {order.price?.toLocaleString()} Тг
                </Text>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[
                      styles.deleteButton,
                      { backgroundColor: theme.colors.primary },
                    ]}
                    onPress={() => handleDeleteOrder(order)}
                  >
                    <Text style={styles.deleteButtonText}>Удалить</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    color: "#e94560",
    fontSize: 24,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "left",
    flex: 1,
  },
  ordersContainer: {
    flex: 1,
    padding: 20,
  },
  orderCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    borderWidth: 1,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: "bold",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  orderDetails: {
    marginBottom: 15,
  },
  customerName: {
    fontSize: 16,
    marginBottom: 5,
  },
  orderDate: {
    fontSize: 14,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: "bold",
  },
  openButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  openButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
  },
  deleteButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#e74c3c",
  },
  deleteButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
});

export default OrdersScreen;
