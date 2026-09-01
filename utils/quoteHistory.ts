import type {
  Cotizacion,
  CotizacionModalidad,
  ProductoCotizacion,
} from "@/services/types";
import type { QuoteDraftItem } from "@/utils/quoteDraft";

export const QUOTE_MODE_LABEL: Record<CotizacionModalidad, string> = {
  contado: "Contado",
  "3-cuotas": "3 cuotas",
  "6-cuotas": "6 cuotas",
};

export function getQuoteItemUnitPrice(
  item: ProductoCotizacion,
  modalidad: CotizacionModalidad
) {
  const prices = item.detalles?.precios;
  if (!prices) return 0;
  if (modalidad === "3-cuotas") return prices.tresCuotas.total;
  if (modalidad === "6-cuotas") return prices.seisCuotas.total;
  return prices.contado;
}

export const getQuoteItemSubtotal = (
  item: ProductoCotizacion,
  modalidad: CotizacionModalidad
) => getQuoteItemUnitPrice(item, modalidad) * item.cantidad;

export function getQuoteProductName(item: ProductoCotizacion) {
  if (item.detalles) {
    return `${item.detalles.marca} ${item.detalles.modelo}`.trim();
  }
  if (typeof item.producto !== "string") {
    return `${item.producto.marca ?? ""} ${item.producto.modelo ?? ""}`.trim();
  }
  return "Producto";
}

export function quoteToDraftItems(quote: Cotizacion): QuoteDraftItem[] {
  return quote.productos.flatMap((item) => {
    if (!item.detalles) return [];
    const productId = typeof item.producto === "string"
      ? item.producto
      : item.producto._id;
    if (!productId) return [];

    return [{
      cantidad: Math.max(1, item.cantidad),
      porcentajeAplicado: item.detalles.porcentajeAplicado ?? 10,
      producto: {
        _id: productId,
        categoria: item.detalles.categoria,
        marca: item.detalles.marca,
        modelo: item.detalles.modelo,
        descripcion: typeof item.producto === "string" ? undefined : item.producto.descripcion,
        precioBase: item.detalles.precioBase,
        porcentajeGananciaAplicado: item.detalles.porcentajeAplicado,
        stock: { cantidad: 0, disponible: false },
        imagenes: [],
        precios: item.detalles.precios,
      },
    }];
  });
}
