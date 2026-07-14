import React, { useContext, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { FaArrowLeft, FaCalendarAlt, FaClock, FaNewspaper, FaShare, FaPrint } from "react-icons/fa";

function NewsDetail() {
  const { newsPosts } = useContext(CartContext);
  const { id } = useParams();

  const post = newsPosts.find((n) => n.id.toString() === id);

  
  const currentIndex = newsPosts.findIndex((n) => n.id.toString() === id);
  const prevPost = currentIndex > 0 ? newsPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < newsPosts.length - 1 ? newsPosts[currentIndex + 1] : null;

  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  
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
        return dateString;
      }
    }
    return dateString;
  };

  
  const calculateReadTime = (text) => {
    if (!text) return '1';
    const wordsPerMinute = 200;
    const words = text.split(' ').length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  
  const handlePrint = () => {
    window.print();
  };

  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.text.substring(0, 200) + '...',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Посилання скопійовано!');
    }
  };

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-6">
            <FaNewspaper className="text-4xl text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Новину не знайдено
          </h2>
          <p className="text-gray-500 mb-8">
            Можливо, її було видалено або переміщено
          </p>
          <Link
            to="/news"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 text-white font-semibold rounded-xl hover:bg-emerald-800 transition-all"
          >
            <FaArrowLeft />
            Повернутися до новин
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {}
      <div className="bg-white border-b-2 border-gray-100 sticky top-[72px] z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/news"
              className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-medium transition-colors"
            >
              <FaArrowLeft />
              <span>Всі новини</span>
            </Link>
            
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
                title="Поділитися"
              >
                <FaShare />
              </button>
              <button
                onClick={handlePrint}
                className="p-2 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all"
                title="Друкувати"
              >
                <FaPrint />
              </button>
            </div>
          </div>
        </div>
      </div>

      {}
      <article className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden">
          {}
          <div className="p-8 lg:p-12 border-b-2 border-gray-100">
            {}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-emerald-600" />
                <time>{formatDate(post.date)}</time>
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <FaClock className="text-emerald-600" />
                <span>{calculateReadTime(post.text)} хв читання</span>
              </div>
            </div>

            {}
            <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold text-gray-900 leading-tight text-center md:text-left">
              {post.title}
            </h1>
          </div>

          {}
          <div className="p-6 md:p-8 lg:p-12">
            <div className="prose prose-lg max-w-none">
              {post.text.split('\n').map((paragraph, index) => (
                paragraph.trim() && (
                  <p key={index} className="text-gray-700 leading-relaxed mb-4 text-base md:text-lg">
                    {paragraph}
                  </p>
                )
              ))}
            </div>
          </div>

          {}
          <div className="p-8 lg:px-12 bg-gray-50 border-t-2 border-gray-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
              </div>
              
              <Link
                to="/news"
                className="px-4 py-2 text-emerald-700 font-medium hover:bg-emerald-50 rounded-lg transition-all"
              >
                Повернутися до всіх новин
              </Link>
            </div>
          </div>
        </div>

        {}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {prevPost && (
            <Link
              to={`/news/${prevPost.id}`}
              className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-emerald-300 transition-all group"
            >
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                <span>Попередня новина</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                {prevPost.title}
              </h3>
            </Link>
          )}
          
          {nextPost && (
            <Link
              to={`/news/${nextPost.id}`}
              className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-emerald-300 transition-all group md:text-right"
            >
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-2 md:justify-end">
                <span>Наступна новина</span>
                <FaArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                {nextPost.title}
              </h3>
            </Link>
          )}
        </div>
      </article>
    </div>
  );
}

export default NewsDetail;
