import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import SuggestedUser from "./SuggestedUser";
const Rightsidebar = () => {
  const { user } = useSelector((store) => store.auth);
  return (
    <div className="w-fit my-20 pl-24">
      <div className="flex items-center gap-4">
        <Link to={`/profile/${user?._id}`}>
          <Avatar>
            <AvatarImage src={user?.profilePicture} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Link>
        <div className="">
          <h1 className="font-semibold text-sm">
            <Link to={`/profile/${user?._id}`}>{user?.username}</Link>
          </h1>
          <span className="text-gray-600  text-sm">
            {user?.bio || "Bio here"}
          </span>
        </div>
      </div>
      <SuggestedUser />
    </div>
  );
};

export default Rightsidebar;
