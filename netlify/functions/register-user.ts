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

    // Generate unique user ID based on endpoint
    const userId = Buffer.from(data.subscription.endpoint).toString('base64').slice(0, 16);
    
    const user: StoredUser = {
      id: userId,
      subscription: data.subscription,
      userAgent: data.userAgent,
      registeredAt: data.timestamp,
      isActive: true,
    };

    // In a real application, you would store this in a database
    // For now, we'll use Netlify's blob store or environment variables
    // Since this is a simple use case, we'll store it in a way that the send function can access it
    
    // Store user data (you might want to use a proper database for production)
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