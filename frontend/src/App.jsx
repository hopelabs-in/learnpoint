import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import ModuleDetail from './pages/ModuleDetail';
import ChapterView from './pages/ChapterView';
import AdminDashboard from './pages/AdminDashboard';
import AdminCourses from './pages/AdminCourses';
import AdminUsers from './pages/AdminUsers';
import CourseContentEditor from './pages/CourseContentEditor';
import ChapterContentEditor from './pages/ChapterContentEditor';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/courses"
        element={
          <PrivateRoute>
            <CourseList />
          </PrivateRoute>
        }
      />
      <Route
        path="/courses/:id"
        element={
          <PrivateRoute>
            <CourseDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/modules/:id"
        element={
          <PrivateRoute>
            <ModuleDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/chapters/:id"
        element={
          <PrivateRoute>
            <ChapterView />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute adminOnly={true}>
            <AdminDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/courses"
        element={
          <PrivateRoute adminOnly={true}>
            <AdminCourses />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <PrivateRoute adminOnly={true}>
            <AdminUsers />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/courses/:id/edit"
        element={
          <PrivateRoute adminOnly={true}>
            <CourseContentEditor />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/chapters/:id/edit"
        element={
          <PrivateRoute adminOnly={true}>
            <ChapterContentEditor />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
