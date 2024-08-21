import { createSlice } from "@reduxjs/toolkit";
const rtnSlice = createSlice({
  name: "realtimenotification",
  initialState: {
    likenotification: [],
  },
  reducers: {
    setlikenotification: (state, action) => {
      if (action.payload.type == "like") {
        state.likenotification.push(action.payload);
      } else if (action.payload.type == "dislike") {
        state.likenotification = state.likenotification.filter(
          (item) => item.userId != action.payload.userId
        );
      }
    },
  },
});
export  const { setlikenotification } = rtnSlice.actions;
export default rtnSlice.reducer;
