import { useState, useEffect } from 'react';
import { IconX, IconTrash, IconArchive } from '@tabler/icons-react';

const API = "http://localhost:8000/api";

export default function EmployeeManager({ onClose }) {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', username: '', password: '', role: 'cashier' });

  useEffect(() => {
    fetch(`${API}/employees`).then(r => r.json()).then(setUsers);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/employees`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(form) });
    if (res.ok) {
      setForm({ name: '', email: '', username: '', password: '', role: 'cashier' });
      const updated = await fetch(`${API}/employees`).then(r => r.json());
      setUsers(updated);
    } else alert("Failed to create");
  };

  const toggleArchive = async (id) => {
    await fetch(`${API}/employees/${id}/archive`, { method: 'PATCH' });
    const updated = await fetch(`${API}/employees`).then(r => r.json());
    setUsers(updated);
  };

  const handleDelete = async (id) => {
    if(!confirm("Delete permanently?")) return;
    await fetch(`${API}/employees/${id}`, { method: 'DELETE' });
    setUsers(users.filter(u => u.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#714B67]">Employee Management</h2>
          <button onClick={onClose}><IconX size={24} /></button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg space-y-4">
            <h3 className="font-bold text-lg">Add Employee</h3>
            <input required placeholder="Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} className="w-full p-2 border rounded"/>
            <input required placeholder="Username" value={form.username} onChange={e=>setForm({...form, username: e.target.value})} className="w-full p-2 border rounded"/>
            <input required type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} className="w-full p-2 border rounded"/>
            <input required type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} className="w-full p-2 border rounded"/>
            <select value={form.role} onChange={e=>setForm({...form, role: e.target.value})} className="w-full p-2 border rounded">
              <option value="cashier">Cashier</option>
              <option value="kitchen">Kitchen Staff</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" className="w-full py-2 bg-[#714B67] text-white rounded font-bold hover:bg-[#604058]">Create Employee</button>
          </form>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {users.map(u => (
              <div key={u.id} className={`flex items-center justify-between p-3 border rounded-lg ${u.is_archived ? 'bg-gray-100 opacity-60' : 'bg-white'}`}>
                <div>
                  <p className="font-bold">{u.name} <span className="text-xs font-normal text-gray-500">({u.role})</span></p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>toggleArchive(u.id)} className="p-2 text-blue-500 hover:bg-blue-50 rounded"><IconArchive size={18}/></button>
                  <button onClick={()=>handleDelete(u.id)} className="p-2 text-red-500 hover:bg-red-50 rounded"><IconTrash size={18}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}