import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, "Settings">;

interface Props {
  navigation: SettingsScreenNavigationProp;
}

interface SettingItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  showArrow?: boolean;
}

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const { signOut } = useAuth();

  const SettingItem: React.FC<SettingItemProps> = ({
    title,
    subtitle,
    onPress,
    rightElement,
    showArrow = false,
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
      disabled={!onPress && !rightElement}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingTextContainer}>
        <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[styles.settingSubtitle, { color: theme.colors.textSecondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      {rightElement}
      {showArrow && (
        <Text style={[styles.arrow, { color: theme.colors.textSecondary }]}>›</Text>
      )}
    </TouchableOpacity>
  );

  const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>
      {title}
    </Text>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Заголовок с расширенным фоном */}
      <View style={[styles.headerWrapper, { backgroundColor: theme.colors.surface }]}>
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
                Назад
              </Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              Настройки
            </Text>
            <View style={styles.placeholder} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.settingsGroup}>
          <SettingItem
            title="Выйти из аккаунта"
            subtitle="Сессия Supabase будет завершена"
            showArrow
            onPress={() => void signOut()}
          />
        </View>

        {/* Внешний вид */}
        <SectionHeader title="ВНЕШНИЙ ВИД" />
        <View style={styles.settingsGroup}>
          <SettingItem
            title="Тёмная тема"
            subtitle={isDarkMode ? "Включена" : "Выключена"}
            rightElement={
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: "#e0e0e0", true: theme.colors.primary }}
                thumbColor={isDarkMode ? "#ffffff" : "#f4f3f4"}
              />
            }
          />
        </View>

        {/* Уведомления */}
        <SectionHeader title="УВЕДОМЛЕНИЯ" />
        <View style={styles.settingsGroup}>
          <SettingItem
            title="Push-уведомления"
            subtitle="Получать уведомления о новых заказах"
            showArrow
            onPress={() => {}}
          />
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <SettingItem
            title="Звук уведомлений"
            subtitle="Включён"
            showArrow
            onPress={() => {}}
          />
        </View>

        {/* Данные */}
        <SectionHeader title="ДАННЫЕ" />
        <View style={styles.settingsGroup}>
          <SettingItem
            title="Синхронизация"
            subtitle="Автоматическая синхронизация данных"
            showArrow
            onPress={() => {}}
          />
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <SettingItem
            title="Очистить кэш"
            subtitle="Освободить место на устройстве"
            showArrow
            onPress={() => {}}
          />
        </View>

        {/* О приложении */}
        <SectionHeader title="О ПРИЛОЖЕНИИ" />
        <View style={styles.settingsGroup}>
          <SettingItem
            title="Версия"
            subtitle="1.0.0"
          />
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <SettingItem
            title="Политика конфиденциальности"
            showArrow
            onPress={() => {}}
          />
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <SettingItem
            title="Условия использования"
            showArrow
            onPress={() => {}}
          />
        </View>

        {/* Версия внизу */}
        <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
          NOS Window Calculator
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrapper: {
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 16,
    minWidth: 70,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  placeholder: {
    minWidth: 70,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 16,
    letterSpacing: 0.5,
  },
  settingsGroup: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  settingSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  arrow: {
    fontSize: 24,
    fontWeight: "300",
    marginLeft: 8,
  },
  divider: {
    height: 1,
    marginLeft: 16,
  },
  footerText: {
    textAlign: "center",
    fontSize: 13,
    marginTop: 32,
  },
});

export default SettingsScreen;
