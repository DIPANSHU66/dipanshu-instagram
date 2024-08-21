const User = require("../Models/usermodel");
const bcyrpt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDatauri } = require("../utils/datauri");
const { cloudinary } = require("../utils/cloudinary");
const Post = require("../Models/postmodel");

require("dotenv").config({});

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res
        .status(401)
        .json({ message: "Something is missing Please Check", success: false });
    }

    let user = await User.findOne({ email });

    if (user) {
      return res
        .status(401)
        .json({ message: "Try different Email id", success: false });
    }
    const hashedPassword = await bcyrpt.hash(password, 10);
    await User.create({ username, email, password: hashedPassword });
    return res
      .status(201)
      .json({ message: "Account Created Successfully", success: true });
  } catch (error) {
    console.log(error);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({
        message: "Something is missing, please check!",
        success: false,
      });
    }
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Incorrect email or password",
        success: false,
      });
    }
    const isPasswordMatch = await bcyrpt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Incorrect email or password",
        success: false,
      });
    }

    const token = await jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    // populate each post if in the posts array
    const populatedPosts = await Promise.all(
      user.posts.map(async (postId) => {
        const post = await Post.findById(postId);
        if (post.author.equals(user._id)) {
          return post;
        }
        return null;
      })
    );
    user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      posts: populatedPosts,
    };
    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: `Welcome back ${user.username}`,
        success: true,
        user,
      });
  } catch (error) {
    console.log(error);
  }
};
const logout = async (req, res) => {
  try {
    return res
      .cookie("token", "", { maxAge: 0 })
      .json({ message: "Logged Out Succesfully", success: true });
  } catch (e) {
    console.log(e);
  }
};

const getprofile = async (req, res) => {
  try {
    const userId = req.params.id;
    let user = await User.findById(userId)
      .populate({ path: "posts", createdAt: -1 })
      .populate("bookmarks");
    return res.status(200).json({ user, success: true });
  } catch (e) {
    console.log(e);
  }
};

const editprofile = async (req, res) => {
  try {
    const userId = req.id;
    const { bio, gender } = req.body;
    const profilePicture = req.file;

    let cloudResponse;

    if (profilePicture) {
      const fileUri = getDatauri(profilePicture);
      cloudResponse = await cloudinary.uploader.upload(fileUri);
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not Found", success: false });
    }
    if (bio) user.bio = bio;
    if (gender) user.gender = gender;
    if (profilePicture) user.profilePicture = cloudResponse.secure_url;
    await user.save();
    return res
      .status(200)
      .json({ message: "Profile Updataed", success: true, user });
  } catch (e) {
    console.log(e);
  }
};
const getSuggestedUsers = async (req, res) => {
  try {
    const suggestedusers = await User.find({ _id: { $ne: req.id } }).select(
      "-password"
    );
    if (!suggestedusers)
      return res
        .status(400)
        .json({ message: "Currently do not have any  users" });
    return res.status(200).json({ success: true, users: suggestedusers });
  } catch (e) {
    console.log(e);
  }
};
const followorunfollow = async (req, res) => {
  try {
    const followkreneWala = req.id;
    const jiskofollowkrunga = req.params.id;
   
    if (followkreneWala === jiskofollowkrunga)
      return res
        .status(400)
        .json({ message: "You can not Follow/Unfollow to Yourself" });
    const user = await User.findById(followkreneWala);
    const targetuser = await User.findById(jiskofollowkrunga);
    if (!user || !targetuser)
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    const isfollowing = user.following.includes(jiskofollowkrunga);
    if (isfollowing) {
      await Promise.all([
        User.updateOne(
          { _id: followkreneWala },
          { $pull: { following: jiskofollowkrunga } }
        ),
        User.updateOne(
          { _id: jiskofollowkrunga },
          { $pull: { followers: followkreneWala } }
        ),
      ]);
      return res
        .status(200)
        .json({ message: "Unfollowed SuccessFully", success: true });
    } else {
      await Promise.all([
        User.updateOne(
          { _id: followkreneWala },
          { $push: { following: jiskofollowkrunga } }
        ),
        User.updateOne(
          { _id: jiskofollowkrunga },
          { $push: { followers: followkreneWala } }
        ),
      ]);
      return res
        .status(200)
        .json({ message: "followed SuccessFully", success: true });
    }
  } catch (e) {
    console.log(e);
  }
};

module.exports = {
  register,
  login,
  logout,
  getprofile,
  editprofile,
  getSuggestedUsers,
  followorunfollow,
};
