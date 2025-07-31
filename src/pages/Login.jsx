import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Make sure react-router-dom is installed and app wrapped with BrowserRouter

const Login = () => {
  const [userEmail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous error

    try {
      const response = await axios.post('http://todo-sachin.runasp.net/api/login', {
        userEmail,
        password,
      });
       
      const token = response.data.token ;
      console.log('Login successful, token:', token);
      if (response.data) {
      localStorage.setItem('token', token);
      navigate('/Home'); 
    } else {
      setError('Login failed: No token received');
    }

    } catch (err) {
      // Handle network or server errors
      setError(
        err.response?.data?.message ||
          err.message ||
          'An error occurred while logging in'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-700 via-blue-300 to-blue-100">
      <div className="bg-white rounded-xl shadow-lg max-w-sm w-full px-8 py-10 flex flex-col gap-8">
        <h2 className="text-2xl font-bold text-blue-700 text-center tracking-wide">
          Login
        </h2>
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          <input
            type="email"
            name="userEmail"
            placeholder="Email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            required
            className="px-4 py-3 border border-blue-200 rounded-md bg-slate-50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="px-4 py-3 border border-blue-200 rounded-md bg-slate-50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          />
          {error && (
            <div className="text-red-600 font-medium text-center">{error}</div>
          )}
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-700 via-blue-400 to-blue-300 text-white font-semibold py-3 rounded-md shadow transition hover:from-blue-800 hover:via-blue-500"
          >
            Sign In
          </button>
        </form>
        <div className="text-center text-sm">
          Don't have an account?{' '}
          <a
            href="/register"
            className="text-blue-700 font-medium hover:underline"
          >
            Register
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
