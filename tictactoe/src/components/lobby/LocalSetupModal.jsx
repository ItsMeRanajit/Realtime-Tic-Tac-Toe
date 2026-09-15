import React, { useState } from "react";
import { FiUsers, FiPlay, FiX } from "react-icons/fi";

export const LocalSetupModal = ({ isOpen = false, onClose, onStartLocalMatch }) => {
  const [p1Name, setP1Name] = useState("Player 1");
  const [p2Name, setP2Name] = useState("Player 2");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onStartLocalMatch({
      player1: p1Name.trim() || "Player 1",
      player2: p2Name.trim() || "Player 2",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md p-6 rounded-3xl bg-white border-2 border-yellow-100 shadow-2xl animate-zoom-in">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-yellow-100 text-amber-600">
              <FiUsers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">Local 2-Player</h2>
              <p className="text-xs text-slate-500 font-medium">Pass & play on this device</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-yellow-50 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-xs font-black text-sky-700 uppercase tracking-wider mb-1.5">
              <span className="w-5 h-5 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 font-black text-xs">X</span>
              Player 1 Name
            </label>
            <input
              type="text"
              value={p1Name}
              onChange={(e) => setP1Name(e.target.value)}
              maxLength={16}
              placeholder="Player 1"
              className="w-full px-4 py-3 rounded-2xl bg-sky-50/50 border border-sky-200 text-slate-800 focus:outline-none focus:border-sky-400 text-sm font-bold transition-all"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-black text-pink-700 uppercase tracking-wider mb-1.5">
              <span className="w-5 h-5 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600 font-black text-xs">O</span>
              Player 2 Name
            </label>
            <input
              type="text"
              value={p2Name}
              onChange={(e) => setP2Name(e.target.value)}
              maxLength={16}
              placeholder="Player 2"
              className="w-full px-4 py-3 rounded-2xl bg-pink-50/50 border border-pink-200 text-slate-800 focus:outline-none focus:border-pink-400 text-sm font-bold transition-all"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 btn-pastel-ghost text-sm font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 btn-pastel-yellow text-sm font-black flex items-center justify-center gap-2"
            >
              <FiPlay className="w-4 h-4" />
              <span>Start Match</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LocalSetupModal;
