import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "@/redux/postSlice";
import { useEffect, useRef } from "react";
import axios from "axios";

const UseGetAllPost = () => {
  const dispatch = useDispatch();
  const { posts } = useSelector((store) => store.post);
  const postsRef = useRef(posts);
  postsRef.current = posts;

  useEffect(() => {
    const fetchAllPost = async () => {
      // Cache Check
      if (postsRef.current && postsRef.current.length > 0) {
        return;
      }

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/post/all`,
          {
            withCredentials: true,
          },
        );
        if (res.data.success) {
          dispatch(setPosts(res.data.posts));
        }
      } catch (e) {
        console.log(e);
      }
    };
    fetchAllPost();
  }, [dispatch]);
};

export default UseGetAllPost;
