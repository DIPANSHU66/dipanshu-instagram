const express = require("express");
const router = express.Router();
const {
  addnewpost,
  getAllPost,
  getuserpost,
  likepost,
  dislikedpost,
  adcomment,
  getcommentofPost,
  deletePost,
  bookmarksPost,
} = require("../controllers/postcontroller");
const { isAuthentictaed } = require("../middlewares/isAuthenticated");
const { upload } = require("../middlewares/multer");
router.post("/addpost", isAuthentictaed, upload.single("image"), addnewpost);
router.get("/all", isAuthentictaed, getAllPost);
router.get("/usetpost/all", isAuthentictaed, getuserpost);
router.get("/:id/like", isAuthentictaed, likepost);
router.get("/:id/dislike", isAuthentictaed, dislikedpost);
router.post("/:id/comment", isAuthentictaed, adcomment);
router.post("/id/comment/all", isAuthentictaed, getcommentofPost);
router.delete("/delete/:id", isAuthentictaed, deletePost);
router.get("/:id/bookmark", isAuthentictaed, bookmarksPost);
module.exports = router;
