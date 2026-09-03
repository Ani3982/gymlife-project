import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import DataTable from '../../components/admin/DataTable';
import ConfirmModal from '../../components/admin/ConfirmModal';
import { useToast } from '../../context/ToastContext';

const AdminBlog = () => {
  const { showSuccess, showError } = useToast();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    short_description: '',
    content: '',
    author: 'GymLife Editorial Team',
    category: 'FITNESS',
    status: 'PUBLISHED',
    image_url: '/img/blog/blog-1.jpg'
  });

  useEffect(() => {
    loadBlogs();
  }, [currentFilter]);

  const loadBlogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (currentFilter !== 'ALL') params.status = currentFilter;
      const res = await api.adminGetBlogs(params);
      if (res && res.status === 'success') {
        setBlogs(res.data || []);
      }
    } catch (err) {
      console.error('Error loading blogs:', err);
      showError('Failed to load blog posts.');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedBlog(null);
    setFormData({
      title: '',
      short_description: '',
      content: '',
      author: 'GymLife Editorial Team',
      category: 'FITNESS',
      status: 'PUBLISHED',
      image_url: `/img/blog/blog-${(blogs.length % 5) + 1}.jpg`
    });
    setShowModal(true);
  };

  const openEditModal = (blog) => {
    setModalMode('edit');
    setSelectedBlog(blog);
    setFormData({
      title: blog.title || '',
      short_description: blog.short_description || '',
      content: blog.content || '',
      author: blog.author || 'GymLife Admin',
      category: blog.category || 'FITNESS',
      status: blog.status || 'PUBLISHED',
      image_url: blog.image_url || '/img/blog/blog-1.jpg'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      showError('Blog title and content are required.');
      return;
    }

    setSaving(true);
    try {
      if (modalMode === 'add') {
        await api.adminCreateBlog(formData);
        showSuccess(`Article "${formData.title}" published! Public blog updated.`);
      } else {
        await api.adminUpdateBlog(selectedBlog.id, formData);
        showSuccess(`Article "${formData.title}" updated successfully!`);
      }
      setShowModal(false);
      loadBlogs();
    } catch (err) {
      showError(err.message || 'Error saving blog post.');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (blog) => {
    setBlogToDelete(blog);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!blogToDelete) return;
    setSaving(true);
    try {
      await api.adminDeleteBlog(blogToDelete.id);
      showSuccess(`Blog post "${blogToDelete.title}" deleted.`);
      setShowDeleteModal(false);
      loadBlogs();
    } catch (err) {
      showError(err.message || 'Error deleting blog post.');
    } finally {
      setSaving(false);
    }
  };

  const togglePublishStatus = async (blog) => {
    const nextStatus = blog.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await api.adminUpdateBlog(blog.id, { status: nextStatus });
      showSuccess(`Article status changed to ${nextStatus}`);
      loadBlogs();
    } catch (err) {
      showError('Failed to update status');
    }
  };

  const columns = [
    {
      header: 'Article',
      key: 'title',
      sortable: true,
      render: (val, row) => (
        <div className="table-member-cell">
          <img 
            src={row.image_url || '/img/blog/blog-1.jpg'} 
            alt={val} 
            className="table-avatar"
          />
          <div>
            <span className="table-main-text">{val}</span>
            <span className="table-sub-text">By {row.author} • {row.category}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Slug',
      key: 'slug',
      sortable: true,
      render: (val) => <span className="slug-tag">/{val}</span>
    },
    {
      header: 'Published Date',
      key: 'created_at',
      sortable: true
    },
    {
      header: 'Status',
      key: 'status',
      sortable: true,
      render: (val, row) => (
        <button
          type="button"
          onClick={() => togglePublishStatus(row)}
          className={`status-badge-pill ${val.toLowerCase()} clickable`}
          title="Click to toggle Draft / Published"
        >
          {val}
        </button>
      )
    },
    {
      header: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, row) => (
        <div className="table-actions-row">
          <button 
            type="button" 
            className="action-icon-btn edit" 
            title="Edit Article"
            onClick={() => openEditModal(row)}
          >
            <i className="fa fa-pencil"></i>
          </button>
          <button 
            type="button" 
            className="action-icon-btn delete" 
            title="Delete Article"
            onClick={() => openDeleteModal(row)}
          >
            <i className="fa fa-trash-o"></i>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="admin-module-page">
      <div className="module-top-header">
        <div>
          <h2 className="module-title">FITNESS BLOG & ARTICLES MANAGER</h2>
          <p className="module-subtitle">Create science-backed nutrition and workout articles for the public GymLife blog.</p>
        </div>
        <button type="button" onClick={openAddModal} className="admin-btn primary">
          <i className="fa fa-pencil-square-o"></i> Write New Article
        </button>
      </div>

      <DataTable
        columns={columns}
        data={blogs}
        loading={loading}
        searchPlaceholder="Search articles by title, author, or category..."
        filterOptions={[
          { label: 'All Statuses', value: 'ALL' },
          { label: 'Published', value: 'PUBLISHED' },
          { label: 'Drafts', value: 'DRAFT' },
          { label: 'Archived', value: 'ARCHIVED' },
        ]}
        currentFilter={currentFilter}
        onFilterChange={setCurrentFilter}
        filterLabel="Article Status"
        defaultSortField="created_at"
        defaultSortAsc={false}
        emptyMessage="No blog articles found."
      />

      {/* Add / Edit Blog Modal */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal-dialog modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <h3 className="modal-title">{modalMode === 'add' ? 'WRITE NEW ARTICLE' : 'EDIT ARTICLE'}</h3>
                <p className="modal-subtitle">Published articles appear on the public fitness blog.</p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setShowModal(false)}>
                <i className="fa fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div className="form-grid-2">
                  <div className="form-group">
                    <label className="admin-form-label">Article Title *</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. The Science of Muscle Hypertrophy & Protein Timing"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Category *</label>
                    <select
                      className="admin-form-input"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="FITNESS">FITNESS & HEALTH</option>
                      <option value="NUTRITION">NUTRITION & DIET</option>
                      <option value="STRENGTH">STRENGTH & CONDITIONING</option>
                      <option value="YOGA">YOGA & MINDFULNESS</option>
                      <option value="CROSSFIT">CROSSFIT & FUNCTIONAL</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Author Name</label>
                    <input
                      type="text"
                      className="admin-form-input"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      placeholder="e.g. Coach John Smith"
                    />
                  </div>

                  <div className="form-group">
                    <label className="admin-form-label">Publishing Status</label>
                    <select
                      className="admin-form-input"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="PUBLISHED">PUBLISHED (Visible to Public)</option>
                      <option value="DRAFT">DRAFT (Hidden / Internal)</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label className="admin-form-label">Cover Image URL</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="/img/blog/blog-1.jpg"
                  />
                </div>

                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label className="admin-form-label">Short Summary (Excerpt)</label>
                  <input
                    type="text"
                    className="admin-form-input"
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    placeholder="Brief 1-2 sentence preview for cards..."
                  />
                </div>

                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label className="admin-form-label">Full Article Content (Markdown or Text) *</label>
                  <textarea
                    className="admin-form-input"
                    rows="8"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your article body here. Supports standard headings, bullet points, and paragraphs..."
                    required
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn primary" disabled={saving}>
                  {saving ? 'Publishing...' : modalMode === 'add' ? 'Publish Article' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Blog Post"
        message={`Are you sure you want to permanently delete article "${blogToDelete?.title}"?`}
        confirmText="Delete Article"
        loading={saving}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default AdminBlog;
