import React, { useState, useRef, useEffect } from "react";
import { FiX, FiSend, FiMessageCircle } from "react-icons/fi";
import ChatMessage from "./ChatMessage";

const QUICK_MESSAGES = [
  "Good luck!",
  "Nice move!",
  "Well played!",
  "Good game!",
  "Rematch?",
  "Thanks!",
];

export const ChatDrawer = ({
  isOpen = false,
  onClose,
  messages = [],
  onSendMessage,
  myPlayerId,
  mySymbol,
}) => {
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSend = (e) => {
    e?.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSendMessage(trimmed);
    setText("");
  };

  const handleQuickSend = (msg) => {
    onSendMessage(msg);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center sm:justify-end sm:p-6 bg-slate-900/30 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full sm:w-[360px] h-[70vh] sm:h-[500px] max-h-[85vh] bg-white border-2 border-pink-100 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-pink-100 bg-pink-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-pink-100 text-pink-600">
              <FiMessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">Match Chat</h3>
              <p className="text-[11px] text-slate-500 font-medium">Say something friendly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-pink-100 transition-colors"
            aria-label="Close Chat"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Responses Bar */}
        <div className="px-3 py-2 bg-slate-50 border-b border-pink-50 flex gap-1.5 overflow-x-auto no-scrollbar">
          {QUICK_MESSAGES.map((msg, i) => (
            <button
              key={i}
              onClick={() => handleQuickSend(msg)}
              className="text-xs font-bold px-3 py-1 rounded-full bg-white hover:bg-pink-50 text-slate-700 border border-pink-200 whitespace-nowrap shadow-xs transition-colors"
            >
              {msg}
            </button>
          ))}
        </div>

        {/* Messages List */}
        <div className="flex-1 p-4 overflow-y-auto bg-[#faf8fa]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 p-6">
              <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center mb-2.5 text-pink-400">
                <FiMessageCircle className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-slate-700">No messages yet</p>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                Type a message or tap a quick phrase above
              </p>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isOwn =
                msg.senderId === myPlayerId ||
                (msg.senderSymbol && msg.senderSymbol === mySymbol);
              return <ChatMessage key={idx} msg={msg} isOwn={isOwn} />;
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSend}
          className="p-3 border-t border-pink-100 bg-white flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={140}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-2xl bg-pink-50/50 border border-pink-200 text-slate-800 text-sm font-bold placeholder-slate-400 focus:outline-none focus:border-pink-400 transition-all"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="p-2.5 btn-pastel-pink disabled:opacity-30 disabled:pointer-events-none shrink-0"
            aria-label="Send Message"
          >
            <FiSend className="w-4 h-4 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatDrawer;
