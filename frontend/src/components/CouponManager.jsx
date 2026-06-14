import { useState, useEffect } from 'react';
import { IconX, IconPlus, IconTrash } from '@tabler/icons-react';

const API_BASE_URL = "http://localhost:8000/api";

export default function CouponManager({ onClose }) {
  const [coupons, setCoupons] = useState([]);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_amount: '0'
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/coupons`);
      if (res.ok) setCoupons(await res.json());
    } catch (err) {
      console.error("Error fetching coupons:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const res = await fetch(`${API_BASE_URL}/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code.toUpperCase(),
          discount_type: formData.discount_type,
          discount_value: parseFloat(formData.discount_value),
          min_order_amount: parseFloat(formData.min_order_amount)
        })
      });

      if (res.ok) {
        alert('Coupon added!');
        setFormData({
          code: '',
          discount_type: 'percentage',
          discount_value: '',
          min_order_amount: '0'
        });
        fetchCoupons();
      } else {
        const error = await res.json();
        alert(error.detail || 'Failed to add coupon');
      }
    } catch (err) {
      console.error(err);
      alert('Error adding coupon');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/coupons/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        alert('Coupon deleted!');
        fetchCoupons();
      } else {
        alert('Failed to delete coupon');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting coupon');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#714B67]">Coupon Management</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <IconX size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Add Form */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold mb-4">Add New Coupon</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code</label>
                <input
                  type="text"
                  placeholder="e.g. SAVE20"
                  value={formData.code}
                  onChange={e => setFormData({...formData, code: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#714B67] focus:outline-none uppercase"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                <select
                  value={formData.discount_type}
                  onChange={e => setFormData({...formData, discount_type: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#714B67] focus:outline-none"
                  required
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Value {formData.discount_type === 'percentage' ? '(%)' : '(₹)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 10"
                  value={formData.discount_value}
                  onChange={e => setFormData({...formData, discount_value: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#714B67] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Order Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0 for no minimum"
                  value={formData.min_order_amount}
                  onChange={e => setFormData({...formData, min_order_amount: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#714B67] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#714B67] text-white rounded font-bold hover:bg-[#604058] transition-colors"
              >
                Add Coupon
              </button>
            </form>
          </div>

          {/* Coupon List */}
          <div>
            <h3 className="text-lg font-bold mb-4">Existing Coupons</h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {coupons.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No coupons yet</p>
              ) : (
                coupons.map(coupon => (
                  <div
                    key={coupon.id}
                    className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-sm text-[#714B67]">{coupon.code}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {coupon.discount_type === 'percentage' 
                          ? `${coupon.discount_value}% off` 
                          : `₹${coupon.discount_value} off`}
                      </p>
                      {parseFloat(coupon.min_order_amount) > 0 && (
                        <p className="text-xs text-gray-500">
                          Min order: ₹{coupon.min_order_amount}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <IconTrash size={16} />
                    </button>
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