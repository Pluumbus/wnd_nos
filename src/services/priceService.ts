import { supabase } from "../lib/supabase";
import { Database } from "../lib/supabase.types";

// Типы из базы данных
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type GlassPackage = Database["public"]["Tables"]["glass_packages"]["Row"];
export type GlassType = Database["public"]["Tables"]["glass_types"]["Row"];
export type FurnitureSystem = Database["public"]["Tables"]["furniture_systems"]["Row"];
export type FurnitureItem = Database["public"]["Tables"]["furniture_items"]["Row"];
export type Handle = Database["public"]["Tables"]["handles"]["Row"];
export type Windowsill = Database["public"]["Tables"]["windowsills"]["Row"];
export type WindowsillAccessory = Database["public"]["Tables"]["windowsill_accessories"]["Row"];
export type Muntin = Database["public"]["Tables"]["muntins"]["Row"];
export type MosquitoNetPrice = Database["public"]["Tables"]["mosquito_net_prices"]["Row"];
export type ReinforcementPrice = Database["public"]["Tables"]["reinforcement_prices"]["Row"];
export type Extra = Database["public"]["Tables"]["extras"]["Row"];

// Интерфейс кэша
interface PriceCache {
  profiles: Profile[] | null;
  glassPackages: GlassPackage[] | null;
  glassTypes: GlassType[] | null;
  furnitureSystems: FurnitureSystem[] | null;
  furnitureItems: FurnitureItem[] | null;
  handles: Handle[] | null;
  windowsills: Windowsill[] | null;
  windowsillAccessories: WindowsillAccessory[] | null;
  muntins: Muntin[] | null;
  mosquitoNetPrices: MosquitoNetPrice[] | null;
  reinforcementPrices: ReinforcementPrice[] | null;
  extras: Extra[] | null;
  lastUpdated: { [key: string]: number };
}

// Время жизни кэша (5 минут)
const CACHE_TTL = 5 * 60 * 1000;

// Глобальный кэш
const cache: PriceCache = {
  profiles: null,
  glassPackages: null,
  glassTypes: null,
  furnitureSystems: null,
  furnitureItems: null,
  handles: null,
  windowsills: null,
  windowsillAccessories: null,
  muntins: null,
  mosquitoNetPrices: null,
  reinforcementPrices: null,
  extras: null,
  lastUpdated: {},
};

// Проверка актуальности кэша
function isCacheValid(key: string): boolean {
  const lastUpdated = cache.lastUpdated[key];
  if (!lastUpdated) return false;
  return Date.now() - lastUpdated < CACHE_TTL;
}

// Обновление времени кэша
function updateCacheTime(key: string): void {
  cache.lastUpdated[key] = Date.now();
}

export class PriceService {
  // ============ ПРОФИЛИ ============
  static async getProfiles(forceRefresh = false): Promise<Profile[]> {
    if (!forceRefresh && cache.profiles && isCacheValid("profiles")) {
      return cache.profiles;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("system_name", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching profiles:", error);
      throw error;
    }

    cache.profiles = data || [];
    updateCacheTime("profiles");
    return cache.profiles;
  }

  static async updateProfile(id: number, updates: Partial<Profile>): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      throw error;
    }

    // Инвалидируем кэш
    cache.profiles = null;
    return data;
  }

  // ============ СТЕКЛОПАКЕТЫ ============
  static async getGlassPackages(forceRefresh = false): Promise<GlassPackage[]> {
    if (!forceRefresh && cache.glassPackages && isCacheValid("glassPackages")) {
      return cache.glassPackages;
    }

    const { data, error } = await supabase
      .from("glass_packages")
      .select("*")
      .order("chamber_type", { ascending: true })
      .order("thickness", { ascending: true });

    if (error) {
      console.error("Error fetching glass packages:", error);
      throw error;
    }

    cache.glassPackages = data || [];
    updateCacheTime("glassPackages");
    return cache.glassPackages;
  }

  static async updateGlassPackage(id: number, updates: Partial<GlassPackage>): Promise<GlassPackage> {
    const { data, error } = await supabase
      .from("glass_packages")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating glass package:", error);
      throw error;
    }

    cache.glassPackages = null;
    return data;
  }

  // ============ ТИПЫ СТЕКЛА ============
  static async getGlassTypes(forceRefresh = false): Promise<GlassType[]> {
    if (!forceRefresh && cache.glassTypes && isCacheValid("glassTypes")) {
      return cache.glassTypes;
    }

    const { data, error } = await supabase
      .from("glass_types")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching glass types:", error);
      throw error;
    }

    cache.glassTypes = data || [];
    updateCacheTime("glassTypes");
    return cache.glassTypes;
  }

  static async updateGlassType(id: number, updates: Partial<GlassType>): Promise<GlassType> {
    const { data, error } = await supabase
      .from("glass_types")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating glass type:", error);
      throw error;
    }

    cache.glassTypes = null;
    return data;
  }

  // ============ СИСТЕМЫ ФУРНИТУРЫ ============
  static async getFurnitureSystems(forceRefresh = false): Promise<FurnitureSystem[]> {
    if (!forceRefresh && cache.furnitureSystems && isCacheValid("furnitureSystems")) {
      return cache.furnitureSystems;
    }

    const { data, error } = await supabase
      .from("furniture_systems")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching furniture systems:", error);
      throw error;
    }

    cache.furnitureSystems = data || [];
    updateCacheTime("furnitureSystems");
    return cache.furnitureSystems;
  }

  // ============ ЭЛЕМЕНТЫ ФУРНИТУРЫ ============
  static async getFurnitureItems(forceRefresh = false): Promise<FurnitureItem[]> {
    if (!forceRefresh && cache.furnitureItems && isCacheValid("furnitureItems")) {
      return cache.furnitureItems;
    }

    const { data, error } = await supabase
      .from("furniture_items")
      .select("*")
      .order("system_id", { ascending: true })
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching furniture items:", error);
      throw error;
    }

    cache.furnitureItems = data || [];
    updateCacheTime("furnitureItems");
    return cache.furnitureItems;
  }

  static async getFurnitureItemsBySystem(systemId: number, forceRefresh = false): Promise<FurnitureItem[]> {
    const allItems = await this.getFurnitureItems(forceRefresh);
    return allItems.filter(item => item.system_id === systemId);
  }

  static async updateFurnitureItem(id: number, updates: Partial<FurnitureItem>): Promise<FurnitureItem> {
    const { data, error } = await supabase
      .from("furniture_items")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating furniture item:", error);
      throw error;
    }

    cache.furnitureItems = null;
    return data;
  }

  // ============ РУЧКИ ============
  static async getHandles(forceRefresh = false): Promise<Handle[]> {
    if (!forceRefresh && cache.handles && isCacheValid("handles")) {
      return cache.handles;
    }

    const { data, error } = await supabase
      .from("handles")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching handles:", error);
      throw error;
    }

    cache.handles = data || [];
    updateCacheTime("handles");
    return cache.handles;
  }

  static async updateHandle(id: number, updates: Partial<Handle>): Promise<Handle> {
    const { data, error } = await supabase
      .from("handles")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating handle:", error);
      throw error;
    }

    cache.handles = null;
    return data;
  }

  // ============ ПОДОКОННИКИ ============
  static async getWindowsills(forceRefresh = false): Promise<Windowsill[]> {
    if (!forceRefresh && cache.windowsills && isCacheValid("windowsills")) {
      return cache.windowsills;
    }

    const { data, error } = await supabase
      .from("windowsills")
      .select("*")
      .order("width", { ascending: true });

    if (error) {
      console.error("Error fetching windowsills:", error);
      throw error;
    }

    cache.windowsills = data || [];
    updateCacheTime("windowsills");
    return cache.windowsills;
  }

  static async updateWindowsill(id: number, updates: Partial<Windowsill>): Promise<Windowsill> {
    const { data, error } = await supabase
      .from("windowsills")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating windowsill:", error);
      throw error;
    }

    cache.windowsills = null;
    return data;
  }

  // ============ АКСЕССУАРЫ ПОДОКОННИКОВ ============
  static async getWindowsillAccessories(forceRefresh = false): Promise<WindowsillAccessory[]> {
    if (!forceRefresh && cache.windowsillAccessories && isCacheValid("windowsillAccessories")) {
      return cache.windowsillAccessories;
    }

    const { data, error } = await supabase
      .from("windowsill_accessories")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching windowsill accessories:", error);
      throw error;
    }

    cache.windowsillAccessories = data || [];
    updateCacheTime("windowsillAccessories");
    return cache.windowsillAccessories;
  }

  static async updateWindowsillAccessory(id: number, updates: Partial<WindowsillAccessory>): Promise<WindowsillAccessory> {
    const { data, error } = await supabase
      .from("windowsill_accessories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating windowsill accessory:", error);
      throw error;
    }

    cache.windowsillAccessories = null;
    return data;
  }

  // ============ РАСКЛАДКИ (ШПРОСЫ) ============
  static async getMuntins(forceRefresh = false): Promise<Muntin[]> {
    if (!forceRefresh && cache.muntins && isCacheValid("muntins")) {
      return cache.muntins;
    }

    const { data, error } = await supabase
      .from("muntins")
      .select("*")
      .order("width", { ascending: true });

    if (error) {
      console.error("Error fetching muntins:", error);
      throw error;
    }

    cache.muntins = data || [];
    updateCacheTime("muntins");
    return cache.muntins;
  }

  static async updateMuntin(id: number, updates: Partial<Muntin>): Promise<Muntin> {
    const { data, error } = await supabase
      .from("muntins")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating muntin:", error);
      throw error;
    }

    cache.muntins = null;
    return data;
  }

  // ============ МОСКИТНЫЕ СЕТКИ ============
  static async getMosquitoNetPrices(forceRefresh = false): Promise<MosquitoNetPrice[]> {
    if (!forceRefresh && cache.mosquitoNetPrices && isCacheValid("mosquitoNetPrices")) {
      return cache.mosquitoNetPrices;
    }

    const { data, error } = await supabase
      .from("mosquito_net_prices")
      .select("*")
      .order("component", { ascending: true });

    if (error) {
      console.error("Error fetching mosquito net prices:", error);
      throw error;
    }

    cache.mosquitoNetPrices = data || [];
    updateCacheTime("mosquitoNetPrices");
    return cache.mosquitoNetPrices;
  }

  static async updateMosquitoNetPrice(id: number, updates: Partial<MosquitoNetPrice>): Promise<MosquitoNetPrice> {
    const { data, error } = await supabase
      .from("mosquito_net_prices")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating mosquito net price:", error);
      throw error;
    }

    cache.mosquitoNetPrices = null;
    return data;
  }

  // ============ АРМИРОВАНИЕ ============
  static async getReinforcementPrices(forceRefresh = false): Promise<ReinforcementPrice[]> {
    if (!forceRefresh && cache.reinforcementPrices && isCacheValid("reinforcementPrices")) {
      return cache.reinforcementPrices;
    }

    const { data, error } = await supabase
      .from("reinforcement_prices")
      .select("*")
      .order("profile_type", { ascending: true })
      .order("thickness", { ascending: true });

    if (error) {
      console.error("Error fetching reinforcement prices:", error);
      throw error;
    }

    cache.reinforcementPrices = data || [];
    updateCacheTime("reinforcementPrices");
    return cache.reinforcementPrices;
  }

  static async updateReinforcementPrice(id: number, updates: Partial<ReinforcementPrice>): Promise<ReinforcementPrice> {
    const { data, error } = await supabase
      .from("reinforcement_prices")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating reinforcement price:", error);
      throw error;
    }

    cache.reinforcementPrices = null;
    return data;
  }

  // ============ ДОПОЛНИТЕЛЬНЫЕ ОПЦИИ ============
  static async getExtras(forceRefresh = false): Promise<Extra[]> {
    if (!forceRefresh && cache.extras && isCacheValid("extras")) {
      return cache.extras;
    }

    const { data, error } = await supabase
      .from("extras")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching extras:", error);
      throw error;
    }

    cache.extras = data || [];
    updateCacheTime("extras");
    return cache.extras;
  }

  static async updateExtra(id: number, updates: Partial<Extra>): Promise<Extra> {
    const { data, error } = await supabase
      .from("extras")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating extra:", error);
      throw error;
    }

    cache.extras = null;
    return data;
  }

  // ============ УТИЛИТЫ ============
  
  // Очистить весь кэш
  static clearCache(): void {
    cache.profiles = null;
    cache.glassPackages = null;
    cache.glassTypes = null;
    cache.furnitureSystems = null;
    cache.furnitureItems = null;
    cache.handles = null;
    cache.windowsills = null;
    cache.windowsillAccessories = null;
    cache.muntins = null;
    cache.mosquitoNetPrices = null;
    cache.reinforcementPrices = null;
    cache.extras = null;
    cache.lastUpdated = {};
  }

  // Очистить кэш для конкретной категории
  static clearCacheFor(key: keyof Omit<PriceCache, "lastUpdated">): void {
    cache[key] = null;
    delete cache.lastUpdated[key];
  }

  // Загрузить все данные для прайс-листа
  static async loadAllPriceData(forceRefresh = false): Promise<{
    profiles: Profile[];
    glassPackages: GlassPackage[];
    glassTypes: GlassType[];
    furnitureSystems: FurnitureSystem[];
    furnitureItems: FurnitureItem[];
    handles: Handle[];
    windowsills: Windowsill[];
    windowsillAccessories: WindowsillAccessory[];
    muntins: Muntin[];
    mosquitoNetPrices: MosquitoNetPrice[];
    reinforcementPrices: ReinforcementPrice[];
    extras: Extra[];
  }> {
    const [
      profiles,
      glassPackages,
      glassTypes,
      furnitureSystems,
      furnitureItems,
      handles,
      windowsills,
      windowsillAccessories,
      muntins,
      mosquitoNetPrices,
      reinforcementPrices,
      extras,
    ] = await Promise.all([
      this.getProfiles(forceRefresh),
      this.getGlassPackages(forceRefresh),
      this.getGlassTypes(forceRefresh),
      this.getFurnitureSystems(forceRefresh),
      this.getFurnitureItems(forceRefresh),
      this.getHandles(forceRefresh),
      this.getWindowsills(forceRefresh),
      this.getWindowsillAccessories(forceRefresh),
      this.getMuntins(forceRefresh),
      this.getMosquitoNetPrices(forceRefresh),
      this.getReinforcementPrices(forceRefresh),
      this.getExtras(forceRefresh),
    ]);

    return {
      profiles,
      glassPackages,
      glassTypes,
      furnitureSystems,
      furnitureItems,
      handles,
      windowsills,
      windowsillAccessories,
      muntins,
      mosquitoNetPrices,
      reinforcementPrices,
      extras,
    };
  }
}

export default PriceService;
