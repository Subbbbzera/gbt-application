import React, { useState, useEffect } from "react";
import { FaTimes, FaSave } from "react-icons/fa";

const AdminEditProduct = ({ product, onSave, onCancel }) => {
  const [title, setTitle] = useState(product.title || "");
  const [category, setCategory] = useState(product.category || "");
  const [characteristics, setCharacteristics] = useState(product.characteristics || "");
  const [pricePerDay, setPricePerDay] = useState(product.price_per_day || "");
  const [priceBuy, setPriceBuy] = useState(product.price_buy || "");
  const [saleType, setSaleType] = useState(product.sale_type || "rent");
  const [images, setImages] = useState([]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) setImages(files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("characteristics", characteristics);
    formData.append("sale_type", saleType);
    
    if (saleType === "rent" || saleType === "both") {
      formData.append("price_per_day", pricePerDay);
    }
    if (saleType === "buy" || saleType === "both") {
      formData.append("price_buy", priceBuy);
    }
    
    if (images.length > 0) {
      images.forEach(img => {
        formData.append("images", img);
      });
    }

    onSave(product.id, formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">Редагувати товар</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition">
            <FaTimes size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Назва</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Характеристики</label>
                <textarea
                  value={characteristics}
                  onChange={(e) => setCharacteristics(e.target.value)}
                  className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none h-40 bg-gray-50"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Категорія</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50"
                  required
                >
                  <option value="Будівельна техніка">Будівельна техніка</option>
                  <option value="Сільськогосподарська техніка">Сільськогосподарська техніка</option>
                  <option value="Вантажна техніка">Вантажна техніка</option>
                  <option value="Спеціалізована техніка">Спеціалізована техніка</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Тип пропозиції</label>
                <select
                  value={saleType}
                  onChange={(e) => setSaleType(e.target.value)}
                  className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50"
                >
                  <option value="rent">Тільки оренда</option>
                  <option value="buy">Тільки продаж</option>
                  <option value="both">Оренда та продаж</option>
                </select>
              </div>

              {(saleType === "rent" || saleType === "both") && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ціна оренди (грн/день)</label>
                  <input
                    type="number"
                    min="0"
                    value={pricePerDay}
                    onChange={(e) => setPricePerDay(Math.max(0, e.target.value))}
                    className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50"
                  />
                </div>
              )}

              {(saleType === "buy" || saleType === "both") && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ціна покупки (грн)</label>
                  <input
                    type="number"
                    min="0"
                    value={priceBuy}
                    onChange={(e) => setPriceBuy(Math.max(0, e.target.value))}
                    className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Змінити зображення</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition"
                />
                
                {}
                {product.image && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Поточні фото (перша - головна):</p>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        let currentImages = [];
                        const API_URL = process.env.REACT_APP_API_URL || "";
                        try {
                          const parsed = typeof product.image === 'string' && product.image.startsWith('[') ? JSON.parse(product.image) : product.image;
                          currentImages = Array.isArray(parsed) ? parsed : [parsed];
                        } catch (e) {
                          currentImages = [product.image];
                        }
                        
                        return currentImages.map((img, idx) => (
                          <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border">
                            <img 
                              src={img.startsWith('http') ? img : `${API_URL}${img}`} 
                              alt="preview" 
                              className="w-full h-full object-cover"
                            />
                            {idx === 0 && (
                              <div className="absolute top-0 left-0 bg-emerald-500 text-white text-[8px] px-1 font-bold">TOP</div>
                            )}
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2"
            >
              Зберегти зміни
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition"
            >
              Скасувати
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditProduct;
