import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import { useTheme } from "../context/ThemeContext";
import {
  PriceService,
  Profile,
  GlassPackage,
  GlassType,
  FurnitureSystem,
  FurnitureItem,
  Handle,
  Windowsill,
  WindowsillAccessory,
  Muntin,
  MosquitoNetPrice,
  ReinforcementPrice,
  Extra,
} from "../services/priceService";

type PriceScreenNavigationProp = StackNavigationProp<RootStackParamList, "Price">;

interface Props {
  navigation: PriceScreenNavigationProp;
}

// Типы категорий
type CategoryKey =
  | "profiles"
  | "glass"
  | "furniture"
  | "handles"
  | "extras";

interface Category {
  key: CategoryKey;
  title: string;
}

const CATEGORIES: Category[] = [
  { key: "profiles", title: "Профили" },
  { key: "glass", title: "Стеклопакеты" },
  { key: "furniture", title: "Фурнитура" },
  { key: "handles", title: "Ручки" },
  { key: "extras", title: "Доп. опции" },
];

// Тип для редактируемого элемента
interface EditableItem {
  id: number;
  table: string;
  field: string;
  currentValue: number;
  itemName: string;
}

const PriceScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("profiles");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Модальное окно редактирования
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<EditableItem | null>(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Данные
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [glassPackages, setGlassPackages] = useState<GlassPackage[]>([]);
  const [glassTypes, setGlassTypes] = useState<GlassType[]>([]);
  const [furnitureSystems, setFurnitureSystems] = useState<FurnitureSystem[]>([]);
  const [furnitureItems, setFurnitureItems] = useState<FurnitureItem[]>([]);
  const [handles, setHandles] = useState<Handle[]>([]);
  const [windowsills, setWindowsills] = useState<Windowsill[]>([]);
  const [windowsillAccessories, setWindowsillAccessories] = useState<WindowsillAccessory[]>([]);
  const [muntins, setMuntins] = useState<Muntin[]>([]);
  const [mosquitoNetPrices, setMosquitoNetPrices] = useState<MosquitoNetPrice[]>([]);
  const [reinforcementPrices, setReinforcementPrices] = useState<ReinforcementPrice[]>([]);
  const [extras, setExtras] = useState<Extra[]>([]);

  // Загрузка данных
  const loadData = useCallback(async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      const data = await PriceService.loadAllPriceData(forceRefresh);
      
      setProfiles(data.profiles);
      setGlassPackages(data.glassPackages);
      setGlassTypes(data.glassTypes);
      setFurnitureSystems(data.furnitureSystems);
      setFurnitureItems(data.furnitureItems);
      setHandles(data.handles);
      setWindowsills(data.windowsills);
      setWindowsillAccessories(data.windowsillAccessories);
      setMuntins(data.muntins);
      setMosquitoNetPrices(data.mosquitoNetPrices);
      setReinforcementPrices(data.reinforcementPrices);
      setExtras(data.extras);
    } catch (error) {
      console.error("Error loading price data:", error);
      Alert.alert("Ошибка", "Не удалось загрузить данные. Проверьте подключение к интернету.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Форматирование цены
  const formatPrice = (price: number): string => {
    return price.toLocaleString("ru-RU") + " ₸";
  };

  // Открытие модального окна редактирования
  const openEditModal = (item: EditableItem) => {
    setEditingItem(item);
    setEditValue(item.currentValue.toString());
    setEditModalVisible(true);
  };

  // Сохранение изменений
  const saveEdit = async () => {
    if (!editingItem) return;
    
    const newValue = parseFloat(editValue);
    if (isNaN(newValue) || newValue < 0) {
      Alert.alert("Ошибка", "Введите корректное значение цены");
      return;
    }

    setIsSaving(true);
    try {
      const updates = { [editingItem.field]: newValue };
      
      switch (editingItem.table) {
        case "profiles":
          await PriceService.updateProfile(editingItem.id, updates);
          break;
        case "glass_packages":
          await PriceService.updateGlassPackage(editingItem.id, updates);
          break;
        case "glass_types":
          await PriceService.updateGlassType(editingItem.id, updates);
          break;
        case "furniture_items":
          await PriceService.updateFurnitureItem(editingItem.id, updates);
          break;
        case "handles":
          await PriceService.updateHandle(editingItem.id, updates);
          break;
        case "windowsills":
          await PriceService.updateWindowsill(editingItem.id, updates);
          break;
        case "windowsill_accessories":
          await PriceService.updateWindowsillAccessory(editingItem.id, updates);
          break;
        case "muntins":
          await PriceService.updateMuntin(editingItem.id, updates);
          break;
        case "mosquito_net_prices":
          await PriceService.updateMosquitoNetPrice(editingItem.id, updates);
          break;
        case "reinforcement_prices":
          await PriceService.updateReinforcementPrice(editingItem.id, updates);
          break;
        case "extras":
          await PriceService.updateExtra(editingItem.id, updates);
          break;
      }

      // Перезагружаем данные
      await loadData(true);
      setEditModalVisible(false);
      Alert.alert("Успешно", "Цена обновлена");
    } catch (error) {
      console.error("Error saving price:", error);
      Alert.alert("Ошибка", "Не удалось сохранить изменения");
    } finally {
      setIsSaving(false);
    }
  };

  // Рендер ячейки с возможностью редактирования
  const renderEditableCell = (
    value: number,
    table: string,
    id: number,
    field: string,
    itemName: string,
    flex: number = 1
  ) => {
    const content = (
      <Text
        style={[
          styles.tableCell,
          { flex, color: theme.colors.text },
          isEditMode && styles.editableCell,
        ]}
      >
        {formatPrice(value)}
      </Text>
    );

    if (isEditMode) {
      return (
        <TouchableOpacity
          style={{ flex }}
          onPress={() => openEditModal({ id, table, field, currentValue: value, itemName })}
        >
          <View style={[styles.editableCellContainer, { borderColor: theme.colors.primary }]}>
            {content}
          </View>
        </TouchableOpacity>
      );
    }

    return content;
  };

  // Рендер заголовка таблицы
  const renderTableHeader = (columns: { title: string; flex: number }[]) => (
    <View style={[styles.tableRow, styles.tableHeader, { backgroundColor: theme.colors.primary }]}>
      {columns.map((col, index) => (
        <Text
          key={index}
          style={[styles.tableHeaderText, { flex: col.flex, color: "#fff" }]}
        >
          {col.title}
        </Text>
      ))}
    </View>
  );

  // Рендер секции профилей
  const renderProfiles = () => {
    // Группируем по системе
    const groupedProfiles: { [key: string]: Profile[] } = {};
    profiles.forEach((profile) => {
      const system = profile.system_name || "Другие";
      if (!groupedProfiles[system]) {
        groupedProfiles[system] = [];
      }
      groupedProfiles[system].push(profile);
    });

    return (
      <View>
        <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
          Цены за кв.м. / погонный метр
        </Text>

        {Object.entries(groupedProfiles).map(([system, systemProfiles]) => (
          <View key={system} style={styles.subsection}>
            <Text style={[styles.subsectionTitle, { color: theme.colors.text }]}>
              {system}
            </Text>

            {renderTableHeader([
              { title: "Профиль", flex: 2 },
              { title: "Рама", flex: 1 },
              { title: "Створка", flex: 1 },
              { title: "Импост", flex: 1 },
            ])}

            {systemProfiles.map((profile, index) => (
              <View
                key={profile.id}
                style={[
                  styles.tableRow,
                  {
                    backgroundColor: index % 2 === 0 ? theme.colors.surface : theme.colors.background,
                    borderBottomColor: theme.colors.border,
                  },
                ]}
              >
                <Text style={[styles.tableCell, { flex: 2, color: theme.colors.text }]}>
                  {profile.name}
                </Text>
                {renderEditableCell(profile.frame_price, "profiles", profile.id, "frame_price", profile.name || "")}
                {renderEditableCell(profile.sash_price, "profiles", profile.id, "sash_price", profile.name || "")}
                {renderEditableCell(profile.impost_price, "profiles", profile.id, "impost_price", profile.name || "")}
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  // Рендер секции стеклопакетов
  const renderGlass = () => {
    const singleChamber = glassPackages.filter((g) => g.chamber_type === "single");
    const doubleChamber = glassPackages.filter((g) => g.chamber_type === "double");

    return (
      <View>
        <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
          Цены за кв.м.
        </Text>

        {/* Однокамерные */}
        {singleChamber.length > 0 && (
          <View style={styles.subsection}>
            <Text style={[styles.subsectionTitle, { color: theme.colors.text }]}>
              Однокамерные (СПО)
            </Text>

            {renderTableHeader([
              { title: "Название", flex: 2 },
              { title: "Толщина", flex: 1 },
              { title: "Цена", flex: 1 },
            ])}

            {singleChamber.map((glass, index) => (
              <View
                key={glass.id}
                style={[
                  styles.tableRow,
                  {
                    backgroundColor: index % 2 === 0 ? theme.colors.surface : theme.colors.background,
                    borderBottomColor: theme.colors.border,
                  },
                ]}
              >
                <Text style={[styles.tableCell, { flex: 2, color: theme.colors.text }]}>
                  {glass.name}
                </Text>
                <Text style={[styles.tableCell, { flex: 1, color: theme.colors.text }]}>
                  {glass.thickness} мм
                </Text>
                {renderEditableCell(glass.price, "glass_packages", glass.id, "price", glass.name)}
              </View>
            ))}
          </View>
        )}

        {/* Двухкамерные */}
        <View style={styles.subsection}>
          <Text style={[styles.subsectionTitle, { color: theme.colors.text }]}>
            Двухкамерные (СПД)
          </Text>

          {renderTableHeader([
            { title: "Название", flex: 2 },
            { title: "Толщина", flex: 1 },
            { title: "Цена", flex: 1 },
          ])}

          {doubleChamber.map((glass, index) => (
            <View
              key={glass.id}
              style={[
                styles.tableRow,
                {
                  backgroundColor: index % 2 === 0 ? theme.colors.surface : theme.colors.background,
                  borderBottomColor: theme.colors.border,
                },
              ]}
            >
              <Text style={[styles.tableCell, { flex: 2, color: theme.colors.text }]}>
                {glass.name}
              </Text>
              <Text style={[styles.tableCell, { flex: 1, color: theme.colors.text }]}>
                {glass.thickness} мм
              </Text>
              {renderEditableCell(glass.price, "glass_packages", glass.id, "price", glass.name)}
            </View>
          ))}
        </View>

        {/* Отдельное стекло */}
        {glassTypes.length > 0 && (
          <View style={styles.subsection}>
            <Text style={[styles.subsectionTitle, { color: theme.colors.text }]}>
              Стекло отдельно
            </Text>

            {renderTableHeader([
              { title: "Название", flex: 2 },
              { title: "Цена", flex: 1 },
            ])}

            {glassTypes.map((glass, index) => (
              <View
                key={glass.id}
                style={[
                  styles.tableRow,
                  {
                    backgroundColor: index % 2 === 0 ? theme.colors.surface : theme.colors.background,
                    borderBottomColor: theme.colors.border,
                  },
                ]}
              >
                <Text style={[styles.tableCell, { flex: 2, color: theme.colors.text }]}>
                  {glass.name}
                </Text>
                {renderEditableCell(glass.price, "glass_types", glass.id, "price", glass.name)}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  // Рендер фурнитуры
  const renderFurniture = () => {
    // Группируем по системам
    const itemsBySystem: { [key: number]: { system: FurnitureSystem; items: FurnitureItem[] } } = {};
    
    furnitureSystems.forEach((system) => {
      itemsBySystem[system.id] = { system, items: [] };
    });
    
    furnitureItems.forEach((item) => {
      if (item.system_id && itemsBySystem[item.system_id]) {
        itemsBySystem[item.system_id].items.push(item);
      }
    });

    // Группируем элементы по категориям
    const groupByCategory = (items: FurnitureItem[]) => {
      const groups: { [key: string]: FurnitureItem[] } = {};
      items.forEach((item) => {
        const category = item.category || "other";
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(item);
      });
      return groups;
    };

    const categoryNames: { [key: string]: string } = {
      drive: "Приводы",
      scissors: "Ножницы",
      hinge: "Петли",
      corner: "Угловые передачи",
      lock: "Замки",
      latch: "Защёлки",
      bolt: "Шпингалеты",
      plate: "Ответные планки",
      clamp: "Прижимы",
      shtulp: "Штульповые",
      extension: "Удлинители",
      cylinder: "Цилиндры",
      closer: "Доводчики",
      other: "Прочее",
    };

    return (
      <View>
        <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
          Цены в тенге
        </Text>

        {Object.values(itemsBySystem).map(({ system, items }) => {
          if (items.length === 0) return null;
          
          const groupedItems = groupByCategory(items);

          return (
            <View key={system.id} style={styles.subsection}>
              <Text style={[styles.systemTitle, { color: theme.colors.primary }]}>
                {system.name}
              </Text>

              {Object.entries(groupedItems).map(([category, categoryItems]) => (
                <View key={category} style={styles.categorySection}>
                  <Text style={[styles.categoryTitle, { color: theme.colors.text }]}>
                    {categoryNames[category] || category}
                  </Text>

                  {renderTableHeader([
                    { title: "Название", flex: 2 },
                    { title: "Размер", flex: 1 },
                    { title: "Цена", flex: 1 },
                  ])}

                  {categoryItems.map((item, index) => (
                    <View
                      key={item.id}
                      style={[
                        styles.tableRow,
                        {
                          backgroundColor: index % 2 === 0 ? theme.colors.surface : theme.colors.background,
                          borderBottomColor: theme.colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.tableCell, { flex: 2, color: theme.colors.text }]}>
                        {item.name}
                      </Text>
                      <Text style={[styles.tableCell, { flex: 1, color: theme.colors.text }]}>
                        {item.min_size && item.max_size ? `${item.min_size}-${item.max_size}` : "—"}
                      </Text>
                      {renderEditableCell(item.price, "furniture_items", item.id, "price", item.name)}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          );
        })}
      </View>
    );
  };

  // Рендер ручек
  const renderHandles = () => {
    return (
      <View>
        <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
          Цены в тенге (белый / коричневый)
        </Text>

        {renderTableHeader([
          { title: "Название", flex: 2 },
          { title: "Белый", flex: 1 },
          { title: "Коричневый", flex: 1 },
        ])}

        {handles.map((item, index) => (
          <View
            key={item.id}
            style={[
              styles.tableRow,
              {
                backgroundColor: index % 2 === 0 ? theme.colors.surface : theme.colors.background,
                borderBottomColor: theme.colors.border,
              },
            ]}
          >
            <Text style={[styles.tableCell, { flex: 2, color: theme.colors.text }]}>
              {item.name}
            </Text>
            {renderEditableCell(item.price, "handles", item.id, "price", item.name)}
            {renderEditableCell(item.price_alt || item.price, "handles", item.id, "price_alt", item.name)}
          </View>
        ))}
      </View>
    );
  };

  // Рендер дополнительных опций
  const renderExtras = () => {
    return (
      <View>
        {/* Москитные сетки */}
        <View style={styles.subsection}>
          <Text style={[styles.subsectionTitle, { color: theme.colors.text }]}>
            Москитные сетки
          </Text>

          {renderTableHeader([
            { title: "Компонент", flex: 2 },
            { title: "Цена", flex: 1 },
          ])}

          {mosquitoNetPrices.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.tableRow,
                {
                  backgroundColor: index % 2 === 0 ? theme.colors.surface : theme.colors.background,
                  borderBottomColor: theme.colors.border,
                },
              ]}
            >
              <Text style={[styles.tableCell, { flex: 2, color: theme.colors.text }]}>
                {item.name} ({item.unit === "per_sqm" ? "за кв.м." : "за п.м."})
              </Text>
              {renderEditableCell(item.price, "mosquito_net_prices", item.id, "price", item.name)}
            </View>
          ))}
        </View>

        {/* Подоконники */}
        <View style={styles.subsection}>
          <Text style={[styles.subsectionTitle, { color: theme.colors.text }]}>
            Подоконники (за п.м.)
          </Text>

          {renderTableHeader([
            { title: "Ширина", flex: 1 },
            { title: "Цена", flex: 1 },
          ])}

          {windowsills.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.tableRow,
                {
                  backgroundColor: index % 2 === 0 ? theme.colors.surface : theme.colors.background,
                  borderBottomColor: theme.colors.border,
                },
              ]}
            >
              <Text style={[styles.tableCell, { flex: 1, color: theme.colors.text }]}>
                {item.width} мм
              </Text>
              {renderEditableCell(item.price, "windowsills", item.id, "price", `${item.width} мм`)}
            </View>
          ))}

          {windowsillAccessories.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.tableRow,
                {
                  backgroundColor: (windowsills.length + index) % 2 === 0 ? theme.colors.surface : theme.colors.background,
                  borderBottomColor: theme.colors.border,
                },
              ]}
            >
              <Text style={[styles.tableCell, { flex: 1, color: theme.colors.text }]}>
                {item.name}
              </Text>
              {renderEditableCell(item.price, "windowsill_accessories", item.id, "price", item.name)}
            </View>
          ))}
        </View>

        {/* Раскладка */}
        <View style={styles.subsection}>
          <Text style={[styles.subsectionTitle, { color: theme.colors.text }]}>
            Раскладка (шпросы) за п.м.
          </Text>

          {renderTableHeader([
            { title: "Ширина", flex: 1 },
            { title: "Белый", flex: 1 },
            { title: "Золото", flex: 1 },
            { title: "Корич.", flex: 1 },
            { title: "Цветн.", flex: 1 },
          ])}

          {muntins.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.tableRow,
                {
                  backgroundColor: index % 2 === 0 ? theme.colors.surface : theme.colors.background,
                  borderBottomColor: theme.colors.border,
                },
              ]}
            >
              <Text style={[styles.tableCell, { flex: 1, color: theme.colors.text }]}>
                {item.width} мм
              </Text>
              {renderEditableCell(item.price_white, "muntins", item.id, "price_white", `${item.width} мм белый`)}
              {renderEditableCell(item.price_gold, "muntins", item.id, "price_gold", `${item.width} мм золото`)}
              {renderEditableCell(item.price_brown, "muntins", item.id, "price_brown", `${item.width} мм коричневый`)}
              {renderEditableCell(item.price_colored, "muntins", item.id, "price_colored", `${item.width} мм цветной`)}
            </View>
          ))}
        </View>

        {/* Армирование */}
        <View style={styles.subsection}>
          <Text style={[styles.subsectionTitle, { color: theme.colors.text }]}>
            Армирование (за п.м.)
          </Text>

          {renderTableHeader([
            { title: "Тип / Толщина", flex: 2 },
            { title: "Цена", flex: 1 },
          ])}

          {reinforcementPrices.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.tableRow,
                {
                  backgroundColor: index % 2 === 0 ? theme.colors.surface : theme.colors.background,
                  borderBottomColor: theme.colors.border,
                },
              ]}
            >
              <Text style={[styles.tableCell, { flex: 2, color: theme.colors.text }]}>
                {item.profile_type} профиль {item.thickness} мм
              </Text>
              {renderEditableCell(item.price, "reinforcement_prices", item.id, "price", `${item.profile_type} ${item.thickness}`)}
            </View>
          ))}
        </View>

        {/* Прочее */}
        <View style={styles.subsection}>
          <Text style={[styles.subsectionTitle, { color: theme.colors.text }]}>
            Прочее
          </Text>

          {renderTableHeader([
            { title: "Название", flex: 2 },
            { title: "Цена", flex: 1 },
          ])}

          {extras.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.tableRow,
                {
                  backgroundColor: index % 2 === 0 ? theme.colors.surface : theme.colors.background,
                  borderBottomColor: theme.colors.border,
                },
              ]}
            >
              <Text style={[styles.tableCell, { flex: 2, color: theme.colors.text }]}>
                {item.name}
              </Text>
              {renderEditableCell(item.price, "extras", item.id, "price", item.name)}
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Рендер контента на основе выбранной категории
  const renderContent = () => {
    switch (activeCategory) {
      case "profiles":
        return renderProfiles();
      case "glass":
        return renderGlass();
      case "furniture":
        return renderFurniture();
      case "handles":
        return renderHandles();
      case "extras":
        return renderExtras();
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.headerWrapper, { backgroundColor: theme.colors.surface }]}>
          <SafeAreaView>
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={[styles.backButtonText, { color: theme.colors.primary }]}>
                  Назад
                </Text>
              </TouchableOpacity>
              <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                Прайс-лист
              </Text>
              <View style={styles.placeholder} />
            </View>
          </SafeAreaView>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Загрузка данных...
          </Text>
        </View>
      </View>
    );
  }

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
              Прайс-лист
            </Text>
            <TouchableOpacity
              style={[
                styles.editButton,
                isEditMode && { backgroundColor: theme.colors.primary },
              ]}
              onPress={() => setIsEditMode(!isEditMode)}
            >
              <Text
                style={[
                  styles.editButtonText,
                  { color: isEditMode ? "#fff" : theme.colors.primary },
                ]}
              >
                {isEditMode ? "Готово" : "Изменить"}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* Табы категорий */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.tabsContainer, { backgroundColor: theme.colors.surface }]}
        contentContainerStyle={styles.tabsContent}
      >
        {CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.tab,
              activeCategory === category.key && styles.activeTab,
              activeCategory === category.key && { backgroundColor: theme.colors.primary },
              { borderColor: theme.colors.border },
            ]}
            onPress={() => setActiveCategory(category.key)}
          >
            <Text
              style={[
                styles.tabText,
                { color: activeCategory === category.key ? "#fff" : theme.colors.text },
              ]}
            >
              {category.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Подсказка режима редактирования */}
      {isEditMode && (
        <View style={[styles.editHint, { backgroundColor: theme.colors.primary + "20" }]}>
          <Text style={[styles.editHintText, { color: theme.colors.primary }]}>
            Нажмите на цену для редактирования
          </Text>
        </View>
      )}

      {/* Контент */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {renderContent()}
      </ScrollView>

      {/* Модальное окно редактирования */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Изменить цену
            </Text>
            <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
              {editingItem?.itemName}
            </Text>
            
            <TextInput
              style={[
                styles.modalInput,
                {
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.background,
                },
              ]}
              value={editValue}
              onChangeText={setEditValue}
              keyboardType="numeric"
              placeholder="Введите цену"
              placeholderTextColor={theme.colors.textSecondary}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton, { borderColor: theme.colors.border }]}
                onPress={() => setEditModalVisible(false)}
                disabled={isSaving}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                  Отмена
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton, { backgroundColor: theme.colors.primary }]}
                onPress={saveEdit}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={[styles.modalButtonText, { color: "#fff" }]}>
                    Сохранить
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
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
  editButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 70,
    alignItems: "center",
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  tabsContainer: {
    maxHeight: 56,
    borderBottomWidth: 1,
  },
  tabsContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    flexDirection: "row",
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  activeTab: {
    borderColor: "transparent",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  editHint: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  editHintText: {
    fontSize: 13,
    textAlign: "center",
    fontStyle: "italic",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    fontStyle: "italic",
  },
  subsection: {
    marginBottom: 24,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  systemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 8,
  },
  categorySection: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  tableHeader: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableCell: {
    fontSize: 12,
    textAlign: "center",
  },
  editableCell: {
    textDecorationLine: "underline",
  },
  editableCellContainer: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {},
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default PriceScreen;
