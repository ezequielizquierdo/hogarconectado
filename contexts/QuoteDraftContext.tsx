import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { ProductoConPrecios } from "@/services/types";
import {
  addProductToDraft,
  getDraftCashTotal,
  getDraftProductCount,
  getDraftUnitCount,
  type QuoteDraftItem,
  removeProductFromDraft,
  updateDraftQuantity,
} from "@/utils/quoteDraft";

// v2 invalida borradores que guardaban precios de cuotas incompletos.
const STORAGE_KEY = "hogar_conectado_quote_draft_v2";

interface QuoteDraftContextValue {
  items: QuoteDraftItem[];
  hydrated: boolean;
  productCount: number;
  unitCount: number;
  cashTotal: number;
  contains: (productoId: string) => boolean;
  addProduct: (producto: ProductoConPrecios) => void;
  removeProduct: (productoId: string) => void;
  setQuantity: (productoId: string, cantidad: number) => void;
  replaceItems: (items: QuoteDraftItem[]) => void;
  clear: () => void;
}

const QuoteDraftContext = createContext<QuoteDraftContextValue | null>(null);

export function QuoteDraftProvider({ children }: React.PropsWithChildren) {
  const [items, setItems] = useState<QuoteDraftItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    const restore = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!active || !stored) return;
        const parsed = JSON.parse(stored) as QuoteDraftItem[];
        if (Array.isArray(parsed)) setItems(parsed);
      } catch {
        if (active) setItems([]);
      } finally {
        if (active) setHydrated(true);
      }
    };

    void restore();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  const addProduct = useCallback((producto: ProductoConPrecios) => {
    setItems((current) => addProductToDraft(current, producto));
  }, []);

  const removeProduct = useCallback((productoId: string) => {
    setItems((current) => removeProductFromDraft(current, productoId));
  }, []);

  const setQuantity = useCallback((productoId: string, cantidad: number) => {
    setItems((current) => updateDraftQuantity(current, productoId, cantidad));
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const replaceItems = useCallback((nextItems: QuoteDraftItem[]) => setItems(nextItems), []);
  const contains = useCallback(
    (productoId: string) => items.some((item) => item.producto._id === productoId),
    [items]
  );

  const value = useMemo<QuoteDraftContextValue>(
    () => ({
      items,
      hydrated,
      productCount: getDraftProductCount(items),
      unitCount: getDraftUnitCount(items),
      cashTotal: getDraftCashTotal(items),
      contains,
      addProduct,
      removeProduct,
      setQuantity,
      replaceItems,
      clear,
    }),
    [addProduct, clear, contains, hydrated, items, removeProduct, replaceItems, setQuantity]
  );

  return (
    <QuoteDraftContext.Provider value={value}>
      {children}
    </QuoteDraftContext.Provider>
  );
}

export function useQuoteDraft() {
  const context = useContext(QuoteDraftContext);
  if (!context) {
    throw new Error("useQuoteDraft debe utilizarse dentro de QuoteDraftProvider");
  }
  return context;
}
