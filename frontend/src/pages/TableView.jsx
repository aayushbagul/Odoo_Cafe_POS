import React, { useState } from "react";
import { 
  IconMenu2, 
  IconUser, 
  IconSearch, 
  IconShoppingCart, 
  IconClipboardList, 
  IconUsersGroup, 
  IconChevronDown, 
  IconUsers,
  IconX
} from "@tabler/icons-react";

const TableView = () => {
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState("Floor 1");

  // Generate 16 tables. Table 12 is 'occupied' to match your wireframe.
  const tables = Array.from({ length: 16 }, (_, i) => ({
    id: i + 1,
    seats: Math.floor(Math.random() * 4) + 2, // Random seats between 2 and 5
    status: i + 1 === 12 ? "occupied" : "available",
  }));

  const handleTableClick = (table) => {
    setSelectedTable(table);
    // In a real app, this would navigate to the Order View for this table
    console.log(`Opening Order View for Table ${table.id}`);
  };

  return (
    <div className="min-h-screen bg-[#f6f6f6] font-sans flex flex-col">
      
      {/* ==========================================
          3.1 Top Navigation Bar 
      ========================================== */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Left: Logo & Nav Links */}
          <div className="flex items-center gap-6">
            <div className="bg-[#714B67] text-white px-4 py-2 rounded-lg font-bold text-lg">
              Odoo POS
            </div>
            
            <nav className="hidden md:flex items-center gap-1">
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                POS Order
              </button>
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                Orders
              </button>
              <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                Customer
              </button>
              <button className="px-4 py-2 bg-[#714B67]/10 text-[#714B67] rounded-lg font-semibold transition-colors">
                Table View
              </button>
            </nav>
          </div>

          {/* Center: Product Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#714B67]/50 focus:border-[#714B67]"
              />
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Right: Current Table, Employee, Hamburger */}
          <div className="flex items-center gap-3">
            {/* Current Table Indicator */}
            <div className="hidden sm:flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg border border-gray-200">
              <IconShoppingCart className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Table 12</span>
            </div>

            {/* Employee Icon */}
            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
              <IconUser className="w-5 h-5" />
            </button>

            {/* Hamburger Menu */}
            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
              <IconMenu2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* ==========================================
          3.2 Floor Pop-up / Table View Main Area
      ========================================== */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        
        {/* Floor Selector (The "₹ 12 V" from wireframe interpreted as Floor Dropdown) */}
        <div className="w-full max-w-4xl mb-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Table View</h1>
          
          <button className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
            <span className="font-semibold text-gray-700">{selectedFloor}</span>
            <IconChevronDown className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Table Grid */}
        {/* Using two blocks to create the "aisle" gap seen in the wireframe */}
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 w-full max-w-4xl">
          <div className="flex justify-center gap-12">
            
            {/* Left Block (Tables 1-8) */}
            <div className="grid grid-cols-2 gap-4">
              {tables.slice(0, 8).map((table) => (
                <TableCard 
                  key={table.id} 
                  table={table} 
                  isSelected={selectedTable?.id === table.id}
                  onClick={() => handleTableClick(table)} 
                />
              ))}
            </div>

            {/* Right Block (Tables 9-16) */}
            <div className="grid grid-cols-2 gap-4">
              {tables.slice(8, 16).map((table) => (
                <TableCard 
                  key={table.id} 
                  table={table} 
                  isSelected={selectedTable?.id === table.id}
                  onClick={() => handleTableClick(table)} 
                />
              ))}
            </div>

          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-200 border border-gray-300"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100 border-2 border-red-400"></div>
            <span>Occupied / Active Order</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#714B67] border-2 border-[#714B67]"></div>
            <span>Selected</span>
          </div>
        </div>
      </main>
    </div>
  );
};

// Reusable Table Card Component
const TableCard = ({ table, isSelected, onClick }) => {
  const isOccupied = table.status === "occupied";

  // Determine styles based on state
  let bgClass = "bg-gray-100 border-gray-200 hover:border-gray-400 text-gray-700";
  if (isOccupied) {
    bgClass = "bg-red-50 border-red-400 text-red-700"; // Matches wireframe's Table 12
  }
  if (isSelected) {
    bgClass = "bg-[#714B67] border-[#714B67] text-white"; // Odoo primary color for selection
  }

  return (
    <button
      onClick={onClick}
      className={`
        w-24 h-24 rounded-xl border-2 flex flex-col items-center justify-center 
        transition-all duration-200 shadow-sm hover:shadow-md
        ${bgClass}
      `}
    >
      <span className="text-2xl font-bold">{table.id}</span>
      <div className="flex items-center gap-1 mt-1 opacity-80">
        <IconUsers className="w-3.5 h-3.5" />
        <span className="text-xs font-medium">{table.seats} seats</span>
      </div>
    </button>
  );
};

export default TableView;