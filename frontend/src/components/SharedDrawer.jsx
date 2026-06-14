import { IconX } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function SharedDrawer({ 
  isOpen, 
  onClose, 
  activePage = 'dashboard',
  onOpenProductManager,
  onOpenCategoryManager,
  onOpenCouponManager,
  onOpenReports
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'POS Terminal', path: '/dashboard', icon: '🛒', page: 'dashboard' },
    { label: 'Kitchen Display', path: '/kds', icon: '👨‍🍳', page: 'kds' },
    { label: 'Products', action: 'products', icon: '📦' },
    { label: 'Category', action: 'category', icon: '📂' },
    { label: 'Coupons', action: 'coupons', icon: '🎟️' },
    { label: 'Reports', action: 'reports', icon: '📊' },
    { label: 'Log-Out', action: 'logout', icon: '🚪' }
  ];

  const handleItemClick = (item) => {
    if (item.path) {
      navigate(item.path);
      onClose();
    } else if (item.action === 'products' && onOpenProductManager) {
      onOpenProductManager();
      onClose();
    } else if (item.action === 'category' && onOpenCategoryManager) {
      onOpenCategoryManager();
      onClose();
    } else if (item.action === 'coupons' && onOpenCouponManager) {
      onOpenCouponManager();
      onClose();
    } else if (item.action === 'reports' && onOpenReports) {
      onOpenReports();
      onClose();
    } else if (item.action === 'logout') {
      localStorage.removeItem('token');
      navigate('/login');
      onClose();
    } else {
      alert(`${item.label} - Coming soon!`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 z-30" 
        onClick={onClose} 
      />
      <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-gray-200 shadow-xl z-40 p-6">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <h2 className="text-xl font-bold text-[#714B67]">Menu</h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <IconX size={20} />
          </button>
        </div>
        
        <div className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleItemClick(item)}
              className={`w-full text-left px-4 py-3 rounded-md font-medium transition-colors flex items-center gap-3 ${
                (item.path && location.pathname === item.path) || 
                (item.page && activePage === item.page)
                  ? 'bg-purple-50 text-[#714B67]'
                  : 'hover:bg-purple-50 hover:text-[#714B67]'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}