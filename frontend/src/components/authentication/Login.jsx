import React from "react";
import odooLogo from "../../assets/odoo.svg";

const Login = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#f6f6f6] px-4">
      {/* Logo */}
      <img src={odooLogo} alt="Odoo Logo" className="h-12 mb-6" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-center text-2xl font-semibold text-[#714B67] mb-6">
          Login
        </h1>

        <form className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Email / Username</label>
            <input
              type="text"
              placeholder="Enter email or username"
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#714B67]"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#714B67]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#714B67] text-white py-3 rounded-md hover:bg-[#604058]"
          >
            Login
          </button>

          <button
            type="button"
            className="w-full border border-[#714B67] text-[#714B67] py-3 rounded-md hover:bg-[#f5f0f4]"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
