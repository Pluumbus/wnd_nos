/**
 * Справочник цен на профили (тенге за кв.м.)
 * Данные актуальны на январь 2026
 */

export interface ProfilePriceItem {
  name: string;
  frame: number; // Профиль рамы
  sash: number; // Профиль створки
  impost: number; // Профиль импоста
  shtulp?: number; // Профиль штульпа
  doorFrame?: number; // Профиль рамы дверной
  doorSash?: number; // Профиль створки дверной
  threshold?: number; // Порог
}

export interface ProfileSystem {
  [key: string]: ProfilePriceItem;
}

// FUNKE профили
export const FUNKE_PROFILES: ProfileSystem = {
  "FUNKE_58": {
    name: "FUNKE 58 мм",
    frame: 2400,
    sash: 2948,
    impost: 3138,
    shtulp: 4256,
    doorFrame: 2284,
    doorSash: 5500,
    threshold: 8000,
  },
  "FUNKE_70": {
    name: "FUNKE 70 мм",
    frame: 2776,
    sash: 3368,
    impost: 3388,
    shtulp: 5780,
    doorFrame: 4818,
    doorSash: 6622,
    threshold: 8400,
  },
};

// VEKTOR профили
export const VEKTOR_PROFILES: ProfileSystem = {
  "VEKTOR_58": {
    name: "VEKTOR 58 мм",
    frame: 2100,
    sash: 2460,
    impost: 2672,
  },
  "VEKTOR_70": {
    name: "VEKTOR 70 мм",
    frame: 2446,
    sash: 2842,
    impost: 3112,
  },
};

// EXPROF профили
export const EXPROF_PROFILES: ProfileSystem = {
  "EXPROF_58": {
    name: "EXPROF 58 мм",
    frame: 2100, // Примерно как VEKTOR
    sash: 2460,
    impost: 2672,
    shtulp: 2902,
    doorFrame: 3068,
    doorSash: 4000, // T-вариант
    threshold: 6000,
  },
  "EXPROF_70": {
    name: "EXPROF 70 мм",
    frame: 2544,
    sash: 2976,
    impost: 3162,
    shtulp: 3512,
    doorFrame: 3280,
    doorSash: 4200, // T-вариант
    threshold: 8000,
  },
  "EXPROF_80": {
    name: "EXPROF 80 мм",
    frame: 2764,
    sash: 2940,
    impost: 3042,
  },
};

// Все профили в одном объекте
export const ALL_PROFILES: ProfileSystem = {
  ...FUNKE_PROFILES,
  ...VEKTOR_PROFILES,
  ...EXPROF_PROFILES,
};

/**
 * Получить цену профиля по ID системы
 */
export function getProfilePrices(systemId: string): ProfilePriceItem | null {
  return ALL_PROFILES[systemId] || null;
}

/**
 * Рассчитать стоимость профиля для окна
 * @param systemId - ID системы профиля
 * @param area - Площадь окна в м²
 * @param impostLength - Длина импостов в метрах
 * @param isDoor - Является ли конструкция дверью
 */
export function calculateProfileCost(
  systemId: string,
  area: number,
  impostLength: number = 0,
  isDoor: boolean = false
): number {
  const profile = getProfilePrices(systemId);
  if (!profile) return 0;

  let cost = 0;

  if (isDoor) {
    // Для двери используем дверные профили
    cost += (profile.doorFrame || profile.frame) * area;
    cost += (profile.doorSash || profile.sash) * area;
  } else {
    // Для окна
    cost += profile.frame * area;
    cost += profile.sash * area;
  }

  // Добавляем импосты (по длине)
  if (impostLength > 0) {
    cost += profile.impost * impostLength;
  }

  return cost;
}

export default ALL_PROFILES;
