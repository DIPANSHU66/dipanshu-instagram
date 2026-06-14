import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import axios from "axios";
import { toast } from "sonner";
import { setAuthUser, setSuggestedUser } from "@/redux/authSlice";

const SuggestedUser = () => {
  const dispatch = useDispatch();
  const { SuggestedUsers, user } = useSelector((store) => store.auth);

  const followorunfollowHandler = async (targetId) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/user/followorunfollow/${targetId}`,
        {
          withCredentials: true,
        }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        
        const isFollowing = user?.following?.includes(targetId);
        
        // Update logged in user following list
        const updatedUser = {
          ...user,
          following: isFollowing
            ? (user.following || []).filter((id) => id !== targetId)
            : [...(user.following || []), targetId]
        };
        dispatch(setAuthUser(updatedUser));

        // Update suggested users' followers list
        const updatedSuggestedUsers = SuggestedUsers.map((su) => {
          if (su._id === targetId) {
            const followers = su.followers || [];
            return {
              ...su,
              followers: isFollowing
                ? followers.filter((id) => id !== user?._id)
                : [...followers, user?._id]
            };
          }
          return su;
        });
        dispatch(setSuggestedUser(updatedSuggestedUsers));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="my-10">
      <div className="flex items-center justify-between text-sm gap-6">
        <h1 className="text-gray-600 font-semibold">Suggested for You</h1>
        <span className="font-medium cursor-pointer">See All</span>
      </div>
      {SuggestedUsers?.map((suggestedUser) => {
        const isFollowing = user?.following?.includes(suggestedUser._id);
        return (
          <div
            key={suggestedUser._id}
            className="flex items-center justify-between  my-5  "
          >
            <div className="flex items-center gap-4">
              <Link to={`/profile/${suggestedUser._id}`}>
                <Avatar>
                  <AvatarImage src={suggestedUser?.profilePicture} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Link>
              <div className="">
                <h1 className="font-semibold text-sm">
                  <Link to={`/profile/${suggestedUser._id}`}>{suggestedUser?.username}</Link>
                </h1>
                <span className="text-gray-600  text-sm">
                  {suggestedUser?.bio || "Bio here"}
                </span>
              </div>
            </div>
            <span
              onClick={() => followorunfollowHandler(suggestedUser._id)}
              className={`text-sm font-bold cursor-pointer hover:opacity-80 ${
                isFollowing ? "text-red-500" : "text-[#3BADF8]"
              }`}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default SuggestedUser;
