import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/PostPage.css';
import { UserContext } from '../userContext';

const PostPage = () => {
  const { username, postId } = useParams();
  const { user, verifySession } = useContext(UserContext);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [postEditError, setPostEditError] = useState(null);
  const [postEditLoading, setPostEditLoading] = useState(false);
  const currentUser = user?.username || '';

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`/api/users/${username}/posts/${postId}`, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('Fetched Post Data:', response.data);
        setPost(response.data);
      } catch (err) {
        console.error('Error fetching post:', err.response?.data?.error || err.message);
        setError(err.response?.data?.error || 'Failed to fetch post.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [username, postId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setCommentError(null);

    const data = {
      content: newComment,
    };

    try {
      const csrfToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

      const response = await axios.post(`/api/comments/${postId}`, data, {
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        withCredentials: true,
      });
      console.log('New Comment Data:', response.data);

      const completeNewComment = {
        ...response.data.comment,
        user: {
          username: currentUser,
          displayName: currentUser,
        },
      };

      setPost((prevPost) => ({
        ...prevPost,
        comments: [...prevPost.comments, completeNewComment],
      }));
      setNewComment('');
    } catch (err) {
      console.error('Error submitting comment:', err.response?.data?.error || err.message);
      setCommentError(err.response?.data?.error || 'Failed to submit comment.');
    }
  };

  const startEditingComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditCommentText(comment.content);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditCommentText('');
  };

  const saveCommentEdit = async (commentId) => {
    try {
      const csrfToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

      const response = await axios.put(
        `/api/comments/${commentId}`,
        { content: editCommentText },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken,
          },
          withCredentials: true,
        }
      );

      const updatedComments = post.comments.map((comment) =>
        comment.id === commentId ? { ...comment, content: editCommentText } : comment
      );
      setPost({ ...post, comments: updatedComments });
      setEditingCommentId(null);
      setEditCommentText('');
    } catch (err) {
      console.error('Error editing comment:', err.response?.data?.error || err.message);
      alert(err.response?.data?.error || 'Failed to edit comment.');
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const csrfToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

      await axios.delete(`/api/comments/${commentId}`, {
        headers: {
          'x-csrf-token': csrfToken,
        },
        withCredentials: true,
      });

      const updatedComments = post.comments.filter((comment) => comment.id !== commentId);
      setPost({ ...post, comments: updatedComments });
    } catch (err) {
      console.error('Error deleting comment:', err.response?.data?.error || err.message);
      alert(err.response?.data?.error || 'Failed to delete comment.');
    }
  };

  const startEditingTitle = () => {
    setEditTitle(post.title);
    setIsEditingTitle(true);
  };

  const startEditingDescription = () => {
    setEditDescription(post.description);
    setIsEditingDescription(true);
  };

  const cancelPostEdit = () => {
    setIsEditingTitle(false);
    setIsEditingDescription(false);
    setEditTitle('');
    setEditDescription('');
    setPostEditError(null);
  };

  const savePostEdit = async () => {
    setPostEditError(null);
    setPostEditLoading(true);

    const updatedData = {};
    if (isEditingTitle) updatedData.title = editTitle;
    if (isEditingDescription) updatedData.description = editDescription;

    try {
      const csrfToken = document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

      const response = await axios.put(
        `/api/posts/${postId}`,
        updatedData,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-csrf-token': csrfToken,
          },
          withCredentials: true,
        }
      );
      console.log('Post Update Response:', response.data);

      setPost((prevPost) => ({
        ...prevPost,
        title: response.data.post.title,
        description: response.data.post.description,
        updatedAt: response.data.post.updatedAt,
      }));

      setIsEditingTitle(false);
      setIsEditingDescription(false);
      setEditTitle('');
      setEditDescription('');
    } catch (err) {
      console.error('Error updating post:', err.response?.data?.error || err.message);
      setPostEditError(err.response?.data?.error || 'Failed to update post.');
    } finally {
      setPostEditLoading(false);
    }
  };

  const isPostAuthor = currentUser === post?.user.username;

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!post) return <p>No post data found.</p>;

  return (
    <div className="postPage">
      <div className="postImageWrapper">
        {post.image ? (
          <img src={post.image} alt={post.title} className="postPageImage" />
        ) : (
          <p>No image available for this post.</p>
        )}
      </div>

      <div className="postDetails">
        <div className="titleSection">
          {isEditingTitle ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="editTitleInput"
              required
            />
          ) : (
            <h1 className="postTitle">{post.title}</h1>
          )}
          {isPostAuthor && (
            <button onClick={isEditingTitle ? savePostEdit : startEditingTitle} className="editButton">
              {isEditingTitle ? 'Save' : 'Edit'}
            </button>
          )}
        </div>

        <div className="descriptionSection">
          {isEditingDescription ? (
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="editDescriptionTextarea"
              rows="4"
              required
            ></textarea>
          ) : (
            <p className="description">{post.description}</p>
          )}
          {isPostAuthor && (
            <button onClick={isEditingDescription ? savePostEdit : startEditingDescription} className="editButton">
              {isEditingDescription ? 'Save' : 'Edit'}
            </button>
          )}
        </div>

        <h3 className="postAuthor">by {post.user.displayName}</h3>
        <p className="username">@{post.user.username}</p>
        <p className="date">
          Uploaded on {new Date(post.createdAt).toLocaleDateString()}
          {post.updatedAt && (
            <>
              {' | Last updated on '}
              {new Date(post.updatedAt).toLocaleDateString()}
            </>
          )}
        </p>

        {(isEditingTitle || isEditingDescription) && (
          <div className="postEditControls">
            <button onClick={savePostEdit} className="savePostButton" disabled={postEditLoading}>
              {postEditLoading ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={cancelPostEdit} className="cancelPostButton">
              Cancel
            </button>
          </div>
        )}

        {postEditError && <p className="error">{postEditError}</p>}
      </div>

      <div className="commentsSection">
        <h2>Comments</h2>
        {post.comments && post.comments.length > 0 ? (
          post.comments.map((comment) => {
            const isOwner = comment.user.username === currentUser;
            console.log(`Comment ID: ${comment.id}, isOwner: ${isOwner}`);

            return (
              <div key={comment.id} className="comment">
                {editingCommentId === comment.id ? (
                  <div className="editComment">
                    <textarea
                      value={editCommentText}
                      onChange={(e) => setEditCommentText(e.target.value)}
                      rows={3}
                      className="editCommentTextarea"
                    />
                    <div className="editButtons">
                      <button className="saveButton" onClick={() => saveCommentEdit(comment.id)}>
                        Save
                      </button>
                      <button className="cancelButton" onClick={cancelEditing}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (

                  <>
                    <p className="commentAuthor">
                      {comment.user.displayName} (@{comment.user.username})
                    </p>
                    <p className="commentContent">{comment.content}</p>
                  </>
                )}

                {isOwner && editingCommentId !== comment.id && (
                  <div className="commentControls">
                    <button onClick={() => startEditingComment(comment)}>Edit</button>
                    <button onClick={() => deleteComment(comment.id)}>Delete</button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <p>No comments yet. Be the first to comment!</p>
        )}

        {user && (
          <div className="addComment">
            <form onSubmit={handleCommentSubmit}>
              <textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                required
                className="newCommentTextarea"
              ></textarea>
              <button type="submit">Post Comment</button>
            </form>
            {commentError && <p className="error">{commentError}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostPage;
