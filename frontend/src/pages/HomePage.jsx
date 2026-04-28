import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleMouse = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const parallaxX = (mousePos.x / window.innerWidth - 0.5) * 20;
  const parallaxY = (mousePos.y / window.innerHeight - 0.5) * 20;

  return (
    <div style={styles.root}>
      {/* Animated grid background */}
      <div style={styles.gridBg} />
      
      {/* Radial glow that follows mouse */}
      <div style={{
        ...styles.mouseGlow,
        left: mousePos.x - 300,
        top: mousePos.y - 300,
      }} />

      {/* Nav */}
      <nav style={styles.nav}>
        <div style={styles.navInner}>
          <span style={styles.logo}>
            Learn<span style={styles.logoAccent}>Point</span>
            <span style={styles.logoDot}>.</span>
          </span>
          <div style={styles.navActions}>
            <button style={styles.navLink} onClick={() => navigate('/login')}>
              Sign In
            </button>
            <button style={styles.ctaBtn} onClick={() => navigate('/login')}>
              Get Started →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={styles.hero} ref={heroRef}>
        <div style={styles.heroContent}>
          {/* Floating badge */}
          <div style={styles.badge}>
            <span style={styles.badgeDot} />
            AI-Powered Learning Platform
          </div>

          <h1 style={styles.heroTitle}>
            <span style={styles.heroTitleLine1}>The Future of</span>
            <br />
            <span style={styles.heroTitleLine2}>Corporate</span>
            <br />
            <span style={styles.heroTitleGradient}>Training</span>
          </h1>

          <p style={styles.heroSubtitle}>
            Build smarter courses. Track real progress.<br />
            Powered by AI. Designed for banks.
          </p>

          <div style={styles.heroActions}>
            <button style={styles.primaryBtn} onClick={() => navigate('/login')}>
              <span>Launch Platform</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <button style={styles.ghostBtn} onClick={() => navigate('/login')}>
              View Demo
            </button>
          </div>

          {/* Stats bar */}
          <div style={styles.statsBar}>
            {[
              { value: '3', label: 'Banks Onboarded' },
              { value: '500+', label: 'Employees Trained' },
              { value: '98%', label: 'Completion Rate' },
              { value: 'AI', label: 'Course Generation' },
            ].map((stat, i) => (
              <div key={i} style={styles.statItem}>
                <div style={styles.statValue}>{stat.value}</div>
                <div style={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 3D Floating card */}
        <div style={{
          ...styles.heroVisual,
          transform: `perspective(1000px) rotateY(${-parallaxX * 0.5}deg) rotateX(${parallaxY * 0.3}deg)`,
        }}>
          <div style={styles.floatingCard}>
            <div style={styles.cardHeader}>
              <div style={styles.cardDots}>
                <span style={{ ...styles.dot, background: '#FF5F57' }} />
                <span style={{ ...styles.dot, background: '#FEBC2E' }} />
                <span style={{ ...styles.dot, background: '#28C840' }} />
              </div>
              <span style={styles.cardTitle}>AI Course Generator</span>
            </div>
            <div style={styles.cardBody}>
              <div style={styles.promptBox}>
                <span style={styles.promptLabel}>Prompt</span>
                <p style={styles.promptText}>"Create a 5-module AML compliance course for operations staff at SSFB..."</p>
              </div>
              <div style={styles.generatingIndicator}>
                <div style={styles.genDot} />
                <div style={{ ...styles.genDot, animationDelay: '0.2s' }} />
                <div style={{ ...styles.genDot, animationDelay: '0.4s' }} />
                <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#00FFB2' }}>Generating modules...</span>
              </div>
              <div style={styles.modulePreview}>
                {['Module 1: AML Fundamentals', 'Module 2: Red Flag Indicators', 'Module 3: Reporting Procedures'].map((m, i) => (
                  <div key={i} style={{ ...styles.moduleRow, animationDelay: `${i * 0.3}s` }}>
                    <span style={styles.moduleCheck}>✓</span>
                    <span style={styles.moduleText}>{m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Orbiting elements */}
          <div style={{ ...styles.orbit, ...styles.orbit1 }}>📚</div>
          <div style={{ ...styles.orbit, ...styles.orbit2 }}>🎯</div>
          <div style={{ ...styles.orbit, ...styles.orbit3 }}>⚡</div>
        </div>
      </section>

      {/* Features */}
      <section style={styles.features}>
        <div style={styles.sectionLabel}>CAPABILITIES</div>
        <h2 style={styles.sectionTitle}>Everything you need.<br />Nothing you don't.</h2>
        
        <div style={styles.featureGrid}>
          {[
            {
              icon: '🤖',
              title: 'AI Course Creation',
              desc: 'Upload documents, write a prompt. Get full courses with modules, chapters, and content in seconds.',
              accent: '#00FFB2',
            },
            {
              icon: '📊',
              title: 'Real-time Analytics',
              desc: 'Track every employee\'s progress. Identify top performers and struggling learners instantly.',
              accent: '#FF6B35',
            },
            {
              icon: '🏦',
              title: 'Multi-Bank Support',
              desc: 'Manage training across SSFB, CUB, and ESAF from a single unified platform.',
              accent: '#7C3AED',
            },
            {
              icon: '🎓',
              title: 'Rich Content Editor',
              desc: 'Build chapters with video, images, formatted text. Full markdown support built in.',
              accent: '#F59E0B',
            },
            {
              icon: '🔐',
              title: 'Role-Based Access',
              desc: 'Admins manage, employees learn. Clean separation of concerns, secure by default.',
              accent: '#EC4899',
            },
            {
              icon: '⚡',
              title: 'Instant Assignment',
              desc: 'Assign courses to individuals or departments with a single click. Scale effortlessly.',
              accent: '#06B6D4',
            },
          ].map((f, i) => (
            <div key={i} style={{ ...styles.featureCard, '--accent': f.accent }}>
              <div style={{ ...styles.featureIcon, color: f.accent }}>{f.icon}</div>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
              <div style={{ ...styles.featureLine, background: f.accent }} />
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaGlow} />
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>Ready to transform<br />your training?</h2>
          <p style={styles.ctaSubtitle}>Join the future of banking education today.</p>
          <button style={styles.primaryBtn} onClick={() => navigate('/login')}>
            Get Started Free →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <span style={styles.logo}>Learn<span style={styles.logoAccent}>Point</span><span style={styles.logoDot}>.</span></span>
        <span style={styles.footerText}>© 2025 LearnPoint. Built for banking excellence.</span>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        
        @keyframes gridPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes genPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes orbit1 {
          0% { transform: rotate(0deg) translateX(160px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(160px) rotate(-360deg); }
        }
        @keyframes orbit2 {
          0% { transform: rotate(120deg) translateX(160px) rotate(-120deg); }
          100% { transform: rotate(480deg) translateX(160px) rotate(-480deg); }
        }
        @keyframes orbit3 {
          0% { transform: rotate(240deg) translateX(160px) rotate(-240deg); }
          100% { transform: rotate(600deg) translateX(160px) rotate(-600deg); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  root: {
    fontFamily: "'Syne', sans-serif",
    background: '#030712',
    color: '#E2E8F0',
    minHeight: '100vh',
    overflowX: 'hidden',
    position: 'relative',
  },
  gridBg: {
    position: 'fixed',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(0,255,178,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,178,0.03) 1px, transparent 1px)
    `,
    backgroundSize: '60px 60px',
    pointerEvents: 'none',
    animation: 'gridPulse 4s ease-in-out infinite',
  },
  mouseGlow: {
    position: 'fixed',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,255,178,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
    transition: 'left 0.1s, top 0.1s',
  },
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    padding: '1.25rem 2rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    background: 'rgba(3,7,18,0.7)',
  },
  navInner: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 800,
    letterSpacing: '-0.5px',
    color: '#F1F5F9',
  },
  logoAccent: {
    color: '#00FFB2',
  },
  logoDot: {
    color: '#FF6B35',
  },
  navActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
  },
  navLink: {
    background: 'none',
    border: 'none',
    color: '#94A3B8',
    fontSize: '0.95rem',
    cursor: 'pointer',
    fontFamily: "'Syne', sans-serif",
    fontWeight: 600,
    transition: 'color 0.2s',
  },
  ctaBtn: {
    background: 'rgba(0,255,178,0.1)',
    border: '1px solid rgba(0,255,178,0.3)',
    color: '#00FFB2',
    padding: '0.6rem 1.25rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    fontFamily: "'Syne', sans-serif",
    fontWeight: 600,
    transition: 'all 0.2s',
  },
  hero: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    padding: '8rem 2rem 4rem',
    maxWidth: '1200px',
    margin: '0 auto',
    gap: '4rem',
    position: 'relative',
    zIndex: 1,
  },
  heroContent: {
    flex: 1,
    animation: 'fadeSlideUp 0.8s ease both',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'rgba(0,255,178,0.08)',
    border: '1px solid rgba(0,255,178,0.2)',
    color: '#00FFB2',
    padding: '0.4rem 0.85rem',
    borderRadius: '20px',
    fontSize: '0.78rem',
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: '0.05em',
    marginBottom: '2rem',
    textTransform: 'uppercase',
  },
  badgeDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#00FFB2',
    boxShadow: '0 0 6px #00FFB2',
  },
  heroTitle: {
    fontSize: 'clamp(3rem, 6vw, 5.5rem)',
    fontWeight: 800,
    lineHeight: 1.05,
    marginBottom: '1.5rem',
    letterSpacing: '-2px',
  },
  heroTitleLine1: {
    color: '#94A3B8',
    fontSize: '0.7em',
    letterSpacing: '-1px',
    fontWeight: 600,
  },
  heroTitleLine2: {
    color: '#F1F5F9',
  },
  heroTitleGradient: {
    background: 'linear-gradient(135deg, #00FFB2 0%, #0EA5E9 50%, #7C3AED 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSubtitle: {
    fontSize: '1.2rem',
    color: '#64748B',
    lineHeight: 1.7,
    marginBottom: '2.5rem',
    maxWidth: '440px',
  },
  heroActions: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '3rem',
    flexWrap: 'wrap',
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'linear-gradient(135deg, #00FFB2, #0EA5E9)',
    color: '#030712',
    border: 'none',
    padding: '0.875rem 1.75rem',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'Syne', sans-serif",
    letterSpacing: '-0.3px',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 0 30px rgba(0,255,178,0.3)',
  },
  ghostBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    background: 'transparent',
    color: '#94A3B8',
    border: '1px solid rgba(148,163,184,0.2)',
    padding: '0.875rem 1.75rem',
    borderRadius: '10px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Syne', sans-serif",
    transition: 'all 0.2s',
  },
  statsBar: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
  },
  statValue: {
    fontSize: '1.75rem',
    fontWeight: 800,
    color: '#F1F5F9',
    letterSpacing: '-1px',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontFamily: "'JetBrains Mono', monospace",
  },
  heroVisual: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    minHeight: '500px',
    transition: 'transform 0.1s ease',
  },
  floatingCard: {
    background: 'rgba(15,23,42,0.9)',
    border: '1px solid rgba(0,255,178,0.15)',
    borderRadius: '16px',
    width: '340px',
    boxShadow: '0 0 60px rgba(0,255,178,0.08), 0 40px 80px rgba(0,0,0,0.5)',
    backdropFilter: 'blur(20px)',
    animation: 'float 6s ease-in-out infinite',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem 1.25rem',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  cardDots: {
    display: 'flex',
    gap: '0.4rem',
  },
  dot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    display: 'inline-block',
  },
  cardTitle: {
    fontSize: '0.8rem',
    color: '#475569',
    fontFamily: "'JetBrains Mono', monospace",
  },
  cardBody: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  promptBox: {
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '8px',
    padding: '0.875rem',
  },
  promptLabel: {
    fontSize: '0.65rem',
    color: '#00FFB2',
    fontFamily: "'JetBrains Mono', monospace",
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    display: 'block',
    marginBottom: '0.4rem',
  },
  promptText: {
    fontSize: '0.8rem',
    color: '#94A3B8',
    lineHeight: 1.6,
    margin: 0,
  },
  generatingIndicator: {
    display: 'flex',
    alignItems: 'center',
  },
  genDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#00FFB2',
    marginRight: '3px',
    animation: 'genPulse 1s ease-in-out infinite',
  },
  modulePreview: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  moduleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    animation: 'fadeSlideUp 0.5s ease both',
  },
  moduleCheck: {
    color: '#00FFB2',
    fontSize: '0.75rem',
    fontWeight: 700,
  },
  moduleText: {
    fontSize: '0.8rem',
    color: '#CBD5E1',
  },
  orbit: {
    position: 'absolute',
    fontSize: '1.5rem',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    top: '50%',
    left: '50%',
    marginTop: '-20px',
    marginLeft: '-20px',
  },
  orbit1: { animation: 'orbit1 8s linear infinite' },
  orbit2: { animation: 'orbit2 8s linear infinite' },
  orbit3: { animation: 'orbit3 8s linear infinite' },
  features: {
    padding: '6rem 2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
  },
  sectionLabel: {
    fontSize: '0.7rem',
    fontFamily: "'JetBrains Mono', monospace",
    color: '#00FFB2',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: 'clamp(2rem, 4vw, 3.5rem)',
    fontWeight: 800,
    letterSpacing: '-1.5px',
    lineHeight: 1.1,
    marginBottom: '3rem',
    color: '#F1F5F9',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  featureCard: {
    background: 'rgba(15,23,42,0.6)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '16px',
    padding: '2rem',
    position: 'relative',
    overflow: 'hidden',
    transition: 'transform 0.3s, border-color 0.3s',
    cursor: 'default',
  },
  featureIcon: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
    display: 'block',
  },
  featureTitle: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: '#F1F5F9',
    marginBottom: '0.5rem',
    letterSpacing: '-0.3px',
  },
  featureDesc: {
    fontSize: '0.9rem',
    color: '#64748B',
    lineHeight: 1.7,
    marginBottom: '1.5rem',
  },
  featureLine: {
    height: '2px',
    width: '40px',
    borderRadius: '2px',
  },
  ctaSection: {
    padding: '8rem 2rem',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
  },
  ctaGlow: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,255,178,0.08) 0%, transparent 70%)',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  },
  ctaContent: {
    position: 'relative',
    zIndex: 1,
  },
  ctaTitle: {
    fontSize: 'clamp(2.5rem, 5vw, 4rem)',
    fontWeight: 800,
    letterSpacing: '-2px',
    lineHeight: 1.1,
    marginBottom: '1rem',
    background: 'linear-gradient(135deg, #F1F5F9 0%, #94A3B8 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  ctaSubtitle: {
    color: '#475569',
    fontSize: '1.1rem',
    marginBottom: '2rem',
  },
  footer: {
    borderTop: '1px solid rgba(255,255,255,0.05)',
    padding: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
    position: 'relative',
    zIndex: 1,
    flexWrap: 'wrap',
    gap: '1rem',
  },
  footerText: {
    color: '#334155',
    fontSize: '0.85rem',
    fontFamily: "'JetBrains Mono', monospace",
  },
};

export default HomePage;