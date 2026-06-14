import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    SuggestedUsers: [],
    userProfile: null,
    selecteduser: null,
  },
  reducers: {
    setAuthUser: (state, action) => {
      state.user = action.payload;
    },
    setSuggestedUser: (state, action) => {
      state.SuggestedUsers = action.payload;
    },
    setuserProfile: (state, action) => {
      state.userProfile = action.payload;
    },
    setselecteduser: (state, action) => {
      state.selecteduser = action.payload;
    },
    updateFollowersRealtime: (state, action) => {
      const { followerId, isFollowing, followerDetails } = action.payload;
      
      // Update logged in user followers if they are the target
      if (state.user) {
        const followers = state.user.followers || [];
        state.user.followers = isFollowing
          ? [...followers, followerId]
          : followers.filter((id) => id !== followerId);
      }
      
      // Update userProfile followers if it's the logged-in user's profile page
      if (state.userProfile && state.userProfile._id === state.user?._id) {
        const followers = state.userProfile.followers || [];
        state.userProfile.followers = isFollowing
          ? [...followers, followerId]
          : followers.filter((id) => id !== followerId);
      }
      
      // Update userProfile following list if the logged in user is viewing the follower's profile
      if (state.userProfile && state.userProfile._id === followerId) {
        const followers = state.userProfile.followers || [];
        state.userProfile.followers = isFollowing
          ? [...followers, state.user?._id]
          : followers.filter((id) => id !== state.user?._id);
      }
    },
  },
});

export const {
  setAuthUser,
  setSuggestedUser,
  setuserProfile,
  setselecteduser,
  updateFollowersRealtime,
} = authSlice.actions;
export default authSlice.reducer;
