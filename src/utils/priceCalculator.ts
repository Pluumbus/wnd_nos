import type { Database } from "../lib/supabase.types";
import type { ComputedSection } from "./windowConfigurations";

type DBProfile = Database["public"]["Tables"]["profiles"]["Row"];
type DBGlassPackage = Database["public"]["Tables"]["glass_packages"]["Row"];
type DBFurnitureItem = Database["public"]["Tables"]["furniture_items"]["Row"];
type DBHandle = Database["public"]["Tables"]["handles"]["Row"];
type DBMosquitoNet = Database["public"]["Tables"]["mosquito_net_prices"]["Row"];
type DBReinforcement = Database["public"]["Tables"]["reinforcement_prices"]["Row"];
type DBExtra = Database["public"]["Tables"]["extras"]["Row"];

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

// ============================================================================
//                      РАСЧЁТ НА ОСНОВЕ ДАННЫХ ИЗ БД
// ============================================================================

/**
 * Тип секции для расчёта (упрощённый ComputedSection)
 */
export interface PriceSection {
  id: string;
  widthMM: number;
  heightMM: number;
  openingType: "tilt_turn" | "turn" | "tilt" | "fixed";
  openingSide?: string;
  hasHandle?: boolean;
}

/**
 * Опции окна (флаги дополнительных компонентов)
 */
export interface WindowOptions {
  hasMosquitoNet?: boolean;
  mosquitoNetColor?: "white" | "brown";
  reinforcementLZ?: string; // "1.2" | "1.5" | "2.0"
  reinforcementT?: string;
  hasBalconyLatch?: boolean;
  hasMicroVentilation?: boolean;
  hasHandle?: boolean;
  hasBalconyHandle?: boolean;
}

/**
 * Входные данные для расчёта на основе БД.
 * Все цены берутся из переданных рядов БД.
 */
export interface DBPriceInputs {
  width: number; // мм
  height: number; // мм
  profile: DBProfile;
  glassPackage: DBGlassPackage;
  handle?: DBHandle | null;
  balconyHandle?: DBHandle | null;
  furnitureItems: DBFurnitureItem[]; // только для нужной системы
  furnitureSystemId: number;
  mosquitoNetPrices?: DBMosquitoNet[];
  reinforcementPrices?: DBReinforcement[];
  extras?: DBExtra[];
  sections?: PriceSection[] | ComputedSection[];
  config: number;
  options: WindowOptions;
}

/**
 * Реальная длина импостов на основе секций.
 * Если секции не заданы — используем верхнеуровневую конфигурацию.
 */
export function calculateImpostLengthFromSections(
  width: number,
  height: number,
  sections: PriceSection[] | undefined,
  config: number
): number {
  if (!sections || sections.length === 0) {
    return calculateImpostLength(width, height, config);
  }

  // Считаем по реальным секциям: уникальные вертикальные/горизонтальные импосты.
  // Длина вертикального импоста = высота окна; длина горизонтального = ширина окна.
  // Получаем количество импостов из конфигурации.
  const details = getConfigurationDetails(config);
  const verticalLength = (details.verticalImposts * height) / 1000;
  const horizontalLength = (details.horizontalImposts * width) / 1000;
  return verticalLength + horizontalLength;
}

/**
 * Подбор элемента фурнитуры по размеру (для drive/scissors/lock и др. размерных категорий)
 */
function pickItemBySize(
  items: DBFurnitureItem[],
  size: number
): DBFurnitureItem | null {
  const matched = items.find(
    (i) =>
      i.min_size != null &&
      i.max_size != null &&
      size >= i.min_size &&
      size <= i.max_size
  );
  if (matched) return matched;
  // Fallback: ближайший по диапазону
  const withRange = items.filter(
    (i) => i.min_size != null && i.max_size != null
  );
  if (withRange.length === 0) return items[0] || null;
  return withRange.reduce((best, cur) => {
    const center = (cur.min_size! + cur.max_size!) / 2;
    const bestCenter = (best.min_size! + best.max_size!) / 2;
    return Math.abs(center - size) < Math.abs(bestCenter - size) ? cur : best;
  });
}

/**
 * Стоимость комплекта фурнитуры на одну открываемую створку.
 * Комплект формируется из drive (по высоте), scissors (по ширине, для tilt/tilt_turn),
 * corner, набора hinge (4 шт.), плюс необязательный mid_lock по высоте.
 */
export function calculateFurnitureSetCostFromDB(
  furnitureItems: DBFurnitureItem[],
  systemId: number,
  sashWidth: number,
  sashHeight: number,
  openingType: "tilt_turn" | "turn" | "tilt" | "fixed"
): number {
  if (openingType === "fixed") return 0;

  const systemItems = furnitureItems.filter((i) => i.system_id === systemId);
  if (systemItems.length === 0) return 0;

  let total = 0;

  // Drive — обязательный элемент, размер по высоте створки
  const drives = systemItems.filter((i) => i.category === "drive");
  const drive = pickItemBySize(drives, sashHeight);
  if (drive) total += drive.price;

  // Scissors нужны для откидных и поворотно-откидных, размер по ширине створки
  if (openingType === "tilt_turn" || openingType === "tilt") {
    const scissors = systemItems.filter(
      (i) => i.category === "scissors" && !i.code.includes("CORNER")
    );
    const sc = pickItemBySize(scissors, sashWidth);
    if (sc) total += sc.price;
  }

  // Corner gear (стандарт)
  const corner = systemItems.find(
    (i) => i.category === "corner" && !i.code.toUpperCase().includes("NARROW")
  );
  if (corner) total += corner.price;

  // Mid-lock (если есть в системе) — по высоте
  const midLocks = systemItems.filter(
    (i) => i.category === "lock" && i.min_size != null && i.max_size != null
  );
  const midLock = pickItemBySize(midLocks, sashHeight);
  if (midLock) total += midLock.price;

  // Петли: верх рамы, верх створки, низ рамы, низ створки — по одной из каждой группы
  const hinges = systemItems.filter((i) => i.category === "hinge");
  const groupCodes = [
    "HINGE_FRAME_TOP",
    "HINGE_SASH_TOP",
    "HINGE_FRAME_BOTTOM",
    "HINGE_SASH_BOTTOM",
  ];
  for (const grp of groupCodes) {
    const hinge = hinges.find((h) => h.code.includes(grp));
    if (hinge) total += hinge.price;
  }

  return total;
}

/**
 * Стоимость москитной сетки по данным БД.
 * Цена = периметр × frame_price + площадь × mesh_price.
 */
export function calculateMosquitoNetCostFromDB(
  width: number,
  height: number,
  prices: DBMosquitoNet[],
  color: "white" | "brown" = "white"
): number {
  const perimeterM = calculatePerimeter(width, height);
  const areaSqm = calculateArea(width, height);
  const frameCode = color === "brown" ? "frame_brown" : "frame_white";
  const frame = prices.find((p) => p.component === frameCode);
  const mesh = prices.find((p) => p.component === "mesh");
  const framePrice = frame?.price ?? 0;
  const meshPrice = mesh?.price ?? 0;
  return perimeterM * framePrice + areaSqm * meshPrice;
}

/**
 * Стоимость армирования по данным БД (LZ + T применяются вместе по периметру).
 */
export function calculateReinforcementCostFromDB(
  perimeterM: number,
  prices: DBReinforcement[],
  lzThickness?: string,
  tThickness?: string
): number {
  let total = 0;
  if (lzThickness) {
    const lz = prices.find(
      (p) => p.profile_type === "LZ" && p.thickness === lzThickness
    );
    if (lz) total += lz.price * perimeterM;
  }
  if (tThickness) {
    const t = prices.find(
      (p) => p.profile_type === "T" && p.thickness === tThickness
    );
    if (t) total += t.price * perimeterM;
  }
  return total;
}

/**
 * Стоимость доп. опций (защелки, микропроветривание) по данным БД.
 */
export function calculateExtrasCostFromDB(
  options: WindowOptions,
  extras: DBExtra[] | undefined,
  balconyHandle?: DBHandle | null
): number {
  let total = 0;
  if (!extras) return total;

  if (options.hasBalconyLatch) {
    const latch = extras.find(
      (e) => e.category === "balcony" && e.code.includes("STD")
    ) || extras.find((e) => e.category === "balcony");
    if (latch) total += latch.price;
  }
  if (options.hasMicroVentilation) {
    const mv = extras.find((e) => e.category === "ventilation");
    if (mv) total += mv.price;
  }
  if (options.hasBalconyHandle && balconyHandle) {
    total += balconyHandle.price;
  }
  return total;
}

/**
 * Главная функция расчёта на основе данных из БД.
 * Учитывает реальные секции (если переданы), цены профиля из БД, реальный
 * стеклопакет, фурнитуру по системе и реальным размерам створок.
 *
 * Структура итогов соответствует тому, как считается коммерческое
 * предложение: профиль (рама+створка+импост), стеклопакет, фурнитура,
 * ручка, опции, москитка, армирование.
 */
export function calculateWindowPriceFromDB(
  inputs: DBPriceInputs
): PriceBreakdown {
  const {
    width,
    height,
    profile,
    glassPackage,
    handle,
    balconyHandle,
    furnitureItems,
    furnitureSystemId,
    mosquitoNetPrices,
    reinforcementPrices,
    extras,
    sections,
    config,
    options,
  } = inputs;

  const area = calculateArea(width, height);
  const perimeterM = calculatePerimeter(width, height);

  // ---------- Профиль (рама + створка по площади + импост по фактической длине)
  const framePrice = (profile.frame_price ?? profile.price ?? 0) * area;
  const sashPrice = (profile.sash_price ?? 0) * area;
  const profilePrice = framePrice + sashPrice;

  const impostLengthM = calculateImpostLengthFromSections(
    width,
    height,
    sections as PriceSection[] | undefined,
    config
  );
  const impostPrice = (profile.impost_price ?? 0) * impostLengthM;

  // ---------- Стеклопакет
  const glassPrice = glassPackage.price * area;

  // ---------- Фурнитура: считаем по каждой открываемой секции
  let furniturePrice = 0;
  const sectionList = (sections as PriceSection[] | undefined) ?? [];
  const openableSections = sectionList.filter(
    (s) => s.openingType && s.openingType !== "fixed"
  );

  if (openableSections.length > 0) {
    for (const s of openableSections) {
      furniturePrice += calculateFurnitureSetCostFromDB(
        furnitureItems,
        furnitureSystemId,
        s.widthMM,
        s.heightMM,
        s.openingType
      );
    }
  } else {
    // Фолбэк: если секций нет, считаем по конфигурации (1 открываемая створка)
    const details = getConfigurationDetails(config);
    const sashWidth = width / Math.max(details.sashCount, 1);
    const sashHeight = height; // нет данных о горизонтальных импостах
    const single = calculateFurnitureSetCostFromDB(
      furnitureItems,
      furnitureSystemId,
      sashWidth,
      sashHeight,
      "tilt_turn"
    );
    furniturePrice = single * details.openableSashes;
  }

  // ---------- Ручка (только если открывается хотя бы одна секция)
  const hasOpenable =
    openableSections.length > 0 ||
    getConfigurationDetails(config).openableSashes > 0;
  const handlePrice =
    options.hasHandle !== false && hasOpenable && handle ? handle.price : 0;

  // ---------- Москитка
  let mosquitoNetPrice = 0;
  if (options.hasMosquitoNet && mosquitoNetPrices) {
    mosquitoNetPrice = calculateMosquitoNetCostFromDB(
      width,
      height,
      mosquitoNetPrices,
      options.mosquitoNetColor || "white"
    );
  }

  // ---------- Армирование
  let reinforcementPrice = 0;
  if (
    reinforcementPrices &&
    (options.reinforcementLZ || options.reinforcementT)
  ) {
    reinforcementPrice = calculateReinforcementCostFromDB(
      perimeterM,
      reinforcementPrices,
      options.reinforcementLZ,
      options.reinforcementT
    );
  }

  // ---------- Доп. опции
  const optionsPrice = calculateExtrasCostFromDB(options, extras, balconyHandle);

  // ---------- Итого
  const subtotal =
    profilePrice +
    impostPrice +
    furniturePrice +
    glassPrice +
    handlePrice +
    mosquitoNetPrice +
    reinforcementPrice +
    optionsPrice;

  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    profilePrice: round(profilePrice),
    impostPrice: round(impostPrice),
    furniturePrice: round(furniturePrice),
    glassPrice: round(glassPrice),
    handlePrice: round(handlePrice),
    mosquitoNetPrice: round(mosquitoNetPrice),
    reinforcementPrice: round(reinforcementPrice),
    optionsPrice: round(optionsPrice),
    subtotal: round(subtotal),
    total: round(subtotal),
  };
}
