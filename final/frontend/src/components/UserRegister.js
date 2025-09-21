import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import { handleSuccess, handleError } from '../utils'; // adjust path if needed



const RegisterPage = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
   const [error] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    number: false,
    specialChar: false,
  });

  const navigate = useNavigate();
  const validatePasswordRules = (pwd) => {
    return {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      number: /\d/.test(pwd),
      specialChar: /[@$!%*?&]/.test(pwd),
    };
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    // Reset error state
    //setError(null);
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (password !== confirmPassword) {
      handleError("Passwords do not match.");
      return;
    }
    if (!passwordRegex.test(password)) {
      handleError(
        "Password must be at least 8 characters long and include an uppercase letter, a number, and a special character."
      );
      
      return;
    }

    setLoading(true);
    try {
      // Make the registration API call
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/register`,
        { username, email, password },
        {
          headers: {
            "x-api-key": process.env.REACT_APP_API_KEY, // Include API key in the request
          },
          withCredentials: true, // Ensure cookies are sent/received with the request
        }
      );
      handleSuccess("Registration successful! You can now login.");

      // Redirect to login after successful registration
      navigate("/login");
    } catch (error) {
      // Handle errors and set error messages
      handleError(
        error.response?.data?.message || "Registration failed. Please try again."
      );
      
    } finally {
      // Stop loading spinner
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center text-light" style={{ color: "purple" }}>
        Register
      </h2>
      {error && <div className="alert alert-danger text-center">{error}</div>}
      <form
        onSubmit={submitHandler}
        className="mx-auto shadow p-4 rounded bg-light"
        style={{ maxWidth: "400px", border: "2px solid purple" }}
      >
        <div className="form-group">
          <label style={{ fontWeight: "bold", color: "black" }}>
            Username:
          </label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ borderColor: "purple", borderWidth: "2px" }}
            required
          />
        </div>
        <br></br>
        <div className="form-group">
          <label style={{ fontWeight: "bold", color: "black" }}>Email:</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ borderColor: "purple", borderWidth: "2px" }}
            required
          />
        </div>
        <br></br>
        <div className="form-group">
          <label style={{ fontWeight: "bold", color: "black" }}>
            Password:
          </label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => {
              const pwd = e.target.value;
              setPassword(pwd);
              setPasswordValidation(validatePasswordRules(pwd));
            }}
            style={{ borderColor: "purple", borderWidth: "2px" }}
            required
          />
          <ul className="list-unstyled mt-2">
            <li
              className={
                passwordValidation.length ? "text-success" : "text-danger"
              }
            >
              {passwordValidation.length ? (
                <FaCheckCircle />
              ) : (
                <FaTimesCircle />
              )}{" "}
              Minimum 8 characters
            </li>
            <li
              className={
                passwordValidation.uppercase ? "text-success" : "text-danger"
              }
            >
              {passwordValidation.uppercase ? (
                <FaCheckCircle />
              ) : (
                <FaTimesCircle />
              )}{" "}
              At least one uppercase letter
            </li>
            <li
              className={
                passwordValidation.number ? "text-success" : "text-danger"
              }
            >
              {passwordValidation.number ? (
                <FaCheckCircle />
              ) : (
                <FaTimesCircle />
              )}{" "}
              At least one number
            </li>
            <li
              className={
                passwordValidation.specialChar ? "text-success" : "text-danger"
              }
            >
              {passwordValidation.specialChar ? (
                <FaCheckCircle />
              ) : (
                <FaTimesCircle />
              )}{" "}
              At least one special character (@$!%*?&)
            </li>
          </ul>

          <small className="form-text text-muted">
            Password must be at least 8 characters long, contain an uppercase
            letter, a number, and a special character.
          </small>
        </div>
        <br></br>
        <div className="form-group">
          <label style={{ fontWeight: "bold", color: "black" }}>
            Confirm Password:
          </label>
          <input
            type="password"
            className="form-control"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ borderColor: "purple", borderWidth: "2px" }}
            required
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary d-block mx-auto mt-4"
          style={{
            backgroundColor: "purple",
            border: "none",
            fontSize: "20px",
            color: "white",
            borderRadius: "5px",
            padding: "10px",
            cursor: "pointer",
            margin: "10px 0",
            fontWeight: "bold",
          }}
          disabled={
            !passwordValidation.length ||
            !passwordValidation.uppercase ||
            !passwordValidation.number ||
            !passwordValidation.specialChar ||
            loading
          }
        >
          {loading ? <Spinner animation="border" size="sm" /> : "Register"}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
