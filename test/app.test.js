import request from 'supertest';
import { app, store } from '../src/app.js';

// Reset store before each test
function resetStore() {
  store.cart = { items: [] };
  store.orders = [];
  store.discountCodes = [];
}

describe('API Routes', () => {
  beforeEach(() => {
    resetStore();
  });

  describe('GET /', () => {
    test('sanity check', async () => {
      const response = await request(app).get('/');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Cart' });
    });
  });

  describe('GET /api/products', () => {
    test('returns non empty array', async () => {
      const response = await request(app).get('/api/products');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/cart', () => {
    test('returns empty cart initially', async () => {
      const response = await request(app).get('/api/cart');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        items: [],
        subtotal: 0,
        discountEligible: false
      });
    });
  });

  describe('POST /api/cart/add', () => {
    test('adds item to empty cart', async () => {
      const response = await request(app)
        .post('/api/cart/add')
        .send({ productId: 1, quantity: 2 });

      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(1);
      expect(response.body.items[0]).toMatchObject({
        productId: 1,
        quantity: 2,
        price: 100
      });
    });

    test('increments quantity for existing item', async () => {
      await request(app)
        .post('/api/cart/add')
        .send({ productId: 1, quantity: 2 });

      const response = await request(app)
        .post('/api/cart/add')
        .send({ productId: 1, quantity: 3 });

      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(1);
      expect(response.body.items[0].quantity).toBe(5);
    });

    test('adds multiple different items', async () => {
      await request(app)
        .post('/api/cart/add')
        .send({ productId: 1, quantity: 1 });

      const response = await request(app)
        .post('/api/cart/add')
        .send({ productId: 2, quantity: 2 });

      expect(response.status).toBe(200);
      expect(response.body.items.length).toBe(2);
    });

    test('returns 400 when data is missing', async () => {
      const response = await request(app)
        .post('/api/cart/add')
        .send({ quantity: 2 });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('productId and quantity are required');
    });

    test('returns 404 when product does not exist', async () => {
      const response = await request(app)
        .post('/api/cart/add')
        .send({ productId: 999, quantity: 1 });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Product not found');
    });
  });

  describe('POST /api/checkout', () => {
    test('creates order successfully', async () => {
      await request(app)
        .post('/api/cart/add')
        .send({ productId: 1, quantity: 2 });

      const response = await request(app)
        .post('/api/checkout')
        .send({});

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Order placed successfully');
      expect(response.body.order).toMatchObject({
        orderId: 'O1',
        subtotal: 200,
        discount: 0,
        totalAmount: 200
      });
    });

    test('clears cart after checkout', async () => {
      await request(app)
        .post('/api/cart/add')
        .send({ productId: 1, quantity: 1 });

      await request(app)
        .post('/api/checkout')
        .send({});

      const cartResponse = await request(app).get('/api/cart');
      expect(cartResponse.body.items).toEqual([]);
    });

    test('applies discount on 3rd order with valid code', async () => {
      // Place 2 orders
      for (let i = 0; i < 2; i++) {
        await request(app)
          .post('/api/cart/add')
          .send({ productId: 1, quantity: 1 });
        await request(app)
          .post('/api/checkout')
          .send({});
      }

      // Generate discount code for 3rd order
      const codeResponse = await request(app)
        .post('/api/admin/generateCode')
        .send({});
      const discountCode = codeResponse.body.code;

      // 3rd order with discount
      await request(app)
        .post('/api/cart/add')
        .send({ productId: 1, quantity: 1 });

      const response = await request(app)
        .post('/api/checkout')
        .send({ discountCode });

      expect(response.status).toBe(201);
      expect(response.body.order.subtotal).toBe(100);
      expect(response.body.order.discount).toBe(10); // 10% of 100
      expect(response.body.order.totalAmount).toBe(90);
    });
  });

  describe('End-to-End Scenario', () => {
    test('complete order flow with discount', async () => {
      // Order 1
      await request(app)
        .post('/api/cart/add')
        .send({ productId: 1, quantity: 1 });
      await request(app)
        .post('/api/checkout')
        .send({});

      // Order 2
      await request(app)
        .post('/api/cart/add')
        .send({ productId: 2, quantity: 2 });
      await request(app)
        .post('/api/checkout')
        .send({});

      // Generate discount code for order 3
      const codeResponse = await request(app)
        .post('/api/admin/generateCode')
        .send({});
      expect(codeResponse.status).toBe(201);

      // Check cart shows discount eligible
      await request(app)
        .post('/api/cart/add')
        .send({ productId: 3, quantity: 1 });

      const cartResponse = await request(app).get('/api/cart');
      expect(cartResponse.body.discountEligible).toBe(true);

      // Order 3 with discount
      const checkoutResponse = await request(app)
        .post('/api/checkout')
        .send({ discountCode: codeResponse.body.code });

      expect(checkoutResponse.status).toBe(201);
      expect(checkoutResponse.body.order.discount).toBe(7.5); // 10% of $75

      // Check stats
      const statsResponse = await request(app).get('/api/admin/stats');
      expect(statsResponse.body.totalCount).toBe(4); // 1 + 2 + 1
      expect(statsResponse.body.totalDiscount).toBe(7.5);
    });
  });
});
