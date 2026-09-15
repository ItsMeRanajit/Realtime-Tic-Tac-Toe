import React from "react";
import { FiThumbsUp, FiAward, FiHeart, FiSmile, FiZap, FiStar } from "react-icons/fi";

export const SUBTLE_REACTIONS = [
  { id: "thumbs-up", label: "Good", icon: FiThumbsUp, color: "text-sky-500 bg-sky-50 border-sky-200" },
  { id: "heart", label: "Nice", icon: FiHeart, color: "text-pink-500 bg-pink-50 border-pink-200" },
  { id: "award", label: "GG", icon: FiAward, color: "text-amber-500 bg-amber-50 border-amber-200" },
  { id: "smile", label: "Fun", icon: FiSmile, color: "text-purple-500 bg-purple-50 border-purple-200" },
  { id: "zap", label: "Fast", icon: FiZap, color: "text-emerald-500 bg-emerald-50 border-emerald-200" },
  { id: "star", label: "Star", icon: FiStar, color: "text-yellow-500 bg-yellow-50 border-yellow-200" },
];

export const QuickReactionsBar = ({ onSendReaction, disabled = false }) => {
  return (
    <div className="flex items-center justify-center gap-1.5 px-2 py-1 rounded-2xl bg-white border-2 border-pink-100 shadow-xs">
      {SUBTLE_REACTIONS.map((item) => {
        const IconComponent = item.icon;
        return (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            onClick={() => onSendReaction(item.id)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold hover:bg-slate-50 active:scale-95 transition-all text-slate-600 disabled:opacity-30 disabled:pointer-events-none"
            title={`React with ${item.label}`}
          >
            <IconComponent className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden sm:inline">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export const FloatingReactionOverlay = ({ reactions = [] }) => {
  if (reactions.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {reactions.map((item) => {
        const match = SUBTLE_REACTIONS.find((r) => r.id === item.emoji);
        const IconComponent = match ? match.icon : FiStar;
        const colorClass = match ? match.color : "text-sky-500 bg-sky-50 border-sky-200";

        return (
          <div
            key={item.id}
            className={`absolute flex items-center gap-1.5 px-3 py-1 rounded-2xl border-2 shadow-lg animate-float-up ${colorClass}`}
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
            }}
          >
            <IconComponent className="w-4 h-4" />
            <span className="text-xs font-black">
              {match ? match.label : item.emoji}
            </span>
            {item.senderName && (
              <span className="text-[10px] font-bold opacity-75">
                • {item.senderName}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default QuickReactionsBar;
