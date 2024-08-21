import {
  Heart,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  TrendingUp,
} from "lucide-react";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";
import CreatePost from "./CreatePost";
import { setPosts, setselectedPost } from "@/redux/postSlice";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
const LeftSidebar = () => {
  const [open, setopen] = useState(false);
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const { likenotification } = useSelector(
    (store) => store.realtimenotification
  );
  const logouthandler = async () => {
    try {
      const res = await axios.get("https://dipanshu-instagram.onrender.com/api/v1/user/logout", {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setAuthUser(null));
        dispatch(setselectedPost(null));
        dispatch(setPosts([]));
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const sidehandler = (texttype) => {
    if (texttype == "Logout") logouthandler();
    else if (texttype == "Create") setopen(true);
    else if (texttype == "Profile") navigate(`/profile/${user?._id}`);
    else if (texttype == "Home") navigate("/");
    else if (texttype == "Messages") navigate("/chat");
  
  };
  const sidebaritems = [
    {
      icon: <Home></Home>,
      text: "Home",
    },
    {
      icon: <Search></Search>,
      text: "Search",
    },
    {
      icon: <TrendingUp></TrendingUp>,
      text: "Explore",
    },
    {
      icon: <MessageCircle></MessageCircle>,
      text: "Messages",
    },
    {
      icon: <Heart></Heart>,
      text: "Notifications",
    },
    {
      icon: <PlusSquare></PlusSquare>,
      text: "Create",
    },
    {
      icon: (
        <Avatar className="w-8 h-8">
          <AvatarImage src={user?.profilePicture} />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
    {
      icon: <LogOut></LogOut>,
      text: "Logout",
    },
  ];
  return (
    <div className="flex flex-col  md:w-1/64 lg:w-1/64 min-h-screen border-r border-gray-300">
      <div className="flex flex-col">
        <h1 className="text-xl p-3 font-bold">LOGO</h1>
        <div className="flex flex-col">
          {sidebaritems.map((item, index) => {
            return (
              <div
                onClick={() => sidehandler(item.text)}
                key={index}
                className="flex items-center gap-2  relative hover:bg-gray-100 cursor-pointer rounded-lg p-3 my-2"
              >
                {item.icon}
                <span className="hidden md:inline">{item.text}</span>
                {item.text == "Notifications" &&
                  likenotification.length > 0 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          size="icon"
                          className="rounded-full h-5 w-5 absolute bottom-6 left-6  bg-red-600   hover:bg-red-600"
                        >
                          {likenotification.length}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div>
                          {likenotification.length == 0 ? (
                            <p>No new notification</p>
                          ) : (
                            likenotification.map((notification) => {
                              return (
                                <div
                                  key={notification.userId}
                                  className="flex items-center gap-2  my-2"
                                >
                                  <Avatar>
                                    <AvatarImage
                                      src={
                                        notification?.userDetails
                                          ?.profilePicture
                                      }
                                    />
                                    <AvatarFallback>CN</AvatarFallback>
                                  </Avatar>
                                  <p className="text-sm">
                                    <span className="font-bold">
                                      {notification?.userDetails?.username +
                                        "  "}
                                    </span>
                                    Liked your Post
                                  </p>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
              </div>
            );
          })}
        </div>
      </div>
      <CreatePost open={open} setopen={setopen}></CreatePost>
    </div>
  );
};

export default LeftSidebar;
