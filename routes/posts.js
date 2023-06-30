import express from "express";
import {
  createPost,
  deletePost,
  getPosts,
  getPostsBySearch,
  likePost,
  updatePost,
  getPost,
  postComment,
} from "../controllers/posts.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.route("/").get(getPosts).post(auth, createPost);
router.route("/search").get(getPostsBySearch);
router
  .route("/:id")
  .patch(auth, updatePost)
  .delete(auth, deletePost)
  .get(getPost);
router.route("/:id/likePost").patch(auth, likePost);

// is post correct fot this
router.route("/:id/postComment").post(auth, postComment);

export default router;
