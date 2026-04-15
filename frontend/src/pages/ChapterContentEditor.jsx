import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Navbar from '../components/Navbar';

function ChapterContentEditor() {
  const { id } = useParams(); // chapter id or 'new'
  const location = useLocation();
  const { API_URL } = useAuth();
  const [chapter, setChapter] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    order: 1,
    contentType: 'mixed',
    estimatedDuration: 10,
    content: {
      text: '',
      videoUrl: '',
      images: []
    }
  });
  const [imageUrl, setImageUrl] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const moduleId = new URLSearchParams(location.search).get('moduleId');

  useEffect(() => {
    if (id !== 'new') {
      fetchChapter();
    } else if (moduleId) {
      // Set defaults for new chapter
      setFormData(prev => ({ ...prev, order: 1 }));
    }
  }, [id]);

  const fetchChapter = async () => {
    try {
      const response = await axios.get(`${API_URL}/chapters/${id}`);
      const chapterData = response.data.data;
      setChapter(chapterData);
      setFormData({
        title: chapterData.title,
        order: chapterData.order,
        contentType: chapterData.contentType,
        estimatedDuration: chapterData.estimatedDuration,
        content: {
          text: chapterData.content.text || '',
          videoUrl: chapterData.content.videoUrl || '',
          images: chapterData.content.images || []
        }
      });
    } catch (error) {
      console.error('Error fetching chapter:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (id === 'new') {
        await axios.post(`${API_URL}/modules/${moduleId}/chapters`, formData);
      } else {
        await axios.put(`${API_URL}/chapters/${id}`, formData);
      }
      alert('Chapter saved successfully!');
      navigate(-1); // Go back to course content editor
    } catch (error) {
      console.error('Error saving chapter:', error);
      alert('Failed to save chapter: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const insertFormatting = (tag) => {
    const textarea = document.getElementById('contentTextarea');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.text.substring(start, end);
    const before = formData.content.text.substring(0, start);
    const after = formData.content.text.substring(end);

    let newText = '';
    switch(tag) {
      case 'bold':
        newText = before + `**${selectedText || 'bold text'}**` + after;
        break;
      case 'italic':
        newText = before + `*${selectedText || 'italic text'}*` + after;
        break;
      case 'heading':
        newText = before + `\n## ${selectedText || 'Heading'}\n` + after;
        break;
      case 'bullet':
        newText = before + `\n- ${selectedText || 'List item'}\n` + after;
        break;
      case 'number':
        newText = before + `\n1. ${selectedText || 'List item'}\n` + after;
        break;
      case 'code':
        newText = before + `\`${selectedText || 'code'}\`` + after;
        break;
      case 'quote':
        newText = before + `\n> ${selectedText || 'Quote'}\n` + after;
        break;
      case 'link':
        newText = before + `[${selectedText || 'link text'}](url)` + after;
        break;
      default:
        return;
    }

    setFormData({
      ...formData,
      content: { ...formData.content, text: newText }
    });
  };

  const addImage = () => {
    if (!imageUrl) {
      alert('Please enter an image URL');
      return;
    }

    const newImage = {
      url: imageUrl,
      caption: imageCaption || ''
    };

    setFormData({
      ...formData,
      content: {
        ...formData.content,
        images: [...formData.content.images, newImage]
      }
    });

    setImageUrl('');
    setImageCaption('');
  };

  const removeImage = (index) => {
    const newImages = formData.content.images.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      content: { ...formData.content, images: newImages }
    });
  };

  const renderPreview = () => {
    let html = formData.content.text;
    
    // Convert markdown-like syntax to HTML
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'); // Bold
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>'); // Italic
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>'); // Headings
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>'); // Bullets
    html = html.replace(/^1\. (.+)$/gm, '<li>$1</li>'); // Numbers
    html = html.replace(/`(.+?)`/g, '<code>$1</code>'); // Inline code
    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>'); // Quotes
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>'); // Links
    html = html.replace(/\n/g, '<br/>'); // Line breaks

    return html;
  };

  return (
    <div>
      <Navbar />
      <div className="container fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
              {id === 'new' ? 'Create Chapter' : 'Edit Chapter'}
            </h1>
            <p style={{ color: 'var(--text-light)' }}>
              Create rich content with text, images, and videos
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-outline" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Chapter'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Editor Side */}
          <div>
            <div className="card" style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Chapter Details</h3>
              
              <div className="form-group">
                <label className="form-label">Chapter Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g., Introduction to Banking Basics"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Order</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (min)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={formData.estimatedDuration}
                    onChange={(e) => setFormData({...formData, estimatedDuration: parseInt(e.target.value)})}
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Content Type</label>
                <select
                  className="form-select"
                  value={formData.contentType}
                  onChange={(e) => setFormData({...formData, contentType: e.target.value})}
                >
                  <option value="mixed">Mixed (Recommended)</option>
                  <option value="document">Document Only</option>
                  <option value="video">Video Only</option>
                </select>
              </div>
            </div>

            {/* Text Editor */}
            {(formData.contentType === 'document' || formData.contentType === 'mixed') && (
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Text Content</h3>
                
                {/* Formatting Toolbar */}
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  gap: '0.5rem', 
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  background: 'var(--bg-light)',
                  borderRadius: '8px'
                }}>
                  <button 
                    type="button"
                    className="btn btn-outline" 
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                    onClick={() => insertFormatting('bold')}
                    title="Bold"
                  >
                    <strong>B</strong>
                  </button>
                  <button 
                    type="button"
                    className="btn btn-outline" 
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                    onClick={() => insertFormatting('italic')}
                    title="Italic"
                  >
                    <em>I</em>
                  </button>
                  <button 
                    type="button"
                    className="btn btn-outline" 
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                    onClick={() => insertFormatting('heading')}
                    title="Heading"
                  >
                    H
                  </button>
                  <button 
                    type="button"
                    className="btn btn-outline" 
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                    onClick={() => insertFormatting('bullet')}
                    title="Bullet List"
                  >
                    • List
                  </button>
                  <button 
                    type="button"
                    className="btn btn-outline" 
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                    onClick={() => insertFormatting('number')}
                    title="Numbered List"
                  >
                    1. List
                  </button>
                  <button 
                    type="button"
                    className="btn btn-outline" 
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                    onClick={() => insertFormatting('code')}
                    title="Code"
                  >
                    {'</>'}
                  </button>
                  <button 
                    type="button"
                    className="btn btn-outline" 
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                    onClick={() => insertFormatting('quote')}
                    title="Quote"
                  >
                    " "
                  </button>
                  <button 
                    type="button"
                    className="btn btn-outline" 
                    style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                    onClick={() => insertFormatting('link')}
                    title="Link"
                  >
                    🔗
                  </button>
                </div>

                <textarea
                  id="contentTextarea"
                  className="form-textarea"
                  value={formData.content.text}
                  onChange={(e) => setFormData({
                    ...formData,
                    content: { ...formData.content, text: e.target.value }
                  })}
                  placeholder="Write your chapter content here. Use the formatting buttons above to style your text."
                  rows="15"
                  style={{ minHeight: '300px', fontFamily: 'monospace' }}
                />
                
                <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                  Tip: Use **bold**, *italic*, ## Headings, - bullets, and more
                </p>
              </div>
            )}

            {/* Video Section */}
            {(formData.contentType === 'video' || formData.contentType === 'mixed') && (
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Video</h3>
                <div className="form-group">
                  <label className="form-label">Video URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={formData.content.videoUrl}
                    onChange={(e) => setFormData({
                      ...formData,
                      content: { ...formData.content, videoUrl: e.target.value }
                    })}
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                  />
                  <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-light)' }}>
                    Supports YouTube, Vimeo, and direct video URLs
                  </p>
                </div>
              </div>
            )}

            {/* Images Section */}
            {(formData.contentType === 'document' || formData.contentType === 'mixed') && (
              <div className="card">
                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Images</h3>
                
                <div style={{ marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Image URL</label>
                    <input
                      type="url"
                      className="form-input"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Caption (optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={imageCaption}
                      onChange={(e) => setImageCaption(e.target.value)}
                      placeholder="Describe the image"
                    />
                  </div>
                  <button 
                    type="button"
                    className="btn btn-primary" 
                    onClick={addImage}
                    style={{ width: '100%' }}
                  >
                    Add Image
                  </button>
                </div>

                {/* Image List */}
                {formData.content.images.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {formData.content.images.map((img, index) => (
                      <div 
                        key={index}
                        style={{
                          padding: '1rem',
                          background: 'var(--bg-light)',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ 
                            fontSize: '0.9rem', 
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {img.url}
                          </div>
                          {img.caption && (
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginTop: '0.25rem' }}>
                              {img.caption}
                            </div>
                          )}
                        </div>
                        <button 
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', marginLeft: '1rem' }}
                          onClick={() => removeImage(index)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Preview Side */}
          <div style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Preview</h3>
              
              <div style={{
                padding: '1.5rem',
                background: 'var(--bg-light)',
                borderRadius: '8px',
                minHeight: '400px'
              }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  {formData.title || 'Chapter Title'}
                </h1>
                <p style={{ color: 'var(--text-light)', marginBottom: '1.5rem' }}>
                  {formData.estimatedDuration} minutes
                </p>

                {formData.content.videoUrl && (
                  <div style={{ 
                    marginBottom: '2rem',
                    padding: '3rem 2rem',
                    background: 'var(--primary)',
                    borderRadius: '12px',
                    textAlign: 'center',
                    color: 'white'
                  }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>▶</div>
                    <div style={{ fontSize: '0.9rem' }}>Video will play here</div>
                  </div>
                )}

                {formData.content.text && (
                  <div 
                    style={{ 
                      fontSize: '1.05rem',
                      lineHeight: '1.8',
                      marginBottom: '2rem'
                    }}
                    dangerouslySetInnerHTML={{ __html: renderPreview() }}
                  />
                )}

                {formData.content.images.map((img, index) => (
                  <div key={index} style={{ marginBottom: '1.5rem' }}>
                    <div style={{
                      padding: '2rem',
                      background: 'white',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ color: 'var(--text-light)', marginBottom: '0.5rem' }}>
                        📷 Image Preview
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                        {img.url}
                      </div>
                      {img.caption && (
                        <p style={{ marginTop: '1rem', fontStyle: 'italic', fontSize: '0.95rem' }}>
                          {img.caption}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {!formData.content.text && !formData.content.videoUrl && formData.content.images.length === 0 && (
                  <p style={{ color: 'var(--text-light)', textAlign: 'center', padding: '2rem' }}>
                    Your content will appear here as you add it
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChapterContentEditor;
