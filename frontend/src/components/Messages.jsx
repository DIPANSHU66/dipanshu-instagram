import React, { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import useGetAllmessage from "@/hooks/useGetAllmessage";
import useGetRtm from "@/hooks/useGetRtm";
import { toast } from "sonner";
import axios from "axios";
import { setselecteduser } from "@/redux/authSlice";

const Messages = ({ selecteduser }) => {
  const { messages } = useSelector((store) => store.chat);
  const { user } = useSelector((store) => store.auth);

  const scroll = useRef();
  useGetRtm();
  useGetAllmessage();
  const dispatch = useDispatch();

  const deletehandler = async (msg) => {
    if (!user || !msg || msg?.senderId !== user?._id) return;

    console.log(`Deleting message from sender ${msg.senderId}`);

    try {
      const res = await axios.post(
        `https://dipanshu-instagram.onrender.com/api/v1/message/delete`,
        { receiverId: msg.receiverId, senderId: msg.senderId, _id: msg._id },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        window.location.reload();
        toast.success(res.data.message);

        dispatch(setselecteduser(selecteduser));
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  // Use default values or empty strings to handle undefined/null cases
  const userProfilePicture = selecteduser?.profilePicture || "";
  const userUsername = selecteduser?.username || "Unknown User";
  const userId = selecteduser?._id || "";
  useEffect(() => {
    scroll.current?.scrollIntoView({ behaviour: "smooth" });
  }, [messages]);

  return (
    <div className=" flex-1 p-4">
      <div className="flex justify-center">
        <div className="flex flex-col items-center justify-center">
          <Avatar>
            <AvatarImage src={userProfilePicture} alt={userUsername} />
            <AvatarFallback>{userUsername[0]}</AvatarFallback>
          </Avatar>
          <span className="mt-2 text-lg font-semibold">{userUsername}</span>
          <Link to={`/profile/${userId}`}>
            <Button className="h-8 my-2" variant="secondary">
              View Profile
            </Button>
          </Link>
        </div>
      </div>
      <div className="flex flex-col gap-3 mt-4">
        {messages && messages.length > 0 ? (
          messages.map((msg) => (
            <div
              onClick={() => deletehandler(msg)}
              key={msg._id}
              className={`p-2 border-b flex  ${
                msg.senderId == user?._id ? "justify-end" : "justify-start"
              } `}
            >
              <div
                onClick={() => deletehandler(msg)}
                ref={scroll}
                className={`p-2 rounded-lg max-w-xs break-words ${
                  msg.senderId == user?._id
                    ? "bg-blue-500  text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                {" "}
                {msg.message}
              </div>
            </div>
          ))
        ) : (
          <div ref={scroll} className="text-center text-gray-500">
            No messages yet
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
