import React from "react";
import odooLogo from "../../assets/odoo.svg";

const Signup = () => {
  return (
    <div className="min-h-screen font-inter flex justify-center items-center bg-[#f6f6f6] px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-center mb-4">
          <img
            src={odooLogo}
            alt="Odoo Logo"
            className="h-10 object-contain"
          />
        </div>
        <div className="text-center mb-3">
          <h1 className="text-xl font-bold text-[#714B67]">
            Sign Up
          </h1>
          <p className="text-gray-500 mt-2">
            Create your Odoo POS account
          </p>
        </div>
        <form className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              placeholder="Enter your name"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#714B67]"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Username
            </label>
            <input
              type="email"
              placeholder="Enter your email or username"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#714B67]"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email or username"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#714B67]"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#714B67]"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="Confirm your password"
              className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#714B67]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#714B67] text-white py-3 rounded-md font-medium hover:bg-[#604058] transition duration-300"
          >
            Sign Up
          </button>
        </form>
        <div className="text-center mt-4">
          <p className="text-gray-600">
            Already have an account?{" "}
            <span className="text-[#714B67] font-semibold cursor-pointer hover:underline">
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;