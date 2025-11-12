// Registrar Service Worker para notificações push persistentes
export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('Service Worker registrado com sucesso:', registration);
      
      // Verificar atualizações
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('Nova versão do app disponível. Atualize a página.');
            }
          });
        }
      });

      return registration;
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
      return null;
    }
  }
  return null;
}

// Agendar notificação via Service Worker
export async function scheduleNotification(reminder: {
  id: string;
  title: string;
  description: string;
  dateTime: Date;
}) {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    
    if (registration.active) {
      registration.active.postMessage({
        type: 'SCHEDULE_REMINDER',
        reminder: {
          ...reminder,
          dateTime: reminder.dateTime.toISOString()
        }
      });
    }
  }
}

// Solicitar permissão para notificações push
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.error('Este navegador não suporta notificações');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

// Enviar notificação imediata via Service Worker
export async function sendNotification(title: string, options?: NotificationOptions) {
  const permission = await requestNotificationPermission();
  
  if (permission === 'granted' && 'serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    
    await registration.showNotification(title, {
      icon: '/Health Pass.jpg',
      badge: '/Health Pass.jpg',
      requireInteraction: true,
      ...options
    } as NotificationOptions);
  }
}

// Verificar se o app está instalado como PWA
export function isPWAInstalled(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
}
