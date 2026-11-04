import { useState, useEffect } from 'react';
import api from '../services/api';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', active: true });

  const fetchCategories = () => {
    setLoading(true);
    api.get('/categories')
      .then(res => {
        setCategories(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      api.put(`/admin/categories/${editingId}`, formData)
        .then(() => {
          fetchCategories();
          setEditingId(null);
          setFormData({ name: '', active: true });
        });
    } else {
      api.post('/admin/categories', formData)
        .then(() => {
          fetchCategories();
          setFormData({ name: '', active: true });
        });
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this category?")) {
      api.delete(`/admin/categories/${id}`)
        .then(() => fetchCategories());
    }
  };

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setFormData({ name: cat.name, active: cat.active !== false });
  };

  return (
    <div className="page-content">
      <h2 className="page-title">Categories Management</h2>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <form onSubmit={handleSubmit} className="card">
            <h3 style={{marginBottom: '1.5rem'}}>{editingId ? 'Edit Category' : 'Add New Category'}</h3>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Name <span style={{color:'red'}}>*</span></label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                required 
                style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: '4px' }} 
              />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, cursor: 'pointer'}}>
                <input 
                  type="checkbox" 
                  checked={formData.active} 
                  onChange={e => setFormData({...formData, active: e.target.checked})} 
                  style={{width: '18px', height: '18px'}}
                /> Active Status
              </label>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
              {editingId ? 'Update Category' : 'Add Category'}
            </button>
            {editingId && (
              <button type="button" onClick={() => {setEditingId(null); setFormData({name:'', active:true})}} className="btn btn-outline" style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}>
                Cancel
              </button>
            )}
          </form>
        </div>
        
        <div style={{ flex: 2 }}>
          <div className="card">
            <h3 style={{marginBottom: '1rem'}}>All Categories</h3>
            {loading ? <p>Loading...</p> : (
              <div style={{overflowX: 'auto'}}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Status</th>
                      <th style={{textAlign: 'right'}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(cat => (
                      <tr key={cat.id}>
                        <td style={{color: 'var(--text-muted)'}}>#{cat.id}</td>
                        <td style={{fontWeight: 600}}>{cat.name}</td>
                        <td>
                          {cat.active !== false ? <span className="badge badge-success">Active</span> : <span className="badge badge-warning">Inactive</span>}
                        </td>
                        <td style={{textAlign: 'right'}}>
                          <button className="btn btn-outline" onClick={() => handleEdit(cat)} style={{ marginRight: '0.5rem', padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}>Edit</button>
                          <button className="btn btn-outline" onClick={() => handleDelete(cat.id)} style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                    {categories.length === 0 && (
                      <tr><td colSpan="4" style={{textAlign: 'center', padding: '2rem'}}>No categories found.</td></tr>
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

export default Categories;
