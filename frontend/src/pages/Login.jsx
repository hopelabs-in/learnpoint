import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    department: 'IT',
    banks: ['All'],
    role: 'employee'
  });
  const [error, setError] = useState('');
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = isLogin
      ? await login(formData.email, formData.password)
      : await register(formData);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.leftPanel}>
        <div style={styles.brandSection}>
          <h1 style={styles.brandTitle}>
            Learn<span style={styles.brandAccent}>Point</span>
          </h1>
          <p style={styles.brandSubtitle}>
            Empower your team with continuous learning
          </p>
        </div>
        <div style={styles.features}>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>📚</div>
            <div>
              <h3 style={styles.featureTitle}>Structured Learning</h3>
              <p style={styles.featureDesc}>Courses designed for your role</p>
            </div>
          </div>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>🎯</div>
            <div>
              <h3 style={styles.featureTitle}>Track Progress</h3>
              <p style={styles.featureDesc}>Monitor your learning journey</p>
            </div>
          </div>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>🏆</div>
            <div>
              <h3 style={styles.featureTitle}>Achieve Goals</h3>
              <p style={styles.featureDesc}>Complete courses at your pace</p>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.rightPanel}>
        <div style={styles.formContainer}>
          <h2 style={styles.formTitle}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={styles.formSubtitle}>
            {isLogin
              ? 'Enter your credentials to access your account'
              : 'Fill in your details to get started'}
          </p>

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@company.com"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                minLength={6}
              />
            </div>

            {!isLogin && (
              <>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select
                    name="department"
                    className="form-select"
                    value={formData.department}
                    onChange={handleChange}
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
                          checked={formData.banks.includes(bank)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({...formData, banks: [...formData.banks, bank]});
                            } else {
                              setFormData({...formData, banks: formData.banks.filter(b => b !== bank)});
                            }
                          }}
                          style={{ width: '18px', height: '18px' }}
                        />
                        <span>{bank}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary" style={styles.submitBtn}>
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style={styles.toggleSection}>
            <p style={styles.toggleText}>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                style={styles.toggleBtn}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
  },
  leftPanel: {
    flex: 1,
    background: 'linear-gradient(135deg, #0A1628 0%, #1E3A5F 100%)',
    color: 'white',
    padding: '4rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  brandSection: {
    marginBottom: '4rem',
  },
  brandTitle: {
    fontSize: '3.5rem',
    marginBottom: '1rem',
    fontFamily: "'DM Serif Display', serif",
  },
  brandAccent: {
    color: '#FF6B35',
  },
  brandSubtitle: {
    fontSize: '1.25rem',
    opacity: 0.9,
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  feature: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'start',
  },
  featureIcon: {
    fontSize: '2.5rem',
  },
  featureTitle: {
    fontSize: '1.25rem',
    marginBottom: '0.5rem',
    fontFamily: "'DM Serif Display', serif",
  },
  featureDesc: {
    opacity: 0.8,
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: '#F8FAFC',
  },
  formContainer: {
    width: '100%',
    maxWidth: '480px',
    background: 'white',
    padding: '3rem',
    borderRadius: '16px',
    boxShadow: '0 8px 40px rgba(10, 22, 40, 0.12)',
  },
  formTitle: {
    fontSize: '2rem',
    marginBottom: '0.5rem',
  },
  formSubtitle: {
    color: '#718096',
    marginBottom: '2rem',
  },
  error: {
    background: '#FEE2E2',
    color: '#DC2626',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    fontSize: '0.95rem',
  },
  form: {
    marginBottom: '1.5rem',
  },
  submitBtn: {
    width: '100%',
    marginTop: '1rem',
  },
  toggleSection: {
    textAlign: 'center',
    paddingTop: '1.5rem',
    borderTop: '1px solid #E2E8F0',
  },
  toggleText: {
    color: '#718096',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: '#FF6B35',
    fontWeight: 600,
    cursor: 'pointer',
    marginLeft: '0.5rem',
    fontSize: '1rem',
  },
};

export default Login;
