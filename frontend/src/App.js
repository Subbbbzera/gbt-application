import { Routes, Route, useLocation, Link } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Admin from "./pages/Admin";
import News from "./pages/News";
import Detail from "./pages/Detail";
import UmovRent from "./pages/UmovRent";
import Cart from "./pages/Cart";
import NewsDetail from "./pages/NewsDetail";
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';

import "./index.css"

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();

  
  const hideFooterPaths = ["/Cart", "/News", "/Favorites"];

  const shouldHideFooter = hideFooterPaths.some((path) =>
    location.pathname.toLowerCase().startsWith(path.toLowerCase())
  );

  
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <>
      <Header>
        {}
        {isAdminRoute && user?.role === "admin" && (
          <Link to="/admin" className="text-white font-semibold ml-4">Адмін</Link>
        )}
      </Header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Catalog" element={<Catalog />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/UmovRent" element={<UmovRent />} />
        <Route path="/Detail/:id" element={<Detail />} />
        <Route path="/Cart" element={<Cart />} />
        <Route path="/Favorites" element={<Favorites />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/card/:id" element={<Detail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/Profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {}
        {user?.role === "admin" && (
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
        )}
      </Routes>

      {!shouldHideFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
