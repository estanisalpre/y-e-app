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
    { id: 10, message: "Que tengas un lindo día, recuerda que tu sonrisa es una obra de arte." }
  ];

  private intervalId: number | null = null;

  constructor() {
    this.initializeUI();
    this.checkCurrentState();
    this.startNotificationCheck();
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

  private async enableNotifications(): Promise<void> {
    try {
      this.showState("loading");

      // Request permission
      const permission = await Notification.requestPermission();

      if (permission === "denied") {
        this.showState("blocked");
        return;
      }

      if (permission === "granted") {
        // ✅ Guardar preferencia en localStorage (funciona en navegador)
        localStorage.setItem('love-notifications-enabled', 'true');
        localStorage.setItem('love-notifications-start-date', new Date().toISOString());
        
        // Registrar usuario en el backend
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
      // No lanzar error, las notificaciones locales pueden seguir funcionando
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
    // Verificar cada minuto si es hora de enviar notificación
    this.intervalId = window.setInterval(() => {
      this.checkForMorningNotification();
    }, 60000); // Cada minuto

    // También verificar inmediatamente
    this.checkForMorningNotification();
  }

  private checkForMorningNotification(): void {
    const isEnabled = localStorage.getItem('love-notifications-enabled') === 'true';
    
    if (!isEnabled || Notification.permission !== 'granted') {
      return;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const targetTime = 9 * 60; // 9:00 AM
    
    // Verificar si es 9:00 AM (con margen de 1 minuto)
    if (Math.abs(currentTime - targetTime) <= 1) {
      const today = now.toDateString();
      const lastNotification = localStorage.getItem('last-notification-date');
      
      // Solo enviar si no se ha enviado hoy
      if (lastNotification !== today) {
        this.sendMorningNotification();
        localStorage.setItem('last-notification-date', today);
      }
    }
  }

  private sendMorningNotification(): void {
    if (Notification.permission === 'granted') {
      const message = this.getTodaysMessage();
      
      const notification = new Notification("💕 Buenos días mi amor!", {
        body: message,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "morning-love-message",
        requireInteraction: false
      });

      // Auto cerrar después de 10 segundos
      setTimeout(() => {
        notification.close();
      }, 10000);

      // Manejar click en la notificación
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
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

  private showTestNotification(): void {
    if (Notification.permission === "granted") {
      new Notification("💕 ¡Notificaciones activadas!", {
        body: "A partir de mañana recibirás mensajes hermosos cada día a las 9:00 AM",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "test-notification",
      });
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

  // Limpiar interval cuando sea necesario
  public destroy(): void {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new SimpleLoveNotificationManager();
});