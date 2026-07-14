import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { FaTrash, FaCalendarAlt, FaTruck, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCheckCircle, FaFileAlt, FaCloudUploadAlt } from 'react-icons/fa';

const Cart = () => {
  const { cartItems, removeFromCart, createOrder, validateCoupon } = useCart();
  const { user } = useAuth();
  
  const [selectedItems, setSelectedItems] = useState([]);
  const [itemTypes, setItemTypes] = useState({}); 
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customerName, setCustomerName] = useState(user?.username || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [documentFile, setDocumentFile] = useState(null);

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  
  const [orderStatus, setOrderStatus] = useState({ loading: false, error: null, success: false });
  const [showPromoInput, setShowPromoInput] = useState(false);

  
  const today = new Date().toISOString().split('T')[0];

  
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://static.liqpay.ua/libjs/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      const existingScript = document.querySelector('script[src="https://static.liqpay.ua/libjs/checkout.js"]');
      if (existingScript) document.body.removeChild(existingScript);
    };
  }, []);

  useEffect(() => {
    if (cartItems.length > 0) {
      if (selectedItems.length === 0) {
        setSelectedItems(cartItems.map(item => item.id));
      }
      
      const newTypes = { ...itemTypes };
      cartItems.forEach(item => {
        if (!newTypes[item.id]) {
          newTypes[item.id] = item.sale_type === 'buy' ? 'buy' : 'rent';
        }
      });
      setItemTypes(newTypes);
    }
  }, [cartItems]);

  const toggleItemSelection = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const handleTypeChange = (id, type) => {
    setItemTypes(prev => ({ ...prev, [id]: type }));
  };

  const handleApplyCoupon = async () => {
    if (!couponInput) return;
    setCouponError('');
    const res = await validateCoupon(couponInput);
    if (res.success) {
      setAppliedCoupon(res.data);
      setCouponInput('');
    } else {
      setCouponError(res.error);
      setAppliedCoupon(null);
    }
  };

  const calculateTotal = () => {
    let days = 0;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }

    let total = cartItems
      .filter(item => selectedItems.includes(item.id))
      .reduce((sum, item) => {
        const type = itemTypes[item.id] || 'rent';
        if (type === 'buy') {
          return sum + (parseFloat(item.price_buy) || 0);
        } else {
          return sum + (parseFloat(item.price_per_day) * (days > 0 ? days : 0));
        }
      }, 0);

    if (appliedCoupon) {
      total = total * (1 - appliedCoupon.discount / 100);
    }
    
    return total;
  };

  const calculatePrepayment = () => {
    let days = 0;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }

    let prepayment = cartItems
      .filter(item => selectedItems.includes(item.id))
      .reduce((sum, item) => {
        const type = itemTypes[item.id] || 'rent';
        if (type === 'buy') {
          return sum + (parseFloat(item.price_buy) * 0.1 || 0);
        } else {
          
          const weeks = days > 0 ? Math.ceil(days / 7) : 1;
          return sum + (parseFloat(item.price_per_day) * weeks);
        }
      }, 0);

    if (appliedCoupon) {
      prepayment = prepayment * (1 - appliedCoupon.discount / 100);
    }
    
    return Math.round(prepayment);
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      alert("Будь ласка, оберіть хоча б один товар");
      return;
    }

    const hasRent = cartItems.some(item => selectedItems.includes(item.id) && itemTypes[item.id] === 'rent');
    if (hasRent && (!startDate || !endDate)) {
      alert("Будь ласка, вкажіть період оренди");
      return;
    }

    setOrderStatus({ loading: true, error: null, success: false });

    const itemsToOrder = selectedItems.map(id => ({
      id,
      type: itemTypes[id] || 'rent'
    }));

    
    const formData = new FormData();
    formData.append('start_date', startDate || new Date().toISOString().split('T')[0]);
    formData.append('end_date', endDate || new Date().toISOString().split('T')[0]);
    formData.append('customer_name', customerName);
    formData.append('customer_email', customerEmail);
    formData.append('customer_phone', customerPhone);
    formData.append('delivery_address', deliveryAddress);
    formData.append('notes', notes);
    formData.append('items', JSON.stringify(itemsToOrder));
    if (appliedCoupon) formData.append('coupon_code', appliedCoupon.code);
    if (documentFile) formData.append('document', documentFile);

    
    const result = await createOrder(formData, selectedItems);

    if (result.success) {
      setOrderStatus({ loading: false, error: null, success: true });
    } else {
      setOrderStatus({ loading: false, error: result.error, success: false });
    }
  };

  const hasRentItems = cartItems.some(item => selectedItems.includes(item.id) && itemTypes[item.id] === 'rent');

  if (orderStatus.success) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-4 flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
          <FaCheckCircle className="text-emerald-500 text-7xl mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Запит надіслано!</h2>
          <p className="text-gray-600 mb-8">Адміністратор перевірить ваші документи. Після підтвердження ви зможете внести завдаток у розділі "Мої замовлення".</p>
          <button 
            onClick={() => window.location.href = '/Catalog'}
            className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition"
          >
            Повернутися до каталогу
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-10 bg-gray-50">
     
      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold text-gray-500">Кошик порожній</h2>
          <button 
            onClick={() => window.location.href = '/Catalog'}
            className="mt-6 px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
          >
            Перейти до каталогу
          </button>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold text-gray-800">Товари в кошику ({cartItems.length})</h2>
               <button 
                 onClick={() => setSelectedItems(selectedItems.length === cartItems.length ? [] : cartItems.map(i => i.id))}
                 className="text-emerald-600 font-semibold hover:underline"
               >
                 {selectedItems.length === cartItems.length ? 'Зняти вибір' : 'Обрати всі'}
               </button>
            </div>

            {cartItems.map((item) => (
              <div key={item.id} className={`bg-white p-6 rounded-2xl shadow-sm border-2 transition duration-300 flex flex-col md:flex-row gap-6 items-center ${selectedItems.includes(item.id) ? 'border-emerald-500 shadow-md' : 'border-transparent'}`}>
                <input 
                  type="checkbox" 
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleItemSelection(item.id)}
                  className="w-6 h-6 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
                
                {(() => {
                  let displayImage = null;
                  const API_URL = process.env.REACT_APP_API_URL || "";
                  if (item.image) {
                    try {
                      const parsed = typeof item.image === 'string' && item.image.startsWith('[') ? JSON.parse(item.image) : item.image;
                      const imagePath = Array.isArray(parsed) ? parsed[0] : parsed;
                      if (imagePath) {
                        displayImage = imagePath.startsWith('http') ? imagePath : `${API_URL}${imagePath}`;
                      }
                    } catch (e) {
                      displayImage = item.image.startsWith('http') ? item.image : `${API_URL}${item.image}`;
                    }
                  }

                  return displayImage && (
                    <img 
                      src={displayImage} 
                      alt={item.title} 
                      className="w-32 h-32 object-cover rounded-xl"
                    />
                  );
                })()}
                
                <div className="flex-grow text-center md:text-left">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-sm mb-3">{item.category}</p>
                  
                  {}
                  <div className="flex justify-center md:justify-start mb-3">
                    <div className="inline-flex p-1 bg-gray-100 rounded-xl border border-gray-200 shadow-inner">
                      {(item.sale_type === 'rent' || item.sale_type === 'both') && (
                        <button
                          onClick={() => handleTypeChange(item.id, 'rent')}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                            itemTypes[item.id] === 'rent' 
                              ? 'bg-white text-emerald-700 shadow-sm' 
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          Оренда
                        </button>
                      )}
                      {(item.sale_type === 'buy' || item.sale_type === 'both') && (
                        <button
                          onClick={() => handleTypeChange(item.id, 'buy')}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                            itemTypes[item.id] === 'buy' 
                              ? 'bg-white text-emerald-700 shadow-sm' 
                              : 'text-gray-400 hover:text-gray-600'
                          }`}
                        >
                          Купівля
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-emerald-600 font-bold text-lg">
                    {itemTypes[item.id] === 'buy' ? `${item.price_buy} грн` : `${item.price_per_day} грн/день`}
                  </p>
                </div>
                
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="p-3 text-red-500 hover:bg-red-50 rounded-full transition"
                  title="Видалити з кошика"
                >
                  <FaTrash className="text-xl" />
                </button>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <form onSubmit={handleSubmitOrder} className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 sticky top-28">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4 text-center">Деталі замовлення</h2>
              
              <div className="space-y-4">
                {hasRentItems && (
                  <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1 flex items-center gap-1">
                        <FaCalendarAlt className="text-emerald-500" /> Початок
                      </label>
                      <input 
                        type="date" 
                        required 
                        min={today}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-600 mb-1 flex items-center gap-1">
                        <FaCalendarAlt className="text-emerald-500" /> Кінець
                      </label>
                      <input 
                        type="date" 
                        required 
                        min={startDate || today}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1 flex items-center gap-1">
                    <FaUser className="text-emerald-500" /> Ваше ім'я
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1 flex items-center gap-1">
                    <FaPhone className="text-emerald-500" /> Телефон
                  </label>
                  <input 
                    type="tel" 
                    required 
                    placeholder="+380..."
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1 flex items-center gap-1">
                    <FaEnvelope className="text-emerald-500" /> Email
                  </label>
                  <input 
                    type="email" 
                    required 
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-1 flex items-center gap-1">
                    <FaMapMarkerAlt className="text-emerald-500" /> Адреса доставки
                  </label>
                  <input 
                    type="text" 
                    required 
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1">
                    <FaFileAlt className="text-emerald-500" /> Документи (паспорт/реєстрація)
                  </label>
                  
                  <div className="relative group">
                    <input 
                      type="file" 
                      id="doc-upload"
                      onChange={(e) => setDocumentFile(e.target.files[0])}
                      className="hidden"
                    />
                    <label 
                      htmlFor="doc-upload"
                      className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
                        documentFile 
                          ? 'border-emerald-500 bg-emerald-50' 
                          : 'border-gray-200 bg-gray-50 hover:border-emerald-400 hover:bg-white'
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {documentFile ? (
                          <>
                            <FaCheckCircle className="text-emerald-500 text-3xl mb-2" />
                            <p className="text-sm font-bold text-emerald-700 max-w-[200px] truncate text-center px-4">
                              {documentFile.name}
                            </p>
                            <p className="text-[10px] text-emerald-500 mt-1 font-medium italic">Натисніть, щоб змінити</p>
                          </>
                        ) : (
                          <>
                            <FaCloudUploadAlt className="text-gray-400 text-3xl mb-2 group-hover:text-emerald-500 transition-colors" />
                            <p className="text-sm text-gray-500 font-medium">Оберіть файл або перетягніть</p>
                            <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">PNG, JPG або PDF</p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                  
                  <p className="text-[10px] text-gray-400 mt-2 italic">
                    * Завантажте скан-копії документів для швидкої перевірки адміністратором
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  {!showPromoInput && !appliedCoupon ? (
                    <button 
                      type="button"
                      onClick={() => setShowPromoInput(true)}
                      className="text-emerald-600 font-bold text-sm hover:underline"
                    >
                      Маєте промокод?
                    </button>
                  ) : (
                    <div className="animate-fadeIn">
                      <label className="block text-sm font-semibold text-gray-600 mb-2">Промокод на знижку</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Введіть код..."
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          className="flex-grow border p-3 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none bg-gray-50 uppercase"
                        />
                        <button 
                          type="button"
                          onClick={handleApplyCoupon}
                          className="px-4 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition"
                        >
                          OK
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {couponError && <p className="text-red-500 text-xs mt-1 font-medium">{couponError}</p>}
                  {appliedCoupon && (
                    <p className="text-emerald-600 text-sm mt-2 font-bold flex justify-between items-center bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                      <span>Застосовано: {appliedCoupon.code} (-{appliedCoupon.discount}%)</span>
                      <button 
                        type="button"
                        onClick={() => setAppliedCoupon(null)}
                        className="text-gray-400 hover:text-red-500 text-xs"
                      >
                        ✕
                      </button>
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-dashed">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-500">Обрано товарів:</span>
                  <span className="font-bold text-gray-800">{selectedItems.length}</span>
                </div>
                <div className="flex justify-between items-center text-2xl font-bold text-gray-800 mb-2">
                  <span>Разом:</span>
                  <span className="text-emerald-600">{calculateTotal()} грн</span>
                </div>
                
                <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-2xl border border-emerald-100 mb-6">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-emerald-600 uppercase">До сплати зараз:</span>
                    <span className="text-sm text-emerald-500 italic">(передплата)</span>
                  </div>
                  <span className="text-2xl font-black text-emerald-700">{calculatePrepayment()} грн</span>
                </div>

                {orderStatus.error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4">
                    {orderStatus.error}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={orderStatus.loading || selectedItems.length === 0}
                  className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg transition transform active:scale-95 ${
                    orderStatus.loading || selectedItems.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {orderStatus.loading ? 'Оформлюємо...' : 'Оформити замовлення'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
