import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { toast } from "sonner";

const servers = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
      ],
    },
  ],
};

export const useWebRTC = () => {
  const { socket } = useSelector((store) => store.socketio);
  const { user } = useSelector((store) => store.auth);

  const [callState, setCallState] = useState("idle"); // 'idle' | 'calling' | 'incoming' | 'connected'
  const [callerInfo, setCallerInfo] = useState(null);
  const [callType, setCallType] = useState("video"); // 'video' | 'audio'
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const activeTargetIdRef = useRef(null);
  const candidateQueueRef = useRef([]);

  // Clean up WebRTC peer connection and streams
  const cleanup = () => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    remoteStreamRef.current = null;
    setRemoteStream(null);
    setCallState("idle");
    setCallerInfo(null);
    activeTargetIdRef.current = null;
    candidateQueueRef.current = [];
    setIsMuted(false);
    setIsVideoOff(false);
  };

  const processCandidateQueue = async () => {
    if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
      while (candidateQueueRef.current.length > 0) {
        const candidate = candidateQueueRef.current.shift();
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error("Error adding queued ICE candidate:", e);
        }
      }
    }
  };

  // Create Peer Connection
  const createPeerConnection = (targetUserId) => {
    const pc = new RTCPeerConnection(servers);

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit("webrtc-signal", {
          to: targetUserId,
          signal: { type: "candidate", candidate: event.candidate },
        });
      }
    };

    pc.ontrack = (event) => {
      if (event.streams && event.streams[0]) {
        remoteStreamRef.current = event.streams[0];
        setRemoteStream(event.streams[0]);
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  // Initiate call
  const startCall = async (targetUserId, targetUsername, type = "video") => {
    try {
      setCallState("calling");
      setCallType(type);
      activeTargetIdRef.current = targetUserId;
      setCallerInfo({ from: targetUserId, username: targetUsername, type });

      // Request media stream
      const constraints = {
        audio: true,
        video: type === "video" ? { width: 640, height: 480 } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      setLocalStream(stream);

      const pc = createPeerConnection(targetUserId);

      // Add tracks to connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (socket) {
        socket.emit("call-user", {
          userToCall: targetUserId,
          signalData: offer,
          from: user?._id,
          callerName: user?.username,
          type,
        });
      }
    } catch (error) {
      console.error("Error starting call:", error);
      toast.error("Failed to access camera/microphone.");
      cleanup();
    }
  };

  // Accept incoming call
  const answerCall = async () => {
    if (!callerInfo || !socket) return;
    try {
      setCallState("connected");
      activeTargetIdRef.current = callerInfo.from;

      const constraints = {
        audio: true,
        video: callerInfo.type === "video" ? { width: 640, height: 480 } : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;
      setLocalStream(stream);

      const pc = createPeerConnection(callerInfo.from);

      // Add tracks
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Set remote description
      if (callerInfo.signal) {
        await pc.setRemoteDescription(new RTCSessionDescription(callerInfo.signal));
        await processCandidateQueue();
      }

      // Create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit("answer-call", {
        to: callerInfo.from,
        signal: answer,
      });
    } catch (error) {
      console.error("Error answering call:", error);
      toast.error("Failed to answer the call.");
      cleanup();
    }
  };

  // Reject incoming call
  const rejectCall = () => {
    if (callerInfo && socket) {
      socket.emit("reject-call", { to: callerInfo.from });
    }
    cleanup();
  };

  // End call
  const endCall = () => {
    if (activeTargetIdRef.current && socket) {
      socket.emit("end-call", { to: activeTargetIdRef.current });
    }
    cleanup();
  };

  // Toggle Mute Audio
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle Video Video
  const toggleVideo = () => {
    if (localStreamRef.current && callType === "video") {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  useEffect(() => {
    if (!socket) return;

    // Listen to incoming call
    socket.on("incoming-call", ({ signal, from, callerName, type }) => {
      if (callState !== "idle") {
        // Busy, auto-reject
        socket.emit("reject-call", { to: from });
        return;
      }
      setCallState("incoming");
      setCallType(type);
      setCallerInfo({ signal, from, username: callerName, type });
    });

    // Listen to call accepted
    socket.on("call-accepted", async ({ signal }) => {
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(signal)
          );
          setCallState("connected");
          await processCandidateQueue();
        }
      } catch (error) {
        console.error("Error accepting WebRTC remote description:", error);
      }
    });

    // Listen to call rejected
    socket.on("call-rejected", () => {
      toast.error("Call was rejected by the user.");
      cleanup();
    });

    // Listen to call ended
    socket.on("call-ended", () => {
      toast("Call ended.");
      cleanup();
    });

    // Listen to signaling / candidates
    socket.on("webrtc-signal", async ({ signal, from }) => {
      try {
        const isFromActiveCall = from === activeTargetIdRef.current || (callerInfo && from === callerInfo.from);
        if (isFromActiveCall) {
          if (signal.type === "candidate") {
            if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
              await peerConnectionRef.current.addIceCandidate(
                new RTCIceCandidate(signal.candidate)
              );
            } else {
              candidateQueueRef.current.push(signal.candidate);
            }
          } else if (signal.type === "offer" || signal.type === "answer") {
            if (peerConnectionRef.current) {
              await peerConnectionRef.current.setRemoteDescription(
                new RTCSessionDescription(signal)
              );
              await processCandidateQueue();
            }
          }
        }
      } catch (error) {
        console.error("Error processing WebRTC signal:", error);
      }
    });

    return () => {
      socket.off("incoming-call");
      socket.off("call-accepted");
      socket.off("call-rejected");
      socket.off("call-ended");
      socket.off("webrtc-signal");
    };
  }, [socket, callState, callerInfo]);

  return {
    callState,
    callerInfo,
    callType,
    localStream,
    remoteStream,
    isMuted,
    isVideoOff,
    startCall,
    answerCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleVideo,
  };
};
