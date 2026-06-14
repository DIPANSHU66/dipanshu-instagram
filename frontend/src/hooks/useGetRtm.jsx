import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { addMessage } from "@/redux/chatslice";

const useGetRtm = () => {
  const dispatch = useDispatch();
  const { socket } = useSelector((store) => store.socketio);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      dispatch(addMessage(newMessage));
    };

    socket.on("newMessage", handleNewMessage);
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, dispatch]);
};

export default useGetRtm;
