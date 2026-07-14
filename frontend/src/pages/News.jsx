import React, { useContext, useState } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
import { FaCalendarAlt, FaArrowRight, FaNewspaper, FaSearch, FaFilter } from "react-icons/fa";

function News() {
  const { newsPosts } = useContext(CartContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  
  const formatDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') {
      return '';
    }

    if (dateString.includes('T') || dateString.includes('Z')) {
      try {
        const date = new Date(dateString);
        return date.toLocaleString('uk-UA', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      } catch (error) {
        console.error('Помилка форматування дати:', error);
        return dateString;
      }
    }
    return dateString;
  };

  
  const filteredAndSortedNews = newsPosts
    .filter(post => 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.text?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.date) - new Date(a.date);
      } else {
        return new Date(a.date) - new Date(b.date);
      }
    });

  
  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {}
      <div className="bg-emerald-700 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl mb-6">
              <FaNewspaper className="text-4xl text-emerald-700" />
            </div>
            <h1 className="text-4xl md:text-4xl font-bold text-white mb-4">
              Новини та події
            </h1>
            <p className="text-emerald-100 text-lg md:text-xl max-w-xl mx-auto">
              Дізнайтеся про останні новини компанії, акції та оновлення в світі оренди техніки
            </p>
          </div>
        </div>
      </div>

      {}
      <div className="bg-white border-b-2 border-gray-100 sticky top-[72px] z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {}
            <div className="relative w-full sm:w-96">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Пошук новин..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
              />
            </div>

            {}
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-500" />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-emerald-500 focus:outline-none transition-colors"
              >
                <option value="newest">Спочатку нові</option>
                <option value="oldest">Спочатку старі</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {filteredAndSortedNews.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
              <FaNewspaper className="text-4xl text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              {searchTerm ? 'Новин не знайдено' : 'Поки що немає новин'}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Спробуйте змінити пошуковий запит' : 'Слідкуйте за оновленнями'}
            </p>
          </div>
        ) : (
          <>
            {}
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 mb-8">
              <div className="flex flex-wrap gap-8 justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-emerald-700">{filteredAndSortedNews.length}</p>
                  <p className="text-gray-600">Всього новин</p>
                </div>
                <div className="w-px bg-emerald-300"></div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-emerald-700">
                    {new Date().getFullYear()}
                  </p>
                  <p className="text-gray-600">Поточний рік</p>
                </div>
              </div>
            </div>

            {}
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredAndSortedNews.map((post, index) => (
                <article
                  key={post.id}
                  className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-emerald-300 transition-all duration-300 flex flex-col"
                >
                  {}
                  <div className="p-6 flex-grow">
                    {}
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                      <FaCalendarAlt className="text-emerald-600" />
                      <time>{formatDate(post.date)}</time>
                    </div>

                    {}
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {post.title}
                    </h2>

                    {}
                    <p className="text-sm md:text-base text-gray-600 line-clamp-3">
                      {truncateText(post.text, 120)}
                    </p>

                    {}
                    {index === 0 && (
                      <div className="mt-4">
                        <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-semibold rounded-full">
                          Важливо
                        </span>
                      </div>
                    )}
                  </div>

                  {}
                  <div className="px-6 pb-6">
                    <Link
                      to={`/news/${post.id}`}
                      className="flex items-center justify-between w-full px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl font-semibold hover:bg-emerald-100 transition-all duration-300 group"
                    >
                      <span>Читати далі</span>
                      <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>

     
    </div>
  );
}

export default News;