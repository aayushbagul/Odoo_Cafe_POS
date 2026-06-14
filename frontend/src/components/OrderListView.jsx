import { useState, useEffect } from 'react';
import { IconX, IconSearch, IconPrinter, IconTrash, IconEdit, IconArrowLeft } from '@tabler/icons-react';

const API = "http://localhost:8000/api";

export default function OrderListView({ session, onClose, onLoadOrderToCart }) {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (session?.id) fetchOrders();
  }, [session, search]);

  const fetchOrders = async () => {
    const url = `${API}/orders?session_id=${session.id}&search=${search}`;
    const res = await fetch(url);
    if (res.ok) setOrders(await res.json());
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this draft order?")) return;
    await fetch(`${API}/orders/${id}`, { method: 'DELETE' });
    fetchOrders();
    setSelectedOrder(null);
  };

  const handlePrint = (order) => {
    window.open(`${API}/orders/${order.id}/receipt`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded"><IconArrowLeft size={24}/></button>
          <h2 className="text-xl font-bold">Session Orders</h2>
        </div>
        <div className="relative">
          <IconSearch className="absolute left-3 top-2.5 text-gray-400" size={18}/>
          <input 
            type="text" 
            placeholder="Search order # or customer..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-4">
        <table className="w-full bg-white rounded-lg shadow-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-4">Order #</th>
              <th className="p-4">Time</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} className="border-t hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedOrder(o)}>
                <td className="p-4 font-mono text-blue-600">{o.order_number}</td>
                <td className="p-4 text-sm text-gray-500">{new Date(o.created_at).toLocaleTimeString()}</td>
                <td className="p-4">{o.customer?.name || 'Walk-in'}</td>
                <td className="p-4 font-bold">₹{parseFloat(o.total).toFixed(2)}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    o.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>{o.status}</span>
                </td>
                <td className="p-4">
                  {o.status === 'draft' && <IconEdit size={18} className="inline mr-2 text-blue-500"/>}
                  {o.status === 'paid' && <IconPrinter size={18} className="inline text-gray-500"/>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-bold">Order {selectedOrder.order_number}</h3>
              <button onClick={() => setSelectedOrder(null)}><IconX size={24}/></button>
            </div>
            
            <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
              {selectedOrder.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm border-b pb-1">
                  <span>{item.quantity}x {item.product?.name}</span>
                  <span>₹{parseFloat(item.subtotal).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between font-bold text-lg mb-6">
              <span>Total</span>
              <span>₹{parseFloat(selectedOrder.total).toFixed(2)}</span>
            </div>

            <div className="flex gap-2">
              {selectedOrder.status === 'draft' && (
                <>
                  <button onClick={() => { onLoadOrderToCart(selectedOrder); setSelectedOrder(null); onClose(); }} 
                    className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 flex items-center justify-center gap-2">
                    <IconEdit size={18}/> Edit Order
                  </button>
                  <button onClick={() => handleDelete(selectedOrder.id)} 
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200">
                    <IconTrash size={18}/>
                  </button>
                </>
              )}
              {selectedOrder.status === 'paid' && (
                <button onClick={() => handlePrint(selectedOrder)} 
                  className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 flex items-center justify-center gap-2">
                  <IconPrinter size={18}/> Print Receipt
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}