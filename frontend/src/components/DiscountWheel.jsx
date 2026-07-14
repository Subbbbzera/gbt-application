import React, { useState, useEffect } from 'react';
import { FaTimes, FaGift, FaCopy, FaCheck } from 'react-icons/fa';

const DiscountWheel = ({ isOpen, onClose }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [coupon, setCoupon] = useState('');
  const [copied, setCopied] = useState(false);
  const [rotation, setRotation] = useState(0);

  
  const sectors = [
    { label: '10% ЗНИЖКА', value: 10, weight: 1, color: '#10b981' }, 
    { label: '', value: 0, weight: 4, color: '#f1f5f9' },           
    { label: 'БЕЗ ЗНИЖКИ', value: 0, weight: 8, color: '#94a3b8' },  
    { label: '', value: 0, weight: 4, color: '#f8fafc' },           
    { label: '3% ЗНИЖКА', value: 3, weight: 5, color: '#34d399' },   
    { label: '', value: 0, weight: 4, color: '#f1f5f9' },           
    { label: '5% ЗНИЖКА', value: 5, weight: 4, color: '#059669' },   
    { label: '', value: 0, weight: 4, color: '#f8fafc' },           
  ];

  const generateCouponCode = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let code = '';
    for (let i = 0; i < 3; i++) code += letters.charAt(Math.floor(Math.random() * letters.length));
    for (let i = 0; i < 3; i++) code += numbers.charAt(Math.floor(Math.random() * numbers.length));
    return code;
  };

  const handleSpin = async () => {
    if (isSpinning || result) return;

    setIsSpinning(true);
    
    
    const totalWeight = sectors.reduce((acc, s) => acc + s.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedSectorIndex = 0;
    
    for (let i = 0; i < sectors.length; i++) {
      if (random < sectors[i].weight) {
        selectedSectorIndex = i;
        break;
      }
      random -= sectors[i].weight;
    }

    const sectorAngle = 360 / sectors.length;
    const extraSpins = 5 + Math.floor(Math.random() * 5); 
    const targetRotation = extraSpins * 360 + (360 - (selectedSectorIndex * sectorAngle) - (sectorAngle / 2));
    
    setRotation(targetRotation);

    setTimeout(async () => {
      setIsSpinning(false);
      const wonSector = sectors[selectedSectorIndex];
      setResult(wonSector);

      if (wonSector.value > 0) {
        const newCode = generateCouponCode();
        setCoupon(newCode);

        
        try {
          const userData = localStorage.getItem('user');
          const user = userData ? JSON.parse(userData) : null;

          await fetch(`${process.env.REACT_APP_API_URL}/coupons/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              code: newCode,
              discount: wonSector.value,
              userId: user?.id || null,
              description: `Виграш в рулетці (${wonSector.value}%)`
            })
          });
        } catch (error) {
          console.error("Помилка збереження купона:", error);
        }
      }
    }, 4000);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coupon);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden relative p-8 flex flex-col items-center">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <FaTimes size={24} />
        </button>

        <h2 className="text-2xl font-black text-gray-800 mb-2 text-center uppercase tracking-tight">
          Випробуйте удачу!
        </h2>
        <p className="text-gray-500 text-sm mb-8 text-center px-4">
          Отримайте персональну знижку на ваше перше замовлення
        </p>

        {}
        <div className="relative w-64 h-64 mb-10">
          {}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 text-emerald-600 filter drop-shadow-md">
            <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-emerald-600"></div>
          </div>

          <div 
            className="w-full h-full rounded-full border-8 border-gray-100 shadow-inner relative overflow-hidden transition-transform duration-[4000ms] cubic-bezier(0.1, 0.7, 0.1, 1)"
            style={{ 
              transform: `rotate(${rotation}deg)`,
              background: `conic-gradient(${sectors.map((s, i) => `${s.color} ${i * (360/sectors.length)}deg ${(i+1) * (360/sectors.length)}deg`).join(', ')})`
            }}
          >
            {sectors.map((s, i) => (
              <div 
                key={i}
                className="absolute top-0 left-0 w-full h-full flex items-start justify-center pt-2"
                style={{ transform: `rotate(${i * (360/sectors.length) + (360/sectors.length/2)}deg)` }}
              >
                <span className="text-[11px] font-black text-white uppercase transform rotate-180" style={{ writingMode: 'vertical-rl' }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
          
          {}
          <div className="absolute inset-0 m-auto w-12 h-12 bg-white rounded-full shadow-lg border-4 border-gray-50 z-20 flex items-center justify-center">
             <FaGift className="text-emerald-500" />
          </div>
        </div>

        {!result ? (
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className={`w-full py-4 rounded-2xl font-black text-white uppercase tracking-widest shadow-xl transition transform active:scale-95 ${
              isSpinning ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 hover:-translate-y-1'
            }`}
          >
            {isSpinning ? 'Крутимо...' : 'Запустити колесо'}
          </button>
        ) : (
          <div className="w-full animate-bounceIn">
            {result.value > 0 ? (
              <div className="bg-emerald-50 border-2 border-emerald-100 rounded-2xl p-6 text-center">
                <p className="text-emerald-800 font-bold mb-2">Вітаємо! Ваш виграш:</p>
                <p className="text-4xl font-black text-emerald-600 mb-4">{result.label}</p>
                
                <div className="relative flex items-center bg-white border border-emerald-200 rounded-xl overflow-hidden shadow-sm">
                  <input 
                    type="text" 
                    readOnly 
                    value={coupon}
                    className="w-full bg-transparent px-4 py-3 text-center font-mono font-bold text-emerald-900 outline-none"
                  />
                  <button 
                    onClick={copyToClipboard}
                    className="bg-emerald-600 text-white px-4 py-3 hover:bg-emerald-700 transition"
                  >
                    {copied ? <FaCheck /> : <FaCopy />}
                  </button>
                </div>
                <p className="text-[10px] text-emerald-500 mt-2 uppercase font-black">Скопіюйте код та вставте в кошику</p>
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-6 text-center">
                <p className="text-gray-500 font-bold">На жаль, цього разу без знижки.</p>
                <p className="text-gray-400 text-sm mt-2">Але ви завжди можете отримати професійну консультацію від наших менеджерів!</p>
                <button 
                  onClick={onClose}
                  className="mt-4 w-full py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 transition"
                >
                  Зрозуміло
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountWheel;
