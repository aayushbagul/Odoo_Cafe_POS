import { useState, useEffect } from 'react';
import { IconX, IconPlus, IconTrash, IconEdit, IconSearch } from '@tabler/icons-react';

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
    }
  };

  const handleEdit = (c) => { setForm({ name: c.name, email: c.email, phone: c.phone }); setEditingId(c.id); };
  
  const handleDelete = async (id) => {
    if(!confirm("Delete customer?")) return;
    await fetch(`${API}/customers/${id}`, { method: 'DELETE' });
    fetchCustomers();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] flex flex-col">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#714B67]">Customer Management</h2>
          <button onClick={onClose}><IconX size={24}/></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 overflow-hidden">
          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg space-y-4 h-fit">
            <h3 className="font-bold text-lg">{editingId ? 'Edit Customer' : 'New Customer'}</h3>
            <input required placeholder="Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="w-full p-2 border rounded"/>
            <input type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} className="w-full p-2 border rounded"/>
            <input placeholder="Phone" value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} className="w-full p-2 border rounded"/>
            <button type="submit" className="w-full py-2 bg-[#714B67] text-white rounded font-bold hover:bg-[#604058]">
              {editingId ? 'Update' : 'Create'}
            </button>
            {editingId && <button type="button" onClick={()=>{setEditingId(null); setForm({name:'',email:'',phone:''})}} className="w-full py-2 border rounded">Cancel</button>}
          </form>

          {/* List */}
          <div className="flex flex-col h-full overflow-hidden">
            <div className="relative mb-4">
              <IconSearch className="absolute left-3 top-2.5 text-gray-400" size={18}/>
              <input placeholder="Search customers..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10 p-2 border rounded"/>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {customers.map(c => (
                <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 group">
                  <div className="cursor-pointer flex-1" onClick={() => onSelectCustomer && onSelectCustomer(c)}>
                    <p className="font-bold">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.phone} • {c.email}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={()=>handleEdit(c)} className="p-2 text-blue-500 hover:bg-blue-50 rounded"><IconEdit size={16}/></button>
                    <button onClick={()=>handleDelete(c.id)} className="p-2 text-red-500 hover:bg-red-50 rounded"><IconTrash size={16}/></button>
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