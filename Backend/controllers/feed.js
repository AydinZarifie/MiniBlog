const { validationResult } = require("express-validator");
const Post = require("../models/post");
const path = require("path");
const fs = require("fs");

exports.getPosts = async (req, res, next) => {
  try {
    const currentPage = req.query.page;
    const perPage = 2;
    const totalItems = await Post.countDocuments();

    const posts = await Post.find()
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res
      .status(200)
      .json({
        message: "Fetched posts successfully.",
        posts: posts,
        totalItems: totalItems,
      });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(422).json({
        message: "Validation faild, your entered data is invalid",
        errors: errors.array(),
      });
    }

    if (!req.file) {
      const error = new Error("Please upload a file");
      error.statusCode = 422;
      throw error;
    }

    const title = req.body.title;
    const content = req.body.content;

    const post = new Post({
      title: title,
      content: content,
      imageUrl: req.file.path,
      creator: {
        name: "Mohammad Hashemi",
      },
    });

    const postResult = await post.save();

    res.status(201).json({
      message: "Post Created Successfully",
      post: postResult,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ message: "Post fetched.", post: post });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).json({
      message: "Validation faild, your entered data is invalid",
      errors: errors.array(),
    });
  }

  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;

  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    const error = new Error("Please upload a imageFile");
    error.statusCode = 422;
    throw error;
  }

  const post = await Post.findById(postId);

  if (!post) {
    const error = new Error("Could not find post.");
    error.statusCode = 404;
    throw error;
  }

  if (imageUrl !== post.imageUrl) {
    await clearImage(post.imageUrl);
  }

  post.title = title;
  post.content = content;
  post.imageUrl = imageUrl;

  await post.save();
  res.status(200).json({
    message: "Post Updated Successfully",
    post: post,
  });
};

exports.deletePost = async (req, res, next) => {
  try {
    const postId = req.params.postId;

    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error("Could not find post.");
      error.statusCode = 404;
      throw error;
    }

    clearImage(post.imageUrl);

    await post.remove();

    //  const deletedPost = await Post.findByIdAndDelete(postId);

    return res.status(200).json({ message: "Post deleted successfully." });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const clearImage = async (filePath) => {
  filepath = path.join(__dirname, "..", filePath);

  if (await fs.existsSync(filepath)) {
    await fs.unlinkSync(filepath, (err) => {
      throw err;
    });

    console.log("Image deleted successfully");
  } else {
    console.log("Image not found");
  }
};
