import React, { useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { setselecteduser } from "@/redux/authSlice";
import { Button } from "./ui/button";
import { MessageCircle, Phone, Video, User } from "lucide-react";
import Messages from "../components/Messages";
import { setMessages } from "@/redux/chatslice";
import { useCall } from "../context/WebRTCContext";

const ChatPage = () => {
  const [textMessage, setTextMessage] = useState("");
  const { user, SuggestedUsers, selecteduser } = useSelector(
    (store) => store.auth
  );
  const { onlineuser, messages } = useSelector((store) => store.chat);
  const { startCall } = useCall();
  const dispatch = useDispatch();

  const sendMessageHandler = async (recieverId) => {
    if (!textMessage.trim()) return;
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/message/send/${recieverId}`,
        { textMessage },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        if (messages != null) {
          dispatch(setMessages([...messages, res.data.newMessage]));
        }
        setTextMessage("");
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="flex flex-1 h-screen bg-zinc-50/50">
      {/* Sidebar with Users list */}
      <section className="w-80 border-r border-zinc-200 bg-white flex flex-col my-0">
        <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
          <h1 className="font-bold text-xl text-zinc-850 tracking-tight">Messages</h1>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {SuggestedUsers?.map((suggesteduser) => {
            const isonline = onlineuser?.includes(suggesteduser?._id);
            const isSelected = selecteduser?._id === suggesteduser?._id;

            return (
              <div
                key={suggesteduser?._id}
                onClick={() => dispatch(setselecteduser(suggesteduser))}
                className={`flex gap-3 items-center p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "bg-zinc-100/80 shadow-sm"
                    : "hover:bg-zinc-50"
                }`}
              >
                <div className="relative">
                  <Avatar className="w-12 h-12 border border-zinc-200">
                    <AvatarImage src={suggesteduser?.profilePicture} />
                    <AvatarFallback>
                      <User className="w-6 h-6 text-zinc-400" />
                    </AvatarFallback>
                  </Avatar>
                  {isonline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                  )}
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-semibold text-zinc-800 text-sm truncate">
                    {suggesteduser?.username}
                  </span>
                  <span className="text-xs text-zinc-450 truncate">
                    {isonline ? "Active now" : "Offline"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Main Chat Interface */}
      {selecteduser ? (
        <section className="flex-1 flex flex-col bg-white">
          {/* Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-100 sticky top-0 bg-white/95 backdrop-blur-md z-10">
            <div className="flex gap-3 items-center">
              <div className="relative">
                <Avatar className="w-11 h-11 border border-zinc-200">
                  <AvatarImage src={selecteduser?.profilePicture} />
                  <AvatarFallback>
                    <User className="w-5 h-5 text-zinc-400" />
                  </AvatarFallback>
                </Avatar>
                {onlineuser?.includes(selecteduser?._id) && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-zinc-800 text-sm">
                  {selecteduser?.username}
                </span>
                <span className="text-xs text-zinc-450">
                  {onlineuser?.includes(selecteduser?._id) ? "Online" : "Offline"}
                </span>
              </div>
            </div>

            {/* Calling Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-full hover:bg-zinc-100 text-zinc-600 transition-colors"
                onClick={() => startCall(selecteduser._id, selecteduser.username, "audio")}
              >
                <Phone className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="w-10 h-10 rounded-full hover:bg-zinc-100 text-zinc-650 transition-colors"
                onClick={() => startCall(selecteduser._id, selecteduser.username, "video")}
              >
                <Video className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto">
            <Messages selecteduser={selecteduser} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-zinc-100 flex items-center gap-3">
            <input
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessageHandler(selecteduser?._id)}
              type="text"
              className="flex-1 bg-zinc-50 border border-zinc-200 rounded-full py-2.5 px-4 outline-none text-sm focus:border-zinc-350 focus:bg-white transition-all text-zinc-800 placeholder-zinc-400"
              placeholder="Send message..."
            />
            <Button
              onClick={() => sendMessageHandler(selecteduser?._id)}
              disabled={!textMessage.trim()}
              className="rounded-full bg-sky-500 hover:bg-sky-600 text-white font-medium px-5 transition-all shadow-sm"
            >
              Send
            </Button>
          </div>
        </section>
      ) : (
        /* Welcome / Empty Chat Screen */
        <div className="flex-1 flex flex-col items-center justify-center bg-zinc-50/30">
          <div className="w-20 h-20 rounded-full bg-zinc-100 flex items-center justify-center mb-4 border border-zinc-200/50">
            <MessageCircle className="w-10 h-10 text-zinc-500" />
          </div>
          <h1 className="font-semibold text-lg text-zinc-800">Your Messages</h1>
          <p className="text-zinc-500 text-sm mt-1">Send a message or place a video call to start chatting.</p>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
