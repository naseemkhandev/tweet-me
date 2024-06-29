import express from "express";
import {
  createNewPost,
  deletePost,
  getAllPosts,
  likeUnlikePost,
  commentOnPost,
} from "../controllers/postController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.get("/", getAllPosts);
router.post("/", verifyToken, createNewPost);
router.post("/like/:id", verifyToken, likeUnlikePost);
router.post("/comment/:id", verifyToken, commentOnPost);
router.delete("/:id", verifyToken, deletePost);

export default router;