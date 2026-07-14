import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { FaStar, FaRegStar, FaCommentDots } from "react-icons/fa";

function Card({ id, title, image, price_per_day, price_buy, category, sale_type, onRent, reviews_count = 0, avg_rating = 0 }) {
  const navigate = useNavigate();
  const { addToFavorites, removeFromFavorites, isFavorite } = useCart();

  const favorite = isFavorite(id);

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    if (favorite) {
      removeFromFavorites(id);
    } else {
      addToFavorites({ id, title, image, price_per_day, price_buy, category, sale_type });
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const roundedRating = Math.round(rating || 0);
    for (let i = 1; i <= 5; i++) {
      if (i <= roundedRating) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-gray-300" />);
      }
    }
    return stars;
  };

  
  let displayImage = null;
  const API_URL = process.env.REACT_APP_API_URL || "";

  try {
    const parsed = typeof image === 'string' && image.startsWith('[') ? JSON.parse(image) : image;
    const imagePath = Array.isArray(parsed) ? parsed[0] : parsed;
    
    if (imagePath) {
      displayImage = imagePath.startsWith('http') ? imagePath : `${API_URL}${imagePath}`;
    }
  } catch (e) {
    displayImage = image && image.startsWith('http') ? image : `${API_URL}${image}`;
  }

  return (
    <div className="relative group rounded-xl overflow-hidden shadow-sm transition-all duration-500 hover:shadow-xl bg-[#f7f7f7] h-full flex flex-col border-emerald-200 border-[1px]">
      {}
      <button
        onClick={handleToggleFavorite}
        className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all duration-300 group/fav"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-6 w-6 transition-colors duration-300 ${
            favorite ? "fill-red-500 text-red-500" : "text-gray-400 group-hover/fav:text-red-400"
          }`}
          fill={favorite ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

      {}
      {displayImage && (
        <img
          src={displayImage}
          alt={title}
          onClick={() => navigate(`/detail/${id}`)}
          className="w-full h-[280px] object-cover rounded-t-xl cursor-pointer"
        />
      )}

      {}
      <div className="border-t border-emerald-500 w-full"></div>

      {}
      <div className="p-3 flex-grow flex flex-col gap-1">
        {}
        <h3 className="text-lg font-bold text-gray-800 text-center line-clamp-2 px-2">
          {title}
        </h3>

        {}
        <div className="flex items-center justify-between px-2 mt-auto">
          <div className="flex items-center gap-3">
            <div className="flex text-sm">
              {renderStars(avg_rating)}
            </div>
            <div className="flex items-center gap-1 text-emerald-600/70">
              <FaCommentDots className="text-[12px]" />
              <span className="text-xs font-semibold">
                ({reviews_count})
              </span>
            </div>
          </div>

          <div className="text-[13px] text-gray-500 flex flex-col items-end leading-tight">
            {price_per_day && (
              <span>
                <span className="font-bold text-emerald-600">{price_per_day}</span> <span className="text-[11px] text-gray-400 font-bold uppercase">грн/д</span>
              </span>
            )}
            {price_buy && (
              <span>
                <span className="font-bold text-emerald-700">{price_buy}</span> <span className="text-[11px] text-gray-400 font-bold uppercase">грн</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;
