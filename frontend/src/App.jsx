import "./App.css";
import Signup from "./components/Signup";
import MainLayout from "./components/MainLayout";
import Home from "./components/Home";
import Login from "./components/Login";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ChatPage from "./components/ChatPage";
import { io } from "socket.io-client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setsocket } from "./redux/socketSlice";
import { setonlineuser } from "./redux/chatslice";
import { setlikenotification } from "./redux/rtmSlice";
import ProtectedRoutes from "./components/ProtectedRoutes";
const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoutes>
        <MainLayout />
      </ProtectedRoutes>
    ),
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoutes>
            <Home />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/profile/:id",
        element: (
          <ProtectedRoutes>
            {" "}
            <Profile />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/account/edit",
        element: (
          <ProtectedRoutes>
            <EditProfile />
          </ProtectedRoutes>
        ),
      },
      {
        path: "/chat",
        element: (
          <ProtectedRoutes>
            <ChatPage />
          </ProtectedRoutes>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
]);

function App() {
  const dispatch = useDispatch();
  const { socket } = useSelector((store) => store.socketio);
  const { user } = useSelector((store) => store.auth);
  useEffect(() => {
    if (user) {
      const socketio = io("http://localhost:8000", {
        query: {
          userId: user?._id,
        },
        transports: ["websocket"],
      });

      dispatch(setsocket(socketio));

      socketio.on("getOnlineUsers", (onlineusers) => {
        dispatch(setonlineuser(onlineusers));
      });
      socketio.on("notification", (notification) => {
        dispatch(setlikenotification(notification));
      });

      return () => {
        socketio.close();
        dispatch(setsocket(null));
      };
    } else if (socket) {
      socket?.close();
      dispatch(setsocket(null));
    }
  }, [user, dispatch]);
  return (
    <div>
      <RouterProvider router={browserRouter} />
    </div>
  );
}

export default App;
