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
  title: string;
  message: string;
  emoji: string;
}

webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:your-email@gmail.com',
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

    const todayMessage = await getTodaysMessage();
    //console.log(`💕 Today's message: ${todayMessage.title}`);

    const notificationPayload = {
      title: todayMessage.title,
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

    let successCount = 0;
    let errorCount = 0;

    const sendPromises = users.map(async (user) => {
      try {
        await webpush.sendNotification(
          user.subscription,
          JSON.stringify(notificationPayload)
        );
        
        await updateUserLastNotification(user.id, new Date().toISOString());
        
        successCount++;
        //console.log(`✅ Notification sent to user ${user.id}`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to send notification to user ${user.id}:`, error);
        
        if (error instanceof Error && (error.message.includes('410') || error.message.includes('invalid'))) {
          await deactivateUser(user.id);
          //console.log(`🔄 Deactivated user ${user.id} due to invalid subscription`);
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
        messageTitle: todayMessage.title,
        timestamp: new Date().toISOString(),
      }
    };

    //console.log('📊 Final stats:', result.stats);

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
    // Get messages from local data file or API
    const messages: LoveMessage[] = [
      {
        id: 1,
        title: "Buenos días mi amor ☀️",
        message: "Desperté pensando en ti y en lo afortunado que soy de tenerte en mi vida. Espero que tengas un día tan hermoso como tú.",
        emoji: "☀️"
      },
      {
        id: 2,
        title: "Mi corazón es tuyo 💕",
        message: "Cada latido de mi corazón lleva tu nombre. Eres la razón por la que sonrío cada mañana.",
        emoji: "💕"
      },
      {
        id: 3,
        title: "Eres mi sol ✨",
        message: "Tu sonrisa ilumina hasta el día más gris. Gracias por llenar mi mundo de luz y amor.",
        emoji: "✨"
      },
      // Add more messages here
    ];

    // Get message based on day of year for consistency
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const messageIndex = dayOfYear % messages.length;

    return messages[messageIndex];
    
  } catch (error) {
    console.error('Error getting today\'s message:', error);
    return {
      id: 0,
      title: "Te amo 💕",
      message: "Buenos días mi amor, espero que tengas un día maravilloso lleno de sonrisas.",
      emoji: "💕"
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