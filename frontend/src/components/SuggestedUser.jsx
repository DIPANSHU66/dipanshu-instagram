import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
const SuggestedUser = () => {
  const { SuggestedUsers } = useSelector((store) => store.auth);

  return (
    <div className="my-10">
      <div className="flex items-center justify-between text-sm gap-6">
        <h1 className="text-gray-600 font-semibold">Suggested for You</h1>
        <span className="font-medium cursor-pointer">See All</span>
      </div>
      {SuggestedUsers.map((user) => {
        return (
          <div
            key={user._id}
            className="flex items-center justify-between  my-5  "
          >
            <div className="flex items-center gap-4">
              <Link to={`/profile/${user._id}`}>
                <Avatar>
                  <AvatarImage src={user?.profilePicture} />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Link>
              <div className="">
                <h1 className="font-semibold text-sm">
                  <Link to={`/profile/${user._id}`}>{user?.username}</Link>
                </h1>
                <span className="text-gray-600  text-sm">
                  {user?.bio || "Bio here"}
                </span>
              </div>
            </div>
            <span className="text-[#3BADF8]   text-sm font-bold   cursor-pointer  hover:text-[#a3d3f7]  ">
              Follow
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default SuggestedUser;
