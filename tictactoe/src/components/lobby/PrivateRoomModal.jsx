import React, { useState } from "react";
import { FiKey, FiCopy, FiShare2, FiCheck, FiX, FiPlus, FiLogIn, FiLoader } from "react-icons/fi";
import { useToast } from "../common/Toast";

export const PrivateRoomModal = ({
  isOpen = false,
  onClose,
  playerName = "Player",
  createdRoomCode = null,
  isWaitingHost = false,
  onCreateRoom,
  onJoinRoom,
  onCancelRoom,
  roomError = null,
}) => {
  const [activeTab, setActiveTab] = useState("create"); // 'create' | 'join'
  const [joinCode, setJoinCode] = useState("");
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();

  if (!isOpen) return null;

  const handleCopyCode = () => {
    if (!createdRoomCode) return;
    navigator.clipboard.writeText(createdRoomCode);
    setCopied(true);
    addToast(`Room code ${createdRoomCode} copied to clipboard!`, "success");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    if (!createdRoomCode) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join my Tic-Tac-Toe Game!",
          text: `Play Tic-Tac-Toe with me! Room Code: ${createdRoomCode}`,
          url: window.location.href,
        });
      } catch {
        handleCopyCode();
      }
    } else {
      handleCopyCode();
    }
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    const cleanCode = joinCode.trim().toUpperCase();
    if (!cleanCode) return;
    onJoinRoom(cleanCode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md p-6 sm:p-7 rounded-3xl bg-white border-2 border-pink-100 shadow-2xl animate-zoom-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-pink-100 text-pink-600">
              <FiKey className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">Private Match</h2>
              <p className="text-xs text-slate-500 font-medium">Play with friends using a room code</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-pink-50 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        {!isWaitingHost && (
          <div className="flex p-1.5 bg-pink-50/60 rounded-2xl border border-pink-100 mb-5">
            <button
              onClick={() => setActiveTab("create")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all ${
                activeTab === "create"
                  ? "bg-pink-500 text-white shadow-sm"
                  : "text-slate-500 hover:text-pink-600"
              }`}
            >
              <FiPlus className="w-4 h-4" />
              <span>Create Room</span>
            </button>
            <button
              onClick={() => setActiveTab("join")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-black flex items-center justify-center gap-2 transition-all ${
                activeTab === "join"
                  ? "bg-pink-500 text-white shadow-sm"
                  : "text-slate-500 hover:text-pink-600"
              }`}
            >
              <FiLogIn className="w-4 h-4" />
              <span>Join Room</span>
            </button>
          </div>
        )}

        {/* Tab Content */}
        {isWaitingHost ? (
          /* Host Waiting State */
          <div className="text-center py-2">
            <p className="text-xs text-pink-600 uppercase tracking-widest font-extrabold mb-2">
              Share This Room Code
            </p>
            <div className="py-4 px-6 rounded-3xl bg-pink-50/60 border-2 border-dashed border-pink-300 mb-4 shadow-xs">
              <span className="font-mono text-3xl sm:text-4xl font-black tracking-widest text-pink-600">
                {createdRoomCode}
              </span>
            </div>

            <div className="flex gap-2.5 mb-5">
              <button
                onClick={handleCopyCode}
                className="flex-1 py-3 px-4 btn-pastel-pink flex items-center justify-center gap-2 text-sm font-bold"
              >
                {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                <span>{copied ? "Copied!" : "Copy Code"}</span>
              </button>

              <button
                onClick={handleShare}
                className="py-3 px-4 btn-pastel-ghost flex items-center justify-center gap-2 text-sm font-bold"
                title="Share room link"
              >
                <FiShare2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mb-5 font-semibold">
              <FiLoader className="w-4 h-4 animate-spin text-pink-500" />
              <span>Waiting for your friend to enter the code...</span>
            </div>

            <button
              onClick={onCancelRoom}
              className="w-full py-2 px-4 text-xs text-slate-400 hover:text-pink-600 font-bold transition-colors"
            >
              Cancel Room
            </button>
          </div>
        ) : activeTab === "create" ? (
          /* Create Room Screen */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 text-xs text-slate-600 leading-relaxed font-medium">
              <p className="font-black text-slate-800 text-sm mb-1.5">How it works:</p>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>Generate your unique 5-letter room code.</li>
                <li>Share the code with a friend on any phone or laptop.</li>
                <li>Game starts instantly once they enter the code!</li>
              </ul>
            </div>

            <button
              onClick={onCreateRoom}
              className="w-full py-3.5 px-5 btn-pastel-pink flex items-center justify-center gap-2 text-sm sm:text-base font-extrabold"
            >
              <FiPlus className="w-5 h-5" />
              <span>Generate Room Code</span>
            </button>
          </div>
        ) : (
          /* Join Room Screen */
          <form onSubmit={handleJoinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2">
                Enter 5-Letter Room Code
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 5))}
                placeholder="e.g. X7K9P"
                maxLength={5}
                className="w-full px-4 py-3.5 rounded-2xl bg-pink-50/40 border-2 border-pink-200 text-center text-2xl font-mono font-black tracking-widest text-pink-600 placeholder-slate-400 focus:outline-none focus:border-pink-500 uppercase transition-all"
              />
            </div>

            {roomError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold text-center animate-fade-in">
                {roomError}
              </div>
            )}

            <button
              type="submit"
              disabled={joinCode.trim().length < 4}
              className="w-full py-3.5 px-5 btn-pastel-pink flex items-center justify-center gap-2 text-sm sm:text-base font-extrabold disabled:opacity-40 disabled:pointer-events-none"
            >
              <FiLogIn className="w-5 h-5" />
              <span>Join Friend's Match</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PrivateRoomModal;
