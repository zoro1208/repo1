import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore.js';
import {
  MessageSquare, User, Mail, Lock,
  Eye, EyeOff, Loader2
} from 'lucide-react';
import { Link } from 'react-router';
import toast from 'react-hot-toast';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    otp: ""
  });

  const {
    signup,
    sendOtp,
    verifyOtp,
    resetOtp,
    isSigningUp,
    isOtpSent,
    isVerified,
    isLoading
  } = useAuthStore();

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    // 🔥 reset OTP if email changes
    if (name === "email") {
      resetOtp();
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ================= VALIDATION =================
  const validateForm = () => {
    const { fullName, email, password } = formData;

    if (!fullName || fullName.trim().length < 2) {
      toast.error("Full name must be at least 2 characters");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      toast.error("Enter valid email");
      return false;
    }

    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  // ================= SUBMIT =================
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isVerified) {
      return toast.error("Verify OTP first");
    }

    if (validateForm()) {
      signup(formData);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 px-4 py-12">
      <div className="flex flex-col lg:flex-row w-full max-w-5xl bg-base-200 rounded-xl shadow-xl overflow-hidden border border-primary/20">

        {/* LEFT */}
        <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-10">
          <div className="w-full max-w-md mx-auto space-y-6">

            {/* HEADER */}
            <div className="text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="size-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold">Create Account</h1>
                <p className="text-base-content/60">Get started</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* FULL NAME */}
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 size-5 opacity-40" />
                  <input
                    type="text"
                    name="fullName"
                    className="input input-bordered w-full pl-10"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* EMAIL + SEND OTP */}
              <div>
                <label className="label">Email</label>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-3 size-5 opacity-40" />
                    <input
                      type="email"
                      name="email"
                      className="input input-bordered w-full pl-10"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => sendOtp(formData.email)}
                    disabled={isLoading || isOtpSent}
                  >
                    {isLoading ? <Loader2 className="animate-spin" /> : "Send"}
                  </button>
                </div>
              </div>

              {/* OTP FIELD */}
              {isOtpSent && !isVerified && (
                <div>
                  <label className="label">Enter OTP</label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="otp"
                      className="input input-bordered w-full"
                      placeholder="Enter OTP"
                      value={formData.otp}
                      onChange={handleChange}
                    />

                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => verifyOtp(formData.email, formData.otp)}
                      disabled={isLoading}
                    >
                      Verify
                    </button>
                  </div>
                </div>
              )}

              {/* PASSWORD */}
              {isVerified && (
                <div>
                  <label className="label">Password</label>

                  <div className="relative">
                    <Lock className="absolute left-3 top-3 size-5 opacity-40" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      className="input input-bordered w-full pl-10 pr-10"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                    />

                    <div
                      className="absolute right-3 top-3 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </div>
                  </div>
                </div>
              )}

              {/* SIGNUP BUTTON */}
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isSigningUp || !isVerified}
              >
                {isSigningUp
                  ? <Loader2 className="animate-spin" />
                  : "Sign Up"}
              </button>

              {/* LOGIN */}
              <p className="text-sm text-center text-base-content/60">
                Already have an account?{" "}
                <Link to="/login" className="link link-primary">
                  Login
                </Link>
              </p>

            </form>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="hidden lg:flex w-1/2 bg-primary/10 items-center justify-center">
          <img src="/ChatImg.png" className="max-w-sm" />
        </div>
      </div>
    </div>
  );
};

export default Signup;