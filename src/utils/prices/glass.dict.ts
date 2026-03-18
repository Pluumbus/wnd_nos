/**
 * Справочник цен на стеклопакеты (тенге за кв.м.)
 * СПО - однокамерный, СПД - двухкамерный
 * И - энергосберегающий, AR - аргон
 * Данные актуальны на январь 2026
 */

export interface GlassPackageItem {
  name: string;
  code: string;
  thickness: number; // Толщина в мм
  price: number; // Цена за кв.м.
  description?: string;
  isEnergySaving?: boolean;
  hasArgon?: boolean;
}

// Однокамерные стеклопакеты (СПО)
export const SINGLE_CHAMBER_GLASS: GlassPackageItem[] = [
  {
    name: "СПО 24",
    code: "SPO_24",
    thickness: 24,
    price: 14100,
    description: "4-16-4 однокамерный",
  },
  {
    name: "СПО 24 бронза",
    code: "SPO_24_BRONZE",
    thickness: 24,
    price: 26000,
    description: "4-16-4 однокамерный бронза",
  },
  {
    name: "СПО 24 ЭН 1К",
    code: "SPO_24_EN_1K",
    thickness: 24,
    price: 24000,
    description: "4-16-4 энергосберегающий 1 камера",
    isEnergySaving: true,
  },
  {
    name: "СПО 24 И ЭН 2К",
    code: "SPO_24_I_EN_2K",
    thickness: 24,
    price: 18400,
    description: "4-16-4 И энергосберегающий 2 камеры",
    isEnergySaving: true,
  },
];

// Двухкамерные стеклопакеты (СПД)
export const DOUBLE_CHAMBER_GLASS: GlassPackageItem[] = [
  {
    name: "СПД 24",
    code: "SPD_24",
    thickness: 24,
    price: 27200,
    description: "4-6-4-6-4 двухкамерный",
  },
  {
    name: "СПД 24 И",
    code: "SPD_24_I",
    thickness: 24,
    price: 33000,
    description: "4-6-4-6-4 И двухкамерный энергосберегающий",
    isEnergySaving: true,
  },
  {
    name: "СПД 24 И AR",
    code: "SPD_24_I_AR",
    thickness: 24,
    price: 33000,
    description: "4-6-4-6-4 И AR двухкамерный с аргоном",
    isEnergySaving: true,
    hasArgon: true,
  },
  {
    name: "СПД 24 бронза",
    code: "SPD_24_BRONZE",
    thickness: 24,
    price: 34400,
    description: "4-6-4-6-4 бронза",
  },
  {
    name: "СПД 32",
    code: "SPD_32",
    thickness: 32,
    price: 18520,
    description: "4-10-4-10-4 двухкамерный",
  },
  {
    name: "СПД 32 И",
    code: "SPD_32_I",
    thickness: 32,
    price: 31600,
    description: "4-10-4-10-4 И двухкамерный энергосберегающий",
    isEnergySaving: true,
  },
  {
    name: "СПД 32 И AR",
    code: "SPD_32_I_AR",
    thickness: 32,
    price: 33000,
    description: "4-10-4-10-4 И AR с аргоном",
    isEnergySaving: true,
    hasArgon: true,
  },
  {
    name: "СПД 32 бронза",
    code: "SPD_32_BRONZE",
    thickness: 32,
    price: 34400,
    description: "4-10-4-10-4 бронза",
  },
  {
    name: "СПД 36",
    code: "SPD_36",
    thickness: 36,
    price: 19100,
    description: "4-12-4-12-4 двухкамерный",
  },
  {
    name: "СПД 36 И",
    code: "SPD_36_I",
    thickness: 36,
    price: 35000,
    description: "4-12-4-12-4 И энергосберегающий",
    isEnergySaving: true,
  },
  {
    name: "СПД 36 И AR",
    code: "SPD_36_I_AR",
    thickness: 36,
    price: 33400,
    description: "4-12-4-12-4 И AR с аргоном",
    isEnergySaving: true,
    hasArgon: true,
  },
  {
    name: "СПД 36 бронза",
    code: "SPD_36_BRONZE",
    thickness: 36,
    price: 35600,
    description: "4-12-4-12-4 бронза",
  },
  {
    name: "СПД 40",
    code: "SPD_40",
    thickness: 40,
    price: 19900,
    description: "4-14-4-14-4 двухкамерный",
  },
  {
    name: "СПД 40 ЭН 1К",
    code: "SPD_40_EN_1K",
    thickness: 40,
    price: 24000,
    description: "4-14-4-14-4 ЭН 1К",
    isEnergySaving: true,
  },
  {
    name: "СПД 40 ЭН 2К",
    code: "SPD_40_EN_2K",
    thickness: 40,
    price: 35000,
    description: "4-14-4-14-4 ЭН 2К",
    isEnergySaving: true,
  },
  {
    name: "СПД 40 И AR",
    code: "SPD_40_I_AR",
    thickness: 40,
    price: 35000,
    description: "4-14-4-14-4 И AR с аргоном",
    isEnergySaving: true,
    hasArgon: true,
  },
  {
    name: "СПД 40 тон",
    code: "SPD_40_TONED",
    thickness: 40,
    price: 35000,
    description: "4-14-4-14-4 тонированный",
  },
  {
    name: "СПД 42",
    code: "SPD_42",
    thickness: 42,
    price: 20100,
    description: "4-15-4-15-4 двухкамерный",
  },
  {
    name: "СПД 42 И",
    code: "SPD_42_I",
    thickness: 42,
    price: 34000,
    description: "4-15-4-15-4 И энергосберегающий",
    isEnergySaving: true,
  },
  {
    name: "СПД 42 И AR",
    code: "SPD_42_I_AR",
    thickness: 42,
    price: 34000,
    description: "4-15-4-15-4 И AR с аргоном",
    isEnergySaving: true,
    hasArgon: true,
  },
  {
    name: "СПД 42 бронза",
    code: "SPD_42_BRONZE",
    thickness: 42,
    price: 36400,
    description: "4-15-4-15-4 бронза",
  },
  {
    name: "СПД 44",
    code: "SPD_44",
    thickness: 44,
    price: 20100,
    description: "4-16-4-16-4 двухкамерный",
  },
  {
    name: "СПД 44 И",
    code: "SPD_44_I",
    thickness: 44,
    price: 34000,
    description: "4-16-4-16-4 И энергосберегающий",
    isEnergySaving: true,
  },
  {
    name: "СПД 44 бронза",
    code: "SPD_44_BRONZE",
    thickness: 44,
    price: 36400,
    description: "4-16-4-16-4 бронза",
  },
  {
    name: "СПД 48",
    code: "SPD_48",
    thickness: 48,
    price: 28000,
    description: "4-18-4-18-4 двухкамерный",
  },
  {
    name: "СПД 50",
    code: "SPD_50",
    thickness: 50,
    price: 21000,
    description: "4-19-4-19-4 двухкамерный",
  },
];

// Все стеклопакеты
export const ALL_GLASS_PACKAGES: GlassPackageItem[] = [
  ...SINGLE_CHAMBER_GLASS,
  ...DOUBLE_CHAMBER_GLASS,
];

// Стекло отдельно (для специальных случаев)
export const GLASS_TYPES = {
  GLASS_4MM: { name: "Стекло 4мм", price: 6000 },
  GLASS_5MM: { name: "Стекло 5мм", price: 11600 },
  GLASS_6MM: { name: "Стекло 6мм", price: 13600 },
  GLASS_4MM_BRONZE: { name: "Стекло 4мм бронза", price: 13600 },
  HP_N_CH_35: { name: "HP N CH 35", price: 1320 },
  HP_N_CH_50: { name: "HP N CH 50", price: 1320 },
  LE_35_SR_CDF: { name: "LE 35 SR CDF", price: 1500 },
  LE_50_SR_CDF: { name: "LE 50 SR CDF", price: 1500 },
  MATELUX: { name: "Matelux", price: 1440 },
  MATTE_GREY: { name: "Matte grey", price: 1320 },
  REINF_112MKM: { name: "Укрепл. 112мкм", price: 1400 },
  REINF_A1: { name: "Укрепл. А1", price: 2400 },
  REINF_A2: { name: "Укрепл. А2", price: 3200 },
  REINF_A3: { name: "Укрепл. А3", price: 4000 },
};

/**
 * Получить стеклопакет по коду
 */
export function getGlassPackageByCode(code: string): GlassPackageItem | null {
  return ALL_GLASS_PACKAGES.find((g) => g.code === code) || null;
}

/**
 * Получить стеклопакет по толщине (возвращает базовый вариант)
 */
export function getGlassPackageByThickness(
  thickness: number
): GlassPackageItem | null {
  // Сначала ищем двухкамерный без модификаций
  const spd = DOUBLE_CHAMBER_GLASS.find(
    (g) =>
      g.thickness === thickness &&
      !g.isEnergySaving &&
      !g.hasArgon &&
      !g.code.includes("BRONZE") &&
      !g.code.includes("TONED")
  );
  if (spd) return spd;

  // Затем однокамерный
  const spo = SINGLE_CHAMBER_GLASS.find(
    (g) =>
      g.thickness === thickness && !g.isEnergySaving && !g.code.includes("BRONZE")
  );
  return spo || null;
}

/**
 * Рассчитать стоимость стеклопакета
 */
export function calculateGlassCost(
  code: string,
  area: number
): number {
  const glass = getGlassPackageByCode(code);
  if (!glass) return 0;
  return glass.price * area;
}

/**
 * Рассчитать стоимость стеклопакета по толщине
 */
export function calculateGlassCostByThickness(
  thickness: number,
  area: number
): number {
  const glass = getGlassPackageByThickness(thickness);
  if (!glass) return 0;
  return glass.price * area;
}

export default ALL_GLASS_PACKAGES;
