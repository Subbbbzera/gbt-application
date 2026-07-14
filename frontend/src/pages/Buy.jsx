import React, { useContext, useState } from "react";
import Card from "../components/Card";
import { CartContext } from "../context/CartContext";

function Buy() {
  const { addToCart, availableCards, loading } = useContext(CartContext);
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 12;

  const toggleCategory = (cat) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    setCurrentPage(1);
  };

  const filteredCards = availableCards.filter(card => {
    const matchSearch = card.title.toLowerCase().startsWith(search.toLowerCase());
    const matchCategory = selectedCategories.length === 0 || selectedCategories.includes(card.category);
    const matchSaleType = card.sale_type === 'buy' || card.sale_type === 'both';
    
    
    const price = parseFloat(card.price_per_day) || 0;
    const minPrice = parseFloat(priceRange.min) || 0;
    const maxPrice = parseFloat(priceRange.max) || Infinity;
    const matchPrice = price >= minPrice && price <= maxPrice;
    
    return matchSearch && matchCategory && matchPrice && matchSaleType;
  });

  
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentCards = filteredCards.slice(indexOfFirstCard, indexOfLastCard);
  const totalPages = Math.ceil(filteredCards.length / cardsPerPage);

  const handleBuy = (card) => {
    addToCart(card);
  };

  const handlePriceChange = (field, value) => {
    setPriceRange(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  if (loading) {
    return <p className="text-center mt-10 text-gray-700">Завантаження карток...</p>;
  }

  return (
    <div className="flex flex-col gap-8 max-w-[1440px] mx-auto px-4 md:px-8 py-10">
      <div className="flex gap-8">
        {}
        <div className="w-1/4 h-fit bg-gray-50 border rounded-2xl p-4 flex-shrink-0 space-y-6 sticky top-28">
          <h3 className="text-xl font-bold text-emerald-900">Фільтр</h3>
          
          {}
          <div>
            <label className="block text-sm font-medium mb-2">Пошук</label>
            <input
              type="text"
              placeholder="Назва техніки..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {}
          <div>
            <h4 className="font-medium mb-2">Ціна (грн)</h4>
            <div className="space-y-2">
              <input
                type="number"
                placeholder="Від"
                value={priceRange.min}
                onChange={e => handlePriceChange('min', e.target.value)}
                min="0"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <input
                type="number"
                placeholder="До"
                value={priceRange.max}
                onChange={e => handlePriceChange('max', e.target.value)}
                min="0"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          {}
          <div>
            <h4 className="font-medium mb-2">Категорія</h4>
            <ul className="space-y-2 text-gray-700">
              {["Будівельна техніка", "Сільськогосподарська техніка", "Вантажна техніка", "Спеціалізована техніка"].map(cat => (
                <li key={cat}>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="cursor-pointer"
                    />
                    <span>{cat}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {}
          <button
            onClick={() => {
              setSearch("");
              setSelectedCategories([]);
              setPriceRange({ min: "", max: "" });
              setCurrentPage(1);
            }}
            className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Скинути фільтри
          </button>
        </div>

        {}
        <div className="w-3/4">
          {}
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-600">
              Знайдено: <span className="font-semibold">{filteredCards.length}</span>
            </p>
            {priceRange.min || priceRange.max ? (
              <p className="text-sm text-gray-500">
                Ціна: {priceRange.min || "0"} - {priceRange.max || "∞"} грн
              </p>
            ) : null}
          </div>

          {currentCards.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">Нічого не знайдено</p>
              <p className="text-gray-500 mt-2">Спробуйте змінити фільтри</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentCards.map(card => (
                <Card
                  key={card.id}
                  id={card.id}
                  title={card.title}
                  image={`${process.env.REACT_APP_API_URL}${card.image}`}
                  price_per_day={card.price_per_day}
                  category={card.category}
                  onRent={() => handleBuy(card)}
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
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border bg-white text-emerald-700 border-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Назад
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
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
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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

export default Buy;