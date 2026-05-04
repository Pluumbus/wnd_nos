import React, { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { useTheme } from "../context/ThemeContext";
import type { AuthStackParamList } from "../navigation/AuthNavigator";
import { DismissKeyboardScrollView } from "../components/DismissKeyboardScrollView";
import WindowLogo from "../components/WindowLogo";

const devEmail = process.env.EXPO_PUBLIC_DEV_LOGIN_EMAIL ?? "";
const devPassword = process.env.EXPO_PUBLIC_DEV_LOGIN_PASSWORD ?? "";

type LoginNav = StackNavigationProp<AuthStackParamList, "Login">;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginNav>();
  const { isDarkMode, theme } = useTheme();
  const [email, setEmail] = useState(__DEV__ ? devEmail : "");
  const [password, setPassword] = useState(__DEV__ ? devPassword : "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async () => {
    setMessage(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setMessage(error.message);
      }
    } finally {
      setBusy(false);
    }
  };

  const placeholderColor = theme.colors.textSecondary;

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <View
        style={[styles.headerBackground, { backgroundColor: theme.colors.primary }]}
      >
        <View style={styles.headerDecoration} />
      </View>

      <SafeAreaView style={styles.safe} edges={["top"]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <DismissKeyboardScrollView
            contentContainerStyle={styles.scrollContent}
            tapToDismissContainerStyle={styles.dismissArea}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.brandBlock}>
              <View style={styles.logoWrapper}>
                <WindowLogo
                  size={130}
                  primaryColor={theme.colors.primary}
                  secondaryColor={theme.colors.secondary}
                  variant={isDarkMode ? "dark" : "light"}
                />
              </View>
              <Text style={[styles.appTitle, { color: theme.colors.text }]}>Н.О.С.</Text>
              <Text style={[styles.appSubtitle, { color: theme.colors.textSecondary }]}>
                Калькулятор окон
              </Text>
              <Text style={[styles.screenTitle, { color: theme.colors.text }]}>
                Вход в аккаунт
              </Text>
            </View>

            <View style={styles.form}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
                placeholder="Email"
                placeholderTextColor={placeholderColor}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
              />
              <View
                style={[
                  styles.passwordRow,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <TextInput
                  style={[styles.passwordInput, { color: theme.colors.text }]}
                  placeholder="Пароль"
                  placeholderTextColor={placeholderColor}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  value={password}
                  onChangeText={setPassword}
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  style={({ pressed }) => [styles.passwordEyeHit, pressed && styles.passwordEyePressed]}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? "Скрыть пароль" : "Показать пароль"}
                  hitSlop={8}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color={theme.colors.textSecondary}
                  />
                </Pressable>
              </View>
              {message ? (
                <Text style={[styles.error, { color: theme.colors.primary }]}>{message}</Text>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: theme.colors.primary },
                  busy && styles.submitButtonDisabled,
                ]}
                onPress={() => void onSubmit()}
                disabled={busy}
                activeOpacity={0.85}
              >
                {busy ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitLabel}>Войти</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.registerLinkWrap}
                onPress={() => navigation.navigate("Register")}
                activeOpacity={0.75}
              >
                <Text style={[styles.registerHint, { color: theme.colors.textSecondary }]}>
                  Нет аккаунта?
                </Text>
                <Text style={[styles.registerCta, { color: theme.colors.primary }]}>
                  Зарегистрироваться
                </Text>
              </TouchableOpacity>
            </View>
          </DismissKeyboardScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
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
  scrollContent: {
    paddingBottom: 40,
  },
  dismissArea: {
    paddingHorizontal: 20,
  },
  brandBlock: {
    alignItems: "center",
    marginTop: 48,
    marginBottom: 32,
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
  screenTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 20,
  },
  form: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  input: {
    borderRadius: 16,
    paddingVertical: Platform.select({ ios: 16, default: 14 }),
    paddingHorizontal: 18,
    marginBottom: 12,
    borderWidth: 1,
    fontSize: 17,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    paddingRight: 6,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: Platform.select({ ios: 16, default: 14 }),
    paddingHorizontal: 18,
    fontSize: 17,
  },
  passwordEyeHit: {
    padding: 10,
  },
  passwordEyePressed: {
    opacity: 0.65,
  },
  error: {
    marginBottom: 12,
    textAlign: "center",
    fontSize: 14,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.75,
  },
  submitLabel: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 17,
  },
  registerLinkWrap: {
    marginTop: 28,
    alignItems: "center",
    paddingVertical: 8,
  },
  registerHint: {
    fontSize: 14,
  },
  registerCta: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },
});
