import { Profile, Furniture } from "../services/orderService";
import {
  getProfilePrices,
  getGlassPackageByThickness,
  getFurnitureForSashSize,
  calculateFurnitureCost,
  calculateMosquitoNetCost,
  calculateReinforcementCost,
  HANDLES,
  ALL_PROFILES,
  type ProfilePriceItem,
} from "./prices";

export interface PriceBreakdown {
  profilePrice: number; // Цена профиля (рама + створка)
  impostPrice: number; // Цена импостов
  furniturePrice: number; // Цена фурнитуры
  glassPrice: number; // Цена стеклопакета
  handlePrice: number; // Цена ручки
  mosquitoNetPrice: number; // Цена москитки
  reinforcementPrice: number; // Цена армирования
  optionsPrice: number; // Цена дополнительных опций
  subtotal: number; // Промежуточная сумма
  total: number; // Итоговая цена (без скидки - скидка ручная)
}

export interface WindowPriceConfig {
  width: number; // Ширина в мм
  height: number; // Высота в мм
  profile: Profile | null; // Профиль (из БД)
  profileSystemId?: string; // ID системы профиля (FUNKE_58, FUNKE_70 и т.д.)
  furniture: Furniture | null; // Фурнитура (из БД)
  furnitureSystemCode?: string; // Код системы фурнитуры (FUTURUS, ELEMENTS, UPT)
  glassThickness: number; // Толщина стекла в мм
  glassCode?: string; // Код стеклопакета (SPD_36, SPD_36_I и т.д.)
  openingSashType: string; // Тип открывания створок
  shTemplate: string; // Шаблон окна
  color?: string; // Цвет
  config?: number; // Конфигурация окна (1-21)
  // Дополнительные опции
  hasMosquitoNet?: boolean; // Москитка
  mosquitoNetColor?: "white" | "brown"; // Цвет москитки
  reinforcementLZ?: string; // Армирование LZ (например "1.2")
  reinforcementT?: string; // Армирование T (например "1.5")
  hasBalconyLatch?: boolean; // Балконная защелка
  hasMicroVentilation?: boolean; // Микропроветривание
  hasHandle?: boolean; // Ручка
  hasBalconyHandle?: boolean; // Балконная ручка
  // Импосты
  impostCount?: number; // Количество импостов
  impostLengths?: number[]; // Длины импостов в мм (для точного расчёта)
}

/**
 * Рассчитывает площадь окна в квадратных метрах
 */
export function calculateArea(width: number, height: number): number {
  return (width * height) / 1000000; // Конвертация из мм² в м²
}

/**
 * Рассчитывает периметр окна в метрах
 */
export function calculatePerimeter(width: number, height: number): number {
  return (2 * (width + height)) / 1000; // Конвертация из мм в м
}

/**
 * Определяет ID системы профиля на основе Profile из БД
 */
export function getProfileSystemId(profile: Profile | null): string {
  if (!profile) return "FUNKE_58";
  
  const name = profile.name?.toUpperCase() || "";
  
  if (name.includes("FUNKE")) {
    // Определяем по ID или имени
    if (name.includes("70") || profile.id === 5) return "FUNKE_70";
    return "FUNKE_58";
  }
  if (name.includes("VEKTOR")) {
    if (name.includes("70")) return "VEKTOR_70";
    return "VEKTOR_58";
  }
  if (name.includes("EXPROF")) {
    if (name.includes("80")) return "EXPROF_80";
    if (name.includes("70")) return "EXPROF_70";
    return "EXPROF_58";
  }
  
  return "FUNKE_58"; // По умолчанию
}

/**
 * Определяет код системы фурнитуры на основе Furniture из БД
 */
export function getFurnitureSystemCode(furniture: Furniture | null): string {
  if (!furniture) return "FUTURUS";
  
  const name = furniture.name?.toUpperCase() || "";
  
  if (name.includes("FUTURUS")) return "FUTURUS";
  if (name.includes("ELEMENTS")) return "ELEMENTS";
  if (name.includes("UPT")) return "UPT";
  if (name.includes("ACTIVE") || name.includes("PILOT")) return "WH_ACTIVE_PILOT";
  
  return "FUTURUS"; // По умолчанию
}

/**
 * Рассчитывает количество створок и импостов на основе конфигурации
 */
export function getConfigurationDetails(config: number): {
  sashCount: number;
  verticalImposts: number;
  horizontalImposts: number;
  openableSashes: number; // Количество открываемых створок
} {
  const configDetails: {
    [key: number]: {
      sashCount: number;
      verticalImposts: number;
      horizontalImposts: number;
      openableSashes: number;
    };
  } = {
    1: { sashCount: 1, verticalImposts: 0, horizontalImposts: 0, openableSashes: 1 },
    2: { sashCount: 2, verticalImposts: 1, horizontalImposts: 0, openableSashes: 1 },
    3: { sashCount: 3, verticalImposts: 2, horizontalImposts: 0, openableSashes: 1 },
    4: { sashCount: 4, verticalImposts: 3, horizontalImposts: 0, openableSashes: 1 },
    5: { sashCount: 2, verticalImposts: 0, horizontalImposts: 1, openableSashes: 1 },
    6: { sashCount: 3, verticalImposts: 0, horizontalImposts: 2, openableSashes: 1 },
    7: { sashCount: 2, verticalImposts: 1, horizontalImposts: 1, openableSashes: 1 },
    8: { sashCount: 3, verticalImposts: 1, horizontalImposts: 1, openableSashes: 1 },
    9: { sashCount: 2, verticalImposts: 1, horizontalImposts: 1, openableSashes: 1 },
    10: { sashCount: 3, verticalImposts: 1, horizontalImposts: 1, openableSashes: 1 },
    11: { sashCount: 3, verticalImposts: 1, horizontalImposts: 1, openableSashes: 1 },
    12: { sashCount: 2, verticalImposts: 1, horizontalImposts: 1, openableSashes: 1 },
    13: { sashCount: 3, verticalImposts: 1, horizontalImposts: 1, openableSashes: 1 },
    14: { sashCount: 5, verticalImposts: 2, horizontalImposts: 2, openableSashes: 2 },
    15: { sashCount: 3, verticalImposts: 1, horizontalImposts: 1, openableSashes: 1 },
    16: { sashCount: 5, verticalImposts: 2, horizontalImposts: 2, openableSashes: 2 },
    17: { sashCount: 4, verticalImposts: 2, horizontalImposts: 1, openableSashes: 1 },
    18: { sashCount: 4, verticalImposts: 2, horizontalImposts: 1, openableSashes: 1 },
    19: { sashCount: 4, verticalImposts: 1, horizontalImposts: 2, openableSashes: 1 },
    20: { sashCount: 7, verticalImposts: 2, horizontalImposts: 4, openableSashes: 1 },
    21: { sashCount: 4, verticalImposts: 1, horizontalImposts: 2, openableSashes: 1 },
  };

  return configDetails[config] || { sashCount: 1, verticalImposts: 0, horizontalImposts: 0, openableSashes: 1 };
}

/**
 * Рассчитывает общую длину импостов в метрах
 */
export function calculateImpostLength(
  width: number,
  height: number,
  config: number
): number {
  const details = getConfigurationDetails(config);
  
  // Вертикальные импосты идут по высоте, горизонтальные по ширине
  const verticalLength = (details.verticalImposts * height) / 1000;
  const horizontalLength = (details.horizontalImposts * width) / 1000;
  
  return verticalLength + horizontalLength;
}

/**
 * Рассчитывает цену профиля
 */
export function calculateProfilePrice(
  profileSystemId: string,
  area: number
): number {
  const profilePrices = getProfilePrices(profileSystemId);
  if (!profilePrices) return 0;

  // Профиль рамы + профиль створки за кв.м.
  return (profilePrices.frame + profilePrices.sash) * area;
}

/**
 * Рассчитывает цену импостов
 */
export function calculateImpostPrice(
  profileSystemId: string,
  impostLengthM: number
): number {
  const profilePrices = getProfilePrices(profileSystemId);
  if (!profilePrices) return 0;

  return profilePrices.impost * impostLengthM;
}

/**
 * Рассчитывает цену фурнитуры
 * Автоподбор комплектующих по размеру створки
 */
export function calculateFurniturePrice(
  furnitureSystemCode: string,
  sashWidth: number,
  sashHeight: number,
  openableSashCount: number = 1
): number {
  // Получаем комплект фурнитуры для одной створки
  const items = getFurnitureForSashSize(
    furnitureSystemCode,
    sashHeight,
    sashWidth,
    true // поворотно-откидная
  );
  
  // Стоимость одного комплекта умножаем на количество открываемых створок
  const singleSetCost = calculateFurnitureCost(items);
  
  return singleSetCost * openableSashCount;
}

/**
 * Рассчитывает цену стеклопакета
 */
export function calculateGlassPrice(
  glassThickness: number,
  area: number,
  glassCode?: string
): number {
  // Если указан код, используем его
  // Пока используем поиск по толщине
  const glassPackage = getGlassPackageByThickness(glassThickness);
  if (!glassPackage) {
    // Если не нашли, используем базовую цену
    const defaultPrices: { [key: number]: number } = {
      24: 14100,
      32: 18520,
      36: 19100,
      40: 19900,
      42: 20100,
      44: 20100,
    };
    return (defaultPrices[glassThickness] || 19100) * area;
  }

  return glassPackage.price * area;
}

/**
 * Рассчитывает цену ручки
 */
export function calculateHandlePrice(hasHandle: boolean): number {
  if (!hasHandle) return 0;
  
  // Базовая ручка Hoppe
  const hoppeHandle = HANDLES.find((h) => h.code === "HANDLE_HOPPE");
  return hoppeHandle?.price || 1200;
}

/**
 * Рассчитывает цену дополнительных опций
 */
export function calculateOptionsPrice(
  config: WindowPriceConfig,
  area: number,
  perimeterM: number
): number {
  let optionsPrice = 0;

  // Балконная защелка
  if (config.hasBalconyLatch) {
    optionsPrice += 2972; // BALCONY_LATCHES.standard
  }

  // Микропроветривание
  if (config.hasMicroVentilation) {
    optionsPrice += 495; // MICRO_VENTILATION_PRICE
  }

  // Балконная ручка
  if (config.hasBalconyHandle) {
    const balconyHandle = HANDLES.find((h) => h.code === "HANDLE_DOUBLE");
    optionsPrice += balconyHandle?.price || 4600;
  }

  return optionsPrice;
}

/**
 * Основная функция расчета цены окна
 */
export function calculateWindowPrice(
  config: WindowPriceConfig
): PriceBreakdown {
  const area = calculateArea(config.width, config.height);
  const perimeterM = calculatePerimeter(config.width, config.height);
  
  // Получаем детали конфигурации
  const configDetails = getConfigurationDetails(config.config || 1);
  const impostLengthM = calculateImpostLength(
    config.width,
    config.height,
    config.config || 1
  );

  // Определяем системы
  const profileSystemId = config.profileSystemId || getProfileSystemId(config.profile);
  const furnitureSystemCode = config.furnitureSystemCode || getFurnitureSystemCode(config.furniture);

  // Примерный размер одной створки (для расчёта фурнитуры)
  const avgSashWidth = config.width / Math.max(configDetails.sashCount, 1);
  const avgSashHeight = config.height;

  // Рассчитываем компоненты цены
  const profilePrice = calculateProfilePrice(profileSystemId, area);
  const impostPrice = calculateImpostPrice(profileSystemId, impostLengthM);
  
  const furniturePrice = calculateFurniturePrice(
    furnitureSystemCode,
    avgSashWidth,
    avgSashHeight,
    configDetails.openableSashes
  );

  const glassPrice = calculateGlassPrice(
    config.glassThickness,
    area,
    config.glassCode
  );

  const handlePrice = calculateHandlePrice(config.hasHandle !== false);

  // Москитка
  let mosquitoNetPrice = 0;
  if (config.hasMosquitoNet) {
    mosquitoNetPrice = calculateMosquitoNetCost(
      config.width,
      config.height,
      config.mosquitoNetColor || "white"
    );
  }

  // Армирование
  let reinforcementPrice = 0;
  if (config.reinforcementLZ || config.reinforcementT) {
    reinforcementPrice = calculateReinforcementCost(
      perimeterM,
      config.reinforcementLZ,
      config.reinforcementT
    );
  }

  // Дополнительные опции
  const optionsPrice = calculateOptionsPrice(config, area, perimeterM);

  // Промежуточная сумма
  const subtotal =
    profilePrice +
    impostPrice +
    furniturePrice +
    glassPrice +
    handlePrice +
    mosquitoNetPrice +
    reinforcementPrice +
    optionsPrice;

  // Итоговая цена (скидка убрана - вводится вручную)
  const total = subtotal;

  return {
    profilePrice: Math.round(profilePrice * 100) / 100,
    impostPrice: Math.round(impostPrice * 100) / 100,
    furniturePrice: Math.round(furniturePrice * 100) / 100,
    glassPrice: Math.round(glassPrice * 100) / 100,
    handlePrice: Math.round(handlePrice * 100) / 100,
    mosquitoNetPrice: Math.round(mosquitoNetPrice * 100) / 100,
    reinforcementPrice: Math.round(reinforcementPrice * 100) / 100,
    optionsPrice: Math.round(optionsPrice * 100) / 100,
    subtotal: Math.round(subtotal * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

/**
 * Быстрый расчёт цены по основным параметрам
 * Упрощённая версия для предварительной оценки
 */
export function quickCalculatePrice(
  width: number,
  height: number,
  profileSystemId: string = "FUNKE_70",
  glassThickness: number = 36,
  config: number = 1
): number {
  const priceConfig: WindowPriceConfig = {
    width,
    height,
    profile: null,
    profileSystemId,
    furniture: null,
    furnitureSystemCode: "FUTURUS",
    glassThickness,
    openingSashType: "1",
    shTemplate: "single_sash",
    config,
    hasHandle: true,
  };

  const breakdown = calculateWindowPrice(priceConfig);
  return breakdown.total;
}
