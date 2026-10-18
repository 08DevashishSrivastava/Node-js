
import React, { useCallback, useEffect, useState } from 'react';
import api from '../api.js';

export const CreatePost = ({ onCreated }) => {
    const [caption, setCaption] = useState('');
    const [image, setImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [imageKitConfigured, setImageKitConfigured] = useState(null);
    const [isCheckingConfiguration, setIsCheckingConfiguration] = useState(false);
    const [statusError, setStatusError] = useState('');

    const checkImageKitConfiguration = useCallback(async () => {
        setIsCheckingConfiguration(true);
        try {
            const response = await api.get('/health');
            setImageKitConfigured(response.data?.data?.imageKitConfigured === true);
            setStatusError('');
        } catch (requestError) {
            setImageKitConfigured(null);
            setStatusError(
                requestError.response?.data?.message || 'Unable to check ImageKit configuration.'
            );
        } finally {
            setIsCheckingConfiguration(false);
        }
    }, []);

    useEffect(() => {
        checkImageKitConfiguration();
    }, [checkImageKitConfiguration]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (imageKitConfigured !== true) {
            setError('ImageKit is not configured. Add your rotated private key to the project-root .env file, restart the backend, then check the configuration again.');
            return;
        }
        if (!image) {
            setError('Choose an image to upload.');
            return;
        }
        if (!caption.trim()) {
            setError('Caption is required.');
            return;
        }

        const formData = new FormData();
        formData.append('image', image);
        formData.append('caption', caption.trim());
        const formElement = event.currentTarget;

        try {
            setIsSubmitting(true);
            setError('');
            setSuccess('');
            await api.post('/posts', formData);
            setCaption('');
            setImage(null);
            formElement.reset();
            setSuccess('Image post created successfully.');
            onCreated?.();
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to create image post.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="create-post-section">
            <h2>Create image post</h2>
            {imageKitConfigured === false && (
                <div className="setup-notice" role="status">
                    <p>Image uploads need a valid ImageKit private key.</p>
                    <p>Replace the sample value for <code>IMAGEKIT_PRIVATE_KEY</code> in the project-root <code>.env</code>, then restart the backend.</p>
                    <button type="button" onClick={checkImageKitConfiguration} disabled={isCheckingConfiguration}>
                        {isCheckingConfiguration ? 'Checking...' : 'Check configuration again'}
                    </button>
                </div>
            )}
            {statusError && <p className="error-message" role="alert">{statusError}</p>}
            {imageKitConfigured === null && !statusError && (
                <p role="status">Checking ImageKit configuration...</p>
            )}
            <form onSubmit={handleSubmit}>
                <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={(event) => setImage(event.target.files?.[0] || null)}
                    required
                />
                <input
                    type="text"
                    name="caption"
                    value={caption}
                    onChange={(event) => setCaption(event.target.value)}
                    placeholder="Enter caption"
                    maxLength={500}
                    required
                />
                <button type="submit" disabled={isSubmitting || imageKitConfigured !== true}>
                    {isSubmitting ? 'Uploading...' : imageKitConfigured === null ? 'Checking configuration...' : 'Upload image'}
                </button>
            </form>
            <p className="upload-hint">JPEG, PNG, GIF, or WebP; maximum 5 MB.</p>
            {error && <p className="error-message" role="alert">{error}</p>}
            {success && <p className="success-message" role="status">{success}</p>}
        </section>
    );
};
