import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import { FaChartBar, FaUsers, FaEnvelope, FaPhoneAlt, FaCalendarAlt, FaUserShield, FaSearch, FaHistory } from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const { getAuthHeader, isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState('stats'); 
  const [incomeData, setIncomeData] = useState(null);
  const [monthlyOrdersData, setMonthlyOrdersData] = useState(null);
  const [summary, setSummary] = useState({ activeOrdersTotal: 0, catalogTotal: 0 });
  const [usersList, setUsersList] = useState([]);
  
  
  const [salesReport, setSalesReport] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSalesReport = async (from, to) => {
    try {
      const headers = getAuthHeader();
      const url = new URL(`${process.env.REACT_APP_API_URL}/stats/sales-report`);
      if (from) url.searchParams.append('from', from);
      if (to) url.searchParams.append('to', to);
      
      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setSalesReport(data);
      }
    } catch (e) {
      console.error("Sales report error:", e);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      if (!isAuthenticated) {
        setError("Ви не авторизовані");
        setLoading(false);
        return;
      }

      if (user?.role !== 'admin' && user?.username !== 'admin') {
        setError("У вас немає прав адміністратора для перегляду аналітики");
        setLoading(false);
        return;
      }

      try {
        const headers = { 
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        };
        
        const [incomeRes, monthlyRes, summaryRes, usersRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}/stats/income`, { headers }),
          fetch(`${process.env.REACT_APP_API_URL}/stats/orders-monthly`, { headers }),
          fetch(`${process.env.REACT_APP_API_URL}/stats/summary`, { headers }),
          fetch(`${process.env.REACT_APP_API_URL}/stats/users`, { headers })
        ]);

        if ([incomeRes, monthlyRes, summaryRes, usersRes].some(r => r.status === 403)) {
          throw new Error("Сервер відхилив запит: недостатньо прав (403 Forbidden)");
        }

        const income = await incomeRes.json();
        const monthly = await monthlyRes.json();
        const summaryData = await summaryRes.json();
        const usersData = await usersRes.json();

        if (Array.isArray(income)) {
          setIncomeData({
            labels: income.map(d => d.month),
            datasets: [{
              label: 'Дохід (грн)',
              data: income.map(d => d.total),
              borderColor: 'rgb(16, 185, 129)',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              fill: true,
              tension: 0.4
            }]
          });
        }

        if (Array.isArray(monthly)) {
          setMonthlyOrdersData({
            labels: monthly.map(d => {
                const date = new Date(d.date);
                return date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' });
            }),
            datasets: [{
              label: 'Нові замовлення',
              data: monthly.map(d => d.count),
              backgroundColor: 'rgba(54, 162, 235, 0.7)',
              borderRadius: 6
            }]
          });
        }

        if (summaryData) {
          setSummary(summaryData);
        }

        if (Array.isArray(usersData)) {
          setUsersList(usersData);
        }

        
        await fetchSalesReport();

        setError(null);
        setLoading(false);
      } catch (error) {
        console.error('Dashboard Error:', error);
        setError(error.message || "Не вдалося завантажити дані");
        setLoading(false);
      }
    };

    fetchAllData();
  }, [isAuthenticated, user, getAuthHeader]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 mb-10">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
      <p className="text-gray-500 animate-pulse">Збираємо дані для аналітики...</p>
    </div>
  );

  if (error) return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-xl mb-10 shadow-sm">
      <div className="flex items-center gap-3 mb-2">
        <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-bold text-amber-800">Аналітика недоступна</h3>
      </div>
      <p className="text-amber-700">{error}</p>
    </div>
  );

  return (
    <div className="animate-fadeIn">
      {}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-emerald-600 uppercase mb-1">Замовлення в користувачів</span>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-emerald-900">{(summary.activeOrdersTotal || 0).toLocaleString()} грн</p>
            <span className="text-sm font-semibold text-emerald-500">({summary.activeItemsCount || 0} шт.)</span>
          </div>
          <p className="text-xs text-emerald-500 mt-2 italic">* Сума та кількість техніки в активних замовленнях</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-emerald-600 uppercase mb-1">Кількість техніки в каталозі</span>
          <p className="text-3xl font-bold text-emerald-900">{summary.catalogCount || 0} шт.</p>
          <p className="text-xs text-emerald-500 mt-2 italic">* Кількість доступних товарів у каталозі</p>
        </div>
      </div>

      {}
      <div className="flex gap-4 mb-8 bg-white p-1.5 rounded-xl border border-gray-100 w-fit">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'stats' 
              ? "bg-emerald-600 text-white" 
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <FaChartBar /> Статистика
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'users' 
              ? "bg-emerald-600 text-white" 
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <FaUsers /> Користувачі
        </button>
      </div>

      {activeTab === 'stats' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-sm transition duration-300 flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="text-lg font-bold text-gray-800">Аналіз продажів</h3>
                <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                  <input 
                    type="date" 
                    value={dateFrom} 
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="bg-transparent text-[10px] font-bold outline-none text-gray-600"
                  />
                  <span className="text-gray-300">—</span>
                  <input 
                    type="date" 
                    value={dateTo} 
                    onChange={(e) => setDateTo(e.target.value)}
                    className="bg-transparent text-[10px] font-bold outline-none text-gray-600"
                  />
                  <button 
                    onClick={() => fetchSalesReport(dateFrom, dateTo)}
                    className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                  >
                    <FaSearch size={10} />
                  </button>
                </div>
            </div>
            
            <div className="flex-grow overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
              {salesReport.length > 0 ? (
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[12px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                      <th className="pb-3">Техніка</th>
                      <th className="pb-3 text-center whitespace-nowrap">К-ть</th>
                      <th className="pb-3 text-right">Покупці</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {salesReport.map((item, idx) => (
                      <tr key={idx} className="group">
                        <td className="py-3 pr-2">
                          <p className="text-xs font-bold text-gray-700 leading-tight">{item.title}</p>
                        </td>
                        <td className="py-3 text-center whitespace-nowrap">
                          <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-[10px] font-black">
                            {item.count}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <p className="text-[10px] text-gray-400 italic line-clamp-1 group-hover:line-clamp-none transition-all">
                            {item.buyers}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2 opacity-50">
                   <FaHistory size={24} />
                   <p className="text-xs italic">За цей період угод не знайдено</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-sm transition duration-300">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">Замовлення за останні 30 днів</h3>
                <span className="text-xs font-semibold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-md">Місячний звіт</span>
            </div>
            <div className="h-[300px]">
                {monthlyOrdersData ? (
                <Bar 
                    data={monthlyOrdersData} 
                    options={{ 
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, color: '#94a3b8' },
                        grid: { color: '#f1f5f9' }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: '#94a3b8' }
                        }
                    }
                    }} 
                />
                ) : <NoData />}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-10">
          <div className="p-6 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-700">
              Список користувачів
            </h3>
            <span className="text-gray-400 text-sm">
              Всього: {usersList.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-y border-gray-50">
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Користувач</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Контакти</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Активні оренди</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Роль</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Реєстрація</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {usersList.length > 0 ? usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center font-bold text-sm uppercase border border-gray-100 group-hover:scale-110 transition-transform">
                          {u.username.charAt(0)}
                        </div>
                        <span className="font-medium text-gray-700">{u.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                          <FaEnvelope className="text-[10px]" />
                          {u.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 italic">
                          <FaPhoneAlt className="text-[10px]" />
                          {u.phone || "Номер відсутній"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {u.active_rent_count > 0 ? (
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-bold text-emerald-700">
                            {u.active_rent_count} шт. — {(u.active_rent_sum || 0).toLocaleString()} грн
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                            <FaCalendarAlt size={10} /> {u.last_rent_period}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300 italic">Немає оренд</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        u.role === 'admin' 
                          ? "bg-purple-50 text-purple-600 border border-purple-100" 
                          : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      }`}>
                        {u.role === 'admin' && <FaUserShield />}
                        {u.role === 'admin' ? "Адміністратор" : "Клієнт"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                        <FaCalendarAlt />
                        {new Date(u.created_at).toLocaleDateString('uk-UA')}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-gray-400 italic">
                      Користувачі не знайдені
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const NoData = () => (
    <div className="flex items-center justify-center h-40 text-gray-400 italic">
        Дані поки що відсутні
    </div>
);

export default AdminDashboard;
