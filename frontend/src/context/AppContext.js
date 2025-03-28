import React, { createContext, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";
import { SOCKET_ENDPOINT } from "../utils/constants";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const socket = useRef(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    // Khởi tạo socket
    socket.current = io(SOCKET_ENDPOINT);
    console.log("Socket initialized");

    // Xử lý sự kiện kết nối
    socket.current.on("connect", () => {
      console.log("Socket connected successfully, ID:", socket.current.id);

      // Đăng ký người dùng ngay sau khi kết nối thành công
      if (user && user._id) {
        socket.current.emit("addUser", user._id);
        console.log("User registered with socket:", user._id);
      }
    });

    socket.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    // Phần còn lại của useEffect...

    return () => {
      if (socket.current) {
        console.log("Disconnecting socket");
        socket.current.disconnect();
      }
    };
  }, [user, dispatch]);
  return (
    <AppContext.Provider value={{ socket }}>{children}</AppContext.Provider>
  );
};

export default AppProvider;
