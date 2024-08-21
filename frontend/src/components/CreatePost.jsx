import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "./ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { readFileasDataUrL } from "@/lib/utils";
import { toast } from "sonner";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "@/redux/postSlice";
const CreatePost = ({ open, setopen }) => {
  const dispatch = useDispatch();
  const { posts } = useSelector((store) => store.post);
  const imageRef = useRef();
  const [file, setfile] = useState("");
  const [caption, setcaption] = useState("");
  const [loading, seloading] = useState(false);
  const [imagePreview, setimagePriview] = useState("");
  const { user } = useSelector((store) => store.auth);
  const filechangehandler = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setfile(file);
      const dataUrl = await readFileasDataUrL(file);
      setimagePriview(dataUrl);
    }
  };
  const createPostHandler = async (e) => {
    const formdata = new FormData();
    formdata.append("caption", caption);
    if (imagePreview) formdata.append("image", file);

    try {
      seloading(true);
      const res = await axios.post(
        "http://localhost:8000/api/v1/post/addpost",
        formdata,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        dispatch(setPosts([res.data.post, ...posts]));
        toast.success(res.data.message);
        setopen(false);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      seloading(false);
    }
  };
  return (
    <div>
      <Dialog open={open}>
        <DialogContent onInteractOutside={() => setopen(false)}>
          <DialogHeader className="text-center font-semibold  ">
            Create New Post
          </DialogHeader>
          <div className="flex gap-3 items-center">
            <Avatar>
              <AvatarImage src={user?.profilePicture} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-xs">{user?.username}</h1>
              <span className="font-semibold text-xs  text-gray-600">
                Bio here...
              </span>
            </div>
          </div>
          <textarea
            value={caption}
            onChange={(e) => setcaption(e.target.value)}
            className="w-full h-10 resize-none overflow-auto border-none outline-none"
            placeholder="Write a caption..."
          />
          {imagePreview && (
            <div className="flex items-center  justify-center">
              <img className=" h-[150px]" src={imagePreview} alt="" />
            </div>
          )}
          <input
            ref={imageRef}
            type="file"
            className="hidden"
            onChange={filechangehandler}
          />
          <Button
            onClick={() => imageRef.current.click()}
            className="w-fit mx-auto bg-[#0095F6] hover:bg-[#258bcf]"
          >
            Select from Device
          </Button>

          {imagePreview &&
            (loading ? (
              <Button>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please Wait
              </Button>
            ) : (
              <Button
                onClick={createPostHandler}
                type="submit"
                className="w-full"
              >
                Post
              </Button>
            ))}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreatePost;
