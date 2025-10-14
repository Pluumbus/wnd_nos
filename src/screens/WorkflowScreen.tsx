import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Dimensions,
  Animated,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useTheme } from "../context/ThemeContext";
import WindowVisualizer, { WindowConfig } from "../components/WindowVisualizer";
import WindowConfigSelector from "../components/WindowConfigSelector";
import ColorSelector from "../components/ColorSelector";
import { openingSashesTypes } from "../utils/opening_sashes.dict";
import { windowTemplates } from "../utils/window_templates.dict";
import {
  OrderService,
  OrderWithConfig,
  Profile,
  Furniture,
} from "../services/orderService";
import { RouteProp } from "@react-navigation/native";

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
  const { orderData, isNewOrder } = route.params;
  const [orderStatus, setOrderStatus] = useState(orderData.status);

  // Состояние для конфигурации окна
  const initialConfig: WindowConfig = {
    //@ts-ignore
    width: Number(orderData.wnd_constructions.size?.width) || 0,
    //@ts-ignore
    height: Number(orderData.wnd_constructions.size?.height) || 0,
    glassThickness: Number(orderData.wnd_constructions.th_glass || 0),
    openingSashType: orderData.wnd_constructions.opening_sashes || "1", // По умолчанию "Обе створки поворотные"
    shTemplate: orderData.wnd_constructions.sh_template || "single_sash",
    price: Number(orderData.price) || 0,
    profileType: "",
    furnitureType: "",
    config: orderData.config || 1, // По умолчанию конфигурация 1
    color: orderData.wnd_constructions.color || "white",
  };

  const [windowConfig, setWindowConfig] = useState<WindowConfig>(initialConfig);
  const [originalConfig, setOriginalConfig] =
    useState<WindowConfig>(initialConfig);
  const [originalProfileId, setOriginalProfileId] = useState<number | null>(
    orderData.wnd_constructions.profiles?.id || null
  );
  const [originalFurnitureId, setOriginalFurnitureId] = useState<number | null>(
    orderData.wnd_constructions.furnitures?.id || null
  );

  // Состояние для отслеживания размеров экрана и ориентации
  const [screenData, setScreenData] = useState(Dimensions.get("window"));
  const isLandscape = screenData.width > screenData.height;

  // Состояния для списков профилей и фурнитуры
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [furnitures, setFurnitures] = useState<Furniture[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(
    null
  );
  const [selectedFurnitureId, setSelectedFurnitureId] = useState<number | null>(
    null
  );
  const [funkeProfileDepth, setFunkeProfileDepth] = useState<"58" | "70">("58"); // Толщина профиля FUNKE (для UI)
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Состояние для sticky визуализатора
  const [showStickyVisualizer, setShowStickyVisualizer] = useState(false);
  const [visualizerLayoutY, setVisualizerLayoutY] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const stickyOpacity = useRef(new Animated.Value(0)).current;

  // Загрузка профилей и фурнитуры
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [profilesData, furnituresData] = await Promise.all([
          OrderService.getProfiles(),
          OrderService.getFurnitures(),
        ]);
        setProfiles(profilesData);
        setFurnitures(furnituresData);
      } catch (error) {
        console.error("Error loading profiles and furnitures:", error);
        Alert.alert(
          "Ошибка",
          "Не удалось загрузить данные профилей и фурнитуры"
        );
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Слушатель изменений ориентации экрана
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenData(window);
    });

    return () => subscription?.remove();
  }, []);

  // Функция для проверки изменений
  const hasChanges = () => {
    if (isNewOrder) return true;

    const configChanged =
      windowConfig.width !== originalConfig.width ||
      windowConfig.height !== originalConfig.height ||
      windowConfig.glassThickness !== originalConfig.glassThickness ||
      windowConfig.openingSashType !== originalConfig.openingSashType ||
      windowConfig.shTemplate !== originalConfig.shTemplate ||
      windowConfig.price !== originalConfig.price ||
      windowConfig.config !== originalConfig.config ||
      windowConfig.color !== originalConfig.color;

    const profileChanged = selectedProfileId !== originalProfileId;
    const furnitureChanged = selectedFurnitureId !== originalFurnitureId;

    return configChanged || profileChanged || furnitureChanged;
  };

  // Предзаполнение данных из заказа
  useEffect(() => {
    if (orderData && profiles.length > 0 && furnitures.length > 0) {
      const updatedConfig = {
        ...initialConfig,
        openingSashType: orderData.wnd_constructions.opening_sashes || "1",
        shTemplate: orderData.wnd_constructions.sh_template || "single_sash",
        profileType: orderData.wnd_constructions.profiles?.name || "",
        furnitureType: orderData.wnd_constructions.furnitures?.name || "",
        config: orderData.config || 1,
      };

      setWindowConfig(updatedConfig);
      setOriginalConfig(updatedConfig);

      // Устанавливаем выбранные ID
      if (orderData.wnd_constructions.profiles?.id) {
        setSelectedProfileId(orderData.wnd_constructions.profiles.id);
        setOriginalProfileId(orderData.wnd_constructions.profiles.id);

        // Определяем толщину FUNKE на основе ID профиля
        if (orderData.wnd_constructions.profiles.id === 1) {
          setFunkeProfileDepth("58");
        } else if (orderData.wnd_constructions.profiles.id === 5) {
          setFunkeProfileDepth("70");
        }
      }
      if (orderData.wnd_constructions.furnitures?.id) {
        setSelectedFurnitureId(orderData.wnd_constructions.furnitures.id);
        setOriginalFurnitureId(orderData.wnd_constructions.furnitures.id);
      }
    }
  }, [orderData, profiles, furnitures]);

  // Обработчики изменения параметров
  const updateWindowConfig = (field: keyof WindowConfig, value: any) => {
    setWindowConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Функция сохранения конфигурации заказа
  const handleSaveOrder = async () => {
    try {
      setIsSaving(true);

      // Проверяем что выбраны профиль и фурнитура
      if (!selectedProfileId || !selectedFurnitureId) {
        Alert.alert("Ошибка", "Пожалуйста, выберите профиль и фурнитуру");
        return;
      }

      const selectedProfile = profiles.find((p) => p.id === selectedProfileId);
      const selectedFurniture = furnitures.find(
        (f) => f.id === selectedFurnitureId
      );

      if (!selectedProfile || !selectedFurniture) {
        Alert.alert("Ошибка", "Выбранные профиль или фурнитура не найдены");
        return;
      }

      if (isNewOrder) {
        // Создаем новый заказ
        const orderWithConfig: OrderWithConfig = {
          customer_name: orderData.customer_name || "",
          phone_number: orderData.phone_number || "",
          creator: orderData.creator || "system",
          status: "Новый",
          price: windowConfig.price,
          config: windowConfig.config || 0,
          windowConfig: {
            width: windowConfig.width,
            height: windowConfig.height,
            glassThickness: windowConfig.glassThickness,
            openingSashType: windowConfig.openingSashType,
            shTemplate: windowConfig.shTemplate,
            profileId: selectedProfile.id,
            furnitureId: selectedFurniture.id,
            color: windowConfig.color || "white",
          },
        };

        await OrderService.createOrderWithConfig(orderWithConfig);
        Alert.alert("Успех", "Заказ успешно создан!", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Home"),
          },
        ]);
      } else {
        // Обновляем существующий заказ
        const updateData = {
          width: windowConfig.width,
          height: windowConfig.height,
          glassThickness: windowConfig.glassThickness,
          openingSashType: windowConfig.openingSashType,
          shTemplate: windowConfig.shTemplate,
          profileId: selectedProfile.id,
          furnitureId: selectedFurniture.id,
          price: windowConfig.price,
          config: windowConfig.config || 0,
          color: windowConfig.color || "white",
        };

        await OrderService.updateOrderConfig(orderData.id, updateData);
        Alert.alert("Успех", "Конфигурация заказа успешно обновлена!", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Orders"),
          },
        ]);
      }
    } catch (error) {
      console.error("Error saving configuration:", error);
      Alert.alert("Ошибка", "Не удалось сохранить конфигурацию заказа");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoBack = () => {
    if (isNewOrder) {
      navigation.navigate("Home");
    } else {
      navigation.navigate("Orders");
    }
  };

  // Обработчик скролла для sticky визуализатора
  const handleScroll = useCallback(
    (event: any) => {
      const scrollY = event.nativeEvent.contentOffset.y;
      const visualizerThreshold = visualizerLayoutY + 250; // Порог, когда показывать sticky версию

      if (scrollY > visualizerThreshold && !showStickyVisualizer) {
        setShowStickyVisualizer(true);
        stickyOpacity.setValue(1);
      } else if (scrollY <= visualizerThreshold && showStickyVisualizer) {
        setShowStickyVisualizer(false);
        stickyOpacity.setValue(0);
      }
    },
    [visualizerLayoutY, showStickyVisualizer, stickyOpacity]
  );

  // Функция для сохранения позиции визуализатора
  const onVisualizerLayout = (event: any) => {
    setVisualizerLayoutY(event.nativeEvent.layout.y);
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
            ←
          </Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }} />
        <Text
          style={[
            styles.headerTitle,
            { color: theme.colors.text, fontSize: 24, fontWeight: "bold" },
          ]}
        >
          {isNewOrder ? "Создание заказа" : "Редактирование заказа"}
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.content}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={100}
      >
        {/* Информация о заказе */}
        <View
          style={[styles.section, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Информация о заказе
          </Text>
          <View style={styles.customerInfo}>
            <Text
              style={[
                styles.customerLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              Клиент:
            </Text>
            <Text style={[styles.customerValue, { color: theme.colors.text }]}>
              {orderData.customer_name}
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
              {orderData.phone_number}
            </Text>
          </View>
          <View style={styles.customerInfo}>
            <Text
              style={[
                styles.customerLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              Статус:
            </Text>
            <Text style={[styles.customerValue, { color: theme.colors.text }]}>
              {orderStatus}
            </Text>
          </View>
        </View>

        {/* Конфигурация и цвет окна */}
        <View
          style={[styles.section, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Конфигурация окна
          </Text>

          <WindowConfigSelector
            selectedConfig={windowConfig.config || 0}
            onConfigSelect={(config) => updateWindowConfig("config", config)}
            disabled={isSaving}
          />
        </View>

        {/* Визуализация окна */}
        <View
          style={[styles.section, { backgroundColor: theme.colors.surface }]}
          onLayout={onVisualizerLayout}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Визуализация окна
          </Text>
          <View style={styles.visualizerContainer}>
            <WindowVisualizer
              config={windowConfig}
              width={screenData.width - 80}
              height={isLandscape ? 200 : 250}
            />
          </View>
        </View>

        {/* Параметры окна */}
        <View
          style={[styles.section, { backgroundColor: theme.colors.surface }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Параметры окна
          </Text>

          {/* Размеры */}
          <View style={styles.parameterRow}>
            <Text
              style={[
                styles.parameterLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              Ширина (мм):
            </Text>
            <TextInput
              style={[
                styles.parameterInput,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.textSecondary,
                },
              ]}
              value={windowConfig.width.toString()}
              onChangeText={(text) =>
                updateWindowConfig("width", parseInt(text) || 0)
              }
              keyboardType="numeric"
              placeholder="1200"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.parameterRow}>
            <Text
              style={[
                styles.parameterLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              Высота (мм):
            </Text>
            <TextInput
              style={[
                styles.parameterInput,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.textSecondary,
                },
              ]}
              value={windowConfig.height.toString()}
              onChangeText={(text) =>
                updateWindowConfig("height", parseInt(text) || 0)
              }
              keyboardType="numeric"
              placeholder="1400"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.parameterRow}>
            <Text
              style={[
                styles.parameterLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              Толщина стекла (мм):
            </Text>
            <TextInput
              style={[
                styles.parameterInput,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.textSecondary,
                },
              ]}
              value={windowConfig.glassThickness.toString()}
              onChangeText={(text) =>
                updateWindowConfig("glassThickness", parseInt(text) || 0)
              }
              keyboardType="numeric"
              placeholder="24"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          {/* Тип створок */}
          <View style={styles.parameterColumn}>
            <Text
              style={[
                styles.parameterLabel,
                { color: theme.colors.textSecondary, marginBottom: 10 },
              ]}
            >
              Тип створок:
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.sashTypeContainer}
            >
              {Object.entries(openingSashesTypes).map(([key, value]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.sashTypeButton,
                    {
                      backgroundColor:
                        windowConfig.openingSashType === key
                          ? "#2196F3"
                          : theme.colors.background,
                      borderColor: theme.colors.textSecondary,
                    },
                  ]}
                  onPress={() => updateWindowConfig("openingSashType", key)}
                >
                  <Text
                    style={[
                      styles.sashTypeText,
                      {
                        color:
                          windowConfig.openingSashType === key
                            ? "white"
                            : theme.colors.text,
                      },
                    ]}
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Выбор шаблона окна */}
          <View style={styles.parameterColumn}>
            <Text
              style={[
                styles.parameterLabel,
                { color: theme.colors.textSecondary, marginBottom: 10 },
              ]}
            >
              Шаблон окна:
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.selectorContainer}
            >
              {Object.entries(windowTemplates).map(([key, value]) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.selectorButton,
                    {
                      backgroundColor:
                        windowConfig.shTemplate === key
                          ? "#9C27B0"
                          : theme.colors.background,
                      borderColor: theme.colors.textSecondary,
                    },
                  ]}
                  onPress={() => updateWindowConfig("shTemplate", key)}
                >
                  <Text
                    style={[
                      styles.selectorText,
                      {
                        color:
                          windowConfig.shTemplate === key
                            ? "white"
                            : theme.colors.text,
                      },
                    ]}
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Выбор профиля */}
          <View style={styles.parameterColumn}>
            <Text
              style={[
                styles.parameterLabel,
                { color: theme.colors.textSecondary, marginBottom: 10 },
              ]}
            >
              Профиль:
            </Text>
            {isLoading ? (
              <Text
                style={[
                  styles.loadingText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Загрузка профилей...
              </Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.selectorContainer}
              >
                {profiles
                  .filter((profile, index, self) => {
                    // Группируем FUNKE профили - показываем только один "FUNKE"
                    const profileName = profile.name?.toUpperCase() || "";
                    if (profileName.includes("FUNKE")) {
                      // Показываем только первый FUNKE профиль в списке
                      return (
                        self.findIndex((p) =>
                          p.name?.toUpperCase().includes("FUNKE")
                        ) === index
                      );
                    }
                    return true;
                  })
                  .map((profile) => {
                    const isFunke = profile.name
                      ?.toUpperCase()
                      .includes("FUNKE");
                    const isSelected = isFunke
                      ? selectedProfileId === 1 || selectedProfileId === 5
                      : selectedProfileId === profile.id;

                    return (
                      <TouchableOpacity
                        key={profile.id}
                        style={[
                          styles.selectorButton,
                          {
                            backgroundColor: isSelected
                              ? "#4CAF50"
                              : theme.colors.background,
                            borderColor: theme.colors.textSecondary,
                          },
                        ]}
                        onPress={() => {
                          if (isFunke) {
                            // Для FUNKE устанавливаем ID на основе выбранной толщины
                            const funkeId = funkeProfileDepth === "58" ? 1 : 5;
                            setSelectedProfileId(funkeId);
                            updateWindowConfig("profileType", profile.name);
                          } else {
                            setSelectedProfileId(profile.id);
                            updateWindowConfig("profileType", profile.name);
                          }
                        }}
                      >
                        <Text
                          style={[
                            styles.selectorText,
                            {
                              color: isSelected ? "white" : theme.colors.text,
                            },
                          ]}
                        >
                          {isFunke ? "FUNKE" : profile.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
              </ScrollView>
            )}
          </View>

          {/* Выбор толщины профиля FUNKE */}
          {selectedProfileId &&
            profiles
              .find((p) => p.id === selectedProfileId)
              ?.name?.toUpperCase()
              .includes("FUNKE") && (
              <View style={styles.parameterColumn}>
                <Text
                  style={[
                    styles.parameterLabel,
                    { color: theme.colors.textSecondary, marginBottom: 10 },
                  ]}
                >
                  Толщина профиля FUNKE:
                </Text>
                <View style={styles.funkeDepthContainer}>
                  <TouchableOpacity
                    style={[
                      styles.funkeDepthButton,
                      {
                        backgroundColor:
                          funkeProfileDepth === "58"
                            ? "#4CAF50"
                            : theme.colors.background,
                        borderColor: theme.colors.textSecondary,
                      },
                    ]}
                    onPress={() => {
                      setFunkeProfileDepth("58");
                      setSelectedProfileId(1); // FUNKE 58mm имеет ID = 1
                      const funkeProfile = profiles.find((p) => p.id === 1);
                      if (funkeProfile) {
                        updateWindowConfig("profileType", funkeProfile.name);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.selectorText,
                        {
                          color:
                            funkeProfileDepth === "58"
                              ? "white"
                              : theme.colors.text,
                        },
                      ]}
                    >
                      58 мм
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.funkeDepthButton,
                      {
                        backgroundColor:
                          funkeProfileDepth === "70"
                            ? "#4CAF50"
                            : theme.colors.background,
                        borderColor: theme.colors.textSecondary,
                      },
                    ]}
                    onPress={() => {
                      setFunkeProfileDepth("70");
                      setSelectedProfileId(5); // FUNKE 70mm имеет ID = 5
                      const funkeProfile = profiles.find((p) => p.id === 5);
                      if (funkeProfile) {
                        updateWindowConfig("profileType", funkeProfile.name);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.selectorText,
                        {
                          color:
                            funkeProfileDepth === "70"
                              ? "white"
                              : theme.colors.text,
                        },
                      ]}
                    >
                      70 мм
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

          {/* Выбор фурнитуры */}
          <View style={styles.parameterColumn}>
            <Text
              style={[
                styles.parameterLabel,
                { color: theme.colors.textSecondary, marginBottom: 10 },
              ]}
            >
              Фурнитура:
            </Text>
            {isLoading ? (
              <Text
                style={[
                  styles.loadingText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Загрузка фурнитуры...
              </Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.selectorContainer}
              >
                {furnitures.map((furniture) => (
                  <TouchableOpacity
                    key={furniture.id}
                    style={[
                      styles.selectorButton,
                      {
                        backgroundColor:
                          selectedFurnitureId === furniture.id
                            ? "#FF9800"
                            : theme.colors.background,
                        borderColor: theme.colors.textSecondary,
                      },
                    ]}
                    onPress={() => {
                      setSelectedFurnitureId(furniture.id);
                      updateWindowConfig("furnitureType", furniture.name);
                    }}
                  >
                    <Text
                      style={[
                        styles.selectorText,
                        {
                          color:
                            selectedFurnitureId === furniture.id
                              ? "white"
                              : theme.colors.text,
                        },
                      ]}
                    >
                      {furniture.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
          <View style={styles.parameterColumn}>
            <ColorSelector
              selectedColor={windowConfig.color || "white"}
              onColorSelect={(color) => updateWindowConfig("color", color)}
              disabled={isSaving}
            />
          </View>
          <View style={styles.parameterRow}>
            <Text
              style={[
                styles.parameterLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              Площадь окна:
            </Text>
            <Text style={[styles.parameterValue, { color: theme.colors.text }]}>
              {((windowConfig.width * windowConfig.height) / 1000000).toFixed(
                2
              )}
              {" м²"}
            </Text>
          </View>

          {/* Расчетная площадь */}
          <View
            style={[
              styles.calculatedArea,
              { borderColor: theme.colors.textSecondary },
            ]}
          >
            <Text
              style={[styles.areaLabel, { color: theme.colors.textSecondary }]}
            >
              Цена:
            </Text>
            {/* <Text style={[styles.areaValue, { color: theme.colors.text }]}>
              {orderData.price} тг
            </Text> */}
            <TextInput
              style={[
                styles.parameterInput,
                {
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.textSecondary,
                },
              ]}
              value={windowConfig.price.toString()}
              onChangeText={(text) =>
                updateWindowConfig("price", parseInt(text) || 0)
              }
              keyboardType="numeric"
              placeholder="24"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor:
                  isSaving || isLoading || (!hasChanges() && !isNewOrder)
                    ? "#ccc"
                    : "#2196F3",
              },
            ]}
            onPress={handleSaveOrder}
            disabled={isSaving || isLoading || (!hasChanges() && !isNewOrder)}
          >
            <Text
              style={[
                styles.actionButtonText,
                {
                  color:
                    isSaving || isLoading || (!hasChanges() && !isNewOrder)
                      ? "#999"
                      : "#fff",
                },
              ]}
            >
              {isSaving
                ? "Сохранение..."
                : isNewOrder
                ? "Создать конфигурацию"
                : hasChanges()
                ? "Сохранить конфигурацию"
                : "Нет изменений"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sticky WindowVisualizer */}
      {showStickyVisualizer && (
        <Animated.View
          style={[
            styles.stickyVisualizer,
            {
              opacity: stickyOpacity,
              backgroundColor: theme.colors.surface,
              borderBottomColor: theme.colors.border,
            },
          ]}
        >
          <WindowVisualizer
            config={windowConfig}
            width={screenData.width * 0.6}
            height={80}
            isCompact={true}
          />
        </Animated.View>
      )}
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
    // justifyContent: "space-between",
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
    fontSize: 24,
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
  // Новые стили для конструктора
  visualizerContainer: {
    alignItems: "center",
    paddingVertical: 10,
  },
  parameterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  parameterColumn: {
    marginBottom: 15,
  },
  parameterLabel: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  parameterValue: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  parameterInput: {
    flex: 1,
    marginLeft: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 16,
    textAlign: "right",
  },
  sashTypeContainer: {
    flexDirection: "row",
  },
  sashTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderRadius: 8,
    minWidth: 120,
  },
  sashTypeText: {
    fontSize: 12,
    textAlign: "center",
    fontWeight: "500",
  },
  calculatedArea: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
  },
  areaLabel: {
    fontSize: 18,
    fontWeight: "600",
  },
  areaValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  // Стили для элементов выбора профиля и фурнитуры
  selectorContainer: {
    flexDirection: "row",
  },
  selectorButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 10,
    borderWidth: 1,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  selectorText: {
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  loadingText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 20,
  },
  // Стили для выбора толщины профиля FUNKE
  funkeDepthContainer: {
    flexDirection: "row",
    gap: 12,
  },
  funkeDepthButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  // Стили для sticky визуализатора
  stickyVisualizer: {
    position: "absolute",
    top: 90, // Ниже header
    left: 0,
    right: 0,
    height: 100,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default WorkflowScreen;
