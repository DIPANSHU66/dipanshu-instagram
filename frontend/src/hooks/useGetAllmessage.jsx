import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import axios from "axios";
import { setMessages } from "@/redux/chatslice";

const API_URL = "http://localhost:8000/api/v1/message";

const useGetAllmessage = () => {
  const dispatch = useDispatch();
  const { selecteduser } = useSelector((store) => store.auth);

  useEffect(() => {
    if (!selecteduser?._id) return;  // Exit if no selected user ID

    const fetchAllMessages = async () => {
      try {
        const res = await axios.get(
          `${API_URL}/all/${selecteduser._id}`,
          {
            withCredentials: true,
          }
        );
        if (res.data.success) {
          dispatch(setMessages(res.data.messages));
        } else {
          console.error("Failed to fetch messages:", res.data.message);
        }
      } catch (e) {
        console.error("Error fetching messages:", e);
      }
    };

    fetchAllMessages();
  }, [selecteduser?._id, dispatch]);  // Add specific dependency and dispatch

};

export default useGetAllmessage;
