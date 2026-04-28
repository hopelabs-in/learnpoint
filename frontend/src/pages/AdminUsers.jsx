import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Navbar from '../components/Navbar';

function AdminUsers() {
  const { API_URL } = useAuth();
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    email: '',
    password: '',
    department: 'IT',
    banks: ['All']
  });

  useEffect(() => {
    fetchUsers();
    fetchCourses();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_URL}/courses`);
      setCourses(response.data.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const handleAssignCourses = async () => {
    if (!selectedUser || selectedCourses.length === 0) return;
    
    try {
      for (const courseId of selectedCourses) {
        await axios.post(`${API_URL}/courses/${courseId}/assign`, {
          userIds: [selectedUser._id]
        });
      }
      setShowAssignModal(false);
      setSelectedCourses([]);
      fetchUsers();
    } catch (error) {
      console.error('Error assigning courses:', error);
    }
  };

  const openAssignModal = (user) => {
    setSelectedUser(user);
    setShowAssignModal(true);
  };

  const openProgressModal = async (user) => {
    setSelectedUser(user);
    setShowProgressModal(true);
    setLoadingProgress(true);
    setUserProgress(null);

    try {
      const response = await axios.get(`${API_URL}/users/${user._id}/progress`);
      setUserProgress(response.data.data);
    } catch (error) {
      console.error('Error fetching user progress:', error);
    } finally {
      setLoadingProgress(false);
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/auth/register`, {
        ...employeeForm,
        role: 'employee'
      });
      setShowAddEmployeeModal(false);
      setEmployeeForm({
        name: '',
        email: '',
        password: '',
        department: 'IT',
        banks: ['All']
      });
      fetchUsers();
    } catch (error) {
      console.error('Error adding employee:', error);
      alert(error.response?.data?.message || 'Failed to add employee');
    }
  };

  return (
    <div>
      <Navbar />
      <div className="container fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem' }}>Manage Users</h1>
          <button className="btn btn-primary" onClick={() => setShowAddEmployeeModal(true)}>
            + Add Employee
          </button>
        </div>

        <div className="card">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Email</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Department</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Banks</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Role</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Courses</th>
                <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem' }}>{user.name}</td>
                  <td style={{ padding: '1rem' }}>{user.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className="tag tag-department">{user.department}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                      {user.banks?.map(bank => (
                        <span key={bank} className="tag tag-bank">{bank}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '4px',
                      background: user.role === 'admin' ? 'rgba(255, 107, 53, 0.15)' : 'rgba(102, 126, 234, 0.15)',
                      color: user.role === 'admin' ? 'var(--accent)' : '#667eea',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>{user.assignedCourses?.length || 0}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn btn-primary" 
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        onClick={() => openAssignModal(user)}
                      >
                        Assign Courses
                      </button>
                      {user.assignedCourses?.length > 0 && (
                        <button 
                          className="btn btn-outline" 
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                          onClick={() => openProgressModal(user)}
                        >
                          View Progress
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showAssignModal && selectedUser && (
          <div style={modalStyles.overlay}>
            <div style={modalStyles.modal} className="card">
              <h2 style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>
                Assign Courses to {selectedUser.name}
              </h2>
              <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>
                Select courses to assign to this user
              </p>

              <div style={{ marginBottom: '2rem', maxHeight: '400px', overflowY: 'auto' }}>
                {courses.map((course) => {
                  const isAssigned = selectedUser.assignedCourses?.some(c => c._id === course._id || c === course._id);
                  const isSelected = selectedCourses.includes(course._id);
                  
                  return (
                    <div 
                      key={course._id}
                      style={{
                        padding: '1rem',
                        marginBottom: '0.5rem',
                        border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                        borderRadius: '8px',
                        cursor: isAssigned ? 'not-allowed' : 'pointer',
                        opacity: isAssigned ? 0.5 : 1,
                        background: isSelected ? 'rgba(255, 107, 53, 0.05)' : 'white'
                      }}
                      onClick={() => {
                        if (!isAssigned) {
                          setSelectedCourses(prev =>
                            prev.includes(course._id)
                              ? prev.filter(id => id !== course._id)
                              : [...prev, course._id]
                          );
                        }
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                            {course.title}
                          </h4>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <span className="tag tag-department">{course.tags.department}</span>
                            <span className="tag tag-bank">{course.tags.bank}</span>
                          </div>
                        </div>
                        {isAssigned && (
                          <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                            ✓ Already Assigned
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1 }}
                  onClick={handleAssignCourses}
                  disabled={selectedCourses.length === 0}
                >
                  Assign {selectedCourses.length} Course{selectedCourses.length !== 1 ? 's' : ''}
                </button>
                <button 
                  className="btn btn-outline" 
                  style={{ flex: 1 }}
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedCourses([]);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showProgressModal && selectedUser && (
          <div style={modalStyles.overlay}>
            <div style={{...modalStyles.modal, maxWidth: '800px'}} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '2rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                    Learning Progress: {selectedUser.name}
                  </h2>
                  <p style={{ color: 'var(--text-light)' }}>
                    {selectedUser.email} • {selectedUser.department}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setShowProgressModal(false);
                    setUserProgress(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: 'var(--text-light)',
                    padding: '0.5rem'
                  }}
                >
                  ✕
                </button>
              </div>

              {loadingProgress ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
                  Loading progress data...
                </div>
              ) : userProgress ? (
                <>
                  {/* Summary Stats */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                    gap: '1rem',
                    marginBottom: '2rem'
                  }}>
                    <div style={{
                      background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
                      color: 'white',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        {userProgress.totalCoursesAssigned}
                      </div>
                      <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Total Courses</div>
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg, #00D9A3 0%, #00FFCC 100%)',
                      color: 'white',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        {userProgress.totalCoursesCompleted}
                      </div>
                      <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Completed</div>
                    </div>
                    <div style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        {userProgress.totalCoursesAssigned - userProgress.totalCoursesCompleted}
                      </div>
                      <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>In Progress</div>
                    </div>
                  </div>

                  {/* Course-by-Course Progress */}
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Course Progress Details</h3>
                  
                  {userProgress.courses && userProgress.courses.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                      {userProgress.courses.map((course) => (
                        <div 
                          key={course.courseId}
                          style={{
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            background: course.progress === 100 ? 'rgba(0, 217, 163, 0.05)' : 'white'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                                  {course.courseTitle}
                                </h4>
                                {course.isCompleted && (
                                  <span style={{
                                    background: 'var(--success)',
                                    color: 'white',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '20px',
                                    fontSize: '0.7rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase'
                                  }}>
                                    ✓ Completed
                                  </span>
                                )}
                              </div>
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '1rem',
                                color: 'var(--text-light)',
                                fontSize: '0.9rem'
                              }}>
                                <span>{course.completedChapters} / {course.totalChapters} chapters</span>
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ 
                                fontSize: '1.75rem', 
                                fontWeight: 700,
                                color: course.progress === 100 ? 'var(--success)' : 'var(--accent)'
                              }}>
                                {course.progress}%
                              </div>
                            </div>
                          </div>

                          <div className="progress-bar" style={{ height: '10px' }}>
                            <div 
                              className="progress-fill" 
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>

                          {course.progress > 0 && course.progress < 100 && (
                            <div style={{ 
                              marginTop: '0.75rem', 
                              color: 'var(--text-light)',
                              fontSize: '0.85rem'
                            }}>
                              {course.totalChapters - course.completedChapters} chapters remaining
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '3rem',
                      color: 'var(--text-light)',
                      background: 'var(--bg-light)',
                      borderRadius: '12px'
                    }}>
                      <p style={{ fontSize: '1.1rem' }}>No courses assigned yet</p>
                      <button 
                        className="btn btn-primary"
                        style={{ marginTop: '1rem' }}
                        onClick={() => {
                          setShowProgressModal(false);
                          openAssignModal(selectedUser);
                        }}
                      >
                        Assign Courses
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
                  Failed to load progress data
                </div>
              )}
            </div>
          </div>
        )}

        {showAddEmployeeModal && (
          <div style={modalStyles.overlay}>
            <div style={modalStyles.modal} className="card">
              <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Add New Employee</h2>
              
              <form onSubmit={handleAddEmployee}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={employeeForm.name}
                    onChange={(e) => setEmployeeForm({...employeeForm, name: e.target.value})}
                    required
                    placeholder="Enter employee name"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    value={employeeForm.email}
                    onChange={(e) => setEmployeeForm({...employeeForm, email: e.target.value})}
                    required
                    placeholder="employee@company.com"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-input"
                    value={employeeForm.password}
                    onChange={(e) => setEmployeeForm({...employeeForm, password: e.target.value})}
                    required
                    placeholder="Minimum 6 characters"
                    minLength={6}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select
                    className="form-select"
                    value={employeeForm.department}
                    onChange={(e) => setEmployeeForm({...employeeForm, department: e.target.value})}
                    required
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
                  <label className="form-label">Banks (Select all that apply)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {['SSFB', 'CUB', 'ESAF', 'All'].map(bank => (
                      <label key={bank} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={employeeForm.banks.includes(bank)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEmployeeForm({...employeeForm, banks: [...employeeForm.banks, bank]});
                            } else {
                              setEmployeeForm({...employeeForm, banks: employeeForm.banks.filter(b => b !== bank)});
                            }
                          }}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <span>{bank}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    Add Employee
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    style={{ flex: 1 }}
                    onClick={() => {
                      setShowAddEmployeeModal(false);
                      setEmployeeForm({
                        name: '',
                        email: '',
                        password: '',
                        department: 'IT',
                        banks: ['All']
                      });
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
    maxWidth: '700px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto'
  }
};

export default AdminUsers;