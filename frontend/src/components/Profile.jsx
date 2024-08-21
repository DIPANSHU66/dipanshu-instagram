import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import useGetUserProfile from "@/hooks/useGetUserProfile";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { AtSign, Heart, MessageCircle } from "lucide-react";

import axios from "axios";
import { toast } from "sonner";

const Profile = () => {
  const params = useParams();
  const userId = params.id;
  useGetUserProfile(userId);
  const { userProfile, user } = useSelector((store) => store.auth);
  const isloggedInuserProfile = user?._id == userProfile?._id;
  const [activetab, setActiveTab] = useState("posts");
  const handletabchange = (tab) => {
    setActiveTab(tab);
  };
  const displayed =
    activetab === "posts" ? userProfile?.posts : userProfile?.bookmarks;

  const followhandler = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/v1/user/followorunfollow/${userProfile._id}`,
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
    <div className="flex  my-16">
      <div className="flex flex-col"></div>
      <div className="grid grid-cols-2">
        <section>
          <Avatar className="h-32 w-32">
            <AvatarImage src={userProfile?.profilePicture} alt="profilePhoto" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </section>
        <section>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 ">
              <span>{userProfile?.username}</span>
              {isloggedInuserProfile ? (
                <>
                  <Link to="/account/edit">
                    <Button
                      variant="secondary"
                      className="hover:bg-gray-200 h-8"
                    >
                      Edit Profile
                    </Button>
                  </Link>
                  <Button variant="secondary" className="hover:bg-gray-200 h-8">
                    View archive{" "}
                  </Button>
                  <Button variant="secondary" className="hover:bg-gray-200 h-8">
                    Add Tools
                  </Button>
                </>
              ) : (
                <>
                  <>
                    <Button
                      onClick={followhandler}
                      variant="secondary"
                      className="bg-blue-500  hover:bg-blue-600"
                    >
                      {userProfile?.followers?.includes(user._id)
                        ? "Unfollow"
                        : "Follow"}
                    </Button>
                    <Button
                      variant="secondary"
                      className={`${
                        userProfile?.followers?.includes(user._id)
                          ? " "
                          : "hidden"
                      }`}
                    >
                      Message
                    </Button>
                  </>
                </>
              )}
            </div>
            <div className="flex items-center  gap-4 ">
              <p>
                <span className="font-semibold">
                  {userProfile?.posts.length}
                </span>
                Posts
              </p>
              <p>
                <span className="font-semibold">
                  {userProfile?.followers.length}
                </span>
                followers
              </p>
              <p>
                <span className="font-semibold">
                  {userProfile?.following.length}
                </span>
                following
              </p>
            </div>
            <div className="flex flex-col  gap-1">
              <span className="font-semibold">
                {userProfile?.bio || "Bio here..."}
              </span>
              <Badge className="w-fit" variant="secondary">
                <AtSign />
                <span className="p-1"> {userProfile?.username}</span>
              </Badge>
              <span>😉Learn Coding With Dipanshu Bansal Style</span>
              <span>😉Message for Collaborate</span>
            </div>
          </div>
        </section>
        <div className="border-t border-t-gray-200  mx-auto">
          <div className="flex items-center justify-center  gap-10 text-sm">
            <span
              className={`py-3 cursor-pointer ${
                activetab == "posts" ? "text-blue-700" : ""
              }`}
              onClick={() => handletabchange("posts")}
            >
              POSTS
            </span>
            <span
              className={`py-3 cursor-pointer ${
                activetab === "saved" ? "text-blue-700" : ""
              }`}
              onClick={() => handletabchange("saved")}
            >
              SAVED
            </span>
            <span className="py-3 cursor-pointer">REELS</span>
            <span className="py-3 cursor-pointer">TAGS</span>
          </div>
          <div className="grid grid-cols-2 gap-5">
            {displayed?.map((post) => {
              return (
                <div
                  key={post?._id}
                  className="relative   group cursor-pointer"
                >
                  <img
                    src={post.image}
                    alt="postimage"
                    className="rounded-sm my-2 w-full aspect-square object-cover border"
                  />
                  <div className="absolute  inset-0 flex items-center justify-center bg-black bg-opacity-50  opacity-0  group-hover:opacity-100 transition-opacity duration-300">
                    <div className=" flex items-center text-white   space-x-2">
                      <button className=" px-1 py-1 text-sm flex items-center gap-1  hover:text-gray-300">
                        <Heart />
                        <span>{post?.likes.length}</span>
                      </button>
                      <button className="  px-1 py-1 text-sm flex items-center  gap-1 hover:text-gray-300">
                        <MessageCircle />
                        <span>{post?.comments.length}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
