import { useState, useEffect } from 'react';
import { IconX, IconCash, IconReportMoney } from '@tabler/icons-react';

const API = "http://localhost:8000/api";

export default function SessionScreen({ onSessionOpen, onSessionClose }) {
  const [currentSession, setCurrentSession] = useState(null);
  const [openingCash, setOpeningCash] = useState('');
  const [closingCash, setClosingCash] = useState('');
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closingReport, setClosingReport] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchCurrentSession();
    fetchHistory();
  }, []);

  const fetchCurrentSession = async () => {
    const res = await fetch(`${API}/sessions/current`);
    const data = await res.json();
    setCurrentSession(data);
    if (!data) onSessionClose(); // Notify parent no session is active
  };

  const fetchHistory = async () => {
    const res = await fetch(`${API}/sessions/history`);
    if (res.ok) setHistory(await res.json());
  };

  const handleOpen = async () => {
    const res = await fetch(`${API}/sessions/open`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ opening_cash: parseFloat(openingCash) || 0 })
    });
    if (res.ok) {
      fetchCurrentSession();
      onSessionOpen();
    }
  };

  const handleClose = async () => {
    const res = await fetch(`${API}/sessions/${currentSession.id}/close`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ closing_cash: parseFloat(closingCash) || 0 })
    });
    if (res.ok) {
      const report = await res.json();
      setClosingReport(report);
      setShowCloseModal(true);
    }
  };

  // --- RENDER: NO ACTIVE SESSION ---
  if (!currentSession) {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
          <IconCash size={64} className="mx-auto text-[#714B67] mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Open New Session</h2>
          <p className="text-gray-500 mb-6">Enter the starting cash amount in the drawer.</p>
          
          <input 
            type="number" 
            placeholder="Opening Cash (₹)" 
            value={openingCash}
            onChange={e => setOpeningCash(e.target.value)}
            className="w-full p-3 border rounded-lg mb-4 text-center text-xl font-bold"
          />
          
          <button onClick={handleOpen} className="w-full py-3 bg-[#714B67] text-white rounded-lg font-bold hover:bg-[#604058]">
            Start Shift
          </button>

          {history.length > 0 && (
            <div className="mt-8 text-left">
              <h3 className="font-bold text-sm text-gray-500 uppercase mb-2">Previous Sessions</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {history.map(h => (
                  <div key={h.id} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                    <span>{new Date(h.start_time).toLocaleDateString()}</span>
                    <span className="font-bold">₹{h.total_sales.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- RENDER: ACTIVE SESSION DASHBOARD ---
  return (
    <>
      {/* Floating Session Status Bar */}
      <div className="fixed bottom-4 right-4 bg-white border border-gray-200 shadow-lg rounded-lg p-4 z-40 flex items-center gap-4">
        <div>
          <p className="text-xs text-gray-500">Current Session</p>
          {/* FIX: Added ?. and || '0.00' fallback */}
          <p className="font-bold text-[#714B67]">
            ₹{currentSession.total_sales?.toFixed(2) || '0.00'}
          </p>
        </div>
        <button 
          onClick={() => setShowCloseModal(true)}
          className="px-4 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 text-sm"
        >
          Close Shift
        </button>
      </div>

      {/* Closing Modal */}
      {showCloseModal && !closingReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Close Session</h2>
            <p className="text-gray-500 mb-4">Count the cash in the drawer and enter the total.</p>
            
            <label className="block text-sm font-medium mb-1">Closing Cash Amount</label>
            <input 
              type="number" 
              value={closingCash}
              onChange={e => setClosingCash(e.target.value)}
              className="w-full p-3 border rounded-lg mb-4 text-xl font-bold text-center"
              autoFocus
            />
            
            <div className="flex gap-2">
              <button onClick={() => setShowCloseModal(false)} className="flex-1 py-2 border rounded-lg">Cancel</button>
              <button onClick={handleClose} className="flex-1 py-2 bg-[#714B67] text-white rounded-lg font-bold">Confirm Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Closing Report */}
      {closingReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <IconReportMoney size={48} className="mx-auto text-green-500 mb-2" />
              <h2 className="text-2xl font-bold">Shift Closed</h2>
            </div>
            
            <div className="space-y-3 mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between"><span>Opening Cash</span><span>₹{closingReport.opening_cash.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Total Sales</span><span>₹{closingReport.total_sales.toFixed(2)}</span></div>
              <div className="flex justify-between font-bold border-t pt-2"><span>Expected Cash</span><span>₹{closingReport.expected_cash.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Actual Cash</span><span>₹{closingReport.closing_cash.toFixed(2)}</span></div>
              <div className={`flex justify-between font-bold ${closingReport.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <span>Difference</span><span>₹{closingReport.difference.toFixed(2)}</span>
              </div>
            </div>
            
            <button onClick={() => { setClosingReport(null); fetchCurrentSession(); }} className="w-full py-3 bg-[#714B67] text-white rounded-lg font-bold">
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}