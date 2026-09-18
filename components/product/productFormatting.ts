export function formatPrice(price: number | string): string {
  const numericPrice = typeof price === "string" ? Number.parseFloat(price) : price;

  if (Number.isNaN(numericPrice)) return "0,00";

  return numericPrice.toLocaleString("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function parsePrice(formattedPrice: string): number {
  return Number.parseFloat(formattedPrice.replace(/\./g, "").replace(",", "."));
}

export function formatModeloToUpperCase(modelo: string): string {
  return modelo.toUpperCase().trim();
}

export function formatPrecioLocal(precio: number): string {
  return precio.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function getShortCategoryName(categoryName: string): string {
  const normalizedName = categoryName.toLowerCase();
  if (
    normalizedName.includes("electrodomésticos de cocina") ||
    normalizedName.includes("electrodomesticos de cocina")
  ) {
    return "Electrodomésticos";
  }

  const words = categoryName.split(" ");
  return words.length > 2 ? words.slice(0, 2).join(" ") : categoryName;
}
