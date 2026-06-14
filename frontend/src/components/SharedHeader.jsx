import { 
  IconSearch, IconMenu2 
} from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function SharedHeader({ onMenuClick, showSearch = true }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = () => {
    // Navigate to POS Terminal (dashboard)
    navigate('/pos');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 z-20 shadow-sm flex-shrink-0">
      <div className="flex items-center gap-2 lg:gap-6">
        <button 
          onClick={handleLogoClick}
          className="bg-[#714B67] text-white font-bold px-3 lg:px-6 py-2 rounded-md shadow-sm hover:bg-[#604058] transition-colors text-sm lg:text-base"
        >
          Odoo Cafe
        </button>
        
        {showSearch && (
          <div className="relative hidden md:block">
            <IconSearch className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input 
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-48 lg:w-64 focus:outline-none focus:ring-2 focus:ring-[#714B67] bg-gray-50" 
              placeholder="Search..." 
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 lg:gap-5 text-gray-500">
        <button 
          onClick={onMenuClick} 
          className="p-2 hover:bg-gray-100 rounded-md"
        >
          <IconMenu2 size={22} />
        </button>
      </div>
    </header>
  );
}