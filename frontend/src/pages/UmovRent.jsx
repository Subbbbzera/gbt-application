import React from 'react';
import { 
  FaRegFileAlt, FaBalanceScale, FaHandshake, FaShieldAlt, 
  FaInfoCircle, FaCheck, FaBuilding, FaUser 
} from 'react-icons/fa';

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-200">
    <Icon className="text-emerald-700 text-xl" />
    <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">
      {title}
    </h2>
  </div>
);

function UmovRent() {
  return (
    <div className="bg-white min-h-screen">
      {}
      <div className="bg-emerald-900 text-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
            Регламент надання послуг оренди
          </h1>
          <p className="text-lg text-emerald-100 max-w-2xl leading-relaxed">
            Ми забезпечуємо прозорі та юридично обґрунтовані умови співпраці. Ознайомтеся з офіційними правилами та вимогами до документації для оформлення оренди техніки.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16">
        {}
        <div className="mb-16 p-6 bg-gray-50 border-l-4 border-emerald-600 rounded-r-lg shadow-sm">
          <div className="flex gap-4">
            <FaInfoCircle className="text-emerald-600 text-2xl flex-shrink-0 mt-1" />
            <div className="text-gray-700">
              <p className="font-bold text-gray-900 mb-1">Офіційне застереження:</p>
              <p className="leading-relaxed">
                Надання техніки в оренду здійснюється виключно після підписання Договору оренди, Акту приймання-передачі та оформлення договору страхування. Всі відносини сторін регулюються чинним законодавством України.
              </p>
            </div>
          </div>
        </div>

        {}
        <section className="mb-16">
          <SectionHeader icon={FaBalanceScale} title="Загальні положення та умови" />
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-3">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <FaCheck className="text-emerald-600 text-sm" /> Терміни оренди
              </h4>
              <p className="text-gray-600 leading-relaxed text-sm">
                Мінімальний термін оренди становить 24 години (одна доба). Розрахунок терміну починається з моменту підписання Акту приймання-передачі та відвантаження техніки зі складу Орендодавця.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <FaCheck className="text-emerald-600 text-sm" /> Логістика та транспортування
              </h4>
              <p className="text-gray-600 leading-relaxed text-sm">
                Доставка техніки на об'єкт та її повернення здійснюється силами та за рахунок Орендаря, якщо інше не обумовлено окремою угодою. Орендар несе повну відповідальність за цілісність техніки під час транспортування.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <FaCheck className="text-emerald-600 text-sm" /> Технічне обслуговування
              </h4>
              <p className="text-gray-600 leading-relaxed text-sm">
                Орендодавець забезпечує регламентне сервісне обслуговування. Щоденний технічний огляд, перевірка рівнів робочих рідин та очищення техніки є обов'язком Орендаря.
              </p>
            </div>
            <div className="space-y-3">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <FaCheck className="text-emerald-600 text-sm" /> Витратні матеріали
              </h4>
              <p className="text-gray-600 leading-relaxed text-sm">
                Паливо, мастильні матеріали (поза регламентом) та інші розхідні матеріали не включені у вартість оренди і забезпечуються Орендарем згідно з технічними вимогами експлуатації.
              </p>
            </div>
          </div>
        </section>

        {}
        <section className="mb-16">
          <SectionHeader icon={FaRegFileAlt} title="Вимоги до документації" />
          <div className="grid md:grid-cols-2 gap-8">
            {}
            <div className="p-8 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <FaUser className="text-emerald-600" />
                <h3 className="font-bold text-lg text-gray-900">Для фізичних осіб та ФОП</h3>
              </div>
              <ul className="space-y-4 text-sm text-gray-600">
                <li className="flex gap-3">
                  <span className="font-bold text-emerald-700">01.</span>
                  Паспорт громадянина України (оригінал для верифікації).
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-emerald-700">02.</span>
                  Реєстраційний номер облікової картки платника податків (ІПН).
                </li>
                <li className="flex gap-3 text-gray-400 italic">
                  Додатково може знадобитися посвідчення водія відповідної категорії або військовий квиток.
                </li>
              </ul>
            </div>

            {}
            <div className="p-8 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-6">
                <FaBuilding className="text-emerald-600" />
                <h3 className="font-bold text-lg text-gray-900">Для юридичних осіб</h3>
              </div>
              <ul className="space-y-4 text-sm text-gray-600">
                <li className="flex gap-3">
                  <span className="font-bold text-emerald-700">01.</span>
                  Виписка з ЄДРПОУ та свідоцтво платника ПДВ.
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-emerald-700">02.</span>
                  Наказ про призначення керівника або довіреність на підписання договору.
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-emerald-700">03.</span>
                  Довіреність на отримання ТМЦ для представника компанії.
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-emerald-700">04.</span>
                  Повні банківські реквізити та контактна інформація.
                </li>
              </ul>
            </div>
          </div>
        </section>

        {}
        <section className="mb-16">
          <SectionHeader icon={FaShieldAlt} title="Відповідальність та страхування" />
          <div className="bg-emerald-50 p-8 rounded-xl border border-emerald-100">
            <p className="text-gray-700 leading-relaxed mb-6 italic">
              "Орендар несе повну фінансову відповідальність за збереження техніки, її цільове використання та дотримання норм техніки безпеки з моменту отримання до моменту повернення Орендодавцю."
            </p>
            <div className="grid sm:grid-cols-3 gap-6 text-center">
              <div className="p-4">
                <div className="text-emerald-700 font-bold text-2xl mb-1">100%</div>
                <div className="text-xs text-emerald-900 uppercase font-bold tracking-tighter">Страхування ризиків</div>
              </div>
              <div className="p-4 border-x border-emerald-200">
                <div className="text-emerald-700 font-bold text-2xl mb-1">24/7</div>
                <div className="text-xs text-emerald-900 uppercase font-bold tracking-tighter">Технічна підтримка</div>
              </div>
              <div className="p-4">
                <div className="text-emerald-700 font-bold text-2xl mb-1">ISO</div>
                <div className="text-xs text-emerald-900 uppercase font-bold tracking-tighter">Стандарти безпеки</div>
              </div>
            </div>
          </div>
        </section>

        {}
        <div className="text-center pt-10 border-t border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            Готові до співпраці?
          </h3>
          <p className="text-gray-500 mb-8 max-w-xl mx-auto">
            Зв'яжіться з нашим юридичним відділом для отримання зразка типового договору та обговорення індивідуальних умов оренди.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-10 py-4 bg-emerald-800 text-white font-bold rounded-lg hover:bg-emerald-900 transition shadow-lg">
              Отримати консультацію
            </button>
           
          </div>
        </div>
      </div>
    </div>
  );
}

export default UmovRent;
