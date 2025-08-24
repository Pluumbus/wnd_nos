import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Switch } from "react-native";
import { StatusBar } from "expo-status-bar";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useTheme } from "../context/ThemeContext";

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const handleButtonPress = (index: number) => {
    console.log(`Button ${index} pressed`);
    if (index === 1) {
      navigation.navigate("NewOrder");
    } else if (index === 2) {
      navigation.navigate("Orders");
    }
    // Здесь можно добавить навигацию для других кнопок
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* Theme Toggle */}
      <View
        style={[
          styles.themeToggleContainer,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <Text style={[styles.themeLabel, { color: theme.colors.text }]}>
          {isDarkMode ? "🌑" : "☀️"}
        </Text>
        <Switch
          value={isDarkMode}
          onValueChange={toggleTheme}
          trackColor={{ false: "#e0e0e0", true: "#4a90e2" }}
          thumbColor={isDarkMode ? "#ffffff" : "#f4f3f4"}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={() => handleButtonPress(1)}
        >
          <Text style={[styles.buttonText, { color: theme.colors.text }]}>
            Новый заказ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={() => handleButtonPress(2)}
        >
          <Text style={[styles.buttonText, { color: theme.colors.text }]}>
            Заказы
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={() => handleButtonPress(3)}
        >
          <Text style={[styles.buttonText, { color: theme.colors.text }]}>
            Прайс
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={() => handleButtonPress(4)}
        >
          <Text style={[styles.buttonText, { color: theme.colors.text }]}>
            Настройки
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  themeToggleContainer: {
    position: "absolute",
    top: 60,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 10,
  },
  buttonContainer: {
    width: "80%",
    gap: 20,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
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
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default HomeScreen;
