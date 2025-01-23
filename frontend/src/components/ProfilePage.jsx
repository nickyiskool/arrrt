import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/ProfilePage.css';
import { UserContext } from '../userContext';

const ProfilePage = () => {
  const { slug } = useParams();
  const { user, verifySession } = useContext(UserContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`/api/users/${slug}`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        setProfile(response.data);
      } catch (err) {
        console.error('Error fetching profile:', err.response?.data?.error || err.message);
        setError(err.response?.data?.error || 'Failed to fetch profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [slug]);

  if (loading) return <p>Loading profile...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!profile) return <p>No profile data found.</p>;

  return (
    <div className="profilePage">
      <h1>{profile.displayName}'s Profile</h1>
      <p>@{profile.username}</p>
      <p>{profile.bio}</p>
      <h2>Posts</h2>
      {profile.posts && profile.posts.length > 0 ? (
        <div className="postGrid">
          {profile.posts.map(post => (
            <div key={post.id} className="postItem">
              <Link to={`/users/${profile.username}/posts/${post.id}`} className="postLink">
                <div className="postImageContainer">
                  <img
                    src={post.image}
                    alt={post.description}
                    className="postImage"
                  />
                  <div className="postOverlay">
                    <p className="postDescription">{post.description}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p>No posts available.</p>
      )}
    </div>
  );
};

export default ProfilePage;
