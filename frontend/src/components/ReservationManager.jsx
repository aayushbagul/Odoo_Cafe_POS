import { useState, useEffect } from 'react';
import { IconX, IconTrash } from '@tabler/icons-react';

const API = "http://localhost:8000/api";

export default function ReservationManager({ onClose }) {
  const [reservations, setReservations] = useState([]);
  const [form, setForm] = useState({ customer_name: '', phone: '', date: '', time: '', party_size: 1, notes: '' });

  useEffect(() => {
    fetch(`${API}/reservations`).then(r => r.json()).then(setReservations);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${API}/reservations`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(form) });
    if (res.ok) {
      setForm({ customer_name: '', phone: '', date: '', time: '', party_size: 1, notes: '' });
      const updated = await fetch(`${API}/reservations`).then(r => r.json());
      setReservations(updated);
    }
  };

  const handleDelete = async (id) => {
    if(!confirm("Cancel this reservation?")) return;
    await fetch(`${API}/reservations/${id}`, { method: 'DELETE' });
    setReservations(reservations.filter(r => r.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#714B67]">Table Reservations</h2>
          <button onClick={onClose}><IconX size={24} /></button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg space-y-4">
            <h3 className="font-bold text-lg">New Reservation</h3>
            <input required placeholder="Customer Name" value={form.customer_name} onChange={e=>setForm({...form, customer_name: e.target.value})} className="w-full p-2 border rounded"/>
            <input placeholder="Phone" value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} className="w-full p-2 border rounded"/>
            <div className="grid grid-cols-2 gap-2">
              <input required type="date" value={form.date} onChange={e=>setForm({...form, date: e.target.value})} className="w-full p-2 border rounded"/>
              <input required type="time" value={form.time} onChange={e=>setForm({...form, time: e.target.value})} className="w-full p-2 border rounded"/>
            </div>
            <input required type="number" min="1" placeholder="Party Size" value={form.party_size} onChange={e=>setForm({...form, party_size: e.target.value})} className="w-full p-2 border rounded"/>
            <textarea placeholder="Notes" value={form.notes} onChange={e=>setForm({...form, notes: e.target.value})} className="w-full p-2 border rounded"/>
            <button type="submit" className="w-full py-2 bg-[#714B67] text-white rounded font-bold hover:bg-[#604058]">Book Table</button>
          </form>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {reservations.map(r => (
              <div key={r.id} className="p-3 border rounded-lg bg-white">
                <div className="flex justify-between">
                  <h4 className="font-bold">{r.customer_name}</h4>
                  <button onClick={()=>handleDelete(r.id)} className="text-red-500"><IconTrash size={16}/></button>
                </div>
                <p className="text-sm text-gray-600">{r.date} at {r.time} • {r.party_size} guests</p>
                {r.notes && <p className="text-xs text-gray-400 mt-1">{r.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}