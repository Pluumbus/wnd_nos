/**
 * Справочник цен на фурнитуру (тенге)
 * Данные актуальны на январь 2026
 */

export interface FurnitureItem {
  name: string;
  code: string;
  price: number;
  priceAlt?: number; // Альтернативная цена (коричневый и т.д.)
  minSize?: number; // Минимальный размер в мм
  maxSize?: number; // Максимальный размер в мм
  description?: string;
}

export interface FurnitureSet {
  name: string;
  code: string;
  items: FurnitureItem[];
}

// ============ FUTURUS ============
export const FUTURUS_FURNITURE: FurnitureSet = {
  name: "FUTURUS",
  code: "FUTURUS",
  items: [
    // Приводы поворотно-откидные
    { name: "Привод П/О 530-740 БЦ", code: "FUTURUS_DRIVE_PO_530_740", price: 1648, minSize: 530, maxSize: 740 },
    { name: "Привод П/О 590-800", code: "FUTURUS_DRIVE_PO_590_800", price: 2400, minSize: 590, maxSize: 800 },
    { name: "Привод П/О 800-1200", code: "FUTURUS_DRIVE_PO_800_1200", price: 2710, minSize: 800, maxSize: 1200 },
    { name: "Привод П/О 1200-1600", code: "FUTURUS_DRIVE_PO_1200_1600", price: 3420, minSize: 1200, maxSize: 1600 },
    { name: "Привод П/О 1600-2000", code: "FUTURUS_DRIVE_PO_1600_2000", price: 4180, minSize: 1600, maxSize: 2000 },
    { name: "Привод П/О 2000-2400", code: "FUTURUS_DRIVE_PO_2000_2400", price: 5150, minSize: 2000, maxSize: 2400 },
    
    // Ножницы
    { name: "Ножницы П/О 400-600", code: "FUTURUS_SCISSORS_400_600", price: 1450, minSize: 400, maxSize: 600 },
    { name: "Ножницы П/О 600-800", code: "FUTURUS_SCISSORS_600_800", price: 1696, minSize: 600, maxSize: 800 },
    { name: "Ножницы П/О 800-1000", code: "FUTURUS_SCISSORS_800_1000", price: 2910, minSize: 800, maxSize: 1000 },
    { name: "Ножницы П/О 1000-1200", code: "FUTURUS_SCISSORS_1000_1200", price: 3710, minSize: 1000, maxSize: 1200 },
    
    // Угловые передачи
    { name: "Угловая передача стандарт", code: "FUTURUS_CORNER_STD", price: 850 },
    { name: "Угловая передача узкая", code: "FUTURUS_CORNER_NARROW", price: 620 },
    { name: "Угл. передача основная грибком IP", code: "FUTURUS_CORNER_IP", price: 940 },
    
    // Удлинители
    { name: "Удл-тель 400-1 с соед.", code: "FUTURUS_EXT_400", price: 850 },
    { name: "Удл-тель 600-1 с соед.", code: "FUTURUS_EXT_600", price: 1092 },
    { name: "Уголок ножниц 200/1E", code: "FUTURUS_SCISSORS_CORNER", price: 780 },
    
    // Петли
    { name: "Петля створки верхняя 13/9мм", code: "FUTURUS_HINGE_SASH_TOP", price: 268 },
    { name: "Петля створки нижняя", code: "FUTURUS_HINGE_SASH_BOTTOM", price: 574 },
    { name: "Петля рамы верхняя с штифтом", code: "FUTURUS_HINGE_FRAME_TOP", price: 606 },
    { name: "Петля рамы нижняя", code: "FUTURUS_HINGE_FRAME_BOTTOM", price: 496 },
    { name: "Поворотная петля-кронштейн", code: "FUTURUS_HINGE_BRACKET", price: 782 },
    
    // Штульповые
    { name: "Штульповой привод 240", code: "FUTURUS_SHTULP_240", price: 2782 },
    { name: "Штульповой привод 800", code: "FUTURUS_SHTULP_800", price: 1074 },
    { name: "Штульповой привод 1200", code: "FUTURUS_SHTULP_1200", price: 1670 },
    { name: "Штульповой привод 1600", code: "FUTURUS_SHTULP_1600", price: 2224 },
    { name: "Штульповой привод 2000", code: "FUTURUS_SHTULP_2000", price: 2782 },
    { name: "Шпингалет оконный универсальный", code: "FUTURUS_BOLT", price: 734 },
    
    // Прижимы
    { name: "Средний прижим накладной (створочная часть)", code: "FUTURUS_CLAMP_SASH", price: 152 },
    { name: "Средний прижим накладной (рамная часть)", code: "FUTURUS_CLAMP_FRAME", price: 144 },
    
    // Прочее
    { name: "Зацеп откидной взломоустойчивый", code: "FUTURUS_HOOK", price: 370 },
    { name: "Ответная планка приподнимателя", code: "FUTURUS_LIFTER_PLATE", price: 120 },
    { name: "Запорная планка на штульповой привод", code: "FUTURUS_LOCK_PLATE_SHTULP", price: 142 },
    { name: "Запорная планка штульповая", code: "FUTURUS_LOCK_PLATE_SHTULP_2", price: 256 },
    { name: "Фрамужные ножницы", code: "FUTURUS_TRANSOM_SCISSORS", price: 1100 },
  ],
};

// ============ ELEMENTS ============
export const ELEMENTS_FURNITURE: FurnitureSet = {
  name: "ELEMENTS",
  code: "ELEMENTS",
  items: [
    // Приводы
    { name: "Привод пов-отк 480-730", code: "ELEMENTS_DRIVE_480_730", price: 1022, minSize: 480, maxSize: 730 },
    { name: "Привод пов-отк 730-1180", code: "ELEMENTS_DRIVE_730_1180", price: 1654, minSize: 730, maxSize: 1180 },
    { name: "Привод пов-отк 950-1400", code: "ELEMENTS_DRIVE_950_1400", price: 2112, minSize: 950, maxSize: 1400 },
    { name: "Привод пов-отк 1180-1630", code: "ELEMENTS_DRIVE_1180_1630", price: 2362, minSize: 1180, maxSize: 1630 },
    { name: "Привод пов-отк 1630-2080", code: "ELEMENTS_DRIVE_1630_2080", price: 2874, minSize: 1630, maxSize: 2080 },
    { name: "Привод пов-отк 1900-2350", code: "ELEMENTS_DRIVE_1900_2350", price: 3656, minSize: 1900, maxSize: 2350 },
    
    // Ножницы
    { name: "Ножницы 375-650", code: "ELEMENTS_SCISSORS_375_650", price: 1752, minSize: 375, maxSize: 650 },
    { name: "Ножницы 565-840", code: "ELEMENTS_SCISSORS_565_840", price: 2296, minSize: 565, maxSize: 840 },
    { name: "Ножницы 770-1045", code: "ELEMENTS_SCISSORS_770_1045", price: 2742, minSize: 770, maxSize: 1045 },
    { name: "Ножницы 990-1265", code: "ELEMENTS_SCISSORS_990_1265", price: 2134, minSize: 990, maxSize: 1265 },
    { name: "Ножницы 1210-1485", code: "ELEMENTS_SCISSORS_1210_1485", price: 2553, minSize: 1210, maxSize: 1485 },
    
    // Средние запоры
    { name: "Средний запор 400-850", code: "ELEMENTS_MID_LOCK_400_850", price: 652, minSize: 400, maxSize: 850 },
    { name: "Средний запор 850-1300", code: "ELEMENTS_MID_LOCK_850_1300", price: 1164, minSize: 850, maxSize: 1300 },
    { name: "Средний запор 1200-1500", code: "ELEMENTS_MID_LOCK_1200_1500", price: 1404, minSize: 1200, maxSize: 1500 },
    { name: "Средний запор 1400-1700", code: "ELEMENTS_MID_LOCK_1400_1700", price: 1926, minSize: 1400, maxSize: 1700 },
    { name: "Средний запор 1600-2050", code: "ELEMENTS_MID_LOCK_1600_2050", price: 2350, minSize: 1600, maxSize: 2050 },
    { name: "Средний запор 2000-2350", code: "ELEMENTS_MID_LOCK_2000_2350", price: 2667, minSize: 2000, maxSize: 2350 },
    
    // Петли
    { name: "Верхняя петля ств.13", code: "ELEMENTS_HINGE_TOP_13", price: 419 },
    { name: "Верхняя петля ств.09", code: "ELEMENTS_HINGE_TOP_09", price: 428 },
    { name: "Верхняя петля рамы 3мм", code: "ELEMENTS_HINGE_FRAME_TOP", price: 276 },
    { name: "Нижняя петля рамы 3мм", code: "ELEMENTS_HINGE_FRAME_BOTTOM", price: 304 },
    { name: "Нижняя петля створки 6мм", code: "ELEMENTS_HINGE_SASH_BOTTOM", price: 343 },
    { name: "Верхняя пов. петля", code: "ELEMENTS_HINGE_TOP_TURN", price: 828 },
    
    // Прочее
    { name: "Микролифт", code: "ELEMENTS_MICROLIFT", price: 495 },
    { name: "Вертикальный замок", code: "ELEMENTS_VERT_LOCK", price: 619 },
    { name: "Поворотный замок нижн.", code: "ELEMENTS_TURN_LOCK_BOTTOM", price: 571 },
    { name: "Поворотный замок верх.", code: "ELEMENTS_TURN_LOCK_TOP", price: 590 },
    { name: "Комплект декор накладки", code: "ELEMENTS_DECOR_SET", price: 200 },
    { name: "Комплект декор накладок", code: "ELEMENTS_DECOR_SET_2", price: 123 },
    { name: "Открытый прижим", code: "ELEMENTS_OPEN_CLAMP", price: 438 },
    { name: "Фрамужные ножницы", code: "ELEMENTS_TRANSOM_SCISSORS", price: 1076 },
    { name: "Средний прижим накладной", code: "ELEMENTS_MID_CLAMP", price: 362 },
    { name: "Балк защелка 13", code: "ELEMENTS_BALCONY_LATCH_13", price: 1400 },
    { name: "Балк защелка 09", code: "ELEMENTS_BALCONY_LATCH_09", price: 619 },
    { name: "Угловой перекл.", code: "ELEMENTS_CORNER_SW", price: 1190, priceAlt: 1047 },
    { name: "Шт. шпингалет верх./нижн", code: "ELEMENTS_BOLT", price: 4140 },
    { name: "Штульп запор шпинг. верх/нижн", code: "ELEMENTS_SHTULP_BOLT", price: 4140 },
    { name: "Шт. запор", code: "ELEMENTS_SHTULP_LOCK", price: 2000 },
    { name: "Доп элемент(удл.) 390-660", code: "ELEMENTS_EXT_390_660", price: 1038, minSize: 390, maxSize: 660 },
    
    // Запоры поворотные
    { name: "Запор пов. 280", code: "ELEMENTS_LOCK_280", price: 1002 },
    { name: "Запор пов. 300-600", code: "ELEMENTS_LOCK_300_600", price: 1164, minSize: 300, maxSize: 600 },
    { name: "Запор пов. 500-800", code: "ELEMENTS_LOCK_500_800", price: 1448, minSize: 500, maxSize: 800 },
    { name: "Запор пов. 700-1000", code: "ELEMENTS_LOCK_700_1000", price: 1698, minSize: 700, maxSize: 1000 },
    { name: "Запор пов. 900-1200", code: "ELEMENTS_LOCK_900_1200", price: 2176, minSize: 900, maxSize: 1200 },
    { name: "Запор пов. 1100-1400", code: "ELEMENTS_LOCK_1100_1400", price: 2406, minSize: 1100, maxSize: 1400 },
    { name: "Запор пов. 1300-1600", code: "ELEMENTS_LOCK_1300_1600", price: 2796, minSize: 1300, maxSize: 1600 },
    { name: "Запор пов. 1500-1800", code: "ELEMENTS_LOCK_1500_1800", price: 2906, minSize: 1500, maxSize: 1800 },
    { name: "Запор пов. 1700-2000", code: "ELEMENTS_LOCK_1700_2000", price: 3494, minSize: 1700, maxSize: 2000 },
    { name: "Запор пов. 1900-2200", code: "ELEMENTS_LOCK_1900_2200", price: 3712, minSize: 1900, maxSize: 2200 },
    { name: "Запор пов. 2100-2400", code: "ELEMENTS_LOCK_2100_2400", price: 4462, minSize: 2100, maxSize: 2400 },
    
    // Ответные планки
    { name: "Отв.планка м/лифт 09", code: "ELEMENTS_PLATE_ML_09", price: 57 },
    { name: "Отв.планка м/лифт 13", code: "ELEMENTS_PLATE_ML_13", price: 76 },
    { name: "Отв.планка п/о 13", code: "ELEMENTS_PLATE_PO_13", price: 257 },
    { name: "Отв. планка 13", code: "ELEMENTS_PLATE_13", price: 104 },
    { name: "Отв. планка шпинг. 13", code: "ELEMENTS_PLATE_BOLT_13", price: 42 },
    { name: "Отв. планка шп 09", code: "ELEMENTS_PLATE_BOLT_09", price: 42 },
    { name: "Отв.планка щелевого пр.", code: "ELEMENTS_PLATE_SLOT", price: 32 },
    { name: "Отв открытого прижима 13/09", code: "ELEMENTS_PLATE_OPEN_CLAMP", price: 171 },
    { name: "Фражумная петля 13", code: "ELEMENTS_TRANSOM_HINGE_13", price: 2200 },
    { name: "Фражумная петля 09", code: "ELEMENTS_TRANSOM_HINGE_09", price: 1181 },
  ],
};

// ============ UPT ============
export const UPT_FURNITURE: FurnitureSet = {
  name: "UPT",
  code: "UPT",
  items: [
    // Приводы поворотно-откидные
    { name: "Привод пов-отк. 490-790", code: "UPT_DRIVE_490_790", price: 1736, minSize: 490, maxSize: 790 },
    { name: "Привод пов-отк. 590-800", code: "UPT_DRIVE_590_800", price: 1568, minSize: 590, maxSize: 800 },
    { name: "Привод пов-отк. 800-1200", code: "UPT_DRIVE_800_1200", price: 2000, minSize: 800, maxSize: 1200 },
    { name: "Привод пов-отк. 900-1300", code: "UPT_DRIVE_900_1300", price: 2060, minSize: 900, maxSize: 1300 },
    { name: "Привод пов-отк. 1050-1450", code: "UPT_DRIVE_1050_1450", price: 2302, minSize: 1050, maxSize: 1450 },
    { name: "Привод пов-отк. 1200-1600", code: "UPT_DRIVE_1200_1600", price: 2466, minSize: 1200, maxSize: 1600 },
    { name: "Привод пов-отк. 1600-2000", code: "UPT_DRIVE_1600_2000", price: 3288, minSize: 1600, maxSize: 2000 },
    { name: "Привод пов-отк. 2000-2400", code: "UPT_DRIVE_2000_2400", price: 4080, minSize: 2000, maxSize: 2400 },
    
    // Приводы поворотные
    { name: "Привод пов. 400-600-2", code: "UPT_DRIVE_P_400_600", price: 1370, minSize: 400, maxSize: 600 },
    { name: "Привод пов. 600-800-2", code: "UPT_DRIVE_P_600_800", price: 1640, minSize: 600, maxSize: 800 },
    { name: "Привод пов. 800-1000-2", code: "UPT_DRIVE_P_800_1000", price: 1904, minSize: 800, maxSize: 1000 },
    { name: "Привод пов. 1000-1200-3", code: "UPT_DRIVE_P_1000_1200", price: 2214, minSize: 1000, maxSize: 1200 },
    { name: "Привод пов. 1200-1400-3", code: "UPT_DRIVE_P_1200_1400", price: 2514, minSize: 1200, maxSize: 1400 },
    { name: "Привод пов. 1400-1600-3", code: "UPT_DRIVE_P_1400_1600", price: 2762, minSize: 1400, maxSize: 1600 },
    { name: "Привод пов. 1600-1800-4", code: "UPT_DRIVE_P_1600_1800", price: 3768, minSize: 1600, maxSize: 1800 },
    { name: "Привод пов. 1800-2000-4", code: "UPT_DRIVE_P_1800_2000", price: 3408, minSize: 1800, maxSize: 2000 },
    { name: "Привод пов. 2000-2400-4", code: "UPT_DRIVE_P_2000_2400", price: 3762, minSize: 2000, maxSize: 2400 },
    
    // Ножницы
    { name: "Ножницы 500-700", code: "UPT_SCISSORS_500_700", price: 1570, minSize: 500, maxSize: 700 },
    { name: "Ножницы 600-800", code: "UPT_SCISSORS_600_800", price: 2000, minSize: 600, maxSize: 800 },
    { name: "Ножницы 800-1000", code: "UPT_SCISSORS_800_1000", price: 2322, minSize: 800, maxSize: 1000 },
    { name: "Ножницы 1000-1200", code: "UPT_SCISSORS_1000_1200", price: 2590, minSize: 1000, maxSize: 1200 },
    { name: "Ножницы 1200-1400", code: "UPT_SCISSORS_1200_1400", price: 2870, minSize: 1200, maxSize: 1400 },
    
    // Средние запоры
    { name: "Средний запор 400-1100", code: "UPT_MID_LOCK_400_1100", price: 872, minSize: 400, maxSize: 1100 },
    { name: "Средний запор 600-1300", code: "UPT_MID_LOCK_600_1300", price: 1110, minSize: 600, maxSize: 1300 },
    { name: "Средний запор 800-1500", code: "UPT_MID_LOCK_800_1500", price: 1486, minSize: 800, maxSize: 1500 },
    
    // Прочее
    { name: "Угловая передача", code: "UPT_CORNER", price: 650 },
    { name: "Угловая передача узкая", code: "UPT_CORNER_NARROW", price: 620 },
    { name: "Удлинитель 400-1", code: "UPT_EXT_400", price: 664 },
    { name: "Удлинитель 600-1", code: "UPT_EXT_600", price: 938 },
    { name: "Шпингалет откидной", code: "UPT_BOLT", price: 484 },
    { name: "Ограничитель фрамужный", code: "UPT_TRANSOM_LIMITER", price: 1320 },
    { name: "Все ответные планки", code: "UPT_PLATES", price: 232 },
    { name: "Петля створки верхняя 13/09", code: "UPT_HINGE_TOP", price: 268 },
  ],
};

// Дверная фурнитура
export const DOOR_FURNITURE: FurnitureItem[] = [
  { name: "Цилиндр ключ/ключ", code: "DOOR_CYLINDER_KK", price: 5000 },
  { name: "Цилиндр ключ/вороток", code: "DOOR_CYLINDER_KV", price: 6000 },
  { name: "Петля дверная усиленная 3д", code: "DOOR_HINGE_3D", price: 4430 },
  { name: "Петля дверная", code: "DOOR_HINGE", price: 2400 },
  { name: "Замок с защелкой 35", code: "DOOR_LOCK_LATCH_35", price: 5000 },
  { name: "Замок с защелкой 25", code: "DOOR_LOCK_LATCH_25", price: 4780 },
  { name: "Замок с роликом 35", code: "DOOR_LOCK_ROLLER_35", price: 4000 },
  { name: "Замок с роликом 25", code: "DOOR_LOCK_ROLLER_25", price: 4000 },
  { name: "Замок мм/зап защелка 35", code: "DOOR_LOCK_MM_LATCH_35", price: 5400 },
  { name: "Замок мм/зап ролик", code: "DOOR_LOCK_MM_ROLLER", price: 5400 },
  { name: "Ответная планка", code: "DOOR_PLATE", price: 800 },
  { name: "Накладки", code: "DOOR_COVERS", price: 676 },
  { name: "Доводчик", code: "DOOR_CLOSER", price: 67000 },
  { name: "Шпингалет шт.нижний", code: "DOOR_BOLT_BOTTOM", price: 4140 },
  { name: "Шпингалет шт.верхний", code: "DOOR_BOLT_TOP", price: 4140 },
];

// Ручки
export const HANDLES: FurnitureItem[] = [
  { name: "Ручка офисная полукруг", code: "HANDLE_OFFICE_SEMI", price: 11600 },
  { name: "Ручка офисная прямая 50см", code: "HANDLE_OFFICE_50", price: 11600, priceAlt: 13000 },
  { name: "Ручка офисная прямая", code: "HANDLE_OFFICE", price: 12000, priceAlt: 13000 },
  { name: "Ручка пластиковая", code: "HANDLE_PLASTIC", price: 1180, priceAlt: 1500 },
  { name: "Ручка пластиковая (дверная)", code: "HANDLE_PLASTIC_DOOR", price: 4000 },
  { name: "Нажимной гарнитур", code: "HANDLE_PRESS", price: 3600, priceAlt: 4000 },
  { name: "Ручка Hoppe", code: "HANDLE_HOPPE", price: 1200, priceAlt: 1600 },
  { name: "Ручка с ключом", code: "HANDLE_KEY", price: 6000 },
  { name: "Ручка с двух сторон", code: "HANDLE_DOUBLE", price: 4600, priceAlt: 4400 },
  { name: "Ручка с двух сторон с ключом", code: "HANDLE_DOUBLE_KEY", price: 6000 },
];

// Все системы фурнитуры
export const ALL_FURNITURE_SYSTEMS: FurnitureSet[] = [
  FUTURUS_FURNITURE,
  ELEMENTS_FURNITURE,
  UPT_FURNITURE,
];

/**
 * Получить фурнитуру по размеру створки (автоподбор)
 */
export function getFurnitureForSashSize(
  systemCode: string,
  sashHeight: number,
  sashWidth: number,
  isTiltTurn: boolean = true // Поворотно-откидная
): FurnitureItem[] {
  const system = ALL_FURNITURE_SYSTEMS.find((s) => s.code === systemCode);
  if (!system) return [];

  const result: FurnitureItem[] = [];

  // Подбираем привод по высоте
  const drives = system.items.filter((item) => 
    (isTiltTurn ? item.code.includes("_DRIVE_PO_") || item.code.includes("_DRIVE_") && !item.code.includes("_DRIVE_P_") : item.code.includes("_DRIVE_P_")) &&
    item.minSize && item.maxSize &&
    sashHeight >= item.minSize && sashHeight <= item.maxSize
  );
  if (drives.length > 0) result.push(drives[0]);

  // Подбираем ножницы по ширине
  const scissors = system.items.filter((item) =>
    item.code.includes("_SCISSORS_") &&
    item.minSize && item.maxSize &&
    sashWidth >= item.minSize && sashWidth <= item.maxSize
  );
  if (scissors.length > 0) result.push(scissors[0]);

  // Добавляем угловую передачу
  const corner = system.items.find((item) => item.code.includes("_CORNER_STD") || item.code.includes("_CORNER") && !item.code.includes("NARROW"));
  if (corner) result.push(corner);

  // Добавляем петли
  const hinges = system.items.filter((item) => item.code.includes("_HINGE_"));
  result.push(...hinges.slice(0, 4)); // Берём первые 4 петли

  return result;
}

/**
 * Рассчитать стоимость комплекта фурнитуры
 */
export function calculateFurnitureCost(items: FurnitureItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

export default ALL_FURNITURE_SYSTEMS;
