import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import odooLogo from "../../assets/odoo.svg";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usernameOrEmail: formData.usernameOrEmail,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Login Successful");

		// Save the access_token returned by the updated backend
        if (data.access_token) {
          localStorage.setItem("token", data.access_token);
        }

        console.log(data);

        // Redirect after login
        navigate("/pos");
      } else {
        alert(data.detail || "Invalid Credentials");
      }
    } catch (error) {
      console.error(error);
      alert("Server Error");
    }
  };

  return (
    <div className="min-h-screen font-inter flex flex-col justify-center items-center bg-[#f6f6f6] px-4">
      <img src={odooLogo} alt="Odoo Logo" className="h-12 mb-6" />

      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-center text-2xl font-semibold text-[#714B67] mb-6">
          Login
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">
              Email / Username
            </label>
            <input
              type="text"
              name="usernameOrEmail"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              placeholder="Enter email or username"
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#714B67]"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#714B67]"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#714B67] text-white py-4 rounded-md hover:bg-[#604058]"
          >
            Login
          </button>

          <Link to="/signup">
            <button
              type="button"
              className="w-full border mt-3 border-[#714B67] text-[#714B67] py-3 rounded-md hover:bg-[#f5f0f4]"
            >
              Sign Up
            </button>
          </Link>
        </form>
      </div>
    </div>
  );
};

export default Login;