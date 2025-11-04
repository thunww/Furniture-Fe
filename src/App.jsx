import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getProfile } from "./redux/authSlice";
import AppRoutes from "./routes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import ChatWidget from "./components/customer/Components/ChatWidget";
// import "antd/dist/reset.css";

function App() {
  const dispatch = useDispatch();

  // 🧩 Khi reload hoặc mở lại app → tự động kiểm tra cookie và lấy lại user
  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  return (
    <>
      <AppRoutes />
      <ToastContainer />
      {/* <ChatWidget /> */}
    </>
  );
}

export default App;
