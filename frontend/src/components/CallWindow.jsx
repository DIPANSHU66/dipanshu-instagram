import React, { useEffect, useRef } from "react";
import { Phone, PhoneOff, Video, VideoOff, Mic, MicOff, User } from "lucide-react";
import { Button } from "./ui/button";

const CallWindow = ({
  callState,
  callerInfo,
  callType,
  localStream,
  remoteStream,
  isMuted,
  isVideoOff,
  answerCall,
  rejectCall,
  endCall,
  toggleMute,
  toggleVideo,
}) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, callState]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream, callState]);

  if (callState === "idle") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center justify-between aspect-video md:aspect-[4/3] p-6 text-white">
        
        {/* Call Info / Top bar */}
        <div className="w-full flex items-center justify-between mb-4 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
              <User className="w-5 h-5 text-zinc-400" />
            </div>
            <div>
              <h2 className="font-semibold text-sm md:text-base">
                {callerInfo?.username || "Social App User"}
              </h2>
              <p className="text-xs text-zinc-400 capitalize">
                {callType} call • {callState}
              </p>
            </div>
          </div>
        </div>

        {/* Video Area */}
        <div className="flex-1 w-full relative rounded-2xl overflow-hidden bg-zinc-950 flex items-center justify-center">
          {callState === "connected" ? (
            <>
              {/* Remote Video (Full Screen) */}
              {callType === "video" && remoteStream ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center animate-pulse border border-zinc-700">
                    <User className="w-12 h-12 text-zinc-400" />
                  </div>
                  <span className="text-sm text-zinc-400">Audio Call Connected</span>
                </div>
              )}

              {/* Local Video (Floating Overlay) */}
              {callType === "video" && localStream && (
                <div className="absolute bottom-4 right-4 w-32 md:w-40 aspect-video rounded-xl overflow-hidden border border-zinc-700 bg-zinc-900 shadow-md">
                  {isVideoOff ? (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-850">
                      <VideoOff className="w-5 h-5 text-zinc-500" />
                    </div>
                  ) : (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                  )}
                </div>
              )}
            </>
          ) : (
            /* Calling / Ringing UI States */
            <div className="flex flex-col items-center gap-6 animate-pulse">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-sky-500/20 blur-xl animate-ping" />
                <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center border-2 border-sky-500 relative">
                  <User className="w-12 h-12 text-sky-400" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium">
                  {callState === "calling" ? "Calling..." : "Incoming Call..."}
                </h3>
                <p className="text-sm text-zinc-500">
                  {callState === "calling"
                    ? `Waiting for ${callerInfo?.username || "user"} to join`
                    : `${callerInfo?.username || "Someone"} is calling you`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Controls / Action Bar */}
        <div className="w-full flex items-center justify-center gap-4 mt-6 z-10">
          {callState === "incoming" ? (
            /* Incoming Call Actions */
            <div className="flex items-center gap-6">
              <Button
                onClick={rejectCall}
                variant="destructive"
                className="w-12 h-12 rounded-full flex items-center justify-center p-0 bg-red-600 hover:bg-red-700 shadow-lg"
              >
                <PhoneOff className="w-5 h-5" />
              </Button>
              <Button
                onClick={answerCall}
                className="w-12 h-12 rounded-full flex items-center justify-center p-0 bg-green-600 hover:bg-green-700 shadow-lg"
              >
                <Phone className="w-5 h-5 text-white" />
              </Button>
            </div>
          ) : (
            /* Connected / Dialing Actions */
            <div className="flex items-center gap-4">
              {callState === "connected" && (
                <>
                  {/* Mute Mic */}
                  <Button
                    onClick={toggleMute}
                    className={`w-12 h-12 rounded-full flex items-center justify-center p-0 border border-zinc-700 transition-colors ${
                      isMuted
                        ? "bg-red-600/30 hover:bg-red-600/40 text-red-500 border-red-500/50"
                        : "bg-zinc-800 hover:bg-zinc-750 text-white"
                    }`}
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </Button>

                  {/* Toggle Video */}
                  {callType === "video" && (
                    <Button
                      onClick={toggleVideo}
                      className={`w-12 h-12 rounded-full flex items-center justify-center p-0 border border-zinc-700 transition-colors ${
                        isVideoOff
                          ? "bg-red-600/30 hover:bg-red-600/40 text-red-500 border-red-500/50"
                          : "bg-zinc-800 hover:bg-zinc-750 text-white"
                      }`}
                    >
                      {isVideoOff ? (
                        <VideoOff className="w-5 h-5" />
                      ) : (
                        <Video className="w-5 h-5" />
                      )}
                    </Button>
                  )}
                </>
              )}

              {/* End / Cancel Call */}
              <Button
                onClick={endCall}
                variant="destructive"
                className="w-12 h-12 rounded-full flex items-center justify-center p-0 bg-red-600 hover:bg-red-700 shadow-lg"
              >
                <PhoneOff className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallWindow;
