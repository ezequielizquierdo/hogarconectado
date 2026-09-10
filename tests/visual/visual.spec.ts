import { expect, Page, test } from '@playwright/test';

const admin = {
  _id: 'visual-admin',
  googleId: 'visual-google',
  email: 'admin@hogarconectado.test',
  nombre: 'Administración Hogar Conectado',
  rol: 'admin',
  estado: 'activo',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const seller = {
  ...admin,
  _id: 'visual-seller',
  googleId: 'visual-seller-google',
  email: 'vendedor@hogarconectado.test',
  nombre: 'Vendedor de muestra',
  rol: 'vendedor',
  codigoVendedor: 'VENDEMO',
};

const category = {
  _id: 'visual-category',
  nombre: 'Heladeras',
  activo: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const product = {
  _id: 'visual-product',
  categoria: category,
  marca: 'Electrolux',
  modelo: 'IM7S 523L',
  descripcion: 'No Frost Inverter Multidoor',
  stock: { cantidad: 2, disponible: true },
  precioConGanancia: 1917500,
  imagenes: [],
  precios: {
    contado: 1917500,
    factura: { costoBase: 1575000, unPago: 2047500 },
    tresCuotas: { total: 2109250, cuota: 703083 },
    seisCuotas: { total: 2301000, cuota: 383500 },
  },
};

const quote = {
  _id: 'visual-quote',
  datosContacto: { nombre: 'Cliente de muestra', telefono: '+5491100000000' },
  productos: [{ producto: product, cantidad: 1, detalles: { ...product, precioBase: 1500000, precios: product.precios } }],
  modalidadPago: 'contado',
  totales: { subtotal: 1917500, total: 1917500 },
  estado: 'pendiente',
  createdAt: '2026-08-31T12:00:00.000Z',
  updatedAt: '2026-08-31T12:00:00.000Z',
};

const sellerQuote = {
  ...quote,
  _id: 'visual-seller-quote',
  datosContacto: { nombre: 'Comprador de muestra', telefono: '+5491100000000' },
  productos: [{
    producto: product,
    cantidad: 1,
    detalles: {
      categoria: category.nombre,
      marca: product.marca,
      modelo: product.modelo,
      precios: { contado: 430000 },
    },
  }],
  totales: { subtotal: 430000, total: 430000 },
  estado: 'confirmada',
  confirmadaPor: { _id: seller._id, nombre: seller.nombre, email: seller.email },
  confirmadaAt: '2026-09-03T18:00:00.000Z',
  resumenConfirmacion: {
    totalVendido: 430000,
    dineroARendir: 400500,
    gananciaVendedor: 29500,
  },
  venta: {
    compradorNombre: 'Comprador de muestra',
    entregaAcordada: 'Retiro coordinado en el local',
    agregarEnvio: false,
    costoEnvio: 0,
    estadoPago: 'pendiente',
    estadoEntrega: 'coordinada',
  },
};

const publicQuote = {
  id: 'visual-public-quote',
  cliente: 'Cliente de muestra',
  vendedor: 'Hogar Conectado',
  productos: [{ marca: 'Electrolux', modelo: 'IM7S 523L', cantidad: 1, precioUnitario: 1917500, subtotal: 1917500 }],
  modalidadPago: 'contado',
  total: 1917500,
  observaciones: 'Entrega a coordinar con el vendedor.',
  aceptada: false,
  pedido: null,
  enlaceVenceAt: '2026-12-31T23:59:59.000Z',
};

async function mockApi(page: Page, authenticated = false, currentUser = admin, currentQuote: any = quote) {
  if (authenticated) {
    await page.addInitScript(() => localStorage.setItem('auth_token', 'visual-token'));
  } else {
    await page.addInitScript(() => localStorage.removeItem('auth_token'));
  }

  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    let body: unknown = { success: true, data: [] };

    if (path.endsWith('/auth/me')) body = { success: true, data: currentUser };
    else if (path.endsWith('/cotizaciones-publicas/visual-token')) body = { success: true, data: publicQuote };
    else if (path.endsWith('/categorias')) body = { success: true, data: [category] };
    else if (path.includes('/productos')) body = { success: true, data: [product], pagination: { total: 1, pagina: 1, limite: 20, paginas: 1 } };
    else if (path.endsWith('/cotizaciones/estadisticas/resumen')) body = { success: true, data: currentUser.rol === 'vendedor'
      ? { total: 1, pendientes: 0, totalGeneral: 430000, liquidacion: { totalVendido: 430000, dineroARendir: 400500, gananciaVendedor: 29500 } }
      : { total: 1, pendientes: 1, totalGeneral: 1917500 } };
    else if (path.endsWith(`/cotizaciones/${currentQuote._id}`)) body = { success: true, data: currentQuote };
    else if (path.includes('/cotizaciones')) body = { success: true, data: [currentQuote], pagination: { total: 1, pagina: 1, limite: 20, paginas: 1 } };
    else if (path.endsWith('/usuarios')) body = { success: true, data: [admin] };
    else if (path.endsWith('/consultas/resumen')) body = { success: true, data: { nuevas: 0, totalAbiertas: 0 } };
    else if (path.includes('/consultas')) body = { success: true, data: [] };

    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) });
  });
}

async function settle(page: Page) {
  await page.waitForLoadState('domcontentloaded');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
}

test('login', async ({ page }) => {
  await mockApi(page);
  await page.goto('/login');
  await settle(page);
  await expect(page).toHaveScreenshot('login.png', { fullPage: true, mask: [page.locator('iframe')] });
});

test('catálogo público', async ({ page }) => {
  await mockApi(page);
  await page.goto('/productos');
  await settle(page);
  if ((page.viewportSize()?.width ?? 0) >= 1024) await expect(page.getByText('CATÁLOGO', { exact: true })).toBeVisible();
  else await expect(page.getByText('Productos', { exact: true }).first()).toBeVisible();
  await expect(page).toHaveScreenshot('productos-publicos.png', { fullPage: true });
});

test('selección para consulta', async ({ page }) => {
  await mockApi(page);
  await page.goto('/productos');
  await settle(page);
  await page.getByText('¡Lo quiero!').click();
  await expect(page.getByText('1 producto elegido')).toBeVisible();
  await page.getByText('Consultar lista').click();
  await expect(page.getByText('Tus productos (1)')).toBeVisible();
  await expect(page).toHaveScreenshot('consulta-productos.png', { fullPage: true });
});

test('cotización pública', async ({ page }) => {
  await mockApi(page);
  await page.goto('/cotizacion?token=visual-token');
  await settle(page);
  await expect(page.getByText('Hola, Cliente de muestra')).toBeVisible();
  await expect(page).toHaveScreenshot('cotizacion-publica.png', { fullPage: true });
});

test('alta manual de producto', async ({ page }) => {
  await mockApi(page, true);
  await page.goto('/productos');
  await settle(page);
  if ((page.viewportSize()?.width ?? 0) >= 1024) await page.getByText('Agregar producto', { exact: true }).click();
  else await page.getByText('Agregar', { exact: true }).click();
  await expect(page.getByText('Nuevo Producto')).toBeVisible();
  await expect(page).toHaveScreenshot('alta-producto.png', { fullPage: true });
});

test('alta asistida de producto', async ({ page }) => {
  await mockApi(page, true);
  await page.goto('/productos');
  await settle(page);
  if ((page.viewportSize()?.width ?? 0) >= 1024) await page.getByText('Crear productos desde imágenes').click();
  else await page.getByText('Crear desde imágenes').click();
  await expect(page.getByText('Crear desde imágenes', { exact: true }).last()).toBeVisible();
  await expect(page).toHaveScreenshot('alta-asistida-producto.png', { fullPage: true });
});

test('armado de cotización', async ({ page }) => {
  await mockApi(page, true);
  await page.goto('/productos');
  await settle(page);
  await page.getByText('+ Cotizar', { exact: true }).click();
  await page.getByText('Ver selección', { exact: true }).click();
  await page.getByText('Preparar cotización', { exact: true }).click();
  await expect(page.getByText('Prepará la propuesta')).toBeVisible();
  await expect(page).toHaveScreenshot('armado-cotizacion.png', { fullPage: true });
});

test('filtros de productos en móvil', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'El panel lateral cumple esta función en escritorio.');
  await mockApi(page, true);
  await page.goto('/productos');
  await settle(page);
  await page.getByText('Filtrar', { exact: true }).click();
  await expect(page.getByText('Filtrar productos', { exact: true })).toBeVisible();
  await expect(page).toHaveScreenshot('filtros-productos.png', { fullPage: true });
});

test('detalle y confirmación de una cotización', async ({ page }) => {
  await mockApi(page, true);
  await page.goto('/');
  await settle(page);
  await page.getByText('Ver detalle', { exact: true }).click();
  await expect(page.getByText('COTIZACIÓN GUARDADA', { exact: true })).toBeVisible();
  await expect(page).toHaveScreenshot('detalle-cotizacion.png', { fullPage: true });
  await page.getByText('Venta confirmada', { exact: true }).click();
  await expect(page.getByText('Confirmar venta', { exact: true }).first()).toBeVisible();
  await expect(page).toHaveScreenshot('confirmar-venta.png', { fullPage: true });
});

test('catálogo del vendedor', async ({ page }) => {
  await mockApi(page, true, seller);
  await page.goto('/productos');
  await settle(page);
  await expect(page.getByText('+ Cotizar', { exact: true })).toBeVisible();
  await expect(page.getByText('Agregar producto', { exact: true })).toHaveCount(0);
  await expect(page).toHaveScreenshot('productos-vendedor.png', { fullPage: true });
});

test('negocio y liquidación del vendedor', async ({ page }) => {
  await mockApi(page, true, seller, sellerQuote);
  await page.goto('/');
  await settle(page);
  await expect(page.getByText('Mi negocio', { exact: true })).toBeVisible();
  await expect(page.getByText('Tu ganancia confirmada', { exact: true })).toBeVisible();
  await expect(page.getByText('$ 29.500', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('$ 400.500', { exact: true }).first()).toBeVisible();
  await expect(page).toHaveScreenshot('negocio-vendedor.png', { fullPage: true });
});

test('supervisión administrativa de una venta', async ({ page }) => {
  await mockApi(page, true, admin, sellerQuote);
  await page.goto('/');
  await settle(page);
  await page.getByText('Ver detalle', { exact: true }).click();
  await expect(page.getByText('Confirmó Vendedor de muestra', { exact: true }).last()).toBeVisible();
  await expect(page.getByText('Confirmación de pago', { exact: true })).toBeVisible();
  await expect(page.getByText('Entrega del producto', { exact: true })).toBeVisible();
  await expect(page).toHaveScreenshot('supervision-venta-admin.png', { fullPage: true });
});

for (const surface of [
  { name: 'calculadora', path: '/calculadora', ready: 'Calculadora' },
  { name: 'cotizaciones', path: '/', ready: 'Operación comercial' },
  { name: 'usuarios', path: '/usuarios', ready: 'Usuarios' },
  { name: 'perfil', path: '/perfil', ready: 'Perfil' },
  { name: 'consultas', path: '/consultas', ready: 'Consultas' },
]) {
  test(surface.name, async ({ page }) => {
    await mockApi(page, true);
    await page.goto(surface.path);
    await settle(page);
    await expect(page.getByText(surface.ready, { exact: true }).first()).toBeVisible();
    await expect(page).toHaveScreenshot(`${surface.name}.png`, { fullPage: true });
  });
}
