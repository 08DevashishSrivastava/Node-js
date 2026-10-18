import React, { useCallback, useEffect, useState } from 'react';
import api from '../api.js';

const Feed = ({ refreshKey }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/posts');
            setPosts(response.data?.data || []);
            setError('');
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to load image posts.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts, refreshKey]);

    const deletePost = async (postId) => {
        try {
            await api.delete(`/posts/${postId}`);
            setPosts((current) => current.filter((post) => post._id !== postId));
            setError('');
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to delete image post.');
        }
    };

    return (
        <section className="feed-section">
            <h2>Image posts</h2>
            {loading ? (
                <p>Loading image posts...</p>
            ) : error ? (
                <div className="empty-state">
                    <p className="error-message" role="alert">{error}</p>
                    <button type="button" onClick={fetchPosts}>Retry</button>
                </div>
            ) : posts.length === 0 ? (
                <p className="empty-state">No image posts yet.</p>
            ) : (
                <div className="post-grid">
                    {posts.map((post) => (
                        <article key={post._id} className="post-card">
                            <img src={post.imageUrl} alt={post.caption} />
                            <p>{post.caption}</p>
                            <button type="button" className="danger" onClick={() => deletePost(post._id)}>
                                Delete
                            </button>
                        </article>
                    ))}
                </div>
            )}
        </section>
    );
};

export default Feed;