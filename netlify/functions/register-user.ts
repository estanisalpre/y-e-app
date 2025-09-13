import type { Handler } from '@netlify/functions';

interface SubscriptionData {
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  userAgent: string;
  timestamp: string;
}

interface StoredUser {
  id: string;
  subscription: any;
  userAgent: string;
  registeredAt: string;
  lastNotification?: string;
  isActive: boolean;
}

export const handler: Handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
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
    const data: SubscriptionData = JSON.parse(event.body || '{}');
    
    if (!data.subscription || !data.subscription.endpoint) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid subscription data' }),
      };
    }

    // ✅ Generar ID único usando crypto API web (compatible con navegador y Node.js)
    const userId = await generateUserId(data.subscription.endpoint);
    
    const user: StoredUser = {
      id: userId,
      subscription: data.subscription,
      userAgent: data.userAgent,
      registeredAt: data.timestamp,
      isActive: true,
    };

    // Store user data
    const existingUsers = await getUsersFromStorage();
    const userIndex = existingUsers.findIndex(u => u.id === userId);
    
    if (userIndex >= 0) {
      existingUsers[userIndex] = user;
    } else {
      existingUsers.push(user);
    }
    
    await saveUsersToStorage(existingUsers);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'User registered successfully',
        userId: userId,
      }),
    };

  } catch (error) {
    console.error('Error registering user:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};

// ✅ Función para generar ID único usando Web Crypto API
async function generateUserId(endpoint: string): Promise<string> {
  // Convertir string a ArrayBuffer
  const encoder = new TextEncoder();
  const data = encoder.encode(endpoint);
  
  // Crear hash usando Web Crypto API
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convertir a string base64
  const hashArray = new Uint8Array(hashBuffer);
  const hashBase64 = btoa(String.fromCharCode(...hashArray));
  
  // Tomar los primeros 16 caracteres para el ID
  return hashBase64.slice(0, 16).replace(/[+/=]/g, '');
}

// Helper functions for storage
async function getUsersFromStorage(): Promise<StoredUser[]> {
  try {
    // In a real app, this would be a database query
    // For demo purposes, we'll return empty array
    // You could use Netlify Blobs, Fauna, or any other storage solution
    return [];
  } catch (error) {
    console.error('Error getting users from storage:', error);
    return [];
  }
}

async function saveUsersToStorage(users: StoredUser[]): Promise<void> {
  try {
    // In a real app, this would save to a database
    // For demo purposes, we'll just log it
    console.log('Saving users:', users.length);
    
    // You could implement storage using:
    // - Netlify Blobs
    // - FaunaDB
    // - Supabase
    // - Any other database service
    
  } catch (error) {
    console.error('Error saving users to storage:', error);
  }
}