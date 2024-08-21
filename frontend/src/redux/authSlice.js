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
  },
});

export const {
  setAuthUser,
  setSuggestedUser,
  setuserProfile,
  setselecteduser,
} = authSlice.actions;
export default authSlice.reducer;
