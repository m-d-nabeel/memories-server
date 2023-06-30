import mongoose from "mongoose";
import PostMessage from "../models/postMessage.js";

const getPosts = async (req, res) => {
  const { page } = req.query;

  try {
    const LIMIT = 8;
    const startIndex = (Number(page) - 1) * LIMIT; // get the starting index of every page

    const total = await PostMessage.countDocuments({});
    const posts = await PostMessage.find()
      .sort({ createdAt: -1 })
      .limit(LIMIT)
      .skip(startIndex);

    res.json({
      data: posts,
      currentPage: Number(page),
      numberOfPages: Math.ceil(total / LIMIT),
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const getPost = async (req, res) => {
  try {
    const post = await PostMessage.findById(req.params.id);
    res.status(200).json(post);
  } catch (error) {
    console.log({ msg: error.message });
  }
};

const getPostsBySearch = async (req, res) => {
  const { searchQuery, tags } = req.query;
  try {
    const title = new RegExp(searchQuery, "i");
    const posts = await PostMessage.find({
      $or: [{ title: title }, { tags: { $in: tags.split(",") } }],
    });
    res.status(200).json(posts);
  } catch (error) {
    res.status(404).json({ msg: error.message });
  }
};
// const getPostsBySearch = async (req, res) => {
//   const { searchQuery, tags } = req.query;
//   try {
//     let query = {};

//     const title = new RegExp(searchQuery, "i");
//     if (searchQuery) {
//       query.title = title;
//     }

//     if (tags) {
//       query.tags = { $in: tags.split(",") };
//     }
//     const posts = await PostMessage.find(query);
//     if (posts.length > 0) {
//       res.status(200).json(posts);
//     } else {
//       const allPosts = await PostMessage.find();
//       res.status(200).json(allPosts);
//     }
//   } catch (error) {
//     res.status(404).json({ msg: error.message });
//   }
// };

const createPost = async (req, res) => {
  const post = req.body;
  const newPost = new PostMessage({
    ...post,
    creator: req.userId,
    createdAt: new Date().toISOString(),
  });
  try {
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(404).json({ msg: error.message });
  }
};

const updatePost = async (req, res) => {
  const { id: _id } = req.params;
  const post = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id))
    res.status(404).send(`No post with _id : ${_id}`);
  const updatedPost = await PostMessage.findByIdAndUpdate(_id, post, {
    new: true,
  });
  res.json(updatedPost);
};

const likePost = async (req, res) => {
  const { id: _id } = req.params;

  if (!req.userId) {
    return res.json({ msg: "Unauthenticated" });
  }

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send(`No post with _id: ${_id}`);
  }

  try {
    const post = await PostMessage.findById(_id);

    const index = post.likes.findIndex(
      (likeId) => likeId === String(req.userId)
    );

    if (index === -1) {
      // Like the post
      post.likes.push(req.userId);
    } else {
      // Dislike the post
      post.likes = post.likes.filter((likeId) => likeId !== String(req.userId));
    }

    const updatedPost = await PostMessage.findByIdAndUpdate(_id, post, {
      new: true,
    });

    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

const deletePost = async (req, res) => {
  // we are passing id from frontend
  // renaming it to _id to make more mongo sense
  const { id: _id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(_id))
    res.status(404).send(`No post with _id : ${_id}`);
  await PostMessage.findByIdAndRemove(_id);
  res.json({ message: "Post deleted successfully" });
};

const postComment = async (req, res) => {
  const { id } = req.params;
  const { value } = req.body;

  const post = await PostMessage.findById(id);
  post.comments.push(value);
  const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {
    new: true,
  });
  res.status(200).json(updatedPost);
};

export {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  likePost,
  getPostsBySearch,
  getPost,
  postComment,
};
