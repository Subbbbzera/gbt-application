import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { FaShoppingCart, FaUserCircle, FaSignOutAlt, FaCaretDown, FaHeart, FaBars, FaTimes, FaBell } from "react-icons/fa";

function Header() {
  const { cartItems, favorites, orders } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();

  
  const approvedOrdersCount = orders?.filter(o => o.status === 'awaiting_prepayment').length || 0;

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    setShowMobileMenu(false);
  };

  const closeMobileMenu = () => setShowMobileMenu(false);

  
  const showAdminLink = isAuthenticated && (user?.username === "admin" || user?.role === "admin");

  return (
    <header className="w-full bg-white sticky top-0 z-50 border-b border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)]">
      <div className="max-w-7xl mx-auto flex items-center py-4 px-4 md:px-12">

        {}
        <div className="flex-1 flex justify-start">
          <Link to="/" className="transition duration-300 hover:opacity-80">
            <img src="/images/logo.png" alt="Logo" className='w-12 h-8 object-contain' />
          </Link>
        </div>

        {}
        <nav className="hidden md:flex gap-4 mr-28">
          <Link
              to="/UmovRent"
              className={`px-4 py-3 text-[16px] font-bold transition-all duration-300 nav-line-ltr ${
                location.pathname === "/UmovRent"
                  ? "text-emerald-900 border-b-2 border-emerald-600"
                  : "text-gray-600 hover:text-emerald-800"
              }`}
            >
              Умови оренди
          </Link>

          <Link
              to="/Catalog"
              className={`px-4 py-3 text-[16px] font-bold transition-all duration-300 nav-line-center ${
                location.pathname === "/Catalog"
                  ? "text-emerald-900 border-b-2 border-emerald-600"
                  : "text-gray-600 hover:text-emerald-800"
              }`}
            >
              Каталог
          </Link>

          <Link
              to="/News"
              className={`px-4 py-3 text-[16px] font-bold transition-all duration-300 nav-line-rtl ${
                location.pathname === "/News"
                  ? "text-emerald-900 border-b-2 border-emerald-600"
                  : "text-gray-600 hover:text-emerald-800"
              }`}
            >
              Новини
          </Link>

          {}
          {showAdminLink && (
            <Link
              to="/Admin"
              className={`px-4 py-3 text-[16px] font-bold transition-all duration-300 ${
                location.pathname === "/Admin"
                  ? "text-rose-900 border-b-2 border-rose-600"
                  : "text-rose-500 hover:text-rose-700"
              }`}
            >
              Адмін
            </Link>
          )}
        </nav>

        {}
        <div className="hidden md:flex flex-1 gap-4 items-center justify-end">
          {}
          {isAuthenticated && (
            <Link
              to="/Favorites"
              className={`relative px-3 py-2 transition-all duration-300 rounded-full ${
                location.pathname === "/Favorites"
                  ? "text-rose-500 bg-rose-50"
                  : "text-gray-400 hover:text-rose-500 hover:bg-rose-50"
              }`}
            >
              <FaHeart className="text-2xl" />
              {favorites?.length > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                  {favorites.length}
                </span>
              )}
            </Link>
          )}

          {}
          {isAuthenticated && (
            <Link
              to="/Cart"
              className={`relative px-3 py-2 transition-all duration-300 rounded-full ${
                location.pathname === "/Cart"
                  ? "text-emerald-600 bg-emerald-50"
                  : "text-gray-400 hover:text-emerald-600 hover:bg-emerald-50"
              }`}
            >
              <FaShoppingCart className="text-2xl" />
              {cartItems?.length > 0 && (
                <span className="absolute top-1 right-1 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                  {cartItems.length}
                </span>
              )}
            </Link>
          )}

          {}
          {isAuthenticated && approvedOrdersCount > 0 && (
            <Link
              to="/orders"
              className="relative px-3 py-2 text-emerald-600 bg-emerald-50 rounded-full animate-pulse transition-all duration-300 hover:bg-emerald-100"
              title="Є схвалені замовлення!"
            >
              <FaBell className="text-2xl" />
              <span className="absolute top-1 right-1 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">
                {approvedOrdersCount}
              </span>
            </Link>
          )}

          {}
          {isAuthenticated ? (
            <div
              className="relative group py-2"
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              <button
                className={`flex items-center gap-2 px-3 py-1 text-emerald-800 hover:text-emerald-900 transition duration-300 border border-transparent hover:border-emerald-100 rounded-xl ${approvedOrdersCount > 0 ? 'ring-2 ring-emerald-400 ring-offset-2' : ''}`}
              >
                <FaUserCircle className="text-3xl" />
                <span className="hidden md:block font-medium text-sm max-w-[150px] truncate">
                  {user?.username || user?.email}
                </span>
                <FaCaretDown className={`transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-0 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-3 z-50 animate-fadeIn">
                  <div className="px-4 pb-3 mb-2 border-b border-gray-50">
                    <p className="font-bold text-emerald-900 text-sm truncate">{user?.username}</p>
                    <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                  </div>

                  <Link
                    to="/Profile"
                    className="block px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50 hover:text-emerald-900 transition duration-200 font-bold"
                  >
                    Мій профіль
                  </Link>

                  <Link
                    to="/Favorites"
                    className="block px-4 py-2 text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-800 transition duration-200 font-medium"
                  >
                    Мої улюблені
                  </Link>

                  <Link
                    to="/orders"
                    className="flex justify-between items-center px-4 py-2 text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-800 transition duration-200 font-medium"
                  >
                    <span>Мої замовлення</span>
                    {approvedOrdersCount > 0 && (
                      <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {approvedOrdersCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/Cart"
                    className="block px-4 py-2 text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-800 transition duration-200 font-medium"
                  >
                    Мій кошик
                  </Link>

                  <div className="mx-4 my-2 border-t border-gray-50" />

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition duration-200 flex items-center gap-2 font-bold"
                  >
                    <FaSignOutAlt />
                    Вийти
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <Link
                to="/login"
                className="px-5 py-2 bg-emerald-800 text-white rounded-lg font-medium shadow hover:scale-105 transition transform duration-300 text-sm"
              >
                Вхід
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-emerald-800 border border-emerald-800 rounded-lg font-medium hover:bg-emerald-800 hover:text-white transition duration-300 text-sm"
              >
                Реєстрація
              </Link>
            </div>
          )}
        </div>

        {}
        <div className="flex md:hidden items-center gap-3 flex-1 justify-end">
          {}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 text-emerald-800 rounded-lg hover:bg-emerald-50 transition duration-200"
            aria-label="Меню"
          >
            {showMobileMenu ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
          </button>
        </div>
      </div>

      {}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg px-4 pb-6 pt-4 flex flex-col gap-1 animate-fadeIn">

          {}
          <Link
            to="/UmovRent"
            onClick={closeMobileMenu}
            className={`px-4 py-4 text-[17px] font-bold rounded-xl transition-all duration-200 ${
              location.pathname === "/UmovRent"
                ? "text-emerald-900 bg-emerald-50 border-l-4 border-emerald-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Умови оренди
          </Link>

          <Link
            to="/Catalog"
            onClick={closeMobileMenu}
            className={`px-4 py-4 text-[17px] font-bold rounded-xl transition-all duration-200 ${
              location.pathname === "/Catalog"
                ? "text-emerald-900 bg-emerald-50 border-l-4 border-emerald-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Каталог
          </Link>

          <Link
            to="/News"
            onClick={closeMobileMenu}
            className={`px-4 py-4 text-[17px] font-bold rounded-xl transition-all duration-200 ${
              location.pathname === "/News"
                ? "text-emerald-900 bg-emerald-50 border-l-4 border-emerald-600"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            Новини
          </Link>

          {showAdminLink && (
            <Link
              to="/Admin"
              onClick={closeMobileMenu}
              className={`px-4 py-4 text-[17px] font-bold rounded-xl transition-all duration-200 ${
                location.pathname === "/Admin"
                  ? "text-rose-900 bg-rose-50 border-l-4 border-rose-600"
                  : "text-rose-500 hover:bg-rose-50"
              }`}
            >
              Адмін
            </Link>
          )}

          <div className="my-2 border-t border-gray-100" />

          {}
          {isAuthenticated ? (
            <>
              <div className="px-4 py-3 flex items-center gap-3 bg-emerald-50 rounded-xl mb-1">
                <FaUserCircle className="text-3xl text-emerald-700 shrink-0" />
                <div className="overflow-hidden">
                  <p className="font-bold text-emerald-900 text-sm truncate">{user?.username}</p>
                  <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                </div>
              </div>

              <Link
                to="/Profile"
                onClick={closeMobileMenu}
                className="px-4 py-4 text-[16px] text-gray-700 font-bold hover:bg-gray-50 rounded-xl transition duration-200 flex items-center gap-2"
              >
                <FaUserCircle className="text-emerald-600" />
                <span>Мій профіль</span>
              </Link>

              <Link
                to="/Favorites"
                onClick={closeMobileMenu}
                className="px-4 py-4 text-[16px] text-gray-700 font-medium hover:bg-gray-50 rounded-xl transition duration-200 flex items-center justify-between"
              >
                <span>Мої улюблені</span>
                {favorites?.length > 0 && <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full">{favorites.length}</span>}
              </Link>

              <Link
                to="/Cart"
                onClick={closeMobileMenu}
                className="px-4 py-4 text-[16px] text-gray-700 font-medium hover:bg-gray-50 rounded-xl transition duration-200 flex items-center justify-between"
              >
                <span>Мій кошик</span>
                {cartItems?.length > 0 && <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full">{cartItems.length}</span>}
              </Link>

              <Link
                to="/orders"
                onClick={closeMobileMenu}
                className="px-4 py-4 text-[16px] text-gray-700 font-medium hover:bg-gray-50 rounded-xl transition duration-200"
              >
                Мої замовлення
              </Link>

              <button
                onClick={handleLogout}
                className="mt-1 w-full text-left px-4 py-4 text-[16px] text-red-500 hover:bg-red-50 rounded-xl transition duration-200 flex items-center gap-2 font-bold"
              >
                <FaSignOutAlt />
                Вийти
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-3 mt-1">
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="w-full text-center py-3 bg-emerald-800 text-white rounded-xl font-bold text-[16px] shadow hover:bg-emerald-700 transition duration-200"
              >
                Вхід
              </Link>
              <Link
                to="/register"
                onClick={closeMobileMenu}
                className="w-full text-center py-3 text-emerald-800 border-2 border-emerald-800 rounded-xl font-bold text-[16px] hover:bg-emerald-800 hover:text-white transition duration-200"
              >
                Реєстрація
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;