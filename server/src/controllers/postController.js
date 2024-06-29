import { v2 as cloudinary } from "cloudinary";

import Post from "../models/postModel.js";
import Notification from "../models/notificationModel.js";
import createError from "../helpers/createError.js";
import User from "../models/userModel.js";

export const createNewPost = async (req, res, next) => {
  try {
    const { title, description } = req.body;
    let { image } = req.body;

    if (!title) return next(createError(400, "Title is required"));
    if (!description) return next(createError(400, "Description is required"));
    if (!image) return next(createError(400, "Image is required"));

    if (image) {
      const uploadResult = await cloudinary.uploader
        .upload(image)
        .catch((error) => {
          next(createError(400, "Image upload failed."));
        });

      image = uploadResult.secure_url;
    }

    const post = await Post.create({
      user: req.user.userId,
      title,
      description,
      image,
    });

    res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const post = await Post.findById(id);
    if (!post) return next(createError(404, "Post not found"));
    if (post.user.toString() !== userId) {
      return next(
        createError(403, "You are not authorized to delete this post")
      );
    }

    await Post.findByIdAndDelete(id);
    // deleting image from cloudinary
    if (post.image) {
      const publicId = post.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getAllPosts = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", "username profilePicture");

    if (posts.length === 0) {
      return res.status(200).json({ message: "No posts found", posts: [] });
    }

    res.status(200).json({ message: "All posts fetched successfully", posts });
  } catch (error) {
    next(error);
  }
};

export const getSinglePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id).populate(
      "user",
      "username profilePicture"
    );
    if (!post) return next(createError(404, "Post not found"));

    res.status(200).json({ message: "Post fetched successfully", post });
  } catch (error) {
    next(error);
  }
};

export const likeUnlikePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const post = await Post.findById(id).populate(
      "user",
      "username profilePicture"
    );
    if (!post) return next(createError(404, "Post not found"));

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes.pull(userId);
      await post.save();

      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
        content: `${post.user.username} unliked your post.`,
      });

      await notification.save();
      res.status(200).json({
        message: "Post unliked successfully",
        notification,
      });
    } else {
      post.likes.push(userId);
      await post.save();

      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
        content: `${post.user.username} liked your post.`,
      });

      await notification.save();
      res.status(200).json({
        message: "Post unliked successfully",
        notification,
      });
    }
  } catch (error) {
    next(error);
  }
};

export const commentOnPost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    const post = await Post.findById(id);
    if (!post) return next(createError(404, "Post not found"));

    if (!text) return next(createError(400, "Comment text is required"));
    post.comments.push({ user: req.user.userId, text });
    await post.save();

    res.status(200).json({ message: "Comment added successfully" });
  } catch (error) {
    next(error);
  }
};
