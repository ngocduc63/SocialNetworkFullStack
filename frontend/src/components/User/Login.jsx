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

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearErrors());
    }
    if (isAuthenticated) {
      navigate(`/${user.username}`);
    }
  }, [dispatch, error, isAuthenticated, navigate]);

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
