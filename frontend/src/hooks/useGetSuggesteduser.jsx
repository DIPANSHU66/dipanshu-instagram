import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setSuggestedUser } from "@/redux/authSlice";
const useGetSuggesteduser = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchsuggestedUsers = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8000/api/v1/user/suggested",
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
  }, []);
};
export default useGetSuggesteduser;
