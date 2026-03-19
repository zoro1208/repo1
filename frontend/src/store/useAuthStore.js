import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001"
    : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  socket: null,
  onlineUsers: [],
  groupMessages: [],

  // 🔄 loading states
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  isLoading: false,

  // 🔐 OTP states
  isOtpSent: false,
  isVerified: false,

  // ================= CHECK AUTH =================
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // ================= SEND OTP =================
  sendOtp: async (email) => {
    if (!email) return toast.error("Enter email first");

    if (get().isOtpSent) {
      return toast.error("OTP already sent");
    }

    try {
      set({ isLoading: true });

      await axiosInstance.post("/auth/send-otp", { email });

      set({ isOtpSent: true });
      toast.success("OTP sent to email");

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      set({ isLoading: false });
    }
  },

  // ================= VERIFY OTP =================
  verifyOtp: async (email, otp) => {
    if (!get().isOtpSent) {
      return toast.error("Send OTP first");
    }

    if (!otp) {
      return toast.error("Enter OTP");
    }

    try {
      set({ isLoading: true });

      await axiosInstance.post("/auth/verify-otp", { email, otp });

      set({ isVerified: true });
      toast.success("Email verified");

    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally {
      set({ isLoading: false });
    }
  },

  // ================= RESEND OTP =================
  resendOtp: async (email) => {
    if (!email) return toast.error("Enter email");

    try {
      set({ isLoading: true });

      await axiosInstance.post("/auth/send-otp", { email });

      toast.success("OTP resent");

    } catch (error) {
      toast.error("Failed to resend OTP");
    } finally {
      set({ isLoading: false });
    }
  },

  // ================= RESET OTP =================
  resetOtp: () =>
    set({
      isOtpSent: false,
      isVerified: false,
    }),

  // ================= SIGNUP =================
  signup: async (data) => {
    if (!get().isVerified) {
      return toast.error("Verify OTP first");
    }

    set({ isSigningUp: true });

    try {
      const res = await axiosInstance.post("/auth/signup", data);

      set({
        authUser: res.data,
        isOtpSent: false,   // reset after success
        isVerified: false,
      });

      toast.success("Account created successfully");
      get().connectSocket();

    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  // ================= LOGIN =================
  login: async (data) => {
    set({ isLoggingIn: true });

    try {
      const res = await axiosInstance.post("/auth/login", data);

      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();

    } catch (error) {
      toast.error(error.response?.data?.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  // ================= LOGOUT =================
  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");

      set({ authUser: null });
      toast.success("Logged out successfully");

      get().disconnectSocket();

    } catch (error) {
      toast.error(error.response?.data?.message);
    }
  },

  // ================= UPDATE PROFILE =================
  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });

    try {
      const res = await axiosInstance.put("/auth/update-profile", data);

      set({ authUser: res.data });
      toast.success("Profile updated successfully");

    } catch (error) {
      toast.error(error.response?.data?.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // ================= SOCKET CONNECT =================
  connectSocket: () => {
    const { authUser } = get();

    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });

    socket.connect();

    set({ socket });

    // 🟢 online users
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds || [] });
    });

    // 🟢 group messages (no duplicates)
    socket.off("newGroupMessage").on("newGroupMessage", (message) => {
      const { groupMessages } = get();

      if (!groupMessages.find((m) => m._id === message._id)) {
        set({
          groupMessages: [...groupMessages, message],
        });
      }
    });
  },

  // ================= SOCKET DISCONNECT =================
  disconnectSocket: () => {
    if (get().socket?.connected) {
      get().socket.disconnect();
    }
  },
}));