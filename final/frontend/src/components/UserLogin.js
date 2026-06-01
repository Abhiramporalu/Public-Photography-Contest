import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { UserAuthContext } from '../context/UserAuthContext';
import { handleSuccess, handleError } from '../utils'; // adjust path if needed


const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState('forgotPassword'); // forgotPassword, resetPassword
  const [loading, setLoading] = useState(false);
  const { login } = useContext(UserAuthContext); // Use UserAuthContext here
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/login`,
        { email, password },
        {
          headers: {
            'x-api-key': process.env.REACT_APP_API_KEY,
          },
          withCredentials: true,
        }
      );
      login(data);
      handleSuccess("Successfully Logged In!");
      navigate('/contests'); // Redirect to user profile page after successful login
    } catch (error) {
      handleError(
        error.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/forgotpassword`,
        { email },
        {
          headers: {
            'x-api-key': process.env.REACT_APP_API_KEY,
          },
          withCredentials: true,
        }
      );
      handleSuccess(data.message);
      //setMessage(data.message);
      //setError(null);
      setModalStep('resetPassword');
    } catch (error) {
      handleError(
        error.response?.data?.message || 'Failed to send OTP.'
      );
      //setMessage(null);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      handleError('Please enter a valid 6-digit OTP.');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      handleError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.put(
        `${process.env.REACT_APP_API_URL}/api/users/resetpassword`,
        {
          email,
          otp: otpString,
          newPassword,
        },
        {
          headers: {
            'x-api-key': process.env.REACT_APP_API_KEY,
          },
          withCredentials: true,
        }
      );
      handleSuccess(data.message);
      //setMessage(data.message);
      //setError(null);
      setTimeout(() => {
        setShowModal(false);
        setModalStep('forgotPassword');
      }, 3000);
    } catch (error) {
      handleError(error.response?.data?.message || 'Failed to reset password.');
      setMessage(null);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalStep('forgotPassword');
    //setMessage(null);
    setError(null);
  };

  return (
    <div className="container main-content d-flex justify-content-center align-items-center flex-column">
      <h2 className="text-center gradient-text mb-4">Login</h2>
      {message && <div className="alert alert-success text-center">{message}</div>}
      {error && <div className="alert alert-danger text-center">{error}</div>}
      <form onSubmit={handleLogin} className="glass-card w-100" style={{ maxWidth: '400px' }}>
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
        <div className="form-group mb-4">
          <label className="form-label">Password:</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn-premium w-100">
          {loading ? <Spinner animation="border" size="sm" /> : 'Login'}
        </button>
        <p className="text-center mt-3">
          <button
            type="button"
            className="btn btn-link text-light text-decoration-none"
            onClick={() => setShowModal(true)}
          >
            Forgot Password?
          </button>
        </p>
      </form>

      <Modal show={showModal} onHide={closeModal} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="gradient-text">
            {modalStep === 'forgotPassword' ? 'Forgot Password' : 'Reset Password'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {message && <div className="alert alert-success text-center">{message}</div>}
          {error && <div className="alert alert-danger text-center">{error}</div>}

          {modalStep === 'forgotPassword' && (
            <form onSubmit={handleForgotPassword}>
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
              <button type="submit" className="btn-premium w-100 mt-2">
                {loading ? <Spinner animation="border" size="sm" /> : 'Send OTP'}
              </button>
            </form>
          )}

          {modalStep === 'resetPassword' && (
            <form onSubmit={handleResetPassword}>
              <div className="form-group mb-3">
                <label className="form-label">OTP:</label>
                <div className="d-flex justify-content-between">
                  {otp.map((data, index) => (
                    <input
                      type="text"
                      name="otp"
                      maxLength="1"
                      key={index}
                      value={data}
                      onChange={(e) => handleOtpChange(e.target, index)}
                      onFocus={(e) => e.target.select()}
                      className="form-control text-center"
                      style={{ width: '3rem', marginRight: '0.5rem' }}
                    />
                  ))}
                </div>
              </div>
              <div className="form-group mb-3">
                <label className="form-label">New Password:</label>
                <input
                  type="password"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                />
              </div>
              <div className="form-group mb-3">
                <label className="form-label">Confirm Password:</label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm new password"
                />
              </div>
              <button type="submit" className="btn-premium w-100 mt-4">
                {loading ? <Spinner animation="border" size="sm" /> : 'Reset Password'}
              </button>
            </form>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={closeModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserLogin;
