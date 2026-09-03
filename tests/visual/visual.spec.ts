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

async function mockApi(page: Page, authenticated = false) {
  if (authenticated) {
    await page.addInitScript(() => localStorage.setItem('auth_token', 'visual-token'));
  } else {
    await page.addInitScript(() => localStorage.removeItem('auth_token'));
  }

  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    let body: unknown = { success: true, data: [] };

    if (path.endsWith('/auth/me')) body = { success: true, data: admin };
    else if (path.endsWith('/categorias')) body = { success: true, data: [category] };
    else if (path.includes('/productos')) body = { success: true, data: [product], pagination: { total: 1, pagina: 1, limite: 20, paginas: 1 } };
    else if (path.endsWith('/cotizaciones/estadisticas/resumen')) body = { success: true, data: { total: 1, pendientes: 1, totalGeneral: 1917500 } };
    else if (path.includes('/cotizaciones')) body = { success: true, data: [quote], pagination: { total: 1, pagina: 1, limite: 20, paginas: 1 } };
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
  await expect(page.getByText('Productos', { exact: true }).first()).toBeVisible();
  await expect(page).toHaveScreenshot('productos-publicos.png', { fullPage: true });
});

for (const surface of [
  { name: 'calculadora', path: '/calculadora', ready: 'Calculadora' },
  { name: 'cotizaciones', path: '/', ready: 'Cotizaciones' },
  { name: 'usuarios', path: '/usuarios', ready: 'Usuarios' },
  { name: 'perfil', path: '/perfil', ready: 'Perfil' },
]) {
  test(surface.name, async ({ page }) => {
    await mockApi(page, true);
    await page.goto(surface.path);
    await settle(page);
    await expect(page.getByText(surface.ready, { exact: true }).first()).toBeVisible();
    await expect(page).toHaveScreenshot(`${surface.name}.png`, { fullPage: true });
  });
}
