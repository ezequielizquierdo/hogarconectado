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

const unsupportedState: WebPushState = {
  supported: false,
  installed: false,
  permission: 'unsupported',
  subscribed: false,
};

export default {
  async getState() { return unsupportedState; },
  async subscribe() { throw new Error('Las notificaciones web no están disponibles en este dispositivo.'); },
  async unsubscribe() { return unsupportedState; },
  async sendTest(): Promise<WebPushTestResult> { throw new Error('Las notificaciones web no están disponibles en este dispositivo.'); },
  async showLocalTest() { throw new Error('Las notificaciones web no están disponibles en este dispositivo.'); },
};
