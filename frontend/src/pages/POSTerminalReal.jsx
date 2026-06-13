import { useState, useEffect } from 'react';
import ProductManager from '../components/ProductManager';
import { 
  IconSearch, IconPrinter, IconCircleX, IconShare, IconWifi, IconBattery3, 
  IconMenu2, IconRefresh, IconUserCircle, IconDiscount2, IconSend, 
  IconDeviceMobile, IconCreditCard, IconX, IconTrash, IconCheck, IconCash,
  IconShoppingCart 
} from '@tabler/icons-react';

const API_BASE_URL = "http://localhost:8000/api";

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

      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2 text-sm shadow-sm">
        <div className="flex justify-between"><span>Sub total</span><span>₹{subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>Tax (18%)</span><span>₹{tax.toFixed(2)}</span></div>
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

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-center shadow-sm">
        <p className="text-3xl font-bold text-gray-800">Amount ₹{total.toFixed(2)}</p>
        <p className="text-sm text-gray-500 font-semibold mt-1 uppercase tracking-wider">{activePayment}</p>
      </div>

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
  // State
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [tables, setTables] = useState([]);
  const [customers, setCustomers] = useState([]);
  
  const [activeCategory, setActiveCategory] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [cart, setCart] = useState([]);
  const [activePayment, setActivePayment] = useState('Cash');
  const [cashReceived, setCashReceived] = useState('');
  const [cardRef, setCardRef] = useState('');
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const defaultCustomer = { id: null, name: 'Walk-in Customer', email: '', phone: '' };
  const [selectedCustomer, setSelectedCustomer] = useState(defaultCustomer);

  const [showProductManager, setShowProductManager] = useState(false);

  // Mobile Responsive State
  const [showMobileCartModal, setShowMobileCartModal] = useState(false);

  // Fetch Data from Backend
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    await Promise.all([
      fetchCategories(),
      fetchProducts(),
      fetchTables(),
      fetchCustomers()
    ]);
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/products/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        if (data.length > 0 && !activeCategory) setActiveCategory(data[0].id);
      }
    } catch (err) { console.error("Error fetching categories", err); }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      if (res.ok) setProducts(await res.json());
    } catch (err) { console.error("Error fetching products", err); }
  };

  const fetchTables = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/tables`);
      if (res.ok) setTables(await res.json());
    } catch (err) { console.error("Error fetching tables", err); }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/customers`);
      if (res.ok) setCustomers(await res.json());
    } catch (err) { console.error("Error fetching customers", err); }
  };

  // Derived Values
  const filteredProducts = activeCategory ? products.filter(p => p.category_id === activeCategory) : products;
  const subtotal = cart.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const tax = subtotal * 0.18; 
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
        unit_price: parseFloat(product.price),
        line_total: parseFloat(product.price)
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

  // API Order Functions
  const handlePayment = async () => {
    if (cart.length === 0) return;
    if (activePayment === 'Cash' && parseFloat(cashReceived) < total) return;
    if (activePayment === 'Card' && !cardRef.trim()) {
        alert('Please enter Card Transaction Reference');
        return;
    }

    const orderData = {
      table_id: selectedTable?.id || null,
      customer_id: selectedCustomer.id || null,
      status: "paid",
      payment_method: activePayment.toLowerCase(),
      items: cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      }))
    };

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const newOrder = await response.json();
        
        const receiptOrder = {
          id: newOrder.id,
          order_number: newOrder.order_number,
          table: selectedTable,
          customer: selectedCustomer,
          items: cart, 
          subtotal: parseFloat(newOrder.subtotal),
          tax: parseFloat(newOrder.tax),
          discount: discountAmount,
          total: parseFloat(newOrder.total) - discountAmount,
          payment_method: activePayment,
          status: 'Paid',
          date: new Date().toLocaleString(),
          cash_received: activePayment === 'Cash' ? parseFloat(cashReceived) : null,
          change: activePayment === 'Cash' ? change : 0,
          card_ref: activePayment === 'Card' ? cardRef : null
        };
        
        setLastOrder(receiptOrder);
        setShowReceipt(true);
        setShowMobileCartModal(false); // Close mobile modal
        
        setCart([]);
        setSelectedTable(null);
        setCashReceived('');
        setCardRef('');
        setDiscountAmount(0);
        setSelectedCustomer(defaultCustomer);
        fetchTables(); 
      } else {
        const error = await response.json();
        alert(error.detail || "Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Server error while creating order");
    }
  };

  const sendToKitchen = async () => {
    if (cart.length === 0) return;
    
    const orderData = {
      table_id: selectedTable?.id || null,
      customer_id: selectedCustomer.id || null,
      status: "draft",
      items: cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      }))
    };

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        alert(`🍳 Order sent to Kitchen!`);
        setShowMobileCartModal(false); // Close mobile modal
        setCart([]);
        setSelectedTable(null);
        fetchTables();
      } else {
        const error = await response.json();
        alert(error.detail || "Failed to send to kitchen");
      }
    } catch (error) {
      console.error("Error sending to kitchen:", error);
      alert("Server error");
    }
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

  const handlePrintReceipt = () => {
    if (!lastOrder) return;
    // Opens the PDF in a new tab
    const receiptUrl = `${API_BASE_URL}/orders/${lastOrder.id}/receipt`;
    window.open(receiptUrl, '_blank');
  };

  // Render Helpers
  const renderTableSelection = () => (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Select a Table</h2>
      <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-4 content-start">
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
            <div className="text-2xl lg:text-3xl font-bold">{table.table_number}</div>
            <div className="text-xs lg:text-sm font-medium">{table.seats} Seats</div>
            <div className={`text-[10px] lg:text-xs font-semibold uppercase px-2 py-1 rounded-full ${
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
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 z-20 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-2 lg:gap-6">
          <button className="bg-[#714B67] text-white font-bold px-3 lg:px-6 py-2 rounded-md shadow-sm hover:bg-[#604058] transition-colors text-sm lg:text-base">
            Odoo Cafe
          </button>
          <div className="relative hidden md:block">
            <IconSearch className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-48 lg:w-64 focus:outline-none focus:ring-2 focus:ring-[#714B67] bg-gray-50" placeholder="Search..." />
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-5 text-gray-500">
          {/* <IconPrinter size={20} className="cursor-pointer hover:text-[#714B67] hidden sm:block" />
          <IconCircleX size={20} className="cursor-pointer hover:text-red-500 hidden sm:block" />
          <IconShare size={20} className="cursor-pointer hover:text-[#714B67] hidden sm:block" />
          <IconWifi size={20} className="hidden md:block" />
          <div className="hidden md:flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1 text-xs font-semibold">
            <IconBattery3 size={16} /> 12 V
          </div>
          <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-[#714B67] flex items-center justify-center font-bold text-white text-sm">@</div> */}
          <button onClick={() => setIsDrawerOpen(true)} className="p-2 hover:bg-gray-100 rounded-md">
            <IconMenu2 size={22} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        
        {/* COLUMN 1: PRODUCTS (Left) */}
        <div className="w-full lg:w-1/2 h-full flex flex-col bg-white lg:border-r border-gray-200">
          {!selectedTable ? (
            <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
              {renderTableSelection()}
            </div>
          ) : (
            <>
              {/* Mobile Categories (Horizontal Scroll) */}
              <div className="lg:hidden flex overflow-x-auto border-b border-gray-200 p-2 gap-2 bg-gray-50 flex-shrink-0">
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${activeCategory === cat.id ? 'bg-[#714B67] text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200'}`}>
                    {cat.name}
                  </button>
                ))}
              </div>

              <div className="flex-1 flex overflow-hidden">
                {/* Desktop Categories (Sidebar) */}
                <div className="hidden lg:flex w-32 bg-gray-50 border-r border-gray-200 flex-col gap-2 p-3 overflow-y-auto flex-shrink-0">
                  {categories.map(cat => (
                    <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`py-2.5 px-3 rounded-md font-medium text-sm transition-all text-left ${activeCategory === cat.id ? 'bg-[#714B67] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-200'}`}>
                      {cat.name}
                    </button>
                  ))}
                </div>
                
                {/* Products Grid */}
                <div className="flex-1 p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-4 content-start pb-24 lg:pb-4">
                  {filteredProducts.map(product => (
                    <button 
                      key={product.id} 
                      onClick={() => addToCart(product)}
                      disabled={!product.is_available}
                      className="border border-gray-200 rounded-lg p-3 lg:p-4 bg-white hover:shadow-md hover:border-[#714B67] cursor-pointer transition-all flex flex-col justify-between text-left disabled:opacity-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${product.is_available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 text-xs lg:text-sm mb-1 line-clamp-2">{product.name}</h3>
                        <p className="text-[#714B67] font-bold text-base lg:text-lg">₹{parseFloat(product.price).toFixed(2)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* COLUMN 2: CART / ITEM LIST (Middle - Desktop Only) */}
        <div className="hidden lg:flex lg:w-1/4 flex-col bg-gray-50 border-r border-gray-200">
          {selectedTable ? (
            <>
              <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center flex-shrink-0">
                <h2 className="text-lg font-bold text-gray-800">Table {selectedTable.table_number}</h2>
                <button onClick={() => setSelectedTable(null)} className="text-xs text-red-500 hover:underline">Change</button>
              </div>
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
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 p-4 text-center">
              <div>
                <IconShoppingCart size={40} className="mx-auto mb-2 opacity-50" />
                <p className="font-medium">Select a table to start</p>
              </div>
            </div>
          )}
        </div>

        {/* COLUMN 3: PAYMENT (Right - Desktop Only) */}
        <div className="hidden lg:flex lg:w-1/4 flex-col bg-white">
          {selectedTable ? (
            <div className="flex-1 overflow-y-auto p-4">
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
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 p-4 text-center">
              <p className="font-medium">No active order</p>
            </div>
          )}
        </div>

        {/* MOBILE: Sticky Bottom Bar */}
        {selectedTable && !showMobileCartModal && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-20">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-gray-500">Table {selectedTable.table_number} • {cart.length} items</p>
                <p className="font-bold text-xl text-[#714B67]">₹{total.toFixed(2)}</p>
              </div>
              <button onClick={() => setShowMobileCartModal(true)} className="px-6 py-3 bg-[#714B67] text-white rounded-lg font-bold shadow-md flex items-center gap-2">
                <IconShoppingCart size={20} /> View Cart
              </button>
            </div>
          </div>
        )}

        {/* MOBILE: Fullscreen Cart & Payment Modal */}
        {showMobileCartModal && (
          <div className="lg:hidden fixed inset-0 bg-white z-50 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-800">Table {selectedTable?.table_number}</h2>
              <button onClick={() => setShowMobileCartModal(false)} className="p-2 hover:bg-gray-200 rounded-full">
                <IconX size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
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

            <div className="p-4 border-t border-gray-200 bg-white max-h-[60%] overflow-y-auto flex-shrink-0">
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

      </main>

      {/* Modals (Discount, Customer, Receipt, Drawer) */}
      {showDiscountModal && (
        <div className="absolute inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
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
        <div className="absolute inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Select Customer</h3>
              <button onClick={() => setShowCustomerModal(false)}><IconX size={20} /></button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
              <button 
                onClick={() => { setSelectedCustomer(defaultCustomer); setShowCustomerModal(false); }}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedCustomer.id === null ? 'border-[#714B67] bg-purple-50' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <p className="font-semibold">Walk-in Customer</p>
              </button>
              {customers.map(cust => (
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
        <div className="absolute inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
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
                onClick={handlePrintReceipt}
                className="py-3 bg-gray-100 rounded-lg font-semibold hover:bg-gray-200 flex items-center justify-center gap-2"
              >
                <IconPrinter size={18} /> Print
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
              {/* Updated Menu Items */}
              <button 
                onClick={() => { setIsDrawerOpen(false); setShowProductManager(true); }} 
                className="w-full text-left px-4 py-3 rounded-md font-medium hover:bg-purple-50 hover:text-[#714B67]"
              >
                Products
              </button>
            {['Category', 'Payment Method', 'Coupons', 'Bookings', 'Employees', 'KDS', 'Reports', 'Log-Out'].map(link => (
              <button key={link} className="w-full text-left px-4 py-3 rounded-md font-medium hover:bg-purple-50 hover:text-[#714B67]">
                {link}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Render the Product Manager Modal at the very bottom of the component */}
      {showProductManager && <ProductManager onClose={() => setShowProductManager(false)} />}
    </div>
  );
}