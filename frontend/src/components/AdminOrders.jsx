import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaPhoneAlt, FaCheck, FaTimes, FaCalendarAlt, FaSearch, FaFileAlt } from 'react-icons/fa';

const AdminOrders = () => {
  const { getAuthHeader, isAuthenticated, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  const [searchTerm, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Авторизуйтесь як адмін');

      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const res = await fetch(`${process.env.REACT_APP_API_URL}/orders/admin/all`, { headers });
      
      if (res.status === 403) throw new Error('Недостатньо прав (403)');
      if (!res.ok) throw new Error(`Помилка: ${res.status}`);
      
      const data = await res.json();
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error('AdminOrders Fetch Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const isAdmin = user?.role === 'admin' || user?.username === 'admin';
    if (isAuthenticated && isAdmin) {
      fetchOrders();
    } else if (!isAuthenticated && !localStorage.getItem('token')) {
      setLoading(false);
      setError('Ви не авторизовані');
    }
  }, [isAuthenticated, user]);

  
  const filteredOrders = orders.filter(order => {
    
    const matchesSearch = !searchTerm || order.items?.some(item => 
      item.card_title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    
    const orderDate = new Date(order.created_at);
    const matchesFrom = !dateFrom || orderDate >= new Date(dateFrom + "T00:00:00");
    const matchesTo = !dateTo || orderDate <= new Date(dateTo + "T23:59:59");

    return matchesSearch && matchesFrom && matchesTo;
  });

  const handleApproveRequest = async (orderId) => {
    if (!window.confirm('Схвалити документи та запит? Користувач отримає сповіщення про необхідність внести завдаток.')) return;
    
    try {
      const headers = { ...getAuthHeader() };
      const res = await fetch(`${process.env.REACT_APP_API_URL}/orders/admin/${orderId}/approve-docs`, {
        method: 'PATCH',
        headers
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Помилка при схваленні');
      }
      
      alert('Запит схвалено!');
      fetchOrders(); 
    } catch (err) {
      alert(err.message);
    }
  };

  const handleConfirm = async (orderId) => {
    if (!window.confirm('Підтвердити оплату та активувати замовлення?')) return;
    
    try {
      const headers = { ...getAuthHeader() };
      const res = await fetch(`${process.env.REACT_APP_API_URL}/orders/admin/${orderId}/confirm`, {
        method: 'PATCH',
        headers
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Помилка при підтвердженні');
      }
      
      alert('Замовлення активовано!');
      fetchOrders(); 
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCancel = async (orderId) => {

    if (!window.confirm('Скасувати замовлення? Техніка повернеться в доступні.')) return;
    
    try {
      const headers = { ...getAuthHeader() };
      const res = await fetch(`${process.env.REACT_APP_API_URL}/orders/admin/${orderId}/cancel`, {
        method: 'PATCH',
        headers
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Помилка при скасуванні');
      }
      
      alert('Замовлення скасовано');
      fetchOrders(); 
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateDocStatus = async (docId, status) => {
    try {
      const headers = { 
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      };
      const res = await fetch(`${process.env.REACT_APP_API_URL}/orders/admin/document/${docId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status })
      });
      
      if (!res.ok) throw new Error('Помилка оновлення статусу документа');
      
      fetchOrders();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return (

    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 mb-10">
      {error}
    </div>
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Керування замовленнями
        </h2>
        
        {}
        <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
          <div className="relative">
            <input
              type="text"
              placeholder="Пошук техніки за назвою..."
              value={searchTerm}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 w-64 md:w-80 transition-all"
            />
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
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
        <div className="bg-white p-12 rounded-2xl border text-center text-gray-400 italic">
          {orders.length === 0 ? "Замовлень поки що немає" : "Нічого не знайдено за вибраними фільтрами"}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredOrders.map((order) => (
            <div key={order.id} className={`bg-white rounded-2xl border overflow-hidden transition duration-300 hover:shadow-md ${
              order.status === 'pending' ? 'border-emerald-200' : 
              order.status === 'confirmed' ? 'border-emerald-300' : 'border-gray-100'
            }`}>
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-lg font-bold text-gray-900">#{order.order_number}</span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <FaCalendarAlt /> {new Date(order.created_at).toLocaleString('uk-UA')}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {}
                    {order.status === 'verification' && (
                      <button 
                        onClick={() => handleApproveRequest(order.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition text-sm shadow-sm font-bold"
                      >
                        <FaCheck /> Схвалити запит
                      </button>
                    )}
                    
                    {order.status === 'awaiting_prepayment' && (
                      <button 
                        onClick={() => handleConfirm(order.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition text-sm shadow-sm font-bold"
                      >
                        <FaCheck /> Підтвердити оплату (вручну)
                      </button>
                    )}

                    {order.status === 'renting' && (
                      <span className="text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 flex items-center">
                        В оренді
                      </span>
                    )}

                    {}
                    {order.status !== 'completed' && order.status !== 'cancelled' && (
                      <button 
                        onClick={() => handleCancel(order.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition text-sm font-bold border border-red-100"
                      >
                        <FaTimes /> {order.status === 'renting' ? 'Скасувати оренду' : 'Скасувати замовлення'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-6 p-6 bg-gray-50/50 rounded-xl border border-gray-100">
                  <div className="space-y-2 min-w-[200px]">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Клієнт
                    </h4>
                    <p className="font-bold text-gray-800">{order.customer_name}</p>
                    <p className="text-sm text-gray-600">{order.customer_email}</p>
                    <a href={`tel:${order.customer_phone}`} className="text-emerald-800 flex items-center gap-2 hover:underline font-medium">
                      <FaPhoneAlt size={12}/> {order.customer_phone}
                    </a>
                  </div>

                  <div className="space-y-2 min-w-[200px]">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Період
                    </h4>
                    <p className="text-sm text-gray-700 font-semibold">З: {new Date(order.start_date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-700 font-semibold">По: {new Date(order.end_date).toLocaleDateString()}</p>
                  </div>

                  <div className="space-y-2 min-w-[200px]">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Розрахунок вартості
                    </h4>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-500 flex justify-between">
                        <span>Загальна сума замовлення:</span>
                        <span className="font-semibold">{order.total_amount} грн</span>
                      </p>
                      
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-lg font-black text-emerald-900 flex justify-between items-center">
                          <span className="text-xs uppercase">До сплати (повна сума):</span>
                          <span>{order.total_amount} грн</span>
                        </p>
                      </div>
                    </div>
                    {order.coupon_code && (
                      <span className="inline-block mt-2 text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100">
                        Купон: {order.coupon_code}
                      </span>
                    )}
                  </div>
                </div>

                {}
                {order.documents && order.documents.length > 0 && (
                  <div className="mb-6 p-4 bg-emerald-50/30 rounded-xl border border-emerald-100/50">
                    <h4 className="text-xs font-bold text-emerald-600/70 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <FaFileAlt size={12} /> Прикріплені документи
                    </h4>
                    <div className="space-y-3">
                      {order.documents.map((doc) => (
                        <div key={doc.id} className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-xl border border-emerald-100 shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                              <FaFileAlt size={18} />
                            </div>
                            <div>
                              <a 
                                href={`${process.env.REACT_APP_API_URL}${doc.file_path}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                              >
                                Переглянути документ
                              </a>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                Завантажено: {new Date(doc.uploaded_at).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end">
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                                doc.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-orange-100 text-orange-700'
                              }`}>
                                {doc.status === 'approved' ? 'Перевірено' : 
                                 doc.status === 'rejected' ? 'Відхилено' : 'Очікує перевірки'}
                              </span>
                            </div>

                            <div className="flex gap-2">
                              {doc.status !== 'approved' && (
                                <button 
                                  onClick={() => handleUpdateDocStatus(doc.id, 'approved')}
                                  className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition shadow-sm"
                                  title="Затвердити"
                                >
                                  <FaCheck size={14} />
                                </button>
                              )}
                              {doc.status !== 'rejected' && (
                                <button 
                                  onClick={() => handleUpdateDocStatus(doc.id, 'rejected')}
                                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition shadow-sm"
                                  title="Відхилити"
                                >
                                  <FaTimes size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Товари:</h4>
                  <div className="space-y-2">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm py-2 border-b border-gray-50 last:border-0">
                        <span className="font-bold text-gray-700">{item.card_title}</span>
                        <div className="flex gap-4 text-gray-500 font-medium">
                          <span>{item.type === 'buy' ? 'Купівля' : `Оренда (${item.days_count} дн.)`}</span>
                          <span className="text-emerald-900 font-bold">{item.subtotal} грн</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {order.delivery_address && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs border border-gray-100">
                    <p className="text-gray-600"><b>Адреса доставки:</b> {order.delivery_address}</p>
                  </div>
                )}
                
                {order.notes && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs italic border border-gray-100 border-dashed">
                    <p className="text-gray-400"><b>Коментар:</b> {order.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const styles = {
    verification: 'bg-orange-100 text-orange-700 border-orange-200',
    awaiting_prepayment: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    renting: 'bg-emerald-600 text-white border-emerald-700',
    confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    cancelled: 'bg-slate-50 text-slate-400 border-slate-200',
    completed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  const labels = {
    verification: 'На перевірці',
    awaiting_prepayment: 'Очікує завдаток',
    renting: 'В оренді',
    confirmed: 'Активне / Оплачено',
    cancelled: 'Скасовано',
    completed: 'Завершено',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase border ${styles[status] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
      {labels[status] || status}
    </span>
  );
};

export default AdminOrders;
