interface ProductStock {
  disponible: boolean;
  cantidad?: number;
}

export function hasAvailableStock(stock?: ProductStock): boolean {
  if (!stock?.disponible) return false;

  const quantity = Number(stock.cantidad);
  return Number.isFinite(quantity) ? quantity > 0 : true;
}
