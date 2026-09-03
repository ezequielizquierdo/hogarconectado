import { describe, expect, it } from "vitest";

import {
  getQuoteItemSubtotal,
  getQuoteItemUnitPrice,
  getQuoteProductName,
  quoteToDraftItems,
} from "./quoteHistory";

const item = {
  producto: "product-id",
  cantidad: 2,
  detalles: {
    categoria: "Audio",
    marca: "Crown",
    modelo: "DJS-1002BT",
    precioBase: 250000,
    precios: {
      contado: 325000,
      factura: { costoBase: 262500, unPago: 341250 },
      tresCuotas: { total: 360000, cuota: 120000 },
      seisCuotas: { total: 390000, cuota: 65000 },
    },
  },
};

describe("quoteHistory", () => {
  it("usa el snapshot comercial para mostrar el producto", () => {
    expect(getQuoteProductName(item)).toBe("Crown DJS-1002BT");
  });

  it("elige el precio de la modalidad guardada", () => {
    expect(getQuoteItemUnitPrice(item, "contado")).toBe(325000);
    expect(getQuoteItemUnitPrice(item, "facturado")).toBe(341250);
    expect(getQuoteItemUnitPrice(item, "3-cuotas")).toBe(360000);
    expect(getQuoteItemUnitPrice(item, "6-cuotas")).toBe(390000);
  });

  it("calcula el subtotal usando cantidad y snapshot", () => {
    expect(getQuoteItemSubtotal(item, "contado")).toBe(650000);
  });

  it("reconstruye una selección nueva desde el snapshot sin alterar precios", () => {
    const draft = quoteToDraftItems({
      _id: "quote-id",
      datosContacto: { nombre: "Cliente", telefono: "1166666666" },
      productos: [item],
      modalidadPago: "contado",
      totales: { subtotal: 650000, total: 650000 },
      estado: "enviada",
      createdAt: "2026-09-01T10:00:00.000Z",
      updatedAt: "2026-09-01T10:00:00.000Z",
    });

    expect(draft).toHaveLength(1);
    expect(draft[0].producto._id).toBe("product-id");
    expect(draft[0].cantidad).toBe(2);
    expect(draft[0].producto.precios.contado).toBe(325000);
  });
});
