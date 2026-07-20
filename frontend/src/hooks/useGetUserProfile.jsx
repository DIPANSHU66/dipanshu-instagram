import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setuserProfile } from "@/redux/authSlice";

const useGetUserProfile = (userId) => {
  const dispatch = useDispatch();
  const { userProfile } = useSelector((store) => store.auth);
  const profileRef = useRef(userProfile);
  profileRef.current = userProfile;

  useEffect(() => {
    const fetchuserProfile = async () => {
      // Cache Check: If profile is already in Redux and ID matches the requested userId
      if (profileRef.current && profileRef.current._id === userId) {
        return;
      }

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/user/${userId}/profile`,
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
  }, [userId, dispatch]);
};
export default useGetUserProfile;

