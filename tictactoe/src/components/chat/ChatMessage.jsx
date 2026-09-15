import React from "react";

export const ChatMessage = ({ msg, isOwn = false }) => {
  const timeString = new Date(msg.timestamp || Date.now()).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} mb-2.5 animate-fade-in`}>
      <div className="flex items-center gap-1.5 mb-0.5 px-1 text-[11px] text-slate-400">
        <span className="font-extrabold text-slate-700">{msg.senderName}</span>
        {msg.senderSymbol && (
          <span
            className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
              msg.senderSymbol === "X" ? "bg-sky-100 text-sky-700" : "bg-pink-100 text-pink-700"
            }`}
          >
            {msg.senderSymbol}
          </span>
        )}
        <span>•</span>
        <span>{timeString}</span>
      </div>

      <div
        className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-sm break-words shadow-sm leading-relaxed ${
          isOwn
            ? "bg-sky-400 text-white font-bold rounded-br-none"
            : "bg-purple-50 border border-purple-200 text-purple-900 rounded-bl-none font-bold"
        }`}
      >
        {msg.message}
      </div>
    </div>
  );
};

export default ChatMessage;
