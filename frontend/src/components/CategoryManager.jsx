import { useState, useEffect } from 'react';
import { IconX, IconPlus, IconTrash } from '@tabler/icons-react';

const API_BASE_URL = "http://localhost:8000/api";

export default function CategoryManager({ onClose }) {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/products/categories`);
      if (res.ok) setCategories(await res.json());
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingId 
        ? `${API_BASE_URL}/products/categories/${editingId}`
        : `${API_BASE_URL}/products/categories`;
      
      const method = editingId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert(editingId ? 'Category updated!' : 'Category added!');
        setFormData({ name: '', description: '' });
        setEditingId(null);
        fetchCategories();
      } else {
        const error = await res.json();
        alert(error.detail || 'Failed to save category');
      }
    } catch (err) {
      console.error(err);
      alert('Error saving category');
    }
  };

  const handleEdit = (category) => {
    setFormData({ name: category.name, description: category.description || '' });
    setEditingId(category.id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/products/categories/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        alert('Category deleted!');
        fetchCategories();
      } else {
        const error = await res.json();
        alert(error.detail || 'Failed to delete category');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting category');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#714B67]">Category Management</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <IconX size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Add/Edit Form */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold mb-4">
              {editingId ? 'Edit Category' : 'Add New Category'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Beverages"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#714B67] focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  placeholder="Optional description"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#714B67] focus:outline-none"
                  rows="3"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#714B67] text-white rounded font-bold hover:bg-[#604058] transition-colors"
                >
                  {editingId ? 'Update' : 'Add'} Category
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ name: '', description: '' });
                      setEditingId(null);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded font-bold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Category List */}
          <div>
            <h3 className="text-lg font-bold mb-4">Existing Categories</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {categories.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No categories yet</p>
              ) : (
                categories.map(cat => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{cat.name}</p>
                      {cat.description && (
                        <p className="text-xs text-gray-500 mt-1">{cat.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(cat)}
                        className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}