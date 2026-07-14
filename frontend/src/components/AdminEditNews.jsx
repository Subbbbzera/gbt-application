import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

const AdminEditNews = ({ news, onSave, onCancel }) => {
  const [title, setTitle] = useState(news.title || "");
  const [text, setText] = useState(news.text || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(news.id, { title, text });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-white">
          <h2 className="text-2xl font-bold text-gray-800">Редагувати новину</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition">
            <FaTimes size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Заголовок</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Текст новини</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full border px-4 py-3 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none h-60 bg-gray-50"
                required
              />
            </div>
          </div>

          <div className="pt-6 border-t flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition"
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

export default AdminEditNews;
