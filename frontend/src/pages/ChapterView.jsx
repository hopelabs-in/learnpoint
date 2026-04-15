import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Navbar from '../components/Navbar';

function ChapterView() {
  const { id } = useParams();
  const { API_URL, user, reloadUser } = useAuth();
  const [chapter, setChapter] = useState(null);
  const [course, setCourse] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [allChapters, setAllChapters] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChapter();
  }, [id]);

  const fetchChapter = async () => {
    try {
      const response = await axios.get(`${API_URL}/chapters/${id}`);
      const chapterData = response.data.data;
      setChapter(chapterData);
      setIsCompleted(chapterData.isCompleted);

      // Fetch the full course with all modules and chapters
      const moduleResponse = await axios.get(`${API_URL}/modules/${chapterData.module._id}`);
      const module = moduleResponse.data.data;
      
      const courseResponse = await axios.get(`${API_URL}/courses/${module.course._id}`);
      const courseData = courseResponse.data.data;
      setCourse(courseData);

      // Build flat list of all chapters for navigation
      const chapters = [];
      courseData.modules.forEach(mod => {
        mod.chapters?.forEach(ch => {
          chapters.push(ch);
        });
      });
      setAllChapters(chapters);
      
      // Find current chapter index
      const index = chapters.findIndex(ch => ch._id === id);
      setCurrentIndex(index);
    } catch (error) {
      console.error('Error fetching chapter:', error);
    }
  };

  const handleComplete = async () => {
    try {
      if (isCompleted) {
        await axios.post(`${API_URL}/chapters/${id}/uncomplete`);
        setIsCompleted(false);
      } else {
        await axios.post(`${API_URL}/chapters/${id}/complete`);
        setIsCompleted(true);
      }
      // Reload user data to update completed chapters
      await reloadUser();
      // Refresh chapter data
      fetchChapter();
    } catch (error) {
      console.error('Error updating completion:', error);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      navigate(`/chapters/${allChapters[currentIndex - 1]._id}`);
    }
  };

  const goToNext = () => {
    if (currentIndex < allChapters.length - 1) {
      navigate(`/chapters/${allChapters[currentIndex + 1]._id}`);
    }
  };

  const isChapterCompleted = (chapterId) => {
    return user.completedChapters?.includes(chapterId);
  };

  if (!chapter || !course) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <Navbar />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)' }}>
        {/* Sidebar */}
        <div style={{
          width: sidebarOpen ? '320px' : '0',
          background: 'var(--card-bg)',
          borderRight: '1px solid var(--border)',
          overflowY: 'auto',
          transition: 'width 0.3s',
          position: 'relative'
        }}>
          {sidebarOpen && (
            <div style={{ padding: '1.5rem' }}>
              <button 
                onClick={() => navigate(`/courses/${course._id}`)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent)',
                  cursor: 'pointer',
                  marginBottom: '1rem',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                ← Back to Course
              </button>

              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-dark)' }}>
                {course.title}
              </h3>
              <div className="progress-bar" style={{ marginBottom: '1.5rem', height: '6px' }}>
                <div className="progress-fill" style={{ 
                  width: `${course.modules.reduce((total, mod) => {
                    const completed = mod.chapters?.filter(ch => isChapterCompleted(ch._id)).length || 0;
                    return total + completed;
                  }, 0) / course.modules.reduce((total, mod) => total + (mod.chapters?.length || 0), 0) * 100}%` 
                }} />
              </div>

              {/* Module and Chapter List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {course.modules.map((module, moduleIndex) => (
                  <div key={module._id}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.75rem',
                      padding: '0.5rem',
                      background: 'var(--bg-light)',
                      borderRadius: '6px'
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700
                      }}>
                        {module.order}
                      </div>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{module.title}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginLeft: '1rem' }}>
                      {module.chapters?.map((chap, chapIndex) => {
                        const isActive = chap._id === chapter._id;
                        const isComplete = isChapterCompleted(chap._id);

                        return (
                          <div
                            key={chap._id}
                            onClick={() => navigate(`/chapters/${chap._id}`)}
                            style={{
                              padding: '0.5rem 0.75rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              background: isActive ? 'rgba(255, 107, 53, 0.1)' : 'transparent',
                              borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                              transition: 'all 0.2s',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem'
                            }}
                          >
                            <div style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '4px',
                              border: isComplete ? 'none' : '2px solid var(--border)',
                              background: isComplete ? 'var(--success)' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.7rem',
                              color: 'white',
                              flexShrink: 0
                            }}>
                              {isComplete && '✓'}
                            </div>
                            <span style={{
                              fontSize: '0.85rem',
                              color: isActive ? 'var(--accent)' : 'var(--text-dark)',
                              fontWeight: isActive ? 600 : 400
                            }}>
                              {chap.title}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'fixed',
            left: sidebarOpen ? '305px' : '15px',
            top: '100px',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '1px solid var(--border)',
            background: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px var(--shadow)',
            transition: 'left 0.3s',
            zIndex: 100
          }}
        >
          {sidebarOpen ? '←' : '→'}
        </button>

        {/* Main Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <div className="container fade-in">
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <div className="card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <span className={`chapter-content-type type-${chapter.contentType}`}>
                      {chapter.contentType}
                    </span>
                    <h1 style={{ fontSize: '2.5rem', margin: '1rem 0' }}>{chapter.title}</h1>
                    <p style={{ color: 'var(--text-light)' }}>
                      Estimated time: {chapter.estimatedDuration} minutes
                    </p>
                  </div>
                  <button 
                    className={`btn ${isCompleted ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={handleComplete}
                  >
                    {isCompleted ? '✓ Completed' : 'Mark as Complete'}
                  </button>
                </div>

                {chapter.content.videoUrl && (
                  <div style={{ marginBottom: '2rem' }}>
                    <div style={{ 
                      background: 'var(--primary)', 
                      borderRadius: '12px', 
                      padding: '4rem 2rem',
                      textAlign: 'center',
                      color: 'white'
                    }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>▶</div>
                      <p>Video: {chapter.content.videoUrl}</p>
                    </div>
                  </div>
                )}

                {chapter.content.text && (
                  <div style={{ 
                    fontSize: '1.1rem', 
                    lineHeight: '1.8',
                    color: 'var(--text-dark)',
                    marginBottom: '2rem'
                  }}>
                    <div dangerouslySetInnerHTML={{ __html: chapter.content.text.replace(/\n/g, '<br/>') }} />
                  </div>
                )}

                {chapter.content.images && chapter.content.images.length > 0 && (
                  <div style={{ marginTop: '2rem' }}>
                    {chapter.content.images.map((image, index) => (
                      <div key={index} style={{ marginBottom: '2rem' }}>
                        <div style={{ 
                          background: 'var(--bg-light)', 
                          borderRadius: '12px', 
                          padding: '2rem',
                          textAlign: 'center'
                        }}>
                          <p style={{ color: 'var(--text-light)' }}>
                            Image: {image.url}
                          </p>
                          {image.caption && (
                            <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>
                              {image.caption}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div style={{ 
                  marginTop: '2rem', 
                  paddingTop: '2rem',
                  borderTop: '1px solid var(--border)',
                  display: 'flex', 
                  justifyContent: 'space-between',
                  gap: '1rem'
                }}>
                  <button
                    className="btn btn-outline"
                    onClick={goToPrevious}
                    disabled={currentIndex <= 0}
                    style={{ 
                      opacity: currentIndex <= 0 ? 0.5 : 1,
                      cursor: currentIndex <= 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    ← Previous Chapter
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={goToNext}
                    disabled={currentIndex >= allChapters.length - 1}
                    style={{ 
                      opacity: currentIndex >= allChapters.length - 1 ? 0.5 : 1,
                      cursor: currentIndex >= allChapters.length - 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Next Chapter →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChapterView;
