interface NotificationState {
  permission: NotificationPermission;
  isScheduled: boolean;
}

class SimpleLoveNotificationManager {
  private messages = [
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

  private intervalId: number | null = null;

  constructor() {
    this.initializeUI();
    this.checkCurrentState();
    this.startNotificationCheck();
  }

  private getHistory(): { id: number, message: string, date: string }[] {
    const history = localStorage.getItem("love-message-history");
    return history ? JSON.parse(history) : [];
  }

  private saveToHistory(entry: { id: number, message: string, date: string }) {
    let history = this.getHistory();
    history.unshift(entry);
    if (history.length > 10) history = history.slice(0, 10); 
    localStorage.setItem("love-message-history", JSON.stringify(history));
  }

  private initializeUI(): void {
    const enableBtn = document.getElementById("enable-notifications");
    const retryBtn = document.getElementById("retry-notifications");

    enableBtn?.addEventListener("click", () => this.enableNotifications());
    retryBtn?.addEventListener("click", () => this.enableNotifications());

    this.setupInstallPrompt();
  }

  private async checkCurrentState(): Promise<void> {
    if (!("Notification" in window)) {
      this.showState("error", "Tu navegador no soporta notificaciones");
      return;
    }

    const permission = Notification.permission;
    const isScheduled = localStorage.getItem('love-notifications-enabled') === 'true';

    if (permission === "granted" && isScheduled) {
      this.showState("success");
    } else if (permission === "denied") {
      this.showState("blocked");
    } else {
      this.showState("default");
    }
  }

  private getRandomMessage(): { id: number, message: string } {
    const history = this.getHistory();
    const recentIds = history.map(h => h.id);

    const available = this.messages.filter(m => !recentIds.includes(m.id));

    const pool = available.length > 0 ? available : this.messages;

    return pool[Math.floor(Math.random() * pool.length)];
  }

  private async enableNotifications(): Promise<void> {
    try {
      this.showState("loading");

      const permission = await Notification.requestPermission();

      if (permission === "denied") {
        this.showState("blocked");
        return;
      }

      if (permission === "granted") {
        localStorage.setItem('love-notifications-enabled', 'true');
        localStorage.setItem('love-notifications-start-date', new Date().toISOString());
        
        await this.registerUser();
        
        this.showState("success");
        this.showTestNotification();
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
      this.showState(
        "error",
        error instanceof Error ? error.message : "Error desconocido"
      );
    }
  }

  private async registerUser(): Promise<void> {
    try {
      const userData = {
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        notificationEnabled: true
      };

      const response = await fetch("/.netlify/functions/register-simple-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error("Error registrando usuario");
      }

      console.log("Usuario registrado exitosamente");
    } catch (error) {
      console.error("Error registering user:", error);
    }
  }

  private getTodaysMessage(): string {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
    );
    const messageIndex = dayOfYear % this.messages.length;
    return this.messages[messageIndex].message;
  }

  private startNotificationCheck(): void {
    this.intervalId = window.setInterval(() => {
      this.checkForMorningNotification();
    }, 60000); // 10000 ms = 10 seconds verification || 60000 ms = 1 minute verification

    this.checkForMorningNotification();
  }

  private checkForMorningNotification(): void {
    const isEnabled = localStorage.getItem('love-notifications-enabled') === 'true';
    
    if (!isEnabled || Notification.permission !== 'granted') {
      return;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const targetTime = 9 * 60; // 9:00 am
    // const targetTime = (new Date().getHours() * 60 + new Date().getMinutes()) % (24 * 60); // cada minuto
    
    if (Math.abs(currentTime - targetTime) <= 1) { // true for testing || Math.abs(currentTime - targetTime) <= 1 for production
      const today = now.toDateString();
      const lastNotification = localStorage.getItem('last-notification-date');
      
      // this.sendMorningNotification(); // testing: always send

      if (lastNotification !== today) {
        this.sendMorningNotification();
        localStorage.setItem('last-notification-date', today);
      }
    }
  }

  private async sendMorningNotification(): Promise<void> {
    if (Notification.permission === 'granted') {
      const chosen = this.getRandomMessage();
      const now = new Date();

      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification("💕 Mensaje de Amor", {
          body: chosen.message,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          tag: "morning-love-message",
          requireInteraction: false
        });

        this.saveToHistory({
          id: chosen.id,
          message: chosen.message,
          date: now.toISOString()
        });

      } catch (error) {
        console.error('Error showing notification:', error);
      }
    }
  }

  private showState(
    state: "default" | "loading" | "success" | "error" | "blocked",
    message?: string
  ): void {
    const states = ["default", "loading", "success", "error", "blocked"];
    states.forEach((s) => {
      const element = document.getElementById(`notification-${s}`);
      if (element) element.classList.add("hidden");
    });

    const currentState = document.getElementById(`notification-${state}`);
    if (currentState) {
      currentState.classList.remove("hidden");

      if (state === "error" && message) {
        const errorMessage = document.getElementById("error-message");
        if (errorMessage) errorMessage.textContent = message;
      }
    }
  }

  private async showTestNotification(): Promise<void> {
    if (Notification.permission === "granted") {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification("💕 ¡Notificaciones activadas!", {
          body: "Recibirás mensajes hermosos cada día a las 09:00 am",
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          tag: "test-notification",
        });
      } catch (error) {
        console.error('Error showing test notification:', error);
      }
    }
  }

  private setupInstallPrompt(): void {
    let deferredPrompt: any;

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;

      const installPrompt = document.getElementById("install-prompt");
      const installBtn = document.getElementById("install-btn");

      if (installPrompt) installPrompt.classList.remove("hidden");

      installBtn?.addEventListener("click", async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;

          if (outcome === "accepted") {
            installPrompt?.classList.add("hidden");
          }
          deferredPrompt = null;
        }
      });
    });

    window.addEventListener("appinstalled", () => {
      const installPrompt = document.getElementById("install-prompt");
      if (installPrompt) installPrompt.classList.add("hidden");
    });
  }

  public destroy(): void {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new SimpleLoveNotificationManager();
});