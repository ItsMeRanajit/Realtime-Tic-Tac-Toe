export const PORT = process.env.PORT || 3000;

export const CLIENT_URL = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((u) => u.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

export const GAME_CONFIG = {
  DISCONNECT_GRACE_MS: 20000,
  TURN_TIMEOUT_SEC: 25,
  MAX_CHAT_LENGTH: 150,
  CHAT_RATE_LIMIT: {
    MAX_MESSAGES: 5,
    WINDOW_MS: 3000,
  },
  ROOM_CODE_LENGTH: 5,
};
