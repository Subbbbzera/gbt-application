const PDFDocument = require('pdfkit');

/**
 * Генерує офіційний PDF рахунок / договір замовлення
 * @param {Object} order - дані замовлення
 * @param {Array} items - товари в замовленні
 * @param {Stream} stream - потік для запису (наприклад res)
 */
function generateOrderInvoicePdf(order, items, stream) {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  doc.pipe(stream);

  // Заголовок компанії
  doc
    .fontSize(20)
    .text("Gold Bud Trans", 50, 50, { bold: true })
    .fontSize(10)
    .text("Оренда та продаж будівельної спецтехніки", 50, 75)
    .text("Україна, м. Київ | Тел: +380 (44) 123-45-67", 50, 90)
    .text("Email: support@goldbudtrans.ua | www.goldbudtrans.ua", 50, 105);

  doc.moveTo(50, 125).lineTo(550, 125).strokeColor("#e5e7eb").stroke();

  // Номер та дата
  const formattedDate = new Date(order.created_at || Date.now()).toLocaleDateString('uk-UA');
  doc
    .fontSize(16)
    .text(`РАХУНОК-ДОГОВІР № ${order.order_number || order.id}`, 50, 140, { bold: true })
    .fontSize(10)
    .text(`Дата оформлення: ${formattedDate}`, 50, 162);

  // Інформація про замовника
  doc
    .fontSize(12)
    .text("Замовник:", 50, 190, { underline: true })
    .fontSize(10)
    .text(`ПІБ / Назва: ${order.customer_name}`, 50, 210)
    .text(`Телефон: ${order.customer_phone}`, 50, 225)
    .text(`Email: ${order.customer_email}`, 50, 240)
    .text(`Адреса доставки / об'єкту: ${order.delivery_address || 'Самовивіз'}`, 50, 255);

  // Період оренди
  if (order.start_date && order.end_date) {
    const sDate = new Date(order.start_date).toLocaleDateString('uk-UA');
    const eDate = new Date(order.end_date).toLocaleDateString('uk-UA');
    doc.text(`Період оренди: з ${sDate} по ${eDate}`, 50, 270);
  }

  // Таблиця товарів
  const tableTop = 300;
  doc
    .rect(50, tableTop, 500, 20)
    .fillColor("#1f2937")
    .fill();

  doc
    .fillColor("#ffffff")
    .fontSize(10)
    .text("№", 60, tableTop + 5, { width: 30 })
    .text("Найменування спецтехніки", 100, tableTop + 5, { width: 220 })
    .text("Тип", 330, tableTop + 5, { width: 60 })
    .text("Днів / К-сть", 400, tableTop + 5, { width: 60 })
    .text("Сума (грн)", 470, tableTop + 5, { width: 70 });

  let yPosition = tableTop + 25;
  doc.fillColor("#111827");

  (items || []).forEach((item, index) => {
    const isRent = item.type === 'rent';
    const typeLabel = isRent ? "Оренда" : "Купівля";
    const countLabel = isRent ? `${item.days_count || 1} дн.` : "1 шт.";
    const subtotal = Number(item.subtotal || 0).toLocaleString('uk-UA');

    doc
      .fontSize(9)
      .text(`${index + 1}`, 60, yPosition, { width: 30 })
      .text(`${item.card_title || 'Спецтехніка'}`, 100, yPosition, { width: 220 })
      .text(typeLabel, 330, yPosition, { width: 60 })
      .text(countLabel, 400, yPosition, { width: 60 })
      .text(`${subtotal}`, 470, yPosition, { width: 70 });

    yPosition += 20;
    doc.moveTo(50, yPosition - 2).lineTo(550, yPosition - 2).strokeColor("#f3f4f6").stroke();
  });

  // Підсумок
  yPosition += 15;
  const total = Number(order.total_amount || 0).toLocaleString('uk-UA');
  const prepay = Number(order.prepayment_amount || 0).toLocaleString('uk-UA');

  if (order.coupon_code) {
    doc.fontSize(10).text(`Застосовано промокод: ${order.coupon_code}`, 300, yPosition);
    yPosition += 15;
  }

  doc
    .fontSize(12)
    .text(`Загальна сума: ${total} грн`, 300, yPosition, { bold: true })
    .fontSize(10)
    .text(`Передплата: ${prepay} грн (Статус: ${order.status})`, 300, yPosition + 18);

  // Підписи
  const signaturesTop = Math.max(yPosition + 70, 650);
  doc
    .moveTo(50, signaturesTop).lineTo(230, signaturesTop).strokeColor("#9ca3af").stroke()
    .moveTo(370, signaturesTop).lineTo(550, signaturesTop).stroke()
    .fontSize(9)
    .text("Виконавець: ТОВ «Голд Буд Транс»", 50, signaturesTop + 5)
    .text("Замовник: підпис", 370, signaturesTop + 5);

  doc.end();
}

module.exports = {
  generateOrderInvoicePdf
};
