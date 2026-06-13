import { useState, useEffect } from 'react';
import { IconX, IconUpload } from '@tabler/icons-react';

const API_BASE_URL = "http://localhost:8000/api";

export default function ProductManager({ onClose }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ name: '', price: '', category_id: '' });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const [prodRes, catRes] = await Promise.all([
      fetch(`${API_BASE_URL}/products`),
      fetch(`${API_BASE_URL}/products/categories`)
    ]);
    if (prodRes.ok) setProducts(await prodRes.json());
    if (catRes.ok) setCategories(await catRes.json());
  };

  const handleImageUpload = async () => {
    if (!imageFile) return null;
    setUploading(true);
    const formDataImg = new FormData();
    formDataImg.append('file', imageFile);
    
    try {
      const res = await fetch(`${API_BASE_URL}/uploads/upload-image`, {
        method: 'POST',
        body: formDataImg
      });
      if (res.ok) {
        const data = await res.json();
        setUploading(false);
        return data.image_url;
      }
    } catch (err) { console.error(err); }
    setUploading(false);
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let imgUrl = null;
    
    if (imageFile) {
      imgUrl = await handleImageUpload();
      if (!imgUrl) return alert("Image upload failed");
    }

    const payload = {
      name: formData.name,
      price: parseFloat(formData.price),
      category_id: parseInt(formData.category_id),
      image_url: imgUrl
    };

    const res = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      alert('Product added successfully!');
      setFormData({ name: '', price: '', category_id: '' });
      setImageFile(null);
      fetchData(); // Refresh list
    } else {
      alert('Failed to add product');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#714B67]">Product Management</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><IconX size={24} /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Add Product Form */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold mb-4">Add New Product</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Product Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded" required />
              <input type="number" step="0.01" placeholder="Price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-2 border rounded" required />
              <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full p-2 border rounded" required>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              
              <div>
                <label className="block text-sm font-medium mb-1">Product Image</label>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="w-full p-2 border rounded" />
                {imageFile && <p className="text-xs text-gray-500 mt-1">Selected: {imageFile.name}</p>}
              </div>

              <button type="submit" disabled={uploading} className="w-full py-2 bg-[#714B67] text-white rounded font-bold hover:bg-[#604058] disabled:opacity-50">
                {uploading ? 'Uploading Image...' : 'Add Product'}
              </button>
            </form>
          </div>

          {/* Product List */}
          <div>
            <h3 className="text-lg font-bold mb-4">Existing Products</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {products.map(p => (
                <div key={p.id} className="flex items-center gap-4 p-3 bg-white border rounded-lg shadow-sm">
                  <img src={p.image_url || 'https://via.placeholder.com/50'} alt={p.name} className="w-12 h-12 rounded object-cover bg-gray-100" />
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{p.name}</p>
                    <p className="text-xs text-gray-500">₹{p.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}