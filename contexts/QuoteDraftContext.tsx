import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/contexts/AuthContext";
import type { ProductoConPrecios } from "@/services/types";
import {
  addProductToDraft,
  getDraftCashTotal,
  getDraftProductCount,
  getDraftUnitCount,
  getQuoteDraftStorageKey,
  type QuoteDraftItem,
  removeProductFromDraft,
  updateDraftQuantity,
} from "@/utils/quoteDraft";

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
  const { state: authState, user } = useAuth();
  const [items, setItems] = useState<QuoteDraftItem[]>([]);
  const [hydratedStorageKey, setHydratedStorageKey] = useState<string | null>(null);
  const storageKey = useMemo(
    () => getQuoteDraftStorageKey(user?._id),
    [user?._id]
  );

  useEffect(() => {
    if (authState === "loading") return;

    let active = true;
    setHydratedStorageKey(null);
    setItems([]);

    const restore = async () => {
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        if (!active) return;
        if (!stored) {
          setItems([]);
          return;
        }
        const parsed = JSON.parse(stored) as QuoteDraftItem[];
        setItems(Array.isArray(parsed) ? parsed : []);
      } catch {
        if (active) setItems([]);
      } finally {
        if (active) setHydratedStorageKey(storageKey);
      }
    };

    void restore();
    return () => {
      active = false;
    };
  }, [authState, storageKey]);

  const hydrated = hydratedStorageKey === storageKey;

  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem(storageKey, JSON.stringify(items));
  }, [hydrated, items, storageKey]);

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
