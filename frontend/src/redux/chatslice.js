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
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
  },
});
export const { setonlineuser, setMessages, addMessage } = chatSlice.actions;
export default chatSlice.reducer;
