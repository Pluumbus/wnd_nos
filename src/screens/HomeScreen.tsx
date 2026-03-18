import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useTheme } from "../context/ThemeContext";
import WindowLogo from "../components/WindowLogo";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { isDarkMode, theme } = useTheme();

  const menuItems = [
    { id: 1, title: "Новый заказ", icon: "add-circle-outline" as const, route: "NewOrder" as const },
    { id: 2, title: "Заказы", icon: "list-outline" as const, route: "Orders" as const },
    { id: 3, title: "Прайс", icon: "pricetag-outline" as const, route: "Price" as const },
    { id: 4, title: "Настройки", icon: "settings-outline" as const, route: "Settings" as const },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* Декоративный фон сверху */}
      <View style={[styles.headerBackground, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.headerDecoration} />
      </View>

      {/* Контент */}
      <View style={styles.content}>
        {/* Логотип и заголовок */}
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <WindowLogo
              size={130}
              primaryColor={theme.colors.primary}
              secondaryColor={theme.colors.secondary}
            />
          </View>
          <Text style={[styles.appTitle, { color: theme.colors.text }]}>
            Н.О.С
          </Text>
          <Text style={[styles.appSubtitle, { color: theme.colors.textSecondary }]}>
            Калькулятор окон
          </Text>
        </View>

        {/* Меню кнопок */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              onPress={() => navigation.navigate(item.route)}
              activeOpacity={0.7}
            >
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary + "15" }]}>
              <Ionicons name={item.icon} size={24} color={theme.colors.primary} />
            </View>
              <Text style={[styles.menuButtonText, { color: theme.colors.text }]}>
                {item.title}
              </Text>
              <Text style={[styles.menuArrow, { color: theme.colors.textSecondary }]}>
                ›
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Версия */}
        <Text style={[styles.versionText, { color: theme.colors.textSecondary }]}>
          Версия 1.0.0
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingBottom: 40,
  },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerDecoration: {
    position: "absolute",
    top: 40,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 80,
    marginBottom: 40,
  },
  logoWrapper: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    borderRadius: 20,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 20,
    letterSpacing: 2,
  },
  appSubtitle: {
    fontSize: 16,
    marginTop: 4,
  },
  menuContainer: {
    width: "100%",
    paddingHorizontal: 20,
    gap: 12,
  },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuButtonText: {
    flex: 1,
    fontSize: 17,
    fontWeight: "600",
  },
  menuArrow: {
    fontSize: 28,
    fontWeight: "300",
  },
  versionText: {
    marginTop: 32,
    fontSize: 12,
  },
});

export default HomeScreen;
