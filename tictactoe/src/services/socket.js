import { io } from "socket.io-client";

// Resolve server endpoint dynamically with production Render deployment as default fallback
export function getServerUrl() {
  if (import.meta.env.VITE_SERVER_URL) {
    return import.meta.env.VITE_SERVER_URL;
  }
  if (typeof window !== "undefined") {
    // If running in development Vite, typically port 3000
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return "http://localhost:3000";
    }
    // Deployed production environment defaults to hosted Render server
    return "https://realtime-tic-tac-toe-73lu.onrender.com";
  }
  return "https://realtime-tic-tac-toe-73lu.onrender.com";
}

let socketInstance = null;

export function getSocket() {
  if (!socketInstance) {
    const url = getServerUrl();
    socketInstance = io(url, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
  }
  return socketInstance;
}

export function connectSocket() {
  const socket = getSocket();
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
