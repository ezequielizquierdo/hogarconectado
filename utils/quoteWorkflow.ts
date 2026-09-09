import type { Cotizacion } from "@/services/types";

export interface QuoteNextStep {
  title: string;
  detail: string;
  tone: "primary" | "warning" | "success" | "neutral";
}

const getOrder = (quote: Cotizacion) =>
  typeof quote.aceptacionCliente?.pedido === "object"
    ? quote.aceptacionCliente.pedido
    : null;

export function getQuoteNextStep(quote: Cotizacion, isAdmin: boolean): QuoteNextStep {
  const order = getOrder(quote);

  if (quote.estado === "cancelada" || order?.estado === "cancelado") {
    return { title: "Operación cancelada", detail: "No requiere acciones.", tone: "neutral" };
  }
  if (order?.estado === "vencido") {
    return { title: "Reserva vencida", detail: "Contactá al cliente si quiere retomarla.", tone: "neutral" };
  }
  if (order?.estado === "pago-informado") {
    return isAdmin
      ? { title: "Verificar pago", detail: "El comprador informó que ya pagó.", tone: "warning" }
      : { title: "Pago en verificación", detail: "Hogar Conectado está revisando el pago.", tone: "warning" };
  }
  if (order?.estado === "reserva-pendiente") {
    return isAdmin
      ? { title: "Esperando pago", detail: "El stock está reservado para este cliente.", tone: "primary" }
      : { title: "Acompañar el pago", detail: "El cliente ya reservó los productos.", tone: "primary" };
  }
  if (quote.estado === "confirmada") {
    if (quote.venta?.estadoEntrega === "entregada") {
      return { title: "Venta completada", detail: "Pago y entrega registrados.", tone: "success" };
    }
    if (quote.venta?.estadoPago !== "confirmado") {
      return isAdmin
        ? { title: "Confirmar el pago", detail: "La venta fue registrada y requiere control.", tone: "warning" }
        : { title: "Pago pendiente de confirmación", detail: "La venta ya fue informada.", tone: "warning" };
    }
    return { title: "Coordinar entrega", detail: "El pago está confirmado.", tone: "success" };
  }
  if (quote.estado === "enviada") {
    return { title: "Esperando al cliente", detail: "Podés enviarle un recordatorio por WhatsApp.", tone: "primary" };
  }
  return { title: "Compartir cotización", detail: "Enviásela al cliente para que pueda reservar.", tone: "primary" };
}
