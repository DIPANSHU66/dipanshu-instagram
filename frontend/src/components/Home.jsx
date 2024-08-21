import React from "react";
import Feed from "./Feed";
import Rightsidebar from "./Rightsidebar";
import UseGetAllPost from "@/hooks/UseGetAllPost";
import useGetSuggesteduser from "@/hooks/useGetSuggesteduser";
import { useEffect } from "react";
import { setselecteduser } from "@/redux/authSlice";
import { useDispatch } from "react-redux";
import { Outlet } from "react-router-dom";
const Home = () => {
  const dispatch = useDispatch();
  UseGetAllPost();
  useGetSuggesteduser();
  useEffect(() => {
    return () => {
      dispatch(setselecteduser(null));
    };
  }, []);
  return (
    <div className="flex ">
      <div className="flex-grow">
        <Feed></Feed>
        <Outlet></Outlet>
      </div>
      <Rightsidebar></Rightsidebar>
    </div>
  );
};

export default Home;
