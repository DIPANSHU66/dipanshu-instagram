const express = require("express");
const router = express.Router();
const { isAuthentictaed } = require("../middlewares/isAuthenticated");
const {
  register,
  login,
  logout,
  getprofile,
  editprofile,
  getSuggestedUsers,
  followorunfollow,
} = require("../controllers/usercontroller");

const { upload } = require("../middlewares/multer");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/:id/profile", isAuthentictaed, getprofile);
router.post(
  "/profile/edit",
  isAuthentictaed,
  upload.single("profilePicture"),
  editprofile
);
router.get("/suggested", isAuthentictaed, getSuggestedUsers);
router.get("/followorunfollow/:id", isAuthentictaed, followorunfollow);

module.exports = router;
