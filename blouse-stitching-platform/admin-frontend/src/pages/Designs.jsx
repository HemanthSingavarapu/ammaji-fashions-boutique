import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

function Designs() {
  const [designs, setDesigns] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({ 
    name: '', price: '', description: '', imageUrl: '', category: '', active: true, featured: false 
  });

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      api.get('/designs'),
      api.get('/categories')
    ]).then(([resDesigns, resCats]) => {
      setDesigns(resDesigns.data);
      setCategories(resCats.data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const handleImageFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({...prev, imageUrl: e.target.result}));
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a valid image file.");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      category: { id: formData.category },
      // If URL is omitted, default to a placeholder
      imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80'
    };
    
    if (editingId) {
      api.put(`/admin/designs/${editingId}`, payload).then(() => {
        fetchData();
        setEditingId(null);
        resetForm();
      });
    } else {
      api.post('/admin/designs', payload).then(() => {
        fetchData();
        resetForm();
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', description: '', imageUrl: '', category: '', active: true, featured: false });
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this design?")) {
      api.delete(`/admin/designs/${id}`).then(() => fetchData());
    }
  };

  const handleEdit = (des) => {
    setEditingId(des.id);
    setFormData({ 
      name: des.name, price: des.price, description: des.description, 
      imageUrl: des.imageUrl, category: des.category?.id || '', 
      active: des.active !== false, featured: des.featured === true 
    });
  };

  return (
    <div className="page-content">
      <h2 className="page-title">Designs Management</h2>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <form onSubmit={handleSubmit} className="card">
            <h3 style={{marginBottom: '1.5rem'}}>{editingId ? 'Edit Design' : 'Add New Design'}</h3>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Name <span style={{color:'red'}}>*</span></label>
              <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Category <span style={{color:'red'}}>*</span></label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '4px' }}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Price (₹) <span style={{color:'red'}}>*</span></label>
              <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '4px' }} />
            </div>
            
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Photo (Optional)</label>
              
              <div 
                onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragActive ? 'var(--primary)' : 'var(--border)'}`,
                  backgroundColor: dragActive ? '#f0f4ff' : '#fafafa',
                  borderRadius: '6px',
                  padding: '1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  marginBottom: '0.5rem',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef}
                  style={{display: 'none'}} 
                  onChange={(e) => {
                    if(e.target.files && e.target.files[0]) handleImageFile(e.target.files[0]);
                  }} 
                />
                
                {formData.imageUrl && formData.imageUrl.startsWith('data:image') ? (
                  <div>
                    <img src={formData.imageUrl} alt="Preview" style={{maxHeight: '120px', borderRadius: '4px', marginBottom: '0.5rem'}} />
                    <div style={{fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold'}}>Image Selected! Click to change.</div>
                  </div>
                ) : (
                  <div>
                    <div style={{fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.6}}>📸</div>
                    <div style={{fontWeight: '500', color: 'var(--text-main)'}}>Drag & Drop an image here</div>
                    <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem'}}>or click to browse files</div>
                  </div>
                )}
              </div>
              
              <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0'}}>
                <hr style={{flex: 1, borderTop: '1px solid var(--border)'}} />
                <span style={{fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold'}}>OR USE URL</span>
                <hr style={{flex: 1, borderTop: '1px solid var(--border)'}} />
              </div>
              
              <input 
                type="text" 
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl} 
                onChange={e => setFormData({...formData, imageUrl: e.target.value})} 
                style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '4px' }} 
              />
            </div>
            
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Description</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '4px' }} rows="3" />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem', display: 'flex', gap: '2rem' }}>
              <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, cursor: 'pointer'}}>
                <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} style={{width: '18px', height: '18px'}} /> Active
              </label>
              <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, cursor: 'pointer'}}>
                <input type="checkbox" checked={formData.featured} onChange={e => setFormData({...formData, featured: e.target.checked})} style={{width: '18px', height: '18px'}} /> Featured
              </label>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
              {editingId ? 'Update Design' : 'Add Design'}
            </button>
            {editingId && (
              <button type="button" onClick={() => {setEditingId(null); resetForm();}} className="btn btn-outline" style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}>Cancel</button>
            )}
          </form>
        </div>
        
        <div style={{ flex: 2 }}>
          <div className="card">
            <h3 style={{marginBottom: '1rem'}}>All Designs</h3>
            {loading ? <p>Loading...</p> : (
              <div style={{overflowX: 'auto'}}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th style={{textAlign: 'right'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {designs.map(des => (
                      <tr key={des.id}>
                        <td>
                          <img src={des.imageUrl} alt={des.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border)' }} />
                        </td>
                        <td>
                          <div style={{fontWeight: 600}}>{des.name}</div>
                          <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>{des.category?.name}</div>
                        </td>
                        <td style={{fontWeight: 500}}>₹{des.price}</td>
                        <td>
                          <div style={{display: 'flex', gap: '0.3rem', flexWrap: 'wrap'}}>
                            {des.active ? <span className="badge badge-success">Active</span> : <span className="badge badge-warning">Inactive</span>}
                            {des.featured && <span className="badge badge-primary">Featured</span>}
                          </div>
                        </td>
                        <td style={{textAlign: 'right'}}>
                          <button className="btn btn-outline" onClick={() => handleEdit(des)} style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}>Edit</button>
                          <button className="btn btn-outline" onClick={() => handleDelete(des.id)} style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                    {designs.length === 0 && (
                      <tr><td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>No designs found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Designs;
