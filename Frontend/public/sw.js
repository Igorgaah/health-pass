// Service Worker para notificações push persistentes
const CACHE_NAME = 'healthpass-v1';

// Instalar service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Ativar service worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(clients.claim());
});

// Lidar com notificações push
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'Você tem um lembrete!',
    icon: '/Health Pass.jpg',
    badge: '/Health Pass.jpg',
    vibrate: [200, 100, 200],
    tag: data.tag || 'healthpass-reminder',
    requireInteraction: true,
    actions: [
      { action: 'view', title: 'Ver detalhes' },
      { action: 'dismiss', title: 'Dispensar' }
    ],
    data: {
      url: data.url || '/reminders'
    }
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'HealthPass Lembrete',
      options
    )
  );
});

// Lidar com cliques nas notificações
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Background Sync para sincronizar lembretes
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-reminders') {
    event.waitUntil(syncReminders());
  }
});

async function syncReminders() {
  try {
    // Obter lembretes do localStorage via postMessage
    const allClients = await clients.matchAll({ includeUncontrolled: true });
    
    if (allClients.length > 0) {
      allClients[0].postMessage({
        type: 'CHECK_REMINDERS'
      });
    }
  } catch (error) {
    console.error('Erro ao sincronizar lembretes:', error);
  }
}

// Agendar verificação periódica de lembretes
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_REMINDER') {
    const { reminder } = event.data;
    scheduleNotification(reminder);
  }
});

function scheduleNotification(reminder) {
  const now = new Date().getTime();
  const reminderTime = new Date(reminder.dateTime).getTime();
  const delay = reminderTime - now;

  if (delay > 0 && delay < 2147483647) { // Max setTimeout value
    setTimeout(() => {
      self.registration.showNotification(reminder.title, {
        body: reminder.description,
        icon: '/Health Pass.jpg',
        badge: '/Health Pass.jpg',
        vibrate: [200, 100, 200, 100, 200],
        tag: `reminder-${reminder.id}`,
        requireInteraction: true,
        data: {
          url: '/reminders',
          reminderId: reminder.id
        }
      });
    }, delay);
  }
}
