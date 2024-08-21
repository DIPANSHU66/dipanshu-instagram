const sharp = require("sharp");
const { cloudinary } = require("../utils/cloudinary");
const Post = require("../Models/postmodel");
const User = require("../Models/usermodel");
const Comment = require("../Models/CommentSchema");
const { getRecieverSocketid, io } = require("../socket/socket");

const addnewpost = async (req, res) => {
  try {
    const { caption } = req.body;
    const image = req.file;
    const authorId = req.id;
    if (!image) {
      return res.status(400).json({
        message: "image required",
      });
    }
    const optimizedImageBuffer = await sharp(image.buffer)
      .resize({
        width: 800,
        height: 800,
        fit: "inside",
      })
      .toFormat("jpeg", { quality: 80 })
      .toBuffer();
    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString(
      "base64"
    )}`;

    const cloudResponse = await cloudinary.uploader.upload(fileUri);

    const post = await Post.create({
      caption,
      image: cloudResponse.secure_url,
      author: authorId,
    });
    const user = await User.findById(authorId);
    if (user) {
      user.posts.push(post._id);
      await user.save();
    }
    await post.populate({ path: "author", select: "-password" });

    return res
      .status(201)
      .json({ message: "New post added", post, success: true });
  } catch (e) {
    console.log(e);
  }
};

const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "author",
        select: "username profilePicture followers",
      })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "author",
          select: "username profilePicture  followers ",
        },
      });
    return res.status(200).json({ posts, success: true });
  } catch (e) {
    console.log(e);
  }
};

const getuserpost = async (req, res) => {
  try {
    const authorId = req.id;
    const posts = await Post.find({ author: authorId })
      .sort({ createdAt: -1 })
      .populate({
        path: "author",
        select: "username profilePicture",
      })
      .populate({
        path: "author",
        select: "username profilePicture",
      });
    return res.status(200).json({ posts, success: true });
  } catch (e) {
    console.log(e);
  }
};

const likepost = async (req, res) => {
  try {
    const likekrnewalauser = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post)
      return res
        .status(400)
        .json({ message: "Post not Found", success: false });

    await post.updateOne({ $addToSet: { likes: likekrnewalauser } });
    await post.save();
    const user = await User.findById(likekrnewalauser).select(
      "username profilePicture"
    );
    const postownerId = post.author.toString();
    if (postownerId != likekrnewalauser) {
      const notification = {
        type: "like",
        userId: likekrnewalauser,
        userDetails: user,
        postId,
        message: "your Post is Liked",
      };
      const postsocketownerid = getRecieverSocketid(postownerId);
      io.to(postsocketownerid).emit("notification", notification);
    }
    return res.status(200).json({ message: "Post Liked", success: true });
  } catch (e) {
    console.log(e);
  }
};
const dislikedpost = async (req, res) => {
  try {
    const likekrnewalauser = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post)
      return res
        .status(400)
        .json({ message: "Post not Found", success: false });
    await post.updateOne({ $pull: { likes: likekrnewalauser } });
    await post.save();
    const user = await User.findById(likekrnewalauser).select(
      "username profilePicture"
    );
    const postownerId = post.author.toString();
    if (postownerId != likekrnewalauser) {
      const notification = {
        type: "dislike",
        userId: likekrnewalauser,
        userDetails: user,
        postId,
        message: "your Post is Disiked",
      };
      const postsocketownerid = getRecieverSocketid(postownerId);
      io.to(postsocketownerid).emit("notification", notification);
    }
    return res.status(200).json({ message: "Post Disliked", success: true });
  } catch (e) {
    console.log(e);
  }
};
const adcomment = async (req, res) => {
  try {
    const postid = req.params.id;
    const commentkrenewalakiid = req.id;

    const { text } = req.body;
    const post = await Post.findById(postid);
    if (!text)
      return res
        .status(400)
        .json({ message: "text is Required", success: false });
    const comment = await Comment.create({
      text,
      author: commentkrenewalakiid,
      post: postid,
    });

    await comment.populate({
      path: "author",
      select: "username profilePicture",
    });
    post.comments.push(comment._id);
    await post.save();
    return res.status(201).json({
      comment,
      message: "Comment Added",
      success: true,
    });
  } catch (e) {
    console.log(e);
  }
};
const getcommentofPost = async (req, res) => {
  try {
    const postid = req.params.id;
    const comments = await Comment.findById({ post: postid }).populate({
      path: "author",
      select: "username profilePicture",
    });

    if (!comments)
      req
        .status(404)
        .json({ message: "No Comments For this Post", sucess: "false" });

    return res.status(200).json({ success: true, comments });
  } catch (e) {
    console.log(e);
  }
};
const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;

    const post = await Post.findById(postId);
    if (!post)
      return res
        .status(404)
        .json({ message: "Post not found", success: false });

    // check if the logged-in user is the owner of the post
    if (post.author.toString() !== authorId)
      return res.status(403).json({ message: "Unauthorized" });

    // delete post
    await Post.findByIdAndDelete(postId);

    // remove the post id from the user's post
    let user = await User.findById(authorId);
    user.posts = user.posts.filter((id) => id.toString() !== postId);
    await user.save();

    // delete associated comments
    await Comment.deleteMany({ post: postId });

    return res.status(200).json({
      success: true,
      message: "Post deleted",
    });
  } catch (error) {
    console.log(error);
  }
};

const bookmarksPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;
    const post = await Post.findById(postId);
    if (!post)
      return res
        .status(404)
        .json({ message: "Page not Found", success: false });
    const user = await User.findById(authorId);
    if (user.bookmarks.includes(post._id)) {
      await user.updateOne({ $pull: { bookmarks: post._id } });
      await user.save();
      return res.status(200).json({
        type: "Unsaved",
        message: "Post removed from bookmarks",
        success: true,
      });
    } else {
      {
        await user.updateOne({ $addToSet: { bookmarks: post._id } });
        await user.save();
        return res.status(200).json({
          type: "saved",
          message: "Post bookMarked",
          success: true,
        });
      }
    }
  } catch (e) {
    console.log(e);
  }
};
module.exports = {
  addnewpost,
  getAllPost,
  getuserpost,
  likepost,
  dislikedpost,
  adcomment,
  getcommentofPost,
  deletePost,
  bookmarksPost,
};
