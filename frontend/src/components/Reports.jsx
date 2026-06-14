import React, { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Reports = () => {
  const API_BASE_URL = "http://localhost:8000/api";
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch orders dynamically from backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Adjust the endpoint if your backend uses a different URL
        const response = await fetch(`${API_BASE_URL}/orders`);
        if (!response.ok) throw new Error("Failed to fetch orders");
        const data = await response.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Calculate Core Metrics
  const totalOrders = orders.length;
  // Adjust 'paid' or 'completed' based on your backend's actual status strings
  const paidOrders = orders.filter(o => o.status === 'paid' || o.status === 'completed').length;
  const unpaidOrders = totalOrders - paidOrders;

  const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Group orders by date for Line Graph (Last 7 Days)
  const lineGraphData = useMemo(() => {
    const grouped = {};
    const today = new Date();
    
    // Initialize last 7 days to ensure all days show on the graph
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      grouped[dateStr] = { date: dateStr, revenue: 0, count: 0 };
    }

    orders.forEach(order => {
      // Adjust 'created_at' if your backend uses a different date field name
      const orderDate = new Date(order.created_at || order.date).toISOString().split('T')[0];
      if (grouped[orderDate]) {
        grouped[orderDate].revenue += parseFloat(order.total) || 0;
        grouped[orderDate].count += 1;
      }
    });

    return Object.values(grouped).map(day => ({
      ...day,
      revenue: parseFloat(day.revenue.toFixed(2)),
      avgOrderValue: day.count > 0 ? parseFloat((day.revenue / day.count).toFixed(2)) : 0,
      displayDate: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }));
  }, [orders]);

  // Pie Chart Data (Paid vs Unpaid to make a complete 100% circle)
  const pieData = [
    { name: "Paid Orders", value: paidOrders },
    { name: "Unpaid/Pending", value: unpaidOrders },
  ];

  // Matching your Odoo theme colors
  const COLORS = ["#714B67", "#e6e9ed"]; 

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">Loading Reports...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-500">Error: {error}</div>;

  return (
    <div className="p-6 bg-[#f6f6f6] min-h-screen font-inter">
      <h1 className="text-2xl font-bold text-[#714B67] mb-6">Sales & Orders Reports</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-500 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-800">₹{totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-500 text-sm">Avg Order Value</p>
          <p className="text-2xl font-bold text-gray-800">₹{avgOrderValue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-500 text-sm">Total Orders</p>
          <p className="text-2xl font-bold text-gray-800">{totalOrders}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-500 text-sm">Paid Orders</p>
          <p className="text-2xl font-bold text-emerald-600">{paidOrders}</p>
        </div>
      </div>

      {/* Charts Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Graph: Revenue & Avg Order Value */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Revenue & Avg Order Value (Last 7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineGraphData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6e9ed" />
              <XAxis dataKey="displayDate" stroke="#8884d8" fontSize={12} />
              <YAxis yAxisId="left" stroke="#714B67" fontSize={12} />
              <YAxis yAxisId="right" orientation="right" stroke="#604058" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc", borderRadius: "8px" }}
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stroke="#714B67"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Total Revenue (₹)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgOrderValue"
                stroke="#604058"
                strokeWidth={2}
                dot={{ r: 4 }}
                name="Avg Order Value (₹)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart: Order Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Status Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Reports;