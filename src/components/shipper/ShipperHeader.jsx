import React, { useState, useRef, useEffect } from "react";
import { Menu, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/authSlice";
import { getShipperProfile } from "../../redux/shipperSlice";
import { toast } from "react-toastify";

const UserDropdown = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { shipper } = useSelector((state) => state.shipper);

  if (!isOpen || !shipper?.user) return null;

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Đăng xuất thành công");
    navigate("/");
  };

  const userFullName = `${shipper.user.first_name} ${shipper.user.last_name}`;

  return (
    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
      <div className="px-4 py-2 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img 
              src={shipper.user.profile_picture || '/default-avatar.png'} 
              alt={userFullName}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="font-semibold">{userFullName}</p>
            <p className="text-xs text-gray-500">ID: {shipper.user.user_id}</p>
          </div>
        </div>
      </div>
      <Link
        to="/shipper/profile"
        className="px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-gray-700"
      >
        <User size={16} />
        <span>Thông tin cá nhân</span>
      </Link>
      <button
        onClick={handleLogout}
        className="w-full px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-red-600"
      >
        <LogOut size={16} />
        <span>Đăng xuất</span>
      </button>
    </div>
  );
};

const ShipperHeader = ({ onMenuClick, currentPath }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const dispatch = useDispatch();
  const { shipper, loading } = useSelector((state) => state.shipper);

  useEffect(() => {
    dispatch(getShipperProfile());
  }, [dispatch]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPageTitle = () => {
    switch (currentPath) {
      case "/shipper/dashboard":
        return "Dashboard";
      case "/shipper/orders":
        return "Đơn hàng";
      case "/shipper/profile":
        return "Thông tin cá nhân";
      default:
        return "ShipPro";
    }
  };

  const userFullName = shipper?.user ? `${shipper.user.first_name} ${shipper.user.last_name}` : '';

  return (
    <header className="bg-red-500 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 md:hidden"
          >
            <Menu size={24} />
          </button>
          <h1 className="ml-2 text-xl font-semibold text-white">
            {getPageTitle()}
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-2">
          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 p-2 rounded-full text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden">
                {shipper?.user && (
                  <img 
                    src={shipper.user.profile_picture || '/default-avatar.png'} 
                    alt={userFullName}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </button>
            <UserDropdown
              isOpen={isUserMenuOpen}
              onClose={() => setIsUserMenuOpen(false)}
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default ShipperHeader;