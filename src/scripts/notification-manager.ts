interface NotificationState {
  permission: NotificationPermission;
  subscription: PushSubscription | null;
}

class LoveNotificationManager {
  private vapidPublicKey =
    "BO9j1Xv2Fzlrg4enrPfKSU2_yka7mbuPdQ-k_ZByosqMcNNzI4SFZh4aeHSSDYZXKnI_IrQ7Ii2RARVpPP8LEBo";

  constructor() {
    this.initializeUI();
    this.checkCurrentState();
  }

  private initializeUI(): void {
    const enableBtn = document.getElementById("enable-notifications");
    const retryBtn = document.getElementById("retry-notifications");

    enableBtn?.addEventListener("click", () => this.enableNotifications());
    retryBtn?.addEventListener("click", () => this.enableNotifications());

    // Install prompt
    this.setupInstallPrompt();
  }

  private async checkCurrentState(): Promise<void> {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      this.showState("error", "Tu navegador no soporta notificaciones push");
      return;
    }

    const permission = Notification.permission;

    if (permission === "granted") {
      const subscription = await this.getSubscription();
      if (subscription) {
        this.showState("success");
      } else {
        this.showState("default");
      }
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
        // Register push subscription
        const subscription = await this.subscribeToPush();

        if (subscription) {
          // Send subscription to backend
          await this.registerSubscription(subscription);
          this.showState("success");

          // Show a test notification
          this.showTestNotification();
        } else {
          throw new Error("No se pudo crear la suscripción");
        }
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
      this.showState(
        "error",
        error instanceof Error ? error.message : "Error desconocido"
      );
    }
  }

  private async subscribeToPush(): Promise<PushSubscription | null> {
    try {
      const registration = await navigator.serviceWorker.ready;

      // ✅ Convertir la clave VAPID correctamente sin usar Buffer
      const applicationServerKey = this.urlBase64ToUint8Array(this.vapidPublicKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as BufferSource,
      });

      return subscription;
    } catch (error) {
      console.error("Error subscribing to push:", error);
      return null;
    }
  }

  private async getSubscription(): Promise<PushSubscription | null> {
    try {
      const registration = await navigator.serviceWorker.ready;
      return await registration.pushManager.getSubscription();
    } catch (error) {
      console.error("Error getting subscription:", error);
      return null;
    }
  }

  private async registerSubscription(
    subscription: PushSubscription
  ): Promise<void> {
    const response = await fetch("/.netlify/functions/register-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscription,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      throw new Error("Error registrando la suscripción");
    }
  }

  private showState(
    state: "default" | "loading" | "success" | "error" | "blocked",
    message?: string
  ): void {
    // Hide all states
    const states = ["default", "loading", "success", "error", "blocked"];
    states.forEach((s) => {
      const element = document.getElementById(`notification-${s}`);
      if (element) element.classList.add("hidden");
    });

    // Show current state
    const currentState = document.getElementById(`notification-${state}`);
    if (currentState) {
      currentState.classList.remove("hidden");

      // Update error message if provided
      if (state === "error" && message) {
        const errorMessage = document.getElementById("error-message");
        if (errorMessage) errorMessage.textContent = message;
      }
    }
  }

  private showTestNotification(): void {
    if (Notification.permission === "granted") {
      new Notification("💕 ¡Notificaciones activadas!", {
        body: "A partir de mañana recibirás mensajes hermosos cada día",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        tag: "test-notification",
      });
    }
  }

  // ✅ Función correcta para convertir la clave VAPID (sin usar Buffer)
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
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

    // Hide install prompt if already installed
    window.addEventListener("appinstalled", () => {
      const installPrompt = document.getElementById("install-prompt");
      if (installPrompt) installPrompt.classList.add("hidden");
    });
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new LoveNotificationManager();
});