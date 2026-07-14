import React, { useEffect, useState, useContext } from 'react'
import Slider from "react-slick";
import { FaMoneyBillWave, FaTools, FaUserShield, FaHandshake } from "react-icons/fa";
import { Link } from "react-router-dom";
import AOS from 'aos';
import 'aos/dist/aos.css';
import DiscountWheel from '../components/DiscountWheel';
import { CartContext } from '../context/CartContext';

function Home() {
  const [isWheelOpen, setIsWheelOpen] = useState(false);
  const { sliderImages } = useContext(CartContext);
  const API_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      easing: 'ease-out-cubic',
    });
  }, []);

  return (
    <div className="min-h-screen bg-white w-full overflow-x-hidden">
      {}
      <DiscountWheel 
        isOpen={isWheelOpen} 
        onClose={() => setIsWheelOpen(false)} 
      />

      {}
      <section className="relative h-auto flex flex-col justify-between bg-emerald-950 overflow-hidden text-white lg:min-h-[90vh] lg:flex-row lg:items-center lg:justify-start">

        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/60 via-emerald-950/50 to-emerald-950/90 z-10 lg:bg-gradient-to-r lg:from-emerald-950 lg:via-emerald-950/80 lg:to-transparent" />
          <img
            src="/images/bg.png"
            alt="Background"
            className="w-full h-full object-cover opacity-40 lg:scale-105"
          />
        </div>

        {}
        <div className="relative z-20 flex-1 flex flex-col justify-center px-5 pt-20 pb-6 sm:px-8 lg:max-w-7xl lg:mx-auto lg:w-full lg:px-12 lg:pt-0 lg:pb-0">
          <div className="lg:max-w-3xl" data-aos="fade-right">
            <h1 className="text-4xl font-black leading-[1.15] mb-4 sm:text-5xl lg:text-7xl lg:leading-[1.1] lg:mb-8">
              Ефективні рішення<br />
              <span className="text-emerald-400 lg:text-emerald-500">для важких завдань</span>
            </h1>

            <p className="text-emerald-100/75 text-sm leading-relaxed mb-7 max-w-md sm:text-base lg:text-xl lg:text-emerald-100/80 lg:mb-10 lg:max-w-xl" data-aos="fade-up" data-aos-delay="200">
              Комплексний підхід до оренди промислової та сільськогосподарської техніки.
              Забезпечуємо безперебійну роботу вашого об'єкту з 2007 року.
            </p>

            <div className="flex flex-row gap-2 sm:gap-4 lg:gap-5" data-aos="fade-up" data-aos-delay="400">
              <Link to="/Rent"
                className="flex-1 sm:w-auto text-center px-3 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 active:scale-95 transition-all text-[11px] sm:text-sm shadow-lg shadow-emerald-900/30 lg:px-10 lg:py-4 lg:rounded-lg lg:shadow-xl lg:text-base whitespace-nowrap">
                Каталог техніки
              </Link>
              <Link to="/UmovRent"
                className="flex-1 sm:w-auto text-center px-3 py-3 bg-white/10 border border-white/20 backdrop-blur-sm text-white font-bold rounded-xl hover:bg-white/20 active:scale-95 transition-all text-[11px] sm:text-sm lg:px-10 lg:py-4 lg:rounded-lg lg:bg-white/5 lg:border-white/10 lg:text-base whitespace-nowrap">
                Регламент послуг
              </Link>
            </div>
          </div>
        </div>

        {}
        <div className="relative z-20 grid grid-cols-2 gap-px bg-white/8 border-t border-white/10 lg:hidden" data-aos="fade-up">
          {[
            { val: '500+', label: 'Одиниць парку' },
            { val: '15 р.', label: 'Досвіду' },
          ].map((s, i) => (
            <div key={i} className="bg-emerald-950/60 backdrop-blur-sm px-5 py-4 flex flex-col gap-0.5">
              <span className="text-xl font-black text-emerald-400">{s.val}</span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-emerald-100/50">{s.label}</span>
            </div>
          ))}
        </div>

        {}
        <div className="absolute bottom-0 left-0 w-full bg-black/20 backdrop-blur-md border-t border-white/5 py-6 hidden lg:block z-20" data-aos="slide-up">
          <div className="max-w-7xl mx-auto px-12 flex justify-between items-center text-sm font-medium tracking-wider uppercase text-emerald-100/60">
            {[['500+','Одиниць парку'],['15','Років досвіду'],['24/7','Техпідтримка'],['100%','Страхування']].map(([v,l],i,arr) => (
              <React.Fragment key={i}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-emerald-500">{v}</span> {l}
                </div>
                {i < arr.length - 1 && <div className="w-px h-8 bg-white/10" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {}
      <section className="w-full py-12 px-5 sm:px-6 md:py-24">
        <div className="md:max-w-7xl md:mx-auto">

          <div className="mb-8 md:mb-16 md:flex md:items-end md:justify-between md:gap-6" data-aos="fade-up">
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-2 md:mb-4">Наші стандарти</p>
              <h3 className="text-2xl font-black text-gray-900 leading-tight sm:text-3xl md:text-5xl">
                Чому професіонали<br className="hidden md:block" /> обирають Gold Bud Trans?
              </h3>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mt-3 md:mt-0 md:max-w-sm">
              Ми не просто здаємо техніку в оренду - ми стаємо частиною вашої виробничої команди,
              мінімізуючи простої та оптимізуючи витрати.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
            {[
              { icon: FaMoneyBillWave, title: "Фінанси", text: "Оптимізація капітальних витрат." },
              { icon: FaTools,         title: "Сервіс",    text: "Миттєве реагування служби." },
              { icon: FaUserShield,    title: "Юридичність",    text: "Прозорі договори та страхування." },
              { icon: FaHandshake,     title: "Партнерство", text: "Індивідуальні умови контрактів." },
            ].map((item, i) => (
              <div key={i}
                data-aos="fade-up"
                data-aos-delay={i * 100}
                className="group flex flex-col gap-2 items-center text-center p-3 rounded-xl border border-gray-100 hover:border-emerald-400 hover:shadow-xl transition-all duration-300 sm:p-6 md:p-8 hover:-translate-y-1">
                <div className="flex-shrink-0 w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-600 transition-colors md:w-14 md:h-14">
                  <item.icon className="text-emerald-700 text-lg group-hover:text-white transition-colors md:text-2xl" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1 md:text-xl md:mb-3">{item.title}</h4>
                  <p className="text-gray-500 text-[10px] leading-tight sm:text-sm">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {}
      <section className="w-full py-12 px-5 bg-gray-50 border-y border-gray-100 sm:px-6 md:py-24 overflow-hidden">
        <div className="md:max-w-7xl md:mx-auto">
          <div className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:gap-20 lg:items-center">

            {}
            <div className="w-full aspect-[16/9] rounded-2xl shadow-xl overflow-hidden sm:aspect-[4/3] lg:rounded-3xl" data-aos="fade-right">
              <Slider dots={false} infinite autoplay autoplaySpeed={4000} speed={800}
                slidesToShow={1} slidesToScroll={1}>
                {sliderImages.length > 0 ? (
                  sliderImages.map((img) => (
                    <img 
                      key={img.id} 
                      src={img.image_path.startsWith('/images') ? img.image_path : `${API_URL}${img.image_path}`} 
                      alt="Техніка" 
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                    />
                  ))
                ) : (
                  ['/images/2.jpg','/images/3.jpg','/images/4.jpg'].map((src, i) => (
                    <img key={i} src={src} alt={`Техніка ${i + 1}`} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                  ))
                )}
              </Slider>
            </div>

            {}
            <div data-aos="fade-left">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-2 md:mb-4">Наш автопарк</p>
              <h3 className="text-2xl font-black text-gray-900 leading-tight mb-3 sm:text-3xl md:text-5xl md:mb-8">
                Тільки преміальні<br className="hidden sm:block" /> світові бренди
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-5 md:text-lg md:mb-10">
                Ми співпрацюємо з лідерами ринку, щоб ви отримували найбільш технологічне та надійне обладнання для своїх цілей.
              </p>

              <ul className="grid grid-cols-2 gap-2.5 mb-6 md:gap-4 md:mb-12">
                {['Будівельна техніка','Сільськогосподарська','Вантажний транспорт','Спеціалізоване обладнання'].map((t, i) => (
                  <li key={i} data-aos="fade-up" data-aos-delay={i * 100} className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-tight md:text-sm md:gap-3">
                    <span className="w-1.5 h-1.5 flex-shrink-0 rounded-full bg-emerald-500 md:w-2 md:h-2" />
                    {t}
                  </li>
                ))}
              </ul>

              <Link to="/Rent"
                className="inline-flex items-center px-7 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-900 active:scale-95 transition-all text-sm md:px-8 md:py-4 md:rounded-lg md:text-base">
                Переглянути каталог
              </Link>
            </div>
          </div>
        </div>
      </section>

    {}
<section className="w-full py-12 px-5 sm:px-6 md:py-20 mb-9 bg-emerald-900 relative overflow-hidden">

  {}
  <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500 opacity-5 rounded-full blur-3xl pointer-events-none" />
  <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500 opacity-5 rounded-full blur-3xl pointer-events-none" />

  <div className="md:max-w-7xl md:mx-auto relative z-10">
    <div className="text-center max-xl mx-auto mb-8 md:mb-20" data-aos="zoom-in">
      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-2">Надійність</p>
      <h3 className="text-2xl font-black text-white mb-3 sm:text-3xl md:text-4xl md:mb-6">
        Гарантія безперебійної роботи
      </h3>
      <p className="text-emerald-100/60 text-sm md:text-base">
        Ми розуміємо ціну години простою, тому вибудували систему, що працює як годинник.
      </p>
    </div>

    <div className="grid grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden md:gap-6 md:bg-transparent md:rounded-none">
      {[
        { val: '1000+', label: 'Задоволених компаній', icon: '🤝' },
        { val: '98%',   label: 'Повторних звернень',   icon: '🔄' },
        { val: '45 хв', label: 'Середній час реакції', icon: '⚡' },
      ].map((s, i) => (
        <div key={i}
          data-aos="fade-up"
          data-aos-delay={i * 200}
          className="flex flex-col items-center justify-center py-8 px-3 text-center bg-white/3 md:bg-white/5 md:border md:border-white/10 md:rounded-2xl md:py-12 md:hover:bg-white/8 md:hover:-translate-y-1 transition-all duration-300">
          <span className="text-2xl font-bold text-emerald-200 tracking-tighter sm:text-4xl md:text-5xl">{s.val}</span>
          <span className="text-[9px] font-bold text-emerald-200 uppercase tracking-widest mt-2 leading-snug sm:text-[11px] md:text-xs">{s.label}</span>
        </div>
      ))}
    </div>
  </div>
</section>

      {}
      <section className="w-full px-5 pb-12 sm:px-6 md:pb-24" data-aos="zoom-in-up">
        <div className="md:max-w-7xl md:mx-auto bg-emerald-800 rounded-2xl sm:rounded-3xl p-8 text-center relative overflow-hidden md:rounded-[3rem] md:p-12 lg:p-20 shadow-2xl">
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-white mb-4 leading-tight sm:text-3xl md:text-6xl md:mb-8">
              Обговоримо ваш<br /> наступний проект?
            </h2>
            <p className="text-emerald-100/70 text-sm leading-relaxed mb-7 max-w-sm mx-auto sm:text-base md:text-lg md:mb-12 md:max-w-xl">
              Наші експерти допоможуть підібрати оптимальний комплект техніки для ваших специфічних завдань.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center sm:gap-5">
              <button 
                onClick={() => setIsWheelOpen(true)}
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500 active:scale-95 transition-all text-sm md:px-12 md:py-5 md:rounded-xl md:text-base"
              >
                Отримати консультацію
              </button>
              <Link to="/News"
                className="w-full sm:w-auto px-8 py-3.5 bg-transparent border border-white/20 text-white font-black rounded-xl hover:bg-white/10 active:scale-95 transition-all text-sm md:px-12 md:py-5 md:text-base">
                Новини галузі
              </Link>
            </div>
          </div>
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500 opacity-10 rounded-full blur-3xl pointer-events-none md:w-64 md:h-64 md:top-0 md:right-0 md:-translate-y-1/2 md:translate-x-1/2" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500 opacity-10 rounded-full blur-3xl pointer-events-none md:w-64 md:h-64 md:bottom-0 md:left-0 md:translate-y-1/2 md:-translate-x-1/2" />
        </div>
      </section>

    </div>
  )
}

export default Home