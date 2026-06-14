import { createSlice } from "@reduxjs/toolkit";
const postSlice = createSlice({
  name: "post",
  initialState: {
    posts: [],
    selectedPost: null,
  },
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
    },
    setselectedPost: (state, action) => {
      state.selectedPost = action.payload;
    },
    likePostRealtime: (state, action) => {
      const { postId, userId } = action.payload;
      state.posts = state.posts.map((p) => {
        if (p._id === postId) {
          if (!p.likes.includes(userId)) {
            return { ...p, likes: [...p.likes, userId] };
          }
        }
        return p;
      });
      if (state.selectedPost && state.selectedPost._id === postId) {
        if (!state.selectedPost.likes.includes(userId)) {
          state.selectedPost.likes.push(userId);
        }
      }
    },
    dislikePostRealtime: (state, action) => {
      const { postId, userId } = action.payload;
      state.posts = state.posts.map((p) => {
        if (p._id === postId) {
          return { ...p, likes: p.likes.filter((id) => id !== userId) };
        }
        return p;
      });
      if (state.selectedPost && state.selectedPost._id === postId) {
        state.selectedPost.likes = state.selectedPost.likes.filter((id) => id !== userId);
      }
    },
    addCommentRealtime: (state, action) => {
      const { postId, comment } = action.payload;
      state.posts = state.posts.map((p) => {
        if (p._id === postId) {
          const exists = p.comments.some((c) => c._id === comment._id);
          if (!exists) {
            return { ...p, comments: [...p.comments, comment] };
          }
        }
        return p;
      });
      if (state.selectedPost && state.selectedPost._id === postId) {
        const exists = state.selectedPost.comments.some((c) => c._id === comment._id);
        if (!exists) {
          state.selectedPost.comments.push(comment);
        }
      }
    },
  },
});
export const {
  setPosts,
  setselectedPost,
  likePostRealtime,
  dislikePostRealtime,
  addCommentRealtime,
} = postSlice.actions;
export default postSlice.reducer;
