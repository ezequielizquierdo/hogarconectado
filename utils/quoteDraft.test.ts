import { describe, expect, it } from "vitest";

import type { ProductoConPrecios } from "@/services/types";
import {
  addProductToDraft,
  getDraftCashTotal,
  getDraftItemSubtotal,
  getDraftTotal,
  getDraftProductCount,
  getDraftUnitCount,
  removeProductFromDraft,
  updateDraftQuantity,
} from "./quoteDraft";

const product = (id: string, contado: number): ProductoConPrecios => ({
  _id: id,
  categoria: "categoria",
  marca: `Marca ${id}`,
  modelo: `Modelo ${id}`,
  precioBase: contado,
  porcentajeGananciaAplicado: 12,
  stock: { cantidad: 2, disponible: true },
  imagenes: [],
  precios: {
    contado,
    tresCuotas: { total: contado, cuota: contado / 3 },
    seisCuotas: { total: contado, cuota: contado / 6 },
  },
});

describe("quoteDraft", () => {
  it("agrega un producto una sola vez", () => {
    const first = addProductToDraft([], product("1", 100));
    const repeated = addProductToDraft(first, product("1", 100));

    expect(repeated).toHaveLength(1);
    expect(repeated[0].porcentajeAplicado).toBe(12);
  });

  it("actualiza cantidades sin permitir valores menores a uno", () => {
    const initial = addProductToDraft([], product("1", 100));

    expect(updateDraftQuantity(initial, "1", 3)[0].cantidad).toBe(3);
    expect(updateDraftQuantity(initial, "1", 0)[0].cantidad).toBe(1);
  });

  it("calcula productos, unidades y total contado", () => {
    let items = addProductToDraft([], product("1", 100));
    items = addProductToDraft(items, product("2", 250));
    items = updateDraftQuantity(items, "1", 2);

    expect(getDraftProductCount(items)).toBe(2);
    expect(getDraftUnitCount(items)).toBe(3);
    expect(getDraftCashTotal(items)).toBe(450);
    expect(removeProductFromDraft(items, "1")).toHaveLength(1);
  });

  it("calcula subtotales y total según la modalidad elegida", () => {
    const productA = product("1", 1000);
    productA.precios.tresCuotas.total = 1200;
    productA.precios.seisCuotas.total = 1350;
    const productB = product("2", 500);
    productB.precios.tresCuotas.total = 600;
    productB.precios.seisCuotas.total = 600;
    const items = addProductToDraft(
      addProductToDraft([], productA),
      productB
    );
    const withQuantity = updateDraftQuantity(items, productA._id, 2);

    expect(getDraftItemSubtotal(withQuantity[0], "3-cuotas")).toBe(2400);
    expect(getDraftTotal(withQuantity, "3-cuotas")).toBe(3000);
    expect(getDraftTotal(withQuantity, "6-cuotas")).toBe(3300);
  });
});
