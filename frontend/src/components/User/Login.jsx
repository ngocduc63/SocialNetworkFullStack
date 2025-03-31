import React, { useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import Auth from "./Auth";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import BackdropLoader from "../Layouts/BackdropLoader";
import { useDispatch, useSelector } from "react-redux";
import { clearErrors, loginUser } from "../../actions/userAction";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Tạo theme với màu tím cho TextField
const purpleTheme = createTheme({
  palette: {
    primary: {
      main: "#8A2BE2", // Màu tím chính của Pollux
    },
  },
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, isAuthenticated, error, user } = useSelector(
    (state) => state.user,
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(loginUser(email, password));
  };

  // Hàm xử lý login với Google
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:4000/auth/google";
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
    if (isAuthenticated) {
      navigate(`/${user.username}`);
    }
  }, [dispatch, error, isAuthenticated, navigate, user]);

  return (
    <>
      {loading && <BackdropLoader />}
      <Auth>
        <div
          className="bg-white border flex flex-col gap-2 p-4 pt-10"
          style={{ borderColor: "#DBDBDB" }}
        >
          <img
            draggable="false"
            className="mx-auto h-30 w-36 object-contain"
            src="https://res.cloudinary.com/hdtien/image/upload/v1742995284/ten_mj9ed3.png"
            alt="Pollux Logo"
          />
          <form
            onSubmit={handleLogin}
            className="flex flex-col justify-center items-center gap-3 m-3 md:m-8"
          >
            <ThemeProvider theme={purpleTheme}>
              <TextField
                label="Email/Username"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                size="small"
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                    {
                      borderColor: "#8A2BE2",
                    },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#8A2BE2",
                  },
                }}
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                size="small"
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                    {
                      borderColor: "#8A2BE2",
                    },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#8A2BE2",
                  },
                }}
              />
            </ThemeProvider>
            <button
              type="submit"
              className="font-medium py-2 rounded text-white w-full"
              style={{
                backgroundColor: "#8A2BE2",
                transition: "background-color 0.3s ease",
                cursor: "pointer",
                border: "none",
                padding: "8px 0",
                borderRadius: "4px",
                fontWeight: "bold",
                fontSize: "14px",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#4B0082")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#8A2BE2")
              }
            >
              Đăng nhập
            </button>
            <div className="flex items-center my-3 w-full">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="px-4 text-gray-500 font-semibold text-sm">
                HOẶC
              </span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>
            {/* Nút Login với Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="font-medium py-2 rounded text-white w-full flex items-center justify-center gap-2"
              style={{
                backgroundColor: "#4285F4", // Màu xanh của Google
                transition: "background-color 0.3s ease",
                cursor: "pointer",
                border: "none",
                padding: "8px 0",
                borderRadius: "4px",
                fontWeight: "bold",
                fontSize: "14px",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.backgroundColor = "#357ABD")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.backgroundColor = "#4285F4")
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                width="20px"
                height="20px"
              >
                <path
                  fill="#FFF"
                  d="M24 9.5c3.8 0 6.4 1.6 7.9 3.1l5.8-5.8C34.3 3.6 29.7 1.5 24 1.5 14.8 1.5 7.1 7.7 4.5 15.8l7.3 5.7C13.3 15.7 18.1 9.5 24 9.5z"
                />
                <path
                  fill="#EA4335"
                  d="M46.5 24c0-1.7-.2-3.3-.5-4.9H24v9.3h12.8c-.6 3-2.3 5.5-4.8 7.2l7.3 5.7c4.3-4 7.2-9.9 7.2-17.3z"
                />
                <path
                  fill="#34A853"
                  d="M11.8 28.3c-.9-2.7-1.4-5.6-1.4-8.7s.5-6 1.4-8.7L4.5 15.8c-2 4-3.1 8.5-3.1 13.2s1.1 9.2 3.1 13.2l7.3-5.7z"
                />
                <path
                  fill="#FBBC05"
                  d="M24 46.5c5.7 0 10.5-1.9 14-5.2l-7.3-5.7c-2.2 1.5-5 2.4-7.7 2.4-5.9 0-10.8-4-12.5-9.8l-7.3 5.7C7.1 40.3 14.8 46.5 24 46.5z"
                />
              </svg>
              Đăng nhập với Google
            </button>
            <Link
              to="/password/forgot"
              className="text-sm font-medium"
              style={{ color: "#8A2BE2", textDecoration: "none" }}
            >
              Quên mật khẩu?
            </Link>
          </form>
        </div>

        <div
          className="bg-white border p-5 text-center"
          style={{ borderColor: "#DBDBDB", marginTop: "10px" }}
        >
          <span>
            Bạn chưa có tài khoản?{" "}
            <Link
              to="/register"
              style={{
                color: "#8A2BE2",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Đăng ký
            </Link>
          </span>
        </div>
      </Auth>
    </>
  );
};

export default Login;
