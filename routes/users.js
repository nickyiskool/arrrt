const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { User, Post, Comment } = require('../models/');
const csrf = require('csurf');

const SECRET_KEY = process.env.JWT_SECRET || 'ayyylmao';

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, SECRET_KEY, { expiresIn: '7d' });
};

const restrictedUsernames = ['signup', 'login'];

//sign up
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, displayName } = req.body;

    if (restrictedUsernames.includes(username.toLowerCase())) {
      return res.status(400).json({ error: 'Nice try.' });
    }

    const user = await User.create({
      username,
      email,
      password, 
      displayName,
    });

    return res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

//login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid password.' });
    }

    const token = generateToken(user.id);
    console.log('About to set cookie with token:', token);


    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', 
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    console.log('Set-Cookie called!');

    return res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: 'Server error during login.' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'lax', 
    });
    return res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout Error:', error);
    return res.status(500).json({ error: 'Server error during logout.' });
  }
});

router.get('/verify-session', async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.json({ isLoggedIn: false });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    const user = await User.findByPk(decoded.id, { attributes: ['username'] });

    if (!user) {
      return res.json({ isLoggedIn: false });
    }

    return res.json({ isLoggedIn: true, username: user.username });
  } catch (error) {
    console.error('Failed to verify session:', error);
    return res.status(500).json({ error: 'Failed to verify session' });
  }
});

//get by slug (this shit was a bad idea by the way lol)
router.get('/:slug/posts/:postId', async (req, res) => {
  try {
    const { slug, postId } = req.params;

    const user = await User.findOne({
      where: { slug },
      include: {
        model: Post,
        as: 'posts',
        where: { id: postId },
        include: [
          {
            model: Comment,
            as: 'comments',
            include: {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'displayName'],
            },
          },
        ],
      },
    });

    if (!user || user.posts.length === 0) {
      return res.status(404).json({ error: 'User or post not found' });
    }

    const post = user.posts[0];
    return res.json({
      ...post.toJSON(),
      user: { username: user.username, displayName: user.displayName },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

//get by slug for profile
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const user = await User.findOne({
      where: { slug },
      include: [{ model: Post, as: 'posts' }],
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    return res.json({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      posts: user.posts,
    });
  } catch (error) {
    console.error('Error fetching user by slug:', error);
    return res.status(500).json({ error: 'Server error.' });
  }
});

async function inlineAuthCheck(req, res) {
  const token = req.cookies.token;
  if (!token) {
    return { error: true, status: 401, msg: 'Unauthorized. No token provided.' };
  }
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    return { error: false, userId: decoded.id };
  } catch (error) {
    return { error: true, status: 401, msg: 'Unauthorized. Invalid token.' };
  }
}

//update user
router.put('/:slug', async (req, res) => {
  try {
    const auth = await inlineAuthCheck(req, res);
    if (auth.error) {
      return res.status(auth.status).json({ error: auth.msg });
    }

    const { slug } = req.params;
    const userToUpdate = await User.findOne({ where: { slug } });
    if (!userToUpdate) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (userToUpdate.id !== auth.userId) {
      return res.status(403).json({ error: 'You do not have permission to modify this user.' });
    }

    const { displayName, bio } = req.body;
    if (displayName) userToUpdate.displayName = displayName;
    if (bio) userToUpdate.bio = bio;

    await userToUpdate.save();
    return res.json({ message: 'User updated successfully', user: userToUpdate });
  } catch (error) {
    console.error('Update User by Slug Error:', error);
    return res.status(500).json({ error: 'Server error.' });
  }
});

//delete user
router.delete('/:slug', async (req, res) => {
  try {
    const auth = await inlineAuthCheck(req, res);
    if (auth.error) {
      return res.status(auth.status).json({ error: auth.msg });
    }

    const { slug } = req.params;
    const user = await User.findOne({ where: { slug } });
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (user.id !== auth.userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this user.' });
    }

    await user.destroy();
    return res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete User by Slug Error:', error);
    return res.status(500).json({ error: 'Server error.' });
  }
});

//get for comments
router.get('/:username/posts/:postId', async (req, res) => {
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
            { model: User, as: 'user', attributes: ['username', 'displayName'] },
          ],
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
      comments: post.comments.map(c => ({
        id: c.id,
        content: c.content,
        createdAt: c.createdAt,
        user: {
          username: c.user.username,
          displayName: c.user.displayName,
        },
      })),
    });
  } catch (error) {
    console.error('Error fetching user-specific post:', error);
    res.status(500).json({ error: 'Server error.' });
  }
});

const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'No token provided. Unauthorized.' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token. Unauthorized.' });
    }
    req.user = { id: decoded.id };
    next();
  });
};

module.exports = { router, authenticateToken };
