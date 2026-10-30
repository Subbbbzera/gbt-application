const { PassThrough } = require('stream');
const { generateOrderInvoicePdf } = require('../utils/pdfGenerator');

describe('PDF Invoice Generator Unit Tests', () => {

  const getPdfBuffer = (order, items) => {
    return new Promise((resolve, reject) => {
      const stream = new PassThrough();
      const chunks = [];

      stream.on('data', chunk => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);

      generateOrderInvoicePdf(order, items, stream);
    });
  };

  it('повинен успішно створити валідний PDF документ для замовлення на оренду', async () => {
    const mockOrder = {
      id: 101,
      order_number: 'ORD-101',
      customer_name: 'Іван Петренко',
      customer_phone: '+380501234567',
      customer_email: 'ivan@example.com',
      delivery_address: 'вул. Хрещатик 1, Київ',
      start_date: '2026-06-01',
      end_date: '2026-06-05',
      total_amount: 15000,
      prepayment_amount: 3000,
      status: 'pending'
    };

    const mockItems = [
      {
        card_title: 'Екскаватор JCB 3CX',
        type: 'rent',
        days_count: 4,
        subtotal: 15000
      }
    ];

    const buffer = await getPdfBuffer(mockOrder, mockItems);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(100);
    // Перевірка магічного заголовка PDF файлу
    expect(buffer.slice(0, 5).toString('ascii')).toBe('%PDF-');
  });

  it('повинен генерувати PDF для замовлення на купівлю зі знижкою за промокодом', async () => {
    const mockOrder = {
      id: 102,
      order_number: 'ORD-102',
      customer_name: 'ТОВ "БудМонтаж"',
      customer_phone: '+380671112233',
      customer_email: 'bud@example.com',
      coupon_code: 'WELCOME10',
      total_amount: 450000,
      prepayment_amount: 45000,
      status: 'confirmed'
    };

    const mockItems = [
      {
        card_title: 'Навантажувач CAT 906M',
        type: 'buy',
        subtotal: 500000
      }
    ];

    const buffer = await getPdfBuffer(mockOrder, mockItems);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(100);
    expect(buffer.slice(0, 5).toString('ascii')).toBe('%PDF-');
  });

  it('повинен генерувати PDF навіть без списку товарів (порожній масив) та дат', async () => {
    const mockOrder = {
      id: 103,
      customer_name: 'Олександр',
      customer_phone: '+380991234567',
      customer_email: 'alex@test.com',
      total_amount: 0,
      prepayment_amount: 0,
      status: 'created'
    };

    const buffer = await getPdfBuffer(mockOrder, []);

    expect(buffer).toBeInstanceOf(Buffer);
    expect(buffer.length).toBeGreaterThan(100);
    expect(buffer.slice(0, 5).toString('ascii')).toBe('%PDF-');
  });

});
