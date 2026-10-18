
import React from 'react';

export const CreatePost = () => {
    return (
        <section className="create-post-section">
            <h1>
                create post
            </h1>
            <form>
                <input
                    type="file"
                    name="image"
                    accept="image/*"
                />
                <input
                    type="text"
                    name="caption"
                    placeholder="Enter caption"
                    required
                />
                <button type="submit">Submit</button>
            </form>
        </section>
    );
};
