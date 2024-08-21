import React, { useRef, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

import {
  Select,
  SelectTrigger,
  SelectItem,
  SelectValue,
  SelectContent,
} from "./ui/select";
import axios from "axios";
import { Loader2 } from "lucide-react";

import { toast } from "sonner";
import { setAuthUser } from "@/redux/authSlice";
import { useNavigate } from "react-router-dom";
const EditProfile = () => {
  const dispatch = useDispatch();
  const Navigate = useNavigate();
  const imageRef = useRef();
  const { user } = useSelector((store) => store.auth);
  const [loading, setloading] = useState(false);

  const [input, setinput] = useState({
    profilePhoto: user?.profilePicture,
    gender: user?.gender,
    bio: user?.bio,
  });

  const filechangehandler = (e) => {
    const file = e.target.files?.[0];
    if (file) setinput({ ...input, profilePhoto: file });
  };
  const selectchangehandler = (value) => {
    setinput({ ...input, gender: value });
  };

  const editProfilehandler = async () => {
    console.log(input);
    const formData = new FormData();
    formData.append("bio", input.bio);
    formData.append("gender", input.gender);
    if (input.profilePhoto) {
      formData.append("profilePicture", input.profilePhoto);
    }
    try {
      setloading(true);
      const res = await axios.post(
        "http://localhost:8000/api/v1/user/profile/edit",
         formData ,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        const updatedUserdata = {
          ...user,
          bio: res.data.user?.bio,
          profilePicture: res.data.user?.profilePicture,
          gender: res.data.user?.gender,
        };
        dispatch(setAuthUser(updatedUserdata));
        Navigate(`/profile/${user?._id}`);
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setloading(false);
    }
  };
  return (
    <div className="flex max-w-2xl   max-auto    pl-10">
      <section className="flex flex-col   gap-6 w-full  my-8">
        <h1 className="font-bold text-xl  ">Edit Profile</h1>
        <div className="flex items-center gap-32   bg-gray-100  rounded-xl p-4 ">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user?.profilePicture} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>

            <div>
              <h1 className="font-bold text-sm">{user?.username}</h1>
              <span className="text-gray-600">{user?.bio || "Bio here"}</span>
            </div>
          </div>
          <input
            onChange={filechangehandler}
            ref={imageRef}
            type="file"
            className="hidden"
          />
          <Button
            onClick={() => imageRef?.current?.click()}
            className="bg-[#0095F6] h-8 hover:bg-[#318bc7]"
          >
            Change Photo
          </Button>
        </div>
        <div>
          <h1 className="font-bold text-xl  mb-2">Bio</h1>
          <Textarea
            value={input.bio}
            onChange={(e) => setinput({ ...input, bio: e.target.value })}
            name="bio"
            className="focus-visible:ring-transparent"
          />
        </div>
        <div>
          <h1 className="font-bold mb-2">Gender</h1>
          <Select
            defaultValue={input.gender}
            onValueChange={selectchangehandler}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end">
          {loading ? (
            <Button className="w-fit   bg-[#0095F6] h-8 hover:bg-[#2aBccd] ">
              <Loader2 className="mr-2 h-4 w-4 animate-spin"></Loader2>
              Please Wait
            </Button>
          ) : (
            <Button
              onClick={editProfilehandler}
              className="w-fit   bg-[#0095F6] h-8 hover:bg-[#2aBccd] "
            >
              Submit
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default EditProfile;
