import "./App.css";
import Signup from "./components/Signup";
import MainLayout from "./components/MainLayout";
import Home from "./components/Home";
import Login from "./components/Login";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ChatPage from "./components/ChatPage";
import Explore from "./components/Explore";
import { io } from "socket.io-client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setsocket } from "./redux/socketSlice";
import { setonlineuser } from "./redux/chatslice";
import { setlikenotification } from "./redux/rtmSlice";
import {
  likePostRealtime,
  dislikePostRealtime,
  addCommentRealtime,
} from "./redux/postSlice";
import { updateFollowersRealtime } from "./redux/authSlice";
import ProtectedRoutes from "./components/ProtectedRoutes";
import { WebRTCOverlay } from "./context/WebRTCContext";

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
      {
        path: "/explore",
        element: (
          <ProtectedRoutes>
            <Explore />
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
      const socketUrl = import.meta.env.VITE_API_URL.replace("/api/v1", "");
      const socketio = io(socketUrl, {
        query: {
          userId: user?._id,
        },
        // BEFORE STATE: Default Socket.io behavior (HTTP polling → WebSocket upgrade)
      });

      dispatch(setsocket(socketio));

      socketio.on("getOnlineUsers", (onlineusers) => {
        dispatch(setonlineuser(onlineusers));
      });
      socketio.on("notification", (notification) => {
        dispatch(setlikenotification(notification));
      });
      socketio.on("postLiked", ({ postId, userId }) => {
        dispatch(likePostRealtime({ postId, userId }));
      });
      socketio.on("postDisliked", ({ postId, userId }) => {
        dispatch(dislikePostRealtime({ postId, userId }));
      });
      socketio.on("postCommentAdded", ({ postId, comment }) => {
        dispatch(addCommentRealtime({ postId, comment }));
      });
      socketio.on(
        "followStatusUpdated",
        ({ followerId, isFollowing, followerDetails }) => {
          dispatch(
            updateFollowersRealtime({
              followerId,
              isFollowing,
              followerDetails,
            }),
          );
        },
      );

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
    <WebRTCOverlay>
      <RouterProvider router={browserRouter} />
    </WebRTCOverlay>
  );
}

export default App;
