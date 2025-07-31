import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [reenterPassword, setReenterPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== reenterPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      console.log('Registering user:', { userName, userEmail, password });

      const response = await axios.post('http://todo-sachin.runasp.net/api/register', {
        userName,
        userEmail,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // If your API returns a token (optional), store it here
      const token = response.data.token;
      if (token) {
        localStorage.setItem('token', token);
      }

      // You can optionally store username if returned from backend
      if (response.data.userName) {
        localStorage.setItem('userName', response.data.userName);
      }

      // Assuming registration success on receiving token or 200 OK response
      alert('Registration successful! Please login.');

      // Redirect to the login page
      navigate('/login');
    } catch (error) {
      console.error('Error during registration:', error);

      // Show backend error or fallback message
      setError(
        error.response?.data?.message ||
        error.message ||
        'An error occurred during registration. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-700 via-blue-300 to-blue-100">
      <div className="bg-white rounded-xl shadow-lg max-w-sm w-full px-8 py-10 flex flex-col gap-8">
        <h2 className="text-2xl font-bold text-blue-700 text-center tracking-wide">
          Register
        </h2>
        <form
          className="flex flex-col gap-4"
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          <input
            type="text"
            name="userName"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Username"
            required
            className="px-4 py-3 border border-blue-200 rounded-md bg-slate-50 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 transition"
          />
          <input
            type="email"
            name="userEmail"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="Email"
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
          <input
            type="password"
            name="reenterPassword"
            placeholder="Re-enter Password"
            value={reenterPassword}
            onChange={(e) => setReenterPassword(e.target.value)}
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
            Register
          </button>
        </form>
        <div className="text-center text-sm">
          Already have an account?{' '}
          <a
            href="/login"
            className="text-blue-700 font-medium hover:underline"
          >
            Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;
