import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-brand">
          Learn<span className="accent">Point</span><span className="dot">.</span>
        </Link>

        <div className="navbar-links">
          <Link to="/dashboard" className="navbar-link">
            Dashboard
          </Link>
          <Link to="/courses" className="navbar-link">
            My Courses
          </Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className="navbar-link">
              Admin Panel
            </Link>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              padding: '0.4rem 0.75rem',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.03)',
              transition: 'all 0.2s'
            }}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00FFB2, #0EA5E9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: '700',
              color: '#030712',
              flexShrink: 0
            }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#F1F5F9' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {user?.role}
              </div>
            </div>
            <span style={{ color: '#475569', fontSize: '0.7rem', marginLeft: '0.25rem' }}>▾</span>
          </div>

          {showUserMenu && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 0.5rem)',
              right: 0,
              background: 'rgba(15, 23, 42, 0.98)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '0.5rem',
              minWidth: '160px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(20px)',
              zIndex: 200
            }}>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  padding: '0.6rem 1rem',
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.15)',
                  borderRadius: '8px',
                  color: '#FCA5A5',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'Syne, sans-serif',
                  textAlign: 'left'
                }}
              >
                → Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;