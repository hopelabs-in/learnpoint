import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Navbar from '../components/Navbar';

export function ModuleDetail() {
  const { id } = useParams();
  const { API_URL, user } = useAuth();
  const [module, setModule] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchModuleDetails();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchModuleDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/modules/${id}`);
      setModule(response.data.data);
    } catch (error) {
      console.error('Error fetching module:', error);
    }
  };

  if (!module) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <Navbar />
      <div className="container fade-in">
        <button 
          className="btn btn-outline" 
          onClick={() => navigate(`/courses/${module.course._id}`)}
          style={{ marginBottom: '2rem' }}
        >
          ← Back to Course
        </button>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div className="module-order" style={{ width: '50px', height: '50px', fontSize: '1.5rem' }}>
              {module.order}
            </div>
            <h1 style={{ fontSize: '2.5rem' }}>{module.title}</h1>
          </div>
          <p style={{ color: 'var(--text-light)', fontSize: '1.1rem' }}>
            {module.description}
          </p>
        </div>

        <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Chapters</h2>

        <div className="chapter-list">
          {module.chapters && module.chapters.map((chapter, index) => {
            const isCompleted = user.completedChapters?.includes(chapter._id);
            
            return (
              <div 
                key={chapter._id} 
                className="chapter-item slide-in"
                style={{ animationDelay: `${index * 0.05}s` }}
                onClick={() => navigate(`/chapters/${chapter._id}`)}
              >
                <div className={`chapter-checkbox ${isCompleted ? 'completed' : ''}`}>
                  {isCompleted && '✓'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{chapter.title}</h4>
                    <span className={`chapter-content-type type-${chapter.contentType}`}>
                      {chapter.contentType}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                    {chapter.estimatedDuration} min
                  </p>
                </div>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>→</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function ChapterView() {
  const { id } = useParams();
  const { API_URL } = useAuth();
  const [chapter, setChapter] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchChapter();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchChapter = async () => {
    try {
      const response = await axios.get(`${API_URL}/chapters/${id}`);
      setChapter(response.data.data);
      setIsCompleted(response.data.data.isCompleted);
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
    } catch (error) {
      console.error('Error updating completion:', error);
    }
  };

  if (!chapter) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <Navbar />
      <div className="container fade-in">
        <button 
          className="btn btn-outline" 
          onClick={() => navigate(`/modules/${chapter.module._id}`)}
          style={{ marginBottom: '2rem' }}
        >
          ← Back to Module
        </button>

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
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModuleDetail;