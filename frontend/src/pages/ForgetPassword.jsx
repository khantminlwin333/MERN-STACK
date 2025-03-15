import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../helpers/axios";
import loadingImg from "../assets/loading.svg";

export default function ForgotPassword  () {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [isResetMode, setIsResetMode] = useState(false);
  const [token, setToken] = useState("");
  let [loading,setLoading] = useState(false);


  // Check if URL has a token (for resetting password)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const resetToken = params.get("token");
    if (resetToken) {
      setIsResetMode(true);
      setToken(resetToken);
    }
  }, [location]);

  // Handle forgot password request
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post("/api/users/forgot-password", { email });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    }
  };

  // Handle reset password request
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`/api/users/reset-password/${token}`,{token,newPassword });
      setMessage(response.data.message);
      setTimeout(() => navigate("/sign-in"), 2000); // Redirect to login after success
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold text-center mb-4">
        {isResetMode ? "Reset Your Password" : "Forgot Password"}
      </h2>
     

      {!isResetMode && !loading &&(
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border rounded-md"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            disabled={loading}
          >
            Forgot Password
            </button>
            </form>
            )
           }
            {loading && !message ? (
              <>
              <p className="col-span-3 flex justify-center items-center">"Sending reset link..."</p>
              <div className="col-span-3 flex justify-center items-center" style={{ height: '100vh' }}>
                          <div className="absolute animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-purple-500"></div>
                          <img src={loadingImg} className="rounded-full h-28 w-28" />
              </div>
              </>
            )
             :<p className="text-center text-green-600 mb-4">{message}</p>}
          
        
    
       { isResetMode && !loading && ( <form onSubmit={handleResetPassword} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            className="w-full p-3 border rounded-md"
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full p-3 border rounded-md"
          />
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
          >
            Reset Password
          </button>
        </form>
      )}

      {loading && isResetMode && message &&  (
        <>
        <div className="col-span-3 flex justify-center items-center" style={{ height: '100vh' }}>
        <div className="absolute animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-purple-500"></div>
        <img src={loadingImg} className="rounded-full h-28 w-28" />
        </div>
        </>
      )}
    </div>
  </div>
  );
};

