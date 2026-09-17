# Real-Time Tic-Tac-Toe Arena (Architecture & Technical Documentation)

A high-performance, anonymous, real-time multiplayer Tic-Tac-Toe platform engineered with a **React 18 frontend**, **Node.js / Express backend**, and **Socket.io real-time engine**. Designed with a soft pastel aesthetic, procedural Web Audio synthesizer, strict server-authoritative game logic, and zero authentication overhead.

---

## 🌐 Live Deployments

- **Live Application (Frontend)**: [https://realtime-tic-tac-toe.vercel.app](https://realtime-tic-tac-toe.vercel.app/)
- **Live Backend Engine (Render)**: [https://realtime-tic-tac-toe-73lu.onrender.com](https://realtime-tic-tac-toe-73lu.onrender.com)
- **Health Check Endpoint**: [https://realtime-tic-tac-toe-73lu.onrender.com/health](https://realtime-tic-tac-toe-73lu.onrender.com/health)

---

## Architecture Overview

The system uses an **ephemeral in-memory server-authoritative architecture**. No persistent database, user accounts, or login sessions exist. All matchmaking queues, rooms, turn timers, and rate limiters operate in memory with auto-cleanup upon room disposal.

```mermaid
graph TD
    subgraph "Client Layer (React 18 + Vite)"
        UI[App.jsx Single-Page Viewport]
        BoardComp[Tactile 3x3 Board + Cell.jsx]
        ChatComp[ChatDrawer + Quick Reactions]
        AudioService[Web Audio API Procedural Synthesizer]
        SocketHook[useGameSocket Singleton Hook]
    end

    subgraph "Transport Layer (WebSockets / HTTP)"
        WSS[Socket.io Transport]
        HTTP[Express Health Endpoint]
    end

    subgraph "Server Engine (Node.js + Express)"
        Router[Socket.io Event Dispatcher]
        MM[Matchmaking Queue Manager]
        RM[Room Manager & State Map]
        Logic[Server-Authoritative Game Logic]
        Timers[Turn & Disconnect Timers]
        RateLimiter[Chat Rate Limiter]
    end

    UI --> SocketHook
    BoardComp --> SocketHook
    ChatComp --> SocketHook
    SocketHook --> AudioService
    SocketHook <==>|Bi-Directional JSON Events| WSS
    WSS <==> Router
    Router <--> MM
    Router <--> RM
    Router <--> Logic
    Router <--> Timers
    Router <--> RateLimiter
```

---

## Architectural Comparison: Legacy vs. Modern Engine

| Dimension           | Legacy Implementation                                                     | Modern Upgraded Architecture                                                                                              |
| :------------------ | :------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------------------ |
| **Matchmaking**     | Leaked Room IDs across all modes; public games printed private room codes | Strict separation: **Global Matchmaking** is 100% queue-based (zero codes); **Private Rooms** use 5-letter codes          |
| **Game Authority**  | Weak client-side move handling; turn races possible                       | **Strict server-authoritative** validation (coordinates, turns, board state, winning patterns)                            |
| **Chat & SDKs**     | Heavy 3rd-party Stream Chat SDK with cookies & bloat                      | Lightweight, custom Socket.io rate-limited broadcast with unread counter                                                  |
| **Audio**           | Static external audio assets (or none)                                    | **Zero-asset Web Audio API** procedural sound synthesizer                                                                 |
| **Disconnection**   | Abrupt terminations; no reconnection windows                              | **20-second grace period** with countdown banner + auto-abandonment fallback                                              |
| **Post-Game Exit**  | Opponent exit left other player stuck on waiting rematch                  | Immediate `opponent:left` event disabling the Rematch button on the other client                                          |
| **Design / Layout** | Generic neon/dark theme with page scrollbars                              | **Soft pastel aesthetic**, tactile 3D elements, subtle Feather icons, **strict 100dvh single-page non-scrollable layout** |

---

## 1. Global Matchmaking & Opponent Discovery

Global Matchmaking connects any two available online players automatically without room codes or manual setup.

```mermaid
sequenceDiagram
    autonumber
    actor Player A as Player A (Alice)
    participant Server as Matchmaking Queue
    actor Player B as Player B (Bob)

    Player A->>Server: emit("matchmaking:join", { playerName: "Alice" })
    Server-->>Player A: emit("matchmaking:waiting", { queueLength: 1 })

    Player B->>Server: emit("matchmaking:join", { playerName: "Bob" })
    Note over Server: Queue length >= 2 detected.<br/>Pops Alice & Bob from FIFO queue.<br/>Creates in-memory room.<br/>Randomizes symbol (X/O).

    Server-->>Player A: emit("game:match_start", { isPrivate: false, symbol: "X", turn: "X", ... })
    Server-->>Player B: emit("game:match_start", { isPrivate: false, symbol: "O", turn: "X", ... })
    Note over Player A, Player B: Match starts instantly (Zero Room Code displayed)
```

### Implementation Details:

1. **FIFO In-Memory Queue**: `matchmaking.js` maintains an array of queued socket objects: `{ socketId, playerName, joinedAt }`.
2. **Duplicate Socket Pruning**: Sockets already queued or in existing games are automatically pruned before queue insertion.
3. **Zero Room ID Leakage**: The server sets `isPrivate: false`. The frontend suppresses all room code displays, rendering a clean `Quick Match` indicator.

---

## 2. Room-Based Matchmaking (Private Rooms)

For playing with a friend across devices, the Private Room system uses a 5-letter alphanumeric code.

```mermaid
sequenceDiagram
    autonumber
    actor Host as Host Player
    participant Server as Room Manager
    actor Guest as Guest Player

    Host->>Server: emit("room:create", { playerName: "Host" })
    Server-->>Host: emit("room:created", { roomCode: "X7K9P" })
    Note over Host: Displays 5-Letter Code with 1-click Copy & Native Share API

    Guest->>Server: emit("room:join", { roomCode: "X7K9P", playerName: "Guest" })
    Note over Server: Validates room existence, capacity, & status.<br/>Assigns opposite symbol to Guest.<br/>Sets status to 'in_progress'.

    Server-->>Host: emit("game:match_start", { isPrivate: true, roomCode: "X7K9P", ... })
    Server-->>Guest: emit("game:match_start", { isPrivate: true, roomCode: "X7K9P", ... })
```

### Implementation Details:

- **Unambiguous Character Set**: `ROOM_CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'` (excludes easily confused glyphs like `0`, `O`, `1`, `I`).
- **Validation**: Rejects expired, full, or non-existent rooms with user-friendly error banners.

---

## 3. First Turn Selection & Board State Management

```mermaid
flowchart TD
    Start([Match Created]) --> Randomize[Randomize Host/First Player Symbol: 50% X / 50% O]
    Randomize --> InitBoard[Initialize Board: Array 9 with null]
    InitBoard --> Rule[Rule: Symbol 'X' always makes first move]
    Rule --> SetTurn[Set room.turn = 'X']
    SetTurn --> StartTimer[Start Authoritative 25s Turn Timer]
    StartTimer --> Broadcast[Broadcast game:match_start to both players]

    Broadcast --> MoveMade[Player Makes Move]
    MoveMade --> Evaluate{Check 8 Winning Lines}
    Evaluate -->|Winner Found| WinState[Set room.status = 'finished', emit game:finish]
    Evaluate -->|9 Cells Filled| DrawState[Set room.status = 'finished', emit game:finish with draw]
    Evaluate -->|Ongoing| SwitchTurn[Switch room.turn: X <-> O]
    SwitchTurn --> StartTimer
```

### Rematch State & Symbol Inversion:

When both players accept a rematch:

- The server inverts symbols: `p1.symbol = p1.symbol === 'X' ? 'O' : 'X'`.
- This ensures player fairness across multi-game rounds.
- The board resets to `Array(9).fill(null)` and the starter alternates.

---

## 4. Disconnection Detection & Room Abandonment

```mermaid
stateDiagram-v2
    [*] --> InProgress: Match Running
    InProgress --> PlayerDisconnected: Socket Disconnects

    state PlayerDisconnected {
        [*] --> GracePeriod: Start 20s Disconnect Timer
        GracePeriod --> Reconnected: Player Reconnects within 20s
        GracePeriod --> Abandoned: 20s Timer Expires
    }

    Reconnected --> InProgress: Resume Turn Timer
    Abandoned --> OpponentWin: Auto-award Win to Opponent & Emit opponent:left

    InProgress --> PostMatch: Game Finished (Win/Draw)
    PostMatch --> OpponentLeaves: Opponent Clicks Menu or Closes Tab
    OpponentLeaves --> RematchDisabled: Emit opponent:left -> Rematch Button Disabled
```

### Disconnection Rules:

1. **Active Match Disconnect**: A 20-second grace period is triggered (`GAME_CONFIG.DISCONNECT_GRACE_MS = 20000`). The active player sees a soft warning banner with a live countdown.
2. **Post-Match Exit**: If a match is finished and one player leaves or disconnects, the server immediately emits `opponent:left`.
3. **Disabled Rematch Button**: The remaining player's client receives `opponent:left`, resets any pending rematch requests, and renders a disabled Rematch button (`"Rematch (Opponent Left)"`) with an informative notification.

---

## 5. Precision Situations & Race Condition Prevention

| Edge Case / Precision Situation        | Technical Solution                                                                                                                                                  |
| :------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Simultaneous Move Attempts**         | Moves are validated server-side against authoritative `room.turn`. If Player O sends a move during Player X's turn, the server rejects it with `game:invalid_move`. |
| **Network Lag / Out-of-Order Packets** | Moves check cell occupancy (`board[index] === null`). Once a cell is claimed on the server, duplicate moves on that index are discarded.                            |
| **Mobile Touchscreen Misclicks**       | **Two-stage tap confirmation**: First tap highlights the cell with a dashed pastel indicator and symbol preview; second tap on the same cell submits the move.      |
| **Desktop Hover Feedback**             | Pointer hover displays a semi-transparent ghost preview of the active player's symbol.                                                                              |
| **Rapid Button Spamming**              | Buttons implement pointer event throttling and automatic disabled attributes during async socket transitions.                                                       |

---

## 6. Turn Timeouts & Server Authoritative Expiry

To prevent games from stalling indefinitely when a player is idle:

```mermaid
sequenceDiagram
    autonumber
    participant ClientA as Player X (Alice)
    participant Server as Server Engine
    participant ClientB as Player O (Bob)

    Note over Server: Match starts or turn switches to Player X.<br/>Sets turnDeadline = Date.now() + 25000.<br/>Starts 25s setTimeout.
    Server->>ClientA: emit("game:state_update", { turnDeadline, ... })
    Server->>ClientB: emit("game:state_update", { turnDeadline, ... })

    Note over ClientA, ClientB: Visual timer bar smoothly interpolates 25s countdown.

    alt Player X moves within 25s
        ClientA->>Server: emit("game:move", { cellIndex: 4 })
        Note over Server: clearTimeout(room.turnTimer).<br/>Switches turn to Player O.
    else Player X runs out of time
        Note over Server: 25s Timer Fires.<br/>Marks room.status = 'finished'.<br/>Declares Player O (Bob) the winner.
        Server->>ClientA: emit("game:finish", { winner: "O", reason: "timeout" })
        Server->>ClientB: emit("game:finish", { winner: "O", reason: "timeout" })
    end
```

---

## 7. Subtle In-Game Reactions & Procedural Board Placement

Players can send subtle reactions (`thumbs-up`, `heart`, `award`, `smile`, `zap`, `star`) during a match.

```mermaid
flowchart LR
    Sender[Player clicks subtle reaction] --> SocketEmit[emit reaction:send, emoji: 'award']
    SocketEmit --> ServerCheck{Whitelist Check}
    ServerCheck -->|Valid| Broadcast[io.to room.code .emit reaction:receive]

    Broadcast --> ClientReceiver[Client Receives Event]
    ClientReceiver --> Coords[Compute Randomized Board Coords: x: 30-70%, y: 40-60%]
    Coords --> Audio[Web Audio API Synthesizes Chime]
    Coords --> Render[Render Floating Badge with CSS floatUp animation]
    Render --> AutoPrune[Prune reaction DOM node after 1.9s]
```

---

## 8. Optimized Chat Architecture & Unseen Message Counter

The real-time match chat is designed for high efficiency with zero external cloud dependencies.

```mermaid
flowchart TD
    Msg[Player types message] --> RateLimit{Rate Limit Check: Max 5 msgs / 3s}
    RateLimit -->|Exceeded| ErrorToast[Emit chat:error: Slow down]
    RateLimit -->|Pass| TrimSanitize[Sanitize & Slice to 140 chars]
    TrimSanitize --> Broadcast[io.to room.code .emit chat:receive]

    Broadcast --> Receive[Opponent Receives Message]
    Receive --> PlaySound[Web Audio Synthesizes Soft Pop]
    Receive --> DrawerOpenCheck{Is Chat Drawer Open?}
    DrawerOpenCheck -->|Yes| Append[Append to Message History & Scroll Bottom]
    DrawerOpenCheck -->|No| Badge[Increment unreadChatCount & Pulse Badge]
```

### Key Efficiency Highlights:

- **No Third-Party SDKs**: Replaced heavy external chat providers with a native, zero-latency Socket.io transport.
- **In-Memory Rate Limiting**: Per-socket token bucket map prevents spam attacks.
- **Unread Counter**: State tracks unread messages while the drawer is closed, displaying a notification badge with the exact count. Opening the drawer automatically clears the count.

---

## 9. Visual Aesthetics, UX Polish & Enhancements

1. **Soft Pastel Aesthetic**: Curated color palette (Cotton Candy Pink `#f472b6`, Sky Blue `#38bdf8`, Mint Green `#34d399`, Lavender `#c084fc`, Sunny Yellow `#fbbf24`) with tactile 3D border-offset buttons.
2. **Zero Emojis**: 100% clean SVG vector iconography using `react-icons/fi` (Feather Icons).
3. **Animated Marker Strike Line**: Procedural SVG gradient stroke with `@keyframes drawMarkerStroke` that draws across the winning 3-in-a-row line upon victory.
4. **Single-Page Non-Scrollable Layout**: Configured with `h-screen max-h-screen overflow-hidden` and `100dvh` support to guarantee a fit on mobile, tablet, and desktop screens without vertical scrolling.
5. **Confetti Celebration Engine**: Lightweight full-screen canvas particle explosion on match victory.

---

## 10. Modern Technologies & Web APIs Used

```mermaid
mindmap
  root((Modern Technologies))
    Frontend
      React 18 Hooks & Context
      Vite 6 Bundler
      Tailwind CSS 3 Design System
      Feather Vector Icons react-icons/fi
      Canvas 2D Confetti Particle Engine
    Web APIs
      Web Audio API Procedural Synthesizer
      Navigator Clipboard API
      Web Share API navigator.share
      Touch Pointer Events ontouchstart
      CSS Dynamic Viewport Units 100dvh
    Backend
      Node.js ES Modules
      Express.js Framework
      Socket.io 4 WebSockets Transport
      In-Memory Data Structures Map & Set
```

### Web Audio API Synthesizer (Zero Assets):

Sound effects are procedurally generated on the fly via `AudioContext`:

- **Click**: Short sine tone (600Hz -> 300Hz, 40ms)
- **Move (X)**: Crisp rising chime (520Hz -> 780Hz, 80ms)
- **Move (O)**: Warm descending chime (660Hz -> 440Hz, 80ms)
- **Victory**: 3-note harmonic major chord arpeggio (C5 -> E5 -> G5)
- **Draw**: Neutral dual-frequency interval (350Hz + 370Hz)
- **Loss**: Gentle downward low-frequency sweep (320Hz -> 180Hz)

---

## Project Structure

```text
├── server/
│   ├── config.js              # Environment, port, CORS, & timeout configs
│   ├── server.js              # Express app + Socket.io bootstrap & health endpoint
│   ├── src/
│   │   ├── gameLogic.js       # Pure board evaluation & win checking
│   │   ├── matchmaking.js     # Global FIFO queue & player pairing
│   │   ├── roomManager.js     # Room Map, 5-letter code generator, player mappings
│   │   └── socketHandlers.js  # Socket.io event router, turn timers, & rate limiter
│   ├── test_integration.js    # 7-point integration test suite
│   └── test_opponent_leaves.js# Rematch disable verification test
│
└── tictactoe/
    ├── index.html             # 100dvh viewport configuration & fonts
    ├── src/
    │   ├── App.jsx            # Main view manager & single-page layout
    │   ├── index.css          # Pastel design system, animations, & viewport rules
    │   ├── components/
    │   │   ├── audio/         # Sound toggle component
    │   │   ├── board/         # Board.jsx, Cell.jsx, WinningLine.jsx
    │   │   ├── chat/          # ChatDrawer.jsx, ChatMessage.jsx, QuickReactions.jsx
    │   │   ├── common/        # Confetti.jsx, Toast.jsx
    │   │   ├── game/          # PlayerCard.jsx, GameOverModal.jsx, DisconnectBanner.jsx
    │   │   └── lobby/         # ModeSelector.jsx, MatchmakingModal.jsx, PrivateRoomModal.jsx, LocalSetupModal.jsx
    │   ├── hooks/
    │   │   ├── useGameSocket.js # Online multiplayer socket controller
    │   │   └── useLocalGame.js  # Offline 2-player controller
    │   ├── services/
    │   │   ├── audioService.js  # Web Audio API synthesizer
    │   │   └── socket.js        # Resilient Socket.io singleton
    │   └── utils/
    │       └── gameUtils.js     # Coordinate calculations for winning line strike
```

---

## Running Locally

### 1. Start Backend Server

```bash
cd server
npm install
npm start
# Server listens on http://localhost:3000
```

### 2. Start Frontend App

```bash
cd tictactoe
npm install
npm run dev
# App opens on http://localhost:5173
```

### 3. Run Automated Integration Tests

```bash
# Run against local server
cd server
node test_integration.js

# Or run directly against live Render deployment
$env:TEST_SERVER_URL="https://realtime-tic-tac-toe-73lu.onrender.com" # PowerShell
node test_integration.js
```

---

## 🚀 Deployment Configuration

### Frontend (Vercel)
- **Framework**: Vite
- **Root Directory**: `tictactoe`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**:
  - `VITE_SERVER_URL`: `https://realtime-tic-tac-toe-73lu.onrender.com`

### Backend (Render)
- **Environment**: Node
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `PORT`: `3000` (or dynamically allocated by Render)
  - `CLIENT_URL`: `http://localhost:5173,https://realtime-tic-tac-toe.vercel.app`

