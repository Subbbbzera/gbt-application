import React, { useContext, useEffect, useState } from "react";
import { CartContext } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaBox, FaCalendar, FaPhone, FaMapMarkerAlt, FaEnvelope, FaTimes } from "react-icons/fa";

function Orders() {
  const { orders, fetchUserOrders, cancelOrder } = useContext(CartContext);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  
  useEffect(() => {
    const scriptId = 'liqpay-checkout-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = "https://static.liqpay.ua/libjs/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
    
    return () => {
      
      
    };
  }, []);

  
  const [searchTerm, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      fetchUserOrders();
    }
  }, [isAuthenticated, fetchUserOrders]);

  
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || order.items?.some(item => 
      item.card_title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const orderDate = new Date(order.created_at);
    const matchesFrom = !dateFrom || orderDate >= new Date(dateFrom + "T00:00:00");
    const matchesTo = !dateTo || orderDate <= new Date(dateTo + "T23:59:59");

    return matchesSearch && matchesFrom && matchesTo;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'verification': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'awaiting_prepayment': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'renting': return 'bg-emerald-600 text-white border-emerald-700';
      case 'confirmed': return 'bg-emerald-100 text-emerald-700 border-emerald-300';
      case 'completed': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'cancelled': return 'bg-slate-50 text-slate-400 border-slate-200';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'verification': return 'На перевірці документів';
      case 'awaiting_prepayment': return 'Документи схвалено. Очікує завдаток';
      case 'renting': return 'В оренді';
      case 'confirmed': return 'Підтверджено';
      case 'completed': return 'Завершено';
      case 'cancelled': return 'Скасовано';
      default: return status;
    }
  };

  const handlePayDeposit = async (order) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/payments/get-liqpay-params`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: order.prepayment_amount,
          order_id: order.id,
          description: `Завдаток за замовлення #${order.order_number} (${order.prepayment_amount} грн)`
        })
      });

      const lpData = await response.json();

      if (lpData.data && lpData.signature) {
        if (window.LiqPayCheckout) {
          window.LiqPayCheckout.init({
            data: lpData.data,
            signature: lpData.signature,
            embedTo: "#liqpay_checkout",
            mode: "popup"
          }).on("liqpay.callback", async function(data){
            if (data.status === 'success' || data.status === 'wait_accept') {
              await fetch(`${process.env.REACT_APP_API_URL}/orders/${order.id}/pay-deposit`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
              });
              fetchUserOrders();
            }
          }).on("liqpay.close", async function(data) {
            
            console.log("Вікно закрито, симулюємо успіх...");
            await fetch(`${process.env.REACT_APP_API_URL}/orders/${order.id}/pay-deposit`, {
              method: 'PATCH',
              headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            fetchUserOrders();
            setSuccessMessage("Техніка в оренді");
            
            setTimeout(() => setSuccessMessage(""), 5000);
          });
        }
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Помилка при ініціалізації оплати");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm("Ви впевнені, що хочете скасувати це замовлення?")) {
      setLoading(true);
      const result = await cancelOrder(orderId);
      if (result.success) {
        alert("Замовлення скасовано");
      } else {
        alert(result.error || "Помилка скасування");
      }
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div id="liqpay_checkout"></div>
      <div className="max-w-6xl mx-auto px-4">

        {}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between animate-fadeIn">
            <span className="font-bold">{successMessage}</span>
            <button onClick={() => setSuccessMessage("")} className="text-emerald-600 hover:text-emerald-800">
              <FaTimes />
            </button>
          </div>
        )}
        
        {}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Мої замовлення</h1>
          
          <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
            <div className="relative">
              <input
                type="text"
                placeholder="Пошук техніки..."
                value={searchTerm}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-64 md:w-80 transition-all"
              />
              
            </div>

            <div className="flex items-center gap-3 bg-gray-50 px-3 py-1 rounded-xl border border-gray-100">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-gray-400 uppercase ml-1">Від</span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-transparent px-1 py-1 rounded text-xs font-bold text-gray-600 outline-none"
                />
              </div>
              <span className="text-gray-300 font-light">|</span>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-gray-400 uppercase ml-1">До</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-transparent px-1 py-1 rounded text-xs font-bold text-gray-600 outline-none"
                />
              </div>
            </div>

            {(searchTerm || dateFrom || dateTo) && (
              <button 
                onClick={() => { setSearchQuery(""); setDateFrom(""); setDateTo(""); }}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Скинути фільтри"
              >
                <FaTimes size={12} />
              </button>
            )}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaBox className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-600 mb-6">
              {orders.length === 0 ? "У вас поки немає замовлень" : "Нічого не знайдено за вибраними фільтрами"}
            </p>
            {orders.length === 0 && (
              <button
                onClick={() => navigate("/Rent")}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                Перейти до оренди
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                {}
                <div className="bg-emerald-50 p-4 border-b flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h3 className="font-bold text-lg text-emerald-800">
                      Замовлення {order.order_number}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('uk-UA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>

                {}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {}
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <FaCalendar className="text-emerald-600" />
                        Період оренди
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Початок:</span>
                          <span className="font-bold">{new Date(order.start_date).toLocaleDateString('uk-UA')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Завершення:</span>
                          <span className="font-bold">{new Date(order.end_date).toLocaleDateString('uk-UA')}</span>
                        </div>
                      </div>
                    </div>

                    {}
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <FaPhone className="text-emerald-600" />
                        Контакти
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{order.customer_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-700">
                          <FaEnvelope className="text-xs" />
                          <span>{order.customer_email}</span>
                        </div>
                        <div className="flex items-center gap-2 font-medium">
                          <span>{order.customer_phone}</span>
                        </div>
                      </div>
                    </div>

                    {}
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <FaMapMarkerAlt className="text-emerald-600" />
                        Доставка
                      </h4>
                      <p className="text-sm text-gray-600 mb-2">
                        {order.delivery_address || "Самовивіз"}
                      </p>
                      {order.documents && order.documents.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Документи:</p>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              order.documents[0].status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                              order.documents[0].status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {order.documents[0].status === 'approved' ? 'Затверджено' : 
                               order.documents[0].status === 'rejected' ? 'Відхилено' : 'На перевірці'}
                            </span>
                            <a 
                              href={`${process.env.REACT_APP_API_URL}${order.documents[0].file_path}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[10px] text-emerald-600 hover:underline"
                            >
                              Переглянути
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {}
                  <div className="border rounded-xl overflow-hidden mb-6">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-gray-700">Назва техніки</th>
                          <th className="px-4 py-3 font-semibold text-gray-700 text-center">Днів</th>
                          <th className="px-4 py-3 font-semibold text-gray-700 text-right">Сума</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {order.items && order.items.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition">
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-800">{item.card_title}</div>
                              <div className="text-xs text-gray-500">
                                {item.type === 'buy' ? 'Купівля' : `Оренда (${item.days_count} дн.)`}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center text-gray-600">
                              {item.type === 'buy' ? '-' : item.days_count}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-emerald-700">{item.subtotal} грн</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-4 border-t">
                    <div className="flex-1">
                      {order.notes && (
                        <p className="text-sm text-gray-600 italic mb-1">
                          <span className="font-bold not-italic">Коментар:</span> {order.notes}
                        </p>
                      )}
                      {order.coupon_code && (
                        <p className="text-sm text-purple-600 font-bold flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          Застосовано промокод: <span className="uppercase">{order.coupon_code}</span>
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        {order.coupon_code && (
                          <p className="text-xs text-gray-400 line-through">
                            {order.items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0)} грн
                          </p>
                        )}
                        <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">
                          {order.coupon_code ? "Разом зі знижкою" : "Разом"}
                        </p>
                        <p className="text-2xl font-black text-emerald-800">{order.total_amount} грн</p>
                      </div>

                      {order.status === 'awaiting_prepayment' && (
                        <button
                          onClick={() => handlePayDeposit(order)}
                          disabled={loading}
                          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-bold shadow-md transform active:scale-95"
                        >
                          Внести завдаток
                        </button>
                      )}

                      {(order.status === 'pending' || order.status === 'verification') && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={loading}
                          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition font-semibold border border-red-200"
                        >
                          <FaTimes />
                          Скасувати
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;