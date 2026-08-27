import { describe, expect, it } from "vitest";
import {
  calculateContainedImageRect,
  calculateInstagramStoryLayout,
  INSTAGRAM_STORY_SAFE_AREA,
  INSTAGRAM_STORY_SIZE,
} from "./instagramStoryLayout";

describe("instagramStoryLayout", () => {
  it("conserva el lienzo 1080 × 1920 y los márgenes seguros", () => {
    const layout = calculateInstagramStoryLayout({ precio: "1.917.500" });

    expect(INSTAGRAM_STORY_SIZE).toEqual({ width: 1080, height: 1920 });
    expect(layout.image.x).toBe(INSTAGRAM_STORY_SAFE_AREA.horizontal);
    expect(layout.image.y).toBe(INSTAGRAM_STORY_SAFE_AREA.top);
    expect(layout.contentWidth).toBe(888);
    expect(layout.panel?.x).toBe(INSTAGRAM_STORY_SAFE_AREA.horizontal);
    expect(
      INSTAGRAM_STORY_SIZE.width -
        ((layout.panel?.x ?? 0) + (layout.panel?.width ?? 0))
    ).toBe(INSTAGRAM_STORY_SAFE_AREA.horizontal);
  });

  it("da más protagonismo a la imagen cuando se quitan datos", () => {
    const complete = calculateInstagramStoryLayout({
      categoria: "Heladeras",
      modelo: "IM7S523L",
      marca: "Electrolux",
      precio: "1.917.500",
      stock: "Stock: 1",
      descripcion: "Heladera no frost inverter multidoor",
    });
    const priceOnly = calculateInstagramStoryLayout({ precio: "1.917.500" });
    const imageOnly = calculateInstagramStoryLayout({});

    expect(priceOnly.image.height).toBeGreaterThan(complete.image.height);
    expect(imageOnly.image.height).toBeGreaterThan(priceOnly.image.height);
    expect(imageOnly.panel).toBeNull();
  });

  it("reserva el margen inferior incluso con consulta de precio", () => {
    const layout = calculateInstagramStoryLayout({
      precio: "1.917.500",
      consultaPrecio: "Consultá por el mejor precio",
    });
    const consultation = layout.consultation;

    expect(consultation).not.toBeNull();
    expect(
      INSTAGRAM_STORY_SIZE.height -
        ((consultation?.y ?? 0) + (consultation?.height ?? 0))
    ).toBe(INSTAGRAM_STORY_SAFE_AREA.bottom);
  });

  it("mantiene la proporción de imágenes verticales y horizontales", () => {
    const bounds = { x: 32, y: 32, width: 824, height: 1200 };
    const vertical = calculateContainedImageRect(800, 1600, bounds);
    const horizontal = calculateContainedImageRect(1600, 800, bounds);

    expect(vertical.width / vertical.height).toBeCloseTo(0.5);
    expect(horizontal.width / horizontal.height).toBeCloseTo(2);
    expect(vertical.width).toBeLessThanOrEqual(bounds.width);
    expect(vertical.height).toBeLessThanOrEqual(bounds.height);
    expect(horizontal.width).toBeLessThanOrEqual(bounds.width);
    expect(horizontal.height).toBeLessThanOrEqual(bounds.height);
  });
});
