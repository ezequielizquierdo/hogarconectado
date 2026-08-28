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
  const padding = '='.repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const bytes = Uint8Array.from(window.atob(base64), character => character.charCodeAt(0));
  return bytes.buffer;
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
  let subscription = await registration.pushManager.getSubscription();
  subscription ||= await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey(data.data.publicKey),
  });

  const serialized = subscription.toJSON();
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
