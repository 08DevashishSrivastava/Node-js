import React, { useEffect, useState } from 'react';
import api, { apiBaseUrl } from './api.js';
import { CreatePost } from './pages/CreatePost.jsx';
import Feed from './pages/feed.jsx';

const App = () => {
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [apiUnavailable, setApiUnavailable] = useState(false);
  const [postsRefreshKey, setPostsRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });
  const [isUpdatingNote, setIsUpdatingNote] = useState(false);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notes');
      setNotes(response.data?.data || []);
      setApiUnavailable(false);
      setError('');
    } catch (err) {
      setApiUnavailable(!err.response);
      setError(
        err.response?.data?.message ||
          (err.response
            ? 'The backend returned an error while loading notes.'
            : `Cannot reach the backend at ${apiBaseUrl}. Start the backend with "npm start" from the project root.`)
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setSuccessMessage('');
      await api.post('/notes', form);
      setForm({ title: '', description: '' });
      setSuccessMessage('Note created successfully');
      await fetchNotes();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to create note.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this note? This cannot be undone.')) {
      return;
    }

    try {
      setError('');
      await api.delete(`/notes/${id}`);
      setSuccessMessage('Note deleted successfully');
      await fetchNotes();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete note.');
    }
  };

  const handleEdit = async (id) => {
    const selectedNote = notes.find((note) => note._id === id);
    if (!selectedNote) {
      return;
    }

    setEditForm({
      title: selectedNote.title || '',
      description: selectedNote.description || '',
    });
    setEditingNote(selectedNote);
    setError('');
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();
    if (!editingNote || !editForm.title.trim() || !editForm.description.trim()) {
      setError('Title and description are required.');
      return;
    }
    try {
      setIsUpdatingNote(true);
      setError('');
      await api.patch(`/notes/${editingNote._id}`, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
      });
      setSuccessMessage('Note updated successfully');
      setEditingNote(null);
      await fetchNotes();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update note.');
    } finally {
      setIsUpdatingNote(false);
    }
  };

  const filteredNotes = notes.filter((note) => {
    const query = searchQuery.trim().toLocaleLowerCase();
    return !query || `${note.title || ''} ${note.description || ''}`.toLocaleLowerCase().includes(query);
  });

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">N</div>
          <div>
            <p className="brand-name">Devashish Notes</p>
            <p className="brand-caption">Your personal space</p>
          </div>
        </div>
        <span className="header-tag">NOTES &amp; MOMENTS</span>
      </header>

      <section className="welcome-panel">
        <div>
          <p className="eyebrow">A LITTLE SPACE FOR YOUR IDEAS</p>
          <h1>Make room for what matters.</h1>
          <p className="welcome-copy">Capture a thought, keep a memory, and find it whenever you need it.</p>
        </div>
        <div className="welcome-stat" aria-label={`${notes.length} notes saved`}>
          <span className="stat-value">{notes.length}</span>
          <span className="stat-label">NOTES SAVED</span>
        </div>
      </section>

      <div className="notes-workspace">
        <section className="note-form-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">START WRITING</p>
              <h2>New note</h2>
            </div>
            <span className="section-index">01</span>
          </div>
          <form onSubmit={handleSubmit}>
            <label>
              <span>Title</span>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Give your note a title"
              />
            </label>
            <label>
              <span>Description</span>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="What's on your mind?"
                rows="5"
              />
            </label>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Create note'}
              {!isSubmitting && <span aria-hidden="true">↗</span>}
            </button>
          </form>
          {error && <p className="error-message" role="alert">{error}</p>}
          {successMessage && <p className="success-message" role="status">{successMessage}</p>}
        </section>

        <section className="notes-list">
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR COLLECTION</p>
              <h2>Your notes</h2>
            </div>
            <span className="collection-count">{notes.length} {notes.length === 1 ? 'note' : 'notes'}</span>
          </div>
          {!loading && !apiUnavailable && notes.length > 0 && (
            <label className="note-search">
              <span className="search-icon" aria-hidden="true">⌕</span>
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search your notes"
                aria-label="Search your notes"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} aria-label="Clear search">
                  Clear
                </button>
              )}
            </label>
          )}
          {loading ? (
            <p className="empty-state">Loading your notes...</p>
          ) : apiUnavailable ? (
            <div className="empty-state">
              <p>Notes are unavailable because the backend is not reachable.</p>
              <button type="button" onClick={fetchNotes}>Retry connection</button>
            </div>
          ) : notes.length === 0 ? (
            <p className="empty-state">Your first note is waiting to be written.</p>
          ) : filteredNotes.length === 0 ? (
            <p className="empty-state">No notes match “{searchQuery}”. Try a different search.</p>
          ) : (
            <div className="note-grid">
              {filteredNotes.map((note) => (
                <article key={note._id} className="note-card">
                  <div className="note-card-meta">
                    <span className="note-marker" aria-hidden="true" />
                    <time dateTime={note.updatedAt || note.createdAt}>
                      {note.updatedAt || note.createdAt
                        ? new Date(note.updatedAt || note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                        : ''}
                    </time>
                  </div>
                  <h3>{note.title}</h3>
                  <p>{note.description || 'No description added.'}</p>
                  <div className="note-actions">
                    <button type="button" onClick={() => handleEdit(note._id)}>Edit</button>
                    <button type="button" className="danger" onClick={() => handleDelete(note._id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="media-workspace">
        <CreatePost onCreated={() => setPostsRefreshKey((current) => current + 1)} />
        <Feed refreshKey={postsRefreshKey} />
      </div>
      {editingNote && (
        <div
          className="dialog-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isUpdatingNote) setEditingNote(null);
          }}
        >
          <section className="edit-dialog" role="dialog" aria-modal="true" aria-labelledby="edit-note-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">UPDATE YOUR COLLECTION</p>
                <h2 id="edit-note-title">Edit note</h2>
              </div>
              <button className="dialog-close" type="button" onClick={() => setEditingNote(null)} aria-label="Close edit dialog">×</button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <label>
                <span>Title</span>
                <input
                  autoFocus
                  value={editForm.title}
                  onChange={(event) => setEditForm((current) => ({ ...current, title: event.target.value }))}
                  maxLength={200}
                  required
                />
              </label>
              <label>
                <span>Description</span>
                <textarea
                  value={editForm.description}
                  onChange={(event) => setEditForm((current) => ({ ...current, description: event.target.value }))}
                  rows="5"
                  maxLength={5000}
                  required
                />
              </label>
              {error && <p className="error-message" role="alert">{error}</p>}
              <div className="dialog-actions">
                <button type="button" className="secondary-button" onClick={() => setEditingNote(null)} disabled={isUpdatingNote}>Cancel</button>
                <button type="submit" disabled={isUpdatingNote}>{isUpdatingNote ? 'Saving...' : 'Save changes'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
      <footer className="app-footer">
        <span>Devashish Notes</span>
        <span>Made for your next good idea.</span>
      </footer>
    </main>
  );
};

export default App;