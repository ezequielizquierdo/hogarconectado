import type { ProductoConPrecios } from "@/services/types";

export interface QuoteDraftItem {
  producto: ProductoConPrecios;
  cantidad: number;
  porcentajeAplicado: number;
}

export type QuotePaymentMode = "contado" | "3-cuotas" | "6-cuotas";

export const getProductPercentage = (producto: ProductoConPrecios) =>
  producto.porcentajeGananciaAplicado ?? producto.porcentajeGanancia ?? 10;

export function addProductToDraft(
  items: QuoteDraftItem[],
  producto: ProductoConPrecios
): QuoteDraftItem[] {
  if (items.some((item) => item.producto._id === producto._id)) return items;

  return [
    ...items,
    {
      producto,
      cantidad: 1,
      porcentajeAplicado: getProductPercentage(producto),
    },
  ];
}

export function removeProductFromDraft(
  items: QuoteDraftItem[],
  productoId: string
) {
  return items.filter((item) => item.producto._id !== productoId);
}

export function updateDraftQuantity(
  items: QuoteDraftItem[],
  productoId: string,
  cantidad: number
) {
  const normalizedQuantity = Math.max(1, Math.trunc(cantidad));
  return items.map((item) =>
    item.producto._id === productoId
      ? { ...item, cantidad: normalizedQuantity }
      : item
  );
}

export const getDraftProductCount = (items: QuoteDraftItem[]) => items.length;

export const getDraftUnitCount = (items: QuoteDraftItem[]) =>
  items.reduce((total, item) => total + item.cantidad, 0);

export const getDraftCashTotal = (items: QuoteDraftItem[]) =>
  items.reduce(
    (total, item) => total + item.producto.precios.contado * item.cantidad,
    0
  );

export const getDraftUnitPrice = (
  item: QuoteDraftItem,
  modalidad: QuotePaymentMode
) => {
  if (modalidad === "3-cuotas") return item.producto.precios.tresCuotas.total;
  if (modalidad === "6-cuotas") return item.producto.precios.seisCuotas.total;
  return item.producto.precios.contado;
};

export const getDraftItemSubtotal = (
  item: QuoteDraftItem,
  modalidad: QuotePaymentMode
) => getDraftUnitPrice(item, modalidad) * item.cantidad;

export const getDraftTotal = (
  items: QuoteDraftItem[],
  modalidad: QuotePaymentMode
) =>
  items.reduce(
    (total, item) => total + getDraftItemSubtotal(item, modalidad),
    0
  );
