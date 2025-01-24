import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import '../styles/navbar.css';
import { UserContext } from '../userContext';

const NavBar = () => {
  const { user, setUser, verifySession } = useContext(UserContext);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [showLogInModal, setShowLogInModal] = useState(false);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [formError, setFormError] = useState(null);


  useEffect(() => {
    verifySession();
  }, [verifySession]);

  const getCsrfToken = () => {
    return document.cookie
      .split('; ')
      .find((row) => row.startsWith('XSRF-TOKEN='))
      ?.split('=')[1];
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const formData = new FormData(e.target);
    const data = {
      displayName: formData.get('displayName'),
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password'),
    };

    try {
      const response = await axios.post('/api/users/register', data, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      setShowSignUpModal(false);
      setFormError(null);
      console.log('Sign-up successful. You can now log in.');
    } catch (error) {
      console.error('Sign-up Error:', error.response?.data?.error || error.message);
      setFormError(error.response?.data?.error || 'Sign-up failed');
    }
  };

  const handleLogIn = async (e) => {
    e.preventDefault();
    setFormError(null);

    const formData = new FormData(e.target);
    const data = {
      username: formData.get('username'),
      password: formData.get('password'),
    };

    try {
      const response = await axios.post('/api/users/login', data, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      await verifySession();

      setShowLogInModal(false);
    } catch (error) {
      console.error('Log-in Error:', error.response?.data?.error || error.message);
      setFormError(error.response?.data?.error || 'Log-in failed');
    }
  };

  const handleDemoLogIn = async () => {
    setFormError(null);

    const demoData = {
      username: 'user1',
      password: 'password123',
    };

    try {
      const response = await axios.post('/api/users/login', demoData, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      await verifySession();

    } catch (error) {
      console.error('Demo Log-in Error:', error.response?.data?.error || error.message);
      setFormError(error.response?.data?.error || 'Demo Log-in failed');
    }
  };

  const handleLogOut = async () => {
    setFormError(null);

    try {
      await axios.post(
        '/api/users/logout',
        {},
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );

      setUser(null);

      console.log('Logout successful');
    } catch (error) {
      console.error('Logout Error:', error.message);
    }
  };

  const openSettingsModal = async () => {
    setFormError(null);
    try {
      const response = await axios.get(`/api/users/${user.username}`, {
        withCredentials: true,
      });

      setDisplayName(response.data.displayName || '');
      setBio(response.data.bio || '');
      setShowSettingsModal(true);
    } catch (error) {
      console.error('Failed to fetch user info for settings:', error.message);
    }
  };

  const handleSettingsSave = async (e) => {
    e.preventDefault();
    setFormError(null);

    const data = {
      displayName,
      bio,
    };

    try {
      const csrfToken = getCsrfToken();
      console.log('Data sent to API:', data);
      const response = await axios.put(`/api/users/${user.username}`, data, {
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        withCredentials: true,
      });

      setUser(prevUser => ({
        ...prevUser,
        displayName: response.data.user.displayName,
        bio: response.data.user.bio,
      }));

      setShowSettingsModal(false);
    } catch (error) {
      console.error('Failed to update settings:', error.response?.data?.error || error.message);
      setFormError(error.response?.data?.error || 'Failed to update settings');
    }
  };

  const openNewPostModal = () => {
    setShowNewPostModal(true);
  };

  const closeNewPostModal = () => {
    setShowNewPostModal(false);
  };

  const handleNewPostSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const formData = new FormData(e.target);
    const data = {
      title: formData.get('title'),
      image: formData.get('image'),
      description: formData.get('description'),
    };

    try {
      const csrfToken = getCsrfToken();

      const response = await axios.post('/api/posts', data, {
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        withCredentials: true,
      });

      if (response.data.post && response.data.post.id) {
        window.location.href = `/users/${user.username}/posts/${response.data.post.id}`;
      } else {
        window.location.reload();
      }

      setShowNewPostModal(false);
    } catch (error) {
      console.error('New Post Creation Error:', error.response?.data?.error || error.message);
      setFormError(error.response?.data?.error || 'Failed to create post');
    }
  };

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button onClick={() => (window.location.href = '/')} className="nav-button">
          Home
        </button>
      </div>
      <div className="navbar-right">
        {!user ? (
          <>
            <button onClick={() => setShowSignUpModal(true)} className="nav-button">
              Sign Up
            </button>
            <button onClick={() => setShowLogInModal(true)} className="nav-button">
              Log In
            </button>
            <button onClick={handleDemoLogIn} className="nav-button demo-button">
              Log In as Demo User
            </button>
          </>
        ) : (
          <>
            <button onClick={openNewPostModal} className="nav-button new-post-button">
              New Post
            </button>
            <button onClick={openSettingsModal} className="nav-button">
              Settings
            </button>
            {user.username && (
              <button
                onClick={() => (window.location.href = `/users/${user.username}`)}
                className="nav-button"
              >
                Profile
              </button>
            )}
            <button onClick={handleLogOut} className="nav-button">
              Log Out
            </button>
          </>
        )}
      </div>

      {showSignUpModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Sign Up</h2>
            <form onSubmit={handleSignUpSubmit}>
              <label htmlFor="displayName">Display Name:</label>
              <input name="displayName" type="text" placeholder="Display Name" required />
              <label htmlFor="username">Username:</label>
              <input name="username" type="text" placeholder="Username" required />
              <label htmlFor="email">Email:</label>
              <input name="email" type="email" placeholder="Email" required />
              <label htmlFor="password">Password:</label>
              <input name="password" type="password" placeholder="Password" required />
              <button type="submit">Submit</button>
            </form>
            {formError && <p className="error-message">{formError}</p>}
            <button className="close-button" onClick={() => setShowSignUpModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {showLogInModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Log In</h2>
            <form onSubmit={handleLogIn}>
              <label htmlFor="login-username">Username:</label>
              <input name="username" type="text" placeholder="Username" required />
              <label htmlFor="login-password">Password:</label>
              <input name="password" type="password" placeholder="Password" required />
              <button type="submit">Submit</button>
            </form>
            {formError && <p className="error-message">{formError}</p>}
            <button className="close-button" onClick={() => setShowLogInModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Edit Profile</h2>
            <form onSubmit={handleSettingsSave}>
              <label htmlFor="displayName">Display Name:</label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display Name"
                required
              />
              <label htmlFor="bio">Bio:</label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Bio"
                rows="4"
              ></textarea>
              <button type="submit">Save</button>
            </form>
            {formError && <p className="error-message">{formError}</p>}
            <button className="close-button" onClick={() => setShowSettingsModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {showNewPostModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Create New Post</h2>
            <form onSubmit={handleNewPostSubmit}>
              <label htmlFor="title">Title:</label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="Post Title"
                required
              />

              <label htmlFor="image">Image URL:</label>
              <input
                id="image"
                name="image"
                type="url"
                placeholder="Image URL"
                required
              />

              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                placeholder="Post Description"
                rows="4"
                required
              ></textarea>

              <button type="submit">Create Post</button>
            </form>
            {formError && <p className="error-message">{formError}</p>}
            <button className="close-button" onClick={closeNewPostModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
