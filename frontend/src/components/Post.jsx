import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Bookmark, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import { Button } from "./ui/button";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import CommentDialog from "./CommentDialog";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { setPosts, setselectedPost } from "@/redux/postSlice";
import { Badge } from "./ui/badge";

const Post = ({ post }) => {
  const { user, SuggestedUsers } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const [liked, setliked] = useState(post.likes.includes(user?._id) || false);
  const dispatch = useDispatch();
  const [text, setText] = useState("");
  const [open, setopen] = useState(false);
  const [postlike, setpostlike] = useState(post.likes.length);
  const [comment, setcomment] = useState(post.comments);

  useEffect(() => {
    if (post) {
      setcomment(post.comments);
    }
  }, [post]);

  const changeventhandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  };
  const likeordislikeHandler = async (e) => {
    e.preventDefault();
    try {
      const action = liked ? "dislike" : "like";
      const res = await axios.get(
        `http://localhost:8000/api/v1/post/${post._id}/${action}`,
        { withCredentials: true }
      );
      console.log(res);
      if (res.data.success) {
        const updateslikes = liked ? postlike - 1 : postlike + 1;
        setpostlike(updateslikes);
        setliked(!liked);

        const updatedPostdata = posts.map((p) =>
          p._id == post._id
            ? {
                ...p,
                likes: liked
                  ? p.likes.filter((id) => id != user._id)
                  : [...p.likes, user._id],
              }
            : p
        );
        dispatch(setPosts(updatedPostdata));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const deltePosthandler = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.delete(
        `http://localhost:8000/api/v1/post/delete/${post._id}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        const updatedPostdata = posts.filter(
          (postItem) => postItem._id !== post._id
        );
        dispatch(setPosts(updatedPostdata));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const commenthandler = async () => {
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/post/${post._id}/comment`,
        { text },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        const updatedcommentdata = [...comment, res.data.comment];
        setcomment(updatedcommentdata);
        const updatedPostdata = posts.map((p) =>
          p._id === post._id ? { ...p, comments: updatedcommentdata } : p
        );
        dispatch(setPosts(updatedPostdata));
        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const bookmarkhandler = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/post/${post?._id}/bookmark`,
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const followhandler = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/user/followorunfollow/${post?.author?._id}`,
        {
          withCredentials: true,
        }
      );
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };
  return (
    <div className="my-8 w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={post?.author?.profilePicture} alt="post_image" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex  items-center  gap-5 ">
            <h1>{post?.author?.username}</h1>
            {user?._id == post.author?._id && (
              <Badge variant="secondary">Author</Badge>
            )}
          </div>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <MoreHorizontal className="cursor-pointer" />
          </DialogTrigger>
          <DialogContent className="flex flex-col items-center text-sm text-center">
            {post?.author?._id !== user?._id && (
              <Button
                onClick={followhandler}
                variant="ghost"
                className="cursor-pointer w-fit text-[#ED4956] font-bold"
              >
                {post && post?.author?.followers?.includes(user?._id)
                  ? "Unfollow"
                  : "Follow"}
              </Button>
            )}

            <Button variant="ghost" className="cursor-pointer w-fit ">
              Add to favorites
            </Button>
            {user && user?._id == post?.author?._id && (
              <Button
                onClick={deltePosthandler}
                variant="ghost"
                className="cursor-pointer w-fit"
              >
                Delete
              </Button>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <img
        className="rounded-sm my-2 w-full object-cover "
        src={post.image}
        alt="post_img"
      />
      <div className="flex items-center  justify-between my-2">
        <div className="flex   items-center  gap-3">
          {liked ? (
            <FaHeart
              onClick={likeordislikeHandler}
              className="text-red-600"
              size={"22px"}
            ></FaHeart>
          ) : (
            <FaRegHeart
              onClick={likeordislikeHandler}
              className=" hover:text-red-600"
              size={"22px"}
            ></FaRegHeart>
          )}

          <MessageCircle
            onClick={() => {
              dispatch(setselectedPost(post));
              setopen(true);
            }}
            className="cursor-pointer hover:text-red-900"
          ></MessageCircle>
          <Send className="cursor-pointer   hover:text-red-900"></Send>
        </div>
        <Bookmark
          onClick={bookmarkhandler}
          className="cursor-pointer   hover:text-red-900"
        ></Bookmark>
      </div>
      <span className="font-medium  block mb-2">{postlike} Likes</span>
      <p>
        <span className="font-medium mr-2">{post?.author?.username}</span>
        {post.caption}
      </p>
      {comment.length >= 0 && (
        <span
          onClick={() => {
            dispatch(setselectedPost(post));
            setopen(true);
          }}
          className="cursor-pointer text-sm text-gray-400 text-bold"
        >
          View all {comment.length} comments
        </span>
      )}

      <CommentDialog open={open} setopen={setopen} />
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Add  a Comment..."
          className="outline-none text-sm w-full"
          value={text}
          onChange={changeventhandler}
        />
        {text && (
          <span onClick={commenthandler} className="text-[#3BADF8]">
            Post
          </span>
        )}
      </div>
    </div>
  );
};

export default Post;
