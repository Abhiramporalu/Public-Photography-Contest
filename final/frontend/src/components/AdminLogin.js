import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Spinner } from 'react-bootstrap';
import { AdminAuthContext } from '../context/AdminAuthContext';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AdminAuthContext); // Use AdminAuthContext here
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin/login`,
        { email, password },
        {
          headers: {
            'x-api-key': process.env.REACT_APP_API_KEY,
          },
          withCredentials: true,
        }
      );
      login(data);  // This should update the auth state immediately
      navigate('/admin-dashboard'); // Redirect to admin dashboard after successful login
    } catch (error) {
      console.error('Admin login error:', error);
      const errMsg = error.response?.data?.message || 'Invalid email or password. Please try again.';
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container main-content d-flex justify-content-center align-items-center flex-column">
      <h2 className="text-center gradient-text mb-4">Admin Login</h2>
      <form
        onSubmit={handleLogin}
        className="glass-card w-100"
        style={{ maxWidth: '400px' }}
      >
        <div className="form-group mb-3">
          <label className="form-label">Email:</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group mb-3">
          <label className="form-label">Password:</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="btn-premium w-100 mt-4"
        >
          {loading ? <Spinner animation="border" size="sm" /> : 'Login'}
        </button>
      </form>
    </div>
  );
}  

export default AdminLogin;
