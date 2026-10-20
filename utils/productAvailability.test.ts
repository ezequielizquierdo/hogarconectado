import { describe, expect, it } from "vitest";

import { hasAvailableStock } from "./productAvailability";

describe("disponibilidad de producto", () => {
  it("requiere disponibilidad y cantidad positiva cuando el stock incluye cantidad", () => {
    expect(hasAvailableStock({ disponible: true, cantidad: 2 })).toBe(true);
    expect(hasAvailableStock({ disponible: true, cantidad: 0 })).toBe(false);
    expect(hasAvailableStock({ disponible: true, cantidad: -1 })).toBe(false);
    expect(hasAvailableStock({ disponible: false, cantidad: 4 })).toBe(false);
  });

  it("respeta la disponibilidad sanitizada cuando la API pública oculta la cantidad", () => {
    expect(hasAvailableStock({ disponible: true })).toBe(true);
    expect(hasAvailableStock({ disponible: false })).toBe(false);
  });
});
