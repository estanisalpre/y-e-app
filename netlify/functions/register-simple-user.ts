import type { Handler } from '@netlify/functions';

interface SimpleUserData {
  userAgent: string;
  timestamp: string;
  timezone: string;
  notificationEnabled: boolean;
}

interface StoredUser {
  id: string;
  userAgent: string;
  registeredAt: string;
  timezone: string;
  isActive: boolean;
  lastNotification?: string;
}

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const data: SimpleUserData = JSON.parse(event.body || '{}');
    
    if (!data.userAgent || !data.timestamp) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid user data' }),
      };
    }

    const userId = await generateSimpleUserId(data.userAgent + data.timestamp);
    
    const user: StoredUser = {
      id: userId,
      userAgent: data.userAgent,
      registeredAt: data.timestamp,
      timezone: data.timezone,
      isActive: true,
    };

    const existingUsers = await getUsersFromStorage();
    const userIndex = existingUsers.findIndex(u => u.id === userId);
    
    if (userIndex >= 0) {
      existingUsers[userIndex] = user;
    } else {
      existingUsers.push(user);
    }
    
    await saveUsersToStorage(existingUsers);

    console.log('✅ Usuario registrado:', userId);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Usuario registrado exitosamente',
        userId: userId,
      }),
    };

  } catch (error) {
    console.error('❌ Error registering user:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido',
      }),
    };
  }
};

async function generateSimpleUserId(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  
  const hashHex = Array.from(hashArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return hashHex.substring(0, 16);
}

// Helper functions para storage
async function getUsersFromStorage(): Promise<StoredUser[]> {
  try {
    // here you would implement fetching from your chosen storage solution
    // e.g., Netlify Blobs, external database, etc.
    // For demo purposes, return empty array

    return [];
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
}

async function saveUsersToStorage(users: StoredUser[]): Promise<void> {
  try {
    console.log(`💾 Guardando ${users.length} usuarios`);
    
    // here you would implement saving to your chosen storage solution
    
  } catch (error) {
    console.error('Error saving users:', error);
  }
}