const request = require('supertest');
const app = require('../app');
const db = require('../db');

describe('Gold Bud Trans API Integration Tests', () => {

  afterAll(async () => {
    // Закриваємо з'єднання з базою після завершення тестів
    await db.end();
  });

  describe('GET /health', () => {
    it('повинен повертати 200 OK та статус "ok"', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'ok');
    });
  });

  describe('GET /cards/available', () => {
    it('повинен повертати список доступної спецтехніки', async () => {
      const res = await request(app).get('/cards/available');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('title');
      expect(res.body[0]).toHaveProperty('price_per_day');
    });
  });

  describe('Coupons API', () => {
    it('GET /coupons повинен повертати список діючих промокодів', async () => {
      const res = await request(app).get('/coupons');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      const welcomeCoupon = res.body.find(c => c.code === 'WELCOME10');
      expect(welcomeCoupon).toBeDefined();
      expect(Number(welcomeCoupon.discount)).toBe(10);
    });

    it('POST /coupons/validate повинен підтверджувати валідний промокод WELCOME10', async () => {
      const res = await request(app)
        .post('/coupons/validate')
        .send({ code: 'WELCOME10' });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('discount', 10);
    });

    it('POST /coupons/validate повинен повертати 404 при неіснуючому промокоді', async () => {
      const res = await request(app)
        .post('/coupons/validate')
        .send({ code: 'NON_EXISTING_PROMO' });
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('PDF Invoice API', () => {
    it('GET /orders/1/invoice повинен вимагати авторизацію (401)', async () => {
      const res = await request(app).get('/orders/1/invoice');
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('Auth API', () => {
    it('POST /auth/login повинен успішно авторизувати адміністратора', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          username: 'admin',
          password: 'admin123'
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('role', 'admin');
    });

    it('POST /auth/login повинен повертати 400 при неправильному паролі', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          username: 'admin',
          password: 'wrong_password_999'
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });

    it('POST /auth/register повинен валідувати обов\'язкові поля', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({ username: 'missing_password' });
      expect(res.statusCode).toEqual(400);
    });
  });

});
