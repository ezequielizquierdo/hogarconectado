import apiClient from './apiClient';
import { ApiResponse } from './types';

export interface WebPushState {
  supported: boolean;
  installed: boolean;
  permission: 'default' | 'denied' | 'granted' | 'unsupported';
  subscribed: boolean;
}

export interface WebPushTestResult {
  sent: number;
  failed: number;
  expired: number;
}

function isStandalone() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || navigatorWithStandalone.standalone === true;
}

function isSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

function applicationServerKey(value: string) {
  const normalized = value.trim();
  try {
    const padding = '='.repeat((4 - normalized.length % 4) % 4);
    const base64 = (normalized + padding).replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(window.atob(base64), character => character.charCodeAt(0));
    if (bytes.byteLength !== 65 || bytes[0] !== 4) throw new Error('invalid P-256 key');
    return bytes.buffer;
  } catch {
    throw new Error('La clave pública de notificaciones configurada no es válida. Revisá VAPID_PUBLIC_KEY en Render.');
  }
}

function sameKey(current: ArrayBuffer | null, expected: ArrayBuffer) {
  if (!current) return true;
  const currentBytes = new Uint8Array(current);
  const expectedBytes = new Uint8Array(expected);
  return currentBytes.byteLength === expectedBytes.byteLength
    && currentBytes.every((value, index) => value === expectedBytes[index]);
}

function subscriptionError(error: unknown) {
  const name = error instanceof DOMException ? error.name : '';
  if (name === 'NotAllowedError') {
    return new Error('Chrome bloqueó la suscripción. Revisá que las notificaciones estén permitidas para este sitio.');
  }
  if (name === 'AbortError') {
    return new Error('Chrome no pudo registrar este dispositivo en el servicio Push (AbortError). Reintentá en unos segundos.');
  }
  if (name === 'InvalidAccessError' || name === 'InvalidCharacterError') {
    return new Error('La clave pública VAPID configurada en el servidor no es compatible con el navegador.');
  }
  const detail = error instanceof Error && error.message ? `: ${error.message}` : '';
  return new Error(`Chrome no pudo crear la suscripción${name ? ` (${name})` : ''}${detail}`);
}

async function getState(): Promise<WebPushState> {
  if (!isSupported()) {
    return { supported: false, installed: isStandalone(), permission: 'unsupported', subscribed: false };
  }

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return {
    supported: true,
    installed: isStandalone(),
    permission: Notification.permission,
    subscribed: Boolean(subscription),
  };
}

async function subscribe() {
  if (!isSupported()) throw new Error('Este navegador no admite notificaciones web.');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Necesitamos tu permiso para activar los avisos.');

  const [{ data }, registration] = await Promise.all([
    apiClient.get<ApiResponse<{ publicKey: string }>>('/push/public-key'),
    navigator.serviceWorker.ready,
  ]);
  const expectedKey = applicationServerKey(data.data.publicKey);
  let subscription = await registration.pushManager.getSubscription();
  if (subscription && !sameKey(subscription.options.applicationServerKey, expectedKey)) {
    await subscription.unsubscribe();
    subscription = null;
  }
  if (!subscription) {
    try {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: expectedKey,
      });
    } catch (error) {
      throw subscriptionError(error);
    }
  }

  const serialized = subscription.toJSON();
  if (!serialized.keys?.p256dh || !serialized.keys.auth) {
    await subscription.unsubscribe();
    throw new Error('Chrome creó una suscripción incompleta. Volvé a activar los avisos.');
  }
  await apiClient.post('/push/subscriptions', {
    endpoint: subscription.endpoint,
    keys: serialized.keys,
  });
  return getState();
}

async function unsubscribe() {
  if (!isSupported()) return getState();
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (subscription) {
    await apiClient.delete('/push/subscriptions', { data: { endpoint: subscription.endpoint } });
    await subscription.unsubscribe();
  }
  return getState();
}

async function sendTest(): Promise<WebPushTestResult> {
  const response = await apiClient.post<ApiResponse<WebPushTestResult>>('/push/test');
  return response.data.data;
}

async function showLocalTest() {
  if (!isSupported() || Notification.permission !== 'granted') {
    throw new Error('El navegador no tiene permiso para mostrar notificaciones.');
  }
  const registration = await navigator.serviceWorker.ready;
  await registration.showNotification('Prueba local de Hogar Conectado', {
    body: 'Si ves este aviso, Chrome y macOS pueden mostrar notificaciones.',
    icon: '/pwa-icon.svg',
    tag: `prueba-local-${Date.now()}`,
    data: { url: '/consultas' },
  });
}

export default { getState, subscribe, unsubscribe, sendTest, showLocalTest };
