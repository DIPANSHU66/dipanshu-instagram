import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import { useDispatch, useSelector } from "react-redux";
import Comment from "./Comment";
import axios from "axios";
import { toast } from "sonner";
import { setPosts } from "@/redux/postSlice";
const CommentDialog = ({ open, setopen }) => {
  const dispatch = useDispatch();
  const [text, setText] = useState("");
  const { selectedPost, posts } = useSelector((store) => store.post);

  const { user } = useSelector((store) => store.auth);

  const [comment, setcomment] = useState([]);
  useEffect(() => {
    if (selectedPost) {
      setcomment(selectedPost.comments);
    }
  }, [selectedPost]);

  const changeEventhandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  };
  const sendMessageHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `http://localhost:8000/api/v1/post/${selectedPost._id}/comment`,
        { text },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      console.log(res.data);
      if (res.data.success) {
        const updatedcommentdata = [...comment, res.data.comment];

        setcomment(updatedcommentdata);
        const updatepostdata = posts.map((p) =>
          p._id == selectedPost._id ? { ...p, comments: updatedcommentdata } : p
        );
        dispatch(setPosts(updatepostdata));

        toast.success(res.data.message);
        setText("");
      }
    } catch (error) {
      console.log(error);
    }
  };
  console.log(selectedPost);

  const followhandler = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/user/followorunfollow/${selectedPost?.author?._id}`,
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
    <Dialog open={open}>
      <DialogContent
        onInteractOutside={() => setopen(false)}
        className="max-w-2xl p-0  flex flex-col"
      >
        <div className="flex flex-1">
          <div className="w-1/2">
            <img
              src={selectedPost?.image}
              alt="post_img"
              className="w-full h-full object-cover rounded-l-lg"
            />
          </div>

          <div className="w-1/2 flex  flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex gap-3 items-center">
                <Link>
                  <Avatar>
                    <AvatarImage src={selectedPost?.author?.profilePicture} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </Link>
                <div>
                  <Link className="font-semibold  text-xs ">
                    {selectedPost?.author?.username}
                  </Link>
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <MoreHorizontal className="cursor-pointer" />
                </DialogTrigger>
                <DialogContent className="flex flex-col  items-center  justify-between text-sm text-center ">
                  <div
                    onClick={followhandler}
                    className="cursor-pointer w-full text-[#ED4956]  font-bold"
                  >
                    {selectedPost?.author?.followers?.includes(user?._id)
                      ? "Unfollow"
                      : "Follow"}
                  </div>
                  <div className="cursor-pointer w-full   font-bold ">
                    Add to Favorites
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <hr />
            <div className="flex-1 overflow-auto max-h-96 p-4">
              {comment?.map((comment) => (
                <Comment key={comment?._id} comment={comment} />
              ))}
            </div>
            <div className="p-4">
              <div className="flex items-center">
                <input
                  value={text}
                  onChange={changeEventhandler}
                  className="w-full outline-none  border-gray-300  rounded"
                  type="text"
                  placeholder="Add a comment ..."
                />
                <Button
                  disabled={!text.trim()}
                  onClick={sendMessageHandler}
                  size="small"
                  variant="outline"
                >
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
