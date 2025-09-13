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

    // ✅ Generar ID simple sin usar Buffer - usando crypto nativo
    const userId = await generateSimpleUserId(data.userAgent + data.timestamp);
    
    const user: StoredUser = {
      id: userId,
      userAgent: data.userAgent,
      registeredAt: data.timestamp,
      timezone: data.timezone,
      isActive: true,
    };

    // Guardar usuario (implementar según tu preferencia de storage)
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

// ✅ Función para generar ID usando Web Crypto API (compatible en Node.js y navegador)
async function generateSimpleUserId(input: string): Promise<string> {
  // Crear encoder para convertir string a bytes
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  
  // Crear hash usando Web Crypto API
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  // Convertir a array de bytes
  const hashArray = new Uint8Array(hashBuffer);
  
  // Convertir a string hexadecimal
  const hashHex = Array.from(hashArray)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  // Tomar los primeros 16 caracteres
  return hashHex.substring(0, 16);
}

// Helper functions para storage
async function getUsersFromStorage(): Promise<StoredUser[]> {
  try {
    // Aquí implementarías tu storage preferido:
    // - Variables de entorno (para pocos usuarios)
    // - Netlify Blobs
    // - Base de datos externa (Supabase, FaunaDB, etc.)
    
    // Por ahora retornamos array vacío
    return [];
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
}

async function saveUsersToStorage(users: StoredUser[]): Promise<void> {
  try {
    // Aquí guardarías en tu storage preferido
    console.log(`💾 Guardando ${users.length} usuarios`);
    
    // Ejemplo: guardar en variable de entorno (solo para testing)
    // En producción usarías una base de datos real
    
  } catch (error) {
    console.error('Error saving users:', error);
  }
}