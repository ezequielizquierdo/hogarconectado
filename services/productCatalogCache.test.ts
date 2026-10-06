import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = vi.hoisted(() => new Map<string, string>());

vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn(async (key: string) => storage.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      storage.set(key, value);
    }),
  },
}));

import {
  readProductCatalogCache,
  writeProductCatalogCache,
} from "./productCatalogCache";

const product = {
  _id: "product-1",
  categoria: "category-1",
  marca: "Marca",
  modelo: "Modelo",
  stock: { cantidad: 1, disponible: true },
  imagenes: ["https://example.com/product.jpg"],
};

describe("productCatalogCache", () => {
  beforeEach(() => storage.clear());

  it("recupera la página pública guardada para los mismos filtros", async () => {
    await writeProductCatalogCache({ limite: 20 }, [product], { total: 1 });

    await expect(readProductCatalogCache({ limite: 20 })).resolves.toEqual({
      productos: [product],
      pagination: { total: 1 },
    });
  });

  it("no mezcla resultados de filtros diferentes", async () => {
    await writeProductCatalogCache({ limite: 20, categoria: "category-1" }, [product]);

    await expect(
      readProductCatalogCache({ limite: 20, categoria: "category-2" })
    ).resolves.toBeNull();
  });
});
