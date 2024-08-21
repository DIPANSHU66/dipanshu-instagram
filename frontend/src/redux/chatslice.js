import { createSlice } from "@reduxjs/toolkit";
const chatSlice = createSlice({
  name: "chat",
  initialState: {
    onlineuser: [],
    messages: [],
  },
  reducers: {
    setonlineuser: (state, action) => {
      state.onlineuser = action.payload;
    },
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
  },
});
export const { setonlineuser, setMessages } = chatSlice.actions;
export default chatSlice.reducer;
