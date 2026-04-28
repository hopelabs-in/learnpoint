import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Navbar from '../components/Navbar';

function CourseContentEditor() {
  const { id } = useParams();
  const { API_URL } = useAuth();
  const [course, setCourse] = useState(null);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    order: 1
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourse();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCourse = async () => {
    try {
      const response = await axios.get(`${API_URL}/courses/${id}`);
      setCourse(response.data.data);
    } catch (error) {
      console.error('Error fetching course:', error);
    }
  };

  const openModuleModal = (module = null) => {
    if (module) {
      setEditingModule(module);
      setModuleForm({
        title: module.title,
        description: module.description,
        order: module.order
      });
    } else {
      setEditingModule(null);
      setModuleForm({
        title: '',
        description: '',
        order: (course?.modules?.length || 0) + 1
      });
    }
    setShowModuleModal(true);
  };

  const openChapterModal = (moduleId, chapter = null) => {
    if (chapter) {
      // Navigate to rich editor for existing chapter
      navigate(`/admin/chapters/${chapter._id}/edit`);
    } else {
      // Navigate to rich editor for new chapter
      navigate(`/admin/chapters/new/edit?moduleId=${moduleId}`);
    }
  };

  const handleModuleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingModule) {
        await axios.put(`${API_URL}/modules/${editingModule._id}`, moduleForm);
      } else {
        await axios.post(`${API_URL}/courses/${id}/modules`, moduleForm);
      }
      setShowModuleModal(false);
      fetchCourse();
    } catch (error) {
      console.error('Error saving module:', error);
      alert('Failed to save module');
    }
  };

  const deleteModule = async (moduleId) => {
    if (window.confirm('Delete this module and all its chapters?')) {
      try {
        await axios.delete(`${API_URL}/modules/${moduleId}`);
        fetchCourse();
      } catch (error) {
        console.error('Error deleting module:', error);
      }
    }
  };

  const deleteChapter = async (chapterId) => {
    if (window.confirm('Delete this chapter?')) {
      try {
        await axios.delete(`${API_URL}/chapters/${chapterId}`);
        fetchCourse();
      } catch (error) {
        console.error('Error deleting chapter:', error);
      }
    }
  };

  if (!course) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <Navbar />
      <div className="container fade-in">
        <button 
          className="btn btn-outline" 
          onClick={() => navigate('/admin/courses')}
          style={{ marginBottom: '2rem' }}
        >
          ← Back to Courses
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{course.title}</h1>
            <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>
              Edit course content: modules and chapters
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => openModuleModal()}>
            + Add Module
          </button>
        </div>

        {/* Modules List */}
        <div className="module-list">
          {course.modules && course.modules.length > 0 ? (
            course.modules.map((module) => (
              <div key={module._id} className="card module-card">
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div className="module-order">{module.order}</div>
                        <h3 style={{ fontSize: '1.5rem' }}>{module.title}</h3>
                      </div>
                      <p style={{ color: 'var(--text-light)', marginLeft: '3.5rem' }}>
                        {module.description}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-outline"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                        onClick={() => openModuleModal(module)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                        onClick={() => deleteModule(module._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                {/* Chapters List */}
                <div style={{ marginLeft: '3.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h4 style={{ fontSize: '1.1rem' }}>Chapters</h4>
                    <button 
                      className="btn btn-primary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                      onClick={() => openChapterModal(module._id)}
                    >
                      + Add Chapter
                    </button>
                  </div>

                  {module.chapters && module.chapters.length > 0 ? (
                    <div className="chapter-list">
                      {module.chapters.map((chapter) => (
                        <div key={chapter._id} className="chapter-item">
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <h5 style={{ fontSize: '1rem', fontWeight: 600 }}>{chapter.title}</h5>
                              <span className={`chapter-content-type type-${chapter.contentType}`}>
                                {chapter.contentType}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                              {chapter.estimatedDuration} min • Order: {chapter.order}
                            </p>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              className="btn btn-outline"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                              onClick={() => openChapterModal(module._id, chapter)}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-secondary"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                              onClick={() => deleteChapter(chapter._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-light)', background: 'var(--bg-light)', borderRadius: '8px' }}>
                      No chapters yet. Click "Add Chapter" to create one.
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>
                No modules yet. Click "Add Module" to get started.
              </p>
            </div>
          )}
        </div>

        {/* Module Modal */}
        {showModuleModal && (
          <div style={modalStyles.overlay}>
            <div style={modalStyles.modal} className="card">
              <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>
                {editingModule ? 'Edit Module' : 'Add New Module'}
              </h2>
              <form onSubmit={handleModuleSubmit}>
                <div className="form-group">
                  <label className="form-label">Module Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={moduleForm.title}
                    onChange={(e) => setModuleForm({...moduleForm, title: e.target.value})}
                    required
                    placeholder="e.g., Introduction to Banking"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    value={moduleForm.description}
                    onChange={(e) => setModuleForm({...moduleForm, description: e.target.value})}
                    required
                    placeholder="Describe what this module covers"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Order</label>
                  <input
                    type="number"
                    className="form-input"
                    value={moduleForm.order}
                    onChange={(e) => setModuleForm({...moduleForm, order: parseInt(e.target.value)})}
                    required
                    min="1"
                  />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    {editingModule ? 'Update Module' : 'Add Module'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    style={{ flex: 1 }}
                    onClick={() => setShowModuleModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(10, 22, 40, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '2rem'
  },
  modal: {
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto'
  }
};

export default CourseContentEditor;