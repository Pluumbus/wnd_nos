/**
 * Справочник цен на дополнительные опции (тенге)
 * Москитки, подоконники, раскладки, армирование
 * Данные актуальны на январь 2026
 */

// ============ МОСКИТНЫЕ СЕТКИ ============
export interface MosquitoNetPrices {
  frameProfile: {
    white: number; // за погонный метр
    brown: number;
  };
  mesh: number; // за кв.м.
}

export const MOSQUITO_NET: MosquitoNetPrices = {
  frameProfile: {
    white: 700,
    brown: 900,
  },
  mesh: 800, // за кв.м.
};

/**
 * Рассчитать стоимость москитной сетки
 * @param width - ширина в мм
 * @param height - высота в мм
 * @param color - цвет профиля
 */
export function calculateMosquitoNetCost(
  width: number,
  height: number,
  color: "white" | "brown" = "white"
): number {
  const perimeterM = (2 * (width + height)) / 1000; // в метрах
  const areaM2 = (width * height) / 1000000; // в кв.м.
  
  const frameCost = perimeterM * MOSQUITO_NET.frameProfile[color];
  const meshCost = areaM2 * MOSQUITO_NET.mesh;
  
  return frameCost + meshCost;
}

// ============ ПОДОКОННИКИ ============
export interface WindowsillPrice {
  width: number; // ширина в мм
  price: number; // цена за погонный метр
}

export const WINDOWSILLS: WindowsillPrice[] = [
  { width: 150, price: 1244 },
  { width: 200, price: 1764 },
  { width: 250, price: 2204 },
  { width: 300, price: 2644 },
  { width: 350, price: 3098 },
  { width: 400, price: 3728 },
  { width: 450, price: 3970 },
  { width: 500, price: 4408 },
  { width: 550, price: 5112 },
];

export const WINDOWSILL_CAP_PRICE = 600; // Заглушка

/**
 * Получить цену подоконника по ширине
 */
export function getWindowsillPrice(width: number): number {
  const sill = WINDOWSILLS.find((s) => s.width === width);
  return sill ? sill.price : 0;
}

/**
 * Рассчитать стоимость подоконника
 * @param width - ширина подоконника в мм
 * @param length - длина в мм
 * @param includeCaps - включить заглушки
 */
export function calculateWindowsillCost(
  width: number,
  length: number,
  includeCaps: boolean = true
): number {
  const pricePerM = getWindowsillPrice(width);
  const lengthM = length / 1000;
  let cost = pricePerM * lengthM;
  
  if (includeCaps) {
    cost += WINDOWSILL_CAP_PRICE * 2; // 2 заглушки
  }
  
  return cost;
}

// ============ РАСКЛАДКА (ШПРОСЫ) ============
export interface MuntinPrice {
  width: number; // ширина в мм
  white: number;
  gold: number;
  brown: number;
  colored: number;
}

export const MUNTINS: MuntinPrice[] = [
  { width: 8, white: 4400, gold: 2800, brown: 4400, colored: 9800 },
  { width: 18, white: 2400, gold: 6400, brown: 4400, colored: 9800 },
  { width: 26, white: 4400, gold: 4400, brown: 4400, colored: 9800 },
];

/**
 * Получить цену раскладки
 */
export function getMuntinPrice(
  width: number,
  color: "white" | "gold" | "brown" | "colored"
): number {
  const muntin = MUNTINS.find((m) => m.width === width);
  return muntin ? muntin[color] : 0;
}

// ============ АРМИРОВАНИЕ ============
export interface ReinforcementPrices {
  LZ: { [key: string]: number }; // LZ профиль по толщине
  T: { [key: string]: number }; // T профиль по толщине
}

// Примерные коэффициенты армирования (тенге за погонный метр)
export const REINFORCEMENT: ReinforcementPrices = {
  LZ: {
    "1.2": 800, // 1.2 мм
    "1.5": 1000,
    "2.0": 1200,
  },
  T: {
    "1.2": 1000,
    "1.5": 1200,
    "2.0": 1500,
  },
};

/**
 * Рассчитать стоимость армирования
 * @param perimeterM - периметр в метрах
 * @param lzThickness - толщина LZ в мм (например, "1.2")
 * @param tThickness - толщина T в мм (например, "1.5")
 */
export function calculateReinforcementCost(
  perimeterM: number,
  lzThickness?: string,
  tThickness?: string
): number {
  let cost = 0;
  
  if (lzThickness && REINFORCEMENT.LZ[lzThickness]) {
    cost += perimeterM * REINFORCEMENT.LZ[lzThickness];
  }
  
  if (tThickness && REINFORCEMENT.T[tThickness]) {
    cost += perimeterM * REINFORCEMENT.T[tThickness];
  }
  
  return cost;
}

// ============ БАЛКОННЫЕ ЗАЩЕЛКИ ============
export const BALCONY_LATCHES = {
  standard: 2972,
  BK_BN: 2972,
  BK_52_60_S: 2972,
};

// ============ МИКРОПРОВЕТРИВАНИЕ ============
export const MICRO_VENTILATION_PRICE = 495; // Микролифт Elements

// ============ ДОВОДЧИКИ ============
export const DOOR_CLOSER_PRICE = 67000;

// ============ ОБЩИЙ ЭКСПОРТ ============
export const EXTRAS_PRICES = {
  mosquitoNet: MOSQUITO_NET,
  windowsills: WINDOWSILLS,
  windowsillCap: WINDOWSILL_CAP_PRICE,
  muntins: MUNTINS,
  reinforcement: REINFORCEMENT,
  balconyLatches: BALCONY_LATCHES,
  microVentilation: MICRO_VENTILATION_PRICE,
  doorCloser: DOOR_CLOSER_PRICE,
};

export default EXTRAS_PRICES;
