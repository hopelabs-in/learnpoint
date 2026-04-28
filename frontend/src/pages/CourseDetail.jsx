import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Navbar from '../components/Navbar';

function CourseDetail() {
  const { id } = useParams();
  const { API_URL, user } = useAuth();
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourseDetails();
    fetchProgress();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCourseDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/courses/${id}`);
      setCourse(response.data.data);
    } catch (error) {
      console.error('Error fetching course:', error);
    }
  };

  const fetchProgress = async () => {
    try {
      const response = await axios.get(`${API_URL}/courses/${id}/progress`);
      setProgress(response.data.data);
    } catch (error) {
      console.error('Error fetching progress:', error);
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
          onClick={() => navigate('/courses')}
          style={{ marginBottom: '2rem' }}
        >
          ← Back to Courses
        </button>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <div className="course-tags">
            <span className="tag tag-department">{course.tags.department}</span>
            <span className="tag tag-bank">{course.tags.bank}</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', margin: '1rem 0' }}>{course.title}</h1>
          <p style={{ color: 'var(--text-light)', fontSize: '1.1rem', marginBottom: '1.5rem' }}>
            {course.description}
          </p>
          
          {progress && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>Progress</span>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                  {progress.completedChapters}/{progress.totalChapters} chapters completed
                </span>
              </div>
              <div className="progress-bar" style={{ height: '12px' }}>
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Course Modules</h2>

        <div className="module-list">
          {course.modules && course.modules.length > 0 ? (
            course.modules.map((module, index) => {
              const completedChapters = module.chapters?.filter(chapter => 
                user.completedChapters?.includes(chapter._id)
              ).length || 0;
              const totalChapters = module.chapters?.length || 0;
              const moduleProgress = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;
              const isModuleCompleted = moduleProgress === 100;

              return (
                <div 
                  key={module._id} 
                  className="card module-card slide-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="module-header">
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                        <div className="module-order">{module.order}</div>
                        <h3 style={{ fontSize: '1.5rem' }}>{module.title}</h3>
                        {isModuleCompleted && (
                          <span style={{
                            background: 'var(--success)',
                            color: 'white',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            ✓ Completed
                          </span>
                        )}
                      </div>
                      <p style={{ color: 'var(--text-light)', marginLeft: '3.5rem' }}>
                        {module.description}
                      </p>
                    </div>
                    <button 
                      className="btn btn-primary"
                      onClick={() => navigate(`/modules/${module._id}`)}
                    >
                      View Module
                    </button>
                  </div>

                  <div style={{ marginTop: '1.5rem', marginLeft: '3.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
                        {totalChapters} chapters
                      </span>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: moduleProgress === 100 ? 'var(--success)' : 'var(--text-light)' }}>
                        {Math.round(moduleProgress)}% complete
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${moduleProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>
                No modules available for this course yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;