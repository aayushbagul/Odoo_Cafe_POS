import { useState, useEffect } from 'react';
import SharedHeader from './SharedHeader';
import SharedDrawer from './SharedDrawer';
import { 
  IconMenu2, IconSearch, IconRefresh, IconUserCircle, 
  IconX, IconCheck, IconClock, IconAlertCircle, IconLoader,
  IconChefHat, IconFlame, IconChecklist, IconList
} from '@tabler/icons-react';

const API_BASE_URL = "http://localhost:8000/api";

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 
                  type === 'error' ? 'bg-red-500' : 'bg-blue-500';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-3 animate-slide-in`}>
      {type === 'success' && <IconCheck size={20} />}
      {type === 'error' && <IconAlertCircle size={20} />}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <IconX size={16} />
      </button>
    </div>
  );
};

export default function KDS() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ all: 0, to_cook: 0, preparing: 0, completed: 0 });
  
  const [activeTab, setActiveTab] = useState('to_cook');
  const [searchQuery, setSearchQuery] = useState('');
  const [productFilter, setProductFilter] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Fetch data
  useEffect(() => {
    fetchKDSData();
    const interval = setInterval(fetchKDSData, 10000);
    return () => clearInterval(interval);
  }, [activeTab, productFilter, categoryFilter]);

  const fetchKDSData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [ordersRes, productsRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/kds/orders?status=${activeTab}${productFilter ? `&product_filter=${encodeURIComponent(productFilter)}` : ''}${categoryFilter ? `&category_filter=${encodeURIComponent(categoryFilter)}` : ''}`),
        fetch(`${API_BASE_URL}/kds/products`),
        fetch(`${API_BASE_URL}/kds/stats`)
      ]);

      if (!ordersRes.ok || !productsRes.ok || !statsRes.ok) {
        throw new Error('Failed to fetch data from server');
      }

      const [ordersData, productsData, statsData] = await Promise.all([
        ordersRes.json(),
        productsRes.json(),
        statsRes.json()
      ]);

      setOrders(ordersData);
      setProducts(productsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error fetching KDS data:", error);
      setError('Unable to load orders. Please check your connection.');
      showToast('Failed to load data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/kds/orders/${orderId}/status?kds_status=${newStatus}`, {
        method: 'PATCH'
      });
      
      if (response.ok) {
        showToast(`Order marked as ${newStatus.replace('_', ' ')}`, 'success');
        fetchKDSData();
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      showToast('Failed to update order', 'error');
    }
  };

  const handleItemStatusToggle = async (itemId, currentStatus) => {
    const newStatus = currentStatus === 'pending' ? 'prepared' : 'pending';
    
    // Optimistic update
    setOrders(orders.map(order => ({
      ...order,
      items: order.items.map(item => 
        item.id === itemId ? { ...item, item_status: newStatus } : item
      )
    })));
    
    try {
      const response = await fetch(`${API_BASE_URL}/kds/items/${itemId}/status?item_status=${newStatus}`, {
        method: 'PATCH'
      });
      
      if (!response.ok) {
        throw new Error('Failed to update item status');
      }
      
      showToast(`Item marked as ${newStatus}`, 'success');
    } catch (error) {
      console.error("Error updating item status:", error);
      showToast('Failed to update item', 'error');
      fetchKDSData(); // Revert on error
    }
  };

  const clearFilters = () => {
    setProductFilter(null);
    setCategoryFilter(null);
    showToast('Filters cleared', 'info');
  };

  const categories = [...new Set(products.map(p => p.category_name).filter(Boolean))];

  const getTabCount = (tab) => {
    return stats[tab] || 0;
  };

  const getTabColor = (tab) => {
    switch(tab) {
      case 'to_cook': return 'bg-red-50 text-red-700 border-red-300';
      case 'preparing': return 'bg-orange-50 text-orange-700 border-orange-300';
      case 'completed': return 'bg-green-50 text-green-700 border-green-300';
      default: return 'bg-gray-50 text-gray-700 border-gray-300';
    }
  };

  const getTabActiveColor = (tab) => {
    switch(tab) {
      case 'to_cook': return 'bg-red-100 text-red-800 border-red-400 shadow-sm';
      case 'preparing': return 'bg-orange-100 text-orange-800 border-orange-400 shadow-sm';
      case 'completed': return 'bg-green-100 text-green-800 border-green-400 shadow-sm';
      default: return 'bg-gray-100 text-gray-800 border-gray-400 shadow-sm';
    }
  };

  const getItemColor = (status) => {
    return status === 'prepared' ? 'line-through text-gray-400' : 'text-gray-800';
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Shared Header */}
      <SharedHeader 
        onMenuClick={() => setIsDrawerOpen(true)}
        showSearch={false} // KDS doesn't need the search bar in header
      />

      {/* Main Content */}
      <div className="flex h-[calc(100vh-65px)]">
        {/* Left Sidebar - Filters */}
        <aside className={`
          fixed lg:relative inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 p-4 overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:w-64
        `}>
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
            <h2 className="font-bold text-gray-800 text-lg">Filters</h2>
            <button 
              onClick={clearFilters} 
              className="text-sm text-[#714B67] hover:text-[#5a3b52] font-medium flex items-center gap-1"
            >
              <IconX size={14} />
              Clear
            </button>
          </div>

          {/* Product Filter */}
          <div className="mb-6">
            <h3 className="font-semibold text-sm text-gray-700 mb-2 bg-[#714B67]/10 text-[#714B67] px-3 py-1.5 rounded">
              Product
            </h3>
            <div className="space-y-1 mt-2">
              {products.length === 0 ? (
                <p className="text-sm text-gray-400 px-2 py-1">No products available</p>
              ) : (
                products.map(product => (
                  <button
                    key={product.id}
                    onClick={() => setProductFilter(productFilter === product.name ? null : product.name)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                      productFilter === product.name 
                        ? 'bg-[#714B67] text-white shadow-sm' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {product.name}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-2 bg-[#714B67]/10 text-[#714B67] px-3 py-1.5 rounded">
              Category
            </h3>
            <div className="space-y-1 mt-2">
              {categories.length === 0 ? (
                <p className="text-sm text-gray-400 px-2 py-1">No categories available</p>
              ) : (
                categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setCategoryFilter(categoryFilter === category ? null : category)}
                    className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                      categoryFilter === category 
                        ? 'bg-[#714B67] text-white shadow-sm' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {category}
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {isDrawerOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsDrawerOpen(false)}
          />
        )}

        {/* Main KDS Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs & Search */}
          <div className="bg-white border-b border-gray-200 p-3 lg:p-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              {/* Status Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 lg:px-4 py-2 rounded-lg font-semibold text-xs lg:text-sm border transition-all whitespace-nowrap ${
                    activeTab === 'all' 
                      ? 'bg-[#714B67] text-white border-[#714B67] shadow-sm' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <IconList size={16} className="inline mr-1" />
                  ALL
                  <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {stats.all}
                  </span>
                </button>
                
                {[
                  { key: 'to_cook', label: 'TO COOK', icon: IconFlame },
                  { key: 'preparing', label: 'PREPARING', icon: IconChefHat },
                  { key: 'completed', label: 'COMPLETED', icon: IconChecklist }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`px-3 lg:px-4 py-2 rounded-lg font-semibold text-xs lg:text-sm border transition-all whitespace-nowrap ${
                      activeTab === key 
                        ? getTabActiveColor(key)
                        : getTabColor(key)
                    }`}
                  >
                    <Icon size={16} className="inline mr-1" />
                    {label}
                    <span className="ml-2 px-2 py-0.5 bg-white/50 rounded-full text-xs">
                      {getTabCount(key)}
                    </span>
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative flex-shrink-0">
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg w-full lg:w-64 focus:outline-none focus:ring-2 focus:ring-[#714B67]/50 focus:border-[#714B67]"
                />
                <IconSearch className="absolute right-3 top-2.5 text-gray-400" size={18} />
              </div>
            </div>
          </div>

          {/* Order Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
            {orders.map(order => (
              <div
                key={order.id}
                className={`bg-white rounded-xl shadow-md border-2 p-4 lg:p-5 transition-all ${
                  order.kds_status === 'to_cook' ? 'border-red-300' :
                  order.kds_status === 'preparing' ? 'border-orange-300' :
                  'border-green-300'
                }`}
              >
                {/* Order Header */}
                <div className="flex justify-between items-start mb-3 gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="text-xl lg:text-2xl font-bold text-gray-800 truncate"
                      title={order.order_number}
                    >
                      #{order.order_number}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {getTimeAgo(order.created_at)}
                    </p>
                  </div>
                  
                  <span className={`flex-shrink-0 px-2 py-1 rounded-lg text-xs font-bold uppercase whitespace-nowrap ${
                    order.kds_status === 'to_cook' ? 'bg-red-100 text-red-700' :
                    order.kds_status === 'preparing' ? 'bg-orange-100 text-orange-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {order.kds_status.replace('_', ' ')}
                  </span>
                </div>

                {/* Table Info */}
                <div className="bg-gray-50 rounded-lg p-2 mb-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Table:</span>
                    <span className="font-bold text-gray-800">{order.table_number}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600">Items:</span>
                    <span className="font-bold text-gray-800">{order.items.length}</span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-2 mb-4">
                  {order.items.map(item => (
                    <div
                      key={item.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemStatusToggle(item.id, item.item_status);
                      }}
                      className={`flex justify-between items-center p-2 rounded-lg cursor-pointer transition-all ${
                        item.item_status === 'prepared' 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      <span className={`font-medium text-sm ${getItemColor(item.item_status)}`}>
                        <span className="font-bold">{item.quantity}x</span> {item.product_name}
                      </span>
                      {item.item_status === 'prepared' && (
                        <IconCheck size={18} className="text-green-600 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Stage-Specific Action Buttons */}
                <div className="space-y-2">
                  {order.kds_status === 'to_cook' && (
                    <button
                      onClick={() => handleOrderStatusChange(order.id, 'preparing')}
                      className="w-full py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      <IconChefHat size={20} />
                      Start Preparing
                    </button>
                  )}

                  {order.kds_status === 'preparing' && (
                    <button
                      onClick={() => handleOrderStatusChange(order.id, 'completed')}
                      className="w-full py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      <IconCheck size={20} />
                      Mark as Completed
                    </button>
                  )}

                  {order.kds_status === 'completed' && (
                    <div className="w-full py-3 bg-green-100 text-green-700 rounded-lg font-bold text-center flex items-center justify-center gap-2">
                      <IconCheck size={20} />
                      Order Ready
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
      {/* Shared Drawer */}
      <SharedDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activePage="kds"
        onOpenProductManager={() => navigate('/pos')} // Navigate to POS for product management
        onOpenCategoryManager={() => navigate('/pos')}
        onOpenCouponManager={() => navigate('/pos')}
        onOpenReports={() => navigate('/pos')}
      />
    </div>
  );
}