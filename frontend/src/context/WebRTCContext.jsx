import React, { createContext, useContext } from "react";
import { useWebRTC } from "../hooks/useWebRTC";
import CallWindow from "../components/CallWindow";

const WebRTCContext = createContext(null);

export const WebRTCOverlay = ({ children }) => {
  const webrtc = useWebRTC();

  return (
    <WebRTCContext.Provider value={webrtc}>
      {children}
      <CallWindow {...webrtc} />
    </WebRTCContext.Provider>
  );
};

export const useCall = () => useContext(WebRTCContext);
