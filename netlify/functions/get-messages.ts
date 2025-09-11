import type { Handler } from '@netlify/functions';
import * as webpush from 'web-push';

interface StoredUser {
  id: string;
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  userAgent: string;
  registeredAt: string;
  lastNotification?: string;
  isActive: boolean;
}

interface LoveMessage {
  id: number;
  message: string;
}

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:estanisprevite@hotmail.com',
  process.env.VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    console.log('🚀 Starting daily love notification job...');

    // Get all active users
    const users = await getActiveUsers();
    console.log(`📱 Found ${users.length} active users`);

    if (users.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'No active users found',
          sent: 0,
        }),
      };
    }

    // Get today's love message
    const todayMessage = await getTodaysMessage();
    console.log(`💕 Today's message: ${todayMessage.message}`);

    // Prepare notification payload
    const notificationPayload = {
      title: '💕 Un mensaje especial para ti',
      body: todayMessage.message,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: 'daily-love-message',
      data: {
        url: '/',
        messageId: todayMessage.id,
        timestamp: new Date().toISOString(),
      },
      requireInteraction: false,
      actions: [
        {
          action: 'open',
          title: '💖 Ver mensaje completo'
        },
        {
          action: 'close',
          title: 'Cerrar'
        }
      ]
    };

    // Send notifications to all users
    let successCount = 0;
    let errorCount = 0;

    const sendPromises = users.map(async (user) => {
      try {
        await webpush.sendNotification(
          user.subscription,
          JSON.stringify(notificationPayload)
        );
        
        // Update user's last notification timestamp
        await updateUserLastNotification(user.id, new Date().toISOString());
        
        successCount++;
        console.log(`✅ Notification sent to user ${user.id}`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to send notification to user ${user.id}:`, error);
        
        // If subscription is no longer valid, mark user as inactive
        if (error instanceof Error && (error.message.includes('410') || error.message.includes('invalid'))) {
          await deactivateUser(user.id);
          console.log(`🔄 Deactivated user ${user.id} due to invalid subscription`);
        }
      }
    });

    await Promise.all(sendPromises);

    const result = {
      success: true,
      message: 'Daily love notifications sent',
      stats: {
        totalUsers: users.length,
        successful: successCount,
        failed: errorCount,
        messageContent: todayMessage.message,
        timestamp: new Date().toISOString(),
      }
    };

    console.log('📊 Final stats:', result.stats);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result),
    };

  } catch (error) {
    console.error('💥 Error in send-notification function:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to send notifications',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

// Helper functions
async function getActiveUsers(): Promise<StoredUser[]> {
  try {
    // In a real app, this would query your database
    // For demo purposes, return empty array
    // You would implement this with your chosen storage solution
    return [];
  } catch (error) {
    console.error('Error getting active users:', error);
    return [];
  }
}

async function getTodaysMessage(): Promise<LoveMessage> {
  try {
    // Get messages with your personal messages
    const messages: LoveMessage[] = [
      { id: 1, message: "Buen día mi amor! Espero hayas dormido muy bien ❤️" },
      { id: 2, message: "Eres el amor de mi vida 💕" },
      { id: 3, message: "Si hoy me despierto un poco mal, no te preocupes... igual te amo 🌹" },
      { id: 4, message: "No me alcanzarían las palabras para describir cuan hermosa eres. 💕" },
      { id: 5, message: "A donde sea que vayas, voy contigo. Te amo" },
      { id: 6, message: "Perdón por tantas cosas, me haces un mejor hombre cada día." },
      { id: 7, message: "Hola amor! Te amo inmensamente. 💖" },
      { id: 8, message: "Ey! Muy buenos días. Gracias por elegirme. Eres grandiosa." },
      { id: 9, message: "Buen día! Te amo más allá de las palabras. 💕" },
      { id: 10, message: "Que tengas un lindo día, recuerda que tu sonrisa es una obra de arte." },
      { id: 11, message: "Buen día! Qué buena que estás. Tu cuerpo me se vuelve loco." },
      { id: 12, message: "Amor buenos días. Me haces muy feliz." },
      { id: 13, message: "Buenos dias amor! Eres especial para mi." },
      { id: 14, message: "Buenos días mujer divina! Espero poder cuidarte toda la vida, amor." },
      { id: 15, message: "Buenos días reina! Que cumplas tus sueños. Yo te lucharé a la par contigo." },
      { id: 16, message: "Buenos días bombom! Cuando necesites un abrazo, recuerda que siempre estoy aquí para ti." },
      { id: 17, message: "Buenos días mi locura! Si hoy estás mal, recuerda que te amo y que todo pasará." },
      { id: 18, message: "Buenos días princesa! Espero tengas un hermoso día mi amor." },
      { id: 19, message: "Buenos días mi amor! Eres mi persona favorita en el mundo." },
      { id: 20, message: "Buenos días mi vida! Gracias por ser tú." },
      { id: 21, message: "Buen día hermosa! Gracias por hacerme tan feliz." },
      { id: 22, message: "Buen día! Dicen que si te llega este mensaje, debes hacer el mañanero!! 💕" },
      { id: 23, message: "Buen día amor! Si estoy en la casa, ven y bésame, dale que te espero." },
      { id: 24, message: "Buenos días! Hagamos que hoy sea un gran día juntos." },
      { id: 25, message: "Buen día reina! ¿Cómo amaneciste hoy? Gracias por ser mi reina." },
      { id: 26, message: "Buenos días corazón! Espero te despiertes muy bien. Te amo." },
      { id: 27, message: "¿Quién programó esta notificación? Ah, si, yo. Buenos días y te amo." },
      { id: 28, message: "Bueeeeeeeeeeeen día amor! Te amo con todo mi corazón." },
      { id: 29, message: "Buenos días! Si tuvimos un día malo ayer, o hace poco, hoy lo podemos cambiar. Te amo." },
      { id: 30, message: "Buenos días mi amor! Cada día contigo es mi regalo favorito." },
      { id: 31, message: "Buenos días! Gracias por enseñarme lo que significa amar de verdad." },
      { id: 32, message: "Buen día cariño! Que hoy tu sonrisa ilumine el mundo como ilumina mi vida." },
      { id: 33, message: "Buenos días! Tú eres mi paz en el caos, mi sol en la tormenta." },
      { id: 34, message: "Buen día mi vida! Ojalá tu día sea tan hermoso como tú." },
      { id: 35, message: "Buenos días amor! Si pudiera elegir otra vez, te volvería a elegir a ti. 💑" },
      { id: 36, message: "Buenos días preciosa! Que tu día esté lleno de cosas bonitas, como tú." },
      { id: 37, message: "Buen día! No olvides que eres mi orgullo y mi mayor alegría." },
      { id: 38, message: "Buenos días corazón! Solo con pensarte ya sonrío." },
      { id: 39, message: "Buenos días reina! No necesito café, me basta tu amor para despertar." },
      { id: 40, message: "Buen día amor! A veces pienso cosas subidas de tono... aaaagh pero que rico pensarte así. 😏" },
      { id: 41, message: "Buenos días cariño! Hoy también quiero ser el motivo de tu sonrisa." },
      { id: 42, message: "Buen día amor! Si la vida es un viaje, quiero recorrerlo entero contigo." },
      { id: 43, message: "Buenos días hermosa! Gracias por existir, eres mi todo." },
      { id: 44, message: "Buen día amorcito! Me haces sentir bien, gracias." },
      { id: 45, message: "Buenos días! No hay mejor forma de empezar el día que recordándote lo mucho que te amo." },
      { id: 46, message: "Buen día princesa! Ojalá hoy el universo te devuelva una parte de todo lo bueno que tú das." },
      { id: 47, message: "Buenos días mi vida! Recuerda que siempre estoy aquí para ti, pase lo que pase." },
      { id: 48, message: "Muy buenos días. Eres grandiosa y te amo." },
      { id: 49, message: "Buen día mi amor! Estoy loco por ti." },
      { id: 50, message: "Muy buenos días! Eres una luz en mi vida." }
    ];

    // Get message based on day of year for consistency
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const messageIndex = dayOfYear % messages.length;

    return messages[messageIndex];
    
  } catch (error) {
    console.error('Error getting today\'s message:', error);
    // Fallback message
    return {
      id: 0,
      message: "Te amo 💕 Buenos días mi amor, espero que tengas un día maravilloso."
    };
  }
}

async function updateUserLastNotification(userId: string, timestamp: string): Promise<void> {
  try {
    // Update user's last notification timestamp in database
    console.log(`Updating last notification for user ${userId}: ${timestamp}`);
  } catch (error) {
    console.error('Error updating user last notification:', error);
  }
}

async function deactivateUser(userId: string): Promise<void> {
  try {
    // Mark user as inactive in database
    console.log(`Deactivating user ${userId}`);
  } catch (error) {
    console.error('Error deactivating user:', error);
  }
}