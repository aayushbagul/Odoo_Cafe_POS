import { useState, useEffect } from 'react';
import { IconX } from '@tabler/icons-react';

const API = "http://localhost:8000/api";

export default function PaymentMethodManager({ onClose }) {
  const [methods, setMethods] = useState([]);

  useEffect(() => {
    fetch(`${API}/payments`).then(r => r.json()).then(setMethods);
  }, []);

  const toggle = async (id, field) => {
    const method = methods.find(m => m.id === id);
    const newData = { ...method, [field]: !method[field] };
    await fetch(`${API}/payments/${id}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newData) });
    setMethods(methods.map(m => m.id === id ? newData : m));
  };

  const updateUpi = async (id, upi_id) => {
    const method = methods.find(m => m.id === id);
    const newData = { ...method, upi_id };
    await fetch(`${API}/payments/${id}`, { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newData) });
    setMethods(methods.map(m => m.id === id ? newData : m));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#714B67]">Payment Methods</h2>
          <button onClick={onClose}><IconX size={24} /></button>
        </div>
        
        <div className="space-y-4">
          {methods.map(m => (
            <div key={m.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div className="flex-1">
                <h3 className="font-bold text-lg">{m.name}</h3>
                {m.type === 'upi' && (
                  <input 
                    type="text" 
                    placeholder="UPI ID (e.g., cafe@ybl)" 
                    value={m.upi_id || ''} 
                    onChange={(e) => updateUpi(m.id, e.target.value)}
                    className="mt-2 w-full p-2 border rounded text-sm"
                  />
                )}
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={m.is_enabled} onChange={() => toggle(m.id, 'is_enabled')} className="sr-only peer"/>
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-[#714B67] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#714B67]"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}