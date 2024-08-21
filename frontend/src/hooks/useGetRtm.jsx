import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { setMessages } from "@/redux/chatslice";
const useGetRtm = () => {
  const dispatch = useDispatch();
  const { socket } = useSelector((store) => store.socketio);
  const { messages } = useSelector((store) => store.chat);

  useEffect(() => {
    socket?.on("newMessage", (newMessage) => {
      dispatch(setMessages([...messages, newMessage]));
    });
    return () => {
      socket?.off('newMessage');
    };
  }, [messages, setMessages]);
};

export default useGetRtm;
