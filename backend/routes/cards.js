  const express = require("express");
  const multer = require("multer");
  const db = require("../db");
  const path = require("path");

  const router = express.Router();

  
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });

  const upload = multer({ storage });

  
  router.get("/", async (req, res) => {
    try {
      const [cards] = await db.query(`
        SELECT c.*, 
          (SELECT COUNT(*) FROM reviews r WHERE r.card_id = c.id) as reviews_count,
          (SELECT AVG(rating) FROM reviews r WHERE r.card_id = c.id AND r.rating IS NOT NULL) as avg_rating
        FROM cards c 
        ORDER BY c.id DESC
      `);
      res.json(cards);
    } catch (err) {
      console.error("Помилка отримання карток:", err);
      res.status(500).json({ error: "Не вдалося завантажити картки" });
    }
  });

  
  router.get("/available", async (req, res) => {
    try {
      
      const [cards] = await db.query(`
        SELECT c.*,
          (SELECT COUNT(*) FROM reviews r WHERE r.card_id = c.id) as reviews_count,
          (SELECT AVG(rating) FROM reviews r WHERE r.card_id = c.id AND r.rating IS NOT NULL) as avg_rating
        FROM cards c
        WHERE c.is_available = 1
        ORDER BY c.id DESC
      `);
      res.json(cards);
    } catch (err) {
      console.error("Помилка отримання доступних карток:", err);
      res.status(500).json({ error: "Не вдалося завантажити доступні картки" });
    }
  });

  
  router.get("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const [cards] = await db.query("SELECT * FROM cards WHERE id = ?", [id]);
      
      if (cards.length === 0) {
        return res.status(404).json({ error: "Картку не знайдено" });
      }
      
      
      const [cartCheck] = await db.query(
        "SELECT user_id FROM user_cart WHERE card_id = ?", 
        [id]
      );
      
      const card = {
        ...cards[0],
        isInCart: cartCheck.length > 0
      };
      
      res.json(card);
    } catch (err) {
      console.error("Помилка отримання картки:", err);
      res.status(500).json({ error: "Не вдалося завантажити картку" });
    }
  });

  
  router.post("/", upload.array("images", 10), async (req, res) => {
    try {
      const { title, category, characteristics, price_per_day, price_buy, sale_type } = req.body;
      const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];
      const imageJson = JSON.stringify(images);

      
      const price = parseFloat(price_per_day) || 500.00;
      const buyPrice = parseFloat(price_buy) || null;
      if (price < 0 || (buyPrice !== null && buyPrice < 0)) {
        return res.status(400).json({ error: "Ціна не може бути від'ємною" });
      }

      const [result] = await db.query(
        "INSERT INTO cards (title, category, characteristics, price_per_day, price_buy, is_available, image, sale_type) VALUES (?, ?, ?, ?, ?, 1, ?, ?)",
        [title, category, characteristics, price, buyPrice, imageJson, sale_type || 'rent']
      );

      res.status(201).json({
        id: result.insertId,
        title,
        category,
        characteristics,
        price_per_day: price,
        price_buy: buyPrice,
        is_available: 1,
        image: images,
        sale_type: sale_type || 'rent'
      });
    } catch (err) {
      console.error("Помилка додавання картки:", err);
      res.status(500).json({ error: "Не вдалося додати картку" });
    }
  });

  
  router.patch("/:id", upload.array("images", 10), async (req, res) => {
    try {
      const { id } = req.params;
      const { title, category, characteristics, price_per_day, price_buy, sale_type } = req.body;
      
      let updateFields = [];
      let updateValues = [];

      if (title) {
        updateFields.push("title = ?");
        updateValues.push(title);
      }
      if (category) {
        updateFields.push("category = ?");
        updateValues.push(category);
      }
      if (characteristics) {
        updateFields.push("characteristics = ?");
        updateValues.push(characteristics);
      }
      if (price_per_day) {
        const price = parseFloat(price_per_day);
        if (price < 0) {
          updateFields.push("price_per_day = ?");
          updateValues.push(price);
        }
      }
      if (price_buy !== undefined) {
        const buyPrice = price_buy === "" ? null : parseFloat(price_buy);
        if (buyPrice !== null && buyPrice >= 0) {
          updateFields.push("price_buy = ?");
          updateValues.push(buyPrice);
        }
      }
      
      if (req.files && req.files.length > 0) {
        const images = req.files.map(f => `/uploads/${f.filename}`);
        updateFields.push("image = ?");
        updateValues.push(JSON.stringify(images));
      }
      
      if (sale_type) {
        updateFields.push("sale_type = ?");
        updateValues.push(sale_type);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ error: "Немає даних для оновлення" });
      }

      updateValues.push(id);

      const [result] = await db.query(
        `UPDATE cards SET ${updateFields.join(", ")} WHERE id = ?`,
        updateValues
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Картку не знайдено" });
      }

      res.json({ message: "Картку успішно оновлено" });
    } catch (err) {
      console.error("Помилка оновлення картки:", err);
      res.status(500).json({ error: "Не вдалося оновити картку" });
    }
  });

  
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      
      const [activeOrders] = await db.query(`
        SELECT COUNT(*) as count
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id
        WHERE oi.card_id = ? 
        AND o.status IN ('pending', 'confirmed', 'in_progress')
      `, [id]);

      if (activeOrders[0].count > 0) {
        return res.status(400).json({ 
          error: "Неможливо видалити картку з активним замовленням" 
        });
      }
      
      
      await db.query("DELETE FROM user_cart WHERE card_id = ?", [id]);
      
      
      const [result] = await db.query("DELETE FROM cards WHERE id = ?", [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Картку не знайдено" });
      }

      res.json({ message: "Картку успішно видалено" });
    } catch (err) {
      console.error("Помилка видалення картки:", err);
      res.status(500).json({ error: "Не вдалося видалити картку" });
    }
  });

  module.exports = router;