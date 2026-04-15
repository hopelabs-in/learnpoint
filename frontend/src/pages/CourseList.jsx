import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Navbar from '../components/Navbar';

function CourseList() {
  const { API_URL } = useAuth();
  const [courses, setCourses] = useState([]);
  const [filter, setFilter] = useState({ department: 'all', bank: 'all' });
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

  const filteredCourses = courses.filter(course => {
    if (filter.department !== 'all' && course.tags.department !== filter.department) return false;
    if (filter.bank !== 'all' && course.tags.bank !== filter.bank) return false;
    return true;
  });

  return (
    <div>
      <Navbar />
      <div className="container fade-in">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          All Courses
        </h1>
        <p style={{ color: 'var(--text-light)', fontSize: '1.1rem', marginBottom: '2rem' }}>
          Browse and explore courses assigned to you
        </p>

        <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Department</label>
              <select 
                className="form-select"
                value={filter.department}
                onChange={(e) => setFilter({...filter, department: e.target.value})}
              >
                <option value="all">All Departments</option>
                <option value="IT">IT</option>
                <option value="Ops">Operations</option>
                <option value="Onboarding">Onboarding</option>
                <option value="Risk">Risk</option>
                <option value="Product">Product</option>
                <option value="Customer Service">Customer Service</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Bank</label>
              <select 
                className="form-select"
                value={filter.bank}
                onChange={(e) => setFilter({...filter, bank: e.target.value})}
              >
                <option value="all">All Banks</option>
                <option value="SSFB">SSFB</option>
                <option value="CUB">CUB</option>
                <option value="ESAF">ESAF</option>
              </select>
            </div>
          </div>
        </div>

        <div className="course-grid">
          {filteredCourses.map((course) => (
            <div 
              key={course._id} 
              className="card course-card"
              onClick={() => navigate(`/courses/${course._id}`)}
            >
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
              <div style={{ marginTop: '1rem', color: 'var(--text-light)', fontSize: '0.9rem' }}>
                {course.modules?.length || 0} modules
              </div>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-light)' }}>
            <p style={{ fontSize: '1.2rem' }}>No courses found matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CourseList;
