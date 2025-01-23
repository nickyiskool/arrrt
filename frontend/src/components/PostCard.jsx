import React from 'react';
import { useNavigate } from 'react-router-dom';
import './PostCard.css';

const PostCard = ({ post }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/post/${post.id}`);
  };

  return (
    <div className="post-card" onClick={handleClick}>
      <img src={post.image} alt={post.description} className="post-image" />
      <div className="post-info">
        <p>{post.description}</p>
        <span>{new Date(post.uploadDate).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default PostCard;