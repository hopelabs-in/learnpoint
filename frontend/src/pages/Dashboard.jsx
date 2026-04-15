// Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Navbar from '../components/Navbar';

function Dashboard() {
  const { user, API_URL } = useAuth();
  const [courses, setCourses] = useState([]);
  const [courseProgress, setCourseProgress] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_URL}/courses`);
      const coursesData = response.data.data;
      setCourses(coursesData);

      // Fetch progress for each course
      const progressPromises = coursesData.map(course => 
        axios.get(`${API_URL}/courses/${course._id}/progress`)
          .then(res => ({ courseId: course._id, progress: res.data.data }))
          .catch(() => ({ courseId: course._id, progress: { progress: 0 } }))
      );

      const progressResults = await Promise.all(progressPromises);
      const progressMap = {};
      progressResults.forEach(({ courseId, progress }) => {
        progressMap[courseId] = progress;
      });
      setCourseProgress(progressMap);

      // Calculate stats
      const completed = progressResults.filter(p => p.progress.progress === 100).length;
      const inProgress = progressResults.filter(p => p.progress.progress > 0 && p.progress.progress < 100).length;
      
      setStats({
        total: coursesData.length,
        completed,
        inProgress
      });
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container fade-in">
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Welcome back, {user?.name}! 👋
          </h1>
          <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>
            Continue your learning journey
          </p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Courses</div>
          </div>
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="stat-value">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #00D9A3 0%, #00FFCC 100%)' }}>
            <div className="stat-value">{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        <div style={{ marginTop: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem' }}>My Courses</h2>
            <button className="btn btn-primary" onClick={() => navigate('/courses')}>
              View All Courses
            </button>
          </div>

          <div className="course-grid">
            {courses.slice(0, 6).map((course) => {
              const progress = courseProgress[course._id]?.progress || 0;
              return (
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
                  <div style={{ marginTop: '1rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-light)' }}>Progress</span>
                    <span style={{ fontWeight: 600, color: progress === 100 ? 'var(--success)' : 'var(--accent)' }}>
                      {progress}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
