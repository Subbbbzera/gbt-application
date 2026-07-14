import React, { useContext, useState } from "react";
import Card from "../components/Card";
import { CartContext } from "../context/CartContext";
import { FaFilter, FaTimes, FaChevronDown, FaChevronUp } from "react-icons/fa";

function Catalog() {
  const { addToCart, availableCards, loading, catalogFilters, setCatalogFilters } = useContext(CartContext);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    saleType: false,
    categories: false
  });
  
  
  const [editingPrice, setEditingPrice] = useState(null); 

  const { search, selectedCategories, saleTypeFilter, rentPriceRange, buyPriceRange, sortBy, currentPage } = catalogFilters;
  const cardsPerPage = 12;

  
  const allRentPrices = availableCards.map(c => parseFloat(c.price_per_day)).filter(p => !isNaN(p) && p > 0);
  const absoluteMinRent = 0;
  const absoluteMaxRent = allRentPrices.length ? Math.max(...allRentPrices) : 10000;

  const allBuyPrices = availableCards.map(c => parseFloat(c.price_buy)).filter(p => !isNaN(p) && p > 0);
  const absoluteMinBuy = 0;
  const absoluteMaxBuy = allBuyPrices.length ? Math.max(...allBuyPrices) : 1000000;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateFilters = (newFilters) => {
    setCatalogFilters(prev => ({ ...prev, ...newFilters, currentPage: 1 }));
  };

  const toggleCategory = (cat) => {
    const newCategories = selectedCategories.includes(cat)
      ? selectedCategories.filter(c => c !== cat)
      : [...selectedCategories, cat];
    updateFilters({ selectedCategories: newCategories });
  };

  const categoriesList = ["Будівельна техніка", "Сільськогосподарська техніка", "Вантажна техніка", "Спеціалізована техніка"];
  const saleTypes = [
    {id: 'all', label: 'Все'},
    {id: 'rent', label: 'Оренда'},
    {id: 'buy', label: 'Покупка'}
  ];

  const sortOptions = [
    {id: 'newest', label: 'Спочатку нові'},
    {id: 'price_asc', label: 'Від дешевих до дорогих'},
    {id: 'price_desc', label: 'Від дорогих до дешевих'},
    {id: 'rating_desc', label: 'Найвищий рейтинг'},
    {id: 'rating_asc', label: 'Найнижчий рейтинг'}
  ];

  let filteredCards = availableCards.filter(card => {
    const matchSearch = card.title.toLowerCase().startsWith(search.toLowerCase());
    const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(card.category);
    
    const matchSaleType = saleTypeFilter === "all" || 
                         card.sale_type === "both" || 
                         card.sale_type === saleTypeFilter;

    const rentPrice = parseFloat(card.price_per_day) || 0;
    const minRent = parseFloat(rentPriceRange.min) || 0;
    const maxRent = parseFloat(rentPriceRange.max) || Infinity;
    const matchRentPrice = rentPrice >= minRent && rentPrice <= (rentPriceRange.max || Infinity);

    const buyPrice = parseFloat(card.price_buy) || 0;
    const minBuy = parseFloat(buyPriceRange.min) || 0;
    const maxBuy = parseFloat(buyPriceRange.max) || Infinity;
    const matchBuyPrice = buyPrice >= minBuy && buyPrice <= (buyPriceRange.max || Infinity);
    
    return matchSearch && matchCategory && matchSaleType && matchRentPrice && matchBuyPrice;
  });

  
  filteredCards.sort((a, b) => {
    if (sortBy === "price_asc") {
      const priceA = parseFloat(a.price_per_day) || parseFloat(a.price_buy) || 0;
      const priceB = parseFloat(b.price_per_day) || parseFloat(b.price_buy) || 0;
      return priceA - priceB;
    }
    if (sortBy === "price_desc") {
      const priceA = parseFloat(a.price_per_day) || parseFloat(a.price_buy) || 0;
      const priceB = parseFloat(b.price_per_day) || parseFloat(b.price_buy) || 0;
      return priceB - priceA;
    }
    if (sortBy === "rating_asc") {
      return (parseFloat(a.avg_rating) || 0) - (parseFloat(b.avg_rating) || 0);
    }
    if (sortBy === "rating_desc") {
      return (parseFloat(b.avg_rating) || 0) - (parseFloat(a.avg_rating) || 0);
    }
    return 0; 
  });

  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredCards.slice(indexOfFirstCard, indexOfLastCard);
  const totalPages = Math.ceil(filteredCards.length / cardsPerPage);

  if (loading) {
    return <p className="text-center mt-10 text-gray-700">Завантаження каталогу...</p>;
  }

  
  const PriceDisplay = ({ type, bound, value, onChange }) => {
    const isEditing = editingPrice === `${type}_${bound}`;
    return (
      <div className="flex flex-col items-center">
        {isEditing ? (
          <input
            autoFocus
            type="number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={() => setEditingPrice(null)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingPrice(null)}
            className="w-16 px-1 py-0.5 border border-emerald-50 rounded text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
          />
        ) : (
          <span 
            onClick={() => setEditingPrice(`${type}_${bound}`)}
            className="text-xs font-bold text-emerald-700 cursor-pointer hover:underline"
          >
            {value || (bound === 'min' ? '0' : 'max')}
          </span>
        )}
      </div>
    );
  };

  
  const FilterFields = () => (
    <>
      <div className="flex justify-between items-center lg:block">
        <h3 className="text-xl font-bold text-emerald-900">Фільтр</h3>
        <button onClick={() => setIsMobileFilterOpen(false)} className="lg:hidden p-2 text-gray-400">
          <FaTimes size={20} />
        </button>
      </div>
      
      {}
      <div>
        <label className="block text-sm font-medium mb-2">Пошук</label>
        <input
          type="text"
          placeholder="Назва техніки..."
          value={search}
          onChange={e => updateFilters({ search: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
        />
      </div>

      {}
      <div className="relative">
        <h4 className="font-bold text-gray-800 mb-2">Сортувати</h4>
        <button
          onClick={() => setIsSortOpen(!isSortOpen)}
          className="w-full flex justify-between items-center px-3 py-2 border rounded-lg hover:bg-gray-100 transition text-sm"
        >
          <span>{sortOptions.find(o => o.id === sortBy)?.label}</span>
          <FaChevronDown className={`transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} />
        </button>
        {isSortOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
            {sortOptions.map(option => (
              <button
                key={option.id}
                onClick={() => {
                  updateFilters({ sortBy: option.id });
                  setIsSortOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-emerald-50 transition ${sortBy === option.id ? 'bg-emerald-100 text-emerald-800 font-bold' : 'text-gray-700'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {}
      <div className="border-b pb-4">
        <button 
          onClick={() => toggleSection('saleType')}
          className="w-full flex justify-between items-center py-2 group"
        >
          <h4 className="font-bold text-gray-800 group-hover:text-emerald-700 transition">Тип пропозиції</h4>
          {expandedSections.saleType ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
        </button>
        {expandedSections.saleType && (
          <div className="flex flex-col gap-2 mt-2 animate-in slide-in-from-top-2 duration-200">
            {saleTypes.map(type => (
              <label key={type.id} className="flex items-center gap-2 cursor-pointer hover:text-emerald-600 transition">
                <input
                  type="radio"
                  name="saleType"
                  checked={saleTypeFilter === type.id}
                  onChange={() => updateFilters({ saleTypeFilter: type.id })}
                  className="cursor-pointer text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm">{type.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {}
      <div className="border-b pb-4">
        <button 
          onClick={() => toggleSection('categories')}
          className="w-full flex justify-between items-center py-2 group"
        >
          <h4 className="font-bold text-gray-800 group-hover:text-emerald-700 transition">Категорія</h4>
          {expandedSections.categories ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
        </button>
        {expandedSections.categories && (
          <div className="flex flex-col gap-2 mt-2 animate-in slide-in-from-top-2 duration-200">
            {categoriesList.map(cat => (
              <label key={cat} className="flex items-center gap-2 cursor-pointer hover:text-emerald-600 transition">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="cursor-pointer text-emerald-600 focus:ring-emerald-500 rounded"
                />
                <span className="text-sm">{cat}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {}
      <div className="space-y-4">
        <h4 className="font-bold text-gray-800">Ціна оренди</h4>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500">Бюджет до:</span>
          <div className="flex items-center gap-1">
            <PriceDisplay 
              type="rent" bound="max" value={rentPriceRange.max} 
              onChange={val => updateFilters({ rentPriceRange: { ...rentPriceRange, max: val } })} 
            />
            <span className="text-xs font-bold text-emerald-700">грн</span>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max={absoluteMaxRent}
          value={rentPriceRange.max || absoluteMaxRent}
          onChange={e => updateFilters({ rentPriceRange: { ...rentPriceRange, max: e.target.value } })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
        />
      </div>

      {}
      <div className="space-y-4">
        <h4 className="font-bold text-gray-800">Ціна покупки</h4>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-gray-500">Бюджет до:</span>
          <div className="flex items-center gap-1">
            <PriceDisplay 
              type="buy" bound="max" value={buyPriceRange.max} 
              onChange={val => updateFilters({ buyPriceRange: { ...buyPriceRange, max: val } })} 
            />
            <span className="text-xs font-bold text-emerald-700">грн</span>
          </div>
        </div>
        <input
          type="range"
          min="0"
          max={absoluteMaxBuy}
          value={buyPriceRange.max || absoluteMaxBuy}
          onChange={e => updateFilters({ buyPriceRange: { ...buyPriceRange, max: e.target.value } })}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
        />
      </div>

      {}
      <button
        onClick={() => {
          setCatalogFilters({
            search: "",
            selectedCategories: [],
            saleTypeFilter: "all",
            rentPriceRange: { min: "", max: "" },
            buyPriceRange: { min: "", max: "" },
            currentPage: 1
          });
        }}
        className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-sm font-bold shadow-sm"
      >
        Скинути фільтри
      </button>

      {}
      <button
        onClick={() => setIsMobileFilterOpen(false)}
        className="lg:hidden w-full py-3 bg-emerald-600 text-white rounded-lg font-bold mt-4"
      >
        Застосувати
      </button>
    </>
  );

  return (
    <div className="flex flex-col gap-8 max-w-[1440px] mx-auto px-4 md:px-8 py-6 lg:py-10">
      
      {}
      <div className="flex lg:hidden justify-between items-center bg-white p-2 border rounded-xl shadow-sm">
        <p className="text-gray-600 text-sm">Знайдено: <b>{filteredCards.length}</b></p>
        <button 
          onClick={() => setIsMobileFilterOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm"
        >
          <FaFilter size={12} />
          Фільтри
        </button>
      </div>

      <div className="flex gap-8">
        {}
        <div className="hidden lg:block w-1/4 h-fit bg-gray-50 border rounded-2xl p-4 flex-shrink-0 space-y-6 sticky top-28">
          <FilterFields />
        </div>

        {}
        <div 
          className={`fixed inset-0 z-[100] lg:hidden transition-opacity duration-300 ${
            isMobileFilterOpen ? "opacity-100 visible" : "opacity-0 pointer-events-none invisible"
          }`}
        >
          {}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setIsMobileFilterOpen(false)} 
          />
          
          {}
          <div 
            className={`absolute top-0 left-0 bottom-0 w-[80%] max-w-[320px] bg-white shadow-2xl p-6 overflow-y-auto space-y-6 transition-transform duration-300 ease-in-out ${
              isMobileFilterOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <FilterFields />
          </div>
        </div>

        {}
        <div className="w-full lg:w-3/4">
          <div className="hidden lg:flex mb-6 justify-between items-center">
            <p className="text-gray-600">
              Знайдено: <span className="font-semibold">{filteredCards.length}</span>
            </p>
          </div>

          {currentCards.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">Нічого не знайдено</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {currentCards.map(card => (
                <Card
                  key={card.id}
                  id={card.id}
                  title={card.title}
                  image={card.image}
                  price_per_day={card.price_per_day}
                  price_buy={card.price_buy}
                  category={card.category}
                  sale_type={card.sale_type}
                  reviews_count={card.reviews_count}
                  avg_rating={card.avg_rating}
                  onRent={() => addToCart(card)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 mt-6">
          <button
            onClick={() => setCatalogFilters(p => ({...p, currentPage: Math.max(1, p.currentPage - 1)}))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border bg-white text-emerald-700 border-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Назад
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCatalogFilters(p => ({...p, currentPage: i + 1}))}
              className={`px-4 py-2 rounded-lg border ${
                currentPage === i + 1
                  ? "bg-emerald-700 text-white"
                  : "bg-white text-emerald-700 border-emerald-700 hover:bg-emerald-100"
              } transition`}
            >
              {i + 1}
            </button>
          ))}
          
          <button
            onClick={() => setCatalogFilters(p => ({...p, currentPage: Math.min(totalPages, p.currentPage + 1)}))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg border bg-white text-emerald-700 border-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Далі
          </button>
        </div>
      )}
    </div>
  );
}

export default Catalog;
