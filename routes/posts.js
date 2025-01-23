const express = require('express');
const { Post, User, Comment } = require('../models');
const { authenticateToken } = require('./users');
const router = express.Router();

const verifyPostOwnership = async (req, res, next) => {
  const postId = parseInt(req.params.id, 10);
  try {
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }
    if (post.userId !== req.user.id) {
      return res.status(403).json({ error: 'You do not have permission to modify this post.' });
    }

    req.post = post; 
    next();
  } catch (error) {
    console.error('Ownership Verification Error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

//get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.findAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'image', 'description', 'createdAt'],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'displayName'],
        },
      ],
    });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Unable to fetch posts.' });
  }
});

//get a single post
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'displayName'],
        },
      ],
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    res.json({
      id: post.id,
      image: post.image,
      title: post.title,
      description: post.description,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      user: {
        username: post.user.username,
        displayName: post.user.displayName,
      },
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

//get posts for the feed
router.get('/feed', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const posts = await Post.findAll({
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit, 10),
      offset,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'displayName'],
        },
      ],
    });

    res.json({ posts, page: parseInt(page, 10) });
  } catch (error) {
    console.error('Retrieve Feed Error:', error);
    res.status(500).json({ error: 'Server error while retrieving feed.' });
  }
});

//get all posts by a user
router.get('/user/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({
      where: { username },
      include: [
        {
          model: Post,
          as: 'posts',
          order: [['createdAt', 'DESC']],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: `User '${username}' not found.` });
    }

    res.json({
      user: {
        username: user.username,
        displayName: user.displayName,
      },
      posts: user.posts,
    });
  } catch (error) {
    console.error(`Error fetching posts for user '${username}':`, error);
    res.status(500).json({ error: 'Server error.' });
  }
});

//create a post
router.post('/', authenticateToken, async (req, res) => {
  // CSRF protection is already applied via server.js
  const { image, description, title } = req.body;
  try {
    const post = await Post.create({
      userId: req.user.id,
      image,
      description,
      title,
    });
    res.status(201).json({ message: 'Post created successfully.', post });
  } catch (error) {
    console.error('Create Post Error:', error);
    res.status(500).json({ error: 'Server error while creating post.' });
  }
});

//update a post
router.put('/:id', authenticateToken, verifyPostOwnership, async (req, res) => {
  // CSRF protection is already applied via server.js
  const { description, title } = req.body;
  try {
    req.post.description = description || req.post.description;
    req.post.title = title || req.post.title;
    await req.post.save();
    res.json({ message: 'Post updated successfully.', post: req.post });
  } catch (error) {
    console.error('Update Post Error:', error);
    res.status(500).json({ error: 'Server error while updating post.' });
  }
});

//delete a post
router.delete('/:id', authenticateToken, verifyPostOwnership, async (req, res) => {
  // CSRF protection is already applied via server.js
  try {
    await req.post.destroy();
    res.json({ message: 'Post deleted successfully.' });
  } catch (error) {
    console.error('Delete Post Error:', error);
    res.status(500).json({ error: 'Server error while deleting post.' });
  }
});

module.exports = router;
