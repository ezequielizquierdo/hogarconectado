export interface ProductoForm {
  marca: string;
  modelo: string;
  descripcion: string;
  categoria: string;
  precioBase: string;
  porcentajeGanancia: string;
  descuentoActivo: string;
  descuentoPorcentaje: string;
  descuentoHasta: string;
  tipoComercializacion: "stock-propio" | "producto-tercero" | "venta-catalogo";
  catalogoNombre: string;
  catalogoCampania: string;
  catalogoVigenciaHasta: string;
  catalogoPlazoEntrega: string;
  stockCantidad: string;
  stockDisponible: string;
  imagen: string;
  imagenPublicId: string;
}

export const initialProductForm: ProductoForm = {
  marca: "",
  modelo: "",
  descripcion: "",
  categoria: "",
  precioBase: "",
  porcentajeGanancia: "10",
  descuentoActivo: "false",
  descuentoPorcentaje: "",
  descuentoHasta: "",
  tipoComercializacion: "stock-propio",
  catalogoNombre: "",
  catalogoCampania: "",
  catalogoVigenciaHasta: "",
  catalogoPlazoEntrega: "",
  stockCantidad: "",
  stockDisponible: "true",
  imagen: "",
  imagenPublicId: "",
};
