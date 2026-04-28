import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Navbar from '../components/Navbar';

function AICourseGenerator() {
  const { API_URL } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1); // 1: Setup, 2: Generating, 3: Review
  const [files, setFiles] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [courseConfig, setCourseConfig] = useState({
    department: 'IT',
    bank: 'SSFB',
    numModules: 3,
    chaptersPerModule: 3,
  });
  const [editingCourse, setEditingCourse] = useState(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const generateCourse = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt describing the course you want to create.');
      return;
    }
    setError('');
    setStep(2);
    setProgress(10);
    setProgressLabel('Reading your documents...');

    try {
      // Build message content
      const content = [];

      // Add files as documents/images
      for (const file of files) {
        setProgressLabel(`Processing ${file.name}...`);
        const base64Data = await fileToBase64(file);
        const isPDF = file.type === 'application/pdf';
        const isImage = file.type.startsWith('image/');

        if (isPDF) {
          content.push({
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: base64Data,
            },
          });
        } else if (isImage) {
          content.push({
            type: 'image',
            source: {
              type: 'base64',
              media_type: file.type,
              data: base64Data,
            },
          });
        } else {
          // For text files, read as text
          const text = await file.text();
          content.push({
            type: 'text',
            text: `=== FILE: ${file.name} ===\n${text}\n`,
          });
        }
      }

      setProgress(30);
      setProgressLabel('Analyzing content with AI...');

      const systemPrompt = `You are an expert instructional designer specializing in corporate banking training. 
Your task is to create a structured course curriculum based on provided documents and a user prompt.

CRITICAL: You MUST respond with ONLY valid JSON. No markdown, no explanation, no backticks. Just raw JSON.

Return this exact structure:
{
  "title": "Course title",
  "description": "2-3 sentence course description",
  "modules": [
    {
      "title": "Module title",
      "description": "1-2 sentence module description",
      "order": 1,
      "chapters": [
        {
          "title": "Chapter title",
          "order": 1,
          "estimatedDuration": 15,
          "contentType": "mixed",
          "content": {
            "text": "Detailed chapter content in markdown format. Use ## for headings, **bold**, - bullet points, etc. Make this comprehensive, at least 200 words of real educational content based on the provided documents.",
            "videoUrl": "",
            "images": []
          }
        }
      ]
    }
  ]
}`;

      const userMessage = `${prompt}

Configuration:
- Number of modules: ${courseConfig.numModules}
- Chapters per module: ${courseConfig.chaptersPerModule}
- Department: ${courseConfig.department}
- Bank: ${courseConfig.bank}

Please create a comprehensive course curriculum. Use the provided documents as the primary source of content. Make the chapter content detailed and educational, covering the key concepts from the documents.`;

      content.push({ type: 'text', text: userMessage });

      setProgress(50);
      setProgressLabel('AI is building your course structure...');

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 8000,
          system: systemPrompt,
          messages: [{ role: 'user', content }],
        }),
      });

      setProgress(80);
      setProgressLabel('Parsing course structure...');

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'API request failed');
      }

      const rawText = data.content
        .filter(b => b.type === 'text')
        .map(b => b.text)
        .join('');

      // Clean and parse JSON
      let jsonText = rawText.trim();
      jsonText = jsonText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');

      const courseData = JSON.parse(jsonText);

      setProgress(95);
      setProgressLabel('Finalizing your course...');

      // Add dept/bank tags and normalize
      const normalized = {
        ...courseData,
        tags: {
          department: courseConfig.department,
          bank: courseConfig.bank,
        },
        modules: courseData.modules.map((mod, mIdx) => ({
          ...mod,
          order: mIdx + 1,
          chapters: mod.chapters.map((ch, cIdx) => ({
            ...ch,
            order: cIdx + 1,
            contentType: ch.contentType || 'mixed',
            estimatedDuration: ch.estimatedDuration || 15,
          })),
        })),
      };

      setProgress(100);
      setProgressLabel('Done!');
      setGeneratedCourse(normalized);
      setEditingCourse(JSON.parse(JSON.stringify(normalized)));
      setTimeout(() => setStep(3), 500);
    } catch (err) {
      console.error('Generation error:', err);
      setError('Failed to generate course: ' + err.message);
      setStep(1);
    }
  };

  const saveCourse = async () => {
    setSaving(true);
    try {
      // Create course
      const courseRes = await axios.post(`${API_URL}/courses`, {
        title: editingCourse.title,
        description: editingCourse.description,
        thumbnail: '',
        tags: editingCourse.tags,
      });
      const courseId = courseRes.data.data._id;

      // Create modules and chapters
      for (const module of editingCourse.modules) {
        const modRes = await axios.post(`${API_URL}/courses/${courseId}/modules`, {
          title: module.title,
          description: module.description,
          order: module.order,
        });
        const moduleId = modRes.data.data._id;

        for (const chapter of module.chapters) {
          await axios.post(`${API_URL}/modules/${moduleId}/chapters`, {
            title: chapter.title,
            order: chapter.order,
            contentType: chapter.contentType,
            estimatedDuration: chapter.estimatedDuration,
            content: chapter.content,
          });
        }
      }

      navigate(`/admin/courses/${courseId}/edit`);
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save course: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateChapterContent = (moduleIdx, chapterIdx, field, value) => {
    const updated = JSON.parse(JSON.stringify(editingCourse));
    if (field === 'text' || field === 'videoUrl') {
      updated.modules[moduleIdx].chapters[chapterIdx].content[field] = value;
    } else {
      updated.modules[moduleIdx].chapters[chapterIdx][field] = value;
    }
    setEditingCourse(updated);
  };

  return (
    <div style={styles.root}>
      <Navbar />
      <div style={styles.gridBg} />

      <div className="container fade-in" style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={styles.header}>
          <button
            className="btn btn-outline"
            onClick={() => navigate('/admin/courses')}
            style={styles.backBtn}
          >
            ← Back
          </button>
          <div>
            <div style={styles.pageTag}>AI COURSE GENERATOR</div>
            <h1 style={styles.pageTitle}>
              Create with <span style={styles.aiGradient}>AI</span>
            </h1>
            <p style={styles.pageSubtitle}>
              Upload documents, describe your course — AI builds the curriculum.
            </p>
          </div>
        </div>

        {/* Step indicators */}
        <div style={styles.steps}>
          {['Setup', 'Generate', 'Review & Save'].map((s, i) => (
            <div key={i} style={styles.stepItem}>
              <div style={{
                ...styles.stepNum,
                background: step > i + 1 ? '#00FFB2' : step === i + 1 ? 'rgba(0,255,178,0.15)' : 'rgba(255,255,255,0.05)',
                border: step === i + 1 ? '1px solid #00FFB2' : '1px solid rgba(255,255,255,0.1)',
                color: step > i + 1 ? '#030712' : step === i + 1 ? '#00FFB2' : '#475569',
              }}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span style={{ color: step === i + 1 ? '#F1F5F9' : '#475569', fontSize: '0.85rem', fontWeight: 600 }}>
                {s}
              </span>
              {i < 2 && <div style={styles.stepLine} />}
            </div>
          ))}
        </div>

        {/* STEP 1: SETUP */}
        {step === 1 && (
          <div style={styles.setupGrid}>
            {/* Left: Document upload */}
            <div style={styles.card}>
              <h3 style={styles.cardHeading}>📄 Source Documents</h3>
              <p style={styles.cardDesc}>Upload PDFs, Word docs, text files, or images to use as course content.</p>

              <div
                style={styles.dropZone}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const dropped = Array.from(e.dataTransfer.files);
                  setFiles(prev => [...prev, ...dropped]);
                }}
              >
                <div style={styles.dropIcon}>⬆</div>
                <p style={styles.dropText}>Drop files here or click to browse</p>
                <p style={styles.dropHint}>PDF, DOCX, TXT, PNG, JPG supported</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  style={{ display: 'none' }}
                  accept=".pdf,.txt,.md,.png,.jpg,.jpeg,.docx"
                  onChange={handleFileChange}
                />
              </div>

              {files.length > 0 && (
                <div style={styles.fileList}>
                  {files.map((f, i) => (
                    <div key={i} style={styles.fileRow}>
                      <span style={styles.fileIcon}>
                        {f.type.includes('pdf') ? '📕' : f.type.startsWith('image') ? '🖼️' : '📄'}
                      </span>
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={styles.fileName}>{f.name}</div>
                        <div style={styles.fileSize}>{(f.size / 1024).toFixed(1)} KB</div>
                      </div>
                      <button style={styles.removeBtn} onClick={() => removeFile(i)}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Config */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={styles.card}>
                <h3 style={styles.cardHeading}>✍️ Course Prompt</h3>
                <p style={styles.cardDesc}>Describe what kind of course you want AI to create.</p>
                <textarea
                  style={styles.promptArea}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., Create a comprehensive AML compliance training course for operations staff. Focus on identifying suspicious transactions, reporting procedures, and regulatory requirements under PMLA. Use a practical, scenario-based approach."
                  rows={6}
                />
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardHeading}>⚙️ Configuration</h3>
                <div style={styles.configGrid}>
                  <div>
                    <label style={styles.label}>Department</label>
                    <select
                      style={styles.select}
                      value={courseConfig.department}
                      onChange={(e) => setCourseConfig({ ...courseConfig, department: e.target.value })}
                    >
                      {['IT', 'Ops', 'Onboarding', 'Risk', 'Product', 'Customer Service'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={styles.label}>Bank</label>
                    <select
                      style={styles.select}
                      value={courseConfig.bank}
                      onChange={(e) => setCourseConfig({ ...courseConfig, bank: e.target.value })}
                    >
                      {['SSFB', 'CUB', 'ESAF', 'All'].map(b => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={styles.label}>Modules</label>
                    <select
                      style={styles.select}
                      value={courseConfig.numModules}
                      onChange={(e) => setCourseConfig({ ...courseConfig, numModules: parseInt(e.target.value) })}
                    >
                      {[2, 3, 4, 5, 6].map(n => (
                        <option key={n} value={n}>{n} modules</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={styles.label}>Chapters/Module</label>
                    <select
                      style={styles.select}
                      value={courseConfig.chaptersPerModule}
                      onChange={(e) => setCourseConfig({ ...courseConfig, chaptersPerModule: parseInt(e.target.value) })}
                    >
                      {[2, 3, 4, 5].map(n => (
                        <option key={n} value={n}>{n} chapters</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {error && <div style={styles.errorBox}>{error}</div>}

              <button style={styles.generateBtn} onClick={generateCourse}>
                <span>✨ Generate Course with AI</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: GENERATING */}
        {step === 2 && (
          <div style={styles.generatingScreen}>
            <div style={styles.genCard}>
              <div style={styles.aiSpinner}>
                <div style={styles.spinnerRing} />
                <div style={{ ...styles.spinnerRing, ...styles.spinnerRing2 }} />
                <div style={{ fontSize: '2rem' }}>✨</div>
              </div>
              <h2 style={styles.genTitle}>AI is building your course</h2>
              <p style={styles.genSubtitle}>{progressLabel}</p>
              <div style={styles.progressTrack}>
                <div style={{ ...styles.progressFill, width: `${progress}%` }} />
              </div>
              <p style={styles.progressPct}>{progress}%</p>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW */}
        {step === 3 && editingCourse && (
          <div>
            <div style={styles.reviewHeader}>
              <div style={styles.card}>
                <div style={styles.courseMetaRow}>
                  <div style={{ flex: 1 }}>
                    <input
                      style={styles.titleInput}
                      value={editingCourse.title}
                      onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                    />
                    <textarea
                      style={styles.descInput}
                      value={editingCourse.description}
                      onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div style={styles.courseTags}>
                    <span style={styles.tagDept}>{editingCourse.tags.department}</span>
                    <span style={styles.tagBank}>{editingCourse.tags.bank}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.reviewSummary}>
              <div style={styles.summaryBadge}>
                {editingCourse.modules.length} modules
              </div>
              <div style={styles.summaryBadge}>
                {editingCourse.modules.reduce((s, m) => s + m.chapters.length, 0)} chapters
              </div>
              <div style={styles.summaryBadge}>
                ~{editingCourse.modules.reduce((s, m) => s + m.chapters.reduce((cs, c) => cs + (c.estimatedDuration || 15), 0), 0)} min
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
              {editingCourse.modules.map((module, mIdx) => (
                <div key={mIdx} style={styles.moduleCard}>
                  <div style={styles.moduleCardHeader}>
                    <div style={styles.moduleNum}>{module.order}</div>
                    <div style={{ flex: 1 }}>
                      <input
                        style={styles.moduleTitleInput}
                        value={module.title}
                        onChange={(e) => {
                          const updated = JSON.parse(JSON.stringify(editingCourse));
                          updated.modules[mIdx].title = e.target.value;
                          setEditingCourse(updated);
                        }}
                      />
                      <input
                        style={styles.moduleDescInput}
                        value={module.description}
                        onChange={(e) => {
                          const updated = JSON.parse(JSON.stringify(editingCourse));
                          updated.modules[mIdx].description = e.target.value;
                          setEditingCourse(updated);
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginLeft: '3.5rem', marginTop: '1rem' }}>
                    {module.chapters.map((chapter, cIdx) => (
                      <div key={cIdx} style={styles.chapterCard}>
                        <div style={styles.chapterHeader}>
                          <span style={styles.chapterNum}>{chapter.order}</span>
                          <input
                            style={styles.chapterTitleInput}
                            value={chapter.title}
                            onChange={(e) => updateChapterContent(mIdx, cIdx, 'title', e.target.value)}
                          />
                          <span style={styles.durationBadge}>
                            {chapter.estimatedDuration} min
                          </span>
                        </div>
                        <div style={styles.chapterPreview}>
                          {chapter.content.text.substring(0, 200)}...
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}

            <div style={styles.saveBar}>
              <button
                style={styles.regenerateBtn}
                onClick={() => { setStep(1); setGeneratedCourse(null); setEditingCourse(null); }}
              >
                ↺ Regenerate
              </button>
              <button
                style={{ ...styles.generateBtn, flex: 1, maxWidth: '300px' }}
                onClick={saveCourse}
                disabled={saving}
              >
                {saving ? 'Saving...' : '💾 Save Course'}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes spin2 { to { transform: rotate(-360deg); } }
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
    position: 'relative',
  },
  gridBg: {
    position: 'fixed',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(0,255,178,0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,178,0.02) 1px, transparent 1px)
    `,
    backgroundSize: '60px 60px',
    pointerEvents: 'none',
  },
  header: {
    marginBottom: '2.5rem',
    paddingTop: '2rem',
  },
  backBtn: {
    marginBottom: '1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#94A3B8',
  },
  pageTag: {
    fontSize: '0.65rem',
    fontFamily: "'JetBrains Mono', monospace",
    color: '#00FFB2',
    letterSpacing: '0.2em',
    marginBottom: '0.5rem',
  },
  pageTitle: {
    fontSize: '2.5rem',
    fontWeight: 800,
    letterSpacing: '-1px',
    color: '#F1F5F9',
    marginBottom: '0.25rem',
  },
  aiGradient: {
    background: 'linear-gradient(135deg, #00FFB2, #0EA5E9)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  pageSubtitle: {
    color: '#475569',
    fontSize: '1rem',
  },
  steps: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '2.5rem',
    flexWrap: 'wrap',
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  stepNum: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    fontWeight: 700,
    flexShrink: 0,
  },
  stepLine: {
    width: '40px',
    height: '1px',
    background: 'rgba(255,255,255,0.1)',
    marginLeft: '0.5rem',
  },
  setupGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
  },
  card: {
    background: 'rgba(15,23,42,0.8)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    padding: '1.75rem',
    backdropFilter: 'blur(20px)',
  },
  cardHeading: {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: '#F1F5F9',
    marginBottom: '0.4rem',
    letterSpacing: '-0.3px',
  },
  cardDesc: {
    fontSize: '0.85rem',
    color: '#475569',
    marginBottom: '1.25rem',
    lineHeight: 1.6,
  },
  dropZone: {
    border: '2px dashed rgba(0,255,178,0.2)',
    borderRadius: '12px',
    padding: '2rem',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'border-color 0.2s',
    marginBottom: '1rem',
  },
  dropIcon: {
    fontSize: '2rem',
    marginBottom: '0.75rem',
    color: '#00FFB2',
  },
  dropText: {
    color: '#94A3B8',
    fontSize: '0.95rem',
    marginBottom: '0.25rem',
  },
  dropHint: {
    color: '#334155',
    fontSize: '0.75rem',
    fontFamily: "'JetBrains Mono', monospace",
  },
  fileList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  fileRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  fileIcon: { fontSize: '1.25rem' },
  fileName: {
    fontSize: '0.85rem',
    color: '#CBD5E1',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  fileSize: {
    fontSize: '0.7rem',
    color: '#475569',
    fontFamily: "'JetBrains Mono', monospace",
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: '#475569',
    cursor: 'pointer',
    fontSize: '0.9rem',
    padding: '0.25rem',
    borderRadius: '4px',
    lineHeight: 1,
  },
  promptArea: {
    width: '100%',
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    color: '#CBD5E1',
    padding: '1rem',
    fontSize: '0.9rem',
    lineHeight: 1.7,
    resize: 'vertical',
    fontFamily: "'Syne', sans-serif",
    boxSizing: 'border-box',
    outline: 'none',
  },
  configGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.75rem',
    color: '#475569',
    fontFamily: "'JetBrains Mono', monospace",
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '0.4rem',
  },
  select: {
    width: '100%',
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    color: '#CBD5E1',
    padding: '0.6rem 0.75rem',
    fontSize: '0.9rem',
    fontFamily: "'Syne', sans-serif",
    outline: 'none',
    cursor: 'pointer',
  },
  errorBox: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '8px',
    padding: '1rem',
    color: '#FCA5A5',
    fontSize: '0.9rem',
  },
  generateBtn: {
    width: '100%',
    background: 'linear-gradient(135deg, #00FFB2, #0EA5E9)',
    color: '#030712',
    border: 'none',
    padding: '1rem',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'Syne', sans-serif",
    letterSpacing: '-0.3px',
    boxShadow: '0 0 30px rgba(0,255,178,0.2)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  generatingScreen: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
  },
  genCard: {
    background: 'rgba(15,23,42,0.9)',
    border: '1px solid rgba(0,255,178,0.15)',
    borderRadius: '24px',
    padding: '3rem',
    textAlign: 'center',
    maxWidth: '440px',
    width: '100%',
  },
  aiSpinner: {
    width: '80px',
    height: '80px',
    margin: '0 auto 2rem',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerRing: {
    position: 'absolute',
    inset: 0,
    borderRadius: '50%',
    border: '2px solid transparent',
    borderTopColor: '#00FFB2',
    animation: 'spin 1s linear infinite',
  },
  spinnerRing2: {
    inset: '8px',
    borderTopColor: '#0EA5E9',
    animation: 'spin2 1.5s linear infinite',
  },
  genTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#F1F5F9',
    marginBottom: '0.5rem',
    letterSpacing: '-0.5px',
  },
  genSubtitle: {
    color: '#475569',
    fontSize: '0.9rem',
    marginBottom: '2rem',
    fontFamily: "'JetBrains Mono', monospace",
  },
  progressTrack: {
    height: '4px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '0.75rem',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #00FFB2, #0EA5E9)',
    borderRadius: '2px',
    transition: 'width 0.5s ease',
  },
  progressPct: {
    fontSize: '0.75rem',
    color: '#00FFB2',
    fontFamily: "'JetBrains Mono', monospace",
  },
  reviewHeader: {
    marginBottom: '1.5rem',
  },
  courseMetaRow: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'start',
  },
  titleInput: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    color: '#F1F5F9',
    fontSize: '1.5rem',
    fontWeight: 700,
    fontFamily: "'Syne', sans-serif',",
    outline: 'none',
    padding: '0.25rem 0',
    marginBottom: '0.75rem',
    letterSpacing: '-0.5px',
    boxSizing: 'border-box',
  },
  descInput: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    color: '#64748B',
    fontSize: '0.9rem',
    fontFamily: "'Syne', sans-serif",
    outline: 'none',
    padding: '0.25rem 0',
    resize: 'none',
    lineHeight: 1.6,
    boxSizing: 'border-box',
  },
  courseTags: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flexShrink: 0,
  },
  tagDept: {
    background: 'rgba(0,255,178,0.1)',
    border: '1px solid rgba(0,255,178,0.2)',
    color: '#00FFB2',
    padding: '0.25rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontFamily: "'JetBrains Mono', monospace",
    textAlign: 'center',
  },
  tagBank: {
    background: 'rgba(255,107,53,0.1)',
    border: '1px solid rgba(255,107,53,0.2)',
    color: '#FF6B35',
    padding: '0.25rem 0.75rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontFamily: "'JetBrains Mono', monospace",
    textAlign: 'center',
  },
  reviewSummary: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  summaryBadge: {
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#94A3B8',
    padding: '0.4rem 0.875rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontFamily: "'JetBrains Mono', monospace",
  },
  moduleCard: {
    background: 'rgba(15,23,42,0.8)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '16px',
    padding: '1.5rem',
    backdropFilter: 'blur(20px)',
  },
  moduleCardHeader: {
    display: 'flex',
    alignItems: 'start',
    gap: '1rem',
  },
  moduleNum: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'rgba(0,255,178,0.1)',
    border: '1px solid rgba(0,255,178,0.2)',
    color: '#00FFB2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: '0.9rem',
    flexShrink: 0,
  },
  moduleTitleInput: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    color: '#F1F5F9',
    fontSize: '1.1rem',
    fontWeight: 700,
    fontFamily: "'Syne', sans-serif",
    outline: 'none',
    padding: '0.2rem 0',
    marginBottom: '0.5rem',
    letterSpacing: '-0.3px',
    boxSizing: 'border-box',
  },
  moduleDescInput: {
    width: '100%',
    background: 'transparent',
    border: 'none',
    color: '#475569',
    fontSize: '0.85rem',
    fontFamily: "'Syne', sans-serif",
    outline: 'none',
    padding: '0',
    boxSizing: 'border-box',
  },
  chapterCard: {
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '10px',
    padding: '1rem',
  },
  chapterHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem',
  },
  chapterNum: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.05)',
    color: '#475569',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: 700,
    flexShrink: 0,
    fontFamily: "'JetBrains Mono', monospace",
  },
  chapterTitleInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    color: '#CBD5E1',
    fontSize: '0.95rem',
    fontWeight: 600,
    fontFamily: "'Syne', sans-serif",
    outline: 'none',
    letterSpacing: '-0.2px',
  },
  durationBadge: {
    background: 'rgba(255,255,255,0.04)',
    color: '#334155',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontFamily: "'JetBrains Mono', monospace",
    flexShrink: 0,
  },
  chapterPreview: {
    fontSize: '0.8rem',
    color: '#334155',
    lineHeight: 1.6,
    fontFamily: "'JetBrains Mono', monospace",
    paddingLeft: '2rem',
  },
  saveBar: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    paddingBottom: '3rem',
  },
  regenerateBtn: {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#94A3B8',
    padding: '1rem 1.5rem',
    borderRadius: '12px',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Syne', sans-serif",
    transition: 'all 0.2s',
  },
};

export default AICourseGenerator;