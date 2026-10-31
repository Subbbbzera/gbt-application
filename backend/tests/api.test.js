const request = require('supertest');
const app = require('../app');
const db = require('../db');
const seedData = require('../seed');

describe('Gold Bud Trans API Integration Tests', () => {
  let adminToken = '';

  beforeAll(async () => {
    await seedData();
    const res = await request(app)
      .post('/auth/login')
      .send({
        username: 'admin',
        password: 'admin123'
      });
    adminToken = res.body.token;
  });

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

  describe('Cards API', () => {
    it('GET /cards повинен повертати список усієї техніки з рейтингом', async () => {
      const res = await request(app).get('/cards');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('title');
        expect(res.body[0]).toHaveProperty('reviews_count');
      }
    });

    it('GET /cards/available повинен повертати список доступної спецтехніки', async () => {
      const res = await request(app).get('/cards/available');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('title');
      expect(res.body[0]).toHaveProperty('price_per_day');
    });

    it('GET /cards/:id повинен повертати 404 для неіснуючої картки', async () => {
      const res = await request(app).get('/cards/999999');
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('News API', () => {
    it('GET /news повинен повертати список новин компанії', async () => {
      const res = await request(app).get('/news');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });
  });

  describe('Slider API', () => {
    it('GET /slider повинен повертати масив банерів слайдера', async () => {
      const res = await request(app).get('/slider');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });
  });

  describe('Reviews API', () => {
    it('GET /reviews/:cardId повинен повертати відгуки для техніки', async () => {
      const res = await request(app).get('/reviews/1');
      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });

    it('POST /reviews повинен валідувати обов\'язкові поля (card_id та text)', async () => {
      const res = await request(app)
        .post('/reviews')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ text: '' });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('Coupons API', () => {
    it('GET /coupons повинен повертати список діючих промокодів для адміністратора', async () => {
      const res = await request(app)
        .get('/coupons')
        .set('Authorization', `Bearer ${adminToken}`);
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

  describe('Auth API', () => {
    it('POST /auth/login повинен успішно авторизувати адміністратора з БД', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          username: 'admin',
          password: 'admin123'
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('role', 'admin');
      expect(res.body.user.id).toBeGreaterThan(0);
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

  describe('Protected Routes (Authentication & RBAC Guard)', () => {
    it('GET /orders/1/invoice повинен вимагати авторизацію (401)', async () => {
      const res = await request(app).get('/orders/1/invoice');
      expect(res.statusCode).toEqual(401);
    });

    it('GET /cart повинен вимагати авторизацію (401)', async () => {
      const res = await request(app).get('/cart');
      expect(res.statusCode).toEqual(401);
    });

    it('POST /cart повинен вимагати авторизацію (401)', async () => {
      const res = await request(app).post('/cart').send({ card_id: 1 });
      expect(res.statusCode).toEqual(401);
    });

    it('GET /favorites повинен вимагати авторизацію (401)', async () => {
      const res = await request(app).get('/favorites');
      expect(res.statusCode).toEqual(401);
    });

    it('POST /favorites повинен вимагати авторизацію (401)', async () => {
      const res = await request(app).post('/favorites').send({ card_id: 1 });
      expect(res.statusCode).toEqual(401);
    });

    it('GET /orders повинен вимагати авторизацію (401)', async () => {
      const res = await request(app).get('/orders');
      expect(res.statusCode).toEqual(401);
    });

    it('POST /cards повинен вимагати авторизацію адміністратора (401)', async () => {
      const res = await request(app).post('/cards').send({ title: 'Test' });
      expect(res.statusCode).toEqual(401);
    });

    it('POST /news повинен вимагати авторизацію адміністратора (401)', async () => {
      const res = await request(app).post('/news').send({ title: 'Test', text: 'Test' });
      expect(res.statusCode).toEqual(401);
    });

    it('POST /slider повинен вимагати авторизацію адміністратора (401)', async () => {
      const res = await request(app).post('/slider');
      expect(res.statusCode).toEqual(401);
    });

    it('GET /coupons повинен вимагати авторизацію адміністратора (401)', async () => {
      const res = await request(app).get('/coupons');
      expect(res.statusCode).toEqual(401);
    });

    it('POST /coupons/spin повинен вимагати авторизацію (401)', async () => {
      const res = await request(app).post('/coupons/spin');
      expect(res.statusCode).toEqual(401);
    });

    it('POST /reviews повинен вимагати авторизацію (401)', async () => {
      const res = await request(app).post('/reviews').send({ card_id: 1, text: 'Test' });
      expect(res.statusCode).toEqual(401);
    });
  });

});
