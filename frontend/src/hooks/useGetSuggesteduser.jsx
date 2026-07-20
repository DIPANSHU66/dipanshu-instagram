import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setSuggestedUser } from "@/redux/authSlice";

const useGetSuggesteduser = () => {
  const dispatch = useDispatch();
  const { SuggestedUsers } = useSelector((store) => store.auth);
  const suggestedRef = useRef(SuggestedUsers);
  suggestedRef.current = SuggestedUsers;

  useEffect(() => {
    const fetchsuggestedUsers = async () => {
      // Cache Check
      if (suggestedRef.current && suggestedRef.current.length > 0) {
        return;
      }

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/user/suggested`,
          {
            withCredentials: true,
          }
        );
        if (res.data.success) {
          dispatch(setSuggestedUser(res.data.users));
        }
      } catch (e) {
        console.log(e);
      }
    };
    fetchsuggestedUsers();
  }, [dispatch]);
};
export default useGetSuggesteduser;

