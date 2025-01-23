import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/PostList.css';
import axios from 'axios';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('/api/posts', {
          withCredentials: true, // Include cookies
          headers: {
            'Content-Type': 'application/json',
          },
        });
        setPosts(response.data);
      } catch (err) {
        console.error('Error fetching posts:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <p>Loading posts...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div className="postList">
      <h1>Post List</h1>
      {posts.length === 0 ? (
        <p>No posts available.</p>
      ) : (
        <div className="postGrid">
          {posts.map(post => (
            <div key={post.id} className="postItem">
              <Link to={`/users/${post.user?.username}/posts/${post.id}`} className="postLink">
                <div className="postImageContainer">
                  <img
                    src={post.image}
                    alt={post.description}
                    className="postImage"
                  />
                  <div className="postOverlay"> 
                    <p className="postAuthor">Author: {post.user?.username || post.userId}</p>
                    <p className="postDescription">{post.description}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostList;
