const express = require("express");
const db = require("../db");
const { authenticateToken } = require("./auth");
const nodemailer = require("nodemailer");
const https = require("https");
const multer = require("multer");
const { sendEmail, sendTelegramMessage } = require("../utils/notifications");
const path = require("path");

const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, "doc-" + uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });




router.post("/", authenticateToken, upload.single("document"), async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    let { 
      start_date, 
      end_date, 
      customer_name, 
      customer_email, 
      customer_phone, 
      delivery_address, 
      notes,
      items, 
      coupon_code
    } = req.body;

    
    if (typeof items === 'string') {
      try {
        items = JSON.parse(items);
      } catch (e) {
        console.error("❌ Items parse error:", e);
        return res.status(400).json({ error: "Неправильний формат товарів" });
      }
    }

    console.log("📦 Incoming Order Request:", { ...req.body, document: req.file?.filename });
    
    
    const missingFields = [];
    if (!start_date) missingFields.push("дата початку");
    if (!end_date) missingFields.push("дата закінчення");
    if (!customer_name) missingFields.push("ім'я");
    if (!customer_phone) missingFields.push("телефон");
    if (!customer_email) missingFields.push("email");
    if (!items || !items.length) missingFields.push("товари");

    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Заповніть обов'язкові поля: ${missingFields.join(", ")}` 
      });
    }
    
    const card_ids = items.map(i => i.id);

    await connection.beginTransaction();
    
    
    const [dbItems] = await connection.execute(
      `SELECT id, title, price_per_day, price_buy, is_available
       FROM cards 
       WHERE id IN (${card_ids.map(() => '?').join(',')})`,
      [...card_ids]
    );
    
    
    const startDate = new Date(start_date);
    const endDate = new Date(end_date);
    
    const timeDiff = endDate.getTime() - startDate.getTime();
    let daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    if (daysDiff <= 0) daysDiff = 1;
    
    let totalAmount = 0;
    const orderItemsToInsert = [];

    for (const itemReq of items) {
      const dbItem = dbItems.find(i => i.id === itemReq.id);
      if (!dbItem || dbItem.is_available === 0) {
        await connection.rollback();
        return res.status(400).json({ error: `Товар "${dbItem?.title || 'невідомий'}" вже недоступний` });
      }

      let subtotal = 0;
      let actualDays = 0;
      if (itemReq.type === 'buy') {
        subtotal = parseFloat(dbItem.price_buy) || 0;
      } else {
        actualDays = daysDiff;
        subtotal = parseFloat(dbItem.price_per_day) * actualDays;
      }

      totalAmount += subtotal;
      orderItemsToInsert.push({
        id: dbItem.id,
        title: dbItem.title,
        price_per_day: dbItem.price_per_day,
        price_buy: dbItem.price_buy,
        days_count: actualDays,
        subtotal,
        type: itemReq.type
      });
    }
    
    if (coupon_code) {
      const [coupons] = await connection.execute(
        "SELECT * FROM coupons WHERE code = ? AND used_count < usage_limit",
        [coupon_code.toUpperCase()]
      );
      if (coupons.length > 0) {
        const discount = coupons[0].discount;
        totalAmount = totalAmount * (1 - discount / 100);
        await connection.execute(
          "UPDATE coupons SET used_count = used_count + 1 WHERE id = ?",
          [coupons[0].id]
        );
      }
    }
    
    const orderNumber = `ORD-${Date.now()}`;
    
    let prepaymentAmount = 0;
    for (const item of orderItemsToInsert) {
      if (item.type === 'buy') {
        prepaymentAmount += (item.price_buy * 0.1 || 0);
      } else {
        const weeks = Math.ceil(daysDiff / 7);
        prepaymentAmount += (item.price_per_day * weeks);
      }
    }
    if (coupon_code && totalAmount < orderItemsToInsert.reduce((s, i) => s + i.subtotal, 0)) {
        const discountFactor = totalAmount / orderItemsToInsert.reduce((s, i) => s + i.subtotal, 0);
        prepaymentAmount = prepaymentAmount * discountFactor;
    }
    prepaymentAmount = Math.round(prepaymentAmount);

    const [orderResult] = await connection.execute(
      `INSERT INTO orders (user_id, order_number, total_amount, prepayment_amount, start_date, end_date, 
       customer_name, customer_email, customer_phone, delivery_address, notes, status, coupon_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'verification', ?)`,
      [req.user.id, orderNumber, totalAmount, prepaymentAmount, start_date, end_date, 
       customer_name, customer_email, customer_phone, delivery_address, notes, coupon_code || null]
    );
    
    const orderId = orderResult.insertId;

    for (const item of orderItemsToInsert) {
      await connection.execute(
        `INSERT INTO order_items (order_id, card_id, card_title, price_per_day, price_buy, days_count, subtotal, type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.id, item.title, item.price_per_day, item.price_buy, item.days_count, item.subtotal, item.type]
      );
    }

    
    if (req.file) {
      await connection.execute(
        `INSERT INTO order_documents (order_id, file_path, status) VALUES (?, ?, 'pending')`,
        [orderId, `/uploads/${req.file.filename}`]
      );
    }
    
    await connection.execute(
      `UPDATE cards SET is_available = 0 WHERE id IN (${card_ids.map(() => '?').join(',')})`,
      [...card_ids]
    );
    
    await connection.execute(
      `DELETE FROM user_cart WHERE user_id = ? AND card_id IN (${card_ids.map(() => '?').join(',')})`, 
      [req.user.id, ...card_ids]
    );
    
    await connection.commit();

    
    await sendEmail(
      customer_email,
      'Ваше замовлення прийнято на перевірку (Gold Bud Trans)',
      `Дякуємо! Ваше замовлення #${orderNumber} отримано та очікує на перевірку документів адміністратором.`,
      `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #059669;">Замовлення отримано!</h2>
          <p>Вітаємо, ${customer_name}. Ваше замовлення <b>#${orderNumber}</b> успішно створено.</p>
          <p>Наразі наші менеджери перевіряють завантажені вами документи. Це зазвичай займає від 15 хвилин до 2 годин у робочий час.</p>
          <p>Як тільки документи будуть схвалені, ви отримаєте ще один лист із посиланням на оплату завдатку.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 12px; color: #64748b;">З повагою, команда Gold Bud Trans</p>
        </div>
      `,
      req.user.id
    );

    
    const telegramText = `
<b>🔔 НОВЕ ЗАМОВЛЕННЯ (На перевірці)!</b>
<b>Номер:</b> #${orderNumber}
<b>Клієнт:</b> ${customer_name}
${req.file ? '<b>📄 Документи додано (Перевірте!)</b>' : '<b>⚠️ Без документів</b>'}
<b>Сума:</b> ${totalAmount} грн
<b>Передплата:</b> ${prepaymentAmount} грн
    `.trim();

    sendTelegramMessage(telegramText);

    res.json({ message: 'Замовлення відправлено на перевірку', orderId, orderNumber });
    
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("❌ Order Error:", error);
    res.status(500).json({ error: 'Помилка створення замовлення' });
  } finally {
    if (connection) connection.release();
  }
});


router.patch("/admin/:orderId/approve-docs", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.username !== 'admin') {
      return res.status(403).json({ error: 'Доступ заборонено' });
    }

    const [orders] = await db.query("SELECT * FROM orders WHERE id = ?", [req.params.orderId]);
    if (orders.length === 0) return res.status(404).json({ error: 'Замовлення не знайдено' });
    const order = orders[0];

    await db.query("UPDATE orders SET status = 'awaiting_prepayment' WHERE id = ?", [req.params.orderId]);
    
    
    await sendEmail(
      order.customer_email,
      'Ваше замовлення схвалено! (Gold Bud Trans)',
      `Ваші документи за замовленням #${order.order_number} перевірено. Будь ласка, внесіть завдаток в особистому кабінеті.`,
      `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #059669;">Вітаємо, ${order.customer_name}!</h2>
          <p>Ваші документи за замовленням <b>#${order.order_number}</b> успішно перевірено та схвалено адміністратором.</p>
          <p>Тепер ви можете внести завдаток у розмірі <b>${order.prepayment_amount} грн</b>, щоб активувати оренду техінки.</p>
          <div style="margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/orders" 
               style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Перейти до оплати
            </a>
          </div>
          <hr style="border: 0; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 12px; color: #64748b;">З повагою, команда Gold Bud Trans</p>
        </div>
      `,
      order.user_id
    );

    res.json({ message: 'Документи схвалено, очікуємо на передплату' });
  } catch (error) {
    console.error("❌ Approve Docs Error:", error);
    res.status(500).json({ error: 'Помилка схвалення документів' });
  }
});


router.patch("/:id/pay-deposit", authenticateToken, async (req, res) => {
  try {
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (orders.length === 0) return res.status(404).json({ error: 'Замовлення не знайдено' });
    const order = orders[0];

    if (order.status !== 'awaiting_prepayment') {
      return res.status(400).json({ error: 'Замовлення не готове до оплати завдатку' });
    }

    await db.query("UPDATE orders SET status = 'renting' WHERE id = ?", [req.params.id]);

    
    await sendEmail(
      order.customer_email,
      'Завдаток отримано! (Gold Bud Trans)',
      `Дякуємо! Завдаток за замовлення #${order.order_number} отримано. Техніка тепер в оренді.`,
      `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #059669;">Оплату отримано!</h2>
          <p>Дякуємо, ${order.customer_name}. Ми отримали ваш завдаток у розмірі <b>${order.prepayment_amount} грн</b> за замовлення <b>#${order.order_number}</b>.</p>
          <p>Статус вашого замовлення змінено на <b>"В оренді"</b>. Очікуйте на дзвінок менеджера для узгодження часу доставки (якщо вона була замовлена).</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0;">
          <p style="font-size: 12px; color: #64748b;">Gold Bud Trans — ваша спецтехніка завжди вчасно.</p>
        </div>
      `
    );

    
    const telegramMessage = `
<b>💰 ОТРИМАНО ЗАВДАТОК!</b>
<b>Замовлення:</b> #${order.order_number}
<b>Клієнт:</b> ${order.customer_name}
<b>Сума завдатку:</b> ${order.prepayment_amount} грн
<b>Загальна сума:</b> ${order.total_amount} грн
<b>Статус:</b> В ОРЕНДІ 🚜
    `;
    sendTelegramMessage(telegramMessage);

    res.json({ message: 'Завдаток внесено, замовлення переведено в статус оренди' });
  } catch (error) {
    console.error("❌ Pay Deposit Error:", error);
    res.status(500).json({ error: 'Помилка оплати завдатку' });
  }
});


router.patch("/admin/:orderId/confirm", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.username !== 'admin') {
      return res.status(403).json({ error: 'Доступ заборонено' });
    }

    await db.query("UPDATE orders SET status = 'prepaid' WHERE id = ?", [req.params.orderId]);
    res.json({ message: 'Оплату підтверджено, замовлення активовано' });
  } catch (error) {
    console.error("❌ Confirm Order Error:", error);
    res.status(500).json({ error: 'Помилка підтвердження оплати' });
  }
});


router.get("/admin/all", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.username !== 'admin') {
      return res.status(403).json({ error: 'Доступ заборонено' });
    }

    const [orders] = await db.query(`
      SELECT o.*, u.username as owner_username 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC
    `);

    for (let order of orders) {
      const [items] = await db.query(`SELECT * FROM order_items WHERE order_id = ?`, [order.id]);
      const [docs] = await db.query(`SELECT * FROM order_documents WHERE order_id = ?`, [order.id]);
      order.items = items;
      order.documents = docs;
    }

    res.json(orders);
  } catch (error) {
    console.error("❌ Admin Orders Error:", error);
    res.status(500).json({ error: 'Помилка завантаження замовлень' });
  }
});


router.patch("/admin/document/:docId/status", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.username !== 'admin') {
      return res.status(403).json({ error: 'Доступ заборонено' });
    }

    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'Неправильний статус' });
    }

    await db.query('UPDATE order_documents SET status = ? WHERE id = ?', [status, req.params.docId]);
    res.json({ message: 'Статус документа оновлено' });
  } catch (error) {
    console.error("❌ Doc Status Error:", error);
    res.status(500).json({ error: 'Помилка оновлення статусу' });
  }
});


router.patch("/admin/:id/confirm", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin' && req.user.username !== 'admin') {
      return res.status(403).json({ error: 'Доступ заборонено' });
    }

    await db.query('UPDATE orders SET status = "confirmed" WHERE id = ?', [req.params.id]);
    res.json({ message: 'Замовлення підтверджено' });
  } catch (error) {
    console.error("❌ Admin Confirm Error:", error);
    res.status(500).json({ error: 'Помилка підтвердження' });
  }
});


router.patch("/admin/:id/cancel", authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  try {
    if (req.user.role !== 'admin' && req.user.username !== 'admin') {
      return res.status(403).json({ error: 'Доступ заборонено' });
    }

    await connection.beginTransaction();
    await connection.execute('UPDATE orders SET status = "cancelled" WHERE id = ?', [req.params.id]);
    await connection.execute(`
      UPDATE cards SET is_available = 1 
      WHERE id IN (SELECT card_id FROM order_items WHERE order_id = ?)
    `, [req.params.id]);
    
    await connection.commit();
    res.json({ message: 'Замовлення скасовано адміном' });
  } catch (error) {
    await connection.rollback();
    console.error("❌ Admin Cancel Error:", error);
    res.status(500).json({ error: 'Помилка скасування' });
  } finally {
    connection.release();
  }
});


router.get("/", authenticateToken, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );
    for (let order of orders) {
      const [items] = await db.query(`SELECT * FROM order_items WHERE order_id = ?`, [order.id]);
      order.items = items;
    }
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Помилка завантаження замовлень' });
  }
});


router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (orders.length === 0) return res.status(404).json({ error: 'Замовлення не знайдено' });
    const order = orders[0];
    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    order.items = items;
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Помилка завантаження замовлення' });
  }
});


router.patch("/:id/cancel", authenticateToken, async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [orders] = await connection.execute('SELECT * FROM orders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (orders.length === 0) { await connection.rollback(); return res.status(404).json({ error: 'Замовлення не знайдено' }); }
    
    await connection.execute('UPDATE orders SET status = "cancelled" WHERE id = ?', [req.params.id]);
    await connection.execute(`UPDATE cards SET is_available = 1 WHERE id IN (SELECT card_id FROM order_items WHERE order_id = ?)`, [req.params.id]);
    
    await connection.commit();
    res.json({ message: 'Замовлення успішно скасовано' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: 'Помилка скасування замовлення' });
  } finally {
    connection.release();
  }
});

module.exports = router;
