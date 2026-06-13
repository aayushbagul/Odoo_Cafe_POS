import { useState } from 'react';
import { 
  IconSearch, IconPrinter, IconCircleX, IconShare, IconWifi, IconBattery3, 
  IconMenu2, IconRefresh, IconUserCircle, IconDiscount2, IconSend, 
  IconDeviceMobile, IconCreditCard, IconX, IconTrash, IconCheck, IconCash
} from '@tabler/icons-react';

// ==========================================
// REUSABLE COMPONENT 1: CART & SUMMARY
// ==========================================
export const ReusableCart = ({
  cart, updateQuantity, removeFromCart,
  subtotal, tax, discountAmount, total,
  selectedCustomer, onShowCustomerModal, onShowDiscountModal,
  onSendToKitchen
}) => {
  return (
    <>
      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {cart.length === 0 ? (
          <p className="text-center text-gray-400 mt-8">Cart is empty</p>
        ) : (
          cart.map(item => (
            <div key={item.product_id} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
              <div className="flex justify-between font-semibold text-sm">
                <span>{item.product_name}</span>
                <button onClick={() => removeFromCart(item.product_id)} className="text-red-400 hover:text-red-600">
                  <IconTrash size={14} />
                </button>
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-2 bg-gray-100 rounded p-1">
                  <button onClick={() => updateQuantity(item.product_id, -1)} className="w-6 h-6 flex items-center justify-center hover:bg-white rounded text-gray-600">-</button>
                  <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product_id, 1)} className="w-6 h-6 flex items-center justify-center hover:bg-white rounded text-gray-600">+</button>
                </div>
                <span className="font-bold text-sm text-[#714B67]">₹{item.line_total.toFixed(2)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button onClick={onShowCustomerModal} className="flex flex-col items-center gap-1 text-xs font-medium p-2 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-100">
          <IconUserCircle size={20} /> Customer
        </button>
        <button onClick={onShowDiscountModal} className="flex flex-col items-center gap-1 text-xs font-medium p-2 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-100">
          <IconDiscount2 size={20} /> Discount
        </button>
        <button onClick={onSendToKitchen} className="flex flex-col items-center gap-1 text-xs font-medium p-2 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-100">
          <IconSend size={20} /> Send
        </button>
      </div>

      {/* Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2 text-sm shadow-sm">
        <div className="flex justify-between"><span>Sub total</span><span>₹{subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Tax (5%)</span><span>₹{tax.toFixed(2)}</span></div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-green-600 font-medium"><span>Discount</span><span>-₹{discountAmount.toFixed(2)}</span></div>
        )}
        <div className="flex justify-between font-bold text-xl border-t pt-3 mt-2">
          <span>Total</span><span className="text-[#714B67]">₹{total.toFixed(2)}</span>
        </div>
      </div>
    </>
  );
};

// ==========================================
// REUSABLE COMPONENT 2: PAYMENT METHODS
// ==========================================
export const ReusablePayment = ({
  activePayment, setActivePayment, total,
  cashReceived, setCashReceived, change,
  cardRef, setCardRef, onConfirmPayment, qrCodeUrl
}) => {
  return (
    <>
      {/* Payment Tabs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { id: 'Cash', icon: <IconCash size={28} /> },
          { id: 'UPI', icon: <IconDeviceMobile size={28} /> },
          { id: 'Card', icon: <IconCreditCard size={28} /> }
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setActivePayment(m.id)}
            className={`flex flex-col items-center justify-center gap-2 py-6 rounded-lg border font-semibold text-lg transition-all ${
              activePayment === m.id 
                ? 'border-[#714B67] bg-purple-50 text-[#714B67] shadow-sm' 
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            {m.icon}
            {m.id}
          </button>
        ))}
      </div>

      {/* Total Amount Display */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-center shadow-sm">
        <p className="text-3xl font-bold text-gray-800">Amount ₹{total.toFixed(2)}</p>
        <p className="text-sm text-gray-500 font-semibold mt-1 uppercase tracking-wider">{activePayment}</p>
      </div>

      {/* Cash Numpad */}
      {activePayment === 'Cash' && (
        <div className="flex gap-4 flex-1">
          <div className="flex-1 grid grid-cols-3 gap-3">
            {[1,2,3,4,5,6,7,8,9,'+/-',0,'x'].map((key, i) => (
              <button
                key={i}
                onClick={() => {
                  if (key === 'x') setCashReceived(prev => prev.slice(0, -1));
                  else if (key !== '+/-') setCashReceived(prev => prev + key);
                }}
                className={`h-14 rounded-lg border font-semibold text-xl flex items-center justify-center transition-all active:scale-95 ${
                  key === 'x'
                    ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                    : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                }`}
              >
                {key === 'x' ? <IconX size={24} /> : key}
              </button>
            ))}
          </div>
          <div className="w-32 flex flex-col gap-3">
            <div className="flex-1 bg-gray-100 border border-gray-200 rounded-lg p-3 flex flex-col justify-center shadow-sm">
              <p className="text-xs text-gray-500 font-semibold uppercase">Received</p>
              <p className="text-2xl font-bold text-gray-800">₹{cashReceived || '0'}</p>
              {change >= 0 && cashReceived && (
                <p className="text-sm font-bold text-green-600 mt-1">Change: ₹{change.toFixed(2)}</p>
              )}
            </div>
            <button 
              onClick={onConfirmPayment}
              disabled={!cashReceived || parseFloat(cashReceived) < total}
              className="py-4 bg-[#714B67] text-white rounded-lg font-bold hover:bg-[#604058] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {/* UPI QR */}
      {activePayment === 'UPI' && (
        <div className="flex flex-col items-center justify-center">
          <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-300 mb-4">
            <img src={qrCodeUrl} alt="UPI QR" className="w-48 h-48" />
          </div>
          <p className="text-sm text-gray-600 mb-4">Scan with any UPI App</p>
          <button 
            onClick={onConfirmPayment}
            className="w-full max-w-xs py-4 bg-[#714B67] text-white rounded-lg font-bold text-xl hover:bg-[#604058] transition-colors shadow-sm"
          >
            I Have Received the Payment
          </button>
        </div>
      )}

      {/* Card Input */}
      {activePayment === 'Card' && (
        <div className="flex flex-col">
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-700 font-medium">Please swipe/insert card on the terminal</p>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Transaction Reference / Auth Code</label>
              <input 
                type="text" 
                value={cardRef}
                onChange={(e) => setCardRef(e.target.value)}
                placeholder="e.g. TXN123456789" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#714B67] focus:outline-none"
              />
            </div>
            <button 
              onClick={onConfirmPayment}
              disabled={!cardRef.trim()}
              className="w-full py-4 bg-[#714B67] text-white rounded-lg font-bold text-xl hover:bg-[#604058] disabled:opacity-50 transition-colors shadow-sm"
            >
              Confirm Card Payment
            </button>
          </div>
        </div>
      )}
    </>
  );
};

// ==========================================
// MAIN POS TERMINAL COMPONENT
// ==========================================
export default function POSTerminal() {
  // Mock Data
  const mockCategories = [
    { id: 1, name: 'Chaat', color: '#E74C3C' },
    { id: 2, name: 'Desert', color: '#F1C40F' },
    { id: 3, name: 'Meal', color: '#2ECC71' },
    { id: 4, name: 'Beverages', color: '#3498DB' },
  ];

  const mockProducts = [
    { id: 1, name: 'Masala Tea', price: 20, category_id: 4, is_available: true },
    { id: 2, name: 'Coffee', price: 50, category_id: 4, is_available: true },
    { id: 3, name: 'Lassi', price: 60, category_id: 4, is_available: true },
    { id: 4, name: 'Pani Puri', price: 40, category_id: 1, is_available: true },
    { id: 5, name: 'Bhel Puri', price: 50, category_id: 1, is_available: true },
    { id: 6, name: 'Ice Cream', price: 80, category_id: 2, is_available: true },
    { id: 7, name: 'Gulab Jamun', price: 60, category_id: 2, is_available: true },
    { id: 8, name: 'Sandwich', price: 100, category_id: 3, is_available: true },
    { id: 9, name: 'Burger', price: 120, category_id: 3, is_available: true },
  ];

  const initialTables = [
    { id: 1, table_number: 1, seat_capacity: 4, status: 'available', floor_name: 'Main Floor' },
    { id: 2, table_number: 2, seat_capacity: 2, status: 'occupied', floor_name: 'Main Floor' },
    { id: 3, table_number: 3, seat_capacity: 6, status: 'available', floor_name: 'Main Floor' },
    { id: 4, table_number: 4, seat_capacity: 4, status: 'available', floor_name: 'Main Floor' },
    { id: 5, table_number: 5, seat_capacity: 8, status: 'available', floor_name: 'Main Floor' },
  ];

  const mockCustomers = [
    { id: 1, name: 'Walk-in Customer', email: '', phone: '' },
    { id: 2, name: 'Rahul Sharma', email: 'rahul@example.com', phone: '9876543210' },
    { id: 3, name: 'Priya Singh', email: 'priya@example.com', phone: '9123456780' },
  ];

  // State
  const [categories] = useState(mockCategories);
  const [products] = useState(mockProducts);
  const [tables, setTables] = useState(initialTables);
  const [activeCategory, setActiveCategory] = useState(4);
  const [selectedTable, setSelectedTable] = useState(null);
  const [cart, setCart] = useState([]);
  const [activePayment, setActivePayment] = useState('Cash');
  const [cashReceived, setCashReceived] = useState('');
  const [cardRef, setCardRef] = useState('');
  const [orders, setOrders] = useState([]);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(mockCustomers[0]);

  // Derived Values
  const filteredProducts = products.filter(p => p.category_id === activeCategory);
  const subtotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const tax = subtotal * 0.05; // 5% GST
  const total = Math.max(0, subtotal + tax - discountAmount);
  const change = activePayment === 'Cash' ? (parseFloat(cashReceived) || 0) - total : 0;

  const upiUrl = `upi://pay?pa=cafe@ybl&pn=OdooCafe&am=${total.toFixed(2)}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

  // Cart Functions
  const addToCart = (product) => {
    const existing = cart.find(item => item.product_id === product.id);
    if (existing) {
      setCart(cart.map(item => 
        item.product_id === product.id 
          ? { ...item, quantity: item.quantity + 1, line_total: (item.quantity + 1) * item.unit_price }
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: product.price,
        line_total: product.price
      }]);
    }
  };

  const updateQuantity = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.product_id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty, line_total: newQty * item.unit_price };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  // Payment & Order Functions
  const handlePayment = () => {
    if (cart.length === 0) return;
    
    if (activePayment === 'Cash' && parseFloat(cashReceived) < total) return;
    if (activePayment === 'Card' && !cardRef.trim()) {
        alert('Please enter Card Transaction Reference');
        return;
    }

    const newOrder = {
      id: Date.now(),
      order_number: `ORD-${Date.now().toString().slice(-6)}`,
      table: selectedTable,
      customer: selectedCustomer,
      items: [...cart],
      subtotal,
      tax,
      discount: discountAmount,
      total,
      payment_method: activePayment,
      status: 'Paid',
      date: new Date().toLocaleString(),
      cash_received: activePayment === 'Cash' ? parseFloat(cashReceived) : null,
      change: activePayment === 'Cash' ? change : 0,
      card_ref: activePayment === 'Card' ? cardRef : null
    };

    setOrders([newOrder, ...orders]);
    setLastOrder(newOrder);
    setShowReceipt(true);
    
    if (selectedTable && selectedTable.id) {
      setTables(prev => prev.map(t => t.id === selectedTable.id ? { ...t, status: 'available' } : t));
    }
    
    setCart([]);
    setSelectedTable(null);
    setCashReceived('');
    setCardRef('');
    setDiscountAmount(0);
    setSelectedCustomer(mockCustomers[0]);
  };

  const applyDiscount = () => {
    if (discountCode.toUpperCase() === 'SAVE10') {
      setDiscountAmount(subtotal * 0.10);
      alert('✅ 10% Discount Applied!');
    } else if (discountCode.toUpperCase() === 'FLAT50') {
      setDiscountAmount(50);
      alert('✅ ₹50 Discount Applied!');
    } else {
      alert('❌ Invalid Coupon Code! Try SAVE10 or FLAT50');
      return;
    }
    setShowDiscountModal(false);
    setDiscountCode('');
  };

  const sendToKitchen = () => {
    alert(`🍳 Order sent to Kitchen!\n\nTable: ${selectedTable?.table_number || 'Takeaway'}\nItems:\n${cart.map(i => `• ${i.product_name} x${i.quantity}`).join('\n')}`);
  };

  // Render Helpers
  const renderTableSelection = () => (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Select a Table</h2>
      <div className="flex-1 overflow-y-auto grid grid-cols-3 gap-4 content-start">
        {tables.map(table => (
          <button
            key={table.id}
            onClick={() => setSelectedTable(table)}
            disabled={table.status === 'occupied'}
            className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all hover:shadow-md ${
              table.status === 'occupied' 
                ? 'bg-orange-50 border-orange-300 text-orange-800 cursor-not-allowed' 
                : 'bg-white border-gray-200 text-gray-700 hover:border-[#714B67]'
            }`}
          >
            <div className="text-3xl font-bold">{table.table_number}</div>
            <div className="text-sm font-medium">{table.seat_capacity} Seats</div>
            <div className={`text-xs font-semibold uppercase px-2 py-1 rounded-full ${
              table.status === 'occupied' ? 'bg-orange-200' : 'bg-green-100 text-green-800'
            }`}>
              {table.status}
            </div>
          </button>
        ))}
      </div>
      <button 
        onClick={() => setSelectedTable({ id: null, table_number: 'Takeaway' })} 
        className="mt-4 w-full py-3 bg-gray-100 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-200"
      >
        Takeaway / No Table
      </button>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-[#f6f6f6] font-inter text-gray-800 relative overflow-hidden">
      
      {/* Header */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-20 shadow-sm">
        <div className="flex items-center gap-6">
          <button className="bg-[#714B67] text-white font-bold px-6 py-2 rounded-md shadow-sm hover:bg-[#604058] transition-colors">
            Odoo Cafe POS
          </button>
          <div className="relative hidden md:block">
            <IconSearch className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-[#714B67] bg-gray-50" placeholder="Search products..." />
          </div>
        </div>

        <div className="flex items-center gap-5 text-gray-500">
          <IconPrinter size={22} className="cursor-pointer hover:text-[#714B67]" />
          <IconCircleX size={22} className="cursor-pointer hover:text-red-500" />
          <IconShare size={22} className="cursor-pointer hover:text-[#714B67]" />
          <IconWifi size={22} />
          <div className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1 text-xs font-semibold">
            <IconBattery3 size={16} /> 12 V
          </div>
          <div className="w-9 h-9 rounded-full bg-[#714B67] flex items-center justify-center font-bold text-white">@</div>
          <button onClick={() => setIsDrawerOpen(true)} className="p-2 hover:bg-gray-100 rounded-md">
            <IconMenu2 size={24} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex overflow-hidden">
        
        {/* Column 1: Products */}
        <div className="w-2/5 flex bg-white border-r border-gray-200">
          <div className="w-32 bg-gray-50 border-r border-gray-200 flex flex-col gap-2 p-3">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`py-2.5 px-3 rounded-md font-medium text-sm transition-all text-left ${
                  activeCategory === cat.id 
                    ? 'text-white shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
                style={activeCategory === cat.id ? { backgroundColor: cat.color } : {}}
              >
                {cat.name}
              </button>
            ))}
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto grid grid-cols-3 gap-4 content-start">
            {filteredProducts.map(product => (
              <button 
                key={product.id} 
                onClick={() => addToCart(product)}
                disabled={!product.is_available}
                className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md hover:border-[#714B67] cursor-pointer transition-all flex flex-col justify-between text-left disabled:opacity-50"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${product.is_available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm mb-1">{product.name}</h3>
                  <p className="text-[#714B67] font-bold text-lg">₹{product.price}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Column 2: Combined Cart & Payment */}
        <div className="flex-1 flex flex-col bg-white border-l border-gray-200 overflow-hidden">
          {!selectedTable ? (
            <div className="p-6 h-full overflow-y-auto">
              {renderTableSelection()}
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Panel Header */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedTable?.id ? `Table ${selectedTable.table_number}` : 'Takeaway Order'}
                </h2>
                <button onClick={() => setSelectedTable(null)} className="text-sm text-red-500 hover:underline">Change Table</button>
              </div>

              {/* Scrollable Cart Area */}
              <div className="flex-1 overflow-y-auto p-4">
                <ReusableCart 
                  cart={cart}
                  updateQuantity={updateQuantity}
                  removeFromCart={removeFromCart}
                  subtotal={subtotal}
                  tax={tax}
                  discountAmount={discountAmount}
                  total={total}
                  selectedCustomer={selectedCustomer}
                  onShowCustomerModal={() => setShowCustomerModal(true)}
                  onShowDiscountModal={() => setShowDiscountModal(true)}
                  onSendToKitchen={sendToKitchen}
                />
              </div>

              {/* Fixed Payment Area at Bottom */}
              <div className="p-4 bg-gray-50 border-t border-gray-200 max-h-[55%] overflow-y-auto">
                <ReusablePayment 
                  activePayment={activePayment}
                  setActivePayment={setActivePayment}
                  total={total}
                  cashReceived={cashReceived}
                  setCashReceived={setCashReceived}
                  change={change}
                  cardRef={cardRef}
                  setCardRef={setCardRef}
                  onConfirmPayment={handlePayment}
                  qrCodeUrl={qrCodeUrl}
                />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals (Discount, Customer, Receipt, Drawer) remain exactly the same... */}
      {showDiscountModal && (
        <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Apply Coupon Code</h3>
              <button onClick={() => setShowDiscountModal(false)}><IconX size={20} /></button>
            </div>
            <input 
              type="text" 
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              placeholder="Enter code (Try SAVE10 or FLAT50)" 
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-[#714B67] focus:outline-none"
              autoFocus
            />
            <button onClick={applyDiscount} className="w-full py-3 bg-[#714B67] text-white rounded-lg font-bold hover:bg-[#604058]">
              Apply Discount
            </button>
          </div>
        </div>
      )}

      {showCustomerModal && (
        <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Select Customer</h3>
              <button onClick={() => setShowCustomerModal(false)}><IconX size={20} /></button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              {mockCustomers.map(cust => (
                <button 
                  key={cust.id}
                  onClick={() => { setSelectedCustomer(cust); setShowCustomerModal(false); }}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedCustomer.id === cust.id ? 'border-[#714B67] bg-purple-50' : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <p className="font-semibold">{cust.name}</p>
                  {cust.phone && <p className="text-xs text-gray-500">{cust.phone}</p>}
                </button>
              ))}
            </div>
            <button onClick={() => setShowCustomerModal(false)} className="w-full py-3 bg-gray-100 rounded-lg font-bold hover:bg-gray-200">
              Close
            </button>
          </div>
        </div>
      )}

      {showReceipt && lastOrder && (
        <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconCheck size={40} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Payment Successful!</h2>
              <p className="text-gray-500">{lastOrder.order_number}</p>
            </div>

            <div className="border-t border-b border-gray-200 py-4 mb-4 space-y-2">
              {lastOrder.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{item.product_name} x{item.quantity}</span>
                  <span>₹{item.line_total.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{lastOrder.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>₹{lastOrder.tax.toFixed(2)}</span></div>
              {lastOrder.discount > 0 && (
                <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{lastOrder.discount.toFixed(2)}</span></div>
              )}
              <div className="flex justify-between font-bold text-lg"><span>Total</span><span>₹{lastOrder.total.toFixed(2)}</span></div>
              {lastOrder.payment_method === 'Cash' && (
                <>
                  <div className="flex justify-between text-sm"><span>Cash Received</span><span>₹{lastOrder.cash_received.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm text-green-600"><span>Change</span><span>₹{lastOrder.change.toFixed(2)}</span></div>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => { alert('Receipt printed!'); setShowReceipt(false); }}
                className="py-3 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200"
              >
                Print
              </button>
              <button 
                onClick={() => { alert(`Receipt sent to ${lastOrder.customer.email || 'Walk-in Customer'}!`); setShowReceipt(false); }}
                className="py-3 bg-[#714B67] text-white rounded-lg font-semibold hover:bg-[#604058]"
              >
                Email
              </button>
            </div>
          </div>
        </div>
      )}

      {isDrawerOpen && (
        <>
          <div className="absolute inset-0 bg-black bg-opacity-30 z-30" onClick={() => setIsDrawerOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-xl z-40 p-6">
            <div className="flex justify-between items-center mb-6 pb-4 border-b">
              <h2 className="text-xl font-bold text-[#714B67]">Menu</h2>
              <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-gray-100 rounded-md">
                <IconX size={20} />
              </button>
            </div>
            {['Products', 'Category', 'Payment Method', 'Coupons', 'Bookings', 'Employees', 'KDS', 'Reports', 'Log-Out'].map(link => (
              <button key={link} className="w-full text-left px-4 py-3 rounded-md font-medium hover:bg-purple-50 hover:text-[#714B67]">
                {link}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}