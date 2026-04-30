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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useTheme } from "../context/ThemeContext";
import WindowVisualizer, { WindowConfig } from "../components/WindowVisualizer";
import WindowConfigSelector from "../components/WindowConfigSelector";
import ColorSelector from "../components/ColorSelector";
import WindowEditorModal from "../components/WindowEditorModal";
import { openingSashesTypes } from "../utils/opening_sashes.dict";
import { windowTemplates } from "../utils/window_templates.dict";
import { OrderService, OrderWithConfig } from "../services/orderService";
import {
  PriceService,
  Profile,
  GlassPackage,
  FurnitureSystem,
  FurnitureItem,
  Handle,
  MosquitoNetPrice,
  ReinforcementPrice,
  Extra,
} from "../services/priceService";
import { RouteProp } from "@react-navigation/native";
import {
  calculateWindowPriceFromDB,
  PriceBreakdown,
  PriceSection,
} from "../utils/priceCalculator";
import { workflowDimensionsSchema } from "../validation/newOrderSchema";

type WorkflowScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Workflow"
>;
type WorkflowScreenRouteProp = RouteProp<RootStackParamList, "Workflow">;

interface Props {
  navigation: WorkflowScreenNavigationProp;
  route: WorkflowScreenRouteProp;
}

type WndSize = { width?: number; height?: number };

type DBWndSection = {
  section_id: string;
  width_mm: number | null;
  height_mm: number | null;
  opening_side: string | null;
  opening_type: string | null;
  has_handle: boolean | null;
};

const WorkflowScreen: React.FC<Props> = ({ navigation, route }) => {
  const { isDarkMode, theme } = useTheme();
  const { orderData, isNewOrder } = route.params;
  const [orderStatus, setOrderStatus] = useState(orderData.status);

  // Преобразование секций из БД в формат WindowSection.
  // wnd_sections добавляется в getOrders() через select, но в типах сгенерированной схемы
  // его нет — поэтому достаём через явное приведение, без ts-ignore.
  const loadSectionsFromDB = () => {
    const wnd = orderData.wnd_constructions as
      | { wnd_sections?: DBWndSection[] }
      | undefined;
    const dbSections = wnd?.wnd_sections;
    if (!dbSections || !Array.isArray(dbSections)) {
      return undefined;
    }
    return dbSections.map((s) => ({
      id: s.section_id,
      widthMM: s.width_mm || undefined,
      heightMM: s.height_mm || undefined,
      openingSide: (s.opening_side || undefined) as
        | "left"
        | "right"
        | "top"
        | "bottom"
        | "fixed"
        | "single"
        | undefined,
      openingType: (s.opening_type || undefined) as
        | "tilt_turn"
        | "turn"
        | "tilt"
        | "fixed"
        | "window"
        | "window_with_handle"
        | "balcony_door"
        | undefined,
      hasHandle: s.has_handle || false,
    }));
  };

  // size в БД — Json, но фактически имеет вид { width, height }.
  const wndRow = orderData.wnd_constructions;
  const size = (wndRow.size as WndSize | null) ?? {};
  const initialConfig: WindowConfig = {
    width: Number(wndRow.width_mm ?? size.width) || 0,
    height: Number(wndRow.height_mm ?? size.height) || 0,
    glassThickness: Number(wndRow.th_glass || 0),
    openingSashType: wndRow.opening_sashes || "1", // По умолчанию "Обе створки поворотные"
    shTemplate: wndRow.sh_template || "single_sash",
    price: Number(orderData.price) || 0,
    profileType: "",
    furnitureType: "",
    config: orderData.config || 1, // По умолчанию конфигурация 1
    color: wndRow.color || "white",
    sections: loadSectionsFromDB(),
  };

  const [windowConfig, setWindowConfig] = useState<WindowConfig>(initialConfig);
  const [originalConfig, setOriginalConfig] =
    useState<WindowConfig>(initialConfig);
  const [originalProfileId, setOriginalProfileId] = useState<number | null>(
    orderData.wnd_constructions.profiles?.id || null
  );
  const [originalFurnitureSystemId, setOriginalFurnitureSystemId] = useState<number | null>(null);

  // Состояние для отслеживания размеров экрана и ориентации
  const [screenData, setScreenData] = useState(Dimensions.get("window"));
  const isLandscape = screenData.width > screenData.height;

  // Состояния для списков справочников
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [furnitureSystems, setFurnitureSystems] = useState<FurnitureSystem[]>([]);
  const [furnitureItems, setFurnitureItems] = useState<FurnitureItem[]>([]);
  const [glassPackages, setGlassPackages] = useState<GlassPackage[]>([]);
  const [handles, setHandles] = useState<Handle[]>([]);
  const [mosquitoNetPrices, setMosquitoNetPrices] = useState<MosquitoNetPrice[]>([]);
  const [reinforcementPrices, setReinforcementPrices] = useState<ReinforcementPrice[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);
  
  // Состояния для выбранных элементов
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [selectedFurnitureSystemId, setSelectedFurnitureSystemId] = useState<number | null>(null);
  const [selectedGlassPackageId, setSelectedGlassPackageId] = useState<number | null>(null);
  const [selectedHandleId, setSelectedHandleId] = useState<number | null>(null);
  
  // Группировка профилей по системам
  const [profileSystems, setProfileSystems] = useState<string[]>([]);
  const [selectedProfileSystem, setSelectedProfileSystem] = useState<string | null>(null);
  const priceQuery = useQuery({
    queryKey: ["priceCatalog"],
    queryFn: () => PriceService.loadAllPriceData(),
    staleTime: 300_000,
  });
  const isLoading = priceQuery.isPending;
  const [isSaving, setIsSaving] = useState(false);
  const [editorModalVisible, setEditorModalVisible] = useState(false);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(
    null
  );
  const [showPriceDetails, setShowPriceDetails] = useState(false);
  const [manualPriceOverride, setManualPriceOverride] = useState<number | null>(
    null
  );

  // Состояние для sticky визуализатора
  const [showStickyVisualizer, setShowStickyVisualizer] = useState(false);
  const [visualizerLayoutY, setVisualizerLayoutY] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const stickyOpacity = useRef(new Animated.Value(0)).current;

  const [dimsForPrice, setDimsForPrice] = useState({
    w: initialConfig.width,
    h: initialConfig.height,
  });

  useEffect(() => {
    const t = setTimeout(
      () => setDimsForPrice({ w: windowConfig.width, h: windowConfig.height }),
      300
    );
    return () => clearTimeout(t);
  }, [windowConfig.width, windowConfig.height]);

  useEffect(() => {
    const d = priceQuery.data;
    if (!d) return;
    setProfiles(d.profiles);
    setFurnitureSystems(d.furnitureSystems);
    setFurnitureItems(d.furnitureItems);
    setGlassPackages(d.glassPackages);
    setHandles(d.handles);
    setMosquitoNetPrices(d.mosquitoNetPrices);
    setReinforcementPrices(d.reinforcementPrices);
    setExtras(d.extras);
    const systems = [
      ...new Set(d.profiles.map((p) => p.system_name).filter(Boolean)),
    ] as string[];
    setProfileSystems(systems);
    setSelectedProfileSystem((prev) => prev ?? systems[0] ?? null);
  }, [priceQuery.data]);

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
      windowConfig.price !== originalConfig.price ||
      windowConfig.config !== originalConfig.config ||
      windowConfig.color !== originalConfig.color;

    const profileChanged = selectedProfileId !== originalProfileId;
    const furnitureChanged = selectedFurnitureSystemId !== originalFurnitureSystemId;

    return configChanged || profileChanged || furnitureChanged;
  };

  // Предзаполнение данных из заказа
  useEffect(() => {
    if (orderData && profiles.length > 0 && furnitureSystems.length > 0) {
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

      // Устанавливаем выбранный профиль и его систему
      if (orderData.wnd_constructions.profiles?.id) {
        const profile = profiles.find(p => p.id === orderData.wnd_constructions.profiles?.id);
        setSelectedProfileId(orderData.wnd_constructions.profiles.id);
        setOriginalProfileId(orderData.wnd_constructions.profiles.id);
        
        if (profile?.system_name) {
          setSelectedProfileSystem(profile.system_name);
        }
      }
      
      // Устанавливаем выбранную систему фурнитуры
      if (orderData.wnd_constructions.furnitures?.id) {
        // Находим систему фурнитуры по коду
        const furnitureCode = orderData.wnd_constructions.furnitures?.system_code;
        if (furnitureCode) {
          const system = furnitureSystems.find(s => s.code === furnitureCode);
          if (system) {
            setSelectedFurnitureSystemId(system.id);
            setOriginalFurnitureSystemId(system.id);
          }
        }
      }
    }
  }, [orderData, profiles, furnitureSystems]);

  // Автоматический расчет цены при изменении параметров
  useEffect(() => {
    if (
      selectedProfileId &&
      selectedFurnitureSystemId &&
      dimsForPrice.w > 0 &&
      dimsForPrice.h > 0 &&
      profiles.length > 0 &&
      furnitureSystems.length > 0
    ) {
      const selectedProfile = profiles.find((p) => p.id === selectedProfileId);
      const selectedFurnitureSystem = furnitureSystems.find(
        (f) => f.id === selectedFurnitureSystemId
      );

      if (selectedProfile && selectedFurnitureSystem) {
        const glassThickness = windowConfig.glassThickness || 36;
        const glassPackage =
          glassPackages.find(
            (g) => g.id === selectedGlassPackageId
          ) ||
          glassPackages.find((g) => g.thickness === glassThickness) ||
          null;
        const handle =
          handles.find((h) => h.id === selectedHandleId) ||
          handles.find((h) => h.code === "HANDLE_HOPPE") ||
          null;
        const balconyHandle =
          handles.find((h) => h.code === "HANDLE_DOUBLE") || null;

        const sectionsForCalc: PriceSection[] | undefined =
          windowConfig.sections?.map((s) => ({
            id: s.id,
            widthMM: s.widthMM ?? 0,
            heightMM: s.heightMM ?? 0,
            openingType: (s.openingType as PriceSection["openingType"]) || "fixed",
            openingSide: s.openingSide,
            hasHandle: s.hasHandle,
          }));

        const commonOptions = {
          hasMosquitoNet: false,
          mosquitoNetColor: "white" as const,
          reinforcementLZ: "1.2",
          reinforcementT: "1.5",
          hasBalconyLatch: false,
          hasMicroVentilation: false,
          hasHandle: true,
          hasBalconyHandle: false,
        };

        const canUseDBCalc =
          glassPackage != null &&
          (selectedProfile.frame_price ?? 0) > 0 &&
          furnitureItems.length > 0;

        if (!canUseDBCalc) {
          setPriceBreakdown(null);
          return;
        }

        const breakdown = calculateWindowPriceFromDB({
          width: dimsForPrice.w,
          height: dimsForPrice.h,
          profile: selectedProfile,
          glassPackage: glassPackage!,
          handle,
          balconyHandle,
          furnitureItems,
          furnitureSystemId: selectedFurnitureSystem.id,
          mosquitoNetPrices,
          reinforcementPrices,
          extras,
          sections: sectionsForCalc,
          config: windowConfig.config ?? 1,
          options: commonOptions,
        });

        setPriceBreakdown(breakdown);

        if (manualPriceOverride === null) {
          updateWindowConfig("price", breakdown.total);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedProfileId,
    selectedFurnitureSystemId,
    selectedGlassPackageId,
    selectedHandleId,
    dimsForPrice.w,
    dimsForPrice.h,
    windowConfig.glassThickness,
    windowConfig.openingSashType,
    windowConfig.shTemplate,
    windowConfig.color,
    windowConfig.config,
    windowConfig.sections,
    profiles,
    furnitureSystems,
    furnitureItems,
    glassPackages,
    handles,
    mosquitoNetPrices,
    reinforcementPrices,
    extras,
  ]);

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

      const dimCheck = workflowDimensionsSchema.safeParse({
        width: windowConfig.width,
        height: windowConfig.height,
      });
      if (!dimCheck.success) {
        Alert.alert("Ошибка", dimCheck.error.issues[0]?.message ?? "Проверьте размеры");
        return;
      }

      // Проверяем что выбраны профиль и система фурнитуры
      if (!selectedProfileId || !selectedFurnitureSystemId) {
        Alert.alert("Ошибка", "Пожалуйста, выберите профиль и фурнитуру");
        return;
      }

      const selectedProfile = profiles.find((p) => p.id === selectedProfileId);
      const selectedFurnitureSystem = furnitureSystems.find(
        (f) => f.id === selectedFurnitureSystemId
      );

      if (!selectedProfile || !selectedFurnitureSystem) {
        Alert.alert("Ошибка", "Выбранные профиль или фурнитура не найдены");
        return;
      }

      // Для совместимости со старой структурой, находим или создаём furnitureId
      // Используем ID системы фурнитуры как furnitureId
      const furnitureId = selectedFurnitureSystem.id;

      if (isNewOrder) {
        // Создаем новый заказ
        const orderWithConfig: OrderWithConfig = {
          customer_name: orderData.customer_name || "",
          phone_number: orderData.phone_number || "",
          creator: orderData.creator || "",
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
            furnitureId: furnitureId,
            color: windowConfig.color || "white",
            sections: windowConfig.sections,
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
          furnitureId: furnitureId,
          price: windowConfig.price,
          config: windowConfig.config || 0,
          color: windowConfig.color || "white",
          sections: windowConfig.sections,
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
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
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
        keyboardShouldPersistTaps="handled"
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
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 15,
            }}
          >
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Визуализация окна
            </Text>
            <TouchableOpacity
              style={[
                styles.expandButton,
                { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => setEditorModalVisible(true)}
            >
              <Text style={styles.expandButtonText}>Редактировать</Text>
            </TouchableOpacity>
          </View>
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

          {/* Шаблон окна (статичное значение из базы) */}
          <View style={styles.parameterRow}>
            <Text
              style={[
                styles.parameterLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              Шаблон окна:
            </Text>
            <TouchableOpacity
              style={[
                styles.selectorButton,
                {
                  backgroundColor: theme.colors.background,
                  borderColor: theme.colors.textSecondary,
                  opacity: 0.6,
                },
              ]}
              disabled={true}
            >
              <Text
                style={[
                  styles.selectorText,
                  {
                    color: theme.colors.textSecondary,
                  },
                ]}
              >
                {windowTemplates[
                  windowConfig.shTemplate as keyof typeof windowTemplates
                ] || windowConfig.shTemplate}
              </Text>
            </TouchableOpacity>
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

          {/* Выбор системы профиля */}
          <View style={styles.parameterColumn}>
            <Text
              style={[
                styles.parameterLabel,
                { color: theme.colors.textSecondary, marginBottom: 10 },
              ]}
            >
              Система профиля:
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
                {profileSystems.map((system) => (
                  <TouchableOpacity
                    key={system}
                    style={[
                      styles.selectorButton,
                      {
                        backgroundColor:
                          selectedProfileSystem === system
                            ? "#4CAF50"
                            : theme.colors.background,
                        borderColor: theme.colors.textSecondary,
                      },
                    ]}
                    onPress={() => {
                      setSelectedProfileSystem(system);
                      // Выбираем первый профиль этой системы по умолчанию
                      const firstProfile = profiles.find(p => p.system_name === system);
                      if (firstProfile) {
                        setSelectedProfileId(firstProfile.id);
                        updateWindowConfig("profileType", firstProfile.name);
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.selectorText,
                        {
                          color:
                            selectedProfileSystem === system
                              ? "white"
                              : theme.colors.text,
                        },
                      ]}
                    >
                      {system}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Выбор глубины профиля */}
          {selectedProfileSystem && (
            <View style={styles.parameterColumn}>
              <Text
                style={[
                  styles.parameterLabel,
                  { color: theme.colors.textSecondary, marginBottom: 10 },
                ]}
              >
                Глубина профиля:
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.selectorContainer}
              >
                {profiles
                  .filter(p => p.system_name === selectedProfileSystem)
                  .map((profile) => (
                    <TouchableOpacity
                      key={profile.id}
                      style={[
                        styles.selectorButton,
                        {
                          backgroundColor:
                            selectedProfileId === profile.id
                              ? "#4CAF50"
                              : theme.colors.background,
                          borderColor: theme.colors.textSecondary,
                        },
                      ]}
                      onPress={() => {
                        setSelectedProfileId(profile.id);
                        updateWindowConfig("profileType", profile.name);
                      }}
                    >
                      <Text
                        style={[
                          styles.selectorText,
                          {
                            color:
                              selectedProfileId === profile.id
                                ? "white"
                                : theme.colors.text,
                          },
                        ]}
                      >
                        {profile.depth ? `${profile.depth} мм` : profile.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          )}

          {/* Выбор системы фурнитуры */}
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
                {furnitureSystems.map((system) => (
                  <TouchableOpacity
                    key={system.id}
                    style={[
                      styles.selectorButton,
                      {
                        backgroundColor:
                          selectedFurnitureSystemId === system.id
                            ? "#FF9800"
                            : theme.colors.background,
                        borderColor: theme.colors.textSecondary,
                      },
                    ]}
                    onPress={() => {
                      setSelectedFurnitureSystemId(system.id);
                      updateWindowConfig("furnitureType", system.name);
                    }}
                  >
                    <Text
                      style={[
                        styles.selectorText,
                        {
                          color:
                            selectedFurnitureSystemId === system.id
                              ? "white"
                              : theme.colors.text,
                        },
                      ]}
                    >
                      {system.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
          
          {/* Выбор стеклопакета */}
          <View style={styles.parameterColumn}>
            <Text
              style={[
                styles.parameterLabel,
                { color: theme.colors.textSecondary, marginBottom: 10 },
              ]}
            >
              Стеклопакет:
            </Text>
            {isLoading ? (
              <Text
                style={[
                  styles.loadingText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Загрузка...
              </Text>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.selectorContainer}
              >
                {glassPackages.map((glass) => (
                  <TouchableOpacity
                    key={glass.id}
                    style={[
                      styles.selectorButton,
                      {
                        backgroundColor:
                          selectedGlassPackageId === glass.id
                            ? "#9C27B0"
                            : theme.colors.background,
                        borderColor: theme.colors.textSecondary,
                        minWidth: 100,
                      },
                    ]}
                    onPress={() => {
                      setSelectedGlassPackageId(glass.id);
                      updateWindowConfig("glassThickness", glass.thickness);
                    }}
                  >
                    <Text
                      style={[
                        styles.selectorText,
                        {
                          color:
                            selectedGlassPackageId === glass.id
                              ? "white"
                              : theme.colors.text,
                          fontSize: 12,
                        },
                      ]}
                    >
                      {glass.name}
                    </Text>
                    <Text
                      style={[
                        styles.selectorSubtext,
                        {
                          color:
                            selectedGlassPackageId === glass.id
                              ? "rgba(255,255,255,0.8)"
                              : theme.colors.textSecondary,
                        },
                      ]}
                    >
                      {glass.thickness} мм
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

          {/* Расчетная цена */}
          <View
            style={[
              styles.calculatedArea,
              { borderColor: theme.colors.textSecondary },
            ]}
          >
            <View style={styles.priceHeader}>
              <Text
                style={[
                  styles.areaLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Итоговая цена:
              </Text>
              <TouchableOpacity
                onPress={() => setShowPriceDetails(!showPriceDetails)}
              >
                <Text
                  style={[
                    styles.detailsToggle,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {showPriceDetails ? "Скрыть" : "Детали"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.priceValueContainer}>
              <TextInput
                style={[
                  styles.priceInput,
                  {
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    borderColor: theme.colors.textSecondary,
                  },
                ]}
                value={windowConfig.price.toFixed(2)}
                onChangeText={(text) => {
                  const newPrice = parseFloat(text) || 0;
                  setManualPriceOverride(newPrice);
                  updateWindowConfig("price", newPrice);
                }}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={theme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.currencyLabel,
                  { color: theme.colors.text, marginLeft: 10 },
                ]}
              >
                тг
              </Text>
              {manualPriceOverride !== null && (
                <TouchableOpacity
                  onPress={() => {
                    setManualPriceOverride(null);
                    if (priceBreakdown) {
                      updateWindowConfig("price", priceBreakdown.total);
                    }
                  }}
                  style={styles.resetPriceButton}
                >
                  <Text
                    style={[
                      styles.resetPriceText,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Авто
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Детализация цены */}
          {showPriceDetails && priceBreakdown && (
            <View
              style={[
                styles.priceDetailsContainer,
                { backgroundColor: theme.colors.background },
              ]}
            >
              <Text
                style={[styles.priceDetailsTitle, { color: theme.colors.text }]}
              >
                Детализация цены:
              </Text>
              <View style={styles.priceDetailRow}>
                <Text
                  style={[
                    styles.priceDetailLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Профиль (рама + створка):
                </Text>
                <Text
                  style={[
                    styles.priceDetailValue,
                    { color: theme.colors.text },
                  ]}
                >
                  {priceBreakdown.profilePrice.toFixed(0)} тг
                </Text>
              </View>
              {priceBreakdown.impostPrice > 0 && (
                <View style={styles.priceDetailRow}>
                  <Text
                    style={[
                      styles.priceDetailLabel,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Импосты:
                  </Text>
                  <Text
                    style={[
                      styles.priceDetailValue,
                      { color: theme.colors.text },
                    ]}
                  >
                    {priceBreakdown.impostPrice.toFixed(0)} тг
                  </Text>
                </View>
              )}
              <View style={styles.priceDetailRow}>
                <Text
                  style={[
                    styles.priceDetailLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Стеклопакет:
                </Text>
                <Text
                  style={[
                    styles.priceDetailValue,
                    { color: theme.colors.text },
                  ]}
                >
                  {priceBreakdown.glassPrice.toFixed(0)} тг
                </Text>
              </View>
              <View style={styles.priceDetailRow}>
                <Text
                  style={[
                    styles.priceDetailLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Фурнитура:
                </Text>
                <Text
                  style={[
                    styles.priceDetailValue,
                    { color: theme.colors.text },
                  ]}
                >
                  {priceBreakdown.furniturePrice.toFixed(0)} тг
                </Text>
              </View>
              {priceBreakdown.handlePrice > 0 && (
                <View style={styles.priceDetailRow}>
                  <Text
                    style={[
                      styles.priceDetailLabel,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Ручка:
                  </Text>
                  <Text
                    style={[
                      styles.priceDetailValue,
                      { color: theme.colors.text },
                    ]}
                  >
                    {priceBreakdown.handlePrice.toFixed(0)} тг
                  </Text>
                </View>
              )}
              {priceBreakdown.reinforcementPrice > 0 && (
                <View style={styles.priceDetailRow}>
                  <Text
                    style={[
                      styles.priceDetailLabel,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Армирование:
                  </Text>
                  <Text
                    style={[
                      styles.priceDetailValue,
                      { color: theme.colors.text },
                    ]}
                  >
                    {priceBreakdown.reinforcementPrice.toFixed(0)} тг
                  </Text>
                </View>
              )}
              {priceBreakdown.mosquitoNetPrice > 0 && (
                <View style={styles.priceDetailRow}>
                  <Text
                    style={[
                      styles.priceDetailLabel,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Москитная сетка:
                  </Text>
                  <Text
                    style={[
                      styles.priceDetailValue,
                      { color: theme.colors.text },
                    ]}
                  >
                    {priceBreakdown.mosquitoNetPrice.toFixed(0)} тг
                  </Text>
                </View>
              )}
              {priceBreakdown.optionsPrice > 0 && (
                <View style={styles.priceDetailRow}>
                  <Text
                    style={[
                      styles.priceDetailLabel,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Доп. опции:
                  </Text>
                  <Text
                    style={[
                      styles.priceDetailValue,
                      { color: theme.colors.text },
                    ]}
                  >
                    {priceBreakdown.optionsPrice.toFixed(0)} тг
                  </Text>
                </View>
              )}
              <View
                style={[
                  styles.priceDetailRow,
                  styles.priceDetailRowTotal,
                  { borderTopColor: theme.colors.textSecondary },
                ]}
              >
                <Text
                  style={[
                    styles.priceDetailLabel,
                    styles.priceDetailLabelTotal,
                    { color: theme.colors.text },
                  ]}
                >
                  Итого:
                </Text>
                <Text
                  style={[
                    styles.priceDetailValue,
                    styles.priceDetailValueTotal,
                    { color: theme.colors.text },
                  ]}
                >
                  {priceBreakdown.total.toFixed(0)} тг
                </Text>
              </View>
            </View>
          )}
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

      {/* Window Editor Modal */}
      <WindowEditorModal
        visible={editorModalVisible}
        onClose={() => setEditorModalVisible(false)}
        config={windowConfig}
        onConfigChange={(newConfig) => {
          setWindowConfig(newConfig);
        }}
      />
    </KeyboardAvoidingView>
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
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
  },
  priceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  areaLabel: {
    fontSize: 18,
    fontWeight: "600",
  },
  detailsToggle: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
  priceValueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  priceInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "right",
  },
  currencyLabel: {
    fontSize: 18,
    fontWeight: "600",
  },
  resetPriceButton: {
    marginLeft: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: "#E0E0E0",
  },
  resetPriceText: {
    fontSize: 12,
    fontWeight: "500",
  },
  areaValue: {
    fontSize: 20,
    fontWeight: "bold",
  },
  priceDetailsContainer: {
    marginTop: 15,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
  },
  priceDetailsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  priceDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  priceDetailRowSubtotal: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 5,
  },
  priceDetailRowTotal: {
    borderTopWidth: 2,
    paddingTop: 10,
    marginTop: 5,
  },
  priceDetailLabel: {
    fontSize: 14,
    flex: 1,
  },
  priceDetailLabelTotal: {
    fontSize: 16,
    fontWeight: "600",
  },
  priceDetailValue: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
  },
  priceDetailValueTotal: {
    fontSize: 18,
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
  selectorSubtext: {
    fontSize: 11,
    textAlign: "center",
    marginTop: 2,
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
  expandButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  expandButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default WorkflowScreen;
