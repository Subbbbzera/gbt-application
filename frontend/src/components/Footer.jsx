import React from 'react';
import { 
  FaFacebook, FaInstagram, FaTiktok, FaLinkedin, 
  FaPhoneAlt, FaEnvelope, FaMapMarkerAlt 
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-emerald-900 text-gray-200 pt-8 md:pt-16 pb-6 md:pb-8">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-8 md:mb-12 text-center md:text-left">
          
          {}
          <div className="space-y-4 md:space-y-6">
            <h4 className="text-white font-bold uppercase text-xs tracking-widest md:mb-6">Ми в соцмережах</h4>
            <p className="hidden md:block text-sm leading-relaxed text-gray-400">
              Ваш надійний партнер у сфері оренди та продажу спецтехніки. Надаємо якісні рішення для будівництва, сільського господарства та промисловості.
            </p>
            <div className="flex justify-center md:justify-start gap-6 md:gap-4">
              <a href="#" className="hover:text-white transition-colors"><FaFacebook size={20} /></a>
              <a href="#" className="hover:text-white transition-colors"><FaInstagram size={20} /></a>
              <a href="#" className="hover:text-white transition-colors"><FaTiktok size={20} /></a>
              <a href="#" className="hover:text-white transition-colors"><FaLinkedin size={20} /></a>
            </div>
          </div>

          {}
          <div>
            <h4 className="text-white font-bold mb-4 md:mb-6 uppercase text-xs tracking-widest">Навігація</h4>
            <ul className="flex flex-wrap justify-center md:block md:space-y-4 gap-x-4 gap-y-2 text-sm">
              <li><Link to="/" className="hover:text-emerald-400 transition-colors">Головна</Link></li>
              <li><Link to="/Catalog" className="hover:text-emerald-400 transition-colors">Каталог</Link></li>
              <li><Link to="/UmovRent" className="hover:text-emerald-400 transition-colors">Умови</Link></li>
              <li><Link to="/News" className="hover:text-emerald-400 transition-colors">Новини</Link></li>
            </ul>
          </div>

          {}
          <div className="hidden md:block">
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-widest">Підтримка</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Часті запитання</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Політика конфіденційності</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Умови використання</a></li>
            </ul>
          </div>

          {}
          <div className="border-t border-emerald-800 pt-6 md:border-none md:pt-0">
            <h4 className="text-white font-bold mb-4 md:mb-6 uppercase text-xs tracking-widest">Контакти</h4>
            <ul className="space-y-3 md:space-y-4 text-sm">
              <li className="flex items-center justify-center md:justify-start gap-3">
                <FaPhoneAlt className="text-emerald-500" />
                <span>+380 (44) 123-45-67</span>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-3">
                <FaEnvelope className="text-emerald-500" />
                <span>fircailopavlo@gmail.com</span>
              </li>
              <li className="flex items-center justify-center md:justify-start gap-3">
                <FaMapMarkerAlt className="text-emerald-500 flex-shrink-0" />
                <span className="text-xs md:text-sm">м. Хоростків, Тернопільська обл.</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="text-center text-[10px] text-gray-500 uppercase tracking-widest border-t border-emerald-800/50 pt-6">
          © {currentYear} Gold Bud Trans. Всі права захищені.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
