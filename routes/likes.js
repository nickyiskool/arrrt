// NOT YET IMPLEMENTED :P

const express = require('express');
const { Like, Post } = require('../models/');
const { authenticateToken } = require('../utils/auth');
const router = express.Router();
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

router.post('/:postId', csrfProtection, async (req, res) => {
    const { postId } = req.params;

    try {
        const post = await Post.findByPk(postId);
        if (!post) {
            return res.status(404).json({ error: 'Post not found.' });
        }

        const existingLike = await Like.findOne({
            where: { userId: req.user.id, postId: parseInt(postId, 10) },
        });

        if (existingLike) {
            return res.status(400).json({ error: 'You have already liked this post.' });
        }

        // Create the like
        const like = await Like.create({
            userId: req.user.id,
            postId: parseInt(postId, 10),
        });

        res.status(201).json({ message: 'Post liked successfully.', like });
    } catch (error) {
        console.error('Like Post Error:', error);
        res.status(500).json({ error: 'Server error.' });
    }
});

router.delete('/:postId', csrfProtection, async (req, res) => {
    const { postId } = req.params;

    try {
        const like = await Like.findOne({
            where: { userId: req.user.id, postId: parseInt(postId, 10) },
        });

        if (!like) {
            return res.status(404).json({ error: 'You have not liked this post.' });
        }

        await like.destroy();
        res.json({ message: 'Post unliked successfully.' });
    } catch (error) {
        console.error('Unlike Post Error:', error);
        res.status(500).json({ error: 'Server error.' });
    }
});

router.get('/:postId', async (req, res) => {
    const { postId } = req.params;

    try {
        const likes = await Like.findAll({
            where: { postId: parseInt(postId, 10) },
        });

        res.json({ likes });
    } catch (error) {
        console.error('Get Likes Error:', error);
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
