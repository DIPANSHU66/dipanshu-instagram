import React from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { setselecteduser } from "@/redux/authSlice";
import { Button } from "./ui/button";
import { MessageCircle } from "lucide-react";
import Messages from "../components/Messages";
import { setMessages } from "@/redux/chatslice";
import { useState } from "react";

const ChatPage = () => {
  const [textMessage, setTextMessage] = useState("");
  const { user, SuggestedUsers, selecteduser } = useSelector(
    (store) => store.auth
  );

  const { onlineuser, messages } = useSelector((store) => store.chat);

  const dispatch = useDispatch();

  const sendMessageHandler = async (recieverId) => {
    try {
      const res = await axios.post(
        `https://dipanshu-instagram.onrender.com/api/v1/message/send/${recieverId}`,
        { textMessage },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        if (messages != null)
          dispatch(setMessages([...messages, res.data.newMessage]));

        setTextMessage("");
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div className="flex h-screen">
      <section className="w-full   md:1/4 my-8">
        <h1 className="font-bold mb-4  px-3 text-xl">{user?.username}</h1>
        <hr className="mb-4 border-gray-300 " />
        <div className="overflow-y-auto h-[80vh]">
          {SuggestedUsers?.map((suggesteduser) => {
            const isonline = onlineuser?.includes(suggesteduser?._id);

            return (
              <div
                key={suggesteduser?._id}
                onClick={() => dispatch(setselecteduser(suggesteduser))}
                className="flex gap-3  items-center p-3 hover:bg-gray-50 cursor-pointer"
              >
                <Avatar className="w-14 h-14">
                  <AvatarImage
                    src={suggesteduser?.profilePicture}
                  ></AvatarImage>
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="flex flex-col ">
                  <span className="font-medium">{suggesteduser?.username}</span>

                  <span
                    className={`text-xs font-bold ${
                      isonline ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isonline ? "online" : "offline"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      {selecteduser ? (
        <section className="flex-1  border-l pl-36 border-l-gray-300 flex  flex-col h-full">
          <div className="flex gap-3  items-center px-3 py-2 border-b border-gray-300 sticky top-0 bg-white z-10">
            <Avatar className="w-14 h-14">
              <AvatarImage src={selecteduser?.profilePicture} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span>{selecteduser?.username}</span>
            </div>
          </div>
          <Messages selecteduser={selecteduser} />
          <div className="flex items-center  justify-center p-6 ">
            <input
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              type="text"
              className=" flex-1  outline-none  mr-2  focus-visible:ring-transparent"
              placeholder="Messages..."
            />
            <Button onClick={() => sendMessageHandler(selecteduser?._id)}>
              Send
            </Button>
          </div>
        </section>
      ) : (
        <div className="flex  flex-col items-center justify-center pl-36 ">
          <MessageCircle className="w-32 h-32 my-4" />
          <h1 className="font-medium text-xl">Your Messages</h1>
          <span>Send a Message to start a chat</span>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
