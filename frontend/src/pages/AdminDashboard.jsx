import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Navbar from '../components/Navbar';

export function AdminDashboard() {
  const { API_URL } = useAuth();
  const [stats, setStats] = useState({ courses: 0, users: 0, modules: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [coursesRes, usersRes] = await Promise.all([
        axios.get(`${API_URL}/courses`),
        axios.get(`${API_URL}/users`)
      ]);
      
      const courses = coursesRes.data.data;
      const users = usersRes.data.data.filter(u => u.role === 'employee');
      const totalModules = courses.reduce((sum, c) => sum + (c.modules?.length || 0), 0);
      
      setStats({
        courses: courses.length,
        users: users.length,
        modules: totalModules
      });

      // Fetch progress for all users
      const progressPromises = users.map(user => 
        axios.get(`${API_URL}/users/${user._id}/progress`)
          .then(res => ({ user, progress: res.data.data }))
          .catch(() => ({ user, progress: null }))
      );

      const progressResults = await Promise.all(progressPromises);

      // Calculate top performers (users with highest completion rate)
      const performers = progressResults
        .filter(p => p.progress && p.progress.totalCoursesAssigned > 0)
        .map(p => {
          const completionRate = p.progress.totalCoursesAssigned > 0 
            ? (p.progress.totalCoursesCompleted / p.progress.totalCoursesAssigned) * 100 
            : 0;
          const totalChapters = p.progress.courses?.reduce((sum, c) => sum + c.totalChapters, 0) || 0;
          const completedChapters = p.progress.courses?.reduce((sum, c) => sum + c.completedChapters, 0) || 0;
          return {
            user: p.user,
            completionRate,
            completedCourses: p.progress.totalCoursesCompleted,
            totalCourses: p.progress.totalCoursesAssigned,
            completedChapters,
            totalChapters
          };
        })
        .sort((a, b) => b.completionRate - a.completionRate)
        .slice(0, 5);

      setTopPerformers(performers);

      // Get recent activity (users who recently completed chapters)
      const activity = progressResults
        .filter(p => p.progress && p.progress.courses && p.progress.courses.length > 0)
        .flatMap(p => 
          p.progress.courses.map(course => ({
            user: p.user,
            course: course.courseTitle,
            progress: course.progress,
            completedChapters: course.completedChapters,
            totalChapters: course.totalChapters
          }))
        )
        .filter(a => a.progress > 0)
        .sort((a, b) => b.progress - a.progress)
        .slice(0, 5);

      setRecentActivity(activity);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container fade-in">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Admin Dashboard
        </h1>
        <p style={{ color: 'var(--text-light)', fontSize: '1.1rem', marginBottom: '3rem' }}>
          Manage courses, modules, and users
        </p>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.courses}</div>
            <div className="stat-label">Total Courses</div>
          </div>
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="stat-value">{stats.modules}</div>
            <div className="stat-label">Total Modules</div>
          </div>
          <div className="stat-card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <div className="stat-value">{stats.users}</div>
            <div className="stat-label">Total Users</div>
          </div>
        </div>

        <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/courses')}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📚 Manage Courses</h3>
            <p style={{ color: 'var(--text-light)' }}>
              Create, edit, and manage training courses
            </p>
            <button className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Go to Courses
            </button>
          </div>

          <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/users')}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👥 Manage Users</h3>
            <p style={{ color: 'var(--text-light)' }}>
              View and manage employee accounts
            </p>
            <button className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Go to Users
            </button>
          </div>
        </div>

        {/* Top Performers Section */}
        {!loading && topPerformers.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>🏆 Top Performers</h2>
            <div className="card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {topPerformers.map((performer, index) => (
                  <div 
                    key={performer.user._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      background: index === 0 ? 'rgba(255, 215, 0, 0.1)' : 'var(--bg-light)',
                      borderRadius: '8px',
                      border: index === 0 ? '2px solid gold' : 'none'
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : 'var(--accent)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '1.1rem'
                    }}>
                      {index + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '1.05rem' }}>
                        {performer.user.name}
                      </div>
                      <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                        {performer.user.department} • {performer.completedChapters}/{performer.totalChapters} chapters
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>
                        {Math.round(performer.completionRate)}%
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                        {performer.completedCourses}/{performer.totalCourses} courses
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity Section */}
        {!loading && recentActivity.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>📊 Recent Activity</h2>
            <div className="card">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentActivity.map((activity, index) => (
                  <div 
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      background: 'var(--bg-light)',
                      borderRadius: '8px'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        {activity.user.name}
                      </div>
                      <div style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>
                        {activity.course}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600, color: activity.progress === 100 ? 'var(--success)' : 'var(--accent)' }}>
                        {activity.progress}% complete
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                        {activity.completedChapters}/{activity.totalChapters} chapters
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
