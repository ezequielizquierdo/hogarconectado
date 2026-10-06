import AsyncStorage from "@react-native-async-storage/async-storage";

import { buildProductQueryParams } from "./productQueryParams";
import type { Producto, ProductoFiltros } from "./types";

const CACHE_PREFIX = "hc_public_catalog_v1";
const DEFAULT_MAX_AGE_MS = 6 * 60 * 60 * 1000;

interface CachedCatalogPage {
  savedAt: number;
  productos: Producto[];
  pagination?: unknown;
}

function buildCacheKey(filtros: ProductoFiltros): string {
  const params = buildProductQueryParams(filtros);
  params.sort();
  return `${CACHE_PREFIX}:${params.toString() || "default"}`;
}

export async function readProductCatalogCache(
  filtros: ProductoFiltros,
  maxAgeMs = DEFAULT_MAX_AGE_MS
): Promise<Omit<CachedCatalogPage, "savedAt"> | null> {
  try {
    const raw = await AsyncStorage.getItem(buildCacheKey(filtros));
    if (!raw) return null;

    const cached = JSON.parse(raw) as CachedCatalogPage;
    if (
      !Number.isFinite(cached.savedAt) ||
      Date.now() - cached.savedAt > maxAgeMs ||
      !Array.isArray(cached.productos)
    ) {
      return null;
    }

    return { productos: cached.productos, pagination: cached.pagination };
  } catch {
    return null;
  }
}

export async function writeProductCatalogCache(
  filtros: ProductoFiltros,
  productos: Producto[],
  pagination?: unknown
): Promise<void> {
  try {
    const payload: CachedCatalogPage = {
      savedAt: Date.now(),
      productos,
      pagination,
    };
    await AsyncStorage.setItem(buildCacheKey(filtros), JSON.stringify(payload));
  } catch {
    // El caché mejora la experiencia, pero nunca debe impedir mostrar el catálogo.
  }
}
