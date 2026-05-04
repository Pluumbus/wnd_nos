import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { z } from "zod";
import { supabase } from "../lib/supabase";
import { useTheme } from "../context/ThemeContext";
import type { AuthStackParamList } from "../navigation/AuthNavigator";
import { DismissKeyboardScrollView } from "../components/DismissKeyboardScrollView";

const STEP_LABELS = ["Почта", "Пароль", "Профиль"] as const;

const emailSchema = z.string().trim().email({ message: "Укажите корректный email" });
const passwordSchema = z.string().min(6, { message: "Не менее 6 символов" });
const displayNameSchema = z.string().trim().max(80, { message: "Слишком длинное имя" });

type RegNav = StackNavigationProp<AuthStackParamList, "Register">;

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegNav>();
  const { isDarkMode, theme } = useTheme();

  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [doneInfo, setDoneInfo] = useState<{ needsConfirm: boolean; emailSent: string } | null>(
    null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (step !== 1) {
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [step]);

  const placeholderColor = theme.colors.textSecondary;
  const accentMuted = isDarkMode ? "rgba(233, 69, 96, 0.35)" : "rgba(233, 69, 96, 0.2)";

  const goBack = useCallback(() => {
    setMessage(null);
    if (doneInfo) {
      navigation.navigate("Login");
      return;
    }
    if (step > 0) {
      setStep((s) => s - 1);
      return;
    }
    navigation.goBack();
  }, [doneInfo, navigation, step]);

  const validateStep = useCallback((): boolean => {
    setMessage(null);
    if (step === 0) {
      const r = emailSchema.safeParse(email);
      if (!r.success) {
        setMessage(r.error.issues[0]?.message ?? "Ошибка");
        return false;
      }
      return true;
    }
    if (step === 1) {
      const p = passwordSchema.safeParse(password);
      if (!p.success) {
        setMessage(p.error.issues[0]?.message ?? "Ошибка");
        return false;
      }
      if (password !== confirmPassword) {
        setMessage("Пароли не совпадают");
        return false;
      }
      return true;
    }
    if (displayName.trim().length === 0) {
      return true;
    }
    const n = displayNameSchema.safeParse(displayName.trim());
    if (!n.success) {
      setMessage(n.error.issues[0]?.message ?? "Ошибка");
      return false;
    }
    return true;
  }, [step, email, password, confirmPassword, displayName]);

  const onNext = () => {
    if (!validateStep()) return;
    if (step < 2) {
      setStep((s) => s + 1);
    }
  };

  const onSubmit = async () => {
    if (!validateStep()) return;
    setBusy(true);
    setMessage(null);
    try {
      const trimmedEmail = email.trim();
      const meta =
        displayName.trim().length > 0 ? { full_name: displayName.trim() } : undefined;
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: meta ? { data: meta } : undefined,
      });
      if (error) {
        setMessage(error.message);
        return;
      }
      const needsConfirm = !data.session;
      setDoneInfo({ needsConfirm, emailSent: trimmedEmail });
      setStep(3);
    } finally {
      setBusy(false);
    }
  };

  const renderStepper = () => (
    <View style={styles.stepperWrap}>
      <View style={styles.stepperTrack}>
        {[0, 1, 2].map((i) => {
          const completed = i < step;
          const active = i === step;
          const isLast = i === 2;
          return (
            <React.Fragment key={STEP_LABELS[i]}>
              <View style={styles.stepColumn}>
                <View
                  style={[
                    styles.stepDisc,
                    {
                      borderColor: completed || active ? theme.colors.primary : theme.colors.border,
                      backgroundColor: completed
                        ? theme.colors.primary
                        : active
                          ? accentMuted
                          : theme.colors.surface,
                    },
                  ]}
                >
                  {completed ? (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  ) : (
                    <Text
                      style={[
                        styles.stepDiscText,
                        { color: active ? theme.colors.primary : theme.colors.textSecondary },
                      ]}
                    >
                      {i + 1}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepperLabel,
                    { color: active ? theme.colors.text : theme.colors.textSecondary },
                  ]}
                  numberOfLines={2}
                >
                  {STEP_LABELS[i]}
                </Text>
              </View>
              {!isLast ? (
                <View style={styles.stepSegmentWrap}>
                  <View
                    style={[
                      styles.stepSegment,
                      {
                        backgroundColor: i < step ? theme.colors.primary : theme.colors.border,
                      },
                    ]}
                  />
                </View>
              ) : null}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );

  const renderFields = () => {
    if (step === 0) {
      return (
        <>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
            Адрес электронной почты
          </Text>
          <TextInput
            style={[
              styles.underlineInput,
              {
                color: theme.colors.text,
                borderBottomColor: theme.colors.primary,
              },
            ]}
            placeholder="name@company.ru"
            placeholderTextColor={placeholderColor}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
        </>
      );
    }
    if (step === 1) {
      return (
        <>
          <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>Пароль</Text>
          <View
            style={[styles.passwordUnderlineRow, { borderBottomColor: theme.colors.border }]}
          >
            <TextInput
              style={[styles.passwordUnderlineInput, { color: theme.colors.text }]}
              placeholder="Не менее 6 символов"
              placeholderTextColor={placeholderColor}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
              value={password}
              onChangeText={setPassword}
            />
            <Pressable
              onPress={() => setShowPassword((v) => !v)}
              style={({ pressed }) => [styles.passwordEyeHit, pressed && styles.pressed]}
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
          <Text style={[styles.fieldLabel, styles.fieldLabelSpaced, { color: theme.colors.textSecondary }]}>
            Повтор пароля
          </Text>
          <View
            style={[styles.passwordUnderlineRow, { borderBottomColor: theme.colors.border }]}
          >
            <TextInput
              style={[styles.passwordUnderlineInput, { color: theme.colors.text }]}
              placeholder="Ещё раз"
              placeholderTextColor={placeholderColor}
              secureTextEntry={!showConfirmPassword}
              autoComplete="new-password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <Pressable
              onPress={() => setShowConfirmPassword((v) => !v)}
              style={({ pressed }) => [styles.passwordEyeHit, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={showConfirmPassword ? "Скрыть пароль" : "Показать пароль"}
              hitSlop={8}
            >
              <Ionicons
                name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color={theme.colors.textSecondary}
              />
            </Pressable>
          </View>
        </>
      );
    }
    return (
      <>
        <Text style={[styles.helperWide, { color: theme.colors.textSecondary }]}>
          Имя будет видно в списках заказов. Поле можно пропустить.
        </Text>
        <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>Как к вам обращаться</Text>
        <TextInput
          style={[
            styles.underlineInput,
            {
              color: theme.colors.text,
              borderBottomColor: theme.colors.border,
            },
          ]}
          placeholder="Например, Алёна"
          placeholderTextColor={placeholderColor}
          autoComplete="name"
          value={displayName}
          onChangeText={setDisplayName}
        />
      </>
    );
  };

  const renderSuccess = () => {
    if (!doneInfo) return null;
    return (
      <View style={styles.successBlock}>
        <View style={[styles.successIconWrap, { backgroundColor: accentMuted }]}>
          <Ionicons
            name={doneInfo.needsConfirm ? "mail-unread-outline" : "checkmark-circle-outline"}
            size={doneInfo.needsConfirm ? 40 : 56}
            color={theme.colors.primary}
          />
        </View>
        <Text style={[styles.successTitle, { color: theme.colors.text }]}>
          {doneInfo.needsConfirm ? "Проверьте почту" : "Аккаунт создан"}
        </Text>
        <Text style={[styles.successBody, { color: theme.colors.textSecondary }]}>
          {doneInfo.needsConfirm
            ? `Мы отправили письмо на ${doneInfo.emailSent}. Перейдите по ссылке, чтобы активировать аккаунт, затем войдите через экран входа (пароль).`
            : `Вы вошли как ${doneInfo.emailSent}. Далее можно работать с заказами.`}
        </Text>
        {doneInfo.needsConfirm ? (
          <Pressable
            style={[styles.secondaryAction, { borderColor: theme.colors.primary }]}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={[styles.secondaryActionLabel, { color: theme.colors.primary }]}>
              Перейти ко входу
            </Text>
          </Pressable>
        ) : null}
      </View>
    );
  };

  const isSuccess = step === 3 && doneInfo;
  const topProgressRatio =
    step >= STEP_LABELS.length ? 1 : Math.min(Math.max(step / STEP_LABELS.length, 0), 1);

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      <View
        style={[styles.topProgressTrack, { backgroundColor: theme.colors.secondary }]}
      >
        <View
          style={[
            styles.topProgressFill,
            {
              width: `${Math.round(topProgressRatio * 100)}%`,
              backgroundColor: theme.colors.primary,
            },
          ]}
        />
      </View>

      <SafeAreaView style={styles.safe} edges={["top"]}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.topBar}>
            <Pressable
              onPress={goBack}
              style={({ pressed }) => [styles.iconHit, pressed && styles.pressed]}
              hitSlop={12}
            >
              <Ionicons name="chevron-back" size={28} color={theme.colors.text} />
            </Pressable>
            <Text style={[styles.topTitle, { color: theme.colors.text }]}>Новый аккаунт</Text>
            <View style={styles.iconHit} />
          </View>

          <DismissKeyboardScrollView
            contentContainerStyle={styles.scrollInner}
            tapToDismissContainerStyle={styles.dismissPad}
            showsVerticalScrollIndicator={false}
          >
            {isSuccess ? (
              renderSuccess()
            ) : (
              <>
                {renderStepper()}
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                      shadowColor: theme.colors.shadow,
                    },
                  ]}
                >
                  <Text style={[styles.cardKicker, { color: theme.colors.primary }]}>
                    Шаг {step + 1} из {STEP_LABELS.length}
                  </Text>
                  <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
                    {step === 0 && "Укажите почту для входа"}
                    {step === 1 && "Придумайте пароль"}
                    {step === 2 && "Представьтесь"}
                  </Text>
                  {renderFields()}
                  {message ? (
                    <Text style={[styles.feedback, { color: theme.colors.primary }]}>{message}</Text>
                  ) : null}

                  {step < 2 ? (
                    <Pressable
                      onPress={onNext}
                      style={({ pressed }) => [
                        styles.ctaFilled,
                        { backgroundColor: theme.colors.primary },
                        pressed && styles.ctaPressed,
                      ]}
                    >
                      <Text style={styles.ctaFilledLabel}>Далее</Text>
                      <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.ctaIcon} />
                    </Pressable>
                  ) : (
                    <Pressable
                      onPress={() => void onSubmit()}
                      disabled={busy}
                      style={({ pressed }) => [
                        styles.ctaFilled,
                        { backgroundColor: theme.colors.primary },
                        (pressed || busy) && styles.ctaPressed,
                        busy && styles.ctaDisabled,
                      ]}
                    >
                      {busy ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <>
                          <Text style={styles.ctaFilledLabel}>Создать аккаунт</Text>
                          <Ionicons name="checkmark-circle" size={22} color="#fff" style={styles.ctaIcon} />
                        </>
                      )}
                    </Pressable>
                  )}
                </View>

                <Text style={[styles.loginHint, { color: theme.colors.textSecondary }]}>
                  Уже зарегистрированы?
                </Text>
                <Pressable onPress={() => navigation.navigate("Login")}>
                  <Text style={[styles.loginLink, { color: theme.colors.primary }]}>
                    Войти с паролем
                  </Text>
                </Pressable>
              </>
            )}
          </DismissKeyboardScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  topProgressTrack: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    zIndex: 1,
    overflow: "hidden",
  },
  topProgressFill: {
    height: "100%",
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  iconHit: { width: 44, height: 44, justifyContent: "center", alignItems: "center" },
  pressed: { opacity: 0.6 },
  topTitle: { fontSize: 17, fontWeight: "700", letterSpacing: 0.3 },
  scrollInner: { paddingBottom: 48, flexGrow: 1 },
  dismissPad: { paddingHorizontal: 20, flexGrow: 1 },
  stepperWrap: { marginBottom: 28 },
  stepperTrack: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  stepColumn: {
    width: 76,
    alignItems: "center",
  },
  stepSegmentWrap: {
    flex: 1,
    paddingHorizontal: 4,
    justifyContent: "flex-start",
    paddingTop: 16,
  },
  stepSegment: {
    height: 3,
    borderRadius: 2,
    width: "100%",
  },
  stepDisc: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  stepDiscText: { fontSize: 14, fontWeight: "800" },
  stepperLabel: {
    marginTop: 10,
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    lineHeight: 13,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 20,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  cardKicker: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    lineHeight: 28,
    marginBottom: 22,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  fieldLabelSpaced: { marginTop: 18 },
  helperWide: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  underlineInput: {
    fontSize: 18,
    paddingVertical: 12,
    borderBottomWidth: 2,
    marginBottom: 4,
  },
  passwordUnderlineRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 2,
    marginBottom: 4,
  },
  passwordUnderlineInput: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 12,
    paddingRight: 6,
  },
  passwordEyeHit: {
    padding: 8,
    marginRight: -4,
  },
  feedback: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 20,
  },
  ctaFilled: {
    marginTop: 26,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  ctaFilledLabel: { color: "#fff", fontSize: 17, fontWeight: "700" },
  ctaIcon: { marginLeft: 10 },
  ctaPressed: { opacity: 0.88 },
  ctaDisabled: { opacity: 0.75 },
  loginHint: {
    textAlign: "center",
    marginTop: 28,
    fontSize: 14,
  },
  loginLink: {
    textAlign: "center",
    marginTop: 6,
    fontSize: 16,
    fontWeight: "700",
  },
  successBlock: {
    alignItems: "center",
    paddingTop: 24,
    paddingHorizontal: 8,
  },
  successIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },
  successBody: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  secondaryAction: {
    marginTop: 28,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    borderWidth: 2,
  },
  secondaryActionLabel: { fontSize: 16, fontWeight: "700" },
});
