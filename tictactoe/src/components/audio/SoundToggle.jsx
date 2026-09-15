import React, { useState } from "react";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import { sound } from "../../services/audioService";

export const SoundToggle = ({ className = "" }) => {
  const [muted, setMuted] = useState(sound.isMuted());

  const handleToggle = () => {
    const isNowMuted = sound.toggleMute();
    setMuted(isNowMuted);
    if (!isNowMuted) {
      sound.playClick();
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-2.5 rounded-2xl border-2 border-pink-100 bg-white hover:bg-pink-50 text-pink-600 transition-all shadow-sm active:scale-95 ${className}`}
      title={muted ? "Unmute sounds" : "Mute sounds"}
      aria-label={muted ? "Unmute sounds" : "Mute sounds"}
    >
      {muted ? (
        <HiSpeakerXMark className="w-5 h-5 text-slate-400" />
      ) : (
        <HiSpeakerWave className="w-5 h-5 text-pink-500 animate-pulse" />
      )}
    </button>
  );
};

export default SoundToggle;
