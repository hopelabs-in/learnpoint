import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Navbar from '../components/Navbar';

function AdminCourses() {
  const { API_URL } = useAuth();
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    department: 'IT',
    bank: 'SSFB',
    thumbnail: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_URL}/courses`);
      setCourses(response.data.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const openCreateModal = () => {
    setEditingCourse(null);
    setFormData({ title: '', description: '', department: 'IT', bank: 'SSFB', thumbnail: '' });
    setShowModal(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description,
      department: course.tags.department,
      bank: course.tags.bank,
      thumbnail: course.thumbnail || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        thumbnail: formData.thumbnail,
        tags: {
          department: formData.department,
          bank: formData.bank
        }
      };

      if (editingCourse) {
        await axios.put(`${API_URL}/courses/${editingCourse._id}`, payload);
      } else {
        await axios.post(`${API_URL}/courses`, payload);
      }

      setShowModal(false);
      setFormData({ title: '', description: '', department: 'IT', bank: 'SSFB' });
      setEditingCourse(null);
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await axios.delete(`${API_URL}/courses/${id}`);
        fetchCourses();
      } catch (error) {
        console.error('Error deleting course:', error);
      }
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem' }}>Manage Courses</h1>
          <button className="btn btn-primary" onClick={openCreateModal}>
            + Create Course
          </button>
<button className="btn btn-outline" onClick={() => navigate('/admin/courses/ai-generate')}>
  ✨ Generate with AI
</button>
        </div>

        <div className="course-grid">
          {courses.map((course) => (
            <div key={course._id} className="card course-card">
              <div 
                className="course-thumbnail" 
                style={course.thumbnail ? {
                  backgroundImage: `url(${course.thumbnail})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                } : {}}
              />
              <div className="course-tags">
                <span className="tag tag-department">{course.tags.department}</span>
                <span className="tag tag-bank">{course.tags.bank}</span>
              </div>
              <h3 className="card-title">{course.title}</h3>
              <p className="card-subtitle">{course.description}</p>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ fontSize: '0.9rem' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/admin/courses/${course._id}/edit`);
                  }}
                >
                  Edit Content
                </button>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-outline" 
                    style={{ flex: 1, fontSize: '0.9rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditModal(course);
                    }}
                  >
                    Edit Info
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    style={{ flex: 1, fontSize: '0.9rem' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(course._id);
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showModal && (
          <div style={modalStyles.overlay}>
            <div style={modalStyles.modal} className="card">
              <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>
                {editingCourse ? 'Edit Course' : 'Create New Course'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Course Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Thumbnail Image URL (optional)</label>
                  <input
                    type="url"
                    className="form-input"
                    value={formData.thumbnail}
                    onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.thumbnail && (
                    <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'var(--bg-light)', borderRadius: '4px', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                      Preview: {formData.thumbnail}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                  >
                    <option value="IT">IT</option>
                    <option value="Ops">Operations</option>
                    <option value="Onboarding">Onboarding</option>
                    <option value="Risk">Risk</option>
                    <option value="Product">Product</option>
                    <option value="Customer Service">Customer Service</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Bank</label>
                  <select
                    className="form-select"
                    value={formData.bank}
                    onChange={(e) => setFormData({...formData, bank: e.target.value})}
                  >
                    <option value="SSFB">SSFB</option>
                    <option value="CUB">CUB</option>
                    <option value="ESAF">ESAF</option>
                    <option value="All">All Banks</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    {editingCourse ? 'Update Course' : 'Create Course'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    style={{ flex: 1 }}
                    onClick={() => {
                      setShowModal(false);
                      setEditingCourse(null);
                    }}
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

export default AdminCourses;
