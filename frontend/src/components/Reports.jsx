import { useState, useEffect } from 'react';
import { IconX, IconTrendingUp, IconShoppingCart, IconUsers } from '@tabler/icons-react';

const API_BASE_URL = "http://localhost:8000/api";

export default function Reports({ onClose }) {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    avgOrderValue: 0,
    paidOrders: 0
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/orders`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        
        // Calculate stats
        const paidOrders = data.filter(o => o.status === 'paid');
        const totalRevenue = paidOrders.reduce((sum, o) => sum + parseFloat(o.total), 0);
        
        setStats({
          totalOrders: data.length,
          totalRevenue,
          avgOrderValue: paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0,
          paidOrders: paidOrders.length
        });
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#714B67]">Reports & Analytics</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <IconX size={24} />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-6 rounded-lg shadow-md">
            <IconShoppingCart size={32} className="mb-2 opacity-80" />
            <p className="text-sm opacity-80">Total Orders</p>
            <p className="text-3xl font-bold">{stats.totalOrders}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-700 text-white p-6 rounded-lg shadow-md">
            <IconTrendingUp size={32} className="mb-2 opacity-80" />
            <p className="text-sm opacity-80">Total Revenue</p>
            <p className="text-3xl font-bold">₹{stats.totalRevenue.toFixed(2)}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-lg shadow-md">
            <IconUsers size={32} className="mb-2 opacity-80" />
            <p className="text-sm opacity-80">Avg Order Value</p>
            <p className="text-3xl font-bold">₹{stats.avgOrderValue.toFixed(2)}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-700 text-white p-6 rounded-lg shadow-md">
            <IconShoppingCart size={32} className="mb-2 opacity-80" />
            <p className="text-sm opacity-80">Paid Orders</p>
            <p className="text-3xl font-bold">{stats.paidOrders}</p>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <h3 className="text-lg font-bold mb-4">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Order #</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Table</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Items</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map(order => (
                  <tr key={order.id} className="border-b border-gray-100 hover:bg-white">
                    <td className="py-3 px-4 font-medium text-blue-600">{order.order_number}</td>
                    <td className="py-3 px-4 text-gray-700">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {order.table?.table_number || 'Takeaway'}
                    </td>
                    <td className="py-3 px-4 text-gray-700">{order.items?.length || 0}</td>
                    <td className="py-3 px-4 font-bold text-[#714B67]">
                      ₹{parseFloat(order.total).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        order.status === 'paid' ? 'bg-green-100 text-green-700' :
                        order.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}