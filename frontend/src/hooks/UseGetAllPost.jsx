import { useDispatch } from "react-redux";
import { setPosts } from "@/redux/postSlice";
import { useEffect } from "react";
import axios from "axios";
const UseGetAllPost = () => {

  const dispatch = useDispatch();

  useEffect(() => {
    
    const fetchAllPost = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/v1/post/all", {
          withCredentials: true,
        });
        if (res.data.success) {
          dispatch(setPosts(res.data.posts));
        }
      } catch (e) {
        console.log(e);
      }
    };
    fetchAllPost();
  }, []);
};

export default UseGetAllPost;
