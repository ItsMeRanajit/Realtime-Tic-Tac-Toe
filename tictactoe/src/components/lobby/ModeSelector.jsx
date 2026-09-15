import React from "react";
import { FiZap, FiLock, FiUsers, FiEdit3, FiUser, FiActivity } from "react-icons/fi";

export const ModeSelector = ({
  playerName = "",
  onChangePlayerName,
  onSelectMode,
  serverStatus = "connected",
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center animate-fade-in px-3 sm:px-4 py-0.5">
      {/* Playful Top Hero Header */}
      <div className="text-center mb-2 sm:mb-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-pink-100 border border-pink-200 text-pink-700 text-[11px] font-bold mb-1 shadow-xs">
          <FiZap className="w-3 h-3 text-pink-500" />
          <span>Real-Time Multiplayer Arena</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-800 mb-0.5 font-sans">
          Tic Tac <span className="text-pink-500">Toe</span> <span className="text-purple-500">Land</span>
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm font-semibold max-w-sm mx-auto">
          Casual and bright multiplayer games with friends or players worldwide
        </p>
      </div>

      {/* Cute Profile Bar (No Emojis - Subtle Icons) */}
      <div className="w-full max-w-xl bg-white border-2 border-pink-100 rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 shadow-pillowy mb-2.5 sm:mb-3 flex flex-col sm:flex-row items-center justify-between gap-2.5">
        {/* Profile Avatar & Name Input */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-pink-100 to-purple-100 border-2 border-pink-200 flex items-center justify-center text-pink-600 shadow-xs shrink-0">
            <FiUser className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-wider text-pink-600 mb-0.5">
              Player Nickname
            </p>
            <div className="relative flex items-center">
              <input
                type="text"
                value={playerName}
                onChange={(e) => onChangePlayerName(e.target.value)}
                maxLength={16}
                placeholder="Enter your name..."
                className="w-full pl-3 pr-8 py-1 rounded-xl bg-pink-50/50 border border-pink-200 text-slate-800 font-bold focus:outline-none focus:border-pink-400 text-xs sm:text-sm transition-all"
              />
              <FiEdit3 className="absolute right-2.5 w-3.5 h-3.5 text-pink-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Server Status Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold shrink-0">
          <FiActivity className="w-3 h-3 text-emerald-500 animate-pulse" />
          <span>{serverStatus === "connected" ? "Server Online" : "Reconnecting..."}</span>
        </div>
      </div>

      {/* Bento Grid Hub Layout (Compact for 100vh Single Page Fit) */}
      <div className="w-full max-w-2xl sm:max-w-3xl grid grid-cols-1 md:grid-cols-12 gap-2.5 sm:gap-3">
        {/* ======================================================== */}
        {/* BOX 1: QUICK MATCH (GLOBAL AUTOMATIC - ZERO ROOM ID) */}
        {/* ======================================================== */}
        <div className="md:col-span-7 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 border-2 border-sky-200 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 shadow-pillowy flex flex-col justify-between relative overflow-hidden group hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-sky-400 text-white flex items-center justify-center text-lg shadow-xs group-hover:scale-105 transition-transform">
              <FiZap className="w-5 h-5" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-200 text-sky-800">
              Automatic
            </span>
          </div>

          <div className="my-1">
            <h2 className="text-lg sm:text-xl font-black text-slate-800 mb-0.5 font-sans">
              Global Quick Match
            </h2>
            <p className="text-slate-600 text-xs font-medium leading-snug">
              Pair with another online player instantly. No room codes or manual setup required.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSelectMode("global")}
            className="w-full py-2.5 px-4 btn-pastel-blue flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold shadow-xs mt-1.5"
          >
            <FiZap className="w-4 h-4" />
            <span>Play Online Now</span>
          </button>
        </div>

        {/* RIGHT COLUMN: PRIVATE ROOM & LOCAL PASS & PLAY */}
        <div className="md:col-span-5 flex flex-col gap-2.5">
          {/* ======================================================== */}
          {/* BOX 2: PRIVATE ROOM (FRIENDS WITH ROOM ID ONLY) */}
          {/* ======================================================== */}
          <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100/60 border-2 border-pink-200 rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 shadow-pillowy flex flex-col justify-between relative overflow-hidden group hover:border-pink-300 transition-all">
            <div className="flex items-center justify-between mb-1">
              <div className="w-8 h-8 rounded-2xl bg-pink-400 text-white flex items-center justify-center text-xs shadow-xs group-hover:scale-105 transition-transform">
                <FiLock className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-200 text-pink-800">
                Room Code
              </span>
            </div>

            <div className="my-0.5">
              <h3 className="text-sm sm:text-base font-black text-slate-800 mb-0.5">
                Play with Friend
              </h3>
              <p className="text-slate-600 text-[11px] font-medium">
                Host a private room with a code or join a friend.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onSelectMode("private")}
              className="w-full py-1.5 px-3 btn-pastel-pink flex items-center justify-center gap-1.5 text-xs font-extrabold mt-1"
            >
              <FiLock className="w-3 h-3" />
              <span>Private Room</span>
            </button>
          </div>

          {/* ======================================================== */}
          {/* BOX 3: LOCAL MATCH (SAME DEVICE PASS & PLAY) */}
          {/* ======================================================== */}
          <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 shadow-pillowy flex flex-col justify-between relative overflow-hidden group hover:border-yellow-300 transition-all">
            <div className="flex items-center justify-between mb-1">
              <div className="w-8 h-8 rounded-2xl bg-yellow-400 text-amber-900 flex items-center justify-center text-xs shadow-xs group-hover:scale-105 transition-transform">
                <FiUsers className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-yellow-200 text-amber-800">
                Offline
              </span>
            </div>

            <div className="my-0.5">
              <h3 className="text-sm sm:text-base font-black text-slate-800 mb-0.5">
                Pass & Play
              </h3>
              <p className="text-slate-600 text-[11px] font-medium">
                2 players on this screen with live score tracking.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onSelectMode("local")}
              className="w-full py-1.5 px-3 btn-pastel-yellow flex items-center justify-center gap-1.5 text-xs font-extrabold mt-1"
            >
              <FiUsers className="w-3.5 h-3.5" />
              <span>Local 2-Player</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeSelector;
