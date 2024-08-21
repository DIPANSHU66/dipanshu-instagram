import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setuserProfile } from "@/redux/authSlice";

const useGetUserProfile = (userId) => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchuserProfile = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/user/${userId}/profile`,
          {
            withCredentials: true,
          }
        );
        if (res.data.success) {
          dispatch(setuserProfile(res.data.user));
        }
      } catch (e) {
        console.log(e);
      }
    };
    fetchuserProfile();
  }, [userId]);
};
export default useGetUserProfile;
