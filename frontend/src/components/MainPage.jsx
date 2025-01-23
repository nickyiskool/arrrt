import React, { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';
import './MainPage.css';

const MainPage = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('./models/posts'); 
        const data = await response.json();
        setPosts(data.posts); 
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="main-page">
      <h1>Latest Posts</h1>
      <div className="posts-grid">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default MainPage;