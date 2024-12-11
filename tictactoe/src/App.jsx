import React, { useState } from "react";
import PlayOnline from "./playOnline";
import PlayOffline from "./playOffline";

const App = () => {
  const [option, setOption] = useState(null);

  return (
    <div className="grid w-full h-screen bg-gradient-to-br from-violet-900 to-violet-700 place-items-center">
      <div className="flex flex-col items-center justify-center w-full h-screen gap-4">
        {!option && (
          <>
            <button
              className="h-16 text-xl tracking-widest transition-all w-44 activeName font-base3"
              onClick={() => {
                // startSocket();
                setOption("online");
              }}
            >
              Play Online
            </button>
            <button
              className="w-auto h-16 px-4 text-xl tracking-widest transition-all activeName font-base3"
              onClick={() => {
                setOption("offline");
              }}
            >
              Play vs Friends
            </button>
          </>
        )}
        {option === "online" && <PlayOnline setOption={setOption} />}
        {option === "offline" && <PlayOffline setOption={setOption} />}
      </div>
    </div>
  );
};

export default App;
