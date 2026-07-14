import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { FaArrowLeft, FaShoppingCart, FaHeart, FaStar, FaReply, FaChevronDown, FaChevronUp, FaTrash, FaEllipsisV, FaEdit, FaCheck, FaTimes } from "react-icons/fa";
import Slider from "react-slick";

function Detail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const sliderRef = useRef(null);
  const {
    addToCart,
    availableCards,
    cartItems,
    reviews,
    addReview,
    deleteReview,
    updateReview,
    fetchReviews,
    addToFavorites,
    removeFromFavorites,
    isFavorite
  } = useCart();

  const [card, setCard] = useState(null);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedReplies, setExpandedReplies] = useState({});
  const [filterRating, setFilterRating] = useState(null); 
  const [showReviewsSection, setShowReviewsSection] = useState(true); 

  
  const [editingReview, setEditingReview] = useState(null); 
  const [editValue, setEditValue] = useState("");
  const [editRating, setEditValueRating] = useState(5);
  const [activeMenu, setActiveMenu] = useState(null); 

  
  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleEditStart = (rev) => {
    setEditingReview(rev.id);
    setEditValue(rev.text);
    setEditValueRating(rev.rating || 5);
    setActiveMenu(null);
  };

  const handleEditSave = async (revId) => {
    if (editValue.trim()) {
      await updateReview(card.id, revId, editValue.trim(), editRating);
      setEditingReview(null);
    }
  };

  const handleEditCancel = () => {
    setEditingReview(null);
    setEditValue("");
  };

  
  useEffect(() => {
    const found =
      availableCards.find((c) => c.id.toString() === id) ||
      cartItems.find((c) => c.id.toString() === id);
    
    if (found) {
      setCard(found);
    }
    setLoading(false);
  }, [id, availableCards, cartItems]);

  const favorite = card ? isFavorite(card.id) : false;

  const handleToggleFavorite = () => {
    if (card) {
      if (favorite) {
        removeFromFavorites(card.id);
      } else {
        addToFavorites(card);
      }
    }
  };

  
  useEffect(() => {
    if (card) {
      fetchReviews(card.id);
    }
  }, [card, fetchReviews]);

  const handleAddReview = async () => {
    if (comment.trim()) {
      await addReview(card.id, comment.trim(), rating);
      setComment("");
      setRating(5);
    }
  };

  const handleAddReply = async (parentId) => {
    if (replyText.trim()) {
      await addReview(card.id, replyText.trim(), null, parentId);
      setReplyText("");
      setReplyTo(null);
      
      setExpandedReplies(prev => ({ ...prev, [parentId]: true }));
    }
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm("Ви впевнені, що хочете видалити цей коментар?")) {
      await deleteReview(card.id, reviewId);
    }
  };

  const toggleReplies = (parentId) => {
    setExpandedReplies(prev => ({ ...prev, [parentId]: !prev[parentId] }));
  };

  const parseCharacteristics = (str) => {
    if (!str || typeof str !== "string") return [];
    return str
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  };

  const formatDate = (str) => {
    if (!str) return "";
    const d = new Date(str);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  
  const renderStars = (count, interactive = false, onSelect = null) => {
    const getStarColor = (val) => {
      if (val === 5) return "text-green-600";
      if (val === 4) return "text-emerald-500";
      if (val === 3) return "text-amber-400";
      if (val === 2) return "text-orange-500";
      return "text-red-700";
    };
    
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((s) => (
          <FaStar
            key={s}
            className={`transition-colors ${
              interactive ? "cursor-pointer hover:scale-110" : ""
            } ${s <= (count || 0) ? (interactive ? getStarColor(rating) : getStarColor(count)) : "text-gray-200"}`}
            onClick={() => onSelect && onSelect(s)}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Завантаження...</p>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Товар не знайдено</h2>
          <button
            onClick={() => navigate("/rent")}
            className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Повернутися до каталогу
          </button>
        </div>
      </div>
    );
  }

  const alreadyInCart = cartItems.some((c) => c.id === card.id);
  const characteristics = parseCharacteristics(card.characteristics);

  const handleRent = () => {
    if (!alreadyInCart) {
      addToCart(card);
    }
  };

  
  const cardReviews = reviews[card.id] || [];
  const mainReviews = cardReviews.filter(r => !r.parent_id);
  
  
  const filteredReviews = filterRating 
    ? mainReviews.filter(r => r.rating === filterRating)
    : mainReviews;

  const repliesMap = cardReviews.filter(r => r.parent_id).reduce((acc, r) => {
    if (!acc[r.parent_id]) acc[r.parent_id] = [];
    acc[r.parent_id].push(r);
    return acc;
  }, {});

  
  let imageList = [];
  const API_URL = process.env.REACT_APP_API_URL || "";
  if (card.image) {
    try {
      const parsed = typeof card.image === 'string' && card.image.startsWith('[') ? JSON.parse(card.image) : card.image;
      imageList = Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      imageList = [card.image];
    }
  }

  const fullImages = imageList.map(img => img.startsWith('http') ? img : `${API_URL}${img}`);

  
  const sliderSettings = {
    dots: false, 
    infinite: fullImages.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    swipe: true,
    touchMove: true,
    lazyLoad: 'progressive',
    adaptiveHeight: true, 
  };

  return (
    <div className="min-h-screen bg-gray-100 py-7">
      <div className="max-w-7xl mx-auto">
        {}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center ml-4 gap-2 text-emerald-700 hover:text-emerald-800 font-medium mb-3 md:mb-6 transition"
        >
          <FaArrowLeft />
          <span>Назад</span>
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          <div className="grid md:grid-cols-2">
            {}
            <div className="relative px-3 md:px-5 pt-5 md:pt-6 pb-1.5 md:py-1 bg-white border-b md:border-b-0  border-gray-100 overflow-hidden">
              {fullImages.length > 0 ? (
                <div className="w-full relative group/slider rounded-t-2xl touch-pan-y overflow-hidden">
                  <Slider ref={sliderRef} {...sliderSettings}>
                    {fullImages.map((img, index) => (
                      <div key={index} className="outline-none flex items-center justify-center">
                        <img
                          src={img}
                          alt={`${card.title} - ${index + 1}`}
                          className="w-full h-auto object-contain mx-auto"
                        />
                      </div>
                    ))}
                  </Slider>

                  {}
                  {fullImages.length > 1 && (
                    <>
                      <div 
                        onClick={() => sliderRef.current?.slickPrev()}
                        className="absolute left-0 top-0 bottom-0 w-1/4 z-20 cursor-pointer"
                        title="Попереднє фото"
                      />
                      <div 
                        onClick={() => sliderRef.current?.slickNext()}
                        className="absolute right-0 top-0 bottom-0 w-1/4 z-20 cursor-pointer"
                        title="Наступне фото"
                      />
                    </>
                  )}
                </div>
              ) : (
                <div className="w-full h-[350px] md:h-[600px] bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
                  <span className="text-8xl">🚜</span>
                </div>
              )}
              
              {}
              {card.is_available === 0 && (
                <div className="absolute top-12 right-12 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold shadow-lg z-20">
                  В оренді
                </div>
              )}
            </div>

            {}
            <div className="flex flex-col relative p-6 pr-14 md:p-12 md:pl-12">
              {}
              <button
                onClick={handleToggleFavorite}
                className={`absolute top-3 right-3 md:top-8 md:right-12 p-3 rounded-full shadow-md transition-all duration-300 ${
                  favorite 
                    ? "bg-red-50 text-red-500" 
                    : "bg-gray-50 text-gray-400 hover:text-red-400"
                }`}
              >
                <FaHeart className={`text-2xl ${favorite ? "fill-current" : ""}`} />
              </button>

              {card.category && (
                <span className="inline-block w-fit px-3 py-1 bg-emerald-100 text-emerald-800 text-sm rounded-full mb-4">
                  {card.category}
                </span>
              )}

              <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
                {card.title}
              </h1>

              {}
              {cardReviews.length > 0 && (
                <div className="flex items-center gap-2 mb-6 bg-emerald-50/50 w-fit px-3 py-1.5 rounded-lg border border-emerald-100">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <FaStar className="text-sm" />
                    <span className="text-base font-bold text-gray-900">
                      {(cardReviews.reduce((acc, r) => acc + (r.rating || 0), 0) / cardReviews.filter(r => r.rating).length || 0).toFixed(1)}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 border-l border-emerald-200 pl-2 uppercase tracking-wider">
                    {cardReviews.filter(r => r.rating).length} відгуків
                  </span>
                </div>
              )}

              <div className="flex items-baseline gap-1.5 md:gap-2 mb-6 whitespace-nowrap overflow-x-auto">
                {(card.sale_type === "rent" || card.sale_type === "both") && (
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl md:text-2xl font-bold text-emerald-600">
                      {card.price_per_day || 500}
                    </span>
                    <span className="text-sm md:text-base text-gray-500 font-medium">грн/день</span>
                  </div>
                )}
                
                {card.sale_type === "both" && (
                  <span className="text-gray-400 text-lg md:text-xl mx-0.5 md:mx-1">/</span>
                )}

                {(card.sale_type === "buy" || card.sale_type === "both") && (
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg md:text-xl font-bold text-emerald-700">
                      {card.price_buy}
                    </span>
                    <span className="text-xs md:text-sm text-gray-500 font-medium">грн (купівля)</span>
                  </div>
                )}
              </div>

              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
                  Характеристики
                </h2>
                {characteristics.length > 0 ? (
                  <ul className="grid gap-3 text-gray-700">
                    {characteristics.map((ch, idx) => (
                      <li key={idx} className="flex items-center justify-between gap-4 border-b border-gray-100 pb-2 last:border-0 group">
                        <span className="text-sm text-gray-600 group-hover:text-emerald-700 transition-colors">{ch}</span>
                        <div className="flex-grow border-b border-dotted border-gray-200 mx-2 hidden sm:block"></div>
                        <span className="text-emerald-500">
                          <FaStar className="text-[8px]" />
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm italic">Характеристики відсутні</p>
                )}
              </div>

              {}
              <div className="mt-auto">
                <button
                  onClick={handleRent}
                  disabled={alreadyInCart || card.is_available === 0}
                  className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold text-base transition w-fit ${
                    alreadyInCart
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : card.is_available === 0
                      ? "bg-red-100 text-red-600 cursor-not-allowed"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  {alreadyInCart
                    ? "Вже у кошику"
                    : card.is_available === 0
                    ? "Недоступно"
                    : "Додати в кошик"}
                </button>
              </div>
            </div>
          </div>

          {}
          <div className="border-t border-gray-200 px-4 py-8 md:p-12 max-w-6xl mx-auto w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Відгуки ({cardReviews.length})
              </h2>
              <button
                onClick={() => setShowReviewsSection(!showReviewsSection)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-semibold hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-gray-100 shadow-sm"
              >
                {showReviewsSection ? (
                  <>Приховати <FaChevronUp size={10} /></>
                ) : (
                  <>Показати <FaChevronDown size={10} /></>
                )}
              </button>
            </div>

            {showReviewsSection && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                {}
                <div className="mb-8 flex flex-wrap items-center gap-3">
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-tight">Фільтр:</span>
                  <div className="flex gap-2">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <button
                        key={star}
                        onClick={() => setFilterRating(filterRating === star ? null : star)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 transition-all ${
                          filterRating === star 
                            ? (star >= 4 ? "bg-green-50 border-green-500 text-green-700" : star === 3 ? "bg-amber-50 border-amber-500 text-amber-700" : "bg-red-50 border-red-500 text-red-700")
                            : "bg-white border-gray-100 text-gray-400 hover:border-emerald-200 hover:text-emerald-600"
                        }`}
                      >
                        <span className="text-sm font-bold">{star}</span>
                        <FaStar size={12} />
                      </button>
                    ))}
                  </div>
                  {filterRating && (
                    <button
                      onClick={() => setFilterRating(null)}
                      className="text-xs font-semibold text-gray-400 hover:text-red-500 uppercase tracking-tight ml-2"
                    >
                      Очистити
                    </button>
                  )}
                </div>

                {}
                <div className="mb-8 bg-gray-50 p-5 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Залишити відгук
                  </h3>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Ваша оцінка:</p>
                    {renderStars(rating, true, setRating)}
                  </div>

                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Ваш відгук про цю техніку..."
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-3 text-sm bg-white"
                  />
                  <button
                    onClick={handleAddReview}
                    disabled={!comment.trim()}
                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition text-sm font-semibold shadow-md"
                  >
                    Відправити відгук
                  </button>
                </div>

                {}
                {filteredReviews.length > 0 ? (
                  <div className="space-y-8">
                    {filteredReviews.map((rev) => {
                      const itemReplies = repliesMap[rev.id] || [];
                      const isExpanded = expandedReplies[rev.id];
                      const isOwnReview = user && (user.id === rev.user_id || user.username === rev.username);
                      
                      return (
                        <div key={rev.id} className="relative group/main">
                          {}
                          <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 relative z-10">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-[10px] uppercase">
                                    {(rev.username || user?.username || "A").charAt(0)}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-gray-900 text-sm leading-none">
                                      {rev.username || (isOwnReview ? user.username : "Анонім")}
                                    </span>
                                    <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-tight mt-1">
                                      {formatDate(rev.date)}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mt-1 bg-gray-50 px-3 py-1 rounded-full w-fit">
                                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-tighter">Оцінка:</span>
                                  {renderStars(rev.rating)}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4 relative">
                                {isOwnReview && (
                                  <div className="relative">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMenu(activeMenu === rev.id ? null : rev.id);
                                      }}
                                      className="p-2 text-gray-400 hover:text-emerald-600 transition-colors"
                                      title="Опції"
                                    >
                                      <FaEllipsisV className="text-sm" />
                                    </button>
                                    
                                    {activeMenu === rev.id && (
                                      <div className="absolute right-0 mt-4 w-40 bg-white border border-gray-100 rounded-lg shadow-xl z-30 py-1 animate-in fade-in zoom-in-95 duration-100">
                                        <button
                                          onClick={() => handleEditStart(rev)}
                                          className="w-full text-left px-6 py-3 text-xs md:text-sm font-semibold text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 flex items-center gap-2 transition-colors"
                                        >
                                          <FaEdit size={12} /> РЕДАГУВАТИ
                                        </button>
                                        <button
                                          onClick={() => handleDelete(rev.id)}
                                          className="w-full text-left px-5 py-3 text-xs md:text-sm font-semibold text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                        >
                                          <FaTrash size={12} /> ВИДАЛИТИ
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )}
                                <button
                                  onClick={() => setReplyTo(replyTo === rev.id ? null : rev.id)}
                                  className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-semibold hover:bg-emerald-600 hover:text-white transition-all"
                                >
                                  <FaReply className="text-[10px]" />
                                  ВІДПОВІСТИ
                                </button>
                              </div>
                            </div>
                            
                            <div className="relative">
                              {editingReview === rev.id ? (
                                <div className="mb-4 animate-in fade-in duration-300">
                                  {!rev.parent_id && (
                                    <div className="mb-3">
                                      <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Ваша оцінка:</p>
                                      {renderStars(editRating, true, setEditValueRating)}
                                    </div>
                                  )}
                                  <textarea
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="w-full px-4 py-3 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-emerald-50/10 mb-3 min-h-[100px]"
                                    autoFocus
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={handleEditCancel}
                                      className="px-4 py-2 text-[10px] font-semibold text-gray-400 hover:text-gray-600 uppercase"
                                    >
                                      Скасувати
                                    </button>
                                    <button
                                      onClick={() => handleEditSave(rev.id)}
                                      className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg text-[10px] font-semibold hover:bg-emerald-700 transition-all shadow-md"
                                    >
                                      <FaCheck /> ЗБЕРЕГТИ
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="text-gray-700 text-sm leading-relaxed mb-4 pl-1">
                                    {rev.text}
                                  </p>
                                  
                                  {}
                                  <div className="md:hidden flex justify-end -mt-2 mb-2">
                                    <button
                                      onClick={() => setReplyTo(replyTo === rev.id ? null : rev.id)}
                                      className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-semibold"
                                    >
                                      <FaReply className="text-[9px]" />
                                      ВІДПОВІСТИ
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>

                            {}
                            <div className="flex items-center gap-4 border-t border-gray-50 pt-4 mt-4">
                              {itemReplies.length > 0 && (
                                <button
                                  onClick={() => toggleReplies(rev.id)}
                                  className="flex items-center gap-2 text-[10px] font-semibold text-emerald-600 uppercase tracking-tight group"
                                >
                                  <span className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                    <FaChevronDown />
                                  </span>
                                  {isExpanded ? "Приховати" : `Показати ${itemReplies.length} ${itemReplies.length === 1 ? "відповідь" : "відповіді"}`}
                                </button>
                              )}
                            </div>

                            {}
                            {replyTo === rev.id && (
                              <div className="mt-6 pl-4 border-l-4 border-emerald-500 bg-emerald-50/30 p-4 rounded-r-xl animate-in fade-in slide-in-from-left-2 duration-300">
                                <h4 className="text-[10px] font-semibold text-emerald-700 uppercase tracking-tight mb-2">Ваша відповідь для {rev.username || "Анонім"}</h4>
                                <textarea
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Напишіть щось..."
                                  rows="2"
                                  className="w-full px-4 py-3 border border-emerald-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-3 text-sm bg-white shadow-inner"
                                />
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => setReplyTo(null)}
                                    className="px-4 py-2 text-gray-400 hover:text-gray-600 text-[10px] font-semibold uppercase tracking-tight"
                                  >
                                    Скасувати
                                  </button>
                                  <button
                                    onClick={() => handleAddReply(rev.id)}
                                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-[10px] font-semibold uppercase tracking-tight"
                                  >
                                    ВІДПРАВИТИ
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          {}
                          {isExpanded && itemReplies.length > 0 && (
                            <div className="mt-3 space-y-3 pl-8 md:pl-12 relative">
                              {}
                              <div className="absolute left-4 top-0 bottom-6 w-0.5 bg-gradient-to-b from-emerald-100 to-transparent md:left-6" />
                              
                              {itemReplies.map(reply => (
                                <div key={reply.id} className="relative group/reply">
                                  {}
                                  <div className="absolute -left-4 top-6 w-4 h-0.5 bg-emerald-100 md:-left-6 md:w-6" />
                                  
                                  <div className="bg-gray-50 border border-gray-100 p-4 rounded-xl hover:border-emerald-200 transition-colors relative">
                                    <div className="flex justify-between items-center mb-2">
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-[8px] uppercase">
                                          {(reply.username || "А").charAt(0)}
                                        </div>
                                        <span className="font-semibold text-gray-800 text-[11px]">{reply.username || (user && user.id === reply.user_id ? user.username : "Анонім")}</span>
                                        <span className="text-[8px] font-semibold text-gray-400 uppercase tracking-tight">
                                          {formatDate(reply.date)}
                                        </span>
                                      </div>
                                      
                                      {user && (user.id === reply.user_id || user.username === reply.username) && (
                                        <div className="relative">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setActiveMenu(activeMenu === reply.id ? null : reply.id);
                                            }}
                                            className="p-1 text-gray-400 hover:text-emerald-600 transition-colors"
                                          >
                                            <FaEllipsisV className="text-[10px]" />
                                          </button>

                                          {activeMenu === reply.id && (
                                            <div className="absolute right-0 mt-1 w-28 bg-white border border-gray-100 rounded-lg shadow-lg z-30 py-1 animate-in fade-in zoom-in-95 duration-100">
                                              <button
                                                onClick={() => handleEditStart(reply)}
                                                className="w-full text-left px-3 py-1.5 text-[10px] font-semibold text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 flex items-center gap-2"
                                              >
                                                <FaEdit size={10} /> РЕДАГУВАТИ
                                              </button>
                                              <button
                                                onClick={() => handleDelete(reply.id)}
                                                className="w-full text-left px-3 py-1.5 text-[10px] font-semibold text-red-500 hover:bg-red-50 flex items-center gap-2"
                                              >
                                                <FaTrash size={10} /> ВИДАЛИТИ
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    {editingReview === reply.id ? (
                                      <div className="pl-8 animate-in fade-in duration-300">
                                        <textarea
                                          value={editValue}
                                          onChange={(e) => setEditValue(e.target.value)}
                                          className="w-full px-3 py-2 border border-emerald-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-xs bg-white mb-2 min-h-[60px]"
                                          autoFocus
                                        />
                                        <div className="flex justify-end gap-2">
                                          <button
                                            onClick={handleEditCancel}
                                            className="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase"
                                          >
                                            Скасувати
                                          </button>
                                          <button
                                            onClick={() => handleEditSave(reply.id)}
                                            className="px-4 py-1 bg-emerald-600 text-white rounded-lg text-[9px] font-semibold shadow-sm"
                                          >
                                            ЗБЕРЕГТИ
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-gray-600 text-xs leading-relaxed pl-8">
                                        {reply.text}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-12 italic text-sm bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                    Тут поки що порожньо. Станьте першим, хто залишить відгук!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Detail;