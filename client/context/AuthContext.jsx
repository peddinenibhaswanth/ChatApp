import { createContext, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  /* ---------------- CHECK AUTH ---------------- */
  const checkAuth = async () => {
    try {
      const res = await axios.get("/api/auth/check");
      if (res.data.success) {
        setAuthUser(res.data.user);
        connectSocket(res.data.user);
      }
    } catch (error) {
      console.log("Not authenticated");
    }
  };

  /* ---------------- LOGIN ---------------- */
  const login = async (state, credentials) => {
    try {
      const res = await axios.post(`/api/auth/${state}`, credentials);
      const { success, userData, token, message } = res.data;

      if (!success) {
        toast.error(message);
        return;
      }

      localStorage.setItem("token", token);
      setToken(token);

      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;

      setAuthUser(userData);
      connectSocket(userData);
      toast.success(message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  /* ---------------- LOGOUT ---------------- */
  const logout = () => {
    localStorage.removeItem("token");
    setAuthUser(null);
    setToken(null);
    setOnlineUsers([]);

    delete axios.defaults.headers.common["Authorization"];

    if (socket) socket.disconnect();
    setSocket(null);

    toast.success("Logged out successfully");
  };

  /* ---------------- UPDATE PROFILE ---------------- */
  const updateProfile = async (body) => {
    try {
      const res = await axios.put("/api/auth/update-profile", body);
      if (res.data.success) {
        setAuthUser(res.data.user);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  /* ---------------- SOCKET ---------------- */
  const connectSocket = (userData) => {
    if (!userData || socket?.connected) return;

    const newSocket = io(backendUrl, {
      query: { userId: userData._id },
    });

    newSocket.connect();
    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });
  };

  /* ---------------- RESTORE SESSION ---------------- */
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;

      checkAuth();
    }
  }, [token]);

  const value = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
