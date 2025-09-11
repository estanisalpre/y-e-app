import { Handler } from '@netlify/functions';

interface LoveMessage {
  id: number;
  title: string;
  message: string;
  emoji: string;
}

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
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
      {
        id: 4,
        title: "Te amo infinitamente 💖",
        message: "No hay palabras suficientes para expresar cuánto te amo. Eres mi presente más preciado.",
        emoji: "💖"
      },
      {
        id: 5,
        title: "Mi princesa hermosa 👑",
        message: "Eres la reina de mi corazón y el amor de mi vida. Que tengas un día tan especial como tú.",
        emoji: "👑"
      },
      {
        id: 6,
        title: "Contigo todo es mejor 🌟",
        message: "Desde que estás en mi vida, cada día es una nueva aventura llena de amor y felicidad.",
        emoji: "🌟"
      },
      {
        id: 7,
        title: "Eres mi inspiración 🎨",
        message: "Tu amor me inspira a ser la mejor versión de mí mismo. Gracias por creer en mí siempre.",
        emoji: "🎨"
      },
      {
        id: 8,
        title: "Mi corazón te pertenece 💝",
        message: "En un mundo lleno de opciones, mi corazón te eligió a ti, una y otra vez.",
        emoji: "💝"
      },
      {
        id: 9,
        title: "Eres mi hogar 🏠",
        message: "No importa dónde esté, cuando estoy contigo, estoy en casa. Eres mi lugar seguro.",
        emoji: "🏠"
      },
      {
        id: 10,
        title: "Mi amor eterno 💫",
        message: "Ni el tiempo ni la distancia podrían cambiar lo que siento por ti. Te amaré por siempre.",
        emoji: "💫"
      }
    ];

    // Get query parameters
    const queryParams = new URLSearchParams(event.queryStringParameters || {});
    const messageId = queryParams.get('id');
    const date = queryParams.get('date');

    if (messageId) {
      // Return specific message
      const message = messages.find(m => m.id === parseInt(messageId));
      if (!message) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Message not found' }),
        };
      }
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message }),
      };
    }

    if (date) {
      // Return message for specific date
      const targetDate = new Date(date);
      const dayOfYear = Math.floor((targetDate.getTime() - new Date(targetDate.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      const messageIndex = dayOfYear % messages.length;
      const message = messages[messageIndex];

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          message,
          date: targetDate.toISOString().split('T')[0],
          dayOfYear,
        }),
      };
    }

    // Return today's message by default
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const messageIndex = dayOfYear % messages.length;
    const todayMessage = messages[messageIndex];

    // Check for special occasions
    const dayOfWeek = today.getDay();
    let specialMessage = null;

    if (dayOfWeek === 1) { // Monday
      specialMessage = {
        id: 999,
        title: "¡Feliz lunes mi amor! 💪",
        message: "Que esta semana esté llena de éxitos, sonrisas y momentos hermosos. ¡Tú puedes con todo!",
        emoji: "💪"
      };
    } else if (dayOfWeek === 5) { // Friday
      specialMessage = {
        id: 998,
        title: "¡Viernes de amor! 🎉",
        message: "Ya casi es fin de semana para disfrutar juntos. ¡Espero verte pronto mi amor!",
        emoji: "🎉"
      };
    } else if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
      specialMessage = {
        id: 997,
        title: "¡Fin de semana contigo! 🥳",
        message: "No hay nada mejor que pasar el fin de semana amando y siendo amado. Te amo infinitamente.",
        emoji: "🥳"
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: specialMessage || todayMessage,
        isSpecialOccasion: !!specialMessage,
        date: today.toISOString().split('T')[0],
        dayOfYear,
        totalMessages: messages.length,
      }),
    };

  } catch (error) {
    console.error('Error in get-messages function:', error);
    
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