import { useState, useEffect } from 'react';
import { IconX, IconTrash, IconEdit, IconSearch, IconUser } from '@tabler/icons-react';

const API = "http://localhost:8000/api";

export default function CustomerManager({ onClose, onSelectCustomer }) {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { fetchCustomers(); }, [search]);

  const fetchCustomers = async () => {
    const res = await fetch(`${API}/customers?search=${search}`);
    if (res.ok) setCustomers(await res.json());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId ? `${API}/customers/${editingId}` : `${API}/customers`;
    const method = editingId ? 'PUT' : 'POST';
    
    const res = await fetch(url, { method, headers: {'Content-Type': 'application/json'}, body: JSON.stringify(form) });
    if (res.ok) {
      setForm({ name: '', email: '', phone: '' });
      setEditingId(null);
      fetchCustomers();
    } else {
      alert("Failed to save customer");
    }
  };

  const handleEdit = (c) => { 
    setForm({ name: c.name, email: c.email || '', phone: c.phone || '' }); 
    setEditingId(c.id); 
  };
  
  const handleDelete = async (id) => {
    if(!confirm("Delete this customer? This cannot be undone.")) return;
    const res = await fetch(`${API}/customers/${id}`, { method: 'DELETE' });
    if(res.ok) fetchCustomers();
    else alert("Failed to delete customer");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#714B67]">Customer Management</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <IconX size={24} className="text-gray-600"/>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 overflow-hidden">
          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg space-y-4 h-fit border border-gray-200">
            <h3 className="font-bold text-lg text-gray-800">{editingId ? 'Edit Customer' : 'New Customer'}</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input 
                required 
                placeholder="e.g. Rahul Sharma" 
                value={form.name} 
                onChange={e=>setForm({...form, name: e.target.value})} 
                className="w-full p-2.5 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#714B67] focus:border-[#714B67] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                placeholder="e.g. rahul@example.com" 
                value={form.email} 
                onChange={e=>setForm({...form, email: e.target.value})} 
                className="w-full p-2.5 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#714B67] focus:border-[#714B67] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input 
                placeholder="e.g. 9876543210" 
                value={form.phone} 
                onChange={e=>setForm({...form, phone: e.target.value})} 
                className="w-full p-2.5 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#714B67] focus:border-[#714B67] outline-none transition-all"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 py-2.5 bg-[#714B67] text-white rounded-lg font-bold hover:bg-[#604058] transition-colors shadow-sm">
                {editingId ? 'Update Customer' : 'Create Customer'}
              </button>
              {editingId && (
                <button type="button" onClick={()=>{setEditingId(null); setForm({name:'',email:'',phone:''})}} className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* List */}
          <div className="flex flex-col h-full overflow-hidden">
            <div className="relative mb-4">
              <IconSearch className="absolute left-3 top-3 text-gray-400" size={18}/>
              <input 
                placeholder="Search by name, email, or phone..." 
                value={search} 
                onChange={e=>setSearch(e.target.value)} 
                className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-[#714B67] focus:border-[#714B67] outline-none transition-all"
              />
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {customers.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                  <IconUser size={40} className="mb-2 opacity-50" />
                  <p className="font-medium">No customers found</p>
                  <p className="text-sm">Try a different search or create a new one.</p>
                </div>
              ) : (
                customers.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-[#714B67] transition-all group cursor-pointer">
                    <div className="flex-1 flex items-center gap-3" onClick={() => onSelectCustomer && onSelectCustomer(c)}>
                      <div className="w-10 h-10 rounded-full bg-[#714B67]/10 text-[#714B67] flex items-center justify-center font-bold text-lg flex-shrink-0">
                        {c.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 group-hover:text-[#714B67] transition-colors">
							{c.name || 'Unknown Customer'}
						</p>
                        <p className="text-xs text-gray-600">
                          {c.phone || 'No phone'} • {c.email || 'No email'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button onClick={(e) => {e.stopPropagation(); handleEdit(c);}} className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors" title="Edit">
                        <IconEdit size={16}/>
                      </button>
                      <button onClick={(e) => {e.stopPropagation(); handleDelete(c.id);}} className="p-2 text-red-600 hover:bg-red-100 rounded-md transition-colors" title="Delete">
                        <IconTrash size={16}/>
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