/**
 * Централизованный экспорт всех справочников цен
 */

// Профили
export {
  ALL_PROFILES,
  FUNKE_PROFILES,
  VEKTOR_PROFILES,
  EXPROF_PROFILES,
  getProfilePrices,
  calculateProfileCost,
  type ProfilePriceItem,
  type ProfileSystem,
} from "./profiles.dict";

// Стеклопакеты
export {
  ALL_GLASS_PACKAGES,
  SINGLE_CHAMBER_GLASS,
  DOUBLE_CHAMBER_GLASS,
  GLASS_TYPES,
  getGlassPackageByCode,
  getGlassPackageByThickness,
  calculateGlassCost,
  calculateGlassCostByThickness,
  type GlassPackageItem,
} from "./glass.dict";

// Фурнитура
export {
  ALL_FURNITURE_SYSTEMS,
  FUTURUS_FURNITURE,
  ELEMENTS_FURNITURE,
  UPT_FURNITURE,
  DOOR_FURNITURE,
  HANDLES,
  getFurnitureForSashSize,
  calculateFurnitureCost,
  type FurnitureItem,
  type FurnitureSet,
} from "./furniture.dict";

// Дополнительные опции
export {
  EXTRAS_PRICES,
  MOSQUITO_NET,
  WINDOWSILLS,
  WINDOWSILL_CAP_PRICE,
  MUNTINS,
  REINFORCEMENT,
  BALCONY_LATCHES,
  MICRO_VENTILATION_PRICE,
  DOOR_CLOSER_PRICE,
  calculateMosquitoNetCost,
  getWindowsillPrice,
  calculateWindowsillCost,
  getMuntinPrice,
  calculateReinforcementCost,
  type MosquitoNetPrices,
  type WindowsillPrice,
  type MuntinPrice,
  type ReinforcementPrices,
} from "./extras.dict";
