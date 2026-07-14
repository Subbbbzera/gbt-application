import React, { useContext, useState } from "react";
import * as XLSX from "xlsx";
import Card from "../components/Card";
import { CartContext } from "../context/CartContext";
import AdminDashboard from "../components/AdminDashboard";
import AdminOrders from "../components/AdminOrders";
import AdminEditProduct from "../components/AdminEditProduct";
import AdminEditNews from "../components/AdminEditNews";
import { FaChartBar, FaPlusCircle, FaNewspaper, FaListUl, FaShoppingBag, FaEdit, FaFileExcel, FaChevronDown, FaChevronUp, FaSearch } from "react-icons/fa";

function Admin() {
  const {
    availableCards,
    addCardToAvailable,
    deleteCardFromAvailable,
    updateCard,
    newsPosts,
    addNewsPost,
    deleteNewsPost,
    updateNewsPost,
    sliderImages,
    addSliderImage,
    deleteSliderImage,
    coupons,
    addCoupon,
    deleteCoupon,
  } = useContext(CartContext);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingNews, setEditingNews] = useState(null);

  
  const [sliderFile, setSliderFile] = useState(null);
  const [isUploadingSlider, setIsUploadingSlider] = useState(false);

  
  const [exportOptions, setExportOptions] = useState({
    catalogCount: true,
    allOrders: true,
    last30DaysOrders: true
  });
  const [isExporting, setIsExporting] = useState(false);

  const [title, setTitle] = useState("");
  const [images, setImages] = useState([]); 
  const [characteristics, setCharacteristics] = useState("");
  const [category, setCategory] = useState("");
  const [pricePerDay, setPricePerDay] = useState("500");
  const [priceBuy, setPriceBuy] = useState("");
  const [saleType, setSaleType] = useState("rent");

  const [newsTitle, setNewsTitle] = useState("");
  const [newsText, setNewsText] = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState("");
  const [couponLimit, setCouponLimit] = useState("1");

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) setImages(files);
  };

  const addCard = () => {
    if (!title || images.length === 0 || !category) {
      alert("Заповніть всі поля та додайте хоча б одне фото!");
      return;
    }

    if ((saleType === 'rent' || saleType === 'both') && !pricePerDay) {
      alert("Вкажіть ціну оренди!");
      return;
    }

    if ((saleType === 'buy' || saleType === 'both') && !priceBuy) {
      alert("Вкажіть ціну покупки!");
      return;
    }

    const price = parseFloat(pricePerDay);
    const buyPrice = parseFloat(priceBuy);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("category", category);
    formData.append("characteristics", characteristics);
    if (saleType === 'rent' || saleType === 'both') {
      formData.append("price_per_day", price);
    }
    if (saleType === 'buy' || saleType === 'both') {
      formData.append("price_buy", buyPrice);
    }
    
    
    images.forEach(img => {
      formData.append("images", img);
    });
    
    formData.append("sale_type", saleType);

    addCardToAvailable(formData);

    setTitle(""); 
    setImages([]); 
    setCharacteristics(""); 
    setCategory("");
    setPricePerDay("500");
    setPriceBuy("");
    setSaleType("rent");
  };

  const handleUpdateCard = async (id, formData) => {
    const res = await updateCard(id, formData);
    if (res.success) {
      setEditingProduct(null);
    } else {
      alert(res.error);
    }
  };

  const handleUpdateNews = async (id, newsData) => {
    const res = await updateNewsPost(id, newsData);
    if (res.success) {
      setEditingNews(null);
    } else {
      alert("Помилка при оновленні новини");
    }
  };

  const addNews = () => {
    if (!newsTitle.trim() || !newsText.trim()) return;

    const now = new Date();
    const mysqlDateTime = now.toISOString().slice(0, 19).replace('T', ' ');

    const newPost = {
      title: newsTitle,
      text: newsText,
      date: mysqlDateTime,
    };

    addNewsPost(newPost);
    setNewsTitle("");
    setNewsText("");
  };

  const handleAddCoupon = async () => {
    if (!couponCode || !couponDiscount) {
      alert("Заповніть код та знижку");
      return;
    }
    const res = await addCoupon({
      code: couponCode,
      discount: parseInt(couponDiscount),
      usage_limit: parseInt(couponLimit)
    });
    if (res.success) {
      setCouponCode("");
      setCouponDiscount("");
      setCouponLimit("1");
    } else {
      alert(res.error);
    }
  };

  const handleSliderUpload = async () => {
    if (!sliderFile) return;
    setIsUploadingSlider(true);
    const formData = new FormData();
    formData.append("image", sliderFile);
    const res = await addSliderImage(formData);
    if (res.success) {
      setSliderFile(null);
    } else {
      alert("Помилка при завантаженні");
    }
    setIsUploadingSlider(false);
  };

  const handleGenerateExcel = async () => {
    setIsExporting(true);
    const token = localStorage.getItem('token');
    const API_URL = process.env.REACT_APP_API_URL;
    
    try {
      const wb = XLSX.utils.book_new();
      let mainWsData = [];

      
      const cardsRes = await fetch(`${API_URL}/cards`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const allCards = cardsRes.ok ? await cardsRes.json() : [];

      
      const ordersRes = await fetch(`${API_URL}/orders/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const allOrders = ordersRes.ok ? await ordersRes.json() : [];

      
      if (exportOptions.catalogCount) {
        mainWsData.push(["Показник", " ", "Значення"]);
        mainWsData.push([" "]); 

        
        mainWsData.push(["Всього одиниць техніки", " ", allCards.length]);
        allCards.forEach(c => {
          const price = c.price_buy ? `${c.price_buy} грн (Купівля)` : `${c.price_per_day} грн/день (Оренда)`;
          mainWsData.push([c.title, " ", price]);
        });
        mainWsData.push([" "]); 

        
        const availableList = allCards.filter(c => c.is_available === 1);
        mainWsData.push(["Доступно для замовлення", " ", availableList.length]);
        availableList.forEach(c => {
          const price = c.price_buy ? `${c.price_buy} грн (Купівля)` : `${c.price_per_day} грн/день (Оренда)`;
          mainWsData.push([c.title, " ", price]);
        });
        mainWsData.push([" "]); 

        
        if (exportOptions.allOrders) {
          const rentedList = allCards.filter(c => c.is_available === 0);
          mainWsData.push(["Зараз в оренді", " ", rentedList.length]);
          rentedList.forEach(c => {
            const price = c.price_buy ? `${c.price_buy} грн (Купівля)` : `${c.price_per_day} грн/день (Оренда)`;
            mainWsData.push([c.title, " ", price]);
          });
          mainWsData.push([" "]); 
        }
      }

      
      if (exportOptions.last30DaysOrders) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const last30Orders = allOrders.filter(o => new Date(o.created_at) >= thirtyDaysAgo && o.status !== 'cancelled');
        
        const soldItems = [];
        let totalRevenue = 0;
        
        last30Orders.forEach(o => {
          totalRevenue += parseFloat(o.total_amount);
          o.items.forEach(i => {
            soldItems.push({ title: i.card_title, price: i.subtotal });
          });
        });

        mainWsData.push(["Кількість які ми продавали або орендували за 30 днів", " ", soldItems.length]);
        soldItems.forEach(i => {
          mainWsData.push([i.title, " ", `${i.price} грн`]);
        });
        mainWsData.push([" "]); 
        mainWsData.push(["Сумарна ціна виручки", " ", `${totalRevenue} грн`]);
        mainWsData.push([" "]); 
      }

      if (mainWsData.length > 0) {
        const ws = XLSX.utils.aoa_to_sheet(mainWsData);
        XLSX.utils.book_append_sheet(wb, ws, "Звіт");
      }

      
      if (exportOptions.allOrders) {
        const ordersWsData = [
          ["Номер", "Клієнт", "Email", "Телефон", "Сума (грн)", "Статус", "Дата створення", "Товари"],
          ...allOrders.map(o => [
            o.order_number, 
            o.customer_name, 
            o.customer_email, 
            o.customer_phone, 
            o.total_amount, 
            o.status, 
            new Date(o.created_at).toLocaleString('uk-UA'),
            o.items.map(i => `${i.card_title} (${i.type === 'buy' ? 'Купівля' : 'Оренда'})`).join(", ")
          ])
        ];
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ordersWsData), "Всі замовлення");
      }

      if (wb.SheetNames.length > 0) {
        XLSX.writeFile(wb, `Звіт_Practical_${new Date().toISOString().split('T')[0]}.xlsx`);
      } else {
        alert("Виберіть хоча б один пункт для експорту");
      }
    } catch (err) {
      console.error("Excel generation error:", err);
      alert("Помилка при генерації файлу");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-end mb-8 gap-4">

        {}
        <div className="flex bg-white rounded-lg border p-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
              activeTab === "dashboard" ? "bg-emerald-600 text-white shadow" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Аналітика
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
              activeTab === "orders" ? "bg-emerald-600 text-white shadow" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Замовлення
          </button>
          <button
            onClick={() => setActiveTab("management")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
              activeTab === "management" ? "bg-emerald-600 text-white shadow" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Управління
          </button>
        </div>
      </div>

      {activeTab === "dashboard" ? (
        <AdminDashboard />
      ) : activeTab === "orders" ? (
        <AdminOrders />
      ) : (
        <div className="space-y-12 animate-fadeIn">
          {}
          <div className="bg-white shadow-md rounded-2xl p-8 border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
              <FaFileExcel className="text-emerald-600" />
              Експорт даних у Excel
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-emerald-50 transition">
                <input 
                  type="checkbox" 
                  checked={exportOptions.catalogCount}
                  onChange={() => setExportOptions(prev => ({...prev, catalogCount: !prev.catalogCount}))}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="font-semibold text-gray-700">Статус каталогу</span>
              </label>

              <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-emerald-50 transition">
                <input 
                  type="checkbox" 
                  checked={exportOptions.allOrders}
                  onChange={() => setExportOptions(prev => ({...prev, allOrders: !prev.allOrders}))}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="font-semibold text-gray-700">Всі замовлення</span>
              </label>

              <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-emerald-50 transition">
                <input 
                  type="checkbox" 
                  checked={exportOptions.last30DaysOrders}
                  onChange={() => setExportOptions(prev => ({...prev, last30DaysOrders: !prev.last30DaysOrders}))}
                  className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="font-semibold text-gray-700">Останні 30 днів</span>
              </label>
            </div>

            <button
              onClick={handleGenerateExcel}
              disabled={isExporting || !Object.values(exportOptions).some(v => v)}
              className="flex items-center gap-2 px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-bold disabled:bg-gray-300"
            >
              {isExporting ? "Генерація..." : "Згенерувати Excel звіт"}
            </button>
          </div>

          {}
          <div className="bg-white shadow-md rounded-2xl p-8 border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
              <FaPlusCircle className="text-emerald-500" />
              Додати техніку
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Назва техніки"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                />

                <textarea
                  placeholder="Характеристики (кожна з нового рядка)"
                  value={characteristics}
                  onChange={(e) => setCharacteristics(e.target.value)}
                  className="w-full border px-4 py-3 rounded-xl outline-none h-40 focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                />
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  {(saleType === "rent" || saleType === "both") && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ціна оренди (грн/день)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={pricePerDay}
                        onChange={(e) => setPricePerDay(Math.max(0, e.target.value))}
                        className="w-full border px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                      />
                    </div>
                  )}

                  {(saleType === "buy" || saleType === "both") && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ціна покупки (грн)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={priceBuy}
                        onChange={(e) => setPriceBuy(Math.max(0, e.target.value))}
                        className="w-full border px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
                        placeholder="Введіть ціну продажу"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-3 text-gray-700">Категорія</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      "Будівельна техніка",
                      "Сільськогосподарська техніка",
                      "Вантажна техніка",
                      "Спеціалізована техніка",
                    ].map((cat) => (
                      <label key={cat} className="flex items-center gap-3 p-2 rounded-lg hover:bg-emerald-50 cursor-pointer transition">
                        <input
                          type="radio"
                          value={cat}
                          checked={category === cat}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                        />
                        <span className="text-gray-700">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 text-gray-700">Тип пропозиції</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { label: "Тільки оренда", value: "rent" },
                      { label: "Тільки продаж", value: "buy" },
                      { label: "Оренда та продаж", value: "both" },
                    ].map((type) => (
                      <label key={type.value} className="flex items-center gap-3 p-2 rounded-lg hover:bg-emerald-50 cursor-pointer transition">
                        <input
                          type="radio"
                          value={type.value}
                          checked={saleType === type.value}
                          onChange={(e) => setSaleType(e.target.value)}
                          className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                        />
                        <span className="text-gray-700">{type.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Зображення техінки (можна вибрати декілька)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition"
                  />
                  {images.length > 0 && (
                    <p className="mt-2 text-xs text-emerald-600 font-medium">Вибрано фото: {images.length}</p>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={addCard}
              className="mt-8 px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-bold"
            >
              Опублікувати товар
            </button>
          </div>

          {}
          <div className="bg-white shadow-md rounded-2xl p-8 border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
              <FaNewspaper className="text-emerald-500" />
              Опублікувати новину
            </h2>
            <input
              type="text"
              placeholder="Заголовок новини"
              value={newsTitle}
              onChange={(e) => setNewsTitle(e.target.value)}
              className="w-full border px-4 py-3 rounded-xl mb-4 outline-none focus:ring-2 focus:ring-emerald-500 bg-gray-50"
            />
            <textarea
              placeholder="Текст новини..."
              value={newsText}
              onChange={(e) => setNewsText(e.target.value)}
              className="w-full border px-4 py-3 rounded-xl mb-4 outline-none h-32 focus:ring-2 focus:ring-emerald-500 bg-gray-50"
            />
            <button
              onClick={addNews}
              className="px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-bold"
            >
              Додати новину
            </button>
          </div>

          {}
          <div className="bg-white shadow-md rounded-2xl p-8 border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
              <FaPlusCircle className="text-purple-500" />
              Керування купонами (знижками)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <input
                type="text"
                placeholder="Ключове слово (напр. SALE2024)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="w-full border px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
              />
              <input
                type="number"
                min="0"
                placeholder="Знижка (%)"
                value={couponDiscount}
                onChange={(e) => setCouponDiscount(Math.max(0, e.target.value))}
                className="w-full border px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
              />
              <input
                type="number"
                min="0"
                placeholder="Ліміт використань"
                value={couponLimit}
                onChange={(e) => setCouponLimit(Math.max(0, e.target.value))}
                className="w-full border px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
              />
            </div>
            <button
              onClick={handleAddCoupon}
              className="px-8 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-bold"
            >
              Створити купон
            </button>

            <div className="mt-8">
              <h3 className="font-bold mb-4 text-gray-700">Список активних купонів</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 uppercase text-xs font-bold">
                      <th className="px-4 py-3 border-b">Код</th>
                      <th className="px-4 py-3 border-b">Знижка</th>
                      <th className="px-4 py-3 border-b">Використано</th>
                      <th className="px-4 py-3 border-b">Дія</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-3 border-b font-bold text-purple-700">{c.code}</td>
                        <td className="px-4 py-3 border-b">{c.discount}%</td>
                        <td className="px-4 py-3 border-b">{c.used_count} / {c.usage_limit}</td>
                        <td className="px-4 py-3 border-b">
                          <button
                            onClick={() => {
                              if(window.confirm("Видалити цей купон?")) {
                                deleteCoupon(c.id);
                              }
                            }}
                            className="text-red-500 hover:text-red-700 font-bold"
                          >
                            Видалити
                          </button>
                        </td>
                      </tr>
                    ))}
                    {coupons.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-gray-400 italic">
                          Купонів ще не створено
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {}
          <div className="bg-white shadow-md rounded-2xl p-8 border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-800">
              <FaShoppingBag className="text-emerald-500" />
              Картинки слайдера (головна сторінка)
            </h2>
            
            <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSliderFile(e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition"
              />
              <button
                onClick={handleSliderUpload}
                disabled={!sliderFile || isUploadingSlider}
                className="px-8 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-bold disabled:bg-gray-300 whitespace-nowrap"
              >
                {isUploadingSlider ? "Завантаження..." : "Додати слайд"}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {sliderImages.map((img) => (
                <div key={img.id} className="relative group rounded-xl overflow-hidden border">
                  <img
                    src={img.image_path.startsWith('/images') ? img.image_path : `${process.env.REACT_APP_API_URL}${img.image_path}`}
                    alt="Слайд"
                    className="w-full h-32 object-cover"
                  />
                  <button
                    onClick={() => {
                      if(window.confirm("Видалити цей слайд?")) {
                        deleteSliderImage(img.id);
                      }
                    }}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200"
                  >
                    <span className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold">Видалити</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Активний автопарк</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {availableCards.map((c) => {
                let displayImage = null;
                const API_URL = process.env.REACT_APP_API_URL || "";
                if (c.image) {
                  try {
                    const parsed = typeof c.image === 'string' && c.image.startsWith('[') ? JSON.parse(c.image) : c.image;
                    const imagePath = Array.isArray(parsed) ? parsed[0] : parsed;
                    if (imagePath) {
                      displayImage = imagePath.startsWith('http') ? imagePath : `${API_URL}${imagePath}`;
                    }
                  } catch (e) {
                    displayImage = c.image.startsWith('http') ? c.image : `${API_URL}${c.image}`;
                  }
                }

                return (
                  <div key={c.id} className="relative group">
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-xl transition duration-300">
                      {displayImage && (
                        <img
                          src={displayImage}
                          alt={c.title}
                          className="w-full h-56 object-cover"
                        />
                      )}
                      <div className="p-5">
                        <h3 className="font-bold text-xl mb-1 text-gray-900">{c.title}</h3>
                        <p className="text-sm text-emerald-600 font-medium mb-3">{c.category}</p>
                        <div className="space-y-1">
                          {(c.sale_type === 'rent' || c.sale_type === 'both') && (
                            <p className="text-gray-900 font-bold text-lg">
                              {c.price_per_day} <span className="text-sm font-normal text-gray-500">грн/день</span>
                            </p>
                          )}
                          {(c.sale_type === 'buy' || c.sale_type === 'both') && (
                            <p className="text-emerald-700 font-bold text-lg">
                              {c.price_buy} <span className="text-sm font-normal text-gray-500">грн (купівля)</span>
                            </p>
                          )}
                          <div className="flex justify-between items-center mt-2">
                            {c.is_available === 0 ? (
                              <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                В оренді/продано
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                Доступно
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        onClick={() => setEditingProduct(c)}
                        className="p-2 bg-emerald-600 text-white rounded-full shadow-xl hover:bg-emerald-700 transition"
                        title="Редагувати"
                      >
                        <FaEdit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          if(window.confirm("Видалити цю позицію?")) {
                            deleteCardFromAvailable(c.id);
                          }
                        }}
                        className="p-2 bg-red-600 text-white rounded-full shadow-xl hover:bg-red-700 transition"
                        title="Видалити"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {}
          <div className="mt-8 pb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Опубліковані новини</h2>
            <div className="grid grid-cols-1 gap-4">
              {newsPosts.map((n) => (
                <div
                  key={n.id}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative group"
                >
                  <p className="text-sm text-gray-400 font-medium mb-1">{new Date(n.date).toLocaleDateString('uk-UA')}</p>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{n.title}</h3>
                  <p className="text-gray-600 line-clamp-2">{n.text}</p>
                  <div className="absolute top-6 right-6 flex gap-2">
                    <button
                      onClick={() => setEditingNews(n)}
                      className="p-2 text-gray-400 hover:text-emerald-600 transition duration-200"
                      title="Редагувати"
                    >
                      <FaEdit className="h-6 w-6" />
                    </button>
                    <button
                      onClick={() => {
                        if(window.confirm("Видалити новину?")) {
                          deleteNewsPost(n.id);
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 transition duration-200"
                      title="Видалити"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {editingProduct && (
        <AdminEditProduct
          product={editingProduct}
          onSave={handleUpdateCard}
          onCancel={() => setEditingProduct(null)}
        />
      )}

      {editingNews && (
        <AdminEditNews
          news={editingNews}
          onSave={handleUpdateNews}
          onCancel={() => setEditingNews(null)}
        />
      )}
    </div>
  );
}

export default Admin;
