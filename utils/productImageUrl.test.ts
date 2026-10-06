import { describe, expect, it } from "vitest";

import { getProductImageUrl } from "./productImageUrl";

describe("getProductImageUrl", () => {
  it("solicita a Cloudinary una variante liviana para las tarjetas", () => {
    expect(
      getProductImageUrl(
        "https://res.cloudinary.com/demo/image/upload/v123/productos/heladera.jpg"
      )
    ).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_600,c_limit/v123/productos/heladera.jpg"
    );
  });

  it("respeta un ancho seguro y conserva URLs externas", () => {
    expect(
      getProductImageUrl(
        "https://res.cloudinary.com/demo/image/upload/v123/productos/heladera.jpg",
        { width: 5000 }
      )
    ).toContain("w_1600");
    expect(getProductImageUrl("https://example.com/producto.jpg")).toBe(
      "https://example.com/producto.jpg"
    );
  });
});
