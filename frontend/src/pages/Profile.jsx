import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaUser, FaEnvelope, FaLock, FaSave, FaExclamationTriangle, FaShieldAlt, FaIdCard, FaGift, FaBell, FaComments, FaStar, FaChevronRight } from "react-icons/fa";

function Profile() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [emailNotifications, setEmailNotifications] = useState(user?.email_notifications === 1 || user?.email_notifications === true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("general");

  const [coupons, setCoupons] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      
      const isEnabled = user.email_notifications === 1 || user.email_notifications === true;
      setEmailNotifications(isEnabled);
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setLoadingHistory(true);
      
      const couponsRes = await fetch(`${process.env.REACT_APP_API_URL}/auth/profile/coupons`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (couponsRes.ok) {
        const couponsData = await couponsRes.json();
        setCoupons(couponsData);
      }

      
      if (user?.id) {
        const reviewsRes = await fetch(`${process.env.REACT_APP_API_URL}/reviews/user/${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setUserReviews(reviewsData);
        }
      }
    } catch (err) {
      console.error("Fetch profile data error:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    
    if ((password || confirmPassword) && password !== confirmPassword) {
      setMessage({ type: "error", text: "Паролі не співпадають" });
      return;
    }

    setIsLoading(true);
    const updateData = { 
      username, 
      email, 
      email_notifications: emailNotifications ? 1 : 0 
    };
    if (password) updateData.password = password;

    console.log("📤 Updating profile with data:", updateData);

    const res = await updateProfile(updateData);
    setIsLoading(false);

    if (res.success) {
      setMessage({ type: "success", text: "Профіль успішно оновлено!" });
      setPassword("");
      setConfirmPassword("");
    } else {
      setMessage({ type: "error", text: res.error || "Помилка при оновленні профілю" });
    }
  };

  const isHardcodedAdmin = user?.id === 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {}
      <div className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col pt-8">
        <div className="px-8 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-2xl font-bold border-2 border-emerald-200">
              {user?.username?.[0].toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg truncate w-40">{user?.username}</h1>
              <p className="text-xs text-gray-400 truncate w-40">{user?.email}</p>
            </div>
          </div>
          <div className="h-px bg-gray-100 w-full" />
        </div>

        <nav className="flex-1 space-y-1 px-4">
          <button 
            onClick={() => setActiveSection("general")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition ${
              activeSection === "general" ? "bg-emerald-600 text-white shadow-md" : "text-gray-500 hover:bg-emerald-50 hover:text-emerald-600"
            }`}
          >
            <FaIdCard className={activeSection === "general" ? "text-white" : "text-emerald-500"} />
            Загальна інформація
          </button>
          
          <button 
            onClick={() => setActiveSection("security")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition ${
              activeSection === "security" ? "bg-emerald-600 text-white shadow-md" : "text-gray-500 hover:bg-emerald-50 hover:text-emerald-600"
            }`}
          >
            <FaShieldAlt className={activeSection === "security" ? "text-white" : "text-emerald-500"} />
            Безпека акаунта
          </button>

          <button 
            onClick={() => setActiveSection("reviews")}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition ${
              activeSection === "reviews" ? "bg-emerald-600 text-white shadow-md" : "text-gray-500 hover:bg-emerald-50 hover:text-emerald-600"
            }`}
          >
            <FaComments className={activeSection === "reviews" ? "text-white" : "text-emerald-500"} />
            Історія коментарів
          </button>
        </nav>

        <div className="p-8">
            <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Дякуємо, що користуєтесь нашими послугами оренди спецтехніки!
                </p>
            </div>
        </div>
      </div>

      {}
      <div className="flex-1 p-4 md:p-12 lg:p-20 overflow-y-auto">
        <div className="max-w-4xl">
          {message.text && (
            <div className={`mb-8 p-4 rounded-2xl font-medium animate-fadeIn ${
              message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {message.text}
            </div>
          )}

          {isHardcodedAdmin && (
            <div className="mb-10 p-5 bg-amber-50 border-l-4 border-amber-500 rounded-r-2xl shadow-sm">
              <div className="flex gap-4">
                <FaExclamationTriangle className="text-amber-500 text-2xl shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-black text-amber-900 uppercase text-xs tracking-wider mb-1">Режим супер-адміна</h3>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    Ви авторизовані під системним акаунтом <strong>admin</strong>. Зміна даних для цього профілю заблокована на рівні ядра системи для забезпечення стабільності.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-12">
            {}
            <section className={`transition-all duration-300 ${activeSection === "general" ? "opacity-100 translate-x-0" : "hidden opacity-0 -translate-x-4"}`}>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Загальна інформація</h2>
                <p className="text-gray-500">Ваші контактні дані, налаштування сповіщень та виграні купони</p>
              </div>

              <div className="space-y-8">
                {}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-400 ml-1">Публічне ім'я</label>
                    <div className="relative">
                      <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isHardcodedAdmin || isLoading}
                        className="w-full bg-gray-50 border-none px-12 py-4 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition outline-none text-gray-800 font-medium disabled:opacity-50"
                        placeholder="Введіть ваше ім'я"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-400 ml-1">Електронна пошта</label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isHardcodedAdmin || isLoading}
                        className="w-full bg-gray-50 border-none px-12 py-4 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition outline-none text-gray-800 font-medium disabled:opacity-50"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>
                </div>

                {}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                      <FaBell size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">Сповіщення</h3>
                      <p className="text-sm text-gray-400">Налаштуйте отримання новин та акцій</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-emerald-100 transition">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${emailNotifications ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'}`}>
                        <FaEnvelope size={14} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">Email розсилка</p>
                        <p className="text-xs text-gray-500">Отримувати інформацію про нову техніку на пошту</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                        disabled={isHardcodedAdmin || isLoading}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>

                {}
                <div className="space-y-6 pt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <FaGift className="text-emerald-500" />
                      Мої купони
                    </h3>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                      Всього: {coupons.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {loadingHistory ? (
                      <div className="col-span-full p-8 text-center text-gray-400 animate-pulse">Завантаження купонів...</div>
                    ) : coupons.length > 0 ? (
                      coupons.map((coupon) => (
                        <div key={coupon.id} className="bg-white border border-gray-100 rounded-2xl p-5 relative overflow-hidden group hover:shadow-md transition">
                          <div className="flex justify-between items-start relative z-10">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg font-bold text-emerald-600 font-mono tracking-tighter">{coupon.code}</span>
                                {coupon.used_count >= coupon.usage_limit ? (
                                  <span className="text-[9px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-semibold uppercase">Використано</span>
                                ) : (
                                  <span className="text-[9px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-semibold uppercase">Доступний</span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-tight">Знижка {coupon.discount}%</p>
                            </div>
                            <button 
                              type="button"
                              onClick={() => { navigator.clipboard.writeText(coupon.code); alert("Код скопійовано!") }}
                              className="p-2.5 bg-gray-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition"
                              title="Копіювати"
                            >
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200">
                        <p className="text-gray-400 text-xs italic">У вас поки немає активних купонів</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {}
            <section className={`transition-all duration-300 ${activeSection === "security" ? "opacity-100 translate-x-0" : "hidden opacity-0 -translate-x-4"}`}>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Безпека акаунта</h2>
                <p className="text-gray-500">Захистіть свій акаунт, встановивши надійний пароль</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-gray-400 ml-1">Новий пароль</label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isHardcodedAdmin || isLoading}
                      autoComplete="new-password"
                      className="w-full bg-gray-50 border-none px-12 py-4 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition outline-none text-gray-800 font-medium disabled:opacity-50"
                      placeholder="••••••••"
                      minLength="6"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-gray-400 ml-1">Підтвердження</label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isHardcodedAdmin || isLoading}
                      autoComplete="new-password"
                      className="w-full bg-gray-50 border-none px-12 py-4 rounded-2xl focus:ring-2 focus:ring-emerald-500 transition outline-none text-gray-800 font-medium disabled:opacity-50"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                
                <div className="col-span-full pt-4">
                    <p className="text-[11px] text-gray-400 flex items-center gap-2 italic">
                        Пароль має містити щонайменше 6 символів
                    </p>
                </div>
              </div>
            </section>

            {}
            <section className={`transition-all duration-300 ${activeSection === "reviews" ? "opacity-100 translate-x-0" : "hidden opacity-0 -translate-x-4"}`}>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Історія коментарів</h2>
                <p className="text-gray-500">Ваші відгуки та оцінки до техніки</p>
              </div>

              <div className="space-y-6">
                {loadingHistory ? (
                  <div className="p-12 text-center text-gray-400 animate-pulse">Завантаження відгуків...</div>
                ) : userReviews.length > 0 ? (
                  userReviews.map((review) => (
                    <div key={review.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group hover:shadow-md transition-all">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                        <div className="flex items-center gap-4">
                          <button 
                            type="button"
                            onClick={() => navigate(`/detail/${review.card_id}`)}
                            className="text-left group/title"
                          >
                            <h3 className="font-semibold text-gray-900 leading-tight group-hover/title:text-emerald-600 transition-colors flex items-center gap-2">
                              {review.card_title}
                              <FaChevronRight size={10} className="opacity-0 group-hover/title:opacity-100 -translate-x-2 group-hover/title:translate-x-0 transition-all" />
                            </h3>
                            <p className="text-xs text-gray-400 font-medium">
                              {new Date(review.date).toLocaleDateString("uk-UA", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </p>
                          </button>
                        </div>

                        {review.rating && (
                          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border ${
                            review.rating >= 4 ? 'bg-green-50 border-green-100' : 
                            review.rating === 3 ? 'bg-amber-50 border-amber-100' : 
                            'bg-red-50 border-red-100'
                          }`}>
                            {[...Array(5)].map((_, i) => (
                              <FaStar 
                                key={i} 
                                size={12} 
                                className={i < review.rating ? (
                                  review.rating >= 4 ? "text-green-500" : 
                                  review.rating === 3 ? "text-amber-400" : 
                                  "text-red-500"
                                ) : "text-gray-200"} 
                              />
                            ))}
                            <span className={`ml-1 text-xs font-bold ${
                              review.rating >= 4 ? 'text-green-600' : 
                              review.rating === 3 ? 'text-amber-600' : 
                              'text-red-600'
                            }`}>{review.rating}</span>
                          </div>
                        )}
                      </div>

                      <div className="bg-gray-50 p-4 rounded-2xl border border-transparent group-hover:border-emerald-100 transition-colors">
                        <p className="text-gray-700 text-sm leading-relaxed italic">"{review.text}"</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100">
                    <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                      <FaComments size={24} />
                    </div>
                    <p className="text-gray-400 text-sm font-medium">Ви ще не залишили жодного відгуку</p>
                  </div>
                )}
              </div>
            </section>

            {}
            {(activeSection === "general" || activeSection === "security") && (
              <div className="flex items-center justify-start gap-4">
                <button
                  type="submit"
                  disabled={isHardcodedAdmin || isLoading}
                  className="px-12 py-4 bg-emerald-600 text-white rounded-2xl font-bold uppercase text-xs hover:bg-emerald-700 shadow-lg shadow-gray-200 transition-all active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-3"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.362 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Збереження...
                    </span>
                  ) : (
                    <>
                      Зберегти зміни
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => { 
                    setPassword(""); 
                    setConfirmPassword(""); 
                    setMessage({type:"", text:""});
                  }}
                  disabled={isLoading}
                  className="px-8 py-4 text-gray-400 font-bold text-xs uppercase hover:text-emerald-600 transition"
                >
                  Скасувати
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
