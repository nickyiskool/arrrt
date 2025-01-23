const express = require('express');
const router = express.Router();
const { Comment, Post, User } = require('../models/');
const { authenticateToken } = require('../utils/auth');

const verifyCommentOwnership = async (req, res, next) => {
  const commentId = parseInt(req.params.id, 10);
  try {
    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    if (comment.userId !== req.user.id) {
      return res.status(403).json({ error: 'You do not have permission to modify this comment.' });
    }

    req.comment = comment;
    next();
  } catch (error) {
    console.error('Ownership Verification Error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

//create a comment
router.post('/:postId', authenticateToken, async (req, res) => {
  const { postId } = req.params;
  const { content } = req.body;

  try {
    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    const comment = await Comment.create({
      userId: req.user.id,
      postId: parseInt(postId, 10),
      content,
    });

    const populatedComment = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'displayName'],
        },
      ],
    });

    return res.status(201).json({
      message: 'Comment created successfully.',
      comment: populatedComment,
    });
  } catch (error) {
    console.error('Create Comment Error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

//get a post and comments on said post
router.get('/users/:username/posts/:postId', async (req, res) => {
  const { username, postId } = req.params;

  try {
    const post = await Post.findOne({
      where: { id: postId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'displayName'],
          where: { username },
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['username', 'displayName'],
            },
          ],
          order: [['createdAt', 'ASC']],
        },
      ],
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

//update a post
router.put('/:id', authenticateToken, verifyCommentOwnership, async (req, res) => {
  const { content } = req.body;

  try {
    req.comment.content = content || req.comment.content;
    await req.comment.save();
  
    const populatedComment = await Comment.findByPk(req.comment.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'displayName'],
        },
      ],
    });

    return res.json({
      message: 'Comment updated successfully.',
      comment: populatedComment,
    });
  } catch (error) {
    console.error('Update Comment Error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

//delete a comment
router.delete('/:id', authenticateToken, verifyCommentOwnership, async (req, res) => {
  try {
    await req.comment.destroy();
    return res.json({ message: 'Comment deleted successfully.' });
  } catch (error) {
    console.error('Delete Comment Error:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
