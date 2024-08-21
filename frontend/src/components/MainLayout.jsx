import React from "react";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./LeftSidebar";
const MainLayout = () => {
  return (
    <div className="flex flex-row gap-8">
      <LeftSidebar></LeftSidebar>
      <Outlet></Outlet>
      
    </div>
  );
};

export default MainLayout;
