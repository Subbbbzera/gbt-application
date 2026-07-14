import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated, getAuthHeader, user } = useAuth();
  const API_URL = process.env.REACT_APP_API_URL;

  const [cartItems, setCartItems] = useState([]);
  const [availableCards, setAvailableCards] = useState([]);
  const [newsPosts, setNewsPosts] = useState([]);
  const [reviews, setReviews] = useState({});
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [sliderImages, setSliderImages] = useState([]);
  const [loading, setLoading] = useState(true);

  
  const [catalogFilters, setCatalogFilters] = useState({
    search: "",
    selectedCategories: [],
    saleTypeFilter: "all",
    rentPriceRange: { min: "", max: "" },
    buyPriceRange: { min: "", max: "" },
    sortBy: "newest",
    currentPage: 1
  });

  

  useEffect(() => {
    fetchAvailableCards();
    fetchNewsPosts();
    fetchSliderImages();
    if (isAuthenticated) {
      fetchUserCart();
      fetchUserOrders();
      fetchUserFavorites();
      fetchCoupons(); 
    }
  }, [isAuthenticated]);

  const fetchSliderImages = async () => {
    try {
      const response = await fetch(`${API_URL}/slider`);
      if (response.ok) {
        const data = await response.json();
        setSliderImages(Array.isArray(data) ? data : []);
      } else {
        setSliderImages([]);
      }
    } catch (error) {
      console.error("Помилка завантаження слайдера:", error);
      setSliderImages([]);
    }
  };

  const addSliderImage = async (formData) => {
    try {
      const response = await fetch(`${API_URL}/slider`, {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        fetchSliderImages();
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error("Помилка додавання слайда:", error);
      return { success: false };
    }
  };

  const deleteSliderImage = async (id) => {
    try {
      const response = await fetch(`${API_URL}/slider/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchSliderImages();
      }
    } catch (error) {
      console.error("Помилка видалення слайда:", error);
    }
  };

  const fetchCoupons = async () => {
    try {
      const response = await fetch(`${API_URL}/coupons`, {
        headers: getAuthHeader()
      });
      if (response.ok) {
        const data = await response.json();
        setCoupons(Array.isArray(data) ? data : []);
      } else {
        setCoupons([]);
      }
    } catch (error) {
      console.error("Помилка завантаження купонів:", error);
      setCoupons([]);
    }
  };

  const addCoupon = async (couponData) => {
    try {
      const response = await fetch(`${API_URL}/coupons`, {
        method: "POST",
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(couponData),
      });
      
      if (response.ok) {
        fetchCoupons();
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error("Помилка додавання купона:", error);
      return { success: false, error: "Помилка сервера" };
    }
  };

  const deleteCoupon = async (id) => {
    try {
      const response = await fetch(`${API_URL}/coupons/${id}`, {
        method: "DELETE",
        headers: getAuthHeader()
      });
      
      if (response.ok) {
        fetchCoupons();
      }
    } catch (error) {
      console.error("Помилка видалення купона:", error);
    }
  };

  const validateCoupon = async (code) => {
    try {
      const response = await fetch(`${API_URL}/coupons/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });
      
      const data = await response.json();
      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Помилка валідації купона:", error);
      return { success: false, error: "Помилка сервера" };
    }
  };

  const fetchUserFavorites = async () => {
    try {
      const response = await fetch(`${API_URL}/favorites`, {
        headers: getAuthHeader()
      });
      if (response.ok) {
        const data = await response.json();
        setFavorites(Array.isArray(data) ? data : []);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error("Помилка завантаження улюблених:", error);
      setFavorites([]);
    }
  };

  const addToFavorites = async (card) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/favorites`, {
        method: "POST",
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ card_id: card.id })
      });

      if (response.ok) {
        setFavorites(prev => {
          const exists = prev.find(item => item.id === card.id);
          if (!exists) return [...prev, card];
          return prev;
        });
      }
    } catch (error) {
      console.error("Помилка додавання в улюблені:", error);
    }
  };

  const removeFromFavorites = async (cardId) => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch(`${API_URL}/favorites/${cardId}`, {
        method: "DELETE",
        headers: getAuthHeader()
      });

      if (response.ok) {
        setFavorites(prev => prev.filter(item => item.id !== cardId));
      }
    } catch (error) {
      console.error("Помилка видалення з улюблених:", error);
    }
  };

  const isFavorite = (cardId) => {
    return favorites.some(item => item.id === cardId);
  };

  const fetchAvailableCards = async () => {
    try {
      const response = await fetch(`${API_URL}/cards/available`);
      const data = await response.json();
      setAvailableCards(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error("Помилка завантаження карток:", error);
      setAvailableCards([]);
      setLoading(false);
    }
  };

  const fetchUserCart = async () => {
    try {
      const response = await fetch(`${API_URL}/cart`, {
        headers: getAuthHeader()
      });
      if (response.ok) {
        const data = await response.json();
        setCartItems(Array.isArray(data) ? data : []);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("Помилка завантаження кошика:", error);
      setCartItems([]);
    }
  };

  const fetchUserOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders`, {
        headers: getAuthHeader()
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Помилка завантаження замовлень:", error);
      setOrders([]);
    }
  };

  const fetchNewsPosts = async () => {
    try {
      const response = await fetch(`${API_URL}/news`);
      const data = await response.json();
      setNewsPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Помилка завантаження новин:", error);
      setNewsPosts([]);
    }
  };

  const fetchReviews = async (cardId) => {
    try {
      const response = await fetch(`${API_URL}/reviews/${cardId}`);
      if (!response.ok) {
        console.error("Помилка завантаження відгуків");
        return;
      }
      const data = await response.json();
      setReviews((prev) => ({ ...prev, [cardId]: data }));
    } catch (error) {
      console.error("Помилка завантаження відгуків:", error);
    }
  };

  const addCardToAvailable = async (formData) => {
    try {
      const response = await fetch(`${API_URL}/cards`, {
        method: "POST",
        body: formData,
      });
      
      if (response.ok) {
        fetchAvailableCards();
      }
    } catch (error) {
      console.error("Помилка додавання картки:", error);
    }
  };

  const deleteCardFromAvailable = async (id) => {
    try {
      const response = await fetch(`${API_URL}/cards/${id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        fetchAvailableCards();
      }
    } catch (error) {
      console.error("Помилка видалення картки:", error);
    }
  };

  const updateCard = async (id, formData) => {
    try {
      const response = await fetch(`${API_URL}/cards/${id}`, {
        method: "PATCH",
        body: formData,
      });
      
      if (response.ok) {
        fetchAvailableCards();
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      console.error("Помилка оновлення картки:", error);
      return { success: false, error: "Помилка з'єднання з сервером" };
    }
  };

  const addNewsPost = async (newsData) => {
    try {
      const response = await fetch(`${API_URL}/news`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newsData),
      });
      
      if (response.ok) {
        fetchNewsPosts();
      }
    } catch (error) {
      console.error("Помилка додавання новини:", error);
    }
  };

  const deleteNewsPost = async (id) => {
    try {
      const response = await fetch(`${API_URL}/news/${id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        fetchNewsPosts();
      }
    } catch (error) {
      console.error("Помилка видалення новини:", error);
    }
  };

  const updateNewsPost = async (id, newsData) => {
    try {
      const response = await fetch(`${API_URL}/news/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newsData),
      });
      
      if (response.ok) {
        fetchNewsPosts();
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error("Помилка оновлення новини:", error);
      return { success: false };
    }
  };

  const addReview = async (cardId, text, rating = null, parentId = null) => {
    try {
      const response = await fetch(`${API_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          card_id: cardId, 
          text, 
          rating, 
          parent_id: parentId,
          user_id: user?.id || null 
        }),
      });

      if (response.ok) {
        await fetchReviews(cardId);
      }
    } catch (error) {
      console.error("Помилка додавання відгуку:", error);
    }
  };

  const deleteReview = async (cardId, reviewId) => {
    try {
      const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
        method: "DELETE",
        headers: getAuthHeader()
      });

      if (response.ok) {
        await fetchReviews(cardId);
      }
    } catch (error) {
      console.error("Помилка видалення відгуку:", error);
    }
  };

  const updateReview = async (cardId, reviewId, text, rating = null) => {
    try {
      const response = await fetch(`${API_URL}/reviews/${reviewId}`, {
        method: "PATCH",
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text, rating })
      });

      if (response.ok) {
        await fetchReviews(cardId);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      console.error("Помилка оновлення відгуку:", error);
      return { success: false };
    }
  };

  const addToCart = async (card) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/cart`, {
        method: "POST",
        headers: {
          ...getAuthHeader(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ card_id: card.id })
      });

      if (response.ok) {
        setCartItems(prev => {
          const exists = prev.find(item => item.id === card.id);
          if (!exists) {
            return [...prev, card];
          }
          return prev;
        });
        fetchAvailableCards();
      }
    } catch (error) {
      console.error("Помилка додавання в кошик:", error);
    }
  };

  const removeFromCart = async (cardId) => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch(`${API_URL}/cart/${cardId}`, {
        method: "DELETE",
        headers: getAuthHeader()
      });

      if (response.ok) {
        setCartItems(prev => prev.filter(item => item.id !== cardId));
        fetchAvailableCards();
      }
    } catch (error) {
      console.error("Помилка видалення з кошика:", error);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch(`${API_URL}/cart`, {
        method: "DELETE",
        headers: getAuthHeader()
      });

      if (response.ok) {
        setCartItems([]);
        fetchAvailableCards();
      }
    } catch (error) {
      console.error("Помилка очищення кошика:", error);
    }
  };

  
  const createOrder = async (orderData, orderedIds) => {
    if (!isAuthenticated) {
      navigate('/login');
      return { success: false, error: 'Необхідна авторизація' };
    }

    try {
      const isFormData = orderData instanceof FormData;
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: isFormData ? getAuthHeader() : {
          ...getAuthHeader(),
          "Content-Type": "application/json"
        },
        body: isFormData ? orderData : JSON.stringify(orderData)
      });

      const data = await response.json();

      if (response.ok) {
        
        const idsToClear = orderedIds || (isFormData ? [] : (orderData.items?.map(i => i.id) || orderData.card_ids || []));
        setCartItems(prev => prev.filter(item => !idsToClear.includes(item.id)));
        await fetchAvailableCards();
        await fetchUserOrders();
        return { success: true, data };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Помилка створення замовлення:", error);
      return { success: false, error: 'Помилка з\'єднання з сервером' };
    }
  };

  
  const cancelOrder = async (orderId) => {
    if (!isAuthenticated) return { success: false, error: 'Необхідна авторизація' };

    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/cancel`, {
        method: "PATCH",
        headers: getAuthHeader()
      });

      const data = await response.json();

      if (response.ok) {
        await fetchUserOrders();
        await fetchAvailableCards();
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Помилка скасування замовлення:", error);
      return { success: false, error: 'Помилка з\'єднання з сервером' };
    }
  };

  
  const completeOrder = async (orderId) => {
    if (!isAuthenticated) return { success: false, error: 'Необхідна авторизація' };

    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/complete`, {
        method: "PATCH",
        headers: getAuthHeader()
      });

      const data = await response.json();

      if (response.ok) {
        await fetchUserOrders();
        await fetchAvailableCards();
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Помилка завершення оренди:", error);
      return { success: false, error: 'Помилка з\'єднання з сервером' };
    }
  };

  const value = {
    cartItems,
    availableCards,
    newsPosts,
    reviews,
    orders,
    loading,
    addToCart,
    removeFromCart,
    clearCart,
    addCardToAvailable,
    updateCard,
    fetchReviews,
    deleteCardFromAvailable,
    addNewsPost,
    deleteNewsPost,
    updateNewsPost,
    addReview,
    deleteReview,
    updateReview,
    fetchAvailableCards,
    fetchUserCart,
    fetchUserOrders,
    createOrder,
    cancelOrder,
    completeOrder,
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    coupons,
    fetchCoupons,
    addCoupon,
    deleteCoupon,
    validateCoupon,
    catalogFilters,
    setCatalogFilters,
    sliderImages,
    addSliderImage,
    deleteSliderImage
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};