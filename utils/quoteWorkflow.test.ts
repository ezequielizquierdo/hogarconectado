import { describe, expect, it } from "vitest";

import type { Cotizacion } from "@/services/types";
import { getQuoteNextStep } from "./quoteWorkflow";

const quote = (overrides: Partial<Cotizacion> = {}) => ({
  _id: "quote-1",
  datosContacto: { nombre: "Cliente", telefono: "1123456789" },
  productos: [],
  modalidadPago: "contado",
  totales: { subtotal: 100, total: 100 },
  estado: "enviada",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
} satisfies Cotizacion);

describe("quoteWorkflow", () => {
  it("prioriza el aviso de pago para el administrador", () => {
    const result = getQuoteNextStep(quote({
      aceptacionCliente: { pedido: {
        _id: "order-1", estado: "pago-informado",
        reservadoAt: new Date().toISOString(), reservaVenceAt: new Date().toISOString(),
      } },
    }), true);
    expect(result.title).toBe("Verificar pago");
  });

  it("explica al vendedor que el pago está en revisión", () => {
    const result = getQuoteNextStep(quote({
      aceptacionCliente: { pedido: {
        _id: "order-1", estado: "pago-informado",
        reservadoAt: new Date().toISOString(), reservaVenceAt: new Date().toISOString(),
      } },
    }), false);
    expect(result.title).toBe("Pago en verificación");
  });

  it("lleva una venta pagada hacia la coordinación de entrega", () => {
    const result = getQuoteNextStep(quote({
      estado: "confirmada",
      venta: {
        compradorNombre: "Cliente", entregaAcordada: "A coordinar",
        agregarEnvio: false, costoEnvio: 0, estadoPago: "confirmado", estadoEntrega: "pendiente",
      },
    }), true);
    expect(result.title).toBe("Coordinar entrega");
  });
});
